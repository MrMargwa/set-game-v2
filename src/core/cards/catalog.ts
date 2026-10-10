import { createCardId } from "./create-card-id";
import type { Card, CardCatalog, Color, NumberCount, Shading, Shape } from "./types";

const NUMBERS: NumberCount[] = [1, 2, 3];
const SHAPES: Shape[] = ["diamond", "squiggle", "oval"];
const SHADINGS: Shading[] = ["solid", "striped", "open"];
const COLORS: Color[] = ["red", "green", "purple"];

export function createCardCatalog(): CardCatalog {
  const catalog = new Map<string, Card>();

  for (const number of NUMBERS) {
    for (const shape of SHAPES) {
      for (const shading of SHADINGS) {
        for (const color of COLORS) {
          const attributes = { number, shape, shading, color };
          const id = createCardId(attributes);
          catalog.set(id, { id, attributes });
        }
      }
    }
  }

  if (catalog.size !== 81) {
    throw new Error(`Expected 81 cards, got ${catalog.size}`);
  }

  return catalog;
}
