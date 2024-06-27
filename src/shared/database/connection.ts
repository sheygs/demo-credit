import Knex from 'knex';
import { config } from '../config';
import knexConfigs from '../../../knexfile';

const { app } = config;

const appEnv = app.environment;

export const db = Knex(knexConfigs[appEnv]);
