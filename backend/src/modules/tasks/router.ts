import { Router } from 'express';
import * as taskController from './controller.js';
import { assignTaskSchema, updateTaskStatusSchema, taskFiltersSchema } from './schemas.js';
import { validateBody, validateQuery, authenticate } from '../../middleware/index.js';

const router = Router();

router.post('/assign', authenticate, validateBody(assignTaskSchema), taskController.assignTask);

router.get('/user', authenticate, validateQuery(taskFiltersSchema), taskController.getUserTasks);

router.get('/:id', authenticate, taskController.getTaskById);

router.patch('/:id/status', authenticate, validateBody(updateTaskStatusSchema), taskController.updateTaskStatus);

export default router;