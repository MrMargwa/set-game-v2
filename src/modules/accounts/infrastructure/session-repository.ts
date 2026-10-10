import type { RowDataPacket } from "mysql2";
import { getPool } from "@/infrastructure/database/client";
import type { UserId } from "../domain/user";

type SessionRow = RowDataPacket & {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
};

export type SessionRecord = {
  id: string;
  userId: UserId;
  tokenHash: string;
  expiresAt: Date;
};

export class SessionRepository {
  async create(input: {
    id: string;
    userId: UserId;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database not available");
    }

    await pool.execute(
      `INSERT INTO sessions (id, user_id, token_hash, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [input.id, input.userId, input.tokenHash, input.expiresAt, new Date()],
    );
  }

  async findByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database not available");
    }

    const [rows] = await pool.execute<SessionRow[]>(
      `SELECT id, user_id, token_hash, expires_at
       FROM sessions WHERE token_hash = ? LIMIT 1`,
      [tokenHash],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      id: row.id,
      userId: row.user_id,
      tokenHash: row.token_hash,
      expiresAt: new Date(row.expires_at),
    };
  }

  async deleteByTokenHash(tokenHash: string): Promise<void> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database not available");
    }

    await pool.execute(`DELETE FROM sessions WHERE token_hash = ?`, [tokenHash]);
  }
}
