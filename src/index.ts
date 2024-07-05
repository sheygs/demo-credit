import express from 'express';
import { middlewares } from './app';
import { startServer } from './server';
import { Env } from '../src/shared';

if (process.env.NODE_ENV !== Env.TEST) {
  const app = middlewares(express());
  startServer(app);
}
