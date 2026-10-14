export type DomainErrorCode =
  | "INVALID_ACTION"
  | "GAME_NOT_PLAYING"
  | "CARD_NOT_ON_BOARD"
  | "DECK_EMPTY"
  | "CANNOT_DEAL_EXTRA"
  | "CANNOT_REVEAL_SET"
  | "NO_SET_ON_BOARD"
  | "INSUFFICIENT_SCORE"
  | "DUPLICATE_CARD";

export type DomainError = {
  code: DomainErrorCode;
  message: string;
};

export function domainError(
  code: DomainErrorCode,
  message: string,
): DomainError {
  return { code, message };
}
