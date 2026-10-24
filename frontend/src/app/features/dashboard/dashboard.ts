import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import type { Observable } from 'rxjs';
import { AdaptersService } from '../../core/services/adapters/adapters.service';
import { LeversService } from '../../core/services/levers/levers.service';
import { ColoniesService } from '../../core/services/colonies/colonies.service';
import type { StoredDocument } from '../../core/services/firestore/firestore.repository';
import type { DocumentData } from 'firebase/firestore';
import type { ColonyGood } from '../../core/models/colony.model';
import { EDIBLE_FOOD_IDS } from '../../core/models/food-catalog';
import { SummaryCard } from './components/summary-card/summary-card';
import { GoodCard } from './components/good-card/good-card';
import { SeasonCard } from './components/season-card/season-card';

type GoodsCategory = 'all' | 'water' | 'food' | 'materials' | 'industry';

const MATERIAL_IDS = new Set([
  'Log',
  'Plank',
  'Gear',
  'PineResin',
  'TreatedPlank',
  'ScrapMetal',
  'MetalPart',
  'MetalBlock',
  'Dirt',
  'Paper',
  'Book',
]);

const GOOD_ICONS: Record<string, string> = {
  Water: 'fa-droplet',
  Badwater: 'fa-biohazard',
  Log: 'fa-tree',
  Plank: 'fa-layer-group',
  Gear: 'fa-gears',
  PineResin: 'fa-seedling',
  TreatedPlank: 'fa-layer-group',
  ScrapMetal: 'fa-recycle',
  MetalPart: 'fa-cubes-stacked',
  MetalBlock: 'fa-cubes',
  Explosives: 'fa-burst',
  Fireworks: 'fa-wand-sparkles',
  Extract: 'fa-flask',
  BotChassis: 'fa-robot',
  BotLimb: 'fa-wrench',
  BotHead: 'fa-robot',
  Grease: 'fa-oil-can',
  Coffee: 'fa-mug-hot',
  CoffeeBean: 'fa-mug-hot',
  Dirt: 'fa-mountain-sun',
  Berries: 'fa-leaf',
  Cassava: 'fa-seedling',
  Soybean: 'fa-seedling',
  CanolaSeeds: 'fa-seedling',
  CanolaOil: 'fa-bottle-droplet',
  Corn: 'fa-wheat-awn',
  Eggplant: 'fa-leaf',
  Mushroom: 'fa-leaf',
  Algae: 'fa-water',
  Kohlrabi: 'fa-carrot',
  MangroveFruit: 'fa-apple-whole',
};

function observeList(
  selection: Observable<string>,
  read: () => Observable<StoredDocument<DocumentData>[]>,
) {
  return toSignal(
    selection.pipe(
      switchMap((id) =>
        id
          ? read().pipe(
              map((data) => ({ data, loading: false, error: '' })),
              startWith({ data: null, loading: true, error: '' }),
              catchError((error: unknown) =>
                of({
                  data: null,
                  loading: false,
                  error: error instanceof Error ? error.message : String(error),
                }),
              ),
            )
          : of({ data: null, loading: false, error: '' }),
      ),
    ),
    { initialValue: { data: null, loading: true, error: '' } },
  );
}

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, DecimalPipe, SummaryCard, GoodCard, SeasonCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  readonly colonies: ColoniesService = inject(ColoniesService);
  private readonly selection = toObservable(this.colonies.selectedId);
  private readonly adaptersService = inject(AdaptersService);
  private readonly leversService = inject(LeversService);
  readonly adapters = observeList(this.selection, () => this.adaptersService.watchList());
  readonly levers = observeList(this.selection, () => this.leversService.watchList());
  readonly saving = signal<ReadonlySet<string>>(new Set());
  readonly writeError = signal('');
  readonly search = signal('');
  readonly category = signal<GoodsCategory>('all');
  readonly goodsSort = signal('default');
  readonly hideEmpty = signal(false);
  readonly leverSearch = signal('');
  readonly categories: { id: GoodsCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'Todos', icon: 'fa-boxes-stacked' },
    { id: 'water', label: 'Agua', icon: 'fa-droplet' },
    { id: 'food', label: 'Alimentos', icon: 'fa-wheat-awn' },
    { id: 'materials', label: 'Materiais', icon: 'fa-cubes-stacked' },
    { id: 'industry', label: 'Industria', icon: 'fa-gears' },
  ];
  readonly colony = computed(
    () => this.colonies.state().data.find((item) => item.id === this.colonies.selectedId())?.data,
  );
  readonly goods = computed(() => this.colony()?.resources?.goods ?? []);
  readonly food = computed(() => {
    const goods = this.goods().filter((good) => this.goodCategory(good) === 'food');
    return {
      stock: goods.reduce((total, good) => total + good.stock, 0),
      availableTypes: goods.filter((good) => good.stock > 0).length,
      totalTypes: goods.length,
    };
  });
  readonly visibleGoods = computed(() => {
    const term = this.search().trim().toLocaleLowerCase();
    const goods = this.goods().filter(
      (good) =>
        (!term || `${good.name} ${good.id}`.toLocaleLowerCase().includes(term)) &&
        (this.category() === 'all' || this.goodCategory(good) === this.category()) &&
        (!this.hideEmpty() || good.stock > 0),
    );
    if (this.goodsSort() === 'stock') goods.sort((first, second) => second.stock - first.stock);
    if (this.goodsSort() === 'name')
      goods.sort((first, second) => first.name.localeCompare(second.name));
    if (this.goodsSort() === 'fill')
      goods.sort((first, second) => this.fill(first) - this.fill(second));
    return goods;
  });
  readonly visibleLevers = computed(() =>
    (this.levers().data ?? []).filter((lever) =>
      String(lever.data['name'] ?? lever.id)
        .toLocaleLowerCase()
        .includes(this.leverSearch().trim().toLocaleLowerCase()),
    ),
  );
  readonly activeLevers = computed(
    () => (this.levers().data ?? []).filter((lever) => lever.data['state'] === true).length,
  );
  readonly power = computed(() => {
    const networks = this.colony()?.powerGrid?.networks ?? [];
    return {
      supply: networks.reduce((total, network) => total + network.powerSupply, 0),
      demand: networks.reduce((total, network) => total + network.powerDemand, 0),
      networks: networks.length,
      strained: networks.filter((network) => network.powerSupply < network.powerDemand).length,
    };
  });
  readonly water = computed(() => this.goods().find((good) => good.id === 'Water'));
  readonly seasons = computed(() =>
    [
      {
        id: 'wet',
        label: 'Estacao chuvosa',
        short: 'Chuva',
        icon: 'fa-cloud-rain',
        matches: [
          'WET',
          'TEMPERATE',
          'WETSEASON',
          'WETSEASONS',
          'TEMPERATESEASON',
          'WETSEASONACTIVE',
          'ISWETSEASON',
        ],
      },
      {
        id: 'drought',
        label: 'Seca',
        short: 'Seca',
        icon: 'fa-sun',
        matches: ['DROUGHT', 'DRY', 'DRYSEASON', 'DROUGHTSEASON', 'DROUGHTACTIVE', 'ISDROUGHT'],
      },
      {
        id: 'badwater',
        label: 'Mare toxica',
        short: 'Badwater',
        icon: 'fa-biohazard',
        matches: ['BADWATER', 'BADTIDE', 'BADWATERSEASON', 'BADTIDEACTIVE', 'ISBADTIDE'],
      },
    ].map((season) => {
      const sensors = (this.adapters().data ?? []).filter((adapter) => {
        const name = String(adapter.data['name'] ?? adapter.id)
          .toUpperCase()
          .replace(/[_\s-]*(ADAPTER|ADPTER|INDICATOR)$/g, '')
          .replace(/[^A-Z0-9]/g, '');
        return season.matches.includes(name);
      });
      return {
        ...season,
        known: sensors.length > 0,
        active: sensors.some((sensor) => sensor.data['state'] === true),
        names: sensors.map((sensor) => sensor.data['name'] ?? sensor.id).join(', '),
      };
    }),
  );

  readonly activeSeason = computed(() => this.seasons().find((season) => season.active));

  goodCategory(good: ColonyGood): GoodsCategory {
    if (good.id === 'Water' || good.id === 'Badwater') return 'water';
    if (EDIBLE_FOOD_IDS.has(good.id)) return 'food';
    return MATERIAL_IDS.has(good.id) ? 'materials' : 'industry';
  }

  goodIcon(good: ColonyGood): string {
    return GOOD_ICONS[good.id] ?? (this.goodCategory(good) === 'food' ? 'fa-bowl-food' : 'fa-cube');
  }

  fill(good: ColonyGood): number {
    return good.capacity > 0 ? Math.min(100, Math.max(0, (good.stock / good.capacity) * 100)) : 0;
  }

  displayName(name: string): string {
    return name.replace(/_/g, ' ').toLocaleLowerCase();
  }

  async toggleLever(id: string, state: boolean): Promise<void> {
    if (!this.colonies.selectedId() || this.saving().has(id)) return;
    this.saving.update((ids) => new Set([...ids, id]));
    this.writeError.set('');
    try {
      await this.leversService.update(id, { state: !state });
    } catch (error: unknown) {
      this.writeError.set(error instanceof Error ? error.message : String(error));
    } finally {
      this.saving.update((ids) => new Set([...ids].filter((savedId) => savedId !== id)));
    }
  }
}
