import { createSeededRandom } from "../cards/seeded-random";
import type { CardCatalog, CardId } from "../cards/types";
import { findSets } from "./find-sets";

/** Builds a board of `size` cards with no SET (deterministic for a given seed). */
export function buildBoardWithoutSets(
  catalog: CardCatalog,
  size: number,
  seed: string,
): CardId[] {
  const ids = [...catalog.keys()].sort();
  const random = createSeededRandom(seed);

  for (let i = ids.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  }

  const board: CardId[] = [];
  for (const id of ids) {
    const trial = [...board, id];
    if (findSets(trial, catalog).length === 0) {
      board.push(id);
      if (board.length >= size) {
        return board;
      }
    }
  }

  throw new Error(`Could not build a ${size}-card board without SETs (seed=${seed})`);
}
