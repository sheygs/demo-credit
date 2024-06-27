import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import express, { Application as App, urlencoded, json } from 'express';
import {
  config,
  Env,
  defaultErrorHandler,
  indexRouter as indexRoute,
} from './shared';

export const middlewares = (app: App): express.Application => {
  app.enable('trust proxy');
  app.use(compression());
  app.use(cors());
  app.use(helmet());

  app.use(json({ limit: '100mb' }));
  app.use(
    urlencoded({
      extended: true,
      limit: '100mb',
    }),
  );

  if (config.app.environment !== Env.TEST) {
    app.use(morgan('dev'));
  }

  app.use(indexRoute);
  defaultErrorHandler(app);

  return app;
};
