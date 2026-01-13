import {
  Component,
  ElementRef,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { InputText } from 'primeng/inputtext';
import { Toast } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Tooltip } from 'primeng/tooltip';
import { ConfirmDialog } from 'primeng/confirmdialog';

import { Observable } from 'rxjs';

import { AddprojectComponent } from '../../addproject/addproject.component';
import { TaskService } from '../../services/task.service';
import { Task } from '../../models/task.model';
import { TaskboxComponent } from '../../taskbox/taskbox.component';
import { ProjectboxComponent } from '../../projectbox/projectbox.component';
import { Project } from '../../models/project.model';
import { UserComponent } from '../../user/user.component';
import { UserService } from '../../services/user.service';
import { ProjectService } from '../../services/project.service';
import { person, user } from '../../models/user.model';
import { EmpTaskComponent } from '../../emp-task/emp-task.component';
import { LoaderComponent } from '../../loader/loader.component';

@Component({
  selector: 'app-admin-dashboard',
  imports: [
    Tooltip,
    ProjectboxComponent,
    CommonModule,
    UserComponent,
    Toast,
    AddprojectComponent,
    TaskboxComponent,
    EmpTaskComponent,
    ConfirmDialog,
    LoaderComponent
],
providers:[ConfirmationService],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
})
export class AdminDashboardComponent implements OnInit {
  constructor(
    private userservice: UserService,
    private projectservice: ProjectService,
    private taskservice: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    private confirmationService:ConfirmationService
  ) {}

  Allusers: person[] = [];
  EmployeeList: person[] = [];
  is:boolean=true;
  ManagersList: person[] = [];

  AllProject: Project[] = [];

  SingleProjectTask: Task[] = [];

  private userobserver$!: Observable<person[]>;
  private AllProjectObserver$!: Observable<Project[]>;
  TaskOfSingleProect$!: Observable<Task[]>;

  openAddProject = signal(false);

  shouldLoad: boolean = false;
  shouldOpenEmpTasks = false;
  SelectedUser!: person | null;

  projectId: string = '';
  projectName: string='';

  @ViewChild('secondDiv') secondDiv!: ElementRef;

  messageservice = inject(MessageService);
  ngOnInit(): void {
    this.userobserver$ = this.userservice.AllUsers$;
    this.userservice.GetAllUsers().subscribe({
      next: (res) => {
        console.log('all userss retrived successfully');
      },
      error: () => {
        console.log('error got');
      },
    });
    this.userobserver$.subscribe((response) => {
      this.Allusers = response.sort((a, b) => {
        if (a.Role == 'Manager' && b.Role == 'Employee') {
          return 1;
        }

        if (a.Role === 'Employee' && b.Role === 'Manager') {
          return -1;
        }

        return 0;
      });
      this.EmployeeList = response.filter((user) => user.Role === 'Employee');
      this.ManagersList = response.filter((user) => user.Role === 'Manager');
    });
    this.AllProjectObserver$ = this.projectservice.AllProjectObserver$;
    this.projectservice.GetAllProject().subscribe({
      next: (res) => {
        console.log(res);
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
    this.AllProjectObserver$.subscribe((projects) => {
      this.AllProject = projects;
    });
  }


  PromoteEmp(userId: string): void {
    this.userservice.PromoteUser(userId).subscribe({
      next: () => {
        this.messageservice.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User Promoted Successfully',
          life: 3000,
        });
        this.userservice.GetAllUsers().subscribe({
          error: () => {},
        });
      },
      error: (err: HttpErrorResponse) => {
        // Assuming promotion might succeed despite error, refresh the list
       this.messageservice.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User Promoted Successfully',
          life: 3000,
        });
        this.userservice.GetAllUsers().subscribe({
          error: () => {},
        });
      },
    });
  }

  Deleteuser(user:person): void {

    this.confirmationService.confirm({
      header: 'Are you sure?',
      message: 'Please confirm to proceed.',
      accept: () => {
        
            this.router.navigate(['projecttask'], { state: { user: user } });
      }
    });

  }

  AddProjectModal(): void {
    this.openAddProject.set(true);
  }

  projectDeleted(isDesleted:boolean):void{
    this.messageservice.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Project deleted Successfully',
        });
  }

  closeAddProjectModal(): void {
    this.openAddProject.set(false);
  }
  taskLoader:boolean=false
  loadTask(project:Project): void {
    this.taskLoader=true;
    

    if (this.projectId != project.ProjectId) {
      this.taskservice.AprojectTask.next([]);
      this.projectId = project.ProjectId;
      this.projectName=project.ProjectName;
    } else {
      this.projectId = project.ProjectId;
      this.projectName=project.ProjectName;
    }

    this.shouldLoad = true;
    setTimeout(() => {
      this.secondDiv.nativeElement.scrollIntoView({ behavior: 'smooth' });
    }, 0);
    this.TaskOfSingleProect$ = this.taskservice.ProjectTasks$;
    this.taskservice
      .GetAllTaskOfProject(`creator/${project.AssignedManagerId}/projects/${project.ProjectId}`)
      .subscribe({
        next: () => {
          this.taskLoader=false;
        },
        error: (err: HttpErrorResponse) => {
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

  openEmpTask(user: person): void {
    this.SelectedUser = user;
    this.shouldOpenEmpTasks = true;
  }

  closeEmpTasks(): void {
    this.shouldOpenEmpTasks = false;
    this.SelectedUser = null;
  }
}
