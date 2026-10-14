"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  alertDanger,
  btnPrimary,
  btnSecondary,
  pageLead,
  pageTitle,
  panel,
} from "@/shared/presentation/ui/styles";
import type { LobbyMatchSettings } from "../domain/lobby-settings";
import { LobbySettingsPanel } from "./lobby-settings-panel";

type LobbyPayload = {
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

type LobbyRoomProps = {
  lobbyId: string;
};

function PlayerAvatar({ username }: { username: string }) {
  const initial = username.trim().slice(0, 1).toUpperCase() || "?";
  return (
    <span
      className="grid size-10 shrink-0 place-items-center rounded-full border border-border bg-accent-muted/60 text-sm font-semibold text-accent"
      aria-hidden
    >
      {initial}
    </span>
  );
}

function LobbyRoomSkeleton() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 animate-pulse sm:py-10">
      <div className="h-8 w-48 rounded-lg bg-surface-elevated" />
      <div className={`${panel} h-28 rounded-2xl bg-surface-elevated`} />
      <div className={`${panel} h-40 rounded-2xl bg-surface-elevated`} />
    </div>
  );
}

function statusLabel(status: LobbyPayload["status"]): string {
  if (status === "open") return "Wachten op spelers";
  if (status === "in_game") return "Spel bezig";
  return "Gesloten";
}

export function LobbyRoom({ lobbyId }: LobbyRoomProps) {
  const router = useRouter();
  const [lobby, setLobby] = useState<LobbyPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/lobbies/${lobbyId}`);
      const data = (await res.json()) as {
        lobby?: LobbyPayload;
        error?: string;
      };
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
      setError("Geen verbinding. Vernieuwen van de lobby is niet gelukt.");
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
      const res = await fetch(`/api/lobbies/${lobbyId}/start`, {
        method: "POST",
      });
      const data = (await res.json()) as {
        game?: { id: string };
        error?: string;
      };
      if (!res.ok) {
        setError(
          data.error ?? "Het spel kon niet worden gestart. Probeer het opnieuw.",
        );
        return;
      }
      if (data.game?.id) {
        router.push(`/multiplayer/${data.game.id}`);
      }
    } catch {
      setError("Geen verbinding. Probeer het opnieuw.");
    } finally {
      setStarting(false);
    }
  }

  async function copyInviteCode() {
    if (!lobby) return;
    try {
      await navigator.clipboard.writeText(lobby.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (!lobby && !error) {
    return <LobbyRoomSkeleton />;
  }

  if (!lobby) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <p className={alertDanger} role="alert">
          {error}
        </p>
        <Link href="/lobby" className="mt-4 inline-block text-sm text-accent">
          Terug naar de lobby
        </Link>
      </div>
    );
  }

  const canStart =
    lobby.isHost && lobby.status === "open" && lobby.players.length >= 2;
  const seatsOpen = lobby.maxPlayers - lobby.players.length;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-8 sm:py-10">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Wachtkamer
        </p>
        <h1 className={`${pageTitle} mt-2 text-3xl`}>Lobby</h1>
        <p className={pageLead}>
          <span
            className={`mr-2 inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              lobby.status === "open"
                ? "bg-success-bg text-success"
                : lobby.status === "in_game"
                  ? "bg-accent-muted text-accent"
                  : "bg-surface-elevated text-muted"
            }`}
          >
            {statusLabel(lobby.status)}
          </span>
          {seatsOpen > 0
            ? `Nog ${seatsOpen} plek${seatsOpen === 1 ? "" : "ken"} vrij`
            : "Lobby is vol"}
        </p>
      </header>

      <div
        className={`${panel} rounded-2xl p-5 shadow-[var(--shadow-card)]`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
          Invitecode
        </p>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <span
            className="max-w-full overflow-x-auto rounded-xl border border-border bg-surface-elevated px-4 py-2 font-mono text-xl font-semibold tracking-[0.14em] text-foreground sm:text-2xl sm:tracking-[0.25em]"
            data-testid="invite-code"
          >
            {lobby.inviteCode}
          </span>
          <button
            type="button"
            onClick={copyInviteCode}
            className={`${btnSecondary} w-full sm:w-auto`}
          >
            {copied ? "Gekopieerd" : "Kopieer"}
          </button>
        </div>
        <p className="mt-3 text-sm text-muted">
          Deel deze code — vrienden kunnen via{" "}
          <Link href="/lobby" className="text-accent hover:text-accent-hover">
            Lobby → Code invoeren
          </Link>{" "}
          meedoen.
        </p>
      </div>

      {error && (
        <p className={alertDanger} role="alert">
          {error}
        </p>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-semibold">Spelers</h2>
          <span className="text-sm text-muted">
            {lobby.players.length}/{lobby.maxPlayers}
          </span>
        </div>
        <ul className={`${panel} divide-y divide-border overflow-hidden rounded-2xl`}>
          {lobby.players.map((player) => {
            const isHost = player.userId === lobby.hostUserId;
            return (
              <li
                key={player.userId}
                className="flex items-center gap-3 px-4 py-3"
              >
                <PlayerAvatar username={player.username} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {player.username}
                  </p>
                  <p className="text-xs text-muted">
                    Plek {player.seatOrder + 1}
                    {isHost ? " · Host" : ""}
                  </p>
                </div>
                {isHost ? (
                  <span
                    className="shrink-0 rounded-full border border-accent/30 bg-accent-muted/50 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-accent"
                  >
                    Host
                  </span>
                ) : null}
              </li>
            );
          })}
        </ul>
      </section>

      <LobbySettingsPanel
        lobbyId={lobby.id}
        settings={lobby.settings}
        isHost={lobby.isHost}
        locked={lobby.status !== "open"}
        onSaved={() => void refresh()}
        onError={(message) => setError(message || null)}
      />

      {lobby.isHost && lobby.status === "open" && (
        <div className="flex flex-col gap-2">
          <button
            type="button"
            data-testid="start-multiplayer"
            disabled={!canStart || starting}
            onClick={startGame}
            className={`${btnPrimary} w-full sm:w-auto`}
          >
            Spel starten
          </button>
          {lobby.players.length < 2 && (
            <p className="text-sm text-muted">
              Wacht op minimaal één andere speler om te starten.
            </p>
          )}
        </div>
      )}

      {!lobby.isHost && lobby.status === "open" && (
        <p
          className="rounded-xl border border-border bg-surface-elevated/80 px-4 py-3 text-center text-sm text-muted"
        >
          Wacht tot de host het spel start…
        </p>
      )}

      {lobby.status === "closed" && (
        <p className="text-sm text-muted">
          Deze lobby is gesloten.{" "}
          <Link href="/lobby" className="text-accent hover:text-accent-hover">
            Nieuwe lobby
          </Link>
        </p>
      )}

      <Link
        href="/lobby"
        className="text-center text-sm text-muted hover:text-foreground"
      >
        Terug naar de lobby
      </Link>
    </div>
  );
}
