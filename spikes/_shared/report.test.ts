import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { sanitizeReport, writeSpikeReport } from "./report.js";

const report = {
  spike: "spike-a",
  startedAt: "2026-07-13T22:00:00.000Z",
  finishedAt: "2026-07-13T22:01:00.000Z",
  status: "fallback_active" as const,
  checks: { account: "passed" as const },
  measurements: { latencyMs: 10 },
  fallback: "capture-only realtime",
  sanitizedErrors: ["Bearer secret-value"],
};

describe("spike report", () => {
  it("serializes a sanitized report", async () => {
    const root = await mkdtemp(join(tmpdir(), "workshoplm-"));
    const path = await writeSpikeReport(root, report, ["secret-value"]);
    const output = await readFile(path, "utf8");
    await rm(root, { recursive: true, force: true });
    expect(output).toContain("[REDACTED]");
    expect(output).not.toContain("secret-value");
  });

  it("does not mutate the input report", () => {
    expect(sanitizeReport(report)).not.toBe(report);
    expect(report.sanitizedErrors[0]).toBe("Bearer secret-value");
  });
});
