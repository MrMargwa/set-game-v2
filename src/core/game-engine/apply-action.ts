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
      error: domainError("DUPLICATE_CARD", "Kies drie verschillende kaarten."),
    };
  }

  if (!cardsOnBoard(state.board, cardIds)) {
    return {
      ok: false,
      error: domainError(
        "CARD_NOT_ON_BOARD",
        "Alle gekozen kaarten moeten op het bord liggen.",
      ),
    };
  }

  const a = state.catalog.get(cardIds[0]);
  const b = state.catalog.get(cardIds[1]);
  const c = state.catalog.get(cardIds[2]);
  if (!a || !b || !c) {
    return {
      ok: false,
      error: domainError("CARD_NOT_ON_BOARD", "Onbekende kaart op het bord."),
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
      error: domainError("GAME_NOT_PLAYING", "Dit spel loopt niet meer."),
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
      state: {
        ...state,
        moves,
        currentStreak: 0,
        invalidSubmits: state.invalidSubmits + 1,
      },
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

  const streakAfter = state.currentStreak + 1;
  const awarded = pointsForValidSet(state.config, streakAfter);
  events.push({
    type: "SET_FOUND",
    cardIds,
    pointsEarned: awarded.points,
    streakAfter,
    multiplier: awarded.multiplier,
  });

  const validSetsFound = state.validSetsFound + 1;

  const interim: ClassicGameState = {
    ...state,
    deck,
    board: newBoard,
    score: state.score + awarded.points,
    moves,
    validSetsFound,
    currentStreak: streakAfter,
    maxStreak: Math.max(state.maxStreak, streakAfter),
  };

  return withEndEvaluation(interim, events);
}

function dealExtra(state: ClassicGameState): ApplyResult {
  if (state.status !== "playing") {
    return {
      ok: false,
      error: domainError("GAME_NOT_PLAYING", "Dit spel loopt niet meer."),
    };
  }

  const sets = findSets(state.board, state.catalog);
  if (state.config.dealExtraRequiresNoSet && sets.length > 0) {
    return {
      ok: false,
      error: domainError(
        "CANNOT_DEAL_EXTRA",
        "Er ligt nog een SET op het bord.",
      ),
    };
  }

  if (
    state.config.maxDealExtraUses !== null &&
    state.dealExtraUses >= state.config.maxDealExtraUses
  ) {
    return {
      ok: false,
      error: domainError(
        "CANNOT_DEAL_EXTRA",
        "Je extra kaarten voor deze ronde zijn op.",
      ),
    };
  }

  if (state.deck.drawPile.length < state.config.dealExtraSize) {
    return {
      ok: false,
      error: domainError("DECK_EMPTY", "Er zijn niet genoeg kaarten over in het deck."),
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
    dealExtraUses: state.dealExtraUses + 1,
  };

  return withEndEvaluation(interim, events);
}

function revealSet(state: ClassicGameState): ApplyResult {
  if (state.status !== "playing") {
    return {
      ok: false,
      error: domainError("GAME_NOT_PLAYING", "Dit spel loopt niet meer."),
    };
  }

  const maxHints = state.config.maxHintUses;
  if (maxHints === 0) {
    return {
      ok: false,
      error: domainError("INVALID_ACTION", "Een SET aanwijzen hoort niet bij deze mode."),
    };
  }

  if (maxHints !== null && state.hintUses >= maxHints) {
    return {
      ok: false,
      error: domainError("CANNOT_REVEAL_SET", "Je hints voor deze ronde zijn op."),
    };
  }

  const sets = findSets(state.board, state.catalog);
  const revealed = sets[0];
  if (!revealed) {
    return {
      ok: false,
      error: domainError("NO_SET_ON_BOARD", "Er ligt geen SET op het bord."),
    };
  }

  return {
    ok: true,
    state: { ...state, hintUses: state.hintUses + 1 },
    events: [{ type: "SET_REVEALED", cardIds: revealed }],
  };
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
          error: domainError("GAME_NOT_PLAYING", "Dit spel is al afgelopen."),
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
    case "REVEAL_SET":
      return revealSet(state);
    case "TICK":
      return {
        ok: false,
        error: domainError("INVALID_ACTION", "De timer hoort niet bij Classic."),
      };
    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}
