import { TestBed } from '@angular/core/testing';
import { GoodCard } from './good-card/good-card';
import { SeasonCard } from './season-card/season-card';
import { SummaryCard } from './summary-card/summary-card';

describe('Dashboard presentation cards', () => {
  it('reuses a summary card with different labels, values and units', async () => {
    await TestBed.configureTestingModule({ imports: [SummaryCard] }).compileComponents();
    const fixture = TestBed.createComponent(SummaryCard);
    fixture.componentRef.setInput('label', 'Populacao');
    fixture.componentRef.setInput('icon', 'fa-users');
    fixture.componentRef.setInput('value', 200);
    fixture.componentRef.setInput('unit', 'habitantes');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('200');
    expect(fixture.nativeElement.textContent).toContain('habitantes');

    fixture.componentRef.setInput('label', 'Reserva de alimentos');
    fixture.componentRef.setInput('value', null);
    fixture.componentRef.setInput('unit', 'unidades');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Reserva de alimentos');
    expect(fixture.nativeElement.textContent).toContain('--');
    expect(fixture.nativeElement.textContent).not.toContain('habitantes');
  });

  it('renders a good card with its stock, category and accessible fill', async () => {
    await TestBed.configureTestingModule({ imports: [GoodCard] }).compileComponents();
    const fixture = TestBed.createComponent(GoodCard);
    fixture.componentRef.setInput('good', {
      id: 'Water',
      name: 'Water',
      type: 'Liquid',
      stock: 50,
      capacity: 100,
    });
    fixture.componentRef.setInput('category', 'water');
    fixture.componentRef.setInput('icon', 'fa-droplet');
    fixture.componentRef.setInput('fill', 50);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.good.water')).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[role="progressbar"]').getAttribute('aria-valuenow'),
    ).toBe('50');
    expect(fixture.nativeElement.textContent).toContain('50%');
  });

  it('updates the season card from loading to active and back to no signal', async () => {
    await TestBed.configureTestingModule({ imports: [SeasonCard] }).compileComponents();
    const fixture = TestBed.createComponent(SeasonCard);
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Carregando...');

    fixture.componentRef.setInput('loading', false);
    fixture.componentRef.setInput('season', {
      id: 'drought',
      label: 'Seca',
      icon: 'fa-sun',
      names: 'DROUGHT',
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.season.drought.is-active')).toBeTruthy();
    expect(fixture.nativeElement.textContent).toContain('Seca');

    fixture.componentRef.setInput('season', undefined);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Sem sinal');
  });
});
