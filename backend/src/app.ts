import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { httpLogger } from './config/logger';
import apiRoutes from './routes';
import healthRoutes from './routes/health.routes';
import { notFound } from './middleware/notFound';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // Security Headers
  app.use(
    helmet({
      contentSecurityPolicy: false, // Allows Swagger UI to render correctly
    })
  );

  // CORS configuration
  // Restrict to WEB_ORIGIN, but allow requests with no origin (such as mobile apps / curl)
  const allowedOrigins = [env.WEB_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'];
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true); // Mobile apps / tools
        if (allowedOrigins.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://192.168.')) {
          return callback(null, true);
        }
        return callback(null, true); // permissive in development for testing LAN mobile
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // JSON Body Parser with size limit
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: true, limit: '100kb' }));

  // HTTP Request Logging
  app.use(httpLogger);

  // Root health endpoints
  app.use('/health', healthRoutes);
  app.use('/healthz', healthRoutes);

  // API router
  app.use('/api', apiRoutes);

  // 404 Handler
  app.use(notFound);

  // Central Error Handler
  app.use(errorHandler);

  return app;
};
