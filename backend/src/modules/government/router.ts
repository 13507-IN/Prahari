import { Router } from 'express';
import * as governmentController from './controller.js';
import { governmentActionSchema, updateReportStatusSchema } from './schemas.js';
import { validateBody, authenticate, authorize } from '../../middleware/index.js';

const router = Router();

router.post('/action', authenticate, authorize('govt', 'admin'), validateBody(governmentActionSchema), governmentController.createAction);

router.get('/report/:reportId', authenticate, governmentController.getReportActions);

router.patch('/report/:reportId/status', authenticate, authorize('govt', 'admin'), validateBody(updateReportStatusSchema), governmentController.updateReportStatus);

export default router;