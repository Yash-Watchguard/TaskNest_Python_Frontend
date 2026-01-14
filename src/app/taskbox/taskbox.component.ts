import { Component, EventEmitter, inject, Inject, Input, Output } from '@angular/core';
import { Task, TaskStatus } from '../models/task.model';
import { NgClass, NgIf, DatePipe } from '@angular/common';
import { Button } from 'primeng/button';
import { Router, RouterLink, ActivatedRoute } from "@angular/router";
import { AuthService } from '../services/auth.service';
import { RouterOutlet } from "@angular/router";
import { user } from '../models/user.model';

@Component({
  selector: 'app-taskbox',
  imports: [NgClass, NgIf, DatePipe, RouterOutlet],
  templateUrl: './taskbox.component.html',
  styleUrl: './taskbox.component.scss'
})
export class TaskboxComponent {
  authservice=inject(AuthService)
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  @Input() task!: Task;
  @Input() projectName!:string;
  TaskStatus = TaskStatus;

  @Output() statusChange = new EventEmitter<{ taskId: string;projectId:string;managerId:string; taskStatus: TaskStatus }>();
  @Output() openComments = new EventEmitter<Task>();
  @Output() deleteTask=new EventEmitter<{taskId:string;projectId:string;managerId:string;emdId:string;}>();

  isOverdue(deadline: Date): boolean {
    return new Date(deadline) < new Date();
  }
  
  userobject:string|null=localStorage.getItem('user')
  user:user|null=this.userobject?JSON.parse(this.userobject):null
  onStart() {
   
    this.statusChange.emit({ taskId: this.task.TaskId,projectId:this.task.ProjectId,managerId:this.task.CreatedBy, taskStatus: TaskStatus.InProgress });
  }

  onComplete() {
    this.statusChange.emit({ taskId: this.task.TaskId,projectId:this.task.ProjectId,managerId:this.task.CreatedBy, taskStatus: TaskStatus.Done });
  }
  onReview(){
    this.statusChange.emit({taskId: this.task.TaskId,projectId:this.task.ProjectId,managerId:this.task.CreatedBy,taskStatus:TaskStatus.InReview})
  }

  goBack(){
    let updatedStatus: TaskStatus | undefined;

  switch (this.task.TaskStatus) {
    case TaskStatus.InProgress:
      updatedStatus = TaskStatus.Pending;
      break;
    case TaskStatus.InReview:
      updatedStatus = TaskStatus.InProgress;
      break;
    case TaskStatus.Done:
      updatedStatus = TaskStatus.InReview;
      break;
  }

  if (!updatedStatus) return;

  this.statusChange.emit({
    taskId: this.task.TaskId,
    projectId: this.task.ProjectId,
    managerId: this.task.CreatedBy,
    taskStatus: updatedStatus
  });

  }
  
  opencomment(){
   
    this.openComments.emit(this.task)
  }
  onclick(){
      // if(event.target==event.currentTarget){
      //   // localStorage.setItem('selectedTask', JSON.stringify(this.task));
      //   this.router.navigate(['../task', 'details'], { relativeTo: this.route, state:{task:this.task} });
      // }
      this.openComments.emit(this.task)
  }
  deletetask(){
      this.deleteTask.emit({taskId: this.task.TaskId , projectId:this.task.ProjectId,managerId:this.task.CreatedBy,emdId:this.task.AssignedTo});
  }
}
