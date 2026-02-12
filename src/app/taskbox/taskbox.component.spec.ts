import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskboxComponent } from './taskbox.component';
import { Task, TaskStatus, priority } from '../models/task.model';

describe('TaskboxComponent', () => {
  let component: TaskboxComponent;
  let fixture: ComponentFixture<TaskboxComponent>;
  let mockTask: Task;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskboxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskboxComponent);
    component = fixture.componentInstance;
    mockTask = {
      TaskId: 't-1',
      Title: 'Sample Task',
      Description: 'Sample Desc',
      AcceptanceCriteria: 'Done',
      Deadline: new Date(Date.now() + 86400000),
      TaskPriority: priority.Medium,
      TaskStatus: TaskStatus.Pending,
      AssignedTo: 'emp-1',
      ProjectId: 'p-1',
      CreatedBy: 'mgr-1'
    };
    component.task = mockTask;
    component.projectName = 'Project Alpha';
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit status change when starting a task', () => {
    spyOn(component.statusChange, 'emit');

    component.onStart();

    expect(component.statusChange.emit).toHaveBeenCalledWith({
      taskId: 't-1',
      projectId: 'p-1',
      managerId: 'mgr-1',
      taskStatus: TaskStatus.InProgress
    });
  });

  it('should emit status change when completing a task', () => {
    spyOn(component.statusChange, 'emit');

    component.onComplete();

    expect(component.statusChange.emit).toHaveBeenCalledWith({
      taskId: 't-1',
      projectId: 'p-1',
      managerId: 'mgr-1',
      taskStatus: TaskStatus.Done
    });
  });

  it('should emit open comments event', () => {
    spyOn(component.openComments, 'emit');

    component.opencomment();

    expect(component.openComments.emit).toHaveBeenCalledWith(mockTask);
  });

  it('should emit delete task event', () => {
    spyOn(component.deleteTask, 'emit');

    component.deletetask();

    expect(component.deleteTask.emit).toHaveBeenCalledWith({
      taskId: 't-1',
      projectId: 'p-1',
      managerId: 'mgr-1',
      emdId: 'emp-1'
    });
  });

  it('should mark past dates as overdue', () => {
    const pastDate = new Date(Date.now() - 86400000);

    expect(component.isOverdue(pastDate)).toBeTrue();
  });
});
