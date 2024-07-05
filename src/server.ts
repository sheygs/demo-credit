import { hostname } from 'os';
import express from 'express';
import { createServer, Server } from 'http';
import { config, exitLog } from './shared';

const {
  app: { environment, port },
} = config;

export const startServer = (app: express.Application): Server => {
  const httpServer = createServer(app);

  process
    .on('SIGINT', () => exitLog(null, 'SIGINT'))
    .on('SIGQUIT', () => exitLog(null, 'SIGQUIT'))
    .on('SIGTERM', () => exitLog(null, 'SIGTERM'))
    .on('uncaughtException', (error) => exitLog(error, 'uncaughtException'))
    .on('beforeExit', () => exitLog(null, 'beforeExit'))
    .on('exit', () => exitLog(null, 'exit'));

  return httpServer.listen({ port }, (): void => {
    process.stdout.write(`⚙️ Env: ${environment}\n`);
    process.stdout.write(`⏱ Started on: ${Date.now()}\n`);
    process.stdout.write(
      `🚀 demo-credit api running on http://${hostname()}:${port}\n`,
    );
  });
};
