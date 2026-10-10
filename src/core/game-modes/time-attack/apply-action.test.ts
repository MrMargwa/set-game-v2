import { describe, expect, it } from "vitest";
import { findSets } from "../../set-rules";
import { applyTimeAttackAction } from "./apply-action";
import { createInitialTimeAttackState } from "./create-initial-state";
import { getRemainingMs } from "./remaining-ms";

describe("Time Attack", () => {
  it("ends with time_up when clock expires", () => {
    const startMs = 1_000_000;
    const state = createInitialTimeAttackState("ta-time-up", undefined, startMs);

    const result = applyTimeAttackAction(
      state,
      { type: "TICK" },
      { nowMs: startMs + 60_001 },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.status).toBe("ended");
    expect(result.state.endReason).toBe("time_up");
  });

  it("applies penalty on invalid SET", () => {
    const startMs = 2_000_000;
    const state = createInitialTimeAttackState("ta-penalty", undefined, startMs);
    const sets = findSets(state.board, state.catalog);
    expect(sets.length).toBeGreaterThan(0);

    const inSet = new Set(sets.flat());
    const pool = state.board.filter((id) => !inSet.has(id));
    const invalid = (
      pool.length >= 3
        ? [pool[0]!, pool[1]!, pool[2]!]
        : [state.board[0]!, state.board[1]!, state.board[2]!]
    ) as [string, string, string];

    const before = getRemainingMs(state, startMs);
    const result = applyTimeAttackAction(
      state,
      { type: "SUBMIT_SET", cardIds: invalid },
      { nowMs: startMs + 1000 },
    );

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.modeId).toBe("time_attack");
    const after = getRemainingMs(result.state, startMs + 1000);
    expect(after).toBeLessThan(before - 2000);
  });
});
