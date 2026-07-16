import { mkdir, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const repository = resolve(process.cwd(), "../..");
const interruptionProof = process.argv.includes("--interruption");
const captureExisting = process.argv.includes("--capture-existing");
const input = resolve(repository, `.workshoplm/realtime-proof-input/${interruptionProof ? "interruption" : "question"}.wav`);
const output = resolve(repository, "artifacts/live-review");
const artifactName = interruptionProof ? "realtime-interruption" : "realtime-grounded-conversation";

async function main() {
  if (!process.argv.includes("--authorized")) throw new Error("Live Realtime proof requires the explicit --authorized flag.");
  await stat(input);
  await mkdir(output, { recursive: true });

  const browser = await chromium.launch({
    channel: "chrome",
    headless: true,
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      `--use-file-for-fake-audio-capture=${input}`,
      "--autoplay-policy=no-user-gesture-required",
    ],
  });

  try {
    const context = await browser.newContext({ permissions: ["microphone"], viewport: { width: 1440, height: 900 }, colorScheme: "light", reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3000/");
    await page.getByRole("button", { name: "Chat Ask your sources" }).click();
    if (captureExisting) {
      await page.screenshot({ path: resolve(output, `${artifactName}.png`), animations: "disabled" });
      process.stdout.write(`${resolve(output, `${artifactName}.png`)}\n`);
      return;
    }
    await page.getByRole("button", { name: "Voice", exact: true }).click();
    const capture = page.getByRole("region", { name: "Record voice" });
    await capture.getByRole("button", { name: "Start talking" }).click();
    await expect(capture.getByText("Listening", { exact: true })).toBeVisible({ timeout: 20_000 });

    const transcript = capture.locator("blockquote").first();
    await expect(transcript).toContainText(interruptionProof ? /one sentence/i : /selected sources|final WorkshopLM demo/i, { timeout: 60_000 });
    await capture.getByRole("button", { name: "End conversation" }).click();
    const assistant = capture.locator("blockquote").nth(1);
    await expect(assistant).toBeVisible({ timeout: 75_000 });

    let liveState: Record<string, any> = {};
    await expect.poll(async () => {
      liveState = await (await page.request.get("http://127.0.0.1:3000/api/workshop")).json() as Record<string, any>;
      return (liveState.toolCalls ?? []).filter((call: Record<string, unknown>) => call.channel === "realtime" && call.result && !(call.result as Record<string, unknown>).isError).length;
    }, { timeout: 30_000 }).toBeGreaterThan(0);
    await expect(assistant).toContainText(/three minutes|visible source|source locator|Capture.+Deliver/i, { timeout: 75_000 });

    await expect(capture.getByRole("button", { name: "Save conversation" })).toBeEnabled({ timeout: 15_000 });
    const transcriptText = (await transcript.textContent())?.trim() ?? "";
    const assistantText = (await assistant.textContent())?.replace(/^WorkshopLM\s*/, "").trim() ?? "";
    await capture.getByRole("button", { name: "Save conversation" }).click();
    await expect(capture).toHaveCount(0, { timeout: 20_000 });

    const savedState = await (await page.request.get("http://127.0.0.1:3000/api/workshop")).json() as Record<string, any>;
    const realtimeCalls = (savedState.toolCalls ?? []).filter((call: Record<string, unknown>) => call.channel === "realtime");
    const savedSegment = [...(savedState.transcriptSegments ?? [])].reverse().find((segment: Record<string, unknown>) => segment.transport === "webrtc");
    if (!savedSegment) throw new Error("Realtime transcript was not persisted with WebRTC evidence.");
    const interruptionCount = ((savedSegment.provider?.interruptions?.responseIds ?? []) as string[]).length;
    if (interruptionProof && interruptionCount < 1) throw new Error("Realtime interruption was not persisted with provider response evidence.");

    await page.screenshot({ path: resolve(output, `${artifactName}.png`), animations: "disabled" });
    await writeFile(resolve(output, `${artifactName}.json`), `${JSON.stringify({
      verifiedAt: new Date().toISOString(),
      transport: "webrtc",
      model: "gpt-realtime-2.1",
      transcriptionModel: "gpt-realtime-whisper",
      transcript: transcriptText,
      assistant: assistantText,
      successfulToolCalls: realtimeCalls.filter((call: Record<string, any>) => !call.result?.isError).map((call: Record<string, any>) => ({ name: call.name, provider: call.provider, summary: call.result?.summary })),
      savedSegment: { id: savedSegment.id, provider: savedSegment.provider },
    }, null, 2)}\n`, "utf8");
    process.stdout.write(`${JSON.stringify({ transcript: transcriptText, assistant: assistantText, successfulToolCalls: realtimeCalls.filter((call: Record<string, any>) => !call.result?.isError).length, interruptions: interruptionCount, screenshot: resolve(output, `${artifactName}.png`) }, null, 2)}\n`);
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
