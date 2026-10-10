import type { RowDataPacket } from "mysql2";
import { getPool } from "@/infrastructure/database/client";
import type { User, UserId } from "../domain/user";

type UserRow = RowDataPacket & {
  id: string;
  username: string;
  email: string | null;
  password_hash: string;
  created_at: Date;
};

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    createdAt: new Date(row.created_at),
  };
}

export type CreateUserInput = {
  id: UserId;
  username: string;
  email: string | null;
  passwordHash: string;
};

export class UserRepository {
  async create(input: CreateUserInput): Promise<User> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database not available — set DATABASE_URL in .env");
    }

    const now = new Date();
    await pool.execute(
      `INSERT INTO users (id, username, email, password_hash, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        input.id,
        input.username,
        input.email,
        input.passwordHash,
        now,
        now,
      ],
    );

    return {
      id: input.id,
      username: input.username,
      email: input.email,
      createdAt: now,
    };
  }

  async findByUsername(username: string): Promise<(User & { passwordHash: string }) | null> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database not available — set DATABASE_URL in .env");
    }

    const [rows] = await pool.execute<UserRow[]>(
      `SELECT id, username, email, password_hash, created_at
       FROM users WHERE username = ? LIMIT 1`,
      [username],
    );

    const row = rows[0];
    if (!row) {
      return null;
    }

    return {
      ...mapUser(row),
      passwordHash: row.password_hash,
    };
  }

  async findById(id: UserId): Promise<User | null> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database not available — set DATABASE_URL in .env");
    }

    const [rows] = await pool.execute<UserRow[]>(
      `SELECT id, username, email, created_at
       FROM users WHERE id = ? LIMIT 1`,
      [id],
    );

    const row = rows[0];
    return row ? mapUser(row) : null;
  }
}
