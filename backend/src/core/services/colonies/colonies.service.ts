import type { ColonySnapshot } from '../../models/colony.model.js';
import { FirestoreRepository } from '../firestore/firestore.repository.js';

export class ColoniesService extends FirestoreRepository<ColonySnapshot> {
  readonly collectionPath = 'colonies';
  private activeId: string | undefined;

  readonly requireActiveId = (): string => {
    if (!this.activeId) {
      throw Object.assign(new Error('Colonia indisponivel. Aguarde a sincronizacao com o jogo.'), { statusCode: 503 });
    }
    return this.activeId;
  };

  activate(id: string): void {
    this.activeId = id;
  }

  deactivate(): void {
    this.activeId = undefined;
  }
}