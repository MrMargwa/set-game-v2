import mysql from "mysql2/promise";
import { getServerEnv } from "../configuration/env";

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool | null {
  const env = getServerEnv();
  if (!env.DATABASE_URL) {
    return null;
  }

  if (!pool) {
    pool = mysql.createPool(env.DATABASE_URL);
  }

  return pool;
}

export async function pingDatabase(): Promise<boolean> {
  const activePool = getPool();
  if (!activePool) {
    return false;
  }

  try {
    const connection = await activePool.getConnection();
    await connection.ping();
    connection.release();
    return true;
  } catch {
    return false;
  }
}
