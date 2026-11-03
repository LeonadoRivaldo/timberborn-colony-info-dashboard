export interface StoredDocument<T> {
  readonly id: string;
  readonly data: T;
}