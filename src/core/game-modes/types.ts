import type {
  ApplyResult,
  ClassicGameState,
  GameAction,
  LegalHints,
} from "../game-engine";
import type { TimeAttackGameState } from "./time-attack/types";

export type GameModeId = "classic" | "time_attack";

export type GameState = ClassicGameState | TimeAttackGameState;

export type GameContext = {
  nowMs?: number;
};

export type GameModeDefinition<S extends GameState = GameState> = {
  id: GameModeId;
  displayName: string;
  description: string;
  createInitialState: (seed?: string, context?: GameContext) => S;
  applyAction: (
    state: S,
    action: GameAction,
    context?: GameContext,
  ) => ApplyResult<S>;
  getLegalHints: (state: S) => LegalHints;
};

export type GameModeMeta = {
  id: GameModeId;
  displayName: string;
  description: string;
};
