import Knex from 'knex';
import { config } from '../config';
import configs from '../../../knexfile';

const { app } = config;

const environment = app.environment;

const knexConfig = configs[environment];

export const db = Knex(knexConfig);
