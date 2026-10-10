import { test, expect } from "@playwright/test";

test.describe("Time Attack", () => {
  test("shows countdown timer", async ({ page }) => {
    await page.goto("/play?mode=time_attack&seed=e2e-happy");

    await expect(page.getByTestId("timer")).toBeVisible();
    const timerText = await page.getByTestId("timer").textContent();
    expect(timerText).toMatch(/\d+s/);
  });
});
