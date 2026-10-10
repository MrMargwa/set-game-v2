"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CardId, GameAction, GameEvent, GameModeId, GameState } from "@/core";
import { getRemainingMs, listGameModes } from "@/core/game-modes";
import {
  getBoardLegalHints,
  performGameAction,
  startGame,
} from "../application/game-service";
import { persistGameResult } from "./persist-game-result";

export type BoardGameMessage =
  | { type: "success"; text: string }
  | { type: "error"; text: string }
  | null;

export function useBoardGame(modeId: GameModeId, initialSeed?: string) {
  const startedAtRef = useRef(new Date().toISOString());
  const recordedEndRef = useRef(false);

  const [state, setState] = useState<GameState>(() =>
    startGame(modeId, initialSeed ?? `${Date.now()}`),
  );
  const [selected, setSelected] = useState<CardId[]>([]);
  const [message, setMessage] = useState<BoardGameMessage>(null);
  const [clockMs, setClockMs] = useState(() => Date.now());

  const modeMeta = useMemo(
    () => listGameModes().find((m) => m.id === modeId),
    [modeId],
  );

  const hints = useMemo(() => getBoardLegalHints(state), [state]);

  const remainingSeconds =
    state.modeId === "time_attack"
      ? Math.ceil(getRemainingMs(state, clockMs) / 1000)
      : null;

  const applyEvents = useCallback((events: GameEvent[], mode: GameModeId) => {
    for (const event of events) {
      if (event.type === "SET_INVALID") {
        setMessage({
          type: "error",
          text:
            mode === "time_attack"
              ? "Geen geldige SET — 3 seconden straf!"
              : "Geen geldige SET — probeer opnieuw.",
        });
      }
      if (event.type === "SET_FOUND") {
        setMessage({ type: "success", text: "SET gevonden! +1 punt" });
      }
      if (event.type === "GAME_ENDED") {
        setMessage({
          type: "success",
          text:
            event.reason === "time_up"
              ? "Tijd is op!"
              : event.reason === "deck_empty"
                ? "Spel afgelopen — deck is leeg!"
                : event.reason === "no_set_remaining"
                  ? "Spel afgelopen — geen SET meer mogelijk."
                  : "Spel beëindigd.",
        });
      }
    }
  }, []);

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
          applyEvents(result.events, prev.modeId);
        }
        return result.state;
      });
    }, 250);

    return () => clearInterval(interval);
  }, [applyEvents, state.modeId, state.status]);

  useEffect(() => {
    if (state.status !== "ended" || !state.endReason) {
      return;
    }
    if (recordedEndRef.current) {
      return;
    }
    recordedEndRef.current = true;
    void persistGameResult(state, startedAtRef.current);
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
        applyEvents(result.events, prev.modeId);
        return result.state;
      });
    },
    [applyEvents],
  );

  const submitTriple = useCallback(
    (triple: [CardId, CardId, CardId]) => {
      dispatch({ type: "SUBMIT_SET", cardIds: triple });
    },
    [dispatch],
  );

  const toggleCard = useCallback(
    (cardId: CardId) => {
      if (state.status !== "playing") {
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
          submitTriple([next[0]!, next[1]!, next[2]!]);
          return [];
        }
        return next;
      });
    },
    [state.status, submitTriple],
  );

  const dealExtra = useCallback(() => {
    dispatch({ type: "DEAL_EXTRA" });
    setMessage({ type: "success", text: "Drie extra kaarten gedeeld." });
  }, [dispatch]);

  const newGame = useCallback(() => {
    startedAtRef.current = new Date().toISOString();
    recordedEndRef.current = false;
    setState(startGame(modeId, `${Date.now()}`));
    setSelected([]);
    setMessage(null);
    setClockMs(Date.now());
  }, [modeId]);

  return {
    state,
    selected,
    hints,
    message,
    modeMeta,
    remainingSeconds,
    toggleCard,
    dealExtra,
    newGame,
  };
}
