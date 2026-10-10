import type { ApplyResult, GameAction, LegalHints } from "../game-engine";
import { classicMode } from "./classic/mode";
import type { GameContext, GameModeId, GameModeMeta, GameState } from "./types";
import { timeAttackMode } from "./time-attack/mode";

const modes = {
  classic: classicMode,
  time_attack: timeAttackMode,
} as const;

export function isGameModeId(value: string): value is GameModeId {
  return value === "classic" || value === "time_attack";
}

export function parseGameModeId(value: string | undefined): GameModeId {
  if (value && isGameModeId(value)) {
    return value;
  }
  return "classic";
}

export function listGameModes(): GameModeMeta[] {
  return Object.values(modes).map((mode) => ({
    id: mode.id,
    displayName: mode.displayName,
    description: mode.description,
  }));
}

export function createInitialState(
  modeId: GameModeId,
  seed?: string,
  context?: GameContext,
): GameState {
  switch (modeId) {
    case "classic":
      return modes.classic.createInitialState(seed, context);
    case "time_attack":
      return modes.time_attack.createInitialState(seed, context);
  }
}

export function applyGameAction(
  state: GameState,
  action: GameAction,
  context?: GameContext,
): ApplyResult<GameState> {
  switch (state.modeId) {
    case "classic":
      return modes.classic.applyAction(state, action, context);
    case "time_attack":
      return modes.time_attack.applyAction(state, action, context);
  }
}

export function getGameLegalHints(state: GameState): LegalHints {
  switch (state.modeId) {
    case "classic":
      return modes.classic.getLegalHints(state);
    case "time_attack":
      return modes.time_attack.getLegalHints(state);
  }
}
