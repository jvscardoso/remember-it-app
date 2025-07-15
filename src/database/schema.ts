import type { SQLiteDatabase } from 'react-native-sqlite-storage';

export const createTables = async (db: SQLiteDatabase) => {
  const query = `
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT,
      priority TEXT,
      dueDate TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      isSynced INTEGER DEFAULT 0
    );
  `;
  await db.executeSql(query);
};
