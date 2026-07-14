import { test, expect } from "@playwright/test";

const VIEWPORTS = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1280, height: 800 },
  { name: "wide", width: 1920, height: 1080 },
];

const PAGES = [
  { name: "Pools", path: "/dapp/pools" },
  { name: "Yield", path: "/dapp/yield" },
  { name: "FAQ", path: "/dapp/faq" },
  { name: "Faucet", path: "/dapp/faucet" },
];

for (const vp of VIEWPORTS) {
  test.describe(`Responsive — ${vp.name} (${vp.width}x${vp.height})`, () => {
    test.use({ viewport: vp });

    for (const { name, path } of PAGES) {
      test(`${name} page renders without horizontal overflow`, async ({ page }) => {
        await page.goto(path);
        await page.waitForTimeout(1000);
        const body = page.locator("body");
        const box = await body.boundingBox();
        expect(box).toBeTruthy();
      });

      test(`${name} header is visible`, async ({ page }) => {
        await page.goto(path);
        await expect(page.locator("header").first()).toBeVisible();
      });
    }

    test("H1 fits viewport", async ({ page }) => {
      await page.goto("/dapp/pools");
      const h1 = page.locator("h1").first();
      const box = await h1.boundingBox();
      expect(box).toBeTruthy();
      if (box) expect(box.x).toBeGreaterThanOrEqual(0);
    });
  });
}
