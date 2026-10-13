/**
 * @fileoverview Recommendation Controller.
 * Delivers personalized or curated movie recommendations with transparent ranking reasons.
 */

import recommendationEngine from '../services/recommendationEngine.js';
import User from '../models/User.js';
import { success } from '../utils/apiResponse.js';
import logger from '../utils/logger.js';

/**
 * Retrieves recommended movies.
 * Returns personalized recommendations if user is authenticated,
 * or general curated recommendations if anonymous.
 * @route GET /api/recommendations
 */
export async function getRecommendations(req, res, next) {
  try {
    const limit = parseInt(req.query.limit || '12', 10);
    let userRecord = null;

    if (req.user && req.user.id) {
      try {
        userRecord = await User.findById(req.user.id);
      } catch (err) {
        logger.warn(`Could not load user record for recommendations: ${err.message}`);
      }
    }

    const recommendations = await recommendationEngine.getRecommendations(userRecord, { limit });

    return success(
      res,
      {
        recommendations,
        isPersonalized: !!userRecord,
        count: recommendations.length
      },
      'Recommendations retrieved successfully'
    );
  } catch (err) {
    return next(err);
  }
}

export default {
  getRecommendations
};
