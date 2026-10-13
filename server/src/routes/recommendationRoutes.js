/**
 * @fileoverview Recommendation Express Routes.
 * Mounts endpoints for fetching personalized and anonymous movie recommendations.
 */

import { Router } from 'express';
import { getRecommendations } from '../controllers/recommendationController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();

// Recommendations support optional auth (personalized if logged in, curated otherwise)
router.get('/', optionalAuth, getRecommendations);

export default router;
