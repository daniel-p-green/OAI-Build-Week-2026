import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
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
  roughCut: "outputs/demo-film-rough-cut/manifest.json",
  filmPlan: "submission/demo-film-plan.json",
};

const [devpost, script, ledger, audit, checklist, provider, narration, roughCut, filmPlan] = await Promise.all([
  readText(paths.devpost),
  readText(paths.script),
  readText(paths.ledger),
  readText(paths.audit),
  readText(paths.checklist),
  readJson(paths.provider),
  readJson(paths.narration),
  readJson(paths.roughCut),
  readJson(paths.filmPlan),
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

const unresolvedSlots = [...devpost.matchAll(/`\[(LIVE|FALLBACK):/g)].length;
assert(unresolvedSlots === 4, `Expected four founder/final-package slots, found ${unresolvedSlots}.`);

process.stdout.write(`${JSON.stringify({
  status: "passed",
  providerEvidence: { model: provider.groundedMap.model, images: provider.imageBatch.panelCount, productNarration: provider.narration.panelCount },
  editorialFilm: { seconds: roughCut.video.durationSeconds, voice: roughCut.voice.name, readyShots: 8, blockedShots: 2 },
  unresolvedFounderSlots: unresolvedSlots,
}, null, 2)}\n`);
