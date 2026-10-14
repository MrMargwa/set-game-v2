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
  description: "Vind SETs. Het deck telt 69 kaarten. Hints en extra kaarten kosten punten.",
  createInitialState: (seed) => createInitialClassicState(seed),
  applyAction: (state, action) => applyAction(state, action),
  getLegalHints: (state) => getLegalHints(state),
};
