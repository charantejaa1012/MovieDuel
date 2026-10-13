/**
 * @fileoverview Movie Express Routes.
 * Mounts TMDB movie endpoints for trending, search, popular, upcoming, genres, and details.
 */

import { Router } from 'express';
import {
  getTrending,
  searchMovies,
  getMovieDetails,
  getUpcoming,
  getGenres,
  getPopular
} from '../controllers/movieController.js';

const router = Router();

router.get('/trending', getTrending);
router.get('/search', searchMovies);
router.get('/upcoming', getUpcoming);
router.get('/genres', getGenres);
router.get('/popular', getPopular);
router.get('/:id', getMovieDetails);

export default router;
