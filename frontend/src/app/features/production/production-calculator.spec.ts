import type { ProductionCatalog } from '../../core/models/production.model';
import { calculateProduction, effectiveCycleHours, recipeOptionsByGood } from './production-calculator';

const catalog: ProductionCatalog = {
  gameVersion: 'test',
  recipes: [
    { id: 'Plank', cycleHours: 1.3, ingredients: [{ id: 'Log', amount: 1 }], products: [{ id: 'Plank', amount: 1 }], fuel: null },
    { id: 'Gear', cycleHours: 3, ingredients: [{ id: 'Plank', amount: 1 }], products: [{ id: 'Gear', amount: 1 }], fuel: null },
    { id: 'Widget', cycleHours: 10, ingredients: [{ id: 'Gear', amount: 3 }, { id: 'Plank', amount: 2 }], products: [{ id: 'Widget', amount: 2 }], fuel: { id: 'Biofuel', cyclesPerUnit: 4 } },
    { id: 'Biofuel', cycleHours: 2, ingredients: [{ id: 'Carrot', amount: 5 }], products: [{ id: 'Biofuel', amount: 1 }], fuel: null },
    { id: 'Water', cycleHours: 1, ingredients: [], products: [{ id: 'Water', amount: 1 }], fuel: null },
    { id: 'Water.Efficient', cycleHours: 1, ingredients: [], products: [{ id: 'Water', amount: 3 }], fuel: null },
    { id: 'Loop.A', cycleHours: 1, ingredients: [{ id: 'LoopB', amount: 1 }], products: [{ id: 'LoopA', amount: 1 }], fuel: null },
    { id: 'Loop.B', cycleHours: 1, ingredients: [{ id: 'LoopA', amount: 1 }], products: [{ id: 'LoopB', amount: 1 }], fuel: null }
  ],
  buildings: [
    { id: 'LumberMill', faction: 'Folktails', maxWorkers: 1, recipeIds: ['Plank'] },
    { id: 'GearWorkshop', faction: 'Folktails', maxWorkers: 1, recipeIds: ['Gear'] },
    { id: 'Assembler', faction: 'Folktails', maxWorkers: 2, recipeIds: ['Widget'] },
    { id: 'Refinery', faction: 'Folktails', maxWorkers: 2, recipeIds: ['Biofuel'] },
    { id: 'WaterPump', faction: 'Folktails', maxWorkers: 1, recipeIds: ['Water'] },
    { id: 'LargeWaterPump', faction: 'Folktails', maxWorkers: 3, recipeIds: ['Water.Efficient'] },
    { id: 'IronMill', faction: 'IronTeeth', maxWorkers: 2, recipeIds: ['Plank'] },
    { id: 'LoopMaker', faction: 'Folktails', maxWorkers: 1, recipeIds: ['Loop.A', 'Loop.B'] }
  ]
};

describe('production calculator', () => {
  it('aggregates shared inputs across the whole chain before rounding cycles', () => {
    const plan = calculateProduction(catalog, { goodId: 'Widget', quantity: 2, hours: 10, faction: 'Folktails' });
    const step = (id: string) => plan.steps.find((item) => item.goodId === id)!;

    expect(step('Widget').cycles).toBe(1);
    expect(step('Gear').cycles).toBe(3);
    expect(step('Plank').unitsNeeded).toBe(5);
    expect(step('Biofuel').cycles).toBe(1);
    expect(plan.rawMaterials).toEqual([
      { goodId: 'Carrot', amount: 5, perHour: 0.5 },
      { goodId: 'Log', amount: 5, perHour: 0.5 }
    ]);
  });

  it('rounds partial cycles up and reports the buildings needed to finish within the time window', () => {
    const plan = calculateProduction(catalog, { goodId: 'Gear', quantity: 10, hours: 6, faction: 'Folktails' });
    const gear = plan.steps.find((item) => item.goodId === 'Gear')!;
    const plank = plan.steps.find((item) => item.goodId === 'Plank')!;

    expect(gear.cycles).toBe(10);
    expect(gear.buildingsNeeded).toBe(5);
    expect(plank.buildingsNeeded).toBe(3);
    expect(plan.totalBuildings).toBe(8);
    expect(plan.chainHours).toBeCloseTo(4.3);
  });

  it('splits recipe hours across the building workers', () => {
    const plan = calculateProduction(catalog, { goodId: 'Widget', quantity: 4, hours: 5, faction: 'Folktails' });
    const widget = plan.steps.find((item) => item.goodId === 'Widget')!;

    expect(effectiveCycleHours(widget.option)).toBe(5);
    expect(widget.cycles).toBe(2);
    expect(widget.buildingsNeeded).toBe(2);
    expect(plan.chainHours).toBeCloseTo(9.3);
  });

  it('defaults to the most productive recipe and accepts an explicit alternative', () => {
    const options = recipeOptionsByGood(catalog, 'Folktails').get('Water')!;
    expect(options.map((option) => option.key)).toEqual(['Water.Efficient|LargeWaterPump', 'Water|WaterPump']);

    const chosen = calculateProduction(catalog, {
      goodId: 'Water', quantity: 6, hours: 2, faction: 'Folktails', recipeChoices: { Water: 'Water|WaterPump' }
    });
    expect(chosen.steps[0].option.building.id).toBe('WaterPump');
    expect(chosen.steps[0].buildingsNeeded).toBe(3);
    expect(chosen.steps[0].workersNeeded).toBe(3);
  });

  it('filters buildings by faction and treats goods without recipes as raw materials', () => {
    const plan = calculateProduction(catalog, { goodId: 'Plank', quantity: 4, hours: 2, faction: 'IronTeeth' });
    expect(plan.steps.map((step) => step.option.building.id)).toEqual(['IronMill']);
    expect(plan.rawMaterials).toEqual([{ goodId: 'Log', amount: 4, perHour: 2 }]);
  });

  it('breaks recipe loops instead of recursing forever', () => {
    const plan = calculateProduction(catalog, { goodId: 'LoopA', quantity: 1, hours: 1, faction: 'Folktails' });
    expect(plan.warnings.length).toBeGreaterThan(0);
    expect(plan.rawMaterials.map((material) => material.goodId)).toContain('LoopA');
  });
});
