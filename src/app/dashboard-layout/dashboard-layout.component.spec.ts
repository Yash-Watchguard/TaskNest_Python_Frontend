import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardLayoutComponent } from './dashboard-layout.component';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/user.model';
import { Router } from '@angular/router';

fdescribe('DashboardLayoutComponent (Standalone)', () => {
  let component: DashboardLayoutComponent;
  let fixture: ComponentFixture<DashboardLayoutComponent>;
  let authServiceMock: jasmine.SpyObj<AuthService>;
  let routerMock: jasmine.SpyObj<Router>;

  beforeEach(async () => {

    routerMock = jasmine.createSpyObj('Router', ['navigate']);

    authServiceMock = jasmine.createSpyObj('AuthService', [
      'getCurrentUser'
    ]);

   
    (authServiceMock as any).router = routerMock;

    await TestBed.configureTestingModule({
      imports: [DashboardLayoutComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardLayoutComponent);
    component = fixture.componentInstance;
  });

 
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

 
  it('should navigate to admin dashboard if role is ADMIN', () => {
    authServiceMock.getCurrentUser.and.returnValue({
      Role: Role.ADMIN
    } as any);

    component.ngOnInit();

    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/dashboard/admin'],
      { replaceUrl: true }
    );
  });

 
  it('should navigate to manager dashboard if role is MANAGER', () => {
    authServiceMock.getCurrentUser.and.returnValue({
      Role: Role.MANAGER
    } as any);

    component.ngOnInit();

    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/dashboard/manager'],
      { replaceUrl: true }
    );
  });


  it('should navigate to employee dashboard if role is EMPLOYEE', () => {
    authServiceMock.getCurrentUser.and.returnValue({
      Role: Role.EMPLOYEE
    } as any);

    component.ngOnInit();

    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/dashboard/employee'],
      { replaceUrl: true }
    );
  });

 
  it('should NOT navigate if user is null', () => {
    authServiceMock.getCurrentUser.and.returnValue(null);

    component.ngOnInit();

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });
});
