import { Router } from 'express';
import * as matchingController from './controller.js';
import { matchingFiltersSchema, availableTasksSchema } from './schemas.js';
import { validateQuery } from '../../middleware/index.js';

const router = Router();

router.get('/volunteers', validateQuery(matchingFiltersSchema), matchingController.getRecommendedVolunteers);

router.get('/tasks', validateQuery(availableTasksSchema), matchingController.getAvailableTasks);

export default router;