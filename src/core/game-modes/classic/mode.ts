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
  description: "Vind zoveel mogelijk SETs tot het deck op is.",
  createInitialState: (seed) => createInitialClassicState(seed),
  applyAction: (state, action) => applyAction(state, action),
  getLegalHints: (state) => getLegalHints(state),
};
