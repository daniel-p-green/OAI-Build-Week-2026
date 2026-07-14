import { existsSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { join, resolve } from "node:path";

export type ToolKind = "read" | "write";
export type ToolDefinition = { name: string; kind: ToolKind; description: string; inputSchema: { type: "object"; properties: Record<string, unknown>; required?: string[] } };
export type WorkshopState = { id: string; title: string; briefApproved: boolean; storyboardApproved: boolean; videoState: "blocked" | "queued" | "rendering" | "rendered"; sources: number; groundedClaims: number; updatedAt: string };
export type ToolResult = { text: string; data?: Record<string, unknown>; isError?: boolean };

const object = (properties: Record<string, unknown>, required: string[] = []) => ({ type: "object" as const, properties, ...(required.length ? { required } : {}) });
const schema = `CREATE TABLE IF NOT EXISTS workshop (id TEXT PRIMARY KEY, title TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS job (id TEXT PRIMARY KEY, workshop_id TEXT NOT NULL, kind TEXT NOT NULL, input_key TEXT NOT NULL UNIQUE, state TEXT NOT NULL, lease_until TEXT, attempts INTEGER NOT NULL DEFAULT 0, payload_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS workshop_state (workshop_id TEXT PRIMARY KEY, state_json TEXT NOT NULL, updated_at TEXT NOT NULL);`;

export const toolDefinitions: ToolDefinition[] = [
  { name: "workshop_list", kind: "read", description: "List local Workshop summaries.", inputSchema: object({}) },
  { name: "workshop_create", kind: "write", description: "Create a local Workshop.", inputSchema: object({ title: { type: "string" } }, ["title"]) },
  { name: "workshop_open", kind: "read", description: "Return the local Workshop URL and status.", inputSchema: object({ workshopId: { type: "string" } }, ["workshopId"]) },
  { name: "workshop_add_source", kind: "write", description: "Import a sanctioned local file or URL.", inputSchema: object({ workshopId: { type: "string" }, source: { type: "string" } }, ["workshopId", "source"]) },
  { name: "search", kind: "read", description: "Search normalized source evidence.", inputSchema: object({ query: { type: "string" } }, ["query"]) },
  { name: "fetch", kind: "read", description: "Fetch a normalized evidence chunk.", inputSchema: object({ sourceId: { type: "string" }, chunkId: { type: "string" } }, ["sourceId", "chunkId"]) },
  { name: "workshop_get_trace", kind: "read", description: "Read artifact to claim to source traceability.", inputSchema: object({ artifactId: { type: "string" } }, ["artifactId"]) },
  { name: "workshop_approve_brief", kind: "write", description: "Approve only the current eligible Map version.", inputSchema: object({ workshopId: { type: "string" }, mapVersion: { type: "string" } }, ["workshopId", "mapVersion"]) },
  { name: "workshop_create_output", kind: "write", description: "Enqueue one typed output from approved current state.", inputSchema: object({ workshopId: { type: "string" }, outputType: { enum: ["deck", "infographic", "images", "storyboard", "video"] } }, ["workshopId", "outputType"]) },
  { name: "workshop_approve_storyboard", kind: "write", description: "Approve only the current storyboard version.", inputSchema: object({ workshopId: { type: "string" }, storyboardVersion: { type: "string" } }, ["workshopId", "storyboardVersion"]) },
  { name: "workshop_render_video", kind: "write", description: "Render only an approved, current storyboard.", inputSchema: object({ workshopId: { type: "string" }, storyboardVersion: { type: "string" } }, ["workshopId", "storyboardVersion"]) },
];

export function mutationGate(tool: string, state: { mapCurrent?: boolean; storyboardApproved?: boolean; storyboardCurrent?: boolean }) {
  if (tool === "workshop_approve_brief" && !state.mapCurrent) return "Map approval blocked: the requested Map version is stale or ineligible.";
  if (tool === "workshop_render_video" && (!state.storyboardApproved || !state.storyboardCurrent)) return "Video render blocked: storyboard approval and current version are required.";
  return null;
}

function dataRoot(): string { return resolve(process.env.WORKSHOPLM_DATA_ROOT ?? join(process.cwd(), ".workshoplm")); }
function databasePath(): string { return join(dataRoot(), "data", "workshoplm.sqlite"); }
function db(write = false): DatabaseSync | null {
  const path = databasePath();
  if (!write && !existsSync(path)) return null;
  const database = new DatabaseSync(path);
  if (write) database.exec(schema);
  return database;
}
function stateFor(database: DatabaseSync, workshopId: string): WorkshopState | null {
  const row = database.prepare("SELECT state_json FROM workshop_state WHERE workshop_id=?").get(workshopId) as { state_json: string } | undefined;
  return row ? JSON.parse(row.state_json) as WorkshopState : null;
}
function save(database: DatabaseSync, state: WorkshopState): void {
  database.prepare("UPDATE workshop_state SET state_json=?, updated_at=? WHERE workshop_id=?").run(JSON.stringify(state), state.updatedAt, state.id);
}
function requireWorkshop(database: DatabaseSync | null, workshopId: string): WorkshopState | ToolResult {
  if (!database) return { isError: true, text: "No local Workshop fixture exists. Run the local fixture reset before opening a Workshop." };
  const state = stateFor(database, workshopId);
  return state ?? { isError: true, text: `Workshop not found: ${workshopId}.` };
}
function isToolError(value: WorkshopState | ToolResult): value is ToolResult { return "text" in value; }

export function listWorkshops(): WorkshopState[] {
  const database = db();
  if (!database) return [];
  try {
    return (database.prepare("SELECT state_json FROM workshop_state ORDER BY updated_at DESC").all() as Array<{ state_json: string }>).map((row) => JSON.parse(row.state_json) as WorkshopState);
  } finally { database.close(); }
}

export function executeTool(name: string, arguments_: Record<string, unknown> = {}): ToolResult {
  if (name === "workshop_list") {
    const workshops = listWorkshops();
    return { text: workshops.length ? `Found ${workshops.length} local Workshop${workshops.length === 1 ? "" : "s"}.` : "No local Workshops found.", data: { workshops } };
  }
  if (name === "workshop_create") {
    const title = typeof arguments_.title === "string" ? arguments_.title.trim() : "";
    if (!title) return { isError: true, text: "Workshop creation requires a non-empty title." };
    const workshopId = `workshop-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "untitled"}`;
    const database = db(true)!; const now = new Date().toISOString();
    try {
      if (stateFor(database, workshopId)) return { isError: true, text: `Workshop already exists: ${workshopId}.` };
      const state: WorkshopState = { id: workshopId, title, briefApproved: false, storyboardApproved: false, videoState: "blocked", sources: 0, groundedClaims: 0, updatedAt: now };
      database.prepare("INSERT INTO workshop VALUES (?, ?, ?)").run(state.id, state.title, now);
      database.prepare("INSERT INTO workshop_state VALUES (?, ?, ?)").run(state.id, JSON.stringify(state), now);
      return { text: `Created local Workshop: ${state.id}.`, data: { workshop: state } };
    } finally { database.close(); }
  }
  if (["search", "fetch", "workshop_get_trace"].includes(name)) return { text: `${name} has no normalized fixture result yet.`, data: { results: [] } };
  const workshopId = typeof arguments_.workshopId === "string" ? arguments_.workshopId : "";
  const database = db(name !== "workshop_open");
  const state = requireWorkshop(database, workshopId);
  if (isToolError(state)) { database?.close(); return state; }
  try {
    if (name === "workshop_open") return { text: `Opened local Workshop: ${state.title}.`, data: { workshop: state, url: `http://127.0.0.1:3000/workshops/${encodeURIComponent(state.id)}` } };
    if (name === "workshop_add_source") {
      if (typeof arguments_.source !== "string" || !arguments_.source.trim()) return { isError: true, text: "Source import requires a local path or URL." };
      const next = { ...state, sources: state.sources + 1, updatedAt: new Date().toISOString() }; save(database!, next);
      return { text: `Source accepted for ${state.id}; normalization is queued locally.`, data: { workshop: next } };
    }
    if (name === "workshop_approve_brief") {
      const next = { ...state, briefApproved: true, updatedAt: new Date().toISOString() }; save(database!, next);
      return { text: "Map approved as the current executable brief.", data: { workshop: next } };
    }
    if (name === "workshop_approve_storyboard") {
      if (!state.briefApproved) return { isError: true, text: "Storyboard approval blocked: an approved current brief is required." };
      const next = { ...state, storyboardApproved: true, updatedAt: new Date().toISOString() }; save(database!, next);
      return { text: "Storyboard approved for local rendering.", data: { workshop: next } };
    }
    if (name === "workshop_render_video") {
      if (!state.storyboardApproved) return { isError: true, text: "Video render blocked: storyboard approval and current version are required." };
      const next = { ...state, videoState: "queued" as const, updatedAt: new Date().toISOString() }; save(database!, next);
      return { text: "Video render queued from the approved current storyboard.", data: { workshop: next } };
    }
    if (name === "workshop_create_output") {
      if (!state.briefApproved) return { isError: true, text: "Output creation blocked: approve the current Map as a brief first." };
      return { text: `Output request accepted for ${String(arguments_.outputType ?? "output")}.`, data: { workshop: state, outputType: arguments_.outputType ?? null } };
    }
    return { isError: true, text: `Unknown WorkshopLM tool: ${name}.` };
  } finally { database?.close(); }
}
