import { NextResponse } from "next/server";
import { requireAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { getUserStatistics } from "@/modules/statistics/application/get-user-statistics";

export async function GET() {
  let user;
  try {
    user = await requireAuthenticatedUser();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await getUserStatistics(user.id);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 503 });
  }

  return NextResponse.json({
    statistics: {
      ...result.data,
      byMode: result.data.byMode.map((mode) => ({
        ...mode,
        lastPlayedAt: mode.lastPlayedAt?.toISOString() ?? null,
      })),
    },
  });
}
