import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { defaultOpenAiMediaConfig, generateOpenAiImageBatch, generateOpenAiNarration, maxTtsInputCharacters, planOpenAiMediaRetry, validateImageBatchCoherence, type OpenAiMediaConfig } from "./openai-media.js";
import { applyWorkshopAction, approveVisualDna, createImageBatch, createVisualDna, generateAssetPlan, generateStoryboard, ingestSource, lockManualStyle, readWorkshopState, resolveWorkshopArtifact, updateStoryboardPanel } from "./workshop-service.js";

const roots: string[] = [];
const config: OpenAiMediaConfig = { apiKey: "test-key", ...defaultOpenAiMediaConfig };

function testWav(durationSeconds = 1, marker = 0): Buffer {
  const sampleRate = 8_000; const channels = 1; const bitsPerSample = 16; const byteRate = sampleRate * channels * bitsPerSample / 8; const dataSize = Math.round(durationSeconds * byteRate); const bytes = Buffer.alloc(44 + dataSize, marker);
  bytes.write("RIFF", 0); bytes.writeUInt32LE(36 + dataSize, 4); bytes.write("WAVE", 8); bytes.write("fmt ", 12); bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(channels, 22); bytes.writeUInt32LE(sampleRate, 24); bytes.writeUInt32LE(byteRate, 28); bytes.writeUInt16LE(channels * bitsPerSample / 8, 32); bytes.writeUInt16LE(bitsPerSample, 34); bytes.write("data", 36); bytes.writeUInt32LE(dataSize, 40);
  return bytes;
}

const responseBody = (bytes: Buffer): ArrayBuffer => Uint8Array.from(bytes).buffer;

async function readyRoot(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "workshop-openai-media-"));
  roots.push(root);
  await ingestSource({ title: "Sanitized evidence", origin: "Fixture", text: "Judges need a grounded proof chain from source to finished work." }, root);
  applyWorkshopAction("approveBrief", root);
  lockManualStyle({ accent: "#1155AA" }, root);
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

describe("OpenAI media adapters", () => {
  it("persists a six-image GPT Image 2 batch with panel-level provenance", async () => {
    const root = await readyRoot();
    const requests: Array<{ url: string; body: FormData }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const body = init?.body as FormData;
      requests.push({ url: String(input), body });
      return new Response(JSON.stringify({ data: [{ b64_json: Buffer.from(`image-${requests.length}`).toString("base64") }] }), { status: 200, headers: { "content-type": "application/json", "x-request-id": `image-request-${requests.length}` } });
    };

    await expect(generateOpenAiImageBatch(root, config, fetchImpl)).resolves.toMatchObject({ status: "passed", completed: expect.arrayContaining(["image-panel-1", "image-panel-6"]), failed: [] });
    expect(requests).toHaveLength(6);
    expect(requests.every(({ url, body }) => url.endsWith("/v1/images/edits") && body.get("model") === "gpt-image-2" && body.get("image") instanceof Blob)).toBe(true);
    expect(new Set(requests.map(({ body }) => (body.get("image") as Blob).size)).size).toBe(1);
    expect((requests[0]!.body.get("image") as Blob).size).toBeGreaterThan(1_000);
    expect(requests.every(({ body }) => String(body.get("prompt")).includes("Locked palette: #1155AA, #171816, #F4F2EC"))).toBe(true);
    const state = readWorkshopState(root);
    expect(state.imageBatch?.panels.every((panel) => panel.state === "generated" && panel.provenance?.model === "gpt-image-2" && panel.provenance.referenceId === state.imageBatch?.referenceId && panel.sha256?.length === 64)).toBe(true);
    await expect(readFile(join(root, state.imageBatch!.panels[0]!.relativePath!), "utf8")).resolves.toBe("image-1");
    expect(resolveWorkshopArtifact("image-panel-1", root)).toMatchObject({ contentType: "image/png", path: expect.stringContaining("image-panel-1-v1.png") });
  });

  it("fails closed when the shared reference artifact no longer matches the batch manifest", async () => {
    const root = await readyRoot(); const state = readWorkshopState(root);
    await expect(validateImageBatchCoherence(root, state)).resolves.toMatchObject({ valid: true, panelCount: 6, issues: [] });
    await writeFile(join(root, state.imageBatch!.referencePath), "tampered-reference");
    await expect(validateImageBatchCoherence(root)).resolves.toMatchObject({ valid: false, issues: ["The shared reference image hash does not match its manifest."] });
    let calls = 0;
    const fetchImpl: typeof fetch = async () => { calls += 1; return new Response("should not run", { status: 500 }); };
    await expect(generateOpenAiImageBatch(root, config, fetchImpl)).rejects.toThrow("Image coherence contract failed");
    expect(calls).toBe(0);
  });

  it("keeps successful image panels when one provider request fails", async () => {
    const root = await readyRoot();
    let count = 0;
    const fetchImpl: typeof fetch = async () => {
      count += 1;
      if (count === 2) return new Response(JSON.stringify({ error: { message: "temporary timeout" } }), { status: 503 });
      return new Response(JSON.stringify({ data: [{ b64_json: Buffer.from(`image-${count}`).toString("base64") }] }), { status: 200, headers: { "content-type": "application/json" } });
    };

    await expect(generateOpenAiImageBatch(root, config, fetchImpl)).resolves.toMatchObject({ status: "partial", failed: ["image-panel-2"] });
    const panels = readWorkshopState(root).imageBatch!.panels;
    expect(panels[1]).toMatchObject({ state: "failed", error: expect.stringContaining("503") });
    expect(panels.filter((panel) => panel.state === "generated")).toHaveLength(5);
    const preservedHashes = new Map(panels.filter((panel) => panel.state === "generated").map((panel) => [panel.id, panel.sha256]));
    expect(planOpenAiMediaRetry(readWorkshopState(root))).toEqual({ imagePanelIds: ["image-panel-2"], narrationPanelIds: expect.any(Array), plannedRequests: 6 });

    let retryCalls = 0;
    const retryFetch: typeof fetch = async () => {
      retryCalls += 1;
      return new Response(JSON.stringify({ data: [{ b64_json: Buffer.from("image-retry-2").toString("base64") }] }), { status: 200, headers: { "content-type": "application/json", "x-request-id": "image-retry-2" } });
    };
    await expect(generateOpenAiImageBatch(root, config, retryFetch, ["image-panel-2"])).resolves.toEqual({ status: "passed", completed: ["image-panel-2"], failed: [] });
    expect(retryCalls).toBe(1);
    const retried = readWorkshopState(root).imageBatch!.panels;
    expect(retried.every((panel) => panel.state === "generated")).toBe(true);
    for (const [panelId, hash] of preservedHashes) expect(retried.find((panel) => panel.id === panelId)?.sha256).toBe(hash);
  });

  it("plans an image-first retry before the current Storyboard is approved", async () => {
    const root = await readyRoot();
    generateStoryboard(root);

    expect(planOpenAiMediaRetry(readWorkshopState(root))).toEqual({
      imagePanelIds: expect.any(Array),
      narrationPanelIds: expect.any(Array),
      plannedRequests: 11,
    });
  });

  it("persists complete AI-generated WAV narration only for an approved current storyboard", async () => {
    const root = await readyRoot();
    const calls: Record<string, unknown>[] = [];
    const fetchImpl: typeof fetch = async (_input, init) => {
      calls.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
      return new Response(responseBody(testWav(1, calls.length)), { status: 200, headers: { "content-type": "audio/wav", "x-request-id": `speech-request-${calls.length}` } });
    };

    await expect(generateOpenAiNarration(root, config, fetchImpl)).resolves.toMatchObject({ status: "passed", failed: [] });
    expect(calls).toHaveLength(5);
    expect(calls.every((body) => body.model === "gpt-4o-mini-tts" && body.voice === "marin" && body.response_format === "wav")).toBe(true);
    const narration = readWorkshopState(root).narration;
    expect(narration).toMatchObject({ storyboardVersion: 2, disclosure: "AI-generated voice", stale: false });
    expect(narration?.panels).toHaveLength(5);
    const storedWav = await readFile(join(root, narration!.panels[0]!.relativePath));
    expect(storedWav.toString("ascii", 0, 4)).toBe("RIFF");
    expect(storedWav.toString("ascii", 8, 12)).toBe("WAVE");
  });

  it("rejects malformed speech bytes before they become approved narration", async () => {
    const root = await readyRoot(); const panel = readWorkshopState(root).storyboard.panels[0]!;
    const fetchImpl: typeof fetch = async () => new Response(Buffer.from("not-a-wave"), { status: 200, headers: { "content-type": "audio/wav" } });
    await expect(generateOpenAiNarration(root, config, fetchImpl, [panel.id])).resolves.toEqual({ status: "partial", completed: [], failed: [panel.id] });
    expect(readWorkshopState(root).narration).toMatchObject({ stale: true, panels: [], failures: [{ panelId: panel.id, error: "Speech API returned an invalid WAV file." }] });
  });

  it("rejects narration that would overrun its approved Storyboard panel", async () => {
    const root = await readyRoot(); const panel = readWorkshopState(root).storyboard.panels[0]!;
    const fetchImpl: typeof fetch = async () => new Response(responseBody(testWav(panel.durationSeconds + 1)), { status: 200, headers: { "content-type": "audio/wav" } });
    await expect(generateOpenAiNarration(root, config, fetchImpl, [panel.id])).resolves.toEqual({ status: "partial", completed: [], failed: [panel.id] });
    expect(readWorkshopState(root).narration?.failures?.[0]?.error).toContain(`longer than its approved ${panel.durationSeconds.toFixed(2)}-second Storyboard duration`);
  });

  it("rejects oversized narration before dispatching a speech request", async () => {
    const root = await readyRoot();
    const panel = readWorkshopState(root).storyboard.panels[0]!;
    updateStoryboardPanel(panel.id, { title: panel.title, narration: "x".repeat(maxTtsInputCharacters + 1), durationSeconds: panel.durationSeconds }, root);
    applyWorkshopAction("approveStoryboard", root);
    let calls = 0;
    const fetchImpl: typeof fetch = async () => {
      calls += 1;
      return new Response(Buffer.from("should-not-run"), { status: 200 });
    };

    await expect(generateOpenAiNarration(root, config, fetchImpl)).rejects.toThrow(`exceeds the ${maxTtsInputCharacters}-character Speech API input limit`);
    expect(calls).toBe(0);
  });

  it("preserves successful narration clips and retries only the failed panel", async () => {
    const root = await readyRoot();
    const failedPanelId = readWorkshopState(root).storyboard.panels[2]!.id;
    let initialCalls = 0;
    const partialFetch: typeof fetch = async () => {
      initialCalls += 1;
      if (initialCalls === 3) return new Response(JSON.stringify({ error: { message: "temporary speech failure" } }), { status: 503 });
      return new Response(responseBody(testWav(1, initialCalls)), { status: 200, headers: { "content-type": "audio/wav", "x-request-id": `speech-initial-${initialCalls}` } });
    };

    await expect(generateOpenAiNarration(root, config, partialFetch)).resolves.toMatchObject({ status: "partial", completed: expect.any(Array), failed: [failedPanelId] });
    const partialState = readWorkshopState(root);
    expect(partialState.narration).toMatchObject({ storyboardVersion: 2, stale: true, failures: [{ panelId: failedPanelId, error: expect.stringContaining("503") }] });
    expect(partialState.narration?.panels).toHaveLength(4);
    expect(planOpenAiMediaRetry(partialState)).toEqual({ imagePanelIds: expect.any(Array), narrationPanelIds: [failedPanelId], plannedRequests: 7 });
    const preservedHashes = new Map(partialState.narration!.panels.map((panel) => [panel.panelId, panel.sha256]));

    const retryCalls: Record<string, unknown>[] = [];
    const retryFetch: typeof fetch = async (_input, init) => {
      retryCalls.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
      return new Response(responseBody(testWav(1, 9)), { status: 200, headers: { "content-type": "audio/wav", "x-request-id": "speech-retry-1" } });
    };
    await expect(generateOpenAiNarration(root, config, retryFetch, [failedPanelId])).resolves.toEqual({ status: "passed", completed: [failedPanelId], failed: [] });

    expect(retryCalls).toHaveLength(1);
    const finalState = readWorkshopState(root);
    expect(finalState.narration).toMatchObject({ storyboardVersion: 2, stale: false, failures: [] });
    expect(finalState.narration?.panels).toHaveLength(5);
    for (const [panelId, hash] of preservedHashes) expect(finalState.narration?.panels.find((panel) => panel.panelId === panelId)?.sha256).toBe(hash);
    expect(planOpenAiMediaRetry(finalState)).toEqual({ imagePanelIds: expect.any(Array), narrationPanelIds: [], plannedRequests: 6 });
  });
});
