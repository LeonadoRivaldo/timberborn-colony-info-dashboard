import { Component, input } from '@angular/core';
import { GoodsTrend } from '../goods-trend/goods-trend';
import { GoodIcon } from '../good-icon/good-icon';
import { PopulationInfo } from '../population-info/population-info';
import type { ColonyPopulation } from '../models/colony.model';
import type { GoodsTrend as GoodsTrendValue } from '../models/colony.model';

@Component({
  selector: 'app-details-card',
  standalone: true,
  imports: [GoodsTrend, GoodIcon, PopulationInfo],
  styleUrl: './details-card.scss',
  templateUrl: './details-card.html',
  host: { class: 'overview-item' },
})
export class DetailsCard {
  readonly label = input.required<string>();
  readonly icon = input.required<string>();
  readonly gameIconId = input('');
  readonly gameIconPath = input('');
  readonly value = input<string | number | null | undefined>();
  readonly unit = input('');
  readonly details = input<string[]>([]);
  readonly population = input<ColonyPopulation>();
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
