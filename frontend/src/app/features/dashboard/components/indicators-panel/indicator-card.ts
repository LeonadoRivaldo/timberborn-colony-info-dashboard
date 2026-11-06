import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import type { ConfiguredIndicator } from '../../../../core/models/indicator-configuration.model';

@Component({
  selector: 'app-indicator-card',
  standalone: true,
  imports: [TranslatePipe],
  template: `
    <li class="indicator-row">
      <span class="indicator-light" [class.active]="indicator().state" [style.--indicator-color]="indicator().color" aria-hidden="true"></span>
      <span class="indicator-name">{{ indicator().name }}<small>{{ (indicator().state ? 'common.on' : 'common.off') | translate }}</small></span>
      @if (!readOnlyMode()) { <button type="button" class="remove-button" [attr.aria-label]="'indicators.removeConfig' | translate: { name: indicator().name }" [title]="'indicators.remove' | translate" (click)="remove.emit(indicator().id)"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button> }
    </li>
  `,
  styleUrl: './indicator-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicatorCard {
  readonly indicator = input.required<ConfiguredIndicator>();
  readonly readOnlyMode = input(false);
  readonly remove = output<string>();
}