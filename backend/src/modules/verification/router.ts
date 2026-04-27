import { Router } from 'express';
import * as verificationController from './controller.js';
import { verificationVoteSchema } from './schemas.js';
import { validateBody, authenticate } from '../../middleware/index.js';

const router = Router();

router.post('/', authenticate, validateBody(verificationVoteSchema), verificationController.submitVote);

router.get('/:reportId', authenticate, verificationController.getReportVerifications);

export default router;