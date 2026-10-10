import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { clearSessionCookieOptions } from "@/infrastructure/auth/session-cookie";
import { SESSION_COOKIE_NAME } from "@/infrastructure/auth/session-token";
import { logoutByToken } from "@/modules/accounts/application/auth-service";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    await logoutByToken(rawToken);

    const response = NextResponse.json({ ok: true });
    response.cookies.set(clearSessionCookieOptions());
    return response;
  } catch (error) {
    console.error("[auth/logout]", error);
    return NextResponse.json({ error: "Uitloggen mislukt" }, { status: 500 });
  }
}
