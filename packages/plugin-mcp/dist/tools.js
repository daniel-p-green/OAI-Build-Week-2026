import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { basename, dirname, extname, join, resolve } from "node:path";
const object = (properties, required = []) => ({ type: "object", properties, ...(required.length ? { required } : {}) });
const readOnly = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };
const localWrite = { readOnlyHint: false, destructiveHint: false, openWorldHint: false };
const schema = `CREATE TABLE IF NOT EXISTS workshop (id TEXT PRIMARY KEY, title TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS job (id TEXT PRIMARY KEY, workshop_id TEXT NOT NULL, kind TEXT NOT NULL, input_key TEXT NOT NULL UNIQUE, state TEXT NOT NULL, lease_until TEXT, attempts INTEGER NOT NULL DEFAULT 0, payload_json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS workshop_state (workshop_id TEXT PRIMARY KEY, state_json TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE VIRTUAL TABLE IF NOT EXISTS evidence_fts USING fts5(workshop_id UNINDEXED, source_id UNINDEXED, chunk_id UNINDEXED, locator UNINDEXED, chunk_text, claim_text, tokenize='unicode61');`;
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
function requireWorkshop(database, workshopId) {
    if (!database)
        return { isError: true, text: "No local Workshop fixture exists. Run the local fixture reset before opening a Workshop." };
    const state = stateFor(database, workshopId);
    return state ?? { isError: true, text: `Workshop not found: ${workshopId}.` };
}
function isToolError(value) { return "text" in value; }
function graphRevision(state) { try {
    return Number(JSON.parse(state.graphState ?? "{}").graph?.revision ?? 0);
}
catch {
    return 0;
} }
function versionsFor(state) { return { mapVersion: `map-r${graphRevision(state)}`, storyboardVersion: `storyboard-v${state.storyboard?.version ?? 0}` }; }
function appUrl() {
    const url = new URL(process.env.WORKSHOPLM_APP_URL ?? "http://127.0.0.1:3000/");
    if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname))
        throw new Error("WORKSHOPLM_APP_URL must be a local HTTP address.");
    return url;
}
function serviceAction(body) {
    const url = new URL("/api/workshop", appUrl());
    try {
        const stdout = execFileSync("curl", ["--silent", "--show-error", "--fail-with-body", "--max-time", "15", "-X", "POST", "-H", "content-type: application/json", "--data-binary", JSON.stringify(body), url.toString()], { encoding: "utf8", maxBuffer: 2_000_000 });
        return JSON.parse(stdout);
    }
    catch (error) {
        const failure = error;
        let detail = failure.stderr?.trim() || failure.message || "Local Workshop service is unavailable.";
        try {
            detail = String(JSON.parse(failure.stdout ?? "{}").error ?? detail);
        }
        catch { /* keep the bounded local error */ }
        return { isError: true, text: `Workshop action failed: ${detail.slice(0, 500)}` };
    }
}
function actionResult(result, success, extra = {}) { return isToolError(result) ? result : { text: success, data: { workshop: result, ...versionsFor(result), ...extra } }; }
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
function queryTerms(query) { return [...new Set(query.toLocaleLowerCase().split(/[^\p{L}\p{N}_]+/u).filter((term) => term.length > 1))]; }
function ftsMatch(terms) { return terms.map((term) => `"${term.replaceAll('"', '""')}"`).join(" OR "); }
function fallbackEvidenceSearch(states, terms) {
    return states.flatMap((workshop) => (workshop.sourceChunks ?? []).map((chunk) => {
        const claims = (workshop.claims ?? []).filter((claim) => claim.sourceId === chunk.sourceId && claim.chunkId === chunk.id);
        const searchable = `${chunk.text}\n${claims.map((claim) => claim.text).join("\n")}`.toLocaleLowerCase();
        return { ...chunk, claims, score: terms.reduce((score, term) => score + (searchable.includes(term) ? 1 : 0), 0) };
    })).filter((result) => result.score > 0).sort((a, b) => b.score - a.score || a.ordinal - b.ordinal || a.id.localeCompare(b.id));
}
export function searchEvidence(query) {
    const terms = queryTerms(query);
    if (!terms.length)
        return [];
    const states = evidenceStates();
    const database = db();
    if (!database)
        return [];
    try {
        const available = database.prepare("SELECT 1 AS found FROM sqlite_master WHERE type='table' AND name='evidence_fts'").get();
        if (!available)
            return fallbackEvidenceSearch(states, terms);
        const rows = database.prepare("SELECT workshop_id, source_id, chunk_id, bm25(evidence_fts, 0.0, 0.0, 0.0, 0.0, 1.0, 0.7) AS rank FROM evidence_fts WHERE evidence_fts MATCH ? ORDER BY rank ASC, rowid ASC LIMIT 40").all(ftsMatch(terms));
        const stateById = new Map(states.map((state) => [state.id, state]));
        return rows.flatMap((row) => {
            const state = stateById.get(row.workshop_id);
            const chunk = state?.sourceChunks?.find((candidate) => candidate.sourceId === row.source_id && candidate.id === row.chunk_id);
            if (!state || !chunk)
                return [];
            const claims = (state.claims ?? []).filter((claim) => claim.sourceId === chunk.sourceId && claim.chunkId === chunk.id);
            return [{ ...chunk, claims, score: Math.max(0, -row.rank) }];
        });
    }
    finally {
        database.close();
    }
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
        return { text: workshops.length ? `Found ${workshops.length} local Workshop${workshops.length === 1 ? "" : "s"}.` : "No local Workshops found.", data: { workshops: workshops.map((workshop) => ({ ...workshop, ...versionsFor(workshop) })) } };
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
    if (name === "workshop_get_trace") {
        const artifactId = typeof arguments_.artifactId === "string" ? arguments_.artifactId : "";
        if (!artifactId)
            return { isError: true, text: "Trace lookup requires artifactId." };
        for (const state of evidenceStates()) {
            const output = state.outputs?.find((candidate) => candidate.id === artifactId);
            const video = state.videos?.find((candidate) => candidate.id === artifactId);
            const image = state.imageBatch?.panels.find((candidate) => candidate.id === artifactId);
            const claimIds = output?.claimIds ?? video?.claimIds ?? [];
            if (!output && !video && !image)
                continue;
            const claims = (state.claims ?? []).filter((claim) => claimIds.includes(claim.id));
            const evidence = claims.map((claim) => ({ claimId: claim.id, sourceId: claim.sourceId, chunkId: claim.chunkId, locator: claim.locator, text: claim.text }));
            return { text: `Found source trace for ${artifactId}.`, data: { trace: { artifactId, workshopId: state.id, stale: output?.stale ?? video?.stale ?? state.imageBatch?.stale ?? false, claimIds, evidence, buildTrace: video?.buildTrace } } };
        }
        return { isError: true, text: `Artifact trace not found: ${artifactId}.` };
    }
    const workshopId = typeof arguments_.workshopId === "string" ? arguments_.workshopId : "";
    const database = db();
    const state = requireWorkshop(database, workshopId);
    if (isToolError(state)) {
        database?.close();
        return state;
    }
    try {
        if (name === "workshop_open")
            return { text: `Opened local Workshop: ${state.title}.`, data: { workshop: state, ...versionsFor(state), url: appUrl().toString() } };
        if (name === "workshop_add_source") {
            const source = typeof arguments_.source === "string" ? arguments_.source.trim() : "";
            if (!source)
                return { isError: true, text: "Source import requires a local path or URL." };
            if (/^https?:\/\//i.test(source))
                return actionResult(serviceAction({ action: "ingestUrl", url: source }), `Imported and grounded ${source}.`);
            const path = resolve(source);
            if (!existsSync(path) || !statSync(path).isFile())
                return { isError: true, text: `Local source file not found: ${source}.` };
            if (statSync(path).size > 1_000_000)
                return { isError: true, text: "Local source exceeds the 1 MB plugin ingestion limit." };
            if (extname(path).toLowerCase() === ".pdf")
                return actionResult(serviceAction({ action: "ingestPdfFile", filePath: path, permission: "private" }), `Imported and grounded ${basename(path)}.`);
            const text = readFileSync(path, "utf8");
            return actionResult(serviceAction({ action: "ingestSource", source: { title: basename(path), origin: `Local file · ${basename(path)}`, type: "TXT", text, permission: "private" } }), `Imported and grounded ${basename(path)}.`);
        }
        if (name === "workshop_approve_brief") {
            const requested = typeof arguments_.mapVersion === "string" ? arguments_.mapVersion : "";
            const current = versionsFor(state).mapVersion;
            if (requested !== current)
                return { isError: true, text: `Map approval blocked: requested ${requested || "no version"}; current version is ${current}.` };
            return actionResult(serviceAction({ action: "approveBrief" }), "Map approved as the current executable brief.");
        }
        if (name === "workshop_approve_storyboard") {
            if (!state.briefApproved)
                return { isError: true, text: "Storyboard approval blocked: an approved current brief is required." };
            const requested = typeof arguments_.storyboardVersion === "string" ? arguments_.storyboardVersion : "";
            const current = versionsFor(state).storyboardVersion;
            if (!state.storyboard || state.storyboard.stale || requested !== current)
                return { isError: true, text: `Storyboard approval blocked: requested ${requested || "no version"}; current eligible version is ${current}.` };
            return actionResult(serviceAction({ action: "approveStoryboard" }), "Storyboard approved for local rendering.");
        }
        if (name === "workshop_render_video") {
            const requested = typeof arguments_.storyboardVersion === "string" ? arguments_.storyboardVersion : "";
            const current = versionsFor(state).storyboardVersion;
            if (!state.storyboardApproved || state.storyboard?.stale || requested !== current)
                return { isError: true, text: `Video render blocked: approved current ${current} is required.` };
            return actionResult(serviceAction({ action: "renderVideo" }), "Video render queued from the approved current storyboard.");
        }
        if (name === "workshop_create_output") {
            if (!state.briefApproved)
                return { isError: true, text: "Output creation blocked: approve the current Map as a brief first." };
            const outputType = arguments_.outputType;
            if (outputType === "deck" || outputType === "infographic")
                return actionResult(serviceAction({ action: "generateOutput", outputType }), `Created ${outputType}.`, { outputType });
            if (outputType === "images")
                return actionResult(serviceAction({ action: "createImageBatch" }), "Created coherent image plan.", { outputType });
            if (outputType === "storyboard") {
                if (!state.assetPlan || state.assetPlan.stale) {
                    const plan = serviceAction({ action: "generateAssetPlan" });
                    if (isToolError(plan))
                        return plan;
                }
                return actionResult(serviceAction({ action: "generateStoryboard" }), "Created editable Storyboard.", { outputType });
            }
            if (outputType === "video") {
                if (!state.storyboardApproved || state.storyboard?.stale)
                    return { isError: true, text: "Video creation blocked: approve the current Storyboard first." };
                return actionResult(serviceAction({ action: "renderVideo" }), "Video render queued from the approved current Storyboard.", { outputType });
            }
            return { isError: true, text: "Output type must be deck, infographic, images, storyboard, or video." };
        }
        return { isError: true, text: `Unknown WorkshopLM tool: ${name}.` };
    }
    finally {
        database?.close();
    }
}
