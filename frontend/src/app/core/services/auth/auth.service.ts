import { computed, DestroyRef, inject, Injectable, signal } from '@angular/core';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { FIREBASE_CLIENT } from '../firebase/firebase-client';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly client = inject(FIREBASE_CLIENT);
  private readonly currentUser = signal<User | null>(null);
  private readonly pending = signal(false);
  private readonly failure = signal<string | null>(null);
  readonly user = this.currentUser.asReadonly();
  readonly busy = this.pending.asReadonly();
  readonly error = this.failure.asReadonly();
  readonly configured = this.client !== null;
  readonly authenticated = computed(() => this.user() !== null);

  constructor() {
    if (this.client) {
      const unsubscribe = onAuthStateChanged(this.client.auth, (user) => this.currentUser.set(user));
      inject(DestroyRef).onDestroy(unsubscribe);
    }
  }

  async ready(): Promise<void> {
    await this.client?.auth.authStateReady();
  }

  async login(email: string, password: string): Promise<boolean> {
    if (!this.client || this.pending()) return false;
    this.pending.set(true);
    this.failure.set(null);
    try {
      const credential = await signInWithEmailAndPassword(this.client.auth, email.trim(), password);
      this.currentUser.set(credential.user);
      return true;
    } catch {
      this.failure.set('Nao foi possivel entrar. Verifique email e senha e tente novamente.');
      return false;
    } finally {
      this.pending.set(false);
    }
  }

  async logout(): Promise<boolean> {
    if (!this.client || this.pending()) return false;
    this.pending.set(true);
    this.failure.set(null);
    try {
      await signOut(this.client.auth);
      this.currentUser.set(null);
      return true;
    } catch {
      this.failure.set('Nao foi possivel sair. Tente novamente.');
      return false;
    } finally {
      this.pending.set(false);
    }
  }
}