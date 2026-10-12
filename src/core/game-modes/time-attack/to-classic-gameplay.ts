import type { ClassicGameState } from "../../game-engine";
import type { TimeAttackGameState } from "./types";

export function toClassicGameplayState(
  state: TimeAttackGameState,
): ClassicGameState {
  return {
    modeId: "classic",
    status: state.status,
    endReason: state.endReason,
    config: {
      modeId: "classic",
      initialBoardSize: state.config.initialBoardSize,
      dealExtraSize: state.config.dealExtraSize,
      pointsPerSet: state.config.pointsPerSet,
      basePoints: state.config.pointsPerSet,
      comboScoring: false,
      maxDealExtraUses: null,
      dealExtraRequiresNoSet: true,
      maxHintUses: 0,
    },
    catalog: state.catalog,
    deck: state.deck,
    board: state.board,
    score: state.score,
    moves: state.moves,
    validSetsFound: state.validSetsFound,
    currentStreak: 0,
    maxStreak: 0,
    invalidSubmits: 0,
    dealExtraUses: 0,
    hintUses: 0,
    rngSeed: state.rngSeed,
  };
}

export function mergeFromClassicGameplay(
  classic: ClassicGameState,
  previous: TimeAttackGameState,
): TimeAttackGameState {
  return {
    ...previous,
    status: classic.status,
    endReason: classic.endReason,
    deck: classic.deck,
    board: classic.board,
    score: classic.score,
    moves: classic.moves,
    validSetsFound: classic.validSetsFound,
  };
}
