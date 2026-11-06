import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '../../../../core/i18n/language.service';
import type { ColonyGood } from '../../../../core/models/colony.model';
import { GoodIcon } from '../../../../core/good-icon/good-icon';
import { GoodsTrend } from '../../../../core/goods-trend/goods-trend';

@Component({
  selector: 'app-good-card',
  standalone: true,
  imports: [DecimalPipe, TranslatePipe, GoodsTrend, GoodIcon],
  templateUrl: './good-card.html',
  styleUrl: './good-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoodCard {
  readonly languages = inject(LanguageService);
  readonly good = input.required<ColonyGood>();
  readonly category = input.required<string>();
  readonly icon = input.required<string>();
  readonly fill = input.required<number>();
}
