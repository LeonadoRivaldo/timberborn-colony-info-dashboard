import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TimberbornDataFacade } from '../../core/services/timberborn/timberborn-data.facade';
import { DashboardShell } from './components/dashboard-shell/dashboard-shell';
import { GoodsPanel } from './components/goods-panel/goods-panel';
import { SummaryPanel } from './components/summary-panel/summary-panel';

@Component({
  selector: 'app-timberborn-dashboard',
  imports: [DashboardShell, SummaryPanel, GoodsPanel],
  templateUrl: './timberborn-dashboard.html',
  styleUrl: './dashboard.scss',
})
export class TimberbornDashboard {
  private readonly data = inject(TimberbornDataFacade);
  readonly colonyState = toSignal(this.data.watchColony(), {
    initialValue: { data: null, loading: true, error: '' },
  });
  readonly adaptersState = toSignal(this.data.watchCollection('adapters'), {
    initialValue: { data: null, loading: true, error: '' },
  });
  readonly indicatorsState = toSignal(this.data.watchCollection('indicators'), {
    initialValue: { data: null, loading: true, error: '' },
  });
  readonly leversState = toSignal(this.data.watchCollection('levers'), {
    initialValue: { data: null, loading: true, error: '' },
  });
  readonly colony = computed(() => this.colonyState().data ?? undefined);
  readonly colonies = computed(() => {
    const colony = this.colony();
    return colony ? [colony] : [];
  });
  readonly savingLevers = signal<ReadonlySet<string>>(new Set());
  readonly leverWriteError = signal('');

  async toggleLever(id: string, currentState: boolean): Promise<void> {
    if (this.savingLevers().has(id)) return;
    this.savingLevers.update((ids) => new Set([...ids, id]));
    this.leverWriteError.set('');
    try {
      await this.data.setLeverState(id, !currentState);
    } catch (error: unknown) {
      this.leverWriteError.set(error instanceof Error ? error.message : String(error));
    } finally {
      this.savingLevers.update((ids) => new Set([...ids].filter((savedId) => savedId !== id)));
    }
  }

}