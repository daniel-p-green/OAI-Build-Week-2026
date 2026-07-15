import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { executeOne } from "../apps/worker/src/executor.ts";
import { defaultOpenAiMediaConfig, generateOpenAiImageBatch, generateOpenAiNarration, type OpenAiMediaConfig } from "../apps/worker/src/openai-media.ts";
import { generateGroundedMapWithGpt56 } from "../apps/worker/src/openai-reasoning.ts";
import {
  applyWorkshopAction,
  approveVisualDna,
  captureFallbackTranscript,
  createImageBatch,
  createVisualDna,
  extractWorkshopCandidates,
  generateAssetPlan,
  generateOutput,
  generateStoryboard,
  ingestSource,
  lockManualStyle,
  readWorkshopState,
} from "../apps/worker/src/workshop-service.ts";

const executeLive = process.argv.includes("--execute");
const keep = process.argv.includes("--keep");
const root = resolve(process.cwd(), ".workshoplm", "live-operator");

function liveConfig(): OpenAiMediaConfig {
  if (process.env.WORKSHOPLM_LIVE_OPENAI !== "1") throw new Error("Refusing paid provider calls: set WORKSHOPLM_LIVE_OPENAI=1 only after spend authorization.");
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required for the live operator run.");
  return { apiKey: process.env.OPENAI_API_KEY, ...defaultOpenAiMediaConfig };
}

async function prepareWorkshop(config?: OpenAiMediaConfig): Promise<void> {
  if (!keep) await rm(root, { recursive: true, force: true });
  await mkdir(root, { recursive: true });
  await captureFallbackTranscript("WorkshopLM should show how a messy spoken idea becomes a grounded Map, an approved brief, coherent visuals, an editable storyboard, and the final Build Week demo video.", root);
  await ingestSource({
    title: "Build Week judge path",
    origin: "Sanitized operator fixture",
    permission: "sanitized",
    text: "Judges need one continuous Capture to Shape to Deliver path. Every factual claim must retain a visible source locator. The public demo video must remain under three minutes.",
  }, root);
  await ingestSource({
    title: "WorkshopLM product direction",
    origin: "Sanitized operator fixture",
    permission: "sanitized",
    text: "Professional teams start with unstructured voice or meeting notes. The approved Map becomes the brief. Brand rules govern the deck, infographic, image batch, storyboard, and narrated video. Only an approved current storyboard may render.",
  }, root);
  extractWorkshopCandidates(root);
  if (config) await generateGroundedMapWithGpt56(root, { apiKey: config.apiKey, model: "gpt-5.6-sol", reasoningEffort: "medium" });
  applyWorkshopAction("approveBrief", root);
  lockManualStyle({
    name: "WorkshopLM official demo",
    accent: "#0285FF",
    ink: "#0D0D0D",
    paper: "#FFFFFF",
    licensedFonts: ["SF Pro system stack"],
    references: ["OpenAI editorial restraint", "clear evidence hierarchy", "generous white space"],
    negativeRules: ["no stock-photo cliches", "no readable text inside generated images", "no gradients"],
    intentProfile: "client_facing_pitch",
  }, root);
  createVisualDna(root);
  approveVisualDna(root);
  generateAssetPlan(root);
  await generateOutput("deck", root);
  await generateOutput("infographic", root);
  createImageBatch(root);
  generateStoryboard(root);
  applyWorkshopAction("approveStoryboard", root);
}

async function main(): Promise<void> {
  const config = executeLive ? liveConfig() : undefined;
  await prepareWorkshop(config);
  const prepared = readWorkshopState(root);
  const plan = {
    mode: executeLive ? "live" : "preflight",
    status: executeLive ? "running" : "ready",
    root,
    paidCallsMade: false,
    plannedPaidRequests: { gpt56GroundedMap: 1, gptImage2: prepared.imageBatch?.panels.length ?? 0, gpt4oMiniTts: prepared.storyboard.panels.length, gpt56Benchmark: 9 },
    approvals: { brief: prepared.briefApproved, storyboard: prepared.storyboardApproved },
    sources: prepared.sourceItems.filter((source) => source.origin === "Sanitized operator fixture" || source.origin.includes("capture-only fallback")).map((source) => ({ title: source.title, permission: source.permission })),
    outputs: prepared.outputs.map((output) => ({ type: output.type, relativePath: output.relativePath, claims: output.claimIds.length })),
    nextCommand: "WORKSHOPLM_LIVE_OPENAI=1 OPENAI_API_KEY=... pnpm demo:live -- --execute",
    viewCommand: 'WORKSHOPLM_DATA_ROOT="$PWD/.workshoplm/live-operator" pnpm dev',
  };
  await writeFile(resolve(root, "live-operator-plan.json"), `${JSON.stringify(plan, null, 2)}\n`);
  if (!executeLive) {
    console.log(JSON.stringify(plan, null, 2));
    return;
  }

  const images = await generateOpenAiImageBatch(root, config!);
  if (images.status !== "passed") throw new Error(`Live image batch was partial; failed panels: ${images.failed.join(", ")}`);
  const narration = await generateOpenAiNarration(root, config!);
  if (narration.status !== "passed") throw new Error(`Live narration was partial; failed panels: ${narration.failed.join(", ")}`);
  applyWorkshopAction("renderVideo", root);
  const video = await executeOne(root);
  if (video.state !== "succeeded") throw new Error(video.error ?? "HyperFrames video render failed.");
  const finalState = readWorkshopState(root);
  console.log(JSON.stringify({
    ...plan,
    status: "passed",
    paidCallsMade: true,
    reasoning: finalState.aiRuns.map((run) => ({ operation: run.operation, model: run.model, requestId: run.requestId, outputSha256: run.outputSha256 })),
    images: finalState.imageBatch?.panels.map((panel) => ({ id: panel.id, state: panel.state, model: panel.provenance?.model, sha256: panel.sha256 })),
    narration: finalState.narration?.panels.map((panel) => ({ panelId: panel.panelId, model: panel.model, voice: panel.voice, sha256: panel.sha256 })),
    video: video.artifact?.relativePath,
  }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
