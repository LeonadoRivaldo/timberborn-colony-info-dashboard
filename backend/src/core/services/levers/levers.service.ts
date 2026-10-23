import type { Lever } from '../../models/lever.model.js';
import type { StoredDocument } from '../../models/stored-document.js';
import { FirestoreRepository } from '../firestore/firestore.repository.js';
import type { Firestore } from 'firebase-admin/firestore';

type LeverState = Pick<Lever, 'name' | 'state'>;
type LeverSnapshot = Map<string, LeverState>;

export class LeversService extends FirestoreRepository<Lever> {
  constructor(firestore: Firestore, private readonly colonyId: () => string) {
    super(firestore);
  }

  get collectionPath(): string {
    return `colonies/${this.colonyId()}/levers`;
  }

  start(gameApiUrl: string, onError: (error: Error) => void): () => Promise<void> {
    const baseUrl = this.parseBaseUrl(gameApiUrl);
    const cancellation = new AbortController();
    let previousSnapshot: LeverSnapshot | undefined;
    let pendingCommands = Promise.resolve();
    let stopped = false;

    const enqueueCommand = (lever: LeverState): void => {
      pendingCommands = pendingCommands
        .then(async () => {
          if (stopped) return;
          await this.sendCommand(baseUrl, lever, cancellation.signal);
        })
        .catch((error: unknown) => {
          if (stopped) return;
          onError(error instanceof Error ? error : new Error(String(error)));
        });
    };

    const unsubscribe = this.watchList((documents) => {
      const currentSnapshot = this.createSnapshot(documents, onError);

      if (previousSnapshot) {
        for (const [id, lever] of currentSnapshot) {
          if (this.hasChanged(previousSnapshot.get(id), lever)) {
            enqueueCommand(lever);
          }
        }
      }

      previousSnapshot = currentSnapshot;
    }, onError);

    return async () => {
      stopped = true;
      unsubscribe();
      cancellation.abort();
      await pendingCommands;
    };
  }

  private parseBaseUrl(gameApiUrl: string): URL {
    const normalizedUrl = gameApiUrl.endsWith('/') ? gameApiUrl : `${gameApiUrl}/`;
    const baseUrl = new URL(normalizedUrl);

    if (!['http:', 'https:'].includes(baseUrl.protocol)) {
      throw new Error('GAME_API_URL deve usar HTTP ou HTTPS.');
    }

    return baseUrl;
  }

  private createSnapshot(
    documents: StoredDocument<Lever>[],
    onError: (error: Error) => void,
  ): LeverSnapshot {
    const snapshot: LeverSnapshot = new Map();

    for (const { id, data } of documents) {
      if (typeof data.name !== 'string' || !data.name.trim() || typeof data.state !== 'boolean') {
        onError(new Error(`Lever invalida: ${id}`));
        continue;
      }

      snapshot.set(id, { name: data.name, state: data.state });
    }

    return snapshot;
  }

  private hasChanged(previous: LeverState | undefined, current: LeverState): boolean {
    return previous?.name !== current.name || previous.state !== current.state;
  }

  private async sendCommand(baseUrl: URL, lever: LeverState, cancellation: AbortSignal): Promise<void> {
    const command = lever.state ? 'switch-on' : 'switch-off';
    const url = new URL(`${command}/${encodeURIComponent(lever.name)}`, baseUrl);
    const signal = AbortSignal.any([cancellation, AbortSignal.timeout(5000)]);
    const response = await fetch(url, { method: 'GET', signal });

    await response.body?.cancel();

    if (!response.ok) {
      throw new Error(`Game API respondeu HTTP ${response.status} para ${command}/${lever.name}`);
    }
  }
}