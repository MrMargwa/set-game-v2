import { findSets } from "../set-rules";
import type { ClassicGameState, LegalHints } from "./types";

export function getLegalHints(state: ClassicGameState): LegalHints {
  const sets = findSets(state.board, state.catalog);
  const hasSetOnBoard = sets.length > 0;
  const canDealExtra =
    state.status === "playing" &&
    !hasSetOnBoard &&
    state.deck.drawPile.length >= state.config.dealExtraSize;

  return { hasSetOnBoard, canDealExtra };
}
