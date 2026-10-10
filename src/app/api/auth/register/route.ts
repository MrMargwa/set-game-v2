import { NextResponse } from "next/server";
import { sessionCookieOptions } from "@/infrastructure/auth/session-cookie";
import { registerUser } from "@/modules/accounts/application/auth-service";
import { registerSchema } from "@/shared/validation/auth-schemas";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json().catch(() => null);
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Ongeldige invoer" },
        { status: 400 },
      );
    }

    const email =
      parsed.data.email && parsed.data.email.length > 0
        ? parsed.data.email
        : undefined;

    const result = await registerUser({
      ...parsed.data,
      email,
    });

    if (!result.ok) {
      const status =
        result.error.code === "CONFLICT"
          ? 409
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
    console.error("[auth/register]", error);
    return NextResponse.json(
      { error: "Registratie mislukt. Controleer database en serverlogs." },
      { status: 500 },
    );
  }
}
