import { existsSync, mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { dirname, join, resolve } from "node:path";
const object = (properties, required = []) => ({ type: "object", properties, ...(required.length ? { required } : {}) });
const readOnly = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };
const localWrite = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };
const schema = `CREATE TABLE IF NOT EXISTS workshop (id TEXT PRIMARY KEY, title TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS job (id TEXT PRIMARY KEY, workshop_id TEXT NOT NULL, kind TEXT NOT NULL, input_key TEXT NOT NULL UNIQUE, state TEXT NOT NULL, lease_until TEXT, attempts INTEGER NOT NULL DEFAULT 0, payload_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS workshop_state (workshop_id TEXT PRIMARY KEY, state_json TEXT NOT NULL, updated_at TEXT NOT NULL);`;
export const toolDefinitions = [
    { name: "workshop_list", kind: "read", description: "Use this when you need to list local Workshop summaries without changing them.", inputSchema: object({}), annotations: readOnly },
    { name: "workshop_create", kind: "write", description: "Use this when the user asks to create a local Workshop.", inputSchema: object({ title: { type: "string" } }, ["title"]), annotations: localWrite },
    { name: "workshop_open", kind: "read", description: "Use this when you need the local URL and current status for one Workshop.", inputSchema: object({ workshopId: { type: "string" } }, ["workshopId"]), annotations: readOnly },
    { name: "workshop_add_source", kind: "write", description: "Use this when the user asks to import a sanctioned local file or URL into a Workshop.", inputSchema: object({ workshopId: { type: "string" }, source: { type: "string" } }, ["workshopId", "source"]), annotations: localWrite },
    { name: "search", kind: "read", description: "Use this when you need to search normalized local source evidence without changing it.", inputSchema: object({ query: { type: "string" } }, ["query"]), annotations: readOnly },
    { name: "fetch", kind: "read", description: "Use this when you need to retrieve one exact normalized evidence chunk and its linked claims.", inputSchema: object({ sourceId: { type: "string" }, chunkId: { type: "string" } }, ["sourceId", "chunkId"]), annotations: readOnly },
    { name: "workshop_get_trace", kind: "read", description: "Use this when you need to inspect an artifact-to-claim-to-source trace without changing it.", inputSchema: object({ artifactId: { type: "string" } }, ["artifactId"]), annotations: readOnly },
    { name: "workshop_approve_brief", kind: "write", description: "Use this only when the user asks to approve the current eligible Map as the Brief.", inputSchema: object({ workshopId: { type: "string" }, mapVersion: { type: "string" } }, ["workshopId", "mapVersion"]), annotations: localWrite },
    { name: "workshop_create_output", kind: "write", description: "Use this when the user asks to create one typed Output from approved current state.", inputSchema: object({ workshopId: { type: "string" }, outputType: { enum: ["deck", "infographic", "images", "storyboard", "video"] } }, ["workshopId", "outputType"]), annotations: localWrite },
    { name: "workshop_approve_storyboard", kind: "write", description: "Use this only when the user asks to approve the current Storyboard version.", inputSchema: object({ workshopId: { type: "string" }, storyboardVersion: { type: "string" } }, ["workshopId", "storyboardVersion"]), annotations: localWrite },
    { name: "workshop_render_video", kind: "write", description: "Use this when the user asks to render Video from an approved current Storyboard.", inputSchema: object({ workshopId: { type: "string" }, storyboardVersion: { type: "string" } }, ["workshopId", "storyboardVersion"]), annotations: localWrite },
];
export function mutationGate(tool, state) {
    if (tool === "workshop_approve_brief" && !state.mapCurrent)
        return "Map approval blocked: the requested Map version is stale or ineligible.";
    if (tool === "workshop_render_video" && (!state.storyboardApproved || !state.storyboardCurrent))
        return "Video render blocked: storyboard approval and current version are required.";
    return null;
}
function dataRoot() { return resolve(process.env.WORKSHOPLM_DATA_ROOT ?? join(process.cwd(), ".workshoplm")); }
function databasePath() { return join(dataRoot(), "data", "workshoplm.sqlite"); }
function db(write = false) {
    const path = databasePath();
    if (!write && !existsSync(path))
        return null;
    if (write)
        mkdirSync(dirname(path), { recursive: true });
    const database = new DatabaseSync(path);
    if (write)
        database.exec(schema);
    return database;
}
function stateFor(database, workshopId) {
    const row = database.prepare("SELECT state_json FROM workshop_state WHERE workshop_id=?").get(workshopId);
    return row ? JSON.parse(row.state_json) : null;
}
function save(database, state) {
    database.prepare("UPDATE workshop_state SET state_json=?, updated_at=? WHERE workshop_id=?").run(JSON.stringify(state), state.updatedAt, state.id);
}
function requireWorkshop(database, workshopId) {
    if (!database)
        return { isError: true, text: "No local Workshop fixture exists. Run the local fixture reset before opening a Workshop." };
    const state = stateFor(database, workshopId);
    return state ?? { isError: true, text: `Workshop not found: ${workshopId}.` };
}
function isToolError(value) { return "text" in value; }
export function listWorkshops() {
    const database = db();
    if (!database)
        return [];
    try {
        return database.prepare("SELECT state_json FROM workshop_state ORDER BY updated_at DESC").all().map((row) => JSON.parse(row.state_json));
    }
    finally {
        database.close();
    }
}
function evidenceStates() { return listWorkshops(); }
function queryTerms(query) { return query.toLocaleLowerCase().split(/\W+/).filter((term) => term.length > 1); }
export function searchEvidence(query) {
    const terms = queryTerms(query);
    if (!terms.length)
        return [];
    return evidenceStates().flatMap((workshop) => (workshop.sourceChunks ?? []).map((chunk) => {
        const claims = (workshop.claims ?? []).filter((claim) => claim.sourceId === chunk.sourceId && claim.chunkId === chunk.id);
        const searchable = `${chunk.text}\n${claims.map((claim) => claim.text).join("\n")}`.toLocaleLowerCase();
        return { ...chunk, claims, score: terms.reduce((score, term) => score + (searchable.includes(term) ? 1 : 0), 0) };
    })).filter((result) => result.score > 0).sort((a, b) => b.score - a.score || a.ordinal - b.ordinal || a.id.localeCompare(b.id));
}
export function fetchEvidence(sourceId, chunkId) {
    for (const workshop of evidenceStates()) {
        const chunk = (workshop.sourceChunks ?? []).find((candidate) => candidate.sourceId === sourceId && candidate.id === chunkId);
        if (chunk)
            return { ...chunk, claims: (workshop.claims ?? []).filter((claim) => claim.sourceId === sourceId && claim.chunkId === chunkId) };
    }
    return null;
}
export function executeTool(name, arguments_ = {}) {
    if (name === "workshop_list") {
        const workshops = listWorkshops();
        return { text: workshops.length ? `Found ${workshops.length} local Workshop${workshops.length === 1 ? "" : "s"}.` : "No local Workshops found.", data: { workshops } };
    }
    if (name === "workshop_create") {
        const title = typeof arguments_.title === "string" ? arguments_.title.trim() : "";
        if (!title)
            return { isError: true, text: "Workshop creation requires a non-empty title." };
        const workshopId = `workshop-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "untitled"}`;
        const database = db(true);
        const now = new Date().toISOString();
        try {
            if (stateFor(database, workshopId))
                return { isError: true, text: `Workshop already exists: ${workshopId}.` };
            const state = { id: workshopId, title, briefApproved: false, storyboardApproved: false, videoState: "blocked", sources: 0, groundedClaims: 0, updatedAt: now };
            database.prepare("INSERT INTO workshop VALUES (?, ?, ?)").run(state.id, state.title, now);
            database.prepare("INSERT INTO workshop_state VALUES (?, ?, ?)").run(state.id, JSON.stringify(state), now);
            return { text: `Created local Workshop: ${state.id}.`, data: { workshop: state } };
        }
        finally {
            database.close();
        }
    }
    if (name === "search") {
        const query = typeof arguments_.query === "string" ? arguments_.query.trim() : "";
        if (!query)
            return { isError: true, text: "Search requires a non-empty query." };
        const results = searchEvidence(query);
        return { text: results.length ? `Found ${results.length} grounded evidence chunk${results.length === 1 ? "" : "s"}.` : "No grounded evidence matched the query.", data: { results } };
    }
    if (name === "fetch") {
        const sourceId = typeof arguments_.sourceId === "string" ? arguments_.sourceId : "";
        const chunkId = typeof arguments_.chunkId === "string" ? arguments_.chunkId : "";
        if (!sourceId || !chunkId)
            return { isError: true, text: "Fetch requires sourceId and chunkId." };
        const result = fetchEvidence(sourceId, chunkId);
        return result ? { text: `Fetched grounded evidence chunk ${result.id}.`, data: { result } } : { isError: true, text: `Evidence chunk not found: ${sourceId}/${chunkId}.` };
    }
    if (name === "workshop_get_trace")
        return { text: "workshop_get_trace has no artifact fixture result yet.", data: { results: [] } };
    const workshopId = typeof arguments_.workshopId === "string" ? arguments_.workshopId : "";
    const database = db(name !== "workshop_open");
    const state = requireWorkshop(database, workshopId);
    if (isToolError(state)) {
        database?.close();
        return state;
    }
    try {
        if (name === "workshop_open")
            return { text: `Opened local Workshop: ${state.title}.`, data: { workshop: state, url: `http://127.0.0.1:3000/workshops/${encodeURIComponent(state.id)}` } };
        if (name === "workshop_add_source") {
            if (typeof arguments_.source !== "string" || !arguments_.source.trim())
                return { isError: true, text: "Source import requires a local path or URL." };
            const next = { ...state, sources: state.sources + 1, updatedAt: new Date().toISOString() };
            save(database, next);
            return { text: `Source accepted for ${state.id}; normalization is queued locally.`, data: { workshop: next } };
        }
        if (name === "workshop_approve_brief") {
            const next = { ...state, briefApproved: true, updatedAt: new Date().toISOString() };
            save(database, next);
            return { text: "Map approved as the current executable brief.", data: { workshop: next } };
        }
        if (name === "workshop_approve_storyboard") {
            if (!state.briefApproved)
                return { isError: true, text: "Storyboard approval blocked: an approved current brief is required." };
            const next = { ...state, storyboardApproved: true, updatedAt: new Date().toISOString() };
            save(database, next);
            return { text: "Storyboard approved for local rendering.", data: { workshop: next } };
        }
        if (name === "workshop_render_video") {
            if (!state.storyboardApproved)
                return { isError: true, text: "Video render blocked: storyboard approval and current version are required." };
            const next = { ...state, videoState: "queued", updatedAt: new Date().toISOString() };
            save(database, next);
            return { text: "Video render queued from the approved current storyboard.", data: { workshop: next } };
        }
        if (name === "workshop_create_output") {
            if (!state.briefApproved)
                return { isError: true, text: "Output creation blocked: approve the current Map as a brief first." };
            return { text: `Output request accepted for ${String(arguments_.outputType ?? "output")}.`, data: { workshop: state, outputType: arguments_.outputType ?? null } };
        }
        return { isError: true, text: `Unknown WorkshopLM tool: ${name}.` };
    }
    finally {
        database?.close();
    }
}
