import { test, expect } from "@playwright/test";

test.describe("Pool Detail", () => {
  test("renders pool stats for pool 0", async ({ page }) => {
    await page.goto("/dapp/pools/0");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Pool Stats").first()).toBeVisible();
    await expect(page.locator("text=DEPOSIT").first()).toBeVisible();
    await expect(page.locator("text=MEMBERS").first()).toBeVisible();
  });

  test("back to pools link works", async ({ page }) => {
    await page.goto("/dapp/pools/0");
    await page.click("text=Back to Pools");
    await expect(page).toHaveURL(/\/dapp\/pools/);
  });

  test("shows participants list", async ({ page }) => {
    await page.goto("/dapp/pools/0");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Participants").first()).toBeVisible();
  });

  test("shows yield section", async ({ page }) => {
    await page.goto("/dapp/pools/0");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Blend Staked").first()).toBeVisible();
    await expect(page.locator("text=Pool Gacha").first()).toBeVisible();
  });

  test("shows your status section", async ({ page }) => {
    await page.goto("/dapp/pools/0");
    await page.waitForTimeout(2000);
    await expect(page.locator("text=Your Status").first()).toBeVisible();
  });
});
