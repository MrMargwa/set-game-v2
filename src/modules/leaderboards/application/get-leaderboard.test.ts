import { describe, expect, it } from "vitest";
import { getLeaderboard } from "./get-leaderboard";

describe("getLeaderboard", () => {
  it("rejects an unknown mode id", async () => {
    const result = await getLeaderboard({ modeId: "battle_royale" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("INVALID");
    }
  });
});
