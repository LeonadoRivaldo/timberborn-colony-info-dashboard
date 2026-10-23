import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Subject } from 'rxjs';
import { vi } from 'vitest';
import { AdaptersService } from '../../core/services/adapters/adapters.service';
import { LeversService } from '../../core/services/levers/levers.service';
import { Dashboard } from './dashboard';
import { ColoniesService } from '../../core/services/colonies/colonies.service';
import { of } from 'rxjs';

describe('Dashboard lists', () => {
  it('unsubscribes from the previous colony and clears its data when selection changes', async () => {
    const selectedId = signal('first');
    const firstAdapters = new Subject<unknown[]>();
    const secondAdapters = new Subject<unknown[]>();
    const watchList = vi.fn(() => (selectedId() === 'first' ? firstAdapters : secondAdapters));
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: AdaptersService, useValue: { watchList } },
        { provide: LeversService, useValue: { watchList: () => of([]) } },
        {
          provide: ColoniesService,
          useValue: {
            selectedId,
            state: signal({
              data: [
                { id: 'first', data: { colonyInfo: { settlementName: 'First' } } },
                { id: 'second', data: { colonyInfo: { settlementName: 'Second' } } },
              ],
              loading: false,
              error: '',
            }),
            select: (id: string) => selectedId.set(id),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    await fixture.whenStable();
    firstAdapters.next([{ id: 'old', data: { name: 'BADWATER_ADPTER', state: true } }]);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.season.badwater').classList.contains('is-active'),
    ).toBe(true);

    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    select.value = 'second';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(firstAdapters.observed).toBe(false);
    expect(fixture.nativeElement.querySelector('.season.badwater')).toBeNull();
    secondAdapters.next([{ id: 'new', data: { name: 'WET_SEASON_ADPTER', state: true } }]);
    fixture.detectChanges();
    expect(fixture.componentInstance.seasons().find((season) => season.id === 'wet')?.active).toBe(
      true,
    );
    fixture.destroy();
    expect(secondAdapters.observed).toBe(false);
  });

  it('renders live data and read errors', async () => {
    const adapters = new Subject<unknown[]>();
    const levers = new Subject<unknown[]>();
    const update = vi.fn().mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: AdaptersService, useValue: { watchList: () => adapters } },
        { provide: LeversService, useValue: { watchList: () => levers, update } },
        {
          provide: ColoniesService,
          useValue: {
            selectedId: signal('first'),
            state: signal({
              data: [{ id: 'first', data: { colonyInfo: { settlementName: 'First' } } }],
              loading: false,
              error: '',
            }),
            select: vi.fn(),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Carregando');

    adapters.next([{ id: 'BADWATER', data: { name: 'BADWATER_ADPTER', state: false } }]);
    levers.next([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.season-status').textContent).toContain(
      'Sem sinal',
    );

    adapters.next([{ id: 'BADWATER', data: { name: 'BADWATER_ADPTER', state: true } }]);
    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('.season.badwater').classList.contains('is-active'),
    ).toBe(true);

    levers.next([{ id: 'gate', data: { name: 'Gate', state: false } }]);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-pressed')).toBe('false');
    button.click();
    await fixture.whenStable();
    expect(update).toHaveBeenCalledWith('gate', { state: true });

    update.mockRejectedValueOnce(new Error('write-denied'));
    await fixture.componentInstance.toggleLever('gate', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('write-denied');

    levers.error(new Error('permission-denied'));
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('permission-denied');
    fixture.destroy();
    expect(adapters.observed).toBe(false);
  });

  it('renders stock values, clamps fill and filters goods without changing the source', async () => {
    const goods = [
      { id: 'Water', name: 'Water', type: 'Liquid', stock: 120, capacity: 100 },
      { id: 'Log', name: 'Log', type: 'Pileable', stock: 20, capacity: 100 },
      { id: 'Corn', name: 'Corn', type: 'Box', stock: 15, capacity: 0 },
    ];
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        { provide: AdaptersService, useValue: { watchList: () => of([]) } },
        { provide: LeversService, useValue: { watchList: () => of([]) } },
        {
          provide: ColoniesService,
          useValue: {
            selectedId: signal('first'),
            state: signal({
              data: [
                {
                  id: 'first',
                  data: {
                    colonyInfo: { settlementName: 'Esgaroth' },
                    resources: { goods, stockAvailable: true },
                    population: { total: 200, adults: 150, children: 10, bots: 40 },
                    powerGrid: { networks: [{ powerSupply: 500, powerDemand: 300 }] },
                  },
                },
              ],
              loading: false,
              error: '',
            }),
            select: vi.fn(),
          },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    await fixture.whenStable();
    const dashboard = fixture.componentInstance;
    expect(dashboard.fill(goods[0])).toBe(100);
    expect(dashboard.fill(goods[2])).toBe(0);
    expect(fixture.nativeElement.querySelectorAll('.good')).toHaveLength(3);
    expect(fixture.nativeElement.textContent).toContain('+20 excedente');
    expect(dashboard.power().supply).toBe(500);
    expect(dashboard.food()).toEqual({ stock: 15, availableTypes: 1, totalTypes: 1 });
    expect(fixture.nativeElement.querySelector('.population-summary').textContent).toContain('200');
    expect(fixture.nativeElement.querySelector('.overview').textContent).toContain(
      'Reserva de alimentos',
    );
    expect(fixture.nativeElement.querySelectorAll('.overview-item')).toHaveLength(4);

    dashboard.category.set('water');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.good')).toHaveLength(1);
    dashboard.category.set('all');
    dashboard.search.set('log');
    expect(dashboard.visibleGoods().map((good) => good.id)).toEqual(['Log']);
    dashboard.search.set('');
    dashboard.hideEmpty.set(true);
    expect(dashboard.visibleGoods()).toHaveLength(3);
    dashboard.goodsSort.set('fill');
    expect(dashboard.visibleGoods()[0].id).toBe('Corn');
    expect(goods[0].id).toBe('Water');
    expect(dashboard.seasons().every((season) => !season.known)).toBe(true);
    fixture.destroy();
  });
});
