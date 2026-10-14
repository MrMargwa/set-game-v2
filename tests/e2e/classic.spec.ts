import { test, expect } from "@playwright/test";

/** Deterministic board: first SET from seed `e2e-happy` (see core tests). */
const E2E_SET: [string, string, string] = [
  "3-oval-solid-green",
  "1-oval-striped-green",
  "2-oval-open-green",
];

test.describe("Classic SET play", () => {
  test("loads board and finds a SET with fixed seed", async ({ page }) => {
    await page.goto("/play?seed=e2e-happy");

    await expect(page.getByTestId(`card-${E2E_SET[0]}`)).toBeVisible();
    await expect(page.getByTestId("game-board").locator("[data-testid^='card-']")).toHaveCount(
      12,
    );
    await page.getByTestId("begin-round").click();
    await expect(page.getByTestId("score")).toHaveText("0");

    for (const cardId of E2E_SET) {
      await page.getByTestId(`card-${cardId}`).click();
    }

    await expect(page.getByTestId("score")).toHaveText("741");
    await expect(page.getByTestId("game-message")).toContainText("SET gevonden");
  });

  test("shows feedback for invalid selection", async ({ page }) => {
    await page.goto("/play?seed=e2e-happy");
    await page.getByTestId("begin-round").click();

    const invalid: [string, string, string] = [
      "3-oval-solid-green",
      "1-oval-striped-green",
      "1-oval-solid-green",
    ];

    for (const cardId of invalid) {
      await page.getByTestId(`card-${cardId}`).click();
    }

    await expect(page.getByTestId("game-message")).toContainText(
      "Geen geldige SET",
    );
    await expect(page.getByTestId("score")).toHaveText("0");
  });
});
