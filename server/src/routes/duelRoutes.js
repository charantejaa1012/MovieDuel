/**
 * @fileoverview Duel Express Routes.
 * Mounts movie comparison and duel history endpoints.
 */

import { Router } from 'express';
import { compare, getHistory, getFeaturedDuels } from '../controllers/duelController.js';
import { auth, optionalAuth } from '../middleware/auth.js';
import { duelLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { compareSchema } from '../validators/duelValidators.js';

const router = Router();

// Dynamic featured matchups
router.get('/featured', getFeaturedDuels);

// Duel comparison endpoint with rate limiting, payload validation, and optional auth
router.post('/compare', duelLimiter, validate(compareSchema), optionalAuth, compare);

// Authenticated user's duel comparison history
router.get('/history', auth, getHistory);

export default router;
