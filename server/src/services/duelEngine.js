/**
 * @fileoverview Duel Engine - Weighted Sum Model (WSM) Decision Engine.
 * Evaluates, normalizes, and compares two movies against multi-attribute criteria:
 * Genre Match, Rating, Runtime, and Popularity.
 */

export const CRITERIA = {
  GENRE_MATCH: 'genreMatch',
  RATING: 'rating',
  RUNTIME: 'runtime',
  POPULARITY: 'popularity'
};

export const DEFAULT_WEIGHTS = {
  genreMatch: 0.3,
  rating: 0.3,
  runtime: 0.2,
  popularity: 0.2
};

export const SCORE_THRESHOLD = 3;

/**
 * Validates and normalizes criterion weights so that they sum to 1.
 * @param {Record<string, number>} [weights] - Optional user-defined weights
 * @returns {Record<string, number>} Normalized weights summing to 1.0
 * @throws {Error} If weights are invalid (negative numbers or all zero)
 */
export function validateWeights(weights) {
  const merged = { ...DEFAULT_WEIGHTS, ...(weights || {}) };
  const keys = Object.keys(DEFAULT_WEIGHTS);

  let totalWeight = 0;
  for (const key of keys) {
    const val = Number(merged[key]);
    if (isNaN(val) || val < 0) {
      throw new Error(`Invalid weight for '${key}': weights must be non-negative numbers.`);
    }
    totalWeight += val;
  }

  if (totalWeight <= 0) {
    throw new Error('All weights cannot be zero. At least one positive weight is required.');
  }

  const normalized = {};
  for (const key of keys) {
    normalized[key] = parseFloat((merged[key] / totalWeight).toFixed(4));
  }

  return normalized;
}

/**
 * Normalizes movie rating from TMDB 0-10 scale to 0-100 score.
 * Applies a Bayesian confidence penalty when vote count is under 50.
 *
 * @param {number} [voteAverage=0] - TMDB rating (0.0 to 10.0)
 * @param {number} [voteCount=0] - Total number of votes
 * @returns {number} Score between 0 and 100
 */
export function normalizeRating(voteAverage = 0, voteCount = 0) {
  if (voteAverage === null || voteAverage === undefined || isNaN(voteAverage)) {
    return 0;
  }
  const cleanAvg = Math.max(0, Math.min(10, Number(voteAverage)));
  const cleanCount = Math.max(0, Number(voteCount) || 0);

  // Confidence factor: movies with fewer than 50 votes are penalized
  const confidenceFactor = cleanCount >= 50 ? 1 : cleanCount / 50;

  const baseScore = (cleanAvg / 10) * 100;
  const finalScore = baseScore * confidenceFactor;

  return parseFloat(Math.max(0, Math.min(100, finalScore)).toFixed(2));
}

/**
 * Computes genre alignment using Jaccard similarity against user preferences.
 * Returns 50 (neutral) if no user preferences are specified.
 *
 * @param {number[]} [movieGenreIds=[]] - Array of TMDB genre IDs for the movie
 * @param {number[]} [preferredGenreIds=[]] - Array of TMDB genre IDs preferred by the user
 * @returns {number} Score between 0 and 100
 */
export function normalizeGenreMatch(movieGenreIds = [], preferredGenreIds = []) {
  if (!Array.isArray(preferredGenreIds) || preferredGenreIds.length === 0) {
    return 50; // Neutral score when no preference is defined
  }

  const movieGenres = Array.isArray(movieGenreIds) ? movieGenreIds : [];
  if (movieGenres.length === 0) {
    return 0;
  }

  const movieSet = new Set(movieGenres);
  const prefSet = new Set(preferredGenreIds);

  let intersectionCount = 0;
  for (const id of prefSet) {
    if (movieSet.has(id)) {
      intersectionCount += 1;
    }
  }

  const unionSet = new Set([...movieGenres, ...preferredGenreIds]);
  if (unionSet.size === 0) {
    return 50;
  }

  // Jaccard similarity percentage
  const jaccardScore = (intersectionCount / unionSet.size) * 100;
  return parseFloat(Math.max(0, Math.min(100, jaccardScore)).toFixed(2));
}

/**
 * Normalizes movie runtime relative to a preferred runtime range.
 * Returns 100 if inside range, decreases linearly with distance, returns 50 if no preference.
 *
 * @param {number} runtime - Movie runtime in minutes
 * @param {{ min?: number, max?: number } | null} [preferredRange=null] - Preferred range
 * @returns {number} Score between 0 and 100
 */
export function normalizeRuntime(runtime, preferredRange = null) {
  if (!preferredRange || (preferredRange.min === undefined && preferredRange.max === undefined)) {
    return 50; // Neutral score if no preference specified
  }

  const min = preferredRange.min !== undefined && preferredRange.min !== null ? Number(preferredRange.min) : 0;
  const max = preferredRange.max !== undefined && preferredRange.max !== null ? Number(preferredRange.max) : Infinity;

  const movieRuntime = Number(runtime);
  if (isNaN(movieRuntime) || movieRuntime <= 0) {
    return 50;
  }

  if (movieRuntime >= min && movieRuntime <= max) {
    return 100;
  }

  const distance = movieRuntime < min ? min - movieRuntime : movieRuntime - max;
  // Linear penalty: decreases by 1 point per minute out of range
  const score = Math.max(0, 100 - distance);

  return parseFloat(score.toFixed(2));
}

/**
 * Normalizes TMDB popularity score (typically 0-1000+) using logarithmic scaling.
 *
 * @param {number} popularity - TMDB popularity metric
 * @returns {number} Score between 0 and 100
 */
export function normalizePopularity(popularity) {
  const pop = Math.max(0, Number(popularity) || 0);
  if (pop === 0) {
    return 0;
  }

  // Log10 scaling mapping 0 - 1000 to 0 - 100
  const logScore = (Math.log10(pop + 1) / Math.log10(1000)) * 100;
  return parseFloat(Math.max(0, Math.min(100, logScore)).toFixed(2));
}

/**
 * Calculates weighted sum model score for a single movie.
 * Handles missing criteria by excluding and renormalizing remaining weights.
 *
 * @param {object} movie - TMDB movie object
 * @param {Record<string, number>} [weights] - Criterion weights
 * @param {object} [preferences] - User preferences (genres, runtime, etc.)
 * @returns {{ totalScore: number, criterionScores: Record<string, object>, missingCriteria: string[] }}
 */
export function calculateScore(movie, weights = DEFAULT_WEIGHTS, preferences = {}) {
  const normalizedWeights = validateWeights(weights);

  // Extract genre IDs whether from genre_ids or genres array
  const genreIds = Array.isArray(movie.genre_ids)
    ? movie.genre_ids
    : Array.isArray(movie.genres)
    ? movie.genres.map((g) => g.id)
    : [];

  const criterionRaw = {
    [CRITERIA.GENRE_MATCH]: {
      score: normalizeGenreMatch(genreIds, preferences.favoriteGenres || preferences.preferredGenres),
      available: true
    },
    [CRITERIA.RATING]: {
      score: normalizeRating(movie.vote_average, movie.vote_count),
      available: movie.vote_average !== undefined && movie.vote_average !== null
    },
    [CRITERIA.RUNTIME]: {
      score: normalizeRuntime(movie.runtime, preferences.preferredRuntime),
      available: movie.runtime !== undefined && movie.runtime !== null && movie.runtime > 0
    },
    [CRITERIA.POPULARITY]: {
      score: normalizePopularity(movie.popularity),
      available: movie.popularity !== undefined && movie.popularity !== null
    }
  };

  const missingCriteria = [];
  let availableWeightSum = 0;

  for (const [key, details] of Object.entries(criterionRaw)) {
    if (details.available) {
      availableWeightSum += normalizedWeights[key] || 0;
    } else {
      missingCriteria.push(key);
    }
  }

  // Renormalize weights for available criteria
  const criterionScores = {};
  let totalScore = 0;

  for (const [key, details] of Object.entries(criterionRaw)) {
    if (details.available && availableWeightSum > 0) {
      const activeWeight = (normalizedWeights[key] || 0) / availableWeightSum;
      const weightedScore = details.score * activeWeight;
      totalScore += weightedScore;

      criterionScores[key] = {
        score: details.score,
        weight: parseFloat(activeWeight.toFixed(4)),
        weightedScore: parseFloat(weightedScore.toFixed(2)),
        available: true
      };
    } else {
      criterionScores[key] = {
        score: 0,
        weight: 0,
        weightedScore: 0,
        available: false
      };
    }
  }

  return {
    totalScore: parseFloat(Math.max(0, Math.min(100, totalScore)).toFixed(2)),
    criterionScores,
    missingCriteria
  };
}

/**
 * Generates an analytical human-readable explanation of duel results.
 * Highlights the key criteria driving the decision.
 *
 * @param {object} resultA - Scored result for movie A
 * @param {object} resultB - Scored result for movie B
 * @param {object} movieA - Movie A metadata
 * @param {object} movieB - Movie B metadata
 * @returns {string} Explanation narrative
 */
export function generateExplanation(resultA, resultB, movieA, movieB) {
  const diff = Math.abs(resultA.totalScore - resultB.totalScore);
  const titleA = movieA.title || 'Movie A';
  const titleB = movieB.title || 'Movie B';

  if (diff <= SCORE_THRESHOLD) {
    return (
      `Both ${titleA} (${resultA.totalScore}) and ${titleB} (${resultB.totalScore}) are remarkably well-matched ` +
      `with only a ${diff.toFixed(1)} pt difference (within the ${SCORE_THRESHOLD}-pt tie threshold). ` +
      `Either film provides a satisfying choice depending on your exact mood.`
    );
  }

  const isAWinner = resultA.totalScore > resultB.totalScore;
  const winner = isAWinner ? movieA : movieB;
  const loser = isAWinner ? movieB : movieA;
  const winnerResult = isAWinner ? resultA : resultB;
  const loserResult = isAWinner ? resultB : resultA;

  // Determine criteria where winner had the strongest advantage
  const advantages = [];
  const criteriaLabels = {
    [CRITERIA.GENRE_MATCH]: 'genre match',
    [CRITERIA.RATING]: 'critics/audience rating',
    [CRITERIA.RUNTIME]: 'runtime preference fit',
    [CRITERIA.POPULARITY]: 'trending popularity'
  };

  for (const criterion of Object.keys(CRITERIA).map((k) => CRITERIA[k])) {
    const wScore = winnerResult.criterionScores[criterion]?.score || 0;
    const lScore = loserResult.criterionScores[criterion]?.score || 0;
    const delta = wScore - lScore;
    if (delta > 3) {
      advantages.push({ criterion, delta, label: criteriaLabels[criterion] || criterion });
    }
  }

  advantages.sort((a, b) => b.delta - a.delta);

  let reason = '';
  if (advantages.length > 0) {
    const topFactors = advantages.slice(0, 2).map((a) => a.label).join(' and ');
    reason = `driven primarily by superior ${topFactors}`;
  } else {
    reason = 'due to consistent advantages across all evaluated metrics';
  }

  return (
    `${winner.title} emerges victorious over ${loser.title} with an overall score of ` +
    `${winnerResult.totalScore} vs ${loserResult.totalScore} (${reason}).`
  );
}

/**
 * Executes a full duel comparison between two movies using Weighted Sum Model.
 *
 * @param {object} movieA - First movie data
 * @param {object} movieB - Second movie data
 * @param {Record<string, number>} [weights] - Criterion weights
 * @param {object} [preferences] - User preferences
 * @returns {object} Comprehensive duel result object
 */
export function compareDuel(movieA, movieB, weights = DEFAULT_WEIGHTS, preferences = {}) {
  if (!movieA || !movieB) {
    throw new Error('Both movieA and movieB are required for duel comparison.');
  }

  if (movieA.id && movieB.id && String(movieA.id) === String(movieB.id)) {
    throw new Error('Cannot duel a movie against itself. Movie A and Movie B must be different.');
  }

  const normalizedWeights = validateWeights(weights);
  const resultA = calculateScore(movieA, normalizedWeights, preferences);
  const resultB = calculateScore(movieB, normalizedWeights, preferences);

  const diff = parseFloat(Math.abs(resultA.totalScore - resultB.totalScore).toFixed(2));
  let winnerMovieId = null;
  let verdict = 'tie';

  if (diff > SCORE_THRESHOLD) {
    if (resultA.totalScore > resultB.totalScore) {
      winnerMovieId = movieA.id;
      verdict = 'movieA_wins';
    } else {
      winnerMovieId = movieB.id;
      verdict = 'movieB_wins';
    }
  }

  const explanation = generateExplanation(resultA, resultB, movieA, movieB);

  return {
    movieA: {
      id: movieA.id,
      title: movieA.title,
      poster_path: movieA.poster_path,
      score: resultA.totalScore,
      criterionScores: resultA.criterionScores,
      missingCriteria: resultA.missingCriteria
    },
    movieB: {
      id: movieB.id,
      title: movieB.title,
      poster_path: movieB.poster_path,
      score: resultB.totalScore,
      criterionScores: resultB.criterionScores,
      missingCriteria: resultB.missingCriteria
    },
    winnerMovieId,
    verdict,
    diff,
    explanation,
    normalizedWeights,
    threshold: SCORE_THRESHOLD
  };
}

export default {
  CRITERIA,
  DEFAULT_WEIGHTS,
  SCORE_THRESHOLD,
  validateWeights,
  normalizeRating,
  normalizeGenreMatch,
  normalizeRuntime,
  normalizePopularity,
  calculateScore,
  compareDuel,
  generateExplanation
};
