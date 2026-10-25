import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { GoodsTrend as GoodsTrendValue } from '../models/colony.model';

const TREND_PRESENTATION = {
  HighDepletion: { direction: 'down', levels: [1, 2, 3], label: 'Queda alta' },
  MediumDepletion: { direction: 'down', levels: [1, 2], label: 'Queda moderada' },
  LowDepletion: { direction: 'down', levels: [1], label: 'Queda leve' },
  Stable: { direction: 'stable', levels: [], label: 'Estavel' },
  LowGrowth: { direction: 'up', levels: [1], label: 'Crescimento leve' },
  MediumGrowth: { direction: 'up', levels: [1, 2], label: 'Crescimento moderado' },
  HighGrowth: { direction: 'up', levels: [1, 2, 3], label: 'Crescimento alto' },
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
  readonly trend = input<GoodsTrendValue>();
  readonly presentation = computed(() => {
    const trend = this.trend();
    if (!trend || !Object.hasOwn(TREND_PRESENTATION, trend.type)) return null;
    const presentation = TREND_PRESENTATION[trend.type];
    const days = presentation.direction === 'down' && Number.isFinite(trend.daysLeft) && trend.daysLeft >= 0
      ? ` - Estoque estimado para ${trend.daysLeft.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} dias`
      : '';
    return { ...presentation, description: presentation.label + days };
  });
}