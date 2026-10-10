import type { GameState } from "@/core";

export async function persistGameResult(
  state: GameState,
  startedAtIso: string,
): Promise<void> {
  if (state.status !== "ended" || !state.endReason) {
    return;
  }

  await fetch("/api/games/record", {
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
}
