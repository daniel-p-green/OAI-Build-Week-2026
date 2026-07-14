import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { appendGraphOperation, GraphOperation, parseGraphState, SemanticGraph, serializeGraphState, undoLatestGraphOperation, type SemanticGraph as SemanticGraphType } from "@workshoplm/domain";
import { openLocalDatabase } from "./db/client.js";
import { migrate } from "./db/migrate.js";
import { enqueue } from "./queue.js";

export type WorkshopSource = { id: string; type: "TXT" | "PDF" | "WEB"; title: string; origin: string; claimCount: number; excerpt: string; locator: string };
export type WorkshopMapNode = { id: string; title: string; body: string; kind: "grounded" | "derived" | "creative"; locator: string; x: number; y: number };
export type WorkshopFrame = { version: number; markdown: string; stale: boolean; approvedAt: string };
export type WorkshopStyle = { version: number; source: "manual"; name: string; accent: string; ink: string; paper: string; lockedAt: string; stale: boolean };
export type WorkshopState = { id: string; title: string; briefApproved: boolean; storyboardApproved: boolean; videoState: "blocked" | "queued" | "rendering" | "rendered"; sources: number; groundedClaims: number; sourceItems: WorkshopSource[]; mapNodes: WorkshopMapNode[]; frame?: WorkshopFrame; style?: WorkshopStyle; graphState?: string; updatedAt: string };
export type SourceIngestion = { title: string; origin: string; type?: WorkshopSource["type"]; text: string };
const id = "workshop-build-week";
const defaultState = (): WorkshopState => ({ id, title: "WorkshopLM Build Week", briefApproved: false, storyboardApproved: false, videoState: "blocked", sources: 3, groundedClaims: 5, sourceItems: [
  { id: "source-raw", type: "TXT", title: "Raw voice brainstorm", origin: "ChatGPT task", claimCount: 5, excerpt: "The judge should be able to see the messy original thought become a cited map, a real brief, and a finished piece of work.", locator: "ChatGPT task · 12:41 · chunk 04" },
  { id: "source-brief", type: "PDF", title: "Build Week brief", origin: "Local", claimCount: 3, excerpt: "One visible chain links capture, approved work, and finished delivery.", locator: "Build notes · §2" },
  { id: "source-design", type: "WEB", title: "WorkshopLM direction", origin: "Local", claimCount: 2, excerpt: "Evidence first becomes an editable production system, not a static report.", locator: "Design · Map" },
], mapNodes: [
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
  if (row) { const state = JSON.parse(row.state_json) as Partial<WorkshopState>; if (state.sourceItems && state.mapNodes) return state as WorkshopState; return write({ ...defaultState(), ...state, sourceItems: defaultState().sourceItems, mapNodes: defaultState().mapNodes } as WorkshopState, root); }
  const state = defaultState(); db.prepare("INSERT INTO workshop_state VALUES (?, ?, ?)").run(id, JSON.stringify(state), state.updatedAt); return state;
}
function write(next: WorkshopState, root?: string) { const db = dbFor(root); db.prepare("UPDATE workshop_state SET state_json=?, updated_at=? WHERE workshop_id=?").run(JSON.stringify(next), next.updatedAt, id); return next; }
function graphFor(state: WorkshopState): ReturnType<typeof parseGraphState> {
  if (state.graphState) return parseGraphState(state.graphState);
  const graph = SemanticGraph.parse({ id: "graph-workshop-build-week", workshopId: id, revision: 0, staleState: "current", nodes: state.mapNodes.map((node) => ({ id: `node-${node.id}`, kind: "claim", label: node.title, evidenceState: node.kind === "grounded" ? "verified" : node.kind, metadata: { body: node.body, locator: node.locator } })), edges: [] });
  return { schemaVersion: 1, graph, history: { graphVersionId: graph.id, records: [] } };
}
function mapNodesFor(graph: SemanticGraphType, existing: WorkshopMapNode[]): WorkshopMapNode[] {
  return graph.nodes.map((node, index) => { const prior = existing.find((item) => `node-${item.id}` === node.id); const metadata = node.metadata as { body?: unknown; locator?: unknown }; return { id: node.id.replace(/^node-/, ""), title: node.label, body: typeof metadata.body === "string" ? metadata.body : prior?.body ?? node.label, kind: node.evidenceState === "verified" ? "grounded" : node.evidenceState === "unverified" ? "derived" : node.evidenceState, locator: typeof metadata.locator === "string" ? metadata.locator : prior?.locator ?? "Map operation", x: prior?.x ?? 16 + (index * 15) % 65, y: prior?.y ?? 18 + (index * 19) % 58 }; });
}
function frameFor(state: WorkshopState, approvedAt: string): WorkshopFrame {
  const core = state.mapNodes.filter((node) => node.kind !== "creative").slice(0, 3);
  const evidence = core.map((node) => `- ${node.title}: ${node.body} (${node.locator})`).join("\n");
  return { version: (state.frame?.version ?? 0) + 1, approvedAt, stale: false, markdown: `# FRAME.md\n\n## Outcome\n${core[0]?.body ?? "Turn raw thinking into finished work."}\n\n## Evidence\n${evidence}\n\n## Production proof\nShow the approved Map, source locators, and a finished output in one continuous path.\n` };
}
export function applyMapOperation(operation: unknown, root?: string): WorkshopState {
  const current = readWorkshopState(root); const snapshot = graphFor(current); const parsed = GraphOperation.parse(operation);
  const applied = appendGraphOperation(snapshot.graph, snapshot.history, parsed, { id: `operation-${Date.now()}`, actor: "user", createdAt: new Date().toISOString() });
  return write({ ...current, graphState: serializeGraphState(applied.graph, applied.history), mapNodes: mapNodesFor(applied.graph, current.mapNodes), frame: current.frame ? { ...current.frame, stale: true } : undefined, briefApproved: false, storyboardApproved: false, videoState: "blocked", updatedAt: new Date().toISOString() }, root);
}
export function undoMapOperation(root?: string): WorkshopState {
  const current = readWorkshopState(root); const snapshot = graphFor(current); const undone = undoLatestGraphOperation(snapshot.graph, snapshot.history);
  return write({ ...current, graphState: serializeGraphState(undone.graph, undone.history), mapNodes: mapNodesFor(undone.graph, current.mapNodes), frame: current.frame ? { ...current.frame, stale: true } : undefined, briefApproved: false, storyboardApproved: false, videoState: "blocked", updatedAt: new Date().toISOString() }, root);
}
function normalizeSourceText(text: string) { return text.replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim(); }
function sourceClaimCount(text: string) { return Math.max(1, text.split(/[.!?]+/).map((sentence) => sentence.trim()).filter(Boolean).length); }
export async function ingestSource(input: SourceIngestion, root?: string): Promise<WorkshopState> {
  const text = normalizeSourceText(input.text);
  if (!text) throw new Error("Source text is required.");
  const title = input.title.trim();
  const origin = input.origin.trim();
  if (!title || !origin) throw new Error("Source title and origin are required.");
  const hash = createHash("sha256").update(`${origin}\n${text}`).digest("hex");
  const sourceId = `source-${hash.slice(0, 12)}`;
  const current = readWorkshopState(root);
  if (current.sourceItems.some((source) => source.id === sourceId)) return current;
  const dataRoot = root ?? repositoryDataRoot();
  const sourceDirectory = join(dataRoot, "sources");
  await mkdir(sourceDirectory, { recursive: true });
  await writeFile(join(sourceDirectory, `${hash}.txt`), text, "utf8");
  const claimCount = sourceClaimCount(text);
  const source: WorkshopSource = { id: sourceId, type: input.type ?? "TXT", title, origin, claimCount, excerpt: text.slice(0, 240), locator: `${origin} · normalized:${hash.slice(0, 12)}` };
  const node: WorkshopMapNode = { id: `evidence-${hash.slice(0, 12)}`, title, body: source.excerpt, kind: "grounded", locator: source.locator, x: 18 + (current.mapNodes.length * 13) % 64, y: 24 + (current.mapNodes.length * 17) % 54 };
  return write({ ...current, sources: current.sources + 1, groundedClaims: current.groundedClaims + claimCount, sourceItems: [...current.sourceItems, source], mapNodes: [...current.mapNodes, node], updatedAt: new Date().toISOString() }, root);
}
export function setVideoState(videoState: WorkshopState["videoState"], root?: string) { const current = readWorkshopState(root); return write({ ...current, videoState, updatedAt: new Date().toISOString() }, root); }
export function applyWorkshopAction(action: "approveBrief" | "lockManualStyle" | "approveStoryboard" | "renderVideo", root?: string): WorkshopState {
  const current = readWorkshopState(root); const updatedAt = new Date().toISOString();
  if (action === "approveBrief") return write({ ...current, frame: frameFor(current, updatedAt), briefApproved: true, storyboardApproved: false, videoState: "blocked", updatedAt }, root);
  if (action === "lockManualStyle") return write({ ...current, style: { version: (current.style?.version ?? 0) + 1, source: "manual", name: "Editorial thinking instrument", accent: "#1668E3", ink: "#171816", paper: "#F4F2EC", lockedAt: updatedAt, stale: false }, storyboardApproved: false, videoState: "blocked", updatedAt }, root);
  if (action === "approveStoryboard") {
    if (!current.briefApproved) throw new Error("Storyboard approval requires an approved current brief.");
    if (!current.style || current.style.stale) throw new Error("Storyboard approval requires a locked current style.");
    return write({ ...current, storyboardApproved: true, updatedAt }, root);
  }
  if (!current.storyboardApproved) throw new Error("Video render requires an approved current storyboard.");
  const db = dbFor(root); enqueue(db, { id: `job-video-${Date.now()}`, workshopId: id, kind: "render_video", inputKey: `storyboard-approved:${current.updatedAt}`, payload: { workshopId: id } });
  return write({ ...current, videoState: "queued", updatedAt }, root);
}
