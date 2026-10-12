"use client";

import Link from "next/link";
import type { CardId, GameModeId } from "@/core";
import { listGameModes } from "@/core/game-modes";
import { isGameModePlayable } from "@/shared/config/game-availability";
import { ComingSoonBadge } from "@/shared/presentation/ui/coming-soon-badge";
import { comboPointsForStreak } from "@/core/scoring/classic-scoring";
import {
  alertDanger,
  btnPrimary,
  btnSecondary,
  endedPanel,
  pillActive,
  pillInactive,
} from "@/shared/presentation/ui/styles";
import { useBoardGame } from "./use-board-game";
import { SetCard } from "./set-card";

type GameBoardProps = {
  modeId: GameModeId;
  initialSeed?: string;
};

type StatTileProps = {
  label: string;
  value: string | number;
  icon: string;
  tone?: "default" | "competition" | "urgent" | "streak";
  testId?: string;
  hint?: string;
};

function StatTile({
  label,
  value,
  icon,
  tone = "default",
  testId,
  hint,
}: StatTileProps) {
  const toneClass =
    tone === "urgent"
      ? "border-competition-urgent/40 bg-danger-bg text-competition-urgent"
      : tone === "competition"
        ? "border-competition/35 bg-competition/10 text-competition"
        : tone === "streak"
          ? "border-competition/30 bg-competition/10 text-foreground"
          : "border-border bg-surface text-foreground";

  return (
    <div
      className={`min-w-0 rounded-xl border px-1.5 py-1.5 text-center shadow-[var(--shadow-card)] sm:px-3 sm:py-2 sm:text-left ${toneClass}`}
    >
      <div className="flex items-center justify-center gap-1 text-[0.65rem] font-medium uppercase tracking-[0.06em] text-muted sm:justify-start sm:gap-2 sm:text-xs sm:tracking-[0.08em]">
        <span
          aria-hidden
          className="hidden size-5 place-items-center rounded-full bg-surface-elevated text-[0.7rem] shadow-sm sm:grid"
        >
          {icon}
        </span>
        <span className="truncate">{label}</span>
      </div>
      <p
        className="mt-1 truncate font-mono text-sm font-semibold leading-none tabular-nums sm:text-2xl"
        data-testid={testId}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 hidden truncate text-[0.7rem] text-muted sm:block">{hint}</p>
      ) : null}
    </div>
  );
}

function formatElapsed(ms: number): string {
  const clamped = Math.max(0, ms);
  const totalSeconds = Math.floor(clamped / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((clamped % 1000) / 100);
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${tenths}`;
}

export function GameBoard({ modeId, initialSeed }: GameBoardProps) {
  const {
    state,
    boardCardIds,
    clearingSet,
    isBoardAnimating,
    selected,
    hints,
    message,
    feedback,
    streak,
    maxStreak,
    elapsedMs,
    modeMeta,
    remainingSeconds,
    toggleCard,
    dealExtra,
    newGame,
    beginRound,
    quitGame,
    revealSet,
    hintedCardIds,
    roundStarted,
    saveNotice,
  } = useBoardGame(modeId, initialSeed);

  const deckRemaining = state.deck.drawPile.length;
  const modes = listGameModes();
  const timerUrgent =
    remainingSeconds !== null && remainingSeconds <= 10;
  const nextSetPoints =
    state.modeId === "classic"
      ? comboPointsForStreak(state.currentStreak + 1)
      : null;
  const dealExtrasLeft =
    state.modeId === "classic" && state.config.maxDealExtraUses !== null
      ? Math.max(0, state.config.maxDealExtraUses - state.dealExtraUses)
      : null;
  const hintsLeft =
    state.modeId === "classic" && state.config.maxHintUses !== null
      ? Math.max(0, state.config.maxHintUses - state.hintUses)
      : null;
  const waitingToStart =
    state.modeId === "classic" && !roundStarted && state.status === "playing";

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-3 py-3 sm:gap-5 sm:px-4 sm:py-7">
      <header className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-3">
          <h1 className="font-display min-w-0 truncate text-lg font-semibold leading-none sm:text-xl">
            {modeMeta?.displayName ?? "SET"}
          </h1>
        </div>

        <nav className="grid grid-cols-2 gap-2" aria-label="Spelmodus">
          {modes.map((mode) => {
            if (!isGameModePlayable(mode.id)) {
              return (
                <span
                  key={mode.id}
                  className={`${pillInactive} flex cursor-not-allowed items-center justify-center gap-1.5 opacity-80`}
                  title="Binnenkort beschikbaar"
                >
                  <span className="truncate">{mode.displayName}</span>
                  <ComingSoonBadge className="hidden min-[400px]:inline-flex" />
                </span>
              );
            }
            return (
              <Link
                key={mode.id}
                href={`/play?mode=${mode.id}`}
                className={mode.id === modeId ? pillActive : pillInactive}
                aria-current={mode.id === modeId ? "page" : undefined}
              >
                {mode.displayName}
              </Link>
            );
          })}
        </nav>

        <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            <StatTile
              label="Score"
              value={state.score}
              icon="★"
              testId="score"
            />
            <StatTile
              label="Streak"
              value={streak > 0 ? `${streak}×` : "0×"}
              icon="🔥"
              tone={streak >= 2 ? "streak" : "default"}
              hint={
                nextSetPoints !== null ? `Volgende +${nextSetPoints}` : undefined
              }
              testId="streak"
            />
            {state.modeId === "classic" ? (
              <StatTile
                label="Speeltijd"
                value={formatElapsed(elapsedMs)}
                icon="◷"
                tone="competition"
                testId="timer"
              />
            ) : null}
            {remainingSeconds !== null && (
              <StatTile
                label="Resterend"
                value={`${remainingSeconds}s`}
                icon="◷"
                tone={
                  timerUrgent
                    ? "urgent"
                    : remainingSeconds <= 20
                      ? "competition"
                      : "default"
                }
                testId="timer"
              />
            )}
            <StatTile
              label="Deck"
              value={deckRemaining}
              icon="▤"
              testId="deck-count"
            />
          </div>
      </header>

      {message ? (
        <p
          role="status"
          data-testid="game-message"
          className={`${
            message.type === "error"
              ? alertDanger
              : "rounded-lg border border-success/25 bg-success-bg/70 px-3 py-2 text-sm font-medium text-success"
          } break-words`}
        >
          {message.text}
        </p>
      ) : (
        <p className="rounded-lg border border-transparent px-3 py-2 text-sm text-muted">
          Selecteer drie kaarten op het bord.
        </p>
      )}

      <div
        className={`relative rounded-2xl border border-border bg-surface-elevated/60 p-2 shadow-[var(--shadow-card)] sm:rounded-3xl sm:p-5 ${
          clearingSet?.stage === "celebrate" ? "animate-board-success" : ""
        }`}
        data-testid="game-board"
      >
        <div
          className={`board-grid ${
            waitingToStart || isBoardAnimating
              ? "pointer-events-none select-none"
              : ""
          } ${waitingToStart ? "blur-sm" : ""}`}
        >
          {boardCardIds.map((cardId) => {
            const card = state.catalog.get(cardId);
            if (!card) return null;
            const cardFeedback =
              feedback?.cardIds.includes(cardId as CardId)
                ? feedback.type
                : undefined;
            const inClearingSet = clearingSet?.cardIds.includes(cardId as CardId);
            return (
              <SetCard
                key={cardId}
                card={card}
                selected={selected.includes(cardId as CardId)}
                hinted={hintedCardIds.includes(cardId as CardId)}
                celebrateSuccess={
                  Boolean(inClearingSet && clearingSet?.stage === "celebrate")
                }
                exiting={Boolean(inClearingSet && clearingSet?.stage === "exit")}
                feedback={cardFeedback}
                onSelect={() => toggleCard(cardId as CardId)}
              />
            );
          })}
        </div>
        {waitingToStart ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/40 p-4 backdrop-blur-md sm:rounded-3xl">
            <button
              type="button"
              data-testid="begin-round"
              onClick={beginRound}
              className={`${btnPrimary} max-w-full px-8 py-3 text-base sm:px-10 sm:py-4 sm:text-lg`}
            >
              Start het spel
            </button>
          </div>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-2">
          {hintsLeft !== null ? (
            <>
              <button
                type="button"
                data-testid="reveal-set"
                disabled={
                  waitingToStart ||
                  isBoardAnimating ||
                  hintsLeft === 0 ||
                  state.status !== "playing"
                }
                onClick={revealSet}
                className={`${btnSecondary} w-full sm:w-auto`}
              >
                Toon een SET ({hintsLeft} over)
              </button>
              {hintsLeft === 0 ? (
                <p className="text-xs text-muted">Geen hints meer in dit spel.</p>
              ) : null}
            </>
          ) : null}
          <button
            type="button"
            data-testid="deal-extra"
            disabled={!hints.canDealExtra || waitingToStart || isBoardAnimating}
            onClick={dealExtra}
            className={`${btnPrimary} w-full sm:w-auto`}
          >
            {dealExtrasLeft !== null
              ? `3 kaarten extra (${dealExtrasLeft} over)`
              : "3 kaarten extra"}
          </button>
          {state.status === "playing" && !waitingToStart && !hints.canDealExtra ? (
            <p className="text-xs text-muted">
              {dealExtrasLeft === 0
                ? "Je extra kaarten voor dit spel zijn op."
                : deckRemaining < 3
                  ? "Geen kaarten meer in het deck."
                  : "Alleen als er geen SET op het bord ligt."}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {state.modeId === "classic" && state.status === "playing" && roundStarted ? (
            <button
              type="button"
              data-testid="quit-game"
              onClick={quitGame}
              className={`${btnSecondary} w-full sm:w-auto`}
            >
              Stoppen
            </button>
          ) : null}
          <button
            type="button"
            data-testid="new-game"
            onClick={newGame}
            className={`${btnSecondary} w-full sm:w-auto`}
          >
            Nieuw spel
          </button>
        </div>
      </div>

      {state.status === "ended" && (
        <div className={endedPanel} data-testid="game-ended">
          <p className="font-display text-lg font-semibold">Resultaat</p>
          {state.modeId === "classic" ? (
            <div className="mt-2 space-y-1 text-sm text-muted">
              <p data-testid="final-time">
                Speeltijd: <span className="font-semibold text-foreground">{formatElapsed(elapsedMs)}</span>
              </p>
              <p data-testid="final-score">
                Score: <span className="font-semibold text-foreground">{state.score}</span>
              </p>
              <p data-testid="final-streak">
                Hoogste streak:{" "}
                <span className="font-semibold text-foreground">{maxStreak}×</span>
              </p>
              <p>
                {state.validSetsFound} SET
                {state.validSetsFound === 1 ? "" : "s"} · {state.invalidSubmits} fout
                {state.invalidSubmits === 1 ? "" : "en"}
              </p>
            </div>
          ) : (
            <p className="mt-1 text-muted">
              Eindscore {state.score} · {state.validSetsFound}{" "}
              {state.validSetsFound === 1 ? "SET" : "SETs"}
            </p>
          )}
          {saveNotice ? (
            <p className="mt-3 text-sm text-muted" role="status">
              {saveNotice}
            </p>
          ) : null}
          <button type="button" onClick={newGame} className={`${btnPrimary} mt-4 w-full sm:w-auto`}>
            Opnieuw spelen
          </button>
        </div>
      )}
    </div>
  );
}
