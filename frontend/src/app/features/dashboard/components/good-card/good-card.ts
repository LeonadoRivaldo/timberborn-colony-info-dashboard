import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ColonyGood } from '../../../../core/models/colony.model';
import { GoodIcon } from '../../../../core/good-icon/good-icon';
import { GoodsTrend } from '../../../../core/goods-trend/goods-trend';

@Component({
  selector: 'app-good-card',
  standalone: true,
  imports: [DecimalPipe, GoodsTrend, GoodIcon],
  templateUrl: './good-card.html',
  styleUrl: './good-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoodCard {
  readonly good = input.required<ColonyGood>();
  readonly category = input.required<string>();
  readonly icon = input.required<string>();
  readonly fill = input.required<number>();
}
