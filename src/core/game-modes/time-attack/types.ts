import type { CardCatalog, CardId, Deck } from "../../cards";
import type { EndReason, GameStatus } from "../../game-engine/types";

export type TimeAttackGameConfig = {
  modeId: "time_attack";
  initialBoardSize: 12;
  dealExtraSize: 3;
  pointsPerSet: 1;
  durationMs: number;
  invalidSetPenaltyMs: number;
};

export const DEFAULT_TIME_ATTACK_CONFIG: TimeAttackGameConfig = {
  modeId: "time_attack",
  initialBoardSize: 12,
  dealExtraSize: 3,
  pointsPerSet: 1,
  durationMs: 60_000,
  invalidSetPenaltyMs: 3_000,
};

export type TimeAttackGameState = {
  modeId: "time_attack";
  status: GameStatus;
  endReason?: EndReason;
  config: TimeAttackGameConfig;
  catalog: CardCatalog;
  deck: Deck;
  board: CardId[];
  score: number;
  moves: number;
  validSetsFound: number;
  rngSeed: string;
  /** Wall-clock ms when the round ends (engine source of truth). */
  endsAtMs: number;
  dealExtraUses: number;
};
