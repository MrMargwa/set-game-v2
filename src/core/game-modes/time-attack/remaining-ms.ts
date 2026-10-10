import type { TimeAttackGameState } from "./types";

export function getRemainingMs(
  state: TimeAttackGameState,
  nowMs = Date.now(),
): number {
  return Math.max(0, state.endsAtMs - nowMs);
}
