import { describe, expect, it } from "vitest";
import { createCardCatalog } from "@/core";
import { findSets } from "@/core/set-rules";
import { createInitialPersistedState } from "../domain/game-state-serialization";
import { applyMultiplayerAction } from "./apply-multiplayer-action";

describe("applyMultiplayerAction", () => {
  const players = [
    { userId: "user-a", username: "Alice", score: 0, validSetsFound: 0, currentStreak: 0, maxStreak: 0 },
    { userId: "user-b", username: "Bob", score: 0, validSetsFound: 0, currentStreak: 0, maxStreak: 0 },
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
    expect(bob?.score).toBe(1224);
    expect(bob?.currentStreak).toBe(1);
    expect(alice?.score).toBe(0);
    expect(result.state.lastSetByUserId).toBe("user-b");
  });

  it("counts one point per SET in time attack", () => {
    const state = createInitialPersistedState("attack-seed", players, {
      mode: "time_attack",
      scoring: "streak",
      timeLimitSeconds: 180,
      targetSets: null,
      allowDealExtra: true,
      startedAt: new Date().toISOString(),
    });
    const catalog = createCardCatalog();
    const triple = findSets(state.board, catalog)[0]!;
    const result = applyMultiplayerAction(
      state,
      { type: "SUBMIT_SET", cardIds: triple },
      "user-b",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const bob = result.state.players.find((p) => p.userId === "user-b");
    expect(bob?.score).toBe(1);
    expect(bob?.validSetsFound).toBe(1);
    expect(bob?.currentStreak).toBe(0);
  });

  it("pays full streak points at the start and about 40 percent near the end", () => {
    const started = Date.parse("2026-01-01T00:00:00.000Z");
    const limit = 60 * 60;
    const state = createInitialPersistedState("decay-seed", players, {
      mode: "classic",
      scoring: "streak",
      timeLimitSeconds: limit,
      targetSets: null,
      allowDealExtra: true,
      startedAt: new Date(started).toISOString(),
    });
    const catalog = createCardCatalog();
    const triple = findSets(state.board, catalog)[0]!;
    const early = applyMultiplayerAction(
      state,
      { type: "SUBMIT_SET", cardIds: triple },
      "user-b",
      started,
    );
    expect(early.ok).toBe(true);
    if (!early.ok) return;
    expect(early.state.players.find((p) => p.userId === "user-b")?.score).toBe(1224);

    const lateState = createInitialPersistedState("decay-late", players, {
      mode: "classic",
      scoring: "streak",
      timeLimitSeconds: limit,
      targetSets: null,
      allowDealExtra: true,
      startedAt: new Date(started).toISOString(),
    });
    const lateTriple = findSets(lateState.board, catalog)[0]!;
    const late = applyMultiplayerAction(
      lateState,
      { type: "SUBMIT_SET", cardIds: lateTriple },
      "user-b",
      started + 59 * 60 * 1000,
    );
    expect(late.ok).toBe(true);
    if (!late.ok) return;
    const expected = Math.round(1224 * (1 - 0.6 * (59 / 60)));
    expect(late.state.players.find((p) => p.userId === "user-b")?.score).toBe(expected);
    expect(expected / 1224).toBeGreaterThan(0.3);
    expect(expected / 1224).toBeLessThan(0.5);
  });

  it("ends the match when a player reaches the target", () => {
    const state = createInitialPersistedState("target-seed", players, {
      mode: "classic",
      scoring: "flat",
      timeLimitSeconds: null,
      targetSets: 1,
      allowDealExtra: true,
      startedAt: new Date().toISOString(),
    });
    const catalog = createCardCatalog();
    const triple = findSets(state.board, catalog)[0]!;
    const result = applyMultiplayerAction(
      state,
      { type: "SUBMIT_SET", cardIds: triple },
      "user-a",
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.status).toBe("ended");
    expect(result.state.endReason).toBe("target_reached");
  });

  it("rejects extra cards when the host turned them off", () => {
    const state = createInitialPersistedState("deal-seed", players, {
      mode: "classic",
      scoring: "streak",
      timeLimitSeconds: null,
      targetSets: null,
      allowDealExtra: false,
      startedAt: new Date().toISOString(),
    });
    const result = applyMultiplayerAction(state, { type: "DEAL_EXTRA" }, "user-a");
    expect(result.ok).toBe(false);
  });

  it("builds a shorter deck and a custom extra-card size", () => {
    const state = createInitialPersistedState("deck-27", players, {
      deckSize: 27,
      initialBoardSize: 9,
      boardColumns: 3,
      dealExtraSize: 5,
    });
    expect(state.board.length).toBe(9);
    expect(state.board.length + state.deck.drawPile.length).toBe(27);
    expect(state.config.dealExtraSize).toBe(5);
    expect(state.rules?.allowDealExtra).toBe(true);
    expect(state.rules?.boardColumns).toBe(3);
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
