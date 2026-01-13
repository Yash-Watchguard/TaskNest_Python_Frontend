import { Component, OnInit } from '@angular/core';
import { NgForOf } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';

import { Observable } from 'rxjs';

import { Task, TaskStatus } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { TaskboxComponent } from '../../taskbox/taskbox.component';
import { CommentComponent } from '../../comment/comment.component';
import { LoaderComponent } from "../../loader/loader.component";

@Component({
  selector: 'app-employeedashboard',
  imports: [TaskboxComponent, NgForOf, CommentComponent, NgIf, LoaderComponent],
  templateUrl: './employeedashboard.component.html',
  styleUrls: ['./employeedashboard.component.scss'],
})
export class EmployeedashboardComponent implements OnInit {
  userId: string | null = localStorage.getItem('userId');
  private tasks$!: Observable<Task[]>;
  todo: Task[] = [];
  inProgress: Task[] = [];
  inReview:Task[] = [];
  done: Task[] = [];

  selectedTask: Task | null = null;

  showComments = false;

  showLoader:boolean=false;

  constructor(
    private taskservice: TaskService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.showLoader=true;
    
    const userstring = localStorage.getItem('user');
    const user = userstring ? JSON.parse(userstring) : null;
    this.tasks$ = this.taskservice.tasks$;
    const userId = localStorage.getItem('userId');
    this.taskservice.GetTasks(`employees/${userId}/tasks`).subscribe({
      next: (response) => {
        this.showLoader=false;
        console.log(response);
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
    this.tasks$.subscribe((task) => {
      console.log(task)
      this.todo = task.filter((t) => t.TaskStatus == "Pending");
      this.inProgress = task.filter(
        (t) => t.TaskStatus == "In Progress"
      );
      this.inReview = task.filter((t)=>t.TaskStatus == TaskStatus.InReview)
      this.done = task.filter((t) => t.TaskStatus == "Done");
    });
  }

  onclickupdate(status: string): void {}

  onStatusChange(event: { taskId: string; taskStatus: TaskStatus },task:Task): void {
    const { taskId, taskStatus } = event;
    
    this.taskservice
      .UpdateStatus(`projects/${task.ProjectId}/tasks/${task.TaskId}/manager/${task.CreatedBy}/update`, taskStatus)
      .subscribe({
        next: () => {
          console.log('task updated success');
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
        },
      });
  }

  onopencomment(task: Task): void {

    this.router.navigate(['../task'], {
      relativeTo: this.route,
      state: { task: task },
    });
  }

  closecommentbox(): void {
    this.showComments = false;
    this.selectedTask = null;
  }
}
