import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password-hasher";

describe("password-hasher", () => {
  it("hashes and verifies passwords", async () => {
    const hash = await hashPassword("correct-horse-battery");
    expect(hash).not.toContain("correct-horse");
    await expect(verifyPassword("correct-horse-battery", hash)).resolves.toBe(
      true,
    );
    await expect(verifyPassword("wrong", hash)).resolves.toBe(false);
  });
});
