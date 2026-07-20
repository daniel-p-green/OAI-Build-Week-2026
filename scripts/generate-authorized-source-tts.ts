import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const transcriptPath = resolve(repository, "fixtures/founder-rehearsal/authorized-sample-transcript.txt");
const outputRoot = resolve(repository, "outputs/demo-source-authorized");
const audioPath = resolve(outputRoot, "project-brainstorm.wav");
const videoPath = resolve(outputRoot, "project-brainstorm.mov");
const copiedTranscriptPath = resolve(outputRoot, "project-brainstorm.txt");
const manifestPath = resolve(outputRoot, "manifest.json");
const model = "gpt-4o-mini-tts";
const voice = "cedar";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function sha256(bytes: Uint8Array | string): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function safeError(value: string): string {
  return value.replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]").replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 500);
}

async function main(): Promise<void> {
  const assembleExisting = process.argv.includes("--assemble-existing");
  assert(assembleExisting || process.env.WORKSHOPLM_GENERATE_AUTHORIZED_SOURCE_TTS === "1", "Set WORKSHOPLM_GENERATE_AUTHORIZED_SOURCE_TTS=1 to authorize this single Speech API request, or pass --assemble-existing after a completed request.");
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!assembleExisting) assert(apiKey, "OPENAI_API_KEY is required.");
  const transcript = (await readFile(transcriptPath, "utf8")).trim();
  assert(transcript.length >= 40, "The authorized project brainstorm is too short.");
  await mkdir(outputRoot, { recursive: true });
  const generatedAt = new Date().toISOString();
  const response = assembleExisting ? undefined : await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey!}`,
      "Content-Type": "application/json",
      ...(process.env.WORKSHOPLM_SAFETY_ID ? { "OpenAI-Safety-Identifier": process.env.WORKSHOPLM_SAFETY_ID } : {}),
    },
    body: JSON.stringify({
      model,
      voice,
      input: transcript,
      instructions: "Read this authorized project brainstorm as an informal but clear working note. Calm pace, natural phrasing, no added words. This is an AI-generated voice and not an imitation of the founder.",
      response_format: "wav",
    }),
  });
  if (response && !response.ok) throw new Error(`Speech API returned HTTP ${response.status}: ${safeError(await response.text())}`);
  const audioBytes = response ? Buffer.from(await response.arrayBuffer()) : await readFile(audioPath);
  if (response) await writeFile(audioPath, audioBytes);
  await writeFile(copiedTranscriptPath, `${transcript}\n`, "utf8");
  execFileSync("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y",
    "-f", "lavfi", "-i", "color=c=0xF7F7F5:s=1280x720:r=30",
    "-i", audioPath,
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "192k", "-shortest",
    "-metadata", `creation_time=${generatedAt}`,
    videoPath,
  ], { stdio: "inherit" });
  const videoBytes = await readFile(videoPath);
  const transcriptBytes = await readFile(copiedTranscriptPath);
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_type,codec_name,width,height,sample_rate", "-of", "json", videoPath], { encoding: "utf8" })) as { format?: { duration?: string }; streams?: Array<{ codec_type?: string; codec_name?: string }> };
  assert(Number(probe.format?.duration ?? 0) >= 3, "Generated source media is too short.");
  assert(probe.streams?.some((stream) => stream.codec_type === "video") && probe.streams.some((stream) => stream.codec_type === "audio"), "Generated source media must contain video and audio streams.");
  const manifest = {
    schemaVersion: 1,
    status: "founder-authorized-source-ready",
    disclosure: "AI-generated voice; not the founder's recorded voice and not a Realtime capture.",
    provenance: "founder-authorized-script-and-ai-narration",
    generatedAt,
    sourceTranscript: "fixtures/founder-rehearsal/authorized-sample-transcript.txt",
    provider: { model, voice, requestId: response?.headers.get("x-request-id") ?? null, assemblyRetriedWithoutProviderCall: assembleExisting },
    transcript: { relativePath: "project-brainstorm.txt", sha256: sha256(transcriptBytes), byteCount: transcriptBytes.byteLength, characterCount: transcript.length },
    audio: { relativePath: "project-brainstorm.wav", sha256: sha256(audioBytes), byteCount: audioBytes.byteLength },
    video: { relativePath: "project-brainstorm.mov", sha256: sha256(videoBytes), byteCount: videoBytes.byteLength, durationSeconds: Number(probe.format?.duration ?? 0), streams: probe.streams ?? [] },
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
