import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmployeedashboardComponent } from './employeedashboard.component';
import { TaskService } from '../../services/task.service';
import { Router, ActivatedRoute } from '@angular/router';
import { of, Subject } from 'rxjs';
import { Task, TaskStatus, priority } from '../../models/task.model';

fdescribe('EmployeedashboardComponent (Standalone)', () => {
  let component: EmployeedashboardComponent;
  let fixture: ComponentFixture<EmployeedashboardComponent>;

  let taskServiceMock: jasmine.SpyObj<TaskService>;
  let routerMock: jasmine.SpyObj<Router>;
  let activatedRouteMock: jasmine.SpyObj<ActivatedRoute>;

  let tasksSubject: Subject<Task[]>;

  beforeEach(async () => {
    tasksSubject = new Subject<Task[]>();

    taskServiceMock = jasmine.createSpyObj('TaskService', [
      'GetTasks',
      'UpdateStatus'
    ], {
      tasks$: tasksSubject.asObservable()
    });

    routerMock = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteMock = {} as jasmine.SpyObj<ActivatedRoute>;

    taskServiceMock.GetTasks.and.returnValue(of([]));
    taskServiceMock.UpdateStatus.and.returnValue(of({}));

    // Set up localStorage mock
    spyOn(localStorage, 'getItem').and.callFake((key: string) => {
      if (key === 'userId') return '123';
      if (key === 'user') return JSON.stringify({ Id: '123', Name: 'Test User' });
      return null;
    });

    await TestBed.configureTestingModule({
      imports: [EmployeedashboardComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EmployeedashboardComponent);
    component = fixture.componentInstance;
  });

  // ===========================
  // ✅ Component Creation
  // ===========================
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  // ===========================
  // ✅ ngOnInit
  // ===========================
  it('should load tasks and categorize them on init', () => {
    const mockTasks: Task[] = [
      {
        TaskId: '1',
        Title: 'Task 1',
        Description: 'Description 1',
        AcceptanceCriteria: 'Criteria 1',
        Deadline: new Date(),
        TaskPriority: priority.Low,
        TaskStatus: TaskStatus.Pending,
        AssignedTo: '123',
        ProjectId: 'P1',
        CreatedBy: 'M1'
      },
      {
        TaskId: '2',
        Title: 'Task 2',
        Description: 'Description 2',
        AcceptanceCriteria: 'Criteria 2',
        Deadline: new Date(),
        TaskPriority: priority.Medium,
        TaskStatus: TaskStatus.InProgress,
        AssignedTo: '123',
        ProjectId: 'P1',
        CreatedBy: 'M1'
      },
      {
        TaskId: '3',
        Title: 'Task 3',
        Description: 'Description 3',
        AcceptanceCriteria: 'Criteria 3',
        Deadline: new Date(),
        TaskPriority: priority.Low,
        TaskStatus: TaskStatus.Done,
        AssignedTo: '123',
        ProjectId: 'P1',
        CreatedBy: 'M1'
      }
    ];

    component.ngOnInit();

    tasksSubject.next(mockTasks);

    expect(taskServiceMock.GetTasks).toHaveBeenCalledWith('employees/123/tasks');
    expect(component.todo.length).toBe(1);
    expect(component.inProgress.length).toBe(1);
    expect(component.done.length).toBe(1);
    expect(component.showLoader).toBeFalse();
  });

 
  it('should update task status', () => {
    const task: Task = {
      TaskId: '1',
      Title: 'Task 1',
      Description: 'Description 1',
      AcceptanceCriteria: 'Criteria 1',
      Deadline: new Date(),
      TaskPriority: priority.Low,
      TaskStatus: TaskStatus.Pending,
      AssignedTo: '123',
      ProjectId: 'P1',
      CreatedBy: 'M1'
    };

    const event = { taskId: '1', taskStatus: TaskStatus.InProgress };

    component.onStatusChange(event, task);

    expect(taskServiceMock.UpdateStatus).toHaveBeenCalledWith(
      'projects/P1/tasks/1/manager/M1/update',
      TaskStatus.InProgress
    );
  });


  it('should navigate to task comment page', () => {
    const task: Task = {
      TaskId: '1',
      Title: 'Task 1',
      Description: 'Description 1',
      AcceptanceCriteria: 'Criteria 1',
      Deadline: new Date(),
      TaskPriority: priority.Low,
      TaskStatus: TaskStatus.Pending,
      AssignedTo: '123',
      ProjectId: 'P1',
      CreatedBy: 'M1'
    };

    component.onopencomment(task);

    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['../task'],
      {
        relativeTo: activatedRouteMock,
        state: { task: task }
      }
    );
  });


  it('should close comment box', () => {
    component.showComments = true;
    component.selectedTask = {
      TaskId: '1',
      Title: 'Task 1',
      Description: 'Description 1',
      AcceptanceCriteria: 'Criteria 1',
      Deadline: new Date(),
      TaskPriority: priority.Low,
      TaskStatus: TaskStatus.Pending,
      AssignedTo: '123',
      ProjectId: 'P1',
      CreatedBy: 'M1'
    };

    component.closecommentbox();

    expect(component.showComments).toBeFalse();
    expect(component.selectedTask).toBeNull();
  });

  it('should initialize with userId from localStorage', () => {
    expect(component.userId).toBe('123');
  });

  it('should initialize task arrays as empty', () => {
    expect(component.todo).toEqual([]);
    expect(component.inProgress).toEqual([]);
    expect(component.done).toEqual([]);
  });

  it('should initialize with showComments as false', () => {
    expect(component.showComments).toBeFalse();
  });

  it('should initialize with selectedTask as null', () => {
    expect(component.selectedTask).toBeNull();
  });


  it('should filter tasks correctly by status', () => {
    const mockTasks: Task[] = [
      {
        TaskId: '1',
        Title: 'Pending Task',
        Description: 'Description',
        AcceptanceCriteria: 'Criteria',
        Deadline: new Date(),
        TaskPriority: priority.Low,
        TaskStatus: TaskStatus.Pending,
        AssignedTo: '123',
        ProjectId: 'P1',
        CreatedBy: 'M1'
      },
      {
        TaskId: '2',
        Title: 'Another Pending Task',
        Description: 'Description',
        AcceptanceCriteria: 'Criteria',
        Deadline: new Date(),
        TaskPriority: priority.Medium,
        TaskStatus: TaskStatus.Pending,
        AssignedTo: '123',
        ProjectId: 'P1',
        CreatedBy: 'M1'
      }
    ];

    component.ngOnInit();
    tasksSubject.next(mockTasks);

    expect(component.todo.length).toBe(2);
    expect(component.inProgress.length).toBe(0);
    expect(component.done.length).toBe(0);
  });
});
