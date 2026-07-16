import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { chromium, expect } from "@playwright/test";

const repository = resolve(process.cwd(), "../..");
const output = resolve(repository, "artifacts/live-review");
const prompt = "Using the selected sources, what must the final WorkshopLM demo prove?";

async function main() {
  if (!process.argv.includes("--authorized")) throw new Error("Live Responses proof requires the explicit --authorized flag.");
  await mkdir(output, { recursive: true });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: "light", reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3000/");
    const baseline = await (await page.request.get("http://127.0.0.1:3000/api/workshop")).json() as Record<string, any>;
    const baselineCallIds = new Set<string>((baseline.toolCalls ?? []).map((call: Record<string, unknown>) => String(call.id ?? "")));
    await page.getByRole("button", { name: "Chat Ask your sources" }).click();
    await page.getByRole("textbox", { name: "Message WorkshopLM" }).fill(prompt);
    await page.getByRole("button", { name: "Send", exact: true }).click();

    const assistant = page.locator(".conversation-turn--assistant").last();
    await expect(assistant).toContainText(/three minutes|source|Capture.+Deliver/i, { timeout: 90_000 });
    let state: Record<string, any> = {};
    await expect.poll(async () => {
      state = await (await page.request.get("http://127.0.0.1:3000/api/workshop")).json() as Record<string, any>;
      const calls = (state.toolCalls ?? []).filter((call: Record<string, unknown>) => !baselineCallIds.has(String(call.id ?? "")) && call.channel === "responses");
      const turn = [...(state.conversationTurns ?? [])].reverse().find((candidate: Record<string, unknown>) => candidate.role === "assistant");
      return Boolean(state.conversationContinuation?.responseId && calls.some((call: Record<string, any>) => !call.result?.isError) && turn?.evidence?.length);
    }, { timeout: 30_000 }).toBe(true);

    const calls = (state.toolCalls ?? []).filter((call: Record<string, unknown>) => !baselineCallIds.has(String(call.id ?? "")) && call.channel === "responses");
    const turn = [...(state.conversationTurns ?? [])].reverse().find((candidate: Record<string, unknown>) => candidate.role === "assistant");
    const screenshot = resolve(output, "responses-grounded-conversation.png");
    await page.screenshot({ path: screenshot, animations: "disabled" });
    const artifact = {
      verifiedAt: new Date().toISOString(),
      transport: "responses-sse",
      model: state.conversationContinuation.model,
      prompt,
      assistant: turn.text,
      continuation: state.conversationContinuation,
      successfulToolCalls: calls.filter((call: Record<string, any>) => !call.result?.isError).map((call: Record<string, any>) => ({ name: call.name, provider: call.provider, summary: call.result?.summary })),
      evidence: turn.evidence,
    };
    await writeFile(resolve(output, "responses-grounded-conversation.json"), `${JSON.stringify(artifact, null, 2)}\n`, "utf8");
    process.stdout.write(`${JSON.stringify({ assistant: artifact.assistant, toolCalls: artifact.successfulToolCalls.length, evidence: artifact.evidence.length, responseId: artifact.continuation.responseId, screenshot }, null, 2)}\n`);
  } finally {
    await browser.close();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
