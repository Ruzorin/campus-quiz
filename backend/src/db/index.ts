import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { drizzle as drizzleBetterSqlite } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

let db: any;

if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('turso.io')) {
  // Use LibSQL/Turso for production
  console.log('🔌 Connecting to Turso/LibSQL...');
  const client = createClient({
    url: process.env.DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
  db = drizzle(client, { schema });
} else {
  // Use Better-SQLite3 for local development
  console.log('📂 Using Local SQLite (game.db)...');
  const sqlite = new Database('game.db');
  db = drizzleBetterSqlite(sqlite, { schema });
}

export { db };
