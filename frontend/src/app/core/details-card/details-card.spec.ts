import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsCard } from './details-card';
import { provideI18n } from '../i18n/i18n.providers';

describe('DetailsCard', () => {
  let component: DetailsCard;
  let fixture: ComponentFixture<DetailsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsCard],
      providers: [...provideI18n()],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailsCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('label', 'Test summary');
    fixture.componentRef.setInput('icon', 'fa-circle');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
