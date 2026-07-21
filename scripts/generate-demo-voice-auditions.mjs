import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const outputRoot = resolve(repository, "outputs/demo-film-local-review-v5/voice-auditions");
const musicPath = "/Users/danielgreen/Library/Mobile Documents/com~apple~CloudDocs/The Codex Rap - July 2026/Masters/Different Window (DOLBY).wav";
const model = "gpt-4o-mini-tts-2025-12-15";
const voices = ["marin", "cedar"];
const input = "Why does good work fall apart after the meeting? The notes, decisions, slides, visuals, and sources split across tools. The thinking survives. The trail back to it doesn't. Workshop L M keeps that chain intact.";
const instructions = "Premium product-film narration with warm, intelligent founder energy. Conversational, direct, and confident without sounding like an announcer or commercial voice actor. Natural American English. Close-miked, dry studio sound. Moderate pace around 150 words per minute, with restrained emotion and precise articulation. Use a short meaningful pause after each sentence. One speaker only. No reverb, echo, room sound, chorus, doubling, whispered doubles, backing voice, vocal fry, trailer cadence, or sing-song delivery. Do not add or remove words.";
const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function safeError(value) {
  return String(value).replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]").replace(/Bearer\s+\S+/gi, "Bearer [redacted]").slice(0, 800);
}

function probe(path) {
  return JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_name,sample_rate,channels,channel_layout", "-of", "json", path], { encoding: "utf8" }));
}

await mkdir(outputRoot, { recursive: true });
const apiKey = process.env.OPENAI_API_KEY?.trim();
if (!apiKey) throw new Error("OPENAI_API_KEY is required.");
const records = [];

for (const voice of voices) {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, voice, input, instructions, response_format: "wav", speed: 1 }),
  });
  if (!response.ok) throw new Error(`Speech API returned HTTP ${response.status}: ${safeError(await response.text())}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  const voicePath = resolve(outputRoot, `${voice}.wav`);
  await writeFile(voicePath, bytes);
  const voiceProbe = probe(voicePath);
  const duration = Number(voiceProbe.format.duration);
  const mixDuration = Math.max(20, duration + 3);
  const mixPath = resolve(outputRoot, `${voice}-with-original-track.m4a`);
  // The source master is unmodified except for explicit gain automation:
  // 0-0.35s at -4.4 dB, narration at -8.9 dB, then a 1.4s release to -3.1 dB.
  const releaseStart = Math.max(0.5, duration - 0.2);
  const releaseEnd = duration + 1.2;
  const volumeExpression = `if(lt(t,0.35),0.60,if(lt(t,${releaseStart.toFixed(3)}),0.36,if(lt(t,${releaseEnd.toFixed(3)}),0.36+(t-${releaseStart.toFixed(3)})*${(0.34 / (releaseEnd - releaseStart)).toFixed(6)},0.70)))`;
  execFileSync("ffmpeg", [
    "-hide_banner", "-loglevel", "error", "-y", "-i", musicPath, "-i", voicePath,
    "-filter_complex", `[0:a]atrim=duration=${mixDuration.toFixed(3)},asetpts=PTS-STARTPTS,volume='${volumeExpression}':eval=frame[music];[1:a]aresample=48000,volume=1.0,apad=whole_dur=${mixDuration.toFixed(3)},atrim=duration=${mixDuration.toFixed(3)}[voice];[music][voice]amix=inputs=2:weights='1 1':normalize=0,alimiter=limit=0.891[mix]`,
    "-map", "[mix]", "-t", mixDuration.toFixed(3), "-ar", "48000", "-ac", "2", "-c:a", "aac", "-b:a", "256k", mixPath,
  ], { stdio: "inherit" });
  const mixBytes = await readFile(mixPath);
  records.push({
    voice,
    model,
    requestId: response.headers.get("x-request-id"),
    voiceFile: `${voice}.wav`,
    voiceSha256: sha256(bytes),
    durationSeconds: duration,
    mixFile: `${voice}-with-original-track.m4a`,
    mixSha256: sha256(mixBytes),
    musicAutomation: { openingGain: 0.60, narrationGain: 0.36, releaseGain: 0.70, releaseStartSeconds: releaseStart, releaseEndSeconds: releaseEnd },
  });
}

const manifest = {
  schemaVersion: 1,
  status: "local-human-review-only",
  externalPublishingAuthorized: false,
  disclosure: "AI-generated voice",
  generatedAt: new Date().toISOString(),
  model,
  input,
  instructions,
  sourceMaster: { path: musicPath, sha256: sha256(await readFile(musicPath)), processing: "Untouched stereo master; gain automation only." },
  records,
};
await writeFile(resolve(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
