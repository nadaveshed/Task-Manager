import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';

const taskService = new TaskService();

export class TaskController {
  
  getTasks = async (req: Request, res: Response) => {
    try {
      const result = await taskService.getAllTasks(req.query);
      res.json(result);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

  createTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const newTask = await taskService.createTask(req.body);
      res.status(201).json(newTask);
    } catch (error: any) {
      console.error('Error creating task:', error);
      if (error.message && error.message.includes('Validation')) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Error creating task' });
    }
  };

  updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const updatedTask = await taskService.updateTask(req.params.id as string, req.body);
      if (!updatedTask) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      res.json(updatedTask);
    } catch (error: any) {
      if (error.message && error.message.includes('Conflict')) {
        res.status(409).json({ message: error.message });
        return;
      }
      if (error.message && error.message.includes('Validation')) {
        res.status(400).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Error updating task' });
    }
  };

  updateTaskStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { status, version } = req.body;
      const updatedTask = await taskService.updateTaskStatus(req.params.id as string, status, version);
      if (!updatedTask) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      res.json(updatedTask);
    } catch (error: any) {
      if (error.message.includes('Conflict')) {
        res.status(409).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: 'Error updating task status' });
    }
  };

  deleteTask = async (req: Request, res: Response): Promise<void> => {
    try {
      const success = await taskService.deleteTask(req.params.id as string);
      if (!success) {
        res.status(404).json({ message: 'Task not found' });
        return;
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error deleting task' });
    }
  };
}
