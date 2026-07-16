import { createHash } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { basename, extname, join, relative, resolve, sep } from "node:path";
import { promisify } from "node:util";
import { SubmissionOutputSet, type SubmissionAsset, type SubmissionInputSnapshot, type SubmissionOutputSet as SubmissionOutputSetType } from "@workshoplm/domain";
import { buildWorkshopVideoProvenance } from "./executor.js";
import { verifiedRealtimeCaptures } from "./live-operator-evidence.js";
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
    audioOverviews: state.audioOverviews,
    aiRuns: state.aiRuns,
    outputs: state.outputs,
    videos: state.videos,
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

function currentVideo(state: WorkshopState) {
  return [...state.videos].reverse().find((video) => !video.stale);
}

function currentAudioOverview(state: WorkshopState) {
  return [...state.audioOverviews].reverse().find((overview) => !overview.stale);
}

function assertBuildable(state: WorkshopState, root: string): SubmissionInputSnapshot {
  if (!state.briefApproved || !state.frame || state.frame.stale) throw new Error("Submission packaging requires an approved current brief.");
  if (!state.style || state.style.stale) throw new Error("Submission packaging requires a current Style.");
  if (!state.assetPlan || state.assetPlan.stale) throw new Error("Submission packaging requires a current output plan.");
  if (!state.storyboardApproved || state.storyboard.stale || state.storyboard.panels.some((panel) => panel.stale || !panel.approved)) throw new Error("Submission packaging requires an approved current Storyboard.");
  if (!state.imageBatch || state.imageBatch.stale) throw new Error("Submission packaging requires a current image set.");
  if (state.imageBatch.graphRevision !== graphRevision(state) || state.imageBatch.briefVersion !== state.frame.version || state.imageBatch.styleVersion !== state.style.version) throw new Error("Submission packaging requires an image set from the current Map, Brief, and Style.");
  if (state.videoState !== "rendered") throw new Error("Submission packaging requires a rendered Video.");
  const video = currentVideo(state);
  if (!video || video.storyboardVersion !== state.storyboard.version || video.styleVersion !== state.style.version || video.imageBatchId !== state.imageBatch.id) throw new Error("Submission packaging requires a Video rendered from the current approved inputs.");
  if (!video.buildTrace) throw new Error("Submission packaging requires the rendered Video's build trace.");
  if (!state.outputs.some((output) => output.type === "deck" && !output.stale) || !state.outputs.some((output) => output.type === "infographic" && !output.stale)) throw new Error("Submission packaging requires current presentation and infographic Outputs.");
  const audioOverview = currentAudioOverview(state);
  if (!audioOverview || !audioOverview.claimIds.length || audioOverview.sections.some((section) => !section.evidence.length)) throw new Error("Submission packaging requires a current grounded Audio Overview script.");
  if (![video.relativePath, video.provenancePath, video.buildTrace.htmlPath, video.buildTrace.dataPath].every((path) => inside(root, resolve(root, path)))) throw new Error("Video evidence path escaped the Workshop data root.");
  return {
    graphRevision: graphRevision(state),
    briefVersion: state.frame.version,
    styleVersion: state.style.version,
    assetPlanVersion: state.assetPlan.version,
    storyboardVersion: state.storyboard.version,
    audioOverviewVersion: audioOverview.version,
    imageBatchId: state.imageBatch.id,
    narrationStoryboardVersion: state.narration && !state.narration.stale ? state.narration.storyboardVersion : undefined,
    activeSourceIds: [...state.activeSourceIds].sort(),
    claimIds: unique(state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId)).map((claim) => claim.id)),
    outputIds: unique([...state.outputs.filter((output) => !output.stale).map((output) => output.id), audioOverview.id, video.id]),
    videoState: "rendered",
  };
}

export function submissionLimitations(state: WorkshopState): string[] {
  const limitations: string[] = [];
  const providerVoice = verifiedRealtimeCaptures(state).length > 0;
  if (!providerVoice) limitations.push("No provider-verified WebRTC voice transcript is present; fixture or imported transcript text is not treated as live voice evidence.");
  const providerMap = state.aiRuns.some((run) => run.operation === "grounded_graph" && run.model.startsWith("gpt-5.6-") && /^[a-f0-9]{64}$/.test(run.outputSha256));
  if (!providerMap) limitations.push("The recorded fixture uses the deterministic grounded Map path; no live GPT-5.6 reasoning run is present.");
  const generatedImages = state.imageBatch?.panels.filter((panel) => panel.state === "generated" && panel.provenance?.model === "gpt-image-2" && panel.provenance.referenceId === state.imageBatch?.referenceId && Boolean(panel.relativePath) && /^[a-f0-9]{64}$/.test(panel.sha256 ?? "")).length ?? 0;
  const imageCount = state.imageBatch?.panels.length ?? 0;
  if (!imageCount || generatedImages !== imageCount) limitations.push(`The image set contains ${generatedImages} of ${imageCount} provider-generated GPT Image 2 panels.`);
  const narrationIds = state.narration?.panels.map((panel) => panel.panelId) ?? [];
  const providerNarration = Boolean(state.narration && !state.narration.stale && state.narration.storyboardVersion === state.storyboard.version && narrationIds.length === state.storyboard.panels.length && new Set(narrationIds).size === narrationIds.length && state.storyboard.panels.every((panel) => narrationIds.includes(panel.id)) && state.narration.panels.every((panel) => panel.model === "gpt-4o-mini-tts" && panel.voice === "marin" && Boolean(panel.relativePath) && /^[a-f0-9]{64}$/.test(panel.sha256)));
  if (!providerNarration) limitations.push("The video uses deterministic placeholder tones; provider-generated narration is not present.");
  const audioOverview = currentAudioOverview(state);
  const providerAudioOverview = Boolean(audioOverview?.status === "audio_ready" && audioOverview.audio?.model === "gpt-4o-mini-tts" && audioOverview.audio.voice === "marin" && audioOverview.audio.durationSeconds > 0 && audioOverview.audio.byteCount > 0 && /^[a-f0-9]{64}$/.test(audioOverview.audio.sha256));
  if (!providerAudioOverview) limitations.push("The Audio Overview includes a grounded reviewed script, but no provider-generated speech file is present.");
  return limitations;
}

type ThumbnailRenderer = (videoPath: string, outputPath: string, second: number) => Promise<void>;
const renderThumbnail: ThumbnailRenderer = async (videoPath, outputPath, second) => {
  await execFile("ffmpeg", ["-y", "-ss", second.toFixed(2), "-i", videoPath, "-frames:v", "1", "-vf", "scale=1280:-2", outputPath], { maxBuffer: 5_000_000 });
};

export type BuildSubmissionOptions = { outputDirectory?: string; renderThumbnail?: ThumbnailRenderer };

function devpostCopy(state: WorkshopState, limitations: string[], elapsed: string): string {
  const liveMap = state.aiRuns.length ? `GPT-5.6 runs recorded: ${state.aiRuns.length}.` : "No live GPT-5.6 run is claimed by this package.";
  return `# WorkshopLM\n\n**Turn raw thinking into finished work.**\n\nWorkshopLM is a professional thought-to-delivery workspace built for OpenAI Build Week's Work & Productivity track. A team starts with conversation and selected sources, shapes them into an editable grounded Map, approves that Map as a Brief, applies a locked Style, and creates source-traceable work: a presentation, infographic, Audio Overview, coherent image set, editable Storyboard, and narrated local Video.\n\n## What makes it different\n\n- Every factual claim retains a path to an exact source locator.\n- The Map stays editable before production begins.\n- Brief and Storyboard approval are the only blocking gates.\n- Style rules and evidence survive across every Output.\n- Dependency changes mark downstream work as Needs update.\n- The product packages its own hackathon submission with hashes and an input fingerprint.\n\n## Built with OpenAI and Codex\n\nWorkshopLM is implemented as a local pnpm/Turborepo product with a unified plugin doorway and a self-contained in-app browser workspace. Codex accelerated and verified the build; WorkshopLM owns the professional's grounded text and Realtime voice Conversation. ${liveMap} GPT Image 2 and OpenAI speech are recorded only when their provider provenance exists. The local video renderer refuses to run before Storyboard approval.\n\n## Demonstrated result\n\nThis Output set was produced from one approved Workshop state in ${elapsed}. Its manifest links ${state.claims.length} grounded claims across ${state.activeSourceIds.length} active sources to the included submission assets.\n\n## Current package limitations\n\n${limitations.length ? limitations.map((item) => `- ${item}`).join("\n") : "- None. This package contains inspected provider-backed media."}\n`;
}

function readmeNarrative(state: WorkshopState, limitations: string[]): string {
  return `# WorkshopLM submission narrative\n\nWorkshopLM turns a raw professional brainstorm into finished, source-traceable work through one Capture → Shape → Deliver path. The judge-facing product runs locally through the WorkshopLM plugin doorway and one self-contained in-app browser workspace. WorkshopLM owns the grounded text and Realtime voice Conversation, Sources, Map, Brief, Style, Outputs, Storyboard, and exact source trace. Codex is the development and launch host, not the professional's chat surface. ChatGPT Work parity is not claimed.\n\n## The meta-demo\n\nThis submission package was built from the same approved Workshop state as the demo. The included manifest records the source scope, claim IDs, input versions, file hashes, and dependency fingerprint for the Devpost copy, repository narrative, presentation, infographic, Audio Overview, image manifest, thumbnails, Storyboard, narration, evidence report, and Video.\n\n## Evidence boundary\n\nThe package status is **${limitations.length ? "partial" : "ready"}**. It does not turn configured providers, deterministic fixtures, or planned media into live-use claims. See \`EVIDENCE.md\` and \`manifest.json\` for the exact boundary.\n\n## Workshop state\n\n- Active sources: ${state.activeSourceIds.length}\n- Grounded claims: ${state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId)).length}\n- Brief version: ${state.frame?.version}\n- Style version: ${state.style?.version}\n- Audio Overview version: ${currentAudioOverview(state)?.version}\n- Storyboard version: ${state.storyboard.version}\n- Current Outputs: ${state.outputs.filter((output) => !output.stale).length + (currentAudioOverview(state) ? 1 : 0)}\n`;
}

function storyboardMarkdown(state: WorkshopState): string {
  const rows = state.storyboard.panels.map((panel, index) => `| ${index + 1} | ${panel.title.replaceAll("|", "\\|")} | ${panel.durationSeconds}s | ${panel.narration.replaceAll("|", "\\|")} | ${panel.evidence.map((reference) => reference.locator).join("; ").replaceAll("|", "\\|")} |`).join("\n");
  return `# Storyboard\n\nApproved Storyboard version ${state.storyboard.version}.\n\n| Frame | Purpose | Duration | Narration | Sources |\n| ---: | --- | ---: | --- | --- |\n${rows}\n`;
}

function narrationMarkdown(state: WorkshopState): string {
  const provider = state.narration && !state.narration.stale && state.narration.storyboardVersion === state.storyboard.version;
  return `# Narration\n\n${provider ? `${state.narration!.disclosure}. Model provenance and hashes are recorded for every copied audio panel.` : "This package contains the approved narration script. The recorded fixture video uses deterministic placeholder tones; it does not claim provider-generated voice."}\n\n${state.storyboard.panels.map((panel, index) => `## ${index + 1}. ${panel.title}\n\n${panel.narration}`).join("\n\n")}\n`;
}

function audioOverviewMarkdown(state: WorkshopState): string {
  const overview = currentAudioOverview(state)!;
  const audio = overview.audio;
  const metadata = audio ? `\n- Duration: ${audio.durationSeconds.toFixed(1)} seconds\n- Model: ${audio.model}\n- Voice: ${audio.voice}\n- SHA-256: \`${audio.sha256}\`\n- Disclosure: ${overview.disclosure}` : `\n- Speech status: reviewed script only\n- Disclosure if generated: ${overview.disclosure}`;
  const sections = overview.sections.map((section, index) => `## ${index + 1}. ${section.title}\n\n${section.text}\n\nSources: ${section.evidence.map((reference) => reference.locator).join("; ")}`).join("\n\n");
  return `# Audio Overview\n\nVersion ${overview.version} · ${overview.posture.replaceAll("_", " ")} · ${overview.claimIds.length} sourced points${metadata}\n\n${sections}\n`;
}

function imageManifestMarkdown(state: WorkshopState): string {
  return `# Image set\n\nImage batch ${state.imageBatch!.id}, locked to Brief version ${state.imageBatch!.briefVersion}, graph revision ${state.imageBatch!.graphRevision}, and Style version ${state.imageBatch!.styleVersion}.\n\n${state.imageBatch!.panels.map((panel, index) => `- **${index + 1}. ${panel.prompt}** — ${panel.state}${panel.provenance ? `; ${panel.provenance.model}; ${panel.provenance.size}; ${panel.provenance.quality}` : ""}${panel.error ? `; ${panel.error}` : ""}; sources: ${panel.evidence.map((reference) => reference.locator).join("; ") || "none"}`).join("\n")}\n`;
}

function evidenceMarkdown(state: WorkshopState, limitations: string[], fingerprint: string): string {
  const claims = state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId));
  const audioOverview = currentAudioOverview(state);
  return `# Submission evidence\n\nInput fingerprint: \`${fingerprint}\`\n\n## Active sources\n\n${state.sourceItems.filter((source) => state.activeSourceIds.includes(source.id)).map((source) => `- **${source.title}** — ${source.origin}; ${source.locator}; ${source.permission}`).join("\n")}\n\n## Grounded claims\n\n${claims.length ? claims.map((claim) => `- \`${claim.id}\` — ${claim.text} (${claim.locator})`).join("\n") : "- The current fixture has no normalized claim records; output locators come from the grounded Map."}\n\n## Provider evidence\n\n- GPT-5.6 grounded Map runs: ${state.aiRuns.length}\n- GPT Image 2 panels: ${state.imageBatch!.panels.filter((panel) => panel.provenance?.model === "gpt-image-2").length}/${state.imageBatch!.panels.length}\n- OpenAI narration panels: ${state.narration && !state.narration.stale ? state.narration.panels.length : 0}/${state.storyboard.panels.length}\n- Audio Overview: ${audioOverview?.status ?? "missing"}${audioOverview?.audio ? `; ${audioOverview.audio.model}; ${audioOverview.audio.voice}; ${audioOverview.audio.durationSeconds.toFixed(1)} seconds` : "; reviewed script only"}\n- Local video state: ${state.videoState}\n\n## Limitations\n\n${limitations.length ? limitations.map((item) => `- ${item}`).join("\n") : "- None."}\n`;
}

async function writeText(path: string, content: string) {
  await mkdir(resolve(path, ".."), { recursive: true });
  await writeFile(path, content, "utf8");
}

async function assertRecordedHash(root: string, relativePath: string, expectedSha256: string, label: string): Promise<Buffer> {
  const path = resolve(root, relativePath);
  if (!inside(root, path)) throw new Error(`${label} path escaped the Workshop data root.`);
  const bytes = await readFile(path);
  if (sha256(bytes) !== expectedSha256) throw new Error(`${label} does not match its recorded SHA-256.`);
  return bytes;
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
  const audioOverview = currentAudioOverview(state)!;
  const video = currentVideo(state)!;
  const videoPath = resolve(dataRoot, video.relativePath);
  const videoProvenancePath = resolve(dataRoot, video.provenancePath);
  const buildTracePath = resolve(dataRoot, video.buildTrace.htmlPath);
  const buildTraceDataPath = resolve(dataRoot, video.buildTrace.dataPath);
  const videoBytes = await assertRecordedHash(dataRoot, video.relativePath, video.sha256, "Rendered Video");
  await stat(videoProvenancePath);
  await stat(buildTracePath);
  await stat(buildTraceDataPath);
  let actualVideoProvenance: unknown;
  try { actualVideoProvenance = JSON.parse(await readFile(videoProvenancePath, "utf8")); }
  catch { throw new Error("Rendered Video provenance is not valid JSON."); }
  const expectedVideoProvenance = buildWorkshopVideoProvenance(state, { relativePath: video.artifactPath, sha256: video.sha256, byteCount: video.byteCount, mimeType: "video/mp4" });
  if (JSON.stringify(actualVideoProvenance) !== JSON.stringify(expectedVideoProvenance)) throw new Error("Rendered Video provenance does not match the current approved inputs and recorded hashes.");
  if (sha256(await readFile(buildTracePath)) !== video.buildTrace.htmlSha256 || sha256(await readFile(buildTraceDataPath)) !== video.buildTrace.dataSha256) throw new Error("Rendered Video build trace does not match its persisted hashes.");
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
  await writeText(join(packageRoot, "AUDIO-OVERVIEW.md"), audioOverviewMarkdown(state));
  await writeText(join(packageRoot, "IMAGE-SET.md"), imageManifestMarkdown(state));
  await writeText(join(packageRoot, "EVIDENCE.md"), evidenceMarkdown(state, limitations, fingerprint));

  const currentOutputs = state.outputs.filter((output) => !output.stale);
  const deck = [...currentOutputs].reverse().find((output) => output.type === "deck")!;
  const infographic = [...currentOutputs].reverse().find((output) => output.type === "infographic")!;
  const deckName = `presentation${extname(deck.relativePath) || ".html"}`;
  const editableDeckName = deck.editableRelativePath ? "presentation.pptx" : undefined;
  const infographicName = `infographic${extname(infographic.relativePath) || ".html"}`;
  const editableInfographicName = infographic.editableRelativePath ? "infographic.pptx" : undefined;
  for (const [output, name] of [[deck, deckName], [infographic, infographicName]] as const) {
    const source = resolve(dataRoot, output.relativePath);
    if (!inside(dataRoot, source)) throw new Error(`Output path escaped the Workshop data root: ${output.id}`);
    await copyFile(source, join(packageRoot, name));
  }
  if (deck.editableRelativePath && editableDeckName) {
    const source = resolve(dataRoot, deck.editableRelativePath);
    if (!inside(dataRoot, source)) throw new Error(`Editable output path escaped the Workshop data root: ${deck.id}`);
    await copyFile(source, join(packageRoot, editableDeckName));
  }
  if (infographic.editableRelativePath && editableInfographicName) {
    const source = resolve(dataRoot, infographic.editableRelativePath);
    if (!inside(dataRoot, source)) throw new Error(`Editable output path escaped the Workshop data root: ${infographic.id}`);
    await copyFile(source, join(packageRoot, editableInfographicName));
  }
  await writeFile(join(packageRoot, "workshoplm-demo.mp4"), videoBytes);
  await copyFile(videoProvenancePath, join(packageRoot, "VIDEO-PROVENANCE.json"));
  await copyFile(buildTracePath, join(packageRoot, "BUILD-TRACE.html"));
  await copyFile(buildTraceDataPath, join(packageRoot, "BUILD-TRACE.json"));

  const thumbnail = options.renderThumbnail ?? renderThumbnail;
  const duration = state.storyboard.panels.reduce((total, panel) => total + panel.durationSeconds, 0);
  const thumbnailSpecs = [["thumbnail-opening.png", Math.min(0.2, duration / 10)], ["thumbnail-process.png", duration * 0.45], ["thumbnail-result.png", Math.max(0, duration * 0.82)]] as const;
  for (const [name, second] of thumbnailSpecs) await thumbnail(videoPath, join(packageRoot, name), second);

  if (state.narration && !state.narration.stale && state.narration.storyboardVersion === state.storyboard.version) {
    await mkdir(join(packageRoot, "narration"), { recursive: true });
    for (const [index, panel] of state.narration.panels.entries()) {
      const bytes = await assertRecordedHash(dataRoot, panel.relativePath, panel.sha256, `Narration panel ${panel.panelId}`);
      await writeFile(join(packageRoot, "narration", `panel-${index + 1}${extname(panel.relativePath) || ".wav"}`), bytes);
    }
  }
  if (audioOverview.audio) {
    const bytes = await assertRecordedHash(dataRoot, audioOverview.audio.relativePath, audioOverview.audio.sha256, `Audio Overview ${audioOverview.id}`);
    await writeFile(join(packageRoot, `audio-overview${extname(audioOverview.audio.relativePath) || ".wav"}`), bytes);
  }
  const generatedPanels = imageBatch.panels.filter((panel) => panel.state === "generated" && panel.relativePath);
  if (generatedPanels.length) await mkdir(join(packageRoot, "images"), { recursive: true });
  for (const [index, panel] of generatedPanels.entries()) {
    const bytes = await assertRecordedHash(dataRoot, panel.relativePath!, panel.sha256!, `Image panel ${panel.id}`);
    await writeFile(join(packageRoot, "images", `panel-${index + 1}${extname(panel.relativePath!) || ".png"}`), bytes);
  }

  const assets: SubmissionAsset[] = [];
  assets.push(await assetFor(packageRoot, "devpost_description", "DEVPOST.md", "text/markdown", claimIds, sourceLocators, "source_trace"));
  assets.push(await assetFor(packageRoot, "readme_narrative", "README-NARRATIVE.md", "text/markdown", claimIds, sourceLocators, "source_trace"));
  assets.push(await assetFor(packageRoot, "deck", deckName, "text/html", deck.claimIds, sourceLocators, "workshop_output"));
  if (editableDeckName) assets.push(await assetFor(packageRoot, "deck", editableDeckName, "application/vnd.openxmlformats-officedocument.presentationml.presentation", deck.claimIds, sourceLocators, "workshop_output"));
  assets.push(await assetFor(packageRoot, "infographic", infographicName, "text/html", infographic.claimIds, sourceLocators, "workshop_output"));
  if (editableInfographicName) assets.push(await assetFor(packageRoot, "infographic", editableInfographicName, "application/vnd.openxmlformats-officedocument.presentationml.presentation", infographic.claimIds, sourceLocators, "workshop_output"));
  assets.push(await assetFor(packageRoot, "audio_overview", "AUDIO-OVERVIEW.md", "text/markdown", audioOverview.claimIds, unique(audioOverview.sections.flatMap((section) => section.evidence.map((reference) => reference.locator))), "source_trace"));
  assets.push(await assetFor(packageRoot, "image_manifest", "IMAGE-SET.md", "text/markdown", claimIds, sourceLocators, "source_trace"));
  for (const [name] of thumbnailSpecs) assets.push(await assetFor(packageRoot, "thumbnail", name, "image/png", claimIds, sourceLocators, "generated_preview"));
  assets.push(await assetFor(packageRoot, "storyboard", "STORYBOARD.md", "text/markdown", claimIds, sourceLocators, "source_trace"));
  assets.push(await assetFor(packageRoot, "narration", "NARRATION.md", "text/markdown", claimIds, sourceLocators, "narration"));
  assets.push(await assetFor(packageRoot, "video", "workshoplm-demo.mp4", "video/mp4", claimIds, sourceLocators, "video_render"));
  assets.push(await assetFor(packageRoot, "evidence", "VIDEO-PROVENANCE.json", "application/json", claimIds, sourceLocators, "video_render"));
  assets.push(await assetFor(packageRoot, "evidence", "BUILD-TRACE.html", "text/html", claimIds, sourceLocators, "source_trace"));
  assets.push(await assetFor(packageRoot, "evidence", "BUILD-TRACE.json", "application/json", claimIds, sourceLocators, "source_trace"));
  assets.push(await assetFor(packageRoot, "evidence", "EVIDENCE.md", "text/markdown", claimIds, sourceLocators, "source_trace"));
  if (state.narration && !state.narration.stale && state.narration.storyboardVersion === state.storyboard.version) for (const [index, panel] of state.narration.panels.entries()) assets.push(await assetFor(packageRoot, "narration", `narration/panel-${index + 1}${extname(panel.relativePath) || ".wav"}`, "audio/wav", claimIds, sourceLocators, "narration"));
  if (audioOverview.audio) assets.push(await assetFor(packageRoot, "audio_overview", `audio-overview${extname(audioOverview.audio.relativePath) || ".wav"}`, "audio/wav", audioOverview.claimIds, unique(audioOverview.sections.flatMap((section) => section.evidence.map((reference) => reference.locator))), "narration"));
  for (const [index, panel] of generatedPanels.entries()) {
    const panelClaimIds = unique(panel.evidence.flatMap((reference) => reference.claimId ? [reference.claimId] : []));
    const panelSourceLocators = unique(panel.evidence.map((reference) => reference.locator));
    assets.push(await assetFor(packageRoot, "image", `images/panel-${index + 1}${extname(panel.relativePath!) || ".png"}`, "image/png", panelClaimIds.length ? panelClaimIds : claimIds, panelSourceLocators.length ? panelSourceLocators : sourceLocators, "workshop_output"));
  }

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
