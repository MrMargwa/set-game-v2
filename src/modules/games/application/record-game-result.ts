import type { EndReason } from "@/core";
import type { GameModeId, GameState } from "@/core/game-modes";
import type { UserId } from "@/modules/accounts/domain/user";
import { GameSessionRepository } from "../infrastructure/game-session-repository";

const repository = new GameSessionRepository();

export type GameResultSummary = {
  modeId: GameModeId;
  finalScore: number;
  validSetsFound: number;
  moves: number;
  endReason: EndReason;
  rngSeed: string;
};

export type RecordGameResultInput = {
  userId: UserId;
  state: GameState;
  startedAt: Date;
  endedAt?: Date;
};

export async function recordGameResult(
  input: RecordGameResultInput,
): Promise<string> {
  const { state } = input;
  if (state.status !== "ended" || !state.endReason) {
    throw new Error("Game is not completed");
  }

  return recordGameSummary({
    userId: input.userId,
    startedAt: input.startedAt,
    endedAt: input.endedAt,
    summary: {
      modeId: state.modeId,
      finalScore: state.score,
      validSetsFound: state.validSetsFound,
      moves: state.moves,
      endReason: state.endReason as EndReason,
      rngSeed: state.rngSeed,
    },
  });
}

export async function recordGameSummary(input: {
  userId: UserId;
  startedAt: Date;
  endedAt?: Date;
  summary: GameResultSummary;
}): Promise<string> {
  return repository.recordCompleted({
    userId: input.userId,
    modeId: input.summary.modeId,
    finalScore: input.summary.finalScore,
    validSetsFound: input.summary.validSetsFound,
    moves: input.summary.moves,
    endReason: input.summary.endReason,
    rngSeed: input.summary.rngSeed,
    startedAt: input.startedAt,
    endedAt: input.endedAt ?? new Date(),
  });
}
