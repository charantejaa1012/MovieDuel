/**
 * @fileoverview Application Configuration Module.
 * Loads environment variables, validates required parameters,
 * and exports strongly typed runtime configurations.
 */

import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

/**
 * Validates required environment variables on startup.
 * Throws a descriptive error if critical configuration values are missing.
 */
function validateConfig() {
  const isProduction = process.env.NODE_ENV === 'production';
  const requiredInProduction = ['JWT_SECRET', 'MONGODB_URI'];

  if (isProduction) {
    const missing = requiredInProduction.filter((key) => !process.env[key]);
    if (missing.length > 0) {
      throw new Error(
        `[ConfigError] Missing required production environment variables: ${missing.join(', ')}`
      );
    }
  }
}

validateConfig();

/**
 * Application configuration object.
 */
export const config = {
  env: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/movie-duel',
  tmdb: {
    apiKey: process.env.TMDB_API_KEY || '',
    accessToken: process.env.TMDB_ACCESS_TOKEN || '',
    baseUrl: 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p/w500',
    backdropBaseUrl: 'https://image.tmdb.org/t/p/original'
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'movie_duel_dev_secret_key_change_in_production_12345',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  cors: {
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173'
  }
};

export default config;
