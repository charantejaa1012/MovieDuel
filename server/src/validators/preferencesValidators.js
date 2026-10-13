/**
 * @fileoverview User Preferences Validation Schemas using Zod.
 * Validates updates to user genre affinities and movie filtering preferences.
 */

import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  favoriteGenres: z
    .array(z.coerce.number().int().positive())
    .max(10, 'Cannot select more than 10 favorite genres')
    .optional(),
  preferences: z
    .object({
      preferredRuntime: z
        .object({
          min: z.coerce.number().min(0, 'min runtime must be at least 0').max(500, 'min runtime cannot exceed 500').nullable().optional(),
          max: z.coerce.number().min(0, 'max runtime must be at least 0').max(500, 'max runtime cannot exceed 500').nullable().optional()
        })
        .nullable()
        .optional(),
      preferredLanguage: z.string().trim().length(2, 'preferredLanguage must be a 2-letter ISO code').nullable().optional(),
      releasePeriod: z
        .object({
          from: z.coerce.number().min(1900).max(2030).nullable().optional(),
          to: z.coerce.number().min(1900).max(2030).nullable().optional()
        })
        .nullable()
        .optional(),
      ratingMin: z.coerce.number().min(0).max(10).nullable().optional()
    })
    .optional()
});

export default {
  updatePreferencesSchema
};
