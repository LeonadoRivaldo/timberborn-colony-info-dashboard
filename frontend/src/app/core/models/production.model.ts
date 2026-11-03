export type Faction = 'Folktails' | 'IronTeeth';

export interface GoodAmount {
  readonly id: string;
  readonly amount: number;
}

export interface ProductionRecipe {
  readonly id: string;
  readonly cycleHours: number;
  readonly ingredients: readonly GoodAmount[];
  readonly products: readonly GoodAmount[];
  readonly fuel: { readonly id: string; readonly cyclesPerUnit: number } | null;
}

export interface ProductionBuilding {
  readonly id: string;
  readonly faction: Faction | 'Common';
  readonly maxWorkers: number;
  readonly recipeIds: readonly string[];
}

export interface ProductionCatalog {
  readonly gameVersion: string;
  readonly recipes: readonly ProductionRecipe[];
  readonly buildings: readonly ProductionBuilding[];
}
