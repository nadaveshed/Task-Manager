import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';

const router = Router();
const taskController = new TaskController();

router.get('/', taskController.getTasks);
router.post('/', taskController.createTask);
router.put('/:id', taskController.updateTask);
router.patch('/:id/status', taskController.updateTaskStatus);
router.delete('/:id', taskController.deleteTask);

export default router;
