import { expect, test, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const viewports = [
  { name: "desktop", width: 1200, height: 800 },
  { name: "compact", width: 1024, height: 768 },
  { name: "mobile", width: 390, height: 844 },
] as const;

async function expectScreen(page: Page, name: string) {
  await expect(page).toHaveScreenshot(`${name}.png`, { animations: "disabled", caret: "hide", maxDiffPixelRatio: 0.001 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(await page.evaluate(() => innerWidth));
}

async function closeDialog(page: Page, name: string) {
  await page.getByRole("button", { name: `Close ${name}` }).click();
  await expect(page.getByRole("dialog", { name })).toBeHidden();
}

async function pressTabUntil(page: Page, label: string, limit = 30) {
  for (let index = 0; index < limit; index += 1) {
    await page.keyboard.press("Tab");
    const active = await page.evaluate(() => ({
      label: document.activeElement?.getAttribute("aria-label") ?? "",
      text: document.activeElement?.textContent?.replace(/\s+/g, " ").trim() ?? "",
    }));
    if (active.label === label || active.text === label) return;
  }
  throw new Error(`Keyboard focus did not reach ${label}`);
}

test.describe.configure({ mode: "serial" });

test("reset fixture is calm and responsive", async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Approve brief" }).first()).toBeVisible();
    await expectScreen(page, `${viewport.name}-reset-map`);
    await page.getByRole("button", { name: /sources$/ }).click();
    await expectScreen(page, `${viewport.name}-reset-sources`);
    await closeDialog(page, "Sources");
  }

  await pressTabUntil(page, "Approve brief");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("heading", { name: "Turn raw thinking into finished, traceable work." })).toBeVisible();
  await pressTabUntil(page, "Use this style");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Update style" })).toBeVisible();

  const root = resolve(process.cwd(), "../..", ".workshoplm-visual-test");
  execFileSync("pnpm", ["exec", "tsx", "tests/visual/seed-completed.ts", root], { cwd: process.cwd(), stdio: "pipe" });
});

test.describe("completed Workshop judge path", () => {
  for (const viewport of viewports) {
    test(`${viewport.name} visual path`, async ({ page, context }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto("/");
      await expect(page.getByRole("region", { name: "Map" })).toBeVisible();
      await expectScreen(page, `${viewport.name}-map`);

      const sourceTrigger = page.getByRole("button", { name: /sources$/ });
      await sourceTrigger.click();
      await expectScreen(page, `${viewport.name}-sources`);
      await closeDialog(page, "Sources");
      await expect(sourceTrigger).toBeFocused();

      await page.getByRole("button", { name: /The product promise/ }).click();
      await page.getByRole("button", { name: "Show source" }).click();
      await expectScreen(page, `${viewport.name}-evidence`);
      await closeDialog(page, "Source");
      await page.getByRole("button", { name: "Close claim" }).click();

      await page.getByRole("button", { name: "View brief" }).click();
      await expectScreen(page, `${viewport.name}-brief`);

      await page.getByRole("button", { name: "View outputs" }).click();
      await expectScreen(page, `${viewport.name}-outputs`);

      const popupPromise = context.waitForEvent("page");
      await page.getByRole("link", { name: "Open" }).first().click();
      const popup = await popupPromise;
      await popup.setViewportSize({ width: viewport.width, height: viewport.height });
      await popup.waitForLoadState("networkidle");
      await expectScreen(popup, `${viewport.name}-output-viewer`);
      await popup.close();

      await page.getByRole("button", { name: "View storyboard" }).click();
      await expectScreen(page, `${viewport.name}-storyboard`);
      if (viewport.name === "mobile") {
        await pressTabUntil(page, "Approve storyboard");
        await page.keyboard.press("Enter");
        await expect(page.getByRole("button", { name: "Storyboard approved" })).toBeVisible();
      }
    });
  }
});

test("core primitive computed styles and states match the official reference", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 800 });
  await page.goto("/");
  const button = page.getByRole("button", { name: "View brief" });
  const token = page.getByRole("button", { name: /sources$/ });

  await expect(button).toHaveCSS("height", "36px");
  await expect(button).toHaveCSS("padding", "8px 16px");
  await expect(button).toHaveCSS("border-radius", "999px");
  await expect(button).toHaveCSS("font-size", "14px");
  await expect(button).toHaveCSS("line-height", "20px");
  await expect(token).toHaveCSS("height", "42px");
  await expect(token).toHaveCSS("padding", "12px 16px");
  await expect(token).toHaveCSS("border-radius", "25px");

  await button.focus();
  await expect(button).toHaveCSS("outline-width", "2px");
  await expect(button).toHaveCSS("outline-color", "rgb(2, 133, 255)");

  await token.click();
  const checkbox = page.getByRole("checkbox").first();
  await expect(checkbox).toHaveCSS("appearance", "none");
  await expect(checkbox).toHaveCSS("width", "18px");
  await expect(checkbox).toHaveCSS("height", "18px");
  await expect(checkbox).toHaveCSS("border-radius", "5px");
  await expect(checkbox).toHaveCSS("background-color", "rgb(13, 13, 13)");
});

test("visible copy stays plain and stable", async ({ page }) => {
  await page.goto("/");
  const labels = new Set<string>();
  for (const next of ["Map", "Brief", "Outputs", "Storyboard"]) {
    if (next === "Brief") await page.getByRole("button", { name: "View brief" }).click();
    if (next === "Outputs") await page.getByRole("button", { name: "View outputs" }).click();
    if (next === "Storyboard") await page.getByRole("button", { name: "View storyboard" }).click();
    for (const value of await page.getByRole("button").allTextContents()) if (value.trim()) labels.add(value.replace(/\s+/g, " ").trim());
    for (const value of await page.getByRole("heading").allTextContents()) if (value.trim()) labels.add(value.replace(/\s+/g, " ").trim());
  }
  expect([...labels].sort().join("\n")).toMatchSnapshot("visible-labels.txt");
});

test("reduced motion, contrast, and 200 percent logical zoom remain usable", async ({ page }) => {
  await page.setViewportSize({ width: 600, height: 400 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(600);
  await expect(page.getByText("Map", { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /sources$/ })).toBeVisible();
  await expect(page.locator(".oai-button").first()).toHaveCSS("transition-duration", "0s");

  const luminance = (hex: string) => {
    const channels = hex.match(/[a-f\d]{2}/gi)?.map((value) => Number.parseInt(value, 16) / 255) ?? [];
    const corrected = channels.map((value) => value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
    return corrected[0] * 0.2126 + corrected[1] * 0.7152 + corrected[2] * 0.0722;
  };
  const contrast = (foreground: string, background: string) => {
    const values = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (values[0] + 0.05) / (values[1] + 0.05);
  };
  expect(contrast("0D0D0D", "FFFFFF")).toBeGreaterThanOrEqual(4.5);
  expect(contrast("5D5D5D", "FFFFFF")).toBeGreaterThanOrEqual(4.5);
  expect(contrast("008635", "FFFFFF")).toBeGreaterThanOrEqual(4.5);
});
