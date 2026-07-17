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
type TraceOutput = { id: string; label: string; version: number; format: string; status: string; sha256?: string; claimIds: string[] };

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
  inputs: { mapNodes: number; mapEdges: number; briefVersion?: number; styleVersion?: number; style?: { name: string; intent: string; accent: string; ink: string; paper: string; heading: string; body: string }; visualDnaVersion?: number; assetPlanVersion?: number; storyboardVersion: number; imageBatchId?: string };
  outputs: TraceOutput[];
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
  return [...log.matchAll(/^## (\d{4}-\d{2}-\d{2} \d{2}:\d{2} CT) — (.+)$/gm)]
    .map((match) => ({ occurredAt: match[1]!, title: match[2]!.trim() }))
    .filter((milestone) => !/correction$/i.test(milestone.title))
    .sort((left, right) => left.occurredAt.localeCompare(right.occurredAt));
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

function humanIntent(intent: NonNullable<WorkshopState["style"]>["intentProfile"]): string {
  if (intent === "board_deck") return "Board presentation";
  if (intent === "internal_workshop") return "Team workshop";
  return "Client pitch";
}

async function tracedOutputs(state: WorkshopState, root: string, video: WorkshopBuildTrace["video"]): Promise<TraceOutput[]> {
  const newest = (type: "deck" | "infographic") => state.outputs
    .filter((output) => output.type === type && !output.stale)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
  const outputVersion = (id: string) => Number(id.match(/v(\d+)$/)?.[1] ?? 1);
  const outputs: TraceOutput[] = [];
  for (const [type, label, format] of [["deck", "Presentation", "Editable PowerPoint"], ["infographic", "Infographic", "Editable PowerPoint"]] as const) {
    const output = newest(type);
    if (!output) continue;
    outputs.push({ id: output.id, label, version: outputVersion(output.id), format, status: "Ready", sha256: await readFile(resolve(root, output.relativePath)).then(sha256).catch(() => undefined), claimIds: output.claimIds });
  }
  if (state.sketch && !state.sketch.stale) outputs.push({ id: `sketch-v${state.sketch.version}`, label: "Sketch", version: state.sketch.version, format: "Editable SVG", status: state.sketch.approved ? "Approved" : "Ready", sha256: state.sketch.sha256, claimIds: state.sketch.claimIds });
  if (state.imageBatch && !state.imageBatch.stale && state.imageBatch.panels.every((panel) => panel.state === "generated" && panel.sha256)) {
    outputs.push({ id: state.imageBatch.id, label: "Image set", version: Number(state.imageBatch.id.match(/v(\d+)$/)?.[1] ?? 1), format: `${state.imageBatch.panels.length} image files`, status: "Ready", sha256: sha256(state.imageBatch.panels.map((panel) => `${panel.id}:${panel.version}:${panel.sha256}`).join("\n")), claimIds: [...new Set(state.imageBatch.panels.flatMap((panel) => panel.evidence.map((item) => item.claimId).filter((id): id is string => Boolean(id))))] });
  }
  const audio = [...state.audioOverviews].filter((item) => !item.stale).sort((left, right) => right.version - left.version)[0];
  if (audio) outputs.push({ id: audio.id, label: "Audio Overview", version: audio.version, format: audio.audio ? "Audio and editable script" : "Editable script", status: audio.audio ? "Ready" : "Script ready", sha256: audio.audio?.sha256 ?? sha256(audio.script), claimIds: audio.claimIds });
  if (state.storyboard.panels.length && !state.storyboard.stale) outputs.push({ id: `storyboard-v${state.storyboard.version}`, label: "Storyboard", version: state.storyboard.version, format: `${state.storyboard.panels.length} editable panels`, status: state.storyboard.approved ? "Approved" : "Ready for review", sha256: sha256(JSON.stringify(state.storyboard.panels)), claimIds: [...new Set(state.storyboard.panels.flatMap((panel) => panel.claimIds))] });
  outputs.push({ id: video.id, label: "Video", version: video.version, format: "MP4 video", status: "Rendered", sha256: video.sha256, claimIds: [...new Set(state.storyboard.panels.flatMap((panel) => panel.claimIds))] });
  return outputs;
}

function traceHtml(trace: WorkshopBuildTrace): string {
  const recentMilestones = trace.build.milestones.slice(-12).reverse();
  const recentCommits = trace.build.commits.slice(0, 10);
  const limitationList = trace.limitations.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  const milestoneRows = recentMilestones.map((milestone) => `<li><time>${escapeHtml(milestone.occurredAt)}</time><strong>${escapeHtml(milestone.title)}</strong></li>`).join("");
  const commitRows = recentCommits.map((commit) => `<li><code>${escapeHtml(commit.hash)}</code><span>${escapeHtml(commit.subject)}</span><time>${escapeHtml(commit.committedAt)}</time></li>`).join("");
  const taskRows = trace.build.taskIds.length ? trace.build.taskIds.map((taskId) => `<code>${escapeHtml(taskId)}</code>`).join("") : "<span>Not exposed on this surface</span>";
  const sourceRows = trace.workshop.sources.map((source) => `<li><div><strong>${escapeHtml(source.title)}</strong><span>${escapeHtml(source.origin)}</span></div><small>${escapeHtml(source.permission.charAt(0).toUpperCase() + source.permission.slice(1))} Source</small></li>`).join("")
    + `<li><div><strong>Exact trace data</strong><span>Source locators, versions, and complete hashes</span></div><small><a style="color:var(--accent);font-weight:650" href="/api/workshop/artifacts/build-trace-data-v${trace.video.version}">Open JSON</a></small></li>`;
  const transcriptRows = trace.workshop.transcript.map((segment) => `<li><strong>${segment.origin === "realtime_fallback" ? "Voice brainstorm" : "Imported transcript"}</strong><blockquote>“${escapeHtml(segment.excerpt)}”</blockquote></li>`).join("");
  const outputRows = trace.outputs.map((output, index) => `<li><span class="output-index">${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(output.label)}</strong><small>Version ${output.version} · ${escapeHtml(output.format)}</small></div><div class="output-proof"><span>${escapeHtml(output.status)}</span><small>${output.claimIds.length} source-linked ${output.claimIds.length === 1 ? "claim" : "claims"}${output.sha256 ? ` · ${output.sha256.slice(0, 10)}` : ""}</small></div></li>`).join("");
  const style = trace.inputs.style ?? { name: "Workshop Style", intent: "Professional work", accent: "#0285ff", ink: "#0d0d0d", paper: "#ffffff", heading: "System", body: "System" };
  const safeColor = (value: string, fallback: string) => /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
  const accent = safeColor(style.accent, "#0285ff");
  const ink = safeColor(style.ink, "#0d0d0d");
  const paper = safeColor(style.paper, "#ffffff");
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>How WorkshopLM was built</title><style>:root{--accent:${accent};--ink:${ink};--paper:${paper};--muted:color-mix(in srgb,var(--ink) 58%,var(--paper));--rule:color-mix(in srgb,var(--ink) 13%,var(--paper));--soft:color-mix(in srgb,var(--accent) 7%,var(--paper))}*{box-sizing:border-box}body{margin:0;background:var(--paper);color:var(--ink);font:14px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}main{max-width:1120px;margin:auto;padding:60px 40px 88px}.eyebrow{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:12px;font-weight:650;letter-spacing:.08em;text-transform:uppercase}.eyebrow:before{content:"";width:28px;height:3px;background:var(--accent);border-radius:4px}h1{font-size:48px;line-height:1.02;letter-spacing:-1.8px;margin:16px 0 18px;max-width:780px}h2{font-size:20px;line-height:1.2;margin:0 0 20px;letter-spacing:-.25px}p{max-width:760px;color:var(--muted);font-size:16px}.path{display:grid;grid-template-columns:repeat(3,1fr);margin:44px 0 36px;border-block:1px solid var(--rule)}.path div{padding:22px 20px 22px 0}.path div+div{padding-left:20px;border-left:1px solid var(--rule)}.path small,.metric span,.output-list small,.source-list span,.source-list small{display:block;color:var(--muted)}.path strong{display:block;font-size:18px;margin:3px 0}.proof{display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin:0 0 54px}.metric{padding-top:16px;border-top:3px solid var(--accent)}.metric strong{display:block;font-size:30px;line-height:1.1;letter-spacing:-.8px}.metric span{margin-top:5px}section{padding:30px 0;border-top:1px solid var(--rule)}.columns{display:grid;grid-template-columns:1fr 1fr;gap:56px}.columns section{margin:0}.approved{background:var(--soft);padding:28px;border-top:3px solid var(--accent)}ul{list-style:none;padding:0;margin:0}.source-list li{display:flex;justify-content:space-between;gap:20px;padding:12px 0;border-top:1px solid var(--rule)}.source-list small{text-align:right;max-width:50%}.transcript li{padding:0}.transcript blockquote{margin:12px 0 0;font-size:18px;line-height:1.5;letter-spacing:-.15px}.inputs{display:grid;grid-template-columns:1fr 1fr;gap:10px 32px}.inputs li{display:flex;justify-content:space-between;gap:16px;padding:8px 0;border-bottom:1px solid var(--rule)}.inputs span{color:var(--muted);text-align:right}.output-list li{display:grid;grid-template-columns:42px 1fr auto;align-items:center;gap:16px;padding:15px 0;border-top:1px solid var(--rule)}.output-index{color:var(--accent);font-weight:700}.output-list strong{font-size:16px}.output-proof{text-align:right}.output-proof>span{display:block;font-weight:650}.provider{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}.provider li{padding:16px 0;border-top:1px solid var(--rule)}.provider strong{display:block;font-size:24px}.provider span{color:var(--muted)}.timeline li{display:grid;grid-template-columns:150px 1fr;gap:16px;padding:10px 0;border-top:1px solid var(--rule)}.commits li{display:grid;grid-template-columns:72px 1fr 190px;gap:12px;padding:9px 0;border-top:1px solid var(--rule)}.timeline time,.commits time{color:var(--muted);font-size:12px}.commits time{text-align:right}code{font:12px/1.4 ui-monospace,SFMono-Regular,Menlo,monospace;background:var(--soft);border-radius:6px;padding:3px 6px}.tasks{display:flex;flex-wrap:wrap;gap:8px}.limits li{position:relative;padding:7px 0 7px 18px;color:var(--muted)}.limits li:before{content:"";position:absolute;left:0;top:14px;width:5px;height:5px;background:var(--accent);border-radius:50%}.disclosure{margin-top:22px;color:var(--muted)}details{padding:22px 0;border-top:1px solid var(--rule)}summary{cursor:pointer;font-weight:650}.details-body{padding-top:18px}@media(max-width:760px){main{padding:36px 20px 64px}h1{font-size:38px}.proof{grid-template-columns:1fr 1fr}.columns{grid-template-columns:1fr;gap:0}.output-list li{grid-template-columns:34px 1fr}.output-proof{grid-column:2;text-align:left}.provider{grid-template-columns:1fr 1fr}.timeline li,.commits li{grid-template-columns:1fr}.commits time{display:none}.inputs{grid-template-columns:1fr}}@media(max-width:480px){.path{grid-template-columns:1fr}.path div+div{padding-left:0;border-left:0;border-top:1px solid var(--rule)}.proof{grid-template-columns:1fr 1fr;gap:20px 14px}.source-list li{display:block}.source-list small{text-align:left;max-width:none;margin-top:4px}}</style></head><body><main><div class="eyebrow">WorkshopLM · build record</div><h1>One thought became the Build Week submission.</h1><p>This record is generated at Video render time from the Workshop, its source links, the append-only build log, and Git history. It shows what was created, what evidence supports it, and what remains honestly incomplete.</p><div class="path"><div><small>01</small><strong>Capture</strong><span>Voice, notes, and source material</span></div><div><small>02</small><strong>Shape</strong><span>Map, Brief, and Style</span></div><div><small>03</small><strong>Create</strong><span>${trace.outputs.length} connected ${trace.outputs.length === 1 ? "piece" : "pieces"} of work</span></div></div><div class="proof"><div class="metric"><strong>${trace.outputs.length}</strong><span>Created pieces of work</span></div><div class="metric"><strong>${trace.workshop.groundedClaims}</strong><span>Source-linked claims</span></div><div class="metric"><strong>${trace.build.commitCount}</strong><span>Build Week commits</span></div><div class="metric"><strong>${trace.elapsedSeconds ?? "—"}${trace.elapsedSeconds === undefined ? "" : "s"}</strong><span>First transcript to first created work</span></div></div><div class="columns"><section><h2>From raw thinking</h2><ul class="transcript">${transcriptRows || "<li><p>No transcript was preserved. This run begins from a sanitized Source.</p></li>"}</ul></section><section><h2>Through selected Sources</h2><ul class="source-list">${sourceRows}</ul></section></div><section class="approved"><h2>Two deliberate sign-offs</h2><ul class="inputs"><li><strong>Brief</strong><span>Approved · Version ${trace.inputs.briefVersion ?? "—"}</span></li><li><strong>Storyboard</strong><span>Approved · Version ${trace.inputs.storyboardVersion}</span></li><li><strong>Map</strong><span>${trace.inputs.mapNodes} ideas · ${trace.inputs.mapEdges} connections</span></li><li><strong>Style</strong><span>${escapeHtml(style.name)} · ${escapeHtml(style.intent)}</span></li><li><strong>Typography</strong><span>${escapeHtml(style.heading)} / ${escapeHtml(style.body)}</span></li><li><strong>Visual system</strong><span>Version ${trace.inputs.visualDnaVersion ?? "—"}</span></li></ul></section><section><h2>Connected professional knowledge work</h2><ul class="output-list">${outputRows}</ul></section><section><h2>OpenAI evidence in this run</h2><ul class="provider"><li><strong>${trace.providerEvidence.realtimeTurns}</strong><span>Realtime voice turns</span></li><li><strong>${trace.providerEvidence.gpt56Runs}</strong><span>GPT-5.6 Map runs</span></li><li><strong>${trace.providerEvidence.gptImage2Panels}</strong><span>GPT Image 2 visuals</span></li><li><strong>${trace.providerEvidence.narrationPanels}</strong><span>OpenAI narration clips</span></li></ul></section><section><h2>Recent build milestones</h2><ul class="timeline">${milestoneRows}</ul></section><details><summary>Build Week commit evidence</summary><div class="details-body"><ul class="commits">${commitRows || "<li>No repository commit history was available.</li>"}</ul></div></details><details><summary>Recorded Codex task evidence</summary><div class="details-body tasks">${taskRows}</div></details><section><h2>Honest limitations</h2><ul class="limits">${limitationList || "<li>No recorded limitations.</li>"}</ul><div class="disclosure">AI-assisted build. Recorded task IDs are build evidence and are not presented as the required Devpost <code>/feedback</code> Session ID.</div></section></main></body></html>`;
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
  const outputs = await tracedOutputs(state, root, video);
  const trace: WorkshopBuildTrace = { schemaVersion: 1, createdAt: new Date().toISOString(), workshop: { id: state.id, title: state.title, activeSources: state.activeSourceIds.length, groundedClaims: state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId)).length, sources: state.sourceItems.filter((source) => state.activeSourceIds.includes(source.id)).map(({ title, origin, locator, permission }) => ({ title, origin, locator, permission })), transcript: state.transcriptSegments.map(({ origin, capturedAt, text }) => ({ origin, capturedAt, excerpt: text.slice(0, 280) })) }, video, inputs: { mapNodes: state.mapNodes.length, mapEdges: state.mapEdges.length, briefVersion: state.frame?.version, styleVersion: state.style?.version, style: state.style ? { name: state.style.name, intent: humanIntent(state.style.intentProfile), accent: state.style.accent, ink: state.style.ink, paper: state.style.paper, heading: state.style.typographyRoles.heading.family, body: state.style.typographyRoles.body.family } : undefined, visualDnaVersion: state.visualDna?.version, assetPlanVersion: state.assetPlan?.version, storyboardVersion: state.storyboard.version, imageBatchId: state.imageBatch?.id }, outputs, elapsedSeconds, build: { milestoneCount: milestones.length, milestones, commitCount: commits.length, commits, taskIds }, providerEvidence, limitations: [] };
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
