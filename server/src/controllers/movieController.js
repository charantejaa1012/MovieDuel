/**
 * @fileoverview Movie Controller.
 * Provides endpoints to fetch trending, popular, upcoming, details, and search listings.
 */

import tmdbService from '../services/tmdbService.js';
import { success, error } from '../utils/apiResponse.js';

/**
 * Fetches trending movies.
 * @route GET /api/movies/trending
 */
export async function getTrending(req, res, next) {
  try {
    const timeWindow = req.query.timeWindow === 'day' ? 'day' : 'week';
    const data = await tmdbService.getTrending(timeWindow);
    return success(res, data, 'Trending movies retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * Searches movies by query string.
 * @route GET /api/movies/search
 */
export async function searchMovies(req, res, next) {
  try {
    const query = req.query.query;
    const page = parseInt(req.query.page || '1', 10);

    if (!query || String(query).trim().length === 0) {
      return error(res, "Search parameter 'query' is required", 400);
    }

    const data = await tmdbService.searchMovies(String(query), page);
    return success(res, data, 'Movie search results retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * Fetches comprehensive details for a movie.
 * @route GET /api/movies/:id
 */
export async function getMovieDetails(req, res, next) {
  try {
    const movieId = req.params.id;
    const idNum = parseInt(movieId, 10);
    if (isNaN(idNum) || idNum <= 0) {
      return error(res, 'Invalid movie ID parameter', 400);
    }

    const data = await tmdbService.getMovieDetails(idNum);
    if (!data) {
      return error(res, 'Movie not found', 404);
    }

    return success(res, data, 'Movie details retrieved successfully');
  } catch (err) {
    if (err.response && err.response.status === 404) {
      return error(res, 'Movie not found on TMDB', 404);
    }
    return next(err);
  }
}

/**
 * Fetches upcoming movies.
 * @route GET /api/movies/upcoming
 */
export async function getUpcoming(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const data = await tmdbService.getUpcoming(page);
    return success(res, data, 'Upcoming movies retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * Fetches available genre taxonomies.
 * @route GET /api/movies/genres
 */
export async function getGenres(req, res, next) {
  try {
    const data = await tmdbService.getGenres();
    return success(res, data, 'Genres list retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * Fetches popular movies.
 * @route GET /api/movies/popular
 */
export async function getPopular(req, res, next) {
  try {
    const page = parseInt(req.query.page || '1', 10);
    const data = await tmdbService.getPopular(page);
    return success(res, data, 'Popular movies retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

export default {
  getTrending,
  searchMovies,
  getMovieDetails,
  getUpcoming,
  getGenres,
  getPopular
};
