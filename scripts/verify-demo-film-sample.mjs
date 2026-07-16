import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const outputRoot = resolve(repository, "outputs/demo-film-sample");
const manifestPath = resolve(outputRoot, "manifest.json");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function matches(path, expectedHash) {
  return sha256(await readFile(path)) === expectedHash;
}

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  assert(manifest.schemaVersion === 1, "Unsupported sample-film manifest schema.");
  assert(manifest.status === "sample-editorial-cut", "The sample film is not explicitly labeled as an editorial cut.");
  assert(/authorized sample/i.test(manifest.disclosure) && /not founder footage or the public submission video/i.test(manifest.disclosure), "The sample-film disclosure is incomplete.");
  assert(Array.isArray(manifest.limitations) && manifest.limitations.length >= 4, "The sample-film limitations are missing.");
  assert(manifest.voice?.provider === "OpenAI" && manifest.voice?.model === "gpt-4o-mini-tts" && manifest.voice?.name === "cedar" && manifest.voice?.finalProviderNarration === true, "The sample film is not bound to the verified Cedar narration set.");
  assert(manifest.shots?.length === 10, "The sample film must contain all ten planned shots.");
  assert(manifest.compositor?.engine === "hyperframes" && manifest.compositor.mode === "local" && manifest.compositor.version === "0.7.60", "The sample film must be rendered by the pinned local HyperFrames compositor.");
  assert(manifest.compositor.jitterProneZoompan === false && manifest.compositor.spatialTransforms === false && manifest.compositor.transition === "design-accent-dip", "The sample film has not removed jitter-prone spatial motion.");
  assert(await matches(resolve(repository, manifest.compositor.design.source), manifest.compositor.design.sha256), "The DESIGN.md used by the sample film no longer matches its manifest hash.");
  assert(await matches(resolve(repository, manifest.compositor.frame.source), manifest.compositor.frame.sha256), "The FRAME.md used by the sample film no longer matches its manifest hash.");
  assert(manifest.shots.filter((shot) => shot.state === "blocked").length === 2, "The sample film must retain the two final-evidence blocks.");
  const opening = manifest.shots.find((shot) => shot.id === "promise");
  const renderedProduct = manifest.shots.find((shot) => shot.id === "render-and-trace");
  assert(opening?.openingProof?.type === "finished-work-to-map" && opening.openingProof.durationSeconds >= 3 && opening.openingProof.durationSeconds <= 6 && opening.openingProof.transition === "design-accent-dip", "The sample film must open on verified finished work before revealing the Map.");
  assert(opening.motion?.transition === "opening-proof-dip" && opening.motion.spatialTransform === false && await matches(resolve(repository, opening.openingProof.relativePath), opening.openingProof.sha256), "The sample opening proof no longer matches its package asset or stable HyperFrames transition.");
  assert(renderedProduct?.fixtureVideo === true && renderedProduct.externalVideo === ".workshoplm/acceptance/generated/videos/workshoplm-demo-v1.mp4" && renderedProduct.sourcePlaybackRate === 1 && renderedProduct.motion?.spatialTransform === false, "The sample must show the current stable fixture Video at native speed without claiming it as founder/provider state.");
  assert(manifest.openingProofFrame?.atSeconds > 0 && manifest.openingProofFrame.atSeconds < opening.openingProof.durationSeconds && await matches(resolve(outputRoot, manifest.openingProofFrame.relativePath), manifest.openingProofFrame.sha256), "The rendered sample film is missing its hash-verified opening proof frame.");
  const doorway = manifest.shots.find((shot) => shot.id === "codex-doorway");
  assert(doorway?.editorialCue === "codex-to-workshoplm", "The clean film must make the real Codex-to-Workshop doorway visually explicit.");
  const metaReveal = manifest.shots.find((shot) => shot.id === "meta-reveal");
  assert(metaReveal?.generatedMetaReveal === true && metaReveal.state === "blocked", "The sample meta-reveal must be generated without pretending to be final.");

  const videoPath = resolve(outputRoot, manifest.video.relativePath);
  assert(await matches(videoPath, manifest.video.sha256), "The sample video no longer matches its manifest hash.");
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_type,codec_name,width,height,sample_rate", "-of", "json", videoPath], { encoding: "utf8" }));
  const durationSeconds = Number(probe.format?.duration ?? 0);
  assert(durationSeconds > 0 && durationSeconds < 180 && Math.abs(durationSeconds - manifest.video.durationSeconds) < 0.05, "The sample film duration is invalid.");
  assert(probe.streams?.some((stream) => stream.codec_type === "video" && stream.codec_name === "h264" && stream.width === 1280 && stream.height === 720), "The sample film lacks its expected H.264 1280×720 stream.");
  assert(probe.streams?.some((stream) => stream.codec_type === "audio" && stream.codec_name === "aac" && stream.sample_rate === "48000"), "The sample film lacks its expected AAC 48 kHz stream.");

  assert(await matches(resolve(outputRoot, manifest.contactSheet.relativePath), manifest.contactSheet.sha256), "The sample contact sheet no longer matches its manifest hash.");
  assert(manifest.reviewFrames?.length === 10, "The sample film must retain one review frame per shot.");
  for (const frame of manifest.reviewFrames) assert(await matches(resolve(outputRoot, frame.relativePath), frame.sha256), `Review frame ${frame.relativePath} no longer matches its manifest hash.`);

  const trace = manifest.metaRevealEvidence;
  assert(trace?.mode === "authorized-sample" && trace.transcript?.relativePath === null && trace.transcript?.byteCount > 100, "The sample transcript boundary is missing.");
  assert(trace.transcript.display?.mode === "complete" && trace.transcript.display.truncated === false && trace.transcript.display.lineCount > 0, "The sample meta reveal must show the complete authorized transcript without truncation.");
  assert(await matches(resolve(repository, trace.submissionManifest.relativePath), trace.submissionManifest.sha256), "The sample submission manifest no longer matches the film evidence.");
  assert(await matches(resolve(repository, trace.buildTrace.relativePath), trace.buildTrace.sha256), "The sample build trace no longer matches the film evidence.");
  assert(dirname(resolve(repository, trace.buildTrace.relativePath)) === dirname(resolve(repository, trace.submissionManifest.relativePath)), "The sample manifest and build trace must come from the same Output set.");

  process.stdout.write(`${JSON.stringify({ status: "verified-sample-editorial-cut", durationSeconds, videoSha256: manifest.video.sha256, compositor: manifest.compositor, reviewFrames: manifest.reviewFrames.length, blockedFinalEvidenceShots: 2, narration: `${manifest.voice.model}/${manifest.voice.name}`, metaReveal: trace }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
