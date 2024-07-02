import mysql from 'mysql2/promise';
import { config } from '../config';
import { logger, MigrationManager } from '../utils';

const {
  database: { host, user, password, name, port },
} = config;

const { getMigrationDirectory, executeMigration, getMigrationFiles } =
  MigrationManager;

// directory containing the migration files
const migrationsDir = getMigrationDirectory('database/migrations');

(async () => {
  try {
    // get migration files
    const migrationFiles = getMigrationFiles(migrationsDir);

    // create a MySQL connection with multiple statements enabled
    const connection = await mysql.createConnection({
      host,
      user,
      password,
      database: name,
      port: +port,
      multipleStatements: true,
    });

    logger.info('connected to the database');

    // execute all migration files in parallel
    await Promise.all(
      migrationFiles.map((file) => executeMigration(connection, file)),
    );

    logger.info('all migrations executed ✅');

    // close the connection
    await connection.end();

    logger.info('connection closed');
  } catch (error) {
    logger.error(JSON.stringify(error));
  }
})();
