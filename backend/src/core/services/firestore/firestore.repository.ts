import type {
  CollectionReference, DocumentData, Firestore, FirestoreDataConverter,
  PartialWithFieldValue, Query, UpdateData, WithFieldValue,
} from 'firebase-admin/firestore';
import type { StoredDocument } from '../../models/stored-document.js';

export type QueryBuilder<T extends DocumentData> = (collection: CollectionReference<T>) => Query<T>;

export abstract class FirestoreRepository<T extends DocumentData> {
  abstract readonly collectionPath: string;

  protected readonly converter: FirestoreDataConverter<T> = {
    toFirestore: (value) => value,
    fromFirestore: (snapshot) => snapshot.data() as T,
  };

  constructor(private readonly firestore: Firestore) {}

  private get reference(): CollectionReference<T> {
    const segments = this.collectionPath.split('/');
    if (segments.length % 2 === 0 || segments.some((segment) => !segment.trim())) {
      throw new Error('Caminho de colecao invalido.');
    }
    return this.firestore.collection(this.collectionPath).withConverter(this.converter);
  }

  private document(id: string) {
    if (!id.trim() || id.includes('/')) throw new Error('ID de documento invalido.');
    return this.reference.doc(id);
  }

  async read(id: string): Promise<StoredDocument<T> | null> {
    const snapshot = await this.document(id).get();
    const data = snapshot.data();
    return data === undefined ? null : { id: snapshot.id, data };
  }

  async list(buildQuery?: QueryBuilder<T>): Promise<StoredDocument<T>[]> {
    const reference = this.reference;
    const snapshot = await (buildQuery ? buildQuery(reference) : reference).get();
    return snapshot.docs.map((document) => ({ id: document.id, data: document.data() }));
  }

  async create(data: WithFieldValue<T>): Promise<string> {
    return (await this.reference.add(data)).id;
  }

  write(id: string, data: PartialWithFieldValue<T>, options: { merge: true }): Promise<void>;
  write(id: string, data: WithFieldValue<T>, options?: { merge?: false }): Promise<void>;
  async write(
    id: string,
    data: PartialWithFieldValue<T>,
    options: { merge?: boolean } = {},
  ): Promise<void> {
    const document = this.document(id);
    if (options.merge) {
      await document.set(data, { merge: true });
    } else {
      await document.set(data as WithFieldValue<T>);
    }
  }

  async update(id: string, data: UpdateData<T>): Promise<void> {
    await this.document(id).update(data);
  }

  async delete(id: string): Promise<void> {
    await this.document(id).delete();
  }

  watchDocument(
    id: string,
    onNext: (document: StoredDocument<T> | null) => void,
    onError: (error: Error) => void,
  ): () => void {
    return this.document(id).onSnapshot((snapshot) => {
      const data = snapshot.data();
      onNext(data === undefined ? null : { id: snapshot.id, data });
    }, onError);
  }

  watchList(
    onNext: (documents: StoredDocument<T>[]) => void,
    onError: (error: Error) => void,
    buildQuery?: QueryBuilder<T>,
  ): () => void {
    const reference = this.reference;
    return (buildQuery ? buildQuery(reference) : reference).onSnapshot((snapshot) => {
      onNext(snapshot.docs.map((document) => ({ id: document.id, data: document.data() })));
    }, onError);
  }
}