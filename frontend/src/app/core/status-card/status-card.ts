import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type StatusTone = 'neutral' | 'info' | 'positive' | 'warning' | 'danger';

@Component({
  selector: 'app-status-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="status-card" [class.tone-info]="tone() === 'info'" [class.tone-positive]="tone() === 'positive'" [class.tone-warning]="tone() === 'warning'" [class.tone-danger]="tone() === 'danger'" role="status" [attr.aria-label]="label() + ': ' + value()">
      <i class="fa-solid {{ icon() }}" aria-hidden="true"></i>
      <div><small>{{ label() }}</small><strong>{{ value() }}</strong></div>
    </div>
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .status-card { --status-color: #a3b1a6; display: flex; align-items: center; gap: 10px; min-height: 40px; padding: 8px 12px; border-left: 2px solid var(--status-color); background: #1b2a24; }
    .tone-info { --status-color: #80c9bc; }
    .tone-positive { --status-color: #9acb87; }
    .tone-warning { --status-color: #e2bb66; }
    .tone-danger { --status-color: #e09886; }
    .status-card > i { flex: 0 0 auto; color: var(--status-color); font-size: 18px; }
    small { display: block; color: #a3b1a6; font: 9px 'IBM Plex Mono', monospace; }
    strong { display: block; color: #edf0e6; font-size: 12px; font-weight: 500; overflow-wrap: anywhere; }
  `,
})
export class StatusCard {
  readonly icon = input.required<string>();
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly tone = input<StatusTone>('neutral');
}