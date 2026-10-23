/**
 * @fileoverview Duel Validation Schemas using Zod.
 * Validates duel comparison requests and weight specifications.
 */

import { z } from 'zod';

export const compareSchema = z
  .object({
    movieAId: z.coerce.number().int().positive().optional(),
    movie1Id: z.coerce.number().int().positive().optional(),
    movieBId: z.coerce.number().int().positive().optional(),
    movie2Id: z.coerce.number().int().positive().optional(),
    weights: z
      .object({
        genreMatch: z.coerce.number().min(0, 'genreMatch weight cannot be negative').optional(),
        rating: z.coerce.number().min(0, 'rating weight cannot be negative').optional(),
        runtime: z.coerce.number().min(0, 'runtime weight cannot be negative').optional(),
        popularity: z.coerce.number().min(0, 'popularity weight cannot be negative').optional(),
        critic: z.coerce.number().min(0).optional(),
        audience: z.coerce.number().min(0).optional(),
        story: z.coerce.number().min(0).optional(),
        visuals: z.coerce.number().min(0).optional()
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
  .refine((data) => {
    const a = data.movieAId || data.movie1Id;
    const b = data.movieBId || data.movie2Id;
    return a && b && a !== b;
  }, {
    message: 'Both movies must be selected and must be different',
    path: ['movieBId']
  });

export default {
  compareSchema
};
