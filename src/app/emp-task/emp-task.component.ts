import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../services/task.service';
import { Task } from '../models/task.model';
import { TaskboxComponent } from '../taskbox/taskbox.component';
import { UserService } from '../services/user.service';
import { person } from '../models/user.model';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { LoaderComponent } from "../loader/loader.component";

@Component({
  selector: 'app-emp-task',
  imports: [CommonModule, LoaderComponent],
  templateUrl: './emp-task.component.html',
  styleUrl: './emp-task.component.scss',
})
export class EmpTaskComponent implements OnInit, OnChanges {
  @Input({ required: true }) user!: person | null;
  @Output() closePopup = new EventEmitter<void>();

  tasks: Task[] = [];
  // user: person | null = null;

  constructor(
    private taskService: TaskService,
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    if (this.user) {
      this.loadUserTasks();
    }
  }

  ngOnChanges(): void {
    if (this.user) {
      this.loadUserTasks();
    }
  }
  taskloader:boolean=false;
  loadUserTasks(): void {
    this.taskloader=true;
   
    this.taskService.GetEmpTask(`employees/${this.user?.Id}/tasks`).subscribe({
      next: (allTasks: Task[]) => {
        this.tasks = allTasks;
        this.taskloader=false;
      },
      error: (err: any) => {
        this.taskloader=false;
        console.error('Error loading tasks:', err);
        this.tasks = [];
      },
    });
  }

  close(): void {
    this.closePopup.emit();
  }

  onopencomment(task: Task): void {
    this.router.navigate(['../task'], {
      relativeTo: this.route,
      state: { task: task },
    });
  }
}
