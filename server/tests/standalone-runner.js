/**
 * @fileoverview Standalone Verification Runner for Duel Engine using Node.js built-in assert module.
 * Can be run directly with: `node tests/standalone-runner.js`
 */

import assert from 'node:assert/strict';
import {
  validateWeights,
  normalizeRating,
  normalizeGenreMatch,
  normalizeRuntime,
  normalizePopularity,
  calculateScore,
  compareDuel,
  CRITERIA,
  DEFAULT_WEIGHTS,
  SCORE_THRESHOLD
} from '../src/services/duelEngine.js';

console.log('--- Running Duel Engine Standalone Test Suite ---');

// 1. Weight Validation
console.log('Testing: Weight validation normalizes to sum=1...');
const w = validateWeights({ genreMatch: 2, rating: 3, runtime: 1, popularity: 4 });
const sum = Object.values(w).reduce((a, b) => a + b, 0);
assert(Math.abs(sum - 1.0) <= 0.01, 'Weights must sum to 1.0');
assert.equal(w.genreMatch, 0.2);
assert.equal(w.rating, 0.3);

console.log('Testing: Negative weights rejected...');
assert.throws(() => validateWeights({ rating: -1 }), /Invalid weight/);

console.log('Testing: All-zero weights rejected...');
assert.throws(() => validateWeights({ genreMatch: 0, rating: 0, runtime: 0, popularity: 0 }), /All weights cannot be zero/);

// 2. Rating Normalization
console.log('Testing: Rating normalization (0-10 to 0-100)...');
assert.equal(normalizeRating(8.5, 500), 85);
assert.equal(normalizeRating(10.0, 500), 100);

console.log('Testing: Low vote count reduces score via confidence factor...');
assert.equal(normalizeRating(10.0, 25), 50); // 25/50 factor

// 3. Genre Match Normalization
console.log('Testing: Genre match full overlap = 100...');
assert.equal(normalizeGenreMatch([28, 12], [28, 12]), 100);

console.log('Testing: Genre match no overlap = 0...');
assert.equal(normalizeGenreMatch([28], [35]), 0);

console.log('Testing: Genre match partial overlap...');
assert.equal(normalizeGenreMatch([28, 12], [28, 35]), 33.33);

console.log('Testing: Genre match no preferred genres = 50...');
assert.equal(normalizeGenreMatch([28], []), 50);

// 4. Runtime Normalization
console.log('Testing: Runtime within range = 100...');
assert.equal(normalizeRuntime(100, { min: 90, max: 120 }), 100);

console.log('Testing: Runtime outside range decreases linearly...');
assert.equal(normalizeRuntime(150, { min: 90, max: 120 }), 70);

// 5. Popularity Normalization
console.log('Testing: Popularity logarithmic scaling...');
assert.equal(normalizePopularity(0), 0);
assert(normalizePopularity(999) > 99, 'Popularity 999 should be ~100');

// 6. Score Calculation & Missing Data
console.log('Testing: calculateScore missing data handling...');
const incompleteMovie = { id: 10, title: 'No Runtime', vote_average: 8.0, vote_count: 100, popularity: 50, runtime: null };
const scored = calculateScore(incompleteMovie, DEFAULT_WEIGHTS);
assert(scored.missingCriteria.includes(CRITERIA.RUNTIME));
assert(scored.totalScore >= 0 && scored.totalScore <= 100);

// 7. Duel Comparison
console.log('Testing: Same movie IDs rejected...');
assert.throws(() => compareDuel({ id: 1 }, { id: 1 }), /Cannot duel a movie against itself/);

console.log('Testing: Clear winner identification...');
const movieA = { id: 1, title: 'Movie A', vote_average: 9.0, vote_count: 1000, popularity: 200, runtime: 120, genre_ids: [28] };
const movieB = { id: 2, title: 'Movie B', vote_average: 5.0, vote_count: 100, popularity: 10, runtime: 90, genre_ids: [35] };
const duelResult = compareDuel(movieA, movieB, DEFAULT_WEIGHTS, { favoriteGenres: [28] });
assert.equal(duelResult.winnerMovieId, 1);
assert.equal(duelResult.verdict, 'movieA_wins');
assert(duelResult.diff > SCORE_THRESHOLD);
assert(duelResult.explanation.includes('Movie A'));

console.log('Testing: Close scores result in tie...');
const movieC = { id: 3, title: 'Twin C', vote_average: 8.0, vote_count: 500, popularity: 100, runtime: 110, genre_ids: [18] };
const movieD = { id: 4, title: 'Twin D', vote_average: 8.05, vote_count: 500, popularity: 100, runtime: 110, genre_ids: [18] };
const tieResult = compareDuel(movieC, movieD, DEFAULT_WEIGHTS, { favoriteGenres: [18] });
assert.equal(tieResult.winnerMovieId, null);
assert.equal(tieResult.verdict, 'tie');
assert(tieResult.diff <= SCORE_THRESHOLD);

console.log('Testing: Deterministic outputs...');
const d1 = compareDuel(movieA, movieB, DEFAULT_WEIGHTS);
const d2 = compareDuel(movieA, movieB, DEFAULT_WEIGHTS);
assert.deepEqual(d1.movieA.score, d2.movieA.score);
assert.deepEqual(d1.movieB.score, d2.movieB.score);

console.log('\n[PASS] All Standalone Duel Engine Tests Passed Successfully!');
