import { TestBed } from '@angular/core/testing';
import { GoodCard } from './good-card/good-card';
import { GoodsPanel } from './goods-panel/goods-panel';
import { IndicatorCard } from './indicators-panel/indicator-card';
import { IndicatorsPanel } from './indicators-panel/indicators-panel';
import { SummaryPanel } from './summary-panel/summary-panel';

describe('Dashboard panels and cards', () => {
  it('renders summary values and four reusable detail cards with separators', async () => {
    await TestBed.configureTestingModule({ imports: [SummaryPanel] }).compileComponents();
    const fixture = TestBed.createComponent(SummaryPanel);
    fixture.componentRef.setInput('colony', {
      timestamp: '2026-10-24T10:00:00Z',
      colonyInfo: { settlementId: 'colony-1', settlementName: 'Esgaroth' },
      population: { adults: 10, children: 2, bots: 3, total: 15, healthyAdults: 10, healthyChildren: 2 },
      resources: { count: 3, stockAvailable: true, goods: [
        { id: 'Berries', name: 'Berries', type: 'Box', stock: 12, capacity: 20 },
        { id: 'Corn', name: 'Corn', type: 'Box', stock: 90, capacity: 100 },
        { id: 'Water', name: 'Water', type: 'Liquid', stock: 50, capacity: 100 },
      ] },
      powerGrid: { networkCount: 1, networks: [{ id: 1, powerSupply: 100, powerDemand: 80, powerSurplus: 20, powered: true, batteryCharge: 0, batteryCapacity: 0, powerEfficiency: 1 }] },
    });
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('app-details-card');
    expect(cards).toHaveLength(4);
    expect(cards[0].textContent).toContain('15');
    expect(cards[1].textContent).toContain('12');
    expect(cards[2].querySelector('.mini-track span').style.width).toBe('50%');
    expect(cards[3].textContent).toContain('100');
    expect(fixture.nativeElement.querySelectorAll('.overview-item')).toHaveLength(4);
  });

  it('renders goods stock with accessible capacity fill', async () => {
    await TestBed.configureTestingModule({ imports: [GoodCard] }).compileComponents();
    const fixture = TestBed.createComponent(GoodCard);
    fixture.componentRef.setInput('good', { id: 'Water', name: 'Water', type: 'Liquid', stock: 50, capacity: 100 });
    fixture.componentRef.setInput('category', 'water');
    fixture.componentRef.setInput('icon', 'fa-droplet');
    fixture.componentRef.setInput('fill', 50);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.good.water')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[role="progressbar"]').getAttribute('aria-valuenow')).toBe('50');
  });

  it('filters and sorts goods inside its own panel', async () => {
    await TestBed.configureTestingModule({ imports: [GoodsPanel] }).compileComponents();
    const fixture = TestBed.createComponent(GoodsPanel);
    fixture.componentRef.setInput('goods', [
      { id: 'Water', name: 'Water', type: 'Liquid', stock: 100, capacity: 200 },
      { id: 'Log', name: 'Log', type: 'Pileable', stock: 10, capacity: 100 },
      { id: 'Berries', name: 'Berries', type: 'Box', stock: 30, capacity: 40 },
    ]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-good-card')).toHaveLength(3);
    fixture.componentInstance.category.set('food');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-good-card')).toHaveLength(1);
    expect(fixture.nativeElement.textContent).toContain('Berries');
    fixture.componentInstance.category.set('all');
    fixture.componentInstance.sort.set('stock');
    expect(fixture.componentInstance.visibleGoods().map((good) => good.id)).toEqual(['Water', 'Berries', 'Log']);
    fixture.destroy();
  });

  it('renders configured indicator state using its color and removal action', async () => {
    await TestBed.configureTestingModule({ imports: [IndicatorCard] }).compileComponents();
    const fixture = TestBed.createComponent(IndicatorCard);
    const removed: string[] = [];
    fixture.componentInstance.remove.subscribe((id) => removed.push(id));
    fixture.componentRef.setInput('indicator', { id: 'badwater', name: 'BADWATER', color: '#ff6655', state: true });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.indicator-light.active').style.getPropertyValue('--indicator-color')).toBe('#ff6655');
    expect(fixture.nativeElement.textContent).toContain('ATIVO');
    fixture.nativeElement.querySelector('button').click();
    expect(removed).toEqual(['badwater']);
  });

  it('lists only saved indicators and reveals the add form on demand', async () => {
    await TestBed.configureTestingModule({ imports: [IndicatorsPanel] }).compileComponents();
    const fixture = TestBed.createComponent(IndicatorsPanel);
    const saved: { id: string; color: string }[] = [];
    fixture.componentInstance.saveConfiguration.subscribe((configuration) => saved.push(configuration));
    fixture.componentRef.setInput('configurations', [
      { id: 'BADWATER', data: { name: 'BADWATER', state: true, config: { visible: true, color: '#ff6655' } } },
      { id: 'DROUGHT', data: { name: 'DROUGHT', state: false, config: { visible: true, color: '#e2bb66' } } },
      { id: 'WET_SEASON', data: { name: 'WET_SEASON', state: true } },
    ]);
    fixture.componentRef.setInput('configurationsLoading', false);
    fixture.detectChanges();
    expect(fixture.componentInstance.indicators().map((indicator) => indicator.state)).toEqual([true, false]);
    expect(fixture.nativeElement.querySelector('#indicator-name')).toBeNull();
    fixture.componentInstance.showActiveOnly.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-indicator-card')).toHaveLength(1);

    fixture.componentInstance.openAddForm();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#indicator-name')).toBeTruthy();
    expect(fixture.componentInstance.availableIndicators().map(indicator => indicator.id)).toEqual(['WET_SEASON']);
    expect(fixture.nativeElement.querySelector('option[value="WET_SEASON"]').textContent).toContain('wet season');
    fixture.componentInstance.selectedId.set('WET_SEASON');
    fixture.componentInstance.selectedColor.set('#e2bb66');
    fixture.componentInstance.save();
    expect(saved).toEqual([{ id: 'WET_SEASON', color: '#e2bb66' }]);
  });
});