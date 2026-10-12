import { getSessionMaxAgeMs } from "@/infrastructure/auth/session-cookie";
import {
  createSessionToken,
  hashSessionToken,
} from "@/infrastructure/auth/session-token";
import type { LoginInput, RegisterInput } from "@/shared/validation/auth-schemas";
import { toPublicUser, type PublicUser } from "../domain/user";
import { hashPassword, verifyPassword } from "../infrastructure/password-hasher";
import { SessionRepository } from "../infrastructure/session-repository";
import { UserRepository } from "../infrastructure/user-repository";

export type AuthError = {
  code: "VALIDATION" | "CONFLICT" | "INVALID_CREDENTIALS" | "UNAVAILABLE";
  message: string;
};

export type AuthSuccess<T> = { ok: true; data: T };
export type AuthResult<T> = AuthSuccess<T> | { ok: false; error: AuthError };

export type LoginResult = {
  user: PublicUser;
  sessionToken: string;
};

const userRepository = new UserRepository();
const sessionRepository = new SessionRepository();

export async function registerUser(
  input: RegisterInput,
): Promise<AuthResult<LoginResult>> {
  try {
    const existing = await userRepository.findByUsername(input.username);
    if (existing) {
      return {
        ok: false,
        error: {
          code: "CONFLICT",
          message: "Die gebruikersnaam is al in gebruik.",
        },
      };
    }

    const passwordHash = await hashPassword(input.password);
    const user = await userRepository.create({
      id: crypto.randomUUID(),
      username: input.username,
      email: input.email && input.email.length > 0 ? input.email : null,
      passwordHash,
    });

    const session = await createSessionForUser(user.id);
    return {
      ok: true,
      data: { user: toPublicUser(user), sessionToken: session.token },
    };
  } catch (error) {
    console.error("[registerUser]", error);
    if (isDuplicateEntry(error)) {
      const detail = errorDetail(error);
      if (detail.includes("uk_users_username")) {
        return {
          ok: false,
          error: {
            code: "CONFLICT",
            message: "Die gebruikersnaam is al in gebruik.",
          },
        };
      }
      return {
        ok: false,
        error: {
          code: "CONFLICT",
          message:
            "Registratie is niet gelukt. Controleer je gegevens of kies een andere gebruikersnaam.",
        },
      };
    }
    return {
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "Registratie is tijdelijk niet mogelijk. Probeer het later opnieuw.",
      },
    };
  }
}

export async function loginUser(
  input: LoginInput,
): Promise<AuthResult<LoginResult>> {
  try {
    const record = await userRepository.findByUsername(input.username);
    if (!record) {
      return invalidCredentials();
    }

    const valid = await verifyPassword(input.password, record.passwordHash);
    if (!valid) {
      return invalidCredentials();
    }

    const session = await createSessionForUser(record.id);
    return {
      ok: true,
      data: {
        user: toPublicUser(record),
        sessionToken: session.token,
      },
    };
  } catch (error) {
    console.error("[loginUser]", error);
    return {
      ok: false,
      error: {
        code: "UNAVAILABLE",
        message: "Inloggen is tijdelijk niet mogelijk. Probeer het later opnieuw.",
      },
    };
  }
}

function isDuplicateEntry(error: unknown): boolean {
  const err = error as { code?: string; errno?: number };
  return err.code === "ER_DUP_ENTRY" || err.errno === 1062;
}

function errorDetail(error: unknown): string {
  const message = (error as { message?: string }).message;
  return typeof message === "string" ? message : "";
}

export async function logoutByToken(rawToken: string | undefined): Promise<void> {
  if (!rawToken) {
    return;
  }
  const tokenHash = hashSessionToken(rawToken);
  await sessionRepository.deleteByTokenHash(tokenHash);
}

async function createSessionForUser(userId: string): Promise<{ token: string }> {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + getSessionMaxAgeMs());

  await sessionRepository.create({
    id: crypto.randomUUID(),
    userId,
    tokenHash,
    expiresAt,
  });

  return { token };
}

function invalidCredentials(): AuthResult<LoginResult> {
  return {
    ok: false,
    error: {
      code: "INVALID_CREDENTIALS",
      message: "Ongeldige gebruikersnaam of wachtwoord.",
    },
  };
}
