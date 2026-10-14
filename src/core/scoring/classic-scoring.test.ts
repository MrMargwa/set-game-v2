import { describe, expect, it } from "vitest";
import { findSets } from "../set-rules";
import { applyAction } from "../game-engine/apply-action";
import { createInitialClassicState } from "../game-engine/create-initial-state";
import { pointsForValidSet } from "./classic-scoring";
import { CLASSIC_POINTS_PER_SET, DEFAULT_CLASSIC_CONFIG } from "../game-engine/types";

const comboConfig = {
  ...DEFAULT_CLASSIC_CONFIG,
  comboScoring: true,
  hintCost: 0,
  dealExtraCost: 0,
};

describe("classic combo scoring", () => {
  it("uses flat points when combo scoring is off", () => {
    expect(pointsForValidSet(DEFAULT_CLASSIC_CONFIG, 4).points).toBe(CLASSIC_POINTS_PER_SET);
  });

  it("raises the points with each consecutive SET", () => {
    expect(pointsForValidSet(comboConfig, 1).points).toBe(1224);
    expect(pointsForValidSet(comboConfig, 2).points).toBe(2356);
    expect(pointsForValidSet(comboConfig, 3).points).toBe(5167);
    expect(pointsForValidSet(comboConfig, 4).points).toBe(6543);
    expect(pointsForValidSet(comboConfig, 5).points).toBe(9512);
    expect(pointsForValidSet(comboConfig, 6).points).toBe(13789);
    expect(pointsForValidSet(comboConfig, 9).points).toBe(13789);
  });

  it("resets the streak after an invalid submit and keeps it across deal extra", () => {
    let state = createInitialClassicState("combo-reset", comboConfig);
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
