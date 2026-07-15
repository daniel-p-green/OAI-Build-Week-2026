import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { executeOne } from "../apps/worker/src/executor.ts";
import { defaultOpenAiMediaConfig, generateOpenAiImageBatch, generateOpenAiNarration, planOpenAiMediaRetry, type OpenAiMediaConfig } from "../apps/worker/src/openai-media.ts";
import { classifyFailedRun, operatorRunEvidence, operatorStateFingerprint, protectsPaidOperatorState, retryCommandFor, retryEligibility, safeOperatorError, verifiedRealtimeCaptures, type OperatorRunRecord } from "../apps/worker/src/live-operator-evidence.ts";
import { generateGroundedMapWithGpt56 } from "../apps/worker/src/openai-reasoning.ts";
import { createProviderRequestBudget, type ProviderRequestBudget } from "../apps/worker/src/provider-budget.ts";
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
const retryFailed = process.argv.includes("--retry-failed");
const resetPaidState = process.argv.includes("--reset-paid-state");
const root = resolve(process.cwd(), ".workshoplm", "live-operator");
const liveOperatorPaidRequestCount = 12;
const runArtifactPath = resolve(process.cwd(), ".workshoplm", "live-operator-run.json");

async function writeRunArtifact(value: Record<string, unknown>): Promise<void> {
  await writeFile(runArtifactPath, `${JSON.stringify({ schemaVersion: 1, ...value }, null, 2)}\n`);
}

async function readRunArtifact(): Promise<OperatorRunRecord | undefined> {
  try {
    const value = JSON.parse(await readFile(runArtifactPath, "utf8")) as unknown;
    return value && typeof value === "object" ? value as OperatorRunRecord : undefined;
  } catch {
    return undefined;
  }
}

async function operatorStateExists(): Promise<boolean> {
  try { await access(join(root, "data", "workshoplm.sqlite")); return true; } catch { return false; }
}

function liveConfig(requiredRequests: number): { media: OpenAiMediaConfig; budget: ProviderRequestBudget } {
  if (process.env.WORKSHOPLM_LIVE_OPENAI !== "1") throw new Error("Refusing paid provider calls: set WORKSHOPLM_LIVE_OPENAI=1 only after spend authorization.");
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required for the live operator run.");
  const requestCeiling = Number(process.env.WORKSHOPLM_MAX_PAID_REQUESTS);
  if (!Number.isSafeInteger(requestCeiling) || requestCeiling < requiredRequests) {
    throw new Error(`WORKSHOPLM_MAX_PAID_REQUESTS must explicitly authorize at least ${requiredRequests} requests for this live run.`);
  }
  return {
    media: { apiKey: process.env.OPENAI_API_KEY, ...defaultOpenAiMediaConfig },
    budget: createProviderRequestBudget(requestCeiling),
  };
}

async function prepareWorkshop(config?: { media: OpenAiMediaConfig; budget: ProviderRequestBudget }, onRootReady?: () => Promise<void>, preserveVoice = true): Promise<void> {
  const preservedCaptures = preserveVoice && await operatorStateExists() ? verifiedRealtimeCaptures(readWorkshopState(root)) : [];
  if (config && !preservedCaptures.length) throw new Error('Refusing paid provider calls without a verified Realtime voice turn. Run the preflight, open its viewCommand, use "Record voice" and "Add transcript", then rerun the live command.');
  await rm(root, { recursive: true, force: true });
  await mkdir(root, { recursive: true });
  await onRootReady?.();
  if (preservedCaptures.length) for (const capture of preservedCaptures) await captureFallbackTranscript(capture.text, root, capture.evidence);
  else await captureFallbackTranscript("WorkshopLM should show how a messy spoken idea becomes a grounded Map, an approved brief, coherent visuals, an editable storyboard, and the final Build Week demo video.", root);
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
  if (config) await generateGroundedMapWithGpt56(root, { apiKey: config.media.apiKey, model: "gpt-5.6-sol", reasoningEffort: "medium" }, config.budget.fetch);
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
}

async function main(): Promise<void> {
  let config: { media: OpenAiMediaConfig; budget: ProviderRequestBudget } | undefined;
  let runStarted = false;
  let startedAt = "";
  let failedStage = "authorization";
  try {
    if (process.argv.includes("--keep")) throw new Error("--keep was removed because it could duplicate sources and provider work. Use --retry-failed for a state-preserving retry.");
    if (retryFailed && resetPaidState) throw new Error("--retry-failed and --reset-paid-state cannot be used together.");
    const priorRun = await readRunArtifact();
    const stateExists = await operatorStateExists();
    const existingState = stateExists ? readWorkshopState(root) : undefined;
    if (retryFailed) {
      if (!stateExists) throw new Error("No prior live-operator state is available to retry. Run the normal live operator first.");
      const eligibility = retryEligibility(priorRun, operatorStateFingerprint(existingState!));
      if (!eligibility.eligible) throw new Error(`Refusing --retry-failed: ${eligibility.reason}`);
    } else if (stateExists && protectsPaidOperatorState(priorRun) && !resetPaidState) {
      throw new Error("Refusing to replace reusable paid live-operator state. Use --retry-failed to continue it, or --reset-paid-state only when intentionally discarding those artifacts.");
    }
    const prior = retryFailed ? readWorkshopState(root) : undefined;
    const retryPlan = prior ? planOpenAiMediaRetry(prior) : undefined;
    const requiredRequests = retryPlan?.plannedRequests ?? liveOperatorPaidRequestCount;
    config = executeLive && requiredRequests > 0 ? liveConfig(requiredRequests) : undefined;
    startedAt = new Date().toISOString();
    const mode = retryFailed ? (executeLive ? "live-retry" : "retry-preflight") : (executeLive ? "live" : "preflight");
    const startRun = async () => {
      await writeRunArtifact({ mode, status: "running", startedAt, root, plannedPaidRequests: requiredRequests, requestCeiling: config?.budget.maxRequests ?? null, paidRequests: { used: 0, ceiling: config?.budget.maxRequests ?? 0 } });
      runStarted = true;
    };
    failedStage = "grounded-map-and-preparation";
    if (!retryFailed) await prepareWorkshop(config, executeLive ? startRun : undefined, !resetPaidState);
    else if (executeLive) await startRun();
    const prepared = readWorkshopState(root);
    const providerVoiceTurns = verifiedRealtimeCaptures(prepared).length;
    const plan = {
      mode,
      status: executeLive ? "running" : "ready",
      root,
      paidCallsMade: false,
      plannedPaidRequests: retryPlan
        ? { liveOperator: retryPlan.plannedRequests, gpt56GroundedMap: 0, gptImage2: retryPlan.imagePanelIds.length, gpt4oMiniTts: retryPlan.narrationPanelIds.length, separateGpt56Benchmark: 9 }
        : { liveOperator: liveOperatorPaidRequestCount, gpt56GroundedMap: 1, gptImage2: prepared.imageBatch?.panels.length ?? 0, gpt4oMiniTts: prepared.storyboard.panels.length, separateGpt56Benchmark: 9 },
      retrySelection: retryPlan ?? null,
      requestCeiling: config?.budget.maxRequests ?? null,
      providerVoiceReady: providerVoiceTurns > 0,
      providerVoiceTurns,
      approvals: { brief: prepared.briefApproved, storyboard: prepared.storyboardApproved },
      sources: prepared.sourceItems.filter((source) => source.origin === "Sanitized operator fixture" || source.origin.includes("capture-only fallback")).map((source) => ({ title: source.title, permission: source.permission })),
      outputs: prepared.outputs.map((output) => ({ type: output.type, relativePath: output.relativePath, claims: output.claimIds.length })),
      nextCommand: !retryFailed && providerVoiceTurns === 0
        ? null
        : retryFailed
        ? (requiredRequests > 0
            ? `WORKSHOPLM_LIVE_OPENAI=1 WORKSHOPLM_MAX_PAID_REQUESTS=${requiredRequests} OPENAI_API_KEY=... pnpm demo:live -- --execute --retry-failed`
            : "pnpm demo:live -- --execute --retry-failed")
        : `WORKSHOPLM_LIVE_OPENAI=1 WORKSHOPLM_MAX_PAID_REQUESTS=${liveOperatorPaidRequestCount} OPENAI_API_KEY=... pnpm demo:live -- --execute`,
      nextAction: !retryFailed && providerVoiceTurns === 0 ? 'Open the viewCommand, choose "Add source", record a Realtime voice turn, add its transcript, then rerun this preflight.' : "Run nextCommand after explicit spend authorization.",
      viewCommand: 'WORKSHOPLM_DATA_ROOT="$PWD/.workshoplm/live-operator" pnpm dev',
    };
    await writeFile(resolve(root, "live-operator-plan.json"), `${JSON.stringify(plan, null, 2)}\n`);
    if (!executeLive) {
      console.log(JSON.stringify(plan, null, 2));
      return;
    }

    const imageSelection = retryPlan?.imagePanelIds;
    const narrationSelection = retryPlan?.narrationPanelIds;
    failedStage = "images";
    if (imageSelection?.length || !retryFailed) {
      const images = await generateOpenAiImageBatch(root, config!.media, config!.budget.fetch, imageSelection);
      if (images.status !== "passed") throw new Error(`Live image batch was partial; failed panels: ${images.failed.join(", ")}`);
    }
    const imageReadyState = readWorkshopState(root);
    if (!imageReadyState.storyboardApproved) applyWorkshopAction("approveStoryboard", root);
    failedStage = "narration";
    if (narrationSelection?.length || !retryFailed) {
      const narration = await generateOpenAiNarration(root, config!.media, config!.budget.fetch, narrationSelection);
      if (narration.status !== "passed") throw new Error(`Live narration was partial; failed panels: ${narration.failed.join(", ")}`);
    }
    failedStage = "video";
    const beforeRender = readWorkshopState(root);
    let video: Awaited<ReturnType<typeof executeOne>> | { state: "succeeded"; artifact: { relativePath: string } };
    if (beforeRender.videoState === "rendered") {
      const currentVideo = [...beforeRender.videos].reverse().find((candidate) => !candidate.stale);
      if (!currentVideo) throw new Error("Video state is rendered but no current immutable Video version exists.");
      video = { state: "succeeded", artifact: { relativePath: currentVideo.relativePath } };
    }
    else {
      applyWorkshopAction("renderVideo", root);
      video = await executeOne(root);
      if (video.state !== "succeeded") throw new Error(video.error ?? "HyperFrames video render failed.");
    }
    const finalState = readWorkshopState(root);
    const outcome = {
      ...plan,
      status: "passed",
      startedAt,
      completedAt: new Date().toISOString(),
      paidCallsMade: Boolean(config?.budget.usedRequests()),
      paidRequests: { used: config?.budget.usedRequests() ?? 0, ceiling: config?.budget.maxRequests ?? 0 },
      stateFingerprint: operatorStateFingerprint(finalState),
      approvals: { brief: finalState.briefApproved, storyboard: finalState.storyboardApproved },
      ...operatorRunEvidence(finalState),
      video: video.artifact?.relativePath,
    };
    await writeRunArtifact(outcome);
    console.log(JSON.stringify(outcome, null, 2));
  } catch (error) {
    if (runStarted) {
      const state = readWorkshopState(root);
      const retry = retryCommandFor(state, liveOperatorPaidRequestCount);
      await writeRunArtifact({
        mode: retryFailed ? "live-retry" : "live",
        status: classifyFailedRun(state, failedStage),
        startedAt,
        completedAt: new Date().toISOString(),
        failedStage,
        error: safeOperatorError(error),
        root,
        paidCallsMade: Boolean(config?.budget.usedRequests()),
        paidRequests: { used: config?.budget.usedRequests() ?? 0, ceiling: config?.budget.maxRequests ?? 0 },
        stateFingerprint: operatorStateFingerprint(state),
        retrySelection: retry.selection,
        retryCommand: retry.command,
        ...operatorRunEvidence(state),
      });
    }
    throw error;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
