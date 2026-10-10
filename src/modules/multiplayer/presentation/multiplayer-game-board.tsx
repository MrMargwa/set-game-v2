"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CardId, GameEvent } from "@/core";
import { createCardCatalog } from "@/core";
import { findSets } from "@/core/set-rules";
import { SetCard } from "@/modules/games/presentation/set-card";
import {
  alertSuccess,
  btnPrimary,
  endedPanel,
  pageLead,
  pageTitle,
  statLabel,
  statValue,
} from "@/shared/presentation/ui/styles";
import type { MultiplayerClassicSnapshot } from "../domain/types";

type GamePayload = {
  id: string;
  version: number;
  status: "playing" | "ended";
  state: MultiplayerClassicSnapshot;
};

type MultiplayerGameBoardProps = {
  gameId: string;
  currentUserId: string;
};

export function MultiplayerGameBoard({
  gameId,
  currentUserId,
}: MultiplayerGameBoardProps) {
  const catalog = useMemo(() => createCardCatalog(), []);
  const [game, setGame] = useState<GamePayload | null>(null);
  const [selected, setSelected] = useState<CardId[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyEvents = useCallback((events: GameEvent[]) => {
    for (const event of events) {
      if (event.type === "SET_INVALID") {
        setMessage("Geen geldige SET.");
      }
      if (event.type === "SET_FOUND") {
        setMessage("SET gevonden! +1 punt");
      }
      if (event.type === "GAME_ENDED") {
        setMessage("Spel afgelopen.");
      }
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/multiplayer/games/${gameId}`);
      const data = (await res.json()) as { game?: GamePayload; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Spel laden mislukt.");
        return;
      }
      if (data.game) {
        setGame(data.game);
        setError(null);
      }
    } catch {
      setError("Netwerkfout.");
    }
  }, [gameId]);

  useEffect(() => {
    const interval = setInterval(() => {
      void refresh();
    }, 1500);
    const initial = setTimeout(() => {
      void refresh();
    }, 0);
    return () => {
      clearInterval(interval);
      clearTimeout(initial);
    };
  }, [refresh]);

  const hints = useMemo(() => {
    if (!game) {
      return { canDealExtra: false };
    }
    const hasSet = findSets(game.state.board, catalog).length > 0;
    return {
      canDealExtra:
        game.state.status === "playing" &&
        !hasSet &&
        game.state.deckCount > 0,
    };
  }, [catalog, game]);

  async function postAction(
    action: { type: "DEAL_EXTRA" } | { type: "SUBMIT_SET"; cardIds: [CardId, CardId, CardId] },
  ) {
    if (!game) return;

    try {
      const res = await fetch(`/api/multiplayer/games/${gameId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version: game.version, action }),
      });
      const data = (await res.json()) as {
        game?: GamePayload;
        events?: GameEvent[];
        error?: string;
      };

      if (res.status === 409) {
        await refresh();
        setMessage(data.error ?? "Status vernieuwd — probeer opnieuw.");
        return;
      }

      if (!res.ok) {
        setMessage(data.error ?? "Actie mislukt.");
        return;
      }

      if (data.game) {
        setGame(data.game);
      }
      if (data.events) {
        applyEvents(data.events);
      }
      setSelected([]);
    } catch {
      setMessage("Netwerkfout bij actie.");
    }
  }

  function toggleCard(cardId: CardId) {
    if (!game || game.state.status !== "playing") return;

    setSelected((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }
      if (prev.length >= 3) {
        return prev;
      }
      const next = [...prev, cardId];
      if (next.length === 3) {
        void postAction({
          type: "SUBMIT_SET",
          cardIds: [next[0]!, next[1]!, next[2]!],
        });
      }
      return next;
    });
  }

  if (!game && !error) {
    return <p className="p-8 text-center text-sm text-muted">Spel laden…</p>;
  }

  if (!game) {
    return (
      <p className="p-8 text-center text-sm text-danger" role="alert">
        {error}
      </p>
    );
  }

  const sortedPlayers = [...game.state.players].sort((a, b) => b.score - a.score);

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={pageTitle}>Multiplayer Classic</h1>
          <p className={pageLead}>
            Race om SETs — server is authoritative (v{game.version}).
          </p>
        </div>
        <div>
          <span className={statLabel}>Deck</span>
          <p className={statValue} data-testid="deck-count">
            {game.state.deckCount}
          </p>
        </div>
      </header>

      <div className="flex flex-wrap gap-3">
        {sortedPlayers.map((player) => (
          <div
            key={player.userId}
            className={`rounded-lg border px-3 py-2 text-sm ${
              player.userId === currentUserId
                ? "border-ring bg-accent-muted/50"
                : "border-border bg-surface"
            }`}
          >
            <span className="font-medium">{player.username}</span>
            <span className="ml-2 font-mono tabular-nums text-muted">
              {player.score} pt
            </span>
          </div>
        ))}
      </div>

      {message && (
        <p className={alertSuccess} role="status">
          {message}
        </p>
      )}

      <div
        className="rounded-2xl border border-border bg-surface-elevated/50 p-4 sm:p-6"
        data-testid="game-board"
      >
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {game.state.board.map((cardId) => {
            const card = catalog.get(cardId);
            if (!card) return null;
            return (
              <SetCard
                key={cardId}
                card={card}
                selected={selected.includes(cardId as CardId)}
                onSelect={() => toggleCard(cardId as CardId)}
              />
            );
          })}
        </div>
      </div>

      <button
        type="button"
        data-testid="deal-extra"
        disabled={!hints.canDealExtra || game.state.status !== "playing"}
        onClick={() => postAction({ type: "DEAL_EXTRA" })}
        className={`${btnPrimary} w-fit`}
      >
        +3 kaarten (geen SET op bord)
      </button>

      {game.state.status === "ended" && (
        <div className={endedPanel} data-testid="game-ended">
          <p className="font-display text-lg font-semibold">Race afgelopen</p>
          <p className="mt-2 text-muted">
            Winnaar:{" "}
            <span className="font-semibold text-foreground">
              {sortedPlayers[0]?.username ?? "—"} ({sortedPlayers[0]?.score ?? 0} pt)
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
