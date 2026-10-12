import { describe, expect, it } from "vitest";
import { findSets } from "../set-rules";
import { applyAction } from "../game-engine/apply-action";
import { createInitialClassicState } from "../game-engine/create-initial-state";
import { pointsForValidSet } from "./classic-scoring";
import { DEFAULT_CLASSIC_CONFIG } from "../game-engine/types";

describe("classic combo scoring", () => {
  it("raises the multiplier with each consecutive SET", () => {
    expect(pointsForValidSet(DEFAULT_CLASSIC_CONFIG, 1).points).toBe(1224);
    expect(pointsForValidSet(DEFAULT_CLASSIC_CONFIG, 2).points).toBe(2356);
    expect(pointsForValidSet(DEFAULT_CLASSIC_CONFIG, 3).points).toBe(5167);
    expect(pointsForValidSet(DEFAULT_CLASSIC_CONFIG, 4).points).toBe(6543);
    expect(pointsForValidSet(DEFAULT_CLASSIC_CONFIG, 5).points).toBe(9512);
    expect(pointsForValidSet(DEFAULT_CLASSIC_CONFIG, 6).points).toBe(13789);
    expect(pointsForValidSet(DEFAULT_CLASSIC_CONFIG, 9).points).toBe(13789);
  });

  it("resets the streak after an invalid submit and keeps it across deal extra", () => {
    let state = createInitialClassicState("combo-reset");
    const first = findSets(state.board, state.catalog)[0]!;
    const found = applyAction(state, { type: "SUBMIT_SET", cardIds: first });
    expect(found.ok).toBe(true);
    if (!found.ok) return;
    state = found.state;
    expect(state.currentStreak).toBe(1);

    const second = findSets(state.board, state.catalog)[0];
    if (second) {
      const again = applyAction(state, { type: "SUBMIT_SET", cardIds: second });
      expect(again.ok).toBe(true);
      if (!again.ok) return;
      state = again.state;
      expect(state.score).toBe(3580);
      expect(state.currentStreak).toBe(2);
    }

    const broken = applyAction(state, {
      type: "SUBMIT_SET",
      cardIds: [state.board[0]!, state.board[1]!, state.board[2]!],
    });
    expect(broken.ok).toBe(true);
    if (!broken.ok) return;
    if (broken.events.some((event) => event.type === "SET_INVALID")) {
      expect(broken.state.currentStreak).toBe(0);
      expect(broken.state.maxStreak).toBe(state.maxStreak);
    }
  });
});
