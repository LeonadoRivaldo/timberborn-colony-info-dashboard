import { computed, Injectable, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import type { ColonyDocument } from '../../models/colony.model';
import { FirestoreRepository } from '../firestore/firestore.repository';
import type { StoredDocument } from '../firestore/firestore.repository';

@Injectable({ providedIn: 'root' })
export class ColoniesService extends FirestoreRepository<ColonyDocument> {
  readonly collectionPath = 'colonies';
  private readonly selection = signal('');
  readonly state = toSignal(this.watchList().pipe(
    map((data) => ({ data, loading: false, error: '' })),
    catchError((error: unknown) => of({
      data: [] as StoredDocument<ColonyDocument>[],
      loading: false,
      error: error instanceof Error ? error.message : String(error),
    })),
  ), { initialValue: { data: [] as StoredDocument<ColonyDocument>[], loading: true, error: '' } });
  readonly selectedId = computed(() => {
    const colonies = this.state().data;
    return colonies.find((colony) => colony.id === this.selection())?.id ?? colonies[0]?.id ?? '';
  });

  select(id: string): void {
    this.selection.set(id);
  }

  requireSelectedId(): string {
    const id = this.selectedId();
    if (!id) throw new Error('Selecione uma colonia.');
    return id;
  }
}