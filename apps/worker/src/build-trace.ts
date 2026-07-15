import { createHash } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { workshopGeneratedPath, type WorkshopState } from "./workshop-service.js";

const execFile = promisify(execFileCallback);
const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const sha256 = (value: Uint8Array | string) => createHash("sha256").update(value).digest("hex");
const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

type BuildMilestone = { occurredAt: string; title: string };
type BuildCommit = { hash: string; committedAt: string; subject: string };

export type WorkshopBuildTrace = {
  schemaVersion: 1;
  createdAt: string;
  workshop: {
    id: string;
    title: string;
    activeSources: number;
    groundedClaims: number;
    sources: { title: string; origin: string; locator: string; permission: string }[];
    transcript: { origin: string; capturedAt: string; excerpt: string }[];
  };
  video: { id: string; version: number; sha256: string; byteCount: number };
  inputs: { mapNodes: number; mapEdges: number; briefVersion?: number; styleVersion?: number; visualDnaVersion?: number; assetPlanVersion?: number; storyboardVersion: number; imageBatchId?: string };
  outputs: { id: string; type: string; sha256?: string; claimIds: string[] }[];
  elapsedSeconds?: number;
  build: { milestoneCount: number; milestones: BuildMilestone[]; commitCount: number; commits: BuildCommit[]; taskIds: string[] };
  providerEvidence: { realtimeTurns: number; gpt56Runs: number; gptImage2Panels: number; narrationPanels: number };
  limitations: string[];
};

export type WrittenBuildTrace = {
  htmlPath: string;
  dataPath: string;
  htmlSha256: string;
  dataSha256: string;
  milestoneCount: number;
  commitCount: number;
  taskIds: string[];
};

function milestonesFrom(log: string): BuildMilestone[] {
  return [...log.matchAll(/^## (\d{4}-\d{2}-\d{2} \d{2}:\d{2} CT) — (.+)$/gm)].map((match) => ({ occurredAt: match[1]!, title: match[2]!.trim() }));
}

function taskIdsFrom(log: string): string[] {
  return [...new Set(log.match(/\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi) ?? [])].sort();
}

async function buildCommits(): Promise<BuildCommit[]> {
  try {
    const { stdout } = await execFile("git", ["-C", repositoryRoot, "log", "--since=2026-07-13T00:00:00-05:00", "--pretty=format:%h%x09%cI%x09%s"]);
    return stdout.split("\n").filter(Boolean).map((line) => { const [hash = "", committedAt = "", ...subject] = line.split("\t"); return { hash, committedAt, subject: subject.join("\t") }; });
  } catch {
    return [];
  }
}

function limitationsFor(state: WorkshopState, providerEvidence: WorkshopBuildTrace["providerEvidence"]): string[] {
  const limitations: string[] = [];
  if (!state.transcriptSegments.length) limitations.push("No durable transcript segment is present; the recorded fixture begins from a sanitized brainstorm Source.");
  if (!providerEvidence.realtimeTurns) limitations.push("No provider-verified Realtime microphone turn is present.");
  if (!providerEvidence.gpt56Runs) limitations.push("No live GPT-5.6 reasoning run is present.");
  if (!state.imageBatch?.panels.length || providerEvidence.gptImage2Panels !== state.imageBatch.panels.length) limitations.push(`GPT Image 2 evidence covers ${providerEvidence.gptImage2Panels} of ${state.imageBatch?.panels.length ?? 0} image panels.`);
  if (providerEvidence.narrationPanels !== state.storyboard.panels.length) limitations.push("The rendered Video does not contain complete provider-generated narration evidence.");
  limitations.push("A primary Devpost /feedback Session ID has not been recorded on this surface.");
  return limitations;
}

function traceHtml(trace: WorkshopBuildTrace): string {
  const recentMilestones = trace.build.milestones.slice(-18).reverse();
  const recentCommits = trace.build.commits.slice(0, 18);
  const limitationList = trace.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const milestoneRows = recentMilestones.map((milestone) => `<li><time>${escapeHtml(milestone.occurredAt)}</time><strong>${escapeHtml(milestone.title)}</strong></li>`).join("");
  const commitRows = recentCommits.map((commit) => `<li><code>${escapeHtml(commit.hash)}</code><span>${escapeHtml(commit.subject)}</span><time>${escapeHtml(commit.committedAt)}</time></li>`).join("");
  const taskRows = trace.build.taskIds.length ? trace.build.taskIds.map((taskId) => `<code>${escapeHtml(taskId)}</code>`).join("") : "<span>Not exposed on this surface</span>";
  const sourceRows = trace.workshop.sources.map((source) => `<li><strong>${escapeHtml(source.title)}</strong><span>${escapeHtml(source.origin)} · ${escapeHtml(source.locator)} · ${escapeHtml(source.permission)}</span></li>`).join("");
  const transcriptRows = trace.workshop.transcript.map((segment) => `<li><strong>${escapeHtml(segment.origin)}</strong><span>${escapeHtml(segment.excerpt)}</span></li>`).join("");
  const outputRows = trace.outputs.map((output) => `<li><strong>${escapeHtml(output.type)}</strong><span>${output.claimIds.length} claims${output.sha256 ? ` · <code>${output.sha256.slice(0, 12)}</code>` : " · hash unavailable"}</span></li>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>How WorkshopLM was built</title><style>*{box-sizing:border-box}body{margin:0;background:#fff;color:#0d0d0d;font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{max-width:1120px;margin:auto;padding:56px 40px 80px}.eyebrow{color:#5d5d5d;font-size:12px;font-weight:650;letter-spacing:.08em;text-transform:uppercase}h1{font-size:44px;line-height:1.04;letter-spacing:-1.5px;margin:14px 0 16px;max-width:760px}h2{font-size:20px;margin:0 0 18px}p{max-width:760px;color:#5d5d5d;font-size:16px}.proof{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:36px 0}.metric,section{border:1px solid rgba(13,13,13,.12);border-radius:16px}.metric{padding:18px}.metric strong{display:block;font-size:26px}.metric span{color:#5d5d5d}section{padding:24px;margin-top:16px}.columns{display:grid;grid-template-columns:1fr 1fr;gap:16px}ul{list-style:none;padding:0;margin:0}.timeline li{display:grid;grid-template-columns:150px 1fr;gap:16px;padding:11px 0;border-top:1px solid rgba(13,13,13,.08)}.commits li{display:grid;grid-template-columns:72px 1fr 190px;gap:12px;padding:9px 0;border-top:1px solid rgba(13,13,13,.08)}.evidence li{display:flex;justify-content:space-between;gap:18px;padding:10px 0;border-top:1px solid rgba(13,13,13,.08)}.evidence span,.timeline time,.commits time{color:#8f8f8f;font-size:12px;text-align:right}code{font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;background:#f3f3f3;border-radius:6px;padding:3px 6px}.tasks{display:flex;flex-wrap:wrap;gap:8px}.limits li{padding:7px 0;color:#5d5d5d}.disclosure{margin-top:24px;padding:16px 18px;background:#f3f3f3;border-radius:12px;color:#5d5d5d}@media(max-width:760px){main{padding:32px 20px}h1{font-size:36px}.proof,.columns{grid-template-columns:1fr 1fr}.timeline li,.commits li{grid-template-columns:1fr}.commits time{display:none}}@media(max-width:480px){.proof,.columns{grid-template-columns:1fr}.evidence li{display:block}.evidence span{display:block;text-align:left;margin-top:4px}}</style></head><body><main><div class="eyebrow">WorkshopLM · source-traceable build record</div><h1>How this submission was built</h1><p>This page is generated from the actual Workshop state, append-only build log, and Git history at Video render time. It distinguishes deterministic fixture proof from provider-backed evidence.</p><div class="proof"><div class="metric"><strong>${trace.build.commitCount}</strong><span>Build Week commits</span></div><div class="metric"><strong>${trace.build.milestoneCount}</strong><span>Logged milestones</span></div><div class="metric"><strong>${trace.workshop.groundedClaims}</strong><span>Grounded claims</span></div><div class="metric"><strong>${trace.elapsedSeconds ?? "—"}${trace.elapsedSeconds === undefined ? "" : "s"}</strong><span>First transcript to first Output</span></div></div><div class="columns"><section><h2>From raw thinking</h2><ul class="evidence">${transcriptRows || "<li>No transcript was preserved.</li>"}</ul></section><section><h2>Through grounded Sources</h2><ul class="evidence">${sourceRows}</ul></section></div><div class="columns"><section><h2>Approved production inputs</h2><ul class="limits"><li>Map · ${trace.inputs.mapNodes} ideas · ${trace.inputs.mapEdges} connections</li><li>Brief version ${trace.inputs.briefVersion ?? "—"}</li><li>Style version ${trace.inputs.styleVersion ?? "—"}</li><li>Storyboard version ${trace.inputs.storyboardVersion}</li><li>Image batch ${escapeHtml(trace.inputs.imageBatchId ?? "not present")}</li><li>Video version ${trace.video.version} · <code>${trace.video.sha256.slice(0, 12)}</code></li></ul></section><section><h2>Into finished Outputs</h2><ul class="evidence">${outputRows}</ul></section></div><section><h2>Provider evidence in this run</h2><ul class="limits"><li>Realtime turns: ${trace.providerEvidence.realtimeTurns}</li><li>GPT-5.6 runs: ${trace.providerEvidence.gpt56Runs}</li><li>GPT Image 2 panels: ${trace.providerEvidence.gptImage2Panels}</li><li>OpenAI narration panels: ${trace.providerEvidence.narrationPanels}</li></ul></section><section><h2>Build milestones</h2><ul class="timeline">${milestoneRows}</ul></section><section><h2>Build Week commit history</h2><ul class="commits">${commitRows || "<li>No repository commit history was available.</li>"}</ul></section><section><h2>Recorded Codex task evidence</h2><div class="tasks">${taskRows}</div></section><section><h2>Honest limitations</h2><ul class="limits">${limitationList || "<li>No recorded limitations.</li>"}</ul><div class="disclosure">AI-assisted build. The task IDs above are build evidence and are not presented as the required Devpost <code>/feedback</code> Session ID.</div></section></main></body></html>`;
}

export async function writeWorkshopBuildTrace(state: WorkshopState, root: string, video: { id: string; version: number; sha256: string; byteCount: number }): Promise<WrittenBuildTrace> {
  const [log, commits] = await Promise.all([
    readFile(join(repositoryRoot, "log.md"), "utf8").catch(() => ""),
    buildCommits(),
  ]);
  const milestones = milestonesFrom(log);
  const taskIds = taskIdsFrom(log);
  const providerEvidence = {
    realtimeTurns: state.transcriptSegments.filter((segment) => segment.transport === "webrtc" && segment.provider?.itemIds.length && segment.provider.eventIds.length).length,
    gpt56Runs: state.aiRuns.length,
    gptImage2Panels: state.imageBatch?.panels.filter((panel) => panel.provenance?.model === "gpt-image-2").length ?? 0,
    narrationPanels: state.narration && !state.narration.stale && state.narration.storyboardVersion === state.storyboard.version ? state.narration.panels.length : 0,
  };
  const elapsedSeconds = state.firstTranscriptAt && state.firstRenderedOutputAt ? Math.max(0, Math.round((Date.parse(state.firstRenderedOutputAt) - Date.parse(state.firstTranscriptAt)) / 1000)) : undefined;
  const outputs = await Promise.all(state.outputs.filter((output) => !output.stale).map(async (output) => ({ id: output.id, type: output.type, sha256: await readFile(resolve(root, output.relativePath)).then(sha256).catch(() => undefined), claimIds: output.claimIds })));
  const trace: WorkshopBuildTrace = { schemaVersion: 1, createdAt: new Date().toISOString(), workshop: { id: state.id, title: state.title, activeSources: state.activeSourceIds.length, groundedClaims: state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId)).length, sources: state.sourceItems.filter((source) => state.activeSourceIds.includes(source.id)).map(({ title, origin, locator, permission }) => ({ title, origin, locator, permission })), transcript: state.transcriptSegments.map(({ origin, capturedAt, text }) => ({ origin, capturedAt, excerpt: text.slice(0, 280) })) }, video, inputs: { mapNodes: state.mapNodes.length, mapEdges: state.mapEdges.length, briefVersion: state.frame?.version, styleVersion: state.style?.version, visualDnaVersion: state.visualDna?.version, assetPlanVersion: state.assetPlan?.version, storyboardVersion: state.storyboard.version, imageBatchId: state.imageBatch?.id }, outputs, elapsedSeconds, build: { milestoneCount: milestones.length, milestones, commitCount: commits.length, commits, taskIds }, providerEvidence, limitations: [] };
  trace.limitations = limitationsFor(state, providerEvidence);
  const data = `${JSON.stringify(trace, null, 2)}\n`;
  const html = traceHtml(trace);
  const directory = join(root, workshopGeneratedPath(state.id, "videos"));
  const dataFile = join(directory, `workshoplm-demo-v${video.version}.build-trace.json`);
  const htmlFile = join(directory, `workshoplm-demo-v${video.version}.build-trace.html`);
  await mkdir(directory, { recursive: true });
  await Promise.all([writeFile(dataFile, data), writeFile(htmlFile, html)]);
  return { htmlPath: relative(root, htmlFile), dataPath: relative(root, dataFile), htmlSha256: sha256(html), dataSha256: sha256(data), milestoneCount: milestones.length, commitCount: commits.length, taskIds };
}
