import { inject, Injectable } from '@angular/core';
import { InjectSetupWrapper } from '@angular/core/testing';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import {
  AddTask,
  EditTask,
  priority,
  Task,
  TaskApiResponse,
  TaskStatus,
} from '../models/task.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ProjectService } from './project.service';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private projectservice = inject(ProjectService);

  private userId: string | null = localStorage.getItem('userId');

  private httpClient = inject(HttpClient);
  private taskObject = new BehaviorSubject<Task[]>([]);
  public tasks$ = this.taskObject.asObservable();

  private ProjecttaskObject = new BehaviorSubject<Task[]>([]);
  public allTaskOfManager$ = this.ProjecttaskObject.asObservable();

  // Task of a particular project

   baseUrl= 'http://13.232.31.88:8000/'
  baseUrl2= 'http://13.232.31.88:8000/'
  AprojectTask = new BehaviorSubject<Task[]>([]);
  public ProjectTasks$ = this.AprojectTask.asObservable();
  private gettaskurl = '';
  GetTasks(url: string) {
    this.gettaskurl = url;
    return this.httpClient.get<TaskApiResponse>(this.baseUrl2+url).pipe(
      map((response) => {
        return response.data.map(
          (t) =>
            ({
              TaskId: t.task_id,
              Title: t.title,
              Description: t.description,
              AcceptanceCriteria: t.acceptance_criteria,
              Deadline: new Date(t.deadline),
              TaskPriority: t.taskpriority as priority,
              TaskStatus: t.taskstatus as TaskStatus,
              AssignedTo: t.assigned_to,
              ProjectId: t.project_id,
              CreatedBy: t.created_by,
            } as Task)
        );
      }),
      tap((tasks) => {
        this.taskObject.next(tasks);
      })
    );
  }

  UpdateStatus(url: string, update: string) {
    return this.httpClient
      .patch(this.baseUrl2+url, {
        status: update,
      })
      .pipe(
        tap((response) => {
          this.GetTasks(this.gettaskurl).subscribe();
        })
      );
  }

  GetAllManagerProjectTask(url: string) {
    return this.httpClient.get<TaskApiResponse>(this.baseUrl2+url).pipe(
      map((response) => {
        return response.data.map(
          (t) =>
            ({
              TaskId: t.task_id,
              Title: t.title,
              Description: t.description,
              AcceptanceCriteria: t.acceptance_criteria,
              Deadline: new Date(t.deadline),
              TaskPriority: t.taskpriority as priority,
              TaskStatus: t.taskstatus as TaskStatus,
              AssignedTo: t.assigned_to,
              ProjectId: t.project_id,
              CreatedBy: t.created_by,
            } as Task)
        );
      }),
      tap((tasks) => {
        this.ProjecttaskObject.next(tasks);
      })
    );
  }

  GetAllTaskOfProject(url: string) {
    return this.httpClient.get<TaskApiResponse>(this.baseUrl2+url).pipe(
      map((response) => {
        return response.data.map(
          (t) =>
            ({
              TaskId: t.task_id,
              Title: t.title,
              Description: t.description,
              AcceptanceCriteria: t.acceptance_criteria,
              Deadline: new Date(t.deadline),
              TaskPriority: t.taskpriority as priority,
              TaskStatus: t.taskstatus as TaskStatus,
              AssignedTo: t.assigned_to,
              ProjectId: t.project_id,
              CreatedBy: t.created_by,
            } as Task)
        );
      }),
      tap((tasks) => {
        console.log(tasks)
        this.AprojectTask.next(tasks);
      })
    );
  }

  deleteTask(taskId: string, projectId: string,managerId:string,empId:string) {
    return this.httpClient
      .delete<{ status: string; message: string }>(
       this.baseUrl2+ `projects/${projectId}/tasks/${taskId}/manager/${managerId}/employee/${empId}/deletetask`
      )
      .pipe(
        tap((response) => {
          // call the getallmanagertask
          this.GetAllManagerProjectTask(
            `project/${this.userId}/tasks/manager`
          ).subscribe({
            next: (response) => {},
            error: () => {},
          });
          // call get allproject task
          this.GetAllTaskOfProject(`projects/${projectId}/tasks`).subscribe({
            next: (response) => {},
            error: () => {},
          });
          // update the projectstatus
          this.projectservice
            .GetProjectStatuas(`projects/status/${projectId}`)
            .subscribe({
              next: (response) => {},
              error: () => {},
            });
        })
      );
  }
  addTask(projectId: string | undefined, taskdata: AddTask) {
    return this.httpClient.post(this.baseUrl2+`projects/${projectId}/tasks`, taskdata).pipe(
      tap(() => {
        this.GetAllManagerProjectTask(
          `project/${this.userId}/tasks/manager`
        ).subscribe({
          next: (response) => {},
          error: () => {},
        });
        // call get allproject task
        this.GetAllTaskOfProject(`projects/${projectId}/tasks`).subscribe({
          next: (response) => {},
          error: () => {},
        });
      })
    );
  }

  EditTask(url: string, updatedTask: EditTask) {
    return this.httpClient.patch(this.baseUrl2+url, updatedTask);
  }
  // private AllTaskObserable=new BehaviorSubject<Task[]>([]);
  // AllTask$=this.AllTaskObserable.asObservable()
  // GetAllTask(){
  //   return this.httpClient.get<TaskApiResponse>().pipe(
  //       map((response)=>{
  //         return response.data.map((t)=>({
  //              TaskId: t.task_id,
  //         Title: t.title,
  //         Description: t.description,
  //         AcceptanceCriteria: t.acceptance_criteria,
  //         Deadline: new Date(t.deadline),
  //         TaskPriority: t.taskpriority as priority,
  //         TaskStatus: t.taskstatus as TaskStatus,
  //         AssignedTo: t.assigned_to,
  //         ProjectId: t.project_id,
  //         CreatedBy: t.created_by,
  //         })as Task);
  //       }),
  //       tap((tasks)=>{
  //         this.AllTaskObserable.next(tasks);
  //       })
  //     )
  // }

  GetEmpTask(url:string){
     return this.httpClient.get<TaskApiResponse>(this.baseUrl2+url).pipe(
      map((response) => {
        console.log('GetEmpTask response:', response);
        return response.data.map(
          (t) =>
            ({
              TaskId: t.task_id,
              Title: t.title,
              Description: t.description,
              AcceptanceCriteria: t.acceptance_criteria,
              Deadline: new Date(t.deadline),
              TaskPriority: t.taskpriority as priority,
              TaskStatus: t.taskstatus as TaskStatus,
              AssignedTo: t.assigned_to,
              ProjectId: t.project_id,
              CreatedBy: t.created_by,
            } as Task)
        );
      })
    );
  }
  GetSingleTask(url:string){
     return this.httpClient.get<TaskApiResponse>(this.baseUrl2+url).pipe(
      map((response) => {
        console.log('GetsingleTask response:', response);
        return response.data.map(
          (t) =>
            ({
              TaskId: t.task_id,
              Title: t.title,
              Description: t.description,
              AcceptanceCriteria: t.acceptance_criteria,
              Deadline: new Date(t.deadline),
              TaskPriority: t.taskpriority as priority,
              TaskStatus: t.taskstatus as TaskStatus,
              AssignedTo: t.assigned_to,
              ProjectId: t.project_id,
              CreatedBy: t.created_by,
            } as Task)
        );
      })
    );
  }
}
