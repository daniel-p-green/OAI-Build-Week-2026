import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
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
  database.exec("CREATE TABLE workshop (id TEXT PRIMARY KEY, title TEXT NOT NULL, created_at TEXT NOT NULL); CREATE TABLE workshop_state (workshop_id TEXT PRIMARY KEY, state_json TEXT NOT NULL, updated_at TEXT NOT NULL);");
  const state = { id: "workshop-build-week", title: "Sanitized Build Week", briefApproved: false, storyboardApproved: false, videoState: "blocked", sources: 3, groundedClaims: 5, updatedAt: "2026-07-14T00:00:00.000Z" };
  database.prepare("INSERT INTO workshop VALUES (?, ?, ?)").run(state.id, state.title, state.updatedAt);
  database.prepare("INSERT INTO workshop_state VALUES (?, ?, ?)").run(state.id, JSON.stringify(state), state.updatedAt);
  database.close();
  return root;
}

async function request(root: string, lines: object[]): Promise<Array<Record<string, any>>> {
  const child = spawn(tsx, [server], { cwd: repositoryRoot, env: { ...process.env, WORKSHOPLM_DATA_ROOT: root }, stdio: ["pipe", "pipe", "pipe"] });
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

afterEach(async () => { await Promise.all(temporaryRoots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });

describe("WorkshopLM stdio MCP server", () => {
  it("initializes, lists tools, and reads the persisted sanitized fixture", async () => {
    const root = await fixture();
    const results = await request(root, [
      { jsonrpc: "2.0", id: 1, method: "initialize" },
      { jsonrpc: "2.0", id: 2, method: "tools/list" },
      { jsonrpc: "2.0", id: 3, method: "tools/call", params: { name: "workshop_list", arguments: {} } },
      { jsonrpc: "2.0", id: 4, method: "tools/call", params: { name: "workshop_open", arguments: { workshopId: "workshop-build-week" } } },
    ]);
    expect(results[0]!.result.serverInfo.name).toBe("workshoplm");
    expect(results[1]!.result.tools.map((tool: { name: string }) => tool.name)).toContain("workshop_render_video");
    expect(results[2]!.result.structuredContent.workshops[0].title).toBe("Sanitized Build Week");
    expect(results[3]!.result.structuredContent.url).toBe("http://127.0.0.1:3000/workshops/workshop-build-week");
  });

  it("returns explicit gate errors and persists valid mutation outcomes", async () => {
    const root = await fixture();
    const call = (id: number, name: string) => ({ jsonrpc: "2.0", id, method: "tools/call", params: { name, arguments: { workshopId: "workshop-build-week", mapVersion: "map-v1", storyboardVersion: "storyboard-v1" } } });
    const results = await request(root, [call(1, "workshop_approve_storyboard"), call(2, "workshop_approve_brief"), call(3, "workshop_approve_storyboard"), call(4, "workshop_render_video")]);
    expect(results[0]!.result).toMatchObject({ isError: true });
    expect(results[0]!.result.content[0].text).toMatch(/blocked/);
    expect(results[1]!.result.structuredContent.workshop.briefApproved).toBe(true);
    expect(results[2]!.result.structuredContent.workshop.storyboardApproved).toBe(true);
    expect(results[3]!.result.structuredContent.workshop.videoState).toBe("queued");
  });
});
