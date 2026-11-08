import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { getEnv } from "../config/env.js";

const { Pool } = pg;

let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (pool) return pool;
  const env = getEnv();
  pool = new Pool({
    connectionString: env.DATABASE_URL,
    min: 5,
    max: 20,
  });
  return pool;
}

export function getDb() {
  return drizzle(getPool());
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
