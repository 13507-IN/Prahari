import { Router } from 'express';
import * as notificationController from './controller.js';
import { notificationFiltersSchema } from './schemas.js';
import { validateQuery, authenticate } from '../../middleware/index.js';

const router = Router();

router.get('/', authenticate, validateQuery(notificationFiltersSchema), notificationController.getNotifications);

router.get('/unread-count', authenticate, notificationController.getUnreadCount);

router.patch('/:id/read', authenticate, notificationController.markAsRead);

router.post('/mark-all-read', authenticate, notificationController.markAllRead);

export default router;