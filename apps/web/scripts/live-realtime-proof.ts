import { mkdir, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const repository = resolve(process.cwd(), "../..");
const interruptionProof = process.argv.includes("--interruption");
const writeProof = process.argv.includes("--write");
const captureExisting = process.argv.includes("--capture-existing");
if (interruptionProof && writeProof) throw new Error("Choose either --interruption or --write.");
const input = resolve(repository, `.workshoplm/realtime-proof-input/${writeProof ? "write" : interruptionProof ? "interruption" : "question"}.wav`);
const output = resolve(repository, "artifacts/live-review");
const artifactName = writeProof ? "realtime-confirmed-write" : interruptionProof ? "realtime-interruption" : "realtime-grounded-conversation";

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
    let preparedMapVersion = "";
    if (writeProof && !captureExisting) {
      const before = await (await page.request.get("http://127.0.0.1:3000/api/workshop")).json() as Record<string, any>;
      const node = (before.mapNodes ?? []).find((item: Record<string, unknown>) => item.id === "promise") ?? before.mapNodes?.[0];
      if (!node?.id || !node?.title) throw new Error("Write proof requires an editable Map node.");
      const response = await page.request.post("http://127.0.0.1:3000/api/workshop", { data: { action: "mapOperation", operation: { type: "update_node", nodeId: `node-${node.id}`, patch: { label: `${node.title} ready` } } } });
      if (!response.ok()) throw new Error(`Could not prepare an unapproved Map (${response.status()}).`);
      const prepared = await response.json() as Record<string, any>;
      if (prepared.briefApproved || !prepared.frame?.stale) throw new Error("Write proof did not invalidate the prior Brief.");
      const revision = Number((JSON.parse(prepared.graphState ?? "{}") as { graph?: { revision?: number } }).graph?.revision ?? 0);
      preparedMapVersion = `map-r${revision}`;
    }
    await page.goto("http://127.0.0.1:3000/");
    const baseline = await (await page.request.get("http://127.0.0.1:3000/api/workshop")).json() as Record<string, any>;
    const baselineToolCallIds = new Set<string>((baseline.toolCalls ?? []).map((call: Record<string, unknown>) => String(call.id ?? "")));
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
    await expect(transcript).toContainText(writeProof ? /approve.+map|approved brief/i : interruptionProof ? /one sentence/i : /selected sources|final WorkshopLM demo/i, { timeout: 60_000 });
    if (!writeProof) await capture.getByRole("button", { name: "End conversation" }).click();
    const assistant = capture.locator("blockquote").nth(1);
    let confirmedWrite: Record<string, unknown> | undefined;
    if (writeProof) {
      const confirm = page.getByRole("button", { name: "Approve Brief", exact: true });
      await expect(confirm).toHaveCount(1, { timeout: 75_000 });
      await expect(confirm).toBeVisible({ timeout: 75_000 });
      await capture.getByRole("button", { name: "End conversation" }).click();
      let blockedState: Record<string, any> = {};
      await expect.poll(async () => {
        blockedState = await (await page.request.get("http://127.0.0.1:3000/api/workshop")).json() as Record<string, any>;
        return [...(blockedState.toolCalls ?? [])].reverse().find((call: Record<string, any>) => call.channel === "realtime" && call.name === "workshop_approve_brief" && call.result?.isError && !call.explicitUserIntent)?.provider?.callId;
      }, { timeout: 30_000 }).toBeTruthy();
      const blockedCall = [...(blockedState.toolCalls ?? [])].reverse().find((call: Record<string, any>) => call.channel === "realtime" && call.name === "workshop_approve_brief" && call.result?.isError && !call.explicitUserIntent);
      await confirm.click();
      let approvedState: Record<string, any> = {};
      await expect.poll(async () => {
        approvedState = await (await page.request.get("http://127.0.0.1:3000/api/workshop")).json() as Record<string, any>;
        return approvedState.briefApproved && !approvedState.frame?.stale && (approvedState.toolCalls ?? []).some((call: Record<string, any>) => call.channel === "realtime" && call.name === "workshop_approve_brief" && call.explicitUserIntent && !call.result?.isError && call.provider?.callId === blockedCall?.provider?.callId);
      }, { timeout: 30_000 }).toBe(true);
      const approvedCall = [...(approvedState.toolCalls ?? [])].reverse().find((call: Record<string, any>) => call.channel === "realtime" && call.name === "workshop_approve_brief" && call.explicitUserIntent && !call.result?.isError && call.provider?.callId === blockedCall?.provider?.callId);
      await expect(assistant).toContainText(/approved|brief/i, { timeout: 75_000 });
      confirmedWrite = { preparedMapVersion, briefApprovedBefore: false, briefApprovedAfterConfirmation: approvedState.briefApproved, blockedCall, approvedCall };
    } else {
      await expect(assistant).toBeVisible({ timeout: 75_000 });
    }

    let liveState: Record<string, any> = {};
    await expect.poll(async () => {
      liveState = await (await page.request.get("http://127.0.0.1:3000/api/workshop")).json() as Record<string, any>;
      return (liveState.toolCalls ?? []).filter((call: Record<string, unknown>) => !baselineToolCallIds.has(String(call.id ?? "")) && call.channel === "realtime" && call.result && !(call.result as Record<string, unknown>).isError).length;
    }, { timeout: 30_000 }).toBeGreaterThan(0);
    if (!writeProof) await expect(assistant).toContainText(/three minutes|visible source|source locator|Capture.+Deliver/i, { timeout: 75_000 });

    await expect(capture.getByRole("button", { name: "Save conversation" })).toBeEnabled({ timeout: 15_000 });
    const transcriptText = (await transcript.textContent())?.trim() ?? "";
    const assistantText = (await assistant.textContent())?.replace(/^WorkshopLM\s*/, "").trim() ?? "";
    await capture.getByRole("button", { name: "Save conversation" }).click();
    await expect(capture).toHaveCount(0, { timeout: 20_000 });

    const savedState = await (await page.request.get("http://127.0.0.1:3000/api/workshop")).json() as Record<string, any>;
    const realtimeCalls = (savedState.toolCalls ?? []).filter((call: Record<string, unknown>) => !baselineToolCallIds.has(String(call.id ?? "")) && call.channel === "realtime");
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
      ...(confirmedWrite ? { confirmedWrite } : {}),
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
