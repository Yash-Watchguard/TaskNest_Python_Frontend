import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, BehaviorSubject } from 'rxjs';

import { ManagerDashboardComponent } from './manager-dashboard.component';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { Router, ActivatedRoute } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Project } from '../../models/project.model';
import { Task, TaskStatus, priority } from '../../models/task.model';

describe('ManagerDashboardComponent', () => {
  let component: ManagerDashboardComponent;
  let fixture: ComponentFixture<ManagerDashboardComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockActivatedRoute: any;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let projectsSubject: BehaviorSubject<Project[]>;
  let tasksSubject: BehaviorSubject<Task[]>;
  let mockProjects: Project[];
  let mockTasks: Task[];

  beforeEach(async () => {
    mockProjects = [
      {
        ProjectId: 'p-1',
        ProjectName: 'Project Alpha',
        ProjectDes: 'Desc',
        Deadline: new Date(),
        CreatedBy: 'admin',
        AssignedManagerId: 'mgr-1'
      }
    ];

    mockTasks = [
      {
        TaskId: 't-1',
        Title: 'Task 1',
        Description: 'Desc',
        AcceptanceCriteria: 'Done',
        Deadline: new Date(),
        TaskPriority: priority.Medium,
        TaskStatus: TaskStatus.Pending,
        AssignedTo: 'emp-1',
        ProjectId: 'p-1',
        CreatedBy: 'mgr-1'
      },
      {
        TaskId: 't-2',
        Title: 'Task 2',
        Description: 'Desc',
        AcceptanceCriteria: 'Done',
        Deadline: new Date(),
        TaskPriority: priority.High,
        TaskStatus: TaskStatus.Done,
        AssignedTo: 'emp-1',
        ProjectId: 'p-1',
        CreatedBy: 'mgr-1'
      }
    ];

    projectsSubject = new BehaviorSubject<Project[]>(mockProjects);
    tasksSubject = new BehaviorSubject<Task[]>(mockTasks);

    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'GetAssignedProject'
    ]);
    mockTaskService = jasmine.createSpyObj('TaskService', [
      'GetAllManagerProjectTask',
      'GetAllTaskOfProject',
      'deleteTask'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockActivatedRoute = { snapshot: { params: {} } };
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    Object.defineProperty(mockProjectService, 'projects$', {
      get: () => projectsSubject.asObservable()
    });
    Object.defineProperty(mockTaskService, 'allTaskOfManager$', {
      get: () => tasksSubject.asObservable()
    });
    Object.defineProperty(mockTaskService, 'ProjectTasks$', {
      get: () => projectsSubject.asObservable()
    });
    Object.defineProperty(mockTaskService, 'AprojectTask', {
      get: () => ({ next: jasmine.createSpy('next') })
    });

    mockProjectService.GetAssignedProject.and.returnValue(of(mockProjects));
    mockTaskService.GetAllManagerProjectTask.and.returnValue(of(mockTasks));
    mockTaskService.GetAllTaskOfProject.and.returnValue(of(mockTasks));
    mockTaskService.deleteTask.and.returnValue(
      of({
        status: 'ok',
        message: 'Task deleted'
      })
    );

    spyOn(localStorage, 'getItem').and.returnValue('user-1');

    await TestBed.configureTestingModule({
      imports: [ManagerDashboardComponent],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: TaskService, useValue: mockTaskService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ManagerDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load projects and tasks on init', () => {
    component.ngOnInit();

    expect(mockProjectService.GetAssignedProject).toHaveBeenCalledWith(
      'projects/assigned/user-1'
    );
    expect(mockTaskService.GetAllManagerProjectTask).toHaveBeenCalledWith(
      'projects/managers/user-1/tasks'
    );
  });

  it('should filter tasks by status', () => {
    component.ngOnInit();

    expect(component.alltodotask.length).toBe(1);
    expect(component.allDonetask.length).toBe(1);
    expect(component.allInProgresstask.length).toBe(0);
  });

  it('should load tasks for a specific project', () => {
    component.ngOnInit();

    component.loadTask(mockProjects[0]);

    expect(mockTaskService.GetAllTaskOfProject).toHaveBeenCalledWith(
      'creator/mgr-1/projects/p-1'
    );
    expect(component.projectId).toBe('p-1');
    expect(component.projectName).toBe('Project Alpha');
    expect(component.shouldLoad).toBeTrue();
  });

  it('should delete task and show success message', () => {
    component.ngOnInit();

    const deleteEvent = {
      taskId: 't-1',
      projectId: 'p-1',
      managerId: 'mgr-1',
      emdId: 'emp-1'
    };

    component.taskdelete(deleteEvent);

    expect(mockTaskService.deleteTask).toHaveBeenCalledWith(
      't-1',
      'p-1',
      'mgr-1',
      'emp-1'
    );
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Task Deleted Successfully',
      life: 3000
    });
  });

  it('should open add task modal', () => {
    component.openaddtask('p-1');

    expect(component.isaddtaskopen).toBeTrue();
    expect(component.ProjectIdforAddTask).toBe('p-1');
  });

  it('should close add task modal', () => {
    component.isaddtaskopen = true;
    component.ProjectIdforAddTask = 'p-1';

    component.oncloseaddtaskbox();

    expect(component.isaddtaskopen).toBeFalse();
    expect(component.ProjectIdforAddTask).toBe('');
    expect(mockProjectService.GetAssignedProject).toHaveBeenCalled();
  });
});
