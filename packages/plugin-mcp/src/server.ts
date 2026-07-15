#!/usr/bin/env node
import { createInterface } from "node:readline";
import { executeTool, toolDefinitions } from "./tools.js";

type Request = { id?: string | number; method: string; params?: { name?: string; arguments?: Record<string, unknown> } };
function response(id: Request["id"], result: unknown) { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`); }

export function handleRequest(request: Request): unknown {
  if (request.method === "initialize") return { protocolVersion: "2025-03-26", serverInfo: { name: "workshoplm", version: "0.1.3" }, capabilities: { tools: {} } };
  if (request.method === "tools/list") return { tools: toolDefinitions };
  if (request.method === "tools/call") {
    const result = executeTool(request.params?.name ?? "", request.params?.arguments);
    return { content: [{ type: "text", text: result.text }], structuredContent: result.data, isError: Boolean(result.isError) };
  }
  return { error: { code: -32601, message: "Method not found" } };
}

if (process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js")) {
  const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
  input.on("line", (line) => {
    let request: Request;
    try { request = JSON.parse(line) as Request; }
    catch { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" } })}\n`); return; }
    try {
      const result = handleRequest(request);
      if ("error" in (result as Record<string, unknown>)) process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: request.id, ...(result as object) })}\n`);
      else response(request.id, result);
    } catch { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: request.id, error: { code: -32603, message: "Internal error" } })}\n`); }
  });
}
