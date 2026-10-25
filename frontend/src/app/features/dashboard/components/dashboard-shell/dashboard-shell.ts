import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import type { ColonyDocument } from '../../../../core/models/colony.model';
import type { IndicatorConfiguration, IndicatorDocument } from '../../../../core/models/indicator-configuration.model';
import type { StoredDocument } from '../../../../core/services/firestore/firestore.repository';
import type { DocumentData } from 'firebase/firestore';
import { IndicatorsPanel } from '../indicators-panel/indicators-panel';
import { LeversPanel } from '../levers-panel/levers-panel';
import { SeasonCard } from '../season-card/season-card';
import { EventLog } from '../event-log/event-log';
import { StatusCard } from '../../../../core/status-card/status-card';
import type { StatusTone } from '../../../../core/status-card/status-card';

@Component({
  selector: 'app-dashboard-shell',
  imports: [DatePipe, RouterLink, IndicatorsPanel, LeversPanel, SeasonCard, EventLog, StatusCard],
  templateUrl: './dashboard-shell.html',
  styleUrl: './dashboard-shell.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardShell {
  readonly eventLogOpen = signal(false);
  readonly activeDrawer = signal<'levers' | 'indicators' | null>(null);
  readonly colonies = input.required<ColonyDocument[]>();
  readonly colonyId = input('');
  readonly colony = input<ColonyDocument>();
  readonly wellbeingTone = computed<StatusTone>(() => {
    const wellbeing = this.colony()?.population?.averageWellbeing;
    if (wellbeing === undefined || !Number.isFinite(wellbeing)) return 'neutral';
    if (wellbeing < 0) return 'danger';
    if (wellbeing <= 30) return 'warning';
    return 'positive';
  });
  readonly adapters = input<StoredDocument<DocumentData>[]>([]);
  readonly adaptersLoading = input(false);
  readonly adaptersError = input('');
  readonly indicatorConfigurations = input<StoredDocument<IndicatorDocument>[]>([]);
  readonly indicatorsLoading = input(false);
  readonly indicatorsError = input('');
  readonly indicatorSaveError = input('');
  readonly saveIndicator = output<IndicatorConfiguration>();
  readonly removeIndicator = output<string>();
  readonly levers = input<StoredDocument<DocumentData>[]>([]);
  readonly leversLoading = input(false);
  readonly leversError = input('');
  readonly leverSaving = input<ReadonlySet<string>>(new Set());
  readonly leverWriteError = input('');
  readonly colonyLoading = input(false);
  readonly colonyError = input('');
  readonly toggleLever = output<{ id: string; state: boolean }>();
  readonly selectColony = output<string>();

  toggleDrawer(drawer: 'levers' | 'indicators'): void {
    this.activeDrawer.update((current) => current === drawer ? null : drawer);
  }

  closeDrawer(): void {
    this.activeDrawer.set(null);
  }
}