/**
 * @fileoverview Authentication Validation Schemas using Zod.
 * Validates registration and login payloads.
 */

import { z } from 'zod';

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, 'Name must be at least 2 characters long')
    .max(50, 'Name cannot exceed 50 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      passwordRegex,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    )
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email('Please provide a valid email address')
    .toLowerCase(),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, 'Password cannot be empty')
});

export default {
  registerSchema,
  loginSchema
};
