import { findSets } from "../set-rules";
import type { ClassicGameState, EndReason, GameStatus } from "./types";

export function evaluateGameEnd(
  state: ClassicGameState,
): { status: GameStatus; endReason?: EndReason } {
  if (state.status === "ended") {
    return { status: "ended", endReason: state.endReason };
  }

  const boardEmpty = state.board.length === 0;
  const deckEmpty = state.deck.drawPile.length === 0;
  const setsOnBoard = findSets(state.board, state.catalog);

  if (boardEmpty && deckEmpty) {
    return { status: "ended", endReason: "deck_empty" };
  }

  if (
    setsOnBoard.length === 0 &&
    state.deck.drawPile.length < state.config.dealExtraSize
  ) {
    return { status: "ended", endReason: "no_set_remaining" };
  }

  return { status: "playing" };
}
