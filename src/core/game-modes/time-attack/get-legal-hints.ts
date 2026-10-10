import { getLegalHints } from "../../game-engine";
import { toClassicGameplayState } from "./to-classic-gameplay";
import type { TimeAttackGameState } from "./types";

export function getTimeAttackLegalHints(state: TimeAttackGameState) {
  return getLegalHints(toClassicGameplayState(state));
}
