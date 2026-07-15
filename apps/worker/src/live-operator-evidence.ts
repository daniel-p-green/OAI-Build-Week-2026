import { createHash } from "node:crypto";
import { planOpenAiMediaRetry, type OpenAiMediaRetryPlan } from "./openai-media.js";
import type { RealtimeCaptureEvidence, WorkshopState } from "./workshop-service.js";

export type OperatorRunRecord = {
  mode?: string;
  status?: string;
  failedStage?: string;
  paidCallsMade?: boolean;
  stateFingerprint?: string;
};

export function operatorStateFingerprint(state: WorkshopState): string {
  const evidence = {
    workshopId: state.id,
    storyboardVersion: state.storyboard.version,
    reasoning: state.aiRuns.map((run) => ({ operation: run.operation, model: run.model, requestId: run.requestId, outputSha256: run.outputSha256 })),
    images: state.imageBatch ? {
      id: state.imageBatch.id,
      graphRevision: state.imageBatch.graphRevision,
      briefVersion: state.imageBatch.briefVersion,
      styleVersion: state.imageBatch.styleVersion,
      referenceSha256: state.imageBatch.referenceSha256,
      panels: state.imageBatch.panels.map((panel) => ({ id: panel.id, version: panel.version, promptSha256: createHash("sha256").update(panel.prompt).digest("hex"), evidence: panel.evidence, state: panel.state, requestId: panel.provenance?.requestId, sha256: panel.sha256 })),
    } : null,
    narration: state.narration ? { storyboardVersion: state.narration.storyboardVersion, stale: state.narration.stale, panels: state.narration.panels.map((panel) => ({ panelId: panel.panelId, requestId: panel.requestId, sha256: panel.sha256 })), failures: state.narration.failures ?? [] } : null,
    videos: state.videos.map((video) => ({ id: video.id, version: video.version, stale: video.stale, sha256: video.sha256 })),
  };
  return createHash("sha256").update(JSON.stringify(evidence)).digest("hex");
}

export function verifiedRealtimeCaptures(state: WorkshopState): Array<{ text: string; evidence: RealtimeCaptureEvidence }> {
  return state.transcriptSegments.flatMap((segment) => {
    const provider = segment.provider;
    if (segment.transport !== "webrtc" || !segment.text.trim() || provider?.model !== "gpt-realtime-2.1" || provider.transcriptionModel !== "gpt-realtime-whisper" || !provider.itemIds.length || !provider.eventIds.length || provider.itemIds.length !== provider.eventIds.length) return [];
    return [{ text: segment.text, evidence: { transport: "webrtc" as const, model: provider.model, transcriptionModel: provider.transcriptionModel, itemIds: [...provider.itemIds], eventIds: [...provider.eventIds] } }];
  });
}

export function retryEligibility(record: OperatorRunRecord | undefined, stateFingerprint?: string): { eligible: boolean; reason?: string } {
  if (!record) return { eligible: false, reason: "No prior live operator record exists." };
  if (!record.paidCallsMade) return { eligible: false, reason: "The prior operator record contains no paid provider attempt." };
  if (record.status !== "partial" && record.status !== "failed") return { eligible: false, reason: `The prior operator status is ${record.status ?? "unknown"}, not partial or failed.` };
  if (record.failedStage === "grounded-map-and-preparation") return { eligible: false, reason: "The GPT-5.6 Map stage did not complete; start a clean normal live run instead." };
  if (!record.stateFingerprint || !stateFingerprint || record.stateFingerprint !== stateFingerprint) return { eligible: false, reason: "The prior run record does not match the current persisted Workshop state." };
  return { eligible: true };
}

export function protectsPaidOperatorState(record: OperatorRunRecord | undefined): boolean {
  return Boolean(record?.paidCallsMade && (record.status === "passed" || record.status === "partial" || (record.status === "failed" && record.failedStage !== "grounded-map-and-preparation")));
}

export function safeOperatorError(error: unknown): string {
  return (error instanceof Error ? error.message : String(error))
    .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]")
    .replace(/Bearer\s+[^\s]+/gi, "Bearer [redacted]")
    .slice(0, 500);
}

export function retryCommandFor(state: WorkshopState, normalRequestCount = 12): { selection: OpenAiMediaRetryPlan | null; command: string } {
  try {
    const selection = planOpenAiMediaRetry(state);
    return {
      selection,
      command: selection.plannedRequests > 0
        ? `WORKSHOPLM_LIVE_OPENAI=1 WORKSHOPLM_MAX_PAID_REQUESTS=${selection.plannedRequests} OPENAI_API_KEY=... pnpm demo:live -- --execute --retry-failed`
        : "pnpm demo:live -- --execute --retry-failed",
    };
  } catch {
    return { selection: null, command: `WORKSHOPLM_LIVE_OPENAI=1 WORKSHOPLM_MAX_PAID_REQUESTS=${normalRequestCount} OPENAI_API_KEY=... pnpm demo:live -- --execute` };
  }
}

export function classifyFailedRun(state: WorkshopState, failedStage: string): "partial" | "failed" {
  const hasPartialMedia = Boolean(state.imageBatch?.panels.some((panel) => panel.state === "generated") || state.narration?.panels.length);
  return hasPartialMedia && failedStage !== "video" ? "partial" : "failed";
}

export function operatorRunEvidence(state: WorkshopState): Record<string, unknown> {
  return {
    reasoning: state.aiRuns.map((run) => ({ operation: run.operation, model: run.model, requestId: run.requestId, outputSha256: run.outputSha256 })),
    images: state.imageBatch?.panels.map((panel) => ({ id: panel.id, evidence: panel.evidence, promptSha256: createHash("sha256").update(panel.prompt).digest("hex"), state: panel.state, model: panel.provenance?.model, requestId: panel.provenance?.requestId, sha256: panel.sha256, error: panel.error })),
    narration: state.narration ? {
      stale: state.narration.stale,
      panels: state.narration.panels.map((panel) => ({ panelId: panel.panelId, model: panel.model, voice: panel.voice, requestId: panel.requestId, sha256: panel.sha256 })),
      failures: state.narration.failures ?? [],
    } : null,
    videoState: state.videoState,
  };
}
