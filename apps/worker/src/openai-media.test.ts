import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { defaultOpenAiMediaConfig, generateOpenAiImageBatch, generateOpenAiNarration, type OpenAiMediaConfig } from "./openai-media.js";
import { applyWorkshopAction, approveVisualDna, createImageBatch, createVisualDna, generateAssetPlan, generateStoryboard, ingestSource, lockManualStyle, readWorkshopState, resolveWorkshopArtifact } from "./workshop-service.js";

const roots: string[] = [];
const config: OpenAiMediaConfig = { apiKey: "test-key", ...defaultOpenAiMediaConfig };

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
    const requests: Array<{ url: string; body: Record<string, unknown> }> = [];
    const fetchImpl: typeof fetch = async (input, init) => {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      requests.push({ url: String(input), body });
      return new Response(JSON.stringify({ data: [{ b64_json: Buffer.from(`image-${requests.length}`).toString("base64") }] }), { status: 200, headers: { "content-type": "application/json", "x-request-id": `image-request-${requests.length}` } });
    };

    await expect(generateOpenAiImageBatch(root, config, fetchImpl)).resolves.toMatchObject({ status: "passed", completed: expect.arrayContaining(["image-panel-1", "image-panel-6"]), failed: [] });
    expect(requests).toHaveLength(6);
    expect(requests.every(({ url, body }) => url.endsWith("/v1/images/generations") && body.model === "gpt-image-2" && body.n === 1)).toBe(true);
    const state = readWorkshopState(root);
    expect(state.imageBatch?.panels.every((panel) => panel.state === "generated" && panel.provenance?.model === "gpt-image-2" && panel.sha256?.length === 64)).toBe(true);
    await expect(readFile(join(root, state.imageBatch!.panels[0]!.relativePath!), "utf8")).resolves.toBe("image-1");
    expect(resolveWorkshopArtifact("image-panel-1", root)).toMatchObject({ contentType: "image/png", path: expect.stringContaining("image-panel-1-v1.png") });
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
  });

  it("persists complete AI-generated WAV narration only for an approved current storyboard", async () => {
    const root = await readyRoot();
    const calls: Record<string, unknown>[] = [];
    const fetchImpl: typeof fetch = async (_input, init) => {
      calls.push(JSON.parse(String(init?.body)) as Record<string, unknown>);
      return new Response(Buffer.from(`RIFF-test-${calls.length}`), { status: 200, headers: { "content-type": "audio/wav", "x-request-id": `speech-request-${calls.length}` } });
    };

    await expect(generateOpenAiNarration(root, config, fetchImpl)).resolves.toMatchObject({ status: "passed", failed: [] });
    expect(calls).toHaveLength(5);
    expect(calls.every((body) => body.model === "gpt-4o-mini-tts" && body.voice === "marin" && body.response_format === "wav")).toBe(true);
    const narration = readWorkshopState(root).narration;
    expect(narration).toMatchObject({ storyboardVersion: 2, disclosure: "AI-generated voice", stale: false });
    expect(narration?.panels).toHaveLength(5);
    await expect(readFile(join(root, narration!.panels[0]!.relativePath), "utf8")).resolves.toContain("RIFF-test");
  });
});
