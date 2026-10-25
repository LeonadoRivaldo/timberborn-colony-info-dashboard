import { inject, Injectable } from '@angular/core';
import type { DocumentData } from 'firebase/firestore';
import { ColoniesService } from '../colonies/colonies.service';
import { FirestoreRepository } from '../firestore/firestore.repository';
import type { IndicatorDocument } from '../../models/indicator-configuration.model';

@Injectable({ providedIn: 'root' })
export class IndicatorConfigurationsService extends FirestoreRepository<IndicatorDocument & DocumentData> {
  private readonly colonies = inject(ColoniesService);

  get collectionPath(): string {
    return `colonies/${this.colonies.requireSelectedId()}/indicators`;
  }
}