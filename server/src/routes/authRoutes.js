/**
 * @fileoverview Authentication Express Routes.
 * Mounts endpoints for user registration, login, logout, and profile retrieval.
 */

import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { auth } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, loginSchema } from '../validators/authValidators.js';

const router = Router();

// Public auth endpoints with rate limiting and input validation
router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);

// Authenticated session endpoints
router.post('/logout', auth, logout);
router.get('/me', auth, getMe);

export default router;
