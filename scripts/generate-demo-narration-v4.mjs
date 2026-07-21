import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const outputRoot = resolve(repository, "outputs/demo-film-local-review-v4/narration");
const planPath = resolve(repository, "submission/demo-film-beat-plan.json");
const voice = process.env.WORKSHOPLM_LOCAL_TTS_VOICE ?? "Samantha";
const rate = process.env.WORKSHOPLM_LOCAL_TTS_RATE ?? "175";

const copy = {
  why: "Why does good work fall apart after the meeting? Because the notes, decisions, slides, visuals, and citations get split across tools. The thinking survives, but the trail back to it doesn't.",
  "one-workshop": "Workshop L M keeps that chain intact. One source becomes a map, an approved brief, and finished work without losing the evidence underneath it.",
  capture: "I can start with a voice note, pasted text, a website, or a document. The source stays local and visible, and I choose exactly what the workshop may use.",
  map: "G P T five point six Terra turns those sources into an editable map. Evidence supports synthesis. Synthesis supports a recommended direction. I can change a claim, or open it and jump straight back to the exact source passage.",
  "source-proof": "That trace follows the work. There isn't a separate citation page to hunt through. If the source changes, downstream work is marked for review.",
  approvals: "Before anything is created, I approve the brief. Before video renders, I approve the storyboard. If the thinking changes, those gates close again.",
  "output-flex": "From one approved direction, Workshop L M creates a presentation, infographic, image set, audio overview, sketch, storyboard, and video. They share the same style, decision, and source trail. The deck stays editable.",
  render: "The storyboard is still a working surface: visuals, narration, timing, and sources. After approval, HyperFrames renders locally and records hashes for each scene.",
  "codex-gpt": "Codex with G P T five point six built, tested, and corrected Workshop L M. Inside the product, G P T five point six Terra performs the source-grounded synthesis you just saw.",
  close: "One conversation became finished work, and every claim still knows where it came from. That's Workshop L M.",
};

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const plan = JSON.parse(await readFile(planPath, "utf8"));
await mkdir(outputRoot, { recursive: true });

const shots = [];
for (const shot of plan.shots) {
  const narration = copy[shot.id];
  if (!narration) throw new Error(`Missing local narration for ${shot.id}.`);
  const aiffPath = resolve(outputRoot, `${shot.id}.aiff`);
  const wavPath = resolve(outputRoot, `${shot.id}.wav`);
  execFileSync("say", ["-v", voice, "-r", rate, "-o", aiffPath, narration], { stdio: "inherit" });
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", aiffPath, "-ac", "1", "-ar", "48000", "-c:a", "pcm_s24le", wavPath], { stdio: "inherit" });
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=duration", "-of", "json", wavPath], { encoding: "utf8" }));
  const bytes = await readFile(wavPath);
  shots.push({
    id: shot.id,
    narration,
    relativePath: `outputs/demo-film-local-review-v4/narration/${shot.id}.wav`,
    durationSeconds: Number(probe.format?.duration ?? probe.streams?.[0]?.duration ?? 0),
    slotSeconds: shot.endSeconds - shot.startSeconds,
    sha256: sha256(bytes),
  });
}

const manifest = {
  schemaVersion: 1,
  status: "local-human-review-only",
  disclosure: "Locally generated macOS text-to-speech",
  generatedAt: new Date().toISOString(),
  engine: "macOS say",
  voice,
  rateWordsPerMinute: Number(rate),
  channelLayout: "mono",
  processing: "No reverb, delay, chorus, doubling, spatialization, or dynamics processing.",
  shots,
};
await writeFile(resolve(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ voice, rate, shots: shots.map(({ id, durationSeconds, slotSeconds }) => ({ id, durationSeconds, slotSeconds })) }, null, 2)}\n`);
