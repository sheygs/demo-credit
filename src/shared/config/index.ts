import 'dotenv/config';
import pkg from '../../../package.json';
import { Env, Config } from '../types';

export const config: Config = {
  app: {
    /**
     *  Project Name.
     */
    name: pkg.name,
    /**
     *  Package Version
     */
    version: pkg.version,
    /**
     *  Project Description.
     */
    description: pkg.description,
    /**
     *  Author.
     */
    author: pkg.author,
    /**
     *  Base URL.
     */
    baseUrl: process.env.BASE_URL,
    /**
     *  App Port.
     */
    port: process.env.NODE_PORT ?? 4000,
    /**
     *  Node Environment.
     */
    environment: process.env.NODE_ENV ?? Env.DEVELOPMENT,
    /**
     *  JWT Secret
     */
    jwtSecret: process.env.JWT_SECRET ?? '',
    /**
     *  JWT Secret Expiry
     */
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '',
  },
  database: {
    /**
     *  Database User
     */
    user: process.env.MYSQL_USER ?? 'mysql',
    /**
     *  Database Password
     */
    password: process.env.MYSQL_PASSWORD ?? '',
    /**
     *  Database Port
     */
    port: process.env.MYSQL_PORT ?? 5432,
    /**
     *  Database Host
     */
    host: process.env.MYSQL_HOST ?? 'localhost',
    /**
     *  Database Name
     */
    name: process.env.MYSQL_DATABASE ?? '',
  },
};
