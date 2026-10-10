import { describe, expect, it } from "vitest";
import { createCardCatalog } from "../cards";
import { findSets } from "./find-sets";
import { buildBoardWithoutSets } from "./test-helpers";

describe("findSets", () => {
  it("returns empty when no SET exists on a known fixture", () => {
    const catalog = createCardCatalog();
    const board = buildBoardWithoutSets(catalog, 12, "no-set-fixture");
    expect(findSets(board, catalog)).toEqual([]);
  });

  it("finds at least one SET when present", () => {
    const catalog = createCardCatalog();
    const board = [
      "1-diamond-solid-red",
      "1-squiggle-striped-green",
      "1-oval-open-purple",
    ];
    const sets = findSets(board, catalog);
    expect(sets.length).toBe(1);
  });
});
