import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { ColonyGood } from '../../../../core/models/colony.model';

@Component({
  selector: 'app-good-card',
  standalone: true,
  imports: [DecimalPipe],
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
