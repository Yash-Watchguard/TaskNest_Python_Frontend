import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';

import { TaskDetailsComponent } from './task-details.component';
import { CommentService } from '../services/comment.service';
import { TaskService } from '../services/task.service';
import { Router } from '@angular/router';
import { comment } from '../models/comment.model';
import { Task, TaskStatus, priority } from '../models/task.model';

describe('TaskDetailsComponent', () => {
  let component: TaskDetailsComponent;
  let fixture: ComponentFixture<TaskDetailsComponent>;
  let mockCommentService: jasmine.SpyObj<CommentService>;
  let mockTaskService: jasmine.SpyObj<TaskService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let commentsSubject: BehaviorSubject<comment[]>;
  let mockTask: Task;

  beforeEach(async () => {
    mockTask = {
      TaskId: 't-1',
      Title: 'Sample Task',
      Description: 'Sample Desc',
      AcceptanceCriteria: 'Done',
      Deadline: new Date(),
      TaskPriority: priority.Medium,
      TaskStatus: TaskStatus.Pending,
      AssignedTo: 'emp-1',
      ProjectId: 'p-1',
      CreatedBy: 'mgr-1'
    };

    commentsSubject = new BehaviorSubject<comment[]>([]);
    mockCommentService = jasmine.createSpyObj(
      'CommentService',
      ['GetComments', 'Addcomment'],
      { comments$: commentsSubject.asObservable() }
    );
    mockTaskService = jasmine.createSpyObj('TaskService', ['GetSingleTask']);
    mockRouter = jasmine.createSpyObj('Router', ['getCurrentNavigation']);

    mockRouter.getCurrentNavigation.and.returnValue({
      extras: { state: { task: mockTask } }
    } as any);

    mockCommentService.GetComments.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [TaskDetailsComponent],
      providers: [
        { provide: CommentService, useValue: mockCommentService },
        { provide: TaskService, useValue: mockTaskService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    localStorage.removeItem('task');
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load task from localStorage and request comments on init', () => {
    localStorage.setItem('task', JSON.stringify(mockTask));

    component.ngOnInit();

    expect(component.task.TaskId).toBe('t-1');
    expect(component.task.ProjectId).toBe('p-1');
    expect(mockCommentService.GetComments).toHaveBeenCalledWith(
      'projects/p-1/tasks/t-1/comments'
    );
  });

  it('should update comments when comments$ emits', () => {
    localStorage.setItem('task', JSON.stringify(mockTask));

    component.ngOnInit();

    commentsSubject.next([
      { comment_id: 'c1', created_by: 'Sam', content: 'Hello' }
    ]);

    expect(component.allcomments.length).toBe(1);
    expect(component.allcomments[0].content).toBe('Hello');
  });

  it('should add a comment and clear the input', () => {
    component.task = mockTask;
    component.newComment = 'Nice work';
    mockCommentService.Addcomment.and.returnValue(of({}));

    component.addComment();

    expect(mockCommentService.Addcomment).toHaveBeenCalledWith(
      'projects/p-1/tasks/t-1/comments',
      'Nice work',
      'mgr-1'
    );
    expect(component.newComment).toBe('');
  });

  it('should open and close edit task box', () => {
    component.OpenEditTaskBox();
    expect(component.isOpenEditTask).toBeTrue();

    component.closeEditbox();
    expect(component.isOpenEditTask).toBeFalse();
  });

  it('should refresh task on successful edit and close edit box', () => {
    const updatedTask: Task = {
      ...mockTask,
      Title: 'Updated'
    };

    component.task = mockTask;
    component.isOpenEditTask = true;
    mockTaskService.GetSingleTask.and.returnValue(of([updatedTask]));

    component.onSuccessfulledit();

    expect(mockTaskService.GetSingleTask).toHaveBeenCalledWith(
      'creator/mgr-1/projects/p-1/tasks/t-1'
    );
    expect(component.task.Title).toBe('Updated');
    expect(component.isOpenEditTask).toBeFalse();
  });

  it('should unsubscribe and clear task on destroy', () => {
    localStorage.setItem('task', JSON.stringify(mockTask));
    spyOn(localStorage, 'removeItem');

    component.ngOnInit();

    const subscription = (component as any).commentSubscription as {
      unsubscribe: () => void;
    };
    spyOn(subscription, 'unsubscribe');

    component.ngOnDestroy();

    expect(subscription.unsubscribe).toHaveBeenCalled();
    expect(localStorage.removeItem).toHaveBeenCalledWith('task');
  });
});
