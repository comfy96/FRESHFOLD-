import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

export interface PickupRequestRow {
  id: number;
  customer_name: string;
  phone: string;
  item_count: number;
  service_mode: string;
  notes: string;
  created_at: string;
}

export function getDb(): DatabaseSync {
  const rawUrl = process.env.DATABASE_URL?.trim();
  if (!rawUrl) {
    throw new Error('DATABASE_URL environment variable is missing or empty.');
  }

  const dbPath = path.isAbsolute(rawUrl)
    ? rawUrl
    : path.resolve(process.cwd(), rawUrl);

  const db = new DatabaseSync(dbPath);
  db.exec(`
    CREATE TABLE IF NOT EXISTS pickup_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      item_count INTEGER NOT NULL,
      service_mode TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );
    CREATE TABLE IF NOT EXISTS customer_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      full_name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      docket_number INTEGER NOT NULL,
      claim_pin TEXT NOT NULL,
      password TEXT NOT NULL,
      terms_accepted INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
    );
  `);
  return db;
}

