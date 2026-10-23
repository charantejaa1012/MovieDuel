/**
 * @fileoverview MongoDB Database Connection with Mongoose.
 * Features automated retry logic, connection lifecycle logging,
 * and graceful shutdown handling.
 */

import mongoose from 'mongoose';
import config from './index.js';
import logger from '../utils/logger.js';

let isConnected = false;

/**
 * Connects to MongoDB with retry logic (up to maxRetries attempts).
 * @param {number} [maxRetries=3] - Maximum connection attempts
 * @param {number} [retryDelay=3000] - Delay between retries in milliseconds
 * @returns {Promise<typeof mongoose>}
 */
export async function connectDB(maxRetries = 3, retryDelay = 3000) {
  let attempts = 0;

  // Connection lifecycle listeners
  mongoose.connection.on('connected', () => {
    isConnected = true;
    logger.success(`MongoDB connected successfully to ${mongoose.connection.host}`);
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    logger.warn('MongoDB disconnected');
  });

  while (attempts < maxRetries) {
    try {
      attempts += 1;
      logger.info(`Attempting MongoDB connection (${attempts}/${maxRetries})...`);

      const conn = await mongoose.connect(config.mongoUri, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        maxPoolSize: 50,
        minPoolSize: 10,
        autoIndex: config.env !== 'production'
      });

      return conn;
    } catch (err) {
      logger.error(`MongoDB connection attempt ${attempts} failed: ${err.message}`);
      if (attempts >= maxRetries) {
        logger.error('Exhausted all MongoDB connection attempts.');
        if (!config.isTest) {
          // In non-test environment, we don't necessarily exit immediately if using fallbacks,
          // but we warn heavily or throw if strictly required.
          logger.warn('Proceeding without active MongoDB connection (degraded mode).');
        }
        break;
      }
      logger.info(`Retrying in ${retryDelay / 1000}s...`);
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
  }

  return mongoose;
}

/**
 * Gracefully closes the database connection.
 * @returns {Promise<void>}
 */
export async function closeDB() {
  if (isConnected) {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed gracefully.');
    } catch (err) {
      logger.error(`Error closing MongoDB connection: ${err.message}`);
    }
  }
}

export default connectDB;
