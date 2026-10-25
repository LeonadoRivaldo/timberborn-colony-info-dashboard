import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { DocumentData } from 'firebase/firestore';
import type { StoredDocument } from '../../../../core/services/firestore/firestore.repository';
import { normalizeIndicatorName } from '../../../../core/utils/normalize-indicator-name';
import { StatusCard } from '../../../../core/status-card/status-card';

const SEASONS = [
  { id: 'badwater', label: 'Mare toxica', icon: 'fa-biohazard', names: ['BADWATER', 'BADTIDE', 'BADWATERSEASON', 'BADTIDEACTIVE', 'ISBADTIDE'] },
  { id: 'drought', label: 'Seca', icon: 'fa-sun', names: ['DROUGHT', 'DRY', 'DRYSEASON', 'DROUGHTSEASON', 'DROUGHTACTIVE', 'ISDROUGHT'] },
  { id: 'wet', label: 'Estacao chuvosa', icon: 'fa-cloud-rain', names: ['WET', 'TEMPERATE', 'WETSEASON', 'WETSEASONS', 'TEMPERATESEASON', 'WETSEASONACTIVE', 'ISWETSEASON'] },
];

@Component({
  selector: 'app-season-card',
  imports: [StatusCard],
  templateUrl: './season-card.html',
  styleUrl: './season-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeasonCard {
  readonly adapters = input<StoredDocument<DocumentData>[]>([]);
  readonly loading = input(false);
  readonly season = computed(() => SEASONS.find(season => this.adapters().some(adapter =>
    adapter.data['state'] === true && season.names.includes(normalizeIndicatorName(String(adapter.data['name'] ?? adapter.id))),
  )));
}