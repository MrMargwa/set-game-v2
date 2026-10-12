import { createCardCatalog, createShuffledDeck, drawCards } from "../cards";
import {
  DEFAULT_CLASSIC_CONFIG,
  type ClassicGameConfig,
  type ClassicGameState,
} from "./types";

export function createInitialClassicState(
  seed = `${Date.now()}`,
  config: ClassicGameConfig = DEFAULT_CLASSIC_CONFIG,
): ClassicGameState {
  const catalog = createCardCatalog();
  let deck = createShuffledDeck(catalog, seed);
  const drawResult = drawCards(deck, config.initialBoardSize);
  deck = drawResult.deck;

  return {
    modeId: "classic",
    status: "playing",
    config,
    catalog,
    deck,
    board: drawResult.drawn,
    score: 0,
    moves: 0,
    validSetsFound: 0,
    currentStreak: 0,
    maxStreak: 0,
    invalidSubmits: 0,
    dealExtraUses: 0,
    hintUses: 0,
    rngSeed: seed,
  };
}
