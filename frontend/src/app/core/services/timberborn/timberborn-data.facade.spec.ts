import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { TimberbornDataFacade } from './timberborn-data.facade';

describe('TimberbornDataFacade', () => {
  let facade: TimberbornDataFacade;
  let get: ReturnType<typeof vi.fn>;
  let post: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    localStorage.clear();
    get = vi.fn().mockReturnValue(of([]));
    post = vi.fn().mockReturnValue(of('OK'));
    TestBed.configureTestingModule({
      providers: [
        TimberbornDataFacade,
        { provide: HttpClient, useValue: { get, post } },
      ],
    });
    facade = TestBed.inject(TimberbornDataFacade);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('routes adapters and indicators to the adapter endpoint and classifies entries', () => {
    get.mockReturnValue(of([
      { name: 'BADWATER_ADPTER', state: true },
      { name: 'RESERVOIR_INDICATOR', state: true },
      { name: 'PUMP_LEVER', state: true },
    ]));
    let adapterData: unknown;
    let indicatorData: unknown;

    const adaptersSubscription = facade.watchCollection('adapters').subscribe((state) => adapterData = state.data);
    const indicatorsSubscription = facade.watchCollection('indicators').subscribe((state) => indicatorData = state.data);

    expect(get).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledWith('/api/adapters');
    expect(adapterData).toEqual([{ id: 'BADWATER_ADPTER', data: { name: 'BADWATER_ADPTER', state: true } }]);
    expect(indicatorData).toEqual([{
      id: 'RESERVOIR_INDICATOR',
      data: { name: 'RESERVOIR', state: true, config: { visible: false } },
    }]);

    adaptersSubscription.unsubscribe();
    indicatorsSubscription.unsubscribe();
  });

  it('reads the active colony snapshot from the same-origin API', () => {
    const snapshot = { colonyInfo: { settlementName: 'Esgaroth', settlementId: 'settlement-id' } };
    get.mockReturnValue(of(snapshot));
    let colonyData: unknown;
    const subscription = facade.watchColony().subscribe((state) => colonyData = state.data);

    expect(get).toHaveBeenCalledWith('/api/colony-info');
    expect(colonyData).toEqual(snapshot);
    subscription.unsubscribe();
  });

  it('reads levers separately and posts switch commands with encoded names', async () => {
    get.mockReturnValue(of([{ name: 'MAIN PUMP', state: false, springReturn: false }]));
    let leverData: unknown;
    const subscription = facade.watchCollection('levers').subscribe((state) => leverData = state.data);

    expect(get).toHaveBeenCalledWith('/api/levers');
    expect(leverData).toEqual([{ id: 'MAIN PUMP', data: { name: 'MAIN PUMP', state: false, springReturn: false } }]);

    await facade.setLeverState('MAIN PUMP', true);
    expect(post).toHaveBeenCalledWith('/api/switch-on/MAIN%20PUMP', null, { responseType: 'text' });

    subscription.unsubscribe();
  });

  it('persists indicator visibility and color in browser storage', () => {
    facade.saveIndicator({ id: 'RESERVOIR_INDICATOR', color: '#80c9bc' });
    facade.removeIndicator('RESERVOIR_INDICATOR');

    expect(JSON.parse(localStorage.getItem('colony-info.indicator-preferences') ?? '{}')).toEqual({
      RESERVOIR_INDICATOR: { visible: false, color: '#80c9bc' },
    });
  });
});