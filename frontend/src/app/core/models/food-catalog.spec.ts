import { EDIBLE_FOOD_IDS } from './food-catalog';

describe('edible Timberborn good IDs', () => {
  it('contains edible foods from both factions and shared berries once', () => {
    expect(EDIBLE_FOOD_IDS.has('Berries')).toBe(true);
    expect(EDIBLE_FOOD_IDS.has('Carrot')).toBe(true);
    expect(EDIBLE_FOOD_IDS.has('SunflowerSeeds')).toBe(true);
    expect(EDIBLE_FOOD_IDS.has('Bread')).toBe(true);
    expect(EDIBLE_FOOD_IDS.has('Kohlrabi')).toBe(true);
    expect(EDIBLE_FOOD_IDS.has('MangroveFruit')).toBe(true);
    expect(EDIBLE_FOOD_IDS.has('FermentedCassava')).toBe(true);
    expect(EDIBLE_FOOD_IDS.has('CornRation')).toBe(true);
    expect(EDIBLE_FOOD_IDS.has('Coffee')).toBe(true);
    expect([...EDIBLE_FOOD_IDS].filter((id) => id === 'Berries')).toHaveLength(1);
  });

  it('excludes raw ingredients that are not edible as-is', () => {
    for (const ingredient of [
      'Corn', 'Cassava', 'Soybean', 'CanolaSeeds', 'Wheat', 'Potato',
      'CattailRoot', 'Chestnut', 'Spadderdock', 'CoffeeBean', 'Eggplant', 'Mushroom', 'Algae',
    ]) {
      expect(EDIBLE_FOOD_IDS.has(ingredient), ingredient).toBe(false);
    }
  });
});