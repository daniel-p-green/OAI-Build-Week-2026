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
  const privateSources = state.sourceItems.filter((source) => state.activeSourceIds.includes(source.id) && source.permission === "private");
  if (privateSources.length) throw new Error(`Submission packaging requires every active Source to be sanitized or explicitly shareable. Private Sources: ${privateSources.map((source) => source.title).join(", ")}.`);
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
  if (!state.outputs.some((output) => output.type === "deck" && !output.stale) || !state.outputs.some((output) => output.type === "infographic" && !output.stale)) throw new Error("Submission packaging requires a current Presentation and Infographic.");
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
  const providerNarration = Boolean(state.narration && !state.narration.stale && state.narration.storyboardVersion === state.storyboard.version && narrationIds.length === state.storyboard.panels.length && new Set(narrationIds).size === narrationIds.length && state.storyboard.panels.every((panel) => narrationIds.includes(panel.id)) && state.narration.panels.every((panel) => panel.model === "gpt-4o-mini-tts" && panel.voice === "cedar" && Boolean(panel.relativePath) && /^[a-f0-9]{64}$/.test(panel.sha256)));
  if (!providerNarration) limitations.push("The video uses deterministic placeholder tones; provider-generated narration is not present.");
  const audioOverview = currentAudioOverview(state);
  const providerAudioOverview = Boolean(audioOverview?.status === "audio_ready" && audioOverview.audio?.model === "gpt-4o-mini-tts" && audioOverview.audio.voice === "cedar" && audioOverview.audio.durationSeconds > 0 && audioOverview.audio.byteCount > 0 && /^[a-f0-9]{64}$/.test(audioOverview.audio.sha256));
  if (!providerAudioOverview) limitations.push("The Audio Overview includes a grounded reviewed script, but no provider-generated speech file is present.");
  return limitations;
}

type ThumbnailRenderer = (videoPath: string, outputPath: string, second: number) => Promise<void>;
const renderThumbnail: ThumbnailRenderer = async (videoPath, outputPath, second) => {
  await execFile("ffmpeg", ["-y", "-ss", second.toFixed(2), "-i", videoPath, "-frames:v", "1", "-vf", "scale=1280:-2", outputPath], { maxBuffer: 5_000_000 });
};

type CoverThumbnailRenderer = (state: WorkshopState, root: string, outputPath: string) => Promise<void>;

function safeHex(value: string, fallback: string): string {
  return /^#[0-9a-f]{6}$/i.test(value) ? value : fallback;
}

function escapeXml(value: string): string {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

export function submissionCoverSvg(state: WorkshopState, heroImage?: Uint8Array): string {
  const ink = safeHex(state.style?.ink ?? "", "#0D0D0D");
  const paper = safeHex(state.style?.paper ?? "", "#FFFFFF");
  const accent = safeHex(state.style?.accent ?? "", "#10A37F");
  const hero = heroImage ? `<image href="data:image/png;base64,${Buffer.from(heroImage).toString("base64")}" x="630" y="80" width="586" height="560" preserveAspectRatio="xMidYMid slice"/>` : `<g transform="translate(648 112)"><path d="M88 414V84l170-56v330z" fill="${paper}" opacity=".92"/><path d="M258 358V28l170 92v330z" fill="${accent}" opacity=".92"/><path d="M88 414l170-56 170 92-170 58z" fill="${paper}" opacity=".5"/><circle cx="268" cy="248" r="62" fill="${ink}" opacity=".82"/></g>`;
  const sourceCount = state.activeSourceIds.length;
  const claimCount = state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId)).length;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs><clipPath id="hero"><rect x="630" y="80" width="586" height="560" rx="28"/></clipPath><filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity=".22"/></filter></defs>
  <rect width="1280" height="720" fill="${ink}"/>
  <circle cx="1180" cy="-38" r="210" fill="${accent}"/>
  <text x="64" y="76" fill="${paper}" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700">WorkshopLM</text>
  <rect x="64" y="112" width="171" height="32" rx="16" fill="${paper}" opacity=".1" stroke="${paper}" stroke-opacity=".22"/>
  <text x="149.5" y="133" text-anchor="middle" fill="${paper}" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.4">SOURCE-GROUNDED</text>
  <text x="64" y="238" fill="${paper}" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="500" letter-spacing="-3.4"><tspan x="64">One thought.</tspan><tspan x="64" dy="82">Every format.</tspan><tspan x="64" dy="82">Sources attached.</tspan></text>
  <text x="64" y="536" fill="${paper}" opacity=".78" font-family="Arial, Helvetica, sans-serif" font-size="20">Sources → Map → Brief → created work</text>
  <line x1="64" y1="578" x2="516" y2="578" stroke="${paper}" stroke-opacity=".18"/>
  <text x="64" y="618" fill="${paper}" opacity=".56" font-family="Arial, Helvetica, sans-serif" font-size="15">${sourceCount} ${sourceCount === 1 ? "source" : "sources"} · ${claimCount} traced ${claimCount === 1 ? "claim" : "claims"}</text>
  <g filter="url(#shadow)"><rect x="630" y="80" width="586" height="560" rx="28" fill="${paper}"/></g>
  <g clip-path="url(#hero)">${hero}</g>
  <rect x="630.5" y="80.5" width="585" height="559" rx="27.5" fill="none" stroke="${paper}" stroke-opacity=".2"/>
  <text x="1180" y="612" text-anchor="end" fill="${ink}" opacity=".58" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.2">${escapeXml(state.style?.name ?? "Workshop style")}</text>
</svg>`;
}

const renderSubmissionCover: CoverThumbnailRenderer = async (state, root, outputPath) => {
  const panel = state.imageBatch?.panels.find((candidate) => candidate.state === "generated" && candidate.relativePath && candidate.sha256);
  const heroImage = panel ? await assertRecordedHash(root, panel.relativePath!, panel.sha256!, `Thumbnail image panel ${panel.id}`) : undefined;
  const svgPath = `${outputPath}.svg`;
  await writeFile(svgPath, submissionCoverSvg(state, heroImage), "utf8");
  try { await execFile("rsvg-convert", ["-w", "1280", "-h", "720", svgPath, "-o", outputPath]); }
  finally { await rm(svgPath, { force: true }); }
};

export type BuildSubmissionOptions = { outputDirectory?: string; renderThumbnail?: ThumbnailRenderer; renderCoverThumbnail?: CoverThumbnailRenderer };

function devpostCopy(state: WorkshopState, limitations: string[], elapsed: string): string {
  const activeClaims = state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId));
  const mapRuns = state.aiRuns.filter((run) => run.operation === "grounded_graph" && run.model.startsWith("gpt-5.6-"));
  const generatedImages = state.imageBatch?.panels.filter((panel) => panel.state === "generated" && panel.provenance?.model === "gpt-image-2").length ?? 0;
  const narrationPanels = state.narration && !state.narration.stale && state.narration.storyboardVersion === state.storyboard.version ? state.narration.panels.filter((panel) => panel.model === "gpt-4o-mini-tts").length : 0;
  const realtimeTurns = verifiedRealtimeCaptures(state).length;
  const audioOverview = currentAudioOverview(state);
  const sourceLabel = `${state.activeSourceIds.length} active ${state.activeSourceIds.length === 1 ? "Source" : "Sources"}`;
  const claimLabel = `${activeClaims.length} grounded ${activeClaims.length === 1 ? "claim" : "claims"}`;
  return `# WorkshopLM\n\n**From conversations and Sources to professional knowledge work.**\n\nOpenAI Build Week · Work & Productivity\n\n## The problem\n\nProfessionals start with meetings, documents, and half-formed thinking, then rebuild the same context across disconnected tools. Research tools stop at understanding. Creation tools often lose provenance, visual consistency, or editability.\n\n## What WorkshopLM does\n\nWorkshopLM is the professional knowledge workspace that turns conversations and source material into presentations, graphics, Audio Overviews, visual Maps, Storyboards, and Videos. Every expression shares the same knowledge, visual identity, and connection to its Sources. Start by speaking naturally or adding meeting notes, websites, and local documents. WorkshopLM organizes selected material into an editable semantic Map where every factual idea keeps its exact Source locator. Shape the thinking spatially, then approve the Map as the Brief.\n\nChoose a saved Style, derive one from a website, or set exact colors, fonts, assets, and rules manually. One action creates a polished, editable Presentation, Infographic, coherent Image set, grounded Audio Overview, and editable Storyboard. Only an approved Storyboard may become a narrated local Video. These are first-class expressions of one Workshop, not unrelated generators.\n\n## Why it is different\n\n**Two sign-offs, with visible consequences.** Approve the Brief before creation. Approve the Storyboard before Video. Nothing final bypasses those decisions.\n\n**Every factual claim keeps its receipt.** Select a claim in created work and WorkshopLM opens the exact Source text, not merely a citations page.\n\n**Style is a reusable system.** Brand rules, visual treatment, and motion rules travel together across created work instead of being reinterpreted on every generation.\n\n**Created work stays editable and honest.** PowerPoint files, Storyboard panels, Audio Overview scripts, and individual generated images all have a refinement path. Upstream changes preserve prior versions and calmly mark dependent work as \`Needs update\`.\n\n## The meta-demo\n\nThis package was produced from one approved Workshop state in ${elapsed}. It links ${claimLabel} across ${sourceLabel} to the Devpost narrative, repository narrative, Presentation, Infographic, Audio Overview, Image manifest, three thumbnails, approved Storyboard, narration, evidence report, build trace, and rendered Video. Every asset has a recorded hash; the manifest also binds the Map, Brief, Style, Storyboard, Source scope, and dependency fingerprint.\n\nThe submission is product proof: raw material became the same professional knowledge work used to explain WorkshopLM.\n\n## Built with OpenAI and Codex\n\n- **GPT-5.6:** ${mapRuns.length ? `${mapRuns.length} recorded grounded-Map ${mapRuns.length === 1 ? "run" : "runs"}, with model and response provenance preserved.` : "No provider Map run is claimed by this package; the deterministic Map fallback remains inspectable."}\n- **GPT Image 2:** ${generatedImages}/${state.imageBatch?.panels.length ?? 0} current image panels carry provider provenance and the locked visual reference.\n- **OpenAI Realtime:** ${realtimeTurns ? `${realtimeTurns} verified WebRTC ${realtimeTurns === 1 ? "turn" : "turns"} preserve transcript and tool evidence.` : "No provider-verified WebRTC turn is claimed by this package."}\n- **OpenAI speech:** ${narrationPanels}/${state.storyboard.panels.length} Storyboard narration clips are provider-backed; the Audio Overview is ${audioOverview?.status === "audio_ready" ? "provider-narrated" : "a grounded reviewed script"}. AI voice remains disclosed.\n- **Codex:** Codex implemented and verified the pnpm/Turborepo product from \`GOAL.md\` under an append-only evidence loop in \`AGENTS.md\` and \`log.md\`. The unified plugin exposes grounded tools and opens the self-contained local workbench.\n- **HyperFrames:** the approved Storyboard, exact current images, Style tokens, and narration render locally. Per-scene provenance records the Source, claim, image, and audio hashes.\n\n## Try the recorded judge path\n\n\`\`\`sh\npnpm install --frozen-lockfile\npnpm judge:start\n\`\`\`\n\nNo account, connector, API key, or provider spend is required for that sanitized fixture. The public Video remains the primary judge experience.\n\n## Evidence boundary\n\nPackage status: **${limitations.length ? "partial" : "ready"}**. This file never upgrades configured providers, planned media, or deterministic fixtures into live-use claims.\n\n${limitations.length ? limitations.map((item) => `- ${item}`).join("\n") : "- No package limitations remain. The included provider media and local render passed integrity verification."}\n`;
}

function readmeNarrative(state: WorkshopState, limitations: string[]): string {
  const activeClaims = state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId));
  return `# WorkshopLM submission narrative\n\n## Promise\n\nWorkshopLM is the professional knowledge workspace that turns conversations and source material into presentations, graphics, Audio Overviews, visual Maps, Storyboards, and Videos. Every expression shares the same knowledge, visual identity, and connection to its Sources.\n\n## Product path\n\n1. Speak naturally or add notes, websites, and local documents.\n2. Review and edit the grounded semantic Map.\n3. Approve the Map as the Brief.\n4. Review a website-derived, saved, or manually specified Style.\n5. Create a Presentation, Infographic, Audio Overview, coherent Image set, and editable Storyboard.\n6. Approve the Storyboard before rendering the narrated local Video.\n\nWorkshopLM owns the professional's Conversation, Sources, Map, Brief, Style, created work, Storyboard, and exact Source trace. Every format is a first-class expression of the same Workshop. Codex is the development and launch host, not the professional's chat surface. ChatGPT Work parity is not claimed.\n\n## What this package contains\n\nThe package was built from the same approved Workshop state as the demo. Its manifest binds the Source scope, claim IDs, Map revision, Brief and Style versions, Storyboard approval, file hashes, and dependency fingerprint for the Devpost copy, this repository narrative, Presentation, Infographic, Audio Overview, Image manifest, styled public cover, two Video proof thumbnails, Storyboard, narration, evidence report, build trace, and Video.\n\n## Reproduce the recorded fixture\n\n\`\`\`sh\npnpm install --frozen-lockfile\npnpm judge:start\n\`\`\`\n\nThe recorded path is sanitized, local, credential-free, and intentionally separate from provider-backed evidence.\n\n## Evidence boundary\n\nThe package status is **${limitations.length ? "partial" : "ready"}**. It does not turn configured providers, deterministic fixtures, or planned media into live-use claims. See \`EVIDENCE.md\` and \`manifest.json\` for the exact boundary.\n\n## Workshop state\n\n- Active Sources: ${state.activeSourceIds.length}\n- Grounded claims: ${activeClaims.length}\n- Brief version: ${state.frame?.version}\n- Style version: ${state.style?.version}\n- Audio Overview version: ${currentAudioOverview(state)?.version}\n- Storyboard version: ${state.storyboard.version}\n- Current created work: ${state.outputs.filter((output) => !output.stale).length + (currentAudioOverview(state) ? 1 : 0)}\n- Package limitations: ${limitations.length}\n`;
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
  const openingPath = join(packageRoot, thumbnailSpecs[0][0]);
  if (options.renderCoverThumbnail) await options.renderCoverThumbnail(state, dataRoot, openingPath);
  else if (options.renderThumbnail) await thumbnail(videoPath, openingPath, thumbnailSpecs[0][1]);
  else await renderSubmissionCover(state, dataRoot, openingPath);
  for (const [name, second] of thumbnailSpecs.slice(1)) await thumbnail(videoPath, join(packageRoot, name), second);

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
