import type { CardAttributes, CardId } from "./types";

export function createCardId(attributes: CardAttributes): CardId {
  const { number, shape, shading, color } = attributes;
  return `${number}-${shape}-${shading}-${color}`;
}
