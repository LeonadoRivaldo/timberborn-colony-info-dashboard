import { Component, input } from '@angular/core';
import { GoodsTrend } from '../goods-trend/goods-trend';
import type { GoodsTrend as GoodsTrendValue } from '../models/colony.model';

@Component({
  selector: 'app-details-card',
  standalone: true,
  imports: [GoodsTrend],
  styleUrl: './details-card.scss',
  templateUrl: './details-card.html',
  host: { class: 'overview-item' },
})
export class DetailsCard {
  readonly label = input.required<string>();
  readonly icon = input.required<string>();
  readonly value = input<string | number | null | undefined>();
  readonly unit = input('');
  readonly details = input<string[]>([]);
  readonly trend = input<GoodsTrendValue>();
  readonly fillBar = input<boolean>(false);
  readonly currentFillBarValue = input<number>(0);
  readonly maxFillBarValue = input<number>(0);

  fill(): number {
    const limit = this.maxFillBarValue();
    const value = this.currentFillBarValue();
    return limit > 0 ? Math.min(100, Math.max(0, (value / limit) * 100)) : 0;
  }
}
