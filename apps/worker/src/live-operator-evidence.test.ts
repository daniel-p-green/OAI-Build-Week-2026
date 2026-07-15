import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { classifyFailedRun, operatorRunEvidence, operatorStateFingerprint, protectsPaidOperatorState, retryCommandFor, retryEligibility, safeOperatorError, verifiedRealtimeCaptures } from "./live-operator-evidence.js";
import { applyWorkshopAction, approveVisualDna, captureFallbackTranscript, createImageBatch, createVisualDna, generateAssetPlan, generateStoryboard, lockManualStyle, markImagePanelFailed, readWorkshopState, recordGeneratedImagePanel, recordNarrationProgress } from "./workshop-service.js";

const roots: string[] = [];

async function readyRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "workshop-operator-evidence-"));
  roots.push(root);
  applyWorkshopAction("approveBrief", root);
  lockManualStyle({}, root);
  createVisualDna(root);
  approveVisualDna(root);
  generateAssetPlan(root);
  createImageBatch(root);
  generateStoryboard(root);
  applyWorkshopAction("approveStoryboard", root);
  return root;
}

afterEach(async () => {
  await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true })));
});

describe("live operator evidence", () => {
  it("redacts credentials and bounds provider errors", () => {
    const error = new Error(`Bearer sk-secret-token ${"x".repeat(600)}`);
    const sanitized = safeOperatorError(error);
    expect(sanitized).not.toContain("sk-secret-token");
    expect(sanitized).toContain("Bearer [redacted]");
    expect(sanitized.length).toBeLessThanOrEqual(500);
  });

  it("records partial media and computes a retry command only for missing panels", async () => {
    const root = await readyRoot();
    const prepared = readWorkshopState(root);
    const imagePanel = prepared.imageBatch!.panels[0]!;
    const narrationPanel = prepared.storyboard.panels[0]!;
    recordGeneratedImagePanel(imagePanel.id, {
      relativePath: `generated/images/${imagePanel.id}.png`,
      sha256: "a".repeat(64),
      provenance: { model: "gpt-image-2", size: "1024x1024", quality: "medium", referenceId: prepared.imageBatch!.referenceId, requestId: "image-request-1", generatedAt: new Date().toISOString() },
    }, root);
    markImagePanelFailed(prepared.imageBatch!.panels[1]!.id, "Image API returned HTTP 503", root);
    recordNarrationProgress({
      storyboardVersion: prepared.storyboard.version,
      disclosure: "AI-generated voice",
      panels: [{ panelId: narrationPanel.id, relativePath: "generated/narration/panel-1.wav", sha256: "b".repeat(64), model: "gpt-4o-mini-tts", voice: "marin", instructions: "Clear narration", requestId: "speech-request-1", generatedAt: new Date().toISOString() }],
      failures: [{ panelId: prepared.storyboard.panels[1]!.id, error: "Speech API returned HTTP 503", failedAt: new Date().toISOString() }],
      stale: true,
      createdAt: new Date().toISOString(),
    }, root);

    const state = readWorkshopState(root);
    const retry = retryCommandFor(state);
    expect(retry.selection).toMatchObject({ plannedRequests: 9, imagePanelIds: expect.not.arrayContaining([imagePanel.id]), narrationPanelIds: expect.not.arrayContaining([narrationPanel.id]) });
    expect(retry.command).toContain("WORKSHOPLM_MAX_PAID_REQUESTS=9");
    expect(classifyFailedRun(state, "narration")).toBe("partial");
    expect(classifyFailedRun(state, "video")).toBe("failed");
    expect(operatorRunEvidence(state)).toMatchObject({
      images: expect.arrayContaining([expect.objectContaining({ id: imagePanel.id, state: "generated", requestId: "image-request-1", sha256: "a".repeat(64) })]),
      narration: { stale: true, panels: [{ panelId: narrationPanel.id, requestId: "speech-request-1", sha256: "b".repeat(64) }], failures: [{ panelId: prepared.storyboard.panels[1]!.id, error: expect.stringContaining("503") }] },
      videoState: "blocked",
    });
  });

  it("falls back to a clean twelve-request run before a media plan exists", async () => {
    const root = await mkdtemp(join(tmpdir(), "workshop-operator-unprepared-"));
    roots.push(root);
    const state = readWorkshopState(root);
    expect(retryCommandFor(state)).toEqual({ selection: null, command: "WORKSHOPLM_LIVE_OPENAI=1 WORKSHOPLM_MAX_PAID_REQUESTS=12 OPENAI_API_KEY=... pnpm demo:live -- --execute" });
  });

  it("allows retries only from a paid partial or post-Map failed run", () => {
    const fingerprint = "f".repeat(64);
    expect(retryEligibility(undefined, fingerprint)).toMatchObject({ eligible: false, reason: expect.stringContaining("No prior") });
    expect(retryEligibility({ mode: "preflight", status: "ready", paidCallsMade: false }, fingerprint)).toMatchObject({ eligible: false, reason: expect.stringContaining("no paid") });
    expect(retryEligibility({ mode: "live", status: "passed", paidCallsMade: true, stateFingerprint: fingerprint }, fingerprint)).toMatchObject({ eligible: false, reason: expect.stringContaining("passed") });
    expect(retryEligibility({ mode: "live", status: "failed", failedStage: "grounded-map-and-preparation", paidCallsMade: true, stateFingerprint: fingerprint }, fingerprint)).toMatchObject({ eligible: false, reason: expect.stringContaining("Map stage") });
    expect(retryEligibility({ mode: "live", status: "partial", failedStage: "images", paidCallsMade: true, stateFingerprint: fingerprint }, "0".repeat(64))).toMatchObject({ eligible: false, reason: expect.stringContaining("does not match") });
    expect(retryEligibility({ mode: "live", status: "partial", failedStage: "images", paidCallsMade: true, stateFingerprint: fingerprint }, fingerprint)).toEqual({ eligible: true });
    expect(retryEligibility({ mode: "live-retry", status: "failed", failedStage: "video", paidCallsMade: true, stateFingerprint: fingerprint }, fingerprint)).toEqual({ eligible: true });
  });

  it("protects reusable paid results from an implicit clean reset", () => {
    expect(protectsPaidOperatorState(undefined)).toBe(false);
    expect(protectsPaidOperatorState({ mode: "preflight", status: "ready", paidCallsMade: false })).toBe(false);
    expect(protectsPaidOperatorState({ mode: "live", status: "failed", failedStage: "grounded-map-and-preparation", paidCallsMade: true })).toBe(false);
    expect(protectsPaidOperatorState({ mode: "live", status: "partial", failedStage: "narration", paidCallsMade: true })).toBe(true);
    expect(protectsPaidOperatorState({ mode: "live", status: "passed", paidCallsMade: true })).toBe(true);
  });

  it("changes the retry fingerprint when provider evidence changes", async () => {
    const root = await readyRoot(); const before = readWorkshopState(root); const imagePanel = before.imageBatch!.panels[0]!; const first = operatorStateFingerprint(before);
    recordGeneratedImagePanel(imagePanel.id, { relativePath: "generated/image.png", sha256: "a".repeat(64), provenance: { model: "gpt-image-2", size: "1024x1024", quality: "medium", referenceId: before.imageBatch!.referenceId, requestId: "request-1", generatedAt: new Date().toISOString() } }, root);
    const after = operatorStateFingerprint(readWorkshopState(root));
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(after).toMatch(/^[a-f0-9]{64}$/);
    expect(after).not.toBe(first);
  });

  it("extracts only complete provider-verified WebRTC captures for preservation", async () => {
    const root = await mkdtemp(join(tmpdir(), "workshop-operator-voice-")); roots.push(root);
    await captureFallbackTranscript("Fixture thought", root);
    await captureFallbackTranscript("Verified microphone thought", root, { transport: "webrtc", model: "gpt-realtime-2.1", transcriptionModel: "gpt-realtime-whisper", itemIds: ["item-1"], eventIds: ["event-1"] });
    expect(verifiedRealtimeCaptures(readWorkshopState(root))).toEqual([{ text: "Verified microphone thought", evidence: { transport: "webrtc", model: "gpt-realtime-2.1", transcriptionModel: "gpt-realtime-whisper", itemIds: ["item-1"], eventIds: ["event-1"] } }]);
  });
});
