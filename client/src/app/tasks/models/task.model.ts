export type TaskStatus = 'Pending' | 'InProgress' | 'Done';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export const TASK_STATUSES: TaskStatus[] = ['Pending', 'InProgress', 'Done'];
export const TASK_PRIORITIES: TaskPriority[] = ['Low', 'Medium', 'High'];

export const STATUS_LABELS: Record<TaskStatus, string> = {
  Pending: 'Pending',
  InProgress: 'In Progress',
  Done: 'Done'
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  Low: 'Low',
  Medium: 'Medium',
  High: 'High'
};

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string;
  assignedUser: string;
  version: number;
}

export interface TaskFilters {
  search?: string;
  status?: TaskStatus | '';
  priority?: TaskPriority | '';
  dueDateFrom?: string;
  dueDateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export const DEFAULT_FILTERS: TaskFilters = {
  search: '',
  status: '',
  priority: '',
  dueDateFrom: '',
  dueDateTo: '',
  sortBy: 'dueDate',
  sortOrder: 'asc',
  page: 1,
  pageSize: 20
};

// server returns paginated response
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}