import type { Faction, GoodAmount, ProductionBuilding, ProductionCatalog, ProductionRecipe } from '../../core/models/production.model';

export interface RecipeOption {
  readonly key: string;
  readonly recipe: ProductionRecipe;
  readonly building: ProductionBuilding;
}

export interface ProductionRequest {
  readonly goodId: string;
  readonly quantity: number;
  readonly hours: number;
  readonly faction: Faction;
  readonly recipeChoices?: Readonly<Record<string, string>>;
}

export interface ProductionStep {
  readonly goodId: string;
  readonly option: RecipeOption;
  readonly alternatives: readonly RecipeOption[];
  readonly unitsNeeded: number;
  readonly unitsProduced: number;
  readonly cycles: number;
  readonly buildingsNeeded: number;
  readonly workersNeeded: number;
}

export interface RawMaterial {
  readonly goodId: string;
  readonly amount: number;
  readonly perHour: number;
}

export interface ProductionPlan {
  readonly steps: readonly ProductionStep[];
  readonly rawMaterials: readonly RawMaterial[];
  readonly totalBuildings: number;
  readonly totalWorkers: number;
  readonly chainHours: number;
  readonly warnings: readonly { key: string; params: Record<string, string> }[];
}

export function recipeOptionsByGood(catalog: ProductionCatalog, faction: Faction): Map<string, RecipeOption[]> {
  const recipes = new Map(catalog.recipes.map((recipe) => [recipe.id, recipe]));
  const options = new Map<string, RecipeOption[]>();
  for (const building of catalog.buildings) {
    if (building.faction !== faction && building.faction !== 'Common') continue;
    for (const recipeId of building.recipeIds) {
      const recipe = recipes.get(recipeId);
      if (!recipe) continue;
      for (const product of recipe.products) {
        const list = options.get(product.id) ?? [];
        list.push({ key: `${recipe.id}|${building.id}`, recipe, building });
        options.set(product.id, list);
      }
    }
  }
  for (const list of options.values()) {
    list.sort((left, right) => unitsPerBuildingHour(right) - unitsPerBuildingHour(left) || left.key.localeCompare(right.key));
  }
  return options;
}

// Recipe hours are total work; the game splits them across the building's workers.
export function effectiveCycleHours(option: RecipeOption): number {
  return option.recipe.cycleHours / Math.max(1, option.building.maxWorkers);
}

export function calculateProduction(catalog: ProductionCatalog, request: ProductionRequest): ProductionPlan {
  const quantity = Math.max(0, request.quantity);
  const hours = request.hours > 0 ? request.hours : 1;
  const optionsByGood = recipeOptionsByGood(catalog, request.faction);
  const warnings: { key: string; params: Record<string, string> }[] = [];
  const chosen = new Map<string, RecipeOption>();

  const pick = (goodId: string): RecipeOption | undefined => {
    const options = optionsByGood.get(goodId);
    if (!options?.length) return undefined;
    const requested = request.recipeChoices?.[goodId];
    return options.find((option) => option.key === requested) ?? options[0];
  };

  // Topological order so each good's total demand is known before expanding its inputs.
  const order: string[] = [];
  const state = new Map<string, 'visiting' | 'done'>();
  const cyclic = new Set<string>();
  const visit = (goodId: string): void => {
    const status = state.get(goodId);
    if (status === 'done') return;
    if (status === 'visiting') {
      cyclic.add(goodId);
      return;
    }
    state.set(goodId, 'visiting');
    const option = pick(goodId);
    if (option) {
      chosen.set(goodId, option);
      for (const input of inputsOf(option.recipe)) visit(input.id);
    }
    state.set(goodId, 'done');
    order.unshift(goodId);
  };
  visit(request.goodId);

  for (const goodId of cyclic) {
    chosen.delete(goodId);
    warnings.push({ key: 'production.cycleRawMaterial', params: { good: goodId } });
  }

  const demand = new Map<string, number>([[request.goodId, quantity]]);
  const steps: ProductionStep[] = [];
  const raw = new Map<string, number>();
  const chainHours = new Map<string, number>();

  for (const goodId of order) {
    const needed = demand.get(goodId) ?? 0;
    const option = chosen.get(goodId);
    if (!option) {
      if (needed > 0) raw.set(goodId, (raw.get(goodId) ?? 0) + needed);
      continue;
    }
    const perCycle = option.recipe.products.find((product) => product.id === goodId)?.amount ?? 1;
    const cycles = needed > 0 ? Math.ceil(needed / perCycle) : 0;
    for (const ingredient of option.recipe.ingredients) {
      demand.set(ingredient.id, (demand.get(ingredient.id) ?? 0) + cycles * ingredient.amount);
    }
    if (option.recipe.fuel && cycles > 0) {
      const fuelId = option.recipe.fuel.id;
      demand.set(fuelId, (demand.get(fuelId) ?? 0) + Math.ceil(cycles / option.recipe.fuel.cyclesPerUnit));
    }
    const buildingsNeeded = cycles > 0 ? Math.ceil((cycles * effectiveCycleHours(option)) / hours) : 0;
    steps.push({
      goodId,
      option,
      alternatives: optionsByGood.get(goodId) ?? [],
      unitsNeeded: needed,
      unitsProduced: cycles * perCycle,
      cycles,
      buildingsNeeded,
      workersNeeded: buildingsNeeded * option.building.maxWorkers
    });
  }

  for (const goodId of [...order].reverse()) {
    const option = chosen.get(goodId);
    const inputHours = option ? Math.max(0, ...inputsOf(option.recipe).map((input) => chainHours.get(input.id) ?? 0)) : 0;
    chainHours.set(goodId, inputHours + (option ? effectiveCycleHours(option) : 0));
  }

  const rawMaterials = [...raw.entries()]
    .map(([goodId, amount]) => ({ goodId, amount, perHour: amount / hours }))
    .sort((left, right) => left.goodId.localeCompare(right.goodId));

  return {
    steps,
    rawMaterials,
    totalBuildings: steps.reduce((sum, step) => sum + step.buildingsNeeded, 0),
    totalWorkers: steps.reduce((sum, step) => sum + step.workersNeeded, 0),
    chainHours: chainHours.get(request.goodId) ?? 0,
    warnings
  };
}

function inputsOf(recipe: ProductionRecipe): GoodAmount[] {
  return recipe.fuel ? [...recipe.ingredients, { id: recipe.fuel.id, amount: 1 }] : [...recipe.ingredients];
}

function unitsPerBuildingHour(option: RecipeOption): number {
  const total = option.recipe.products.reduce((sum, product) => sum + product.amount, 0);
  const hours = effectiveCycleHours(option);
  return hours > 0 ? total / hours : 0;
}
