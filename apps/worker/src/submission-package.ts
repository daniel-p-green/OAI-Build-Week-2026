import { createHash } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { SubmissionOutputSet, type SubmissionAsset, type SubmissionInputSnapshot, type SubmissionOutputSet as SubmissionOutputSetType } from "@workshoplm/domain";
import { readWorkshopState, type WorkshopState } from "./workshop-service.js";

const execFile = promisify(execFileCallback);
const sha256 = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");
const unique = (values: string[]) => [...new Set(values)].sort();

function inside(base: string, candidate: string): boolean {
  const root = resolve(base);
  const target = resolve(candidate);
  return target === root || target.startsWith(`${root}${sep}`);
}

function fingerprintMaterial(state: WorkshopState) {
  return {
    sources: state.sourceItems.filter((source) => state.activeSourceIds.includes(source.id)).map(({ id, title, origin, excerpt, locator, permission }) => ({ id, title, origin, excerpt, locator, permission })),
    sourceChunks: state.sourceChunks.filter((chunk) => state.activeSourceIds.includes(chunk.sourceId)),
    claims: state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId)),
    transcriptSegments: state.transcriptSegments,
    graphState: state.graphState ?? null,
    mapNodes: state.mapNodes,
    mapEdges: state.mapEdges,
    briefApproved: state.briefApproved,
    frame: state.frame ?? null,
    style: state.style ?? null,
    designArtifact: state.designArtifact ?? null,
    visualDna: state.visualDna ?? null,
    assetPlan: state.assetPlan ?? null,
    storyboard: state.storyboard,
    storyboardApproved: state.storyboardApproved,
    imageBatch: state.imageBatch ?? null,
    narration: state.narration ?? null,
    aiRuns: state.aiRuns,
    outputs: state.outputs,
    videoState: state.videoState,
  };
}

export function submissionInputFingerprint(state: WorkshopState): string {
  return sha256(JSON.stringify(fingerprintMaterial(state)));
}

function graphRevision(state: WorkshopState): number {
  if (!state.graphState) return 0;
  try { return Number((JSON.parse(state.graphState) as { graph?: { revision?: unknown } }).graph?.revision ?? 0); }
  catch { return 0; }
}

function assertBuildable(state: WorkshopState, root: string): SubmissionInputSnapshot {
  if (!state.briefApproved || !state.frame || state.frame.stale) throw new Error("Submission packaging requires an approved current brief.");
  if (!state.style || state.style.stale) throw new Error("Submission packaging requires a current Style.");
  if (!state.assetPlan || state.assetPlan.stale) throw new Error("Submission packaging requires a current output plan.");
  if (!state.storyboardApproved || state.storyboard.stale || state.storyboard.panels.some((panel) => panel.stale || !panel.approved)) throw new Error("Submission packaging requires an approved current Storyboard.");
  if (!state.imageBatch || state.imageBatch.stale) throw new Error("Submission packaging requires a current image set.");
  if (state.videoState !== "rendered") throw new Error("Submission packaging requires a rendered Video.");
  if (!state.outputs.some((output) => output.type === "deck" && !output.stale) || !state.outputs.some((output) => output.type === "infographic" && !output.stale)) throw new Error("Submission packaging requires current presentation and infographic Outputs.");
  const video = join(root, "generated", "workshoplm-demo.mp4");
  if (!inside(root, video)) throw new Error("Video path escaped the Workshop data root.");
  return {
    graphRevision: graphRevision(state),
    briefVersion: state.frame.version,
    styleVersion: state.style.version,
    assetPlanVersion: state.assetPlan.version,
    storyboardVersion: state.storyboard.version,
    imageBatchId: state.imageBatch.id,
    narrationStoryboardVersion: state.narration && !state.narration.stale ? state.narration.storyboardVersion : undefined,
    activeSourceIds: [...state.activeSourceIds].sort(),
    claimIds: unique(state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId)).map((claim) => claim.id)),
    outputIds: unique(state.outputs.filter((output) => !output.stale).map((output) => output.id)),
    videoState: "rendered",
  };
}

export function submissionLimitations(state: WorkshopState): string[] {
  const limitations: string[] = [];
  const providerVoice = state.transcriptSegments.some((segment) => segment.transport === "webrtc" && segment.provider?.model === "gpt-realtime-2.1" && segment.provider.transcriptionModel === "gpt-realtime-whisper" && segment.provider.itemIds.length > 0 && segment.provider.eventIds.length > 0);
  if (!providerVoice) limitations.push("No provider-verified WebRTC voice transcript is present; fixture or imported transcript text is not treated as live voice evidence.");
  if (!state.aiRuns.length) limitations.push("The recorded fixture uses the deterministic grounded Map path; no live GPT-5.6 reasoning run is present.");
  const generatedImages = state.imageBatch?.panels.filter((panel) => panel.state === "generated" && panel.provenance?.model === "gpt-image-2").length ?? 0;
  const imageCount = state.imageBatch?.panels.length ?? 0;
  if (!imageCount || generatedImages !== imageCount) limitations.push(`The image set contains ${generatedImages} of ${imageCount} provider-generated GPT Image 2 panels.`);
  const providerNarration = Boolean(state.narration && !state.narration.stale && state.narration.storyboardVersion === state.storyboard.version && state.narration.panels.length === state.storyboard.panels.length);
  if (!providerNarration) limitations.push("The video uses deterministic placeholder tones; provider-generated narration is not present.");
  return limitations;
}

type ThumbnailRenderer = (videoPath: string, outputPath: string, second: number) => Promise<void>;
const renderThumbnail: ThumbnailRenderer = async (videoPath, outputPath, second) => {
  await execFile("ffmpeg", ["-y", "-ss", second.toFixed(2), "-i", videoPath, "-frames:v", "1", "-vf", "scale=1280:-2", outputPath], { maxBuffer: 5_000_000 });
};

export type BuildSubmissionOptions = { outputDirectory?: string; renderThumbnail?: ThumbnailRenderer };

function devpostCopy(state: WorkshopState, limitations: string[], elapsed: string): string {
  const liveMap = state.aiRuns.length ? `GPT-5.6 runs recorded: ${state.aiRuns.length}.` : "No live GPT-5.6 run is claimed by this package.";
  return `# WorkshopLM\n\n**Turn raw thinking into finished work.**\n\nWorkshopLM is a professional thought-to-delivery workspace built for OpenAI Build Week's Work & Productivity track. A team starts with conversation and selected sources, shapes them into an editable grounded Map, approves that Map as a Brief, applies a locked Style, and creates source-traceable work: a presentation, infographic, coherent image set, editable Storyboard, and narrated local Video.\n\n## What makes it different\n\n- Every factual claim retains a path to an exact source locator.\n- The Map stays editable before production begins.\n- Brief and Storyboard approval are the only blocking gates.\n- Style rules and evidence survive across every Output.\n- Dependency changes mark downstream work as Needs update.\n- The product packages its own hackathon submission with hashes and an input fingerprint.\n\n## Built with OpenAI and Codex\n\nWorkshopLM is implemented as a local pnpm/Turborepo product with a unified plugin doorway and an in-app browser workspace. ${liveMap} GPT Image 2 and OpenAI narration are recorded only when their provider provenance exists. The local video renderer refuses to run before Storyboard approval.\n\n## Demonstrated result\n\nThis Output set was produced from one approved Workshop state in ${elapsed}. Its manifest links ${state.claims.length} grounded claims across ${state.activeSourceIds.length} active sources to the included submission assets.\n\n## Current package limitations\n\n${limitations.length ? limitations.map((item) => `- ${item}`).join("\n") : "- None. This package contains inspected provider-backed media."}\n`;
}

function readmeNarrative(state: WorkshopState, limitations: string[]): string {
  return `# WorkshopLM submission narrative\n\nWorkshopLM turns a raw professional brainstorm into finished, source-traceable work through one Capture → Shape → Deliver path. The judge-facing product runs locally in the ChatGPT/Codex in-app browser; ChatGPT owns conversation while the visual Workshop owns Sources, Map, Brief, Style, Outputs, Storyboard, and source trace.\n\n## The meta-demo\n\nThis submission package was built from the same approved Workshop state as the demo. The included manifest records the source scope, claim IDs, input versions, file hashes, and dependency fingerprint for the Devpost copy, repository narrative, presentation, infographic, image manifest, thumbnails, Storyboard, narration, evidence report, and Video.\n\n## Evidence boundary\n\nThe package status is **${limitations.length ? "partial" : "ready"}**. It does not turn configured providers, deterministic fixtures, or planned media into live-use claims. See \`EVIDENCE.md\` and \`manifest.json\` for the exact boundary.\n\n## Workshop state\n\n- Active sources: ${state.activeSourceIds.length}\n- Grounded claims: ${state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId)).length}\n- Brief version: ${state.frame?.version}\n- Style version: ${state.style?.version}\n- Storyboard version: ${state.storyboard.version}\n- Current Outputs: ${state.outputs.filter((output) => !output.stale).length}\n`;
}

function storyboardMarkdown(state: WorkshopState): string {
  const rows = state.storyboard.panels.map((panel, index) => `| ${index + 1} | ${panel.title.replaceAll("|", "\\|")} | ${panel.durationSeconds}s | ${panel.narration.replaceAll("|", "\\|")} | ${panel.evidence.map((reference) => reference.locator).join("; ").replaceAll("|", "\\|")} |`).join("\n");
  return `# Storyboard\n\nApproved Storyboard version ${state.storyboard.version}.\n\n| Frame | Purpose | Duration | Narration | Sources |\n| ---: | --- | ---: | --- | --- |\n${rows}\n`;
}

function narrationMarkdown(state: WorkshopState): string {
  const provider = state.narration && !state.narration.stale && state.narration.storyboardVersion === state.storyboard.version;
  return `# Narration\n\n${provider ? `${state.narration!.disclosure}. Model provenance and hashes are recorded for every copied audio panel.` : "This package contains the approved narration script. The recorded fixture video uses deterministic placeholder tones; it does not claim provider-generated voice."}\n\n${state.storyboard.panels.map((panel, index) => `## ${index + 1}. ${panel.title}\n\n${panel.narration}`).join("\n\n")}\n`;
}

function imageManifestMarkdown(state: WorkshopState): string {
  return `# Image set\n\nImage batch ${state.imageBatch!.id}, locked to Style version ${state.imageBatch!.styleVersion}.\n\n${state.imageBatch!.panels.map((panel, index) => `- **${index + 1}. ${panel.prompt}** — ${panel.state}${panel.provenance ? `; ${panel.provenance.model}; ${panel.provenance.size}; ${panel.provenance.quality}` : ""}${panel.error ? `; ${panel.error}` : ""}`).join("\n")}\n`;
}

function evidenceMarkdown(state: WorkshopState, limitations: string[], fingerprint: string): string {
  const claims = state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId));
  return `# Submission evidence\n\nInput fingerprint: \`${fingerprint}\`\n\n## Active sources\n\n${state.sourceItems.filter((source) => state.activeSourceIds.includes(source.id)).map((source) => `- **${source.title}** — ${source.origin}; ${source.locator}; ${source.permission}`).join("\n")}\n\n## Grounded claims\n\n${claims.length ? claims.map((claim) => `- \`${claim.id}\` — ${claim.text} (${claim.locator})`).join("\n") : "- The current fixture has no normalized claim records; output locators come from the grounded Map."}\n\n## Provider evidence\n\n- GPT-5.6 grounded Map runs: ${state.aiRuns.length}\n- GPT Image 2 panels: ${state.imageBatch!.panels.filter((panel) => panel.provenance?.model === "gpt-image-2").length}/${state.imageBatch!.panels.length}\n- OpenAI narration panels: ${state.narration && !state.narration.stale ? state.narration.panels.length : 0}/${state.storyboard.panels.length}\n- Local video state: ${state.videoState}\n\n## Limitations\n\n${limitations.length ? limitations.map((item) => `- ${item}`).join("\n") : "- None."}\n`;
}

async function writeText(path: string, content: string) {
  await mkdir(resolve(path, ".."), { recursive: true });
  await writeFile(path, content, "utf8");
}

async function assetFor(packageRoot: string, type: SubmissionAsset["type"], relativePath: string, mimeType: string, claimIds: string[], sourceLocators: string[], provenance: SubmissionAsset["provenance"]): Promise<SubmissionAsset> {
  const path = resolve(packageRoot, relativePath);
  if (!inside(packageRoot, path)) throw new Error(`Submission asset escaped the package: ${relativePath}`);
  const bytes = await readFile(path);
  return { type, relativePath: relativePath.split(sep).join("/"), mimeType, sha256: sha256(bytes), byteCount: bytes.byteLength, claimIds, sourceLocators, provenance };
}

export async function buildSubmissionOutputSet(root: string, options: BuildSubmissionOptions = {}): Promise<{ manifestPath: string; outputSet: SubmissionOutputSetType }> {
  const dataRoot = resolve(root);
  const state = readWorkshopState(dataRoot);
  const inputs = assertBuildable(state, dataRoot);
  const imageBatch = state.imageBatch!;
  const videoPath = join(dataRoot, "generated", "workshoplm-demo.mp4");
  const videoProvenancePath = join(dataRoot, "generated", "workshoplm-demo.provenance.json");
  await stat(videoPath);
  await stat(videoProvenancePath);
  const packageRoot = resolve(options.outputDirectory ?? join(dataRoot, "generated", "submission-output-set-v1"));
  if (!inside(dataRoot, packageRoot)) throw new Error("Submission package must stay inside the Workshop data root.");
  await rm(packageRoot, { recursive: true, force: true });
  await mkdir(packageRoot, { recursive: true });

  const fingerprint = submissionInputFingerprint(state);
  const limitations = submissionLimitations(state);
  const claimIds = inputs.claimIds.length ? inputs.claimIds : unique(state.outputs.flatMap((output) => output.claimIds));
  const sourceLocators = unique(state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId)).map((claim) => claim.locator).concat(state.sourceItems.filter((source) => state.activeSourceIds.includes(source.id)).map((source) => source.locator)));
  const elapsed = state.firstTranscriptAt && state.firstRenderedOutputAt ? `${Math.max(0, Math.round((Date.parse(state.firstRenderedOutputAt) - Date.parse(state.firstTranscriptAt)) / 1000))} seconds` : "a deterministic recorded run";

  await writeText(join(packageRoot, "DEVPOST.md"), devpostCopy(state, limitations, elapsed));
  await writeText(join(packageRoot, "README-NARRATIVE.md"), readmeNarrative(state, limitations));
  await writeText(join(packageRoot, "STORYBOARD.md"), storyboardMarkdown(state));
  await writeText(join(packageRoot, "NARRATION.md"), narrationMarkdown(state));
  await writeText(join(packageRoot, "IMAGE-SET.md"), imageManifestMarkdown(state));
  await writeText(join(packageRoot, "EVIDENCE.md"), evidenceMarkdown(state, limitations, fingerprint));

  const currentOutputs = state.outputs.filter((output) => !output.stale);
  const deck = [...currentOutputs].reverse().find((output) => output.type === "deck")!;
  const infographic = [...currentOutputs].reverse().find((output) => output.type === "infographic")!;
  const deckName = `presentation${extname(deck.relativePath) || ".html"}`;
  const infographicName = `infographic${extname(infographic.relativePath) || ".html"}`;
  for (const [output, name] of [[deck, deckName], [infographic, infographicName]] as const) {
    const source = resolve(dataRoot, output.relativePath);
    if (!inside(dataRoot, source)) throw new Error(`Output path escaped the Workshop data root: ${output.id}`);
    await copyFile(source, join(packageRoot, name));
  }
  await copyFile(videoPath, join(packageRoot, "workshoplm-demo.mp4"));
  await copyFile(videoProvenancePath, join(packageRoot, "VIDEO-PROVENANCE.json"));

  const thumbnail = options.renderThumbnail ?? renderThumbnail;
  const duration = state.storyboard.panels.reduce((total, panel) => total + panel.durationSeconds, 0);
  const thumbnailSpecs = [["thumbnail-opening.png", Math.min(0.2, duration / 10)], ["thumbnail-process.png", duration * 0.45], ["thumbnail-result.png", Math.max(0, duration * 0.82)]] as const;
  for (const [name, second] of thumbnailSpecs) await thumbnail(videoPath, join(packageRoot, name), second);

  if (state.narration && !state.narration.stale && state.narration.storyboardVersion === state.storyboard.version) {
    await mkdir(join(packageRoot, "narration"), { recursive: true });
    for (const [index, panel] of state.narration.panels.entries()) {
      const source = resolve(dataRoot, panel.relativePath);
      if (!inside(dataRoot, source)) throw new Error(`Narration path escaped the Workshop data root: ${panel.panelId}`);
      await copyFile(source, join(packageRoot, "narration", `panel-${index + 1}${extname(panel.relativePath) || ".wav"}`));
    }
  }
  const generatedPanels = imageBatch.panels.filter((panel) => panel.state === "generated" && panel.relativePath);
  if (generatedPanels.length) await mkdir(join(packageRoot, "images"), { recursive: true });
  for (const [index, panel] of generatedPanels.entries()) {
    const source = resolve(dataRoot, panel.relativePath!);
    if (!inside(dataRoot, source)) throw new Error(`Image path escaped the Workshop data root: ${panel.id}`);
    await copyFile(source, join(packageRoot, "images", `panel-${index + 1}${extname(panel.relativePath!) || ".png"}`));
  }

  const assets: SubmissionAsset[] = [];
  assets.push(await assetFor(packageRoot, "devpost_description", "DEVPOST.md", "text/markdown", claimIds, sourceLocators, "source_trace"));
  assets.push(await assetFor(packageRoot, "readme_narrative", "README-NARRATIVE.md", "text/markdown", claimIds, sourceLocators, "source_trace"));
  assets.push(await assetFor(packageRoot, "deck", deckName, "text/html", deck.claimIds, sourceLocators, "workshop_output"));
  assets.push(await assetFor(packageRoot, "infographic", infographicName, "text/html", infographic.claimIds, sourceLocators, "workshop_output"));
  assets.push(await assetFor(packageRoot, "image_manifest", "IMAGE-SET.md", "text/markdown", claimIds, sourceLocators, "source_trace"));
  for (const [name] of thumbnailSpecs) assets.push(await assetFor(packageRoot, "thumbnail", name, "image/png", claimIds, sourceLocators, "generated_preview"));
  assets.push(await assetFor(packageRoot, "storyboard", "STORYBOARD.md", "text/markdown", claimIds, sourceLocators, "source_trace"));
  assets.push(await assetFor(packageRoot, "narration", "NARRATION.md", "text/markdown", claimIds, sourceLocators, "narration"));
  assets.push(await assetFor(packageRoot, "video", "workshoplm-demo.mp4", "video/mp4", claimIds, sourceLocators, "video_render"));
  assets.push(await assetFor(packageRoot, "evidence", "VIDEO-PROVENANCE.json", "application/json", claimIds, sourceLocators, "video_render"));
  assets.push(await assetFor(packageRoot, "evidence", "EVIDENCE.md", "text/markdown", claimIds, sourceLocators, "source_trace"));
  if (state.narration && !state.narration.stale && state.narration.storyboardVersion === state.storyboard.version) for (const [index, panel] of state.narration.panels.entries()) assets.push(await assetFor(packageRoot, "narration", `narration/panel-${index + 1}${extname(panel.relativePath) || ".wav"}`, "audio/wav", claimIds, sourceLocators, "narration"));
  for (const [index, panel] of generatedPanels.entries()) assets.push(await assetFor(packageRoot, "image", `images/panel-${index + 1}${extname(panel.relativePath!) || ".png"}`, "image/png", claimIds, sourceLocators, "workshop_output"));

  const outputSet = SubmissionOutputSet.parse({ schemaVersion: 1, id: "workshoplm-submission-v1", workshopId: state.id, title: "WorkshopLM Build Week submission", version: 1, status: limitations.length ? "partial" : "ready", createdAt: state.updatedAt, inputFingerprint: fingerprint, inputs, claimIds, sourceLocators, limitations, assets });
  const manifestPath = join(packageRoot, "manifest.json");
  await writeFile(manifestPath, `${JSON.stringify(outputSet, null, 2)}\n`, "utf8");
  return { manifestPath, outputSet };
}

export type SubmissionVerification = { valid: boolean; stale: boolean; tampered: boolean; issues: string[] };

export async function verifySubmissionOutputSet(root: string, manifestPath: string): Promise<SubmissionVerification> {
  const dataRoot = resolve(root);
  const manifest = resolve(manifestPath);
  if (!inside(dataRoot, manifest)) return { valid: false, stale: false, tampered: true, issues: ["Manifest escaped the Workshop data root."] };
  let raw: unknown;
  try { raw = JSON.parse(await readFile(manifest, "utf8")); }
  catch (error) { return { valid: false, stale: false, tampered: true, issues: [`Manifest could not be read: ${error instanceof Error ? error.message : "unknown error"}`] }; }
  const parsed = SubmissionOutputSet.safeParse(raw);
  if (!parsed.success) return { valid: false, stale: false, tampered: true, issues: parsed.error.issues.map((issue) => `Manifest: ${issue.message}`) };
  const outputSet = parsed.data;
  const packageRoot = resolve(manifest, "..");
  const issues: string[] = [];
  let tampered = false;
  for (const asset of outputSet.assets) {
    const path = resolve(packageRoot, asset.relativePath);
    if (!inside(packageRoot, path)) { issues.push(`Asset escaped the package: ${asset.relativePath}`); tampered = true; continue; }
    try {
      const bytes = await readFile(path);
      if (bytes.byteLength !== asset.byteCount || sha256(bytes) !== asset.sha256) { issues.push(`Asset hash or size mismatch: ${asset.relativePath}`); tampered = true; }
    } catch { issues.push(`Asset is missing: ${asset.relativePath}`); tampered = true; }
  }
  const state = readWorkshopState(dataRoot);
  const stale = submissionInputFingerprint(state) !== outputSet.inputFingerprint;
  if (stale) issues.push("Workshop inputs changed after this submission Output set was created.");
  const expectedStatus = submissionLimitations(state).length ? "partial" : "ready";
  if (!stale && outputSet.status !== expectedStatus) { issues.push(`Manifest status ${outputSet.status} does not match current evidence status ${expectedStatus}.`); tampered = true; }
  return { valid: !stale && !tampered && issues.length === 0, stale, tampered, issues };
}
