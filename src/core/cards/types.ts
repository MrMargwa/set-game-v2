export type NumberCount = 1 | 2 | 3;
export type Shape = "diamond" | "squiggle" | "oval";
export type Shading = "solid" | "striped" | "open";
export type Color = "red" | "green" | "purple";

export type CardAttributes = {
  number: NumberCount;
  shape: Shape;
  shading: Shading;
  color: Color;
};

export type CardId = string;

export type Card = {
  id: CardId;
  attributes: CardAttributes;
};

export type CardTriple = readonly [CardId, CardId, CardId];

export type CardCatalog = ReadonlyMap<CardId, Card>;
