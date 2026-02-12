import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WildcardComponent } from './wildcard.component';

describe('WildcardComponent', () => {
  let component: WildcardComponent;
  let fixture: ComponentFixture<WildcardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WildcardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WildcardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should show the not found message', () => {
    const element: HTMLElement = fixture.nativeElement;

    expect(element.textContent).toContain('url is not correct');
  });
});
