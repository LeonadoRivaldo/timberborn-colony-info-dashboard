import { DatePipe, DecimalPipe } from '@angular/common';
import { afterNextRender, ChangeDetectionStrategy, Component, ElementRef, inject, output, viewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import type { EventLog as RequestEvent } from '../../../../core/models/event-log.model';
import type { StoredDocument } from '../../../../core/services/firestore/firestore.repository';
import { ErrorMessageService } from '../../../../core/i18n/error-message.service';
import { ColoniesService } from '../../../../core/services/colonies/colonies.service';
import { EventsService } from '../../../../core/services/events/events.service';
import { LanguageService } from '../../../../core/i18n/language.service';

@Component({
  selector: 'app-event-log',
  imports: [DatePipe, DecimalPipe, TranslatePipe],
  templateUrl: './event-log.html',
  styleUrl: './event-log.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EventLog {
  readonly languages = inject(LanguageService);
  readonly closed = output<void>();
  readonly colonies = inject(ColoniesService);
  private readonly errors = inject(ErrorMessageService);
  private readonly events = inject(EventsService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');
  readonly state = toSignal(toObservable(this.colonies.selectedId).pipe(
    switchMap(id => id ? this.events.watchRecent().pipe(
      map(data => ({ data, loading: false, error: '' })),
      startWith({ data: [] as StoredDocument<RequestEvent>[], loading: true, error: '' }),
      catchError((error: unknown) => of({
        data: [] as StoredDocument<RequestEvent>[],
        loading: false,
        error: this.errors.format(error),
      })),
    ) : of({ data: [] as StoredDocument<RequestEvent>[], loading: false, error: '' })),
  ), { initialValue: { data: [] as StoredDocument<RequestEvent>[], loading: true, error: '' } });

  constructor() {
    afterNextRender(() => this.dialog().nativeElement.showModal());
  }
}