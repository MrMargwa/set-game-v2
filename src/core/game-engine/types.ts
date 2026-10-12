import type { CardCatalog, CardId, CardTriple, Deck } from "../cards";
import type { DomainError } from "@/shared/errors/domain-error";

export type GameStatus = "playing" | "ended";

export type EndReason =
  | "deck_empty"
  | "no_set_remaining"
  | "player_quit"
  | "time_up";

/** Hoe vaak Classic per ronde +3 kaarten mag trekken. */
export const CLASSIC_MAX_DEAL_EXTRA_USES = 5;

/** Hoe vaak Classic per ronde een SET mag laten aanwijzen. */
export const CLASSIC_MAX_HINT_USES = 5;

export type ClassicGameConfig = {
  modeId: "classic";
  initialBoardSize: number;
  dealExtraSize: 3;
  /** Flat points when combo scoring is off (Time Attack / multiplayer). */
  pointsPerSet: number;
  /** Base points before the streak multiplier (Classic). */
  basePoints: number;
  comboScoring: boolean;
  /** `null` = onbeperkt (Time Attack / multiplayer). */
  maxDealExtraUses: number | null;
  /** Classic mag +3 ook gebruiken als er nog een SET op het bord ligt. */
  dealExtraRequiresNoSet: boolean;
  /** `0` = uit. `null` = onbeperkt. */
  maxHintUses: number | null;
};

export const DEFAULT_CLASSIC_CONFIG: ClassicGameConfig = {
  modeId: "classic",
  initialBoardSize: 18,
  dealExtraSize: 3,
  pointsPerSet: 1,
  basePoints: 1000,
  comboScoring: true,
  maxDealExtraUses: CLASSIC_MAX_DEAL_EXTRA_USES,
  dealExtraRequiresNoSet: false,
  maxHintUses: CLASSIC_MAX_HINT_USES,
};

export type ClassicGameState = {
  modeId: "classic";
  status: GameStatus;
  endReason?: EndReason;
  config: ClassicGameConfig;
  catalog: CardCatalog;
  deck: Deck;
  board: CardId[];
  score: number;
  moves: number;
  validSetsFound: number;
  currentStreak: number;
  maxStreak: number;
  invalidSubmits: number;
  dealExtraUses: number;
  hintUses: number;
  rngSeed: string;
};

export type GameAction =
  | { type: "SUBMIT_SET"; cardIds: readonly [CardId, CardId, CardId] }
  | { type: "DEAL_EXTRA" }
  | { type: "REVEAL_SET" }
  | { type: "NEW_GAME"; seed?: string }
  | { type: "QUIT" }
  | { type: "TICK" };

export type GameEvent =
  | {
      type: "SET_FOUND";
      cardIds: CardTriple;
      pointsEarned: number;
      streakAfter: number;
      multiplier: number;
    }
  | { type: "SET_INVALID"; cardIds: CardTriple }
  | { type: "CARDS_DEALT"; cardIds: CardId[]; reason: "replace" | "extra" }
  | { type: "SET_REVEALED"; cardIds: CardTriple }
  | { type: "GAME_ENDED"; reason: EndReason };

export type ApplyResult<S = ClassicGameState> =
  | { ok: true; state: S; events: GameEvent[] }
  | { ok: false; error: DomainError };

export type LegalHints = {
  hasSetOnBoard: boolean;
  canDealExtra: boolean;
};
