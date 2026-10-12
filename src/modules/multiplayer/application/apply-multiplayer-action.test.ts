import { describe, expect, it } from "vitest";
import { createCardCatalog } from "@/core";
import { findSets } from "@/core/set-rules";
import { createInitialPersistedState } from "../domain/game-state-serialization";
import { applyMultiplayerAction } from "./apply-multiplayer-action";

describe("applyMultiplayerAction", () => {
  const players = [
    { userId: "user-a", username: "Alice", score: 0, validSetsFound: 0 },
    { userId: "user-b", username: "Bob", score: 0, validSetsFound: 0 },
  ];

  it("awards score to the acting player on SET_FOUND", () => {
    const state = createInitialPersistedState("test-seed-mp", players);
    const catalog = createCardCatalog();
    const triple = findSets(state.board, catalog)[0];
    expect(triple).toBeDefined();

    const result = applyMultiplayerAction(
      state,
      { type: "SUBMIT_SET", cardIds: triple! },
      "user-b",
    );

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    const bob = result.state.players.find((p) => p.userId === "user-b");
    const alice = result.state.players.find((p) => p.userId === "user-a");
    expect(result.events.some((e) => e.type === "SET_FOUND")).toBe(true);
    expect(bob?.score).toBe(1);
    expect(alice?.score).toBe(0);
    expect(result.state.lastSetByUserId).toBe("user-b");
  });

  it("rejects actions after game ended", () => {
    const state = createInitialPersistedState("ended-seed", players);
    state.status = "ended";
    const result = applyMultiplayerAction(state, { type: "DEAL_EXTRA" }, "user-a");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toBe("Dit spel is afgelopen.");
    }
  });
});
