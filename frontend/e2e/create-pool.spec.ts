import { test, expect } from "@playwright/test";

test.describe("Create Pool Page", () => {
  test("shows page when not connected", async ({ page }) => {
    await page.goto("/dapp/create");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);
    await expect(page.locator("h1").first()).toBeVisible({ timeout: 5000 });
  });

  test("navigates from pools (if create link visible)", async ({ page }) => {
    await page.goto("/dapp/pools");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    const createLink = page.locator("a[href='/dapp/create']");
    const exists = await createLink.isVisible({ timeout: 3000 }).catch(() => false);
    if (exists) {
      await createLink.click();
      await expect(page).toHaveURL("/dapp/create", { timeout: 10_000 });
    }
  });
});
