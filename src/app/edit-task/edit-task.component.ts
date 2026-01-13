import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Toast } from 'primeng/toast';
import { EditTask, Task } from '../models/task.model';
import { DatePipe } from '@angular/common';
import { getAllUsersApiRes, person } from '../models/user.model';
import { UserService } from '../services/user.service';
import { HttpErrorResponse } from '@angular/common/http';
import { TaskService } from '../services/task.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-edit-task',
  imports: [Toast, FormsModule, DatePipe],
  templateUrl: './edit-task.component.html',
  styleUrl: './edit-task.component.scss',
  providers: [MessageService],
})
export class EditTaskComponent implements OnInit {
  @Input({ required: true }) task!: Task;
  @Output() closeSignal = new EventEmitter();
  @Output() editSuccess= new EventEmitter();
  empList: person[] = [];
  titel = '';
  description = '';
  acceptanceCriteria = '';
  task_priority = '';
  deadline = '';
  empId = '';

  constructor(
    private userservice: UserService,
    private taskservice: TaskService,
    private messagesevice: MessageService
  ) {}

  ngOnInit(): void {
    if (this.task) {
      this.titel = this.task.Title;
      this.description = this.task.Description;
      this.acceptanceCriteria = this.task.AcceptanceCriteria;
      this.deadline = '',
      this.empId = this.task.AssignedTo;
      this.task_priority = this.task.TaskPriority;
    }

    this.userservice.GetAllEmployee().subscribe({
      next: (response: getAllUsersApiRes) => {
        this.empList = response.data;
      },
      error: (err: HttpErrorResponse) => {
        console.log(err);
      },
    });
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

  isedit(): boolean {
    return (
      this.titel != this.task.Title ||
      this.description != this.task.Description ||
      this.acceptanceCriteria != this.task.AcceptanceCriteria ||
      this.empId != this.task.AssignedTo ||
      this.task_priority != this.task.TaskPriority
    );
  }

  editTask(): void {
    const updatedDetails: EditTask = {
      titel: this.titel,
      description: this.description,
      acceptanceCriteria: this.acceptanceCriteria,
      task_priority: this.task_priority,
      deadline: this.deadline,
      empId: this.empId,
    };
    this.taskservice
      .EditTask(`projects/${this.task.ProjectId}/tasks/${this.task.TaskId}/manager/${this.task.CreatedBy}/update`, updatedDetails)
      .subscribe({
        next: () => {
          this.editSuccess.emit();
          this.taskservice
            .GetAllManagerProjectTask(
              `projects/managers/${this.task.CreatedBy}/tasks`
            )
            .subscribe({
              next: (response) => {},
              error: (err: HttpErrorResponse) => {},
            });

          this.taskservice
            .GetAllTaskOfProject(`creator/${this.task.CreatedBy}/projects/${this.task.ProjectId}`)
            .subscribe({
              next: (response) => {},
              error: () => {},
            });
          this.messagesevice.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Task edited successfully',
          });
        },
        error: (err: HttpErrorResponse) => {
          this.messagesevice.add({
            severity: 'error',
            summary: 'Error',
            detail: `${err.error()}`,
          });
        },
      });
  }

  close(): void {
    this.closeSignal.emit();
  }
}
