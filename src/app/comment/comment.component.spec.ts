import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommentComponent } from './comment.component';
import { CommentService } from '../services/comment.service';
import { DatePipe } from '@angular/common';
import { of, Subject } from 'rxjs';
import { SimpleChange } from '@angular/core';

fdescribe('CommentComponent (Standalone)', () => {
  let component: CommentComponent;
  let fixture: ComponentFixture<CommentComponent>;
  let commentServiceMock: jasmine.SpyObj<CommentService>;
  let commentsSubject: Subject<any[]>;

  beforeEach(async () => {

    commentsSubject = new Subject<any[]>();

    commentServiceMock = jasmine.createSpyObj('CommentService', [
      'GetComments',
      'Addcomment'
    ], {
      comments$: commentsSubject.asObservable()
    });

    commentServiceMock.GetComments.and.returnValue(of([]));
    commentServiceMock.Addcomment.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [CommentComponent],
      providers: [
        { provide: CommentService, useValue: commentServiceMock },
        DatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CommentComponent);
    component = fixture.componentInstance;
  });


  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should call loadComments when task changes', () => {
    spyOn(component, 'loadComments');

    component.task = {
      TaskId: '1',
      ProjectId: '101',
      CreatedBy: 'Yash'
    } as any;

    component.ngOnChanges({
      task: new SimpleChange(null, component.task, true)
    });

    expect(component.loadComments).toHaveBeenCalled();
  });

  it('should call GetComments and update allcomments', () => {
    component.task = {
      TaskId: '1',
      ProjectId: '101',
      CreatedBy: 'Yash'
    } as any;

    component.loadComments();

    const mockComments = [{ id: 1, message: 'Test Comment' }];
    commentsSubject.next(mockComments);

    expect(commentServiceMock.GetComments).toHaveBeenCalled();
    expect(component.allcomments).toEqual(mockComments);
  });


  it('should call Addcomment and emit event when valid comment', () => {
    spyOn(component.commentAdded, 'emit');

    component.task = {
      TaskId: '1',
      ProjectId: '101',
      CreatedBy: 'Yash'
    } as any;

    component.newComment = 'New Comment';

    component.addComment();

    expect(commentServiceMock.Addcomment).toHaveBeenCalled();
    expect(component.commentAdded.emit).toHaveBeenCalled();
    expect(component.newComment).toBe('');
  });


  it('should NOT call Addcomment when comment is empty', () => {
    component.newComment = '   ';

    component.addComment();

    expect(commentServiceMock.Addcomment).not.toHaveBeenCalled();
  });

  it('should clear newComment', () => {
    component.newComment = 'Some text';
    component.clearComment();

    expect(component.newComment).toBe('');
  });

  it('should emit close event and reset values', () => {
    spyOn(component.close, 'emit');

    component.newComment = 'Hello';
    component.allcomments = [{ id: 1 } as any];

    component.closeDialog();

    expect(component.close.emit).toHaveBeenCalled();
    expect(component.newComment).toBe('');
    expect(component.allcomments.length).toBe(0);
  });


  it('should unsubscribe on destroy', () => {
    component.task = {
      TaskId: '1',
      ProjectId: '101',
      CreatedBy: 'Yash'
    } as any;

    component.loadComments();

    spyOn(component['commentSubscription']!, 'unsubscribe');

    component.ngOnDestroy();

    expect(component['commentSubscription']!.unsubscribe).toHaveBeenCalled();
  });

  it('should call closeDialog when backdrop clicked', () => {
    spyOn(component, 'closeDialog');

    const event = {
      target: 'same',
      currentTarget: 'same'
    } as any;

    component.onBackdropClick(event);

    expect(component.closeDialog).toHaveBeenCalled();
  });
});
