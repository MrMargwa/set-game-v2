import type { RowDataPacket } from "mysql2";
import type { GameModeId } from "@/core/game-modes";
import { getPool } from "@/infrastructure/database/client";
import type { LeaderboardEntry, LeaderboardScope } from "../domain/types";

type LeaderboardRow = RowDataPacket & {
  user_id: string;
  username: string;
  final_score: number;
  valid_sets_found: number;
  moves: number;
  ended_at: Date;
};

export class LeaderboardRepository {
  async list(
    modeId: GameModeId,
    scope: LeaderboardScope,
    limit: number,
  ): Promise<LeaderboardEntry[]> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database not available");
    }

    const cappedLimit = Math.min(Math.max(limit, 1), 100);

    const [rows] =
      scope === "personal_best"
        ? await pool.execute<LeaderboardRow[]>(
            `WITH ranked AS (
               SELECT
                 gs.user_id,
                 u.username,
                 gs.final_score,
                 gs.valid_sets_found,
                 gs.moves,
                 gs.ended_at,
                 ROW_NUMBER() OVER (
                   PARTITION BY gs.user_id
                   ORDER BY gs.final_score DESC, gs.valid_sets_found DESC, gs.ended_at ASC
                 ) AS rn
               FROM game_sessions gs
               INNER JOIN users u ON u.id = gs.user_id
               WHERE gs.mode_id = ?
                 AND gs.user_id IS NOT NULL
                 AND gs.ended_at IS NOT NULL
             )
             SELECT user_id, username, final_score, valid_sets_found, moves, ended_at
             FROM ranked
             WHERE rn = 1
             ORDER BY final_score DESC, valid_sets_found DESC, ended_at ASC
             LIMIT ?`,
            [modeId, cappedLimit],
          )
        : await pool.execute<LeaderboardRow[]>(
            `SELECT gs.user_id, u.username, gs.final_score, gs.valid_sets_found, gs.moves, gs.ended_at
             FROM game_sessions gs
             INNER JOIN users u ON u.id = gs.user_id
             WHERE gs.mode_id = ?
               AND gs.user_id IS NOT NULL
               AND gs.ended_at IS NOT NULL
             ORDER BY gs.final_score DESC, gs.valid_sets_found DESC, gs.ended_at ASC
             LIMIT ?`,
            [modeId, cappedLimit],
          );

    return rows.map((row, index) => ({
      rank: index + 1,
      userId: row.user_id,
      username: row.username,
      finalScore: row.final_score,
      validSetsFound: row.valid_sets_found,
      moves: row.moves,
      endedAt: new Date(row.ended_at),
    }));
  }
}
