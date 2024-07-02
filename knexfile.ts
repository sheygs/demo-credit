import 'dotenv/config';
import type { Knex } from 'knex';
import { config, Env, logger, UtilService } from './src/shared';

const {
  database: { host, port, user, password, name },
} = config;

const environments: string[] = UtilService.getEnumValues(Env);

const connection: Knex.MySqlConnectionConfig = {
  host,
  port: +port,
  user,
  password,
  database: name,
};

const commonConfig: Knex.Config = {
  client: 'mysql2',
  connection,
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: 'src/shared/database/migrations',
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

const configs = Object.fromEntries(
  environments.map((env: string) => [env, commonConfig]),
);

export default configs;
