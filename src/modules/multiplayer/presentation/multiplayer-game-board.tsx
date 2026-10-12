"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { CardId, GameEvent } from "@/core";
import { createCardCatalog } from "@/core";
import { findSets } from "@/core/set-rules";
import { SetCard } from "@/modules/games/presentation/set-card";
import {
  alertDanger,
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
  const [notice, setNotice] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const applyEvents = useCallback((events: GameEvent[]) => {
    for (const event of events) {
      if (event.type === "SET_INVALID") {
        setNotice({ type: "error", text: "Geen geldige SET." });
      }
      if (event.type === "SET_FOUND") {
        setNotice({ type: "success", text: "SET gevonden! +1 punt" });
      }
      if (event.type === "GAME_ENDED") {
        setNotice({ type: "success", text: "Spel afgelopen." });
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
      setError("Geen verbinding. Probeer het opnieuw.");
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
        setNotice({
          type: "error",
          text: data.error ?? "De status is vernieuwd. Probeer het opnieuw.",
        });
        return;
      }

      if (!res.ok) {
        setNotice({
          type: "error",
          text: data.error ?? "Die actie is niet gelukt.",
        });
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
      setNotice({
        type: "error",
        text: "Geen verbinding. Probeer het opnieuw.",
      });
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
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-3 sm:gap-6 sm:px-4 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className={`${pageTitle} text-2xl sm:text-3xl`}>Multiplayer Classic</h1>
          <p className={pageLead}>
            Wie het eerst een SET vindt, krijgt het punt.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface px-3 py-2">
          <span className={statLabel}>Deck</span>
          <p className={`${statValue} text-xl sm:text-2xl`} data-testid="deck-count">
            {game.state.deckCount}
          </p>
        </div>
      </header>

      <div className="-mx-3 flex gap-2 overflow-x-auto px-3 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
        {sortedPlayers.map((player) => (
          <div
            key={player.userId}
            className={`min-w-[8.5rem] shrink-0 rounded-lg border px-3 py-2 text-sm sm:min-w-0 ${
              player.userId === currentUserId
                ? "border-ring bg-accent-muted/50"
                : "border-border bg-surface"
            }`}
          >
            <span className="block max-w-40 truncate font-medium">
              {player.username}
              {player.userId === currentUserId ? (
                <span className="ml-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-accent">
                  Jij
                </span>
              ) : null}
            </span>
            <span className="font-mono tabular-nums text-muted">
              {player.score} pt
            </span>
          </div>
        ))}
      </div>

      {notice && (
        <p
          className={notice.type === "error" ? alertDanger : alertSuccess}
          role={notice.type === "error" ? "alert" : "status"}
        >
          {notice.text}
        </p>
      )}

      <div
        className="rounded-2xl border border-border bg-surface-elevated/60 p-2 shadow-[var(--shadow-card)] sm:p-5"
        data-testid="game-board"
      >
        <div className="board-grid">
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
        className={`${btnPrimary} w-full sm:w-fit`}
      >
        3 kaarten extra
      </button>

      {game.state.status === "ended" && (
        <div className={endedPanel} data-testid="game-ended">
          <p className="font-display text-lg font-semibold">Resultaat</p>
          <p className="mt-2 text-muted">
            Hoogste score:{" "}
            <span className="font-semibold text-foreground">
              {sortedPlayers[0]?.username ?? "—"} ({sortedPlayers[0]?.score ?? 0} punten)
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
