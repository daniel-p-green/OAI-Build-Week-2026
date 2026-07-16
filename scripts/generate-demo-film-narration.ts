import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

type FilmPlan = { shots: Array<{ id: string; title: string; startSeconds: number; endSeconds: number; narration: string }> };
type NarrationRecord = { id: string; title: string; relativePath: string; sha256: string; byteCount: number; durationSeconds: number; slotSeconds: number; model: "gpt-4o-mini-tts"; voice: "cedar"; requestId?: string; generatedAt: string };

const repository = resolve(import.meta.dirname, "..");
const outputRoot = resolve(repository, "outputs/demo-film-narration");
const planPath = resolve(repository, "submission/demo-film-plan.json");
const model = "gpt-4o-mini-tts" as const;
const voice = "cedar" as const;

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function safeError(value: string): string {
  return value.replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]").replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 500);
}

function probeDuration(path: string): number {
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "json", path], { encoding: "utf8" })) as { format?: { duration?: string } };
  return Number(probe.format?.duration ?? 0);
}

async function main(): Promise<void> {
  const shotArgument = process.argv.find((value) => value.startsWith("--shots="))?.slice("--shots=".length);
  const requestedShotIds = shotArgument ? new Set(shotArgument.split(",").map((value) => value.trim()).filter(Boolean)) : undefined;
  assert(process.env.WORKSHOPLM_GENERATE_DEMO_FILM_NARRATION === "1", `Set WORKSHOPLM_GENERATE_DEMO_FILM_NARRATION=1 for this bounded ${requestedShotIds ? `${requestedShotIds.size}-request revision` : "ten-request operation"}.`);
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  assert(apiKey, "OPENAI_API_KEY is required.");
  const plan = JSON.parse(await readFile(planPath, "utf8")) as FilmPlan;
  assert(plan.shots.length === 10, `Expected ten film shots, received ${plan.shots.length}.`);
  assert(plan.shots.every((shot) => shot.narration.length > 0 && shot.narration.length <= 4096), "Every film narration must fit the Speech API input limit.");
  if (requestedShotIds) {
    const planIds = new Set(plan.shots.map((shot) => shot.id));
    for (const id of requestedShotIds) assert(planIds.has(id), `Unknown film shot requested for narration: ${id}`);
    assert(requestedShotIds.size > 0, "At least one film shot is required for selective narration regeneration.");
  }
  await mkdir(outputRoot, { recursive: true });

  const manifestPath = resolve(outputRoot, "manifest.json");
  const prior = requestedShotIds ? JSON.parse(await readFile(manifestPath, "utf8")) as { shots?: NarrationRecord[] } : undefined;
  if (requestedShotIds) assert(prior?.shots?.length === plan.shots.length, "Selective narration regeneration requires a complete existing ten-shot manifest.");
  const recordsById = new Map((prior?.shots ?? []).map((record) => [record.id, record]));
  for (const shot of plan.shots.filter((candidate) => !requestedShotIds || requestedShotIds.has(candidate.id))) {
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
        instructions: "Narrate a polished professional product film with calm confidence and forward momentum. Use natural emphasis, crisp pacing, and no added words. Preserve WorkshopLM, Codex, GPT-5.6, GPT Image 2, HyperFrames, and source terminology exactly.",
        response_format: "wav",
      }),
    });
    if (!response.ok) throw new Error(`Speech API returned HTTP ${response.status}: ${safeError(await response.text())}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    const relativePath = `outputs/demo-film-narration/${shot.id}.wav`;
    const absolutePath = resolve(repository, relativePath);
    await writeFile(absolutePath, bytes);
    const durationSeconds = probeDuration(absolutePath);
    assert(durationSeconds > 0, `Narration ${shot.id} has no playable duration.`);
    const slotSeconds = shot.endSeconds - shot.startSeconds;
    assert(durationSeconds <= slotSeconds * 1.5, `Narration ${shot.id} is ${durationSeconds.toFixed(2)}s for a ${slotSeconds}s slot and would require excessive time compression.`);
    recordsById.set(shot.id, { id: shot.id, title: shot.title, relativePath, sha256: createHash("sha256").update(bytes).digest("hex"), byteCount: bytes.byteLength, durationSeconds, slotSeconds, model, voice, requestId: response.headers.get("x-request-id") ?? undefined, generatedAt: new Date().toISOString() });
  }
  const records = plan.shots.map((shot) => recordsById.get(shot.id)).filter((record): record is NarrationRecord => Boolean(record));
  assert(records.length === plan.shots.length, "Narration manifest must retain all ten film shots.");

  const manifest = {
    schemaVersion: 1,
    status: "provider-narration-ready",
    disclosure: "AI-generated voice",
    model,
    voice,
    requestCount: records.length,
    regeneratedRequestCount: requestedShotIds?.size ?? records.length,
    generatedAt: new Date().toISOString(),
    planPath: "submission/demo-film-plan.json",
    shots: records,
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
