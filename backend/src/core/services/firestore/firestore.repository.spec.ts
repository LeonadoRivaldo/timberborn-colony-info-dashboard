import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Firestore } from 'firebase-admin/firestore';
import { FirestoreRepository } from './firestore.repository.js';

interface TestDocument { label: string; quantity: number }

class TestRepository extends FirestoreRepository<TestDocument> {
  readonly collectionPath = 'test-documents';
}

function createFixture() {
  const unsubscribe = vi.fn();
  const document = {
    get: vi.fn(), set: vi.fn(), update: vi.fn(), delete: vi.fn(),
    onSnapshot: vi.fn().mockReturnValue(unsubscribe),
  };
  const collection = {
    doc: vi.fn().mockReturnValue(document), add: vi.fn(), get: vi.fn(),
    onSnapshot: vi.fn().mockReturnValue(unsubscribe),
  };
  const firestore = {
    collection: vi.fn().mockReturnValue({ withConverter: vi.fn().mockReturnValue(collection) }),
  };
  const repository = new TestRepository(firestore as unknown as Firestore);
  return { repository, firestore, collection, document, unsubscribe };
}

describe('FirestoreRepository', () => {
  let fixture: ReturnType<typeof createFixture>;
  beforeEach(() => { fixture = createFixture(); });

  it('reads typed documents with the id separate from the data', async () => {
    fixture.document.get.mockResolvedValue({ id: 'one', data: () => ({ label: 'Example', quantity: 3 }) });
    expect(await fixture.repository.read('one')).toEqual({ id: 'one', data: { label: 'Example', quantity: 3 } });
    expect(fixture.firestore.collection).toHaveBeenCalledWith('test-documents');
  });

  it('returns null for missing documents', async () => {
    fixture.document.get.mockResolvedValue({ data: () => undefined });
    expect(await fixture.repository.read('missing')).toBeNull();
  });

  it('lists typed documents', async () => {
    fixture.collection.get.mockResolvedValue({ docs: [{ id: 'one', data: () => ({ label: 'Example', quantity: 3 }) }] });
    expect(await fixture.repository.list()).toEqual([{ id: 'one', data: { label: 'Example', quantity: 3 } }]);
  });

  it('supports queries built with the Admin SDK', async () => {
    const get = vi.fn().mockResolvedValue({ docs: [] });
    const buildQuery = vi.fn().mockReturnValue({ get });
    expect(await fixture.repository.list(buildQuery)).toEqual([]);
    expect(buildQuery).toHaveBeenCalledWith(fixture.collection);
    expect(get).toHaveBeenCalledOnce();
  });

  it('creates, replaces, updates and deletes documents', async () => {
    fixture.collection.add.mockResolvedValue({ id: 'generated' });
    const data = { label: 'Example', quantity: 3 };
    expect(await fixture.repository.create(data)).toBe('generated');
    await fixture.repository.write('one', data);
    await fixture.repository.update('one', { quantity: 4 });
    await fixture.repository.delete('one');
    expect(fixture.collection.add).toHaveBeenCalledWith(data);
    expect(fixture.document.set).toHaveBeenCalledWith(data);
    expect(fixture.document.update).toHaveBeenCalledWith({ quantity: 4 });
    expect(fixture.document.delete).toHaveBeenCalledOnce();
  });

  it('merges partial data without reading the document first', async () => {
    await fixture.repository.write('one', { quantity: 4 }, { merge: true });
    expect(fixture.document.set).toHaveBeenCalledWith({ quantity: 4 }, { merge: true });
    expect(fixture.document.get).not.toHaveBeenCalled();
  });

  it('replaces the document when merge is explicitly false', async () => {
    const data = { label: 'Example', quantity: 3 };
    await fixture.repository.write('one', data, { merge: false });
    expect(fixture.document.set).toHaveBeenCalledWith(data);
  });

  it('rejects invalid document ids before calling Firestore', async () => {
    for (const id of ['', ' ', 'nested/id']) {
      await expect(fixture.repository.read(id)).rejects.toThrow('ID de documento invalido');
    }
    expect(fixture.firestore.collection).not.toHaveBeenCalled();
  });

  it('rejects document paths used as collection paths', async () => {
    class InvalidRepository extends FirestoreRepository<TestDocument> {
      readonly collectionPath = 'collection/document';
    }
    const repository = new InvalidRepository(fixture.firestore as unknown as Firestore);
    await expect(repository.list()).rejects.toThrow('Caminho de colecao invalido');
  });

  it('propagates Firestore errors', async () => {
    fixture.document.get.mockRejectedValue(new Error('permission-denied'));
    await expect(fixture.repository.read('one')).rejects.toThrow('permission-denied');
  });

  it('delivers document changes and exposes listener cleanup', () => {
    const onNext = vi.fn();
    const onError = vi.fn();
    const unsubscribe = fixture.repository.watchDocument('one', onNext, onError);
    const callback = fixture.document.onSnapshot.mock.calls[0]?.[0];
    callback({ id: 'one', data: () => ({ label: 'Example', quantity: 3 }) });
    expect(onNext).toHaveBeenCalledWith({ id: 'one', data: { label: 'Example', quantity: 3 } });
    expect(fixture.document.onSnapshot).toHaveBeenCalledWith(expect.any(Function), onError);
    unsubscribe();
    expect(fixture.unsubscribe).toHaveBeenCalledOnce();
  });

  it('delivers list changes and exposes listener cleanup', () => {
    const onNext = vi.fn();
    const onError = vi.fn();
    const unsubscribe = fixture.repository.watchList(onNext, onError);
    const callback = fixture.collection.onSnapshot.mock.calls[0]?.[0];
    callback({ docs: [{ id: 'one', data: () => ({ label: 'Example', quantity: 3 }) }] });
    expect(onNext).toHaveBeenCalledWith([{ id: 'one', data: { label: 'Example', quantity: 3 } }]);
    unsubscribe();
    expect(fixture.unsubscribe).toHaveBeenCalledOnce();
  });
});