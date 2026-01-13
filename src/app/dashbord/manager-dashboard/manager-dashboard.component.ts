import {
  Component,
  ElementRef,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { NgIf } from '@angular/common';
import { Observable } from 'rxjs';

import { Task, TaskStatus } from '../../models/task.model';
import { ProjectboxComponent } from '../../projectbox/projectbox.component';
import { TaskboxComponent } from '../../taskbox/taskbox.component';

import { AddtaskComponent } from '../../addtask/addtask.component';
import { ProjectService } from '../../services/project.service';
import { TaskService } from '../../services/task.service';
import { Project } from '../../models/project.model';
import { MessageService } from 'primeng/api';
import { Toast } from "primeng/toast";
import { LoaderComponent } from "../../loader/loader.component";
@Component({
  selector: 'app-manager-dashboard',
  standalone: true, // Use standalone component for modern Angular
  imports: [ProjectboxComponent, TaskboxComponent, AddtaskComponent, NgIf, Toast, LoaderComponent],
  templateUrl: './manager-dashboard.component.html',
  styleUrl: './manager-dashboard.component.scss',
  providers:[MessageService]
})
export class ManagerDashboardComponent implements OnInit {
  @ViewChild('secondDiv') secondDiv!: ElementRef;

  assignedProjects: Project[] = [];
  alltodotask: Task[] = [];
  allInProgresstask: Task[] = [];
  allDonetask: Task[] = [];
  SingleProjectTask: Task[] = [];
  inReview:Task[] =[];

  isaddtaskopen = false;
  shouldLoad: boolean = false;

  ProjectIdforAddTask = '';
  projectId: string = '';
  userId: string|null='';

  projects$!: Observable<Project[]>;

  tasks$!: Observable<Task[]>;
  TaskOfSingleProect$!: Observable<Task[]>;

  isaddtask = signal(false);

  projectName:string='';

  projectLoader:boolean=false;
  taskLoader:boolean=false;

  constructor(
    private projectservice: ProjectService,
    private taskservce: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    private messageService:MessageService
  ) {}

  ngOnInit(): void {
    this.projects$ = this.projectservice.projects$;
    this.tasks$ = this.taskservce.allTaskOfManager$;
    this.userId = localStorage.getItem('userId');
    this.projectLoader=true;


    
    this.projectservice.GetAssignedProject(`projects/assigned/${this.userId}`).subscribe({

      next: (response) => {
        console.log(response);
        this.projectLoader=false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });

    this.projects$.subscribe((projects) => {
      this.assignedProjects = projects;
    });

    this.taskservce
      .GetAllManagerProjectTask(`projects/managers/${this.userId}/tasks`)
      .subscribe({
        next: () => {
          console.log('Task get successfully');
        },
        error: () => {
          console.log('error occored');
        },
      });

    this.tasks$.subscribe((task) => {
      this.allDonetask = task.filter((t) => t.TaskStatus === TaskStatus.Done);
      this.allInProgresstask = task.filter(
        (t) => t.TaskStatus === TaskStatus.InProgress
      );
      this.alltodotask = task.filter(
        (t) => t.TaskStatus === TaskStatus.Pending
      );
      this.inReview = task.filter((t)=>t.TaskStatus ==TaskStatus.InReview)
    });
  }

  loadTask(project:Project): void {
    
    this.taskLoader=true;
    
    if (this.projectId != project.ProjectId) {
      this.taskservce.AprojectTask.next([]);
      this.projectId = project.ProjectId;
      this.projectName=project.ProjectName;
    } else {
      this.projectId = project.ProjectId;
    }

    this.shouldLoad = true;
    setTimeout(() => {
      this.secondDiv.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 0);
    this.TaskOfSingleProect$ = this.taskservce.ProjectTasks$;
    this.taskservce
      .GetAllTaskOfProject(`creator/${project.AssignedManagerId}/projects/${project.ProjectId}`)
      .subscribe({
        next: () => {
          this.taskLoader=false;
          console.log('success');
        },
        error: (err: HttpErrorResponse) => {
          console.log(err);
          this.taskLoader=false;
        },
      });
    this.TaskOfSingleProect$.subscribe({
      next: (response) => {
        this.SingleProjectTask = response;
      },
    });
  }

  onopencomment(task: Task): void {
    this.router.navigate(['../task'], {
      relativeTo: this.route,
      state: { task: task },
    });
  }

  taskdelete(event: { taskId: string;
    projectId: string;
    managerId: string;
    emdId: string;}): void {
    this.taskservce.deleteTask(event.taskId, event.projectId,event.managerId,event.emdId).subscribe({
      next: () => {
              this.shouldLoad=false;
              this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Task Deleted Successfully',
          life: 3000,
        });
      },
      error: () => {
        console.log('error in deleting the task');
      },
    });
  }

  openaddtask(projectId: string): void {
    this.ProjectIdforAddTask = projectId;
    this.isaddtaskopen = true;
  }

  oncloseaddtaskbox(): void {
    this.ProjectIdforAddTask = '';
    this.isaddtaskopen = false;
    this.projectservice.GetAssignedProject(`projects/assigned/${this.userId}`).subscribe()
  }

}
