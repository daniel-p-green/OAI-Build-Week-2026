import { spawn } from "node:child_process";
import { createInterface } from "node:readline";

export type JsonRpcClient = { request(method: string, params?: Record<string, unknown>): Promise<unknown>; close(): void };

/** Minimal local stdio JSON-RPC bridge. It is created only by explicit live verification. */
export function startAppServer(command = "codex", args = ["app-server"]): JsonRpcClient {
  const child = spawn(command, args, { stdio: ["pipe", "pipe", "pipe"] });
  const pending = new Map<number, { resolve(value: unknown): void; reject(error: Error): void }>();
  let sequence = 0;
  const lines = createInterface({ input: child.stdout });
  lines.on("line", (line) => {
    try {
      const message = JSON.parse(line) as { id?: number; result?: unknown; error?: { message?: string } };
      if (typeof message.id !== "number") return;
      const request = pending.get(message.id);
      if (!request) return;
      pending.delete(message.id);
      if (message.error) request.reject(new Error(message.error.message ?? "App-server request failed"));
      else request.resolve(message.result);
    } catch { /* Ignore non-JSON diagnostics from the local process. */ }
  });
  child.once("error", (error) => { for (const request of pending.values()) request.reject(error); pending.clear(); });
  return {
    request(method, params = {}) {
      const id = ++sequence;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        child.stdin.write(`${JSON.stringify({ jsonrpc: "2.0", id, method, params })}\n`);
      });
    },
    close() { lines.close(); child.kill(); },
  };
}
