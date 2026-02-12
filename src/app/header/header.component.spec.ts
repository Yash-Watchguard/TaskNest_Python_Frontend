import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { signal } from '@angular/core';

describe('HeaderComponent (Standalone)', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;

  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;
  let confirmationMock: jasmine.SpyObj<ConfirmationService>;

  beforeEach(async () => {

    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    confirmationMock = jasmine.createSpyObj('ConfirmationService', ['confirm']);

    authServiceMock = jasmine.createSpyObj('AuthService', [
      'getCurrentUser'
    ]);


    (authServiceMock as any).newUser = signal(null);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ConfirmationService, useValue: confirmationMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
  });

 
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should set user on init', () => {
    const mockUser = { id: '1', name: 'Yash' };

    authServiceMock.getCurrentUser.and.returnValue(mockUser as any);

    component.ngOnInit();

    expect(component.user).toEqual(mockUser as any);
  });


  it('should call confirmation dialog on logout', () => {
    confirmationMock.confirm.and.callFake((config: any) => {
      return confirmationMock;
    });

    component.logout();

    expect(confirmationMock.confirm).toHaveBeenCalled();
  });

  it('should clear storage and navigate on logout accept', () => {

    spyOn(localStorage, 'clear');
    spyOn(sessionStorage, 'clear');

    // capture accept callback
    let acceptCallback: Function = () => {};

    confirmationMock.confirm.and.callFake((config: any) => {
      acceptCallback = config.accept;
      return confirmationMock;
    });

    component.logout();

   
    acceptCallback();

    expect(localStorage.clear).toHaveBeenCalled();
    expect(sessionStorage.clear).toHaveBeenCalled();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
    expect(component.user).toBeNull();
  });


  it('should emit loading and navigate to profile', () => {
    spyOn(component.loading, 'emit');

    component.onclick();

    expect(component.loading.emit).toHaveBeenCalledWith(true);
    expect(component.loading.emit).toHaveBeenCalledWith(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['profile']);
  });

  it('should set visible to false on close', () => {
    component.visible = true;

    component.onclose();

    expect(component.visible).toBeFalse();
  });
});
