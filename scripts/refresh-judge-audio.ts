import { createHash } from "node:crypto";
import { copyFile, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defaultOpenAiMediaConfig, generateOpenAiAudioOverview } from "../apps/worker/src/openai-media.ts";
import { createProviderRequestBudget } from "../apps/worker/src/provider-budget.ts";
import { readWorkshopState } from "../apps/worker/src/workshop-service.ts";

async function main(): Promise<void> {
const repository = process.cwd();
const root = resolve(repository, ".workshoplm", "acceptance");
const reviewRoot = resolve(repository, "artifacts", "live-review");
const apiKey = process.env.OPENAI_API_KEY ?? "";
const ceiling = Number(process.env.WORKSHOPLM_MAX_PAID_REQUESTS);

if (process.env.WORKSHOPLM_LIVE_OPENAI !== "1") throw new Error("Set WORKSHOPLM_LIVE_OPENAI=1 to authorize the bounded provider refresh.");
if (!apiKey) throw new Error("OPENAI_API_KEY is required.");
if (ceiling !== 1) throw new Error("WORKSHOPLM_MAX_PAID_REQUESTS must equal 1 for this refresh.");

const before = readWorkshopState(root);
const planned = [...before.audioOverviews].reverse().find((item) => !item.stale);
if (!planned || planned.status !== "script_ready") throw new Error("The acceptance Workshop must contain one current Audio Overview script awaiting audio.");

const budget = createProviderRequestBudget(ceiling);
await generateOpenAiAudioOverview(root, { apiKey, ...defaultOpenAiMediaConfig }, budget.fetch);
if (budget.usedRequests() !== 1) throw new Error(`Expected exactly one provider request; observed ${budget.usedRequests()}.`);

const state = readWorkshopState(root);
const overview = [...state.audioOverviews].reverse().find((item) => !item.stale);
if (!overview?.audio || overview.status !== "audio_ready") throw new Error("The refreshed Audio Overview is not ready.");

const sourceAudio = resolve(root, overview.audio.relativePath);
const reviewAudio = resolve(reviewRoot, "audio-overview.wav");
await copyFile(sourceAudio, reviewAudio);
const bytes = await readFile(reviewAudio);
const downloadedSha256 = createHash("sha256").update(bytes).digest("hex");
if (downloadedSha256 !== overview.audio.sha256 || bytes.length !== overview.audio.byteCount) throw new Error("Copied Audio Overview bytes do not match provider provenance.");

const evidence = {
  id: overview.id,
  title: overview.title,
  script: overview.script,
  sections: overview.sections,
  claimIds: overview.claimIds,
  disclosure: overview.disclosure,
  audio: overview.audio,
  downloadedSha256,
};
await writeFile(resolve(reviewRoot, "audio-overview.json"), `${JSON.stringify(evidence, null, 2)}\n`);
console.log(JSON.stringify({ status: "passed", requests: budget.usedRequests(), id: overview.id, durationSeconds: overview.audio.durationSeconds, sha256: downloadedSha256 }));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
