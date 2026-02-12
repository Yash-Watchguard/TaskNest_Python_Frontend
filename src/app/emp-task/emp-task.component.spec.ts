import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpTaskComponent } from './emp-task.component';
import { TaskService } from '../services/task.service';
import { UserService } from '../services/user.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Task, TaskStatus, priority } from '../models/task.model';
import { person } from '../models/user.model';
import { SimpleChange } from '@angular/core';

fdescribe('EmpTaskComponent (Standalone)', () => {
  let component: EmpTaskComponent;
  let fixture: ComponentFixture<EmpTaskComponent>;

  let taskServiceMock: jasmine.SpyObj<TaskService>;
  let userServiceMock: jasmine.SpyObj<UserService>;
  let routerMock: jasmine.SpyObj<Router>;
  let activatedRouteMock: jasmine.SpyObj<ActivatedRoute>;

  const mockUser: person = {
    Id: 'emp123',
    Name: 'John Doe',
    Email: 'john@test.com',
    PhoneNumber: '1234567890',
    Role: 'Employee'
  };

  const mockTasks: Task[] = [
    {
      TaskId: '1',
      Title: 'Task 1',
      Description: 'Description 1',
      AcceptanceCriteria: 'Criteria 1',
      Deadline: new Date('2026-03-01'),
      TaskPriority: priority.High,
      TaskStatus: TaskStatus.Pending,
      AssignedTo: 'emp123',
      ProjectId: 'proj1',
      CreatedBy: 'manager1'
    },
    {
      TaskId: '2',
      Title: 'Task 2',
      Description: 'Description 2',
      AcceptanceCriteria: 'Criteria 2',
      Deadline: new Date('2026-03-15'),
      TaskPriority: priority.Medium,
      TaskStatus: TaskStatus.InProgress,
      AssignedTo: 'emp123',
      ProjectId: 'proj1',
      CreatedBy: 'manager1'
    }
  ];

  beforeEach(async () => {
    taskServiceMock = jasmine.createSpyObj('TaskService', ['GetEmpTask']);
    userServiceMock = jasmine.createSpyObj('UserService', ['GetAllEmployee']);
    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteMock = {} as jasmine.SpyObj<ActivatedRoute>;

    taskServiceMock.GetEmpTask.and.returnValue(of(mockTasks));

    await TestBed.configureTestingModule({
      imports: [EmpTaskComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmpTaskComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should load user tasks on init when user is provided', () => {
    component.user = mockUser;

    component.ngOnInit();

    expect(taskServiceMock.GetEmpTask).toHaveBeenCalledWith('employees/emp123/tasks');
    expect(component.tasks.length).toBe(2);
    expect(component.tasks).toEqual(mockTasks);
    expect(component.taskloader).toBeFalse();
  });

  it('should not load tasks on init when user is null', () => {
    component.user = null;

    component.ngOnInit();

    expect(taskServiceMock.GetEmpTask).not.toHaveBeenCalled();
  });

  it('should load user tasks on changes when user is provided', () => {
    component.user = mockUser;

    component.ngOnChanges();

    expect(taskServiceMock.GetEmpTask).toHaveBeenCalledWith('employees/emp123/tasks');
    expect(component.tasks.length).toBe(2);
  });

  it('should not load tasks on changes when user is null', () => {
    component.user = null;

    component.ngOnChanges();

    expect(taskServiceMock.GetEmpTask).not.toHaveBeenCalled();
  });

  it('should set taskloader to true while loading tasks', () => {
    component.user = mockUser;
    component.taskloader = false;
    taskServiceMock.GetEmpTask.and.returnValue(of(mockTasks).pipe(delay(10)));

    component.loadUserTasks();

    expect(component.taskloader).toBeTrue();
  });

  it('should set taskloader to false after successfully loading tasks', () => {
    component.user = mockUser;

    component.loadUserTasks();

    expect(component.taskloader).toBeFalse();
  });

  it('should handle error when loading tasks fails', () => {
    const error = { message: 'Failed to load tasks' };
    taskServiceMock.GetEmpTask.and.returnValue(throwError(() => error));
    spyOn(console, 'error');

    component.user = mockUser;
    component.loadUserTasks();

    expect(console.error).toHaveBeenCalledWith('Error loading tasks:', error);
    expect(component.tasks).toEqual([]);
    expect(component.taskloader).toBeFalse();
  });

  it('should emit closePopup event when close is called', () => {
    spyOn(component.closePopup, 'emit');

    component.close();

    expect(component.closePopup.emit).toHaveBeenCalled();
  });

  it('should navigate to task comment page when onopencomment is called', () => {
    const task = mockTasks[0];

    component.onopencomment(task);

    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['../task'],
      {
        relativeTo: activatedRouteMock,
        state: { task: task }
      }
    );
  });

  it('should initialize with empty tasks array', () => {
    expect(component.tasks).toEqual([]);
  });

  it('should handle multiple task loads correctly', () => {
    component.user = mockUser;

    component.loadUserTasks();
    expect(component.tasks.length).toBe(2);

    const newTasks: Task[] = [mockTasks[0]];
    taskServiceMock.GetEmpTask.and.returnValue(of(newTasks));

    component.loadUserTasks();
    expect(component.tasks.length).toBe(1);
  });

  it('should use user Id in API call', () => {
    const differentUser: person = {
      Id: 'emp456',
      Name: 'Jane Doe',
      Email: 'jane@test.com',
      PhoneNumber: '0987654321',
      Role: 'Employee'
    };
    component.user = differentUser;

    component.loadUserTasks();

    expect(taskServiceMock.GetEmpTask).toHaveBeenCalledWith('employees/emp456/tasks');
  });

  it('should navigate with correct task state', () => {
    const specificTask: Task = {
      TaskId: '99',
      Title: 'Specific Task',
      Description: 'Specific Description',
      AcceptanceCriteria: 'Specific Criteria',
      Deadline: new Date('2026-04-01'),
      TaskPriority: priority.Low,
      TaskStatus: TaskStatus.Done,
      AssignedTo: 'emp123',
      ProjectId: 'proj2',
      CreatedBy: 'manager2'
    };

    component.onopencomment(specificTask);

    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['../task'],
      {
        relativeTo: activatedRouteMock,
        state: { task: specificTask }
      }
    );
  });
});
