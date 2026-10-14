"use client";

import type { CardId, GameModeId } from "@/core";
import { CLASSIC_MAX_DEAL_EXTRA_USES } from "@/core/game-engine";
import { FastestClearsPanel } from "@/modules/leaderboards/presentation/fastest-clears-panel";
import { PlayScoreRankPanel } from "@/modules/leaderboards/presentation/play-score-rank-panel";
import {
  alertDanger,
  btnPrimary,
  btnSecondary,
  endedPanel,
} from "@/shared/presentation/ui/styles";
import { PlayBoardFrame, PlayBoardGrid, PlayShell, PlayShellActions, PlayShellCenter, PlayShellLeft, PlayShellRight } from "./play/play-shell";
import { PlayModeNav } from "./play/play-mode-nav";
import { formatPlayElapsed, PlayStatTile } from "./play/play-stat-tile";
import { useBoardGame } from "./use-board-game";
import { SetCard } from "./set-card";

type GameBoardProps = {
  modeId: GameModeId;
  initialSeed?: string;
};

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
  const timerUrgent = remainingSeconds !== null && remainingSeconds <= 10;
  const hintCost = state.modeId === "classic" ? state.config.hintCost : 0;
  const dealExtraCost = state.modeId === "classic" ? state.config.dealExtraCost : 0;
  const extraLeft = Math.max(0, CLASSIC_MAX_DEAL_EXTRA_USES - state.dealExtraUses);
  const waitingToStart = !roundStarted && state.status === "playing";
  const invalidSubmits = state.modeId === "classic" ? state.invalidSubmits : 0;
  const fastestRefresh =
    state.status === "ended" ? `ended-${state.score}-${state.validSetsFound}` : "playing";
  const scoreRefresh =
    state.status === "ended" ? `ended-${state.score}` : "playing";
  const boardRows = Math.max(3, Math.ceil(boardCardIds.length / 5));

  const rightPanel =
    state.modeId === "classic" ? (
      <FastestClearsPanel modeId={modeId} refreshToken={fastestRefresh} />
    ) : (
      <PlayScoreRankPanel
        modeId={modeId}
        refreshToken={scoreRefresh}
        title="Top scores"
        subtitle="Hoogste score · top 25"
      />
    );

  return (
    <PlayShell>
      <PlayShellLeft>
        <h1 className="font-display truncate text-lg font-semibold leading-none">
          {modeMeta?.displayName ?? "SET"}
        </h1>
        <PlayModeNav activeModeId={modeId} />

        <div className="grid grid-cols-3 gap-1.5 lg:flex lg:flex-col">
          <PlayStatTile label="Score" value={state.score} icon="★" testId="score" />
          {state.modeId !== "classic" ? (
            <PlayStatTile
              label="Streak"
              value={streak > 0 ? `${streak}×` : "0×"}
              icon="🔥"
              tone={streak >= 2 ? "streak" : "default"}
              testId="streak"
            />
          ) : null}
          {state.modeId === "classic" ? (
            <PlayStatTile
              label="Speeltijd"
              value={formatPlayElapsed(elapsedMs)}
              icon="◷"
              tone="competition"
              testId="timer"
            />
          ) : null}
          {remainingSeconds !== null ? (
            <PlayStatTile
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
          ) : null}
          <PlayStatTile label="Deck" value={deckRemaining} icon="▤" testId="deck-count" />
        </div>

        {message ? (
          <p
            role="status"
            data-testid="game-message"
            className={
              message.type === "error"
                ? alertDanger
                : "rounded-lg border border-success/25 bg-success-bg/70 px-3 py-2 text-sm font-medium text-success"
            }
          >
            {message.text}
          </p>
        ) : (
          <p className="px-1 text-sm text-muted">
            {waitingToStart
              ? "Start het spel wanneer je er klaar voor bent."
              : "Selecteer drie kaarten op het bord."}
          </p>
        )}

      </PlayShellLeft>

      <PlayShellCenter>
        <PlayBoardFrame celebrate={clearingSet?.stage === "celebrate"}>
          <PlayBoardGrid
            boardRows={boardRows}
            inactive={waitingToStart || isBoardAnimating}
            dimmed={waitingToStart}
          >
            {boardCardIds.map((cardId) => {
              const card = state.catalog.get(cardId);
              if (!card) return null;
              const cardFeedback = feedback?.cardIds.includes(cardId as CardId)
                ? feedback.type
                : undefined;
              const inClearingSet = clearingSet?.cardIds.includes(cardId as CardId);
              return (
                <div key={cardId} className="min-w-0">
                  <SetCard
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
                </div>
              );
            })}
          </PlayBoardGrid>
          {waitingToStart ? (
            <div className="absolute inset-0 z-10 flex items-start justify-center rounded-xl bg-background/40 p-4 pt-8 backdrop-blur-md sm:rounded-2xl lg:items-center lg:pt-4">
              <button
                type="button"
                data-testid="begin-round"
                onClick={beginRound}
                className={`${btnPrimary} px-8 py-3 text-base`}
              >
                Start het spel
              </button>
            </div>
          ) : null}
          {state.status === "ended" ? (
            <div
              className={`${endedPanel} absolute inset-x-4 top-4 z-10 h-fit max-w-sm lg:inset-4 lg:m-auto`}
              data-testid="game-ended"
            >
              <p className="font-display text-lg font-semibold">Resultaat</p>
              {state.modeId === "classic" ? (
                <div className="mt-2 space-y-1 text-sm text-muted">
                  <p data-testid="final-time">
                    Speeltijd:{" "}
                    <span className="font-semibold text-foreground">
                      {formatPlayElapsed(elapsedMs)}
                    </span>
                  </p>
                  <p data-testid="final-score">
                    Score:{" "}
                    <span className="font-semibold text-foreground">{state.score}</span>
                  </p>
                  <p>
                    {state.validSetsFound} SET
                    {state.validSetsFound === 1 ? "" : "s"} · {invalidSubmits} fout
                    {invalidSubmits === 1 ? "" : "en"}
                  </p>
                </div>
              ) : (
                <p className="mt-1 text-muted">
                  Eindscore {state.score} · {state.validSetsFound}{" "}
                  {state.validSetsFound === 1 ? "SET" : "SETs"}
                </p>
              )}
              {saveNotice ? (
                <p className="mt-3 text-sm text-muted" role="status">{saveNotice}</p>
              ) : null}
              <button
                type="button"
                onClick={newGame}
                className={`${btnPrimary} mt-4 w-full`}
              >
                Opnieuw spelen
              </button>
            </div>
          ) : null}
        </PlayBoardFrame>
        <div className="mt-2 shrink-0 lg:hidden [&_aside]:h-auto [&_aside]:max-h-36">
          {rightPanel}
        </div>
      </PlayShellCenter>

      <PlayShellActions>
        <button
          type="button"
          data-testid="reveal-set"
          disabled={waitingToStart || isBoardAnimating || state.status !== "playing"}
          onClick={revealSet}
          className={`${btnSecondary} w-full px-2 text-center leading-tight`}
        >
          {hintCost > 0 ? `Toon een SET (−${hintCost})` : "Toon een SET"}
        </button>
        <button
          type="button"
          data-testid="deal-extra"
          disabled={!hints.canDealExtra || waitingToStart || isBoardAnimating}
          onClick={dealExtra}
          className={`${btnPrimary} w-full px-2 text-center leading-tight`}
        >
          {dealExtraCost > 0
            ? `3 kaarten extra (−${dealExtraCost}) · nog ${extraLeft}`
            : `3 kaarten extra · nog ${extraLeft}`}
        </button>
        {state.modeId === "classic" && state.status === "playing" && roundStarted ? (
          <button
            type="button"
            data-testid="quit-game"
            onClick={quitGame}
            className={`${btnSecondary} w-full px-2 text-center leading-tight`}
          >
            Stoppen
          </button>
        ) : null}
        <button
          type="button"
          data-testid="new-game"
          onClick={newGame}
          className={`${btnSecondary} w-full px-2 text-center leading-tight`}
        >
          Nieuw spel
        </button>
      </PlayShellActions>

      <PlayShellRight>{rightPanel}</PlayShellRight>
    </PlayShell>
  );
}
