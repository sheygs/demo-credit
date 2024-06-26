import knex from 'knex';
import { config } from '../config';
import knexConfig from '../../../knexfile';

const { app } = config;

const nodeEnv = app.environment;

export const knexDb = knex(knexConfig[nodeEnv]);
