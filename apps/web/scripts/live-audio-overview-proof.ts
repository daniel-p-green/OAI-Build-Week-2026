import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const repository = resolve(process.cwd(), "../..");
const output = resolve(repository, "artifacts/live-review");

async function main() {
  if (!process.argv.includes("--authorized")) throw new Error("Live Audio Overview proof requires the explicit --authorized flag.");
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light", reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3000/");
    await page.getByRole("button", { name: "View created work" }).click();
    await page.getByRole("button", { name: /Open Audio Overview, version/ }).first().click();
    if (!(await page.locator(".audio-player audio").isVisible())) await page.getByRole("button", { name: "Create audio" }).click();
    await expect(page.locator(".audio-player audio")).toBeVisible({ timeout: 90_000 });
    await expect.poll(() => page.locator(".audio-player audio").evaluate((audio) => (audio as HTMLAudioElement).duration), { timeout: 30_000 }).toBeGreaterThan(0);

    const state = await (await page.request.get("http://127.0.0.1:3000/api/workshop")).json() as Record<string, any>;
    const overview = [...(state.audioOverviews ?? [])].reverse().find((item: Record<string, any>) => item.status === "audio_ready" && item.audio && !item.stale);
    if (!overview) throw new Error("Audio Overview did not persist current provider audio.");
    const response = await page.request.get(`http://127.0.0.1:3000/api/workshop/artifacts/${overview.id}`);
    if (!response.ok()) throw new Error(`Audio Overview bytes were not available (${response.status()}).`);
    const bytes = Buffer.from(await response.body());
    const digest = createHash("sha256").update(bytes).digest("hex");
    if (digest !== overview.audio.sha256) throw new Error("Audio Overview download hash did not match persisted provenance.");
    await writeFile(resolve(output, "audio-overview.wav"), bytes);
    await page.screenshot({ path: resolve(output, "audio-overview.png"), animations: "disabled" });
    await writeFile(resolve(output, "audio-overview.json"), `${JSON.stringify({
      verifiedAt: new Date().toISOString(),
      id: overview.id,
      title: overview.title,
      script: overview.script,
      sections: overview.sections,
      claimIds: overview.claimIds,
      disclosure: overview.disclosure,
      audio: overview.audio,
      downloadedSha256: digest,
    }, null, 2)}\n`, "utf8");
    process.stdout.write(`${JSON.stringify({ id: overview.id, durationSeconds: overview.audio.durationSeconds, byteCount: bytes.length, sha256: digest, requestId: overview.audio.requestId, screenshot: resolve(output, "audio-overview.png") }, null, 2)}\n`);
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
