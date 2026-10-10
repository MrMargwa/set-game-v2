import {
  discardCards,
  drawCards,
  type Card,
  type CardId,
} from "../cards";
import { pointsForValidSet } from "../scoring/classic-scoring";
import { findSets } from "../set-rules";
import { isValidSet } from "../set-rules/is-valid-set";
import { createInitialClassicState } from "./create-initial-state";
import { evaluateGameEnd } from "./evaluate-game-end";
import type {
  ApplyResult,
  ClassicGameState,
  GameAction,
  GameEvent,
} from "./types";
import { domainError } from "@/shared/errors/domain-error";

function cardsOnBoard(
  board: readonly CardId[],
  cardIds: readonly CardId[],
): boolean {
  const boardSet = new Set(board);
  return cardIds.every((id) => boardSet.has(id));
}

function resolveSubmitCards(
  state: ClassicGameState,
  cardIds: readonly [CardId, CardId, CardId],
):
  | { ok: true; cards: [Card, Card, Card] }
  | { ok: false; error: ReturnType<typeof domainError> } {
  const unique = new Set(cardIds);
  if (unique.size !== 3) {
    return {
      ok: false,
      error: domainError("DUPLICATE_CARD", "Select three different cards"),
    };
  }

  if (!cardsOnBoard(state.board, cardIds)) {
    return {
      ok: false,
      error: domainError(
        "CARD_NOT_ON_BOARD",
        "All selected cards must be on the board",
      ),
    };
  }

  const a = state.catalog.get(cardIds[0]);
  const b = state.catalog.get(cardIds[1]);
  const c = state.catalog.get(cardIds[2]);
  if (!a || !b || !c) {
    return {
      ok: false,
      error: domainError("CARD_NOT_ON_BOARD", "Unknown card on board"),
    };
  }

  return { ok: true, cards: [a, b, c] as [Card, Card, Card] };
}

function withEndEvaluation(
  state: ClassicGameState,
  events: GameEvent[],
): ApplyResult {
  const end = evaluateGameEnd(state);
  let next = state;

  if (end.status === "ended" && state.status === "playing") {
    next = { ...state, status: "ended", endReason: end.endReason };
    events.push({ type: "GAME_ENDED", reason: end.endReason! });
  }

  return { ok: true, state: next, events };
}

function submitSet(
  state: ClassicGameState,
  cardIds: readonly [CardId, CardId, CardId],
): ApplyResult {
  if (state.status !== "playing") {
    return {
      ok: false,
      error: domainError("GAME_NOT_PLAYING", "Game is not in progress"),
    };
  }

  const resolved = resolveSubmitCards(state, cardIds);
  if (!resolved.ok) {
    return resolved;
  }

  const [a, b, c] = resolved.cards;
  const events: GameEvent[] = [];
  const moves = state.moves + 1;

  if (!isValidSet(a, b, c)) {
    events.push({ type: "SET_INVALID", cardIds });
    return {
      ok: true,
      state: { ...state, moves },
      events,
    };
  }

  const removeSet = new Set(cardIds);
  const board = state.board.filter((id) => !removeSet.has(id));
  let deck = discardCards(state.deck, [...cardIds]);

  const drawCount = Math.min(state.config.dealExtraSize, deck.drawPile.length);
  const drawn = drawCards(deck, drawCount);
  deck = drawn.deck;
  const newBoard = [...board, ...drawn.drawn];

  if (drawn.drawn.length > 0) {
    events.push({
      type: "CARDS_DEALT",
      cardIds: drawn.drawn,
      reason: "replace",
    });
  }

  events.push({ type: "SET_FOUND", cardIds });

  const score = state.score + pointsForValidSet(state.config);
  const validSetsFound = state.validSetsFound + 1;

  const interim: ClassicGameState = {
    ...state,
    deck,
    board: newBoard,
    score,
    moves,
    validSetsFound,
  };

  return withEndEvaluation(interim, events);
}

function dealExtra(state: ClassicGameState): ApplyResult {
  if (state.status !== "playing") {
    return {
      ok: false,
      error: domainError("GAME_NOT_PLAYING", "Game is not in progress"),
    };
  }

  const sets = findSets(state.board, state.catalog);
  if (sets.length > 0) {
    return {
      ok: false,
      error: domainError(
        "CANNOT_DEAL_EXTRA",
        "Cannot deal extra cards while a SET exists on the board",
      ),
    };
  }

  if (state.deck.drawPile.length < state.config.dealExtraSize) {
    return {
      ok: false,
      error: domainError("DECK_EMPTY", "Not enough cards left in the deck"),
    };
  }

  const drawn = drawCards(state.deck, state.config.dealExtraSize);
  const events: GameEvent[] = [
    {
      type: "CARDS_DEALT",
      cardIds: drawn.drawn,
      reason: "extra",
    },
  ];

  const interim: ClassicGameState = {
    ...state,
    deck: drawn.deck,
    board: [...state.board, ...drawn.drawn],
  };

  return withEndEvaluation(interim, events);
}

export function applyAction(
  state: ClassicGameState,
  action: GameAction,
): ApplyResult {
  switch (action.type) {
    case "NEW_GAME": {
      const seed = action.seed ?? `${Date.now()}`;
      const fresh = createInitialClassicState(seed, state.config);
      return { ok: true, state: fresh, events: [] };
    }
    case "QUIT": {
      if (state.status === "ended") {
        return {
          ok: false,
          error: domainError("GAME_NOT_PLAYING", "Game already ended"),
        };
      }
      return {
        ok: true,
        state: { ...state, status: "ended", endReason: "player_quit" },
        events: [{ type: "GAME_ENDED", reason: "player_quit" }],
      };
    }
    case "SUBMIT_SET":
      return submitSet(state, action.cardIds);
    case "DEAL_EXTRA":
      return dealExtra(state);
    case "TICK":
      return {
        ok: false,
        error: domainError("INVALID_ACTION", "Timer not used in Classic mode"),
      };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
