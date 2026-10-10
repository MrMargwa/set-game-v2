import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { recordGameSummary } from "@/modules/games/application/record-game-result";

const recordSchema = z.object({
  modeId: z.enum(["classic", "time_attack"]),
  finalScore: z.number().int().min(0),
  validSetsFound: z.number().int().min(0),
  moves: z.number().int().min(0),
  endReason: z.enum([
    "deck_empty",
    "no_set_remaining",
    "player_quit",
    "time_up",
  ]),
  rngSeed: z.string().min(1),
  startedAt: z.string().datetime(),
});

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuthenticatedUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = recordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid payload" },
      { status: 400 },
    );
  }

  try {
    const id = await recordGameSummary({
      userId: user.id,
      startedAt: new Date(parsed.data.startedAt),
      summary: {
        modeId: parsed.data.modeId,
        finalScore: parsed.data.finalScore,
        validSetsFound: parsed.data.validSetsFound,
        moves: parsed.data.moves,
        endReason: parsed.data.endReason,
        rngSeed: parsed.data.rngSeed,
      },
    });

    return NextResponse.json({ id });
  } catch {
    return NextResponse.json(
      { error: "Could not save game result" },
      { status: 503 },
    );
  }
}
