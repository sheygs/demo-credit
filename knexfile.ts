import 'dotenv/config';
import type { Knex } from 'knex';
import { config } from './src/shared/config';

const {
  database: { host, port, user, password, name },
} = config;

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host,
      port: +port,
      user,
      password,
      database: name,
    },
    migrations: {
      directory: 'src/shared/database/migrations',
    },
    seeds: {
      directory: 'src/shared/database/seeds',
    },
  },
  // test: {},
  // production: {},
};

export default knexConfig;
