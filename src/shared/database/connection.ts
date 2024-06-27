import Knex from 'knex';
import { config } from '../config';
import knexConfigs from '../../../knexfile';

const { app } = config;

const appEnv = app.environment;

console.log({ appEnv, knexConfigs });

export const db = Knex(knexConfigs[appEnv]);
