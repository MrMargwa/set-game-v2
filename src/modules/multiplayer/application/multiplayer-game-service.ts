import type { GameAction, GameEvent } from "@/core";
import type { PublicUser } from "@/modules/accounts/domain/user";
import { LobbyRepository } from "@/modules/lobbies/infrastructure/lobby-repository";
import {
  createInitialPersistedState,
  toClientSnapshot,
} from "../domain/game-state-serialization";
import type { MultiplayerGameRecord } from "../domain/types";
import { applyMultiplayerAction } from "./apply-multiplayer-action";
import { MultiplayerGameRepository } from "../infrastructure/multiplayer-game-repository";

const lobbyRepository = new LobbyRepository();
const gameRepository = new MultiplayerGameRepository();

export type MultiplayerServiceError = {
  code: "NOT_FOUND" | "FORBIDDEN" | "CONFLICT" | "INVALID" | "UNAVAILABLE";
  message: string;
};

export async function startClassicMultiplayerFromLobby(
  lobbyId: string,
  user: PublicUser,
): Promise<
  { ok: true; game: MultiplayerGameRecord } | { ok: false; error: MultiplayerServiceError }
> {
  try {
    const lobby = await lobbyRepository.findById(lobbyId);
    if (!lobby) {
      return {
        ok: false,
        error: { code: "NOT_FOUND", message: "Lobby niet gevonden." },
      };
    }

    if (lobby.hostUserId !== user.id) {
      return {
        ok: false,
        error: { code: "FORBIDDEN", message: "Alleen de host kan het spel starten." },
      };
    }

    if (lobby.status !== "open") {
      return {
        ok: false,
        error: { code: "INVALID", message: "Spel is al gestart of lobby is gesloten." },
      };
    }

    const roster = await lobbyRepository.listPlayers(lobbyId);
    if (roster.length < 2) {
      return {
        ok: false,
        error: {
          code: "INVALID",
          message: "Minimaal twee spelers nodig om te starten.",
        },
      };
    }

    const players = roster.map((p) => ({
      userId: p.userId,
      username: p.username,
      score: 0,
      validSetsFound: 0,
    }));

    const seed = crypto.randomUUID();
    const initial = createInitialPersistedState(seed, players);
    const game = await gameRepository.create(lobbyId, "classic", initial);
    await lobbyRepository.markInGame(lobbyId, game.id);

    return { ok: true, game };
  } catch {
    return {
      ok: false,
      error: { code: "UNAVAILABLE", message: "Database niet bereikbaar." },
    };
  }
}

export async function getMultiplayerGameForUser(
  gameId: string,
  user: PublicUser,
): Promise<
  { ok: true; game: MultiplayerGameRecord } | { ok: false; error: MultiplayerServiceError }
> {
  try {
    const game = await gameRepository.getById(gameId);
    if (!game) {
      return {
        ok: false,
        error: { code: "NOT_FOUND", message: "Spel niet gevonden." },
      };
    }

    const isMember = await lobbyRepository.isPlayer(game.lobbyId, user.id);
    if (!isMember) {
      return {
        ok: false,
        error: { code: "FORBIDDEN", message: "Je speelt niet in dit spel." },
      };
    }

    return { ok: true, game };
  } catch {
    return {
      ok: false,
      error: { code: "UNAVAILABLE", message: "Database niet bereikbaar." },
    };
  }
}

export async function applyMultiplayerGameAction(
  gameId: string,
  user: PublicUser,
  expectedVersion: number,
  action: GameAction,
): Promise<
  | {
      ok: true;
      game: MultiplayerGameRecord;
      events: GameEvent[];
    }
  | { ok: false; error: MultiplayerServiceError }
> {
  if (action.type === "NEW_GAME" || action.type === "QUIT" || action.type === "TICK") {
    return {
      ok: false,
      error: { code: "INVALID", message: "Actie niet toegestaan in multiplayer." },
    };
  }

  try {
    const game = await gameRepository.getById(gameId);
    if (!game) {
      return {
        ok: false,
        error: { code: "NOT_FOUND", message: "Spel niet gevonden." },
      };
    }

    const isMember = await lobbyRepository.isPlayer(game.lobbyId, user.id);
    if (!isMember) {
      return {
        ok: false,
        error: { code: "FORBIDDEN", message: "Je speelt niet in dit spel." },
      };
    }

    const persistedRow = await gameRepository.getPersistedState(gameId);
    if (!persistedRow) {
      return {
        ok: false,
        error: { code: "NOT_FOUND", message: "Spel niet gevonden." },
      };
    }

    if (persistedRow.version !== expectedVersion) {
      return {
        ok: false,
        error: {
          code: "CONFLICT",
          message: "Spelstatus is verouderd. Vernieuwen en opnieuw proberen.",
        },
      };
    }

    if (persistedRow.status === "ended") {
      return {
        ok: false,
        error: { code: "INVALID", message: "Spel is afgelopen." },
      };
    }

    const applied = applyMultiplayerAction(persistedRow.state, action, user.id);
    if (!applied.ok) {
      return {
        ok: false,
        error: { code: "INVALID", message: applied.message },
      };
    }

    const nextStatus =
      applied.state.status === "ended" ? "ended" : ("playing" as const);

    const updated = await gameRepository.updateWithVersion(
      gameId,
      expectedVersion,
      applied.state,
      nextStatus,
    );

    if (!updated.ok) {
      return {
        ok: false,
        error: {
          code: "CONFLICT",
          message: "Iemand anders was sneller. Status wordt vernieuwd.",
        },
      };
    }

    const snapshot = toClientSnapshot(applied.state);
    return {
      ok: true,
      game: {
        id: gameId,
        lobbyId: game.lobbyId,
        modeId: game.modeId,
        version: updated.version,
        status: nextStatus,
        state: snapshot,
      },
      events: applied.events,
    };
  } catch {
    return {
      ok: false,
      error: { code: "UNAVAILABLE", message: "Database niet bereikbaar." },
    };
  }
}
