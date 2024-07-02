import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { config } from '../config';
import { logger } from '../utils';

const {
  database: { host, user, password, name, port },
} = config;

// directory containing the migration files
const migrationsDir = path.join(__dirname, '..', 'database/migrations');

// get migration files from the directory
const getMigrationFiles = (dir: string) => {
  return fs
    .readdirSync(dir)
    .filter((file) => path.extname(file).toLowerCase() === '.sql')
    .map((file) => path.join(dir, file));
};

// execute a migration file
const executeMigration = async (
  connection: mysql.Connection,
  file: fs.PathOrFileDescriptor,
) => {
  const migrationSQL = fs.readFileSync(file, 'utf8');
  await connection.query(migrationSQL);
};

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

    // Close the connection
    await connection.end();

    logger.info('connection closed');
  } catch (error) {
    logger.error(JSON.stringify(error));
  }
})();
