import knex from 'knex';
import { config } from '../config';
import knexConfig from '../../../knexfile';

const { app } = config;

const environment = app.env;

export const knexInstance = knex(knexConfig[environment]);
