import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { redact } from "./redact.js";

export type SpikeStatus = "passed" | "fallback_active" | "credential_blocked" | "failed";

export type SpikeReport = {
  spike: string;
  startedAt: string;
  finishedAt: string;
  status: SpikeStatus;
  checks: Record<string, "passed" | "failed" | "skipped">;
  measurements: Record<string, number | string | boolean>;
  fallback?: string;
  sanitizedErrors: string[];
};

export function sanitizeReport(report: SpikeReport, secrets: readonly string[] = []): SpikeReport {
  return redact(report, secrets) as SpikeReport;
}

export async function writeSpikeReport(
  root: string,
  report: SpikeReport,
  secrets: readonly string[] = [],
): Promise<string> {
  const safe = sanitizeReport(report, secrets);
  const timestamp = safe.finishedAt.replace(/[:.]/g, "-");
  const path = join(root, "artifacts", "spikes", `${safe.spike}-${timestamp}.json`);
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, `${JSON.stringify(safe, null, 2)}\n`, "utf8");
  return path;
}
