import { applyAction as applyClassicAction } from "../../game-engine";
import type { ApplyResult, GameAction, GameEvent } from "../../game-engine";
import type { TimeAttackGameState } from "./types";
import type { GameContext } from "../types";
import { createInitialTimeAttackState } from "./create-initial-state";
import { mergeFromClassicGameplay, toClassicGameplayState } from "./to-classic-gameplay";
function endTimeUp(state: TimeAttackGameState): ApplyResult<TimeAttackGameState> {
  if (state.status === "ended") {
    return { ok: true, state, events: [] };
  }
  return {
    ok: true,
    state: { ...state, status: "ended", endReason: "time_up" },
    events: [{ type: "GAME_ENDED", reason: "time_up" }],
  };
}

function applyTimePenalty(
  state: TimeAttackGameState,
  nowMs: number,
  events: GameEvent[],
): TimeAttackGameState {
  const hadInvalid = events.some((e) => e.type === "SET_INVALID");
  if (!hadInvalid) {
    return state;
  }

  const endsAtMs = Math.max(
    nowMs,
    state.endsAtMs - state.config.invalidSetPenaltyMs,
  );
  return { ...state, endsAtMs };
}

export function applyTimeAttackAction(
  state: TimeAttackGameState,
  action: GameAction,
  context?: GameContext,
): ApplyResult<TimeAttackGameState> {
  const nowMs = context?.nowMs ?? Date.now();

  if (state.status === "playing" && nowMs >= state.endsAtMs) {
    return endTimeUp(state);
  }

  if (action.type === "TICK") {
    if (state.status === "playing" && nowMs >= state.endsAtMs) {
      return endTimeUp(state);
    }
    return { ok: true, state, events: [] };
  }

  if (action.type === "NEW_GAME") {
    const seed = action.seed ?? `${Date.now()}`;
    const fresh = createInitialTimeAttackState(seed, state.config, nowMs);
    return { ok: true, state: fresh, events: [] };
  }

  const classic = toClassicGameplayState(state);
  const result = applyClassicAction(classic, action);
  if (!result.ok) {
    return result;
  }

  let next = mergeFromClassicGameplay(result.state, state);
  next = applyTimePenalty(next, nowMs, result.events);

  if (next.status === "playing" && nowMs >= next.endsAtMs) {
    return endTimeUp(next);
  }

  return { ok: true, state: next, events: result.events };
}
