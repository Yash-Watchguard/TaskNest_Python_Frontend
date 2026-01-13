import { Component, inject, OnChanges, OnInit, OnDestroy, SimpleChange, SimpleChanges } from '@angular/core';
import { Task, TaskStatus } from '../models/task.model';
import { Router } from '@angular/router';
import { CommonModule, DatePipe, NgClass } from "@angular/common";
import { CommentService } from '../services/comment.service';
import { Observable, Subscription } from 'rxjs';
import { comment } from '../models/comment.model';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { EditTaskComponent } from "../edit-task/edit-task.component";
import { user } from '../models/user.model';
import { TaskService } from '../services/task.service';


@Component({
  selector: 'app-task-details',
  standalone:true,
  imports: [DatePipe, FormsModule, CommonModule, EditTaskComponent],
  templateUrl: './task-details.component.html',
  styleUrl: './task-details.component.scss'
})
export class TaskDetailsComponent implements OnInit, OnDestroy{
  task!:Task;
  taskstatus=TaskStatus
   constructor(private router:Router , private taskService:TaskService){
    const navigation =this.router.getCurrentNavigation();
       const state=navigation?.extras.state as {task:Task};
       if(state?.task){
        localStorage.setItem('task',JSON.stringify(state.task));
       }
   }
   
   isOpenEditTask=false;

   private commentservice=inject(CommentService)
   private comments$!:Observable<comment[]>
   allcomments:comment[]=[];
   newComment='';
   private commentSubscription?: Subscription;

   userobject:string|null=localStorage.getItem('user')
   user:user|null=this.userobject?JSON.parse(this.userobject):null
   
   ngOnInit(){
     const taskobject=localStorage.getItem('task');
     this.task=JSON.parse(taskobject as string)
     this.allcomments = [];
     this.loadComments()
   }

  loadComments(): void {
      this.comments$=this.commentservice.comments$;
      this.commentservice.GetComments(`projects/${this.task.ProjectId}/tasks/${this.task?.TaskId}/comments`)
      .subscribe({
        next:(response)=>{
          console.log(response)
        },
        error:(err:HttpErrorResponse)=>{
          console.log(err)
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
     
      this.commentservice.Addcomment(`projects/${this.task.ProjectId}/tasks/${this.task?.TaskId}/comments`,this.newComment, this.task.CreatedBy).subscribe({
        next:response=>{
          console.log("added")
        },
        error:(res:HttpErrorResponse)=>{
           console.log(res)
        }
      })
       this.newComment = '';
    }
  }

  clearComment(): void {
    this.newComment = '';
  }

  ngOnDestroy(): void {
    if (this.commentSubscription) {
      this.commentSubscription.unsubscribe();
    }
    localStorage.removeItem('task')
  }
  OpenEditTaskBox():void{
    this.isOpenEditTask=true;
  }
  closeEditbox():void{
    this.isOpenEditTask=false;
  }

  goBack():void{
    window.history.back()
  }

  onSuccessfulledit():void{
      this.taskService.GetSingleTask(`creator/${this.task.CreatedBy}/projects/${this.task.ProjectId}/tasks/${this.task.TaskId}`).subscribe({
        next:(Response:Task[])=>{
          this.task=Response[0];
        }
      });
      this.closeEditbox()
  }
}

