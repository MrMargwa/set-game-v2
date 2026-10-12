import { NextResponse } from "next/server";
import { SESSION_EXPIRED_MESSAGE } from "@/shared/errors/player-messages";
import { requireAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { applyMultiplayerGameAction } from "@/modules/multiplayer/application/multiplayer-game-service";
import { multiplayerActionSchema } from "@/shared/validation/multiplayer-schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  let user;
  try {
    user = await requireAuthenticatedUser();
  } catch {
    return NextResponse.json({ error: SESSION_EXPIRED_MESSAGE }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = multiplayerActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Die actie is niet geldig." },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const result = await applyMultiplayerGameAction(
    id,
    user,
    parsed.data.version,
    parsed.data.action,
  );

  if (!result.ok) {
    const status =
      result.error.code === "NOT_FOUND"
        ? 404
        : result.error.code === "FORBIDDEN"
          ? 403
          : result.error.code === "CONFLICT"
            ? 409
            : result.error.code === "UNAVAILABLE"
              ? 503
              : 400;
    return NextResponse.json({ error: result.error.message }, { status });
  }

  return NextResponse.json({
    game: result.game,
    events: result.events,
  });
}
