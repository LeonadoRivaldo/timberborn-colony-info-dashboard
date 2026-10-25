import type { AutomationAdapter } from "../../models/adapter.model.js";
import { FirestoreRepository } from "../firestore/firestore.repository.js";
import type { Firestore } from 'firebase-admin/firestore';


export class AdptersIndicatorsService extends FirestoreRepository<AutomationAdapter>{
  constructor(firestore: Firestore, private readonly colonyId: () => string) {
    super(firestore);
  }

  get collectionPath():string {
    return `colonies/${this.colonyId()}/indicators`;
  }
}