import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LanguageService } from '../i18n/language.service';
import type { GoodsTrend as GoodsTrendValue } from '../models/colony.model';

const TREND_PRESENTATION = {
  HighDepletion: { direction: 'down', levels: [1, 2, 3], label: 'trends.highDepletion' },
  MediumDepletion: { direction: 'down', levels: [1, 2], label: 'trends.mediumDepletion' },
  LowDepletion: { direction: 'down', levels: [1], label: 'trends.lowDepletion' },
  Stable: { direction: 'stable', levels: [], label: 'trends.stable' },
  LowGrowth: { direction: 'up', levels: [1], label: 'trends.lowGrowth' },
  MediumGrowth: { direction: 'up', levels: [1, 2], label: 'trends.mediumGrowth' },
  HighGrowth: { direction: 'up', levels: [1, 2, 3], label: 'trends.highGrowth' },
} as const;

@Component({
  selector: 'app-goods-trend',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (presentation(); as current) {
      @if (current.levels.length) {
        <span [class.growth]="current.direction === 'up'" [attr.title]="current.description" [attr.aria-label]="current.description" role="img" tabindex="0">
          @for (level of current.levels; track level) {
            <i class="fa-solid" [class.fa-chevron-up]="current.direction === 'up'" [class.fa-chevron-down]="current.direction === 'down'" aria-hidden="true"></i>
          }
        </span>
      }
    }
  `,
  styles: `
    :host { display: block; width: 18px; height: 28px; }
    span { width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #e58e82; cursor: help; }
    .growth { color: #9acb87; }
    i { font-size: 13px; line-height: 8px; }
  `,
})
export class GoodsTrend {
  private readonly language = inject(LanguageService);
  readonly trend = input<GoodsTrendValue>();
  readonly presentation = computed(() => {
    const trend = this.trend();
    if (!trend || !Object.hasOwn(TREND_PRESENTATION, trend.type)) return null;
    const presentation = TREND_PRESENTATION[trend.type];
    const days = presentation.direction === 'down' && Number.isFinite(trend.daysLeft) && trend.daysLeft >= 0
      ? this.language.text('trends.estimatedStock', { days: this.language.formatNumber(trend.daysLeft, 1) })
      : '';
    return { ...presentation, description: this.language.text(presentation.label) + days };
  });
}