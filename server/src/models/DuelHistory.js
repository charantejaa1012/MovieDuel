/**
 * @fileoverview DuelHistory Mongoose Model.
 * Persists results and weighting breakdowns of movie vs movie comparisons.
 */

import mongoose from 'mongoose';

const DuelHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    movieAId: {
      type: Number,
      required: [true, 'movieAId is required']
    },
    movieBId: {
      type: Number,
      required: [true, 'movieBId is required']
    },
    movieATitle: {
      type: String,
      default: ''
    },
    movieBTitle: {
      type: String,
      default: ''
    },
    weights: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    scores: {
      movieA: { type: Number, required: true },
      movieB: { type: Number, required: true }
    },
    criterionScores: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    winnerMovieId: {
      type: Number,
      default: null
    },
    verdict: {
      type: String,
      default: ''
    },
    preferences: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true
    }
  },
  {
    timestamps: false
  }
);

export const DuelHistory = mongoose.model('DuelHistory', DuelHistorySchema);
export default DuelHistory;
