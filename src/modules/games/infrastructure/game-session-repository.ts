import type { RowDataPacket } from "mysql2";
import { getPool } from "@/infrastructure/database/client";
import type { UserId } from "@/modules/accounts/domain/user";

export type GameSessionSummary = {
  id: string;
  modeId: string;
  finalScore: number;
  validSetsFound: number;
  moves: number;
  endReason: string | null;
  rngSeed: string | null;
  startedAt: Date;
  endedAt: Date;
};

type GameSessionRow = RowDataPacket & {
  id: string;
  mode_id: string;
  final_score: number | null;
  valid_sets_found: number;
  moves: number;
  end_reason: string | null;
  rng_seed: string | null;
  started_at: Date;
  ended_at: Date | null;
};

function mapRow(row: GameSessionRow): GameSessionSummary {
  return {
    id: row.id,
    modeId: row.mode_id,
    finalScore: row.final_score ?? 0,
    validSetsFound: row.valid_sets_found,
    moves: row.moves,
    endReason: row.end_reason,
    rngSeed: row.rng_seed,
    startedAt: new Date(row.started_at),
    endedAt: row.ended_at ? new Date(row.ended_at) : new Date(),
  };
}

export type RecordGameSessionInput = {
  userId: UserId;
  modeId: string;
  finalScore: number;
  validSetsFound: number;
  moves: number;
  endReason: string;
  rngSeed: string;
  startedAt: Date;
  endedAt: Date;
};

export class GameSessionRepository {
  async recordCompleted(input: RecordGameSessionInput): Promise<string> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database not available");
    }

    const id = crypto.randomUUID();
    await pool.execute(
      `INSERT INTO game_sessions (
        id, user_id, mode_id, final_score, valid_sets_found, moves,
        end_reason, rng_seed, started_at, ended_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        input.userId,
        input.modeId,
        input.finalScore,
        input.validSetsFound,
        input.moves,
        input.endReason,
        input.rngSeed,
        input.startedAt,
        input.endedAt,
      ],
    );

    return id;
  }

  async listForUser(userId: UserId, limit = 20): Promise<GameSessionSummary[]> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database not available");
    }

    const [rows] = await pool.execute<GameSessionRow[]>(
      `SELECT id, mode_id, final_score, valid_sets_found, moves, end_reason,
              rng_seed, started_at, ended_at
       FROM game_sessions
       WHERE user_id = ?
       ORDER BY ended_at DESC
       LIMIT ?`,
      [userId, limit],
    );

    return rows.map(mapRow);
  }
}
