import {
  applyGameAction,
  createInitialState,
  getGameLegalHints,
  type GameContext,
  type GameModeId,
  type GameState,
} from "@/core/game-modes";
import type { ApplyResult, GameAction, LegalHints } from "@/core";

export function startGame(modeId: GameModeId, seed?: string): GameState {
  return createInitialState(modeId, seed, { nowMs: Date.now() });
}

export function performGameAction(
  state: GameState,
  action: GameAction,
  context?: GameContext,
): ApplyResult<GameState> {
  return applyGameAction(state, action, context);
}

export function getBoardLegalHints(state: GameState): LegalHints {
  return getGameLegalHints(state);
}
