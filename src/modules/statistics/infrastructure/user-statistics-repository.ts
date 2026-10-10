import type { RowDataPacket } from "mysql2";
import { listGameModes, type GameModeId } from "@/core/game-modes";
import { getPool } from "@/infrastructure/database/client";
import type { UserId } from "@/modules/accounts/domain/user";
import type { ModeStatistics, UserStatistics } from "../domain/types";

type ModeStatsRow = RowDataPacket & {
  mode_id: string;
  games_played: number;
  best_score: number | null;
  average_score: number | null;
  total_valid_sets: number | null;
  total_moves: number | null;
  last_played_at: Date | null;
};

export class UserStatisticsRepository {
  async getForUser(userId: UserId): Promise<UserStatistics> {
    const pool = getPool();
    if (!pool) {
      throw new Error("Database not available");
    }

    const [rows] = await pool.execute<ModeStatsRow[]>(
      `SELECT
         mode_id,
         COUNT(*) AS games_played,
         MAX(final_score) AS best_score,
         AVG(final_score) AS average_score,
         SUM(valid_sets_found) AS total_valid_sets,
         SUM(moves) AS total_moves,
         MAX(ended_at) AS last_played_at
       FROM game_sessions
       WHERE user_id = ? AND ended_at IS NOT NULL
       GROUP BY mode_id`,
      [userId],
    );

    const byModeId = new Map(rows.map((row) => [row.mode_id, row]));
    const modes = listGameModes().map((m) => m.id);

    const byMode: ModeStatistics[] = modes.map((modeId) => {
      const row = byModeId.get(modeId);
      if (!row || row.games_played === 0) {
        return emptyModeStats(modeId);
      }
      return {
        modeId,
        gamesPlayed: Number(row.games_played),
        bestScore: Number(row.best_score ?? 0),
        averageScore: Math.round(Number(row.average_score ?? 0) * 10) / 10,
        totalValidSets: Number(row.total_valid_sets ?? 0),
        totalMoves: Number(row.total_moves ?? 0),
        lastPlayedAt: row.last_played_at ? new Date(row.last_played_at) : null,
      };
    });

    const totalGamesPlayed = byMode.reduce((sum, m) => sum + m.gamesPlayed, 0);

    return { totalGamesPlayed, byMode };
  }
}

function emptyModeStats(modeId: GameModeId): ModeStatistics {
  return {
    modeId,
    gamesPlayed: 0,
    bestScore: 0,
    averageScore: 0,
    totalValidSets: 0,
    totalMoves: 0,
    lastPlayedAt: null,
  };
}
