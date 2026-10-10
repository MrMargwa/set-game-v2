import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { getMultiplayerGameForUser } from "@/modules/multiplayer/application/multiplayer-game-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  let user;
  try {
    user = await requireAuthenticatedUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await getMultiplayerGameForUser(id, user);
  if (!result.ok) {
    const status =
      result.error.code === "NOT_FOUND"
        ? 404
        : result.error.code === "FORBIDDEN"
          ? 403
          : 503;
    return NextResponse.json({ error: result.error.message }, { status });
  }

  return NextResponse.json({ game: result.game });
}
