import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ProjectboxComponent } from './projectbox.component';
import { ProjectService } from '../services/project.service';
import { AuthService } from '../services/auth.service';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { Project } from '../models/project.model';
import { Role, user } from '../models/user.model';

describe('ProjectboxComponent', () => {
  let component: ProjectboxComponent;
  let fixture: ComponentFixture<ProjectboxComponent>;
  let mockProjectService: jasmine.SpyObj<ProjectService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockConfirmationService: jasmine.SpyObj<ConfirmationService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockProject: Project;

  beforeEach(async () => {
    mockProjectService = jasmine.createSpyObj('ProjectService', [
      'GetProjectStatuas',
      'DeleteProject',
      'GetAllProject'
    ]);
    mockAuthService = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    mockConfirmationService = jasmine.createSpyObj('ConfirmationService', [
      'confirm'
    ]);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    mockProject = {
      ProjectId: 'p-1',
      ProjectName: 'Project Alpha',
      ProjectDes: 'Desc',
      Deadline: new Date(),
      CreatedBy: 'admin-1',
      AssignedManagerId: 'mgr-1'
    };

    mockProjectService.GetProjectStatuas.and.returnValue(
      of({
        status: 'ok',
        message: 'ok',
        data: {
          projectId: 'p-1',
          completedTasks: '3',
          totalTasks: 4,
          completionPercentage: 75
        }
      })
    );
    mockProjectService.DeleteProject.and.returnValue(of({}));
    mockProjectService.GetAllProject.and.returnValue(of([]));

    mockAuthService.getCurrentUser.and.returnValue({
      Id: 'mgr-1',
      Name: 'Alex',
      Email: 'alex@example.com',
      Role: Role.MANAGER
    } as user);

    await TestBed.configureTestingModule({
      imports: [ProjectboxComponent],
      providers: [
        { provide: ProjectService, useValue: mockProjectService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfirmationService, useValue: mockConfirmationService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectboxComponent);
    component = fixture.componentInstance;
    component.Project = mockProject;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load project status on init', () => {
    expect(mockProjectService.GetProjectStatuas).toHaveBeenCalledWith(
      'projects/p-1/status/creator/mgr-1'
    );
    expect(component.projectCompletionpercentage).toBe(75);
    expect(component.totalTask).toBe(4);
  });

  it('should emit loadTasks event', () => {
    spyOn(component.loadTasksignal, 'emit');

    component.loadTasks();

    expect(component.loadTasksignal.emit).toHaveBeenCalledWith(mockProject);
  });

  it('should emit addTask event', () => {
    spyOn(component.Addtasksignal, 'emit');

    component.AddTask();

    expect(component.Addtasksignal.emit).toHaveBeenCalledWith('p-1');
  });

  it('should delete project on confirm accept', () => {
    spyOn(component.projectDeleted, 'emit');

    mockConfirmationService.confirm.and.callFake((config) => {
      config.accept?.();
      return mockConfirmationService;
    });

    component.deleteproject();

    expect(mockProjectService.DeleteProject).toHaveBeenCalledWith(
      'p-1',
      'mgr-1',
      'admin-1'
    );
    expect(component.projectDeleted.emit).toHaveBeenCalledWith(true);
    expect(mockProjectService.GetAllProject).toHaveBeenCalled();
  });
});
