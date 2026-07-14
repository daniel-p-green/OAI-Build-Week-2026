import { mkdir, readFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { deriveGates, assertEligible, Storyboard } from "../packages/domain/src/index.ts";
import { normalizeSource } from "../spikes/b-grounding/src/normalize.ts";
import { LocalSearchIndex } from "../spikes/b-grounding/src/search.ts";
import { allChunks, answerFromEvidence } from "../spikes/b-grounding/src/ground.ts";
import { renderDeck, renderInfographic, writeRenderedArtifact } from "../packages/production/src/render.ts";
import { storeArtifact } from "../apps/worker/src/artifacts/local-artifact-store.ts";
import { openLocalDatabase } from "../apps/worker/src/db/client.ts";
import { migrate } from "../apps/worker/src/db/migrate.ts";
import { enqueue, leaseNext } from "../apps/worker/src/queue.ts";

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

const storyboard = Storyboard.parse({ id: "storyboard-v1", versionId: "story-version-v1", workshopId: "workshop-build-week", approvedAt: "2026-07-13T23:00:00.000Z", staleState: "current", panels: [{ id: "panel-1", purpose: "Show proof", claimIds: ["claim-1"], voiceover: "AI-generated narration: raw thinking becomes grounded work.", onScreenText: "Capture → Shape → Deliver", durationSeconds: 4, composition: "editorial evidence map", visualDnaVersionId: "dna-v1", transition: "cut", approved: true, staleState: "current" }] });

const brief = { workshopTitle: "WorkshopLM Build Week", version: "brief-v1", style: { accent: "#1668E3", ink: "#171816", paper: "#F4F2EC" }, blocks: [{ id: "claim-1", heading: "Judges see the complete trail", body: answer.answer, citations: answer.citations.map((citation) => citation.nativeLocator?.value ?? citation.chunkId) }] };
const deck = await writeRenderedArtifact(root, "deck-v1", "deck", brief);
const infographic = await writeRenderedArtifact(root, "infographic-v1", "infographic", brief);
const stored = await storeArtifact(root, "deck-v1", Buffer.from(await readFile(resolve(root, deck.relativePath))), "text/html");
if (!renderDeck(brief).includes("Judges see") || !renderInfographic(brief).includes("SOURCE-TRACEABLE")) throw new Error("production render missing content");

const db = openLocalDatabase(resolve(root, "workshoplm.sqlite")); migrate(db);
db.prepare("INSERT INTO workshop VALUES (?, ?, ?)").run("workshop-build-week", "WorkshopLM Build Week", new Date().toISOString());
enqueue(db, { id: "job-render-video", workshopId: "workshop-build-week", kind: "render_video", inputKey: `storyboard:${storyboard.versionId}`, payload: { storyboardId: storyboard.id } });
if (leaseNext(db)?.id !== "job-render-video") throw new Error("durable video job was not leased");

console.log(JSON.stringify({ mode: "recorded-fixture", status: "passed", grounding: answer.citations.length, gates, outputs: [deck.relativePath, infographic.relativePath], storedArtifact: stored.relativePath, storyboardPanels: storyboard.panels.length, elapsed: "deterministic" }));
}

main().catch((error: unknown) => { console.error(error); process.exitCode = 1; });
