import type { GameAction, GameEvent } from "@/core";
import { applyAction } from "@/core/game-engine";
import { comboPointsForStreak } from "@/core/scoring/classic-scoring";
import type { UserId } from "@/modules/accounts/domain/user";
import { classicPointsForSet } from "../domain/classic-match-scoring";
import {
  fromPersistedState,
  resolveRules,
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
  nowMs = Date.now(),
): MultiplayerActionResult {
  if (persisted.status === "ended") {
    return { ok: false, code: "INVALID", message: "Dit spel is afgelopen." };
  }

  const rules = resolveRules(persisted);
  if (action.type === "DEAL_EXTRA" && !rules.allowDealExtra) {
    return {
      ok: false,
      code: "INVALID",
      message: "De host heeft extra kaarten uitgezet.",
    };
  }

  const { classic, players } = fromPersistedState(persisted);
  const result = applyAction(classic, action);

  if (!result.ok) {
    return { ok: false, code: "INVALID", message: result.error.message };
  }

  let nextPlayers = players.map((player) => ({
    ...player,
    currentStreak: player.currentStreak ?? 0,
    maxStreak: player.maxStreak ?? 0,
  }));
  let lastSetByUserId = persisted.lastSetByUserId;
  const events: GameEvent[] = [];

  for (const event of result.events) {
    if (event.type === "SET_FOUND") {
      nextPlayers = nextPlayers.map((player) => {
        if (player.userId !== actingUserId) {
          return player;
        }
        const timeAttack = rules.mode === "time_attack";
        const streakAfter = timeAttack ? 0 : player.currentStreak + 1;
        const fullPoints = comboPointsForStreak(streakAfter || 1);
        const points = timeAttack
          ? 1
          : classicPointsForSet(
              fullPoints,
              rules.startedAt,
              rules.timeLimitSeconds,
              nowMs,
            );
        events.push({
          ...event,
          pointsEarned: points,
          streakAfter,
        });
        return {
          ...player,
          score: player.score + points,
          validSetsFound: player.validSetsFound + 1,
          currentStreak: streakAfter,
          maxStreak: Math.max(player.maxStreak, streakAfter),
        };
      });
      lastSetByUserId = actingUserId;
      continue;
    }

    if (event.type === "SET_INVALID") {
      nextPlayers = nextPlayers.map((player) =>
        player.userId === actingUserId
          ? { ...player, currentStreak: 0 }
          : player,
      );
    }

    events.push(event);
  }

  let classicState = result.state;
  if (
    rules.targetSets !== null &&
    nextPlayers.some((player) => player.validSetsFound >= rules.targetSets!)
  ) {
    classicState = {
      ...classicState,
      status: "ended",
      endReason: "target_reached",
    };
  }

  const nextPersisted = toPersistedState(
    classicState,
    nextPlayers,
    lastSetByUserId,
    rules,
  );

  return { ok: true, state: nextPersisted, events };
}
