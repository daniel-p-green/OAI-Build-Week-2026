import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect, type Page } from "@playwright/test";

const output = resolve(process.cwd(), "../..", "artifacts/ui-review");

async function capture(page: Page, name: string) {
  await page.screenshot({ path: resolve(output, `${name}.png`), animations: "disabled" });
}

async function main() {
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    for (const viewport of [{ name: "desktop", width: 1440, height: 900 }, { name: "compact", width: 390, height: 844 }]) {
      const page = await browser.newPage({ viewport, colorScheme: "light", reducedMotion: "reduce" });
      await page.goto("http://127.0.0.1:3000/");
      await expect(page.getByRole("region", { name: "Map" })).toBeVisible();
      if (viewport.width > 900) await expect(page.locator(".excalidraw-map canvas").first()).toBeVisible();
      await page.waitForTimeout(600);
      await capture(page, `${viewport.name}-map`);

      await page.getByRole("button", { name: "View outputs" }).click();
      await expect(page.getByRole("heading", { name: "Slides" })).toBeVisible();
      await page.waitForTimeout(1800);
      await capture(page, `${viewport.name}-outputs`);

      await page.getByRole("button", { name: "View storyboard" }).click();
      await expect(page.getByRole("textbox", { name: "Panel title" })).toBeVisible();
      await page.waitForTimeout(600);
      await capture(page, `${viewport.name}-storyboard`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
  process.stdout.write(`${output}\n`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
