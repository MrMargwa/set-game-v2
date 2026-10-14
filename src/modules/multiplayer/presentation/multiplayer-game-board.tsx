"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CardId, GameEvent } from "@/core";
import { createCardCatalog } from "@/core";
import { findSets } from "@/core/set-rules";
import { comboPointsForStreak } from "@/core/scoring/classic-scoring";
import { classicPointsForSet } from "@/modules/multiplayer/domain/classic-match-scoring";
import {
  PlayBoardFrame,
  PlayBoardGrid,
  PlayShell,
  PlayShellCenter,
  PlayShellLeft,
  PlayShellRight,
  PlayShellRightMobile,
} from "@/modules/games/presentation/play/play-shell";
import { PlayStatTile } from "@/modules/games/presentation/play/play-stat-tile";
import { SetCard } from "@/modules/games/presentation/set-card";
import {
  alertDanger,
  btnPrimary,
  btnSecondary,
  endedPanel,
  linkAccent,
} from "@/shared/presentation/ui/styles";
import type { MultiplayerClassicSnapshot } from "../domain/types";
import { PlayLiveStandings } from "./play-live-standings";

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

function formatRemaining(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}

function useMatchSecondsLeft(startedAt: string, limitSeconds: number | null): number | null {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!limitSeconds) return;
    const timer = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(timer);
  }, [limitSeconds]);
  if (!limitSeconds || !startedAt) return null;
  const started = Date.parse(startedAt);
  if (!Number.isFinite(started)) return null;
  return Math.max(0, Math.ceil((started + limitSeconds * 1000 - now) / 1000));
}

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
  const submittingRef = useRef(false);

  const applyEvents = useCallback((events: GameEvent[]) => {
    for (const event of events) {
      if (event.type === "SET_INVALID") {
        setNotice({ type: "error", text: "Geen geldige SET. Streak terug naar 0." });
      }
      if (event.type === "SET_FOUND") {
        const streak =
          event.streakAfter > 1 ? ` (streak ${event.streakAfter})` : "";
        setNotice({
          type: "success",
          text: `SET gevonden! +${event.pointsEarned}${streak}`,
        });
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
        game.state.rules.allowDealExtra &&
        game.state.status === "playing" &&
        !hasSet &&
        game.state.deckCount >= (game.state.rules.dealExtraSize || 1),
    };
  }, [catalog, game]);

  async function postAction(
    action: { type: "DEAL_EXTRA" } | { type: "SUBMIT_SET"; cardIds: [CardId, CardId, CardId] },
    version: number,
  ) {
    try {
      const res = await fetch(`/api/multiplayer/games/${gameId}/actions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version, action }),
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
          text: "Die kaarten zijn net door iemand anders gepakt.",
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
    if (!game || game.state.status !== "playing" || submittingRef.current) return;

    if (selected.includes(cardId)) {
      setSelected(selected.filter((id) => id !== cardId));
      return;
    }
    if (selected.length >= 3) return;

    const next = [...selected, cardId];
    if (next.length < 3) {
      setSelected(next);
      return;
    }

    submittingRef.current = true;
    setSelected([]);
    void postAction(
      { type: "SUBMIT_SET", cardIds: [next[0]!, next[1]!, next[2]!] },
      game.version,
    ).finally(() => {
      submittingRef.current = false;
    });
  }

  if (!game && !error) {
    return (
      <p className="fixed inset-x-0 top-[calc(3.5rem+1px)] p-8 text-center text-sm text-muted">
        Spel laden…
      </p>
    );
  }

  if (!game) {
    return (
      <p
        className="fixed inset-x-0 top-[calc(3.5rem+1px)] p-8 text-center text-sm text-danger"
        role="alert"
      >
        {error}
      </p>
    );
  }

  const me = game.state.players.find((p) => p.userId === currentUserId);
  const myStreak = me?.currentStreak ?? 0;
  const rules = game.state.rules;
  const timeAttack = rules.mode === "time_attack";
  const remainingSeconds = useMatchSecondsLeft(rules.startedAt, rules.timeLimitSeconds);
  const nextPoints = classicPointsForSet(
    comboPointsForStreak(myStreak + 1),
    rules.startedAt,
    rules.timeLimitSeconds,
    Date.now(),
  );
  const boardColumns = game.state.rules.boardColumns || 5;
  const boardRows = Math.max(1, Math.ceil(game.state.board.length / boardColumns));
  const extraLabel =
    rules.dealExtraSize === 1 ? "1 kaart extra" : `${rules.dealExtraSize} kaarten extra`;
  const standings = (
    <PlayLiveStandings
      players={game.state.players}
      currentUserId={currentUserId}
    />
  );

  return (
    <PlayShell>
      <PlayShellLeft>
        <div>
          <h1 className="font-display text-lg font-semibold leading-none">
            {timeAttack ? "Time Attack" : "Classic"}
          </h1>
          <Link href="/lobby" className={`${linkAccent} mt-1 inline-block text-xs`}>
            ← Lobby
          </Link>
        </div>

        <div className="flex flex-col gap-1.5">
          <PlayStatTile
            label={timeAttack ? "SETs" : "Jouw score"}
            value={timeAttack ? (me?.validSetsFound ?? 0) : (me?.score ?? 0)}
            icon="★"
            testId="score"
          />
          {timeAttack ? null : (
            <PlayStatTile
              label="Streak"
              value={`${myStreak}×`}
              icon="🔥"
              tone={myStreak >= 2 ? "streak" : "default"}
              testId="streak"
              hint={`Volgende +${nextPoints}`}
            />
          )}
          {remainingSeconds !== null ? (
            <PlayStatTile
              label="Tijd"
              value={formatRemaining(remainingSeconds)}
              icon="◷"
              tone={remainingSeconds <= 30 ? "urgent" : "competition"}
              testId="timer"
            />
          ) : null}
          <PlayStatTile
            label="Deck"
            value={game.state.deckCount}
            icon="▤"
            testId="deck-count"
          />
        </div>

        {notice ? (
          <p
            role={notice.type === "error" ? "alert" : "status"}
            className={
              notice.type === "error"
                ? alertDanger
                : "rounded-lg border border-success/25 bg-success-bg/70 px-3 py-2 text-sm font-medium text-success"
            }
          >
            {notice.text}
          </p>
        ) : (
          <p className="px-1 text-sm text-muted">
            {timeAttack
              ? "De meeste SETs binnen de tijd wint."
              : "Hoogste score wint. Later in de ronde is een SET minder waard."}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2 pb-1">
          {rules.allowDealExtra ? (
          <button
            type="button"
            data-testid="deal-extra"
            disabled={!hints.canDealExtra || game.state.status !== "playing"}
            onClick={() => {
              if (!game || submittingRef.current) return;
              submittingRef.current = true;
              void postAction({ type: "DEAL_EXTRA" }, game.version).finally(() => {
                submittingRef.current = false;
              });
            }}
            className={`${btnPrimary} w-full`}
          >
            {extraLabel}
          </button>
          ) : null}
          <Link href="/lobby" className={`${btnSecondary} w-full text-center`}>
            Verlaat tafel
          </Link>
        </div>
      </PlayShellLeft>

      <PlayShellCenter>
        <PlayBoardFrame>
          <PlayBoardGrid boardRows={boardRows} columns={boardColumns}>
            {game.state.board.map((cardId) => {
              const card = catalog.get(cardId);
              if (!card) return null;
              return (
                <div key={cardId} className="min-w-0">
                  <SetCard
                    card={card}
                    selected={selected.includes(cardId as CardId)}
                    onSelect={() => toggleCard(cardId as CardId)}
                  />
                </div>
              );
            })}
          </PlayBoardGrid>

          {game.state.status === "ended" ? (
            <div
              className={`${endedPanel} absolute inset-4 z-10 m-auto h-fit max-w-sm`}
              data-testid="game-ended"
            >
              <p className="font-display text-lg font-semibold">Resultaat</p>
              <p className="mt-2 text-sm text-muted">
                {game.state.endReason === "time_up"
                  ? "De tijd is om."
                  : game.state.endReason === "target_reached"
                    ? "Het aantal SETs is gehaald."
                    : "Het bord is uitgespeeld."}
              </p>
              <p className="mt-2 text-muted">
                Winnaar:{" "}
                <span className="font-semibold text-foreground">
                  {[...game.state.players].sort((a, b) => b.score - a.score)[0]
                    ?.username ?? "—"}
                </span>
              </p>
            </div>
          ) : null}
        </PlayBoardFrame>
      </PlayShellCenter>

      <PlayShellRight>{standings}</PlayShellRight>
      <PlayShellRightMobile>{standings}</PlayShellRightMobile>
    </PlayShell>
  );
}
