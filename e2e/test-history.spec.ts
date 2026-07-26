import { test, expect } from "@playwright/test";

// Test History's list page is entirely localStorage-backed (see
// src/utils/testHistory.js), so it's a good e2e target even without the
// backend running — we seed localStorage directly the same way TestResult
// does after a real attempt, then verify the UI reads it back correctly.
const seedHistoryEntry = async (page: import("@playwright/test").Page) => {
  await page.goto("/test-history");
  await page.evaluate(() => {
    const entry = {
      id: "e2e-entry-1",
      timestamp: Date.now(),
      testId: "test-1",
      testTitle: "E2E Mock Test",
      examName: "JEE Main",
      score: 84,
      totalMarks: 100,
      percentage: 84,
      correct: 21,
      incorrect: 4,
      unattempted: 0,
      totalQuestions: 25,
      timeSpentSeconds: 1800,
      submissions: [{ testId: "test-1", submissionId: "sub-1" }],
    };
    window.localStorage.setItem("setulearn_test_history", JSON.stringify([entry]));
  });
  await page.reload();
};

test.describe("Test History", () => {
  test.beforeEach(async ({ page }) => {
  await page.goto("/test-history", { waitUntil: "domcontentloaded" });
  await page.evaluate(() => window.localStorage.removeItem("setulearn_test_history"));
});

  test("shows an empty state with no saved attempts", async ({ page }) => {
    await page.reload();
    await expect(page.getByText(/no test history yet/i)).toBeVisible();
  });

  test("Home links to Test History, and it lists a seeded attempt", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /view all test history/i }).click();
    await expect(page).toHaveURL(/\/test-history$/);
  });

  test("lists a saved attempt and opens its detail page", async ({ page }) => {
    await seedHistoryEntry(page);

    await expect(page.getByText("E2E Mock Test")).toBeVisible();
    await expect(page.getByText("84 / 100")).toBeVisible();

    await page.getByText("E2E Mock Test").click();
    await expect(page).toHaveURL(/\/test-history\/e2e-entry-1$/);
    await expect(page.getByRole("button", { name: /back to history/i })).toBeVisible();
  });

  test("Clear History empties the list after confirmation", async ({ page }) => {
    await seedHistoryEntry(page);
    page.on("dialog", (dialog) => dialog.accept());

    await page.getByRole("button", { name: /clear history/i }).click();

    await expect(page.getByText(/no test history yet/i)).toBeVisible();
  });
});
