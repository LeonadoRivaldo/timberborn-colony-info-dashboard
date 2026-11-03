import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { GoodIcon } from '../../core/good-icon/good-icon';
import { PRODUCTION_CATALOG } from '../../core/models/production-catalog';
import type { Faction } from '../../core/models/production.model';
import { calculateProduction, effectiveCycleHours, recipeOptionsByGood } from './production-calculator';

interface CalculatorRow {
  readonly id: number;
  readonly goodId: string;
  readonly quantity: number;
  readonly hours: number;
  readonly recipeChoices: Readonly<Record<string, string>>;
  readonly expanded: boolean;
}

export function humanize(id: string): string {
  return id.replace(/\./g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2');
}

@Component({
  selector: 'app-production',
  imports: [RouterLink, GoodIcon],
  templateUrl: './production.html',
  styleUrl: './production.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Production {
  readonly gameVersion = PRODUCTION_CATALOG.gameVersion;
  readonly factions: readonly Faction[] = ['Folktails', 'IronTeeth'];
  readonly faction = signal<Faction>('Folktails');
  readonly options = computed(() => recipeOptionsByGood(PRODUCTION_CATALOG, this.faction()));
  readonly goods = computed(() => [...this.options().keys()].sort((left, right) => humanize(left).localeCompare(humanize(right))));
  readonly rows = signal<readonly CalculatorRow[]>([]);
  readonly plans = computed(() => this.rows().map((row) => ({
    row,
    plan: row.goodId
      ? calculateProduction(PRODUCTION_CATALOG, { goodId: row.goodId, quantity: row.quantity, hours: row.hours, faction: this.faction(), recipeChoices: row.recipeChoices })
      : null,
  })));
  readonly humanize = humanize;
  readonly cycleHours = effectiveCycleHours;
  private nextId = 1;

  constructor() {
    this.addRow();
  }

  addRow(): void {
    this.rows.update((rows) => [...rows, { id: this.nextId++, goodId: '', quantity: 1, hours: 24, recipeChoices: {}, expanded: true }]);
  }

  removeRow(id: number): void {
    this.rows.update((rows) => rows.filter((row) => row.id !== id));
  }

  selectFaction(value: string): void {
    if (value !== 'Folktails' && value !== 'IronTeeth') return;
    this.faction.set(value);
    const available = this.options();
    this.rows.update((rows) => rows.map((row) => ({ ...row, goodId: available.has(row.goodId) ? row.goodId : '', recipeChoices: {} })));
  }

  updateGood(id: number, goodId: string): void {
    this.patch(id, { goodId, recipeChoices: {}, expanded: true });
  }

  updateNumber(id: number, field: 'quantity' | 'hours', value: string): void {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return;
    this.patch(id, { [field]: field === 'quantity' ? Math.ceil(parsed) : parsed });
  }

  chooseRecipe(id: number, goodId: string, key: string): void {
    const row = this.rows().find((item) => item.id === id);
    if (row) this.patch(id, { recipeChoices: { ...row.recipeChoices, [goodId]: key } });
  }

  toggle(id: number): void {
    const row = this.rows().find((item) => item.id === id);
    if (row) this.patch(id, { expanded: !row.expanded });
  }

  primaryOption(goodId: string, choices: Readonly<Record<string, string>>) {
    const options = this.options().get(goodId) ?? [];
    return options.find((option) => option.key === choices[goodId]) ?? options[0];
  }

  formatNumber(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }

  private patch(id: number, changes: Partial<CalculatorRow>): void {
    this.rows.update((rows) => rows.map((row) => row.id === id ? { ...row, ...changes } : row));
  }
}
