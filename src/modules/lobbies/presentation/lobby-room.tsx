"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  alertDanger,
  btnPrimary,
  pageLead,
  pageTitle,
  panel,
} from "@/shared/presentation/ui/styles";

type LobbyPayload = {
  id: string;
  status: "open" | "in_game" | "closed";
  inviteCode: string;
  hostUserId: string;
  maxPlayers: number;
  multiplayerGameId: string | null;
  players: { userId: string; username: string; seatOrder: number }[];
  isHost: boolean;
};

type LobbyRoomProps = {
  lobbyId: string;
};

export function LobbyRoom({ lobbyId }: LobbyRoomProps) {
  const router = useRouter();
  const [lobby, setLobby] = useState<LobbyPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/lobbies/${lobbyId}`);
      const data = (await res.json()) as { lobby?: LobbyPayload; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Lobby laden mislukt.");
        return;
      }
      if (data.lobby) {
        setLobby(data.lobby);
        setError(null);
        if (data.lobby.status === "in_game" && data.lobby.multiplayerGameId) {
          router.replace(`/multiplayer/${data.lobby.multiplayerGameId}`);
        }
      }
    } catch {
      setError("Netwerkfout bij lobby vernieuwen.");
    }
  }, [lobbyId, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      void refresh();
    }, 2000);
    const initial = setTimeout(() => {
      void refresh();
    }, 0);
    return () => {
      clearInterval(interval);
      clearTimeout(initial);
    };
  }, [refresh]);

  async function startGame() {
    setStarting(true);
    setError(null);
    try {
      const res = await fetch(`/api/lobbies/${lobbyId}/start`, { method: "POST" });
      const data = (await res.json()) as {
        game?: { id: string };
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Starten mislukt.");
        return;
      }
      if (data.game?.id) {
        router.push(`/multiplayer/${data.game.id}`);
      }
    } catch {
      setError("Netwerkfout bij starten.");
    } finally {
      setStarting(false);
    }
  }

  if (!lobby && !error) {
    return <p className="p-8 text-center text-sm text-muted">Lobby laden…</p>;
  }

  if (!lobby) {
    return (
      <p className={`${alertDanger} mx-4 my-8 text-center`} role="alert">
        {error}
      </p>
    );
  }

  const canStart = lobby.isHost && lobby.status === "open" && lobby.players.length >= 2;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 py-10">
      <header>
        <h1 className={pageTitle}>Lobby</h1>
        <p className={pageLead}>
          Deel invitecode{" "}
          <span
            className="rounded-lg border border-border bg-surface-elevated px-3 py-1 font-mono text-lg tracking-widest text-foreground"
            data-testid="invite-code"
          >
            {lobby.inviteCode}
          </span>
        </p>
      </header>

      {error && (
        <p className={alertDanger} role="alert">
          {error}
        </p>
      )}

      <section>
        <h2 className="text-sm font-semibold text-foreground">
          Spelers ({lobby.players.length}/{lobby.maxPlayers})
        </h2>
        <ul className={`${panel} mt-2 divide-y divide-border`}>
          {lobby.players.map((player) => (
            <li key={player.userId} className="px-4 py-2 text-sm">
              {player.username}
              {player.userId === lobby.hostUserId ? (
                <span className="ml-2 text-xs font-medium text-accent">host</span>
              ) : null}
            </li>
          ))}
        </ul>
      </section>

      {lobby.isHost && lobby.status === "open" && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            data-testid="start-multiplayer"
            disabled={!canStart || starting}
            onClick={startGame}
            className={btnPrimary}
          >
            Start Classic race
          </button>
          {lobby.players.length < 2 && (
            <p className="text-xs text-muted">
              Wacht op minimaal één andere speler.
            </p>
          )}
        </div>
      )}

      {!lobby.isHost && lobby.status === "open" && (
        <p className="text-sm text-muted">Wacht tot de host het spel start…</p>
      )}
    </div>
  );
}
