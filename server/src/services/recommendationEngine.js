/**
 * @fileoverview Recommendation Engine - Content-Based Filtering & Preference Scoring.
 * Analyzes user genre affinities, watchlist patterns, and custom preferences
 * to rank and personalize movie discovery recommendations.
 */

import tmdbService from './tmdbService.js';
import Watchlist from '../models/Watchlist.js';
import logger from '../utils/logger.js';

/**
 * Genre ID to readable name mapping for generating personalized explanations.
 */
const GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

/**
 * Calculates a content-based recommendation score (0-100) for a candidate movie.
 *
 * @param {object} movie - Movie candidate
 * @param {object} preferences - User preferences
 * @param {number[]} favoriteGenres - Array of favorite genre IDs
 * @returns {{ totalScore: number, reason: string }}
 */
function scoreCandidate(movie, preferences = {}, favoriteGenres = []) {
  const genreIds = Array.isArray(movie.genre_ids) ? movie.genre_ids : [];

  // 1. Genre Match Score (0 - 40 points)
  let genreScore = 20; // Neutral default
  let matchedGenreNames = [];
  if (Array.isArray(favoriteGenres) && favoriteGenres.length > 0) {
    const matchCount = genreIds.filter((g) => favoriteGenres.includes(g)).length;
    genreScore = (matchCount / Math.max(1, favoriteGenres.length)) * 40;
    genreScore = Math.min(40, genreScore);

    matchedGenreNames = genreIds
      .filter((g) => favoriteGenres.includes(g))
      .map((g) => GENRE_MAP[g] || 'genre')
      .slice(0, 2);
  }

  // 2. Rating Score (0 - 25 points)
  const rating = Number(movie.vote_average) || 0;
  const ratingScore = Math.min(25, (rating / 10) * 25);

  // 3. Runtime Closeness Score (0 - 15 points)
  let runtimeScore = 10; // Neutral default
  const movieRuntime = Number(movie.runtime) || 120;
  if (preferences.preferredRuntime && (preferences.preferredRuntime.min || preferences.preferredRuntime.max)) {
    const min = preferences.preferredRuntime.min || 0;
    const max = preferences.preferredRuntime.max || 300;
    if (movieRuntime >= min && movieRuntime <= max) {
      runtimeScore = 15;
    } else {
      const dist = movieRuntime < min ? min - movieRuntime : movieRuntime - max;
      runtimeScore = Math.max(0, 15 - dist * 0.2);
    }
  }

  // 4. Popularity Score (0 - 10 points)
  const popularity = Number(movie.popularity) || 0;
  const popularityScore = Math.min(10, (Math.log10(popularity + 1) / Math.log10(1000)) * 10);

  // 5. Recency / Release Period Score (0 - 10 points)
  let recencyScore = 5;
  const releaseYear = movie.release_date ? parseInt(movie.release_date.substring(0, 4), 10) : 2020;
  if (preferences.releasePeriod && (preferences.releasePeriod.from || preferences.releasePeriod.to)) {
    const from = preferences.releasePeriod.from || 1900;
    const to = preferences.releasePeriod.to || 2030;
    if (releaseYear >= from && releaseYear <= to) {
      recencyScore = 10;
    } else {
      recencyScore = 3;
    }
  } else {
    if (releaseYear >= 2020) recencyScore = 10;
    else if (releaseYear >= 2010) recencyScore = 8;
    else if (releaseYear >= 2000) recencyScore = 6;
    else recencyScore = 4;
  }

  const totalScore = parseFloat(
    (genreScore + ratingScore + runtimeScore + popularityScore + recencyScore).toFixed(2)
  );

  // Reason Generation
  let reason = 'Curated recommendation based on community appeal.';
  if (matchedGenreNames.length > 0) {
    reason = `Matches your affinity for ${matchedGenreNames.join(' & ')} cinema.`;
  } else if (rating >= 8.0) {
    reason = `Critically acclaimed masterpiece with an audience score of ${rating.toFixed(1)}/10.`;
  } else if (popularity > 80) {
    reason = 'Trending strongly among current viewers.';
  } else if (releaseYear >= 2022) {
    reason = 'Recent standout release.';
  }

  return { totalScore, reason };
}

/**
 * Returns generic curated recommendations for unauthenticated visitors.
 * @param {{ limit?: number }} [options={}]
 * @returns {Promise<Array<object>>}
 */
export async function getAnonymousRecommendations(options = {}) {
  const limit = options.limit || 12;
  try {
    const popularData = await tmdbService.getPopular(1);
    const candidates = popularData.results || [];

    const scored = candidates.map((movie) => {
      const { totalScore, reason } = scoreCandidate(movie, {}, []);
      return {
        ...movie,
        matchScore: totalScore,
        recommendationReason: reason
      };
    });

    scored.sort((a, b) => b.matchScore - a.matchScore);
    return scored.slice(0, limit);
  } catch (err) {
    logger.error(`Error in getAnonymousRecommendations: ${err.message}`);
    const fallbacks = tmdbService.getFallbackMovies();
    return fallbacks.slice(0, limit).map((m) => ({
      ...m,
      matchScore: 85,
      recommendationReason: 'Timeless cinematic classic.'
    }));
  }
}

/**
 * Generates personalized recommendations for an authenticated user.
 * Combines user preferred genres, custom filters, and watchlist seed items.
 *
 * @param {object} user - User document or auth payload
 * @param {{ limit?: number }} [options={}] - Query options
 * @returns {Promise<Array<object>>}
 */
export async function getRecommendations(user, options = {}) {
  if (!user) {
    return getAnonymousRecommendations(options);
  }

  const limit = options.limit || 12;
  const favoriteGenres = Array.isArray(user.favoriteGenres) ? user.favoriteGenres : [];
  const preferences = user.preferences || {};

  try {
    const candidateMap = new Map();

    // 1. Fetch candidates from TMDB Discover filtered by favorite genres
    const discoverParams = {
      sort_by: 'popularity.desc',
      page: 1
    };
    if (favoriteGenres.length > 0) {
      discoverParams.with_genres = favoriteGenres.slice(0, 3).join(',');
    }
    if (preferences.preferredLanguage) {
      discoverParams.with_original_language = preferences.preferredLanguage;
    }
    if (preferences.ratingMin) {
      discoverParams['vote_average.gte'] = preferences.ratingMin;
    }
    if (preferences.releasePeriod?.from) {
      discoverParams['primary_release_date.gte'] = `${preferences.releasePeriod.from}-01-01`;
    }
    if (preferences.releasePeriod?.to) {
      discoverParams['primary_release_date.lte'] = `${preferences.releasePeriod.to}-12-31`;
    }

    const discoverRes = await tmdbService.discoverMovies(discoverParams);
    for (const movie of discoverRes.results || []) {
      candidateMap.set(movie.id, movie);
    }

    // 2. Fetch seed movies from user's watchlist to find similar movies
    try {
      if (user._id || user.id) {
        const watchlistItems = await Watchlist.find({ userId: user._id || user.id })
          .sort({ addedAt: -1 })
          .limit(3)
          .lean();

        for (const item of watchlistItems) {
          try {
            const similarRes = await tmdbService.getSimilar(item.movieId);
            for (const simMovie of (similarRes.results || []).slice(0, 4)) {
              if (!candidateMap.has(simMovie.id)) {
                candidateMap.set(simMovie.id, simMovie);
              }
            }
          } catch (e) {
            // Ignore error fetching individual similar movie
          }
        }
      }
    } catch (dbErr) {
      logger.warn(`Watchlist lookup skipped during recommendations: ${dbErr.message}`);
    }

    // 3. If candidate list is small, top up with trending movies
    if (candidateMap.size < limit) {
      const trending = await tmdbService.getTrending('week');
      for (const m of trending.results || []) {
        if (!candidateMap.has(m.id)) {
          candidateMap.set(m.id, m);
        }
      }
    }

    // 4. Score and rank candidates
    const scoredCandidates = Array.from(candidateMap.values()).map((movie) => {
      const { totalScore, reason } = scoreCandidate(movie, preferences, favoriteGenres);
      return {
        ...movie,
        matchScore: totalScore,
        recommendationReason: reason
      };
    });

    scoredCandidates.sort((a, b) => b.matchScore - a.matchScore);
    return scoredCandidates.slice(0, limit);
  } catch (err) {
    logger.error(`Error generating personalized recommendations: ${err.message}`);
    return getAnonymousRecommendations(options);
  }
}

export default {
  getRecommendations,
  getAnonymousRecommendations
};
