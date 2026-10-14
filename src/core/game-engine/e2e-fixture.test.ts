import { describe, expect, it } from "vitest";
import { findSets } from "../set-rules";
import { createInitialClassicState } from "./create-initial-state";

describe("e2e-happy seed", () => {
  it("exposes a stable first SET for Playwright", () => {
    const state = createInitialClassicState("e2e-happy");
    const sets = findSets(state.board, state.catalog);
    expect(sets.length).toBeGreaterThan(0);
    expect(state.board).toHaveLength(12);
    expect(state.deck.drawPile).toHaveLength(69);
    expect(state.board).toEqual(
      expect.arrayContaining([
        "3-oval-solid-green",
        "1-oval-striped-green",
        "2-oval-open-green",
      ]),
    );
  });
});
