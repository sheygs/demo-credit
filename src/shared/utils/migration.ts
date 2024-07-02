import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

class MigrationManager {
  static getMigrationDirectory(directoryPath: string) {
    return path.join(__dirname, '..', directoryPath);
  }

  static getMigrationFiles(dir: string) {
    return fs
      .readdirSync(dir)
      .filter((file) => path.extname(file).toLowerCase() === '.sql')
      .map((file) => path.join(dir, file));
  }

  static async executeMigration(
    connection: mysql.Connection,
    file: fs.PathOrFileDescriptor,
  ) {
    const migrationSQL = fs.readFileSync(file, 'utf8');
    await connection.query(migrationSQL);
  }
}

export { MigrationManager };
