/**
 * @fileoverview Preferences Express Routes.
 * Mounts endpoints for retrieving and updating user recommendation preferences.
 */

import { Router } from 'express';
import { getPreferences, updatePreferences } from '../controllers/preferencesController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updatePreferencesSchema } from '../validators/preferencesValidators.js';

const router = Router();

// All preferences routes require authentication
router.use(auth);

router.get('/', getPreferences);
router.put('/', validate(updatePreferencesSchema), updatePreferences);

export default router;
