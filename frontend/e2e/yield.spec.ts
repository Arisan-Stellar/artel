import { test, expect } from "@playwright/test";

test.describe("Yield Page", () => {
  test("renders hero section", async ({ page }) => {
    await page.goto("/dapp/yield");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Triple Yield Engine").first()).toBeVisible();
    await expect(page.locator("text=Powered by Blend Protocol").first()).toBeVisible();
  });

  test("shows three pillars", async ({ page }) => {
    await page.goto("/dapp/yield");
    await expect(page.locator("text=Merata").first()).toBeVisible();
    await expect(page.locator("text=Monthly Contribution Yield").first()).toBeVisible();
    await expect(page.locator("text=End of Period Gacha").first()).toBeVisible();
  });

  test("shows live on-chain stats box", async ({ page }) => {
    await page.goto("/dapp/yield");
    await expect(page.locator("text=Live On-Chain Data").first()).toBeVisible();
  });

  test("shows Blend info section", async ({ page }) => {
    await page.goto("/dapp/yield");
    await expect(page.locator("text=Blend Protocol").first()).toBeVisible();
  });

  test("shows member yields section", async ({ page }) => {
    await page.goto("/dapp/yield");
    await page.waitForTimeout(3000);
    await expect(page.locator("text=Member Yields").first()).toBeVisible();
  });

  test("search input exists", async ({ page }) => {
    await page.goto("/dapp/yield");
    const input = page.locator("input[placeholder*='Search']");
    await expect(input).toBeVisible();
  });
});
