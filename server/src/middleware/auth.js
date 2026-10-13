/**
 * @fileoverview Authentication Middleware.
 * Provides JWT extraction, verification, and role/user attachment.
 * Includes both strict authentication and optional authentication middleware.
 */

import jwt from 'jsonwebtoken';
import config from '../config/index.js';
import { error } from '../utils/apiResponse.js';

/**
 * Strict authentication middleware.
 * Expects an 'Authorization: Bearer <token>' header.
 * Attaches decoded user payload ({ id, email, name }) to req.user.
 * Rejects unauthenticated requests with 401.
 *
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next handler
 */
export function auth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return error(res, 'Authentication token required', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return error(res, 'Malformed authorization header', 401);
    }

    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = {
      id: decoded.id || decoded.sub,
      email: decoded.email,
      name: decoded.name
    };

    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return error(res, 'Authentication token has expired', 401);
    }
    if (err.name === 'JsonWebTokenError') {
      return error(res, 'Invalid authentication token', 401);
    }
    return error(res, 'Authentication failed', 401);
  }
}

/**
 * Optional authentication middleware.
 * If token is present and valid, sets req.user.
 * If token is missing or invalid, sets req.user = null and continues without error.
 *
 * @param {import('express').Request} req - Express request
 * @param {import('express').Response} res - Express response
 * @param {import('express').NextFunction} next - Express next handler
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret);
    req.user = {
      id: decoded.id || decoded.sub,
      email: decoded.email,
      name: decoded.name
    };
  } catch (err) {
    // If token is invalid or expired, continue as guest/anonymous
    req.user = null;
  }

  return next();
}

export default {
  auth,
  optionalAuth
};
