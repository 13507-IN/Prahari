import { Router } from 'express';
import * as matchingController from './controller.js';
import { matchingFiltersSchema, availableTasksSchema } from './schemas.js';
import { validateQuery, authenticate } from '../../middleware/index.js';

const router = Router();

router.get('/volunteers', authenticate, validateQuery(matchingFiltersSchema), matchingController.getRecommendedVolunteers);

router.get('/tasks', authenticate, validateQuery(availableTasksSchema), matchingController.getAvailableTasks);

export default router;