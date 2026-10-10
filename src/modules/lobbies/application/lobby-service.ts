import type { PublicUser } from "@/modules/accounts/domain/user";
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
};

export type LobbyServiceError = {
  code: "NOT_FOUND" | "FORBIDDEN" | "INVALID" | "UNAVAILABLE";
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
        message: "Database niet bereikbaar. Start MySQL en voer migraties uit.",
      },
    };
  }
}

export async function joinLobbyByInvite(
  user: PublicUser,
  inviteCode: string,
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
        message: "Database niet bereikbaar.",
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
      error: { code: "UNAVAILABLE", message: "Database niet bereikbaar." },
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
  };
}

function isDuplicateInvite(error: unknown): boolean {
  const err = error as { code?: string };
  return err?.code === "ER_DUP_ENTRY";
}
