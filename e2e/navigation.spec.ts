import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("home page loads with the navbar and logo", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page.getByAltText("SetuLearn", { exact: true })).toBeVisible();
    await expect(page.getByRole("img", { name: "SetuLearn", exact: true })).toBeVisible();
  });

  test("navbar links move between the main pages", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });

    await page.getByRole("button", { name: "Tests", exact: true }).click();
    await expect(page).toHaveURL(/\/tests$/);

    await page.getByRole("button", { name: "History", exact: true }).click();
    await expect(page).toHaveURL(/\/test-history$/);

    await page.getByRole("button", { name: "About", exact: true }).click();
    await expect(page).toHaveURL(/\/about$/);

    await page.getByRole("button", { name: "Home", exact: true }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("an unknown route renders the Not Found page", async ({ page }) => {
    await page.goto("/this-route-does-not-exist");
    await expect(page.getByText(/not found/i)).toBeVisible();
  });
});
