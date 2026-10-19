import 'server-only';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from './schema';

/**
 * The server's database connection. DATABASE_URL is Supabase's pooled connection string
 * (Transaction mode, port 6543), so `prepare: false` is required. Server only: never imported by
 * client code, and the browser never sees this URL.
 */

const globalForDb = globalThis;

export function isDatabaseConfigured() {
  return Boolean(process.env.DATABASE_URL);
}

export function getDb() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set');
  // One client per server process; dev hot reloads would otherwise open a new pool each time
  if (!globalForDb.__netzSql) {
    globalForDb.__netzSql = postgres(process.env.DATABASE_URL, { prepare: false, max: 5 });
  }
  return drizzle(globalForDb.__netzSql, { schema });
}
