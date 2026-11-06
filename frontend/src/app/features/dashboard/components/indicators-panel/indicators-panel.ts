import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import type { AutomationDocument } from '../../../../core/models/automation.model';
import type { ConfiguredIndicator, IndicatorConfiguration } from '../../../../core/models/indicator-configuration.model';
import type { StoredDocument } from '../../../../core/models/stored-document.model';
import { IndicatorCard } from './indicator-card';

@Component({
  selector: 'app-indicators-panel',
  standalone: true,
  imports: [IndicatorCard, TranslatePipe],
  templateUrl: './indicators-panel.html',
  styleUrl: './indicators-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IndicatorsPanel {
  readonly configurations = input<StoredDocument<AutomationDocument>[]>([]);
  readonly configurationsLoading = input(false);
  readonly configurationsError = input('');
  readonly saveError = input('');
  readonly readOnlyMode = input(false);
  readonly saveConfiguration = output<IndicatorConfiguration>();
  readonly removeConfiguration = output<string>();
  readonly showActiveOnly = signal(true);
  readonly isAdding = signal(false);
  readonly selectedId = signal('');
  readonly selectedColor = signal('#80c9bc');

  readonly availableIndicators = computed(() => this.configurations().filter(({ data }) => data.config?.visible !== true));

  readonly indicators = computed<ConfiguredIndicator[]>(() => {
    if (this.readOnlyMode()) {
      return this.configurations().map(({ id, data }) => ({
        id,
        name: this.displayName(data.name ?? id),
        color: /^#[\da-f]{6}$/i.test(data.config?.color ?? '') ? (data.config?.color ?? '#80c9bc') : '#80c9bc',
        state: data.state === true,
      }));
    }

    return this.configurations().flatMap(({ id, data }) => {
      if (data.config?.visible !== true) return [];
      const indicator: ConfiguredIndicator = {
        id,
        name: this.displayName(data.name ?? id),
        color: /^#[\da-f]{6}$/i.test(data.config.color ?? '') ? (data.config.color ?? '#80c9bc') : '#80c9bc',
        state: data.state === true,
      };
      return !this.showActiveOnly() || indicator.state ? [indicator] : [];
    });
  });

  openAddForm(): void {
    this.selectedId.set('');
    this.isAdding.set(true);
  }

  cancelAdd(): void {
    this.isAdding.set(false);
    this.selectedId.set('');
  }

  save(): void {
    const id = this.selectedId();
    const color = this.selectedColor();
    if (!this.availableIndicators().some(indicator => indicator.id === id) || !/^#[\da-f]{6}$/i.test(color)) return;
    this.saveConfiguration.emit({ id, color });
    this.isAdding.set(false);
    this.selectedId.set('');
  }

  displayName(name: string): string {
    return name.replace(/_/g, ' ').toLocaleLowerCase();
  }

  remove(id: string): void {
    this.removeConfiguration.emit(id);
  }
}