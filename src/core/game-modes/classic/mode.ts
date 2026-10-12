import {
  applyAction,
  createInitialClassicState,
  getLegalHints,
} from "../../game-engine";
import type { ClassicGameState } from "../../game-engine";
import type { GameModeDefinition } from "../types";

export const classicMode: GameModeDefinition<ClassicGameState> = {
  id: "classic",
  displayName: "Classic",
  description: "Leeg het deck. Een reeks geldige SETs levert meer punten op.",
  createInitialState: (seed) => createInitialClassicState(seed),
  applyAction: (state, action) => applyAction(state, action),
  getLegalHints: (state) => getLegalHints(state),
};
