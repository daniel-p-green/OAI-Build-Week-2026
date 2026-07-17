import { access, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { executeOne } from "../apps/worker/src/executor.ts";
import { inspectFounderCapture, stageFounderCapture, stageFounderFilmInputs, type FounderCaptureManifest } from "../apps/worker/src/founder-capture.ts";
import { defaultOpenAiMediaConfig, generateOpenAiAudioOverview, generateOpenAiImageBatch, generateOpenAiNarration, planOpenAiMediaRetry, validateImageBatchCoherence, validateNarrationReadiness, type OpenAiMediaConfig } from "../apps/worker/src/openai-media.ts";
import { classifyFailedRun, operatorRunEvidence, operatorStateFingerprint, protectsPaidOperatorState, retryCommandFor, retryEligibility, safeOperatorError, verifiedRealtimeCaptures, type OperatorRunRecord } from "../apps/worker/src/live-operator-evidence.ts";
import { generateGroundedMapWithGpt56 } from "../apps/worker/src/openai-reasoning.ts";
import { createProviderRequestBudget, type ProviderRequestBudget } from "../apps/worker/src/provider-budget.ts";
import { buildSubmissionOutputSet, verifySubmissionOutputSet } from "../apps/worker/src/submission-package.ts";
import {
  applyWorkshopAction,
  approveVisualDna,
  captureFallbackTranscript,
  captureImportedTranscript,
  createImageBatch,
  createVisualDna,
  dismissWorkshopOrientation,
  extractWorkshopCandidates,
  generateAssetPlan,
  generateAudioOverview,
  generateOutput,
  generateStoryboard,
  ingestSource,
  lockManualStyle,
  readWorkshopState,
  updateWorkshopOnboarding,
} from "../apps/worker/src/workshop-service.ts";

const executeLive = process.argv.includes("--execute");
const retryFailed = process.argv.includes("--retry-failed");
const resetPaidState = process.argv.includes("--reset-paid-state");
const allowSampleTranscript = process.argv.includes("--allow-sample-transcript");
function flagValue(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  if (index < 0) return undefined;
  const value = process.argv[index + 1];
  if (!value || value.startsWith("--")) throw new Error(`${name} requires a value.`);
  return value;
}
function shellQuote(value: string): string { return `'${value.replaceAll("'", `'\\''`)}'`; }
const repository = process.cwd();
const localDataRoot = resolve(repository, ".workshoplm");
const requestedRoot = resolve(repository, flagValue("--root") ?? join(".workshoplm", "live-operator"));
const rootRelative = relative(localDataRoot, requestedRoot);
if (!rootRelative || rootRelative.startsWith("..") || isAbsolute(rootRelative)) throw new Error("Live operator root must be a dedicated directory inside the repository .workshoplm directory.");
const root = requestedRoot;
const founderRecordingPath = flagValue("--founder-recording");
const founderTranscriptPath = flagValue("--founder-transcript");
const shareFounderSource = process.argv.includes("--share-founder-source");
const stageFilmInputs = process.argv.includes("--stage-film-inputs");
if (Boolean(founderRecordingPath) !== Boolean(founderTranscriptPath)) throw new Error("--founder-recording and --founder-transcript must be provided together.");
if (shareFounderSource && (!founderRecordingPath || !founderTranscriptPath)) throw new Error("--share-founder-source requires a founder recording and transcript.");
if (stageFilmInputs && (!founderRecordingPath || !founderTranscriptPath)) throw new Error("--stage-film-inputs requires a founder recording and transcript.");
if (stageFilmInputs && !shareFounderSource) throw new Error("--stage-film-inputs requires --share-founder-source because it copies founder evidence into the final film input directory.");
const liveOperatorPaidRequestCount = 13;
const runArtifactPath = resolve(dirname(root), `${basename(root)}-run.json`);

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

type FounderCapture = Awaited<ReturnType<typeof inspectFounderCapture>>;

async function prepareWorkshop(config?: { media: OpenAiMediaConfig; budget: ProviderRequestBudget }, onRootReady?: () => Promise<void>, preserveVoice = true, allowSample = false, founderCapture?: FounderCapture): Promise<FounderCaptureManifest | undefined> {
  const preservedCaptures = preserveVoice && await operatorStateExists() ? verifiedRealtimeCaptures(readWorkshopState(root)) : [];
  if (config && !preservedCaptures.length && !allowSample && !founderCapture) throw new Error('Refusing paid provider calls without a verified Realtime voice turn. Run the preflight, open its viewCommand, use "Record voice" and "Add transcript", supply a validated founder recording and transcript, or rerun with --allow-sample-transcript only after explicit sample-script authorization.');
  await rm(root, { recursive: true, force: true });
  await mkdir(root, { recursive: true });
  await onRootReady?.();
  const founderManifest = founderCapture ? await stageFounderCapture(founderCapture, root) : undefined;
  if (founderCapture && stageFilmInputs) await stageFounderFilmInputs(founderCapture, resolve(repository, "outputs", "demo-film-inputs"));
  if (preservedCaptures.length) for (const capture of preservedCaptures) await captureFallbackTranscript(capture.text, root, capture.evidence);
  if (founderCapture) await captureImportedTranscript(founderCapture.transcript, { title: "Founder brainstorm", origin: "Founder-provided recording", permission: shareFounderSource ? "shareable" : "private" }, root);
  else if (!preservedCaptures.length && allowSample) await captureImportedTranscript("WorkshopLM should show how a messy spoken idea becomes a grounded Map, an approved Brief, coherent visuals, an editable Storyboard, and the final Build Week demonstration Video.", { title: "Authorized sample brainstorm", origin: "Authorized sample script", permission: "sanitized" }, root);
  else if (!preservedCaptures.length) await captureFallbackTranscript("WorkshopLM should show how a messy spoken idea becomes a grounded Map, an approved Brief, coherent visuals, an editable Storyboard, and the final Build Week demonstration Video.", root);
  await ingestSource({
    title: "Build Week judge path",
    origin: "Sanitized operator fixture",
    permission: "sanitized",
    text: "Judges need one continuous Capture to Map to Brief to Create path. Every factual claim must retain a visible source locator. The public demo video must remain under three minutes.",
  }, root);
  await ingestSource({
    title: "WorkshopLM product direction",
    origin: "Sanitized operator fixture",
    permission: "sanitized",
    text: "Professional teams start with unstructured voice or meeting notes. The approved Map becomes the Brief. Brand rules govern the presentation, infographic, image set, Storyboard, and narrated Video. Only an approved current Storyboard may render.",
  }, root);
  updateWorkshopOnboarding({ outcome: "client_facing_pitch", step: "complete" }, root);
  dismissWorkshopOrientation("map", root);
  dismissWorkshopOrientation("outputs", root);
  extractWorkshopCandidates(root);
  if (config) await generateGroundedMapWithGpt56(root, { apiKey: config.media.apiKey, model: "gpt-5.6-terra", reasoningEffort: "medium" }, config.budget.fetch);
  applyWorkshopAction("approveBrief", root);
  lockManualStyle({
    name: "WorkshopLM official demo",
    accent: "#0285FF",
    ink: "#0D0D0D",
    paper: "#FFFFFF",
    headingFont: "system-ui",
    bodyFont: "system-ui",
    fontsConfirmed: false,
    references: ["OpenAI editorial restraint", "clear evidence hierarchy", "generous white space"],
    negativeRules: ["no stock-photo cliches", "no readable text inside generated images", "no gradients"],
    intentProfile: "client_facing_pitch",
  }, root);
  createVisualDna(root);
  approveVisualDna(root);
  generateAssetPlan(root);
  await generateOutput("deck", root);
  await generateOutput("infographic", root);
  generateAudioOverview(root);
  createImageBatch(root);
  generateStoryboard(root);
  return founderManifest;
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
    const founderCapture = founderRecordingPath && founderTranscriptPath ? await inspectFounderCapture(founderRecordingPath, founderTranscriptPath) : undefined;
    if (founderCapture && (founderCapture.recordingPath === root || founderCapture.recordingPath.startsWith(`${root}/`) || founderCapture.transcriptPath === root || founderCapture.transcriptPath.startsWith(`${root}/`))) throw new Error("Founder input files must stay outside the operator root so reset cannot delete them.");
    const stateExists = await operatorStateExists();
    const existingState = stateExists ? readWorkshopState(root) : undefined;
    if (retryFailed) {
      if (!stateExists) throw new Error("No prior live-operator state is available to retry. Run the normal live operator first.");
      const eligibility = retryEligibility(priorRun, operatorStateFingerprint(existingState!));
      if (!eligibility.eligible) throw new Error(`Refusing --retry-failed: ${eligibility.reason}`);
    } else if (stateExists && protectsPaidOperatorState(priorRun) && !resetPaidState) {
      throw new Error("Refusing to replace reusable paid live-operator state. Use --retry-failed to continue it, or --reset-paid-state only when intentionally discarding those artifacts.");
    }
    const repairedNarrationTiming = Boolean(retryFailed && existingState?.narration?.failures?.length && existingState.narration.failures.every((failure) => /longer than its approved/.test(failure.error)));
    if (repairedNarrationTiming) {
      generateAssetPlan(root);
      generateStoryboard(root);
      applyWorkshopAction("approveStoryboard", root);
    }
    const prior = retryFailed ? readWorkshopState(root) : undefined;
    const retryPlan = prior ? planOpenAiMediaRetry(prior) : undefined;
    const priorAudioOverview = prior ? [...prior.audioOverviews].reverse().find((overview) => !overview.stale) : undefined;
    const audioOverviewNeedsProvider = !priorAudioOverview || priorAudioOverview.status !== "audio_ready";
    const requiredRequests = (retryPlan?.plannedRequests ?? (liveOperatorPaidRequestCount - 1)) + (audioOverviewNeedsProvider ? 1 : 0);
    config = executeLive && requiredRequests > 0 ? liveConfig(requiredRequests) : undefined;
    startedAt = new Date().toISOString();
    const mode = retryFailed ? (executeLive ? "live-retry" : "retry-preflight") : (executeLive ? "live" : "preflight");
    const startRun = async () => {
      await writeRunArtifact({ mode, status: "running", startedAt, root, plannedPaidRequests: requiredRequests, requestCeiling: config?.budget.maxRequests ?? null, recovery: repairedNarrationTiming ? "regenerated-concise-storyboard-narration" : null, paidRequests: { used: 0, ceiling: config?.budget.maxRequests ?? 0 } });
      runStarted = true;
    };
    failedStage = "grounded-map-and-preparation";
    let founderManifest: FounderCaptureManifest | undefined;
    if (!retryFailed) founderManifest = await prepareWorkshop(config, executeLive ? startRun : undefined, !resetPaidState, allowSampleTranscript, founderCapture);
    else if (executeLive) await startRun();
    const prepared = readWorkshopState(root);
    const imageReadiness = await validateImageBatchCoherence(root, prepared);
    if (!imageReadiness.valid) throw new Error(`Live image plan is not ready: ${imageReadiness.issues.join(" ")}`);
    const narrationReadiness = validateNarrationReadiness(prepared);
    if (!narrationReadiness.valid) throw new Error(`Live narration plan is not ready: ${narrationReadiness.issues.join(" ")}`);
    const providerVoiceTurns = verifiedRealtimeCaptures(prepared).length;
    const privateSources = prepared.sourceItems.filter((source) => source.permission === "private");
    const founderSourcePermission = founderManifest ? (shareFounderSource ? "shareable" : "private") : null;
    const founderPrivacyReviewRequired = founderSourcePermission === "private";
    const publicPackageEligible = privateSources.length === 0;
    const rootFlag = `--root ${shellQuote(relative(repository, root))}`;
    const founderInputFlags = founderRecordingPath && founderTranscriptPath
      ? ` --founder-recording ${shellQuote(founderRecordingPath)} --founder-transcript ${shellQuote(founderTranscriptPath)}`
      : "";
    const shareablePreflightCommand = founderPrivacyReviewRequired
      ? `pnpm demo:live -- ${rootFlag}${founderInputFlags} --share-founder-source --stage-film-inputs`
      : null;
    const liveCommand = retryFailed
      ? (requiredRequests > 0
          ? `WORKSHOPLM_LIVE_OPENAI=1 WORKSHOPLM_MAX_PAID_REQUESTS=${requiredRequests} OPENAI_API_KEY=... pnpm demo:live -- --execute --retry-failed ${rootFlag}`
          : `pnpm demo:live -- --execute --retry-failed ${rootFlag}`)
      : `WORKSHOPLM_LIVE_OPENAI=1 WORKSHOPLM_MAX_PAID_REQUESTS=${liveOperatorPaidRequestCount} OPENAI_API_KEY=... pnpm demo:live -- --execute ${rootFlag}${founderInputFlags}${shareFounderSource ? " --share-founder-source" : ""}${stageFilmInputs ? " --stage-film-inputs" : ""}${allowSampleTranscript && providerVoiceTurns === 0 ? " --allow-sample-transcript" : ""}`;
    const missingCapture = !retryFailed && providerVoiceTurns === 0 && !allowSampleTranscript && !founderManifest;
    const plan = {
      mode,
      status: executeLive ? "running" : "ready",
      root,
      paidCallsMade: false,
      plannedPaidRequests: retryPlan
        ? { liveOperator: requiredRequests, gpt56GroundedMap: 0, gptImage2: retryPlan.imagePanelIds.length, gpt4oMiniTts: retryPlan.narrationPanelIds.length, gpt4oMiniTtsAudioOverview: audioOverviewNeedsProvider ? 1 : 0, separateGpt56Benchmark: 9 }
        : { liveOperator: liveOperatorPaidRequestCount, gpt56GroundedMap: 1, gptImage2: prepared.imageBatch?.panels.length ?? 0, gpt4oMiniTts: prepared.storyboard.panels.length, gpt4oMiniTtsAudioOverview: 1, separateGpt56Benchmark: 9 },
      retrySelection: retryPlan ?? null,
      requestCeiling: config?.budget.maxRequests ?? null,
      providerVoiceReady: providerVoiceTurns > 0,
      providerVoiceTurns,
      sampleTranscriptAuthorized: allowSampleTranscript && providerVoiceTurns === 0 && !founderManifest,
      founderCapture: founderManifest ?? null,
      founderFilmInputs: founderManifest && stageFilmInputs ? resolve(repository, "outputs", "demo-film-inputs") : null,
      founderSourcePermission,
      founderPrivacyReviewRequired,
      publicPackageEligible,
      privateSources: privateSources.map((source) => ({ title: source.title, origin: source.origin })),
      captureEvidence: providerVoiceTurns > 0
        ? (founderManifest ? "provider-verified-realtime-and-founder-recording" : "provider-verified-realtime")
        : founderManifest
          ? "founder-provided-recording-and-transcript"
          : allowSampleTranscript
            ? "authorized-sample-script"
            : "private-capture-placeholder",
      approvals: { brief: prepared.briefApproved, storyboard: prepared.storyboardApproved },
      sources: prepared.sourceItems.filter((source) => source.origin === "Sanitized operator fixture" || source.origin.includes("capture-only fallback") || source.origin === "Founder-provided recording" || source.origin === "Authorized sample script").map((source) => ({ title: source.title, origin: source.origin, permission: source.permission })),
      outputs: prepared.outputs.map((output) => ({ type: output.type, relativePath: output.relativePath, claims: output.claimIds.length })),
      imageReadiness,
      narrationReadiness,
      imagePlan: prepared.imageBatch?.panels.map((panel) => ({ id: panel.id, prompt: panel.prompt, evidence: panel.evidence })) ?? [],
      imageReviewRubric: [
        "Each panel belongs in a client or leadership presentation without relying on generic AI illustration.",
        "The six panels share one palette, folded-plane motif, material language, lighting model, and compositional restraint.",
        "Each panel communicates its grounded idea without readable text, invented quantities, logos, or UI chrome.",
        "Hero, systems diagram, evidence chain, decision visual, storyboard sequence, and section art are visibly distinct jobs.",
      ],
      nextCommand: missingCapture || !publicPackageEligible ? null : liveCommand,
      shareablePreflightCommand,
      nextAction: missingCapture
        ? 'Open the viewCommand, choose "Add source", record a Realtime voice turn, add its transcript, supply a validated founder recording and transcript, or rerun with --allow-sample-transcript after explicit sample-script authorization.'
        : founderPrivacyReviewRequired
          ? "Review the private founder Source with viewCommand. After explicit approval to include it in the public demonstration, run shareablePreflightCommand; that second preflight stages the final film inputs and prints the paid command."
          : !publicPackageEligible
            ? "The Workshop contains private Sources, so no paid public-package command is available. Use a validated founder capture with explicit sharing approval or the authorized sanitized sample path."
            : "Run nextCommand only when the reviewed Source permissions and paid request ceiling are correct.",
      viewCommand: `WORKSHOPLM_DATA_ROOT=${shellQuote(root)} pnpm dev`,
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
    let imageReadyState = readWorkshopState(root);
    if (imageReadyState.imageBatch?.panels.every((panel) => panel.state === "generated") && !imageReadyState.outputs.some((output) => output.type === "deck" && !output.stale)) {
      imageReadyState = await generateOutput("deck", root);
    }
    if (!imageReadyState.storyboardApproved) applyWorkshopAction("approveStoryboard", root);
    failedStage = "narration";
    if (narrationSelection?.length || !retryFailed) {
      const narration = await generateOpenAiNarration(root, config!.media, config!.budget.fetch, narrationSelection);
      if (narration.status !== "passed") throw new Error(`Live narration was partial; failed panels: ${narration.failed.join(", ")}`);
    }
    failedStage = "audio-overview";
    if (audioOverviewNeedsProvider) await generateOpenAiAudioOverview(root, config!.media, config!.budget.fetch);
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
    failedStage = "submission-output-set";
    const submission = await buildSubmissionOutputSet(root);
    const submissionVerification = await verifySubmissionOutputSet(root, submission.manifestPath);
    if (!submissionVerification.valid) throw new Error(`Final submission Output set failed verification: ${submissionVerification.issues.join("; ")}`);
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
      submission: { manifestPath: submission.manifestPath, status: submission.outputSet.status, limitations: submission.outputSet.limitations, assets: submission.outputSet.assets.length, verification: submissionVerification },
    };
    await writeRunArtifact(outcome);
    console.log(JSON.stringify(outcome, null, 2));
  } catch (error) {
    if (runStarted) {
      const state = readWorkshopState(root);
      const audioOverview = [...state.audioOverviews].reverse().find((overview) => !overview.stale);
      const retry = retryCommandFor(state, liveOperatorPaidRequestCount, audioOverview?.status === "audio_ready" ? 0 : 1);
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
        retryCommand: `${retry.command} --root ${shellQuote(relative(repository, root))}`,
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
