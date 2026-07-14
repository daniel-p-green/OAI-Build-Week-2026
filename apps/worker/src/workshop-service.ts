import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { openLocalDatabase } from "./db/client.js";
import { migrate } from "./db/migrate.js";
import { enqueue } from "./queue.js";

export type WorkshopState = { id: string; title: string; briefApproved: boolean; storyboardApproved: boolean; videoState: "blocked" | "queued" | "rendering" | "rendered"; sources: number; groundedClaims: number; updatedAt: string };
const id = "workshop-build-week";
const defaultState = (): WorkshopState => ({ id, title: "WorkshopLM Build Week", briefApproved: false, storyboardApproved: false, videoState: "blocked", sources: 3, groundedClaims: 5, updatedAt: new Date().toISOString() });
const repositoryDataRoot = () => resolve(process.env.WORKSHOPLM_DATA_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", ".workshoplm"));
function dbFor(root = repositoryDataRoot()) { const db = openLocalDatabase(join(root, "data", "workshoplm.sqlite")); migrate(db); return db; }
export function readWorkshopState(root?: string): WorkshopState {
  const db = dbFor(root); const createdAt = new Date().toISOString();
  db.prepare("INSERT OR IGNORE INTO workshop VALUES (?, ?, ?)").run(id, "WorkshopLM Build Week", createdAt);
  const row = db.prepare("SELECT state_json FROM workshop_state WHERE workshop_id=?").get(id) as { state_json: string } | undefined;
  if (row) return JSON.parse(row.state_json) as WorkshopState;
  const state = defaultState(); db.prepare("INSERT INTO workshop_state VALUES (?, ?, ?)").run(id, JSON.stringify(state), state.updatedAt); return state;
}
function write(next: WorkshopState, root?: string) { const db = dbFor(root); db.prepare("UPDATE workshop_state SET state_json=?, updated_at=? WHERE workshop_id=?").run(JSON.stringify(next), next.updatedAt, id); return next; }
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
