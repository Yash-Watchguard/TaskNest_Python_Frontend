import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { UserProjectTaskComponent } from './user-project-task.component';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ProjectService } from '../services/project.service';
import { TaskService } from '../services/task.service';
import { UserService } from '../services/user.service';
import { person } from '../models/user.model';
import { Task, TaskStatus, priority } from '../models/task.model';
import { Project } from '../models/project.model';

describe('UserProjectTaskComponent', () => {
  let component: UserProjectTaskComponent;
  let fixture: ComponentFixture<UserProjectTaskComponent>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockUserService: jasmine.SpyObj<UserService>;

  beforeEach(async () => {
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'GetAssignedProject',
      'UpdateProject'
    ]);
    mockTaskService = jasmine.createSpyObj('TaskService', [
      'GetTasks',
      'EditTask',
      'GetAllTaskOfProject',
      'deleteTask'
    ]);
    mockUserService = jasmine.createSpyObj('UserService', [
      'GetAllEmployee',
      'GetAllUsers',
      'Deleteuser'
    ]);

    mockUserService.GetAllEmployee.and.returnValue(
      of({ status: 'ok', message: 'ok', data: [] })
    );
    mockUserService.GetAllUsers.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [UserProjectTaskComponent],
      providers: [
        { provide: MessageService, useValue: mockMessageService },
        { provide: Router, useValue: mockRouter },
        { provide: ProjectService, useValue: mockProjectService },
        { provide: TaskService, useValue: mockTaskService },
        { provide: UserService, useValue: mockUserService }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(UserProjectTaskComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks for an employee on init', () => {
    const mockUser: person = {
      Id: 'emp-1',
      Name: 'Sam',
      Email: 'sam@example.com',
      PhoneNumber: '9999999999',
      Role: 'Employee'
    };

    const tasks: Task[] = [
      {
        TaskId: 't1',
        Title: 'Task 1',
        Description: 'Desc',
        AcceptanceCriteria: 'Done',
        Deadline: new Date(),
        TaskPriority: priority.Medium,
        TaskStatus: TaskStatus.Pending,
        AssignedTo: 'emp-1',
        ProjectId: 'p1',
        CreatedBy: 'mgr-1'
      }
    ];

    spyOnProperty(history, 'state', 'get').and.returnValue({ user: mockUser });
    mockTaskService.GetTasks.and.returnValue(of(tasks));
    mockUserService.GetAllEmployee.and.returnValue(
      of({ status: 'ok', message: 'ok', data: [mockUser] })
    );
    mockUserService.GetAllUsers.and.returnValue(of([]));

    component.ngOnInit();

    expect(mockTaskService.GetTasks).toHaveBeenCalledWith('employees/emp-1/tasks');
    expect(component.Tasks).toEqual(tasks);
    expect(component.loadEmployee).toBeTrue();
    expect(component.loadManager).toBeFalse();
  });

  it('should load projects for a manager on init', () => {
    const mockUser: person = {
      Id: 'mgr-1',
      Name: 'Alex',
      Email: 'alex@example.com',
      PhoneNumber: '8888888888',
      Role: 'Manager'
    };

    const projects: Project[] = [
      {
        ProjectId: 'p1',
        ProjectName: 'Project 1',
        ProjectDes: 'Desc',
        Deadline: new Date(),
        CreatedBy: 'mgr-1',
        AssignedManagerId: 'mgr-1'
      }
    ];

    spyOnProperty(history, 'state', 'get').and.returnValue({ user: mockUser });
    mockProjectService.GetAssignedProject.and.returnValue(of(projects));
    mockUserService.GetAllEmployee.and.returnValue(
      of({ status: 'ok', message: 'ok', data: [] })
    );
    mockUserService.GetAllUsers.and.returnValue(of([]));

    component.ngOnInit();

    expect(mockProjectService.GetAssignedProject)
      .toHaveBeenCalledWith('projects/assigned/mgr-1');
    expect(component.Projects).toEqual(projects);
    expect(component.loadManager).toBeTrue();
    expect(component.loadEmployee).toBeFalse();
  });

  it('should open and close the employee list for a task', () => {
    const task: Task = {
      TaskId: 't2',
      Title: 'Task 2',
      Description: 'Desc',
      AcceptanceCriteria: 'Done',
      Deadline: new Date(),
      TaskPriority: priority.Low,
      TaskStatus: TaskStatus.InProgress,
      AssignedTo: 'emp-2',
      ProjectId: 'p2',
      CreatedBy: 'mgr-2'
    };

    component.toggleEmployeeList(task);

    expect(component.openEmployeeListFor).toBe('t2');
    expect(component.selectedTask).toBe(task);

    component.closeEmployeeModal();

    expect(component.openEmployeeListFor).toBeNull();
    expect(component.selectedTask).toBeNull();
  });
});
