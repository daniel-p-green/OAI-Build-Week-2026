import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

type RequiredEvidence = { label: string; path: string };
type FilmShot = {
  id: string;
  title: string;
  startSeconds: number;
  endSeconds: number;
  state: "ready" | "blocked";
  captureBeats: string[];
  narration: string;
  requiredMoments: string[];
  requiredEvidence: RequiredEvidence[];
};
type FilmPlan = {
  schemaVersion: number;
  status: "draft" | "final";
  publicTitle: string;
  thumbnailText: string;
  targetDurationSeconds: number;
  maxDurationSeconds: number;
  captureManifest: string;
  finalVideoPath: string;
  shots: FilmShot[];
};
type CaptureManifest = {
  status: string;
  capturedAt: string;
  video: { relativePath: string; sha256: string; durationSeconds: number };
  beats: Array<{ id: string; startMs: number; endMs: number }>;
};

const repository = resolve(import.meta.dirname, "..");
const planPath = resolve(repository, "submission/demo-film-plan.json");
const reportRoot = resolve(repository, "outputs/demo-film-plan");
const finalMode = process.argv.includes("--final");
const requiredMomentIds = ["plugin-doorway", "founder-brainstorm", "realtime-voice", "gpt-5.6-map", "source-trace", "edit-control", "brief-approval", "provider-image-set", "storyboard-approval", "provider-narration", "original-reveal", "codex-evidence"];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function existsWithBytes(relativePath: string): Promise<boolean> {
  try {
    return (await stat(resolve(repository, relativePath))).size > 0;
  } catch {
    return false;
  }
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

async function main(): Promise<void> {
  const plan = JSON.parse(await readFile(planPath, "utf8")) as FilmPlan;
  assert(plan.schemaVersion === 1, "Unsupported demo-film plan schema.");
  assert(plan.shots.length > 0, "The demo-film plan has no shots.");
  assert(plan.targetDurationSeconds <= plan.maxDurationSeconds, "Target duration exceeds the edit ceiling.");
  assert(plan.maxDurationSeconds < 180, "The edit ceiling must remain below the three-minute public limit.");
  assert(!/google|notebooklm/i.test(`${plan.publicTitle} ${plan.thumbnailText}`), "Public title and thumbnail must not contain Google or NotebookLM marks.");

  let cursor = 0;
  const seenIds = new Set<string>();
  const seenMoments = new Set<string>();
  for (const shot of plan.shots) {
    assert(!seenIds.has(shot.id), `Duplicate shot id: ${shot.id}`);
    seenIds.add(shot.id);
    assert(shot.startSeconds === cursor, `Timeline gap or overlap before ${shot.id}: expected ${cursor}, received ${shot.startSeconds}.`);
    assert(shot.endSeconds > shot.startSeconds, `Shot ${shot.id} has a non-positive duration.`);
    assert(wordCount(shot.narration) <= (shot.endSeconds - shot.startSeconds) * 2.7, `Narration for ${shot.id} is too dense for its slot.`);
    if (shot.state === "blocked") assert(shot.requiredEvidence.length > 0, `Blocked shot ${shot.id} must name its missing evidence.`);
    shot.requiredMoments.forEach((moment) => seenMoments.add(moment));
    cursor = shot.endSeconds;
  }
  assert(cursor === plan.targetDurationSeconds, `Timeline ends at ${cursor}s, not the ${plan.targetDurationSeconds}s target.`);
  for (const moment of requiredMomentIds) assert(seenMoments.has(moment), `Required judge moment is absent: ${moment}`);

  const captureManifestPath = resolve(repository, plan.captureManifest);
  const capture = JSON.parse(await readFile(captureManifestPath, "utf8")) as CaptureManifest;
  const captureBeatIds = new Set(capture.beats.map((beat) => beat.id));
  for (const shot of plan.shots) for (const beat of shot.captureBeats) assert(captureBeatIds.has(beat), `Shot ${shot.id} references missing capture beat ${beat}.`);
  const captureVideoPath = resolve(dirname(captureManifestPath), capture.video.relativePath);
  const captureBytes = await readFile(captureVideoPath);
  const actualCaptureHash = createHash("sha256").update(captureBytes).digest("hex");
  assert(actualCaptureHash === capture.video.sha256, "The source walkthrough hash no longer matches its manifest.");

  const evidence = await Promise.all(plan.shots.flatMap((shot) => shot.requiredEvidence.map(async (item) => ({ shotId: shot.id, ...item, exists: await existsWithBytes(item.path) }))));
  const finalVideoExists = await existsWithBytes(plan.finalVideoPath);
  const finalVideoEvidence = { shotId: "final-export", label: "Final edited MP4 with video and audio streams", path: plan.finalVideoPath, exists: finalVideoExists };
  const missingEvidence = [...evidence.filter((item) => !item.exists), ...(finalVideoExists ? [] : [finalVideoEvidence])];
  const blockedShots = plan.shots.filter((shot) => shot.state === "blocked" || evidence.some((item) => item.shotId === shot.id && !item.exists)).map((shot) => shot.id);
  const narrationWords = plan.shots.reduce((total, shot) => total + wordCount(shot.narration), 0);
  const narrationWordsPerMinute = narrationWords / (cursor / 60);
  assert(narrationWordsPerMinute >= 100, `Narration pace is too sparse at ${narrationWordsPerMinute.toFixed(1)} words per minute.`);
  assert(narrationWordsPerMinute <= 155, `Narration pace is too dense at ${narrationWordsPerMinute.toFixed(1)} words per minute.`);
  let finalVideo: { exists: boolean; durationSeconds?: number; videoStreams?: number; audioStreams?: number } = { exists: finalVideoExists };
  if (finalVideoExists) {
    const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_type", "-of", "json", resolve(repository, plan.finalVideoPath)], { encoding: "utf8" })) as { format?: { duration?: string }; streams?: Array<{ codec_type?: string }> };
    const durationSeconds = Number(probe.format?.duration ?? 0);
    const videoStreams = probe.streams?.filter((stream) => stream.codec_type === "video").length ?? 0;
    const audioStreams = probe.streams?.filter((stream) => stream.codec_type === "audio").length ?? 0;
    assert(durationSeconds > 0 && durationSeconds <= plan.maxDurationSeconds, `Final video duration ${durationSeconds}s violates the ${plan.maxDurationSeconds}s ceiling.`);
    assert(videoStreams > 0, "Final video has no video stream.");
    assert(audioStreams > 0, "Final video has no audio stream.");
    finalVideo = { exists: true, durationSeconds, videoStreams, audioStreams };
  }
  const finalReady = plan.status === "final" && blockedShots.length === 0 && missingEvidence.length === 0 && finalVideoExists;
  const report = {
    schemaVersion: 1,
    sourceCapturedAt: capture.capturedAt,
    mode: finalMode ? "final" : "draft",
    planStatus: plan.status,
    finalReady,
    timeline: { durationSeconds: cursor, maxDurationSeconds: plan.maxDurationSeconds, shots: plan.shots.length, narrationWords, narrationWordsPerMinute: Number(narrationWordsPerMinute.toFixed(1)) },
    capture: { status: capture.status, durationSeconds: capture.video.durationSeconds, sha256: actualCaptureHash, referencedBeats: [...new Set(plan.shots.flatMap((shot) => shot.captureBeats))].length },
    finalVideo,
    readyShots: plan.shots.filter((shot) => shot.state === "ready").map((shot) => shot.id),
    blockedShots,
    missingEvidence,
  };
  await mkdir(reportRoot, { recursive: true });
  await writeFile(resolve(reportRoot, "edit-readiness.json"), `${JSON.stringify(report, null, 2)}\n`, "utf8");
  const markdown = `# WorkshopLM demo edit readiness\n\nStatus: **${finalReady ? "final-ready" : "draft"}**\n\n- Planned runtime: ${cursor}s (${Math.floor(cursor / 60)}:${String(cursor % 60).padStart(2, "0")})\n- Hard ceiling: ${plan.maxDurationSeconds}s\n- Shots: ${plan.shots.length}\n- Narration words: ${narrationWords} (${narrationWordsPerMinute.toFixed(1)} words per minute)\n- Source walkthrough: ${capture.video.durationSeconds}s, ${capture.status}, hash verified\n- Ready shots: ${report.readyShots.length}\n- Blocked shots: ${blockedShots.length}\n\n## Missing evidence\n\n${missingEvidence.length ? missingEvidence.map((item) => `- **${item.shotId}:** ${item.label} — \`${item.path}\``).join("\n") : "- None."}\n\n## Edit sequence\n\n${plan.shots.map((shot) => `- ${String(shot.startSeconds).padStart(3, "0")}-${String(shot.endSeconds).padStart(3, "0")} · **${shot.title}** · ${shot.state}${shot.captureBeats.length ? ` · fixture beats: ${shot.captureBeats.join(", ")}` : ""}`).join("\n")}\n`;
  await writeFile(resolve(reportRoot, "README.md"), markdown, "utf8");
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (finalMode && !finalReady) throw new Error(`Final demo is not ready: ${blockedShots.length} blocked shots and ${missingEvidence.length} missing evidence files.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
