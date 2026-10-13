/**
 * @fileoverview Duel Controller.
 * Coordinates movie vs movie comparisons, score evaluations via DuelEngine,
 * and persistent comparison history records.
 */

import tmdbService from '../services/tmdbService.js';
import duelEngine from '../services/duelEngine.js';
import DuelHistory from '../models/DuelHistory.js';
import User from '../models/User.js';
import { success, error } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

/**
 * Runs a Weighted Sum Model duel comparison between two movies.
 * @route POST /api/duels/compare
 */
export async function compare(req, res, next) {
  try {
    const { movieAId, movieBId, weights, preferences: reqPreferences } = req.body;

    if (movieAId === movieBId) {
      return error(res, 'Cannot duel a movie against itself. Movie A and Movie B must be different.', 400);
    }

    // 1. Fetch details for both movies in parallel
    const [movieA, movieB] = await Promise.all([
      tmdbService.getMovieDetails(movieAId),
      tmdbService.getMovieDetails(movieBId)
    ]);

    if (!movieA || !movieB) {
      return error(res, 'One or both movies could not be found.', 404);
    }

    // 2. Prepare preferences
    let preferences = reqPreferences || {};

    // If preferences not explicitly provided and user is authenticated, use their stored preferences
    if (req.user && req.user.id && (!preferences.favoriteGenres || preferences.favoriteGenres.length === 0)) {
      try {
        const userDoc = await User.findById(req.user.id);
        if (userDoc) {
          preferences = {
            favoriteGenres: userDoc.favoriteGenres || [],
            preferredRuntime: userDoc.preferences?.preferredRuntime || null,
            preferredLanguage: userDoc.preferences?.preferredLanguage || null,
            ...preferences
          };
        }
      } catch (err) {
        logger.warn(`Could not load user preferences for duel: ${err.message}`);
      }
    }

    // 3. Execute comparison
    const comparisonResult = duelEngine.compareDuel(movieA, movieB, weights, preferences);

    // 4. Save to DuelHistory if user is authenticated
    if (req.user && req.user.id) {
      try {
        await DuelHistory.create({
          userId: req.user.id,
          movieAId: movieA.id,
          movieBId: movieB.id,
          movieATitle: movieA.title || 'Movie A',
          movieBTitle: movieB.title || 'Movie B',
          weights: comparisonResult.normalizedWeights,
          scores: {
            movieA: comparisonResult.movieA.score,
            movieB: comparisonResult.movieB.score
          },
          criterionScores: {
            movieA: comparisonResult.movieA.criterionScores,
            movieB: comparisonResult.movieB.criterionScores
          },
          winnerMovieId: comparisonResult.winnerMovieId,
          verdict: comparisonResult.verdict,
          preferences,
          createdAt: new Date()
        });
      } catch (historyErr) {
        logger.error(`Failed to record duel history: ${historyErr.message}`);
      }
    }

    return success(res, comparisonResult, 'Duel comparison completed successfully');
  } catch (err) {
    return next(err);
  }
}

/**
 * Retrieves past duel comparison records for the authenticated user.
 * @route GET /api/duels/history
 */
export async function getHistory(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return error(res, 'Authentication required to view duel history', 401);
    }

    const history = await DuelHistory.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    return success(res, { history }, 'Duel history retrieved successfully');
  } catch (err) {
    return next(err);
  }
}

export default {
  compare,
  getHistory
};
