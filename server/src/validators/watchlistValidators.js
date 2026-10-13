/**
 * @fileoverview Watchlist Validation Schemas using Zod.
 * Validates adding and batch checking items in watchlists.
 */

import { z } from 'zod';

export const addToWatchlistSchema = z.object({
  movieId: z.coerce
    .number({ required_error: 'movieId is required' })
    .int('movieId must be an integer')
    .positive('movieId must be a positive integer'),
  movieTitle: z.string().trim().optional(),
  moviePoster: z.string().trim().nullable().optional(),
  movieRating: z.coerce.number().min(0).max(10).nullable().optional(),
  movieYear: z.string().trim().nullable().optional()
});

export const checkMultipleSchema = z.object({
  movieIds: z
    .array(z.coerce.number().int().positive())
    .min(1, 'movieIds array cannot be empty')
    .max(100, 'Cannot check more than 100 movieIds at once')
});

export default {
  addToWatchlistSchema,
  checkMultipleSchema
};
