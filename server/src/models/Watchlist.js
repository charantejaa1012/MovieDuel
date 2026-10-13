/**
 * @fileoverview Watchlist Mongoose Model.
 * Represents a saved movie in a user's personal watchlist.
 */

import mongoose from 'mongoose';

const WatchlistSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    movieId: {
      type: Number,
      required: [true, 'Movie ID is required']
    },
    movieTitle: {
      type: String,
      default: ''
    },
    moviePoster: {
      type: String,
      default: null
    },
    movieRating: {
      type: Number,
      default: null
    },
    movieYear: {
      type: String,
      default: null
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: false
  }
);

// Compound unique index ensuring a user cannot save the same movie twice
WatchlistSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export const Watchlist = mongoose.model('Watchlist', WatchlistSchema);
export default Watchlist;
