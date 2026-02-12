import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';
import { HttpErrorResponse } from '@angular/common/http';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: {
    Login: jasmine.Spy;
    destroref: { onDestroy: jasmine.Spy };
    router: { navigate: jasmine.Spy };
  };
  let mockMessageService: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    mockAuthService = {
      Login: jasmine.createSpy('Login').and.returnValue(of({})),
      destroref: { onDestroy: jasmine.createSpy('onDestroy') },
      router: { navigate: jasmine.createSpy('navigate') }
    };
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should call login and navigate on success', () => {
    component.email = 'sam@example.com';
    component.password = 'password123';

    component.onSubmit();

    expect(component.loading()).toBeTrue();
    expect(mockAuthService.Login).toHaveBeenCalledWith('login', {
      email: 'sam@example.com',
      password: 'password123'
    });
    expect(mockAuthService.router.navigate).toHaveBeenCalledWith(
      ['dashboard'],
      { replaceUrl: true }
    );
  });

  it('should show error and stop loading on failure', () => {
    mockAuthService.Login.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 401 }))
    );

    component.onSubmit();

    expect(component.loading()).toBeFalse();
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      closable: true,
      summary: 'Login Error',
      detail: 'Invalid Email Password'
    });
  });
});
