import type { RowDataPacket } from "mysql2";
import { getPool } from "@/infrastructure/database/client";
import {
  parsePersistedState,
  toClientSnapshot,
  type PersistedMultiplayerState,
} from "../domain/game-state-serialization";
import type { MultiplayerGameRecord } from "../domain/types";

type GameDbRow = RowDataPacket & {
  id: string;
  lobby_id: string;
  mode_id: string;
  version: number;
  status: "playing" | "ended";
  state_json: unknown;
};

export class MultiplayerGameRepository {
  async create(
    lobbyId: string,
    modeId: string,
    initialState: PersistedMultiplayerState,
  ): Promise<MultiplayerGameRecord> {
    const pool = getPool();
    if (!pool) throw new Error("Database not available");

    const id = crypto.randomUUID();
    const now = new Date();
    await pool.execute(
      `INSERT INTO multiplayer_games (id, lobby_id, mode_id, version, status, state_json, created_at, updated_at)
       VALUES (?, ?, ?, 0, 'playing', ?, ?, ?)`,
      [id, lobbyId, modeId, JSON.stringify(initialState), now, now],
    );

    return {
      id,
      lobbyId,
      modeId,
      version: 0,
      status: "playing",
      state: toClientSnapshot(initialState),
    };
  }

  async getById(gameId: string): Promise<MultiplayerGameRecord | null> {
    const pool = getPool();
    if (!pool) throw new Error("Database not available");

    const [rows] = await pool.execute<GameDbRow[]>(
      `SELECT id, lobby_id, mode_id, version, status, state_json
       FROM multiplayer_games WHERE id = ? LIMIT 1`,
      [gameId],
    );
    const row = rows[0];
    if (!row) return null;

    const persisted = parsePersistedState(row.state_json);
    return {
      id: row.id,
      lobbyId: row.lobby_id,
      modeId: row.mode_id,
      version: row.version,
      status: row.status,
      state: toClientSnapshot(persisted),
    };
  }

  async getPersistedState(gameId: string): Promise<{
    version: number;
    status: "playing" | "ended";
    state: PersistedMultiplayerState;
  } | null> {
    const pool = getPool();
    if (!pool) throw new Error("Database not available");

    const [rows] = await pool.execute<GameDbRow[]>(
      `SELECT version, status, state_json FROM multiplayer_games WHERE id = ? LIMIT 1`,
      [gameId],
    );
    const row = rows[0];
    if (!row) return null;

    return {
      version: row.version,
      status: row.status,
      state: parsePersistedState(row.state_json),
    };
  }

  async updateWithVersion(
    gameId: string,
    expectedVersion: number,
    nextState: PersistedMultiplayerState,
    nextStatus: "playing" | "ended",
  ): Promise<{ ok: true; version: number } | { ok: false }> {
    const pool = getPool();
    if (!pool) throw new Error("Database not available");

    const nextVersion = expectedVersion + 1;
    const [result] = await pool.execute(
      `UPDATE multiplayer_games
       SET version = ?, status = ?, state_json = ?, updated_at = ?
       WHERE id = ? AND version = ?`,
      [
        nextVersion,
        nextStatus,
        JSON.stringify(nextState),
        new Date(),
        gameId,
        expectedVersion,
      ],
    );

    const affected = (result as { affectedRows?: number }).affectedRows ?? 0;
    if (affected === 0) {
      return { ok: false };
    }

    return { ok: true, version: nextVersion };
  }
}
