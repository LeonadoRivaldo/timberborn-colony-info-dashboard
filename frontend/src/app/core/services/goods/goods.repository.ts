import { inject, Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { FirestoreRepository } from '../firestore/firestore.repository';
import { GoodDocument } from '../../models/good.model';

@Injectable({ providedIn: 'root' })
export class GoodsRepository extends FirestoreRepository<GoodDocument> {
  get collectionPath(): string {
    return `goods`;
  }
}