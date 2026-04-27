import { Router } from 'express';
import * as userController from './controller.js';
import { updateProfileSchema } from './schemas.js';
import { profileSetupSchema } from '../auth/schemas.js';
import { validateBody, authenticate } from '../../middleware/index.js';

const router = Router();

router.post('/profile-setup', validateBody(profileSetupSchema), userController.profileSetup);

router.get('/profile', authenticate, userController.getProfile);

router.put('/profile', authenticate, validateBody(updateProfileSchema), userController.updateProfile);

router.get('/', authenticate, userController.getAllUsers);

router.get('/govt', authenticate, userController.getGovtUsers);

router.get('/ngos', authenticate, userController.getNgoUsers);

export default router;