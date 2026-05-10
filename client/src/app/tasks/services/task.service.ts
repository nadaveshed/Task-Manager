import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Task, TaskFilters, TaskStatus, PaginatedResponse } from '../models/task.model';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private baseUrl = '/api/tasks';

  constructor(private http: HttpClient) { }

  getTasks(filters: TaskFilters): Observable<PaginatedResponse<Task>> {
    let params = new HttpParams();
    Object.entries(filters || {}).forEach(([key, val]) => {
      if (val !== null && val !== undefined && val !== '') {
        params = params.set(key, String(val));
      }
    });
    return this.http.get<PaginatedResponse<Task>>(this.baseUrl, { params });
  }

  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<Task>(this.baseUrl, task);
  }

  updateTask(id: string, task: Partial<Task>): Observable<Task> {
    return this.http.put<Task>(`${this.baseUrl}/${id}`, task);
  }

  updateTaskStatus(id: string, status: TaskStatus, version: number): Observable<Task> {
    return this.http.patch<Task>(`${this.baseUrl}/${id}/status`, { status, version });
  }

  deleteTask(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}