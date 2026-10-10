import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/modules/accounts/infrastructure/password-hasher";
import { UserRepository } from "@/modules/accounts/infrastructure/user-repository";

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDatabase)("auth integration", () => {
  it("creates a user in mysql", async () => {
    const repo = new UserRepository();
    const username = `test_${Date.now()}`;
    const passwordHash = await hashPassword("integration-test-password");
    const user = await repo.create({
      id: crypto.randomUUID(),
      username,
      email: null,
      passwordHash,
    });

    const found = await repo.findByUsername(username);
    expect(found?.id).toBe(user.id);
    expect(
      await verifyPassword("integration-test-password", found!.passwordHash),
    ).toBe(true);
  });
});
