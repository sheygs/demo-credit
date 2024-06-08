import cors from 'cors';
import { join } from 'path';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import express, { Application } from 'express';
import { config, Env, defaultErrorHandler } from './shared';
// import indexRoute from './routes';

export const middlewares = (app: Application): express.Application => {
  const publicDirPath = join(__dirname, '../public');

  app.use(express.static(publicDirPath));

  app.enable('trust proxy');
  app.use(compression());
  app.use(cors());
  app.use(helmet());

  app.use(express.json({ limit: '100mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(
    express.urlencoded({
      extended: true,
      limit: '100mb',
    }),
  );

  if (config.app.env !== Env.TEST) {
    app.use(morgan('dev'));
  }

  // app.use(indexRoute);
  defaultErrorHandler(app);

  return app;
};
