/**
 * @fileoverview Authentication Controller.
 * Handles user registration, credentials verification, JWT generation,
 * profile retrieval, and logout responses.
 */

import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import config from '../config/index.js';
import { success, error } from '../utils/apiResponse.js';

/**
 * Generates signed JWT authentication token for a user.
 * @param {object} user - User document
 * @returns {string} Signed JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn }
  );
}

/**
 * Registers a new user account.
 * @route POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return error(res, 'An account with this email address already exists.', 409);
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      passwordHash: password
    });

    await user.save();

    const token = generateToken(user);
    const userPayload = user.toJSON();

    return success(
      res,
      {
        user: userPayload,
        token
      },
      'User registered successfully',
      201
    );
  } catch (err) {
    return next(err);
  }
}

/**
 * Authenticates user credentials and returns session token.
 * @route POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    // Must explicitly select passwordHash since it is configured with select: false
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
    if (!user) {
      return error(res, 'Invalid email or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return error(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user);
    const userPayload = user.toJSON();

    return success(
      res,
      {
        user: userPayload,
        token
      },
      'Logged in successfully'
    );
  } catch (err) {
    return next(err);
  }
}

/**
 * Acknowledges user logout.
 * Note: JWT tokens are stateless; client clears local storage.
 * @route POST /api/auth/logout
 */
export async function logout(req, res) {
  return success(res, null, 'Logged out successfully');
}

/**
 * Retrieves the currently authenticated user's complete profile.
 * @route GET /api/auth/me
 */
export async function getMe(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return error(res, 'Unauthorized', 401);
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return error(res, 'User profile not found', 404);
    }

    return success(res, { user }, 'User profile retrieved');
  } catch (err) {
    return next(err);
  }
}

export default {
  register,
  login,
  logout,
  getMe
};
