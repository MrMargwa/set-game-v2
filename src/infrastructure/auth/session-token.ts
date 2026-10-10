import { createHash, randomBytes } from "node:crypto";
import { getSessionSecret } from "@/infrastructure/configuration/env";

export const SESSION_COOKIE_NAME = "setgame_session";

export function createSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256")
    .update(`${getSessionSecret()}:${token}`)
    .digest("hex");
}
