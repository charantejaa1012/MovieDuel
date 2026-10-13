/**
 * @fileoverview Watchlist Controller.
 * Handles adding, retrieving, checking, and deleting movies from a user's watchlist.
 */

import Watchlist from '../models/Watchlist.js';
import tmdbService from '../services/tmdbService.js';
import { success, error } from '../utils/apiResponse.js';

/**
 * Retrieves all saved watchlist items for the authenticated user.
 * @route GET /api/watchlist
 */
export async function getWatchlist(req, res, next) {
  try {
    const items = await Watchlist.find({ userId: req.user.id })
      .sort({ addedAt: -1 })
      .lean();

    return success(res, { items, count: items.length }, 'Watchlist retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * Adds a movie to the authenticated user's personal watchlist.
 * @route POST /api/watchlist
 */
export async function addToWatchlist(req, res, next) {
  try {
    const { movieId, movieTitle, moviePoster, movieRating, movieYear } = req.body;

    const existing = await Watchlist.findOne({
      userId: req.user.id,
      movieId: Number(movieId)
    });

    if (existing) {
      return error(res, 'Movie is already in your watchlist', 409);
    }

    let title = movieTitle;
    let poster = moviePoster;
    let rating = movieRating;
    let year = movieYear;

    // If metadata not provided, fetch basic details from TMDB
    if (!title) {
      try {
        const details = await tmdbService.getMovieDetails(movieId);
        title = details.title || '';
        poster = details.poster_path || null;
        rating = details.vote_average || null;
        year = details.release_date ? details.release_date.substring(0, 4) : null;
      } catch (e) {
        title = `Movie #${movieId}`;
      }
    }

    const item = await Watchlist.create({
      userId: req.user.id,
      movieId: Number(movieId),
      movieTitle: title,
      moviePoster: poster,
      movieRating: rating,
      movieYear: year,
      addedAt: new Date()
    });

    return success(res, { item }, 'Movie added to watchlist', 201);
  } catch (err) {
    return next(err);
  }
}

/**
 * Removes a movie from the authenticated user's watchlist.
 * @route DELETE /api/watchlist/:movieId
 */
export async function removeFromWatchlist(req, res, next) {
  try {
    const movieId = parseInt(req.params.movieId, 10);
    if (isNaN(movieId) || movieId <= 0) {
      return error(res, 'Invalid movieId parameter', 400);
    }

    const deleted = await Watchlist.findOneAndDelete({
      userId: req.user.id,
      movieId
    });

    if (!deleted) {
      return error(res, 'Movie not found in your watchlist', 404);
    }

    return success(res, null, 'Movie removed from watchlist successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * Checks if a specific movie exists in the authenticated user's watchlist.
 * @route GET /api/watchlist/check/:movieId
 */
export async function checkWatchlist(req, res, next) {
  try {
    const movieId = parseInt(req.params.movieId, 10);
    if (isNaN(movieId) || movieId <= 0) {
      return error(res, 'Invalid movieId parameter', 400);
    }

    const item = await Watchlist.findOne({
      userId: req.user.id,
      movieId
    }).lean();

    return success(
      res,
      {
        movieId,
        inWatchlist: !!item,
        watchlistId: item ? item._id : null
      },
      'Watchlist status checked'
    );
  } catch (err) {
    return next(err);
  }
}

/**
 * Batch checks which movie IDs from an array are in the user's watchlist.
 * @route POST /api/watchlist/check-multiple
 */
export async function checkMultiple(req, res, next) {
  try {
    const { movieIds } = req.body;
    if (!Array.isArray(movieIds) || movieIds.length === 0) {
      return error(res, 'movieIds array is required', 400);
    }

    const uniqueIds = Array.from(new Set(movieIds.map((id) => Number(id)).filter(Boolean)));

    const foundItems = await Watchlist.find({
      userId: req.user.id,
      movieId: { $in: uniqueIds }
    }).select('movieId').lean();

    const savedMovieIds = foundItems.map((item) => item.movieId);

    // Map of movieId -> boolean
    const lookup = {};
    for (const id of uniqueIds) {
      lookup[id] = savedMovieIds.includes(id);
    }

    return success(
      res,
      {
        inWatchlistMap: lookup,
        savedMovieIds
      },
      'Batch watchlist check completed'
    );
  } catch (err) {
    return next(err);
  }
}

export default {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  checkWatchlist,
  checkMultiple
};
