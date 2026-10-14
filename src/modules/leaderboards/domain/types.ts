import type { GameModeId } from "@/core/game-modes";
import type { UserId } from "@/modules/accounts/domain/user";

export type LeaderboardScope = "personal_best" | "top_runs";

export type LeaderboardEntry = {
  rank: number;
  userId: UserId;
  username: string;
  finalScore: number;
  validSetsFound: number;
  moves: number;
  endedAt: Date;
};

export type LeaderboardResult = {
  modeId: GameModeId;
  scope: LeaderboardScope;
  entries: LeaderboardEntry[];
};

export type FastestClearEntry = {
  rank: number;
  userId: UserId;
  username: string;
  finalScore: number;
  validSetsFound: number;
  durationMs: number;
};
