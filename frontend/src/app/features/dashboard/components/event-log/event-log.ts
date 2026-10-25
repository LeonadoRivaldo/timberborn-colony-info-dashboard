import { DatePipe, DecimalPipe } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, output, viewChild } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import type { EventLog as RequestEvent } from '../../../../core/models/event-log.model';
import type { StoredDocument } from '../../../../core/services/firestore/firestore.repository';
import { ColoniesService } from '../../../../core/services/colonies/colonies.service';
import { EventsService } from '../../../../core/services/events/events.service';

@Component({
  selector: 'app-event-log',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './event-log.html',
  styleUrl: './event-log.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventLog {
  readonly closed = output<void>();
  readonly colonies = inject(ColoniesService);
  private readonly events = inject(EventsService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  readonly state = toSignal(toObservable(this.colonies.selectedId).pipe(
    switchMap(id => id ? this.events.watchRecent().pipe(
      map(data => ({ data, loading: false, error: '' })),
      startWith({ data: [] as StoredDocument<RequestEvent>[], loading: true, error: '' }),
      catchError((error: unknown) => of({
        data: [] as StoredDocument<RequestEvent>[],
        loading: false,
        error: error instanceof Error ? error.message : String(error),
      })),
    ) : of({ data: [] as StoredDocument<RequestEvent>[], loading: false, error: '' })),
  ), { initialValue: { data: [] as StoredDocument<RequestEvent>[], loading: true, error: '' } });

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }
}