import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetailsCard } from './details-card';

describe('DetailsCard', () => {
  let component: DetailsCard;
  let fixture: ComponentFixture<DetailsCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailsCard],
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
