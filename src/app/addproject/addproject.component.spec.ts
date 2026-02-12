import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AddprojectComponent } from './addproject.component';
import { ProjectService } from '../services/project.service';
import { MessageService } from 'primeng/api';
import { person } from '../models/user.model';
import { HttpErrorResponse } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';

describe('AddprojectComponent', () => {
  let component: AddprojectComponent;
  let fixture: ComponentFixture<AddprojectComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockMessageService: jasmine.SpyObj<MessageService>;
  let mockManagerList: person[];

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'Addproject',
      'GetAllProject'
    ]);
    mockMessageService = jasmine.createSpyObj('MessageService', ['add']);

    mockManagerList = [
      {
        Id: 'm-1',
        Name: 'Alice',
        Email: 'alice@example.com',
        PhoneNumber: '9999999999',
        Role: 'Manager'
      },
      {
        Id: 'm-2',
        Name: 'Bob',
        Email: 'bob@example.com',
        PhoneNumber: '8888888888',
        Role: 'Manager'
      }
    ];

    mockProjectService.Addproject.and.returnValue(of({}));
    mockProjectService.GetAllProject.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [AddprojectComponent, FormsModule],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: MessageService, useValue: mockMessageService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddprojectComponent);
    component = fixture.componentInstance;
    component.managerList = mockManagerList;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should emit close event when closing modal', () => {
    spyOn(component.CloseModal, 'emit');

    component.CloseAddProject();

    expect(component.CloseModal.emit).toHaveBeenCalled();
  });

  it('should add project successfully', () => {
    component.ProjectDetails = {
      projectName: 'Project Alpha',
      projectDescription: 'Desc',
      deadline: '2026-03-12',
      assignedManagerId: 'm-1'
    };

    const mockForm = jasmine.createSpyObj('NgForm', ['resetForm']);

    component.AddProject(mockForm);

    expect(mockProjectService.Addproject).toHaveBeenCalledWith(
      component.ProjectDetails
    );
    expect(mockProjectService.GetAllProject).toHaveBeenCalled();
    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success',
      detail: 'Project added successfully'
    });
    expect(mockForm.resetForm).toHaveBeenCalled();
  });

  it('should show error on add project failure', () => {
    mockProjectService.Addproject.and.returnValue(
      throwError(() => new HttpErrorResponse({ status: 500 }))
    );

    component.ProjectDetails = {
      projectName: 'Project Alpha',
      projectDescription: 'Desc',
      deadline: '2026-03-12',
      assignedManagerId: 'm-1'
    };

    const mockForm = jasmine.createSpyObj('NgForm', ['resetForm']);

    component.AddProject(mockForm);

    expect(mockMessageService.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error',
      detail: 'Project add failed'
    });
    expect(mockForm.resetForm).toHaveBeenCalled();
  });

  it('should prevent numeric key input on date field', () => {
    const event = new KeyboardEvent('keydown', { key: '5' });
    spyOn(event, 'preventDefault');

    component.onKeyDown(event);

    expect(event.preventDefault).toHaveBeenCalled();
  });

  it('should allow backspace on date field', () => {
    const event = new KeyboardEvent('keydown', { key: 'Backspace' });
    spyOn(event, 'preventDefault');

    component.onKeyDown(event);

    expect(event.preventDefault).not.toHaveBeenCalled();
  });
});
