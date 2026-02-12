import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';

import { AddtaskComponent } from './addtask.component';
import { TaskService } from '../services/task.service';
import { UserService } from '../services/user.service';

describe('AddtaskComponent', () => {
  let component: AddtaskComponent;
  let fixture: ComponentFixture<AddtaskComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let messageServiceSpy: jasmine.SpyObj<MessageService>;

  beforeEach(async () => {
    const taskServiceMock = jasmine.createSpyObj('TaskService', ['addTask']);
    const userServiceMock = jasmine.createSpyObj('UserService', ['GetAllEmployee']);
    const messageServiceMock = jasmine.createSpyObj('MessageService', ['add']);

    await TestBed.configureTestingModule({
      imports: [FormsModule, AutoCompleteModule, ToastModule, AddtaskComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: UserService, useValue: userServiceMock },
        { provide: MessageService, useValue: messageServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddtaskComponent);
    component = fixture.componentInstance;
    component.ProjectId = 'test-project-id';
    
    taskServiceSpy = TestBed.inject(TaskService) as jasmine.SpyObj<TaskService>;
    userServiceSpy = TestBed.inject(UserService) as jasmine.SpyObj<UserService>;
    messageServiceSpy = TestBed.inject(MessageService) as jasmine.SpyObj<MessageService>;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty empList initially', () => {
    expect(component.empList).toEqual([]);
  });

  it('should have priority items (Low, Medium, High)', () => {
    expect(component.items).toEqual(['Low', 'Medium', 'High']);
  });

  it('should have isaddtasktrue signal set to true', () => {
    expect(component.isaddtasktrue()).toBeTrue();
  });

  it('should have count initialized to 0', () => {
    expect(component.count).toBe(0);
  });

  it('should emit closepopup when close is called', () => {
    spyOn(component.closepopup, 'emit');
    component.close();
    expect(component.closepopup.emit).toHaveBeenCalled();
  });

  it('should load employees on ngOnInit', () => {
    const mockEmployees = {
      status: 'success',
      message: 'Employees fetched',
      data: [
        { Id: '1', Name: 'Employee 1', Email: 'emp1@test.com', PhoneNumber: '123', Role: 'EMPLOYEE' }
      ]
    };
    userServiceSpy.GetAllEmployee.and.returnValue(of(mockEmployees));

    component.ngOnInit();

    expect(userServiceSpy.GetAllEmployee).toHaveBeenCalled();
    expect(component.empList).toEqual(mockEmployees.data);
  });

  it('should handle error when loading employees', () => {
    userServiceSpy.GetAllEmployee.and.returnValue(throwError(() => new Error('Error')));
    const spyLog = spyOn(console, 'log');

    component.ngOnInit();

    expect(userServiceSpy.GetAllEmployee).toHaveBeenCalled();
  });

  it('should prevent default for non-allowed keys', () => {
    const event = new KeyboardEvent('keydown', { key: 'a' });
    spyOn(event, 'preventDefault');
    component.onKeyDown(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should not prevent default for Backspace key', () => {
    const event = new KeyboardEvent('keydown', { key: 'Backspace' });
    spyOn(event, 'preventDefault');
    component.onKeyDown(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should not prevent default for Delete key', () => {
    const event = new KeyboardEvent('keydown', { key: 'Delete' });
    spyOn(event, 'preventDefault');
    component.onKeyDown(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should not prevent default for Tab key', () => {
    const event = new KeyboardEvent('keydown', { key: 'Tab' });
    spyOn(event, 'preventDefault');
    component.onKeyDown(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should not prevent default for Escape key', () => {
    const event = new KeyboardEvent('keydown', { key: 'Escape' });
    spyOn(event, 'preventDefault');
    component.onKeyDown(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should not prevent default for ArrowLeft key', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
    spyOn(event, 'preventDefault');
    component.onKeyDown(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should not prevent default for ArrowRight key', () => {
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
    spyOn(event, 'preventDefault');
    component.onKeyDown(event);
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('should call addTask service when adding new task', () => {
    taskServiceSpy.addTask.and.returnValue(of({}));
    component.titel = 'Test Task';
    component.destcription = 'Test Description';
    component.acceptance_criteria = 'Test Criteria';
    component.employeeId = 'emp1';
    component.date = '2026-12-31';
    component.priority = 'High';

    component.addnewtask();

    expect(taskServiceSpy.addTask).toHaveBeenCalled();
  });

  it('should show success message on successful task add', () => {
    taskServiceSpy.addTask.and.returnValue(of({}));
    component.titel = 'New Task';

    component.addnewtask();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'success',
        detail: 'Task Added Successfully'
      })
    );
  });

  it('should show error message on failed task add', () => {
    taskServiceSpy.addTask.and.returnValue(throwError(() => new Error('Error')));
    component.titel = 'New Task';

    component.addnewtask();

    expect(messageServiceSpy.add).toHaveBeenCalledWith(
      jasmine.objectContaining({
        severity: 'error',
        detail: 'Task Add Fail'
      })
    );
  });

  it('should set isaddtasktrue to false before adding task', () => {
    taskServiceSpy.addTask.and.returnValue(of({}));

    component.addnewtask();

    expect(component.isaddtasktrue()).toBeTrue();
  });

  it('should update titel field when set', () => {
    component.titel = 'New Title';
    expect(component.titel).toBe('New Title');
  });

  it('should update description field when set', () => {
    component.destcription = 'New Description';
    expect(component.destcription).toBe('New Description');
  });

  it('should update priority field when set', () => {
    component.priority = 'Medium';
    expect(component.priority).toBe('Medium');
  });

  it('should update employeeId field when set', () => {
    component.employeeId = 'emp123';
    expect(component.employeeId).toBe('emp123');
  });
});
