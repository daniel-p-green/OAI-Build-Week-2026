import { execFile as rawExecFile } from "node:child_process";
import { copyFile, mkdir, stat } from "node:fs/promises";
import { join, resolve } from "node:path";
import { promisify } from "node:util";
import { storeArtifact, type StoredArtifact } from "./artifacts/local-artifact-store.js";
import { openLocalDatabase } from "./db/client.js";
import { migrate } from "./db/migrate.js";
import { finishJob, leaseNext } from "./queue.js";
import { setVideoState } from "./workshop-service.js";

const execFile = promisify(rawExecFile);
export type ExecuteResult = { jobId?: string; state: "idle" | "succeeded" | "failed"; artifact?: StoredArtifact; error?: string };
type RunCommand = (command: string, args: string[]) => Promise<unknown>;
const defaultRun: RunCommand = async (command, args) => { await execFile(command, args, { cwd: resolve(process.cwd()), maxBuffer: 5_000_000 }); };
export async function executeOne(root: string, run: RunCommand = defaultRun) : Promise<ExecuteResult> {
  const db = openLocalDatabase(join(root, "data", "workshoplm.sqlite")); migrate(db);
  const job = leaseNext(db); if (!job) return { state: "idle" };
  if (job.kind !== "render_video") { finishJob(db, job.id, "failed", `Unsupported worker job ${job.kind}`); return { jobId: job.id, state: "failed", error: `Unsupported worker job ${job.kind}` }; }
  try {
    setVideoState("rendering", root);
    await run("pnpm", ["--filter", "@workshoplm/spike-video", "run", "verify"]);
    const source = resolve(process.cwd(), "artifacts", "spikes", "spike-d.mp4");
    await stat(source);
    const output = join(root, "generated", "workshoplm-demo.mp4"); await mkdir(resolve(output, ".."), { recursive: true }); await copyFile(source, output);
    const artifact = await storeArtifact(root, "workshoplm-demo", await import("node:fs/promises").then(({ readFile }) => readFile(output)), "video/mp4");
    finishJob(db, job.id, "succeeded"); setVideoState("rendered", root); return { jobId: job.id, state: "succeeded", artifact };
  } catch (caught) { const error = caught instanceof Error ? caught.message : "Unknown render failure"; finishJob(db, job.id, "failed", error); setVideoState("queued", root); return { jobId: job.id, state: "failed", error }; }
}
