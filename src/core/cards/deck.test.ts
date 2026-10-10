import { describe, expect, it } from "vitest";
import { createCardCatalog, createShuffledDeck } from "./index";

describe("createShuffledDeck", () => {
  it("produces the same order for the same seed", () => {
    const catalog = createCardCatalog();
    const a = createShuffledDeck(catalog, "e2e-happy");
    const b = createShuffledDeck(catalog, "e2e-happy");
    expect(a.drawPile).toEqual(b.drawPile);
  });

  it("contains all 81 cards once", () => {
    const catalog = createCardCatalog();
    const deck = createShuffledDeck(catalog, "shuffle-test");
    expect(deck.drawPile.length).toBe(81);
    expect(new Set(deck.drawPile).size).toBe(81);
  });
});
