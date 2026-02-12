import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditTaskComponent } from './edit-task.component';
import { UserService } from '../services/user.service';
import { TaskService } from '../services/task.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { Task, TaskStatus, priority, EditTask } from '../models/task.model';
import { getAllUsersApiRes, person } from '../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';

fdescribe('EditTaskComponent (Standalone)', () => {
  let component: EditTaskComponent;
  let fixture: ComponentFixture<EditTaskComponent>;

  let userServiceMock: jasmine.SpyObj<UserService>;
  let taskServiceMock: jasmine.SpyObj<TaskService>;
  let messageServiceMock: jasmine.SpyObj<MessageService>;

  const mockTask: Task = {
    TaskId: '1',
    Title: 'Test Task',
    Description: 'Test Description',
    AcceptanceCriteria: 'Test Criteria',
    Deadline: new Date('2026-03-01'),
    TaskPriority: priority.High,
    TaskStatus: TaskStatus.Pending,
    AssignedTo: 'emp123',
    ProjectId: 'proj1',
    CreatedBy: 'manager1'
  };

  const mockEmployees: person[] = [
    { Id: 'emp1', Name: 'Employee 1', Email: 'emp1@test.com', PhoneNumber: '1234567890', Role: 'Employee' },
    { Id: 'emp2', Name: 'Employee 2', Email: 'emp2@test.com', PhoneNumber: '0987654321', Role: 'Employee' }
  ];

  beforeEach(async () => {
    userServiceMock = jasmine.createSpyObj('UserService', ['GetAllEmployee']);
    taskServiceMock = jasmine.createSpyObj('TaskService', [
      'EditTask',
      'GetAllManagerProjectTask',
      'GetAllTaskOfProject'
    ]);
    messageServiceMock = jasmine.createSpyObj('MessageService', ['add']);

    const employeeResponse: getAllUsersApiRes = {
      status: 'success',
      message: 'Employees retrieved',
      data: mockEmployees
    };

    userServiceMock.GetAllEmployee.and.returnValue(of(employeeResponse));
    taskServiceMock.EditTask.and.returnValue(of({}));
    taskServiceMock.GetAllManagerProjectTask.and.returnValue(of([]));
    taskServiceMock.GetAllTaskOfProject.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [EditTaskComponent],
      providers: [
        { provide: UserService, useValue: userServiceMock },
        { provide: TaskService, useValue: taskServiceMock }
      ]
    })
    .overrideComponent(EditTaskComponent, {
      set: {
        providers: [
          { provide: MessageService, useValue: messageServiceMock }
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTaskComponent);
    component = fixture.componentInstance;
    component.task = mockTask;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with task data on init', () => {
    component.ngOnInit();

    expect(component.titel).toBe('Test Task');
    expect(component.description).toBe('Test Description');
    expect(component.acceptanceCriteria).toBe('Test Criteria');
    expect(component.empId).toBe('emp123');
    expect(component.task_priority).toBe(priority.High);
  });

  it('should load employee list on init', () => {
    component.ngOnInit();

    expect(userServiceMock.GetAllEmployee).toHaveBeenCalled();
    expect(component.empList.length).toBe(2);
    expect(component.empList).toEqual(mockEmployees);
  });

  it('should handle error when loading employees', () => {
    const errorResponse = new HttpErrorResponse({ error: 'Error', status: 500 });
    userServiceMock.GetAllEmployee.and.returnValue(throwError(() => errorResponse));

    component.ngOnInit();

    expect(userServiceMock.GetAllEmployee).toHaveBeenCalled();
  });

  it('should allow navigation keys in onKeyDown', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    spyOn(event, 'preventDefault');

    component.onKeyDown(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should prevent default for non-navigation keys in onKeyDown', () => {
    const event = new KeyboardEvent('keydown', { key: 'a' });
    spyOn(event, 'preventDefault');

    component.onKeyDown(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should allow Backspace key in onKeyDown', () => {
    const event = new KeyboardEvent('keydown', { key: 'Backspace' });
    spyOn(event, 'preventDefault');

    component.onKeyDown(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should detect changes when title is modified', () => {
    component.ngOnInit();
    component.titel = 'Modified Title';

    expect(component.isedit()).toBeTrue();
  });

  it('should detect changes when description is modified', () => {
    component.ngOnInit();
    component.description = 'Modified Description';

    expect(component.isedit()).toBeTrue();
  });

  it('should detect changes when acceptance criteria is modified', () => {
    component.ngOnInit();
    component.acceptanceCriteria = 'Modified Criteria';

    expect(component.isedit()).toBeTrue();
  });

  it('should detect changes when assigned employee is modified', () => {
    component.ngOnInit();
    component.empId = 'emp456';

    expect(component.isedit()).toBeTrue();
  });

  it('should detect changes when priority is modified', () => {
    component.ngOnInit();
    component.task_priority = priority.Low;

    expect(component.isedit()).toBeTrue();
  });

  it('should return false when no changes are made', () => {
    component.ngOnInit();

    expect(component.isedit()).toBeFalse();
  });

  it('should edit task successfully', () => {
    component.ngOnInit();
    component.titel = 'Updated Task';
    component.description = 'Updated Description';

    component.editTask();

    const expectedEditTask: EditTask = {
      titel: 'Updated Task',
      description: 'Updated Description',
      acceptanceCriteria: 'Test Criteria',
      task_priority: priority.High,
      deadline: '',
      empId: 'emp123'
    };

    expect(taskServiceMock.EditTask).toHaveBeenCalledWith(
      'projects/proj1/tasks/1/manager/manager1/update',
      expectedEditTask
    );
    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Task edited successfully'
    });
  });

  it('should emit editSuccess on successful edit', () => {
    spyOn(component.editSuccess, 'emit');
    component.ngOnInit();

    component.editTask();

    expect(component.editSuccess.emit).toHaveBeenCalled();
  });

  it('should refresh manager tasks after successful edit', () => {
    component.ngOnInit();

    component.editTask();

    expect(taskServiceMock.GetAllManagerProjectTask).toHaveBeenCalledWith(
      'projects/managers/manager1/tasks'
    );
  });

  it('should refresh project tasks after successful edit', () => {
    component.ngOnInit();

    component.editTask();

    expect(taskServiceMock.GetAllTaskOfProject).toHaveBeenCalledWith(
      'creator/manager1/projects/proj1'
    );
  });

  it('should handle error when editing task fails', () => {
    const errorResponse = new HttpErrorResponse({ 
      error: () => 'Edit failed', 
      status: 400 
    });
    taskServiceMock.EditTask.and.returnValue(throwError(() => errorResponse));
    component.ngOnInit();

    component.editTask();

    expect(messageServiceMock.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: jasmine.any(String)
    });
  });

  it('should emit closeSignal when close is called', () => {
    spyOn(component.closeSignal, 'emit');

    component.close();

    expect(component.closeSignal.emit).toHaveBeenCalled();
  });

  it('should initialize deadline as empty string', () => {
    component.ngOnInit();

    expect(component.deadline).toBe('');
  });

  it('should preserve task priority as string', () => {
    component.ngOnInit();
    component.task_priority = priority.Medium;

    expect(component.task_priority).toBe(priority.Medium);
  });
});
