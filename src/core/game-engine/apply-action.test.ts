import { describe, expect, it } from "vitest";
import { findSets } from "../set-rules";
import { buildBoardWithoutSets } from "../set-rules/test-helpers";
import { applyAction } from "./apply-action";
import { CLASSIC_DEAL_EXTRA_COST, CLASSIC_HINT_COST, CLASSIC_POINTS_PER_SET } from "./types";
import { createInitialClassicState } from "./create-initial-state";
import { evaluateGameEnd } from "./evaluate-game-end";

describe("applyAction — acceptance criteria", () => {
  it("AC-SET-02: invalid triple does not change score", () => {
    const state = createInitialClassicState("ac-set-02");
    const sets = findSets(state.board, state.catalog);
    expect(sets.length).toBeGreaterThan(0);

    const invalid = pickNonSetTriple(state.board, state.catalog, sets);
    const result = applyAction(state, {
      type: "SUBMIT_SET",
      cardIds: invalid,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.score).toBe(0);
    expect(result.state.currentStreak).toBe(0);
    expect(result.state.invalidSubmits).toBe(1);
    expect(result.events.some((e) => e.type === "SET_INVALID")).toBe(true);
  });

  it("AC-SET-01: valid SET increases score and replaces cards", () => {
    const state = createInitialClassicState("ac-set-01");
    expect(state.board).toHaveLength(12);
    expect(state.deck.drawPile).toHaveLength(69);
    const sets = findSets(state.board, state.catalog);
    expect(sets.length).toBeGreaterThan(0);

    const beforeBoard = [...state.board];
    const result = applyAction(state, {
      type: "SUBMIT_SET",
      cardIds: sets[0]!,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.score).toBe(CLASSIC_POINTS_PER_SET);
    expect(result.state.validSetsFound).toBe(1);
    for (const id of sets[0]!) {
      expect(result.state.board).not.toContain(id);
      expect(beforeBoard).toContain(id);
    }
  });

  it("AC-SET-04: deal extra adds three cards and charges the cost", () => {
    const state = { ...stateWithoutSet(), score: CLASSIC_POINTS_PER_SET };
    expect(findSets(state.board, state.catalog)).toEqual([]);
    expect(state.deck.drawPile.length).toBeGreaterThanOrEqual(3);

    const sizeBefore = state.board.length;
    const result = applyAction(state, { type: "DEAL_EXTRA" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.score).toBe(CLASSIC_POINTS_PER_SET - CLASSIC_DEAL_EXTRA_COST);
    expect(result.state.board.length).toBe(sizeBefore + 3);
  });

  it("charges points for a hint and less for extra cards", () => {
    const funded = { ...createInitialClassicState("costs"), score: CLASSIC_POINTS_PER_SET };
    const hint = applyAction(funded, { type: "REVEAL_SET" });
    expect(hint.ok).toBe(true);
    if (!hint.ok) return;
    expect(hint.state.score).toBe(CLASSIC_POINTS_PER_SET - CLASSIC_HINT_COST);

    const dealt = applyAction(hint.state, { type: "DEAL_EXTRA" });
    expect(dealt.ok).toBe(true);
    if (!dealt.ok) return;
    expect(dealt.state.score).toBe(
      CLASSIC_POINTS_PER_SET - CLASSIC_HINT_COST - CLASSIC_DEAL_EXTRA_COST,
    );

    const broke = applyAction(
      { ...createInitialClassicState("broke"), score: 10 },
      { type: "REVEAL_SET" },
    );
    expect(broke.ok).toBe(true);
    if (!broke.ok) return;
    expect(broke.state.score).toBe(10 - CLASSIC_HINT_COST);
  });

  it("deals extra at most five times and lets the score go negative", () => {
    let state = { ...createInitialClassicState("extra-cap"), score: 0 };
    for (let i = 0; i < 5; i += 1) {
      const result = applyAction(state, { type: "DEAL_EXTRA" });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      state = result.state;
    }
    expect(state.dealExtraUses).toBe(5);
    expect(state.score).toBe(-CLASSIC_DEAL_EXTRA_COST * 5);
    const blocked = applyAction(state, { type: "DEAL_EXTRA" });
    expect(blocked.ok).toBe(false);
  });

  it("AC-SET-05: ends when no SET and cannot deal", () => {
    const custom = forceNoSetNoDeck(createInitialClassicState("fixed-end"));
    expect(findSets(custom.board, custom.catalog)).toEqual([]);

    const end = evaluateGameEnd(custom);
    expect(end.status).toBe("ended");
    expect(end.endReason).toBe("no_set_remaining");
  });
});

function pickNonSetTriple(
  board: readonly string[],
  catalog: ReturnType<typeof createInitialClassicState>["catalog"],
  sets: ReturnType<typeof findSets>,
): [string, string, string] {
  const inSet = new Set(sets.flat());
  const pool = board.filter((id) => !inSet.has(id));
  if (pool.length >= 3) {
    return [pool[0]!, pool[1]!, pool[2]!];
  }
  return [board[0]!, board[1]!, board[2]!];
}

function stateWithoutSet() {
  const base = createInitialClassicState("deal-extra-base");
  const board = buildBoardWithoutSets(base.catalog, 12, "deal-extra-board");
  return {
    ...base,
    board,
    status: "playing" as const,
  };
}

function forceNoSetNoDeck(state: ReturnType<typeof createInitialClassicState>) {
  return {
    ...state,
    board: [
      "1-diamond-solid-red",
      "2-diamond-solid-green",
      "3-squiggle-solid-purple",
    ],
    deck: { drawPile: [], discardPile: state.deck.discardPile },
  };
}
