import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  markImagePanelFailed,
  readWorkshopState,
  recordGeneratedImagePanel,
  recordNarration,
  recordNarrationProgress,
  workshopGeneratedPath,
  type WorkshopState,
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

export const maxTtsInputCharacters = 4096;

type Fetch = typeof fetch;
type MediaResult = { status: "passed" | "partial"; completed: string[]; failed: string[] };

export type OpenAiMediaRetryPlan = {
  imagePanelIds: string[];
  narrationPanelIds: string[];
  plannedRequests: number;
};

export type ImageCoherenceReport = { valid: boolean; referenceId?: string; referenceSha256?: string; panelCount: number; issues: string[] };

export async function validateImageBatchCoherence(root: string, state: WorkshopState = readWorkshopState(root)): Promise<ImageCoherenceReport> {
  const batch = state.imageBatch; const issues: string[] = [];
  if (!batch || batch.stale) return { valid: false, panelCount: batch?.panels.length ?? 0, issues: ["A current image batch is required."] };
  if (batch.panels.length !== 6) issues.push(`Expected six panels; found ${batch.panels.length}.`);
  if (new Set(batch.panels.map((panel) => panel.id)).size !== batch.panels.length) issues.push("Panel IDs are not unique.");
  if (batch.panels.some((panel) => panel.referenceId !== batch.referenceId)) issues.push("One or more panels do not use the batch reference.");
  if (batch.coherence.siblingPanelIds.join("|") !== batch.panels.map((panel) => panel.id).join("|")) issues.push("The sibling continuity list does not match the batch panels.");
  if (batch.coherence.visualDnaVersion !== state.visualDna?.version) issues.push("The batch Visual DNA version does not match the current preview.");
  if (state.visualDna?.stale || !state.visualDna?.approved) issues.push("The current Visual DNA is not approved.");
  try {
    const reference = await readFile(join(root, batch.referencePath));
    if (sha256(reference) !== batch.referenceSha256) issues.push("The shared reference image hash does not match its manifest.");
  } catch {
    issues.push("The shared reference image is missing.");
  }
  return { valid: issues.length === 0, referenceId: batch.referenceId, referenceSha256: batch.referenceSha256, panelCount: batch.panels.length, issues };
}

export function planOpenAiMediaRetry(state: WorkshopState): OpenAiMediaRetryPlan {
  if (!state.imageBatch || state.imageBatch.stale) throw new Error("A current image batch is required for selective retry.");
  if (state.storyboard.stale || state.storyboard.panels.some((panel) => panel.stale || !panel.approved)) {
    throw new Error("A current Storyboard is required for selective retry.");
  }
  const imagePanelIds = state.imageBatch.panels.filter((panel) => panel.state !== "generated").map((panel) => panel.id);
  const existingNarrationIds = state.narration?.storyboardVersion === state.storyboard.version
    ? new Set(state.narration.panels.map((panel) => panel.panelId))
    : new Set<string>();
  const narrationPanelIds = state.storyboard.panels.filter((panel) => !existingNarrationIds.has(panel.id)).map((panel) => panel.id);
  return { imagePanelIds, narrationPanelIds, plannedRequests: imagePanelIds.length + narrationPanelIds.length };
}

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function wavDurationSeconds(bytes: Buffer): number {
  if (bytes.length < 12 || bytes.toString("ascii", 0, 4) !== "RIFF" || bytes.toString("ascii", 8, 12) !== "WAVE") throw new Error("Speech API returned an invalid WAV file.");
  let byteRate: number | undefined;
  let dataBytes: number | undefined;
  for (let offset = 12; offset + 8 <= bytes.length;) {
    const id = bytes.toString("ascii", offset, offset + 4);
    const size = bytes.readUInt32LE(offset + 4);
    const start = offset + 8;
    if (start + size > bytes.length) throw new Error("Speech API returned a truncated WAV file.");
    if (id === "fmt " && size >= 16) byteRate = bytes.readUInt32LE(start + 8);
    if (id === "data") dataBytes = size;
    offset = start + size + (size % 2);
  }
  const duration = byteRate && dataBytes !== undefined ? dataBytes / byteRate : 0;
  if (!Number.isFinite(duration) || duration <= 0) throw new Error("Speech API returned a WAV file without playable audio.");
  return duration;
}

function validatePng(bytes: Buffer, expectedSize: string): void {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(signature)) throw new Error("Image API returned an invalid PNG file.");
  let offset = 8; let width: number | undefined; let height: number | undefined; let foundEnd = false;
  while (offset + 12 <= bytes.length) {
    const size = bytes.readUInt32BE(offset); const type = bytes.toString("ascii", offset + 4, offset + 8); const end = offset + 12 + size;
    if (end > bytes.length) throw new Error("Image API returned a truncated PNG file.");
    if (offset === 8 && (type !== "IHDR" || size !== 13)) throw new Error("Image API returned a PNG without a valid IHDR chunk.");
    if (type === "IHDR") { width = bytes.readUInt32BE(offset + 8); height = bytes.readUInt32BE(offset + 12); }
    if (type === "IEND") { foundEnd = true; if (end !== bytes.length) throw new Error("Image API returned a PNG with trailing bytes."); }
    offset = end;
  }
  if (!foundEnd || !width || !height) throw new Error("Image API returned an incomplete PNG file.");
  const expected = expectedSize.match(/^(\d+)x(\d+)$/);
  if (expected && (width !== Number(expected[1]) || height !== Number(expected[2]))) throw new Error(`Image API returned ${width}x${height}; expected ${expectedSize}.`);
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
  const coherenceReport = await validateImageBatchCoherence(root, state);
  if (!coherenceReport.valid) throw new Error(`Image coherence contract failed: ${coherenceReport.issues.join(" ")}`);
  const requested = panelIds?.length ? new Set(panelIds) : undefined;
  const panels = state.imageBatch.panels.filter((panel) => !requested || requested.has(panel.id));
  if (!panels.length) throw new Error("No image panels were selected.");
  if (requested && panels.length !== requested.size) throw new Error("The image selection contains an unknown panel.");

  const outputDirectory = join(root, workshopGeneratedPath(state.id, "images"));
  await mkdir(outputDirectory, { recursive: true });
  const referenceBytes = await readFile(join(root, state.imageBatch.referencePath));
  const sharedDirection = [
    `Locked palette: ${state.imageBatch.coherence.palette.accent}, ${state.imageBatch.coherence.palette.ink}, ${state.imageBatch.coherence.palette.paper}.`,
    `Composition: ${state.imageBatch.coherence.compositionRules.join(" ")}`,
    `Texture: ${state.imageBatch.coherence.textureRules.join(" ")}`,
    `Image treatment: ${state.imageBatch.coherence.imageRules.join(" ")}`,
    `Avoid: ${state.imageBatch.coherence.negativeRules.join(" ") || "readable text, logos, watermarks, and stock-photo cliches"}.`,
    "Maintain one coherent editorial art direction across the complete six-image set.",
  ].join("\n");

  const settled = await Promise.allSettled(panels.map(async (panel) => {
    const body = new FormData();
    body.append("model", config.imageModel);
    body.append("prompt", `${panel.prompt}\n${sharedDirection}`);
    body.append("image", new Blob([referenceBytes], { type: "image/png" }), `${state.imageBatch!.referenceId}.png`);
    body.append("quality", config.imageQuality);
    body.append("size", config.imageSize);
    body.append("output_format", "png");
    const response = await fetchImpl("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}` },
      body,
    });
    if (!response.ok) throw await responseError("Image API", response);
    const payload = await response.json() as { data?: Array<{ b64_json?: string }> };
    const encoded = payload.data?.[0]?.b64_json;
    if (!encoded) throw new Error("Image API response did not contain base64 image data.");
    const bytes = Buffer.from(encoded, "base64");
    validatePng(bytes, config.imageSize);
    const relativePath = workshopGeneratedPath(state.id, "images", `${panel.id}-v${panel.version}.png`);
    await writeFile(join(root, relativePath), bytes);
    recordGeneratedImagePanel(panel.id, {
      relativePath,
      sha256: sha256(bytes),
      provenance: {
        model: config.imageModel,
        quality: config.imageQuality,
        size: config.imageSize,
        referenceId: state.imageBatch!.referenceId,
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
  panelIds?: readonly string[],
): Promise<MediaResult> {
  requireApiKey(config);
  const state = readWorkshopState(root);
  if (!state.storyboardApproved || state.storyboard.stale || state.storyboard.panels.some((panel) => panel.stale || !panel.approved)) throw new Error("Narration requires an approved current storyboard.");
  const requested = panelIds?.length ? new Set(panelIds) : undefined;
  const panelsToGenerate = state.storyboard.panels.filter((panel) => !requested || requested.has(panel.id));
  if (!panelsToGenerate.length) throw new Error("No narration panels were selected.");
  if (requested && panelsToGenerate.length !== requested.size) throw new Error("The narration selection contains an unknown panel.");
  const oversizedPanel = panelsToGenerate.find((panel) => panel.narration.length > maxTtsInputCharacters);
  if (oversizedPanel) throw new Error(`Storyboard panel ${oversizedPanel.id} exceeds the ${maxTtsInputCharacters}-character Speech API input limit.`);
  const outputDirectory = join(root, workshopGeneratedPath(state.id, "narration", `storyboard-v${state.storyboard.version}`));
  await mkdir(outputDirectory, { recursive: true });

  const settled = await Promise.allSettled(panelsToGenerate.map(async (panel): Promise<WorkshopNarrationPanel> => {
    const response = await fetchImpl("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: { Authorization: `Bearer ${config.apiKey}`, "content-type": "application/json" },
      body: JSON.stringify({ model: config.ttsModel, voice: config.voice, input: panel.narration, instructions: config.voiceInstructions, response_format: "wav" }),
    });
    if (!response.ok) throw await responseError("Speech API", response);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) throw new Error("Speech API returned an empty audio file.");
    const durationSeconds = wavDurationSeconds(bytes);
    if (durationSeconds > panel.durationSeconds + 0.25) throw new Error(`Narration for panel ${panel.id} is ${durationSeconds.toFixed(2)} seconds, longer than its approved ${panel.durationSeconds.toFixed(2)}-second Storyboard duration.`);
    const panelIndex = state.storyboard.panels.findIndex((item) => item.id === panel.id);
    const relativePath = workshopGeneratedPath(state.id, "narration", `storyboard-v${state.storyboard.version}`, `panel-${panelIndex + 1}.wav`);
    await writeFile(join(root, relativePath), bytes);
    return { panelId: panel.id, relativePath, sha256: sha256(bytes), model: config.ttsModel, voice: config.voice, instructions: config.voiceInstructions, requestId: response.headers.get("x-request-id") ?? undefined, generatedAt: new Date().toISOString() };
  }));

  const completed = settled.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
  const failures = settled.flatMap((result, index) => result.status === "rejected" ? [{ panelId: panelsToGenerate[index]!.id, error: safeError(result.reason), failedAt: new Date().toISOString() }] : []);
  const existing = state.narration?.storyboardVersion === state.storyboard.version ? state.narration.panels : [];
  const combinedById = new Map([...existing, ...completed].map((panel) => [panel.panelId, panel]));
  const combined = state.storyboard.panels.flatMap((panel) => {
    const narration = combinedById.get(panel.id);
    return narration ? [narration] : [];
  });
  const narration = { storyboardVersion: state.storyboard.version, disclosure: "AI-generated voice" as const, panels: combined, failures, stale: combined.length !== state.storyboard.panels.length, createdAt: new Date().toISOString() };
  if (narration.stale) recordNarrationProgress(narration, root);
  else recordNarration(narration, root);
  return { status: failures.length ? "partial" : "passed", completed: completed.map((panel) => panel.panelId), failed: failures.map((failure) => failure.panelId) };
}
