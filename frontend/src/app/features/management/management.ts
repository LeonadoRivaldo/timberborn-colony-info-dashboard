import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';
import type { StoredDocument } from '../../core/services/firestore/firestore.repository';
import { AdaptersService } from '../../core/services/adapters/adapters.service';
import { ColoniesService } from '../../core/services/colonies/colonies.service';
import { IndicatorConfigurationsService } from '../../core/services/indicators/indicator-configurations.service';
import { LeversService } from '../../core/services/levers/levers.service';

type CollectionKind = 'indicators' | 'levers' | 'adapters';

function observeItems<T extends { name?: unknown }>(selection: Observable<string>, read: () => Observable<StoredDocument<T>[]>) {
  const empty = { items: [] as { id: string; name: string }[], loading: false, error: '' };
  return toSignal(selection.pipe(switchMap(id => id ? read().pipe(
    map(documents => ({
      items: documents.map(({ id, data }) => ({
        id,
        name: String(data.name ?? id).replace(/_/g, ' ').toLocaleLowerCase(),
      })).sort((first, second) => first.name.localeCompare(second.name)),
      loading: false,
      error: '',
    })),
    startWith({ ...empty, loading: true }),
    catchError((error: unknown) => of({ ...empty, error: error instanceof Error ? error.message : String(error) })),
  ) : of(empty))), { initialValue: { ...empty, loading: true } });
}

@Component({
  selector: 'app-management',
  imports: [RouterLink],
  templateUrl: './management.html',
  styleUrl: './management.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Management {
  readonly colonies = inject(ColoniesService);
  private readonly adapters = inject(AdaptersService);
  private readonly indicators = inject(IndicatorConfigurationsService);
  private readonly levers = inject(LeversService);
  private readonly selection = toObservable(this.colonies.selectedId);
  readonly sections = [
    { kind: 'indicators' as const, title: 'Indicators', state: observeItems(this.selection, () => this.indicators.watchList()) },
    { kind: 'levers' as const, title: 'Levers', state: observeItems(this.selection, () => this.levers.watchList()) },
    { kind: 'adapters' as const, title: 'Adapters', state: observeItems(this.selection, () => this.adapters.watchList()) },
  ];
  readonly deleting = signal<ReadonlySet<string>>(new Set());
  readonly deleteError = signal('');

  selectColony(id: string): void {
    this.colonies.select(id);
    this.deleteError.set('');
  }

  async remove(kind: CollectionKind, id: string, name: string): Promise<void> {
    const colonyId = this.colonies.selectedId();
    const key = `${colonyId}/${kind}/${id}`;
    if (!colonyId || this.deleting().has(key)) return;
    if (!confirm(`Excluir "${name}" de ${kind} desta colonia? O documento sera apagado do Firestore. O jogo pode recria-lo ao enviar outra atualizacao.`)) return;
    this.deleting.update(current => new Set([...current, key]));
    this.deleteError.set('');
    try {
      const service = kind === 'indicators' ? this.indicators : kind === 'levers' ? this.levers : this.adapters;
      await service.delete(id);
    } catch (error: unknown) {
      if (this.colonies.selectedId() === colonyId) {
        this.deleteError.set(error instanceof Error ? error.message : String(error));
      }
    } finally {
      this.deleting.update(current => new Set([...current].filter(item => item !== key)));
    }
  }
}