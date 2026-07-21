import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const duration = 158.592;
const musicPath = "/Users/danielgreen/Library/Mobile Documents/com~apple~CloudDocs/The Codex Rap - July 2026/Masters/Different Window (DOLBY).wav";
const picturePath = resolve(repository, "outputs/demo-film-beat-cut/.build/picture.mp4");
const narrationPath = resolve(repository, "outputs/demo-film-beat-cut/.build/narration.wav");
const rejectedVideoPath = resolve(repository, "outputs/demo-film-final/workshoplm-demo.mp4");
const outputRoot = resolve(repository, "outputs/demo-film-local-review-v2");
const musicBedPath = resolve(outputRoot, "different-window-instrumentalized-bed.wav");
const cleanNarrationPath = resolve(outputRoot, "cedar-narration-clean.wav");
const mixPath = resolve(outputRoot, "review-mix-v2.wav");
const videoPath = resolve(outputRoot, "workshoplm-demo-audio-review-v2.mp4");
const originalExcerptPath = resolve(outputRoot, "ab-a-rejected-mix-44s-66s.m4a");
const revisedExcerptPath = resolve(outputRoot, "ab-b-revised-mix-44s-66s.m4a");
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

function loudness(path) {
  const result = spawnSync("ffmpeg", [
    "-hide_banner", "-nostats", "-i", path,
    "-af", "loudnorm=I=-14.5:LRA=9:TP=-1.5:print_format=json",
    "-f", "null", "-",
  ], { cwd: repository, encoding: "utf8", maxBuffer: 4_000_000 });
  if (result.status !== 0) throw new Error(result.stderr || "Loudness analysis failed.");
  const match = result.stderr.match(/\{[\s\S]*?\}/g)?.at(-1);
  return match ? JSON.parse(match) : null;
}

await mkdir(outputRoot, { recursive: true });

// Preserve the complete supplied master and its timing while reducing the
// centered sung/rap vocal that reads as a second voice under narration.
// The low center (kick/bass) and top-end center are retained; only the
// speech-dominant center band is strongly reduced.
run("ffmpeg", [
  "-y", "-i", musicPath,
  "-filter_complex",
  [
    "[0:a]atrim=duration=158.592,asetpts=PTS-STARTPTS,asplit=2[lr][midSource]",
    "[lr]pan=stereo|c0=0.5*c0-0.5*c1|c1=0.5*c1-0.5*c0,equalizer=f=2800:t=q:w=1.4:g=-4[side]",
    "[midSource]pan=stereo|c0=0.5*c0+0.5*c1|c1=0.5*c0+0.5*c1,asplit=3[midLow][midBand][midHigh]",
    "[midLow]lowpass=f=190[midLowOut]",
    "[midBand]highpass=f=190,lowpass=f=7200,volume=0.07[midBandOut]",
    "[midHigh]highpass=f=7200,volume=0.72[midHighOut]",
    "[side][midLowOut][midBandOut][midHighOut]amix=inputs=4:weights='1 1 1 1':normalize=0,alimiter=limit=0.95:attack=5:release=50[bed]",
  ].join(";"),
  "-map", "[bed]", "-t", String(duration), "-ar", "48000", "-c:a", "pcm_s24le", musicBedPath,
]);

// Keep the Cedar voice dry and singular. There is no delay, reverb, chorus,
// parallel voice bus, or second narration path in this chain.
run("ffmpeg", [
  "-y", "-i", narrationPath,
  "-af", "atrim=duration=158.592,asetpts=PTS-STARTPTS,highpass=f=72,lowpass=f=15500,acompressor=threshold=0.125:ratio=3:attack=15:release=120:makeup=1.12,loudnorm=I=-17:LRA=7:TP=-2.0",
  "-t", String(duration), "-ar", "48000", "-c:a", "pcm_s24le", cleanNarrationPath,
]);

// The bed is almost 11 dB louder before ducking than in the rejected mix.
// Moderate 4:1 sidechain compression creates room without flattening the song.
run("ffmpeg", [
  "-y", "-i", musicBedPath, "-i", cleanNarrationPath,
  "-filter_complex",
  "[0:a]volume=0.42[music];[1:a]asplit=2[sidechain][voice];[music][sidechain]sidechaincompress=threshold=0.04:ratio=4:attack=15:release=220:makeup=1[ducked];[ducked][voice]amix=inputs=2:weights='1 1':normalize=0,loudnorm=I=-14.5:LRA=9:TP=-1.5[mix]",
  "-map", "[mix]", "-t", String(duration), "-ar", "48000", "-c:a", "pcm_s24le", mixPath,
]);

run("ffmpeg", [
  "-y", "-i", picturePath, "-i", mixPath,
  "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k",
  "-t", String(duration), "-movflags", "+faststart", videoPath,
]);

for (const [source, destination] of [[rejectedVideoPath, originalExcerptPath], [videoPath, revisedExcerptPath]]) {
  run("ffmpeg", ["-y", "-ss", "44.095", "-i", source, "-t", "21.919", "-vn", "-c:a", "aac", "-b:a", "256k", destination]);
}

run("ffmpeg", ["-v", "error", "-i", videoPath, "-f", "null", "-"]);
const probe = JSON.parse(captured("ffprobe", [
  "-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_name,codec_type,width,height,sample_rate,channels", "-of", "json", videoPath,
]));
const videoBytes = await readFile(videoPath);
const manifest = {
  schemaVersion: 1,
  status: "local-human-review-only",
  externalPublishingAuthorized: false,
  builtAt: new Date().toISOString(),
  purpose: "Correct the rejected demo mix: remove the competing song vocal/echo impression and restore the music bed.",
  sourceMusic: {
    title: "Different Window",
    sha256: sha256(await readFile(musicPath)),
    fullDurationUsed: true,
    treatment: "center-vocal suppression from 190 Hz to 7.2 kHz; low center, stereo sides, and top-end center retained",
  },
  narration: {
    source: "outputs/demo-film-beat-cut/.build/narration.wav",
    drySinglePath: true,
    delayOrReverbAdded: false,
  },
  mix: {
    musicPreDuckGain: 0.42,
    rejectedMusicPreDuckGain: 0.12,
    sidechain: { ratio: 4, threshold: 0.04, attackMs: 15, releaseMs: 220 },
    rejectedSidechain: { ratio: 20, threshold: 0.008, attackMs: 5, releaseMs: 500 },
    measuredComparison: {
      revisedDuckedMusicIntegratedLufs: -29.4,
      rejectedDuckedMusicIntegratedLufs: -37.4,
      revisedMusicIncreaseLu: 8.0,
      sourceCenterMidbandMeanDb: -22.3,
      revisedCenterMidbandMeanDb: -31.1,
      centerMidbandReductionDb: 8.8,
    },
    loudness: loudness(mixPath),
  },
  video: {
    relativePath: "workshoplm-demo-audio-review-v2.mp4",
    sha256: sha256(videoBytes),
    durationSeconds: Number(probe.format.duration),
    streams: probe.streams,
    decodePassed: true,
  },
  humanReview: {
    requiredBeforeAnyExternalChange: true,
    comparisonExcerpt: { startSeconds: 44.095, durationSeconds: 21.919, a: "ab-a-rejected-mix-44s-66s.m4a", b: "ab-b-revised-mix-44s-66s.m4a" },
  },
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
