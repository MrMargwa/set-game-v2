import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/infrastructure/auth/session-cookie";
import { loginUser } from "@/modules/accounts/application/auth-service";
import { loginSchema } from "@/shared/validation/auth-schemas";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" },
        { status: 400 },
      );
    }

    const result = await loginUser(parsed.data);

    if (!result.ok) {
      const status =
        result.error.code === "INVALID_CREDENTIALS"
          ? 401
          : result.error.code === "UNAVAILABLE"
            ? 503
            : 400;
      return NextResponse.json({ error: result.error.message }, { status });
    }

    const response = NextResponse.json({ user: result.data.user });
    const cookie = sessionCookieOptions(result.data.sessionToken);
    response.cookies.set(cookie);

    return response;
  } catch (error) {
    console.error("[auth/login]", error);
    return NextResponse.json(
      { error: "Inloggen mislukt. Controleer database en serverlogs." },
      { status: 500 },
    );
  }
}
