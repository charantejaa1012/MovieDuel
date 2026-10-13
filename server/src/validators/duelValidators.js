/**
 * @fileoverview Duel Validation Schemas using Zod.
 * Validates duel comparison requests and weight specifications.
 */

import { z } from 'zod';

export const compareSchema = z
  .object({
    movieAId: z.coerce
      .number({ required_error: 'movieAId is required' })
      .int('movieAId must be an integer')
      .positive('movieAId must be a positive integer'),
    movieBId: z.coerce
      .number({ required_error: 'movieBId is required' })
      .int('movieBId must be an integer')
      .positive('movieBId must be a positive integer'),
    weights: z
      .object({
        genreMatch: z.coerce.number().min(0, 'genreMatch weight cannot be negative').optional(),
        rating: z.coerce.number().min(0, 'rating weight cannot be negative').optional(),
        runtime: z.coerce.number().min(0, 'runtime weight cannot be negative').optional(),
        popularity: z.coerce.number().min(0, 'popularity weight cannot be negative').optional()
      })
      .optional(),
    preferences: z
      .object({
        favoriteGenres: z.array(z.coerce.number().int().positive()).optional(),
        preferredRuntime: z
          .object({
            min: z.coerce.number().min(0).max(600).optional(),
            max: z.coerce.number().min(0).max(600).optional()
          })
          .optional(),
        preferredLanguage: z.string().trim().length(2).optional()
      })
      .optional()
  })
  .refine((data) => data.movieAId !== data.movieBId, {
    message: 'movieAId and movieBId must be different movies',
    path: ['movieBId']
  });

export default {
  compareSchema
};
