/**
 * @fileoverview Review Express Routes.
 * Mounts endpoints for fetching, creating, and deleting movie reviews.
 */

import { Router } from 'express';
import {
  getMovieReviews,
  createOrUpdateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Publicly viewable community reviews
router.get('/movie/:movieId', getMovieReviews);

// Authenticated reviews management
router.post('/movie/:movieId', auth, createOrUpdateReview);
router.delete('/:id', auth, deleteReview);

export default router;
