/**
 * @fileoverview User Preferences Controller.
 * Manages user preference settings such as favorite genres, target runtimes, and languages.
 */

import User from '../models/User.js';
import { success, error } from '../utils/apiResponse.js';

/**
 * Retrieves the current user's favorite genres and customized preferences.
 * @route GET /api/preferences
 */
export async function getPreferences(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('favoriteGenres preferences');
    if (!user) {
      return error(res, 'User not found', 404);
    }

    return success(
      res,
      {
        favoriteGenres: user.favoriteGenres || [],
        preferences: user.preferences || {}
      },
      'User preferences retrieved successfully'
    );
  } catch (err) {
    return next(err);
  }
}

/**
 * Updates the current user's favorite genres and customized preferences.
 * @route PUT /api/preferences
 */
export async function updatePreferences(req, res, next) {
  try {
    const { favoriteGenres, preferences } = req.body;

    const updateFields = {};
    if (favoriteGenres !== undefined) {
      updateFields.favoriteGenres = favoriteGenres;
    }
    if (preferences !== undefined) {
      updateFields.preferences = preferences;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateFields },
      { new: true, runValidators: true }
    ).select('favoriteGenres preferences');

    if (!updatedUser) {
      return error(res, 'User not found', 404);
    }

    return success(
      res,
      {
        favoriteGenres: updatedUser.favoriteGenres,
        preferences: updatedUser.preferences
      },
      'Preferences updated successfully'
    );
  } catch (err) {
    return next(err);
  }
}

export default {
  getPreferences,
  updatePreferences
};
