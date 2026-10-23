/**
 * @fileoverview Express Rate Limiting Middleware.
 * Provides rate limiters for general API traffic, sensitive auth routes,
 * and computationally heavy duel operations.
 */

import rateLimit from 'express-rate-limit';
import config from '../config/index.js';

/**
 * Standard message formatter for rate limits
 */
const rateLimitHandler = (message) => (req, res) => {
  res.status(429).json({
    status: 'error',
    statusCode: 429,
    message
  });
};

/**
 * General API Limiter: 600 requests per 15 minutes (scaled for high concurrency)
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isTest ? 1000 : 600,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many requests from this IP, please try again in 15 minutes.'),
  skip: () => config.isTest
});

/**
 * Auth Limiter: 20 requests per 15 minutes (for login and registration)
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isTest ? 1000 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many authentication attempts, please try again in 15 minutes.'),
  skip: () => config.isTest
});

/**
 * Duel Limiter: 30 requests per 15 minutes
 */
export const duelLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.isTest ? 1000 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler('Too many duel comparisons requested, please try again in 15 minutes.'),
  skip: () => config.isTest
});

export default {
  generalLimiter,
  authLimiter,
  duelLimiter
};
