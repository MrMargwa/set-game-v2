import { getServerEnv } from "@/infrastructure/configuration/env";
import { SESSION_COOKIE_NAME } from "./session-token";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionCookieConfig = {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax" | "strict" | "none";
  path: string;
  maxAge: number;
};

export function sessionCookieOptions(token: string): SessionCookieConfig {
  const env = getServerEnv();
  return {
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function clearSessionCookieOptions(): SessionCookieConfig {
  const env = getServerEnv();
  return {
    name: SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  };
}

export function getSessionMaxAgeMs(): number {
  return SESSION_MAX_AGE_SECONDS * 1000;
}
