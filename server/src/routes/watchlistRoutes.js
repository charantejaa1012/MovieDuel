/**
 * @fileoverview Watchlist Express Routes.
 * Mounts endpoints for managing and querying user watchlist items.
 */

import { Router } from 'express';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  checkWatchlist,
  checkMultiple
} from '../controllers/watchlistController.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addToWatchlistSchema, checkMultipleSchema } from '../validators/watchlistValidators.js';

const router = Router();

// All watchlist routes require authentication
router.use(auth);

router.get('/', getWatchlist);
router.post('/', validate(addToWatchlistSchema), addToWatchlist);
router.delete('/:movieId', removeFromWatchlist);
router.get('/check/:movieId', checkWatchlist);
router.post('/check-multiple', validate(checkMultipleSchema), checkMultiple);

export default router;
