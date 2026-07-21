import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const planPath = resolve(repository, "submission/demo-film-v5-plan.json");
const outputRoot = resolve(repository, "outputs/demo-film-local-review-v5/narration");
const plan = JSON.parse(await readFile(planPath, "utf8"));
const apiKey = process.env.OPENAI_API_KEY?.trim();
if (!apiKey) throw new Error("OPENAI_API_KEY is required.");

const instructions = "Premium product-film narration with warm, intelligent founder energy. Conversational, direct, and confident without sounding like an announcer or commercial voice actor. Natural American English. Close-miked, dry studio sound. Moderate pace around 150 words per minute, with restrained emotion and precise articulation. Use a short meaningful pause after each sentence. Keep the tone and vocal placement consistent across every passage. One speaker only. No reverb, echo, room sound, chorus, doubling, whispered doubles, backing voice, vocal fry, trailer cadence, or sing-song delivery. Do not add or remove words.";
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const safeError = (value) => String(value).replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]").replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 800);

await mkdir(outputRoot, { recursive: true });
const acts = [];
for (const act of plan.narration.acts) {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: plan.narration.model,
      voice: plan.narration.voice,
      input: act.text,
      instructions,
      response_format: "wav",
      speed: 1
    })
  });
  if (!response.ok) throw new Error(`Speech API returned HTTP ${response.status}: ${safeError(await response.text())}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const path = resolve(outputRoot, `${act.id}.wav`);
  await writeFile(path, bytes);
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_name,sample_rate,channels", "-of", "json", path], { encoding: "utf8" }));
  acts.push({
    id: act.id,
    startSeconds: act.startSeconds,
    text: act.text,
    relativePath: `outputs/demo-film-local-review-v5/narration/${act.id}.wav`,
    requestId: response.headers.get("x-request-id"),
    sha256: sha256(bytes),
    durationSeconds: Number(probe.format.duration),
    streams: probe.streams
  });
}

const manifest = {
  schemaVersion: 1,
  status: "local-human-review-only",
  externalPublishingAuthorized: false,
  disclosure: plan.narration.disclosure,
  generatedAt: new Date().toISOString(),
  model: plan.narration.model,
  voice: plan.narration.voice,
  instructions,
  acts
};
await writeFile(resolve(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
