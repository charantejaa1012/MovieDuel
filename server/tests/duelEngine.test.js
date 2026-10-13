/**
 * @fileoverview Test Suite for Duel Engine (Weighted Sum Model).
 * Verifies weight normalization, criterion scoring algorithms,
 * tie thresholds, and explanation generation.
 */

import {
  validateWeights,
  normalizeRating,
  normalizeGenreMatch,
  normalizeRuntime,
  normalizePopularity,
  calculateScore,
  compareDuel,
  generateExplanation,
  CRITERIA,
  DEFAULT_WEIGHTS,
  SCORE_THRESHOLD
} from '../src/services/duelEngine.js';

describe('DuelEngine - Weighted Sum Model (WSM)', () => {
  describe('Weight Validation', () => {
    test('valid weights normalize to sum=1', () => {
      const customWeights = {
        genreMatch: 2,
        rating: 3,
        runtime: 1,
        popularity: 4
      };
      const normalized = validateWeights(customWeights);
      const sum = Object.values(normalized).reduce((acc, w) => acc + w, 0);

      expect(Math.abs(sum - 1.0)).toBeLessThanOrEqual(0.01);
      expect(normalized.genreMatch).toBe(0.2);
      expect(normalized.rating).toBe(0.3);
      expect(normalized.runtime).toBe(0.1);
      expect(normalized.popularity).toBe(0.4);
    });

    test('default weights normalize to sum=1', () => {
      const normalized = validateWeights();
      const sum = Object.values(normalized).reduce((acc, w) => acc + w, 0);
      expect(Math.abs(sum - 1.0)).toBeLessThanOrEqual(0.01);
    });

    test('negative weights rejected', () => {
      expect(() => {
        validateWeights({ rating: -0.5 });
      }).toThrow(/Invalid weight for 'rating'/i);
    });

    test('all-zero weights rejected', () => {
      expect(() => {
        validateWeights({
          genreMatch: 0,
          rating: 0,
          runtime: 0,
          popularity: 0
        });
      }).toThrow(/All weights cannot be zero/i);
    });
  });

  describe('Rating Normalization', () => {
    test('maps 0-10 scale to 0-100', () => {
      expect(normalizeRating(8.5, 1000)).toBe(85);
      expect(normalizeRating(10.0, 500)).toBe(100);
      expect(normalizeRating(0.0, 100)).toBe(0);
    });

    test('low vote count reduces score via confidence factor', () => {
      // 25 votes out of 50 threshold = 0.5 confidence factor
      // 10.0 / 10 * 100 * 0.5 = 50
      const score = normalizeRating(10.0, 25);
      expect(score).toBe(50);

      // 0 votes = 0 score
      expect(normalizeRating(10.0, 0)).toBe(0);
    });
  });

  describe('Genre Match Normalization', () => {
    test('full overlap = 100', () => {
      const score = normalizeGenreMatch([28, 12, 878], [28, 12, 878]);
      expect(score).toBe(100);
    });

    test('no overlap = 0', () => {
      const score = normalizeGenreMatch([28, 12], [35, 10749]);
      expect(score).toBe(0);
    });

    test('partial overlap proportional via Jaccard similarity', () => {
      // movie: [28, 12], pref: [28, 35] -> intersection: [28] (size 1), union: [28, 12, 35] (size 3)
      // Jaccard: 1/3 * 100 = 33.33
      const score = normalizeGenreMatch([28, 12], [28, 35]);
      expect(score).toBe(33.33);
    });

    test('no preferred genres = 50 (neutral)', () => {
      expect(normalizeGenreMatch([28, 12], [])).toBe(50);
      expect(normalizeGenreMatch([28, 12], null)).toBe(50);
      expect(normalizeGenreMatch([28, 12], undefined)).toBe(50);
    });
  });

  describe('Runtime Normalization', () => {
    const range = { min: 90, max: 120 };

    test('within range = 100', () => {
      expect(normalizeRuntime(90, range)).toBe(100);
      expect(normalizeRuntime(105, range)).toBe(100);
      expect(normalizeRuntime(120, range)).toBe(100);
    });

    test('outside range decreases linearly', () => {
      // 150 is 30 mins over max (120) -> 100 - 30 = 70
      expect(normalizeRuntime(150, range)).toBe(70);

      // 70 is 20 mins below min (90) -> 100 - 20 = 80
      expect(normalizeRuntime(70, range)).toBe(80);
    });

    test('no preference returns 50 (neutral)', () => {
      expect(normalizeRuntime(140, null)).toBe(50);
      expect(normalizeRuntime(140, {})).toBe(50);
    });
  });

  describe('Popularity Normalization', () => {
    test('logarithmic mapping scales smoothly', () => {
      expect(normalizePopularity(0)).toBe(0);
      expect(normalizePopularity(999)).toBeCloseTo(100, 0);

      const pop50 = normalizePopularity(50);
      const pop500 = normalizePopularity(500);
      expect(pop50).toBeGreaterThan(0);
      expect(pop500).toBeGreaterThan(pop50);
      expect(pop500).toBeLessThanOrEqual(100);
    });
  });

  describe('Movie Scoring & Missing Data', () => {
    test('score range is always between 0 and 100', () => {
      const movie = {
        id: 1,
        title: 'Sample Movie',
        vote_average: 8.4,
        vote_count: 5000,
        popularity: 150,
        runtime: 110,
        genre_ids: [28, 12]
      };
      const result = calculateScore(movie, DEFAULT_WEIGHTS, { favoriteGenres: [28] });
      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });

    test('missing data excludes criterion and renormalizes weights', () => {
      const movieWithoutRuntime = {
        id: 2,
        title: 'Incomplete Movie',
        vote_average: 8.0,
        vote_count: 200,
        popularity: 50,
        runtime: null, // Missing runtime
        genre_ids: [28]
      };

      const result = calculateScore(movieWithoutRuntime, DEFAULT_WEIGHTS);
      expect(result.missingCriteria).toContain(CRITERIA.RUNTIME);
      expect(result.criterionScores.runtime.available).toBe(false);

      // Remaining criteria weights should sum up to 1.0
      const activeWeightSum = Object.values(result.criterionScores)
        .filter((c) => c.available)
        .reduce((sum, c) => sum + c.weight, 0);

      expect(Math.abs(activeWeightSum - 1.0)).toBeLessThanOrEqual(0.01);
      expect(result.totalScore).toBeGreaterThan(0);
    });
  });

  describe('Duel Comparison Engine', () => {
    const movieA = {
      id: 101,
      title: 'Action Epic',
      vote_average: 8.8,
      vote_count: 10000,
      popularity: 350,
      runtime: 130,
      genre_ids: [28, 12]
    };

    const movieB = {
      id: 202,
      title: 'Indie Short',
      vote_average: 5.5,
      vote_count: 150,
      popularity: 20,
      runtime: 85,
      genre_ids: [35]
    };

    test('same movie IDs rejected with error', () => {
      expect(() => {
        compareDuel({ id: 101, title: 'Same A' }, { id: 101, title: 'Same B' });
      }).toThrow(/Cannot duel a movie against itself/i);
    });

    test('clear winner: higher score wins when diff > threshold', () => {
      const preferences = { favoriteGenres: [28, 12], preferredRuntime: { min: 120, max: 140 } };
      const duel = compareDuel(movieA, movieB, DEFAULT_WEIGHTS, preferences);

      expect(duel.winnerMovieId).toBe(movieA.id);
      expect(duel.verdict).toBe('movieA_wins');
      expect(duel.diff).toBeGreaterThan(SCORE_THRESHOLD);
      expect(duel.explanation).toContain(movieA.title);
    });

    test('close scores: tie when diff <= threshold', () => {
      const matchedMovie1 = {
        id: 301,
        title: 'Twin Movie 1',
        vote_average: 8.0,
        vote_count: 500,
        popularity: 100,
        runtime: 110,
        genre_ids: [18]
      };
      const matchedMovie2 = {
        id: 302,
        title: 'Twin Movie 2',
        vote_average: 8.1,
        vote_count: 520,
        popularity: 102,
        runtime: 112,
        genre_ids: [18]
      };

      const duel = compareDuel(matchedMovie1, matchedMovie2, DEFAULT_WEIGHTS, { favoriteGenres: [18] });

      expect(duel.diff).toBeLessThanOrEqual(SCORE_THRESHOLD);
      expect(duel.winnerMovieId).toBeNull();
      expect(duel.verdict).toBe('tie');
      expect(duel.explanation).toMatch(/tie threshold|remarkably well-matched/i);
    });

    test('deterministic: same inputs produce identical outputs', () => {
      const preferences = { favoriteGenres: [28] };
      const run1 = compareDuel(movieA, movieB, DEFAULT_WEIGHTS, preferences);
      const run2 = compareDuel(movieA, movieB, DEFAULT_WEIGHTS, preferences);

      expect(run1.movieA.score).toBe(run2.movieA.score);
      expect(run1.movieB.score).toBe(run2.movieB.score);
      expect(run1.winnerMovieId).toBe(run2.winnerMovieId);
      expect(run1.verdict).toBe(run2.verdict);
      expect(run1.diff).toBe(run2.diff);
    });

    test('explanation mentions winning criteria differences', () => {
      const preferences = { favoriteGenres: [28, 12] };
      const duel = compareDuel(movieA, movieB, DEFAULT_WEIGHTS, preferences);

      expect(duel.explanation).toBeDefined();
      expect(typeof duel.explanation).toBe('string');
      expect(duel.explanation.length).toBeGreaterThan(20);
      expect(duel.explanation).toContain(movieA.title);
    });
  });
});
