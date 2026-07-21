import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

type Shot = { id: string; title: string; startSeconds: number; endSeconds: number; narration: string };

const repository = resolve(import.meta.dirname, "..");
const planPath = resolve(repository, "submission/demo-film-beat-plan.json");
const outputRoot = resolve(repository, "outputs/demo-film-beat-narration");
const model = "gpt-4o-mini-tts";
const voice = "cedar";
const sha256 = (value: Uint8Array | string) => createHash("sha256").update(value).digest("hex");

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function duration(path: string): number {
  const result = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "json", path], { encoding: "utf8" })) as { format?: { duration?: string } };
  return Number(result.format?.duration ?? 0);
}

function safeError(value: string): string {
  return value.replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]").replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 500);
}

async function main(): Promise<void> {
  assert(process.env.WORKSHOPLM_GENERATE_DEMO_BEAT_NARRATION === "1", "Set WORKSHOPLM_GENERATE_DEMO_BEAT_NARRATION=1 for this bounded ten-request narration operation.");
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  assert(apiKey, "OPENAI_API_KEY is required.");
  const plan = JSON.parse(await readFile(planPath, "utf8")) as { shots: Shot[] };
  assert(plan.shots.length === 10, `Expected ten shots, received ${plan.shots.length}.`);
  const requestedIds = new Set((process.env.WORKSHOPLM_GENERATE_DEMO_BEAT_NARRATION_ONLY ?? "").split(",").map((value) => value.trim()).filter(Boolean));
  const shouldGenerate = (id: string) => requestedIds.size === 0 || requestedIds.has(id);
  for (const id of requestedIds) assert(plan.shots.some((shot) => shot.id === id), `Unknown requested narration id: ${id}`);
  await mkdir(outputRoot, { recursive: true });

  const records = [];
  for (const shot of plan.shots) {
    const relativePath = `outputs/demo-film-beat-narration/${shot.id}.wav`;
    const absolutePath = resolve(repository, relativePath);
    let requestId: string | undefined;
    let bytes: Buffer;
    if (shouldGenerate(shot.id)) {
      const response = await fetch("https://api.openai.com/v1/audio/speech", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          ...(process.env.WORKSHOPLM_SAFETY_ID ? { "OpenAI-Safety-Identifier": process.env.WORKSHOPLM_SAFETY_ID } : {}),
        },
        body: JSON.stringify({
          model,
          voice,
          input: shot.narration,
          instructions: "Read this as a calm, human product-demo voiceover. Be direct and conversational, with forward momentum and small pauses at sentence boundaries. Do not add words. Preserve WorkshopLM, Codex, GPT-5.6, GPT-5.6 Terra, and HyperFrames exactly.",
          response_format: "wav",
        }),
      });
      if (!response.ok) throw new Error(`Speech API returned HTTP ${response.status}: ${safeError(await response.text())}`);
      bytes = Buffer.from(await response.arrayBuffer());
      requestId = response.headers.get("x-request-id") ?? undefined;
      await writeFile(absolutePath, bytes);
    } else {
      bytes = await readFile(absolutePath);
    }
    const durationSeconds = duration(absolutePath);
    const slotSeconds = shot.endSeconds - shot.startSeconds;
    assert(durationSeconds > 0 && durationSeconds <= slotSeconds * 1.35, `${shot.id} narration is ${durationSeconds.toFixed(2)}s for a ${slotSeconds.toFixed(2)}s slot.`);
    records.push({
      id: shot.id,
      title: shot.title,
      relativePath,
      sha256: sha256(bytes),
      narrationSha256: sha256(shot.narration),
      durationSeconds,
      slotSeconds,
      model,
      voice,
      generatedInThisRun: shouldGenerate(shot.id),
      requestId,
    });
  }

  const manifest = {
    schemaVersion: 1,
    status: "provider-narration-ready",
    disclosure: "AI-generated voice",
    generatedAt: new Date().toISOString(),
    planPath: "submission/demo-film-beat-plan.json",
    model,
    voice,
    requestCount: records.filter((record) => record.generatedInThisRun).length,
    fileCount: records.length,
    shots: records,
  };
  await writeFile(resolve(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
