import { InjectionToken, Injectable, signal } from '@angular/core';
import { FirebaseOptions, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

export interface FirebaseClient {
  auth: Auth;
  firestore: Firestore;
}

export const FIREBASE_CLIENT = new InjectionToken<FirebaseClient | null>('Firebase client');

@Injectable({ providedIn: 'root' })
export class FirebaseConfiguration {
  private readonly status = signal<'missing' | 'ready' | 'error'>('missing');
  readonly state = this.status.asReadonly();
  client: FirebaseClient | null = null;

  async initialize(): Promise<void> {
    try {
      const response = await fetch(new URL('firebase-config.json', document.baseURI));
      if (!response.ok) throw new Error('Firebase configuration unavailable');
      const config: FirebaseOptions = await response.json();
      if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) return;
      const app = initializeApp(config);
      const { getFirestore } = await import('firebase/firestore');
      this.client = { auth: getAuth(app), firestore: getFirestore(app) };
      this.status.set('ready');
    } catch {
      this.status.set('error');
    }
  }
}