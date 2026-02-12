import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommentService } from '../services/comment.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comment',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnChanges, OnDestroy {
  @Input() task: any;
  @Input() isOpen: boolean = false;
  @Output() commentAdded = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();

  allcomments: any[] = [];
  newComment: string = '';
  private commentSubscription?: Subscription;

  constructor(private commentService: CommentService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['task'] && this.task) {
      this.loadComments();
    }
  }

  loadComments(): void {
    if (this.task) {
      this.commentSubscription = this.commentService.comments$.subscribe(comments => {
        this.allcomments = comments;
      });
      this.commentService.GetComments(`${this.task.ProjectId}/${this.task.TaskId}`);
    }
  }

  addComment(): void {
    if (this.newComment.trim()) {
      this.commentService.Addcomment(`${this.task.ProjectId}/${this.task.TaskId}`, this.newComment, this.task.CreatedBy).subscribe(() => {
        this.commentAdded.emit();
        this.newComment = '';
      });
    }
  }

  clearComment(): void {
    this.newComment = '';
  }

  closeDialog(): void {
    this.close.emit();
    this.allcomments = [];
    this.newComment = '';
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeDialog();
    }
  }

  ngOnDestroy(): void {
    if (this.commentSubscription) {
      this.commentSubscription.unsubscribe();
    }
  }
}
