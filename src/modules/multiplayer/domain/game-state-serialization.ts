import {
  createInitialClassicState,
  DEFAULT_CLASSIC_CONFIG,
  type Card,
  type ClassicGameState,
  type Deck,
} from "@/core";
import {
  DEFAULT_MULTIPLAYER_RULES,
  type MultiplayerClassicSnapshot,
  type MultiplayerPlayer,
  type MultiplayerRules,
} from "./types";

export type PersistedMultiplayerState = {
  modeId: "classic";
  status: ClassicGameState["status"];
  endReason?: ClassicGameState["endReason"];
  config: ClassicGameState["config"];
  rngSeed: string;
  board: ClassicGameState["board"];
  deck: Deck;
  moves: number;
  catalogEntries: Card[];
  players: MultiplayerPlayer[];
  lastSetByUserId?: string;
  rules?: MultiplayerRules;
};

export function toPersistedState(
  classic: ClassicGameState,
  players: MultiplayerPlayer[],
  lastSetByUserId?: string,
  rules?: MultiplayerRules,
): PersistedMultiplayerState {
  return {
    modeId: "classic",
    status: classic.status,
    endReason: classic.endReason,
    config: classic.config,
    rngSeed: classic.rngSeed,
    board: classic.board,
    deck: classic.deck,
    moves: classic.moves,
    catalogEntries: [...classic.catalog.values()],
    players,
    lastSetByUserId,
    rules,
  };
}

export function resolveRules(state: PersistedMultiplayerState): MultiplayerRules {
  return {
    ...DEFAULT_MULTIPLAYER_RULES,
    ...state.rules,
    startedAt: state.rules?.startedAt || DEFAULT_MULTIPLAYER_RULES.startedAt,
  };
}

export function expireIfTimedOut(
  state: PersistedMultiplayerState,
  nowMs = Date.now(),
): PersistedMultiplayerState {
  const rules = resolveRules(state);
  if (state.status === "ended" || !rules.timeLimitSeconds || !rules.startedAt) {
    return state;
  }
  const started = Date.parse(rules.startedAt);
  if (!Number.isFinite(started)) return state;
  if (nowMs < started + rules.timeLimitSeconds * 1000) return state;
  return { ...state, status: "ended", endReason: "time_up" };
}

export function fromPersistedState(
  persisted: PersistedMultiplayerState,
): { classic: ClassicGameState; players: MultiplayerPlayer[] } {
  const catalog = new Map(persisted.catalogEntries.map((c) => [c.id, c]));

  const classic: ClassicGameState = {
    modeId: "classic",
    status: persisted.status,
    endReason: persisted.endReason,
    config: {
      ...persisted.config,
      hintCost: persisted.config.hintCost ?? 0,
      dealExtraCost: persisted.config.dealExtraCost ?? 0,
    },
    catalog,
    deck: persisted.deck,
    board: persisted.board,
    score: persisted.players.reduce((max, p) => Math.max(max, p.score), 0),
    moves: persisted.moves,
    validSetsFound: persisted.players.reduce((sum, p) => sum + p.validSetsFound, 0),
    currentStreak: 0,
    maxStreak: 0,
    invalidSubmits: 0,
    dealExtraUses: 0,
    hintUses: 0,
    rngSeed: persisted.rngSeed,
  };

  return {
    classic,
    players: persisted.players.map((player) => ({
      ...player,
      currentStreak: player.currentStreak ?? 0,
      maxStreak: player.maxStreak ?? 0,
    })),
  };
}

export function toClientSnapshot(
  persisted: PersistedMultiplayerState,
): MultiplayerClassicSnapshot {
  return {
    modeId: "classic",
    status: persisted.status,
    endReason: persisted.endReason,
    rngSeed: persisted.rngSeed,
    board: persisted.board,
    deckCount: persisted.deck.drawPile.length,
    moves: persisted.moves,
    players: persisted.players,
    lastSetByUserId: persisted.lastSetByUserId,
    rules: resolveRules(persisted),
  };
}

export function parsePersistedState(json: unknown): PersistedMultiplayerState {
  const data = json as PersistedMultiplayerState;
  if (!data || data.modeId !== "classic" || !Array.isArray(data.catalogEntries)) {
    throw new Error("Invalid multiplayer state payload");
  }
  return data;
}

export function createInitialPersistedState(
  seed: string,
  players: MultiplayerPlayer[],
  rules: Partial<MultiplayerRules> = {},
): PersistedMultiplayerState {
  const resolved: MultiplayerRules = {
    ...DEFAULT_MULTIPLAYER_RULES,
    ...rules,
    startedAt: rules.startedAt || new Date().toISOString(),
  };
  const boardSize = resolved.initialBoardSize || DEFAULT_MULTIPLAYER_RULES.initialBoardSize;
  const deckSize = Math.max(boardSize, resolved.deckSize || DEFAULT_MULTIPLAYER_RULES.deckSize);
  const dealExtraSize = resolved.dealExtraSize ?? DEFAULT_MULTIPLAYER_RULES.dealExtraSize;
  const classic = createInitialClassicState(seed, {
    ...DEFAULT_CLASSIC_CONFIG,
    comboScoring: false,
    basePoints: 1,
    pointsPerSet: 1,
    initialBoardSize: boardSize,
    dealExtraSize: Math.max(1, dealExtraSize),
    maxDealExtraUses: null,
    dealExtraRequiresNoSet: true,
    maxHintUses: 0,
    hintCost: 0,
    dealExtraCost: 0,
  });
  const keptDraw = Math.max(0, deckSize - classic.board.length);
  return toPersistedState(
    {
      ...classic,
      deck: {
        ...classic.deck,
        drawPile: classic.deck.drawPile.slice(0, keptDraw),
      },
    },
    players,
    undefined,
    {
      ...resolved,
      dealExtraSize,
      deckSize,
      allowDealExtra: dealExtraSize > 0,
      initialBoardSize: boardSize,
      boardColumns: resolved.boardColumns || DEFAULT_MULTIPLAYER_RULES.boardColumns,
    },
  );
}
