import type { PublicUser } from "@/modules/accounts/domain/user";
import { hashPassword, verifyPassword } from "@/modules/accounts/infrastructure/password-hasher";
import {
  clampTimeLimit,
  isLobbyDealExtraSize,
  isLobbyDeckSize,
  isLobbyMode,
  isLobbyPlayerCount,
  isLobbyTimeLimit,
  lobbyBoardFor,
  type LobbyDealExtraSize,
  type LobbyDeckSize,
  type LobbyMatchSettings,
  type LobbyMode,
} from "../domain/lobby-settings";
import { generateInviteCode } from "../infrastructure/invite-code";
import {
  LobbyRepository,
  type LobbyRow,
} from "../infrastructure/lobby-repository";

const lobbyRepository = new LobbyRepository();

export type LobbyView = {
  id: string;
  status: "open" | "in_game" | "closed";
  inviteCode: string;
  hostUserId: string;
  maxPlayers: number;
  multiplayerGameId: string | null;
  players: { userId: string; username: string; seatOrder: number }[];
  isHost: boolean;
  settings: LobbyMatchSettings;
};

export type LobbyServiceError = {
  code: "NOT_FOUND" | "FORBIDDEN" | "INVALID" | "UNAVAILABLE" | "PASSWORD_REQUIRED";
  message: string;
};

export async function createLobby(
  user: PublicUser,
): Promise<{ ok: true; lobby: LobbyView } | { ok: false; error: LobbyServiceError }> {
  try {
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const inviteCode = generateInviteCode();
      try {
        const row = await lobbyRepository.create(user.id, inviteCode);
        const players = await lobbyRepository.listPlayers(row.id);
        return {
          ok: true,
          lobby: toLobbyView(row, players, user.id),
        };
      } catch (error) {
        if (isDuplicateInvite(error)) {
          continue;
        }
        throw error;
      }
    }
    return {
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "Kon geen lobby aanmaken. Probeer het opnieuw.",
      },
    };
  } catch {
    return {
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "Dit is tijdelijk niet mogelijk. Probeer het later opnieuw.",
      },
    };
  }
}

export async function joinLobbyByInvite(
  user: PublicUser,
  inviteCode: string,
  password?: string,
): Promise<{ ok: true; lobby: LobbyView } | { ok: false; error: LobbyServiceError }> {
  try {
    const lobby = await lobbyRepository.findByInviteCode(inviteCode.trim());
    if (!lobby) {
      return {
        ok: false,
        error: { code: "NOT_FOUND", message: "Lobby niet gevonden." },
      };
    }

    if (lobby.status !== "open") {
      return {
        ok: false,
        error: { code: "INVALID", message: "Deze lobby accepteert geen spelers meer." },
      };
    }

    const already = await lobbyRepository.isPlayer(lobby.id, user.id);
    if (!already && lobby.passwordHash) {
      if (!password) {
        return {
          ok: false,
          error: {
            code: "PASSWORD_REQUIRED",
            message: "Deze lobby heeft een wachtwoord.",
          },
        };
      }
      const matches = await verifyPassword(password, lobby.passwordHash);
      if (!matches) {
        return {
          ok: false,
          error: { code: "INVALID", message: "Wachtwoord klopt niet." },
        };
      }
    }
    if (already) {
      const players = await lobbyRepository.listPlayers(lobby.id);
      return { ok: true, lobby: toLobbyView(lobby, players, user.id) };
    }

    const players = await lobbyRepository.listPlayers(lobby.id);
    if (players.length >= lobby.maxPlayers) {
      return {
        ok: false,
        error: { code: "INVALID", message: "Lobby is vol." },
      };
    }

    await lobbyRepository.addPlayer(lobby.id, user.id);
    const nextPlayers = await lobbyRepository.listPlayers(lobby.id);
    return { ok: true, lobby: toLobbyView(lobby, nextPlayers, user.id) };
  } catch {
    return {
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "Dit is tijdelijk niet mogelijk. Probeer het later opnieuw.",
      },
    };
  }
}

export async function getLobbyForUser(
  lobbyId: string,
  user: PublicUser,
): Promise<{ ok: true; lobby: LobbyView } | { ok: false; error: LobbyServiceError }> {
  try {
    const lobby = await lobbyRepository.findById(lobbyId);
    if (!lobby) {
      return {
        ok: false,
        error: { code: "NOT_FOUND", message: "Lobby niet gevonden." },
      };
    }

    const isMember = await lobbyRepository.isPlayer(lobbyId, user.id);
    if (!isMember) {
      return {
        ok: false,
        error: { code: "FORBIDDEN", message: "Je zit niet in deze lobby." },
      };
    }

    const players = await lobbyRepository.listPlayers(lobbyId);
    return { ok: true, lobby: toLobbyView(lobby, players, user.id) };
  } catch {
    return {
      ok: false,
      error: { code: "UNAVAILABLE", message: "Dit is tijdelijk niet mogelijk. Probeer het later opnieuw." },
    };
  }
}

export type UpdateLobbySettingsInput = {
  maxPlayers: number;
  mode: string;
  timeLimitSeconds: number;
  dealExtraSize: number;
  deckSize: number;
  boardColumns: number;
  initialBoardSize: number;
  password?: string | null;
};

export async function updateLobbySettings(
  lobbyId: string,
  user: PublicUser,
  input: UpdateLobbySettingsInput,
): Promise<{ ok: true; lobby: LobbyView } | { ok: false; error: LobbyServiceError }> {
  try {
    const lobby = await lobbyRepository.findById(lobbyId);
    if (!lobby) {
      return { ok: false, error: { code: "NOT_FOUND", message: "Lobby niet gevonden." } };
    }
    if (lobby.hostUserId !== user.id) {
      return {
        ok: false,
        error: { code: "FORBIDDEN", message: "Alleen de host kan instellingen wijzigen." },
      };
    }
    if (lobby.status !== "open") {
      return {
        ok: false,
        error: { code: "INVALID", message: "Het spel is al gestart." },
      };
    }
    if (!isLobbyPlayerCount(input.maxPlayers)) {
      return { ok: false, error: { code: "INVALID", message: "Kies 2, 3 of 4 spelers." } };
    }
    if (!isLobbyMode(input.mode)) {
      return { ok: false, error: { code: "INVALID", message: "Kies Classic of Time Attack." } };
    }
    const dealExtraSize = input.dealExtraSize;
    const deckSize = input.deckSize;
    if (!isLobbyDealExtraSize(dealExtraSize)) {
      return { ok: false, error: { code: "INVALID", message: "Kies uit, +1, +3 of +5 kaarten." } };
    }
    if (!isLobbyDeckSize(deckSize)) {
      return { ok: false, error: { code: "INVALID", message: "Kies een deck van 27, 54 of 81 kaarten." } };
    }
    const board = lobbyBoardFor(input.boardColumns, input.initialBoardSize);
    if (board.columns !== input.boardColumns || board.cards !== input.initialBoardSize) {
      return { ok: false, error: { code: "INVALID", message: "Kies een bordindeling." } };
    }
    if (input.initialBoardSize > deckSize) {
      return {
        ok: false,
        error: { code: "INVALID", message: "Het bord past niet in dit deck." },
      };
    }
    if (!isLobbyTimeLimit(input.mode, input.timeLimitSeconds)) {
      return {
        ok: false,
        error: {
          code: "INVALID",
          message:
            input.mode === "time_attack"
              ? "Kies een tijd tussen 10 seconden en 2 minuten."
              : "Kies een tijd tussen 1 en 60 minuten.",
        },
      };
    }

    const players = await lobbyRepository.listPlayers(lobbyId);
    if (input.maxPlayers < players.length) {
      return {
        ok: false,
        error: {
          code: "INVALID",
          message: "Er zitten al meer spelers in de lobby dan dat maximum.",
        },
      };
    }

    let passwordHash: string | null | undefined;
    if (input.password === null) {
      passwordHash = null;
    } else if (typeof input.password === "string" && input.password.length > 0) {
      if (input.password.length < 4 || input.password.length > 32) {
        return {
          ok: false,
          error: { code: "INVALID", message: "Wachtwoord is 4 tot 32 tekens." },
        };
      }
      passwordHash = await hashPassword(input.password);
    }

    await lobbyRepository.updateSettings(lobbyId, {
      maxPlayers: input.maxPlayers,
      passwordHash,
      timeLimitSeconds: input.timeLimitSeconds,
      gameMode: input.mode,
      dealExtraSize,
      deckSize,
      boardColumns: input.boardColumns,
      initialBoardSize: input.initialBoardSize,
    });

    const next = await lobbyRepository.findById(lobbyId);
    if (!next) {
      return { ok: false, error: { code: "NOT_FOUND", message: "Lobby niet gevonden." } };
    }
    return { ok: true, lobby: toLobbyView(next, players, user.id) };
  } catch {
    return {
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "Dit is tijdelijk niet mogelijk. Probeer het later opnieuw.",
      },
    };
  }
}

function toLobbyView(
  lobby: LobbyRow,
  players: { userId: string; username: string; seatOrder: number }[],
  currentUserId: string,
): LobbyView {
  return {
    id: lobby.id,
    status: lobby.status,
    inviteCode: lobby.inviteCode,
    hostUserId: lobby.hostUserId,
    maxPlayers: lobby.maxPlayers,
    multiplayerGameId: lobby.multiplayerGameId,
    players,
    isHost: lobby.hostUserId === currentUserId,
    settings: settingsFromLobby(lobby),
  };
}

function settingsFromLobby(lobby: LobbyRow): LobbyMatchSettings {
  const mode: LobbyMode = lobby.gameMode === "time_attack" ? "time_attack" : "classic";
  const board = lobbyBoardFor(lobby.boardColumns, lobby.initialBoardSize);
  const rawExtra = lobby.dealExtraSize ?? -1;
  const dealExtraSize: LobbyDealExtraSize = isLobbyDealExtraSize(rawExtra) ? rawExtra : 3;
  const rawDeck = lobby.deckSize ?? 0;
  const deckSize: LobbyDeckSize = isLobbyDeckSize(rawDeck) ? rawDeck : 81;
  return {
    maxPlayers: isLobbyPlayerCount(lobby.maxPlayers) ? lobby.maxPlayers : 4,
    hasPassword: Boolean(lobby.passwordHash),
    mode,
    timeLimitSeconds: clampTimeLimit(mode, lobby.timeLimitSeconds),
    dealExtraSize,
    deckSize,
    boardColumns: board.columns,
    initialBoardSize: board.cards,
  };
}

function isDuplicateInvite(error: unknown): boolean {
  const err = error as { code?: string };
  return err?.code === "ER_DUP_ENTRY";
}
