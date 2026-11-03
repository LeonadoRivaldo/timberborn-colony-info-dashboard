import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PRODUCTION_CATALOG } from '../../core/models/production-catalog';
import { Production } from './production';
import { recipeOptionsByGood } from './production-calculator';

describe('Production calculator page', () => {
  let fixture: ComponentFixture<Production>;
  let component: Production;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Production],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(Production);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('lists bots and expands the full chain down to raw materials per hour', async () => {
    expect(component.goods()).toContain('Bot');
    const rowId = component.rows()[0].id;
    component.updateGood(rowId, 'Bot');
    component.updateNumber(rowId, 'hours', '72');
    fixture.detectChanges();
    await fixture.whenStable();

    const plan = component.plans()[0].plan!;
    expect(plan.steps[0].option.building.id).toBe('BotAssembler');
    expect(component.cycleHours(plan.steps[0].option)).toBe(36);
    expect(plan.steps.map((step) => step.goodId)).toEqual(expect.arrayContaining(['BotChassis', 'BotHead', 'BotLimb']));
    expect(plan.rawMaterials.length).toBeGreaterThan(0);
    expect(plan.rawMaterials.every((material) => material.perHour === material.amount / 72)).toBe(true);

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Linha de producao');
    expect(text).toContain('Bot Assembler');
    expect(text).toContain('/h');
  });

  it('clears products that the newly selected faction cannot manufacture', () => {
    const rowId = component.rows()[0].id;
    const folktailsGoods = recipeOptionsByGood(PRODUCTION_CATALOG, 'Folktails');
    const exclusive = [...recipeOptionsByGood(PRODUCTION_CATALOG, 'IronTeeth').keys()].find((goodId) => !folktailsGoods.has(goodId));
    expect(exclusive).toBeDefined();

    component.selectFaction('IronTeeth');
    component.updateGood(rowId, exclusive!);
    component.selectFaction('Folktails');
    expect(component.rows()[0].goodId).toBe('');
  });
});
