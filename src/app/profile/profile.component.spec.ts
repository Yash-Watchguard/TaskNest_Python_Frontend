import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { UserService } from '../services/user.service';
import { AuthService } from '../services/auth.service';
import { Role, person, user } from '../models/user.model';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockUserService: jasmine.SpyObj<UserService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let profileSignal = signal<person>({
    Id: '',
    Name: '',
    Email: '',
    PhoneNumber: '',
    Role: ''
  });

  beforeEach(async () => {
    mockUserService = jasmine.createSpyObj('UserService', [
      'GetProfile',
      'updateUserProfile'
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);

    mockUserService.GetProfile.and.returnValue(
      of({
        Id: 'u-1',
        Name: 'Sam',
        Email: 'USER#sam@example.com',
        PhoneNumber: '9999999999',
        Role: 'Employee'
      })
    );
    mockUserService.updateUserProfile.and.returnValue(of({}));

    Object.defineProperty(mockUserService, 'userProfile', {
      get: () => profileSignal
    });

    await TestBed.configureTestingModule({
      imports: [ProfileComponent],
      providers: [
        { provide: UserService, useValue: mockUserService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load profile on init when profile is empty', () => {
    mockAuthService.getCurrentUser.and.returnValue({
      Id: 'u-1',
      Name: 'Sam',
      Email: 'USER#sam@example.com',
      Role: Role.MANAGER
    } as user);

    component.ngOnInit();

    expect(mockUserService.GetProfile).toHaveBeenCalled();
    expect(component.isLoading()).toBeFalse();
  });

  it('should toggle edit mode and open edit panel', () => {
    component.ngOnInit();

    component.toggleEditMode();

    expect(component.OpenProfileBar()).toBeFalse();
    expect(component.OpenEditMenu()).toBeTrue();
  });

  it('should save changes and return to profile view', () => {
    const updatedProfile: person = {
      Id: 'u-1',
      Name: 'Sam',
      Email: 'USER#sam@example.com',
      PhoneNumber: '9999999999',
      Role: 'Employee'
    };

    profileSignal.set(updatedProfile);
    component.ngOnInit();

    component.profileForm.patchValue({
      name: 'Sam',
      email: 'sam@example.com',
      phoneNumber: '9999999999'
    });

    component.saveChanges();

    expect(mockUserService.updateUserProfile).toHaveBeenCalledWith('u-1', {
      name: 'Sam',
      email: 'sam@example.com',
      phoneNumber: '9999999999'
    });
    expect(mockUserService.GetProfile).toHaveBeenCalledWith('u-1');
    expect(component.OpenProfileBar()).toBeTrue();
    expect(component.OpenEditMenu()).toBeFalse();
  });

  it('should reset form when canceling edit', () => {
    component.ngOnInit();
    component.profileForm.patchValue({
      name: 'X',
      email: 'x@example.com',
      phoneNumber: '123'
    });

    component.cancelEdit();

    expect(component.OpenProfileBar()).toBeTrue();
    expect(component.OpenEditMenu()).toBeFalse();
  });
});
