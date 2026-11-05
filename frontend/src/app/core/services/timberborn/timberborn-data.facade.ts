import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, defer, firstValueFrom, map, Observable, of, repeat, shareReplay, startWith, switchMap } from 'rxjs';
import type { AutomationDocument } from '../../models/automation.model';
import type { ColonyDocument } from '../../models/colony.model';
import type { StoredDocument } from '../../models/stored-document.model';

export type TimberbornCollection = 'adapters' | 'indicators' | 'levers';

export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string;
}

const POLL_INTERVAL_MS = 5000;

@Injectable({ providedIn: 'root' })
export class TimberbornDataFacade {
  private readonly http = inject(HttpClient);
  private readonly adapters = this.poll<AutomationDocument[]>('/api/adapters');
  private readonly levers = this.poll<AutomationDocument[]>('/api/levers');
  private readonly colony = this.poll<ColonyDocument>('/api/colony-info');

  watchColony(): Observable<ApiState<ColonyDocument>> {
    return this.colony;
  }

  watchCollection(collection: TimberbornCollection): Observable<ApiState<StoredDocument<AutomationDocument>[]>> {
    if (collection === 'levers') {
      return this.levers.pipe(map((state) => ({
        ...state,
        data: state.data?.map((item) => ({ id: item.name ?? '', data: item })) ?? null,
      })));
    }

    return this.adapters.pipe(map((state) => ({
      ...state,
      data: state.data?.map((item) => ({ id: item.name ?? '', data: item })) ?? null,
    })));
  }

  async setLeverState(name: string, active: boolean): Promise<void> {
    const action = active ? 'switch-on' : 'switch-off';
    await firstValueFrom(this.http.post(
      `/api/${action}/${encodeURIComponent(name)}`,
      null,
      { responseType: 'text' },
    ));
  }

  private poll<T>(url: string): Observable<ApiState<T>> {
    return defer(() => this.http.get<T>(url)).pipe(
        map((data): ApiState<T> => ({ data, loading: false, error: '' })),
        catchError((error: unknown) => of<ApiState<T>>({
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : String(error),
        })),
      repeat({ delay: POLL_INTERVAL_MS }),
      startWith({ data: null, loading: true, error: '' } as ApiState<T>),
      shareReplay({ bufferSize: 1, refCount: true }),
    );
  }

}