export type DomainErrorCode =
  | "INVALID_ACTION"
  | "GAME_NOT_PLAYING"
  | "CARD_NOT_ON_BOARD"
  | "DECK_EMPTY"
  | "CANNOT_DEAL_EXTRA"
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
