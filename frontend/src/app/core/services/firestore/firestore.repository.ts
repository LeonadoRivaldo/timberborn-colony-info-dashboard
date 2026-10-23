import { inject } from '@angular/core';
import {
  addDoc, collection, CollectionReference, deleteDoc, doc, DocumentData,
  FirestoreDataConverter, getDoc, getDocs, onSnapshot, query, QueryConstraint,
  setDoc, updateDoc, UpdateData, WithFieldValue,
} from 'firebase/firestore';
import { Observable } from 'rxjs';
import { FIREBASE_CLIENT } from '../firebase/firebase-client';

export interface StoredDocument<T> {
  readonly id: string;
  readonly data: T;
}

export abstract class FirestoreRepository<T extends DocumentData> {
  private readonly client = inject(FIREBASE_CLIENT);
  abstract readonly collectionPath: string;

  protected readonly converter: FirestoreDataConverter<T> = {
    toFirestore: (value) => value,
    fromFirestore: (snapshot, options) => snapshot.data(options) as T,
  };

  private get reference(): CollectionReference<T> {
    if (!this.client) throw new Error('Firebase nao configurado.');
    const path = this.collectionPath;
    if (!path || path.split('/').some((segment) => !segment.trim()) || path.split('/').length % 2 === 0) {
      throw new Error('Caminho de colecao invalido.');
    }
    return collection(this.client.firestore, path).withConverter(this.converter);
  }

  private document(id: string) {
    if (!id.trim() || id.includes('/')) throw new Error('ID de documento invalido.');
    return doc(this.reference, id);
  }

  async read(id: string): Promise<StoredDocument<T> | null> {
    const snapshot = await getDoc(this.document(id));
    return snapshot.exists() ? { id: snapshot.id, data: snapshot.data() } : null;
  }

  async list(constraints: QueryConstraint[] = []): Promise<StoredDocument<T>[]> {
    const snapshot = await getDocs(query(this.reference, ...constraints));
    return snapshot.docs.map((item) => ({ id: item.id, data: item.data() }));
  }

  async create(data: WithFieldValue<T>): Promise<string> {
    return (await addDoc(this.reference, data)).id;
  }

  async write(id: string, data: WithFieldValue<T>): Promise<void> {
    await setDoc(this.document(id), data);
  }

  async update(id: string, data: UpdateData<T>): Promise<void> {
    await updateDoc(this.document(id).withConverter(null), data as UpdateData<DocumentData>);
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(this.document(id));
  }

  watchDocument(id: string): Observable<StoredDocument<T> | null> {
    return new Observable((subscriber) => onSnapshot(this.document(id), {
      next: (snapshot) => subscriber.next(snapshot.exists() ? { id: snapshot.id, data: snapshot.data() } : null),
      error: (error) => subscriber.error(error),
    }));
  }

  watchList(constraints: QueryConstraint[] = []): Observable<StoredDocument<T>[]> {
    return new Observable((subscriber) => onSnapshot(query(this.reference, ...constraints), {
      next: (snapshot) => subscriber.next(snapshot.docs.map((item) => ({ id: item.id, data: item.data() }))),
      error: (error) => subscriber.error(error),
    }));
  }
}