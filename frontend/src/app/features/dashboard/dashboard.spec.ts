import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Subject, of } from 'rxjs';
import { vi } from 'vitest';
import { AdaptersService } from '../../core/services/adapters/adapters.service';
import { ColoniesService } from '../../core/services/colonies/colonies.service';
import { IndicatorConfigurationsService } from '../../core/services/indicators/indicator-configurations.service';
import { LeversService } from '../../core/services/levers/levers.service';
import { Dashboard } from './dashboard';

describe('Dashboard container', () => {
  it('changes colony-scoped listeners and reads state directly from configured indicators', async () => {
    const selectedId = signal('first');
    const firstAdapters = new Subject<any[]>();
    const secondAdapters = new Subject<any[]>();
    const firstConfigurations = new Subject<any[]>();
    const secondConfigurations = new Subject<any[]>();
    const adapterWatch = vi.fn(() => selectedId() === 'first' ? firstAdapters : secondAdapters);
    const configurationWatch = vi.fn(() => selectedId() === 'first' ? firstConfigurations : secondConfigurations);

    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [
        provideRouter([]),
        { provide: AdaptersService, useValue: { watchList: adapterWatch } },
        { provide: IndicatorConfigurationsService, useValue: { watchList: configurationWatch, update: vi.fn() } },
        { provide: LeversService, useValue: { watchList: () => of([]), update: vi.fn() } },
        { provide: ColoniesService, useValue: {
          selectedId,
          state: signal({ data: [
            { id: 'first', data: { colonyInfo: { settlementId: 'first', settlementName: 'First' } } },
            { id: 'second', data: { colonyInfo: { settlementId: 'second', settlementName: 'Second' } } },
          ], loading: false, error: '' }),
          select: (id: string) => selectedId.set(id),
        } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    await fixture.whenStable();
    firstAdapters.next([{ id: 'raw-badwater', data: { name: 'BADWATER_ADPTER', state: true } }]);
    firstConfigurations.next([{ id: 'BADWATER', data: { name: 'BADWATER', state: true, config: { visible: true, color: '#ff6655' } } }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.indicator-light.active')?.style.getPropertyValue('--indicator-color')).toBe('#ff6655');
    expect(fixture.nativeElement.querySelector('.indicator-name')?.textContent).toContain('badwater');

    fixture.componentInstance.selectColony('second');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(firstAdapters.observed).toBe(false);
    expect(firstConfigurations.observed).toBe(false);
    secondAdapters.next([{ id: 'raw-drought', data: { name: 'DROUGHT_ADPTER', state: false } }]);
    secondConfigurations.next([{ id: 'DROUGHT', data: { name: 'DROUGHT', state: false, config: { visible: true, color: '#e2bb66' } } }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-indicator-card')).toHaveLength(0);
    const activeOnly = fixture.nativeElement.querySelector('.active-filter input') as HTMLInputElement;
    expect(activeOnly.checked).toBe(true);
    activeOnly.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.indicator-name')?.textContent).toContain('drought');
    expect(fixture.nativeElement.querySelector('.indicator-name small')?.textContent).toContain('INATIVO');
    fixture.destroy();
    expect(secondAdapters.observed).toBe(false);
    expect(secondConfigurations.observed).toBe(false);
  });

  it('keeps indicator configuration writes separate from adapter and lever writes', async () => {
    const selectedId = signal('first');
    const updateConfiguration = vi.fn().mockResolvedValue(undefined);
    const updateLever = vi.fn().mockResolvedValue(undefined);
    await TestBed.configureTestingModule({ imports: [Dashboard], providers: [
      provideRouter([]),
      { provide: AdaptersService, useValue: { watchList: () => of([]) } },
      { provide: IndicatorConfigurationsService, useValue: { watchList: () => of([]), update: updateConfiguration } },
      { provide: LeversService, useValue: { watchList: () => of([]), update: updateLever } },
      { provide: ColoniesService, useValue: {
        selectedId,
        state: signal({ data: [{ id: 'first', data: { colonyInfo: { settlementId: 'first', settlementName: 'First' } } }], loading: false, error: '' }),
        select: (id: string) => selectedId.set(id),
      } },
    ] }).compileComponents();

    const fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
    await fixture.whenStable();
    await fixture.componentInstance.saveIndicator({ id: 'BADWATER', color: '#ff6655' });
    await fixture.componentInstance.toggleLever('gate', false);
    await fixture.componentInstance.removeIndicator('BADWATER');
    expect(updateConfiguration).toHaveBeenNthCalledWith(1, 'BADWATER', { 'config.visible': true, 'config.color': '#ff6655' });
    expect(updateLever).toHaveBeenCalledWith('gate', { state: true });
    expect(updateConfiguration).toHaveBeenNthCalledWith(2, 'BADWATER', { 'config.visible': false });
    fixture.destroy();
  });
});