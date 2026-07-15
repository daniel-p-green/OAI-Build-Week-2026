#!/usr/bin/env node
import { createInterface } from "node:readline";
import { executeTool, toolDefinitions } from "./tools.js";
function response(id, result) { process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id, result })}\n`); }
export function handleRequest(request) {
    if (request.method === "initialize")
        return { protocolVersion: "2025-03-26", serverInfo: { name: "workshoplm", version: "0.1.2" }, capabilities: { tools: {} } };
    if (request.method === "tools/list")
        return { tools: toolDefinitions };
    if (request.method === "tools/call") {
        const result = executeTool(request.params?.name ?? "", request.params?.arguments);
        return { content: [{ type: "text", text: result.text }], structuredContent: result.data, isError: Boolean(result.isError) };
    }
    return { error: { code: -32601, message: "Method not found" } };
}
if (process.argv[1]?.endsWith("server.ts") || process.argv[1]?.endsWith("server.js")) {
    const input = createInterface({ input: process.stdin, crlfDelay: Infinity });
    input.on("line", (line) => {
        let request;
        try {
            request = JSON.parse(line);
        }
        catch {
            process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", error: { code: -32700, message: "Parse error" } })}\n`);
            return;
        }
        try {
            const result = handleRequest(request);
            if ("error" in result)
                process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: request.id, ...result })}\n`);
            else
                response(request.id, result);
        }
        catch {
            process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: request.id, error: { code: -32603, message: "Internal error" } })}\n`);
        }
    });
}
