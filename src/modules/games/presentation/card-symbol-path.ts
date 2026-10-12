import type { CardAttributes } from "@/core";

type SymbolKey = Pick<CardAttributes, "color" | "shape" | "shading">;

/** Pad naar één symbool-SVG (zonder count; stack in de kaart). */
export function cardSymbolAssetPath({ color, shape, shading }: SymbolKey): string {
  return `/assets/cards/${color}-${shape}-${shading}.svg`;
}
