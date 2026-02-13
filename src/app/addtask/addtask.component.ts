import {
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  Output,
  signal,
  StreamingResourceOptions,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';

import { AutoCompleteModule } from 'primeng/autocomplete';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { getAllUsersApiRes, person } from '../models/user.model';
import { TaskService } from '../services/task.service';
import { UserService } from '../services/user.service';
import { AddTask} from '../models/task.model';

@Component({
  selector: 'app-addtask',
  imports: [FormsModule, AutoCompleteModule, ToastModule],
  templateUrl: './addtask.component.html',
  styleUrl: './addtask.component.scss',
})
export class AddtaskComponent {
 
  messageservice = inject(MessageService);
  constructor(
    private taskservice: TaskService,
    private userservice: UserService,
  ) {}
  empList:person[]=[];

  items: any[] = ['Low', 'Medium', 'High'];

  @Input({ required: true }) ProjectId!: string;
  
  @Output() closepopup = new EventEmitter();

  titel= '';
  destcription= '';
  acceptance_criteria = '';
  employeeId= '';
  date='';
  priority!: string;
  
  isaddtasktrue = signal<boolean>(true);
  count = 0;
  

  close() {
    this.closepopup.emit();
  }

  ngOnInit() {
      this.userservice.GetAllEmployee().subscribe({
        next:(response:getAllUsersApiRes)=>{
          this.empList=response.data;
        },
        error:(err:HttpErrorResponse)=>{
          console.log(err);
        }
      });
  }
  
  addnewtask(): void {
    this.isaddtasktrue.set(false);
    const taskdetails: AddTask = {
      title: this.titel,
      description: this.destcription,
      acceptance_criteria: this.acceptance_criteria,
      deadline: this.date,
      priority: this.priority,
      assigned_to: this.employeeId,
    };
    if (this.count == 0) {
      this.count++;
      this.taskservice.addTask(this.ProjectId, taskdetails).subscribe({
        next: (response) => {
          this.isaddtasktrue.set(true);
          this.count--;

          // Clear the form
          this.titel = '';
          this.destcription = '';
          this.acceptance_criteria = '';
          this.employeeId = '';
          this.date = '';
          this.priority = '';

          this.messageservice.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Task Added Successfully',
          });
        },
        error: (err: HttpErrorResponse) => {
          this.isaddtasktrue.set(true);
          this.count--;
          this.messageservice.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Task Add Fail',
          });
        },
      });
    }
  }

  onKeyDown(event: KeyboardEvent): void {
    if (
      [
        'Backspace',
        'Delete',
        'Tab',
        'Escape',
        'ArrowLeft',
        'ArrowRight',
      ].includes(event.key)
    ) {
      return;
    }
    event.preventDefault();
  }

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
}
