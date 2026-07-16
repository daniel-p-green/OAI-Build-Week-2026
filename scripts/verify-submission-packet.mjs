import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const readText = (path) => readFile(resolve(repository, path), "utf8");
const readJson = async (path) => JSON.parse(await readText(path));
const assert = (condition, message) => { if (!condition) throw new Error(message); };

const paths = {
  devpost: "submission/DEVPOST-DRAFT.md",
  script: "submission/DEMO-SCRIPT.md",
  ledger: "submission/CLAIM-LEDGER.md",
  audit: "submission/EVIDENCE-AUDIT.md",
  checklist: "research/hackathon/SUBMISSION-CHECKLIST.md",
  provider: "artifacts/live/provider-run.json",
  narration: "outputs/demo-film-narration/manifest.json",
  roughReadme: "outputs/demo-film-rough-cut/README.md",
  roughCut: "outputs/demo-film-rough-cut/manifest.json",
  sampleReadme: "outputs/demo-film-sample/README.md",
  sampleCut: "outputs/demo-film-sample/manifest.json",
  filmPlan: "submission/demo-film-plan.json",
  thumbnail: "outputs/demo-film-plan/thumbnail-preview.png",
  thumbnailManifest: "outputs/demo-film-plan/thumbnail-preview.json",
  uiGallery: "outputs/workshoplm-current-ui/manifest.json",
  judgeImages: "fixtures/judge-provider-images/manifest.json",
  judgeAudio: "artifacts/live-review/audio-overview.json",
  judgeAudioFile: "artifacts/live-review/audio-overview.wav",
  acceptanceManifest: ".workshoplm/acceptance/generated/submission-output-set-v1/manifest.json",
  package: "package.json",
};

const [devpost, script, ledger, audit, checklist, roughReadme, sampleReadme, provider, narration, roughCut, sampleCut, filmPlan, thumbnailManifest, uiGallery, judgeImages, judgeAudio, acceptanceManifest, packageJson] = await Promise.all([
  readText(paths.devpost),
  readText(paths.script),
  readText(paths.ledger),
  readText(paths.audit),
  readText(paths.checklist),
  readText(paths.roughReadme),
  readText(paths.sampleReadme),
  readJson(paths.provider),
  readJson(paths.narration),
  readJson(paths.roughCut),
  readJson(paths.sampleCut),
  readJson(paths.filmPlan),
  readJson(paths.thumbnailManifest),
  readJson(paths.uiGallery),
  readJson(paths.judgeImages),
  readJson(paths.judgeAudio),
  readJson(paths.acceptanceManifest),
  readJson(paths.package),
]);

assert(!existsSync(resolve(repository, "submission/DEVPOST-DRAFT 2.md")), "A redundant stale Devpost draft still exists.");

const forbidden = [
  "still-gated claim that WorkshopLM itself completed a paid GPT-5.6 API call",
  "Realtime capture boundary is implemented and tested but not yet live-verified",
  "no authorized live generation/evaluation",
  "no provider TTS artifact/provenance",
  "local macOS guide voice",
  "four evidence-pending shots",
  "2:42 review cut",
  "five-slide AI Collective organizer brief",
];
for (const phrase of forbidden) {
  for (const [name, text] of Object.entries({ devpost, script, ledger, audit, checklist })) {
    assert(!text.includes(phrase), `${name} contains stale submission wording: ${phrase}`);
  }
}

assert(devpost.includes("**GPT-5.6 runs the product.**"), "Devpost copy does not include the verified GPT-5.6 runtime result.");
assert(devpost.includes("six GPT Image 2 visuals") && devpost.includes("one grounded Cedar Audio Overview") && devpost.includes("five Cedar Storyboard clips"), "Devpost copy does not include verified provider media.");
assert(script.includes("Target: 2:20") && script.includes("**No.** Dated recording and transcript are missing"), "Demo script is not reconciled to the current 2:20 founder-gated edit.");
assert(roughReadme.includes("Replace shot 10 only after the final non-partial submission Output set exists.") && roughReadme.includes("`/feedback` remains a separate Devpost submission requirement, not a film-content gate."), "Rough-cut handoff incorrectly treats /feedback as film evidence.");
assert(sampleReadme.includes("It is intentionally not founder footage or the public submission video.") && sampleReadme.includes("pnpm demo:film:verify-sample"), "Sample-film handoff does not preserve its truth boundary or verifier.");
assert(packageJson.scripts?.["judge:start"] === "pnpm demo:e2e && pnpm demo:serve", "The one-command judge fixture path is missing or no longer serves the acceptance root.");
assert(devpost.includes("pnpm install --frozen-lockfile") && devpost.includes("pnpm judge:start") && !devpost.includes("pnpm demo:e2e && pnpm dev"), "Devpost judge instructions do not use the verified one-command fixture path.");
assert(ledger.includes("Last reconciled: 2026-07-16 CT") && audit.includes("Audit date: 2026-07-16 CT"), "Submission truth files are not dated to the current reconciliation.");

assert(provider.sourceMode === "authorized-sample" && provider.founderSource === false, "Provider evidence no longer records the authorized-sample boundary.");
assert(provider.groundedMap?.model === "gpt-5.6-terra" && provider.groundedMap.requestId, "Verified Terra Map provenance is missing.");
assert(provider.imageBatch?.model === "gpt-image-2" && provider.imageBatch.panelCount === 6 && provider.imageBatch.panels.length === 6, "Verified six-panel GPT Image 2 evidence is missing.");
assert(provider.narration?.model === "gpt-4o-mini-tts" && provider.narration.voice === "cedar" && provider.narration.panelCount === 5, "Verified product Cedar narration is missing.");
assert(provider.video?.streams?.some((stream) => stream.codec_name === "h264") && provider.video.streams.some((stream) => stream.codec_name === "aac"), "Verified provider-backed Video streams are missing.");

assert(narration.model === "gpt-4o-mini-tts" && narration.voice === "cedar" && narration.requestCount === 10 && narration.shots.length === 10, "Editorial Cedar narration manifest is incomplete.");
assert(roughCut.voice?.provider === "OpenAI" && roughCut.voice.name === "cedar" && roughCut.voice.finalProviderNarration === true, "Rough cut has regressed from verified Cedar narration.");
assert(roughCut.limitations?.some((item) => item.includes("six hash-bound GPT Image 2 replay files")) && !(roughCut.limitations ?? []).some((item) => item.includes("planned image panels")), "Rough cut does not disclose the provider-backed judge-image replay accurately.");
assert(roughCut.shots?.length === 10 && roughCut.shots.every((shot) => shot.motion?.type === "editorial-push-in" && shot.motion?.maxScale === 1.06 && shot.motion?.ratePerFrame === 0.0001), "The editorial film no longer applies the verified restrained push-in and drift to every shot.");
assert(Math.round(roughCut.video?.durationSeconds) === 140 && roughCut.video.streams.some((stream) => stream.codec_name === "h264") && roughCut.video.streams.some((stream) => stream.codec_name === "aac"), "Rough cut is not the verified 2:20 H.264/AAC edit.");
assert(sampleCut.status === "sample-editorial-cut" && /authorized sample/i.test(sampleCut.disclosure) && /not founder footage or the public submission video/i.test(sampleCut.disclosure), "The clean review film does not preserve its authorized-sample boundary.");
assert(sampleCut.voice?.provider === "OpenAI" && sampleCut.voice.name === "cedar" && sampleCut.voice.finalProviderNarration === true, "The clean review film has regressed from verified Cedar narration.");
assert(sampleCut.shots?.length === 10 && sampleCut.shots.filter((shot) => shot.state === "blocked").length === 2, "The clean review film no longer retains ten shots and two final-evidence blocks.");
assert(sampleCut.shots.find((shot) => shot.id === "codex-doorway")?.editorialCue === "codex-to-workshoplm", "The clean review film no longer makes the Codex doorway explicit.");
assert(sampleCut.shots.find((shot) => shot.id === "meta-reveal")?.generatedMetaReveal === true, "The clean review film no longer contains its generated trace reveal.");
assert(sampleCut.metaRevealEvidence?.mode === "authorized-sample", "The clean review film no longer identifies its sample transcript boundary.");
const sampleRoot = resolve(repository, "outputs/demo-film-sample");
const sampleVideoBytes = await readFile(resolve(sampleRoot, sampleCut.video.relativePath));
assert(createHash("sha256").update(sampleVideoBytes).digest("hex") === sampleCut.video.sha256, "The clean review film no longer matches its manifest hash.");
assert(Math.round(sampleCut.video?.durationSeconds) === 140 && sampleCut.video.streams.some((stream) => stream.codec_name === "h264") && sampleCut.video.streams.some((stream) => stream.codec_name === "aac"), "The clean review film is not the verified 2:20 H.264/AAC edit.");
assert(sampleCut.reviewFrames?.length === 10, "The clean review film no longer has one inspection frame per shot.");
for (const frame of sampleCut.reviewFrames) {
  const bytes = await readFile(resolve(sampleRoot, frame.relativePath));
  assert(createHash("sha256").update(bytes).digest("hex") === frame.sha256, `Clean review frame hash mismatch: ${frame.relativePath}`);
}
for (const evidence of [sampleCut.metaRevealEvidence.submissionManifest, sampleCut.metaRevealEvidence.buildTrace]) {
  const bytes = await readFile(resolve(repository, evidence.relativePath));
  assert(createHash("sha256").update(bytes).digest("hex") === evidence.sha256, `Clean review trace hash mismatch: ${evidence.relativePath}`);
}
assert(filmPlan.shots.at(-1)?.endSeconds === 140 && filmPlan.shots.filter((shot) => shot.state === "ready").length === 8 && filmPlan.shots.filter((shot) => shot.state === "blocked").length === 2, "Film plan is not at the eight-ready/two-blocked truth state.");

const thumbnailBytes = await readFile(resolve(repository, paths.thumbnail));
const thumbnailProofBytes = await readFile(resolve(repository, thumbnailManifest.productProof));
assert(thumbnailBytes.subarray(1, 4).toString() === "PNG", "Judge thumbnail is not a PNG.");
assert(thumbnailBytes.readUInt32BE(16) === 1280 && thumbnailBytes.readUInt32BE(20) === 720, "Judge thumbnail is not exactly 1280x720.");
assert(thumbnailManifest.composition === "workshoplm-product-proof-v1" && thumbnailManifest.thumbnailText === filmPlan.thumbnailText, "Judge thumbnail no longer follows the locked film plan.");
assert(thumbnailManifest.thumbnailSha256 === createHash("sha256").update(thumbnailBytes).digest("hex"), "Judge thumbnail hash does not match its manifest.");
assert(thumbnailManifest.productProofSha256 === createHash("sha256").update(thumbnailProofBytes).digest("hex"), "Judge thumbnail product proof does not match its manifest.");
assert(!/google|notebooklm/i.test(thumbnailManifest.thumbnailText), "Judge thumbnail copy contains a third-party product mark.");

assert(uiGallery.status === "current-workbench-gallery" && uiGallery.screenshots?.length === 16, "Current UI gallery is not the canonical sixteen-screen workbench journey.");
assert(uiGallery.screenshots.some((shot) => shot.name === "08-current-outputs.png" && shot.source === "artifacts/ui-review/outputs-latest-only-desktop-2026-07-16.png"), "Current UI gallery is missing the inspected provider-backed Outputs screen.");
for (const shot of uiGallery.screenshots) {
  const bytes = await readFile(resolve(repository, "outputs/workshoplm-current-ui", shot.name));
  assert(createHash("sha256").update(bytes).digest("hex") === shot.sha256, `Current UI gallery hash mismatch: ${shot.name}`);
}
for (const retired of ["01-map.png", "06-workshop-details.png", "20-real-output-gallery.png"]) {
  assert(!existsSync(resolve(repository, "outputs/workshoplm-current-ui", retired)), `Retired UI evidence is still present: ${retired}`);
}
assert(judgeImages.model === "gpt-image-2" && judgeImages.requestCount === 6 && judgeImages.panels?.length === 6, "Judge fixture does not contain the six-panel GPT Image 2 replay manifest.");
for (const panel of judgeImages.panels) {
  const bytes = await readFile(resolve(repository, "fixtures/judge-provider-images", panel.file));
  assert(createHash("sha256").update(bytes).digest("hex") === panel.sha256, `Judge image fixture hash mismatch: ${panel.id}`);
}
const judgeAudioBytes = await readFile(resolve(repository, paths.judgeAudioFile));
assert(judgeAudio.audio?.model === "gpt-4o-mini-tts" && judgeAudio.audio.voice === "cedar" && judgeAudio.audio.durationSeconds > 0 && judgeAudio.audio.sha256 === judgeAudio.downloadedSha256, "Judge Audio Overview provider provenance is incomplete.");
assert(createHash("sha256").update(judgeAudioBytes).digest("hex") === judgeAudio.audio.sha256 && judgeAudioBytes.length === judgeAudio.audio.byteCount, "Judge Audio Overview fixture hash mismatch.");
const packagedAudio = acceptanceManifest.assets?.find((asset) => asset.type === "audio_overview" && asset.provenance === "narration");
assert(packagedAudio?.relativePath === "audio-overview.wav" && packagedAudio.sha256 === judgeAudio.audio.sha256 && packagedAudio.byteCount === judgeAudio.audio.byteCount, "Acceptance package does not contain the verified Cedar Audio Overview.");
assert(!(acceptanceManifest.limitations ?? []).some((item) => item.includes("no provider-generated speech file")), "Acceptance package still claims the Cedar Audio Overview is missing.");
const unresolvedSlots = [...devpost.matchAll(/`\[(LIVE|FALLBACK):/g)].length;
assert(unresolvedSlots === 4, `Expected four founder/final-package slots, found ${unresolvedSlots}.`);

process.stdout.write(`${JSON.stringify({
  status: "passed",
  providerEvidence: { model: provider.groundedMap.model, images: provider.imageBatch.panelCount, productNarration: provider.narration.panelCount },
  editorialFilm: { status: sampleCut.status, seconds: sampleCut.video.durationSeconds, voice: sampleCut.voice.name, readyShots: 8, blockedShots: 2, generatedMetaReveal: true, codexDoorway: sampleCut.shots.find((shot) => shot.id === "codex-doorway").editorialCue },
  diagnosticRoughCut: { status: roughCut.status, seconds: roughCut.video.durationSeconds },
  thumbnail: { composition: thumbnailManifest.composition, dimensions: thumbnailManifest.dimensions, sha256: thumbnailManifest.thumbnailSha256 },
  uiGallery: { screenshots: uiGallery.screenshots.length, providerBackedOutputs: "08-current-outputs.png" },
  judgeFixture: { providerBackedImages: judgeImages.panels.length, providerBackedAudioOverview: { model: judgeAudio.audio.model, voice: judgeAudio.audio.voice, seconds: judgeAudio.audio.durationSeconds }, paidReplayCalls: 0 },
  unresolvedFounderSlots: unresolvedSlots,
}, null, 2)}\n`);
