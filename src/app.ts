import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import express, { Application as App, urlencoded, json } from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerDocument from '../swagger.json';
import { config, Env, defaultErrorHandler } from './shared';
import { indexRouter as indexRoute } from './shared/routes';
import { generalRateLimiter } from './shared/config/rate-limit';

export const middlewares = (app: App): express.Application => {
  app.enable('trust proxy');
  app.use(compression());

  // SECURITY FIX: Configure CORS properly - restrict origins in production
  app.use(
    cors({
      origin:
        config.app.environment === Env.PRODUCTION
          ? process.env.ALLOWED_ORIGINS?.split(',') || 'https://yourdomain.com'
          : '*', // Allow all in dev/test
      credentials: true,
      optionsSuccessStatus: 200,
    }),
  );

  app.use(helmet());

  // Reduce request size limit to 10mb to prevent DoS attacks - fintech apps rarely need large payloads
  app.use(json({ limit: '10mb' }));
  app.use(
    urlencoded({
      extended: true,
      limit: '10mb',
    }),
  );

  // SECURITY: Apply general rate limiting to all routes
  app.use(generalRateLimiter);

  if (config.app.environment !== Env.TEST) {
    app.use(morgan('dev'));
  }

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  app.use(indexRoute);
  defaultErrorHandler(app);

  return app;
};
