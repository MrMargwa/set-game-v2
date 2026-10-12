import {
  createInitialClassicState,
  DEFAULT_CLASSIC_CONFIG,
  type Card,
  type ClassicGameState,
  type Deck,
} from "@/core";
import type { MultiplayerClassicSnapshot, MultiplayerPlayer } from "./types";

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
};

export function toPersistedState(
  classic: ClassicGameState,
  players: MultiplayerPlayer[],
  lastSetByUserId?: string,
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
  };
}

export function fromPersistedState(
  persisted: PersistedMultiplayerState,
): { classic: ClassicGameState; players: MultiplayerPlayer[] } {
  const catalog = new Map(persisted.catalogEntries.map((c) => [c.id, c]));

  const classic: ClassicGameState = {
    modeId: "classic",
    status: persisted.status,
    endReason: persisted.endReason,
    config: persisted.config,
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

  return { classic, players: persisted.players };
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
): PersistedMultiplayerState {
  const classic = createInitialClassicState(seed, {
    ...DEFAULT_CLASSIC_CONFIG,
    comboScoring: false,
    basePoints: 1,
    pointsPerSet: 1,
    initialBoardSize: 12,
    maxDealExtraUses: null,
    dealExtraRequiresNoSet: true,
    maxHintUses: 0,
  });
  return toPersistedState(classic, players);
}
