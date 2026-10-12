import { NextResponse } from "next/server";
import { SESSION_EXPIRED_MESSAGE } from "@/shared/errors/player-messages";
import { requireAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { getLobbyForUser } from "@/modules/lobbies/application/lobby-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  let user;
  try {
    user = await requireAuthenticatedUser();
  } catch {
    return NextResponse.json({ error: SESSION_EXPIRED_MESSAGE }, { status: 401 });
  }

  const { id } = await context.params;
  const result = await getLobbyForUser(id, user);
  if (!result.ok) {
    const status =
      result.error.code === "NOT_FOUND"
        ? 404
        : result.error.code === "FORBIDDEN"
          ? 403
          : result.error.code === "UNAVAILABLE"
            ? 503
            : 400;
    return NextResponse.json({ error: result.error.message }, { status });
  }

  return NextResponse.json({ lobby: result.lobby });
}
