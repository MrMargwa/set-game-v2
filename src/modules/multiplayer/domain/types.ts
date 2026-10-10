import type { CardId, EndReason, GameStatus } from "@/core";
import type { UserId } from "@/modules/accounts/domain/user";

export type MultiplayerPlayer = {
  userId: UserId;
  username: string;
  score: number;
  validSetsFound: number;
};

export type MultiplayerClassicSnapshot = {
  modeId: "classic";
  status: GameStatus;
  endReason?: EndReason;
  rngSeed: string;
  board: CardId[];
  deckCount: number;
  moves: number;
  players: MultiplayerPlayer[];
  lastSetByUserId?: UserId;
};

export type MultiplayerGameRecord = {
  id: string;
  lobbyId: string;
  modeId: string;
  version: number;
  status: "playing" | "ended";
  state: MultiplayerClassicSnapshot;
};
