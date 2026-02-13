import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  Output,
} from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';

import { MessageService } from 'primeng/api';
import { Toast } from 'primeng/toast';

import { person } from '../models/user.model';
import { AddProjectRequest } from '../models/project.model';
import { ProjectService } from '../services/project.service';

@Component({
  selector: 'app-addproject',
  imports: [FormsModule, Toast],
  templateUrl: './addproject.component.html',
  styleUrl: './addproject.component.scss',
})
export class AddprojectComponent implements OnDestroy {

  constructor(
    private projectservice: ProjectService,
    private messageservice: MessageService
  ) {}

  ProjectDetails: AddProjectRequest = {
    projectName: '',
    projectDescription: '',
    deadline: '',
    assignedManagerId: '',
  };

  isButtonDisabled: boolean = true;

  @Input({ required: true }) managerList: person[] = [];
  @Output() CloseModal = new EventEmitter();

  CloseAddProject() {
    this.CloseModal.emit();
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

  AddProject(addProjet: NgForm): void {
    this.projectservice.Addproject(this.ProjectDetails).subscribe({
      next: () => {
        this.messageservice.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Project added successfully',
        });
        this.projectservice.GetAllProject().subscribe({
          error: (err: HttpErrorResponse) => {
            console.log(err);
          },
        });
        addProjet.resetForm();
      },
      error: () => {
        this.messageservice.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Project add failed',
        });
        addProjet.resetForm();
      },
    });
  }

  getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  ngOnDestroy() {}
  
}
