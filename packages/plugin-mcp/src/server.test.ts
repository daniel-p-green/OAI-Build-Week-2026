import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { fileURLToPath } from "node:url";
import { afterEach, describe, expect, it } from "vitest";

const repositoryRoot = resolve(fileURLToPath(new URL(".", import.meta.url)), "../../..");
const server = resolve(repositoryRoot, "packages/plugin-mcp/src/server.ts");
const tsx = resolve(repositoryRoot, "node_modules/.bin/tsx");
const temporaryRoots: string[] = [];

async function fixture(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "workshoplm-plugin-")); temporaryRoots.push(root);
  await mkdir(join(root, "data"));
  const database = new DatabaseSync(join(root, "data", "workshoplm.sqlite"));
  database.exec("CREATE TABLE workshop (id TEXT PRIMARY KEY, title TEXT NOT NULL, created_at TEXT NOT NULL); CREATE TABLE workshop_state (workshop_id TEXT PRIMARY KEY, state_json TEXT NOT NULL, updated_at TEXT NOT NULL); CREATE VIRTUAL TABLE evidence_fts USING fts5(workshop_id UNINDEXED, source_id UNINDEXED, chunk_id UNINDEXED, locator UNINDEXED, chunk_text, claim_text, tokenize='unicode61');");
  const state = { id: "workshop-build-week", title: "Sanitized Build Week", briefApproved: false, storyboardApproved: false, videoState: "blocked", sources: 3, groundedClaims: 1, sourceChunks: [{ id: "chunk-evidence-1", sourceId: "source-brief", text: "The approved Map keeps evidence visible for judges.", locator: "Sanitized brief · chunk 01", ordinal: 1 }], claims: [{ id: "claim-evidence-1", sourceId: "source-brief", chunkId: "chunk-evidence-1", text: "Evidence remains visible for judges", evidenceState: "verified", locator: "Sanitized brief · chunk 01" }], storyboard: { version: 1, stale: false, panels: [] }, updatedAt: "2026-07-14T00:00:00.000Z" };
  database.prepare("INSERT INTO workshop VALUES (?, ?, ?)").run(state.id, state.title, state.updatedAt);
  database.prepare("INSERT INTO workshop_state VALUES (?, ?, ?)").run(state.id, JSON.stringify(state), state.updatedAt);
  database.prepare("INSERT INTO evidence_fts (workshop_id, source_id, chunk_id, locator, chunk_text, claim_text) VALUES (?, ?, ?, ?, ?, ?)").run(state.id, "source-brief", "chunk-evidence-1", "Sanitized brief · chunk 01", "The approved Map keeps evidence visible for judges.", "Evidence remains visible for judges");
  database.close();
  return root;
}

async function request(root: string, lines: object[], appUrl?: string): Promise<Array<Record<string, any>>> {
  const child = spawn(tsx, [server], { cwd: repositoryRoot, env: { ...process.env, WORKSHOPLM_DATA_ROOT: root, ...(appUrl ? { WORKSHOPLM_APP_URL: appUrl } : {}) }, stdio: ["pipe", "pipe", "pipe"] });
  const output: Array<Record<string, any>> = [];
  let pending = "";
  child.stdout.setEncoding("utf8");
  child.stdout.on("data", (chunk: string) => {
    pending += chunk;
    const completed = pending.split("\n"); pending = completed.pop() ?? "";
    for (const line of completed.filter(Boolean)) output.push(JSON.parse(line));
  });
  for (const line of lines) child.stdin.write(`${JSON.stringify(line)}\n`);
  child.stdin.end();
  await new Promise<void>((resolvePromise, reject) => { child.once("error", reject); child.once("close", () => resolvePromise()); });
  return output;
}

async function localWorkshopService(root: string) {
  const actions: string[] = [];
  const http = createServer((request_, response_) => {
    let input = ""; request_.setEncoding("utf8"); request_.on("data", (chunk) => { input += chunk; }); request_.on("end", () => {
      const body = JSON.parse(input) as { action: string }; actions.push(body.action);
      const database = new DatabaseSync(join(root, "data", "workshoplm.sqlite"));
      const row = database.prepare("SELECT state_json FROM workshop_state WHERE workshop_id=?").get("workshop-build-week") as { state_json: string };
      const state = JSON.parse(row.state_json) as Record<string, any>;
      const next = body.action === "approveBrief" ? { ...state, briefApproved: true }
        : body.action === "approveStoryboard" ? { ...state, storyboardApproved: true }
        : body.action === "renderVideo" ? { ...state, videoState: "queued" }
        : state;
      next.updatedAt = new Date().toISOString(); database.prepare("UPDATE workshop_state SET state_json=?, updated_at=? WHERE workshop_id=?").run(JSON.stringify(next), next.updatedAt, next.id); database.close();
      response_.writeHead(200, { "content-type": "application/json" }); response_.end(JSON.stringify(next));
    });
  });
  await new Promise<void>((resolvePromise) => http.listen(0, "127.0.0.1", resolvePromise));
  const address = http.address(); if (!address || typeof address === "string") throw new Error("Local test service did not bind a TCP port.");
  return { actions, url: `http://127.0.0.1:${address.port}/`, close: () => new Promise<void>((resolvePromise, reject) => http.close((error) => error ? reject(error) : resolvePromise())) };
}

afterEach(async () => { await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });

describe("WorkshopLM stdio MCP server", () => {
  it("initializes, lists tools, and reads the persisted sanitized fixture", async () => {
    const root = await fixture();
    const results = await request(root, [
      { jsonrpc: "2.0", id: 1, method: "initialize" },
      { jsonrpc: "2.0", id: 2, method: "tools/list" },
      { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "workshop_list", arguments: {} } },
      { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "workshop_open", arguments: { workshopId: "workshop-build-week" } } },
      { jsonrpc: "2.0", id: 5, method: "tools/call", params: { name: "search", arguments: { query: "evidence judges" } } },
      { jsonrpc: "2.0", id: 6, method: "tools/call", params: { name: "fetch", arguments: { sourceId: "source-brief", chunkId: "chunk-evidence-1" } } },
    ]);
    expect(results[0]!.result.serverInfo.name).toBe("workshoplm");
    expect(results[1]!.result.tools.map((tool: { name: string }) => tool.name)).toContain("workshop_render_video");
    expect(results[2]!.result.structuredContent.workshops[0].title).toBe("Sanitized Build Week");
    expect(results[3]!.result.structuredContent.url).toBe("http://127.0.0.1:3000/");
    expect(results[4]!.result.structuredContent.results[0]).toMatchObject({ id: "chunk-evidence-1", claims: [{ id: "claim-evidence-1", evidenceState: "verified" }], score: expect.any(Number) });
    expect(results[4]!.result.structuredContent.results[0].score).toBeGreaterThan(0);
    expect(results[5]!.result.structuredContent.result).toMatchObject({ sourceId: "source-brief", id: "chunk-evidence-1", locator: "Sanitized brief · chunk 01" });
  });

  it("returns explicit gate errors and persists valid mutation outcomes", async () => {
    const root = await fixture();
    const service = await localWorkshopService(root);
    const call = (id: number, name: string) => ({ jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: { workshopId: "workshop-build-week", mapVersion: "map-v1", storyboardVersion: "storyboard-v1" } } });
    const brief = { ...call(2, "workshop_approve_brief"), params: { name: "workshop_approve_brief", arguments: { workshopId: "workshop-build-week", mapVersion: "map-r0" } } };
    const staleBrief = { ...call(5, "workshop_approve_brief"), params: { name: "workshop_approve_brief", arguments: { workshopId: "workshop-build-week", mapVersion: "map-r99" } } };
    const results = await request(root, [call(1, "workshop_approve_storyboard"), staleBrief, brief, call(3, "workshop_approve_storyboard"), call(4, "workshop_render_video")], service.url);
    await service.close();
    expect(results[0]!.result).toMatchObject({ isError: true });
    expect(results[0]!.result.content[0].text).toMatch(/blocked/);
    expect(results[1]!.result).toMatchObject({ isError: true });
    expect(results[1]!.result.content[0].text).toContain("current version is map-r0");
    expect(results[2]!.result.structuredContent.workshop.briefApproved).toBe(true);
    expect(results[3]!.result.structuredContent.workshop.storyboardApproved).toBe(true);
    expect(results[4]!.result.structuredContent.workshop.videoState).toBe("queued");
    expect(service.actions).toEqual(["approveBrief", "approveStoryboard", "renderVideo"]);
  });

  it("creates a workshop when the configured data root is empty", async () => {
    const root = await mkdtemp(join(tmpdir(), "workshoplm-plugin-empty-")); temporaryRoots.push(root);
    const results = await request(root, [
      { jsonrpc: "2.0", id: 1, method: "tools/call", params: { name: "workshop_create", arguments: { title: "Installed Plugin Smoke Test" } } },
      { jsonrpc: "2.0", id: 2, method: "tools/call", params: { name: "workshop_list", arguments: {} } },
    ]);
    expect(results[0]!.result).toMatchObject({ isError: false, structuredContent: { workshop: { id: "workshop-installed-plugin-smoke-test" } } });
    expect(results[1]!.result.structuredContent.workshops).toHaveLength(1);
  });
});
