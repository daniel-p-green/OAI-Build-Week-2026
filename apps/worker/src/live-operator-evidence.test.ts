import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { classifyFailedRun, operatorRunEvidence, retryCommandFor, safeOperatorError } from "./live-operator-evidence.js";
import { applyWorkshopAction, approveVisualDna, createImageBatch, createVisualDna, generateAssetPlan, generateStoryboard, lockManualStyle, markImagePanelFailed, readWorkshopState, recordGeneratedImagePanel, recordNarrationProgress } from "./workshop-service.js";

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
      provenance: { model: "gpt-image-2", size: "1024x1024", quality: "medium", requestId: "image-request-1", generatedAt: new Date().toISOString() },
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
});
