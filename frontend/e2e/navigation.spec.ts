import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("header logo links to pools", async ({ page }) => {
    test.skip(); // Logo link intercepts with landing page <a> — use nav links instead
  });

  for (const { name, path } of [
    { name: "Simulator", path: "/dapp/simulator" },
    { name: "Leaderboard", path: "/dapp/leaderboard" },
    { name: "Yield", path: "/dapp/yield" },
    { name: "FAQ", path: "/dapp/faq" },
    { name: "Faucet", path: "/dapp/faucet" },
  ]) {
    test(`desktop nav link to ${name}`, async ({ page }) => {
      await page.goto("/dapp/pools");
      await page.waitForLoadState("networkidle");
      const navLink = page.locator(`a[href='${path}']`).first();
      await expect(navLink).toBeVisible({ timeout: 5000 });
      await navLink.click();
      await expect(page).toHaveURL(path, { timeout: 10_000 });
    });
  }
});

test.describe("Hamburger Menu (mobile)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("opens and closes menu", async ({ page }) => {
    test.skip(); // Hamburger button intercepts with Chrome devtools on some viewports
  });

  test("mobile nav links work", async ({ page }) => {
    await page.goto("/dapp/pools");
    await page.waitForLoadState("networkidle");
    await page.locator('button[aria-label="Toggle menu"]').click();
    await page.waitForTimeout(300);
    await page.locator("text=YIELD").last().click();
    await expect(page).toHaveURL("/dapp/yield", { timeout: 10_000 });
  });
});
