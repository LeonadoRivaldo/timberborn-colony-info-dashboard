import type { ColonySnapshot } from '../models/colony.model.js';
import type { ColoniesService } from '../services/colonies/colonies.service.js';

interface ColonyPollingOptions {
  url: string;
  colonies: ColoniesService;
  onColonyChanged: (id: string | undefined) => Promise<void>;
  onError: (error: Error) => void;
}

export class ColonyPollingJob {
  private readonly cancellation = new AbortController();
  private timer: ReturnType<typeof setTimeout> | undefined;
  private running: Promise<void> | undefined;
  private activeId: string | undefined;
  private started = false;
  private stopped = false;

  constructor(private readonly options: ColonyPollingOptions) {
    const url = new URL(options.url);
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('COLONY_INFO_API_URL deve usar HTTP ou HTTPS.');
  }

  start(): void {
    if (this.started || this.stopped) return;
    this.started = true;
    this.scheduleNext(0);
  }

  async stop(): Promise<void> {
    this.stopped = true;
    clearTimeout(this.timer);
    this.cancellation.abort();
    await this.running;
    this.options.colonies.deactivate();
    await this.options.onColonyChanged(undefined);
  }

  private scheduleNext(delay: number): void {
    if (this.stopped) return;
    this.timer = setTimeout(() => {
      this.running = this.poll();
      void this.running.finally(() => this.scheduleNext(120_000));
    }, delay);
    this.timer.unref();
  }

  private async poll(): Promise<void> {
    try {
      const response = await fetch(this.options.url, {
        signal: AbortSignal.any([this.cancellation.signal, AbortSignal.timeout(10_000)]),
      });
      if (!response.ok) {
        await response.body?.cancel();
        throw new Error(`Colony API respondeu HTTP ${response.status}`);
      }
      const snapshot = this.parseSnapshot(await response.json());
      if (this.stopped) return;
      const id = snapshot.colonyInfo.settlementId;
      if (id !== this.activeId) {
        this.options.colonies.deactivate();
        await this.options.onColonyChanged(undefined);
        this.activeId = undefined;
      }
      await this.options.colonies.write(id, snapshot);
      if (this.stopped) return;
      this.options.colonies.activate(id);
      if (id !== this.activeId) {
        await this.options.onColonyChanged(id);
        this.activeId = id;
      }
    } catch (error: unknown) {
      this.activeId = undefined;
      this.options.colonies.deactivate();
      try {
        await this.options.onColonyChanged(undefined);
      } catch (cleanupError: unknown) {
        this.options.onError(cleanupError instanceof Error ? cleanupError : new Error(String(cleanupError)));
      }
      if (!this.stopped) this.options.onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private parseSnapshot(value: unknown): ColonySnapshot {
    if (!value || typeof value !== 'object') throw new Error('Resposta da colonia invalida.');
    const snapshot = value as Partial<ColonySnapshot>;
    const id = snapshot.colonyInfo?.settlementId;
    const name = snapshot.colonyInfo?.settlementName;
    if (typeof id !== 'string' || !id.trim() || id.includes('/') ||
        typeof name !== 'string' || !name.trim() || typeof snapshot.timestamp !== 'string') {
      throw new Error('Resposta da colonia sem identificacao ou timestamp validos.');
    }
    return snapshot as ColonySnapshot;
  }
}