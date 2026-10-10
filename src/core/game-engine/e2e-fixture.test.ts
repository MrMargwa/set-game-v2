import { describe, expect, it } from "vitest";
import { findSets } from "../set-rules";
import { createInitialClassicState } from "./create-initial-state";

describe("e2e-happy seed", () => {
  it("exposes a stable first SET for Playwright", () => {
    const state = createInitialClassicState("e2e-happy");
    const sets = findSets(state.board, state.catalog);
    expect(sets.length).toBeGreaterThan(0);
    expect(state.board).toContain(sets[0]![0]);
  });
});
