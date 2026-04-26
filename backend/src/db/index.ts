import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { getConfig } from '../config/index.js';

const { Pool } = pg;

let pool: pg.Pool | null = null;
let db: ReturnType<typeof drizzle> | null = null;

let initPromise: Promise<ReturnType<typeof drizzle>> | null = null;

export async function initDatabase() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const config = getConfig();
    const isNeon = config.DATABASE_URL?.includes('neon.tech');

    pool = new Pool({
      connectionString: config.DATABASE_URL,
      ssl: isNeon ? { rejectUnauthorized: false } : undefined,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    db = drizzle(pool);
    
    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });

    try {
      const client = await pool.connect();
      console.log('Database connection verified');
      client.release();
    } catch (err) {
      console.error('Failed to connect to the database:', err);
      initPromise = null; // Allow retry
      throw err;
    }

    return db;
  })();

  return initPromise;
}

export function getDb() {
  if (!db) {
    throw new Error('Database not initialized. Call await initDatabase() first.');
  }
  return db;
}

export function getPool() {
  if (!pool) {
    throw new Error('Database pool not initialized. Call initDatabase() first.');
  }
  return pool;
}

export async function closeDatabase() {
  if (pool) {
    await pool.end();
    pool = null;
    db = null;
  }
}