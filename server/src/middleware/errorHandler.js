/**
 * @fileoverview Global Error Handler Middleware.
 * Catches Mongoose errors, Zod validation errors, JWT exceptions,
 * and uncaught exceptions, formatting them cleanly for the client.
 */

import { ZodError } from 'zod';
import logger from '../utils/logger.js';
import config from '../config/index.js';

/**
 * Express global error handling middleware.
 * @param {Error} err - Captured error instance
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next handler
 */
export function errorHandler(err, req, res, next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Log error details
  logger.error(`[${req.method} ${req.originalUrl}] ${err.name || 'Error'}: ${err.message}`);
  if (!config.isProduction && err.stack) {
    logger.debug(err.stack);
  }

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    statusCode = 400;
    const detailList = err.errors.map((e) => e.message);
    message = detailList.join('. ') || 'Validation Error';
    errors = err.errors.map((e) => ({
      path: e.path.join('.'),
      message: e.message,
      code: e.code
    }));
  }

  // 2. Mongoose Validation Error
  else if (err.name === 'ValidationError' && err.errors) {
    statusCode = 400;
    message = 'Database Validation Error';
    errors = Object.values(err.errors).map((val) => ({
      path: val.path,
      message: val.message,
      kind: val.kind
    }));
  }

  // 3. Mongoose CastError (invalid ObjectId, number, etc.)
  else if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field: ${err.path}`;
    errors = [{ path: err.path, value: err.value, message: 'Invalid format or type' }];
  }

  // 4. Mongoose Duplicate Key Error (E11000)
  else if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : 'value';
    message = `A resource with ${field} '${value}' already exists.`;
    errors = [{ field, message: `${field} must be unique` }];
  }

  // 5. JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  // 6. Express SyntaxError (e.g. malformed JSON body)
  else if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Malformed JSON request body';
  }

  const responsePayload = {
    status: 'error',
    statusCode,
    message
  };

  if (errors) {
    responsePayload.errors = errors;
  }

  // Never expose raw stack traces in production
  if (!config.isProduction && err.stack) {
    responsePayload.stack = err.stack;
  }

  return res.status(statusCode).json(responsePayload);
}

export default errorHandler;
