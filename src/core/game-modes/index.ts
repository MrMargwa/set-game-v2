export {
  applyGameAction,
  createInitialState,
  getGameLegalHints,
  isGameModeId,
  listGameModes,
  parseGameModeId,
} from "./registry";
export type { GameContext, GameModeId, GameModeMeta, GameState } from "./types";
export { classicMode } from "./classic/mode";
export { timeAttackMode } from "./time-attack/mode";
export {
  getRemainingMs,
  type TimeAttackGameState,
} from "./time-attack";
