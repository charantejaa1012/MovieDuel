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
    const movieAId = req.body.movieAId || req.body.movie1Id;
    const movieBId = req.body.movieBId || req.body.movie2Id;
    const { weights, preferences: reqPreferences } = req.body;

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

/**
 * Retrieves dynamic featured duel matchups based on currently trending films.
 * @route GET /api/duels/featured
 */
export async function getFeaturedDuels(req, res, next) {
  try {
    const trending = await tmdbService.getTrending('week');
    const movies = (trending.results || []).filter((m) => m && m.poster_path);

    if (movies.length >= 6) {
      // Create 3 dynamic high-profile pairs
      const matchups = [
        {
          id: `featured-${movies[0].id}-${movies[1].id}`,
          title: `${movies[0].title} vs ${movies[1].title}`,
          badge: 'Box Office Clash',
          movie1: {
            id: movies[0].id,
            title: movies[0].title,
            poster_path: movies[0].poster_path,
            rating: Number((movies[0].vote_average || 7.5).toFixed(1)),
            year: movies[0].release_date ? movies[0].release_date.substring(0, 4) : '2025'
          },
          movie2: {
            id: movies[1].id,
            title: movies[1].title,
            poster_path: movies[1].poster_path,
            rating: Number((movies[1].vote_average || 7.4).toFixed(1)),
            year: movies[1].release_date ? movies[1].release_date.substring(0, 4) : '2025'
          }
        },
        {
          id: `featured-${movies[2].id}-${movies[3].id}`,
          title: `${movies[2].title} vs ${movies[3].title}`,
          badge: 'Trending Rivals',
          movie1: {
            id: movies[2].id,
            title: movies[2].title,
            poster_path: movies[2].poster_path,
            rating: Number((movies[2].vote_average || 7.2).toFixed(1)),
            year: movies[2].release_date ? movies[2].release_date.substring(0, 4) : '2025'
          },
          movie2: {
            id: movies[3].id,
            title: movies[3].title,
            poster_path: movies[3].poster_path,
            rating: Number((movies[3].vote_average || 7.1).toFixed(1)),
            year: movies[3].release_date ? movies[3].release_date.substring(0, 4) : '2025'
          }
        },
        {
          id: `featured-${movies[4].id}-${movies[5].id}`,
          title: `${movies[4].title} vs ${movies[5].title}`,
          badge: 'Critic Favorites',
          movie1: {
            id: movies[4].id,
            title: movies[4].title,
            poster_path: movies[4].poster_path,
            rating: Number((movies[4].vote_average || 7.8).toFixed(1)),
            year: movies[4].release_date ? movies[4].release_date.substring(0, 4) : '2025'
          },
          movie2: {
            id: movies[5].id,
            title: movies[5].title,
            poster_path: movies[5].poster_path,
            rating: Number((movies[5].vote_average || 7.6).toFixed(1)),
            year: movies[5].release_date ? movies[5].release_date.substring(0, 4) : '2025'
          }
        }
      ];

      return success(res, { matchups }, 'Dynamic featured matchups retrieved');
    }

    // Fallback static if not enough movies
    const fallbackMatchups = [
      {
        id: 'dune-interstellar',
        title: 'Dune: Part Two vs Interstellar',
        badge: 'Sci-Fi Titans',
        movie1: {
          id: 693134,
          title: 'Dune: Part Two',
          poster_path: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
          rating: 8.3,
          year: '2024'
        },
        movie2: {
          id: 157336,
          title: 'Interstellar',
          poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
          rating: 8.4,
          year: '2014'
        }
      }
    ];

    return success(res, { matchups: fallbackMatchups }, 'Featured matchups retrieved');
  } catch (err) {
    return next(err);
  }
}

export default {
  compare,
  getHistory,
  getFeaturedDuels
};

