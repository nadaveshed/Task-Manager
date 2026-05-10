import { PrismaClient } from '@prisma/client';
import { Task, TaskStatus } from '../models/task.model';

const prisma = new PrismaClient();

export class TaskService {

  async getAllTasks(filters: any) {
    const page = parseInt(filters.page) || 1;
    const pageSize = parseInt(filters.pageSize) || 20;
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where: any = {};
    if (filters.priority) where.priority = filters.priority;
    if (filters.status) where.status = filters.status;

    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) where.dueDate.gte = filters.dueDateFrom;
      if (filters.dueDateTo) where.dueDate.lte = filters.dueDateTo;
    }

    const orderBy: any[] = [];
    if (filters.sortBy) {
      const order = filters.sortOrder === 'desc' ? 'desc' : 'asc';
      orderBy.push({ [filters.sortBy]: order });
    }
    // Stable sorting fallback
    orderBy.push({ id: 'asc' });

    const [data, total] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        skip,
        take
      }),
      prisma.task.count({ where })
    ]);

    return { data, total };
  }

  async createTask(data: Partial<Task>): Promise<Task> {
    if (!data.title || data.title.trim().length < 3) {
      throw new Error('Validation: Title must be at least 3 characters long');
    }
    if (!data.dueDate) {
      throw new Error('Validation: Due date is required');
    }
    
    const newTask = await prisma.task.create({
      data: {
        title: data.title.trim(),
        description: data.description || '',
        status: data.status || 'Pending',
        priority: data.priority || 'Medium',
        dueDate: data.dueDate,
        assignedUser: data.assignedUser || '',
        version: 1
      }
    });
    return newTask as Task;
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task | null> {
    if (data.title !== undefined && data.title.trim().length < 3) {
      throw new Error('Validation: Title must be at least 3 characters long');
    }

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return null;

    if (data.version && data.version !== existing.version) {
      throw new Error('Conflict: Version mismatch');
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate,
        assignedUser: data.assignedUser,
        version: { increment: 1 }
      }
    });
    return updated as Task;
  }

  async updateTaskStatus(id: string, status: TaskStatus, version: number): Promise<Task | null> {
    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return null;

    if (version !== existing.version) {
      throw new Error('Conflict: Version mismatch');
    }

    const updated = await prisma.task.update({
      where: { id },
      data: {
        status,
        version: { increment: 1 }
      }
    });
    return updated as Task;
  }

  async deleteTask(id: string): Promise<boolean> {
    try {
      await prisma.task.delete({ where: { id } });
      return true;
    } catch {
      return false; // Record not found
    }
  }
}
