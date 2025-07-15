import type { SQLiteDatabase, ResultSet } from 'react-native-sqlite-storage';
import { openDatabase } from 'react-native-sqlite-storage';
import { v4 as uuidv4 } from 'uuid';
import { TaskPriority, TaskStatus } from '../types/Task.ts';

export type Task = {
  id: string;
  userId?: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  isSynced: 0 | 1;
};

export const getDBConnection = async (): Promise<SQLiteDatabase> => {
  return openDatabase({ name: 'tasks.db', location: 'default' });
};

export const createTask = async (
  db: SQLiteDatabase,
  task: Omit<Task, 'createdAt' | 'updatedAt' | 'isSynced'> &
    Partial<Pick<Task, 'id' | 'createdAt' | 'updatedAt' | 'isSynced'>>,
): Promise<void> => {
  const id = task.id ?? uuidv4();
  const createdAt = task.createdAt ?? new Date().toISOString();
  const updatedAt = task.updatedAt ?? createdAt;
  const isSynced = task.isSynced ?? 0;

  const query = `
    INSERT INTO tasks (id, title, description, status, priority, dueDate, createdAt, updatedAt, isSynced)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  await db.executeSql(query, [
    id,
    task.title,
    task.description ?? '',
    task.status ?? TaskStatus.PENDING,
    task.priority ?? TaskPriority.MEDIUM,
    task.dueDate ?? null,
    createdAt,
    updatedAt,
    isSynced,
  ]);
};

export const getTasks = async (db: SQLiteDatabase): Promise<Task[]> => {
  const results = await db.executeSql(
    'SELECT * FROM tasks ORDER BY createdAt DESC',
  );
  return mapResultsToTasks(results);
};

export const getTaskById = async (
  db: SQLiteDatabase,
  id: string,
): Promise<Task | null> => {
  const results = await db.executeSql('SELECT * FROM tasks WHERE id = ?', [id]);
  const tasks = mapResultsToTasks(results);
  return tasks.length > 0 ? tasks[0] : null;
};

export const updateTask = async (
  db: SQLiteDatabase,
  id: string,
  updates: Partial<Task>,
): Promise<void> => {
  const updatedAt = new Date().toISOString();
  const query = `
    UPDATE tasks
    SET title       = ?,
        description = ?,
        status      = ?,
        priority    = ?,
        dueDate     = ?,
        updatedAt   = ?,
        isSynced    = 0
    WHERE id = ?
  `;
  await db.executeSql(query, [
    updates.title,
    updates.description,
    updates.status,
    updates.priority,
    updates.dueDate ?? null,
    updatedAt,
    id,
  ]);
};

export const completeTask = async (
  db: SQLiteDatabase,
  id: string,
): Promise<void> => {
  const updatedAt = new Date().toISOString();
  await db.executeSql(
    `UPDATE tasks
     SET status    = 'COMPLETED',
         updatedAt = ?,
         isSynced  = 0
     WHERE id = ?`,
    [updatedAt, id],
  );
};

export const deleteTask = async (
  db: SQLiteDatabase,
  id: string,
): Promise<void> => {
  await db.executeSql('DELETE FROM tasks WHERE id = ?', [id]);
};

export const getUnsyncedTasks = async (db: SQLiteDatabase): Promise<Task[]> => {
  const results = await db.executeSql('SELECT * FROM tasks WHERE isSynced = 0');
  return mapResultsToTasks(results);
};

export const markTaskAsSynced = async (
  db: SQLiteDatabase,
  id: string,
): Promise<void> => {
  await db.executeSql('UPDATE tasks SET isSynced = 1 WHERE id = ?', [id]);
};

const mapResultsToTasks = (results: ResultSet[]): Task[] => {
  const tasks: Task[] = [];
  if (!results || results.length === 0) return tasks;

  for (const result of results) {
    for (let i = 0; i < result.rows.length; i++) {
      const item = result.rows.item(i);
      tasks.push({
        id: item.id,
        title: item.title,
        description: item.description,
        status: item.status,
        priority: item.priority,
        dueDate: item.dueDate,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        isSynced: item.isSynced as 0 | 1,
      });
    }
  }

  return tasks;
};
