import { inject, Injectable } from '@angular/core';
import { limit, orderBy } from 'firebase/firestore';
import type { EventLog } from '../../models/event-log.model';
import { ColoniesService } from '../colonies/colonies.service';
import { FirestoreRepository } from '../firestore/firestore.repository';

@Injectable({ providedIn: 'root' })
export class EventsService extends FirestoreRepository<EventLog> {
  private readonly colonies = inject(ColoniesService);

  get collectionPath(): string {
    return `colonies/${this.colonies.requireSelectedId()}/events`;
  }

  watchRecent() {
    return this.watchList([orderBy('timestamp', 'desc'), limit(100)]);
  }
}