import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import type { ColonyGood } from '../../../../core/models/colony.model';
import { EDIBLE_FOOD_IDS } from '../../../../core/models/food-catalog';
import { GoodCard } from '../good-card/good-card';

export type GoodsCategory = 'all' | 'water' | 'food' | 'materials' | 'industry';

const MATERIAL_IDS = new Set([
  'Log', 'Plank', 'Gear', 'PineResin', 'TreatedPlank', 'ScrapMetal', 'MetalPart', 'MetalBlock',
  'Dirt', 'Paper', 'Book',
]);

const GOOD_ICONS: Record<string, string> = {
  Water: 'fa-droplet', Badwater: 'fa-biohazard', Log: 'fa-tree', Plank: 'fa-layer-group',
  Gear: 'fa-gears', PineResin: 'fa-seedling', TreatedPlank: 'fa-layer-group', ScrapMetal: 'fa-recycle',
  MetalPart: 'fa-cubes-stacked', MetalBlock: 'fa-cubes', Explosives: 'fa-burst', Fireworks: 'fa-wand-sparkles',
  Extract: 'fa-flask', BotChassis: 'fa-robot', BotLimb: 'fa-wrench', BotHead: 'fa-robot',
  Grease: 'fa-oil-can', Coffee: 'fa-mug-hot', CoffeeBean: 'fa-mug-hot', Dirt: 'fa-mountain-sun',
  Berries: 'fa-leaf', Cassava: 'fa-seedling', Soybean: 'fa-seedling', CanolaSeeds: 'fa-seedling',
  CanolaOil: 'fa-bottle-droplet', Corn: 'fa-wheat-awn', Eggplant: 'fa-leaf', Mushroom: 'fa-leaf',
  Algae: 'fa-water', Kohlrabi: 'fa-carrot', MangroveFruit: 'fa-apple-whole',
};

@Component({
  selector: 'app-goods-panel',
  imports: [GoodCard],
  templateUrl: './goods-panel.html',
  styleUrl: './goods-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoodsPanel {
  readonly goods = input<ColonyGood[]>([]);
  readonly loading = input(false);
  readonly stockAvailable = input(true);
  readonly search = signal('');
  readonly category = signal<GoodsCategory>('all');
  readonly sort = signal<'default' | 'name' | 'stock' | 'fill'>('default');
  readonly hideEmpty = signal(false);
  readonly categories: { id: GoodsCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'Todos', icon: 'fa-boxes-stacked' },
    { id: 'water', label: 'Agua', icon: 'fa-droplet' },
    { id: 'food', label: 'Alimentos', icon: 'fa-wheat-awn' },
    { id: 'materials', label: 'Materiais', icon: 'fa-cubes-stacked' },
    { id: 'industry', label: 'Industria', icon: 'fa-gears' },
  ];

  readonly visibleGoods = computed(() => {
    const term = this.search().trim().toLocaleLowerCase();
    const goods = this.goods().filter((good) =>
      (!term || `${good.name} ${good.id}`.toLocaleLowerCase().includes(term)) &&
      (this.category() === 'all' || this.goodCategory(good) === this.category()) &&
      (!this.hideEmpty() || good.stock > 0),
    );
    if (this.sort() === 'stock') goods.sort((first, second) => second.stock - first.stock);
    if (this.sort() === 'name') goods.sort((first, second) => first.name.localeCompare(second.name));
    if (this.sort() === 'fill') goods.sort((first, second) => this.fill(first) - this.fill(second));
    return goods;
  });

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
}