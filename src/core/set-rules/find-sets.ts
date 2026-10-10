import type { CardCatalog, CardId, CardTriple } from "../cards";
import { isValidSet } from "./is-valid-set";

export function findSets(
  board: readonly CardId[],
  catalog: CardCatalog,
): CardTriple[] {
  const sets: CardTriple[] = [];
  const n = board.length;

  for (let i = 0; i < n; i += 1) {
    for (let j = i + 1; j < n; j += 1) {
      for (let k = j + 1; k < n; k += 1) {
        const a = catalog.get(board[i]);
        const b = catalog.get(board[j]);
        const c = catalog.get(board[k]);
        if (!a || !b || !c) {
          continue;
        }
        if (isValidSet(a, b, c)) {
          sets.push([board[i], board[j], board[k]]);
        }
      }
    }
  }

  return sets;
}
