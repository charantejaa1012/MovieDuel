/**
 * @fileoverview Review Mongoose Model.
 * Represents community movie reviews and ratings (1 to 10 scale).
 */

import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true
    },
    userEmail: {
      type: String,
      trim: true
    },
    movieId: {
      type: Number,
      required: [true, 'Movie ID is required'],
      index: true
    },
    movieTitle: {
      type: String,
      default: ''
    },
    moviePoster: {
      type: String,
      default: null
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required (1-10)'],
      min: [1, 'Minimum rating is 1'],
      max: [10, 'Maximum rating is 10']
    },
    reviewText: {
      type: String,
      required: [true, 'Review text is required'],
      trim: true,
      minlength: [5, 'Review must be at least 5 characters long'],
      maxlength: [2000, 'Review cannot exceed 2000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Compound indexes for performant lookups and uniqueness per user/movie
ReviewSchema.index({ movieId: 1, createdAt: -1 });
ReviewSchema.index({ userId: 1, movieId: 1 }, { unique: true });

export const Review = mongoose.model('Review', ReviewSchema);
export default Review;
