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
  filmPlan: "submission/demo-film-plan.json",
  uiGallery: "outputs/workshoplm-current-ui/manifest.json",
};

const [devpost, script, ledger, audit, checklist, roughReadme, provider, narration, roughCut, filmPlan, uiGallery] = await Promise.all([
  readText(paths.devpost),
  readText(paths.script),
  readText(paths.ledger),
  readText(paths.audit),
  readText(paths.checklist),
  readText(paths.roughReadme),
  readJson(paths.provider),
  readJson(paths.narration),
  readJson(paths.roughCut),
  readJson(paths.filmPlan),
  readJson(paths.uiGallery),
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
assert(devpost.includes("six GPT Image 2 visuals") && devpost.includes("five Cedar Storyboard clips"), "Devpost copy does not include verified provider media.");
assert(script.includes("Target: 2:20") && script.includes("**No.** Dated recording and transcript are missing"), "Demo script is not reconciled to the current 2:20 founder-gated edit.");
assert(roughReadme.includes("Replace shot 10 only after the final non-partial submission Output set exists.") && roughReadme.includes("`/feedback` remains a separate Devpost submission requirement, not a film-content gate."), "Rough-cut handoff incorrectly treats /feedback as film evidence.");
assert(ledger.includes("Last reconciled: 2026-07-16 CT") && audit.includes("Audit date: 2026-07-16 CT"), "Submission truth files are not dated to the current reconciliation.");

assert(provider.sourceMode === "authorized-sample" && provider.founderSource === false, "Provider evidence no longer records the authorized-sample boundary.");
assert(provider.groundedMap?.model === "gpt-5.6-terra" && provider.groundedMap.requestId, "Verified Terra Map provenance is missing.");
assert(provider.imageBatch?.model === "gpt-image-2" && provider.imageBatch.panelCount === 6 && provider.imageBatch.panels.length === 6, "Verified six-panel GPT Image 2 evidence is missing.");
assert(provider.narration?.model === "gpt-4o-mini-tts" && provider.narration.voice === "cedar" && provider.narration.panelCount === 5, "Verified product Cedar narration is missing.");
assert(provider.video?.streams?.some((stream) => stream.codec_name === "h264") && provider.video.streams.some((stream) => stream.codec_name === "aac"), "Verified provider-backed Video streams are missing.");

assert(narration.model === "gpt-4o-mini-tts" && narration.voice === "cedar" && narration.requestCount === 10 && narration.shots.length === 10, "Editorial Cedar narration manifest is incomplete.");
assert(roughCut.voice?.provider === "OpenAI" && roughCut.voice.name === "cedar" && roughCut.voice.finalProviderNarration === true, "Rough cut has regressed from verified Cedar narration.");
assert(Math.round(roughCut.video?.durationSeconds) === 140 && roughCut.video.streams.some((stream) => stream.codec_name === "h264") && roughCut.video.streams.some((stream) => stream.codec_name === "aac"), "Rough cut is not the verified 2:20 H.264/AAC edit.");
assert(filmPlan.shots.at(-1)?.endSeconds === 140 && filmPlan.shots.filter((shot) => shot.state === "ready").length === 8 && filmPlan.shots.filter((shot) => shot.state === "blocked").length === 2, "Film plan is not at the eight-ready/two-blocked truth state.");

assert(uiGallery.status === "current-workbench-gallery" && uiGallery.screenshots?.length === 16, "Current UI gallery is not the canonical sixteen-screen workbench journey.");
assert(uiGallery.screenshots.some((shot) => shot.name === "08-current-outputs.png" && shot.source === "artifacts/ui-review/outputs-latest-only-desktop-2026-07-16.png"), "Current UI gallery is missing the inspected provider-backed Outputs screen.");
for (const shot of uiGallery.screenshots) {
  const bytes = await readFile(resolve(repository, "outputs/workshoplm-current-ui", shot.name));
  assert(createHash("sha256").update(bytes).digest("hex") === shot.sha256, `Current UI gallery hash mismatch: ${shot.name}`);
}
for (const retired of ["01-map.png", "06-workshop-details.png", "20-real-output-gallery.png"]) {
  assert(!existsSync(resolve(repository, "outputs/workshoplm-current-ui", retired)), `Retired UI evidence is still present: ${retired}`);
}
const unresolvedSlots = [...devpost.matchAll(/`\[(LIVE|FALLBACK):/g)].length;
assert(unresolvedSlots === 4, `Expected four founder/final-package slots, found ${unresolvedSlots}.`);

process.stdout.write(`${JSON.stringify({
  status: "passed",
  providerEvidence: { model: provider.groundedMap.model, images: provider.imageBatch.panelCount, productNarration: provider.narration.panelCount },
  editorialFilm: { seconds: roughCut.video.durationSeconds, voice: roughCut.voice.name, readyShots: 8, blockedShots: 2 },
  uiGallery: { screenshots: uiGallery.screenshots.length, providerBackedOutputs: "08-current-outputs.png" },
  unresolvedFounderSlots: unresolvedSlots,
}, null, 2)}\n`);
