import * as SQLite from 'expo-sqlite';
import { Person, Note, Interaction, AppSettings, NotificationSettings } from '../types';

const DB_NAME = 'tend.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DB_NAME);
    await initDatabase();
  }
  return db;
}

async function initDatabase(): Promise<void> {
  if (!db) return;

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS persons (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      photo TEXT,
      relationshipType TEXT NOT NULL,
      frequency TEXT NOT NULL,
      lastContactDate TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      personId TEXT NOT NULL,
      content TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (personId) REFERENCES persons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS interactions (
      id TEXT PRIMARY KEY,
      personId TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      note TEXT,
      FOREIGN KEY (personId) REFERENCES persons(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      notificationsEnabled INTEGER DEFAULT 1,
      quietHoursStart TEXT DEFAULT '22:00',
      quietHoursEnd TEXT DEFAULT '08:00',
      preferredTime TEXT DEFAULT '09:00',
      quietDays TEXT DEFAULT '[]'
    );

    INSERT OR IGNORE INTO settings (id) VALUES (1);
  `);
}

// Person CRUD operations
export async function getAllPersons(): Promise<Person[]> {
  const database = await getDatabase();
  const persons = await database.getAllAsync<any>('SELECT * FROM persons ORDER BY name');

  const result: Person[] = [];
  for (const person of persons) {
    const notes = await database.getAllAsync<Note>(
      'SELECT id, content, createdAt FROM notes WHERE personId = ? ORDER BY createdAt DESC',
      [person.id]
    );
    const interactions = await database.getAllAsync<Interaction>(
      'SELECT id, type, date, note FROM interactions WHERE personId = ? ORDER BY date DESC',
      [person.id]
    );
    result.push({
      ...person,
      notes,
      interactions,
    });
  }

  return result;
}

export async function getPersonById(id: string): Promise<Person | null> {
  const database = await getDatabase();
  const person = await database.getFirstAsync<any>(
    'SELECT * FROM persons WHERE id = ?',
    [id]
  );

  if (!person) return null;

  const notes = await database.getAllAsync<Note>(
    'SELECT id, content, createdAt FROM notes WHERE personId = ? ORDER BY createdAt DESC',
    [person.id]
  );
  const interactions = await database.getAllAsync<Interaction>(
    'SELECT id, type, date, note FROM interactions WHERE personId = ? ORDER BY date DESC',
    [person.id]
  );

  return {
    ...person,
    notes,
    interactions,
  };
}

export async function createPerson(person: Omit<Person, 'notes' | 'interactions'>): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `INSERT INTO persons (id, name, photo, relationshipType, frequency, lastContactDate, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [person.id, person.name, person.photo || null, person.relationshipType, person.frequency, person.lastContactDate, person.createdAt]
  );
}

export async function updatePerson(person: Partial<Person> & { id: string }): Promise<void> {
  const database = await getDatabase();
  const updates: string[] = [];
  const values: any[] = [];

  if (person.name !== undefined) {
    updates.push('name = ?');
    values.push(person.name);
  }
  if (person.photo !== undefined) {
    updates.push('photo = ?');
    values.push(person.photo);
  }
  if (person.relationshipType !== undefined) {
    updates.push('relationshipType = ?');
    values.push(person.relationshipType);
  }
  if (person.frequency !== undefined) {
    updates.push('frequency = ?');
    values.push(person.frequency);
  }
  if (person.lastContactDate !== undefined) {
    updates.push('lastContactDate = ?');
    values.push(person.lastContactDate);
  }

  if (updates.length > 0) {
    values.push(person.id);
    await database.runAsync(
      `UPDATE persons SET ${updates.join(', ')} WHERE id = ?`,
      values
    );
  }
}

export async function deletePerson(id: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM notes WHERE personId = ?', [id]);
  await database.runAsync('DELETE FROM interactions WHERE personId = ?', [id]);
  await database.runAsync('DELETE FROM persons WHERE id = ?', [id]);
}

// Notes operations
export async function addNote(personId: string, note: Note): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO notes (id, personId, content, createdAt) VALUES (?, ?, ?, ?)',
    [note.id, personId, note.content, note.createdAt]
  );
}

export async function deleteNote(noteId: string): Promise<void> {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM notes WHERE id = ?', [noteId]);
}

// Interactions operations
export async function addInteraction(personId: string, interaction: Interaction): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    'INSERT INTO interactions (id, personId, type, date, note) VALUES (?, ?, ?, ?, ?)',
    [interaction.id, personId, interaction.type, interaction.date, interaction.note || null]
  );

  // Update lastContactDate
  await database.runAsync(
    'UPDATE persons SET lastContactDate = ? WHERE id = ?',
    [interaction.date, personId]
  );
}

// Settings operations
export async function getSettings(): Promise<AppSettings> {
  const database = await getDatabase();
  const row = await database.getFirstAsync<any>('SELECT * FROM settings WHERE id = 1');

  return {
    notifications: {
      enabled: row?.notificationsEnabled === 1,
      quietHoursStart: row?.quietHoursStart || '22:00',
      quietHoursEnd: row?.quietHoursEnd || '08:00',
      preferredTime: row?.preferredTime || '09:00',
      quietDays: JSON.parse(row?.quietDays || '[]'),
    },
  };
}

export async function updateSettings(settings: AppSettings): Promise<void> {
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE settings SET
      notificationsEnabled = ?,
      quietHoursStart = ?,
      quietHoursEnd = ?,
      preferredTime = ?,
      quietDays = ?
    WHERE id = 1`,
    [
      settings.notifications.enabled ? 1 : 0,
      settings.notifications.quietHoursStart,
      settings.notifications.quietHoursEnd,
      settings.notifications.preferredTime,
      JSON.stringify(settings.notifications.quietDays),
    ]
  );
}

export async function exportAllData(): Promise<{ persons: Person[]; settings: AppSettings }> {
  const persons = await getAllPersons();
  const settings = await getSettings();
  return { persons, settings };
}
