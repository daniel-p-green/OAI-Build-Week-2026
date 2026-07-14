#!/usr/bin/env node
import { createInterface } from "node:readline";
import { mutationGate, toolDefinitions } from "./tools.js";

type Request = { id?: string | number; method: string; params?: { name?: string; arguments?: Record<string, unknown> } };
function response(id: Request["id"], result: unknown) { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`); }

const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
input.on("line", (line) => {
  try {
    const request = JSON.parse(line) as Request;
    if (request.method === "initialize") return response(request.id, { protocolVersion: "2025-03-26", serverInfo: { name: "workshoplm", version: "0.1.0" }, capabilities: { tools: {} } });
    if (request.method === "tools/list") return response(request.id, { tools: toolDefinitions });
    if (request.method === "tools/call") {
      const name = request.params?.name ?? "";
      const gate = mutationGate(name, { mapCurrent: false, storyboardApproved: false, storyboardCurrent: false });
      return response(request.id, { content: [{ type: "text", text: gate ?? `${name} is available through the local Workshop workspace.` }], isError: Boolean(gate) });
    }
    response(request.id, { error: { code: -32601, message: "Method not found" } });
  } catch { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" } })}\n`); }
});
