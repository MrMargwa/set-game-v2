import type { CardCatalog, CardId, CardTriple, Deck } from "../cards";
import type { DomainError } from "@/shared/errors/domain-error";

export type GameStatus = "playing" | "ended";

export type EndReason =
  | "deck_empty"
  | "no_set_remaining"
  | "player_quit"
  | "time_up"
  | "target_reached";

/** Punten voor een geldige SET in Classic. */
export const CLASSIC_POINTS_PER_SET = 741;

/** Punten die een hint kost. Hoger dan extra kaarten. */
export const CLASSIC_HINT_COST = 250;

/** Punten die +3 kaarten kost. */
export const CLASSIC_DEAL_EXTRA_COST = 125;

/** Hoe vaak solo +3 kaarten mag in één ronde. */
export const CLASSIC_MAX_DEAL_EXTRA_USES = 5;

export type ClassicGameConfig = {
  modeId: "classic";
  initialBoardSize: number;
  dealExtraSize: number;
  /** Flat points when combo scoring is off. */
  pointsPerSet: number;
  /** Base points before the streak multiplier (multiplayer). */
  basePoints: number;
  comboScoring: boolean;
  /** `null` = onbeperkt. */
  maxDealExtraUses: number | null;
  dealExtraRequiresNoSet: boolean;
  /** `0` = uit. `null` = onbeperkt. */
  maxHintUses: number | null;
  hintCost: number;
  dealExtraCost: number;
};

export const DEFAULT_CLASSIC_CONFIG: ClassicGameConfig = {
  modeId: "classic",
  initialBoardSize: 12,
  dealExtraSize: 3,
  pointsPerSet: CLASSIC_POINTS_PER_SET,
  basePoints: 1000,
  comboScoring: false,
  maxDealExtraUses: CLASSIC_MAX_DEAL_EXTRA_USES,
  dealExtraRequiresNoSet: false,
  maxHintUses: null,
  hintCost: CLASSIC_HINT_COST,
  dealExtraCost: CLASSIC_DEAL_EXTRA_COST,
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
  | {
      type: "CARDS_DEALT";
      cardIds: CardId[];
      reason: "replace" | "extra";
      pointsSpent?: number;
    }
  | { type: "SET_REVEALED"; cardIds: CardTriple; pointsSpent: number }
  | { type: "GAME_ENDED"; reason: EndReason };

export type ApplyResult<S = ClassicGameState> =
  | { ok: true; state: S; events: GameEvent[] }
  | { ok: false; error: DomainError };

export type LegalHints = {
  hasSetOnBoard: boolean;
  canDealExtra: boolean;
};
