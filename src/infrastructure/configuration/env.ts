import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).optional(),
  SESSION_SECRET: z.string().min(32).optional(),
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
});

export type ServerEnv = z.infer<typeof envSchema>;

export function getServerEnv(): ServerEnv {
  return envSchema.parse({
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_SECRET: process.env.SESSION_SECRET,
    NODE_ENV: process.env.NODE_ENV,
  });
}

const DEV_SESSION_FALLBACK =
  "dev-only-session-secret-min-32-chars!!";

export function getSessionSecret(): string {
  const env = getServerEnv();
  if (env.SESSION_SECRET) {
    return env.SESSION_SECRET;
  }
  if (env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is required in production");
  }
  return DEV_SESSION_FALLBACK;
}

export function requireDatabaseUrl(): string {
  const url = getServerEnv().DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not configured");
  }
  return url;
}
