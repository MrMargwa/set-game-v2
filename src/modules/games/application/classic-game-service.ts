import type { ClassicGameState } from "@/core";
import {
  getBoardLegalHints,
  performGameAction,
  startGame,
} from "./game-service";

/** @deprecated Use game-service with modeId `classic` */
export function startClassicGame(seed?: string): ClassicGameState {
  return startGame("classic", seed) as ClassicGameState;
}

export { performGameAction, getBoardLegalHints as getClassicLegalHints };
