import { createInitialClassicState } from "../../game-engine";
import {
  DEFAULT_TIME_ATTACK_CONFIG,
  type TimeAttackGameConfig,
  type TimeAttackGameState,
} from "./types";

export function createInitialTimeAttackState(
  seed = `${Date.now()}`,
  config: TimeAttackGameConfig = DEFAULT_TIME_ATTACK_CONFIG,
  nowMs = Date.now(),
): TimeAttackGameState {
  const classic = createInitialClassicState(seed, {
    modeId: "classic",
    initialBoardSize: config.initialBoardSize,
    dealExtraSize: config.dealExtraSize,
    pointsPerSet: config.pointsPerSet,
  });

  return {
    modeId: "time_attack",
    status: classic.status,
    config,
    catalog: classic.catalog,
    deck: classic.deck,
    board: classic.board,
    score: classic.score,
    moves: classic.moves,
    validSetsFound: classic.validSetsFound,
    rngSeed: classic.rngSeed,
    endsAtMs: nowMs + config.durationMs,
  };
}
