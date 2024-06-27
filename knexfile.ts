import 'dotenv/config';
import type { Knex } from 'knex';
import { config, Env, UtilService } from './src/shared';

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
    directory: './src/shared/database/migrations',
  },
  seeds: {
    directory: './src/shared/database/seeds',
  },
  log: {
    warn(message: any) {
      // eslint-disable-next-line no-console
      console.log({ message });
    },
    error(message: any) {
      // eslint-disable-next-line no-console
      console.log({ message });
    },
    debug(message: any) {
      // eslint-disable-next-line no-console
      console.log({ message });
    },
    enableColors: true,
  },
};

const configs = Object.fromEntries(
  environments.map((env: string) => [env, commonConfig]),
);

export default configs;
