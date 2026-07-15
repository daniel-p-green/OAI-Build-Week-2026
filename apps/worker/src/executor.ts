import { execFile as rawExecFile } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { promisify } from "node:util";
import { storeArtifact, type StoredArtifact } from "./artifacts/local-artifact-store.js";
import { writeWorkshopBuildTrace } from "./build-trace.js";
import { openLocalDatabase } from "./db/client.js";
import { migrate } from "./db/migrate.js";
import { finishJob, leaseNext } from "./queue.js";
import { assertStoryboardGrounding, readWorkshopState, recordRenderedVideo, setVideoState, workshopGeneratedPath, type StoryboardPanel, type WorkshopState } from "./workshop-service.js";

const execFile = promisify(rawExecFile);
export type ExecuteResult = { jobId?: string; state: "idle" | "succeeded" | "failed"; artifact?: StoredArtifact; error?: string };
type RunCommand = (command: string, args: string[]) => Promise<unknown>;
const defaultRun: RunCommand = async (command, args) => { await execFile(command, args, { cwd: resolve(process.cwd()), maxBuffer: 5_000_000 }); };
const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
function currentNarrationForPanel(state: WorkshopState, panel: StoryboardPanel) {
  if (!state.narration || state.narration.stale || state.narration.storyboardVersion !== state.storyboard.version) return undefined;
  return state.narration.panels.find((candidate) => candidate.panelId === panel.id);
}
function hasCurrentNarration(state: WorkshopState): boolean {
  if (!state.narration || state.narration.stale || state.narration.storyboardVersion !== state.storyboard.version) return false;
  const narrationIds = state.narration.panels.map((panel) => panel.panelId);
  return narrationIds.length === state.storyboard.panels.length
    && new Set(narrationIds).size === narrationIds.length
    && state.storyboard.panels.every((panel) => narrationIds.includes(panel.id));
}
function currentImageForPanel(state: WorkshopState, panel: StoryboardPanel) {
  if (!panel.imagePanelId || !panel.imagePanelVersion || state.imageBatch?.stale) return undefined;
  return state.imageBatch?.panels.find((image) => image.id === panel.imagePanelId && image.version === panel.imagePanelVersion && image.state === "generated" && image.relativePath);
}
export type WorkshopVideoProvenance = {
  schemaVersion: 1;
  workshopId: string;
  storyboardVersion: number;
  styleVersion?: number;
  visualDnaVersion?: number;
  imageBatchId?: string;
  video: StoredArtifact & { relativePath: string };
  panels: Array<{
    panelId: string;
    title: string;
    startSeconds: number;
    durationSeconds: number;
    claimIds: string[];
    evidence: Array<{ claimId?: string; sourceId: string; sourceTitle: string; chunkId?: string; locator: string; snippet: string }>;
    image?: { panelId: string; version: number; sha256: string; referenceId: string };
    narration?: { sha256: string; model: string; voice: string };
  }>;
};
export function buildWorkshopVideoProvenance(state: WorkshopState, video: StoredArtifact): WorkshopVideoProvenance {
  if (!state.storyboardApproved || state.storyboard.stale || state.storyboard.panels.some((panel) => panel.stale || !panel.approved)) throw new Error("Video provenance requires an approved current storyboard.");
  assertStoryboardGrounding(state);
  let startSeconds = 0;
  const panels = state.storyboard.panels.map((panel) => {
    const image = currentImageForPanel(state, panel);
    const narration = currentNarrationForPanel(state, panel);
    const evidence = panel.evidence.map((reference) => {
      const source = state.sourceItems.find((candidate) => candidate.id === reference.sourceId)!;
      const chunk = reference.chunkId ? state.sourceChunks.find((candidate) => candidate.id === reference.chunkId) : undefined;
      const claim = reference.claimId ? state.claims.find((candidate) => candidate.id === reference.claimId) : undefined;
      return { ...reference, sourceTitle: source.title, snippet: chunk?.text ?? claim?.text ?? source.excerpt };
    });
    const value = {
      panelId: panel.id,
      title: panel.title,
      startSeconds,
      durationSeconds: panel.durationSeconds,
      claimIds: [...panel.claimIds],
      evidence,
      image: image?.sha256 ? { panelId: image.id, version: image.version, sha256: image.sha256, referenceId: image.referenceId } : undefined,
      narration: narration ? { sha256: narration.sha256, model: narration.model, voice: narration.voice } : undefined,
    };
    startSeconds += panel.durationSeconds;
    return value;
  });
  return { schemaVersion: 1, workshopId: state.id, storyboardVersion: state.storyboard.version, styleVersion: state.style?.version, visualDnaVersion: state.visualDna?.version, imageBatchId: state.imageBatch?.id, video, panels };
}
export function buildWorkshopVideoHtml(state: WorkshopState): string {
  if (!state.storyboardApproved || state.storyboard.stale || state.storyboard.panels.some((panel) => panel.stale || !panel.approved)) throw new Error("Video render requires an approved current storyboard.");
  const duration = state.storyboard.panels.reduce((total, panel) => total + panel.durationSeconds, 0);
  const disclosure = hasCurrentNarration(state) ? "Audio: AI-generated voice · OpenAI gpt-4o-mini-tts" : "Audio: deterministic local placeholder tone";
  let start = 0;
  const scenes = state.storyboard.panels.map((panel, index) => { const image = currentImageForPanel(state, panel); const scene = `<section id="panel-${index + 1}" class="clip panel panel-${index % 3}${image ? " with-image" : ""}" data-start="${start}" data-duration="${panel.durationSeconds}" data-track-index="1">${image ? `<img class="scene-image" src="panel-${index + 1}.png" alt="">` : ""}<div class="scene-shade"></div><div class="eyebrow">WORKSHOPLM · APPROVED STORYBOARD V${state.storyboard.version}</div><h1>${escapeHtml(panel.title)}</h1><p>${escapeHtml(panel.narration)}</p><div class="disclosure">${disclosure}</div></section><audio id="panel-${index + 1}-audio" class="clip" src="panel-${index + 1}.wav" data-start="${start}" data-duration="${panel.durationSeconds}" data-track-index="2" data-volume="0.12"></audio>`; start += panel.durationSeconds; return scene; }).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}html,body,main{margin:0;width:1920px;height:1080px;overflow:hidden;background:${state.style?.ink ?? "#171816"};color:${state.style?.paper ?? "#F4F2EC"};font-family:Arial,sans-serif}.panel{position:absolute;inset:0;padding:120px 160px;display:flex;flex-direction:column;justify-content:center;background:radial-gradient(circle at 80% 10%,${state.style?.accent ?? "#1668E3"} 0%,transparent 32%),${state.style?.ink ?? "#171816"}}.panel-1{background-position:20% 80%}.panel-2{background-position:80% 80%}.scene-image,.scene-shade{position:absolute;inset:0;width:100%;height:100%}.scene-image{object-fit:cover}.scene-shade{background:linear-gradient(90deg,${state.style?.ink ?? "#171816"}ee 0%,${state.style?.ink ?? "#171816"}aa 48%,${state.style?.ink ?? "#171816"}22 100%)}.panel:not(.with-image) .scene-shade{display:none}.panel>*:not(.scene-image):not(.scene-shade){position:relative}.eyebrow{font-size:25px;letter-spacing:.12em;color:${state.style?.accent ?? "#1668E3"};font-weight:700}h1{font-size:78px;max-width:1400px;margin:36px 0}p{font-size:34px;line-height:1.35;max-width:1320px}.disclosure{position:absolute!important;right:160px;bottom:110px;border:1px solid #ffffff88;border-radius:99px;padding:14px 20px;font-size:22px}</style></head><body><main data-composition-id="workshoplm-storyboard-v${state.storyboard.version}" data-no-timeline data-start="0" data-duration="${duration}" data-width="1920" data-height="1080" data-fps="30">${scenes}</main></body></html>`;
}
export async function executeOne(root: string, run: RunCommand = defaultRun) : Promise<ExecuteResult> {
  const db = openLocalDatabase(join(root, "data", "workshoplm.sqlite")); migrate(db);
  const job = leaseNext(db); if (!job) return { state: "idle" };
  if (job.kind !== "render_video") { finishJob(db, job.id, "failed", `Unsupported worker job ${job.kind}`); return { jobId: job.id, state: "failed", error: `Unsupported worker job ${job.kind}` }; }
  try {
    setVideoState("rendering", root, job.workshopId);
    const state = readWorkshopState(root, job.workshopId); const staging = join(root, workshopGeneratedPath(state.id, `storyboard-v${state.storyboard.version}-render`)); await mkdir(staging, { recursive: true }); await writeFile(join(staging, "index.html"), buildWorkshopVideoHtml(state));
    for (const [index, panel] of state.storyboard.panels.entries()) {
      const image = currentImageForPanel(state, panel); if (!image?.relativePath) continue;
      const source = resolve(root, image.relativePath); if (!source.startsWith(`${resolve(root)}/`)) throw new Error("Storyboard image escaped the Workshop data root.");
      const bytes = await readFile(source);
      const actualSha256 = createHash("sha256").update(bytes).digest("hex");
      if (actualSha256 !== image.sha256) throw new Error(`Storyboard image hash does not match recorded provenance for panel ${panel.id}.`);
      await writeFile(join(staging, `panel-${index + 1}.png`), bytes);
    }
    if (hasCurrentNarration(state)) {
      for (const [index, storyboardPanel] of state.storyboard.panels.entries()) {
        const panel = currentNarrationForPanel(state, storyboardPanel)!;
        const source = resolve(root, panel.relativePath);
        if (!source.startsWith(`${resolve(root)}/`)) throw new Error("Narration artifact escaped the Workshop data root.");
        const bytes = await readFile(source);
        const actualSha256 = createHash("sha256").update(bytes).digest("hex");
        if (actualSha256 !== panel.sha256) throw new Error(`Narration artifact hash does not match recorded provenance for panel ${storyboardPanel.id}.`);
        await writeFile(join(staging, `panel-${index + 1}.wav`), bytes);
      }
    } else {
      for (const [index, panel] of state.storyboard.panels.entries()) await run("ffmpeg", ["-y", "-f", "lavfi", "-i", `sine=frequency=${440 + index * 83}:sample_rate=48000:duration=${panel.durationSeconds}`, "-ac", "1", join(staging, `panel-${index + 1}.wav`)]);
    }
    const nextVersion = state.videos.reduce((highest, video) => Math.max(highest, video.version), 0) + 1;
    const versionName = `workshoplm-demo-v${nextVersion}`;
    const videoDirectory = join(root, workshopGeneratedPath(state.id, "videos")); await mkdir(videoDirectory, { recursive: true });
    const output = join(videoDirectory, `${versionName}.mp4`); await run("npx", ["hyperframes", "render", staging, "--output", output, "--workers", "1", "--quality", "draft"]); await stat(output);
    const artifact = await storeArtifact(root, `${state.id}-${versionName}`, await readFile(output), "video/mp4");
    const provenancePath = join(videoDirectory, `${versionName}.provenance.json`);
    await writeFile(provenancePath, `${JSON.stringify(buildWorkshopVideoProvenance(state, artifact), null, 2)}\n`);
    const buildTrace = await writeWorkshopBuildTrace(state, root, { id: `video-v${nextVersion}`, version: nextVersion, sha256: artifact.sha256, byteCount: artifact.byteCount });
    await copyFile(output, join(root, workshopGeneratedPath(state.id, "workshoplm-demo.mp4")));
    await copyFile(provenancePath, join(root, workshopGeneratedPath(state.id, "workshoplm-demo.provenance.json")));
    recordRenderedVideo({ storyboardVersion: state.storyboard.version, styleVersion: state.style!.version, visualDnaVersion: state.visualDna?.version, imageBatchId: state.imageBatch?.id, relativePath: relative(root, output), provenancePath: relative(root, provenancePath), artifactPath: artifact.relativePath, sha256: artifact.sha256, byteCount: artifact.byteCount, claimIds: [...new Set(state.storyboard.panels.flatMap((panel) => panel.claimIds))], buildTrace }, root, state.id);
    finishJob(db, job.id, "succeeded"); return { jobId: job.id, state: "succeeded", artifact };
  } catch (caught) { const error = caught instanceof Error ? caught.message : "Unknown render failure"; const retrying = job.attempts < 2; finishJob(db, job.id, retrying ? "retrying" : "failed", error); setVideoState(retrying ? "queued" : "blocked", root, job.workshopId); return { jobId: job.id, state: "failed", error }; }
}
