import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { Observable, Subscription } from 'rxjs';

import { Task } from '../models/task.model';
import { comment } from '../models/comment.model';
import { CommentService } from '../services/comment.service';


@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.scss',
  providers: [DatePipe]
})

export class CommentComponent implements OnChanges, OnDestroy{
  @Input() task: Task|null = null;
  @Input() isOpen = false;

  @Output() close = new EventEmitter<void>();
  @Output() commentAdded = new EventEmitter<void>();

  allcomments: comment[] = [];
  
  private comments$!:Observable<comment[]>;

  newComment = '';

  private commentSubscription?: Subscription;

  constructor(private datePipe: DatePipe, private commentservice:CommentService) {}

  ngOnChanges(changes: SimpleChanges): void {
    this.allcomments = [];
    if (changes['task'] && this.task?.TaskId) {
      this.loadComments();
    }
  }

  loadComments(): void {
      this.comments$=this.commentservice.comments$;
      this.commentservice.GetComments(`projects/${this.task?.ProjectId}/tasks/${this.task?.TaskId}/comments`)
      .subscribe({
        next:(response)=>{
          console.log(response);
        },
        error:(err:HttpErrorResponse)=>{
          console.log(err);
        }
      });
      if (this.commentSubscription) {
        this.commentSubscription.unsubscribe();
      }
      this.commentSubscription = this.comments$.subscribe(comments=>{
        this.allcomments = comments;
      });
  }

  addComment(): void {
    if (this.newComment.trim()) {

      this.commentservice.Addcomment(`projects/${this.task?.ProjectId}/tasks/${this.task?.TaskId}/comments`,this.newComment, this.task?.CreatedBy as string).subscribe({
        next:response=>{
          console.log("added");
        },
        error:(res:HttpErrorResponse)=>{
           console.log(res);
        }
      })
       this.newComment = '';
       this.commentAdded.emit();
    }
  }

  clearComment(): void {
    this.newComment = '';
  }

  closeDialog(): void {
    this.close.emit();
    this.allcomments =[];
    this.newComment = '';
    if (this.commentSubscription) {
      this.commentSubscription.unsubscribe();
      this.commentSubscription = undefined;
    }
  }

  ngOnDestroy(): void {
    if (this.commentSubscription) {
      this.commentSubscription.unsubscribe();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDialog();
    }
  }
  
}
