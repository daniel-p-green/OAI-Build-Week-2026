import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

type FileEvidence = { relativePath: string; sha256: string; byteCount: number };
type ProviderRef = { model: string; requestId: string; generatedAt: string };
type LiveState = {
  id: string;
  aiRuns: Array<{ operation: string; model: string; requestId: string; outputSha256: string; createdAt: string }>;
  imageBatch?: { id: string; panels: Array<{ id: string; state: string; relativePath?: string; sha256?: string; provenance?: ProviderRef & { size: string; quality: string } }> };
  narration?: { storyboardVersion: number; disclosure: string; panels: Array<{ panelId: string; relativePath: string; sha256: string; model: string; voice: string; requestId: string; generatedAt: string }>; failures: unknown[]; stale: boolean };
  videos: Array<{ id: string; version: number; stale: boolean; relativePath: string; provenancePath: string; sha256: string; byteCount: number }>;
};

const repository = resolve(import.meta.dirname, "..");
const liveRoot = resolve(repository, ".workshoplm/live-operator");
const liveEvidenceRoot = resolve(repository, "artifacts/live");
const filmInputRoot = resolve(repository, "outputs/demo-film-inputs");

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function fileEvidence(path: string, relativePath: string): Promise<FileEvidence> {
  const bytes = await readFile(path);
  return { relativePath, sha256: createHash("sha256").update(bytes).digest("hex"), byteCount: bytes.byteLength };
}

async function verifyFile(relativePath: string, expectedSha256: string): Promise<FileEvidence> {
  const evidence = await fileEvidence(resolve(liveRoot, relativePath), relativePath);
  assert(evidence.sha256 === expectedSha256, `${relativePath} no longer matches its persisted hash.`);
  return evidence;
}

function readLiveState(): LiveState {
  const database = resolve(liveRoot, "data/workshoplm.sqlite");
  const raw = execFileSync("sqlite3", [database, "select state_json from workshop_state where workshop_id = 'workshop-build-week';"], { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }).trim();
  assert(raw, "The live operator Workshop state is missing.");
  return JSON.parse(raw) as LiveState;
}

async function main(): Promise<void> {
  const state = readLiveState();
  const graphRun = state.aiRuns.find((run) => run.operation === "grounded_graph" && run.model === "gpt-5.6-terra");
  assert(graphRun?.requestId, "The live Workshop has no verified Terra grounded-Map run.");

  const imagePanels = state.imageBatch?.panels ?? [];
  assert(imagePanels.length === 6, `Expected six live image panels, received ${imagePanels.length}.`);
  const images = await Promise.all(imagePanels.map(async (panel) => {
    assert(panel.state === "generated" && panel.relativePath && panel.sha256 && panel.provenance?.model === "gpt-image-2" && panel.provenance.requestId, `Image ${panel.id} lacks complete GPT Image 2 provenance.`);
    return { id: panel.id, ...await verifyFile(panel.relativePath, panel.sha256), provider: panel.provenance };
  }));

  const narration = state.narration;
  assert(narration && narration.panels.length === 5 && narration.failures.length === 0 && !narration.stale, "The live Cedar narration set is incomplete or stale.");
  const narrationPanels = await Promise.all(narration.panels.map(async (panel) => {
    assert(panel.model === "gpt-4o-mini-tts" && panel.voice === "cedar" && panel.requestId, `Narration ${panel.panelId} lacks current Cedar provenance.`);
    return { panelId: panel.panelId, ...await verifyFile(panel.relativePath, panel.sha256), model: panel.model, voice: panel.voice, requestId: panel.requestId, generatedAt: panel.generatedAt };
  }));

  const video = state.videos.filter((item) => !item.stale).sort((left, right) => right.version - left.version)[0];
  assert(video, "The live Workshop has no current Video.");
  const videoSource = resolve(liveRoot, video.relativePath);
  const videoEvidence = await verifyFile(video.relativePath, video.sha256);
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_type,codec_name", "-of", "json", videoSource], { encoding: "utf8" })) as { format?: { duration?: string }; streams?: Array<{ codec_type?: string; codec_name?: string }> };
  assert(probe.streams?.some((stream) => stream.codec_type === "video"), "The provider-narrated Video has no video stream.");
  assert(probe.streams?.some((stream) => stream.codec_type === "audio"), "The provider-narrated Video has no audio stream.");

  const realtime = JSON.parse(await readFile(resolve(repository, "artifacts/live-review/realtime-grounded-conversation.json"), "utf8")) as { verifiedAt: string; transport: string; model: string; transcriptionModel: string; transcript: string; assistant: string; successfulToolCalls: unknown[] };
  assert(realtime.transport === "webrtc" && realtime.model === "gpt-realtime-2.1" && realtime.successfulToolCalls.length > 0, "The inspected grounded Realtime proof is missing.");

  await mkdir(liveEvidenceRoot, { recursive: true });
  await mkdir(filmInputRoot, { recursive: true });
  const narratedVideoPath = resolve(filmInputRoot, "provider-narrated-video.mp4");
  await copyFile(videoSource, narratedVideoPath);
  const narratedVideo = await fileEvidence(narratedVideoPath, "outputs/demo-film-inputs/provider-narrated-video.mp4");
  assert(narratedVideo.sha256 === video.sha256, "The film-input Video copy changed bytes.");

  const gallerySource = resolve(repository, "artifacts/ui-review/outputs-latest-only-desktop-2026-07-16.png");
  assert((await stat(gallerySource)).size > 0, "The inspected live Outputs screenshot is missing.");
  const galleryPath = resolve(filmInputRoot, "provider-image-gallery.mov");
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-loop", "1", "-i", gallerySource, "-t", "6", "-vf", "scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=#f7f7f5,zoompan=z='min(zoom+0.00012,1.025)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=1920x1080:fps=30,format=yuv420p", "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "20", "-movflags", "+faststart", galleryPath]);
  const gallery = await fileEvidence(galleryPath, "outputs/demo-film-inputs/provider-image-gallery.mov");

  const realtimeEvidence = {
    schemaVersion: 1,
    verifiedAt: realtime.verifiedAt,
    transport: realtime.transport,
    model: realtime.model,
    transcriptionModel: realtime.transcriptionModel,
    captureMode: "controlled-synthetic-microphone-audio",
    founderRecording: false,
    transcript: realtime.transcript,
    assistant: realtime.assistant,
    successfulToolCallCount: realtime.successfulToolCalls.length,
    limitation: "This verifies the provider/WebRTC product path; it is not the founder's physical-microphone demo recording.",
  };
  await writeFile(resolve(liveEvidenceRoot, "realtime-turn.json"), `${JSON.stringify(realtimeEvidence, null, 2)}\n`, "utf8");

  const providerRun = {
    schemaVersion: 1,
    verifiedAt: new Date().toISOString(),
    workshopId: state.id,
    sourceMode: "authorized-sample",
    founderSource: false,
    groundedMap: { model: graphRun.model, requestId: graphRun.requestId, outputSha256: graphRun.outputSha256, createdAt: graphRun.createdAt },
    imageBatch: { id: state.imageBatch?.id, model: "gpt-image-2", panelCount: images.length, panels: images },
    narration: { model: "gpt-4o-mini-tts", voice: "cedar", disclosure: narration.disclosure, panelCount: narrationPanels.length, panels: narrationPanels },
    video: { id: video.id, version: video.version, ...videoEvidence, copiedFilmInput: narratedVideo, durationSeconds: Number(probe.format?.duration ?? 0), streams: probe.streams },
    filmInputs: { imageGallery: gallery, narratedVideo },
    limitations: ["The run uses the explicitly authorized sample Source and must be replaced by the founder recording before the final meta-demo is claimed."],
  };
  await writeFile(resolve(liveEvidenceRoot, "provider-run.json"), `${JSON.stringify(providerRun, null, 2)}\n`, "utf8");

  process.stdout.write(`${JSON.stringify({ status: "ready-for-founder-capture", groundedMap: providerRun.groundedMap, imagePanels: images.length, narrationPanels: narrationPanels.length, video: narratedVideo, gallery, remainingLimitation: providerRun.limitations[0] }, null, 2)}\n`);
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
