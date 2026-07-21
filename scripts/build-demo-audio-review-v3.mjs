import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const durationSeconds = 158.592;
const outputRoot = resolve(repository, "outputs/demo-film-local-review-v3");
const planPath = resolve(repository, "submission/demo-film-beat-plan.json");
const narrationManifestPath = resolve(outputRoot, "narration/manifest.json");
const instrumentalPath = resolve(outputRoot, "stems/htdemucs/Different Window (DOLBY)/no_vocals.wav");
const vocalsPath = resolve(outputRoot, "stems/htdemucs/Different Window (DOLBY)/vocals.wav");
const picturePath = resolve(repository, "outputs/demo-film-beat-cut/.build/picture.mp4");
const rejectedV2Path = resolve(repository, "outputs/demo-film-local-review-v2/workshoplm-demo-audio-review-v2.mp4");
const narrationPath = resolve(outputRoot, "cedar-dry-single-path.wav");
const mixPath = resolve(outputRoot, "review-mix-v3.wav");
const videoPath = resolve(outputRoot, "workshoplm-demo-audio-review-v3.mp4");
const manifestPath = resolve(outputRoot, "manifest.json");

function run(command, args) {
  const effectiveArgs = command === "ffmpeg" ? ["-hide_banner", "-loglevel", "error", ...args] : args;
  execFileSync(command, effectiveArgs, { cwd: repository, stdio: "inherit" });
}

function captured(command, args) {
  return execFileSync(command, args, { cwd: repository, encoding: "utf8", maxBuffer: 4_000_000 });
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function atempo(ratio) {
  const parts = [];
  let remaining = ratio;
  while (remaining > 2) { parts.push(2); remaining /= 2; }
  while (remaining < 0.5) { parts.push(0.5); remaining /= 0.5; }
  parts.push(remaining);
  return parts.map((value) => `atempo=${value.toFixed(6)}`).join(",");
}

function loudness(path) {
  const result = spawnSync("ffmpeg", [
    "-hide_banner", "-nostats", "-i", path,
    "-af", "loudnorm=I=-15:LRA=8:TP=-1.5:print_format=json",
    "-f", "null", "-",
  ], { cwd: repository, encoding: "utf8", maxBuffer: 4_000_000 });
  if (result.status !== 0) throw new Error(result.stderr || "Loudness analysis failed.");
  const match = result.stderr.match(/\{[\s\S]*?\}/g)?.at(-1);
  return match ? JSON.parse(match) : null;
}

await mkdir(outputRoot, { recursive: true });
const [planBytes, narrationManifestBytes] = await Promise.all([readFile(planPath), readFile(narrationManifestPath)]);
const plan = JSON.parse(planBytes.toString("utf8"));
const narration = JSON.parse(narrationManifestBytes.toString("utf8"));
if (plan.shots.length !== 10 || narration.shots.length !== 10) throw new Error("V3 requires ten picture slots and ten dry narration clips.");

const narrationInputs = [];
const narrationFilters = [];
const labels = [];
for (const [index, record] of narration.shots.entries()) {
  const shot = plan.shots.find((item) => item.id === record.id);
  if (!shot) throw new Error(`Missing picture slot for ${record.id}.`);
  const slotSeconds = shot.endSeconds - shot.startSeconds;
  const targetSeconds = Math.max(1, slotSeconds - 0.25);
  const ratio = record.durationSeconds > targetSeconds ? record.durationSeconds / targetSeconds : 1;
  const processedSeconds = record.durationSeconds / ratio;
  const fadeOutStart = Math.max(0.02, processedSeconds - 0.025);
  narrationInputs.push("-i", resolve(repository, record.relativePath));
  narrationFilters.push(
    `[${index}:a]aresample=48000,${ratio > 1.002 ? `${atempo(ratio)},` : ""}` +
    `highpass=f=75,lowpass=f=15500,afade=t=in:st=0:d=0.015,afade=t=out:st=${fadeOutStart.toFixed(3)}:d=0.025,` +
    `apad=whole_dur=${slotSeconds.toFixed(3)},atrim=duration=${slotSeconds.toFixed(3)},asetpts=PTS-STARTPTS[n${index}]`,
  );
  labels.push(`[n${index}]`);
}
narrationFilters.push(
  `${labels.join("")}concat=n=10:v=0:a=1,atrim=duration=${durationSeconds},` +
  "acompressor=threshold=0.14:ratio=2.5:attack=10:release=100:makeup=1.12," +
  "loudnorm=I=-18:LRA=7:TP=-2.0[voice]",
);
run("ffmpeg", [
  "-y", ...narrationInputs, "-filter_complex", narrationFilters.join(";"),
  "-map", "[voice]", "-t", String(durationSeconds), "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", narrationPath,
]);

// The source-separated instrumental contains the complete song structure with
// the competing rap vocal removed. One dry narration bus keys a restrained
// compressor; there is no second narration route, delay, reverb, or phase trick.
run("ffmpeg", [
  "-y", "-i", instrumentalPath, "-i", narrationPath,
  "-filter_complex",
  "[0:a]aresample=48000,atrim=duration=158.592,asetpts=PTS-STARTPTS,volume=0.52[music];" +
  "[1:a]atrim=duration=158.592,asetpts=PTS-STARTPTS,asplit=2[key][voice];" +
  "[music][key]sidechaincompress=threshold=0.055:ratio=3:attack=18:release=180:makeup=1[ducked];" +
  "[ducked][voice]amix=inputs=2:weights='1 1':normalize=0,loudnorm=I=-15:LRA=8:TP=-1.5[mix]",
  "-map", "[mix]", "-t", String(durationSeconds), "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", mixPath,
]);

run("ffmpeg", [
  "-y", "-i", picturePath, "-i", mixPath,
  "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
  "-ac", "2", "-t", String(durationSeconds), "-movflags", "+faststart", videoPath,
]);

const excerptStart = 44.095;
const excerptDuration = 21.919;
for (const [source, name] of [
  [rejectedV2Path, "ab-a-rejected-v2-44s-66s.m4a"],
  [videoPath, "ab-b-separated-v3-44s-66s.m4a"],
  [narrationPath, "diagnostic-dry-narration-44s-66s.m4a"],
  [instrumentalPath, "diagnostic-instrumental-44s-66s.m4a"],
]) {
  run("ffmpeg", [
    "-y", "-ss", String(excerptStart), "-i", source, "-t", String(excerptDuration),
    "-vn", "-c:a", "aac", "-b:a", "256k", resolve(outputRoot, name),
  ]);
}

run("ffmpeg", ["-v", "error", "-i", videoPath, "-f", "null", "-"]);
const probe = JSON.parse(captured("ffprobe", [
  "-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_name,codec_type,width,height,sample_rate,channels", "-of", "json", videoPath,
]));
const transcriptionFiles = [
  "transcription-mix.json",
  "transcription-instrumental-excerpt.json",
  "transcription-narration-excerpt.json",
];
const transcriptionRecords = await Promise.all(transcriptionFiles.map(async (name) => {
  const bytes = await readFile(resolve(outputRoot, name));
  return { name, bytes, record: JSON.parse(bytes.toString("utf8")) };
}));
const mixedTranscript = transcriptionRecords.find((item) => item.name === "transcription-mix.json")?.record.text ?? "";
const instrumentalTranscript = transcriptionRecords.find((item) => item.name === "transcription-instrumental-excerpt.json")?.record.text ?? "";
const normalizedMixedTranscript = mixedTranscript.toLowerCase().replaceAll("-", " ");
for (const phrase of ["codex with gpt 5.6", "gpt 5.6 terra", "approve the brief", "approve the storyboard", "hyperframes renders the video locally"]) {
  if (!normalizedMixedTranscript.includes(phrase)) throw new Error(`Mixed-export transcription is missing: ${phrase}`);
}
if (instrumentalTranscript.trim()) throw new Error("The instrumental diagnostic excerpt still produced a speech transcript.");
const manifest = {
  schemaVersion: 1,
  status: "local-human-review-only",
  externalPublishingAuthorized: false,
  supersedesLocalCandidate: "outputs/demo-film-local-review-v2/workshoplm-demo-audio-review-v2.mp4",
  failedCandidateReason: "Phase-cancellation treatment sounded hollow and retained echo-like vocal contamination.",
  builtAt: new Date().toISOString(),
  sourceSeparation: {
    engine: "Demucs",
    model: "htdemucs",
    mode: "two-stems vocals",
    instrumentalSha256: sha256(await readFile(instrumentalPath)),
    vocalsSha256: sha256(await readFile(vocalsPath)),
    fullDurationPreserved: true,
  },
  narration: {
    provider: "OpenAI",
    model: narration.model,
    voice: narration.voice,
    manifestSha256: sha256(narrationManifestBytes),
    requestCount: narration.requestCount,
    drySinglePath: true,
    delayReverbOrParallelVoiceAdded: false,
  },
  mix: {
    musicPreDuckGain: 0.52,
    sidechain: { ratio: 3, threshold: 0.055, attackMs: 18, releaseMs: 180 },
    loudness: loudness(mixPath),
  },
  transcriptionQa: {
    model: "gpt-4o-mini-transcribe",
    mixedExportRequiredCoveragePassed: true,
    instrumentalExcerptSpeechTranscriptEmpty: true,
    records: transcriptionRecords.map(({ name, bytes, record }) => ({ name, sha256: sha256(bytes), requestId: record.requestId })),
  },
  video: {
    relativePath: "workshoplm-demo-audio-review-v3.mp4",
    sha256: sha256(await readFile(videoPath)),
    durationSeconds: Number(probe.format.duration),
    streams: probe.streams,
    decodePassed: true,
  },
  humanReview: {
    requiredBeforeAnyExternalChange: true,
    comparisonExcerpt: { startSeconds: excerptStart, durationSeconds: excerptDuration, a: "ab-a-rejected-v2-44s-66s.m4a", b: "ab-b-separated-v3-44s-66s.m4a" },
    diagnosticStems: ["diagnostic-dry-narration-44s-66s.m4a", "diagnostic-instrumental-44s-66s.m4a"],
  },
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
