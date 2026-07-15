import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const planPath = resolve(repository, "submission/demo-film-plan.json");
const outputRoot = resolve(repository, "outputs/demo-film-rough-cut");
const temporaryRoot = resolve(outputRoot, ".build");
const outputVideo = resolve(outputRoot, "workshoplm-demo-rough-cut.mp4");
const contactSheet = resolve(outputRoot, "contact-sheet.jpg");
const manifestPath = resolve(outputRoot, "manifest.json");
const reviewRoot = resolve(outputRoot, "review");
const voice = process.env.WORKSHOPLM_ROUGH_CUT_VOICE || "Samantha";
const fixedSpeechRate = process.env.WORKSHOPLM_ROUGH_CUT_RATE ? Number(process.env.WORKSHOPLM_ROUGH_CUT_RATE) : undefined;
const width = 1280;
const height = 720;

function run(command, args) {
  const effectiveArgs = command === "ffmpeg" ? ["-hide_banner", "-loglevel", "error", ...args] : args;
  execFileSync(command, effectiveArgs, { cwd: repository, stdio: "inherit" });
}

function probe(path) {
  return JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_type,codec_name,width,height,sample_rate", "-of", "json", path], { encoding: "utf8" }));
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function captionLines(text, maxCharacters = 66) {
  const words = text.split(/[.!?]/)[0].trim().split(/\s+/).filter(Boolean);
  const lines = [];
  for (const word of words) {
    const current = lines.at(-1);
    if (!current || (current.length + word.length + 1 > maxCharacters && lines.length < 2)) lines.push(word);
    else lines[lines.length - 1] = `${current} ${word}`;
  }
  if (lines.length > 2) lines.splice(2);
  const second = lines[1];
  if (second && second.length > maxCharacters) lines[1] = `${second.slice(0, maxCharacters - 1).trimEnd()}…`;
  return lines;
}

function guideVoiceRate(text, durationSeconds) {
  if (fixedSpeechRate) return fixedSpeechRate;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const requiredWordsPerMinute = words / Math.max(1, durationSeconds - 0.8) * 60;
  return Math.max(120, Math.min(180, Math.ceil(requiredWordsPerMinute * 1.05)));
}

function overlaySvg(shot, index) {
  const state = shot.state === "ready" ? (shot.captureBeats.length ? "CAPTURED FIXTURE" : "CAPTURED EVIDENCE") : "FINAL EVIDENCE PENDING";
  const stateFill = shot.state === "ready" ? "#15803d" : "#b45309";
  const lines = captionLines(shot.narration);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="24" y="22" width="266" height="30" rx="15" fill="#0d0d0d" fill-opacity="0.88"/>
  <text x="40" y="42" font-family="Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="1.2" fill="#ffffff">EDITORIAL ROUGH CUT · FIXTURE</text>
  <rect x="0" y="614" width="1280" height="106" fill="#ffffff" fill-opacity="0.94"/>
  <rect x="0" y="614" width="8" height="106" fill="#0d0d0d"/>
  <text x="42" y="650" font-family="Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1.4" fill="#5d5d5d">${String(index + 1).padStart(2, "0")} · ${escapeXml(shot.title.toUpperCase())}</text>
  <text x="42" y="682" font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="#0d0d0d">${escapeXml(lines[0] || "")}</text>
  <text x="42" y="710" font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="#0d0d0d">${escapeXml(lines[1] || "")}</text>
  <rect x="1018" y="644" width="220" height="30" rx="15" fill="${stateFill}"/>
  <text x="1128" y="664" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" letter-spacing="0.9" fill="#ffffff">${state}</text>
</svg>`;
}

async function main() {
  const plan = JSON.parse(await readFile(planPath, "utf8"));
  const captureManifestPath = resolve(repository, plan.captureManifest);
  const capture = JSON.parse(await readFile(captureManifestPath, "utf8"));
  const sourceVideo = resolve(dirname(captureManifestPath), capture.video.relativePath);
  const beatsById = new Map(capture.beats.map((beat) => [beat.id, beat]));

  await mkdir(outputRoot, { recursive: true });
  await rm(temporaryRoot, { recursive: true, force: true });
  await rm(reviewRoot, { recursive: true, force: true });
  await rm(outputVideo, { force: true });
  await rm(contactSheet, { force: true });
  await rm(manifestPath, { force: true });
  await mkdir(temporaryRoot, { recursive: true });
  await mkdir(reviewRoot, { recursive: true });

  const segments = [];
  const shotRecords = [];
  const reviewFrames = [];
  for (const [index, shot] of plan.shots.entries()) {
    const duration = shot.endSeconds - shot.startSeconds;
    const shotSpeechRate = guideVoiceRate(shot.narration, duration);
    const stem = `${String(index + 1).padStart(2, "0")}-${shot.id}`;
    const audioPath = resolve(temporaryRoot, `${stem}.aiff`);
    const basePath = resolve(temporaryRoot, `${stem}-base.mp4`);
    const overlayPath = resolve(temporaryRoot, `${stem}-overlay.png`);
    const overlaySource = resolve(temporaryRoot, `${stem}-overlay.svg`);
    const segmentPath = resolve(temporaryRoot, `${stem}.mp4`);
    await writeFile(overlaySource, overlaySvg(shot, index), "utf8");
    run("rsvg-convert", ["-w", String(width), "-h", String(height), overlaySource, "-o", overlayPath]);
    run("say", ["-v", voice, "-r", String(shotSpeechRate), "-o", audioPath, shot.narration]);

    const selectedBeats = shot.captureBeats.map((id) => beatsById.get(id)).filter(Boolean);
    const externalVideo = shot.state === "ready"
      ? shot.requiredEvidence.map((item) => resolve(repository, item.path)).find((path) => /\.(?:mov|mp4)$/i.test(path) && existsSync(path))
      : undefined;
    if (externalVideo) {
      const sourceDuration = Number(probe(externalVideo).format?.duration || 0);
      const playbackRate = sourceDuration > duration ? sourceDuration / duration : 1;
      const presentationDuration = Math.min(duration, sourceDuration / playbackRate);
      const holdDuration = Math.max(0, duration - presentationDuration);
      run("ffmpeg", ["-y", "-i", externalVideo, "-vf", `setpts=PTS/${playbackRate.toFixed(5)},scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=#f7f7f5,trim=duration=${presentationDuration.toFixed(3)},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${holdDuration.toFixed(3)},trim=duration=${duration},format=yuv420p`, "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "22", basePath]);
      shotRecords.push({ id: shot.id, state: shot.state, durationSeconds: duration, guideVoiceRate: shotSpeechRate, sourceBeats: [], externalVideo: shot.requiredEvidence.find((item) => resolve(repository, item.path) === externalVideo)?.path, sourceDurationSeconds: sourceDuration });
    } else if (selectedBeats.length) {
      const sourceStart = Math.max(0, selectedBeats[0].startMs / 1000 - 0.2);
      const sourceEnd = Math.min(capture.video.durationSeconds, selectedBeats.at(-1).endMs / 1000 - 0.3);
      const sourceDuration = Math.max(0.5, sourceEnd - sourceStart);
      const holdDuration = Math.max(0, duration - sourceDuration);
      run("ffmpeg", ["-y", "-ss", sourceStart.toFixed(3), "-i", sourceVideo, "-vf", `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=#f7f7f5,trim=duration=${sourceDuration.toFixed(3)},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${holdDuration.toFixed(3)},trim=duration=${duration},zoompan=z='min(zoom+0.00012,1.04)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=${width}x${height}:fps=30,format=yuv420p`, "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "22", basePath]);
      shotRecords.push({ id: shot.id, state: shot.state, durationSeconds: duration, guideVoiceRate: shotSpeechRate, sourceBeats: shot.captureBeats, sourceStartSeconds: Number(sourceStart.toFixed(3)), sourceEndSeconds: Number(sourceEnd.toFixed(3)) });
    } else {
      run("ffmpeg", ["-y", "-loop", "1", "-i", resolve(repository, "outputs/workshoplm-current-ui/01-map.png"), "-t", String(duration), "-vf", `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=#f7f7f5,fps=30,format=yuv420p`, "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "22", basePath]);
      shotRecords.push({ id: shot.id, state: shot.state, durationSeconds: duration, guideVoiceRate: shotSpeechRate, sourceBeats: [], stillFallback: "outputs/workshoplm-current-ui/01-map.png" });
    }

    const audioDuration = Number(probe(audioPath).format?.duration || 0);
    const targetSpeechDuration = Math.max(1, duration - 0.55);
    const tempo = Math.max(0.6, Math.min(2, audioDuration / targetSpeechDuration));
    const audioFilter = `${Math.abs(tempo - 1) > 0.01 ? `atempo=${tempo.toFixed(5)},` : ""}aresample=48000,volume=0.96,apad=whole_dur=${duration}`;
    run("ffmpeg", ["-y", "-i", basePath, "-loop", "1", "-i", overlayPath, "-i", audioPath, "-filter_complex", `[0:v][1:v]overlay=0:0:shortest=1[v];[2:a]${audioFilter}[a]`, "-map", "[v]", "-map", "[a]", "-t", String(duration), "-r", "30", "-c:v", "libx264", "-preset", "fast", "-crf", "22", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", segmentPath]);
    const reviewPath = resolve(reviewRoot, `${String(index + 1).padStart(2, "0")}.jpg`);
    run("ffmpeg", ["-y", "-ss", String(duration / 2), "-i", segmentPath, "-frames:v", "1", "-q:v", "2", reviewPath]);
    reviewFrames.push(reviewPath);
    segments.push(segmentPath);
  }

  const concatPath = resolve(temporaryRoot, "segments.txt");
  await writeFile(concatPath, `${segments.map((path) => `file '${path.replaceAll("'", "'\\''")}'`).join("\n")}\n`, "utf8");
  run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatPath, "-c", "copy", "-movflags", "+faststart", outputVideo]);
  run("ffmpeg", ["-y", "-framerate", "1", "-start_number", "1", "-i", resolve(reviewRoot, "%02d.jpg"), "-vf", "scale=384:-2,tile=5x2", "-frames:v", "1", "-q:v", "2", contactSheet]);

  const videoBytes = await readFile(outputVideo);
  const sheetBytes = await readFile(contactSheet);
  const inspected = probe(outputVideo);
  const manifest = {
    schemaVersion: 1,
    status: "editorial-rough-cut",
    disclosure: "Truthful fixture rough cut with a local macOS guide voice. This is not provider narration, final host footage, or the public submission video.",
    builtAt: new Date().toISOString(),
    plan: "submission/demo-film-plan.json",
    sourceCapture: plan.captureManifest,
    voice: { provider: "local macOS say", name: voice, ratePolicy: fixedSpeechRate ? `fixed ${fixedSpeechRate}` : "adaptive 120–180 words per minute", finalProviderNarration: false },
    video: { relativePath: "workshoplm-demo-rough-cut.mp4", sha256: sha256(videoBytes), durationSeconds: Number(inspected.format?.duration || 0), streams: inspected.streams || [] },
    contactSheet: { relativePath: "contact-sheet.jpg", sha256: sha256(sheetBytes) },
    reviewFrames: await Promise.all(reviewFrames.map(async (path) => ({ relativePath: `review/${path.split("/").at(-1)}`, sha256: sha256(await readFile(path)) }))),
    shots: shotRecords,
    limitations: [
      `${plan.shots.filter((shot) => shot.state === "blocked").length} shots remain visibly marked FINAL EVIDENCE PENDING.`,
      "The walkthrough uses the sanitized deterministic fixture and planned image panels.",
      "The guide voice is local macOS speech synthesis, not OpenAI narration.",
      "Founder brainstorm, Realtime, GPT-5.6, GPT Image 2, provider narration, final Output set, and public-export evidence remain gated elsewhere."
    ]
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await rm(temporaryRoot, { recursive: true, force: true });
  process.stdout.write(`${JSON.stringify({ status: manifest.status, video: outputVideo, durationSeconds: manifest.video.durationSeconds, sha256: manifest.video.sha256, contactSheet }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
