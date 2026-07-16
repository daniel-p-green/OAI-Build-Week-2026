import { mkdir, readFile, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { deriveGates, assertEligible, Storyboard } from "../packages/domain/src/index.ts";
import { normalizeSource } from "../spikes/b-grounding/src/normalize.ts";
import { LocalSearchIndex } from "../spikes/b-grounding/src/search.ts";
import { allChunks, answerFromEvidence } from "../spikes/b-grounding/src/ground.ts";
import { renderDeck, renderInfographic } from "../packages/production/src/render.ts";
import { openLocalDatabase } from "../apps/worker/src/db/client.ts";
import { migrate } from "../apps/worker/src/db/migrate.ts";
import { executeOne } from "../apps/worker/src/executor.ts";
import { applyWorkshopAction, createImageBatch, dismissWorkshopOrientation, generateAssetPlan, generateAudioOverview, generateOutput, generateStoryboard, ingestSource, lockManualStyle, readWorkshopState, updateWorkshopOnboarding } from "../apps/worker/src/workshop-service.ts";

async function main() {
const root = resolve(process.cwd(), ".workshoplm", "acceptance");
await rm(root, { recursive: true, force: true });
await mkdir(root, { recursive: true });

const source = normalizeSource({ name: "raw-brainstorm.txt", content: "[12:41] Judges need to see raw thinking become a cited Map, approved brief, and finished work.\n[12:43] Every claim needs a source locator." });
const index = new LocalSearchIndex(allChunks([source]));
const answer = answerFromEvidence("raw thinking cited map approved brief finished work", index);
if (answer.status !== "verified" || answer.citations.length === 0) throw new Error("grounding did not return a cited answer");

const gates = deriveGates({ transcriptSegments: 2, boardApprovedCurrent: true, briefCurrent: true, styleLockedCurrent: true, storyboardApprovedCurrent: true, videoRenderedCurrent: false });
assertEligible("create_output", gates); assertEligible("approve_storyboard", gates); assertEligible("render_video", gates);

const storyboard = Storyboard.parse({ id: "storyboard-v1", versionId: "story-version-v1", workshopId: "workshop-build-week", approvedAt: "2026-07-13T23:00:00.000Z", staleState: "current", panels: [{ id: "panel-1", purpose: "Show proof", claimIds: ["claim-1"], evidence: [{ claimId: "claim-1", sourceId: "source-1", chunkId: "chunk-1", locator: "Fixture · chunk 01" }], voiceover: "AI-generated narration: raw thinking becomes grounded work.", onScreenText: "Capture → Shape → Deliver", durationSeconds: 4, composition: "editorial evidence map", visualDnaVersionId: "dna-v1", transition: "cut", approved: true, staleState: "current" }] });

const brief = { workshopTitle: "WorkshopLM Build Week", version: "brief-v1", style: { accent: "#1668E3", ink: "#171816", paper: "#F4F2EC" }, blocks: [{ id: "claim-1", heading: "Judges see the complete trail", body: answer.answer, citations: answer.citations.map((citation) => citation.nativeLocator?.value ?? citation.chunkId) }] };
if (!renderDeck(brief).includes("Judges see") || !renderInfographic(brief).includes("Source-defensible")) throw new Error("production render missing content");

const db = openLocalDatabase(resolve(root, "workshoplm.sqlite")); migrate(db);
db.prepare("INSERT INTO workshop VALUES (?, ?, ?)").run("workshop-build-week", "WorkshopLM Build Week", new Date().toISOString());

await ingestSource({ title: "Recorded fixture brainstorm", origin: "Sanitized fixture", text: [
  "WorkshopLM turns messy meetings into a deck professionals can defend, with grounded source documents and brand rules preserving their standards.",
  "Producing a client-ready deliverable is slow and fragmented, because understanding, design, and production live in disconnected tools.",
  "Every factual claim retains an exact source locator, so evidence stays inspectable from the editable Map through the final presentation and Storyboard.",
  "Teams should use two deliberate sign-offs: approve the grounded Brief before creating Outputs, then approve the Storyboard before rendering Video.",
  "The OpenAI Build Week submission uses WorkshopLM to create its own presentation, image set, Storyboard, and demo Video from this raw brainstorm.",
  "The product promise is faster delivery without weaker work: one source-traceable package that remains editable in the tools teams already use.",
].join("\n\n") }, root);
updateWorkshopOnboarding({ outcome: "client_facing_pitch", step: "complete" }, root);
dismissWorkshopOrientation("map", root);
dismissWorkshopOrientation("outputs", root);
applyWorkshopAction("approveBrief", root);
lockManualStyle({}, root);
createImageBatch(root);
const deckState = await generateOutput("deck", root);
const infographicState = await generateOutput("infographic", root);
if (infographicState.outputs.length !== 2 || deckState.outputs[0]?.type !== "deck" || infographicState.outputs[1]?.type !== "infographic") throw new Error("persisted artifact outputs were not created");
const audioOverview = generateAudioOverview(root).audioOverviews.at(-1);
if (!audioOverview || audioOverview.sections.length !== 3 || audioOverview.sections.some((section) => !section.evidence.length) || audioOverview.status !== "script_ready") throw new Error("grounded Audio Overview script was not created");
const deckOutput = deckState.outputs.find((output) => output.type === "deck");
if (!deckOutput || deckOutput.claimIds.length !== 4) throw new Error("recorded fixture did not produce the four-part professional deck narrative");
const deckHtml = await readFile(resolve(root, deckOutput.relativePath), "utf8");
for (const layout of ["statement", "split", "proof", "recommendation"]) if (!deckHtml.includes(`class="slide ${layout}`)) throw new Error(`recorded fixture deck is missing the ${layout} layout`);
for (const narrativeBeat of [
  "WorkshopLM turns messy meetings into a deck professionals can defend",
  "Producing a client-ready deliverable is slow and fragmented",
  "Every factual claim retains an exact source locator",
  "Teams should use two deliberate sign-offs",
]) if (!deckHtml.includes(narrativeBeat)) throw new Error(`recorded fixture deck is missing its narrative beat: ${narrativeBeat}`);
const assetPlan = generateAssetPlan(root).assetPlan;
if (!assetPlan || assetPlan.stale) throw new Error("approved inputs did not produce a current asset plan");
const generatedStoryboard = generateStoryboard(root).storyboard;
if (generatedStoryboard.panels.length !== assetPlan.items.length) throw new Error("asset plan did not produce a complete editable storyboard");
applyWorkshopAction("approveStoryboard", root);
applyWorkshopAction("renderVideo", root);
const video = await executeOne(root);
if (video.state !== "succeeded" || !(await stat(resolve(root, "generated", "workshoplm-demo.mp4"))).isFile()) throw new Error("approved storyboard did not produce a local video");
const finalState = readWorkshopState(root);
if (finalState.onboarding.step !== "complete" || !finalState.onboarding.mapOrientationDismissed || !finalState.onboarding.outputsOrientationDismissed) throw new Error("recorded fixture did not open directly on the judge-ready Map");
if (!finalState.imageBatch || finalState.imageBatch.panels.length !== 6) throw new Error("recorded fixture did not preserve the planned coherent image set");
if (finalState.audioOverviews.length !== 1 || finalState.audioOverviews[0]?.stale || finalState.audioOverviews[0]?.status !== "script_ready") throw new Error("recorded fixture did not preserve one current grounded Audio Overview script");
if (finalState.videos.length !== 1 || finalState.videos[0]?.stale || !(await stat(resolve(root, finalState.videos[0].relativePath))).isFile()) throw new Error("recorded fixture did not preserve one current immutable Video version");
const buildTrace = finalState.videos[0]?.buildTrace;
if (!buildTrace || !(await stat(resolve(root, buildTrace.htmlPath))).isFile() || !(await stat(resolve(root, buildTrace.dataPath))).isFile()) throw new Error("recorded fixture did not preserve the Video build trace");
const finalGates = deriveGates({ transcriptSegments: 2, boardApprovedCurrent: true, briefCurrent: finalState.briefApproved, styleLockedCurrent: Boolean(finalState.style && !finalState.style.stale), storyboardApprovedCurrent: finalState.storyboardApproved, videoRenderedCurrent: finalState.videoState === "rendered" });
if (!finalGates.video_rendered) throw new Error("video-rendered gate was not recorded");

console.log(JSON.stringify({ mode: "recorded-fixture", status: "passed", grounding: answer.citations.length, gates: finalGates, outputs: finalState.outputs.map((output) => output.relativePath), audioOverview: { id: audioOverview.id, sections: audioOverview.sections.length, status: audioOverview.status }, imagePanels: finalState.imageBatch.panels.length, assetPlanItems: assetPlan.items.length, storyboardPanels: generatedStoryboard.panels.length, videoArtifact: video.artifact?.relativePath, buildTrace: buildTrace.htmlPath, elapsed: "deterministic" }));
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
