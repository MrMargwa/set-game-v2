import type { GameModeDefinition } from "../types";
import { applyTimeAttackAction } from "./apply-action";
import { createInitialTimeAttackState } from "./create-initial-state";
import { getTimeAttackLegalHints } from "./get-legal-hints";
import type { TimeAttackGameState } from "./types";

export const timeAttackMode: GameModeDefinition<TimeAttackGameState> = {
  id: "time_attack",
  displayName: "Time Attack",
  description: "60 seconden — elke foute SET kost 3 seconden.",
  createInitialState: (seed, context) =>
    createInitialTimeAttackState(seed, undefined, context?.nowMs),
  applyAction: (state, action, context) =>
    applyTimeAttackAction(state, action, context),
  getLegalHints: (state) => getTimeAttackLegalHints(state),
};
