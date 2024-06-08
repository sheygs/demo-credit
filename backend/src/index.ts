require('module-alias/register');

import { hostname } from 'os';
import express, { Express } from 'express';
import { createServer } from 'http';
import { middlewares } from './app';
import { config, exitLog } from './shared';

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
    `🚀 finpay-api server running on http://${hostname()}:${port}\n`,
  );
});

export { server };
