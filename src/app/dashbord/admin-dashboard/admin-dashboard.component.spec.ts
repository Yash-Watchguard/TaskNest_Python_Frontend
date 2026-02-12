import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminDashboardComponent } from './admin-dashboard.component';
import { UserService } from '../../services/user.service';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { of, Subject } from 'rxjs';

fdescribe('AdminDashboardComponent (Standalone)', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;

  let userServiceMock: jasmine.SpyObj<UserService>;
  let projectServiceMock: jasmine.SpyObj<ProjectService>;
  let taskServiceMock: jasmine.SpyObj<TaskService>;
  let routerMock: jasmine.SpyObj<Router>;
  let confirmationMock: jasmine.SpyObj<ConfirmationService>;
  let messageServiceMock: jasmine.SpyObj<MessageService>;

  let usersSubject: Subject<any[]>;
  let projectsSubject: Subject<any[]>;
  let tasksSubject: Subject<any[]>;

  beforeEach(async () => {

    usersSubject = new Subject<any[]>();
    projectsSubject = new Subject<any[]>();
    tasksSubject = new Subject<any[]>();

    userServiceMock = jasmine.createSpyObj('UserService', [
      'GetAllUsers',
      'PromoteUser'
    ], {
      AllUsers$: usersSubject.asObservable()
    });

    projectServiceMock = jasmine.createSpyObj('ProjectService', [
      'GetAllProject'
    ], {
      AllProjectObserver$: projectsSubject.asObservable()
    });

    taskServiceMock = jasmine.createSpyObj('TaskService', [
      'GetAllTaskOfProject'
    ], {
      ProjectTasks$: tasksSubject.asObservable(),
      AprojectTask: { next: jasmine.createSpy('next') }
    });

    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    confirmationMock = jasmine.createSpyObj('ConfirmationService', ['confirm']);
    messageServiceMock = jasmine.createSpyObj('MessageService', ['add']);

    userServiceMock.GetAllUsers.and.returnValue(of([]));
    userServiceMock.PromoteUser.and.returnValue(of({}));
    projectServiceMock.GetAllProject.and.returnValue(of([]));
    taskServiceMock.GetAllTaskOfProject.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: ProjectService, useValue: projectServiceMock },
        { provide: TaskService, useValue: taskServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: {} },
        { provide: ConfirmationService, useValue: confirmationMock },
        { provide: MessageService, useValue: messageServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
  });


  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load users and projects on init', () => {
    component.ngOnInit();

    usersSubject.next([{ Role: 'Employee' }]);
    projectsSubject.next([{ ProjectId: '1' }]);

    expect(userServiceMock.GetAllUsers).toHaveBeenCalled();
    expect(projectServiceMock.GetAllProject).toHaveBeenCalled();
    expect(component.Allusers.length).toBe(1);
    expect(component.AllProject.length).toBe(1);
  });


  it('should promote employee and refresh users', () => {
    component.PromoteEmp('1');

    expect(userServiceMock.PromoteUser).toHaveBeenCalledWith('1');
    expect(messageServiceMock.add).toHaveBeenCalled();
  });


  it('should open add project modal', () => {
    component.AddProjectModal();
    expect(component.openAddProject()).toBeTrue();
  });


  it('should close add project modal', () => {
    component.openAddProject.set(true);
    component.closeAddProjectModal();
    expect(component.openAddProject()).toBeFalse();
  });

  // ===========================
  // ✅ loadTask
  // ===========================
  it('should load tasks for project', () => {

    component.secondDiv = {
      nativeElement: { scrollIntoView: jasmine.createSpy('scrollIntoView') }
    } as any;

    const project = {
      ProjectId: '10',
      ProjectName: 'Test',
      AssignedManagerId: '5'
    };

    component.loadTask(project as any);

    tasksSubject.next([{ TaskId: '1' }]);

    expect(taskServiceMock.GetAllTaskOfProject).toHaveBeenCalled();
    expect(component.SingleProjectTask.length).toBe(1);
  });


  it('should navigate to task comment page', () => {
    component.onopencomment({ TaskId: '1' } as any);

    expect(routerMock.navigate).toHaveBeenCalled();
  });

 
  it('should open employee tasks', () => {
    const user = { Id: '1', Name: 'Test User', Email: 'test@test.com', PhoneNumber: '1234567890', Role: 'Employee' };

    component.openEmpTask(user as any);

    expect(component.SelectedUser).toEqual(user);
    expect(component.shouldOpenEmpTasks).toBeTrue();
  });


  it('should close employee tasks', () => {
    component.closeEmpTasks();

    expect(component.SelectedUser).toBeNull();
    expect(component.shouldOpenEmpTasks).toBeFalse();
  });
});
