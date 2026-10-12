import type { GameState } from "@/core";

export type PersistGameResultStatus = "saved" | "guest" | "failed" | "skipped";

export async function persistGameResult(
  state: GameState,
  startedAtIso: string,
): Promise<PersistGameResultStatus> {
  if (state.status !== "ended" || !state.endReason) {
    return "skipped";
  }

  try {
    const response = await fetch("/api/games/record", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        modeId: state.modeId,
        finalScore: state.score,
        validSetsFound: state.validSetsFound,
        moves: state.moves,
        endReason: state.endReason,
        rngSeed: state.rngSeed,
        startedAt: startedAtIso,
      }),
    });

    if (response.status === 401) {
      return "guest";
    }
    if (!response.ok) {
      return "failed";
    }
    return "saved";
  } catch {
    return "failed";
  }
}
