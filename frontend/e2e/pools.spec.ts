import { test, expect } from "@playwright/test";

test.describe("Pools Listing", () => {
  test("renders pool cards", async ({ page }) => {
    await page.goto("/dapp/pools");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    const cards = page.locator(".grid.grid-cols-1.gap-6 > .group");
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test("filter tabs work", async ({ page }) => {
    await page.goto("/dapp/pools");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await page.locator("label:has-text('ACTIVE')").click();
    await page.waitForTimeout(1000);
    await page.locator("label:has-text('ALL')").click();
    await page.waitForTimeout(1000);
  });

  test("pool card has view details link", async ({ page }) => {
    await page.goto("/dapp/pools");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);
    await expect(page.locator("text=View Details").first()).toBeVisible({ timeout: 10_000 });
  });

  test("shows connect prompt when not connected", async ({ page }) => {
    await page.goto("/dapp/pools");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Connect").first()).toBeVisible({ timeout: 10_000 });
  });

  test("faucet link works", async ({ page }) => {
    await page.goto("/dapp/pools");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    const faucetLink = page.locator("a[href='/dapp/faucet']").first();
    if (await faucetLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await faucetLink.click();
      await expect(page).toHaveURL("/dapp/faucet", { timeout: 10_000 });
    }
  });
});
