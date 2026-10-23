import { inject, Injectable } from '@angular/core';
import type { DocumentData } from 'firebase/firestore';
import { FirestoreRepository } from '../firestore/firestore.repository';
import { ColoniesService } from '../colonies/colonies.service';

@Injectable({ providedIn: 'root' })
export class AdaptersService extends FirestoreRepository<DocumentData> {
  private readonly colonies = inject(ColoniesService);

  get collectionPath(): string {
    return `colonies/${this.colonies.requireSelectedId()}/adapters`;
  }
}