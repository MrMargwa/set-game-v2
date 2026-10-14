import type { GameAction, GameEvent } from "@/core";
import type { PublicUser } from "@/modules/accounts/domain/user";
import { clampTimeLimit } from "@/modules/lobbies/domain/lobby-settings";
import { LobbyRepository } from "@/modules/lobbies/infrastructure/lobby-repository";
import {
  createInitialPersistedState,
  expireIfTimedOut,
  toClientSnapshot,
} from "../domain/game-state-serialization";
import { DEFAULT_MULTIPLAYER_RULES } from "../domain/types";
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
      currentStreak: 0,
      maxStreak: 0,
    }));

    const seed = crypto.randomUUID();
    const initial = createInitialPersistedState(seed, players, {
      ...DEFAULT_MULTIPLAYER_RULES,
      mode: lobby.gameMode,
      scoring: "streak",
      timeLimitSeconds: clampTimeLimit(lobby.gameMode, lobby.timeLimitSeconds),
      targetSets: null,
      allowDealExtra: lobby.dealExtraSize !== 0,
      dealExtraSize: lobby.dealExtraSize ?? 3,
      deckSize: lobby.deckSize ?? 81,
      boardColumns: lobby.boardColumns ?? 5,
      initialBoardSize: lobby.initialBoardSize ?? 15,
      startedAt: new Date().toISOString(),
    });
    const game = await gameRepository.create(lobbyId, "classic", initial);
    await lobbyRepository.markInGame(lobbyId, game.id);

    return { ok: true, game };
  } catch {
    return {
      ok: false,
      error: { code: "UNAVAILABLE", message: "Dit is tijdelijk niet mogelijk. Probeer het later opnieuw." },
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

    const expired = await persistTimeExpiry(gameId);
    if (expired) {
      return { ok: true, game: expired };
    }

    return { ok: true, game };
  } catch {
    return {
      ok: false,
      error: { code: "UNAVAILABLE", message: "Dit is tijdelijk niet mogelijk. Probeer het later opnieuw." },
    };
  }
}

export async function applyMultiplayerGameAction(
  gameId: string,
  user: PublicUser,
  _expectedVersion: number,
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
      error: { code: "INVALID", message: "Die actie kan niet tijdens een multiplayerspel." },
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

    for (let attempt = 0; attempt < 4; attempt += 1) {
      const timedOut = await persistTimeExpiry(gameId);
      if (timedOut?.status === "ended") {
        return {
          ok: false,
          error: { code: "INVALID", message: "De tijd is om." },
        };
      }

      const persistedRow = await gameRepository.getPersistedState(gameId);
      if (!persistedRow) {
        return {
          ok: false,
          error: { code: "NOT_FOUND", message: "Spel niet gevonden." },
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
        persistedRow.version,
        applied.state,
        nextStatus,
      );

      if (!updated.ok) {
        continue;
      }

      return {
        ok: true,
        game: {
          id: gameId,
          lobbyId: game.lobbyId,
          modeId: game.modeId,
          version: updated.version,
          status: nextStatus,
          state: toClientSnapshot(applied.state),
        },
        events: applied.events,
      };
    }

    return {
      ok: false,
      error: {
        code: "CONFLICT",
        message: "De spelstatus is bijgewerkt. Probeer het opnieuw.",
      },
    };
  } catch {
    return {
      ok: false,
      error: { code: "UNAVAILABLE", message: "Dit is tijdelijk niet mogelijk. Probeer het later opnieuw." },
    };
  }
}

async function persistTimeExpiry(gameId: string): Promise<MultiplayerGameRecord | null> {
  const row = await gameRepository.getPersistedState(gameId);
  if (!row) return null;
  const expired = expireIfTimedOut(row.state);
  if (expired.status !== "ended" || row.state.status === "ended") {
    return null;
  }
  const updated = await gameRepository.updateWithVersion(
    gameId,
    row.version,
    expired,
    "ended",
  );
  if (!updated.ok) {
    return gameRepository.getById(gameId);
  }
  const current = await gameRepository.getById(gameId);
  if (!current) return null;
  return {
    ...current,
    version: updated.version,
    status: "ended",
    state: toClientSnapshot(expired),
  };
}
