import type { CardCatalog, CardId, CardTriple, Deck } from "../cards";
import type { DomainError } from "@/shared/errors/domain-error";

export type GameStatus = "playing" | "ended";

export type EndReason =
  | "deck_empty"
  | "no_set_remaining"
  | "player_quit"
  | "time_up";

export type ClassicGameConfig = {
  modeId: "classic";
  initialBoardSize: 12;
  dealExtraSize: 3;
  pointsPerSet: 1;
};

export const DEFAULT_CLASSIC_CONFIG: ClassicGameConfig = {
  modeId: "classic",
  initialBoardSize: 12,
  dealExtraSize: 3,
  pointsPerSet: 1,
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
  rngSeed: string;
};

export type GameAction =
  | { type: "SUBMIT_SET"; cardIds: readonly [CardId, CardId, CardId] }
  | { type: "DEAL_EXTRA" }
  | { type: "NEW_GAME"; seed?: string }
  | { type: "QUIT" }
  | { type: "TICK" };

export type GameEvent =
  | { type: "SET_FOUND"; cardIds: CardTriple }
  | { type: "SET_INVALID"; cardIds: CardTriple }
  | { type: "CARDS_DEALT"; cardIds: CardId[]; reason: "replace" | "extra" }
  | { type: "GAME_ENDED"; reason: EndReason };

export type ApplyResult<S = ClassicGameState> =
  | { ok: true; state: S; events: GameEvent[] }
  | { ok: false; error: DomainError };

export type LegalHints = {
  hasSetOnBoard: boolean;
  canDealExtra: boolean;
};
