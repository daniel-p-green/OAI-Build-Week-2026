import { planOpenAiMediaRetry, type OpenAiMediaRetryPlan } from "./openai-media.js";
import type { WorkshopState } from "./workshop-service.js";

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
    images: state.imageBatch?.panels.map((panel) => ({ id: panel.id, state: panel.state, model: panel.provenance?.model, requestId: panel.provenance?.requestId, sha256: panel.sha256, error: panel.error })),
    narration: state.narration ? {
      stale: state.narration.stale,
      panels: state.narration.panels.map((panel) => ({ panelId: panel.panelId, model: panel.model, voice: panel.voice, requestId: panel.requestId, sha256: panel.sha256 })),
      failures: state.narration.failures ?? [],
    } : null,
    videoState: state.videoState,
  };
}
