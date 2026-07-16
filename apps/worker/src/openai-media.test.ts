import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { defaultOpenAiMediaConfig, generateOpenAiAudioOverview, generateOpenAiImageBatch, generateOpenAiNarration, maxTtsInputCharacters, planOpenAiMediaRetry, validateImageBatchCoherence, validateNarrationReadiness, type OpenAiMediaConfig } from "./openai-media.js";
import { applyWorkshopAction, approveVisualDna, createImageBatch, createVisualDna, generateAssetPlan, generateAudioOverview, generateStoryboard, ingestSource, lockManualStyle, readWorkshopState, resolveWorkshopArtifact, selectImagePanelForRegeneration, updateStoryboardPanel } from "./workshop-service.js";

const roots: string[] = [];
const config: OpenAiMediaConfig = { apiKey: "test-key", ...defaultOpenAiMediaConfig, imageSize: "512x512" };

function testWav(durationSeconds = 1, marker = 0): Buffer {
  const sampleRate = 8_000; const channels = 1; const bitsPerSample = 16; const byteRate = sampleRate * channels * bitsPerSample / 8; const dataSize = Math.round(durationSeconds * byteRate); const bytes = Buffer.alloc(44 + dataSize, marker);
  bytes.write("RIFF", 0); bytes.writeUInt32LE(36 + dataSize, 4); bytes.write("WAVE", 8); bytes.write("fmt ", 12); bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(channels, 22); bytes.writeUInt32LE(sampleRate, 24); bytes.writeUInt32LE(byteRate, 28); bytes.writeUInt16LE(channels * bitsPerSample / 8, 32); bytes.writeUInt16LE(bitsPerSample, 34); bytes.write("data", 36); bytes.writeUInt32LE(dataSize, 40);
  return bytes;
}

function streamingWav(durationSeconds = 1, marker = 0): Buffer {
  const bytes = testWav(durationSeconds, marker);
  bytes.writeUInt32LE(0xffffffff, 4);
  bytes.writeUInt32LE(0xffffffff, 40);
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
    const fixturePng = await readFile(join(root, readWorkshopState(root).imageBatch!.referencePath));
    const requests: Array<{ url: string; body: FormData }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const body = init?.body as FormData;
      requests.push({ url: String(input), body });
      return new Response(JSON.stringify({ data: [{ b64_json: fixturePng.toString("base64") }] }), { status: 200, headers: { "content-type": "application/json", "x-request-id": `image-request-${requests.length}` } });
    };

    await expect(generateOpenAiImageBatch(root, config, fetchImpl)).resolves.toMatchObject({ status: "passed", completed: expect.arrayContaining(["image-panel-1", "image-panel-6"]), failed: [] });
    expect(requests).toHaveLength(6);
    expect(requests.every(({ url, body }) => url.endsWith("/v1/images/edits") && body.get("model") === "gpt-image-2" && body.get("image") instanceof Blob)).toBe(true);
    expect(new Set(requests.map(({ body }) => (body.get("image") as Blob).size)).size).toBe(1);
    expect((requests[0]!.body.get("image") as Blob).size).toBeGreaterThan(1_000);
    expect(requests.every(({ body }) => String(body.get("prompt")).includes("Locked palette: #1155AA, #171816, #F4F2EC"))).toBe(true);
    expect(requests.every(({ body }) => String(body.get("prompt")).includes("direct placement in a client or leadership deck"))).toBe(true);
    expect(requests.every(({ body }) => String(body.get("prompt")).includes("Do not add readable text, letters, numbers, logos"))).toBe(true);
    const state = readWorkshopState(root);
    expect(state.imageBatch?.panels.every((panel) => panel.state === "generated" && panel.evidence.length > 0 && panel.provenance?.model === "gpt-image-2" && panel.provenance.referenceId === state.imageBatch?.referenceId && panel.sha256?.length === 64)).toBe(true);
    await expect(readFile(join(root, state.imageBatch!.panels[0]!.relativePath!))).resolves.toEqual(fixturePng);
    expect(resolveWorkshopArtifact("image-panel-1", root)).toMatchObject({ contentType: "image/png", path: expect.stringContaining("image-panel-1-v1.png") });
  });

  it("sends one professional revision request through the selected GPT Image 2 panel only", async () => {
    const root = await readyRoot();
    const panelId = readWorkshopState(root).imageBatch!.panels[0]!.id;
    selectImagePanelForRegeneration(panelId, root, "Use fewer objects and leave more headline space.");
    const fixturePng = await readFile(join(root, readWorkshopState(root).imageBatch!.referencePath));
    let requestPrompt = "";
    const fetchImpl: typeof fetch = async (_input, init) => {
      requestPrompt = String((init?.body as FormData).get("prompt"));
      return new Response(JSON.stringify({ data: [{ b64_json: fixturePng.toString("base64") }] }), { status: 200, headers: { "content-type": "application/json" } });
    };
    await expect(generateOpenAiImageBatch(root, config, fetchImpl, [panelId])).resolves.toEqual({ status: "passed", completed: [panelId], failed: [] });
    expect(requestPrompt).toContain("Professional revision request: Use fewer objects and leave more headline space.");
    expect(readWorkshopState(root).imageBatch!.panels[0]).toMatchObject({ state: "generated", version: 2, revisionRequest: "Use fewer objects and leave more headline space.", relativePath: expect.stringContaining("image-panel-1-v2.png") });
  });

  it("rejects malformed or wrong-sized image bytes before recording a generated panel", async () => {
    const malformedRoot = await readyRoot(); const malformedPanel = readWorkshopState(malformedRoot).imageBatch!.panels[0]!;
    const malformedFetch: typeof fetch = async () => new Response(JSON.stringify({ data: [{ b64_json: Buffer.from("not-a-png").toString("base64") }] }), { status: 200 });
    await expect(generateOpenAiImageBatch(malformedRoot, config, malformedFetch, [malformedPanel.id])).resolves.toEqual({ status: "partial", completed: [], failed: [malformedPanel.id] });
    expect(readWorkshopState(malformedRoot).imageBatch!.panels[0]).toMatchObject({ state: "failed", error: "Image API returned an invalid PNG file." });

    const wrongSizeRoot = await readyRoot(); const wrongSizeState = readWorkshopState(wrongSizeRoot); const wrongSizePanel = wrongSizeState.imageBatch!.panels[0]!; const fixturePng = await readFile(join(wrongSizeRoot, wrongSizeState.imageBatch!.referencePath));
    const wrongSizeFetch: typeof fetch = async () => new Response(JSON.stringify({ data: [{ b64_json: fixturePng.toString("base64") }] }), { status: 200 });
    await expect(generateOpenAiImageBatch(wrongSizeRoot, { ...config, imageSize: "1024x1024" }, wrongSizeFetch, [wrongSizePanel.id])).resolves.toEqual({ status: "partial", completed: [], failed: [wrongSizePanel.id] });
    expect(readWorkshopState(wrongSizeRoot).imageBatch!.panels[0]?.error).toBe("Image API returned 512x512; expected 1024x1024.");
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

  it("fails closed before spend when a planned image loses its source edge", async () => {
    const root = await readyRoot(); const state = readWorkshopState(root);
    state.imageBatch!.panels[0]!.evidence = [];
    const db = (await import("./db/client.js")).openLocalDatabase(join(root, "data", "workshoplm.sqlite"));
    db.prepare("UPDATE workshop_state SET state_json=? WHERE workshop_id=?").run(JSON.stringify(state), state.id);
    await expect(validateImageBatchCoherence(root)).resolves.toMatchObject({ valid: false, issues: expect.arrayContaining(["image-panel-1 has no source evidence."]) });
    let calls = 0;
    const fetchImpl: typeof fetch = async () => { calls += 1; return new Response("should not run", { status: 500 }); };
    await expect(generateOpenAiImageBatch(root, config, fetchImpl)).rejects.toThrow("Image coherence contract failed");
    expect(calls).toBe(0);
  });

  it("keeps successful image panels when one provider request fails", async () => {
    const root = await readyRoot();
    const fixturePng = await readFile(join(root, readWorkshopState(root).imageBatch!.referencePath));
    let count = 0;
    const fetchImpl: typeof fetch = async () => {
      count += 1;
      if (count === 2) return new Response(JSON.stringify({ error: { message: "temporary timeout" } }), { status: 503 });
      return new Response(JSON.stringify({ data: [{ b64_json: fixturePng.toString("base64") }] }), { status: 200, headers: { "content-type": "application/json" } });
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
      return new Response(JSON.stringify({ data: [{ b64_json: fixturePng.toString("base64") }] }), { status: 200, headers: { "content-type": "application/json", "x-request-id": "image-retry-2" } });
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
    expect(validateNarrationReadiness(readWorkshopState(root))).toMatchObject({ valid: true, panelCount: 5, totalCharacters: expect.any(Number), maxPanelCharacters: expect.any(Number), issues: [] });
    const calls: Record<string, unknown>[] = [];
    const fetchImpl: typeof fetch = async (_input, init) => {
      calls.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
      return new Response(responseBody(testWav(1, calls.length)), { status: 200, headers: { "content-type": "audio/wav", "x-request-id": `speech-request-${calls.length}` } });
    };

    await expect(generateOpenAiNarration(root, config, fetchImpl)).resolves.toMatchObject({ status: "passed", failed: [] });
    expect(calls).toHaveLength(5);
    expect(calls.every((body) => body.model === "gpt-4o-mini-tts" && body.voice === "cedar" && body.response_format === "wav")).toBe(true);
    const narration = readWorkshopState(root).narration;
    expect(narration).toMatchObject({ storyboardVersion: 2, disclosure: "AI-generated voice", stale: false });
    expect(narration?.panels).toHaveLength(5);
    const storedWav = await readFile(join(root, narration!.panels[0]!.relativePath));
    expect(storedWav.toString("ascii", 0, 4)).toBe("RIFF");
    expect(storedWav.toString("ascii", 8, 12)).toBe("WAVE");
  });

  it("accepts the Speech API streaming WAV sentinel and derives duration from received audio bytes", async () => {
    const root = await readyRoot();
    const panel = readWorkshopState(root).storyboard.panels[0]!;
    const fetchImpl: typeof fetch = async () => new Response(responseBody(streamingWav(1, 4)), { status: 200, headers: { "content-type": "audio/wav", "x-request-id": "speech-streaming-1" } });
    await expect(generateOpenAiNarration(root, config, fetchImpl, [panel.id])).resolves.toEqual({ status: "passed", completed: [panel.id], failed: [] });
    const stored = readWorkshopState(root).narration!.panels[0]!;
    expect(stored).toMatchObject({ panelId: panel.id, requestId: "speech-streaming-1", voice: "cedar" });
    expect((await readFile(join(root, stored.relativePath))).readUInt32LE(40)).toBe(0xffffffff);
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
    expect(validateNarrationReadiness(readWorkshopState(root))).toMatchObject({ valid: false, issues: [`${panel.id} exceeds the ${maxTtsInputCharacters}-character Speech API input limit.`] });
    let calls = 0;
    const fetchImpl: typeof fetch = async () => {
      calls += 1;
      return new Response(Buffer.from("should-not-run"), { status: 200 });
    };

    await expect(generateOpenAiNarration(root, config, fetchImpl)).rejects.toThrow(`exceeds the ${maxTtsInputCharacters}-character Speech API input limit`);
    expect(calls).toBe(0);
  });

  it("fails narration preflight when a Storyboard panel loses its exact source edge", async () => {
    const root = await readyRoot();
    const state = readWorkshopState(root);
    state.storyboard.panels[0]!.evidence[0]!.locator = "tampered locator";
    expect(validateNarrationReadiness(state)).toMatchObject({ valid: false, issues: [`${state.storyboard.panels[0]!.id} has an invalid source edge.`] });
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
  it("persists a grounded Audio Overview WAV with exact Speech API provenance", async () => {
    const root = await readyRoot();
    const scripted = generateAudioOverview(root).audioOverviews.at(-1)!;
    const requests: Array<{ url: string; body: Record<string, unknown> }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      requests.push({ url: String(input), body: JSON.parse(String(init?.body)) as Record<string, unknown> });
      return new Response(responseBody(testWav(2, 7)), { status: 200, headers: { "content-type": "audio/wav", "x-request-id": "speech-audio-overview-1" } });
    };
    const result = await generateOpenAiAudioOverview(root, config, fetchImpl);
    expect(result).toMatchObject({ id: scripted.id, durationSeconds: 2, sha256: expect.stringMatching(/^[a-f0-9]{64}$/) });
    expect(requests).toEqual([{ url: "https://api.openai.com/v1/audio/speech", body: { model: "gpt-4o-mini-tts", voice: "cedar", input: scripted.script, instructions: defaultOpenAiMediaConfig.voiceInstructions, response_format: "wav" } }]);
    const overview = readWorkshopState(root).audioOverviews.at(-1)!;
    expect(overview).toMatchObject({ status: "audio_ready", stale: false, disclosure: "AI-generated voice", audio: { durationSeconds: 2, byteCount: expect.any(Number), model: "gpt-4o-mini-tts", voice: "cedar", requestId: "speech-audio-overview-1", sha256: result.sha256 } });
    const artifact = resolveWorkshopArtifact(overview.id, root);
    expect(artifact).toMatchObject({ contentType: "audio/wav", fileName: `${overview.id}.wav` });
    expect((await readFile(artifact!.path)).length).toBe(overview.audio!.byteCount);
  });
  it("keeps a reviewed Audio Overview script recoverable after malformed provider audio", async () => {
    const root = await readyRoot(); generateAudioOverview(root);
    const fetchImpl: typeof fetch = async () => new Response(Buffer.from("not-wav"), { status: 200, headers: { "content-type": "audio/wav" } });
    await expect(generateOpenAiAudioOverview(root, config, fetchImpl)).rejects.toThrow(/invalid WAV/);
    const failed = readWorkshopState(root).audioOverviews.at(-1)!;
    expect(failed).toMatchObject({ status: "failed", stale: false, error: "Audio could not be created. Your reviewed script is safe." });
    expect(failed).not.toHaveProperty("audio");
  });
});
