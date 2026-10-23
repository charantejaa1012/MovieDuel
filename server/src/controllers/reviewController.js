/**
 * @fileoverview Review Controller.
 * Handles fetching, creating, updating, and deleting movie reviews.
 */

import Review from '../models/Review.js';
import tmdbService from '../services/tmdbService.js';
import { success, error } from '../utils/apiResponse.js';

/**
 * Get all reviews for a movie along with community rating statistics.
 * @route GET /api/reviews/movie/:movieId
 */
export async function getMovieReviews(req, res, next) {
  try {
    const movieId = Number(req.params.movieId);
    if (!movieId) {
      return error(res, 'Valid movie ID is required', 400);
    }

    const reviews = await Review.find({ movieId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    const count = reviews.length;
    const averageRating =
      count > 0
        ? Number((reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / count).toFixed(1))
        : 0;

    return success(
      res,
      {
        reviews,
        stats: {
          totalReviews: count,
          averageRating
        }
      },
      'Reviews retrieved successfully'
    );
  } catch (err) {
    return next(err);
  }
}

/**
 * Create or update a user's review for a movie.
 * @route POST /api/reviews/movie/:movieId
 */
export async function createOrUpdateReview(req, res, next) {
  try {
    const movieId = Number(req.params.movieId);
    const { rating, reviewText, movieTitle, moviePoster } = req.body;

    if (!movieId) {
      return error(res, 'Valid movie ID is required', 400);
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 10) {
      return error(res, 'Rating must be a number between 1 and 10', 400);
    }

    if (!reviewText || typeof reviewText !== 'string' || reviewText.trim().length < 5) {
      return error(res, 'Review text must be at least 5 characters long', 400);
    }

    let title = movieTitle;
    let poster = moviePoster;

    if (!title) {
      try {
        const details = await tmdbService.getMovieDetails(movieId);
        title = details.title || `Movie #${movieId}`;
        poster = poster || details.poster_path || null;
      } catch (e) {
        title = `Movie #${movieId}`;
      }
    }

    // Upsert review for this user and movie
    const review = await Review.findOneAndUpdate(
      { userId: req.user.id, movieId },
      {
        userId: req.user.id,
        userName: req.user.name || 'Anonymous Critic',
        userEmail: req.user.email,
        movieId,
        movieTitle: title,
        moviePoster: poster,
        rating: Math.round(numRating * 10) / 10,
        reviewText: reviewText.trim()
      },
      { new: true, upsert: true, runValidators: true }
    );

    return success(res, review, 'Review saved successfully', 201);
  } catch (err) {
    return next(err);
  }
}

/**
 * Delete a user's review.
 * @route DELETE /api/reviews/:id
 */
export async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);
    if (!review) {
      return error(res, 'Review not found', 404);
    }

    if (String(review.userId) !== String(req.user.id)) {
      return error(res, 'Unauthorized to delete this review', 403);
    }

    await Review.findByIdAndDelete(id);

    return success(res, { id }, 'Review deleted successfully');
  } catch (err) {
    return next(err);
  }
}

export default {
  getMovieReviews,
  createOrUpdateReview,
  deleteReview
};
