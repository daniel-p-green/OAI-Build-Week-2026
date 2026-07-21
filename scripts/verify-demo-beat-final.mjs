import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const paths = {
  plan: "submission/demo-film-beat-plan.json",
  narration: "outputs/demo-film-beat-narration/manifest.json",
  capture: "outputs/demo-recording-final/manifest.json",
  film: "outputs/demo-film-final/manifest.json",
  report: "outputs/demo-film-plan/edit-readiness.json",
};
const read = (path) => readFile(resolve(repository, path));
const json = async (path) => JSON.parse((await read(path)).toString("utf8"));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const [planBytes, narrationBytes, captureBytes, filmBytes] = await Promise.all([read(paths.plan), read(paths.narration), read(paths.capture), read(paths.film)]);
const plan = JSON.parse(planBytes.toString("utf8"));
const narration = JSON.parse(narrationBytes.toString("utf8"));
const capture = JSON.parse(captureBytes.toString("utf8"));
const film = JSON.parse(filmBytes.toString("utf8"));

assert(plan.schemaVersion === 1 && plan.targetDurationSeconds === 158.592 && plan.shots?.length === 10, "The final beat plan is not the locked ten-shot 158.592-second edit.");
assert(plan.music?.title === "Different Window" && plan.songSkeleton?.length === 10, "The final beat plan is not bound to the Different Window song skeleton.");
let cursor = 0;
for (const shot of plan.shots) {
  assert(Math.abs(shot.startSeconds - cursor) < .001 && shot.endSeconds > shot.startSeconds, `Timeline gap or invalid duration at ${shot.id}.`);
  if (shot.startSeconds > 0) {
    const beatNumber = Math.round((shot.startSeconds - plan.music.firstBeatSeconds) / plan.music.beatIntervalSeconds);
    const beatTime = plan.music.firstBeatSeconds + beatNumber * plan.music.beatIntervalSeconds;
    assert(Math.abs(shot.startSeconds - beatTime) < .002, `${shot.id} is not on the detected beat grid.`);
  }
  cursor = shot.endSeconds;
}
assert(Math.abs(cursor - plan.targetDurationSeconds) < .001, "The final beat timeline does not use the full song.");

assert(narration.status === "provider-narration-ready" && narration.model === "gpt-4o-mini-tts" && narration.voice === "cedar" && narration.fileCount === 10 && narration.shots?.length === 10, "The final Cedar narration set is incomplete.");
for (const item of narration.shots) {
  const shot = plan.shots.find((candidate) => candidate.id === item.id);
  assert(shot && item.narrationSha256 === hash(Buffer.from(shot.narration)), `Stale narration copy for ${item.id}.`);
  assert(hash(await read(item.relativePath)) === item.sha256, `Narration hash mismatch for ${item.id}.`);
}

assert(capture.status === "founder-final-candidate" && capture.founderSource === true && capture.limitations?.length === 0, "The final browser capture is not founder-authorized and limitation-free.");
const captureVideoPath = resolve(dirname(resolve(repository, paths.capture)), capture.video.relativePath);
assert(hash(await readFile(captureVideoPath)) === capture.video.sha256, "Founder walkthrough hash mismatch.");

assert(film.status === "final-public-demo" && film.limitations?.length === 0, "Final film manifest is not publication-ready.");
assert(film.plan?.sha256 === hash(planBytes), "Final film is not bound to the current beat plan.");
assert(film.compositor?.engine === "hyperframes" && film.compositor.composition === "workshoplm-beat-cut", "Final film is not the verified HyperFrames beat cut.");
assert(film.music?.fullMasterUsed === true && film.music.sha256 === plan.music.sha256, "Final film is not bound to the declared authorized music hash.");
if (existsSync(plan.music.sourcePath)) assert(film.music.sha256 === hash(await readFile(plan.music.sourcePath)), "The available authorized music master does not match the declared hash.");
assert(film.sourceCapture?.sha256 === capture.video.sha256, "Final film is not bound to the verified founder walkthrough.");
assert(film.metaRevealEvidence?.mode === "founder", "Final film is missing its founder-evidence binding.");
for (const evidence of [film.metaRevealEvidence.transcript, film.metaRevealEvidence.submissionManifest, film.metaRevealEvidence.buildTrace]) {
  assert(evidence?.relativePath && evidence.sha256 === hash(await read(evidence.relativePath)), `Final founder evidence hash mismatch: ${evidence?.relativePath ?? "missing"}.`);
}
const videoPath = resolve(dirname(resolve(repository, paths.film)), film.video.relativePath);
const videoBytes = await readFile(videoPath);
assert(hash(videoBytes) === film.video.sha256, "Final video hash mismatch.");
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_type,codec_name", "-of", "json", videoPath,], { encoding: "utf8" }));
const duration = Number(probe.format?.duration ?? 0);
assert(duration >= 158.5 && duration < 180 && probe.streams?.some((stream) => stream.codec_name === "h264") && probe.streams.some((stream) => stream.codec_name === "aac"), "Final video is not the verified under-three-minute H.264/AAC export.");
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", videoPath, "-f", "null", "-"], { stdio: "inherit" });

const transcriptionBytes = await read(film.audioQa.transcriptionRelativePath.startsWith("outputs/") ? film.audioQa.transcriptionRelativePath : `outputs/demo-film-final/${film.audioQa.transcriptionRelativePath}`);
assert(hash(transcriptionBytes) === film.audioQa.transcriptionSha256, "Final mixed-audio transcription hash mismatch.");
const transcript = JSON.parse(transcriptionBytes.toString("utf8")).text ?? "";
for (const phrase of ["GPT-5.6 Terra", "Approve the brief", "Approve the storyboard", "Hyperframes renders the video locally", "Codex with GPT-5.6"]) assert(transcript.toLowerCase().includes(phrase.toLowerCase()), `Final mixed-audio transcript is missing: ${phrase}.`);

const report = {
  schemaVersion: 2,
  mode: "final",
  planStatus: "final",
  finalReady: true,
  timeline: { durationSeconds: plan.targetDurationSeconds, maxDurationSeconds: 180, shots: plan.shots.length, beatGridMaxDriftMs: 0 },
  capture: { status: capture.status, durationSeconds: capture.video.durationSeconds, sha256: capture.video.sha256 },
  finalVideo: { exists: true, durationSeconds: duration, videoStreams: 1, audioStreams: 1, sha256: film.video.sha256 },
  readyShots: plan.shots.map((shot) => shot.id),
  blockedShots: [],
  missingEvidence: [],
  audioQa: film.audioQa,
};
await mkdir(dirname(resolve(repository, paths.report)), { recursive: true });
await writeFile(resolve(repository, paths.report), `${JSON.stringify(report, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
