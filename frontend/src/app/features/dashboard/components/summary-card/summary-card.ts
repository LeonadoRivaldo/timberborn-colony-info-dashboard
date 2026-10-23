import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-summary-card',
  standalone: true,
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'overview-item' },
})
export class SummaryCard {
  readonly label = input.required<string>();
  readonly icon = input.required<string>();
  readonly value = input<string | number | null | undefined>();
  readonly unit = input('');
}
