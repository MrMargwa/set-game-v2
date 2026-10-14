import { NextResponse } from "next/server";
import { getFastestDeckClears } from "@/modules/leaderboards/application/get-leaderboard";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("mode") ?? undefined;
  const limitRaw = searchParams.get("limit");
  const limit = limitRaw ? Number.parseInt(limitRaw, 10) : undefined;

  const result = await getFastestDeckClears({ modeId: mode, limit });
  if (!result.ok) {
    const status = result.error.code === "UNAVAILABLE" ? 503 : 400;
    return NextResponse.json({ error: result.error.message }, { status });
  }

  return NextResponse.json({ entries: result.data.entries });
}
