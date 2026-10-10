"use client";

import Link from "next/link";
import type { CardId, GameModeId } from "@/core";
import { listGameModes } from "@/core/game-modes";
import {
  alertDanger,
  alertSuccess,
  btnPrimary,
  btnSecondary,
  endedPanel,
  pageLead,
  pageTitle,
  pillActive,
  pillInactive,
  statLabel,
  statValue,
} from "@/shared/presentation/ui/styles";
import { useBoardGame } from "./use-board-game";
import { SetCard } from "./set-card";

type GameBoardProps = {
  modeId: GameModeId;
  initialSeed?: string;
};

export function GameBoard({ modeId, initialSeed }: GameBoardProps) {
  const {
    state,
    selected,
    hints,
    message,
    modeMeta,
    remainingSeconds,
    toggleCard,
    dealExtra,
    newGame,
  } = useBoardGame(modeId, initialSeed);

  const deckRemaining = state.deck.drawPile.length;
  const modes = listGameModes();
  const timerUrgent =
    remainingSeconds !== null && remainingSeconds <= 10;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-4 py-6 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className={pageTitle}>{modeMeta?.displayName ?? "SET"}</h1>
          <p className={pageLead}>
            {modeMeta?.description ??
              "Selecteer drie kaarten die een SET vormen."}
          </p>
        </div>
        <div className="flex gap-6">
          {remainingSeconds !== null && (
            <div>
              <span className={statLabel}>Tijd</span>
              <p
                className={`${statValue} ${
                  timerUrgent
                    ? "text-competition-urgent motion-safe:animate-pulse"
                    : remainingSeconds <= 20
                      ? "text-competition"
                      : ""
                }`}
                data-testid="timer"
              >
                {remainingSeconds}s
              </p>
            </div>
          )}
          <div>
            <span className={statLabel}>Score</span>
            <p className={statValue} data-testid="score">
              {state.score}
            </p>
          </div>
          <div>
            <span className={statLabel}>Deck</span>
            <p className={statValue} data-testid="deck-count">
              {deckRemaining}
            </p>
          </div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {modes.map((mode) => (
          <Link
            key={mode.id}
            href={`/play?mode=${mode.id}`}
            className={mode.id === modeId ? pillActive : pillInactive}
          >
            {mode.displayName}
          </Link>
        ))}
      </div>

      <div className="min-h-[2.75rem]">
        {message ? (
          <p
            role="status"
            data-testid="game-message"
            className={
              message.type === "error" ? alertDanger : alertSuccess
            }
          >
            {message.text}
          </p>
        ) : (
          <p className="text-sm text-muted" aria-hidden>
            Selecteer drie kaarten op het bord.
          </p>
        )}
      </div>

      <div
        className="rounded-2xl border border-border bg-surface-elevated/50 p-4 sm:p-6"
        data-testid="game-board"
      >
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
          {state.board.map((cardId) => {
            const card = state.catalog.get(cardId);
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

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          data-testid="deal-extra"
          disabled={!hints.canDealExtra}
          onClick={dealExtra}
          className={btnPrimary}
        >
          +3 kaarten (geen SET op bord)
        </button>
        <button
          type="button"
          data-testid="new-game"
          onClick={newGame}
          className={btnSecondary}
        >
          Nieuw spel
        </button>
      </div>

      {state.status === "ended" && (
        <div className={endedPanel} data-testid="game-ended">
          <p className="font-display text-lg font-semibold">Spel voorbij</p>
          <p className="mt-1 text-muted">
            Eindscore: {state.score} — {state.validSetsFound} SET
            {state.validSetsFound === 1 ? "" : "s"} gevonden
          </p>
          <button type="button" onClick={newGame} className={`${btnPrimary} mt-4`}>
            Opnieuw spelen
          </button>
        </div>
      )}
    </div>
  );
}
