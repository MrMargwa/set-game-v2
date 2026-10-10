import { cookies } from "next/headers";
import { hashSessionToken, SESSION_COOKIE_NAME } from "@/infrastructure/auth/session-token";
import { toPublicUser, type PublicUser } from "../domain/user";
import { SessionRepository } from "../infrastructure/session-repository";
import { UserRepository } from "../infrastructure/user-repository";

const sessionRepository = new SessionRepository();
const userRepository = new UserRepository();

export async function getAuthenticatedUser(): Promise<PublicUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!rawToken) {
    return null;
  }

  try {
    const tokenHash = hashSessionToken(rawToken);
    const session = await sessionRepository.findByTokenHash(tokenHash);
    if (!session) {
      return null;
    }

    if (session.expiresAt.getTime() < Date.now()) {
      await sessionRepository.deleteByTokenHash(tokenHash);
      return null;
    }

    const user = await userRepository.findById(session.userId);
    return user ? toPublicUser(user) : null;
  } catch {
    return null;
  }
}

export async function requireAuthenticatedUser(): Promise<PublicUser> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}
