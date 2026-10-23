import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface SeasonIndicator {
  id: string;
  label: string;
  icon: string;
  names: string;
}

@Component({
  selector: 'app-season-card',
  standalone: true,
  templateUrl: './season-card.html',
  styleUrl: './season-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonCard {
  readonly season = input<SeasonIndicator>();
  readonly loading = input(false);
}
