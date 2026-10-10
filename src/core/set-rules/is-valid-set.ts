import type { Card } from "../cards";

function attributeIsSet(values: readonly string[]): boolean {
  const unique = new Set(values);
  return unique.size === 1 || unique.size === 3;
}

export function isValidSet(a: Card, b: Card, c: Card): boolean {
  const attrs = ["number", "shape", "shading", "color"] as const;

  for (const key of attrs) {
    const values = [a.attributes[key], b.attributes[key], c.attributes[key]].map(
      String,
    );
    if (!attributeIsSet(values)) {
      return false;
    }
  }

  return true;
}
