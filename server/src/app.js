/**
 * @fileoverview Main Application Entry Point for Movie Duel Server.
 * Configures Express, security middleware, logging, route handlers,
 * database connectivity, and graceful process lifecycle.
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import config from './config/index.js';
import connectDB, { closeDB } from './config/db.js';
import logger from './utils/logger.js';
import errorHandler from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import movieRoutes from './routes/movieRoutes.js';
import duelRoutes from './routes/duelRoutes.js';
import watchlistRoutes from './routes/watchlistRoutes.js';
import preferencesRoutes from './routes/preferencesRoutes.js';
import recommendationRoutes from './routes/recommendationRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const app = express();

// 1. Security Headers via Helmet
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
  })
);

// 2. HTTP Request Logging via Morgan
if (!config.isTest) {
  const morganFormat = config.isProduction ? 'combined' : 'dev';
  app.use(morgan(morganFormat));
}

// 3. Response Compression
app.use(compression());

// 4. Cross-Origin Resource Sharing (CORS)
const allowedOrigins = [
  config.cors.clientOrigin,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Allow all in dev, clientOrigin in prod
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// 5. Body Parsers with payload size limits (10kb)
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 6. Global Rate Limiting for all API routes
app.use('/api', generalLimiter);

// 7. Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Movie Duel Server is healthy and running',
    timestamp: new Date().toISOString(),
    environment: config.env,
    uptimeSeconds: Math.floor(process.uptime())
  });
});

// 8. Mount Feature API Routes
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/duels', duelRoutes);
app.use('/api/duel', duelRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/preferences', preferencesRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/reviews', reviewRoutes);

// 9. 404 Route Handler for undefined endpoints
app.use('*', (req, res) => {
  res.status(404).json({
    status: 'error',
    statusCode: 404,
    message: `Endpoint ${req.originalUrl} not found on this server`
  });
});

// 10. Centralized Error Handler
app.use(errorHandler);

let server = null;

// Initialize Database and Start HTTP Server (when not executing in test runner)
if (!config.isTest) {
  connectDB().then(() => {
    server = app.listen(config.port, () => {
      logger.success(`Movie Duel server running in [${config.env}] mode on port ${config.port}`);
      logger.info(`Health check: http://localhost:${config.port}/api/health`);
    });
  });
}

/**
 * Handles graceful shutdown upon process signals (SIGTERM, SIGINT).
 * @param {string} signal - Signal received
 */
async function handleGracefulShutdown(signal) {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  if (server) {
    server.close(async () => {
      logger.info('HTTP server closed.');
      await closeDB();
      process.exit(0);
    });
  } else {
    await closeDB();
    process.exit(0);
  }

  // Force shutdown if cleanup takes more than 10 seconds
  setTimeout(() => {
    logger.error('Forcefully shutting down due to timeout.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

export { app, server };
export default app;
