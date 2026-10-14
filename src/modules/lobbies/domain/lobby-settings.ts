export const LOBBY_PLAYER_COUNTS = [2, 3, 4] as const;
export const LOBBY_MODES = ["classic", "time_attack"] as const;

export const LOBBY_MIN_MINUTES = 1;
export const LOBBY_MAX_MINUTES = 60;
export const CLASSIC_DEFAULT_SECONDS = 10 * 60;
export const TIME_ATTACK_TIME_STEPS = [10, 20, 30, 45, 60, 90, 120] as const;
export const TIME_ATTACK_DEFAULT_SECONDS = 60;

export const LOBBY_DEAL_EXTRA_SIZES = [0, 1, 3, 5] as const;
export const LOBBY_DECK_SIZES = [27, 54, 81] as const;
export const LOBBY_BOARDS = [
  { columns: 3, cards: 9, label: "3×3" },
  { columns: 5, cards: 15, label: "5×3" },
  { columns: 6, cards: 18, label: "6×3" },
] as const;

export type LobbyPlayerCount = (typeof LOBBY_PLAYER_COUNTS)[number];
export type LobbyMode = (typeof LOBBY_MODES)[number];
export type LobbyDealExtraSize = (typeof LOBBY_DEAL_EXTRA_SIZES)[number];
export type LobbyDeckSize = (typeof LOBBY_DECK_SIZES)[number];
export type LobbyBoard = (typeof LOBBY_BOARDS)[number];

export type LobbyMatchSettings = {
  maxPlayers: LobbyPlayerCount;
  hasPassword: boolean;
  mode: LobbyMode;
  timeLimitSeconds: number;
  dealExtraSize: LobbyDealExtraSize;
  deckSize: LobbyDeckSize;
  boardColumns: LobbyBoard["columns"];
  initialBoardSize: LobbyBoard["cards"];
};

export const DEFAULT_LOBBY_MATCH_SETTINGS: LobbyMatchSettings = {
  maxPlayers: 4,
  hasPassword: false,
  mode: "classic",
  timeLimitSeconds: CLASSIC_DEFAULT_SECONDS,
  dealExtraSize: 3,
  deckSize: 81,
  boardColumns: 5,
  initialBoardSize: 15,
};

export function isLobbyPlayerCount(value: number): value is LobbyPlayerCount {
  return LOBBY_PLAYER_COUNTS.some((count) => count === value);
}

export function isLobbyMode(value: string): value is LobbyMode {
  return LOBBY_MODES.some((mode) => mode === value);
}

export function isLobbyTimeLimit(mode: LobbyMode, value: number): boolean {
  if (!Number.isInteger(value)) return false;
  if (mode === "time_attack") {
    return TIME_ATTACK_TIME_STEPS.some((step) => step === value);
  }
  return value >= LOBBY_MIN_MINUTES * 60 && value <= LOBBY_MAX_MINUTES * 60 && value % 60 === 0;
}

export function defaultSecondsForMode(mode: LobbyMode): number {
  return mode === "time_attack" ? TIME_ATTACK_DEFAULT_SECONDS : CLASSIC_DEFAULT_SECONDS;
}

export function clampTimeLimit(mode: LobbyMode, seconds: number | null): number {
  if (seconds != null && isLobbyTimeLimit(mode, seconds)) return seconds;
  return defaultSecondsForMode(mode);
}

export function isLobbyDealExtraSize(value: number): value is LobbyDealExtraSize {
  return LOBBY_DEAL_EXTRA_SIZES.some((size) => size === value);
}

export function isLobbyDeckSize(value: number): value is LobbyDeckSize {
  return LOBBY_DECK_SIZES.some((size) => size === value);
}

export function lobbyBoardFor(
  columns: number | null,
  cards: number | null,
): LobbyBoard {
  return (
    LOBBY_BOARDS.find((board) => board.columns === columns && board.cards === cards) ??
    LOBBY_BOARDS[1]
  );
}

export function formatLobbyTime(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (rest === 0) return `${minutes} min`;
  return `${minutes}:${rest.toString().padStart(2, "0")}`;
}
