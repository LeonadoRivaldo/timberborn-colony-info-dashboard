import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import type { ColonyPopulation } from '../models/colony.model';

interface PopulationMetric {
  label: string;
  value: number | string;
  image?: string;
  icon?: string;
}

interface PopulationGroup {
  title: string;
  metrics: PopulationMetric[];
}

@Component({
  selector: 'app-population-info',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button class="info-trigger" type="button" aria-label="Detalhes da população" [attr.aria-expanded]="open()" (click)="toggle($event)">
      <i class="fa-solid fa-circle-info" aria-hidden="true"></i>
    </button>
    @if (open()) {
      <section class="population-popover" [style.top.px]="position().top" [style.left.px]="position().left" aria-label="Detalhes da população" (keydown.escape)="open.set(false)">
        <header><h2>População</h2><button class="close" type="button" aria-label="Fechar detalhes" (click)="open.set(false)"><i class="fa-solid fa-xmark" aria-hidden="true"></i></button></header>
        @for (group of groups(); track group.title) {
          <section class="metric-group"><h3>{{ group.title }}</h3><div class="metric-grid">
            @for (metric of group.metrics; track metric.label) {
              <div class="metric">
                @if (metric.image) { <img [src]="metric.image" alt="" width="20" height="20" /> }
                @else { <i class="fa-solid {{ metric.icon || 'fa-circle' }}" aria-hidden="true"></i> }
                <span>{{ metric.label }}</span><strong>{{ metric.value }}</strong>
              </div>
            }
          </div></section>
        }
      </section>
    }
  `,
  styles: `
    :host { display: block; }
    .info-trigger { display: grid; place-items: center; width: 24px; height: 24px; padding: 0; border: 0; background: transparent; color: #91a69a; cursor: pointer; }
    .info-trigger:hover, .info-trigger[aria-expanded="true"] { color: #d2bc7b; }
    .info-trigger i { font-size: 14px; }
    .population-popover { position: fixed; z-index: 1000; width: min(420px, calc(100vw - 24px)); max-height: min(70vh, 520px); overflow: auto; padding: 14px; border: 1px solid #53684f; border-radius: 4px; background: #13201e; color: #edf0e6; box-shadow: 0 12px 32px rgb(0 0 0 / 48%); }
    header { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding-bottom: 10px; border-bottom: 1px solid #3c4c40; }
    h2 { margin: 0; font-size: 14px; }
    .close { width: 26px; height: 26px; border: 1px solid #3c4c40; border-radius: 3px; background: transparent; color: #a3b1a6; cursor: pointer; }
    .close:hover { color: #edf0e6; background: #26382e; }
    .metric-group { margin-top: 12px; }
    h3 { margin: 0 0 7px; color: #a3b1a6; font: 9px 'IBM Plex Mono', monospace; text-transform: uppercase; }
    .metric-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
    .metric { display: grid; grid-template-columns: 20px minmax(0, 1fr); align-items: center; gap: 3px 7px; min-width: 0; min-height: 48px; padding: 6px 8px; border: 1px solid #314a3a; border-left: 2px solid #7eaa77; border-radius: 3px; background: #1b3025; }
    .metric img { width: 20px; height: 20px; object-fit: contain; grid-row: span 2; }
    .metric i { display: grid; place-items: center; width: 20px; color: #9acb87; font-size: 14px; grid-row: span 2; }
    .metric span { color: #a3b1a6; font-size: 9px; line-height: 1.15; overflow-wrap: anywhere; }
    .metric strong { color: #edf0e6; font: 12px 'IBM Plex Mono', monospace; }
    @media (max-width: 480px) { .metric-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  `,
})
export class PopulationInfo {
  readonly population = input<ColonyPopulation>();
  readonly open = signal(false);
  readonly position = signal({ top: 0, left: 0 });

  readonly groups = computed<PopulationGroup[]>(() => {
    const population = this.population();
    if (!population) return [];
    const groups: PopulationGroup[] = [
      {
        title: 'População',
        metrics: [
          { label: 'Adultos', value: population.adults, image: 'population/ico-adult.png' },
          { label: 'Crianças', value: population.children, image: 'population/ico-child.png' },
          { label: 'Bots', value: population.bots, image: 'population/ico-bot.png' },
          { label: 'Castores', value: population.beavers ?? population.adults + population.children, image: 'population/ico-workers.png' },
          { label: 'Bem-estar médio', value: population.averageWellbeing ?? '--', icon: 'fa-face-smile' },
        ],
      },
    ];
    if (population.beds) groups.push({
      title: 'Moradia',
      metrics: [
        { label: 'Camas ocupadas', value: population.beds.occupied, image: 'population/ico-bed.png' },
        { label: 'Camas livres', value: population.beds.free, image: 'population/ico-bed-empty.png' },
        { label: 'Sem cama', value: population.beds.homeless, image: 'population/ico-no-bed.png' },
      ],
    });
    if (population.beaverWorkplaces) groups.push({
      title: 'Postos de castores',
      metrics: [
        { label: 'Ocupados', value: population.beaverWorkplaces.occupied, image: 'population/ico-work-beaver.png' },
        { label: 'Livres', value: population.beaverWorkplaces.free, image: 'population/ico-work-empty-beaver.png' },
        { label: 'Desempregados', value: population.beaverWorkplaces.unemployed, image: 'population/ico-no-work-beaver.png' },
      ],
    });
    if (population.botWorkplaces) groups.push({
      title: 'Postos de bots',
      metrics: [
        { label: 'Ocupados', value: population.botWorkplaces.occupied, image: 'population/ico-work-bot.png' },
        { label: 'Livres', value: population.botWorkplaces.free, image: 'population/ico-work-empty-bot.png' },
        { label: 'Desempregados', value: population.botWorkplaces.unemployed, image: 'population/ico-no-work-bot.png' },
      ],
    });
    if (population.contamination) groups.push({
      title: 'Contaminação',
      metrics: [
        { label: 'Adultos', value: population.contamination.adults, icon: 'fa-biohazard' },
        { label: 'Crianças', value: population.contamination.children, icon: 'fa-biohazard' },
        { label: 'Total', value: population.contamination.total, icon: 'fa-biohazard' },
      ],
    });
    if (population.beaverWorkforce || population.botWorkforce) {
      const metrics: PopulationMetric[] = [];
      if (population.beaverWorkforce) metrics.push(
        { label: 'Castores aptos', value: population.beaverWorkforce.employable, icon: 'fa-person-circle-check' },
        { label: 'Castores não aptos', value: population.beaverWorkforce.unemployable, icon: 'fa-person-circle-exclamation' },
      );
      if (population.botWorkforce) metrics.push(
        { label: 'Bots aptos', value: population.botWorkforce.employable, icon: 'fa-robot' },
        { label: 'Bots não aptos', value: population.botWorkforce.unemployable, icon: 'fa-robot' },
      );
      groups.push({ title: 'Força de trabalho', metrics });
    }
    return groups;
  });

  toggle(event: MouseEvent): void {
    if (this.open()) {
      this.open.set(false);
      return;
    }
    const trigger = event.currentTarget as HTMLElement;
    const bounds = trigger.getBoundingClientRect();
    const width = Math.min(420, window.innerWidth - 24);
    const estimatedHeight = Math.min(520, window.innerHeight * 0.7);
    this.position.set({
      top: Math.max(12, Math.min(bounds.bottom + 8, window.innerHeight - estimatedHeight - 12)),
      left: Math.max(12, Math.min(bounds.left, window.innerWidth - width - 12)),
    });
    this.open.set(true);
  }
}