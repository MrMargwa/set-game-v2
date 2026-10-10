import { describe, expect, it } from "vitest";
import { applyGameAction, createInitialState, parseGameModeId } from "./registry";

describe("game mode registry", () => {
  it("parses unknown mode as classic", () => {
    expect(parseGameModeId("unknown")).toBe("classic");
    expect(parseGameModeId("time_attack")).toBe("time_attack");
  });

  it("creates time attack state with timer", () => {
    const state = createInitialState("time_attack", "reg-test", {
      nowMs: 1000,
    });
    expect(state.modeId).toBe("time_attack");
    if (state.modeId !== "time_attack") return;
    expect(state.endsAtMs).toBe(61_000);
  });

  it("routes classic actions through registry", () => {
    const state = createInitialState("classic", "reg-classic");
    const result = applyGameAction(state, { type: "QUIT" });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.status).toBe("ended");
  });
});
