import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { basename, dirname, extname, join, resolve } from "node:path";
import type { WorkshopToolDefinition, WorkshopToolName } from "@workshoplm/domain";

export type ToolDefinition = WorkshopToolDefinition;
export type WorkshopChunk = { id: string; sourceId: string; text: string; locator: string; ordinal: number };
export type WorkshopClaim = { id: string; sourceId: string; chunkId: string; text: string; evidenceState: "verified" | "derived" | "creative" | "unverified"; locator: string };
export type WorkshopState = { id: string; title: string; briefApproved: boolean; storyboardApproved: boolean; videoState: "blocked" | "queued" | "rendering" | "rendered"; sources: number; groundedClaims: number; sourceChunks?: WorkshopChunk[]; claims?: WorkshopClaim[]; graphState?: string; frame?: { stale: boolean; version: number }; style?: { stale: boolean; version: number }; assetPlan?: { stale: boolean; version: number }; storyboard?: { stale: boolean; version: number; panels?: Array<{ claimIds?: string[] }> }; outputs?: Array<{ id: string; claimIds: string[]; stale: boolean }>; audioOverviews?: Array<{ id: string; claimIds: string[]; stale: boolean }>; videos?: Array<{ id: string; claimIds: string[]; stale: boolean; buildTrace?: { htmlPath: string; dataPath: string } }>; imageBatch?: { id: string; stale: boolean; panels: Array<{ id: string; state: string; evidence?: Array<{ claimId?: string }> }> }; updatedAt: string };
export type ToolResult = { text: string; data?: Record<string, unknown>; isError?: boolean };

const workshopToolRegistry = JSON.parse(readFileSync(new URL("../../domain/workshop-tools.json", import.meta.url), "utf8")) as WorkshopToolDefinition[];
function workshopToolsForPlugin(): WorkshopToolDefinition[] { return workshopToolRegistry.filter((tool) => tool.channels.includes("plugin")); }
function parseWorkshopToolInput(name: WorkshopToolName, input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error(`${name} requires an object input`);
  const tool = workshopToolRegistry.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`Unknown Workshop tool: ${name}`);
  const value = input as Record<string, unknown>; const allowed = new Set(Object.keys(tool.inputSchema.properties));
  const extra = Object.keys(value).find((key) => !allowed.has(key));
  if (extra) throw new Error(`${name} does not accept ${extra}`);
  for (const required of tool.inputSchema.required ?? []) if (!(required in value)) throw new Error(`${name} requires ${required}`);
  return value;
}

const schema = `CREATE TABLE IF NOT EXISTS workshop (id TEXT PRIMARY KEY, title TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS app_setting (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS job (id TEXT PRIMARY KEY, workshop_id TEXT NOT NULL, kind TEXT NOT NULL, input_key TEXT NOT NULL UNIQUE, state TEXT NOT NULL, lease_until TEXT, attempts INTEGER NOT NULL DEFAULT 0, payload_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS workshop_state (workshop_id TEXT PRIMARY KEY, state_json TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE VIRTUAL TABLE IF NOT EXISTS evidence_fts USING fts5(workshop_id UNINDEXED, source_id UNINDEXED, chunk_id UNINDEXED, locator UNINDEXED, chunk_text, claim_text, tokenize='unicode61');`;

export const toolDefinitions: ToolDefinition[] = workshopToolsForPlugin();

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
  if (write) mkdirSync(dirname(path), { recursive: true });
  const database = new DatabaseSync(path);
  if (write) database.exec(schema);
  return database;
}
function stateFor(database: DatabaseSync, workshopId: string): WorkshopState | null {
  const row = database.prepare("SELECT state_json FROM workshop_state WHERE workshop_id=?").get(workshopId) as { state_json: string } | undefined;
  return row ? JSON.parse(row.state_json) as WorkshopState : null;
}
function requireWorkshop(database: DatabaseSync | null, workshopId: string): WorkshopState | ToolResult {
  if (!database) return { isError: true, text: "No local Workshop fixture exists. Run the local fixture reset before opening a Workshop." };
  const state = stateFor(database, workshopId);
  return state ?? { isError: true, text: `Workshop not found: ${workshopId}.` };
}
function isToolError(value: WorkshopState | ToolResult): value is ToolResult { return "text" in value; }
function graphRevision(state: WorkshopState): number { try { return Number((JSON.parse(state.graphState ?? "{}") as { graph?: { revision?: number } }).graph?.revision ?? 0); } catch { return 0; } }
function versionsFor(state: WorkshopState) { return { mapVersion: `map-r${graphRevision(state)}`, storyboardVersion: `storyboard-v${state.storyboard?.version ?? 0}` }; }
function appUrl(): URL {
  const url = new URL(process.env.WORKSHOPLM_APP_URL ?? "http://127.0.0.1:3000/");
  if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) throw new Error("WORKSHOPLM_APP_URL must be a local HTTP address.");
  return url;
}
function serviceAction(body: Record<string, unknown>): WorkshopState | ToolResult {
  const url = new URL("/api/workshop", appUrl());
  try {
    const stdout = execFileSync("curl", ["--silent", "--show-error", "--fail-with-body", "--max-time", "15", "-X", "POST", "-H", "content-type: application/json", "--data-binary", JSON.stringify(body), url.toString()], { encoding: "utf8", maxBuffer: 2_000_000 });
    return JSON.parse(stdout) as WorkshopState;
  } catch (error) {
    const failure = error as { stdout?: string; stderr?: string; message?: string };
    let detail = failure.stderr?.trim() || failure.message || "Local Workshop service is unavailable.";
    try { detail = String((JSON.parse(failure.stdout ?? "{}") as { error?: string }).error ?? detail); } catch { /* keep the bounded local error */ }
    return { isError: true, text: `Workshop action failed: ${detail.slice(0, 500)}` };
  }
}
function actionResult(result: WorkshopState | ToolResult, success: string, extra: Record<string, unknown> = {}): ToolResult { return isToolError(result) ? result : { text: success, data: { workshop: result, ...versionsFor(result), ...extra } }; }

export function listWorkshops(): WorkshopState[] {
  const database = db();
  if (!database) return [];
  try {
    return (database.prepare("SELECT state_json FROM workshop_state ORDER BY updated_at DESC").all() as Array<{ state_json: string }>).map((row) => JSON.parse(row.state_json) as WorkshopState);
  } finally { database.close(); }
}

function evidenceStates(): WorkshopState[] { return listWorkshops(); }
function scopedEvidenceStates(workshopId?: string): WorkshopState[] {
  const states = evidenceStates();
  if (workshopId) return states.filter((state) => state.id === workshopId);
  const database = db();
  if (!database) return states.slice(0, 1);
  try {
    const available = database.prepare("SELECT 1 AS found FROM sqlite_master WHERE type='table' AND name='app_setting'").get();
    const row = available ? database.prepare("SELECT value FROM app_setting WHERE key='active_workshop_id'").get() as { value: string } | undefined : undefined;
    return row ? states.filter((state) => state.id === row.value) : states.slice(0, 1);
  } finally { database.close(); }
}
function queryTerms(query: string): string[] { return [...new Set(query.toLocaleLowerCase().split(/[^\p{L}\p{N}_]+/u).filter((term) => term.length > 1))]; }
function ftsMatch(terms: string[]): string { return terms.map((term) => `"${term.replaceAll('"', '""')}"`).join(" OR "); }
function fallbackEvidenceSearch(states: WorkshopState[], terms: string[]): Array<WorkshopChunk & { claims: WorkshopClaim[]; score: number }> {
  return states.flatMap((workshop) => (workshop.sourceChunks ?? []).map((chunk) => {
    const claims = (workshop.claims ?? []).filter((claim) => claim.sourceId === chunk.sourceId && claim.chunkId === chunk.id);
    const searchable = `${chunk.text}\n${claims.map((claim) => claim.text).join("\n")}`.toLocaleLowerCase();
    return { ...chunk, claims, score: terms.reduce((score, term) => score + (searchable.includes(term) ? 1 : 0), 0) };
  })).filter((result) => result.score > 0).sort((a, b) => b.score - a.score || a.ordinal - b.ordinal || a.id.localeCompare(b.id));
}

export function searchEvidence(query: string, workshopId?: string): Array<WorkshopChunk & { workshopId: string; claims: WorkshopClaim[]; score: number }> {
  const terms = queryTerms(query);
  if (!terms.length) return [];
  const states = scopedEvidenceStates(workshopId); const database = db();
  if (!database) return [];
  try {
    const available = database.prepare("SELECT 1 AS found FROM sqlite_master WHERE type='table' AND name='evidence_fts'").get() as { found: number } | undefined;
    if (!available) return fallbackEvidenceSearch(states, terms).flatMap((result) => { const state = states.find((candidate) => candidate.sourceChunks?.some((chunk) => chunk.sourceId === result.sourceId && chunk.id === result.id)); return state ? [{ ...result, workshopId: state.id }] : []; });
    if (!states.length) return [];
    const placeholders = states.map(() => "?").join(",");
    const rows = database.prepare(`SELECT workshop_id, source_id, chunk_id, bm25(evidence_fts, 0.0, 0.0, 0.0, 0.0, 1.0, 0.7) AS rank FROM evidence_fts WHERE evidence_fts MATCH ? AND workshop_id IN (${placeholders}) ORDER BY rank ASC, rowid ASC LIMIT 40`).all(ftsMatch(terms), ...states.map((state) => state.id)) as Array<{ workshop_id: string; source_id: string; chunk_id: string; rank: number }>;
    const stateById = new Map(states.map((state) => [state.id, state]));
    return rows.flatMap((row) => {
      const state = stateById.get(row.workshop_id); const chunk = state?.sourceChunks?.find((candidate) => candidate.sourceId === row.source_id && candidate.id === row.chunk_id);
      if (!state || !chunk) return [];
      const claims = (state.claims ?? []).filter((claim) => claim.sourceId === chunk.sourceId && claim.chunkId === chunk.id);
      return [{ ...chunk, workshopId: state.id, claims, score: Math.max(0, -row.rank) }];
    });
  } finally { database.close(); }
}

export function fetchEvidence(sourceId: string, chunkId: string, workshopId?: string): (WorkshopChunk & { workshopId: string; claims: WorkshopClaim[] }) | null {
  for (const workshop of scopedEvidenceStates(workshopId)) {
    const chunk = (workshop.sourceChunks ?? []).find((candidate) => candidate.sourceId === sourceId && candidate.id === chunkId);
    if (chunk) return { ...chunk, workshopId: workshop.id, claims: (workshop.claims ?? []).filter((claim) => claim.sourceId === sourceId && claim.chunkId === chunkId) };
  }
  return null;
}

export function executeTool(name: string, arguments_: Record<string, unknown> = {}): ToolResult {
  const definition = toolDefinitions.find((tool) => tool.name === name);
  if (!definition) return { isError: true, text: `Unknown Workshop tool: ${name}.` };
  try { arguments_ = parseWorkshopToolInput(definition.name, arguments_); }
  catch (error) { return { isError: true, text: error instanceof Error ? error.message : "Invalid Workshop tool input." }; }
  if (name === "workshop_list") {
    const workshops = listWorkshops();
    return { text: workshops.length ? `Found ${workshops.length} local Workshop${workshops.length === 1 ? "" : "s"}.` : "No local Workshops found.", data: { workshops: workshops.map((workshop) => ({ ...workshop, ...versionsFor(workshop) })) } };
  }
  if (name === "workshop_create") {
    const title = typeof arguments_.title === "string" ? arguments_.title.trim() : "";
    if (!title) return { isError: true, text: "Workshop creation requires a non-empty title." };
    const created = serviceAction({ action: "createWorkshop", title });
    return actionResult(created, isToolError(created) ? "" : `Created local Workshop: ${created.title}.`);
  }
  if (name === "search") {
    const query = typeof arguments_.query === "string" ? arguments_.query.trim() : "";
    if (!query) return { isError: true, text: "Search requires a non-empty query." };
    const results = searchEvidence(query, typeof arguments_.workshopId === "string" ? arguments_.workshopId : undefined);
    return { text: results.length ? `Found ${results.length} grounded evidence chunk${results.length === 1 ? "" : "s"}.` : "No grounded evidence matched the query.", data: { results } };
  }
  if (name === "fetch") {
    const sourceId = typeof arguments_.sourceId === "string" ? arguments_.sourceId : "";
    const chunkId = typeof arguments_.chunkId === "string" ? arguments_.chunkId : "";
    if (!sourceId || !chunkId) return { isError: true, text: "Fetch requires sourceId and chunkId." };
    const result = fetchEvidence(sourceId, chunkId, typeof arguments_.workshopId === "string" ? arguments_.workshopId : undefined);
    return result ? { text: `Fetched grounded evidence chunk ${result.id}.`, data: { result } } : { isError: true, text: `Evidence chunk not found: ${sourceId}/${chunkId}.` };
  }
  if (name === "workshop_get_trace") {
    const artifactId = typeof arguments_.artifactId === "string" ? arguments_.artifactId : "";
    if (!artifactId) return { isError: true, text: "Trace lookup requires artifactId." };
    for (const state of scopedEvidenceStates(typeof arguments_.workshopId === "string" ? arguments_.workshopId : undefined)) {
      const output = state.outputs?.find((candidate) => candidate.id === artifactId);
      const video = state.videos?.find((candidate) => candidate.id === artifactId);
      const image = state.imageBatch?.panels.find((candidate) => candidate.id === artifactId);
      const audioOverview = state.audioOverviews?.find((candidate) => candidate.id === artifactId);
      const claimIds = output?.claimIds ?? video?.claimIds ?? audioOverview?.claimIds ?? image?.evidence?.flatMap((reference) => reference.claimId ? [reference.claimId] : []) ?? [];
      if (!output && !video && !image && !audioOverview) continue;
      const claims = (state.claims ?? []).filter((claim) => claimIds.includes(claim.id));
      const evidence = claims.map((claim) => ({ claimId: claim.id, sourceId: claim.sourceId, chunkId: claim.chunkId, locator: claim.locator, text: claim.text }));
      return { text: `Found source trace for ${artifactId}.`, data: { trace: { artifactId, workshopId: state.id, stale: output?.stale ?? video?.stale ?? audioOverview?.stale ?? state.imageBatch?.stale ?? false, claimIds, evidence, buildTrace: video?.buildTrace } } };
    }
    return { isError: true, text: `Artifact trace not found: ${artifactId}.` };
  }
  const workshopId = typeof arguments_.workshopId === "string" ? arguments_.workshopId : "";
  const database = db();
  const state = requireWorkshop(database, workshopId);
  if (isToolError(state)) { database?.close(); return state; }
  try {
    if (name === "workshop_open") {
      const selected = serviceAction({ action: "selectWorkshop", workshopId });
      return isToolError(selected) ? selected : { text: `Opened local Workshop: ${selected.title}.`, data: { workshop: selected, ...versionsFor(selected), url: appUrl().toString() } };
    }
    if (name === "workshop_add_source") {
      const source = typeof arguments_.source === "string" ? arguments_.source.trim() : "";
      if (!source) return { isError: true, text: "Source import requires a local path or URL." };
      if (/^https?:\/\//i.test(source)) return actionResult(serviceAction({ action: "ingestUrl", workshopId, url: source }), `Imported and grounded ${source}.`);
      const path = resolve(source);
      if (!existsSync(path) || !statSync(path).isFile()) return { isError: true, text: `Local source file not found: ${source}.` };
      if (statSync(path).size > 1_000_000) return { isError: true, text: "Local source exceeds the 1 MB plugin ingestion limit." };
      if (extname(path).toLowerCase() === ".pdf") return actionResult(serviceAction({ action: "ingestPdfFile", workshopId, filePath: path, permission: "private" }), `Imported and grounded ${basename(path)}.`);
      const text = readFileSync(path, "utf8");
      return actionResult(serviceAction({ action: "ingestSource", workshopId, source: { title: basename(path), origin: `Local file · ${basename(path)}`, type: "TXT", text, permission: "private" } }), `Imported and grounded ${basename(path)}.`);
    }
    if (name === "workshop_set_source_scope") {
      const sourceIds = Array.isArray(arguments_.sourceIds) ? arguments_.sourceIds.filter((value): value is string => typeof value === "string") : [];
      if (!sourceIds.length) return { isError: true, text: "Source scope requires at least one Source ID." };
      return actionResult(serviceAction({ action: "setActiveSourceScope", workshopId, sourceIds }), `Updated the active source scope to ${sourceIds.length} Source${sourceIds.length === 1 ? "" : "s"}.`);
    }
    if (name === "workshop_approve_brief") {
      const requested = typeof arguments_.mapVersion === "string" ? arguments_.mapVersion : ""; const current = versionsFor(state).mapVersion;
      if (requested !== current) return { isError: true, text: `Map approval blocked: requested ${requested || "no version"}; current version is ${current}.` };
      return actionResult(serviceAction({ action: "approveBrief", workshopId }), "Map approved as the current executable brief.");
    }
    if (name === "workshop_approve_storyboard") {
      if (!state.briefApproved) return { isError: true, text: "Storyboard approval blocked: an approved current brief is required." };
      const requested = typeof arguments_.storyboardVersion === "string" ? arguments_.storyboardVersion : ""; const current = versionsFor(state).storyboardVersion;
      if (!state.storyboard || state.storyboard.stale || requested !== current) return { isError: true, text: `Storyboard approval blocked: requested ${requested || "no version"}; current eligible version is ${current}.` };
      return actionResult(serviceAction({ action: "approveStoryboard", workshopId }), "Storyboard approved for local rendering.");
    }
    if (name === "workshop_render_video") {
      const requested = typeof arguments_.storyboardVersion === "string" ? arguments_.storyboardVersion : ""; const current = versionsFor(state).storyboardVersion;
      if (!state.storyboardApproved || state.storyboard?.stale || requested !== current) return { isError: true, text: `Video render blocked: approved current ${current} is required.` };
      return actionResult(serviceAction({ action: "renderVideo", workshopId }), "Video render queued from the approved current storyboard.");
    }
    if (name === "workshop_create_output") {
      if (!state.briefApproved) return { isError: true, text: "Output creation blocked: approve the current Map as a brief first." };
      const outputType = arguments_.outputType;
      if (outputType === "deck" || outputType === "infographic") return actionResult(serviceAction({ action: "generateOutput", workshopId, outputType }), `Created ${outputType}.`, { outputType });
      if (outputType === "audio_overview") return actionResult(serviceAction({ action: "generateAudioOverview", workshopId }), "Created grounded Audio Overview script.", { outputType });
      if (outputType === "images") return actionResult(serviceAction({ action: "createImageBatch", workshopId }), "Created coherent image plan.", { outputType });
      if (outputType === "storyboard") {
        if (!state.assetPlan || state.assetPlan.stale) { const plan = serviceAction({ action: "generateAssetPlan", workshopId }); if (isToolError(plan)) return plan; }
        return actionResult(serviceAction({ action: "generateStoryboard", workshopId }), "Created editable Storyboard.", { outputType });
      }
      if (outputType === "video") {
        if (!state.storyboardApproved || state.storyboard?.stale) return { isError: true, text: "Video creation blocked: approve the current Storyboard first." };
        return actionResult(serviceAction({ action: "renderVideo", workshopId }), "Video render queued from the approved current Storyboard.", { outputType });
      }
      return { isError: true, text: "Output type must be deck, infographic, audio_overview, images, storyboard, or video." };
    }
    return { isError: true, text: `Unknown WorkshopLM tool: ${name}.` };
  } finally { database?.close(); }
}
