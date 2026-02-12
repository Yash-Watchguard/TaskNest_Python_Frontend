import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopupcomponentComponent } from './popupcomponent.component';
import { Router } from '@angular/router';

describe('PopupcomponentComponent', () => {
  let component: PopupcomponentComponent;
  let fixture: ComponentFixture<PopupcomponentComponent>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [PopupcomponentComponent],
      providers: [{ provide: Router, useValue: mockRouter }]
    }).compileComponents();

    fixture = TestBed.createComponent(PopupcomponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should navigate to clear popup outlet on close', () => {
    component.closePopup();

    expect(mockRouter.navigate).toHaveBeenCalledWith([
      { outlets: { popup: null } }
    ]);
  });
});
