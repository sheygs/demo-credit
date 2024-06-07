import 'module-alias/register';

import { hostname } from 'os';
import express, { Express } from 'express';
import { createServer } from 'http';
import { config } from './shared/config';
import { middlewares } from './app';
import { exitLog } from './shared/utils';

const {
  app: { env, port },
} = config;

const app: Express = express();

middlewares(app);

const server = createServer(app);

process
  .on('SIGINT', () => exitLog(null, 'SIGINT'))
  .on('SIGQUIT', () => exitLog(null, 'SIGQUIT'))
  .on('SIGTERM', () => exitLog(null, 'SIGTERM'))
  .on('uncaughtException', (error) => exitLog(error, 'uncaughtException'))
  .on('beforeExit', () => exitLog(null, 'beforeExit'))
  .on('exit', () => exitLog(null, 'exit'));

server.listen({ port }, (): void => {
  process.stdout.write(`⚙️ Env: ${env}\n`);
  process.stdout.write(`⏱ Started on: ${Date.now()}\n`);
  process.stdout.write(
    `🚀 ethereum-tracker-api server ready at http://${hostname()}:${port}\n`,
  );
});

export { server };
