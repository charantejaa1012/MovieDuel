/**
 * @fileoverview User Mongoose Model.
 * Represents registered users with profile information, movie preferences,
 * and encrypted authentication credentials.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [emailRegex, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false
    },
    favoriteGenres: {
      type: [Number],
      default: []
    },
    preferences: {
      preferredRuntime: {
        min: { type: Number, default: null },
        max: { type: Number, default: null }
      },
      preferredLanguage: {
        type: String,
        default: null
      },
      releasePeriod: {
        from: { type: Number, default: null },
        to: { type: Number, default: null }
      },
      ratingMin: {
        type: Number,
        default: null
      }
    }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.passwordHash;
        delete ret.__v;
        return ret;
      }
    }
  }
);

/**
 * Pre-save hook to hash password using bcrypt with 12 salt rounds when modified.
 */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(12);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

/**
 * Compares candidate plain text password with stored bcrypt hash.
 * @param {string} candidatePassword - Password to test
 * @returns {Promise<boolean>}
 */
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

export const User = mongoose.model('User', UserSchema);
export default User;
