import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { FIREBASE_CLIENT } from '../firebase/firebase-client';
import { FirestoreRepository } from './firestore.repository';
import { addDoc, deleteDoc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(() => ({ withConverter: vi.fn().mockReturnValue('goods-reference') })),
  doc: vi.fn((reference, id) => ({ reference, id, withConverter: () => ({ reference, id }) })),
  query: vi.fn((reference) => reference),
  getDoc: vi.fn(), getDocs: vi.fn(), addDoc: vi.fn(), setDoc: vi.fn(),
  updateDoc: vi.fn(), deleteDoc: vi.fn(), onSnapshot: vi.fn(),
}));

interface Good { name: string; stock: number }
class GoodsRepository extends FirestoreRepository<Good> {
  readonly collectionPath = 'users/test/goods';
}

describe('FirestoreRepository', () => {
  let repository: GoodsRepository;
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [
      { provide: FIREBASE_CLIENT, useValue: { firestore: {} } }, GoodsRepository,
    ] });
    repository = TestBed.inject(GoodsRepository);
  });

  it('reads typed data without overwriting a document field with its id', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => true, id: 'log', data: () => ({ name: 'Log', stock: 42 }) } as never);
    expect(await repository.read('log')).toEqual({ id: 'log', data: { name: 'Log', stock: 42 } });
  });

  it('returns null for missing documents', async () => {
    vi.mocked(getDoc).mockResolvedValue({ exists: () => false } as never);
    expect(await repository.read('missing')).toBeNull();
  });

  it('lists typed documents', async () => {
    vi.mocked(getDocs).mockResolvedValue({ docs: [{ id: 'log', data: () => ({ name: 'Log', stock: 12 }) }] } as never);
    expect(await repository.list()).toEqual([{ id: 'log', data: { name: 'Log', stock: 12 } }]);
  });

  it('creates, replaces, updates and deletes documents', async () => {
    vi.mocked(addDoc).mockResolvedValue({ id: 'generated' } as never);
    expect(await repository.create({ name: 'Log', stock: 12 })).toBe('generated');
    await repository.write('log', { name: 'Log', stock: 20 });
    await repository.update('log', { stock: 30 });
    await repository.delete('log');
    expect(setDoc).toHaveBeenCalledWith(expect.objectContaining({ id: 'log' }), { name: 'Log', stock: 20 });
    expect(updateDoc).toHaveBeenCalledWith(expect.objectContaining({ id: 'log' }), { stock: 30 });
    expect(deleteDoc).toHaveBeenCalledWith(expect.objectContaining({ id: 'log' }));
  });

  it('rejects ids that would change the collection path', async () => {
    await expect(repository.read('nested/id')).rejects.toThrow('ID de documento invalido');
  });

  it('propagates SDK errors', async () => {
    vi.mocked(getDoc).mockRejectedValue(new Error('permission-denied'));
    await expect(repository.read('log')).rejects.toThrow('permission-denied');
  });

  it('detaches realtime listeners when unsubscribed', () => {
    const unsubscribe = vi.fn();
    vi.mocked(onSnapshot).mockReturnValue(unsubscribe);
    const subscription = repository.watchList().subscribe();
    subscription.unsubscribe();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('fails explicitly without Firebase configuration', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [{ provide: FIREBASE_CLIENT, useValue: null }, GoodsRepository] });
    await expect(TestBed.inject(GoodsRepository).list()).rejects.toThrow('Firebase nao configurado');
  });
});