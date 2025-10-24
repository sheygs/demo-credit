import 'dotenv/config';
import type { Knex } from 'knex';
import { config } from './src/shared/config';
import { logger } from './src/shared/utils/logger';

const {
  database: { host, port, user, password, name },
} = config;

const mysqlConnection: Knex.MySql2ConnectionConfig = {
  host,
  port: +port,
  user,
  password,
  database: name,
};

const commonConfig: Knex.Config = {
  client: 'mysql2',
  connection: mysqlConnection,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: 'src/shared/database/migrations',
    extension: 'sql', // Use .sql files for MySQL
  },
  seeds: {
    directory: 'src/shared/database/seeds',
  },
  log: {
    warn(message: any) {
      logger.warn(JSON.stringify(message));
    },
    error(message: any) {
      logger.error(JSON.stringify(message));
    },
    debug(message: any) {
      logger.debug(JSON.stringify(message));
    },
    enableColors: true,
  },
};

// Use SQLite for test environment (no separate database server needed)
const testConfig: Knex.Config = {
  client: 'better-sqlite3',
  connection: {
    filename: ':memory:', // In-memory database for fast tests
  },
  useNullAsDefault: true, // SQLite requires this
  migrations: {
    directory: 'src/shared/database/migrations',
    extension: 'ts', // Use .ts migration files for SQLite
    loadExtensions: ['.ts'],
  },
  seeds: {
    directory: 'src/shared/database/seeds',
  },
  log: {
    warn(message: any) {
      logger.warn(JSON.stringify(message));
    },
    error(message: any) {
      logger.error(JSON.stringify(message));
    },
    debug(message: any) {
      logger.debug(JSON.stringify(message));
    },
    enableColors: true,
  },
};

const configs: Record<string, Knex.Config> = {
  development: commonConfig,
  test: testConfig,
  production: commonConfig,
};

export default configs;
