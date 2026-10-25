import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import type { ConfiguredIndicator } from '../../../../core/models/indicator-configuration.model';

@Component({
  selector: 'app-indicator-card',
  standalone: true,
  template: `
    <li class="indicator-row">
      <span class="indicator-light" [class.active]="indicator().state" [style.--indicator-color]="indicator().color" aria-hidden="true"></span>
      <span class="indicator-name">{{ indicator().name }}<small>{{ indicator().state ? 'ATIVO' : 'INATIVO' }}</small></span>
      <button type="button" class="remove-button" [attr.aria-label]="'Remover configuracao ' + indicator().name" title="Remover indicator" (click)="remove.emit(indicator().id)"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button>
    </li>
  `,
  styleUrl: './indicator-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicatorCard {
  readonly indicator = input.required<ConfiguredIndicator>();
  readonly remove = output<string>();
}