import { execFile as rawExecFile } from "node:child_process";
import { copyFile, mkdir, stat, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { storeArtifact, type StoredArtifact } from "./artifacts/local-artifact-store.js";
import { openLocalDatabase } from "./db/client.js";
import { migrate } from "./db/migrate.js";
import { finishJob, leaseNext } from "./queue.js";
import { readWorkshopState, setVideoState, type WorkshopState } from "./workshop-service.js";

const execFile = promisify(rawExecFile);
export type ExecuteResult = { jobId?: string; state: "idle" | "succeeded" | "failed"; artifact?: StoredArtifact; error?: string };
type RunCommand = (command: string, args: string[]) => Promise<unknown>;
const defaultRun: RunCommand = async (command, args) => { await execFile(command, args, { cwd: resolve(process.cwd()), maxBuffer: 5_000_000 }); };
const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
function hasCurrentNarration(state: WorkshopState): boolean {
  return Boolean(state.narration && !state.narration.stale && state.narration.storyboardVersion === state.storyboard.version && state.narration.panels.length === state.storyboard.panels.length);
}
export function buildWorkshopVideoHtml(state: WorkshopState): string {
  if (!state.storyboardApproved || state.storyboard.stale || state.storyboard.panels.some((panel) => panel.stale || !panel.approved)) throw new Error("Video render requires an approved current storyboard.");
  const duration = state.storyboard.panels.reduce((total, panel) => total + panel.durationSeconds, 0);
  const disclosure = hasCurrentNarration(state) ? "Audio: AI-generated voice · OpenAI gpt-4o-mini-tts" : "Audio: deterministic local placeholder tone";
  let start = 0;
  const scenes = state.storyboard.panels.map((panel, index) => { const scene = `<section id="panel-${index + 1}" class="clip panel panel-${index % 3}" data-start="${start}" data-duration="${panel.durationSeconds}" data-track-index="1"><div class="eyebrow">WORKSHOPLM · APPROVED STORYBOARD V${state.storyboard.version}</div><h1>${escapeHtml(panel.title)}</h1><p>${escapeHtml(panel.narration)}</p><div class="disclosure">${disclosure}</div></section><audio id="panel-${index + 1}-audio" class="clip" src="panel-${index + 1}.wav" data-start="${start}" data-duration="${panel.durationSeconds}" data-track-index="2" data-volume="0.12"></audio>`; start += panel.durationSeconds; return scene; }).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><style>*{box-sizing:border-box}html,body,main{margin:0;width:1920px;height:1080px;overflow:hidden;background:${state.style?.ink ?? "#171816"};color:${state.style?.paper ?? "#F4F2EC"};font-family:Arial,sans-serif}.panel{position:absolute;inset:0;padding:120px 160px;display:flex;flex-direction:column;justify-content:center;background:radial-gradient(circle at 80% 10%,${state.style?.accent ?? "#1668E3"} 0%,transparent 32%),${state.style?.ink ?? "#171816"}}.panel-1{background-position:20% 80%}.panel-2{background-position:80% 80%}.eyebrow{font-size:25px;letter-spacing:.12em;color:${state.style?.accent ?? "#1668E3"};font-weight:700}h1{font-size:78px;max-width:1400px;margin:36px 0}p{font-size:34px;line-height:1.35;max-width:1320px}.disclosure{position:absolute;right:160px;bottom:110px;border:1px solid #ffffff88;border-radius:99px;padding:14px 20px;font-size:22px}</style></head><body><main data-composition-id="workshoplm-storyboard-v${state.storyboard.version}" data-no-timeline data-start="0" data-duration="${duration}" data-width="1920" data-height="1080" data-fps="30">${scenes}</main></body></html>`;
}
export async function executeOne(root: string, run: RunCommand = defaultRun) : Promise<ExecuteResult> {
  const db = openLocalDatabase(join(root, "data", "workshoplm.sqlite")); migrate(db);
  const job = leaseNext(db); if (!job) return { state: "idle" };
  if (job.kind !== "render_video") { finishJob(db, job.id, "failed", `Unsupported worker job ${job.kind}`); return { jobId: job.id, state: "failed", error: `Unsupported worker job ${job.kind}` }; }
  try {
    setVideoState("rendering", root);
    const state = readWorkshopState(root); const staging = join(root, "generated", `storyboard-v${state.storyboard.version}-render`); await mkdir(staging, { recursive: true }); await writeFile(join(staging, "index.html"), buildWorkshopVideoHtml(state));
    if (hasCurrentNarration(state)) {
      for (const [index, panel] of state.narration!.panels.entries()) {
        const source = resolve(root, panel.relativePath);
        if (!source.startsWith(`${resolve(root)}/`)) throw new Error("Narration artifact escaped the Workshop data root.");
        await copyFile(source, join(staging, `panel-${index + 1}.wav`));
      }
    } else {
      for (const [index, panel] of state.storyboard.panels.entries()) await run("ffmpeg", ["-y", "-f", "lavfi", "-i", `sine=frequency=${440 + index * 83}:sample_rate=48000:duration=${panel.durationSeconds}`, "-ac", "1", join(staging, `panel-${index + 1}.wav`)]);
    }
    const output = join(root, "generated", "workshoplm-demo.mp4"); await run("npx", ["hyperframes", "render", staging, "--output", output, "--workers", "1", "--quality", "draft"]); await stat(output);
    const artifact = await storeArtifact(root, "workshoplm-demo", await import("node:fs/promises").then(({ readFile }) => readFile(output)), "video/mp4");
    finishJob(db, job.id, "succeeded"); setVideoState("rendered", root); return { jobId: job.id, state: "succeeded", artifact };
  } catch (caught) { const error = caught instanceof Error ? caught.message : "Unknown render failure"; const retrying = job.attempts < 2; finishJob(db, job.id, retrying ? "retrying" : "failed", error); setVideoState(retrying ? "queued" : "blocked", root); return { jobId: job.id, state: "failed", error }; }
}
