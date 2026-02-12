import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryCardComponent } from './summary-card.component';

describe('SummaryCardComponent', () => {
  let component: SummaryCardComponent;
  let fixture: ComponentFixture<SummaryCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SummaryCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SummaryCardComponent);
    component = fixture.componentInstance;
    component.titel = 'Total Tasks';
    component.totallength = 12;
    component.iconLink = 'pi-check';
    component.iconcolor = 'red';
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render title and total length', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('Total Tasks');
    expect(element.textContent).toContain('12');
  });

  it('should set the icon class and color', () => {
    const icon = fixture.nativeElement.querySelector('i') as HTMLElement;

    expect(icon.className).toContain('pi');
    expect(icon.className).toContain('pi-check');
    expect(icon.style.color).toBe('red');
  });
});
