import { createSeededRandom } from "./seeded-random";
import type { CardCatalog, CardId } from "./types";

export type Deck = {
  drawPile: CardId[];
  discardPile: CardId[];
};

export function createShuffledDeck(catalog: CardCatalog, seed: string): Deck {
  const ids = [...catalog.keys()];
  const random = createSeededRandom(seed);

  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [ids[i], ids[j]] = [ids[j], ids[i]];
  }

  return { drawPile: ids, discardPile: [] };
}

export function drawCards(
  deck: Deck,
  count: number,
): { deck: Deck; drawn: CardId[] } {
  if (count <= 0) {
    return { deck, drawn: [] };
  }

  const drawn = deck.drawPile.slice(0, count);
  return {
    deck: {
      drawPile: deck.drawPile.slice(count),
      discardPile: deck.discardPile,
    },
    drawn,
  };
}

export function discardCards(deck: Deck, cardIds: CardId[]): Deck {
  return {
    drawPile: deck.drawPile,
    discardPile: [...deck.discardPile, ...cardIds],
  };
}
