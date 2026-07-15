import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { execFile as execFileCallback } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { appendGraphOperation, GraphOperation, parseGraphState, SemanticGraph, serializeGraphState, undoLatestGraphOperation, type SemanticGraph as SemanticGraphType } from "@workshoplm/domain";
import { writeRenderedArtifact } from "@workshoplm/production";
import { storeArtifact } from "./artifacts/local-artifact-store.js";
import { openLocalDatabase } from "./db/client.js";
import { migrate } from "./db/migrate.js";
import { cancelJob, enqueue } from "./queue.js";

export type WorkshopSource = { id: string; type: "TXT" | "PDF" | "WEB"; title: string; origin: string; claimCount: number; excerpt: string; locator: string; permission: "private" | "sanitized" | "shareable" };
export type WorkshopChunk = { id: string; sourceId: string; text: string; locator: string; ordinal: number };
export type WorkshopClaim = { id: string; sourceId: string; chunkId: string; text: string; evidenceState: "verified"; locator: string };
export type WorkshopCandidate = { id: string; category: "goal" | "audience" | "claim" | "constraint" | "question"; text: string; sourceId: string; chunkId: string; locator: string };
export type WorkshopMapEdge = { id: string; from: string; to: string; kind: "supports" | "relates_to" | "depends_on" | "contradicts" | "contains"; label?: string };
export type WorkshopTranscriptSegment = { id: string; origin: "manual_import" | "realtime_fallback"; text: string; capturedAt: string };
export type WorkshopMapNode = { id: string; title: string; body: string; kind: "grounded" | "derived" | "creative"; locator: string; sourceId?: string; x: number; y: number };
export type CanvasNodePatch = { id: string; title: string; x: number; y: number };
export type WorkshopFrame = { version: number; markdown: string; markdownPath: string; executablePath: string; stale: boolean; approvedAt: string };
export type WorkshopSketch = { version: number; graphRevision: number; nodes: Pick<WorkshopMapNode, "id" | "title" | "body" | "kind" | "locator">[]; stale: boolean; approved: boolean; createdAt: string };
export type WorkshopStyle = { version: number; source: "manual" | "website"; name: string; accent: string; ink: string; paper: string; logos: string[]; licensedFonts: string[]; references: string[]; negativeRules: string[]; intentProfile: "client_facing_pitch" | "board_deck" | "internal_workshop"; referenceUrl?: string; lockedAt: string; stale: boolean };
export type WorkshopDesignArtifact = { version: number; styleVersion: number; markdownPath: string; tokensPath: string; stale: boolean; createdAt: string };
export type ManualStyleInput = { name?: string; accent?: string; ink?: string; paper?: string; logos?: string[]; licensedFonts?: string[]; references?: string[]; negativeRules?: string[]; intentProfile?: WorkshopStyle["intentProfile"] };
export type WorkshopVisualDna = { version: number; styleVersion: number; palette: { accent: string; ink: string; paper: string }; compositionRules: string[]; textureRules: string[]; imageRules: string[]; negativeRules: string[]; approved: boolean; stale: boolean; createdAt: string };
export type WorkshopAssetPlan = { version: number; graphRevision: number; briefVersion: number; styleVersion: number; visualDnaVersion?: number; evidenceClaimIds: string[]; items: { id: string; outputType: "deck" | "infographic" | "images" | "storyboard" | "video"; title: string; prompt: string; locator: string }[]; stale: boolean; createdAt: string };
export type StoryboardPanel = { id: string; title: string; narration: string; durationSeconds: number; approved: boolean; stale: boolean };
export type WorkshopStoryboard = { version: number; panels: StoryboardPanel[]; stale: boolean };
export type ImageBatchPanel = {
  id: string;
  version: number;
  prompt: string;
  state: "planned" | "selected_for_regeneration" | "generated" | "failed";
  referenceId: string;
  relativePath?: string;
  sha256?: string;
  provenance?: { model: "gpt-image-2"; size: string; quality: "low" | "medium" | "high"; requestId?: string; generatedAt: string };
  error?: string;
};
export type WorkshopImageBatch = { id: string; styleVersion: number; referenceId: string; panels: ImageBatchPanel[]; stale: boolean; createdAt: string };
export type WorkshopNarrationPanel = { panelId: string; relativePath: string; sha256: string; model: "gpt-4o-mini-tts"; voice: "marin"; instructions: string; requestId?: string; generatedAt: string };
export type WorkshopNarration = { storyboardVersion: number; disclosure: "AI-generated voice"; panels: WorkshopNarrationPanel[]; stale: boolean; createdAt: string };
export type WorkshopAiRun = { id: string; operation: "grounded_graph"; model: "gpt-5.6-sol" | "gpt-5.6-terra" | "gpt-5.6-luna"; inputClaimIds: string[]; outputSha256: string; requestId?: string; createdAt: string };
export type GroundedMapProposal = { nodes: { id: string; title: string; body: string; evidenceState: "grounded" | "derived"; evidenceClaimIds: string[]; x: number; y: number }[]; edges: WorkshopMapEdge[] };
export type WorkshopOutput = { id: string; type: "deck" | "infographic"; relativePath: string; artifactPath: string; claimIds: string[]; stale: boolean; createdAt: string };
export type WorkshopState = { id: string; title: string; briefApproved: boolean; storyboardApproved: boolean; videoState: "blocked" | "queued" | "rendering" | "rendered"; sources: number; groundedClaims: number; transcriptSegments: WorkshopTranscriptSegment[]; firstTranscriptAt?: string; firstRenderedOutputAt?: string; sourceItems: WorkshopSource[]; activeSourceIds: string[]; sourceChunks: WorkshopChunk[]; claims: WorkshopClaim[]; candidates: WorkshopCandidate[]; mapNodes: WorkshopMapNode[]; mapEdges: WorkshopMapEdge[]; frame?: WorkshopFrame; sketch?: WorkshopSketch; style?: WorkshopStyle; designArtifact?: WorkshopDesignArtifact; visualDna?: WorkshopVisualDna; assetPlan?: WorkshopAssetPlan; storyboard: WorkshopStoryboard; imageBatch?: WorkshopImageBatch; narration?: WorkshopNarration; aiRuns: WorkshopAiRun[]; outputs: WorkshopOutput[]; graphState?: string; updatedAt: string };
export type SourceIngestion = { title: string; origin: string; type?: WorkshopSource["type"]; text: string; permission?: WorkshopSource["permission"] };
const execFile = promisify(execFileCallback);
const id = "workshop-build-week";
const defaultState = (): WorkshopState => ({ id, title: "WorkshopLM Build Week", briefApproved: false, storyboardApproved: false, videoState: "blocked", sources: 3, groundedClaims: 5, sourceItems: [
  { id: "source-raw", type: "TXT", title: "Raw voice brainstorm", origin: "ChatGPT task", claimCount: 5, excerpt: "The judge should be able to see the messy original thought become a cited map, a real brief, and a finished piece of work.", locator: "ChatGPT task · 12:41 · chunk 04", permission: "sanitized" },
  { id: "source-brief", type: "PDF", title: "Build Week brief", origin: "Local", claimCount: 3, excerpt: "One visible chain links capture, approved work, and finished delivery.", locator: "Build notes · §2", permission: "sanitized" },
  { id: "source-design", type: "WEB", title: "WorkshopLM direction", origin: "Local", claimCount: 2, excerpt: "Evidence first becomes an editable production system, not a static report.", locator: "Design · Map", permission: "sanitized" },
], activeSourceIds: ["source-raw", "source-brief", "source-design"], transcriptSegments: [], sourceChunks: [], claims: [], candidates: [], mapEdges: [], storyboard: { version: 1, stale: false, panels: [{ id: "panel-1", title: "Raw thought", narration: "Start with the messy original thinking.", durationSeconds: 3, approved: true, stale: false }, { id: "panel-2", title: "Cited Map", narration: "Show the editable Map and evidence locators.", durationSeconds: 5, approved: true, stale: false }, { id: "panel-3", title: "Finished work", narration: "End with traceable production output.", durationSeconds: 4, approved: true, stale: false }] }, aiRuns: [], outputs: [], mapNodes: [
  { id: "promise", title: "The product promise", body: "Turn raw thinking into finished work without losing the trail back to source material.", kind: "grounded", locator: "Meeting · 12:41", x: 11, y: 18 },
  { id: "proof", title: "Judge proof", body: "Show one continuous capture → map → brief → storyboard → rendered video seam.", kind: "grounded", locator: "Build notes · §2", x: 48, y: 12 },
  { id: "visual", title: "Visual behavior", body: "Evidence first becomes an editable production system, not a static report.", kind: "creative", locator: "Design · Map", x: 39, y: 54 },
  { id: "risk", title: "Voice capture fallback", body: "Use a capture-only control when durable native voice linkage is not proven.", kind: "derived", locator: "Goal · capture", x: 70, y: 58 },
], updatedAt: new Date().toISOString() });
const repositoryDataRoot = () => resolve(process.env.WORKSHOPLM_DATA_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", ".workshoplm"));
function dbFor(root = repositoryDataRoot()) { const db = openLocalDatabase(join(root, "data", "workshoplm.sqlite")); migrate(db); return db; }
export function readWorkshopState(root?: string): WorkshopState {
  const db = dbFor(root); const createdAt = new Date().toISOString();
  db.prepare("INSERT OR IGNORE INTO workshop VALUES (?, ?, ?)").run(id, "WorkshopLM Build Week", createdAt);
  const row = db.prepare("SELECT state_json FROM workshop_state WHERE workshop_id=?").get(id) as { state_json: string } | undefined;
  if (row) { const state = JSON.parse(row.state_json) as Partial<WorkshopState>; if (state.sourceItems && state.mapNodes) return state.sourceChunks && state.claims ? { ...state, sourceItems: state.sourceItems.map((source) => ({ ...source, permission: source.permission ?? "sanitized" })), activeSourceIds: state.activeSourceIds ?? state.sourceItems.map((source) => source.id), transcriptSegments: state.transcriptSegments ?? [], candidates: state.candidates ?? [], mapEdges: state.mapEdges ?? [], style: state.style ? { ...state.style, logos: state.style.logos ?? [], licensedFonts: state.style.licensedFonts ?? [], references: state.style.references ?? [], negativeRules: state.style.negativeRules ?? [], intentProfile: state.style.intentProfile ?? "client_facing_pitch" } : undefined, storyboard: state.storyboard ?? defaultState().storyboard, aiRuns: state.aiRuns ?? [], outputs: state.outputs ?? [] } as WorkshopState : write({ ...state, activeSourceIds: state.sourceItems.map((source) => source.id), transcriptSegments: [], sourceChunks: [], claims: [], candidates: [], mapEdges: [], storyboard: defaultState().storyboard, aiRuns: state.aiRuns ?? [], outputs: [] } as WorkshopState, root); return write({ ...defaultState(), ...state, sourceItems: defaultState().sourceItems, activeSourceIds: defaultState().sourceItems.map((source) => source.id), transcriptSegments: [], sourceChunks: [], claims: [], candidates: [], mapEdges: [], storyboard: defaultState().storyboard, aiRuns: state.aiRuns ?? [], outputs: [], mapNodes: defaultState().mapNodes } as WorkshopState, root); }
  const state = defaultState(); db.prepare("INSERT INTO workshop_state VALUES (?, ?, ?)").run(id, JSON.stringify(state), state.updatedAt); return state;
}
export function resolveWorkshopArtifact(id: string, root?: string): { path: string; contentType: string } | undefined {
  const state = readWorkshopState(root); const dataRoot = root ?? repositoryDataRoot();
  if (id === "video") {
    if (state.videoState !== "rendered") return undefined;
    return { path: join(dataRoot, "generated", "workshoplm-demo.mp4"), contentType: "video/mp4" };
  }
  const image = state.imageBatch?.panels.find((panel) => panel.id === id && panel.state === "generated" && panel.relativePath);
  if (image?.relativePath) {
    const path = resolve(dataRoot, image.relativePath);
    if (!path.startsWith(`${resolve(dataRoot)}/`)) return undefined;
    return { path, contentType: "image/png" };
  }
  const output = state.outputs.find((item) => item.id === id);
  if (!output) return undefined;
  const path = resolve(dataRoot, output.relativePath);
  if (!path.startsWith(`${dataRoot}/`)) return undefined;
  return { path, contentType: "text/html; charset=utf-8" };
}
function write(next: WorkshopState, root?: string) { const db = dbFor(root); db.prepare("UPDATE workshop_state SET state_json=?, updated_at=? WHERE workshop_id=?").run(JSON.stringify(next), next.updatedAt, id); return next; }
function activeClaimsFor(state: WorkshopState) { return state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId)); }
function invalidateForSourceScope(state: WorkshopState, updatedAt: string): WorkshopState { return { ...state, frame: state.frame ? { ...state.frame, stale: true } : undefined, sketch: state.sketch ? { ...state.sketch, stale: true, approved: false } : undefined, assetPlan: state.assetPlan ? { ...state.assetPlan, stale: true } : undefined, imageBatch: state.imageBatch ? { ...state.imageBatch, stale: true } : undefined, narration: state.narration ? { ...state.narration, stale: true } : undefined, storyboard: { ...state.storyboard, stale: true, panels: state.storyboard.panels.map((panel) => ({ ...panel, stale: true })) }, outputs: state.outputs.map((output) => ({ ...output, stale: true })), briefApproved: false, storyboardApproved: false, videoState: "blocked", updatedAt }; }
export function setActiveSourceScope(sourceIds: string[], root?: string): WorkshopState {
  const current = readWorkshopState(root); const unique = [...new Set(sourceIds)];
  if (!unique.length) throw new Error("Keep at least one source active for grounding.");
  if (unique.some((sourceId) => !current.sourceItems.some((source) => source.id === sourceId))) throw new Error("Grounding scope includes an unknown source.");
  if (unique.length === current.activeSourceIds.length && unique.every((sourceId) => current.activeSourceIds.includes(sourceId))) return current;
  return write(invalidateForSourceScope({ ...current, activeSourceIds: unique }, new Date().toISOString()), root);
}
function graphFor(state: WorkshopState): ReturnType<typeof parseGraphState> {
  if (state.graphState) return parseGraphState(state.graphState);
  const graph = SemanticGraph.parse({ id: "graph-workshop-build-week", workshopId: id, revision: 0, staleState: "current", nodes: state.mapNodes.map((node) => ({ id: `node-${node.id}`, kind: "claim", label: node.title, evidenceState: node.kind === "grounded" ? "verified" : node.kind, metadata: { body: node.body, locator: node.locator } })), edges: state.mapEdges.map((edge) => ({ ...edge, from: `node-${edge.from}`, to: `node-${edge.to}` })) });
  return { schemaVersion: 1, graph, history: { graphVersionId: graph.id, records: [] } };
}
function mapNodesFor(graph: SemanticGraphType, existing: WorkshopMapNode[]): WorkshopMapNode[] {
  return graph.nodes.map((node, index) => { const prior = existing.find((item) => `node-${item.id}` === node.id); const metadata = node.metadata as { body?: unknown; locator?: unknown; sourceId?: unknown; x?: unknown; y?: unknown }; return { id: node.id.replace(/^node-/, ""), title: node.label, body: typeof metadata.body === "string" ? metadata.body : prior?.body ?? node.label, kind: node.evidenceState === "verified" ? "grounded" : node.evidenceState === "unverified" ? "derived" : node.evidenceState, locator: typeof metadata.locator === "string" ? metadata.locator : prior?.locator ?? "Map operation", sourceId: typeof metadata.sourceId === "string" ? metadata.sourceId : prior?.sourceId, x: typeof metadata.x === "number" ? metadata.x : prior?.x ?? 16 + (index * 15) % 65, y: typeof metadata.y === "number" ? metadata.y : prior?.y ?? 18 + (index * 19) % 58 }; });
}
function mapEdgesFor(graph: SemanticGraphType): WorkshopMapEdge[] { return graph.edges.map((edge) => ({ ...edge, from: edge.from.replace(/^node-/, ""), to: edge.to.replace(/^node-/, "") })); }
function frameFor(state: WorkshopState, approvedAt: string, root?: string): WorkshopFrame {
  const core = state.mapNodes.filter((node) => node.kind !== "creative").slice(0, 3);
  const evidence = core.map((node) => `- ${node.title}: ${node.body} (${node.locator})`).join("\n");
  const version = (state.frame?.version ?? 0) + 1; const markdown = `# FRAME.md\n\n## Outcome\n${core[0]?.body ?? "Turn raw thinking into finished work."}\n\n## Evidence\n${evidence}\n\n## Production proof\nShow the approved Map, source locators, and a finished output in one continuous path.\n`; const dataRoot = root ?? repositoryDataRoot(); const generated = join(dataRoot, "generated"); const markdownPath = `generated/FRAME-v${version}.md`; const executablePath = `generated/FRAME-v${version}.json`;
  mkdirSync(generated, { recursive: true }); writeFileSync(join(dataRoot, markdownPath), markdown, "utf8"); writeFileSync(join(dataRoot, executablePath), `${JSON.stringify({ schemaVersion: 1, frameVersion: version, graphRevision: graphFor(state).graph.revision, outcome: core[0]?.body ?? "Turn raw thinking into finished work.", evidence: core.map((node) => ({ nodeId: node.id, title: node.title, body: node.body, locator: node.locator, sourceId: node.sourceId })), productionProof: "Show the approved Map, source locators, and a finished output in one continuous path.", approvedAt }, null, 2)}\n`, "utf8");
  return { version, approvedAt, stale: false, markdown, markdownPath, executablePath };
}
export function applyMapOperation(operation: unknown, root?: string): WorkshopState {
  const current = readWorkshopState(root); const snapshot = graphFor(current); const parsed = GraphOperation.parse(operation);
  const applied = appendGraphOperation(snapshot.graph, snapshot.history, parsed, { id: `operation-${Date.now()}`, actor: "user", createdAt: new Date().toISOString() });
  return write({ ...current, graphState: serializeGraphState(applied.graph, applied.history), mapNodes: mapNodesFor(applied.graph, current.mapNodes), mapEdges: mapEdgesFor(applied.graph), frame: current.frame ? { ...current.frame, stale: true } : undefined, sketch: current.sketch ? { ...current.sketch, stale: true, approved: false } : undefined, assetPlan: current.assetPlan ? { ...current.assetPlan, stale: true } : undefined, narration: current.narration ? { ...current.narration, stale: true } : undefined, storyboard: { ...current.storyboard, stale: true, panels: current.storyboard.panels.map((panel) => ({ ...panel, stale: true })) }, outputs: current.outputs.map((output) => ({ ...output, stale: true })), briefApproved: false, storyboardApproved: false, videoState: "blocked", updatedAt: new Date().toISOString() }, root);
}
export function undoMapOperation(root?: string): WorkshopState {
  const current = readWorkshopState(root); const snapshot = graphFor(current); const undone = undoLatestGraphOperation(snapshot.graph, snapshot.history);
  return write({ ...current, graphState: serializeGraphState(undone.graph, undone.history), mapNodes: mapNodesFor(undone.graph, current.mapNodes), mapEdges: mapEdgesFor(undone.graph), frame: current.frame ? { ...current.frame, stale: true } : undefined, sketch: current.sketch ? { ...current.sketch, stale: true, approved: false } : undefined, assetPlan: current.assetPlan ? { ...current.assetPlan, stale: true } : undefined, narration: current.narration ? { ...current.narration, stale: true } : undefined, storyboard: { ...current.storyboard, stale: true, panels: current.storyboard.panels.map((panel) => ({ ...panel, stale: true })) }, outputs: current.outputs.map((output) => ({ ...output, stale: true })), briefApproved: false, storyboardApproved: false, videoState: "blocked", updatedAt: new Date().toISOString() }, root);
}
export function syncMapCanvas(rawPatches: CanvasNodePatch[], root?: string): WorkshopState {
  const current = readWorkshopState(root); const snapshot = graphFor(current); let graph = snapshot.graph; let history = snapshot.history; let changed = false;
  for (const rawPatch of rawPatches) {
    const patch = { id: rawPatch.id.replace(/^node-/, ""), title: rawPatch.title.trim(), x: Math.round(rawPatch.x * 10) / 10, y: Math.round(rawPatch.y * 10) / 10 };
    if (!patch.id || !patch.title || !Number.isFinite(patch.x) || !Number.isFinite(patch.y)) continue;
    const node = graph.nodes.find((item) => item.id === `node-${patch.id}`); if (!node || node.locked) continue;
    const previous = node.metadata as { x?: unknown; y?: unknown }; if (node.label === patch.title && previous.x === patch.x && previous.y === patch.y) continue;
    const applied = appendGraphOperation(graph, history, GraphOperation.parse({ type: "update_node", nodeId: node.id, patch: { label: patch.title, metadata: { ...node.metadata, x: patch.x, y: patch.y } } }), { id: `operation-canvas-${Date.now()}-${patch.id}`, actor: "user", createdAt: new Date().toISOString() }); graph = applied.graph; history = applied.history; changed = true;
  }
  if (!changed) return current;
  return write({ ...current, graphState: serializeGraphState(graph, history), mapNodes: mapNodesFor(graph, current.mapNodes), mapEdges: mapEdgesFor(graph), frame: current.frame ? { ...current.frame, stale: true } : undefined, sketch: current.sketch ? { ...current.sketch, stale: true, approved: false } : undefined, assetPlan: current.assetPlan ? { ...current.assetPlan, stale: true } : undefined, narration: current.narration ? { ...current.narration, stale: true } : undefined, storyboard: { ...current.storyboard, stale: true, panels: current.storyboard.panels.map((panel) => ({ ...panel, stale: true })) }, outputs: current.outputs.map((output) => ({ ...output, stale: true })), briefApproved: false, storyboardApproved: false, videoState: "blocked", updatedAt: new Date().toISOString() }, root);
}
export function applyGroundedMapProposal(proposal: GroundedMapProposal, run: Omit<WorkshopAiRun, "id" | "operation" | "inputClaimIds" | "createdAt">, root?: string): WorkshopState {
  const current = readWorkshopState(root);
  const activeClaims = activeClaimsFor(current);
  if (proposal.nodes.length < 2 || proposal.nodes.length > 12) throw new Error("A grounded Map proposal requires 2 to 12 nodes.");
  if (!/^[a-f0-9]{64}$/.test(run.outputSha256)) throw new Error("AI output requires a SHA-256 provenance hash.");
  const claimById = new Map(activeClaims.map((claim) => [claim.id, claim]));
  const proposalIds = new Set<string>();
  for (const node of proposal.nodes) {
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(node.id) || proposalIds.has(node.id)) throw new Error(`Invalid or duplicate Map node ID: ${node.id}.`);
    if (!node.title.trim() || !node.body.trim() || !Number.isFinite(node.x) || !Number.isFinite(node.y) || node.x < 0 || node.x > 100 || node.y < 0 || node.y > 100) throw new Error(`Map node ${node.id} has invalid content or position.`);
    if (node.evidenceState === "grounded" && !node.evidenceClaimIds.length) throw new Error(`Grounded Map node ${node.id} requires evidence.`);
    if (node.evidenceClaimIds.some((claimId) => !claimById.has(claimId))) throw new Error(`Map node ${node.id} cites a claim outside the active source scope.`);
    proposalIds.add(node.id);
  }
  const edgeIds = new Set<string>();
  for (const edge of proposal.edges) {
    if (!edge.id || edgeIds.has(edge.id) || !proposalIds.has(edge.from) || !proposalIds.has(edge.to) || edge.from === edge.to) throw new Error(`Map edge ${edge.id || "unknown"} is invalid.`);
    edgeIds.add(edge.id);
  }

  const previous = graphFor(current).graph;
  let graph = SemanticGraph.parse({ id: previous.id, workshopId: id, revision: previous.revision + 1, staleState: "current", nodes: [], edges: [] });
  let history: ReturnType<typeof parseGraphState>["history"] = { graphVersionId: graph.id, records: [] };
  const createdAt = new Date().toISOString();
  for (const node of proposal.nodes) {
    const evidence = node.evidenceClaimIds.map((claimId) => claimById.get(claimId)!);
    const primary = evidence[0];
    const applied = appendGraphOperation(graph, history, GraphOperation.parse({ type: "add_node", node: { id: `node-${node.id}`, kind: "claim", label: node.title.trim(), claimId: primary?.id, evidenceState: node.evidenceState === "grounded" ? "verified" : "derived", priority: 0, unresolved: false, locked: false, metadata: { body: node.body.trim(), locator: primary?.locator ?? "Derived from active source set", sourceId: primary?.sourceId, evidenceClaimIds: node.evidenceClaimIds, x: node.x, y: node.y } } }), { id: `operation-ai-${Date.now()}-${node.id}`, actor: "assistant", createdAt });
    graph = applied.graph; history = applied.history;
  }
  for (const edge of proposal.edges) {
    const applied = appendGraphOperation(graph, history, GraphOperation.parse({ type: "add_edge", edge: { ...edge, from: `node-${edge.from}`, to: `node-${edge.to}` } }), { id: `operation-ai-${Date.now()}-${edge.id}`, actor: "assistant", createdAt });
    graph = applied.graph; history = applied.history;
  }
  const aiRun: WorkshopAiRun = { id: `ai-run-grounded-graph-${Date.now()}`, operation: "grounded_graph", model: run.model, inputClaimIds: [...new Set(proposal.nodes.flatMap((node) => node.evidenceClaimIds))], outputSha256: run.outputSha256, requestId: run.requestId, createdAt };
  return write({ ...current, graphState: serializeGraphState(graph, history), mapNodes: mapNodesFor(graph, []), mapEdges: mapEdgesFor(graph), aiRuns: [...current.aiRuns, aiRun], frame: current.frame ? { ...current.frame, stale: true } : undefined, sketch: current.sketch ? { ...current.sketch, stale: true, approved: false } : undefined, assetPlan: current.assetPlan ? { ...current.assetPlan, stale: true } : undefined, imageBatch: current.imageBatch ? { ...current.imageBatch, stale: true } : undefined, narration: current.narration ? { ...current.narration, stale: true } : undefined, storyboard: { ...current.storyboard, stale: true, panels: current.storyboard.panels.map((panel) => ({ ...panel, stale: true })) }, outputs: current.outputs.map((output) => ({ ...output, stale: true })), briefApproved: false, storyboardApproved: false, videoState: "blocked", updatedAt: createdAt }, root);
}
function normalizeSourceText(text: string) { return text.replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim(); }
function sourceClaimCount(text: string) { return Math.max(1, text.split(/[.!?]+/).map((sentence) => sentence.trim()).filter(Boolean).length); }
function chunksFor(text: string, sourceId: string, hash: string, origin: string): WorkshopChunk[] { return text.split(/\n\n+/).flatMap((paragraph) => paragraph.match(/.{1,700}(?:\s|$)/g) ?? [paragraph]).filter(Boolean).map((chunk, ordinal) => ({ id: `chunk-${hash.slice(0, 12)}-${ordinal + 1}`, sourceId, text: chunk.trim(), locator: `${origin} · chunk ${String(ordinal + 1).padStart(2, "0")}`, ordinal })); }
function claimsFor(chunks: WorkshopChunk[], hash: string): WorkshopClaim[] { return chunks.flatMap((chunk) => chunk.text.split(/[.!?]+/).map((sentence) => sentence.trim()).filter(Boolean).map((text, index) => ({ id: `claim-${hash.slice(0, 12)}-${chunk.ordinal}-${index + 1}`, sourceId: chunk.sourceId, chunkId: chunk.id, text, evidenceState: "verified" as const, locator: chunk.locator }))); }
function candidateCategory(text: string): WorkshopCandidate["category"] { const normalized = text.toLowerCase(); if (/\?|\b(how|what|which|when|where|why)\b/.test(normalized)) return "question"; if (/\b(must|must not|only|cannot|deadline|require|constraint)\b/.test(normalized)) return "constraint"; if (/\b(judge|customer|client|team|user|audience)\b/.test(normalized)) return "audience"; if (/\b(goal|aim|need to|should|want to|deliver|build)\b/.test(normalized)) return "goal"; return "claim"; }
export function extractWorkshopCandidates(root?: string): WorkshopState { const current = readWorkshopState(root); const candidates = activeClaimsFor(current).slice(0, 40).map((claim) => ({ id: `candidate-${claim.id}`, category: candidateCategory(claim.text), text: claim.text, sourceId: claim.sourceId, chunkId: claim.chunkId, locator: claim.locator })); return write({ ...current, candidates, updatedAt: new Date().toISOString() }, root); }
export function searchWorkshopSources(query: string, root?: string): WorkshopChunk[] { const terms = normalizeSourceText(query).toLowerCase().split(/\W+/).filter((term) => term.length > 1); if (!terms.length) return []; return readWorkshopState(root).sourceChunks.map((chunk) => ({ chunk, score: terms.reduce((score, term) => score + (chunk.text.toLowerCase().includes(term) ? 1 : 0), 0) })).filter(({ score }) => score > 0).sort((a, b) => b.score - a.score || a.chunk.ordinal - b.chunk.ordinal).map(({ chunk }) => chunk); }
export async function ingestSource(input: SourceIngestion, root?: string): Promise<WorkshopState> {
  const text = normalizeSourceText(input.text);
  if (!text) throw new Error("Source text is required.");
  const title = input.title.trim();
  const origin = input.origin.trim();
  if (!title || !origin) throw new Error("Source title and origin are required.");
  const permission = input.permission ?? "sanitized";
  if (!(["private", "sanitized", "shareable"] as const).includes(permission)) throw new Error("Source permission must be private, sanitized, or shareable.");
  const hash = createHash("sha256").update(`${origin}\n${text}`).digest("hex");
  const sourceId = `source-${hash.slice(0, 12)}`;
  const current = readWorkshopState(root);
  if (current.sourceItems.some((source) => source.id === sourceId)) return current;
  const dataRoot = root ?? repositoryDataRoot();
  const sourceDirectory = join(dataRoot, "sources");
  await mkdir(sourceDirectory, { recursive: true });
  await writeFile(join(sourceDirectory, `${hash}.txt`), text, "utf8");
  const claimCount = sourceClaimCount(text);
  const source: WorkshopSource = { id: sourceId, type: input.type ?? "TXT", title, origin, claimCount, excerpt: text.slice(0, 240), locator: `${origin} · normalized:${hash.slice(0, 12)}`, permission };
  const chunks = chunksFor(text, sourceId, hash, origin); const claims = claimsFor(chunks, hash);
  const node: WorkshopMapNode = { id: `evidence-${hash.slice(0, 12)}`, title, body: source.excerpt, kind: "grounded", locator: source.locator, sourceId, x: 18 + (current.mapNodes.length * 13) % 64, y: 24 + (current.mapNodes.length * 17) % 54 };
  const createdAt = new Date().toISOString(); const snapshot = graphFor(current);
  const operation = GraphOperation.parse({ type: "add_node", node: { id: `node-${node.id}`, kind: "claim", label: node.title, claimId: claims[0]?.id, evidenceState: "verified", metadata: { body: node.body, locator: node.locator, sourceId } } });
  const applied = appendGraphOperation(snapshot.graph, snapshot.history, operation, { id: `operation-source-${hash.slice(0, 12)}`, actor: "system", createdAt });
  return write({ ...current, sources: current.sources + 1, groundedClaims: current.groundedClaims + claims.length, sourceItems: [...current.sourceItems, source], activeSourceIds: [...new Set([...current.activeSourceIds, sourceId])], sourceChunks: [...current.sourceChunks, ...chunks], claims: [...current.claims, ...claims], mapNodes: mapNodesFor(applied.graph, [...current.mapNodes, node]), mapEdges: mapEdgesFor(applied.graph), graphState: serializeGraphState(applied.graph, applied.history), updatedAt: createdAt }, root);
}
export async function captureFallbackTranscript(text: string, root?: string): Promise<WorkshopState> {
  const normalized = normalizeSourceText(text); if (!normalized) throw new Error("Capture text is required."); const capturedAt = new Date().toISOString();
  const ingested = await ingestSource({ title: `Capture-only transcript ${capturedAt}`, origin: "gpt-realtime-2.1 capture-only fallback", type: "TXT", text: normalized, permission: "private" }, root);
  const segment: WorkshopTranscriptSegment = { id: `fallback-${createHash("sha256").update(`${capturedAt}\n${normalized}`).digest("hex").slice(0, 12)}`, origin: "realtime_fallback", text: normalized, capturedAt };
  return write({ ...ingested, transcriptSegments: [...ingested.transcriptSegments, segment], firstTranscriptAt: ingested.firstTranscriptAt ?? capturedAt, updatedAt: capturedAt }, root);
}
function isPrivateAddress(address: string) { return address === "::1" || address.startsWith("127.") || address.startsWith("10.") || address.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[0-1])\./.test(address) || address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80:"); }
async function fetchPublicText(rawUrl: string, fetchImpl: typeof fetch = fetch) {
  let url: URL; try { url = new URL(rawUrl); } catch { throw new Error("A valid HTTP(S) URL is required."); }
  if (!/^https?:$/.test(url.protocol) || url.username || url.password) throw new Error("Only credential-free HTTP(S) URLs are allowed.");
  if (url.hostname === "localhost" || url.hostname.endsWith(".local")) throw new Error("Local network URLs are not allowed.");
  const addresses = await lookup(url.hostname, { all: true }); if (addresses.some(({ address }) => isPrivateAddress(address))) throw new Error("Private network URLs are not allowed.");
  const response = await fetchImpl(url, { redirect: "follow", signal: AbortSignal.timeout(10_000) }); if (!response.ok) throw new Error(`URL fetch failed: HTTP ${response.status}.`);
  const contentType = response.headers.get("content-type") ?? ""; if (!/^(text\/|application\/(json|xml|javascript))/.test(contentType)) throw new Error("URL must return text content.");
  const text = await response.text(); if (text.length > 1_000_000) throw new Error("URL content exceeds the 1 MB local ingestion limit."); return { url, text };
}
export async function ingestUrl(rawUrl: string, root?: string, fetchImpl: typeof fetch = fetch): Promise<WorkshopState> {
  const { url, text } = await fetchPublicText(rawUrl, fetchImpl);
  return ingestSource({ title: url.hostname, origin: url.toString(), type: "WEB", text: text.replace(/<[^>]+>/g, " "), permission: "shareable" }, root);
}
export async function ingestPdfFile(filePath: string, root?: string, permission: WorkshopSource["permission"] = "sanitized"): Promise<WorkshopState> {
  if (!filePath.toLowerCase().endsWith(".pdf")) throw new Error("Local PDF ingestion requires a .pdf file.");
  let stdout: string; try { ({ stdout } = await execFile("pdftotext", ["-layout", filePath, "-"], { maxBuffer: 1_000_000 })); } catch { throw new Error("PDF text extraction failed. Use a readable text-based PDF or provide extracted text."); }
  const text = normalizeSourceText(stdout); if (!text) throw new Error("PDF contains no extractable text."); return ingestSource({ title: basename(filePath), origin: `Local PDF · ${basename(filePath)}`, type: "PDF", text, permission }, root);
}
export async function lockWebsiteStyle(rawUrl: string, root?: string, fetchImpl: typeof fetch = fetch): Promise<WorkshopState> {
  const { url, text } = await fetchPublicText(rawUrl, fetchImpl); const current = readWorkshopState(root); const colors = [...text.matchAll(/#[0-9a-fA-F]{6}\b/g)].map((match) => match[0].toUpperCase()); const palette = [...new Set(colors)]; const title = text.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || url.hostname; const updatedAt = new Date().toISOString(); const style: WorkshopStyle = { version: (current.style?.version ?? 0) + 1, source: "website", name: `${title} foundation`, accent: palette[0] ?? "#1668E3", ink: palette[1] ?? "#171816", paper: palette[2] ?? "#F4F2EC", logos: [], licensedFonts: [], references: [url.toString()], negativeRules: [], intentProfile: "client_facing_pitch", referenceUrl: url.toString(), lockedAt: updatedAt, stale: false };
  return write({ ...current, ...(current.style ? staleStyleDependents(current) : {}), style, designArtifact: materializeDesignArtifact(style, root), updatedAt }, root);
}
function cleanStyleList(values: string[] | undefined) { return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))]; }
function color(value: string | undefined, fallback: string) { const candidate = (value ?? fallback).trim().toUpperCase(); if (!/^#[0-9A-F]{6}$/.test(candidate)) throw new Error("Style colors must use exact six-digit hex values."); return candidate; }
function materializeDesignArtifact(style: WorkshopStyle, root?: string): WorkshopDesignArtifact {
  const dataRoot = root ?? repositoryDataRoot(); const generated = join(dataRoot, "generated"); const markdownPath = `generated/DESIGN-v${style.version}.md`; const tokensPath = `generated/DESIGN-v${style.version}.tokens.json`;
  const markdown = `# DESIGN.md\n\n## Foundation\n- Name: ${style.name}\n- Version: ${style.version}\n- Source: ${style.source}\n- Intent profile: ${style.intentProfile}\n\n## Palette\n- Accent: ${style.accent}\n- Ink: ${style.ink}\n- Paper: ${style.paper}\n\n## Licensed inputs\n${style.licensedFonts.length ? style.licensedFonts.map((font) => `- Font: ${font}`).join("\n") : "- Fonts: none recorded"}\n${style.logos.length ? style.logos.map((logo) => `- Logo / asset: ${logo}`).join("\n") : "- Logos / assets: none recorded"}\n\n## References\n${style.references.length ? style.references.map((reference) => `- ${reference}`).join("\n") : "- No external visual references recorded"}\n\n## Negative rules\n${style.negativeRules.length ? style.negativeRules.map((rule) => `- ${rule}`).join("\n") : "- No negative rules recorded"}\n\n## Provenance\n- Locked: ${style.lockedAt}\n${style.referenceUrl ? `- Website reference: ${style.referenceUrl}\n` : ""}`;
  const tokens = { schemaVersion: 1, styleVersion: style.version, source: style.source, name: style.name, palette: { accent: style.accent, ink: style.ink, paper: style.paper }, logos: style.logos, licensedFonts: style.licensedFonts, references: style.references, negativeRules: style.negativeRules, intentProfile: style.intentProfile, referenceUrl: style.referenceUrl, lockedAt: style.lockedAt };
  mkdirSync(generated, { recursive: true }); writeFileSync(join(dataRoot, markdownPath), markdown, "utf8"); writeFileSync(join(dataRoot, tokensPath), `${JSON.stringify(tokens, null, 2)}\n`, "utf8");
  return { version: style.version, styleVersion: style.version, markdownPath, tokensPath, stale: false, createdAt: style.lockedAt };
}
function staleStyleDependents(current: WorkshopState) { return { visualDna: current.visualDna ? { ...current.visualDna, stale: true, approved: false } : undefined, assetPlan: current.assetPlan ? { ...current.assetPlan, stale: true } : undefined, storyboard: { ...current.storyboard, stale: true, panels: current.storyboard.panels.map((panel) => ({ ...panel, stale: true })) }, imageBatch: current.imageBatch ? { ...current.imageBatch, stale: true } : undefined, narration: current.narration ? { ...current.narration, stale: true } : undefined, outputs: current.outputs.map((output) => ({ ...output, stale: true })), storyboardApproved: false, videoState: "blocked" as const }; }
export function lockManualStyle(input: ManualStyleInput = {}, root?: string): WorkshopState {
  const current = readWorkshopState(root); const updatedAt = new Date().toISOString(); const intentProfile = input.intentProfile ?? "client_facing_pitch";
  if (!["client_facing_pitch", "board_deck", "internal_workshop"].includes(intentProfile)) throw new Error("Invalid intent profile.");
  const style: WorkshopStyle = { version: (current.style?.version ?? 0) + 1, source: "manual", name: input.name?.trim() || "Editorial thinking instrument", accent: color(input.accent, "#1668E3"), ink: color(input.ink, "#171816"), paper: color(input.paper, "#F4F2EC"), logos: cleanStyleList(input.logos), licensedFonts: cleanStyleList(input.licensedFonts), references: cleanStyleList(input.references), negativeRules: cleanStyleList(input.negativeRules), intentProfile, lockedAt: updatedAt, stale: false };
  return write({ ...current, ...(current.style ? staleStyleDependents(current) : {}), style, designArtifact: materializeDesignArtifact(style, root), updatedAt }, root);
}
export function createVisualDna(root?: string): WorkshopState { const current = readWorkshopState(root); if (!current.style || current.style.stale) throw new Error("Visual DNA requires a current locked Style Foundation."); const createdAt = new Date().toISOString(); const profileRule = current.style.intentProfile === "board_deck" ? "Executive hierarchy with source-visible proof points." : current.style.intentProfile === "internal_workshop" ? "Facilitation-first working canvas with writable space." : "Client-ready narrative sequence with a decisive opening."; return write({ ...current, visualDna: { version: (current.visualDna?.version ?? 0) + 1, styleVersion: current.style.version, palette: { accent: current.style.accent, ink: current.style.ink, paper: current.style.paper }, compositionRules: [profileRule, ...current.style.references], textureRules: ["Subtle paper grain only; preserve legibility."], imageRules: ["Use the locked palette and evidence-aware editorial framing."], negativeRules: current.style.negativeRules, approved: false, stale: false, createdAt }, updatedAt: createdAt }, root); }
export function createSketch(root?: string): WorkshopState { const current = readWorkshopState(root); if (!current.briefApproved || !current.frame || current.frame.stale) throw new Error("Sketch requires an approved current Map."); const createdAt = new Date().toISOString(); return write({ ...current, sketch: { version: (current.sketch?.version ?? 0) + 1, graphRevision: graphFor(current).graph.revision, nodes: current.mapNodes.map(({ id, title, body, kind, locator }) => ({ id, title, body, kind, locator })), stale: false, approved: false, createdAt }, updatedAt: createdAt }, root); }
export function approveSketch(root?: string): WorkshopState { const current = readWorkshopState(root); if (!current.sketch || current.sketch.stale) throw new Error("A current Sketch preview is required."); return write({ ...current, sketch: { ...current.sketch, approved: true }, updatedAt: new Date().toISOString() }, root); }
export function approveVisualDna(root?: string): WorkshopState { const current = readWorkshopState(root); if (!current.visualDna || current.visualDna.stale) throw new Error("A current Visual DNA preview is required."); return write({ ...current, visualDna: { ...current.visualDna, approved: true }, updatedAt: new Date().toISOString() }, root); }
export function generateAssetPlan(root?: string): WorkshopState { const current = readWorkshopState(root); if (!current.briefApproved || !current.frame || current.frame.stale) throw new Error("Asset planning requires an approved current brief."); if (!current.style || current.style.stale) throw new Error("Asset planning requires a locked current Style Foundation."); const graph = graphFor(current).graph; const evidence = activeClaimsFor(current).slice(0, 4); const fallback = current.mapNodes.filter((node) => node.kind === "grounded" && (!node.sourceId || current.activeSourceIds.includes(node.sourceId))).slice(0, 4).map((node) => ({ id: node.id, text: node.body, locator: node.locator })); const proof = evidence.length ? evidence : fallback; const createdAt = new Date().toISOString(); const version = (current.assetPlan?.version ?? 0) + 1; const locator = proof[0]?.locator ?? "Approved Map"; const titles: WorkshopAssetPlan["items"] = [{ id: `asset-plan-${version}-deck`, outputType: "deck", title: "Source-traceable deck", prompt: `Executive narrative from FRAME v${current.frame.version}.`, locator }, { id: `asset-plan-${version}-infographic`, outputType: "infographic", title: "Evidence infographic", prompt: "One visual proof chain from source to output.", locator }, { id: `asset-plan-${version}-images`, outputType: "images", title: "Coherent visual batch", prompt: `Visual DNA palette ${current.style.accent}, ${current.style.ink}, ${current.style.paper}.`, locator }, { id: `asset-plan-${version}-storyboard`, outputType: "storyboard", title: "Editable meta-demo storyboard", prompt: "Capture, Map, approval, delivery, provenance.", locator }, { id: `asset-plan-${version}-video`, outputType: "video", title: "Narrated local video", prompt: "Render only after storyboard approval.", locator }]; return write({ ...current, assetPlan: { version, graphRevision: graph.revision, briefVersion: current.frame.version, styleVersion: current.style.version, visualDnaVersion: current.visualDna && !current.visualDna.stale ? current.visualDna.version : undefined, evidenceClaimIds: proof.map((item) => item.id), items: titles, stale: false, createdAt }, updatedAt: createdAt }, root); }
export function generateStoryboard(root?: string): WorkshopState { const current = readWorkshopState(root); if (!current.assetPlan || current.assetPlan.stale) throw new Error("Storyboard generation requires a current approved-input asset plan."); const plan = current.assetPlan; const panels = plan.items.map((item, index) => ({ id: `storyboard-v${current.storyboard.version + 1}-panel-${index + 1}`, title: item.title, narration: `${item.prompt} Evidence: ${item.locator}.`, durationSeconds: item.outputType === "video" ? 6 : 4, approved: true, stale: false })); return write({ ...current, storyboard: { version: current.storyboard.version + 1, panels, stale: false }, narration: current.narration ? { ...current.narration, stale: true } : undefined, storyboardApproved: false, videoState: "blocked", updatedAt: new Date().toISOString() }, root); }
export async function generateOutput(type: "deck" | "infographic", root?: string): Promise<WorkshopState> {
  const current = readWorkshopState(root);
  if (!current.briefApproved || !current.frame || current.frame.stale) throw new Error("Output generation requires an approved current brief.");
  if (!current.style || current.style.stale) throw new Error("Output generation requires a locked current style.");
  const dataRoot = root ?? repositoryDataRoot(); const claims = activeClaimsFor(current).slice(0, 4);
  const blocks = (claims.length ? claims : current.mapNodes.filter((node) => node.kind === "grounded").map((node) => ({ id: node.id, text: node.body, locator: node.locator }))).map((claim) => ({ id: claim.id, heading: claim.text.slice(0, 72), body: claim.text, citations: [claim.locator] }));
  const outputId = `${type}-v${current.outputs.filter((output) => output.type === type).length + 1}`;
  const rendered = await writeRenderedArtifact(dataRoot, outputId, type, { workshopTitle: current.title, version: `FRAME v${current.frame.version}`, style: { accent: current.style.accent, ink: current.style.ink, paper: current.style.paper }, blocks });
  const stored = await storeArtifact(dataRoot, outputId, Buffer.from(await readFile(join(dataRoot, rendered.relativePath))), "text/html"); const createdAt = new Date().toISOString();
  return write({ ...current, outputs: [...current.outputs, { id: outputId, type, relativePath: rendered.relativePath, artifactPath: stored.relativePath, claimIds: blocks.map((block) => block.id), stale: false, createdAt }], firstRenderedOutputAt: current.firstRenderedOutputAt ?? createdAt, updatedAt: createdAt }, root);
}
export function createImageBatch(root?: string): WorkshopState {
  const current = readWorkshopState(root); if (!current.style || current.style.stale) throw new Error("Image batch generation requires a locked current style.");
  const referenceId = `style-v${current.style.version}`; const createdAt = new Date().toISOString(); const prompts = ["editorial workbench", "source evidence detail", "semantic Map on paper", "approved brief", "storyboard panels", "finished delivery artifact"];
  return write({ ...current, imageBatch: { id: `image-batch-v${(current.imageBatch ? Number(current.imageBatch.id.match(/\d+$/)?.[0]) + 1 : 1)}`, styleVersion: current.style.version, referenceId, createdAt, stale: false, panels: prompts.map((prompt, index) => ({ id: `image-panel-${index + 1}`, version: 1, prompt: `${prompt}; ${current.style!.name}; ${current.style!.accent}; no text or logos`, state: "planned", referenceId })) }, updatedAt: createdAt }, root);
}
export function selectImagePanelForRegeneration(panelId: string, root?: string): WorkshopState {
  const current = readWorkshopState(root); if (!current.imageBatch || current.imageBatch.stale) throw new Error("A current image batch is required."); const found = current.imageBatch.panels.some((panel) => panel.id === panelId); if (!found) throw new Error(`Image panel not found: ${panelId}.`);
  return write({ ...current, imageBatch: { ...current.imageBatch, panels: current.imageBatch.panels.map((panel) => panel.id === panelId ? { ...panel, version: panel.version + 1, state: "selected_for_regeneration", error: undefined } : panel) }, updatedAt: new Date().toISOString() }, root);
}
export function markImagePanelFailed(panelId: string, error: string, root?: string): WorkshopState {
  const current = readWorkshopState(root); if (!current.imageBatch || current.imageBatch.stale) throw new Error("A current image batch is required."); const message = error.trim(); if (!message) throw new Error("A failed image panel requires an error message."); const found = current.imageBatch.panels.some((panel) => panel.id === panelId); if (!found) throw new Error(`Image panel not found: ${panelId}.`);
  return write({ ...current, imageBatch: { ...current.imageBatch, panels: current.imageBatch.panels.map((panel) => panel.id === panelId ? { ...panel, state: "failed", error: message } : panel) }, updatedAt: new Date().toISOString() }, root);
}
export function recordGeneratedImagePanel(panelId: string, artifact: Pick<ImageBatchPanel, "relativePath" | "sha256" | "provenance">, root?: string): WorkshopState {
  const current = readWorkshopState(root);
  if (!current.imageBatch || current.imageBatch.stale) throw new Error("A current image batch is required.");
  if (!artifact.relativePath || !artifact.sha256 || !artifact.provenance) throw new Error("Generated image provenance is incomplete.");
  if (!current.imageBatch.panels.some((panel) => panel.id === panelId)) throw new Error(`Image panel not found: ${panelId}.`);
  return write({ ...current, imageBatch: { ...current.imageBatch, panels: current.imageBatch.panels.map((panel) => panel.id === panelId ? { ...panel, ...artifact, state: "generated", error: undefined } : panel) }, updatedAt: new Date().toISOString() }, root);
}
export function recordNarration(narration: WorkshopNarration, root?: string): WorkshopState {
  const current = readWorkshopState(root);
  if (!current.storyboardApproved || current.storyboard.stale) throw new Error("Narration requires an approved current storyboard.");
  if (narration.storyboardVersion !== current.storyboard.version) throw new Error("Narration belongs to a different storyboard version.");
  const panelIds = new Set(current.storyboard.panels.map((panel) => panel.id));
  if (narration.panels.length !== panelIds.size || narration.panels.some((panel) => !panelIds.has(panel.panelId))) throw new Error("Narration must cover every current storyboard panel exactly once.");
  return write({ ...current, narration: { ...narration, stale: false }, videoState: "blocked", updatedAt: new Date().toISOString() }, root);
}
export function updateStoryboardPanel(panelId: string, patch: Pick<StoryboardPanel, "title" | "narration" | "durationSeconds">, root?: string): WorkshopState {
  const current = readWorkshopState(root); const index = current.storyboard.panels.findIndex((panel) => panel.id === panelId); if (index < 0) throw new Error(`Storyboard panel not found: ${panelId}.`);
  if (!patch.title.trim() || !patch.narration.trim() || patch.durationSeconds <= 0) throw new Error("Storyboard panel requires a title, narration, and positive duration.");
  const panels = [...current.storyboard.panels]; panels[index] = { ...panels[index], ...patch, approved: true, stale: false };
  return write({ ...current, storyboard: { version: current.storyboard.version + 1, panels, stale: false }, narration: current.narration ? { ...current.narration, stale: true } : undefined, storyboardApproved: false, videoState: "blocked", updatedAt: new Date().toISOString() }, root);
}
export function setVideoState(videoState: WorkshopState["videoState"], root?: string) { const current = readWorkshopState(root); const updatedAt = new Date().toISOString(); return write({ ...current, videoState, firstRenderedOutputAt: videoState === "rendered" ? current.firstRenderedOutputAt ?? updatedAt : current.firstRenderedOutputAt, updatedAt }, root); }
export function cancelVideoRender(root?: string): WorkshopState { const current = readWorkshopState(root); const db = dbFor(root); const job = db.prepare("SELECT id FROM job WHERE workshop_id=? AND kind='render_video' AND state IN ('queued','retrying') ORDER BY created_at DESC LIMIT 1").get(id) as { id: string } | undefined; if (!job || !cancelJob(db, job.id)) throw new Error("No queued video render is available to cancel."); return write({ ...current, videoState: "blocked", updatedAt: new Date().toISOString() }, root); }
export function applyWorkshopAction(action: "approveBrief" | "lockManualStyle" | "approveStoryboard" | "renderVideo", root?: string): WorkshopState {
  const current = readWorkshopState(root); const updatedAt = new Date().toISOString();
  if (action === "approveBrief") return write({ ...current, frame: frameFor(current, updatedAt, root), briefApproved: true, storyboardApproved: false, videoState: "blocked", updatedAt }, root);
  if (action === "lockManualStyle") return lockManualStyle({}, root);
  if (action === "approveStoryboard") {
    if (!current.briefApproved) throw new Error("Storyboard approval requires an approved current brief.");
    if (!current.style || current.style.stale) throw new Error("Storyboard approval requires a locked current style.");
    if (current.storyboard.stale || current.storyboard.panels.some((panel) => panel.stale || !panel.approved)) throw new Error("Storyboard approval requires current approved panels.");
    return write({ ...current, storyboardApproved: true, updatedAt }, root);
  }
  if (!current.storyboardApproved) throw new Error("Video render requires an approved current storyboard.");
  const db = dbFor(root); enqueue(db, { id: `job-video-${Date.now()}`, workshopId: id, kind: "render_video", inputKey: `storyboard-approved:${current.updatedAt}`, payload: { workshopId: id } });
  return write({ ...current, videoState: "queued", updatedAt }, root);
}
