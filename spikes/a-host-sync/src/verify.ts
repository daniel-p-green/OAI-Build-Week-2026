import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { writeSpikeReport, type SpikeReport } from "../../_shared/report.js";
import { assertNoCredentials, toSafeAccount } from "./account.js";
import { startAppServer } from "./app-server-client.js";

const startedAt = new Date().toISOString();
const root = resolve(import.meta.dirname, "../../..");
const liveEnabled = process.env.WORKSHOPLM_HOST_SYNC_LIVE === "1";
const requiredTaskId = process.env.WORKSHOPLM_HOST_TASK_ID;
let report: SpikeReport = {
  spike: "host-sync", startedAt, finishedAt: startedAt, status: "credential_blocked",
  checks: { explicitLiveOptIn: liveEnabled ? "passed" : "skipped", accountRead: "skipped", taskLinkage: "skipped", typedTurn: "skipped", nativeVoiceTurn: "skipped", tokenScan: "skipped" },
  measurements: { liveEnabled, taskIdProvided: Boolean(requiredTaskId) },
  fallback: "Activate capture-only gpt-realtime-2.1 fallback: native durable voice synchronization is not proven by this run.",
  sanitizedErrors: [],
};

try {
  if (!liveEnabled) throw new Error("Set WORKSHOPLM_HOST_SYNC_LIVE=1 to permit local app-server verification.");
  if (!requiredTaskId) throw new Error("Set WORKSHOPLM_HOST_TASK_ID to a disposable task ID; verification never guesses a current task.");
  const client = startAppServer();
  try {
    await client.request("initialize", { clientInfo: { name: "workshoplm-host-sync-spike", version: "0.0.0" } });
    const accountResponse = await client.request("account/read");
    assertNoCredentials(accountResponse);
    const account = toSafeAccount(accountResponse);
    report.checks.accountRead = account.accountType === "chatgpt" ? "passed" : "failed";
    report.checks.tokenScan = "passed";
    // Protocol task-turn subscription is deliberately not guessed: capture exact host support in the report.
    report.measurements.accountType = account.accountType;
    report.measurements.taskIdProvided = true;
    report.status = "fallback_active";
    report.fallback = "Native task-turn subscription/voice provenance was not proven by this conservative app-server probe; activate capture-only gpt-realtime-2.1 fallback.";
  } finally { client.close(); }
} catch (error) {
  report.sanitizedErrors.push(error instanceof Error ? error.message : "Unknown host-sync verification failure");
}
report.finishedAt = new Date().toISOString();
const reportPath = await writeSpikeReport(root, report, [process.env.WORKSHOPLM_HOST_TASK_ID ?? ""]);
console.log(JSON.stringify({ reportPath, status: report.status, fallback: report.fallback, checks: report.checks }, null, 2));
