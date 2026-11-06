import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { FIREBASE_CLIENT } from '../firebase/firebase-client';
import { AuthService } from './auth.service';
import { provideI18n } from '../../i18n/i18n.providers';

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(() => vi.fn()),
  signInWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
}));

describe('AuthService email login', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({ providers: [
      ...provideI18n(),
      { provide: FIREBASE_CLIENT, useValue: { auth: {} } },
    ] });
  });

  it('signs in with email and password and exposes the user', async () => {
    const user = { uid: 'owner' };
    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({ user } as never);
    const service = TestBed.inject(AuthService);
    expect(await service.login(' owner@example.com ', 'test-password')).toBe(true);
    expect(signInWithEmailAndPassword).toHaveBeenCalledWith({}, 'owner@example.com', 'test-password');
    expect(service.user()).toBe(user);
    expect(service.authenticated()).toBe(true);
    expect(service.busy()).toBe(false);
  });

  it('shows a generic error without exposing account existence', async () => {
    vi.mocked(signInWithEmailAndPassword).mockRejectedValue(new Error('invalid-credential'));
    const service = TestBed.inject(AuthService);
    expect(await service.login('owner@example.com', 'wrong-password')).toBe(false);
    expect(service.error()).toContain('Could not sign in');
    expect(service.authenticated()).toBe(false);
    expect(service.busy()).toBe(false);
  });
});