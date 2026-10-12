"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CardId, GameAction, GameEvent, GameModeId, GameState } from "@/core";
import { getRemainingMs, listGameModes } from "@/core/game-modes";
import {
  getBoardLegalHints,
  performGameAction,
  startGame,
} from "../application/game-service";
import {
  HINT_HIGHLIGHT_MS,
  motionDurationsForSetClear,
} from "./board-motion";
import { persistGameResult } from "./persist-game-result";

export type SetClearingStage = "celebrate" | "exit";

export type SetClearingState = {
  cardIds: CardId[];
  stage: SetClearingStage;
};

function streakBeforeAction(state: GameState): number {
  return state.modeId === "classic" ? state.currentStreak : 0;
}

export type BoardGameMessage =
  | { type: "success"; text: string }
  | { type: "error"; text: string }
  | null;

export type BoardGameFeedback = {
  type: "success" | "error";
  cardIds: CardId[];
  nonce: number;
} | null;

export function useBoardGame(modeId: GameModeId, initialSeed?: string) {
  const startedAtRef = useRef(new Date().toISOString());
  const [clockMs, setClockMs] = useState(() => Date.now());
  const startedAtMsRef = useRef(clockMs);
  const recordedEndRef = useRef(false);
  const feedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearingTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const hintTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingBoardRef = useRef<CardId[]>([]);
  const boardAnimatingRef = useRef(false);
  const submittingRef = useRef(false);

  const [state, setState] = useState<GameState>(() =>
    startGame(modeId, initialSeed ?? `${modeId}-opening-table`),
  );
  const [boardCardIds, setBoardCardIds] = useState<CardId[]>(
    () => startGame(modeId, initialSeed ?? `${modeId}-opening-table`).board,
  );
  const [clearingSet, setClearingSet] = useState<SetClearingState | null>(null);
  const [selected, setSelected] = useState<CardId[]>([]);
  const [message, setMessage] = useState<BoardGameMessage>(null);
  const [feedback, setFeedback] = useState<BoardGameFeedback>(null);
  const [streak, setStreak] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [hintedCardIds, setHintedCardIds] = useState<CardId[]>([]);
  const [roundStarted, setRoundStarted] = useState(modeId !== "classic");

  const modeMeta = useMemo(
    () => listGameModes().find((m) => m.id === modeId),
    [modeId],
  );

  const hints = useMemo(() => getBoardLegalHints(state), [state]);

  const remainingSeconds =
    state.modeId === "time_attack"
      ? Math.ceil(getRemainingMs(state, clockMs) / 1000)
      : null;

  const clearClearingTimeouts = useCallback(() => {
    for (const id of clearingTimeoutsRef.current) {
      clearTimeout(id);
    }
    clearingTimeoutsRef.current = [];
  }, []);

  const showFeedback = useCallback(
    (nextFeedback: NonNullable<BoardGameFeedback>) => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      setFeedback(nextFeedback);
      feedbackTimeoutRef.current = setTimeout(() => {
        setFeedback(null);
        feedbackTimeoutRef.current = null;
      }, 520);
    },
    [],
  );

  const scheduleHintClear = useCallback((cardIds: CardId[]) => {
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
    }
    setHintedCardIds(cardIds);
    hintTimeoutRef.current = setTimeout(() => {
      setHintedCardIds([]);
      hintTimeoutRef.current = null;
    }, HINT_HIGHLIGHT_MS);
  }, []);

  const beginSetClearAnimation = useCallback(
    (previousBoard: CardId[], foundIds: CardId[], nextBoard: CardId[]) => {
      clearClearingTimeouts();
      pendingBoardRef.current = nextBoard;
      boardAnimatingRef.current = true;
      setBoardCardIds(previousBoard);
      setClearingSet({ cardIds: foundIds, stage: "celebrate" });

      const { celebrate, exit } = motionDurationsForSetClear();
      clearingTimeoutsRef.current.push(
        setTimeout(() => {
          setClearingSet((current) =>
            current ? { ...current, stage: "exit" } : null,
          );
        }, celebrate),
      );
      clearingTimeoutsRef.current.push(
        setTimeout(() => {
          setBoardCardIds(pendingBoardRef.current);
          setClearingSet(null);
          boardAnimatingRef.current = false;
        }, celebrate + exit),
      );
    },
    [clearClearingTimeouts],
  );

  const applyEvents = useCallback(
    (events: GameEvent[], mode: GameModeId, streakBefore: number) => {
    for (const event of events) {
      if (event.type === "SET_INVALID") {
        setHintedCardIds([]);
        if (hintTimeoutRef.current) {
          clearTimeout(hintTimeoutRef.current);
          hintTimeoutRef.current = null;
        }
        if (mode !== "classic") {
          setStreak(0);
        }
        showFeedback({
          type: "error",
          cardIds: [...event.cardIds],
          nonce: Date.now(),
        });
        setMessage({
          type: "error",
          text:
            mode === "time_attack"
              ? "Geen geldige SET. 3 seconden eraf."
              : streakBefore > 0
                ? "Geen geldige SET. Combo terug naar 0."
                : "Geen geldige SET.",
        });
      }
      if (event.type === "SET_FOUND") {
        setHintedCardIds([]);
        if (hintTimeoutRef.current) {
          clearTimeout(hintTimeoutRef.current);
          hintTimeoutRef.current = null;
        }
        if (mode !== "classic") {
          setStreak((current) => current + 1);
        }
        const streakLabel =
          mode === "classic" && event.streakAfter > 1
            ? ` (streak ${event.streakAfter})`
            : "";
        setMessage({
          type: "success",
          text:
            mode === "classic"
              ? `SET gevonden! +${event.pointsEarned}${streakLabel}`
              : "SET gevonden! +1 punt",
        });
      }
      if (event.type === "SET_REVEALED") {
        scheduleHintClear([...event.cardIds]);
        setMessage({
          type: "success",
          text: "Deze drie kaarten vormen een SET.",
        });
      }
      if (event.type === "GAME_ENDED") {
        setMessage({
          type: "success",
          text:
            event.reason === "time_up"
              ? "Tijd is op!"
              : event.reason === "deck_empty"
                ? "Spel afgelopen. Het deck is leeg."
                : event.reason === "no_set_remaining"
                  ? "Spel afgelopen. Er is geen SET meer mogelijk."
                  : event.reason === "player_quit"
                    ? "Je hebt het spel gestopt."
                    : "Spel afgelopen.",
        });
      }
    }
  },
    [scheduleHintClear, showFeedback],
  );

  const finalizeAction = useCallback(
    (prev: GameState, next: GameState, events: GameEvent[]) => {
      const found = events.find((event) => event.type === "SET_FOUND");
      setState(next);
      if (found) {
        beginSetClearAnimation(prev.board, [...found.cardIds], next.board);
        return;
      }
      if (!boardAnimatingRef.current) {
        setBoardCardIds(next.board);
      }
    },
    [beginSetClearAnimation],
  );

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
      clearClearingTimeouts();
      if (hintTimeoutRef.current) {
        clearTimeout(hintTimeoutRef.current);
      }
    };
  }, [clearClearingTimeouts]);

  useEffect(() => {
    if (
      !roundStarted ||
      state.modeId !== "classic" ||
      state.status !== "playing"
    ) {
      return;
    }

    const interval = setInterval(() => {
      setElapsedMs(Date.now() - startedAtMsRef.current);
    }, 100);

    return () => clearInterval(interval);
  }, [roundStarted, state.modeId, state.status]);

  useEffect(() => {
    if (state.modeId !== "time_attack" || state.status !== "playing") {
      return;
    }

    const interval = setInterval(() => {
      const nowMs = Date.now();
      setClockMs(nowMs);
      setState((prev) => {
        if (prev.modeId !== "time_attack" || prev.status !== "playing") {
          return prev;
        }
        const result = performGameAction(prev, { type: "TICK" }, { nowMs });
        if (!result.ok) {
          return prev;
        }
        if (result.events.length > 0) {
          applyEvents(result.events, prev.modeId, streakBeforeAction(prev));
        }
        finalizeAction(prev, result.state, result.events);
        return result.state;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [applyEvents, finalizeAction, state.modeId, state.status]);

  useEffect(() => {
    if (state.status !== "ended" || !state.endReason) {
      return;
    }
    if (recordedEndRef.current) {
      return;
    }
    recordedEndRef.current = true;
    void persistGameResult(state, startedAtRef.current).then((status) => {
      if (status === "guest") {
        setSaveNotice(
          "Dit resultaat wordt niet bewaard. Log in om het op het leaderboard te zetten.",
        );
      } else if (status === "failed") {
        setSaveNotice(
          "Je resultaat kon niet worden opgeslagen. Je score in dit spel blijft zichtbaar.",
        );
      } else if (status === "saved") {
        setSaveNotice("Score opgeslagen op het leaderboard.");
      } else {
        setSaveNotice(null);
      }
    });
  }, [state]);

  const dispatch = useCallback(
    (action: GameAction) => {
      const nowMs = Date.now();
      setClockMs(nowMs);
      setState((prev) => {
        const result = performGameAction(prev, action, { nowMs });
        if (!result.ok) {
          if (result.error.code !== "CARD_NOT_ON_BOARD") {
            setMessage({ type: "error", text: result.error.message });
          }
          return prev;
        }
        applyEvents(result.events, prev.modeId, streakBeforeAction(prev));
        finalizeAction(prev, result.state, result.events);
        return result.state;
      });
    },
    [applyEvents, finalizeAction],
  );

  const submitTriple = useCallback(
    (triple: [CardId, CardId, CardId]) => {
      dispatch({ type: "SUBMIT_SET", cardIds: triple });
    },
    [dispatch],
  );

  const toggleCard = useCallback(
    (cardId: CardId) => {
      if (
        boardAnimatingRef.current ||
        state.status !== "playing" ||
        (modeId === "classic" && !roundStarted)
      ) {
        return;
      }
      setSelected((current) => {
        if (current.includes(cardId)) {
          return current.filter((id) => id !== cardId);
        }
        if (current.length >= 3) {
          return current;
        }
        const next = [...current, cardId];
        if (next.length === 3) {
          if (!submittingRef.current) {
            submittingRef.current = true;
            submitTriple([next[0]!, next[1]!, next[2]!]);
            queueMicrotask(() => {
              submittingRef.current = false;
            });
          }
          return [];
        }
        return next;
      });
    },
    [modeId, roundStarted, state.status, submitTriple],
  );

  const beginRound = useCallback(() => {
    startedAtRef.current = new Date().toISOString();
    startedAtMsRef.current = Date.now();
    setElapsedMs(0);
    setRoundStarted(true);
  }, []);

  const quitGame = useCallback(() => {
    dispatch({ type: "QUIT" });
  }, [dispatch]);

  const revealSet = useCallback(() => {
    if (boardAnimatingRef.current) {
      return;
    }
    setHintedCardIds([]);
    dispatch({ type: "REVEAL_SET" });
  }, [dispatch]);

  const dealExtra = useCallback(() => {
    if (boardAnimatingRef.current) {
      return;
    }
    const nowMs = Date.now();
    setClockMs(nowMs);
    setState((prev) => {
      const result = performGameAction(prev, { type: "DEAL_EXTRA" }, { nowMs });
      if (!result.ok) {
        if (result.error.code !== "CARD_NOT_ON_BOARD") {
          setMessage({ type: "error", text: result.error.message });
        }
        return prev;
      }
      applyEvents(result.events, prev.modeId, streakBeforeAction(prev));
      finalizeAction(prev, result.state, result.events);
      setMessage({ type: "success", text: "Drie extra kaarten gedeeld." });
      return result.state;
    });
  }, [applyEvents, finalizeAction]);

  const newGame = useCallback(() => {
    startedAtRef.current = new Date().toISOString();
    startedAtMsRef.current = Date.now();
    recordedEndRef.current = false;
    clearClearingTimeouts();
    if (hintTimeoutRef.current) {
      clearTimeout(hintTimeoutRef.current);
      hintTimeoutRef.current = null;
    }
    boardAnimatingRef.current = false;
    const fresh = startGame(modeId, `${Date.now()}`);
    setState(fresh);
    setBoardCardIds(fresh.board);
    setClearingSet(null);
    setSelected([]);
    setMessage(null);
    setFeedback(null);
    setStreak(0);
    setElapsedMs(0);
    setRoundStarted(modeId !== "classic");
    setHintedCardIds([]);
    setSaveNotice(null);
    setClockMs(Date.now());
  }, [clearClearingTimeouts, modeId]);

  return {
    state,
    boardCardIds,
    clearingSet,
    isBoardAnimating: clearingSet !== null,
    selected,
    hints,
    message,
    feedback,
    streak: state.modeId === "classic" ? state.currentStreak : streak,
    maxStreak: state.modeId === "classic" ? state.maxStreak : streak,
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
  };
}
