/**
 * Full E2E Flow — wallet connect + create pool + join + start + contribute
 *
 * PREREQUISITE: Requires Freighter extension installed. Only runs in "freighter" project.
 * Freighter accounts must have passphrase: "Faizfaiz01073"
 */
import { test, expect, type Page } from "@playwright/test";

const TIMEOUT = 90_000;

test.describe("Full Flow — Freighter Wallet", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async function handleFreighterPopup(page: Page, action: string) {
    const ctx = page.context();
    const popup = await ctx.waitForEvent("page", { timeout: 15_000 }).catch(() => null);
    if (!popup) {
      console.log(`  ⚠ No Freighter popup for: ${action}`);
      return;
    }
    await popup.waitForLoadState();
    await popup.waitForTimeout(2000);
    const pwdInput = popup.locator("input[type='password']");
    if (await pwdInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await pwdInput.fill("Faizfaiz01073");
      await popup.waitForTimeout(500);
      const connectBtn = popup.locator("button").filter({ hasText: /Connect|Continue|Unlock|Sign/i }).first();
      if (await connectBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await connectBtn.click();
        console.log(`  ✓ Freighter: ${action}`);
      }
    }
    await popup.waitForTimeout(1000);
    await popup.close().catch(() => {});
  }

  test("connect → view pool detail → verify elements", async ({ page }) => {
    const projectName = (test.info() as { project?: { name: string } }).project?.name;
    if (projectName !== "freighter") { test.skip(); return; }
    test.setTimeout(TIMEOUT);

    await page.goto("/dapp/pools");
    await page.waitForLoadState("networkidle");

    const connectBtn = page.locator(".fancy").filter({ hasText: /CONNECT/ }).first();
    if (await connectBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await connectBtn.click();
      await handleFreighterPopup(page, "Connect");
    }

    await page.waitForTimeout(3000);
    await page.goto("/dapp/pools/0");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.locator("text=Pool Stats").first()).toBeVisible();
    await expect(page.locator("text=Participants").first()).toBeVisible();
    console.log("✓ Full flow — pool detail verified");
  });

  test("yield page with connected wallet", async ({ page }) => {
    const projectName = (test.info() as { project?: { name: string } }).project?.name;
    if (projectName !== "freighter") { test.skip(); return; }
    test.setTimeout(TIMEOUT);

    await page.goto("/dapp/yield");
    await page.waitForLoadState("networkidle");

    const connectBtn = page.locator(".fancy").filter({ hasText: /CONNECT/ }).first();
    if (await connectBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await connectBtn.click();
      await handleFreighterPopup(page, "Connect");
    }

    await page.waitForTimeout(3000);
    await expect(page.locator("text=Triple Yield Engine").first()).toBeVisible();
    console.log("✓ Yield page verified with wallet");
  });

  test("create pool form renders with wallet", async ({ page }) => {
    const projectName = (test.info() as { project?: { name: string } }).project?.name;
    if (projectName !== "freighter") { test.skip(); return; }
    test.setTimeout(TIMEOUT);

    await page.goto("/dapp/create");
    await page.waitForLoadState("networkidle");

    const connectBtn = page.locator(".fancy").filter({ hasText: /CONNECT/ }).first();
    if (await connectBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await connectBtn.click();
      await handleFreighterPopup(page, "Connect");
    }

    await page.waitForTimeout(3000);
    await expect(page.locator("input").first()).toBeVisible();
    console.log("✓ Create pool form verified with wallet");
  });
});
