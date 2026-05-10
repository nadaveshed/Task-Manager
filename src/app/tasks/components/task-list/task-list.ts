import { Component, OnInit, OnDestroy, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription, of } from 'rxjs';
import { catchError, debounceTime, switchMap, finalize } from 'rxjs/operators';
import { TaskService } from '../../services/task.service';
import { Task, TaskStatus, TaskFilters, TASK_STATUSES, TASK_PRIORITIES, STATUS_LABELS, PRIORITY_LABELS, PaginatedResponse } from '../../models/task.model';
import { FilterBarComponent } from '../filter-bar/filter-bar';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [DatePipe, ReactiveFormsModule, FilterBarComponent],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css'
})
export class TaskListComponent implements OnInit, OnDestroy {
  private taskService = inject(TaskService);
  private fb = inject(FormBuilder);

  tasks = signal<Task[]>([]);
  totalTasks = signal(0);
  loading = signal(false);
  showForm = signal(false);
  editingTask = signal<Task | null>(null);

  form!: FormGroup;

  // Pagination and filtering state
  currentPage = 1;
  pageSize = 20;
  totalPages = computed(() => Math.ceil(this.totalTasks() / this.pageSize) || 1);

  private currentFilters: Partial<TaskFilters> = {
    sortBy: 'dueDate',
    sortOrder: 'asc'
  };

  readonly statuses = TASK_STATUSES;
  readonly priorities = TASK_PRIORITIES;
  readonly statusLabels = STATUS_LABELS;
  readonly priorityLabels = PRIORITY_LABELS;

  private filterSubject = new Subject<TaskFilters>();
  private subs = new Subscription();

  ngOnInit() {
    const sub = this.filterSubject.pipe(
      debounceTime(300),
      switchMap(filters => {
        this.loading.set(true);
        // Merge with pagination state
        const payload = { ...filters, page: this.currentPage, pageSize: this.pageSize };

        return this.taskService.getTasks(payload).pipe(
          catchError(err => {
            console.error('Failed to fetch tasks:', err);
            return of({ data: [], total: 0 } as PaginatedResponse<Task>);
          }),
          finalize(() => this.loading.set(false))
        );
      })
    ).subscribe(res => {
      this.tasks.set(res.data);
      this.totalTasks.set(res.total);
    });

    this.subs.add(sub);

    this.refreshTasks();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

  private refreshTasks() {
    this.filterSubject.next(this.currentFilters as TaskFilters);
  }

  loadTasks() {
    this.currentPage = 1;
    this.refreshTasks();
  }

  onFiltersChanged(filters: { priority: string; dueDateFrom: string; dueDateTo: string }) {
    this.currentFilters = { ...this.currentFilters, ...(filters as Partial<TaskFilters>) };
    this.currentPage = 1; // Reset to first page when filtering
    this.refreshTasks();
  }

  setSort(column: string) {
    if (this.currentFilters.sortBy === column) {
      this.currentFilters.sortOrder = this.currentFilters.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentFilters.sortBy = column;
      this.currentFilters.sortOrder = 'asc';
    }
    this.refreshTasks();
  }

  changePage(delta: number) {
    const newPage = this.currentPage + delta;
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.currentPage = newPage;
      this.refreshTasks();
    }
  }

  openCreate() {
    this.editingTask.set(null);
    this.form = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
      status: ['Pending', Validators.required],
      priority: ['Medium', Validators.required],
      dueDate: ['', Validators.required],
      assignedUser: ['', Validators.required]
    });
    this.showForm.set(true);
  }

  openEdit(task: Task) {
    this.editingTask.set(task);
    this.form = this.fb.group({
      title: [task.title, [Validators.required, Validators.minLength(3)]],
      description: [task.description],
      status: [task.status, Validators.required],
      priority: [task.priority, Validators.required],
      dueDate: [task.dueDate?.split('T')[0] || '', Validators.required],
      assignedUser: [task.assignedUser, Validators.required]
    });
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.editingTask.set(null);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const data = this.form.value;
    const editing = this.editingTask();

    if (editing) {
      this.taskService.updateTask(editing.id, { ...data, version: editing.version }).subscribe({
        next: updated => {
          this.tasks.update(list => list.map(t => t.id === updated.id ? updated : t));
          this.closeForm();
        }
      });
    } else {
      this.taskService.createTask(data).subscribe({
        next: () => {
          this.closeForm();
          this.loadTasks();
        }
      });
    }
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  onStatusChange(task: Task, event: Event) {
    const newStatus = (event.target as HTMLSelectElement).value as TaskStatus;
    if (task.status === newStatus) return;

    const snapshot = { ...task };

    this.tasks.update(list =>
      list.map(t => t.id === task.id ? { ...t, status: newStatus } : t)
    );

    this.taskService.updateTaskStatus(task.id, newStatus, task.version).subscribe({
      next: updated => {
        this.tasks.update(list => list.map(t => t.id === updated.id ? updated : t));
      },
      error: () => {
        this.tasks.update(list => list.map(t => t.id === task.id ? snapshot : t));
      }
    });
  }

  isOverdue(task: Task): boolean {
    if (task.status === 'Done') return false;
    return new Date(task.dueDate) < new Date();
  }
}
