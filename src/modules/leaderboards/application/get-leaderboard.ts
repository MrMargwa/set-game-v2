import { isGameModeId, parseGameModeId, type GameModeId } from "@/core/game-modes";
import type { FastestClearEntry, LeaderboardResult, LeaderboardScope } from "../domain/types";
import { LeaderboardRepository } from "../infrastructure/leaderboard-repository";

const repository = new LeaderboardRepository();

export type GetLeaderboardInput = {
  modeId?: string;
  scope?: string;
  limit?: number;
};

export type GetLeaderboardError = {
  code: "INVALID" | "UNAVAILABLE";
  message: string;
};

export async function getLeaderboard(
  input: GetLeaderboardInput,
): Promise<
  { ok: true; data: LeaderboardResult } | { ok: false; error: GetLeaderboardError }
> {
  const modeId: GameModeId = parseGameModeId(input.modeId);
  const scope: LeaderboardScope =
    input.scope === "top_runs" ? "top_runs" : "personal_best";
  const limit = input.limit ?? 25;

  if (input.modeId && !isGameModeId(input.modeId)) {
    return {
      ok: false,
      error: { code: "INVALID", message: "Onbekende modus." },
    };
  }

  try {
    const entries = await repository.list(modeId, scope, limit);
    return {
      ok: true,
      data: { modeId, scope, entries },
    };
  } catch {
    return {
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "Het leaderboard is tijdelijk niet beschikbaar. Probeer het later opnieuw.",
      },
    };
  }
}

export async function getFastestDeckClears(input: {
  modeId?: string;
  limit?: number;
}): Promise<
  { ok: true; data: { modeId: GameModeId; entries: FastestClearEntry[] } } | { ok: false; error: GetLeaderboardError }
> {
  const modeId: GameModeId = parseGameModeId(input.modeId);
  if (input.modeId && !isGameModeId(input.modeId)) {
    return {
      ok: false,
      error: { code: "INVALID", message: "Onbekende modus." },
    };
  }

  try {
    const entries = await repository.listFastestDeckClears(modeId, input.limit ?? 25);
    return { ok: true, data: { modeId, entries } };
  } catch {
    return {
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "De tijden zijn tijdelijk niet beschikbaar. Probeer het later opnieuw.",
      },
    };
  }
}
