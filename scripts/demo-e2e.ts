import { mkdir, rm, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { deriveGates, assertEligible, Storyboard } from "../packages/domain/src/index.ts";
import { normalizeSource } from "../spikes/b-grounding/src/normalize.ts";
import { LocalSearchIndex } from "../spikes/b-grounding/src/search.ts";
import { allChunks, answerFromEvidence } from "../spikes/b-grounding/src/ground.ts";
import { renderDeck, renderInfographic } from "../packages/production/src/render.ts";
import { openLocalDatabase } from "../apps/worker/src/db/client.ts";
import { migrate } from "../apps/worker/src/db/migrate.ts";
import { executeOne } from "../apps/worker/src/executor.ts";
import { applyWorkshopAction, createImageBatch, generateAssetPlan, generateOutput, generateStoryboard, ingestSource, lockManualStyle, readWorkshopState } from "../apps/worker/src/workshop-service.ts";

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
if (!renderDeck(brief).includes("Judges see") || !renderInfographic(brief).includes("SOURCE-TRACEABLE")) throw new Error("production render missing content");

const db = openLocalDatabase(resolve(root, "workshoplm.sqlite")); migrate(db);
db.prepare("INSERT INTO workshop VALUES (?, ?, ?)").run("workshop-build-week", "WorkshopLM Build Week", new Date().toISOString());

await ingestSource({ title: "Recorded fixture brainstorm", origin: "Sanitized fixture", text: "Judges need a traced deck, infographic, image batch, storyboard, and narrated video." }, root);
applyWorkshopAction("approveBrief", root);
lockManualStyle({}, root);
createImageBatch(root);
const deckState = await generateOutput("deck", root);
const infographicState = await generateOutput("infographic", root);
if (infographicState.outputs.length !== 2 || deckState.outputs[0]?.type !== "deck" || infographicState.outputs[1]?.type !== "infographic") throw new Error("persisted artifact outputs were not created");
const assetPlan = generateAssetPlan(root).assetPlan;
if (!assetPlan || assetPlan.stale) throw new Error("approved inputs did not produce a current asset plan");
const generatedStoryboard = generateStoryboard(root).storyboard;
if (generatedStoryboard.panels.length !== assetPlan.items.length) throw new Error("asset plan did not produce a complete editable storyboard");
applyWorkshopAction("approveStoryboard", root);
applyWorkshopAction("renderVideo", root);
const video = await executeOne(root);
if (video.state !== "succeeded" || !(await stat(resolve(root, "generated", "workshoplm-demo.mp4"))).isFile()) throw new Error("approved storyboard did not produce a local video");
const finalState = readWorkshopState(root);
if (!finalState.imageBatch || finalState.imageBatch.panels.length !== 6) throw new Error("recorded fixture did not preserve the planned coherent image set");
const finalGates = deriveGates({ transcriptSegments: 2, boardApprovedCurrent: true, briefCurrent: finalState.briefApproved, styleLockedCurrent: Boolean(finalState.style && !finalState.style.stale), storyboardApprovedCurrent: finalState.storyboardApproved, videoRenderedCurrent: finalState.videoState === "rendered" });
if (!finalGates.video_rendered) throw new Error("video-rendered gate was not recorded");

console.log(JSON.stringify({ mode: "recorded-fixture", status: "passed", grounding: answer.citations.length, gates: finalGates, outputs: finalState.outputs.map((output) => output.relativePath), imagePanels: finalState.imageBatch.panels.length, assetPlanItems: assetPlan.items.length, storyboardPanels: generatedStoryboard.panels.length, videoArtifact: video.artifact?.relativePath, elapsed: "deterministic" }));
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
