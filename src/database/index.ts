import SQLite, { SQLiteDatabase } from 'react-native-sqlite-storage';
import { createTables } from './schema';

SQLite.enablePromise(true);

export const getDBConnection = async (): Promise<SQLiteDatabase> => {
  return SQLite.openDatabase({ name: 'tasks.db', location: 'default' });
};

export const initDatabase = async (): Promise<SQLiteDatabase> => {
  const db = await getDBConnection();
  await createTables(db);
  return db;
};
