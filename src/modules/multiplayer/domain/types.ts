import type { CardId, EndReason, GameStatus } from "@/core";
import type { UserId } from "@/modules/accounts/domain/user";

export type MultiplayerPlayer = {
  userId: UserId;
  username: string;
  score: number;
  validSetsFound: number;
  currentStreak: number;
  maxStreak: number;
};

export type MultiplayerRules = {
  mode: "classic" | "time_attack";
  scoring: "streak" | "flat";
  timeLimitSeconds: number | null;
  targetSets: number | null;
  allowDealExtra: boolean;
  dealExtraSize: number;
  deckSize: number;
  boardColumns: number;
  initialBoardSize: number;
  startedAt: string;
};

export const DEFAULT_MULTIPLAYER_RULES: MultiplayerRules = {
  mode: "classic",
  scoring: "streak",
  timeLimitSeconds: null,
  targetSets: null,
  allowDealExtra: true,
  dealExtraSize: 3,
  deckSize: 81,
  boardColumns: 5,
  initialBoardSize: 12,
  startedAt: "",
};

export type MultiplayerClassicSnapshot = {
  modeId: "classic";
  status: GameStatus;
  endReason?: EndReason;
  rngSeed: string;
  board: CardId[];
  deckCount: number;
  moves: number;
  players: MultiplayerPlayer[];
  lastSetByUserId?: UserId;
  rules: MultiplayerRules;
};

export type MultiplayerGameRecord = {
  id: string;
  lobbyId: string;
  modeId: string;
  version: number;
  status: "playing" | "ended";
  state: MultiplayerClassicSnapshot;
};
