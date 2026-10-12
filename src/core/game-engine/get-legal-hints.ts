import { findSets } from "../set-rules";
import type { ClassicGameState, LegalHints } from "./types";

export function getLegalHints(state: ClassicGameState): LegalHints {
  const sets = findSets(state.board, state.catalog);
  const hasSetOnBoard = sets.length > 0;
  const usesLeft =
    state.config.maxDealExtraUses === null ||
    state.dealExtraUses < state.config.maxDealExtraUses;
  const setRuleOk = !state.config.dealExtraRequiresNoSet || !hasSetOnBoard;
  const canDealExtra =
    state.status === "playing" &&
    usesLeft &&
    setRuleOk &&
    state.deck.drawPile.length >= state.config.dealExtraSize;

  return { hasSetOnBoard, canDealExtra };
}
