import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { ColonyDocument, ColonyGood } from '../../../../core/models/colony.model';
import { EDIBLE_FOOD_IDS } from '../../../../core/models/food-catalog';
import { DetailsCard } from '../../../../core/details-card/details-card';

@Component({
  selector: 'app-summary-panel',
  standalone: true,
  imports: [DecimalPipe, DetailsCard],
  templateUrl: './summary-panel.html',
  styleUrl: './summary-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryPanel {
  readonly colony = input<ColonyDocument>();
  private readonly goods = computed(() => this.colony()?.resources?.goods ?? []);
  readonly food = computed(() => {
    const foods = this.goods().filter((good) => EDIBLE_FOOD_IDS.has(good.id));
    return {
      stock: foods.reduce((sum, good) => sum + good.stock, 0),
      availableTypes: foods.filter((good) => good.stock > 0).length,
      totalTypes: foods.length,
    };
  });
  readonly water = computed(() => this.goods().find((good) => good.id === 'Water'));
  readonly power = computed(() => {
    const networks = this.colony()?.powerGrid?.networks ?? [];
    return {
      supply: networks.reduce((sum, network) => sum + network.powerSupply, 0),
      demand: networks.reduce((sum, network) => sum + network.powerDemand, 0),
      networks: networks.length,
      strained: networks.filter((network) => network.powerSupply < network.powerDemand).length,
    };
  });

  fill(good: ColonyGood): number {
    return good.capacity > 0 ? Math.min(100, Math.max(0, (good.stock / good.capacity) * 100)) : 0;
  }
}