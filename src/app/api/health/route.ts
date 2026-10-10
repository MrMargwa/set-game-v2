import { NextResponse } from "next/server";
import { getServerEnv } from "@/infrastructure/configuration/env";
import { pingDatabase } from "@/infrastructure/database/client";

export async function GET() {
  const env = getServerEnv();
  let database: "skipped" | "up" | "down" = "skipped";

  if (env.DATABASE_URL) {
    database = (await pingDatabase()) ? "up" : "down";
  }

  const ok = database !== "down";

  return NextResponse.json(
    {
      status: ok ? "ok" : "degraded",
      database,
    },
    { status: ok ? 200 : 503 },
  );
}
