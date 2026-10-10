import type { GameModeId } from "@/core/game-modes";

export type ModeStatistics = {
  modeId: GameModeId;
  gamesPlayed: number;
  bestScore: number;
  averageScore: number;
  totalValidSets: number;
  totalMoves: number;
  lastPlayedAt: Date | null;
};

export type UserStatistics = {
  totalGamesPlayed: number;
  byMode: ModeStatistics[];
};
