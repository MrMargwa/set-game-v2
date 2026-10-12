import { NextResponse } from "next/server";
import { SESSION_EXPIRED_MESSAGE } from "@/shared/errors/player-messages";
import { requireAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { joinLobbyByInvite } from "@/modules/lobbies/application/lobby-service";
import { joinLobbySchema } from "@/shared/validation/multiplayer-schemas";

export async function POST(request: Request) {
  let user;
  try {
    user = await requireAuthenticatedUser();
  } catch {
    return NextResponse.json({ error: SESSION_EXPIRED_MESSAGE }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = joinLobbySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" },
      { status: 400 },
    );
  }

  const result = await joinLobbyByInvite(user, parsed.data.inviteCode);
  if (!result.ok) {
    const status =
      result.error.code === "NOT_FOUND"
        ? 404
        : result.error.code === "UNAVAILABLE"
          ? 503
          : 400;
    return NextResponse.json({ error: result.error.message }, { status });
  }

  return NextResponse.json({ lobby: result.lobby });
}
