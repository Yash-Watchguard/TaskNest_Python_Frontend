import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';

import { SignupComponent } from './signup.component';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let mockAuthService: {
    signupsignal: ReturnType<typeof signal<boolean>>;
    Signup: jasmine.Spy;
    Login: jasmine.Spy;
    destroref: { onDestroy: jasmine.Spy };
    router: { navigate: jasmine.Spy };
    newUser: ReturnType<typeof signal<any>>;
  };
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    mockAuthService = {
      signupsignal: signal(false),
      Signup: jasmine.createSpy('Signup').and.returnValue(of({})),
      Login: jasmine.createSpy('Login').and.returnValue(of({})),
      destroref: { onDestroy: jasmine.createSpy('onDestroy') },
      router: { navigate: jasmine.createSpy('navigate') },
      newUser: signal(null)
    };

    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [SignupComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call Signup and set loading on submit', () => {
    component.name = 'Sam';
    component.email = 'sam@example.com';
    component.phonenumber = '9999999999';
    component.password = 'password123';

    component.onSubmit();

    expect(component.loading()).toBeTrue();
    expect(mockAuthService.Signup).toHaveBeenCalledWith('signup', {
      name: 'Sam',
      email: 'sam@example.com',
      phonenumber: '9999999999',
      password: 'password123'
    });
  });

  it('should set error message when user already exists', () => {
    mockAuthService.Signup.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 409 }))
    );

    component.onSubmit();

    expect(component.errorMessage).toBe(
      'User already exists. Please try logging in.'
    );
    expect(mockMessageService.add).toHaveBeenCalled();
  });

  it('should call login when signup signal is true', () => {
    component.email = 'sam@example.com';
    component.password = 'password123';

    mockAuthService.signupsignal.set(true);

    expect(mockAuthService.Login).toHaveBeenCalledWith('login', {
      email: 'sam@example.com',
      password: 'password123'
    });
  });

  it('should navigate to dashboard on login success', () => {
    component.email = 'sam@example.com';
    component.password = 'password123';

    component.callLogin();

    expect(mockAuthService.Login).toHaveBeenCalled();
    expect(mockAuthService.router.navigate).toHaveBeenCalledWith(
      ['dashboard'],
      { replaceUrl: true }
    );
  });
});
