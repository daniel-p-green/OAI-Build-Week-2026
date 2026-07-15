import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  markImagePanelFailed,
  readWorkshopState,
  recordGeneratedImagePanel,
  recordNarration,
  type WorkshopNarrationPanel,
} from "./workshop-service.js";

export type OpenAiMediaConfig = {
  apiKey: string;
  imageModel: "gpt-image-2";
  imageQuality: "low" | "medium" | "high";
  imageSize: string;
  ttsModel: "gpt-4o-mini-tts";
  voice: "marin";
  voiceInstructions: string;
};

export const defaultOpenAiMediaConfig: Omit<OpenAiMediaConfig, "apiKey"> = {
  imageModel: "gpt-image-2",
  imageQuality: "medium",
  imageSize: "1024x1024",
  ttsModel: "gpt-4o-mini-tts",
  voice: "marin",
  voiceInstructions: "Speak with calm authority at a brisk presentation pace. Preserve source names and technical terms exactly.",
};

type Fetch = typeof fetch;
type MediaResult = { status: "passed" | "partial"; completed: string[]; failed: string[] };

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function safeError(error: unknown): string {
  return (error instanceof Error ? error.message : String(error))
    .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]")
    .replace(/Bearer\s+[^\s]+/gi, "Bearer [redacted]")
    .slice(0, 500);
}

function requireApiKey(config: OpenAiMediaConfig): void {
  if (!config.apiKey.trim()) throw new Error("A live OpenAI API key is required.");
}

async function responseError(label: string, response: Response): Promise<Error> {
  return new Error(`${label} returned HTTP ${response.status}: ${safeError(await response.text())}`);
}

export async function generateOpenAiImageBatch(
  root: string,
  config: OpenAiMediaConfig,
  fetchImpl: Fetch = fetch,
  panelIds?: readonly string[],
): Promise<MediaResult> {
  requireApiKey(config);
  const state = readWorkshopState(root);
  if (!state.imageBatch || state.imageBatch.stale) throw new Error("A current planned image batch is required.");
  if (!state.style || state.style.stale || !state.visualDna?.approved || state.visualDna.stale) throw new Error("Image generation requires approved current Visual DNA.");
  const requested = panelIds?.length ? new Set(panelIds) : undefined;
  const panels = state.imageBatch.panels.filter((panel) => !requested || requested.has(panel.id));
  if (!panels.length) throw new Error("No image panels were selected.");
  if (requested && panels.length !== requested.size) throw new Error("The image selection contains an unknown panel.");

  const outputDirectory = join(root, "generated", "images");
  await mkdir(outputDirectory, { recursive: true });
  const sharedDirection = [
    `Locked palette: ${state.visualDna.palette.accent}, ${state.visualDna.palette.ink}, ${state.visualDna.palette.paper}.`,
    `Composition: ${state.visualDna.compositionRules.join(" ")}`,
    `Image treatment: ${state.visualDna.imageRules.join(" ")}`,
    `Avoid: ${state.visualDna.negativeRules.join(" ") || "readable text, logos, watermarks, and stock-photo cliches"}.`,
    "Maintain one coherent editorial art direction across the complete six-image set.",
  ].join("\n");

  const settled = await Promise.allSettled(panels.map(async (panel) => {
    const response = await fetchImpl("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: config.imageModel,
        prompt: `${panel.prompt}\n${sharedDirection}`,
        n: 1,
        quality: config.imageQuality,
        size: config.imageSize,
        output_format: "png",
      }),
    });
    if (!response.ok) throw await responseError("Image API", response);
    const payload = await response.json() as { data?: Array<{ b64_json?: string }> };
    const encoded = payload.data?.[0]?.b64_json;
    if (!encoded) throw new Error("Image API response did not contain base64 image data.");
    const bytes = Buffer.from(encoded, "base64");
    const relativePath = join("generated", "images", `${panel.id}-v${panel.version}.png`);
    await writeFile(join(root, relativePath), bytes);
    recordGeneratedImagePanel(panel.id, {
      relativePath,
      sha256: sha256(bytes),
      provenance: {
        model: config.imageModel,
        quality: config.imageQuality,
        size: config.imageSize,
        requestId: response.headers.get("x-request-id") ?? undefined,
        generatedAt: new Date().toISOString(),
      },
    }, root);
    return panel.id;
  }));

  const completed: string[] = [];
  const failed: string[] = [];
  for (const [index, result] of settled.entries()) {
    const panel = panels[index]!;
    if (result.status === "fulfilled") completed.push(result.value);
    else {
      failed.push(panel.id);
      markImagePanelFailed(panel.id, safeError(result.reason), root);
    }
  }
  return { status: failed.length ? "partial" : "passed", completed, failed };
}

export async function generateOpenAiNarration(
  root: string,
  config: OpenAiMediaConfig,
  fetchImpl: Fetch = fetch,
): Promise<MediaResult> {
  requireApiKey(config);
  const state = readWorkshopState(root);
  if (!state.storyboardApproved || state.storyboard.stale || state.storyboard.panels.some((panel) => panel.stale || !panel.approved)) throw new Error("Narration requires an approved current storyboard.");
  const outputDirectory = join(root, "generated", "narration", `storyboard-v${state.storyboard.version}`);
  await mkdir(outputDirectory, { recursive: true });

  const settled = await Promise.allSettled(state.storyboard.panels.map(async (panel, index): Promise<WorkshopNarrationPanel> => {
    const response = await fetchImpl("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model: config.ttsModel, voice: config.voice, input: panel.narration, instructions: config.voiceInstructions, response_format: "wav" }),
    });
    if (!response.ok) throw await responseError("Speech API", response);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) throw new Error("Speech API returned an empty audio file.");
    const relativePath = join("generated", "narration", `storyboard-v${state.storyboard.version}`, `panel-${index + 1}.wav`);
    await writeFile(join(root, relativePath), bytes);
    return { panelId: panel.id, relativePath, sha256: sha256(bytes), model: config.ttsModel, voice: config.voice, instructions: config.voiceInstructions, requestId: response.headers.get("x-request-id") ?? undefined, generatedAt: new Date().toISOString() };
  }));

  const failed = settled.flatMap((result, index) => result.status === "rejected" ? [state.storyboard.panels[index]!.id] : []);
  if (failed.length) return { status: "partial", completed: settled.flatMap((result) => result.status === "fulfilled" ? [result.value.panelId] : []), failed };
  const panels = settled.map((result) => {
    if (result.status !== "fulfilled") throw new Error("Narration result was unexpectedly incomplete.");
    return result.value;
  });
  recordNarration({ storyboardVersion: state.storyboard.version, disclosure: "AI-generated voice", panels, stale: false, createdAt: new Date().toISOString() }, root);
  return { status: "passed", completed: panels.map((panel) => panel.panelId), failed: [] };
}
