import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  assertBatchManifest,
  replaceAsset,
  type ImageAsset,
  type ImageBatchManifest,
  type ReplacementAsset,
  type VisualDna,
} from "./batch-manifest.js";

const here = resolve(fileURLToPath(new URL("..", import.meta.url)));
const fixtureDirectory = resolve(here, "fixtures");
const artifactDirectory = resolve(process.cwd(), "artifacts/spikes/c-images");
type SpikeReport = {
  spike: "c-images";
  status: "passed" | "fallback_active" | "credential_blocked" | "failed";
  startedAt: string;
  finishedAt: string;
  checks: Record<string, "passed" | "skipped" | "failed">;
  measurements: Record<string, string | number | boolean>;
  fallback: string;
  sanitizedErrors: string[];
};
const prompts = [
  "A source document and hand-drawn map being shaped into a workshop brief.",
  "A facilitator's desk with traceable notes, evidence cards, and one clean visual hierarchy.",
  "A small team reviewing a semantic whiteboard in a warm daylight studio.",
  "A focused close-up of an editable storyboard panel with source cards nearby.",
  "A contact sheet of coherent workshop output images arranged on a paper workbench.",
  "A finished presentation and a narrated video storyboard prepared for delivery.",
] as const;

function redact(value: unknown): string {
  return String(value)
    .replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]")
    .replace(/Bearer\s+[^\s]+/gi, "Bearer [redacted]");
}

function promptFor(subject: string, visualDna: VisualDna): string {
  return [
    "Use case: productivity-visual",
    "Asset type: coherent WorkshopLM image batch",
    `Primary request: ${subject}`,
    `Shared visual DNA: palette ${visualDna.palette.join(", ")}; ${visualDna.composition} ${visualDna.lighting} ${visualDna.imageTreatment}`,
    "Constraints: preserve the shared visual DNA and reference treatment; no readable text.",
  ].join("\n");
}

function seedManifest(visualDna: VisualDna): ImageBatchManifest {
  return {
    id: "spike-c-image-batch",
    visualDna,
    assets: prompts.map((subject, index) => ({
      id: `panel-${index + 1}`,
      version: 1,
      prompt: promptFor(subject, visualDna),
      artifactSha256: "0".repeat(64),
      provenance: { model: "gpt-image-2", quality: "medium", size: "1024x1024", referenceId: visualDna.referenceId },
    })),
  };
}

async function generateAsset(asset: ImageAsset, reference: Uint8Array): Promise<{ replacement: ReplacementAsset; bytes: Uint8Array; latencyMs: number }> {
  const started = performance.now();
  const form = new FormData();
  form.append("model", "gpt-image-2");
  form.append("prompt", asset.prompt);
  form.append("size", asset.provenance.size);
  form.append("quality", asset.provenance.quality);
  form.append("image", new Blob([reference], { type: "image/png" }), "reference.png");
  const response = await fetch("https://api.openai.com/v1/images/edits", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY ?? ""}` },
    body: form,
  });
  if (!response.ok) throw new Error(`Image API returned HTTP ${response.status}: ${redact(await response.text())}`);
  const payload = (await response.json()) as { data?: Array<{ b64_json?: string }> };
  const encoded = payload.data?.[0]?.b64_json;
  if (!encoded) throw new Error("Image API response did not contain b64_json image data");
  const bytes = Buffer.from(encoded, "base64");
  const { id: _id, version: _version, ...replacement } = asset;
  return {
    replacement: { ...replacement, artifactSha256: createHash("sha256").update(bytes).digest("hex") },
    bytes,
    latencyMs: Math.round(performance.now() - started),
  };
}

async function main(): Promise<void> {
  const startedAt = new Date().toISOString();
  const checks: SpikeReport["checks"] = {};
  const errors: string[] = [];
  const visualDna = JSON.parse(await readFile(resolve(fixtureDirectory, "visual-dna.json"), "utf8")) as VisualDna;
  let manifest = seedManifest(visualDna);
  assertBatchManifest(manifest);
  checks["deterministic-manifest"] = "passed";

  if (process.env.WORKSHOPLM_LIVE_OPENAI !== "1") {
    checks["live-image-api"] = "skipped";
    await writeReport({ spike: "c-images", status: "fallback_active", startedAt, finishedAt: new Date().toISOString(), checks, measurements: { assetsPlanned: 6 }, fallback: "Deterministic manifest and test double remain available; no generated images were requested.", sanitizedErrors: errors });
    return;
  }
  if (!process.env.OPENAI_API_KEY) {
    checks["live-image-api"] = "failed";
    await writeReport({ spike: "c-images", status: "credential_blocked", startedAt, finishedAt: new Date().toISOString(), checks, measurements: {}, fallback: "Run in deterministic mode until a live credential is available.", sanitizedErrors: errors });
    process.exitCode = 1;
    return;
  }

  await mkdir(artifactDirectory, { recursive: true });
  const reference = await readFile(resolve(fixtureDirectory, "reference.png"));
  const latencies: number[] = [];
  try {
    for (const asset of manifest.assets) {
      const result = await generateAsset(asset, reference);
      const output = resolve(artifactDirectory, `${asset.id}-v${asset.version}.png`);
      await writeFile(output, result.bytes);
      manifest = replaceAsset(manifest, asset.id, result.replacement);
      latencies.push(result.latencyMs);
    }
    const panelFour = manifest.assets[3]!;
    const regenerated = await generateAsset(panelFour, reference);
    await writeFile(resolve(artifactDirectory, `${panelFour.id}-v${panelFour.version + 1}.png`), regenerated.bytes);
    manifest = replaceAsset(manifest, panelFour.id, regenerated.replacement);
    latencies.push(regenerated.latencyMs);
    assertBatchManifest(manifest);
    await writeFile(resolve(artifactDirectory, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
    checks["live-image-api"] = "passed";
    await writeReport({ spike: "c-images", status: "passed", startedAt, finishedAt: new Date().toISOString(), checks, measurements: { imagesGenerated: 7, perImageLatencyMs: JSON.stringify(latencies), averageLatencyMs: Math.round(latencies.reduce((sum, value) => sum + value, 0) / latencies.length), model: "gpt-image-2", quality: "medium", size: "1024x1024", lockedReference: basename(resolve(fixtureDirectory, "reference.png")) }, fallback: "None activated.", sanitizedErrors: errors });
  } catch (error) {
    errors.push(redact(error));
    checks["live-image-api"] = "failed";
    await writeReport({ spike: "c-images", status: "failed", startedAt, finishedAt: new Date().toISOString(), checks, measurements: { completedAssets: latencies.length }, fallback: "Deterministic manifest and selective-replacement tests remain available.", sanitizedErrors: errors });
    process.exitCode = 1;
  }
}

async function writeReport(report: SpikeReport): Promise<void> {
  await mkdir(artifactDirectory, { recursive: true });
  const timestamp = report.finishedAt.replace(/[:.]/g, "-");
  const path = resolve(artifactDirectory, `c-images-${timestamp}.json`);
  const sanitized = JSON.parse(redact(JSON.stringify(report))) as SpikeReport;
  await writeFile(path, `${JSON.stringify(sanitized, null, 2)}\n`);
  console.log(JSON.stringify({ report: sanitized, path }, null, 2));
}

void main();
