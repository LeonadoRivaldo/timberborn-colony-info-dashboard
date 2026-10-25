import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';
import type { DocumentData } from 'firebase/firestore';
import type { ColonyDocument } from '../../core/models/colony.model';
import type { IndicatorConfiguration } from '../../core/models/indicator-configuration.model';
import type { StoredDocument } from '../../core/services/firestore/firestore.repository';
import { AdaptersService } from '../../core/services/adapters/adapters.service';
import { ColoniesService } from '../../core/services/colonies/colonies.service';
import { IndicatorConfigurationsService } from '../../core/services/indicators/indicator-configurations.service';
import { LeversService } from '../../core/services/levers/levers.service';
import { DashboardShell } from './components/dashboard-shell/dashboard-shell';
import { GoodsPanel } from './components/goods-panel/goods-panel';
import { SummaryPanel } from './components/summary-panel/summary-panel';

interface ListState<T> {
  data: T[] | null;
  loading: boolean;
  error: string;
}

function observeCollection<T>(selection: Observable<string>, read: () => Observable<StoredDocument<T>[]>) {
  return toSignal(selection.pipe(
    switchMap((id) => id ? read().pipe(
      map((data): ListState<StoredDocument<T>> => ({ data, loading: false, error: '' })),
      startWith({ data: null, loading: true, error: '' } as ListState<StoredDocument<T>>),
      catchError((error: unknown) => of<ListState<StoredDocument<T>>>({
        data: null,
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      })),
    ) : of<ListState<StoredDocument<T>>>({ data: null, loading: false, error: '' })),
  ), { initialValue: { data: null, loading: true, error: '' } as ListState<StoredDocument<T>> });
}

@Component({
  selector: 'app-dashboard',
  imports: [DashboardShell, SummaryPanel, GoodsPanel],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  readonly colonies: ColoniesService = inject(ColoniesService);
  private readonly selection = toObservable(this.colonies.selectedId);
  private readonly adaptersService = inject(AdaptersService);
  private readonly indicatorsService = inject(IndicatorConfigurationsService);
  private readonly leversService = inject(LeversService);

  readonly colony = computed(() => this.colonies.state().data
    .find((item) => item.id === this.colonies.selectedId())?.data);
  readonly adapters = observeCollection(this.selection, () => this.adaptersService.watchList());
  readonly indicatorConfigurations = observeCollection(this.selection, () => this.indicatorsService.watchList());
  readonly levers = observeCollection(this.selection, () => this.leversService.watchList());
  readonly savingLevers = signal<ReadonlySet<string>>(new Set());
  readonly leverWriteError = signal('');
  readonly indicatorWriteError = signal('');

  async toggleLever(id: string, state: boolean): Promise<void> {
    if (!this.colonies.selectedId() || this.savingLevers().has(id)) return;
    this.savingLevers.update((ids) => new Set([...ids, id]));
    this.leverWriteError.set('');
    try {
      await this.leversService.update(id, { state: !state });
    } catch (error: unknown) {
      this.leverWriteError.set(error instanceof Error ? error.message : String(error));
    } finally {
      this.savingLevers.update((ids) => new Set([...ids].filter((savedId) => savedId !== id)));
    }
  }

  async saveIndicator(configuration: IndicatorConfiguration): Promise<void> {
    if (!configuration.id || !this.colonies.selectedId()) return;
    this.indicatorWriteError.set('');
    try {
      await this.indicatorsService.update(configuration.id, {
        'config.visible': true,
        'config.color': configuration.color,
      });
    } catch (error: unknown) {
      this.indicatorWriteError.set(error instanceof Error ? error.message : String(error));
    }
  }

  async removeIndicator(id: string): Promise<void> {
    if (!this.colonies.selectedId()) return;
    this.indicatorWriteError.set('');
    try {
      await this.indicatorsService.update(id, { 'config.visible': false });
    } catch (error: unknown) {
      this.indicatorWriteError.set(error instanceof Error ? error.message : String(error));
    }
  }

  selectColony(id: string): void {
    this.colonies.select(id);
    this.indicatorWriteError.set('');
    this.leverWriteError.set('');
  }
}