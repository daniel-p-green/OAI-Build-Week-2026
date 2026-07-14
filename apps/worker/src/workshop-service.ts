import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { openLocalDatabase } from "./db/client.js";
import { migrate } from "./db/migrate.js";
import { enqueue } from "./queue.js";

export type WorkshopSource = { id: string; type: "TXT" | "PDF" | "WEB"; title: string; origin: string; claimCount: number; excerpt: string; locator: string };
export type WorkshopMapNode = { id: "promise" | "proof" | "visual" | "risk"; title: string; body: string; kind: "grounded" | "derived" | "creative"; locator: string; x: number; y: number };
export type WorkshopState = { id: string; title: string; briefApproved: boolean; storyboardApproved: boolean; videoState: "blocked" | "queued" | "rendering" | "rendered"; sources: number; groundedClaims: number; sourceItems: WorkshopSource[]; mapNodes: WorkshopMapNode[]; updatedAt: string };
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
export function setVideoState(videoState: WorkshopState["videoState"], root?: string) { const current = readWorkshopState(root); return write({ ...current, videoState, updatedAt: new Date().toISOString() }, root); }
export function applyWorkshopAction(action: "approveBrief" | "approveStoryboard" | "renderVideo", root?: string): WorkshopState {
  const current = readWorkshopState(root); const updatedAt = new Date().toISOString();
  if (action === "approveBrief") return write({ ...current, briefApproved: true, updatedAt }, root);
  if (action === "approveStoryboard") {
    if (!current.briefApproved) throw new Error("Storyboard approval requires an approved current brief.");
    return write({ ...current, storyboardApproved: true, updatedAt }, root);
  }
  if (!current.storyboardApproved) throw new Error("Video render requires an approved current storyboard.");
  const db = dbFor(root); enqueue(db, { id: `job-video-${Date.now()}`, workshopId: id, kind: "render_video", inputKey: `storyboard-approved:${current.updatedAt}`, payload: { workshopId: id } });
  return write({ ...current, videoState: "queued", updatedAt }, root);
}
