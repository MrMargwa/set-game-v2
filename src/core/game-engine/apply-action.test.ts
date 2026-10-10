import { describe, expect, it } from "vitest";
import { findSets } from "../set-rules";
import { buildBoardWithoutSets } from "../set-rules/test-helpers";
import { applyAction } from "./apply-action";
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
    expect(result.events.some((e) => e.type === "SET_INVALID")).toBe(true);
  });

  it("AC-SET-01: valid SET increases score and replaces cards", () => {
    const state = createInitialClassicState("ac-set-01");
    const sets = findSets(state.board, state.catalog);
    expect(sets.length).toBeGreaterThan(0);

    const beforeBoard = [...state.board];
    const result = applyAction(state, {
      type: "SUBMIT_SET",
      cardIds: sets[0]!,
    });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.score).toBe(1);
    expect(result.state.validSetsFound).toBe(1);
    for (const id of sets[0]!) {
      expect(result.state.board).not.toContain(id);
      expect(beforeBoard).toContain(id);
    }
  });

  it("AC-SET-04: deal extra adds three cards without score", () => {
    const state = stateWithoutSet();
    expect(findSets(state.board, state.catalog)).toEqual([]);
    expect(state.deck.drawPile.length).toBeGreaterThanOrEqual(3);

    const scoreBefore = state.score;
    const sizeBefore = state.board.length;
    const result = applyAction(state, { type: "DEAL_EXTRA" });

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.state.score).toBe(scoreBefore);
    expect(result.state.board.length).toBe(sizeBefore + 3);
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
