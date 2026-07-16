import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { verifySubmissionOutputSet } from "../apps/worker/src/submission-package.js";

type RequiredEvidence = { label: string; path: string; validator?: "ready-submission-manifest" | "provider-run" | "realtime-turn" | "film-narration" | "founder-capture" | "video-media" | "av-media" };
type FilmShot = {
  id: string;
  title: string;
  caption: string;
  captureEndHoldbackSeconds?: number;
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
const requiredMomentIds = ["plugin-doorway", "founder-brainstorm", "realtime-voice", "gpt-5.6-map", "source-trace", "edit-control", "brief-approval", "provider-image-set", "storyboard-approval", "provider-narration", "original-reveal", "codex-evidence", "final-submission-output-set"];

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

async function inspectEvidence(item: RequiredEvidence): Promise<{ exists: boolean; satisfied: boolean; issue?: string }> {
  const exists = await existsWithBytes(item.path);
  if (!exists) return { exists: false, satisfied: false, issue: "Evidence file is missing or empty." };
  if (item.validator === "ready-submission-manifest") {
    try {
      const manifestPath = resolve(repository, item.path);
      const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as { status?: string; limitations?: unknown[] };
      if (manifest.status !== "ready") return { exists: true, satisfied: false, issue: `Submission status is ${manifest.status ?? "missing"}, not ready.` };
      if (!Array.isArray(manifest.limitations) || manifest.limitations.length > 0) return { exists: true, satisfied: false, issue: "Submission manifest still records limitations." };
      const dataRoot = dirname(dirname(dirname(manifestPath)));
      const verification = await verifySubmissionOutputSet(dataRoot, manifestPath);
      if (!verification.valid) return { exists: true, satisfied: false, issue: `Submission package integrity failed: ${verification.issues.join("; ")}` };
    } catch {
      return { exists: true, satisfied: false, issue: "Submission manifest is invalid or cannot be verified against its Workshop state." };
    }
  }
  if (item.validator === "provider-run") {
    try {
      const run = JSON.parse(await readFile(resolve(repository, item.path), "utf8")) as {
        sourceMode?: string;
        founderSource?: boolean;
        groundedMap?: { model?: string; requestId?: string };
        imageBatch?: { model?: string; panelCount?: number; panels?: Array<{ provider?: { model?: string; requestId?: string } }> };
        narration?: { model?: string; voice?: string; panelCount?: number; panels?: Array<{ requestId?: string }> };
        video?: { copiedFilmInput?: { relativePath?: string; sha256?: string } };
        limitations?: unknown[];
      };
      if (run.sourceMode !== "authorized-sample" || run.founderSource !== false) return { exists: true, satisfied: false, issue: "Provider evidence does not preserve the authorized-sample boundary." };
      if (run.groundedMap?.model !== "gpt-5.6-terra" || !run.groundedMap.requestId) return { exists: true, satisfied: false, issue: "Provider evidence lacks the live Terra Map request." };
      if (run.imageBatch?.model !== "gpt-image-2" || run.imageBatch.panelCount !== 6 || run.imageBatch.panels?.length !== 6 || run.imageBatch.panels.some((panel) => panel.provider?.model !== "gpt-image-2" || !panel.provider.requestId)) return { exists: true, satisfied: false, issue: "Provider evidence lacks six complete GPT Image 2 results." };
      if (run.narration?.model !== "gpt-4o-mini-tts" || run.narration.voice !== "cedar" || run.narration.panelCount !== 5 || run.narration.panels?.length !== 5 || run.narration.panels.some((panel) => !panel.requestId)) return { exists: true, satisfied: false, issue: "Provider evidence lacks five complete Cedar narration results." };
      const copied = run.video?.copiedFilmInput;
      if (!copied?.relativePath || !copied.sha256) return { exists: true, satisfied: false, issue: "Provider evidence lacks the copied narrated-Video hash." };
      const actualHash = createHash("sha256").update(await readFile(resolve(repository, copied.relativePath))).digest("hex");
      if (actualHash !== copied.sha256) return { exists: true, satisfied: false, issue: "The narrated film input no longer matches provider evidence." };
      if (!Array.isArray(run.limitations) || run.limitations.length === 0) return { exists: true, satisfied: false, issue: "Authorized-sample provider evidence must retain its founder-Source limitation." };
    } catch {
      return { exists: true, satisfied: false, issue: "Provider-run evidence is invalid or references missing media." };
    }
  }
  if (item.validator === "realtime-turn") {
    try {
      const turn = JSON.parse(await readFile(resolve(repository, item.path), "utf8")) as { transport?: string; model?: string; transcriptionModel?: string; captureMode?: string; founderRecording?: boolean; successfulToolCallCount?: number; limitation?: string };
      if (turn.transport !== "webrtc" || turn.model !== "gpt-realtime-2.1" || turn.transcriptionModel !== "gpt-realtime-whisper" || turn.captureMode !== "controlled-synthetic-microphone-audio" || turn.founderRecording !== false || !turn.successfulToolCallCount || !turn.limitation) return { exists: true, satisfied: false, issue: "Realtime evidence does not preserve its verified transport and non-founder boundary." };
    } catch {
      return { exists: true, satisfied: false, issue: "Realtime-turn evidence is not valid JSON." };
    }
  }
  if (item.validator === "film-narration") {
    try {
      const narration = JSON.parse(await readFile(resolve(repository, item.path), "utf8")) as { model?: string; voice?: string; requestCount?: number; shots?: Array<{ id?: string; relativePath?: string; sha256?: string; durationSeconds?: number; slotSeconds?: number; requestId?: string }> };
      const currentPlan = JSON.parse(await readFile(planPath, "utf8")) as FilmPlan;
      if (narration.model !== "gpt-4o-mini-tts" || narration.voice !== "cedar" || narration.requestCount !== currentPlan.shots.length || narration.shots?.length !== currentPlan.shots.length) return { exists: true, satisfied: false, issue: "Film narration does not contain one Cedar clip per current shot." };
      for (const shot of narration.shots) {
        const planned = currentPlan.shots.find((candidate) => candidate.id === shot.id);
        if (!planned || !shot.relativePath || !shot.sha256 || !shot.requestId || shot.slotSeconds !== planned.endSeconds - planned.startSeconds || !shot.durationSeconds || shot.durationSeconds > shot.slotSeconds * 1.5) return { exists: true, satisfied: false, issue: `Film narration ${shot.id ?? "unknown"} no longer fits the current plan.` };
        const actualHash = createHash("sha256").update(await readFile(resolve(repository, shot.relativePath))).digest("hex");
        if (actualHash !== shot.sha256) return { exists: true, satisfied: false, issue: `Film narration ${shot.id} no longer matches its hash.` };
      }
    } catch {
      return { exists: true, satisfied: false, issue: "Film narration evidence is invalid or references missing audio." };
    }
  }
  if (item.validator === "founder-capture") {
    try {
      const manifestPath = resolve(dirname(resolve(repository, item.path)), "founder-capture.json");
      const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as { provenance?: string; providerRealtimeEvidence?: boolean; recording?: { relativePath?: string; sha256?: string; byteCount?: number; durationSeconds?: number }; transcript?: { relativePath?: string; sha256?: string; byteCount?: number; characterCount?: number } };
      if (manifest.provenance !== "founder-provided-recording-and-transcript" || manifest.providerRealtimeEvidence !== false) return { exists: true, satisfied: false, issue: "Founder capture manifest overstates or omits its provenance boundary." };
      const directory = dirname(manifestPath);
      for (const evidence of [manifest.recording, manifest.transcript]) {
        if (!evidence?.relativePath || !evidence.sha256 || !evidence.byteCount) return { exists: true, satisfied: false, issue: "Founder capture manifest is incomplete." };
        const bytes = await readFile(resolve(directory, evidence.relativePath));
        if (bytes.byteLength !== evidence.byteCount || createHash("sha256").update(bytes).digest("hex") !== evidence.sha256) return { exists: true, satisfied: false, issue: "Founder capture no longer matches its recorded hash and byte count." };
      }
      if (!manifest.recording?.durationSeconds || manifest.recording.durationSeconds < 3 || !manifest.transcript?.characterCount || manifest.transcript.characterCount < 40) return { exists: true, satisfied: false, issue: "Founder capture does not meet the minimum media and transcript evidence bar." };
      const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_type", "-of", "json", resolve(directory, manifest.recording.relativePath!)], { encoding: "utf8" })) as { format?: { duration?: string }; streams?: Array<{ codec_type?: string }> };
      if (Number(probe.format?.duration ?? 0) < 3 || !probe.streams?.some((stream) => stream.codec_type === "video") || !probe.streams.some((stream) => stream.codec_type === "audio")) return { exists: true, satisfied: false, issue: "Founder recording must remain playable with both video and audio streams." };
    } catch {
      return { exists: true, satisfied: false, issue: "Founder capture evidence is invalid or references missing media." };
    }
  }
  if (item.validator === "video-media" || item.validator === "av-media") {
    try {
      const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_type", "-of", "json", resolve(repository, item.path)], { encoding: "utf8" })) as { format?: { duration?: string }; streams?: Array<{ codec_type?: string }> };
      if (Number(probe.format?.duration ?? 0) <= 0 || !probe.streams?.some((stream) => stream.codec_type === "video")) return { exists: true, satisfied: false, issue: "Evidence media has no playable video stream." };
      if (item.validator === "av-media" && !probe.streams.some((stream) => stream.codec_type === "audio")) return { exists: true, satisfied: false, issue: "Narrated evidence media has no audio stream." };
    } catch {
      return { exists: true, satisfied: false, issue: "Evidence media could not be inspected." };
    }
  }
  return { exists: true, satisfied: true };
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
    assert(Boolean(shot.caption?.trim()) && shot.caption.length <= 80, `Caption for ${shot.id} must be present and at most 80 characters.`);
    if (shot.captureBeats.length) assert((shot.captureEndHoldbackSeconds ?? 0.3) >= 0.2 && (shot.captureEndHoldbackSeconds ?? 0.3) <= 2, `Capture holdback for ${shot.id} must be between 0.2 and 2 seconds.`);
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

  const evidence = await Promise.all(plan.shots.flatMap((shot) => shot.requiredEvidence.map(async (item) => ({ shotId: shot.id, ...item, ...await inspectEvidence(item) }))));
  const finalVideoExists = await existsWithBytes(plan.finalVideoPath);
  const finalVideoEvidence = { shotId: "final-export", label: "Final edited MP4 with video and audio streams", path: plan.finalVideoPath, exists: finalVideoExists };
  const missingEvidence = [...evidence.filter((item) => !item.satisfied), ...(finalVideoExists ? [] : [finalVideoEvidence])];
  const blockedShots = plan.shots.filter((shot) => shot.state === "blocked" || evidence.some((item) => item.shotId === shot.id && !item.satisfied)).map((shot) => shot.id);
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
  const markdown = `# WorkshopLM demo edit readiness\n\nStatus: **${finalReady ? "final-ready" : "draft"}**\n\n- Planned runtime: ${cursor}s (${Math.floor(cursor / 60)}:${String(cursor % 60).padStart(2, "0")})\n- Hard ceiling: ${plan.maxDurationSeconds}s\n- Shots: ${plan.shots.length}\n- Narration words: ${narrationWords} (${narrationWordsPerMinute.toFixed(1)} words per minute)\n- Source walkthrough: ${capture.video.durationSeconds}s, ${capture.status}, hash verified\n- Ready shots: ${report.readyShots.length}\n- Blocked shots: ${blockedShots.length}\n\n## Missing evidence\n\n${missingEvidence.length ? missingEvidence.map((item) => `- **${item.shotId}:** ${item.label} — \`${item.path}\`${"issue" in item && item.issue ? ` — ${item.issue}` : ""}`).join("\n") : "- None."}\n\n## Edit sequence\n\n${plan.shots.map((shot) => `- ${String(shot.startSeconds).padStart(3, "0")}-${String(shot.endSeconds).padStart(3, "0")} · **${shot.title}** · ${shot.state}${shot.captureBeats.length ? ` · fixture beats: ${shot.captureBeats.join(", ")}` : ""}`).join("\n")}\n`;
  await writeFile(resolve(reportRoot, "README.md"), markdown, "utf8");
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  if (finalMode && !finalReady) throw new Error(`Final demo is not ready: ${blockedShots.length} blocked shots and ${missingEvidence.length} missing evidence files.`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
