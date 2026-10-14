import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { updateLobbySettings } from "@/modules/lobbies/application/lobby-service";
import { SESSION_EXPIRED_MESSAGE } from "@/shared/errors/player-messages";
import { lobbySettingsSchema } from "@/shared/validation/multiplayer-schemas";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  let user;
  try {
    user = await requireAuthenticatedUser();
  } catch {
    return NextResponse.json({ error: SESSION_EXPIRED_MESSAGE }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = lobbySettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ongeldige instellingen." },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  const result = await updateLobbySettings(id, user, parsed.data);
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
