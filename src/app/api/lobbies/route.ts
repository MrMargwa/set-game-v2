import { NextResponse } from "next/server";
import { SESSION_EXPIRED_MESSAGE } from "@/shared/errors/player-messages";
import { requireAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { createLobby } from "@/modules/lobbies/application/lobby-service";

export async function POST() {
  let user;
  try {
    user = await requireAuthenticatedUser();
  } catch {
    return NextResponse.json({ error: SESSION_EXPIRED_MESSAGE }, { status: 401 });
  }

  const result = await createLobby(user);
  if (!result.ok) {
    const status = result.error.code === "UNAVAILABLE" ? 503 : 400;
    return NextResponse.json({ error: result.error.message }, { status });
  }

  return NextResponse.json({ lobby: result.lobby });
}
