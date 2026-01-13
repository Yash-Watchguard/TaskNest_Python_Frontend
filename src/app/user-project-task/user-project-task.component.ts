import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { getAllUsersApiRes, getUsersApiRes, person, Role } from '../models/user.model';
import { Task } from '../models/task.model';
import { Project } from '../models/project.model';
import { ProjectService } from '../services/project.service';
import { TaskService } from '../services/task.service';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { Toast } from "primeng/toast";
import { MessageService } from 'primeng/api';
import { LoaderComponent } from "../loader/loader.component";

@Component({
  selector: 'app-user-project-task',
  imports: [CommonModule, Toast, LoaderComponent],
  templateUrl: './user-project-task.component.html',
  styleUrl: './user-project-task.component.scss',
  providers:[MessageService]
})
export class UserProjectTaskComponent implements OnInit {
  user: person | null = null;

  Tasks:Task[]=[];



  empList:person[]=[];
  AllUsers:person[]=[];


  Projects:Project[]=[];

  loadEmployee:boolean=false;
  loadManager:boolean=false;
  showEmployees:boolean=false;

  openEmployeeListFor: string | null = null;
  selectedTask: Task | null = null;
  selectedProject: Project | null = null;

  task:Task|null=null;
  project:Project|null=null;

  isLoad:boolean=false;

  constructor(private messageService:MessageService,private router: Router,private projectService:ProjectService,private taskService:TaskService,private userService:UserService) {}

  ngOnInit(): void {
  this.isLoad=true;
  this.user = history.state['user'] ?? null;
  console.log("User from state:", this.user);
    console.log(this.user)
    if(this.user?.Role=='Manager'){
       this.loadProject();
       this.loadManager=true;
    }else{
         this.loadTask();
         this.loadEmployee=true;
    }

    this.userService.GetAllEmployee().subscribe({
          next: (response: getAllUsersApiRes) => {
            this.empList = response.data.filter(emp=> emp.Id!==this.user?.Id);
          },
          error: (err: HttpErrorResponse) => {
            console.log(err);
          },
        });

    this.userService.GetAllUsers().subscribe({
          next: (resposnse:person[]) => {
        console.log('all userss retrived successfully');
        this.AllUsers=resposnse.filter(u=>u.Role==='Manager' && u.Id!==this.user?.Id);
      },
      error: () => {
        console.log('error got');
      },
    });

  }

  loadTask():void{
     this.taskService.GetTasks(`employees/${this.user?.Id}/tasks`).subscribe({
      next: (response) => {
        this.isLoad=false;
        console.log(response);
        this.Tasks=response
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.isLoad=false;
      },
    });
  }

  loadProject():void{
      this.projectService.GetAssignedProject(`projects/assigned/${this.user?.Id}`).subscribe({
      next: (response) => {
        console.log(response);
        this.Projects=response
        this.isLoad=false;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
        this.isLoad=false;
      },
    });
  }
  reassignTask(taskId: string | undefined, empId: string) {
    console.log("Reassign:", taskId, "->", empId);

    // TODO: Call your API here to perform reassignment
   const updatedDetails: any = {
        
         empId: empId,
       };
       this.taskService
         .EditTask(`projects/${this.task?.ProjectId}/tasks/${this.task?.TaskId}/manager/${this.task?.CreatedBy}/update`, updatedDetails)
        .subscribe({
        next: () => {
          this.Tasks=this.Tasks.filter(task=>task.TaskId!=this.task?.TaskId)
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Employee updated',
          });
        },
        error: (err: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `${err.error()}`,
          });
        },
      });

   

    

    // Close modal and clear selection
    this.openEmployeeListFor = null;
    this.selectedTask = null;
  }

  reassignProject(projectId: string | undefined, mgrId: string) {
    console.log('Reassign Project:', projectId, '->', mgrId);
    // TODO: Call API to reassign project to new manager
    const updatedDetails: any = {
        
         "Assigned_manager" : mgrId,
       };
       this.projectService.UpdateProject(`projects/${this.project?.ProjectId}/creator/${this.project?.CreatedBy}/managers/${this.project?.AssignedManagerId}/updateproject`,updatedDetails).subscribe(
      {
        next:()=>{
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Manager updated',
            life:2000
          });
          this.Projects=this.Projects.filter((p)=>p.ProjectId!=this.project?.ProjectId)
          let allTask:Task[]=[];
          this.taskService.GetAllTaskOfProject(`creator/${this.project?.AssignedManagerId}/projects/${this.project?.ProjectId}`)
      .subscribe({
        next: (response) => {
          allTask=response;
          console.log('success');
        },
        error: (err: HttpErrorResponse) => {
          
        },
      });

      allTask.forEach(task=>{
        
       this.taskService.deleteTask(this.task?.TaskId as string,this.task?.ProjectId as string,this.task?.CreatedBy as string,this.task?.AssignedTo as string).subscribe()
      })

        }
      })
    this.openEmployeeListFor = null;
    this.selectedProject = null;
  }

  onDeleteTask(delete_task:Task): void{
    this.taskService.deleteTask(delete_task?.TaskId as string,delete_task?.ProjectId as string,delete_task?.CreatedBy as string,delete_task?.AssignedTo as string)
    .subscribe({
        next: () => {
          this.Tasks=this.Tasks.filter(task=>task.TaskId!=delete_task?.TaskId)
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Task deleted Successfully',
          });
        },
        error: (err: HttpErrorResponse) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `${err.error()}`,
          });
        },
      });
  }

  toggleEmployeeList(task: Task) {
    this.task=task;
    const taskId = task?.TaskId;
    if (!taskId) return;
    const opening = this.openEmployeeListFor !== taskId;
    this.openEmployeeListFor = opening ? taskId : null;
    this.selectedTask = opening ? task : null;
  }

  toggleProjectList(project: Project) {
    this.project=project;
    const projectId = (project as any)?.ProjectId;
    if (!projectId) return;
    const opening = this.openEmployeeListFor !== projectId;
    this.openEmployeeListFor = opening ? projectId : null;
    this.selectedProject = opening ? project : null;
    // clear other selection
    if (opening) this.selectedTask = null;
  }

  closeEmployeeModal() {
    this.openEmployeeListFor = null;
    this.selectedTask = null;
  }

  goBack(): void {
    window.history.back();
  }

  deleteUser():void{
    this.userService.Deleteuser(this.user?.Id as string, this.user?.Email as string).subscribe({
      next:()=>{
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'User deleted Successfully',
            life:1000
          });
          setTimeout(() => {
            this.goBack()
          }, 1000);
      },
      
    })
  }


}
