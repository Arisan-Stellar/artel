import { test, expect } from "@playwright/test";

const PAGES = [
  "/dapp/pools",
  "/dapp/simulator",
  "/dapp/leaderboard",
  "/dapp/yield",
  "/dapp/faq",
  "/dapp/faucet",
];

test.describe("i18n — English ↔ Indonesia", () => {
  test("default language is English", async ({ page }) => {
    await page.goto("/dapp/pools");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("header").filter({ hasText: "POOLS" })).toBeVisible({ timeout: 5000 });
  });

  test("switches to Bahasa Indonesia and back", async ({ page }) => {
    await page.goto("/dapp/pools");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const toggle = page.locator('button[aria-label="Toggle language"]');
    const visible = await toggle.isVisible({ timeout: 3000 }).catch(() => false);
    if (!visible) {
      // On mobile viewport, toggle is in hamburger menu
      test.skip();
      return;
    }

    await toggle.click();
    await page.waitForTimeout(500);
    await expect(page.locator("header").filter({ hasText: "KOLAM" })).toBeVisible({ timeout: 5000 });

    await toggle.click();
    await page.waitForTimeout(500);
    await expect(page.locator("header").filter({ hasText: "POOLS" })).toBeVisible({ timeout: 5000 });
  });

  for (const path of PAGES) {
    test(`page renders at ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(1000);
      await expect(page.locator("h1").first()).toBeVisible({ timeout: 5000 });
    });
  }

  test("mobile hamburger shows language switch", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/dapp/pools");
    await page.waitForLoadState("networkidle");
    await page.locator('button[aria-label="Toggle menu"]').click();
    await page.waitForTimeout(300);
    await expect(page.getByText("BAHASA INDONESIA")).toBeVisible({ timeout: 5000 });
  });
});
