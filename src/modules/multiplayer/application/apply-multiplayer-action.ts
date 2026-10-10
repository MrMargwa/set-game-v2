import type { GameAction, GameEvent } from "@/core";
import { applyAction } from "@/core/game-engine";
import type { UserId } from "@/modules/accounts/domain/user";
import {
  fromPersistedState,
  toPersistedState,
  type PersistedMultiplayerState,
} from "../domain/game-state-serialization";

export type MultiplayerActionResult =
  | {
      ok: true;
      state: PersistedMultiplayerState;
      events: GameEvent[];
    }
  | { ok: false; code: "INVALID"; message: string };

export function applyMultiplayerAction(
  persisted: PersistedMultiplayerState,
  action: GameAction,
  actingUserId: UserId,
): MultiplayerActionResult {
  if (persisted.status === "ended") {
    return { ok: false, code: "INVALID", message: "Game has ended" };
  }

  const { classic, players } = fromPersistedState(persisted);
  const result = applyAction(classic, action);

  if (!result.ok) {
    return { ok: false, code: "INVALID", message: result.error.message };
  }

  let nextPlayers = [...players];
  let lastSetByUserId = persisted.lastSetByUserId;

  for (const event of result.events) {
    if (event.type === "SET_FOUND") {
      nextPlayers = nextPlayers.map((p) =>
        p.userId === actingUserId
          ? {
              ...p,
              score: p.score + 1,
              validSetsFound: p.validSetsFound + 1,
            }
          : p,
      );
      lastSetByUserId = actingUserId;
    }
  }

  const nextPersisted = toPersistedState(
    result.state,
    nextPlayers,
    lastSetByUserId,
  );

  return { ok: true, state: nextPersisted, events: result.events };
}
