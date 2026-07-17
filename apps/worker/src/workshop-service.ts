import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { execFile as execFileCallback } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, basename, extname, isAbsolute, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { deflateSync } from "node:zlib";
import { appendGraphOperation, ConversationTurn, GraphOperation, parseGraphState, SemanticGraph, serializeGraphState, undoLatestGraphOperation, WorkshopToolCall, type ConversationTurn as DomainConversationTurn, type SemanticGraph as SemanticGraphType, type WorkshopToolCall as DomainWorkshopToolCall } from "@workshoplm/domain";
import { writeRenderedArtifact, type RenderVisual } from "@workshoplm/production";
import { storeArtifact } from "./artifacts/local-artifact-store.js";
import { openLocalDatabase } from "./db/client.js";
import { migrate } from "./db/migrate.js";
import { cancelJob, enqueue } from "./queue.js";

export type WorkshopSource = { id: string; type: "TXT" | "PDF" | "WEB"; title: string; origin: string; claimCount: number; excerpt: string; locator: string; permission: "private" | "sanitized" | "shareable" };
export type WorkshopChunk = { id: string; sourceId: string; text: string; locator: string; ordinal: number };
export type WorkshopClaim = { id: string; sourceId: string; chunkId: string; text: string; evidenceState: "verified"; locator: string };
export type WorkshopCandidate = { id: string; category: "goal" | "audience" | "claim" | "constraint" | "question"; text: string; sourceId: string; chunkId: string; locator: string };
export type WorkshopMapEdge = { id: string; from: string; to: string; kind: "supports" | "relates_to" | "depends_on" | "contradicts" | "contains"; label?: string };
export type RealtimeCaptureEvidence = { transport: "webrtc"; model: "gpt-realtime-2.1"; transcriptionModel: "gpt-realtime-whisper"; itemIds: string[]; eventIds: string[]; assistant?: { text: string; responseId: string; eventIds: string[] }; interruptions?: { responseIds: string[]; eventIds: string[] } };
export type WorkshopTranscriptSegment = { id: string; origin: "manual_import" | "realtime_fallback"; transport: "fixture" | "webrtc"; text: string; capturedAt: string; provider?: Omit<RealtimeCaptureEvidence, "transport"> };
export type WorkshopConversationTurn = DomainConversationTurn;
export type WorkshopToolInvocation = DomainWorkshopToolCall;
export type WorkshopConversationContinuation = { responseId: string; model?: string; recordedAt: string };
export type WorkshopMapNode = { id: string; title: string; body: string; kind: "grounded" | "derived" | "creative"; locator: string; sourceId?: string; x: number; y: number; width: number; height: number };
export type CanvasNodePatch = { id: string; title: string; x: number; y: number; width: number; height: number };
export type WorkshopFrame = { version: number; markdown: string; markdownPath: string; executablePath: string; stale: boolean; approvedAt: string };
export type WorkshopSketch = { version: number; graphRevision: number; styleVersion?: number; nodes: Pick<WorkshopMapNode, "id" | "title" | "body" | "kind" | "locator">[]; edges: WorkshopMapEdge[]; claimIds: string[]; relativePath: string; sha256: string; stale: boolean; approved: boolean; createdAt: string };
export type StyleEvidenceSource = "website" | "manual" | "default";
export type StylePaletteRoles = {
  accent: { value: string; source: StyleEvidenceSource };
  text: { value: string; source: StyleEvidenceSource };
  background: { value: string; source: StyleEvidenceSource };
};
export type FontAvailability = "system" | "user_confirmed" | "unverified";
export type StyleTypographyRoles = {
  heading: { family: string; availability: FontAvailability; source: StyleEvidenceSource };
  body: { family: string; availability: FontAvailability; source: StyleEvidenceSource };
};
export type WorkshopBrandAsset = { id: string; sourceUrl: string; localPath: string; contentType: "image/png" | "image/jpeg" | "image/webp" | "image/svg+xml"; byteCount: number; width: number; height: number; sha256: string; selectedAt: string };
export type WorkshopStyle = { version: number; source: "manual" | "website"; name: string; accent: string; ink: string; paper: string; paletteRoles: StylePaletteRoles; typographyRoles: StyleTypographyRoles; brandAssets: WorkshopBrandAsset[]; logos: string[]; licensedFonts: string[]; references: string[]; negativeRules: string[]; intentProfile: "client_facing_pitch" | "board_deck" | "internal_workshop"; referenceUrl?: string; libraryId?: string; libraryFamilyId?: string; libraryRevision?: number; lockedAt: string; stale: boolean };
export type WorkshopStyleLibraryEntry = Omit<WorkshopStyle, "version" | "libraryId" | "libraryFamilyId" | "libraryRevision" | "lockedAt" | "stale"> & { id: string; familyId: string; revision: number; createdAt: string; updatedAt: string };
export type WorkshopOutcome = "client_facing_pitch" | "board_deck" | "internal_workshop";
export type WebsiteStyleErrorCode = "invalid_url" | "private_network" | "redirect" | "blocked" | "dynamic_site" | "no_useful_findings" | "scan_failed";
export type WebsiteStyleAnalysis = {
  status: "reviewing" | "ready" | "error";
  url: string;
  startedAt: string;
  completedAt?: string;
  suggestion?: WebsiteStyleSuggestion;
  errorCode?: WebsiteStyleErrorCode;
  error?: string;
};
export type WorkshopOnboarding = {
  step: "welcome" | "style" | "sources" | "complete";
  outcome?: WorkshopOutcome;
  mapOrientationDismissed: boolean;
  outputsOrientationDismissed: boolean;
  styleAnalysis?: WebsiteStyleAnalysis;
  completedAt?: string;
};
export type WorkshopDesignArtifact = { version: number; styleVersion: number; markdownPath: string; tokensPath: string; stale: boolean; createdAt: string };
export type ManualStyleInput = { name?: string; accent?: string; ink?: string; paper?: string; headingFont?: string; bodyFont?: string; fontsConfirmed?: boolean; selectedAssetUrls?: string[]; logos?: string[]; licensedFonts?: string[]; references?: string[]; negativeRules?: string[]; intentProfile?: WorkshopStyle["intentProfile"] };
export type WebsiteStyleSuggestion = { referenceUrl: string; name: string; accent: string; ink: string; paper: string; paletteRoles: StylePaletteRoles; logos: string[]; assetCandidates: Array<{ url: string; kind: "logo" }>; fontCandidates: string[]; typographyCandidates: Array<{ family: string; availability: "unverified"; source: "website" }>; references: string[]; negativeRules: string[]; findings: { colors: number; fontCandidates: number; assets: number; stylesheets: number } };
export type WorkshopVisualDna = { version: number; styleVersion: number; palette: { accent: string; ink: string; paper: string }; compositionRules: string[]; textureRules: string[]; imageRules: string[]; negativeRules: string[]; approved: boolean; stale: boolean; createdAt: string };
export type WorkshopEvidenceReference = { claimId?: string; sourceId: string; chunkId?: string; locator: string };
export type WorkshopAssetPlan = { version: number; graphRevision: number; briefVersion: number; styleVersion: number; visualDnaVersion?: number; evidenceClaimIds: string[]; items: { id: string; outputType: "deck" | "infographic" | "images" | "storyboard" | "video"; title: string; prompt: string; locator: string; evidence: WorkshopEvidenceReference[] }[]; stale: boolean; createdAt: string };
export type StoryboardPanel = { id: string; title: string; narration: string; durationSeconds: number; claimIds: string[]; evidence: WorkshopEvidenceReference[]; imagePanelId?: string; imagePanelVersion?: number; imageRelativePath?: string; imageSha256?: string; approved: boolean; stale: boolean };
export type WorkshopStoryboard = { version: number; panels: StoryboardPanel[]; stale: boolean; approved: boolean };
export type ImageBatchPanel = {
  id: string;
  version: number;
  basePrompt?: string;
  prompt: string;
  revisionRequest?: string;
  evidence: WorkshopEvidenceReference[];
  state: "planned" | "selected_for_regeneration" | "generated" | "failed";
  referenceId: string;
  relativePath?: string;
  sha256?: string;
  provenance?: { model: "gpt-image-2"; size: string; quality: "low" | "medium" | "high"; referenceId: string; requestId?: string; generatedAt: string };
  history?: ImagePanelVersion[];
  error?: string;
};
export type ImagePanelVersion = { version: number; prompt: string; revisionRequest?: string; evidence: WorkshopEvidenceReference[]; relativePath: string; sha256: string; provenance: NonNullable<ImageBatchPanel["provenance"]> };
export type ImageCoherenceContract = { visualDnaVersion?: number; palette: { accent: string; ink: string; paper: string }; compositionRules: string[]; textureRules: string[]; imageRules: string[]; negativeRules: string[]; siblingPanelIds: string[] };
export type WorkshopImageBatch = { id: string; graphRevision: number; briefVersion: number; styleVersion: number; referenceId: string; referencePath: string; referenceSha256: string; coherence: ImageCoherenceContract; panels: ImageBatchPanel[]; stale: boolean; createdAt: string };
export type WorkshopNarrationPanel = { panelId: string; relativePath: string; sha256: string; model: "gpt-4o-mini-tts"; voice: "cedar" | "marin"; instructions: string; requestId?: string; generatedAt: string };
export type WorkshopNarrationFailure = { panelId: string; error: string; failedAt: string };
export type WorkshopNarration = { storyboardVersion: number; disclosure: "AI-generated voice"; panels: WorkshopNarrationPanel[]; failures?: WorkshopNarrationFailure[]; stale: boolean; createdAt: string };
export type WorkshopAudioOverviewSection = { id: string; title: string; text: string; evidence: WorkshopEvidenceReference[]; edited: boolean };
export type WorkshopAudioOverview = { id: string; version: number; graphRevision: number; briefVersion: number; styleVersion: number; title: string; posture: "executive" | "overview" | "decision_review"; sections: WorkshopAudioOverviewSection[]; script: string; claimIds: string[]; status: "script_ready" | "audio_ready" | "failed"; disclosure: "AI-generated voice"; stale: boolean; audio?: { relativePath: string; sha256: string; byteCount: number; durationSeconds: number; model: "gpt-4o-mini-tts"; voice: "cedar" | "marin"; instructions: string; requestId?: string; generatedAt: string }; error?: string; createdAt: string; updatedAt: string };
export type WorkshopAiRun = { id: string; operation: "grounded_graph"; model: "gpt-5.6-sol" | "gpt-5.6-terra" | "gpt-5.6-luna"; inputClaimIds: string[]; outputSha256: string; requestId?: string; createdAt: string };
export type GroundedMapProposal = { nodes: { id: string; title: string; body: string; evidenceState: "grounded" | "derived" | "direction"; evidenceClaimIds: string[]; x: number; y: number }[]; edges: WorkshopMapEdge[] };
export type WorkshopOutput = { id: string; type: "deck" | "infographic"; relativePath: string; editableRelativePath?: string; artifactPath: string; editableArtifactPath?: string; claimIds: string[]; imageBatchId?: string; imagePanels?: Array<{ id: string; version: number; sha256: string }>; stale: boolean; createdAt: string };
export type WorkshopBuildTraceRecord = { htmlPath: string; dataPath: string; htmlSha256: string; dataSha256: string; milestoneCount: number; commitCount: number; taskIds: string[] };
export type WorkshopVideo = { id: string; version: number; storyboardVersion: number; styleVersion: number; visualDnaVersion?: number; imageBatchId?: string; relativePath: string; provenancePath: string; artifactPath: string; sha256: string; byteCount: number; claimIds: string[]; buildTrace: WorkshopBuildTraceRecord; stale: boolean; createdAt: string };
export type RenderedVideoInput = Omit<WorkshopVideo, "id" | "version" | "stale" | "createdAt">;
export type WorkshopVideoRecovery = { outcome: "failed" | "cancelled"; message: string; attempts: number; updatedAt: string };
export type WorkshopOutputRecovery = { message: string; attempts: number; updatedAt: string };
export type WorkshopState = { id: string; title: string; onboarding: WorkshopOnboarding; briefApproved: boolean; storyboardApproved: boolean; videoState: "blocked" | "queued" | "rendering" | "rendered" | "failed" | "cancelled"; videoRecovery?: WorkshopVideoRecovery; outputRecovery?: Partial<Record<"deck" | "infographic", WorkshopOutputRecovery>>; sources: number; groundedClaims: number; transcriptSegments: WorkshopTranscriptSegment[]; conversationTurns: WorkshopConversationTurn[]; toolCalls: WorkshopToolInvocation[]; conversationContinuation?: WorkshopConversationContinuation; firstTranscriptAt?: string; firstRenderedOutputAt?: string; sourceItems: WorkshopSource[]; activeSourceIds: string[]; sourceChunks: WorkshopChunk[]; claims: WorkshopClaim[]; candidates: WorkshopCandidate[]; mapNodes: WorkshopMapNode[]; mapEdges: WorkshopMapEdge[]; mapInputClaimIds: string[]; frame?: WorkshopFrame; sketch?: WorkshopSketch; sketchHistory: WorkshopSketch[]; style?: WorkshopStyle; designArtifact?: WorkshopDesignArtifact; visualDna?: WorkshopVisualDna; assetPlan?: WorkshopAssetPlan; storyboard: WorkshopStoryboard; storyboardHistory: WorkshopStoryboard[]; imageBatch?: WorkshopImageBatch; narration?: WorkshopNarration; audioOverviews: WorkshopAudioOverview[]; aiRuns: WorkshopAiRun[]; outputs: WorkshopOutput[]; videos: WorkshopVideo[]; graphState?: string; updatedAt: string };
export type WorkshopSummary = { id: string; title: string; sources: number; outputs: number; updatedAt: string; active: boolean };
export type SourceIngestion = { title: string; origin: string; type?: WorkshopSource["type"]; text: string; permission?: WorkshopSource["permission"] };
const execFile = promisify(execFileCallback);
const defaultWorkshopId = "workshop-build-week";
const defaultWorkshopTitle = "WorkshopLM Build Week";
const activeWorkshopSetting = "active_workshop_id";
export function workshopGeneratedPath(workshopId: string, ...parts: string[]) { return join("generated", ...(workshopId === defaultWorkshopId ? [] : [workshopId]), ...parts); }
const seedChunks: WorkshopChunk[] = [
  { id: "chunk-seed-raw", sourceId: "source-raw", text: "The judge should see the messy original thought become a cited Map, a real Brief, and finished work without losing the trail back to source material.", locator: "ChatGPT task · 12:41 · chunk 04", ordinal: 1 },
  { id: "chunk-seed-brief", sourceId: "source-brief", text: "One visible chain links Capture, the editable Map, approved work, Storyboard review, and created work.", locator: "Build notes · §2", ordinal: 1 },
  { id: "chunk-seed-design", sourceId: "source-design", text: "Evidence first becomes an editable knowledge system, not a static report.", locator: "Design · Map", ordinal: 1 },
];
const seedClaims: WorkshopClaim[] = [
  { id: "claim-seed-raw-outcome", sourceId: "source-raw", chunkId: "chunk-seed-raw", text: "Raw thinking becomes finished work.", evidenceState: "verified", locator: "ChatGPT task · 12:41 · chunk 04" },
  { id: "claim-seed-raw-trace", sourceId: "source-raw", chunkId: "chunk-seed-raw", text: "The source trail remains attached.", evidenceState: "verified", locator: "ChatGPT task · 12:41 · chunk 04" },
  { id: "claim-seed-brief-chain", sourceId: "source-brief", chunkId: "chunk-seed-brief", text: "One visible chain connects Capture to created work.", evidenceState: "verified", locator: "Build notes · §2" },
  { id: "claim-seed-brief-review", sourceId: "source-brief", chunkId: "chunk-seed-brief", text: "The Map and Storyboard remain reviewable before creation.", evidenceState: "verified", locator: "Build notes · §2" },
  { id: "claim-seed-design-system", sourceId: "source-design", chunkId: "chunk-seed-design", text: "Evidence becomes an editable knowledge system.", evidenceState: "verified", locator: "Design · Map" },
];
const emptyStoryboard = (): WorkshopStoryboard => ({ version: 0, stale: false, approved: false, panels: [] });
const defaultState = (id = defaultWorkshopId, title = defaultWorkshopTitle, seeded = false): WorkshopState => ({ id, title, onboarding: { step: seeded ? "complete" : "welcome", outcome: seeded ? "client_facing_pitch" : undefined, mapOrientationDismissed: seeded, outputsOrientationDismissed: seeded, completedAt: seeded ? new Date().toISOString() : undefined }, briefApproved: false, storyboardApproved: false, videoState: "blocked", sources: seeded ? 3 : 0, groundedClaims: seeded ? 5 : 0, sourceItems: seeded ? [
  { id: "source-raw", type: "TXT", title: "Raw voice brainstorm", origin: "ChatGPT task", claimCount: 5, excerpt: "The judge should be able to see the messy original thought become a cited map, a real brief, and a finished piece of work.", locator: "ChatGPT task · 12:41 · chunk 04", permission: "sanitized" },
  { id: "source-brief", type: "PDF", title: "Build Week brief", origin: "Local", claimCount: 3, excerpt: "One visible chain links Capture, approved work, and created work.", locator: "Build notes · §2", permission: "sanitized" },
  { id: "source-design", type: "WEB", title: "WorkshopLM direction", origin: "Local", claimCount: 2, excerpt: "Evidence first becomes an editable knowledge system, not a static report.", locator: "Design · Map", permission: "sanitized" },
] : [], activeSourceIds: seeded ? ["source-raw", "source-brief", "source-design"] : [], transcriptSegments: [], conversationTurns: [], toolCalls: [], sourceChunks: seeded ? seedChunks : [], claims: seeded ? seedClaims : [], candidates: [], mapEdges: seeded ? [
  { id: "edge-promise-proof", from: "promise", to: "proof", kind: "supports" },
  { id: "edge-proof-risk", from: "proof", to: "risk", kind: "depends_on" },
  { id: "edge-risk-visual", from: "risk", to: "visual", kind: "depends_on" },
] : [], mapInputClaimIds: seeded ? seedClaims.map((claim) => claim.id) : [], storyboard: seeded ? { version: 1, stale: false, approved: false, panels: [{ id: "panel-1", title: "Raw thought", narration: "Start with the messy original thinking.", durationSeconds: 3, claimIds: [], evidence: [{ sourceId: "source-raw", locator: "ChatGPT task · 12:41 · chunk 04" }], approved: true, stale: false }, { id: "panel-2", title: "Cited Map", narration: "Show the editable Map and evidence locators.", durationSeconds: 5, claimIds: [], evidence: [{ sourceId: "source-brief", locator: "Build notes · §2" }], approved: true, stale: false }, { id: "panel-3", title: "Finished work", narration: "End with source-traceable created work.", durationSeconds: 4, claimIds: [], evidence: [{ sourceId: "source-design", locator: "Design · Map" }], approved: true, stale: false }] } : emptyStoryboard(), storyboardHistory: [], sketchHistory: [], audioOverviews: [], aiRuns: [], outputs: [], videos: [], mapNodes: seeded ? [
  { id: "promise", title: "The product promise", body: "Turn raw thinking into finished work without losing the trail back to source material.", kind: "grounded", locator: "Meeting · 12:41", sourceId: "source-raw", x: 11, y: 12, width: 24, height: 18 },
  { id: "proof", title: "Judge proof", body: "Show one continuous capture → map → brief → storyboard → rendered video seam.", kind: "grounded", locator: "Build notes · §2", sourceId: "source-brief", x: 48, y: 36, width: 24, height: 18 },
  { id: "visual", title: "Visual behavior", body: "Evidence first becomes an editable knowledge system, not a static report.", kind: "creative", locator: "Design · Map", sourceId: "source-design", x: 39, y: 58, width: 24, height: 18 },
  { id: "risk", title: "Voice stays available", body: "Keep spoken thinking in the same grounded Workshop even when the host cannot retain the turn.", kind: "derived", locator: "Goal · capture", x: 74, y: 58, width: 24, height: 18 },
] : [], updatedAt: new Date().toISOString() });
const repositoryDataRoot = () => resolve(process.env.WORKSHOPLM_DATA_ROOT ?? join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", ".workshoplm"));
export const workshopDataRoot = repositoryDataRoot;
function dbFor(root = repositoryDataRoot()) { const db = openLocalDatabase(join(root, "data", "workshoplm.sqlite")); migrate(db); return db; }
export function resetSeededFixture(root?: string): WorkshopState {
  if (process.env.WORKSHOPLM_SEEDED_FIXTURE !== "1") throw new Error("Fixture reset is unavailable outside seeded test runs.");
  const db = dbFor(root);
  const state = defaultState(defaultWorkshopId, defaultWorkshopTitle, true);
  db.exec("BEGIN IMMEDIATE;");
  try {
    db.exec("DELETE FROM evidence_fts; DELETE FROM artifact; DELETE FROM job; DELETE FROM workshop_state; DELETE FROM style_library; DELETE FROM app_setting; DELETE FROM workshop;");
    db.prepare("INSERT INTO workshop VALUES (?, ?, ?)").run(state.id, state.title, state.updatedAt);
    db.prepare("INSERT INTO workshop_state VALUES (?, ?, ?)").run(state.id, JSON.stringify(state), state.updatedAt);
    db.prepare("INSERT INTO app_setting (key, value) VALUES (?, ?)").run(activeWorkshopSetting, state.id);
    db.exec("COMMIT;");
  } catch (error) {
    db.exec("ROLLBACK;");
    throw error;
  }
  syncEvidenceIndex(db, state);
  return state;
}
function normalizeStoryboard(storyboard: WorkshopStoryboard | undefined, fallback: WorkshopStoryboard, approved = false): WorkshopStoryboard {
  const value = storyboard ?? fallback;
  return { ...value, approved: value.approved ?? approved, panels: value.panels.map((panel) => { const evidence = panel.evidence ?? []; return { ...panel, evidence, claimIds: panel.claimIds ?? evidence.flatMap((reference) => reference.claimId ? [reference.claimId] : []) }; }) };
}
function paletteRoles(accent: string, ink: string, paper: string, source: StyleEvidenceSource): StylePaletteRoles {
  return { accent: { value: accent, source }, text: { value: ink, source }, background: { value: paper, source } };
}
function isSystemFont(family: string) { return /^(system-ui|-apple-system|blinkmacsystemfont|arial|helvetica|sans-serif|serif|monospace)$/i.test(family.trim()); }
function typographyRoles(heading: string, body: string, availability: FontAvailability, source: StyleEvidenceSource): StyleTypographyRoles {
  const role = (family: string) => ({ family, availability: isSystemFont(family) ? "system" as const : availability, source });
  return { heading: role(heading), body: role(body) };
}
function normalizeStyleMetadata<T extends Pick<WorkshopStyle, "accent" | "ink" | "paper" | "source" | "licensedFonts"> & Partial<Pick<WorkshopStyle, "paletteRoles" | "typographyRoles" | "brandAssets">>>(style: T): T & Pick<WorkshopStyle, "paletteRoles" | "typographyRoles" | "brandAssets"> {
  const source: StyleEvidenceSource = style.source;
  const families = style.licensedFonts ?? [];
  return {
    ...style,
    paletteRoles: style.paletteRoles ?? paletteRoles(style.accent, style.ink, style.paper, source),
    typographyRoles: style.typographyRoles ?? typographyRoles(families[0] ?? "system-ui", families[1] ?? families[0] ?? "system-ui", families.length ? "user_confirmed" : "system", source),
    brandAssets: style.brandAssets ?? [],
  };
}
function withSeedEvidence(state: WorkshopState): WorkshopState {
  const hasSeedSources = ["source-raw", "source-brief", "source-design"].every((sourceId) => state.sourceItems.some((source) => source.id === sourceId));
  if (!hasSeedSources || state.sourceChunks.length || state.claims.length) return state;
  return { ...state, sourceChunks: seedChunks, claims: seedClaims, groundedClaims: seedClaims.length };
}
function slugifyWorkshop(title: string) { return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "untitled"; }
function ensureDefaultWorkshop(db: ReturnType<typeof dbFor>) {
  const createdAt = new Date().toISOString();
  db.prepare("INSERT OR IGNORE INTO workshop VALUES (?, ?, ?)").run(defaultWorkshopId, defaultWorkshopTitle, createdAt);
  const row = db.prepare("SELECT 1 AS found FROM workshop_state WHERE workshop_id=?").get(defaultWorkshopId) as { found: number } | undefined;
  if (!row) {
    const state = defaultState(defaultWorkshopId, defaultWorkshopTitle, process.env.WORKSHOPLM_SEEDED_FIXTURE === "1");
    db.prepare("INSERT INTO workshop_state VALUES (?, ?, ?)").run(state.id, JSON.stringify(state), state.updatedAt);
    syncEvidenceIndex(db, state);
  }
  db.prepare("INSERT OR IGNORE INTO app_setting (key, value) VALUES (?, ?)").run(activeWorkshopSetting, defaultWorkshopId);
}
function activeWorkshopId(db: ReturnType<typeof dbFor>) {
  ensureDefaultWorkshop(db);
  const row = db.prepare("SELECT value FROM app_setting WHERE key=?").get(activeWorkshopSetting) as { value: string } | undefined;
  const found = row && db.prepare("SELECT 1 AS found FROM workshop_state WHERE workshop_id=?").get(row.value);
  if (row && found) return row.value;
  db.prepare("INSERT INTO app_setting (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(activeWorkshopSetting, defaultWorkshopId);
  return defaultWorkshopId;
}
export function listWorkshopSummaries(root?: string): WorkshopSummary[] {
  const db = dbFor(root); const activeId = activeWorkshopId(db);
  return (db.prepare("SELECT state_json FROM workshop_state ORDER BY updated_at DESC, workshop_id ASC").all() as Array<{ state_json: string }>).map(({ state_json }) => {
    const state = JSON.parse(state_json) as WorkshopState;
    const outputFamilies = new Set(state.outputs?.map((output) => output.type) ?? []).size
      + (state.sketch ? 1 : 0)
      + (state.audioOverviews?.length ? 1 : 0)
      + (state.imageBatch ? 1 : 0)
      + (state.storyboard?.panels?.length ? 1 : 0)
      + (state.videos?.length ? 1 : 0);
    return { id: state.id, title: state.title, sources: state.sources ?? state.sourceItems?.length ?? 0, outputs: outputFamilies, updatedAt: state.updatedAt, active: state.id === activeId };
  });
}
export function createWorkshop(title: string, root?: string): WorkshopState {
  const cleanTitle = title.trim();
  if (!cleanTitle) throw new Error("Workshop creation requires a name.");
  const db = dbFor(root); ensureDefaultWorkshop(db);
  const base = `workshop-${slugifyWorkshop(cleanTitle)}`;
  let workshopId = base; let suffix = 2;
  while (db.prepare("SELECT 1 AS found FROM workshop WHERE id=?").get(workshopId)) workshopId = `${base}-${suffix++}`;
  const state = defaultState(workshopId, cleanTitle, false);
  db.prepare("INSERT INTO workshop VALUES (?, ?, ?)").run(state.id, state.title, state.updatedAt);
  db.prepare("INSERT INTO workshop_state VALUES (?, ?, ?)").run(state.id, JSON.stringify(state), state.updatedAt);
  db.prepare("INSERT INTO app_setting (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(activeWorkshopSetting, state.id);
  syncEvidenceIndex(db, state);
  return state;
}
function onboardingOutcome(value: unknown): WorkshopOutcome {
  if (value === "client_facing_pitch" || value === "board_deck" || value === "internal_workshop") return value;
  throw new Error("Choose Client pitch, Board presentation, or Team workshop.");
}
export function updateWorkshopOnboarding(input: { title?: string; outcome?: WorkshopOutcome; step?: WorkshopOnboarding["step"] }, root?: string): WorkshopState {
  const current = readWorkshopState(root);
  const title = input.title === undefined ? current.title : input.title.trim();
  if (!title) throw new Error("Workshop name is required.");
  const outcome = input.outcome === undefined ? current.onboarding.outcome : onboardingOutcome(input.outcome);
  const step = input.step ?? current.onboarding.step;
  if (!(["welcome", "style", "sources", "complete"] as const).includes(step)) throw new Error("Invalid onboarding step.");
  if (step !== "welcome" && !outcome) throw new Error("Choose what you are making before continuing.");
  if (step === "complete" && current.sourceItems.length === 0) throw new Error("Add at least one source before building the Map.");
  const updatedAt = new Date().toISOString();
  return write({
    ...current,
    title,
    onboarding: {
      ...current.onboarding,
      outcome,
      step,
      completedAt: step === "complete" ? current.onboarding.completedAt ?? updatedAt : current.onboarding.completedAt,
    },
    updatedAt,
  }, root);
}
export function beginWebsiteStyleAnalysis(rawUrl: string, root?: string): WorkshopState {
  const current = readWorkshopState(root);
  const url = reviewedWebsiteUrl(rawUrl);
  const startedAt = new Date().toISOString();
  return write({ ...current, onboarding: { ...current.onboarding, styleAnalysis: { status: "reviewing", url, startedAt } }, updatedAt: startedAt }, root);
}
function websiteStyleFailure(error: unknown): { errorCode: WebsiteStyleErrorCode; error: string } {
  const message = error instanceof Error ? error.message : "";
  if (/valid HTTP\(S\)|valid HTTP/i.test(message)) return { errorCode: "invalid_url", error: "Enter a complete public website address, such as https://company.com." };
  if (/private network|local network|localhost/i.test(message)) return { errorCode: "private_network", error: "WorkshopLM cannot review private or local-network websites. Set the Style manually or use a clean default." };
  if (/redirected too many times|without a destination/i.test(message)) return { errorCode: "redirect", error: "This website redirected too many times to review safely. Try another public page or set the Style manually." };
  if (/blocked automatic review|HTTP 401|HTTP 403/i.test(message)) return { errorCode: "blocked", error: "This website blocked automatic review. Try another public page or set the Style manually." };
  if (/JavaScript app shell/i.test(message)) return { errorCode: "dynamic_site", error: "This website loads its visual system with JavaScript, so WorkshopLM could not review it safely. Set the Style manually or use a clean default." };
  if (/no usable public visual style/i.test(message)) return { errorCode: "no_useful_findings", error: "WorkshopLM could not find usable public colors, type, or brand assets on this page. Set the Style manually or use a clean default." };
  return { errorCode: "scan_failed", error: "WorkshopLM could not review this website. Try again, set the Style manually, or use a clean default." };
}
function finishWebsiteStyleAnalysis(rawUrl: string, result: { suggestion: WebsiteStyleSuggestion } | { errorCode: WebsiteStyleErrorCode; error: string }, root?: string) {
  const current = readWorkshopState(root);
  const url = reviewedWebsiteUrl(rawUrl);
  if (current.onboarding.styleAnalysis?.url !== url) return current;
  const completedAt = new Date().toISOString();
  const styleAnalysis: WebsiteStyleAnalysis = "suggestion" in result
    ? { ...current.onboarding.styleAnalysis, status: "ready", suggestion: result.suggestion, completedAt }
    : { ...current.onboarding.styleAnalysis, status: "error", errorCode: result.errorCode, error: result.error, completedAt };
  return write({ ...current, onboarding: { ...current.onboarding, styleAnalysis }, updatedAt: completedAt }, root);
}
export async function runWebsiteStyleAnalysis(rawUrl: string, root?: string, fetchImpl: typeof fetch = fetch): Promise<WorkshopState> {
  try {
    const suggestion = await analyzeWebsiteStyle(rawUrl, fetchImpl);
    return finishWebsiteStyleAnalysis(rawUrl, { suggestion }, root);
  } catch (error) {
    return finishWebsiteStyleAnalysis(rawUrl, websiteStyleFailure(error), root);
  }
}
export function dismissWorkshopOrientation(kind: "map" | "outputs", root?: string): WorkshopState {
  const current = readWorkshopState(root);
  const updatedAt = new Date().toISOString();
  return write({
    ...current,
    onboarding: {
      ...current.onboarding,
      mapOrientationDismissed: kind === "map" ? true : current.onboarding.mapOrientationDismissed,
      outputsOrientationDismissed: kind === "outputs" ? true : current.onboarding.outputsOrientationDismissed,
    },
    updatedAt,
  }, root);
}
export function selectWorkshop(workshopId: string, root?: string): WorkshopState {
  const db = dbFor(root); ensureDefaultWorkshop(db);
  if (!db.prepare("SELECT 1 AS found FROM workshop_state WHERE workshop_id=?").get(workshopId)) throw new Error(`Workshop not found: ${workshopId}.`);
  db.prepare("INSERT INTO app_setting (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(activeWorkshopSetting, workshopId);
  return readWorkshopState(root, workshopId);
}
export function listStyleLibrary(root?: string): WorkshopStyleLibraryEntry[] {
  const db = dbFor(root);
  const entries = (db.prepare("SELECT id, style_json, created_at, updated_at FROM style_library ORDER BY updated_at DESC, id ASC").all() as Array<{ id: string; style_json: string; created_at: string; updated_at: string }>).map((row) => {
    const stored = JSON.parse(row.style_json) as Omit<WorkshopStyleLibraryEntry, "id" | "createdAt" | "updatedAt"> & { familyId?: string; revision?: number };
    return { ...normalizeStyleMetadata(stored), id: row.id, familyId: stored.familyId ?? row.id, revision: stored.revision ?? 1, createdAt: row.created_at, updatedAt: row.updated_at };
  });
  const latest = new Map<string, WorkshopStyleLibraryEntry>();
  for (const entry of entries) if (!latest.has(entry.familyId) || entry.revision > latest.get(entry.familyId)!.revision) latest.set(entry.familyId, entry);
  return [...latest.values()].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt) || left.id.localeCompare(right.id));
}
export function readWorkshopState(root?: string, requestedWorkshopId?: string): WorkshopState {
  const db = dbFor(root);
  ensureDefaultWorkshop(db);
  const workshopId = requestedWorkshopId ?? activeWorkshopId(db);
  const row = db.prepare("SELECT state_json FROM workshop_state WHERE workshop_id=?").get(workshopId) as { state_json: string } | undefined;
  if (!row) throw new Error(`Workshop not found: ${workshopId}.`);
  if (row) {
    const state = JSON.parse(row.state_json) as Partial<WorkshopState>;
    const fallback = defaultState(workshopId, state.title ?? (workshopId === defaultWorkshopId ? defaultWorkshopTitle : "Untitled Workshop"), workshopId === defaultWorkshopId && Boolean(state.sourceItems?.length));
    if (state.sourceItems && state.mapNodes && state.sourceChunks && state.claims) {
      const normalized = withSeedEvidence({ ...fallback, ...state, id: workshopId, onboarding: state.onboarding ?? fallback.onboarding, sourceItems: state.sourceItems.map((source) => ({ ...source, permission: source.permission ?? "sanitized" })), activeSourceIds: state.activeSourceIds ?? state.sourceItems.map((source) => source.id), transcriptSegments: state.transcriptSegments?.map((segment) => ({ ...segment, transport: segment.transport ?? "fixture" })) ?? [], conversationTurns: state.conversationTurns ?? [], toolCalls: state.toolCalls?.map((call) => WorkshopToolCall.parse(call)) ?? [], candidates: state.candidates ?? [], mapEdges: state.mapEdges ?? [], mapNodes: state.mapNodes.map((node) => ({ ...node, width: node.width ?? 24, height: node.height ?? 18 })), sketchHistory: state.sketchHistory ?? [], style: state.style ? normalizeStyleMetadata({ ...state.style, logos: state.style.logos ?? [], licensedFonts: state.style.licensedFonts ?? [], references: state.style.references ?? [], negativeRules: state.style.negativeRules ?? [], intentProfile: state.style.intentProfile ?? "client_facing_pitch" }) : undefined, storyboard: normalizeStoryboard(state.storyboard, fallback.storyboard, Boolean(state.storyboardApproved)), storyboardHistory: (state.storyboardHistory ?? []).map((item) => normalizeStoryboard(item, emptyStoryboard())), audioOverviews: state.audioOverviews ?? [], aiRuns: state.aiRuns ?? [], outputs: state.outputs ?? [], videos: state.videos ?? [] } as WorkshopState);
      if (normalized.sourceChunks !== state.sourceChunks) return write(normalized, root);
      ensureEvidenceIndex(db, normalized);
      return normalized;
    }
    if (state.sourceItems && state.mapNodes) return write(withSeedEvidence({ ...fallback, ...state, id: workshopId, activeSourceIds: state.sourceItems.map((source) => source.id), transcriptSegments: [], conversationTurns: [], toolCalls: [], sourceChunks: [], claims: [], candidates: [], mapEdges: [], mapNodes: state.mapNodes.map((node) => ({ ...node, width: node.width ?? 24, height: node.height ?? 18 })), sketchHistory: state.sketchHistory ?? [], storyboard: fallback.storyboard, storyboardHistory: state.storyboardHistory ?? [], audioOverviews: state.audioOverviews ?? [], aiRuns: state.aiRuns ?? [], outputs: [], videos: state.videos ?? [] } as WorkshopState), root);
    return write({ ...fallback, ...state, id: workshopId } as WorkshopState, root);
  }
  throw new Error(`Workshop not found: ${workshopId}.`);
}
export function resolveWorkshopArtifact(id: string, root?: string, workshopId?: string, format?: "preview" | "editable"): { path: string; contentType: string; fileName?: string } | undefined {
  const state = readWorkshopState(root, workshopId); const dataRoot = root ?? repositoryDataRoot();
  if (id === "sketch" || id.startsWith("sketch-v")) {
    const sketch = id === "sketch" ? state.sketch : [state.sketch, ...state.sketchHistory].find((candidate) => candidate && id === `sketch-v${candidate.version}`);
    if (!sketch?.relativePath) return undefined;
    const path = resolve(dataRoot, sketch.relativePath);
    if (!path.startsWith(`${resolve(dataRoot)}/`)) return undefined;
    return { path, contentType: "image/svg+xml; charset=utf-8", fileName: format === "editable" ? `workshop-sketch-v${sketch.version}.svg` : undefined };
  }
  if (id === "video" || id.startsWith("video-v")) {
    const video = id === "video"
      ? [...state.videos].reverse().find((candidate) => !candidate.stale)
      : state.videos.find((candidate) => candidate.id === id);
    if (!video) return undefined;
    const path = resolve(dataRoot, video.relativePath);
    if (!path.startsWith(`${resolve(dataRoot)}/`)) return undefined;
    return { path, contentType: "video/mp4" };
  }
  if (id === "build-trace" || id.startsWith("build-trace-v")) {
    const video = id === "build-trace"
      ? [...state.videos].reverse().find((candidate) => !candidate.stale)
      : state.videos.find((candidate) => `build-trace-v${candidate.version}` === id);
    if (!video?.buildTrace) return undefined;
    const path = resolve(dataRoot, video.buildTrace.htmlPath);
    if (!path.startsWith(`${resolve(dataRoot)}/`)) return undefined;
    return { path, contentType: "text/html; charset=utf-8" };
  }
  if (id === "build-trace-data" || id.startsWith("build-trace-data-v")) {
    const video = id === "build-trace-data"
      ? [...state.videos].reverse().find((candidate) => !candidate.stale)
      : state.videos.find((candidate) => `build-trace-data-v${candidate.version}` === id);
    if (!video?.buildTrace) return undefined;
    const path = resolve(dataRoot, video.buildTrace.dataPath);
    if (!path.startsWith(`${resolve(dataRoot)}/`)) return undefined;
    return { path, contentType: "application/json; charset=utf-8", fileName: `workshoplm-build-trace-v${video.version}.json` };
  }
  const historicalImage = id.match(/^(image-panel-\d+)-v(\d+)$/);
  if (historicalImage) {
    const panel = state.imageBatch?.panels.find((candidate) => candidate.id === historicalImage[1]);
    const version = Number(historicalImage[2]);
    const item = panel?.version === version && panel.relativePath
      ? { relativePath: panel.relativePath }
      : panel?.history?.find((candidate) => candidate.version === version);
    if (!item?.relativePath) return undefined;
    const path = resolve(dataRoot, item.relativePath);
    if (!path.startsWith(`${resolve(dataRoot)}/`)) return undefined;
    return { path, contentType: "image/png" };
  }
  const image = state.imageBatch?.panels.find((panel) => panel.id === id && panel.relativePath);
  if (image?.relativePath) {
    const path = resolve(dataRoot, image.relativePath);
    if (!path.startsWith(`${resolve(dataRoot)}/`)) return undefined;
    return { path, contentType: "image/png" };
  }
  const audioOverview = state.audioOverviews.find((item) => item.id === id && item.audio?.relativePath);
  if (audioOverview?.audio) {
    const path = resolve(dataRoot, audioOverview.audio.relativePath);
    if (!path.startsWith(`${resolve(dataRoot)}/`)) return undefined;
    return { path, contentType: "audio/wav", fileName: `${audioOverview.id}.wav` };
  }
  const storyboardImage = id.match(/^storyboard-v(\d+)-panel-(\d+)-image$/);
  if (storyboardImage) {
    const version = Number(storyboardImage[1]); const panelIndex = Number(storyboardImage[2]) - 1;
    const storyboard = [state.storyboard, ...state.storyboardHistory].find((item) => item.version === version);
    const panel = storyboard?.panels[panelIndex];
    if (!panel?.imageRelativePath) return undefined;
    const path = resolve(dataRoot, panel.imageRelativePath);
    if (!path.startsWith(`${resolve(dataRoot)}/`)) return undefined;
    return { path, contentType: "image/png" };
  }
  const output = state.outputs.find((item) => item.id === id);
  if (!output) return undefined;
  const editable = format === "editable" && output.editableRelativePath;
  const path = resolve(dataRoot, editable || output.relativePath);
  if (!path.startsWith(`${dataRoot}/`)) return undefined;
  return editable
    ? { path, contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", fileName: output.type === "deck" ? `slides-v${output.id.match(/v(\d+)$/)?.[1] ?? "1"}.pptx` : `${output.id}.pptx` }
    : { path, contentType: "text/html; charset=utf-8" };
}
function syncEvidenceIndex(db: ReturnType<typeof dbFor>, state: WorkshopState) {
  const remove = db.prepare("DELETE FROM evidence_fts WHERE workshop_id=?");
  const insert = db.prepare("INSERT INTO evidence_fts (workshop_id, source_id, chunk_id, locator, chunk_text, claim_text) VALUES (?, ?, ?, ?, ?, ?)");
  db.exec("BEGIN IMMEDIATE");
  try {
    remove.run(state.id);
    for (const chunk of state.sourceChunks) {
      const claimText = state.claims.filter((claim) => claim.sourceId === chunk.sourceId && claim.chunkId === chunk.id).map((claim) => claim.text).join("\n");
      insert.run(state.id, chunk.sourceId, chunk.id, chunk.locator, chunk.text, claimText);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}
function ensureEvidenceIndex(db: ReturnType<typeof dbFor>, state: WorkshopState) {
  const row = db.prepare("SELECT count(*) AS count FROM evidence_fts WHERE workshop_id=?").get(state.id) as { count: number };
  if (row.count !== state.sourceChunks.length) syncEvidenceIndex(db, state);
}
function write(next: WorkshopState, root?: string) { const db = dbFor(root); const result = db.prepare("UPDATE workshop_state SET state_json=?, updated_at=? WHERE workshop_id=?").run(JSON.stringify(next), next.updatedAt, next.id); if (!result.changes) throw new Error(`Workshop not found: ${next.id}.`); db.prepare("UPDATE workshop SET title=? WHERE id=?").run(next.title, next.id); syncEvidenceIndex(db, next); return next; }
function staleVideos(state: WorkshopState): WorkshopVideo[] { return state.videos.map((video) => video.stale ? video : { ...video, stale: true }); }
function staleAudioOverviews(state: WorkshopState): WorkshopAudioOverview[] { return state.audioOverviews.map((overview) => overview.stale ? overview : { ...overview, stale: true }); }
function storyboardHistoryWithCurrent(state: WorkshopState): WorkshopStoryboard[] {
  if (!state.storyboard.version || !state.storyboard.panels.length || state.storyboardHistory.some((item) => item.version === state.storyboard.version)) return state.storyboardHistory;
  return [...state.storyboardHistory, state.storyboard];
}
function activeClaimsFor(state: WorkshopState) { return state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId)); }
function sameIds(left: string[], right: string[]) {
  if (left.length !== right.length) return false;
  const expected = new Set(right);
  return left.every((id) => expected.has(id));
}
export function mapNeedsUpdate(state: WorkshopState) {
  return !sameIds(state.mapInputClaimIds, activeClaimsFor(state).map((claim) => claim.id));
}
function mapDirectionClaim(claims: WorkshopClaim[]) {
  const score = (claim: WorkshopClaim) => {
    const text = prose(claim.text);
    let value = 0;
    if (/\b(should|must|recommend(?:ed)?|prioriti[sz]e|focus|start|begin|use|adopt|next)\b/i.test(text)) value += 20;
    if (/\b(?:team|teams|professionals?|users?)\s+(?:should|must)\b/i.test(text)) value += 8;
    if (/\b(client|leadership|professional|decision|outcome|goal|launch|pilot|create|present|approve)\b/i.test(text)) value += 8;
    if (/\b(goal|outcome|promise)\b/i.test(text)) value += 8;
    if (/\b(source|evidence|trace|grounded|style|brand|trust)\b/i.test(text)) value += 4;
    if (/\brecommended workflow\b|\bcapture\b.{0,24}\bmap\b.{0,24}\bbrief\b.{0,24}\bcreate\b/i.test(text)) value -= 30;
    if (/\?$/.test(text)) value -= 12;
    return value;
  };
  return [...claims].sort((left, right) => score(right) - score(left) || claims.indexOf(left) - claims.indexOf(right))[0]!;
}
function mapDirectionTitle(text: string) {
  const action = prose(text)
    .replace(/^(?:the\s+)?(?:team|teams|professionals?|users?)\s+(?:should|must)\s+/i, "")
    .replace(/^the goal is\s+/i, "Create ")
    .replace(/^create professional (?:knowledge )?work\b/i, "Create work");
  const title = mapNodeTitle(action || text);
  return title ? `${title[0]!.toUpperCase()}${title.slice(1)}` : mapNodeTitle(text);
}
function mapSynthesis(claims: WorkshopClaim[], direction: WorkshopClaim) {
  const score = (claim: WorkshopClaim) => {
    const text = prose(claim.text);
    let value = 0;
    if (/\b(need|needs|problem|friction|fragment(?:ed|ation)?|gap|risk|challenge|goal|outcome|lose|lost|hours)\b/i.test(text)) value += 20;
    if (/\b(source|evidence|trace|grounded|measure|report|adoption|proof|trust)\b/i.test(text)) value += 12;
    if (/\b(professional|client|leadership|team|decision|launch|pilot)\b/i.test(text)) value += 8;
    if (/\b(is|are|keeps?|makes?|creates?|turns?|confirms?|shows?|requires?)\b/i.test(text)) value += 4;
    if (/\brecommended workflow\b|\bcapture\b.{0,24}\bmap\b.{0,24}\bbrief\b.{0,24}\bcreate\b/i.test(text)) value -= 30;
    return value;
  };
  const selected = claims
    .filter((claim) => claim.id !== direction.id)
    .sort((left, right) => score(right) - score(left) || claims.indexOf(left) - claims.indexOf(right))
    .slice(0, 2);
  const evidence = selected.length ? selected : [direction];
  const body = evidence.map((claim) => {
    const text = prose(claim.text);
    return /[.!?]$/.test(text) ? text : `${text}.`;
  }).join(" ");
  const lead = prose(evidence[0]!.text)
    .replace(/^(?:our|the)\s+(?:leadership\s+)?team\s+(?:needs?|requires?)\s+(?:a|an|the)\s+/i, "")
    .replace(/^we\s+(?:need|require)\s+(?:a|an|the)\s+/i, "");
  const title = mapNodeTitle(lead);
  return { body, title: title ? `${title[0]!.toUpperCase()}${title.slice(1)}` : "Source synthesis" };
}
export function assertStoryboardGrounding(state: WorkshopState): void {
  for (const panel of state.storyboard.panels) {
    if (!panel.evidence.length) throw new Error(`Storyboard panel ${panel.id} requires a source reference.`);
    const evidenceClaimIds = [...new Set(panel.evidence.flatMap((reference) => reference.claimId ? [reference.claimId] : []))].sort();
    if ([...new Set(panel.claimIds)].sort().join("|") !== evidenceClaimIds.join("|")) throw new Error(`Storyboard panel ${panel.id} claim IDs do not match its source references.`);
    for (const reference of panel.evidence) {
      const source = state.sourceItems.find((candidate) => candidate.id === reference.sourceId);
      if (!source || !state.activeSourceIds.includes(source.id)) throw new Error(`Storyboard panel ${panel.id} references an unavailable source.`);
      if (reference.chunkId) {
        const chunk = state.sourceChunks.find((candidate) => candidate.id === reference.chunkId);
        if (!chunk || chunk.sourceId !== reference.sourceId) throw new Error(`Storyboard panel ${panel.id} has an invalid source chunk.`);
      }
      if (reference.claimId) {
        const claim = state.claims.find((candidate) => candidate.id === reference.claimId);
        if (!claim || claim.sourceId !== reference.sourceId || (reference.chunkId && claim.chunkId !== reference.chunkId)) throw new Error(`Storyboard panel ${panel.id} has an invalid grounded claim.`);
      }
    }
  }
}
function invalidateForSourceScope(state: WorkshopState, updatedAt: string): WorkshopState { return { ...state, frame: state.frame ? { ...state.frame, stale: true } : undefined, sketch: state.sketch ? { ...state.sketch, stale: true, approved: false } : undefined, assetPlan: state.assetPlan ? { ...state.assetPlan, stale: true } : undefined, imageBatch: state.imageBatch ? { ...state.imageBatch, stale: true } : undefined, narration: state.narration ? { ...state.narration, stale: true } : undefined, storyboard: { ...state.storyboard, stale: true, panels: state.storyboard.panels.map((panel) => ({ ...panel, stale: true })) }, audioOverviews: staleAudioOverviews(state), outputs: state.outputs.map((output) => ({ ...output, stale: true })), videos: staleVideos(state), briefApproved: false, storyboardApproved: false, videoState: "blocked", updatedAt }; }
export function setActiveSourceScope(sourceIds: string[], root?: string): WorkshopState {
  const current = readWorkshopState(root); const unique = [...new Set(sourceIds)];
  if (!unique.length) throw new Error("Keep at least one source active for grounding.");
  if (unique.some((sourceId) => !current.sourceItems.some((source) => source.id === sourceId))) throw new Error("Grounding scope includes an unknown source.");
  if (unique.length === current.activeSourceIds.length && unique.every((sourceId) => current.activeSourceIds.includes(sourceId))) return current;
  return write(invalidateForSourceScope({ ...current, activeSourceIds: unique }, new Date().toISOString()), root);
}
function graphFor(state: WorkshopState): ReturnType<typeof parseGraphState> {
  if (state.graphState) return parseGraphState(state.graphState);
  const graph = SemanticGraph.parse({ id: `graph-${state.id}`, workshopId: state.id, revision: 0, staleState: "current", nodes: state.mapNodes.map((node) => ({ id: `node-${node.id}`, kind: "claim", label: node.title, evidenceState: node.kind === "grounded" ? "verified" : node.kind, metadata: { body: node.body, locator: node.locator, sourceId: node.sourceId, x: node.x, y: node.y, width: node.width, height: node.height } })), edges: state.mapEdges.map((edge) => ({ ...edge, from: `node-${edge.from}`, to: `node-${edge.to}` })) });
  return { schemaVersion: 1, graph, history: { graphVersionId: graph.id, records: [] } };
}
function mapNodesFor(graph: SemanticGraphType, existing: WorkshopMapNode[]): WorkshopMapNode[] {
  return graph.nodes.map((node, index) => { const prior = existing.find((item) => `node-${item.id}` === node.id); const metadata = node.metadata as { body?: unknown; locator?: unknown; sourceId?: unknown; x?: unknown; y?: unknown; width?: unknown; height?: unknown }; return { id: node.id.replace(/^node-/, ""), title: node.label, body: typeof metadata.body === "string" ? metadata.body : prior?.body ?? node.label, kind: node.evidenceState === "verified" ? "grounded" : node.evidenceState === "unverified" ? "derived" : node.evidenceState, locator: typeof metadata.locator === "string" ? metadata.locator : prior?.locator ?? "Map operation", sourceId: typeof metadata.sourceId === "string" ? metadata.sourceId : prior?.sourceId, x: typeof metadata.x === "number" ? metadata.x : prior?.x ?? 16 + (index * 15) % 65, y: typeof metadata.y === "number" ? metadata.y : prior?.y ?? 18 + (index * 19) % 58, width: typeof metadata.width === "number" ? metadata.width : prior?.width ?? 24, height: typeof metadata.height === "number" ? metadata.height : prior?.height ?? 18 }; });
}
function mapEdgesFor(graph: SemanticGraphType): WorkshopMapEdge[] { return graph.edges.map((edge) => ({ ...edge, from: edge.from.replace(/^node-/, ""), to: edge.to.replace(/^node-/, "") })); }
function frameOutcomeScore(node: WorkshopMapNode) {
  const text = prose(`${node.title} ${node.body}`);
  let score = node.kind === "grounded" ? 2 : 0;
  if (roleSignals.statement.test(text)) score += 20;
  if (/\b(professional|client|leadership|deliverable|defend|outcome|promise)\b/i.test(text)) score += 6;
  if (roleSignals.split.test(text)) score -= 4;
  return score;
}
function frameDirectionScore(node: WorkshopMapNode) {
  const text = prose(`${node.title} ${node.body}`);
  let score = node.kind === "grounded" ? 2 : 0;
  if (/\b(goal|success|outcome)\b/i.test(text)) score += 30;
  if (/\b(should|must|recommend(?:ed)?|prioriti[sz]e|focus|start|show|keep|ensure|next)\b/i.test(text)) score += 20;
  if (/\b(?:team|teams|professionals?|users?)\s+(?:should|must)\b/i.test(text)) score += 8;
  if (/\b(professional|client|leadership|decision|defend|present|create)\b/i.test(text)) score += 7;
  if (/\b(source|trace|evidence|grounded|style|identity|brand)\b/i.test(text)) score += 4;
  return score;
}
function frameAudience(state: WorkshopState) {
  if (state.onboarding.outcome === "board_deck") return "Board members and senior leadership";
  if (state.onboarding.outcome === "internal_workshop") return "Internal collaborators and workshop participants";
  return "Clients and external decision-makers";
}
function frameFor(state: WorkshopState, approvedAt: string, root?: string): WorkshopFrame {
  const available = state.mapNodes.filter((node) => node.kind !== "creative");
  const grounded = available.filter((node) => node.kind === "grounded");
  const recommendedTarget = state.mapEdges.find((edge) => edge.label === "recommends")?.to;
  const explicitDirections = state.mapNodes.filter((node) => node.kind === "creative");
  const aiMapDirection = state.aiRuns.some((run) => run.operation === "grounded_graph")
    ? [...explicitDirections].sort((left, right) => frameDirectionScore(right) - frameDirectionScore(left) || explicitDirections.indexOf(left) - explicitDirections.indexOf(right))[0]
    : undefined;
  const explicitDirection = state.mapNodes.find((node) => node.id === recommendedTarget)
    ?? state.mapNodes.find((node) => node.id === "map-direction")
    ?? aiMapDirection;
  const repeatsExplicitDirection = (node: WorkshopMapNode) => node.id === explicitDirection?.id || prose(node.body) === prose(explicitDirection?.body ?? "");
  const groundedOutcomes = grounded.filter((node) => !repeatsExplicitDirection(node));
  const aiDerivedOutcomes = state.aiRuns.some((run) => run.operation === "grounded_graph")
    ? available.filter((node) => node.kind === "derived")
    : [];
  const outcomeCandidates = aiDerivedOutcomes.length ? [...aiDerivedOutcomes, ...groundedOutcomes] : groundedOutcomes;
  const outcomePool = outcomeCandidates.length ? outcomeCandidates : available.filter((node) => !repeatsExplicitDirection(node));
  const outcomeNode = [...outcomePool].sort((left, right) => frameOutcomeScore(right) - frameOutcomeScore(left) || outcomePool.indexOf(left) - outcomePool.indexOf(right))[0];
  const directionCandidates = grounded.filter((node) => node.id !== outcomeNode?.id);
  const directionNode = explicitDirection ?? [...(directionCandidates.length ? directionCandidates : available.filter((node) => node.id !== outcomeNode?.id))].sort((left, right) => frameDirectionScore(right) - frameDirectionScore(left) || available.indexOf(left) - available.indexOf(right))[0];
  const repeatsDirection = (node: WorkshopMapNode) => node.id === directionNode?.id || prose(node.body) === prose(directionNode?.body ?? "");
  const evidenceNodes = grounded.filter((node) => node.id !== outcomeNode?.id && !repeatsDirection(node)).slice(0, 3);
  for (const node of grounded) {
    if (evidenceNodes.length >= 3) break;
    if (node.id !== outcomeNode?.id && !repeatsDirection(node) && !evidenceNodes.some((candidate) => candidate.id === node.id)) evidenceNodes.push(node);
  }
  if (!evidenceNodes.length && outcomeNode) evidenceNodes.push(outcomeNode);
  const outcome = prose(outcomeNode?.body ?? outcomeNode?.title ?? "Turn raw thinking into professional knowledge work.");
  const audience = frameAudience(state);
  const direction = prose(directionNode?.body ?? "Use the strongest evidence to create professional knowledge work for the intended audience.");
  const evidence = evidenceNodes.map((node) => `- ${prose(node.body)} — ${node.locator}`).join("\n");
  const version = (state.frame?.version ?? 0) + 1; const markdown = `# FRAME.md\n\n## Outcome\n${outcome}\n\n## Audience\n${audience}\n\n## Direction\n${direction}\n\n## Evidence\n${evidence}\n`; const dataRoot = root ?? repositoryDataRoot(); const markdownPath = workshopGeneratedPath(state.id, `FRAME-v${version}.md`); const executablePath = workshopGeneratedPath(state.id, `FRAME-v${version}.json`); const generated = join(dataRoot, dirname(markdownPath));
  mkdirSync(generated, { recursive: true }); writeFileSync(join(dataRoot, markdownPath), markdown, "utf8"); writeFileSync(join(dataRoot, executablePath), `${JSON.stringify({ schemaVersion: 1, frameVersion: version, graphRevision: graphFor(state).graph.revision, outcome, audience, direction, evidence: evidenceNodes.map((node) => ({ nodeId: node.id, title: node.title, body: node.body, locator: node.locator, sourceId: node.sourceId })), productionProof: direction, approvedAt }, null, 2)}\n`, "utf8");
  return { version, approvedAt, stale: false, markdown, markdownPath, executablePath };
}
export function applyMapOperation(operation: unknown, root?: string): WorkshopState {
  const current = readWorkshopState(root); const snapshot = graphFor(current); const parsed = GraphOperation.parse(operation);
  const applied = appendGraphOperation(snapshot.graph, snapshot.history, parsed, { id: `operation-${Date.now()}`, actor: "user", createdAt: new Date().toISOString() });
  return write({ ...current, graphState: serializeGraphState(applied.graph, applied.history), mapNodes: mapNodesFor(applied.graph, current.mapNodes), mapEdges: mapEdgesFor(applied.graph), frame: current.frame ? { ...current.frame, stale: true } : undefined, sketch: current.sketch ? { ...current.sketch, stale: true, approved: false } : undefined, assetPlan: current.assetPlan ? { ...current.assetPlan, stale: true } : undefined, narration: current.narration ? { ...current.narration, stale: true } : undefined, storyboard: { ...current.storyboard, stale: true, panels: current.storyboard.panels.map((panel) => ({ ...panel, stale: true })) }, audioOverviews: staleAudioOverviews(current), outputs: current.outputs.map((output) => ({ ...output, stale: true })), videos: staleVideos(current), briefApproved: false, storyboardApproved: false, videoState: "blocked", updatedAt: new Date().toISOString() }, root);
}
export function undoMapOperation(root?: string): WorkshopState {
  const current = readWorkshopState(root); const snapshot = graphFor(current); const undone = undoLatestGraphOperation(snapshot.graph, snapshot.history);
  return write({ ...current, graphState: serializeGraphState(undone.graph, undone.history), mapNodes: mapNodesFor(undone.graph, current.mapNodes), mapEdges: mapEdgesFor(undone.graph), frame: current.frame ? { ...current.frame, stale: true } : undefined, sketch: current.sketch ? { ...current.sketch, stale: true, approved: false } : undefined, assetPlan: current.assetPlan ? { ...current.assetPlan, stale: true } : undefined, narration: current.narration ? { ...current.narration, stale: true } : undefined, storyboard: { ...current.storyboard, stale: true, panels: current.storyboard.panels.map((panel) => ({ ...panel, stale: true })) }, audioOverviews: staleAudioOverviews(current), outputs: current.outputs.map((output) => ({ ...output, stale: true })), videos: staleVideos(current), briefApproved: false, storyboardApproved: false, videoState: "blocked", updatedAt: new Date().toISOString() }, root);
}
export function syncMapCanvas(rawPatches: CanvasNodePatch[], root?: string): WorkshopState {
  const current = readWorkshopState(root); const snapshot = graphFor(current); let graph = snapshot.graph; let history = snapshot.history; let changed = false; let contentChanged = false;
  for (const rawPatch of rawPatches) {
    const patch = { id: rawPatch.id.replace(/^node-/, ""), title: rawPatch.title.replace(/\s+/g, " ").trim(), x: Math.round(rawPatch.x * 10) / 10, y: Math.round(rawPatch.y * 10) / 10, width: Math.round(rawPatch.width * 10) / 10, height: Math.round(rawPatch.height * 10) / 10 };
    if (!patch.id || !patch.title || !Number.isFinite(patch.x) || !Number.isFinite(patch.y) || !Number.isFinite(patch.width) || !Number.isFinite(patch.height) || patch.width < 8 || patch.height < 8) continue;
    const node = graph.nodes.find((item) => item.id === `node-${patch.id}`); if (!node || node.locked) continue;
    const previous = node.metadata as { x?: unknown; y?: unknown; width?: unknown; height?: unknown }; if (node.label === patch.title && previous.x === patch.x && previous.y === patch.y && previous.width === patch.width && previous.height === patch.height) continue;
    if (node.label !== patch.title) contentChanged = true;
    const applied = appendGraphOperation(graph, history, GraphOperation.parse({ type: "update_node", nodeId: node.id, patch: { label: patch.title, metadata: { ...node.metadata, x: patch.x, y: patch.y, width: patch.width, height: patch.height } } }), { id: `operation-canvas-${Date.now()}-${patch.id}`, actor: "user", createdAt: new Date().toISOString() }); graph = applied.graph; history = applied.history; changed = true;
  }
  if (!changed) return current;
  if (!contentChanged) return write({ ...current, graphState: serializeGraphState(graph, history), mapNodes: mapNodesFor(graph, current.mapNodes), mapEdges: mapEdgesFor(graph), updatedAt: new Date().toISOString() }, root);
  return write({ ...current, graphState: serializeGraphState(graph, history), mapNodes: mapNodesFor(graph, current.mapNodes), mapEdges: mapEdgesFor(graph), frame: current.frame ? { ...current.frame, stale: true } : undefined, sketch: current.sketch ? { ...current.sketch, stale: true, approved: false } : undefined, assetPlan: current.assetPlan ? { ...current.assetPlan, stale: true } : undefined, narration: current.narration ? { ...current.narration, stale: true } : undefined, storyboard: { ...current.storyboard, stale: true, panels: current.storyboard.panels.map((panel) => ({ ...panel, stale: true })) }, audioOverviews: staleAudioOverviews(current), outputs: current.outputs.map((output) => ({ ...output, stale: true })), videos: staleVideos(current), briefApproved: false, storyboardApproved: false, videoState: "blocked", updatedAt: new Date().toISOString() }, root);
}

export function repairBenignCanvasNormalization(root?: string): WorkshopState {
  const current = readWorkshopState(root);
  const snapshot = graphFor(current);
  const records = [...snapshot.history.records];
  const benign = [] as typeof records;
  const normalized = (value: unknown) => typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
  for (let index = records.length - 1; index >= 0; index -= 1) {
    const record = records[index];
    const operation = record.operation;
    const inverse = record.inverse[0];
    if (!record.id.startsWith("operation-canvas-") || operation.type !== "update_node" || inverse?.type !== "update_node") break;
    const operationMetadata = operation.patch.metadata;
    const inverseMetadata = inverse.patch.metadata;
    if (normalized(operation.patch.label) !== normalized(inverse.patch.label) || JSON.stringify(operationMetadata) !== JSON.stringify(inverseMetadata)) break;
    benign.unshift(record);
  }
  if (!benign.length) return current;
  const graph = structuredClone(snapshot.graph);
  for (const record of [...benign].reverse()) {
    const inverse = record.inverse[0];
    if (inverse?.type !== "update_node") continue;
    const index = graph.nodes.findIndex((node) => node.id === inverse.nodeId);
    if (index >= 0) graph.nodes[index] = { ...graph.nodes[index], ...inverse.patch };
  }
  graph.revision -= benign.length;
  const history = { ...snapshot.history, records: records.slice(0, -benign.length) };
  const dependenciesMatch = Boolean(
    current.frame
    && current.assetPlan
    && current.imageBatch
    && current.narration
    && current.assetPlan.graphRevision === graph.revision
    && current.imageBatch.graphRevision === graph.revision
    && current.assetPlan.briefVersion === current.frame.version
    && current.assetPlan.styleVersion === current.style?.version
    && current.storyboard.panels.length > 0
    && current.narration.storyboardVersion === current.storyboard.version
    && current.storyboard.panels.every((panel) => {
      const image = current.imageBatch?.panels.find((candidate) => candidate.id === panel.imagePanelId);
      return image?.version === panel.imagePanelVersion && image?.state === "generated";
    })
    && current.videos.every((video) => video.storyboardVersion === current.storyboard.version && video.styleVersion === current.style?.version && video.imageBatchId === current.imageBatch?.id),
  );
  if (!dependenciesMatch) throw new Error("Canvas normalization recovery refused because the finished-work dependencies no longer match.");
  return write({
    ...current,
    graphState: serializeGraphState(graph, history),
    mapNodes: mapNodesFor(graph, current.mapNodes),
    frame: current.frame ? { ...current.frame, stale: false } : undefined,
    assetPlan: current.assetPlan ? { ...current.assetPlan, stale: false } : undefined,
    storyboard: { ...current.storyboard, stale: false, panels: current.storyboard.panels.map((panel) => ({ ...panel, stale: false, approved: true })) },
    narration: current.narration ? { ...current.narration, stale: false } : undefined,
    outputs: current.outputs.map((output) => ({ ...output, stale: false })),
    videos: current.videos.map((video) => ({ ...video, stale: false })),
    briefApproved: true,
    storyboardApproved: true,
    videoState: current.videos.length ? "rendered" : current.videoState,
    updatedAt: new Date().toISOString(),
  }, root);
}
export function organizeGroundedMap(root?: string): WorkshopState {
  const current = readWorkshopState(root);
  const claims = activeClaimsFor(current);
  const evidenceClaimIds = claims.map((claim) => claim.id);
  if (!mapNeedsUpdate(current)) return current;
  const createdAt = new Date().toISOString();
  const snapshot = graphFor(current);
  const synthesisId = "node-map-synthesis";
  const directionId = "node-map-direction";
  let graph = snapshot.graph;
  let history = snapshot.history;
  const primary = mapDirectionClaim(claims);
  const directionTitle = mapDirectionTitle(primary.text);
  const synthesis = mapSynthesis(claims, primary);
  const append = (operation: Parameters<typeof appendGraphOperation>[2], id: string) => {
    const applied = appendGraphOperation(graph, history, operation, { id, actor: "assistant", createdAt });
    graph = applied.graph;
    history = applied.history;
  };
  const activeClaimIds = new Set<string>(evidenceClaimIds);
  const activeSourceIds = new Set(current.activeSourceIds);
  for (const node of [...graph.nodes]) {
    if ((node.id === synthesisId || node.id === directionId) && claims.length < 2) {
      append(GraphOperation.parse({ type: "remove_node", nodeId: node.id }), `operation-map-organizer-${Date.now()}-remove-${node.id}`);
      continue;
    }
    if (node.id === synthesisId || node.id === directionId) continue;
    const metadata = node.metadata as { evidenceClaimIds?: unknown; sourceId?: unknown };
    const citedClaimIds = Array.isArray(metadata.evidenceClaimIds) ? metadata.evidenceClaimIds.filter((id): id is string => typeof id === "string") : [];
    const unsupported = citedClaimIds.length
      ? citedClaimIds.every((claimId) => !activeClaimIds.has(claimId))
      : typeof metadata.sourceId === "string" && !activeSourceIds.has(metadata.sourceId);
    if (unsupported) append(GraphOperation.parse({ type: "remove_node", nodeId: node.id }), `operation-map-organizer-${Date.now()}-remove-${node.id}`);
  }
  const representedClaims = new Set<string>(graph.nodes.flatMap((node) => node.claimId ? [node.claimId] : []));
  const missingClaimNodes = mapNodesForClaims(claims.filter((claim) => !representedClaims.has(claim.id)), graph.nodes.length);
  for (const [index, node] of missingClaimNodes.entries()) {
    append(GraphOperation.parse({ type: "add_node", node: { id: `node-${node.id}`, kind: "claim", label: node.title, claimId: node.id, evidenceState: "verified", metadata: { body: node.body, locator: node.locator, sourceId: node.sourceId, x: node.x, y: node.y, width: node.width, height: node.height } } }), `operation-map-organizer-${Date.now()}-restore-${index + 1}`);
  }
  if (claims.length < 2) return write({ ...current, graphState: serializeGraphState(graph, history), mapNodes: mapNodesFor(graph, current.mapNodes), mapEdges: mapEdgesFor(graph), mapInputClaimIds: evidenceClaimIds, frame: current.frame ? { ...current.frame, stale: true } : undefined, briefApproved: false, updatedAt: createdAt }, root);
  const currentIds = new Set<string>(graph.nodes.map((node) => node.id));
  if (!currentIds.has(synthesisId)) append(GraphOperation.parse({ type: "add_node", node: {
    id: synthesisId,
    kind: "idea",
    label: synthesis.title,
    evidenceState: "derived",
    priority: 1,
    unresolved: false,
    locked: false,
    metadata: { body: synthesis.body, locator: "Derived from selected Sources", evidenceClaimIds, x: 40, y: 36, width: 24, height: 18 },
  } }), `operation-map-organizer-${Date.now()}-synthesis`);
  if (!currentIds.has(directionId)) append(GraphOperation.parse({ type: "add_node", node: {
    id: directionId,
    kind: "goal",
    label: directionTitle,
    claimId: primary.id,
    evidenceState: "creative",
    priority: 2,
    unresolved: false,
    locked: false,
    metadata: { body: prose(primary.text), locator: primary.locator, sourceId: primary.sourceId, evidenceClaimIds, x: 74, y: 36, width: 24, height: 18 },
  } }), `operation-map-organizer-${Date.now()}-direction`);
  if (currentIds.has(synthesisId)) append(GraphOperation.parse({ type: "update_node", nodeId: synthesisId, patch: {
    label: synthesis.title,
    metadata: { ...graph.nodes.find((node) => node.id === synthesisId)?.metadata, body: synthesis.body, locator: "Derived from selected Sources", evidenceClaimIds },
  } }), `operation-map-organizer-${Date.now()}-synthesis-refresh`);
  if (currentIds.has(directionId)) append(GraphOperation.parse({ type: "update_node", nodeId: directionId, patch: {
    label: directionTitle,
    claimId: primary.id,
    metadata: { ...graph.nodes.find((node) => node.id === directionId)?.metadata, body: prose(primary.text), locator: primary.locator, sourceId: primary.sourceId, evidenceClaimIds },
  } }), `operation-map-organizer-${Date.now()}-direction-refresh`);
  for (const edge of graph.edges.filter((edge) => edge.id.startsWith("edge-map-evidence-") || edge.id === "edge-map-synthesis-direction")) {
    append(GraphOperation.parse({ type: "remove_edge", edgeId: edge.id }), `operation-map-organizer-${Date.now()}-remove-${edge.id}`);
  }
  for (const [index, claim] of claims.slice(0, 3).entries()) {
    const from = `node-${claim.id}`;
    if (!graph.nodes.some((node) => node.id === from)) continue;
    append(GraphOperation.parse({ type: "add_edge", edge: { id: `edge-map-evidence-${index + 1}`, from, to: synthesisId, kind: "supports", label: "informs" } }), `operation-map-organizer-${Date.now()}-evidence-${index + 1}`);
  }
  append(GraphOperation.parse({ type: "add_edge", edge: { id: "edge-map-synthesis-direction", from: synthesisId, to: directionId, kind: "depends_on", label: "recommends" } }), `operation-map-organizer-${Date.now()}-direction-edge`);
  return write({
    ...current,
    graphState: serializeGraphState(graph, history),
    mapNodes: mapNodesFor(graph, current.mapNodes),
    mapEdges: mapEdgesFor(graph),
    mapInputClaimIds: evidenceClaimIds,
    frame: current.frame ? { ...current.frame, stale: true } : undefined,
    sketch: current.sketch ? { ...current.sketch, stale: true, approved: false } : undefined,
    assetPlan: current.assetPlan ? { ...current.assetPlan, stale: true } : undefined,
    imageBatch: current.imageBatch ? { ...current.imageBatch, stale: true } : undefined,
    narration: current.narration ? { ...current.narration, stale: true } : undefined,
    storyboard: { ...current.storyboard, stale: true, panels: current.storyboard.panels.map((panel) => ({ ...panel, stale: true })) },
    audioOverviews: staleAudioOverviews(current),
    outputs: current.outputs.map((output) => ({ ...output, stale: true })),
    videos: staleVideos(current),
    briefApproved: false,
    storyboardApproved: false,
    videoState: "blocked",
    updatedAt: createdAt,
  }, root);
}
export function applyGroundedMapProposal(proposal: GroundedMapProposal, run: Omit<WorkshopAiRun, "id" | "operation" | "inputClaimIds" | "createdAt">, root?: string): WorkshopState {
  const current = readWorkshopState(root);
  const activeClaims = activeClaimsFor(current);
  if (proposal.nodes.length < 2 || proposal.nodes.length > 12) throw new Error("A grounded Map proposal requires 2 to 12 nodes.");
  if (!/^[a-f0-9]{64}$/.test(run.outputSha256)) throw new Error("AI output requires a SHA-256 provenance hash.");
  const claimById = new Map(activeClaims.map((claim) => [claim.id, claim]));
  const proposalIds = new Set<string>();
  for (const node of proposal.nodes) {
    if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(node.id) || proposalIds.has(node.id)) throw new Error(`Invalid or duplicate Map node ID: ${node.id}.`);
    if (!node.title.trim() || !node.body.trim() || !Number.isFinite(node.x) || !Number.isFinite(node.y) || node.x < 0 || node.x > 100 || node.y < 0 || node.y > 100) throw new Error(`Map node ${node.id} has invalid content or position.`);
    if (node.evidenceState !== "derived" && !node.evidenceClaimIds.length) throw new Error(`${node.evidenceState === "direction" ? "Direction" : "Grounded"} Map node ${node.id} requires evidence.`);
    if (new Set(node.evidenceClaimIds).size !== node.evidenceClaimIds.length) throw new Error(`Map node ${node.id} contains duplicate evidence claims.`);
    if (node.evidenceClaimIds.some((claimId) => !claimById.has(claimId))) throw new Error(`Map node ${node.id} cites a claim outside the active source scope.`);
    proposalIds.add(node.id);
  }
  const edgeIds = new Set<string>();
  for (const edge of proposal.edges) {
    if (!edge.id || edgeIds.has(edge.id) || !proposalIds.has(edge.from) || !proposalIds.has(edge.to) || edge.from === edge.to) throw new Error(`Map edge ${edge.id || "unknown"} is invalid.`);
    edgeIds.add(edge.id);
  }

  const previous = graphFor(current).graph;
  let graph = SemanticGraph.parse({ id: previous.id, workshopId: current.id, revision: previous.revision + 1, staleState: "current", nodes: [], edges: [] });
  let history: ReturnType<typeof parseGraphState>["history"] = { graphVersionId: graph.id, records: [] };
  const createdAt = new Date().toISOString();
  for (const node of proposal.nodes) {
    const evidence = node.evidenceClaimIds.map((claimId) => claimById.get(claimId)!);
    const primary = evidence[0];
    const title = node.title.trim().replace(/-\s+/g, "-");
    const body = node.body.trim().replace(/-\s+/g, "-");
    const evidenceState = node.evidenceState === "grounded" ? "verified" : node.evidenceState === "direction" ? "creative" : "derived";
    const applied = appendGraphOperation(graph, history, GraphOperation.parse({ type: "add_node", node: { id: `node-${node.id}`, kind: "claim", label: title, claimId: primary?.id, evidenceState, priority: 0, unresolved: false, locked: false, metadata: { body, locator: primary?.locator ?? "Derived from active source set", sourceId: primary?.sourceId, evidenceClaimIds: node.evidenceClaimIds, x: node.x, y: node.y, width: 24, height: 18 } } }), { id: `operation-ai-${Date.now()}-${node.id}`, actor: "assistant", createdAt });
    graph = applied.graph; history = applied.history;
  }
  for (const edge of proposal.edges) {
    const applied = appendGraphOperation(graph, history, GraphOperation.parse({ type: "add_edge", edge: { ...edge, from: `node-${edge.from}`, to: `node-${edge.to}` } }), { id: `operation-ai-${Date.now()}-${edge.id}`, actor: "assistant", createdAt });
    graph = applied.graph; history = applied.history;
  }
  const aiRun: WorkshopAiRun = { id: `ai-run-grounded-graph-${Date.now()}`, operation: "grounded_graph", model: run.model, inputClaimIds: [...new Set(proposal.nodes.flatMap((node) => node.evidenceClaimIds))], outputSha256: run.outputSha256, requestId: run.requestId, createdAt };
  return write({ ...current, graphState: serializeGraphState(graph, history), mapNodes: mapNodesFor(graph, []), mapEdges: mapEdgesFor(graph), mapInputClaimIds: activeClaims.map((claim) => claim.id), aiRuns: [...current.aiRuns, aiRun], frame: current.frame ? { ...current.frame, stale: true } : undefined, sketch: current.sketch ? { ...current.sketch, stale: true, approved: false } : undefined, assetPlan: current.assetPlan ? { ...current.assetPlan, stale: true } : undefined, imageBatch: current.imageBatch ? { ...current.imageBatch, stale: true } : undefined, narration: current.narration ? { ...current.narration, stale: true } : undefined, storyboard: { ...current.storyboard, stale: true, panels: current.storyboard.panels.map((panel) => ({ ...panel, stale: true })) }, audioOverviews: staleAudioOverviews(current), outputs: current.outputs.map((output) => ({ ...output, stale: true })), videos: staleVideos(current), briefApproved: false, storyboardApproved: false, videoState: "blocked", updatedAt: createdAt }, root);
}
function normalizeSourceText(text: string) { return text.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/\r\n?/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim(); }
function decodeHtmlText(text: string) {
  const named: Record<string, string> = { amp: "&", apos: "'", gt: ">", hellip: "…", laquo: "«", ldquo: "“", lsquo: "‘", lt: "<", mdash: "—", nbsp: " ", ndash: "–", quot: '"', raquo: "»", rdquo: "”", rsquo: "’" };
  return text.replace(/&(?:#(\d+)|#x([0-9a-f]+)|([a-z]+));/gi, (entity, decimal: string | undefined, hex: string | undefined, name: string | undefined) => {
    const codePoint = decimal ? Number.parseInt(decimal, 10) : hex ? Number.parseInt(hex, 16) : undefined;
    if (codePoint !== undefined && Number.isFinite(codePoint) && codePoint > 0 && codePoint <= 0x10ffff) return String.fromCodePoint(codePoint);
    return name ? named[name.toLowerCase()] ?? entity : entity;
  });
}
function readableHtmlText(html: string) {
  const withoutNonContent = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|template|svg|canvas|iframe)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<nav\b[^>]*>[\s\S]*?<\/nav\s*>/gi, " ")
    .replace(/<li\b[^>]*>/gi, "\n\n• ")
    .replace(/<br\s*\/?>|<\/(?:address|article|aside|blockquote|dd|div|dl|dt|figcaption|figure|footer|h[1-6]|header|main|ol|p|pre|section|table|tbody|td|th|thead|tr|ul)\s*>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ");
  return normalizeSourceText(decodeHtmlText(withoutNonContent).replace(/\s*\n\s*/g, "\n"));
}
export function normalizePdfLayoutText(text: string) {
  const paragraphs = text
    .replace(/\f/g, "\n\n")
    .replace(/\n[ \t]*(?=(?:[●•▪◦]|\d+[.)])\s*)/g, "\n\n")
    .replace(/[ \t]+(?=[●•▪◦]\s*)/g, "\n\n")
    .replace(/:\s+(?=\d+[.)]\s+)/g, ":\n\n");
  return normalizeSourceText(paragraphs).split(/\n\n+/).map((paragraph) => paragraph.replace(/\n+/g, " ").replace(/\s+/g, " ").trim()).filter(Boolean).join("\n\n");
}
function isSourceMetadataChunk(text: string) { return /^\s*(?:source\s+locator|source\s+url|citations?)\s*:/i.test(text); }
function sourceClaimCount(text: string) { return Math.max(1, text.split(/\n\n+/).filter((paragraph) => !isSourceMetadataChunk(paragraph)).flatMap((paragraph) => paragraph.split(/[.!?]+/)).map((sentence) => sentence.trim()).filter(Boolean).length); }
function sentenceSafeChunks(paragraph: string, limit = 700) {
  const sentences = paragraph.split(/(?<=[.!?])\s+/).map((sentence) => sentence.trim()).filter(Boolean);
  const chunks: string[] = [];
  let current = "";
  for (const sentence of sentences) {
    if (sentence.length > limit) {
      if (current) { chunks.push(current); current = ""; }
      const parts = sentence.match(new RegExp(`.{1,${limit}}(?:\\s|$)`, "g"))?.map((part) => part.trim()).filter(Boolean) ?? [sentence];
      chunks.push(...parts.slice(0, -1));
      current = parts.at(-1) ?? "";
      continue;
    }
    if (!current || `${current} ${sentence}`.length <= limit) current = [current, sentence].filter(Boolean).join(" ");
    else { chunks.push(current); current = sentence; }
  }
  if (current) chunks.push(current);
  return chunks;
}
function chunksFor(text: string, sourceId: string, hash: string, origin: string): WorkshopChunk[] { return text.split(/\n\n+/).flatMap((paragraph) => sentenceSafeChunks(paragraph)).filter(Boolean).map((chunk, ordinal) => ({ id: `chunk-${hash.slice(0, 12)}-${ordinal + 1}`, sourceId, text: chunk.trim(), locator: `${origin} · chunk ${String(ordinal + 1).padStart(2, "0")}`, ordinal })); }
function claimsFor(chunks: WorkshopChunk[], hash: string): WorkshopClaim[] { return chunks.filter((chunk) => !isSourceMetadataChunk(chunk.text)).flatMap((chunk) => chunk.text.split(/[.!?]+/).map((sentence) => sentence.trim()).filter(Boolean).map((text, index) => ({ id: `claim-${hash.slice(0, 12)}-${chunk.ordinal}-${index + 1}`, sourceId: chunk.sourceId, chunkId: chunk.id, text, evidenceState: "verified" as const, locator: chunk.locator }))); }
function sourceExcerpt(text: string) { return text.length <= 240 ? text : `${text.slice(0, 240).replace(/\s+\S*$/, "").trimEnd()}…`; }
function mapNodeTitle(text: string) {
  const clean = prose(text);
  const clause = clean.split(/,\s+(?:then|but|because|so|while)\b|[;:]\s*/i)[0]?.trim() ?? clean;
  return outputHeading(clause.length >= 24 ? clause : clean, 64);
}
function mapNodesForClaims(claims: WorkshopClaim[], existingCount: number): WorkshopMapNode[] {
  const room = Math.max(0, 12 - existingCount);
  return claims.slice(0, Math.min(6, room)).map((claim, index) => {
    const position = existingCount + index;
    return {
      id: claim.id,
      title: mapNodeTitle(claim.text),
      body: prose(claim.text),
      kind: "grounded" as const,
      locator: claim.locator,
      sourceId: claim.sourceId,
      x: 8 + (position % 3) * 31,
      y: 10 + (Math.floor(position / 3) % 4) * 23,
      width: 24,
      height: 18,
    };
  });
}
function candidateCategory(text: string): WorkshopCandidate["category"] { const normalized = text.toLowerCase(); if (/\?|\b(how|what|which|when|where|why)\b/.test(normalized)) return "question"; if (/\b(must|must not|only|cannot|deadline|require|constraint)\b/.test(normalized)) return "constraint"; if (/\b(judge|customer|client|team|user|audience)\b/.test(normalized)) return "audience"; if (/\b(goal|aim|need to|should|want to|deliver|build)\b/.test(normalized)) return "goal"; return "claim"; }
export function extractWorkshopCandidates(root?: string): WorkshopState { const current = readWorkshopState(root); const candidates = activeClaimsFor(current).slice(0, 40).map((claim) => ({ id: `candidate-${claim.id}`, category: candidateCategory(claim.text), text: claim.text, sourceId: claim.sourceId, chunkId: claim.chunkId, locator: claim.locator })); return write({ ...current, candidates, updatedAt: new Date().toISOString() }, root); }
function evidenceMatchQuery(query: string): string | undefined { const terms = [...new Set(normalizeSourceText(query).toLocaleLowerCase().split(/[^\p{L}\p{N}_]+/u).filter((term) => term.length > 1))]; return terms.length ? terms.map((term) => `"${term.replaceAll('"', '""')}"`).join(" OR ") : undefined; }
export function searchWorkshopSources(query: string, root?: string, workshopId?: string): WorkshopChunk[] {
  const match = evidenceMatchQuery(query); if (!match) return [];
  const state = readWorkshopState(root, workshopId); const db = dbFor(root);
  const rows = db.prepare("SELECT source_id, chunk_id FROM evidence_fts WHERE workshop_id=? AND evidence_fts MATCH ? ORDER BY bm25(evidence_fts, 0.0, 0.0, 0.0, 0.0, 1.0, 0.7) ASC, rowid ASC LIMIT 40").all(state.id, match) as Array<{ source_id: string; chunk_id: string }>;
  const chunks = new Map(state.sourceChunks.map((chunk) => [`${chunk.sourceId}\u0000${chunk.id}`, chunk]));
  return rows.flatMap((row) => { const chunk = chunks.get(`${row.source_id}\u0000${row.chunk_id}`); return chunk ? [chunk] : []; });
}
export function recordWorkshopToolCall(input: WorkshopToolInvocation, root?: string): WorkshopState {
  const call = WorkshopToolCall.parse(input); const current = readWorkshopState(root, call.workshopId);
  if (current.toolCalls.some((candidate) => candidate.id === call.id)) throw new Error(`Workshop tool call already exists: ${call.id}.`);
  return write({ ...current, toolCalls: [...current.toolCalls, call], updatedAt: call.completedAt }, root);
}
export function recordConversationContinuation(input: WorkshopConversationContinuation, root?: string): WorkshopState {
  const current = readWorkshopState(root);
  if (!input.responseId.trim()) throw new Error("Conversation response ID is required.");
  if (!Number.isFinite(Date.parse(input.recordedAt))) throw new Error("Conversation continuation time is invalid.");
  return write({ ...current, conversationContinuation: { responseId: input.responseId, model: input.model, recordedAt: input.recordedAt }, updatedAt: input.recordedAt }, root);
}
type GroundedConversationReply = { text: string; evidence: Array<{ claimId?: string; sourceId: string; chunkId: string; locator: string; snippet: string; snippetHash: string }>; operation: { name: "search"; status: "completed" } };
function groundedConversationReply(state: WorkshopState, query: string, root?: string): GroundedConversationReply {
  const active = new Set(state.activeSourceIds);
  const ranked = searchWorkshopSources(query, root).filter((chunk) => active.has(chunk.sourceId));
  const chunks = (ranked.length ? ranked : state.sourceChunks.filter((chunk) => active.has(chunk.sourceId))).slice(0, 3);
  const evidence = chunks.map((chunk) => {
    const claim = state.claims.find((candidate) => candidate.sourceId === chunk.sourceId && candidate.chunkId === chunk.id);
    return { claimId: claim?.id, sourceId: chunk.sourceId, chunkId: chunk.id, locator: chunk.locator, snippet: chunk.text, snippetHash: createHash("sha256").update(chunk.text).digest("hex") };
  });
  if (!chunks.length) return { text: "Add or select a Source first. I’ll answer from that material and keep every factual point linked to its evidence.", evidence: [], operation: { name: "search", status: "completed" } };
  const points = chunks.flatMap((chunk) => state.claims.filter((claim) => claim.sourceId === chunk.sourceId && claim.chunkId === chunk.id).slice(0, 1)).map((claim) => prose(claim.text)).filter(Boolean);
  const fallbackPoints = chunks.map((chunk) => prose(chunk.text.split(/[.!?]+/)[0] ?? chunk.text)).filter(Boolean);
  const supported = (points.length ? points : fallbackPoints).slice(0, 3).map((point) => /[.!?]$/.test(point) ? point : `${point}.`).join(" ");
  return { text: `Your selected Sources support this: ${supported}`, evidence, operation: { name: "search", status: "completed" } };
}
export function sendConversationMessage(text: string, root?: string): WorkshopState {
  const normalized = normalizeSourceText(text);
  if (!normalized) throw new Error("Write a message first.");
  if (normalized.length > 4_000) throw new Error("Conversation messages are limited to 4,000 characters.");
  const current = readWorkshopState(root);
  const createdAt = new Date().toISOString();
  const reply = groundedConversationReply(current, normalized, root);
  const digest = createHash("sha256").update(`${createdAt}\n${normalized}`).digest("hex").slice(0, 12);
  const turns: WorkshopConversationTurn[] = [
    ConversationTurn.parse({ id: `turn-user-${digest}`, workshopId: current.id, role: "user", text: normalized, input: "text", createdAt, evidence: [] }),
    ConversationTurn.parse({ id: `turn-assistant-${digest}`, workshopId: current.id, role: "assistant", text: reply.text, input: "system", createdAt, evidence: reply.evidence, operation: reply.operation }),
  ];
  return write({ ...current, conversationTurns: [...current.conversationTurns, ...turns], updatedAt: createdAt }, root);
}
export function beginProviderConversation(text: string, messageId: string, root?: string): WorkshopState {
  const normalized = normalizeSourceText(text); const stableMessageId = messageId.trim();
  if (!normalized) throw new Error("Write a message first.");
  if (normalized.length > 4_000) throw new Error("Conversation messages are limited to 4,000 characters.");
  if (!stableMessageId) throw new Error("Conversation message ID is required.");
  const current = readWorkshopState(root);
  const id = `turn-user-provider-${createHash("sha256").update(stableMessageId).digest("hex").slice(0, 16)}`;
  if (current.conversationTurns.some((turn) => turn.id === id)) return current;
  const createdAt = new Date().toISOString();
  const turn = ConversationTurn.parse({ id, workshopId: current.id, role: "user", text: normalized, input: "text", createdAt, evidence: [] });
  return write({ ...current, conversationTurns: [...current.conversationTurns, turn], updatedAt: createdAt }, root);
}
function providerConversationEvidence(state: WorkshopState, toolCallIds: string[]) {
  const evidence = new Map<string, { claimId?: string; sourceId: string; chunkId: string; locator: string; snippet: string; snippetHash: string }>();
  const object = (value: unknown) => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
  const collect = (value: unknown) => {
    const chunk = object(value); const sourceId = chunk?.sourceId; const chunkId = chunk?.id; const snippet = chunk?.text; const locator = chunk?.locator;
    if (typeof sourceId !== "string" || typeof chunkId !== "string" || typeof snippet !== "string" || typeof locator !== "string") return;
    const claims = Array.isArray(chunk?.claims) ? chunk.claims.map(object).filter(Boolean) : [];
    const claimId = claims.find((claim) => typeof claim?.id === "string")?.id;
    evidence.set(`${sourceId}\u0000${chunkId}`, { claimId: typeof claimId === "string" ? claimId : undefined, sourceId, chunkId, locator, snippet, snippetHash: createHash("sha256").update(snippet).digest("hex") });
  };
  for (const call of state.toolCalls.filter((candidate) => toolCallIds.includes(candidate.id) && !candidate.result.isError)) {
    const data = call.result.data;
    if (call.name === "search" && Array.isArray(data?.results)) for (const result of data.results) collect(result);
    if (call.name === "fetch") collect(object(data?.result));
  }
  return [...evidence.values()];
}
export function completeProviderConversation(input: { text: string; responseId: string; model?: string; toolCallIds?: string[] }, root?: string): WorkshopState {
  const text = normalizeSourceText(input.text); const responseId = input.responseId.trim();
  if (!text) throw new Error("The provider response did not contain assistant text.");
  if (text.length > 16_000) throw new Error("The provider response exceeded the Conversation limit.");
  if (!responseId) throw new Error("Conversation response ID is required.");
  const current = readWorkshopState(root); const id = `turn-assistant-provider-${createHash("sha256").update(responseId).digest("hex").slice(0, 16)}`;
  if (current.conversationTurns.some((turn) => turn.id === id)) return recordConversationContinuation({ responseId, model: input.model, recordedAt: new Date().toISOString() }, root);
  const createdAt = new Date().toISOString(); const toolCallIds = input.toolCallIds ?? [];
  const evidence = providerConversationEvidence(current, toolCallIds);
  const operation = current.toolCalls.some((call) => toolCallIds.includes(call.id) && call.name === "search") ? { name: "search" as const, status: "completed" as const } : undefined;
  const turn = ConversationTurn.parse({ id, workshopId: current.id, role: "assistant", text, input: "system", createdAt, evidence, operation });
  const next = write({ ...current, conversationTurns: [...current.conversationTurns, turn], conversationContinuation: { responseId, model: input.model, recordedAt: createdAt }, updatedAt: createdAt }, root);
  return next;
}
export async function ingestSource(input: SourceIngestion, root?: string): Promise<WorkshopState> {
  const text = normalizeSourceText(input.text);
  if (!text) throw new Error("Source text is required.");
  const title = input.title.trim();
  const origin = input.origin.trim();
  if (!title || !origin) throw new Error("Source title and origin are required.");
  const permission = input.permission ?? "sanitized";
  if (!(["private", "sanitized", "shareable"] as const).includes(permission)) throw new Error("Source permission must be private, sanitized, or shareable.");
  const hash = createHash("sha256").update(`${origin}\n${text}`).digest("hex");
  const sourceId = `source-${hash.slice(0, 12)}`;
  const current = readWorkshopState(root);
  if (current.sourceItems.some((source) => source.id === sourceId)) return current;
  const dataRoot = root ?? repositoryDataRoot();
  const sourceDirectory = join(dataRoot, "sources");
  await mkdir(sourceDirectory, { recursive: true });
  await writeFile(join(sourceDirectory, `${hash}.txt`), text, "utf8");
  const claimCount = sourceClaimCount(text);
  const source: WorkshopSource = { id: sourceId, type: input.type ?? "TXT", title, origin, claimCount, excerpt: sourceExcerpt(text), locator: `${origin} · normalized:${hash.slice(0, 12)}`, permission };
  const chunks = chunksFor(text, sourceId, hash, origin); const claims = claimsFor(chunks, hash);
  const nodes = mapNodesForClaims(claims, current.mapNodes.length);
  const createdAt = new Date().toISOString(); const snapshot = graphFor(current);
  let graph = snapshot.graph; let history = snapshot.history;
  for (const [index, node] of nodes.entries()) {
    const operation = GraphOperation.parse({ type: "add_node", node: { id: `node-${node.id}`, kind: "claim", label: node.title, claimId: node.id, evidenceState: "verified", metadata: { body: node.body, locator: node.locator, sourceId, x: node.x, y: node.y, width: node.width, height: node.height } } });
    const applied = appendGraphOperation(graph, history, operation, { id: `operation-source-${hash.slice(0, 12)}-${index + 1}`, actor: "system", createdAt });
    graph = applied.graph; history = applied.history;
  }
  return write({
    ...current,
    sources: current.sources + 1,
    groundedClaims: current.groundedClaims + claims.length,
    sourceItems: [...current.sourceItems, source],
    activeSourceIds: [...new Set([...current.activeSourceIds, sourceId])],
    sourceChunks: [...chunks, ...current.sourceChunks],
    claims: [...claims, ...current.claims],
    candidates: [],
    mapNodes: mapNodesFor(graph, [...current.mapNodes, ...nodes]),
    mapEdges: mapEdgesFor(graph),
    graphState: serializeGraphState(graph, history),
    frame: current.frame ? { ...current.frame, stale: true } : undefined,
    sketch: current.sketch ? { ...current.sketch, stale: true, approved: false } : undefined,
    assetPlan: current.assetPlan ? { ...current.assetPlan, stale: true } : undefined,
    imageBatch: current.imageBatch ? { ...current.imageBatch, stale: true } : undefined,
    narration: current.narration ? { ...current.narration, stale: true } : undefined,
    storyboard: current.storyboard.panels.length ? { ...current.storyboard, stale: true, panels: current.storyboard.panels.map((panel) => ({ ...panel, stale: true })) } : current.storyboard,
    audioOverviews: staleAudioOverviews(current),
    outputs: current.outputs.map((output) => ({ ...output, stale: true })),
    videos: staleVideos(current),
    briefApproved: false,
    storyboardApproved: false,
    videoState: "blocked",
    updatedAt: createdAt,
  }, root);
}
export async function captureFallbackTranscript(text: string, root?: string, evidence?: RealtimeCaptureEvidence): Promise<WorkshopState> {
  const normalized = normalizeSourceText(text); if (!normalized) throw new Error("Capture text is required."); const capturedAt = new Date().toISOString();
  const voiceMode = evidence?.assistant ? "conversation" : "capture-only fallback";
  const ingested = await ingestSource({ title: `Voice ${voiceMode} transcript ${capturedAt}`, origin: `gpt-realtime-2.1 ${voiceMode}`, type: "TXT", text: normalized, permission: "private" }, root);
  if (evidence && (!evidence.itemIds.length || !evidence.eventIds.length || evidence.itemIds.some((value) => !value.trim()) || evidence.eventIds.some((value) => !value.trim()))) throw new Error("Realtime capture evidence requires provider item and event IDs.");
  if (evidence?.interruptions && (!evidence.interruptions.responseIds.length || evidence.interruptions.responseIds.length !== evidence.interruptions.eventIds.length || evidence.interruptions.responseIds.some((value) => !value.trim()) || evidence.interruptions.eventIds.some((value) => !value.trim()))) throw new Error("Realtime interruption evidence requires matching provider response and event IDs.");
  const digest = createHash("sha256").update(`${capturedAt}\n${normalized}`).digest("hex").slice(0, 12);
  const segment: WorkshopTranscriptSegment = { id: `fallback-${digest}`, origin: "realtime_fallback", transport: evidence?.transport ?? "fixture", text: normalized, capturedAt, provider: evidence ? { model: evidence.model, transcriptionModel: evidence.transcriptionModel, itemIds: [...new Set(evidence.itemIds)], eventIds: [...new Set(evidence.eventIds)], interruptions: evidence.interruptions ? { responseIds: [...new Set(evidence.interruptions.responseIds)], eventIds: [...new Set(evidence.interruptions.eventIds)] } : undefined } : undefined };
  const source = ingested.sourceItems.at(-1);
  const reply = groundedConversationReply(ingested, normalized, root);
  const assistantText = evidence?.assistant?.text ? normalizeSourceText(evidence.assistant.text) : reply.text;
  if (evidence?.assistant && (!assistantText || !evidence.assistant.responseId.trim() || !evidence.assistant.eventIds.length)) throw new Error("Realtime assistant evidence is incomplete.");
  const realtimeToolIds = evidence?.assistant ? ingested.toolCalls.filter((call) => call.channel === "realtime" && call.provider?.responseId === evidence.assistant?.responseId && !call.result.isError).map((call) => call.id) : [];
  const assistantEvidence = evidence?.assistant ? providerConversationEvidence(ingested, realtimeToolIds) : reply.evidence;
  const turns: WorkshopConversationTurn[] = [
    ConversationTurn.parse({ id: `turn-user-${digest}`, workshopId: ingested.id, role: "user", text: normalized, input: "voice", createdAt: capturedAt, evidence: [], sourceId: source?.id, operation: { name: "voice_capture", status: "completed" } }),
    ConversationTurn.parse({ id: evidence?.assistant ? `turn-assistant-realtime-${createHash("sha256").update(evidence.assistant.responseId).digest("hex").slice(0, 16)}` : `turn-assistant-${digest}`, workshopId: ingested.id, role: "assistant", text: assistantText, input: "system", createdAt: capturedAt, evidence: assistantEvidence, operation: assistantEvidence.length ? { name: "search", status: "completed" } : reply.operation }),
  ];
  return write({ ...ingested, transcriptSegments: [...ingested.transcriptSegments, segment], conversationTurns: [...ingested.conversationTurns, ...turns], firstTranscriptAt: ingested.firstTranscriptAt ?? capturedAt, updatedAt: capturedAt }, root);
}
export async function captureImportedTranscript(text: string, input: { title: string; origin: string; permission?: WorkshopSource["permission"] }, root?: string): Promise<WorkshopState> {
  const normalized = normalizeSourceText(text);
  if (!normalized) throw new Error("Imported transcript text is required.");
  const capturedAt = new Date().toISOString();
  const ingested = await ingestSource({ title: input.title, origin: input.origin, type: "TXT", text: normalized, permission: input.permission ?? "private" }, root);
  const digest = createHash("sha256").update(`${capturedAt}\n${normalized}`).digest("hex").slice(0, 12);
  const source = ingested.sourceItems.at(-1);
  const reply = groundedConversationReply(ingested, normalized, root);
  const segment: WorkshopTranscriptSegment = { id: `import-${digest}`, origin: "manual_import", transport: "fixture", text: normalized, capturedAt };
  const turns: WorkshopConversationTurn[] = [
    ConversationTurn.parse({ id: `turn-user-${digest}`, workshopId: ingested.id, role: "user", text: normalized, input: "voice", createdAt: capturedAt, evidence: [], sourceId: source?.id, operation: { name: "voice_capture", status: "completed" } }),
    ConversationTurn.parse({ id: `turn-assistant-${digest}`, workshopId: ingested.id, role: "assistant", text: reply.text, input: "system", createdAt: capturedAt, evidence: reply.evidence, operation: reply.operation }),
  ];
  return write({ ...ingested, transcriptSegments: [...ingested.transcriptSegments, segment], conversationTurns: [...ingested.conversationTurns, ...turns], firstTranscriptAt: ingested.firstTranscriptAt ?? capturedAt, updatedAt: capturedAt }, root);
}
function isPrivateAddress(address: string) { return address === "::1" || address.startsWith("127.") || address.startsWith("10.") || address.startsWith("192.168.") || /^172\.(1[6-9]|2\d|3[0-1])\./.test(address) || address.startsWith("fc") || address.startsWith("fd") || address.startsWith("fe80:"); }
async function fetchPublicResponse(rawUrl: string, accept: string, fetchImpl: typeof fetch = fetch) {
  let url: URL; try { url = new URL(rawUrl); } catch { throw new Error("A valid HTTP(S) URL is required."); }
  let response: Response | undefined;
  for (let redirects = 0; redirects <= 3; redirects += 1) {
    if (!/^https?:$/.test(url.protocol) || url.username || url.password) throw new Error("Only credential-free HTTP(S) URLs are allowed.");
    if (url.hostname === "localhost" || url.hostname.endsWith(".local")) throw new Error("Local network URLs are not allowed.");
    const addresses = await lookup(url.hostname, { all: true }); if (addresses.some(({ address }) => isPrivateAddress(address))) throw new Error("Private network URLs are not allowed.");
    response = await fetchImpl(url, { redirect: "manual", signal: AbortSignal.timeout(10_000), headers: { accept, "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 WorkshopLM/1.0" } });
    if (response.status < 300 || response.status >= 400) break;
    const location = response.headers.get("location");
    if (!location || redirects === 3) throw new Error("URL redirected too many times or without a destination.");
    url = new URL(location, url);
  }
  if (response?.status === 401 || response?.status === 403) throw new Error(`This website blocked automatic review (HTTP ${response.status}). Try another public page or set the Style manually.`);
  if (!response?.ok) throw new Error(`URL fetch failed: HTTP ${response?.status ?? "unknown"}.`);
  return { url, response };
}
async function fetchPublicText(rawUrl: string, fetchImpl: typeof fetch = fetch) {
  const { url, response } = await fetchPublicResponse(rawUrl, "text/html,text/css,application/xhtml+xml,application/xml;q=0.9,text/plain;q=0.8", fetchImpl);
  const contentType = response.headers.get("content-type") ?? ""; if (!/^(text\/|application\/(json|xml|javascript))/.test(contentType)) throw new Error("URL must return text content.");
  const text = await response.text(); if (text.length > 1_000_000) throw new Error("URL content exceeds the 1 MB local ingestion limit."); return { url, text };
}
export async function ingestUrl(rawUrl: string, root?: string, fetchImpl: typeof fetch = fetch): Promise<WorkshopState> {
  const { url, text } = await fetchPublicText(rawUrl, fetchImpl);
  const title = decodeHtmlText(text.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim() ?? "") || url.hostname;
  return ingestSource({ title, origin: url.toString(), type: "WEB", text: readableHtmlText(text), permission: "shareable" }, root);
}
export async function ingestPdfFile(filePath: string, root?: string, permission: WorkshopSource["permission"] = "sanitized"): Promise<WorkshopState> {
  if (!filePath.toLowerCase().endsWith(".pdf")) throw new Error("Local PDF ingestion requires a .pdf file.");
  let stdout: string; try { ({ stdout } = await execFile("pdftotext", ["-layout", filePath, "-"], { maxBuffer: 1_000_000 })); } catch { throw new Error("PDF text extraction failed. Use a readable text-based PDF or provide extracted text."); }
  const text = normalizePdfLayoutText(stdout); if (!text) throw new Error("PDF contains no extractable text."); return ingestSource({ title: basename(filePath), origin: `Local PDF · ${basename(filePath)}`, type: "PDF", text, permission }, root);
}
function htmlAttribute(tag: string, name: string) { const match = tag.match(new RegExp(`\\b${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i")); return match?.[1] ?? match?.[2] ?? match?.[3]; }
function normalizeHex(value: string) { const upper = value.toUpperCase(); return upper.length === 4 ? `#${upper[1]}${upper[1]}${upper[2]}${upper[2]}${upper[3]}${upper[3]}` : upper; }
function luminance(value: string) { const channels = [value.slice(1, 3), value.slice(3, 5), value.slice(5, 7)].map((channel) => Number.parseInt(channel, 16) / 255).map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4); return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722; }
function contrastRatio(left: string, right: string) { const values = [luminance(left), luminance(right)].sort((a, b) => b - a); return (values[0]! + 0.05) / (values[1]! + 0.05); }
function colorChroma(value: string) { const channels = [value.slice(1, 3), value.slice(3, 5), value.slice(5, 7)].map((channel) => Number.parseInt(channel, 16) / 255); return Math.max(...channels) - Math.min(...channels); }
function absoluteWebUrl(value: string | undefined, base: URL) { if (!value) return undefined; try { const url = new URL(value, base); return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url.toString() : undefined; } catch { return undefined; } }
function uniqueMatches(text: string, pattern: RegExp) { return [...new Set([...text.matchAll(pattern)].map((match) => match[1]?.trim()).filter((value): value is string => Boolean(value)))]; }

type WebsiteBrandAsset = { url: string; bytes: Buffer; contentType: WorkshopBrandAsset["contentType"]; width: number; height: number; sha256: string; extension: "png" | "jpg" | "webp" | "svg" };
function jpegDimensions(bytes: Buffer) {
  if (bytes[0] !== 0xff || bytes[1] !== 0xd8) return undefined;
  for (let offset = 2; offset + 9 < bytes.length;) {
    if (bytes[offset] !== 0xff) { offset += 1; continue; }
    const marker = bytes[offset + 1]!; if (marker === 0xd8 || marker === 0xd9) { offset += 2; continue; }
    const length = bytes.readUInt16BE(offset + 2); if (length < 2 || offset + 2 + length > bytes.length) return undefined;
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) return { height: bytes.readUInt16BE(offset + 5), width: bytes.readUInt16BE(offset + 7) };
    offset += 2 + length;
  }
  return undefined;
}
function webpDimensions(bytes: Buffer) {
  if (bytes.subarray(0, 4).toString("ascii") !== "RIFF" || bytes.subarray(8, 12).toString("ascii") !== "WEBP") return undefined;
  const kind = bytes.subarray(12, 16).toString("ascii");
  if (kind === "VP8X" && bytes.length >= 30) return { width: bytes.readUIntLE(24, 3) + 1, height: bytes.readUIntLE(27, 3) + 1 };
  if (kind === "VP8 " && bytes.length >= 30 && bytes[23] === 0x9d && bytes[24] === 0x01 && bytes[25] === 0x2a) return { width: bytes.readUInt16LE(26) & 0x3fff, height: bytes.readUInt16LE(28) & 0x3fff };
  if (kind === "VP8L" && bytes.length >= 25 && bytes[20] === 0x2f) { const packed = bytes.readUInt32LE(21); return { width: (packed & 0x3fff) + 1, height: ((packed >> 14) & 0x3fff) + 1 }; }
  return undefined;
}
function svgDimensions(bytes: Buffer) {
  const svg = bytes.toString("utf8");
  if (!/<svg\b/i.test(svg) || /<!doctype|<!entity|<script\b|<foreignObject\b|<iframe\b|<object\b|<embed\b|\son[a-z]+\s*=|(?:href|src)\s*=\s*["']\s*(?:https?:|data:|\/\/)|@import|url\s*\(/i.test(svg)) throw new Error("SVG brand assets may not contain scripts, active content, or external references.");
  const numeric = (name: string) => svg.match(new RegExp(`\\b${name}\\s*=\\s*["']([0-9]+(?:\\.[0-9]+)?)(?:px)?["']`, "i"))?.[1];
  let width = Number(numeric("width")); let height = Number(numeric("height"));
  if (!width || !height) { const viewBox = svg.match(/\bviewBox\s*=\s*["']\s*[-+\d.]+[\s,]+[-+\d.]+[\s,]+([\d.]+)[\s,]+([\d.]+)\s*["']/i); width = Number(viewBox?.[1]); height = Number(viewBox?.[2]); }
  return width && height ? { width: Math.round(width), height: Math.round(height) } : undefined;
}
function validateBrandAsset(bytes: Buffer, contentType: WorkshopBrandAsset["contentType"]) {
  let dimensions: { width: number; height: number } | undefined;
  if (contentType === "image/png") dimensions = bytes.length >= 24 && bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) ? { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) } : undefined;
  else if (contentType === "image/jpeg") dimensions = jpegDimensions(bytes);
  else if (contentType === "image/webp") dimensions = webpDimensions(bytes);
  else dimensions = svgDimensions(bytes);
  if (!dimensions) throw new Error("Brand asset bytes do not match a supported image format with readable dimensions.");
  if (dimensions.width < 16 || dimensions.height < 16 || dimensions.width > 4096 || dimensions.height > 4096 || dimensions.width * dimensions.height > 16_000_000) throw new Error("Brand asset dimensions must be between 16 and 4,096 pixels and no more than 16 megapixels.");
  return dimensions;
}
export async function fetchWebsiteBrandAsset(rawUrl: string, fetchImpl: typeof fetch = fetch): Promise<WebsiteBrandAsset> {
  const { url, response } = await fetchPublicResponse(rawUrl, "image/png,image/jpeg,image/webp,image/svg+xml", fetchImpl);
  const headerLength = Number(response.headers.get("content-length") ?? 0); if (headerLength > 2_000_000) throw new Error("Brand asset exceeds the 2 MB limit.");
  const rawType = response.headers.get("content-type")?.split(";", 1)[0]?.trim().toLowerCase();
  const contentType = rawType === "image/jpg" ? "image/jpeg" : rawType;
  if (contentType !== "image/png" && contentType !== "image/jpeg" && contentType !== "image/webp" && contentType !== "image/svg+xml") throw new Error("Brand assets must be PNG, JPEG, WebP, or safe SVG images.");
  const bytes = Buffer.from(await response.arrayBuffer()); if (!bytes.length || bytes.length > 2_000_000) throw new Error("Brand asset must be non-empty and no larger than 2 MB.");
  const { width, height } = validateBrandAsset(bytes, contentType);
  const sha256 = createHash("sha256").update(bytes).digest("hex"); const extension: WebsiteBrandAsset["extension"] = contentType === "image/jpeg" ? "jpg" : contentType === "image/svg+xml" ? "svg" : contentType === "image/png" ? "png" : "webp";
  return { url: url.toString(), bytes, contentType, width, height, sha256, extension };
}
async function persistSelectedBrandAssets(urls: string[] | undefined, workshopId: string, selectedAt: string, root?: string, fetchImpl: typeof fetch = fetch): Promise<WorkshopBrandAsset[]> {
  const selected = cleanStyleList(urls).slice(0, 3); const dataRoot = root ?? repositoryDataRoot(); const assets: WorkshopBrandAsset[] = [];
  for (const selectedUrl of selected) {
    const asset = await fetchWebsiteBrandAsset(selectedUrl, fetchImpl); const localPath = workshopGeneratedPath(workshopId, "brand", `${asset.sha256}.${asset.extension}`);
    mkdirSync(join(dataRoot, dirname(localPath)), { recursive: true }); writeFileSync(join(dataRoot, localPath), asset.bytes);
    assets.push({ id: `brand-${asset.sha256.slice(0, 12)}`, sourceUrl: asset.url, localPath, contentType: asset.contentType, byteCount: asset.bytes.length, width: asset.width, height: asset.height, sha256: asset.sha256, selectedAt });
  }
  return assets;
}

export async function analyzeWebsiteStyle(rawUrl: string, fetchImpl: typeof fetch = fetch): Promise<WebsiteStyleSuggestion> {
  const { url, text: html } = await fetchPublicText(rawUrl, fetchImpl);
  const linkTags = html.match(/<link\b[^>]*>/gi) ?? [];
  const stylesheetUrls = linkTags.filter((tag) => /(?:^|\s)stylesheet(?:\s|$)/i.test(htmlAttribute(tag, "rel") ?? "")).map((tag) => absoluteWebUrl(htmlAttribute(tag, "href"), url)).filter((value): value is string => Boolean(value)).slice(0, 4);
  const stylesheets = await Promise.all(stylesheetUrls.map(async (stylesheetUrl) => { try { return (await fetchPublicText(stylesheetUrl, fetchImpl)).text; } catch { return ""; } }));
  const css = `${html}\n${stylesheets.join("\n")}`;
  const themeTag = (html.match(/<meta\b[^>]*>/gi) ?? []).find((tag) => htmlAttribute(tag, "name")?.toLowerCase() === "theme-color");
  const themeColor = htmlAttribute(themeTag ?? "", "content")?.match(/^#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?$/)?.[0];
  const colors = [...new Set([...(themeColor ? [normalizeHex(themeColor)] : []), ...[...css.matchAll(/#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b/g)].map((match) => normalizeHex(match[0]))])];
  const namedColors = [...css.matchAll(/(?:--([\w-]+)|\b(background-color|color))\s*:\s*(#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?)\b/gi)].map((match) => ({ name: `${match[1] ?? match[2] ?? ""}`.toLowerCase(), value: normalizeHex(match[3]!) }));
  const sortedByLight = [...colors].sort((left, right) => luminance(left) - luminance(right));
  const namedValues = (pattern: RegExp) => namedColors.filter((item) => pattern.test(item.name)).map((item) => item.value);
  const normalizedTheme = themeColor ? normalizeHex(themeColor) : undefined;
  const paper = namedValues(/(?:^|[-_])(paper|background|surface|canvas)(?:$|[-_])/).filter((candidate) => luminance(candidate) >= 0.55).sort((left, right) => luminance(right) - luminance(left))[0] ?? [...sortedByLight].reverse().find((candidate) => luminance(candidate) >= 0.75) ?? "#F4F2EC";
  const ink = namedValues(/(?:^|[-_])(ink|text|foreground)(?:$|[-_])/).filter((candidate) => contrastRatio(candidate, paper) >= 4.5).sort((left, right) => contrastRatio(right, paper) - contrastRatio(left, paper))[0] ?? sortedByLight.find((candidate) => candidate !== paper && candidate !== normalizedTheme && contrastRatio(candidate, paper) >= 4.5) ?? "#171816";
  const namedAccents = new Set(namedValues(/(?:^|[-_])(accent|primary|brand)(?:$|[-_])/));
  const accent = [...new Set([...namedAccents, ...(normalizedTheme ? [normalizedTheme] : []), ...colors])].filter((candidate) => candidate !== ink && candidate !== paper && luminance(candidate) > 0.02 && luminance(candidate) < 0.92).sort((left, right) => {
    const score = (candidate: string) => (namedAccents.has(candidate) ? 2 : 0) + (candidate === normalizedTheme ? 0.5 : 0) + colorChroma(candidate) * 3 + Math.min(contrastRatio(candidate, paper), 4) / 4;
    return score(right) - score(left);
  })[0] ?? "#1668E3";
  const fontCandidates = uniqueMatches(css, /font-family\s*:\s*([^;}]+)/gi).flatMap((declaration) => declaration.split(",")).map((font) => font.replace(/["']/g, "").trim()).filter((font) => font && !/^(inherit|initial|system-ui|sans-serif|serif|monospace|cursive|fantasy|ui-)/i.test(font) && !font.startsWith("var("));
  const logoTags = [...(html.match(/<img\b[^>]*>/gi) ?? []), ...linkTags.filter((tag) => /icon/i.test(htmlAttribute(tag, "rel") ?? ""))];
  const logos = [...new Set(logoTags.filter((tag) => /logo|brand|icon/i.test(`${htmlAttribute(tag, "alt") ?? ""} ${htmlAttribute(tag, "class") ?? ""} ${htmlAttribute(tag, "id") ?? ""} ${htmlAttribute(tag, "src") ?? ""} ${htmlAttribute(tag, "href") ?? ""}`)).map((tag) => absoluteWebUrl(htmlAttribute(tag, "src") ?? htmlAttribute(tag, "href"), url)).filter((value): value is string => Boolean(value)))].slice(0, 5);
  if (colors.length === 0 && fontCandidates.length === 0 && logos.length === 0) {
    const visibleText = readableHtmlText(html);
    if (/<script\b/i.test(html) && visibleText.length < 40) throw new Error("Website style analysis found only a JavaScript app shell.");
    throw new Error("Website style analysis found no usable public visual style.");
  }
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || url.hostname;
  const reviewedFonts = [...new Set(fontCandidates)].slice(0, 6);
  return { referenceUrl: url.toString(), name: `${title} foundation`, accent, ink, paper, paletteRoles: paletteRoles(accent, ink, paper, "website"), logos, assetCandidates: logos.map((assetUrl) => ({ url: assetUrl, kind: "logo" })), fontCandidates: reviewedFonts, typographyCandidates: reviewedFonts.map((family) => ({ family, availability: "unverified", source: "website" })), references: [url.toString()], negativeRules: [], findings: { colors: colors.length, fontCandidates: new Set(fontCandidates).size, assets: logos.length, stylesheets: stylesheets.filter(Boolean).length } };
}

function reviewedWebsiteUrl(rawUrl: string) { let url: URL; try { url = new URL(rawUrl); } catch { throw new Error("A valid HTTP(S) website is required."); } if (!/^https?:$/.test(url.protocol) || url.username || url.password) throw new Error("Only credential-free HTTP(S) websites are allowed."); return url.toString(); }
function styleLibraryFamilyId(name: string) { return `style-${createHash("sha256").update(name.trim().toLowerCase()).digest("hex").slice(0, 12)}`; }
function saveStyleToLibrary(style: WorkshopStyle, root?: string) {
  const db = dbFor(root); const now = style.lockedAt;
  const rows = db.prepare("SELECT id, style_json FROM style_library").all() as Array<{ id: string; style_json: string }>;
  const prior = rows.map((row) => ({ id: row.id, stored: JSON.parse(row.style_json) as { familyId?: string; revision?: number } }));
  const referenced = style.libraryId ? prior.find((entry) => entry.id === style.libraryId) : undefined;
  const familyId = style.libraryFamilyId ?? referenced?.stored.familyId ?? (referenced ? referenced.id : styleLibraryFamilyId(style.name));
  const revision = Math.max(0, ...prior.filter((entry) => (entry.stored.familyId ?? entry.id) === familyId).map((entry) => entry.stored.revision ?? 1)) + 1;
  const id = `${familyId}--r${revision}`;
  const snapshot: Omit<WorkshopStyleLibraryEntry, "id" | "createdAt" | "updatedAt"> = { familyId, revision, source: style.source, name: style.name, accent: style.accent, ink: style.ink, paper: style.paper, paletteRoles: style.paletteRoles, typographyRoles: style.typographyRoles, brandAssets: style.brandAssets, logos: style.logos, licensedFonts: style.licensedFonts, references: style.references, negativeRules: style.negativeRules, intentProfile: style.intentProfile, referenceUrl: style.referenceUrl };
  db.prepare("INSERT INTO style_library (id, style_json, created_at, updated_at) VALUES (?, ?, ?, ?)").run(id, JSON.stringify(snapshot), now, now);
  return { id, familyId, revision };
}
function applyLockedStyle(current: WorkshopState, style: WorkshopStyle, root?: string, saveToLibrary = true) {
  const library = saveToLibrary ? saveStyleToLibrary(style, root) : { id: style.libraryId, familyId: style.libraryFamilyId, revision: style.libraryRevision }; const saved = { ...style, libraryId: library.id, libraryFamilyId: library.familyId, libraryRevision: library.revision };
  return write({ ...current, ...(current.style ? staleStyleDependents(current) : {}), style: saved, designArtifact: materializeDesignArtifact(saved, current.id, root), updatedAt: saved.lockedAt }, root);
}
export async function lockWebsiteStyle(rawUrl: string, root?: string, fetchImpl: typeof fetch = fetch, requestedIntent?: WorkshopStyle["intentProfile"], reviewed?: ManualStyleInput): Promise<WorkshopState> {
  const suggestion = reviewed ? { ...reviewed, referenceUrl: reviewedWebsiteUrl(rawUrl) } : await analyzeWebsiteStyle(rawUrl, fetchImpl); const current = readWorkshopState(root); const updatedAt = new Date().toISOString();
  const candidateFonts = cleanStyleList("fontCandidates" in suggestion ? suggestion.fontCandidates : suggestion.licensedFonts);
  const headingFont = reviewed?.headingFont?.trim() || candidateFonts[0] || "system-ui";
  const bodyFont = reviewed?.bodyFont?.trim() || candidateFonts[1] || headingFont;
  const fontsConfirmed = reviewed?.fontsConfirmed ?? Boolean(reviewed?.licensedFonts?.length);
  const accent = color(suggestion.accent, "#1668E3"); const ink = color(suggestion.ink, "#171816"); const paper = color(suggestion.paper, "#F4F2EC"); assertReadablePalette(ink, paper);
  const brandAssets = await persistSelectedBrandAssets(reviewed?.selectedAssetUrls, current.id, updatedAt, root, fetchImpl);
  const name = suggestion.name?.trim() || "Website foundation"; const sameFamily = current.style?.name === name ? current.style : undefined;
  const style: WorkshopStyle = { version: (current.style?.version ?? 0) + 1, source: "website", name, accent, ink, paper, paletteRoles: paletteRoles(accent, ink, paper, "website"), typographyRoles: typographyRoles(headingFont, bodyFont, fontsConfirmed ? "user_confirmed" : "unverified", "website"), brandAssets, logos: brandAssets.map((asset) => asset.localPath), licensedFonts: fontsConfirmed ? cleanStyleList([headingFont, bodyFont]).filter((font) => !isSystemFont(font)) : [], references: cleanStyleList(suggestion.references), negativeRules: cleanStyleList(suggestion.negativeRules), intentProfile: intentProfile(reviewed?.intentProfile ?? requestedIntent ?? current.onboarding.outcome), referenceUrl: suggestion.referenceUrl, libraryId: sameFamily?.libraryId, libraryFamilyId: sameFamily?.libraryFamilyId, libraryRevision: sameFamily?.libraryRevision, lockedAt: updatedAt, stale: false };
  return applyLockedStyle(current, style, root);
}
function cleanStyleList(values: string[] | undefined) { return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))]; }
function color(value: string | undefined, fallback: string) { const candidate = (value ?? fallback).trim().toUpperCase(); if (!/^#[0-9A-F]{6}$/.test(candidate)) throw new Error("Style colors must use exact six-digit hex values."); return candidate; }
function assertReadablePalette(ink: string, paper: string) { if (contrastRatio(ink, paper) < 4.5) throw new Error("Text and Background need at least 4.5:1 contrast for readable work."); }
function intentProfile(value: WorkshopStyle["intentProfile"] | undefined) { const profile = value ?? "client_facing_pitch"; if (!["client_facing_pitch", "board_deck", "internal_workshop"].includes(profile)) throw new Error("Invalid intent profile."); return profile; }
export function designDirectivesForStyle(style: WorkshopStyle) {
  const profiles = {
    client_facing_pitch: {
      layout: ["Use a decisive opening, generous whitespace, and one primary idea per frame.", "Keep proof visible but subordinate to the recommendation."],
      imageTreatment: ["Use object-led editorial imagery with restrained depth and a consistent focal motif.", "Reserve clean negative space for deterministic titles."],
      motion: ["Use calm editorial reveals and short crossfades.", "Avoid decorative motion that competes with the narration."],
    },
    board_deck: {
      layout: ["Use compact executive hierarchy, aligned evidence, and stable comparison grids.", "Prioritize legibility and decision context over spectacle."],
      imageTreatment: ["Favor diagrams, proof structures, and restrained section art.", "Avoid metaphor when a direct evidence visual is clearer."],
      motion: ["Use minimal fades and direct cuts.", "Keep charts and evidence stationary long enough to inspect."],
    },
    internal_workshop: {
      layout: ["Use facilitation-first clusters, writable space, and highly scannable action groups.", "Keep one clear prompt or decision per frame."],
      imageTreatment: ["Favor approachable diagrammatic forms and workshop artifacts.", "Keep visual texture light enough for annotation."],
      motion: ["Use quick spatial reveals that preserve orientation.", "Avoid cinematic transitions that slow active work."],
    },
  } as const;
  return profiles[style.intentProfile];
}
function materializeDesignArtifact(style: WorkshopStyle, workshopId: string, root?: string): WorkshopDesignArtifact {
  const dataRoot = root ?? repositoryDataRoot(); const markdownPath = workshopGeneratedPath(workshopId, `DESIGN-v${style.version}.md`); const tokensPath = workshopGeneratedPath(workshopId, `DESIGN-v${style.version}.tokens.json`); const generated = join(dataRoot, dirname(markdownPath));
  const directives = designDirectivesForStyle(style);
  const markdown = `# DESIGN.md\n\n## Foundation\n- Name: ${style.name}\n- Workshop version: ${style.version}\n- Company Style revision: ${style.libraryRevision ?? 1}\n- Source: ${style.source}\n- Intent profile: ${style.intentProfile}\n\n## Palette\n- Accent: ${style.paletteRoles.accent.value} (${style.paletteRoles.accent.source})\n- Text: ${style.paletteRoles.text.value} (${style.paletteRoles.text.source})\n- Background: ${style.paletteRoles.background.value} (${style.paletteRoles.background.source})\n\n## Typography\n- Heading: ${style.typographyRoles.heading.family} (${style.typographyRoles.heading.availability})\n- Body: ${style.typographyRoles.body.family} (${style.typographyRoles.body.availability})\n\n## Layout\n${directives.layout.map((rule) => `- ${rule}`).join("\n")}\n\n## Image treatment\n${directives.imageTreatment.map((rule) => `- ${rule}`).join("\n")}\n\n## Motion\n${directives.motion.map((rule) => `- ${rule}`).join("\n")}\n\n## Licensed inputs\n${style.licensedFonts.length ? style.licensedFonts.map((font) => `- Confirmed font: ${font}`).join("\n") : "- Confirmed fonts: none; renderers use system fallbacks"}\n${style.brandAssets.length ? style.brandAssets.map((asset) => `- Brand asset: ${asset.localPath} (${asset.width}×${asset.height}, sha256:${asset.sha256})`).join("\n") : "- Brand assets: none selected"}\n\n## References\n${style.references.length ? style.references.map((reference) => `- ${reference}`).join("\n") : "- No external visual references recorded"}\n\n## Negative rules\n${style.negativeRules.length ? style.negativeRules.map((rule) => `- ${rule}`).join("\n") : "- No negative rules recorded"}\n\n## Provenance\n- Locked: ${style.lockedAt}\n${style.referenceUrl ? `- Website reference: ${style.referenceUrl}\n` : ""}`;
  const tokens = { schemaVersion: 4, styleVersion: style.version, libraryFamilyId: style.libraryFamilyId, libraryRevision: style.libraryRevision ?? 1, source: style.source, name: style.name, palette: { accent: style.accent, ink: style.ink, paper: style.paper }, paletteRoles: style.paletteRoles, typographyRoles: style.typographyRoles, layoutRules: directives.layout, imageTreatmentRules: directives.imageTreatment, motionRules: directives.motion, brandAssets: style.brandAssets, logos: style.logos, licensedFonts: style.licensedFonts, references: style.references, negativeRules: style.negativeRules, intentProfile: style.intentProfile, referenceUrl: style.referenceUrl, lockedAt: style.lockedAt };
  mkdirSync(generated, { recursive: true }); writeFileSync(join(dataRoot, markdownPath), markdown, "utf8"); writeFileSync(join(dataRoot, tokensPath), `${JSON.stringify(tokens, null, 2)}\n`, "utf8");
  return { version: style.version, styleVersion: style.version, markdownPath, tokensPath, stale: false, createdAt: style.lockedAt };
}
function staleStyleDependents(current: WorkshopState) { return { sketch: current.sketch ? { ...current.sketch, stale: true, approved: false } : undefined, visualDna: current.visualDna ? { ...current.visualDna, stale: true, approved: false } : undefined, assetPlan: current.assetPlan ? { ...current.assetPlan, stale: true } : undefined, storyboard: { ...current.storyboard, stale: true, panels: current.storyboard.panels.map((panel) => ({ ...panel, stale: true })) }, imageBatch: current.imageBatch ? { ...current.imageBatch, stale: true } : undefined, narration: current.narration ? { ...current.narration, stale: true } : undefined, audioOverviews: staleAudioOverviews(current), outputs: current.outputs.map((output) => ({ ...output, stale: true })), videos: staleVideos(current), storyboardApproved: false, videoState: "blocked" as const }; }
export function lockManualStyle(input: ManualStyleInput = {}, root?: string): WorkshopState {
  const current = readWorkshopState(root); const updatedAt = new Date().toISOString();
  const accent = color(input.accent, "#1668E3"); const ink = color(input.ink, "#171816"); const paper = color(input.paper, "#F4F2EC"); assertReadablePalette(ink, paper);
  const suppliedFonts = cleanStyleList(input.licensedFonts); const headingFont = input.headingFont?.trim() || suppliedFonts[0] || "system-ui"; const bodyFont = input.bodyFont?.trim() || suppliedFonts[1] || headingFont;
  const fontsConfirmed = input.fontsConfirmed ?? Boolean(suppliedFonts.length); const evidenceSource: StyleEvidenceSource = Object.keys(input).length ? "manual" : "default";
  const brandAssets = current.style?.source === "manual" ? current.style.brandAssets : [];
  const name = input.name?.trim() || "Clean professional"; const sameFamily = current.style?.name === name ? current.style : undefined;
  const style: WorkshopStyle = { version: (current.style?.version ?? 0) + 1, source: "manual", name, accent, ink, paper, paletteRoles: paletteRoles(accent, ink, paper, evidenceSource), typographyRoles: typographyRoles(headingFont, bodyFont, fontsConfirmed ? "user_confirmed" : "unverified", evidenceSource), brandAssets, logos: cleanStyleList(input.logos), licensedFonts: fontsConfirmed ? cleanStyleList([headingFont, bodyFont]).filter((font) => !isSystemFont(font)) : [], references: cleanStyleList(input.references), negativeRules: cleanStyleList(input.negativeRules), intentProfile: intentProfile(input.intentProfile ?? current.onboarding.outcome), libraryId: sameFamily?.libraryId, libraryFamilyId: sameFamily?.libraryFamilyId, libraryRevision: sameFamily?.libraryRevision, lockedAt: updatedAt, stale: false };
  return applyLockedStyle(current, style, root);
}
export function applyStyleLibrary(styleId: string, requestedIntent?: WorkshopStyle["intentProfile"], root?: string): WorkshopState {
  const db = dbFor(root); const row = db.prepare("SELECT style_json FROM style_library WHERE id=?").get(styleId) as { style_json: string } | undefined;
  if (!row) throw new Error("Saved Style not found.");
  const entry = normalizeStyleMetadata(JSON.parse(row.style_json) as Omit<WorkshopStyleLibraryEntry, "id" | "createdAt" | "updatedAt">); const current = readWorkshopState(root); const lockedAt = new Date().toISOString();
  const { familyId = styleId, revision = 1, ...snapshot } = entry;
  const style: WorkshopStyle = { ...snapshot, version: (current.style?.version ?? 0) + 1, libraryId: styleId, libraryFamilyId: familyId, libraryRevision: revision, intentProfile: intentProfile(requestedIntent ?? current.onboarding.outcome ?? entry.intentProfile), lockedAt, stale: false };
  return applyLockedStyle(current, style, root, false);
}
export function createVisualDna(root?: string): WorkshopState { const current = readWorkshopState(root); if (!current.style || current.style.stale) throw new Error("Visual DNA requires a current locked Style Foundation."); const createdAt = new Date().toISOString(); const profileRule = current.style.intentProfile === "board_deck" ? "Executive hierarchy with source-visible proof points." : current.style.intentProfile === "internal_workshop" ? "Facilitation-first working canvas with writable space." : "Client-ready narrative sequence with a decisive opening."; return write({ ...current, visualDna: { version: (current.visualDna?.version ?? 0) + 1, styleVersion: current.style.version, palette: { accent: current.style.accent, ink: current.style.ink, paper: current.style.paper }, compositionRules: [profileRule, "Repeat one accent-colored folded-plane motif across the complete image set.", ...current.style.references], textureRules: ["Matte paper forms, restrained depth, soft directional shadow, and clean negative space."], imageRules: ["Create diagrammatic concept visuals and section art suitable for direct placement in a professional presentation.", "Prefer object-led editorial composition over people, devices, screens, or generic workplace scenes."], negativeRules: current.style.negativeRules, approved: false, stale: false, createdAt }, updatedAt: createdAt }, root); }
function escapeSvg(value: string) { return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;"); }
function sketchLines(value: string, maxCharacters: number, maxLines: number) {
  const words = value.trim().split(/\s+/).filter(Boolean); const lines: string[] = []; let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length <= maxCharacters) { line = next; continue; }
    if (line) lines.push(line);
    line = word;
    if (lines.length === maxLines - 1) break;
  }
  if (line && lines.length < maxLines) lines.push(line);
  const consumed = lines.join(" ").split(/\s+/).filter(Boolean).length;
  if (consumed < words.length && lines.length) lines[lines.length - 1] = `${lines.at(-1)!.replace(/[.,;:]?$/, "")}…`;
  return lines;
}
function sketchOffset(id: string, salt: string, amplitude: number) {
  const value = createHash("sha256").update(`${id}:${salt}`).digest().readUInt16BE(0) / 65535;
  return (value * 2 - 1) * amplitude;
}
function renderSketchSvg(current: WorkshopState, version: number) {
  const width = 1600; const height = 900; const nodes = current.mapNodes.slice(0, 12); const columns = nodes.length <= 6 ? Math.min(3, Math.max(1, nodes.length)) : 4; const rows = Math.max(1, Math.ceil(nodes.length / columns));
  const gap = 34; const left = 70; const top = 128; const usableWidth = width - left * 2; const usableHeight = height - top - 88; const cardWidth = (usableWidth - gap * (columns - 1)) / columns; const cardHeight = Math.min(250, (usableHeight - gap * (rows - 1)) / rows);
  const style = current.style; const accent = style?.accent ?? "#1668E3"; const ink = style?.ink ?? "#171816"; const paper = style?.paper ?? "#F4F2EC"; const font = escapeSvg(style?.typographyRoles.heading.family ?? "system-ui");
  const positions = new Map(nodes.map((node, index) => [node.id, { x: left + (index % columns) * (cardWidth + gap), y: top + Math.floor(index / columns) * (cardHeight + gap) }]));
  const connectors = current.mapEdges.flatMap((edge) => { const from = positions.get(edge.from); const to = positions.get(edge.to); if (!from || !to) return []; const x1 = from.x + cardWidth / 2; const y1 = from.y + cardHeight / 2; const x2 = to.x + cardWidth / 2; const y2 = to.y + cardHeight / 2; const bend = sketchOffset(edge.id, "bend", 34); const path = `M ${x1.toFixed(1)} ${y1.toFixed(1)} C ${(x1 + (x2 - x1) * .38 + bend).toFixed(1)} ${(y1 + (y2 - y1) * .12).toFixed(1)}, ${(x1 + (x2 - x1) * .62 - bend).toFixed(1)} ${(y1 + (y2 - y1) * .88).toFixed(1)}, ${x2.toFixed(1)} ${y2.toFixed(1)}`; return [`<path d="${path}" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" opacity=".48"/>`, `<path d="${path}" transform="translate(${sketchOffset(edge.id, "x", 2).toFixed(1)} ${sketchOffset(edge.id, "y", 2).toFixed(1)})" fill="none" stroke="${ink}" stroke-width="1.4" stroke-linecap="round" opacity=".28"/>`]; }).join("");
  const cards = nodes.map((node, index) => { const position = positions.get(node.id)!; const rotation = sketchOffset(node.id, "rotation", 1.2); const title = sketchLines(node.title, Math.max(18, Math.floor(cardWidth / 13)), cardHeight >= 240 ? 3 : 2); const body = sketchLines(node.body === node.title ? node.locator : node.body, Math.max(24, Math.floor(cardWidth / 10)), cardHeight >= 240 ? 4 : cardHeight < 155 ? 2 : 3); const semantic = node.kind === "grounded" ? accent : node.kind === "derived" ? "#A15C00" : "#7A45B8"; const titleStart = 78; const bodyStart = titleStart + title.length * 28 + 10; return `<g transform="translate(${position.x.toFixed(1)} ${position.y.toFixed(1)}) rotate(${rotation.toFixed(2)} ${(cardWidth / 2).toFixed(1)} ${(cardHeight / 2).toFixed(1)})">
  <rect x="2" y="2" width="${(cardWidth - 4).toFixed(1)}" height="${(cardHeight - 4).toFixed(1)}" rx="24" fill="#FFFFFF" stroke="${ink}" stroke-width="2.4"/>
  <path d="M 18 9 Q ${(cardWidth * .46).toFixed(1)} ${sketchOffset(node.id, "top", 5).toFixed(1)} ${(cardWidth - 18).toFixed(1)} 12 M ${(cardWidth - 9).toFixed(1)} 19 Q ${(cardWidth + sketchOffset(node.id, "right", 5)).toFixed(1)} ${(cardHeight * .5).toFixed(1)} ${(cardWidth - 12).toFixed(1)} ${(cardHeight - 18).toFixed(1)} M ${(cardWidth - 18).toFixed(1)} ${(cardHeight - 9).toFixed(1)} Q ${(cardWidth * .52).toFixed(1)} ${(cardHeight + sketchOffset(node.id, "bottom", 5)).toFixed(1)} 18 ${(cardHeight - 12).toFixed(1)}" fill="none" stroke="${ink}" stroke-width="1.2" stroke-linecap="round" opacity=".48"/>
  <circle cx="26" cy="28" r="7" fill="${semantic}"/><text x="43" y="33" fill="${ink}" font-family="${font}, system-ui, sans-serif" font-size="15" font-weight="600">${node.kind === "grounded" ? "SOURCED" : node.kind.toUpperCase()}</text>
  ${title.map((line, lineIndex) => `<text x="26" y="${titleStart + lineIndex * 28}" fill="${ink}" font-family="${font}, system-ui, sans-serif" font-size="22" font-weight="700">${escapeSvg(line)}</text>`).join("")}
  ${body.map((line, lineIndex) => `<text x="26" y="${bodyStart + lineIndex * 22}" fill="${ink}" font-family="system-ui, sans-serif" font-size="15" opacity=".68">${escapeSvg(line)}</text>`).join("")}
</g>`; }).join("");
  const sourceCount = current.activeSourceIds.length; return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title description">
<title id="title">${escapeSvg(current.title)} hand-drawn Sketch</title><desc id="description">A source-grounded hand-drawn view of the approved Map.</desc>
<rect width="${width}" height="${height}" fill="${paper}"/><path d="M 0 76 H ${width}" stroke="${accent}" stroke-width="3" opacity=".22"/>
<text x="70" y="58" fill="${ink}" font-family="${font}, system-ui, sans-serif" font-size="30" font-weight="700">${escapeSvg(current.title)}</text><text x="1530" y="56" text-anchor="end" fill="${ink}" font-family="system-ui, sans-serif" font-size="16" opacity=".58">HAND-DRAWN SKETCH · V${version}</text>
${connectors}${cards}
<text x="70" y="858" fill="${ink}" font-family="system-ui, sans-serif" font-size="16" opacity=".58">From approved Map · ${nodes.length} ideas · ${sourceCount} ${sourceCount === 1 ? "source" : "sources"}</text><path d="M 70 872 Q 360 866 650 873" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round" opacity=".62"/>
</svg>`; }
export function createSketch(root?: string): WorkshopState {
  const current = readWorkshopState(root); if (!current.briefApproved || !current.frame || current.frame.stale) throw new Error("Sketch requires an approved current Map.");
  const dataRoot = root ?? repositoryDataRoot(); const version = (current.sketch?.version ?? 0) + 1; const relativePath = workshopGeneratedPath(current.id, `sketch-v${version}.svg`); const svg = renderSketchSvg(current, version); const createdAt = new Date().toISOString();
  mkdirSync(join(dataRoot, dirname(relativePath)), { recursive: true }); writeFileSync(join(dataRoot, relativePath), svg, "utf8");
  const claimIds = activeClaimsFor(current).map((claim) => claim.id);
  const prior = current.sketch ? { ...current.sketch, stale: true, approved: false } : undefined;
  return write({ ...current, sketch: { version, graphRevision: graphFor(current).graph.revision, styleVersion: current.style?.version, nodes: current.mapNodes.map(({ id, title, body, kind, locator }) => ({ id, title, body, kind, locator })), edges: current.mapEdges, claimIds, relativePath, sha256: createHash("sha256").update(svg).digest("hex"), stale: false, approved: false, createdAt }, sketchHistory: [...current.sketchHistory, ...(prior ? [prior] : [])], updatedAt: createdAt }, root);
}
export function approveSketch(root?: string): WorkshopState { const current = readWorkshopState(root); if (!current.sketch || current.sketch.stale) throw new Error("A current Sketch preview is required."); return write({ ...current, sketch: { ...current.sketch, approved: true }, updatedAt: new Date().toISOString() }, root); }
export function approveVisualDna(root?: string): WorkshopState { const current = readWorkshopState(root); if (!current.visualDna || current.visualDna.stale) throw new Error("A current Visual DNA preview is required."); return write({ ...current, visualDna: { ...current.visualDna, approved: true }, updatedAt: new Date().toISOString() }, root); }
export function generateAssetPlan(root?: string): WorkshopState {
  const current = readWorkshopState(root);
  if (!current.briefApproved || !current.frame || current.frame.stale) throw new Error("Asset planning requires an approved current brief.");
  if (!current.style || current.style.stale) throw new Error("Asset planning requires a locked current Style Foundation.");
  const graph = graphFor(current).graph;
  const claimEvidence: WorkshopEvidenceReference[] = activeClaimsFor(current).slice(0, 4).map((claim) => ({ claimId: claim.id, sourceId: claim.sourceId, chunkId: claim.chunkId, locator: claim.locator }));
  const mapEvidence: WorkshopEvidenceReference[] = current.mapNodes
    .filter((node): node is WorkshopMapNode & { sourceId: string } => node.kind === "grounded" && Boolean(node.sourceId) && current.activeSourceIds.includes(node.sourceId!))
    .slice(0, 4)
    .map((node) => ({ sourceId: node.sourceId, locator: node.locator }));
  const proof = claimEvidence.length ? claimEvidence : mapEvidence;
  const createdAt = new Date().toISOString();
  const version = (current.assetPlan?.version ?? 0) + 1;
  const definitions = [
    ["deck", "Presentation", "The approved Brief becomes a polished, source-defensible Presentation."],
    ["infographic", "Infographic", "The same evidence becomes a one-page visual for faster decisions."],
    ["images", "Image set", "Six on-brand images share one coherent visual language."],
    ["storyboard", "Storyboard", "Review and edit every frame before committing to video."],
    ["video", "Demo video", "Then create the approved story with Cedar narration."],
  ] as const;
  const items: WorkshopAssetPlan["items"] = definitions.map(([outputType, title, prompt], index) => {
    const evidence = proof.length ? [proof[index % proof.length]!] : [];
    return { id: `asset-plan-${version}-${outputType}`, outputType, title, prompt, locator: evidence[0]?.locator ?? "Approved Map", evidence };
  });
  return write({ ...current, assetPlan: { version, graphRevision: graph.revision, briefVersion: current.frame.version, styleVersion: current.style.version, visualDnaVersion: current.visualDna && !current.visualDna.stale ? current.visualDna.version : undefined, evidenceClaimIds: claimEvidence.flatMap((reference) => reference.claimId ? [reference.claimId] : []), items, stale: false, createdAt }, updatedAt: createdAt }, root);
}
export function generateStoryboard(root?: string): WorkshopState {
  const current = readWorkshopState(root);
  if (!current.assetPlan || current.assetPlan.stale) throw new Error("Storyboard generation requires a current approved-input asset plan.");
  const grounded = activeClaimsFor(current);
  const fallbackTitles = ["The opportunity", "The friction", "The proof", "The direction", "What changes next"];
  const usedTitles = new Set<string>();
  const panels = current.assetPlan.items.map((item, index) => {
    const image = current.imageBatch && !current.imageBatch.stale ? current.imageBatch.panels[index % current.imageBatch.panels.length] : undefined;
    const claim = grounded[index % Math.max(1, grounded.length)];
    const evidence: WorkshopEvidenceReference[] = claim
      ? [{ claimId: claim.id, sourceId: claim.sourceId, chunkId: claim.chunkId, locator: claim.locator }]
      : item.evidence ?? [];
    const narrationText = prose(claim?.text ?? item.prompt);
    const narration = /[.!?]$/.test(narrationText) ? narrationText : `${narrationText}.`;
    const proposedTitle = /\b(fragmented|friction|lost|slow|waste|problem|bottleneck|handoff)\b/i.test(narration)
      ? "The friction"
      : /\b(experience|workflow|flow|immediate|journey)\b/i.test(narration)
        ? "The experience"
        : /\b(trace|traceable|trust|defend|citation)\b/i.test(narration)
            ? "Trust by design"
          : /\b(should|must|recommend|direction|prioriti[sz]e|next)\b/i.test(narration)
            ? "The direction"
            : /\b(source|evidence|grounded)\b/i.test(narration)
              ? "The evidence"
              : fallbackTitles[index] ?? `Scene ${index + 1}`;
    const title = usedTitles.has(proposedTitle) ? fallbackTitles[index] ?? `Scene ${index + 1}` : proposedTitle;
    usedTitles.add(title);
    const durationSeconds = Math.max(4, Math.ceil(narration.split(/\s+/).filter(Boolean).length / 2.5) + 1);
    return { id: `storyboard-v${current.storyboard.version + 1}-panel-${index + 1}`, title, narration, durationSeconds, claimIds: evidence.flatMap((reference) => reference.claimId ? [reference.claimId] : []), evidence, imagePanelId: image?.id, imagePanelVersion: image?.version, imageRelativePath: image?.relativePath, imageSha256: image?.sha256, approved: true, stale: false };
  });
  return write({ ...current, storyboard: { version: current.storyboard.version + 1, panels, stale: false, approved: false }, storyboardHistory: storyboardHistoryWithCurrent(current), narration: current.narration ? { ...current.narration, stale: true } : undefined, videos: staleVideos(current), storyboardApproved: false, videoState: "blocked", updatedAt: new Date().toISOString() }, root);
}
function outputHeading(text: string, limit = 82) { if (text.length <= limit) return text; const clipped = text.slice(0, limit).trimEnd(); return `${clipped.slice(0, clipped.lastIndexOf(" ")).trim()}…`; }
function outputBody(text: string) { if (text.length <= 240) return text; const clipped = text.slice(0, 240).trimEnd(); return `${clipped.slice(0, clipped.lastIndexOf(" ")).trim()}…`; }
type DeckRole = "statement" | "split" | "proof" | "recommendation";
const deckRoles: readonly DeckRole[] = ["statement", "split", "proof", "recommendation"];
const roleSignals: Record<DeckRole, RegExp> = {
  statement: /\b(turns?|becomes?|helps?|delivers?|enables?|creates?|outcome|promise|from\b.+\bto)\b/i,
  split: /\b(problem|cost|friction|weakness|fails?|failure|dies?|gap|bottleneck|disconnected|slow|expect(?:ed|ations?)|mandates?|requirements?|requires?|commit(?:ment|ting)?|hours?|frequency|sustainable)\b/i,
  proof: /\b(evidence|source|trace|trust|verified|data|measure|claim|citation|grounded|defend|global|countries|organizers?|members?|worldwide)\b/i,
  recommendation: /\b(should|must|recommend|start|make|prioriti[sz]e|focus|ship|use|adopt|next)\b/i,
};
function prose(text: string) {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*[-*+]\s+(?:\[[ xX]\]\s*)?/gm, "")
    .replace(/^\s*[●•▪◦]\s*/gm, "")
    .replace(/[*_`~]/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
const deckTopicStopwords = new Set(["about", "brief", "briefing", "client", "deck", "leadership", "presentation", "strategy", "the", "this", "with", "workshop"]);
function deckTopicTerms(title: string) { return prose(title).toLowerCase().split(/[^\p{L}\p{N}]+/u).filter((term) => term.length >= 4 && !deckTopicStopwords.has(term)); }
function deckCandidateScore(text: string, role: DeckRole, raw: string, sourcePriority: number, topicTerms: string[], topicContext: string, sourceType: WorkshopSource["type"] | undefined) {
  const words = text.split(/\s+/).filter(Boolean).length;
  if (isSourceMetadataChunk(raw) || /^\s*(?:\||#{1,6}\s)/.test(raw) || /:\s*$/.test(text) || words < 4 || text.length < 24 || /^(?:md|json|tsx?|html)\b|^(?:date|status|last (updated|refreshed)|at a glance|hackathon|track|deadline|source|version)\b\s*:?/i.test(text)) return Number.NEGATIVE_INFINITY;
  let score = roleSignals[role].test(text) ? 12 : 0;
  if (words >= 8 && words <= 34) score += 6;
  else if (words <= 48) score += 2;
  if (/\b(is|are|lives?|turns?|becomes?|helps?|keeps?|makes?|needs?|requires?|produces?|preserves?|reduces?|improves?|remains?|links?|traces?)\b/i.test(text)) score += 3;
  if (/\b(because|so that|without|faster|rather than|instead|only if|while)\b/i.test(text)) score += 2;
  if (/\b(professional|client|leadership|leader|resource|impact|visibility|deliverable|ship|standards|workflow|trust|defend|grounded|brand(?:ed)?)\b/i.test(text)) score += 4;
  const topicOverlap = topicTerms.filter((term) => topicContext.toLowerCase().includes(term)).length;
  score += Math.min(16, topicOverlap * 8);
  if (topicTerms.length && !topicOverlap) score -= 12;
  if (role === "statement" && /\b(professional|client|leadership|defend|deliverable|outcome|promise)\b/i.test(text)) score += 8;
  if (role === "proof" && /\bexact\s+source\b/i.test(text)) score += 12;
  if (role === "proof" && /\b\d[\d,+.%]*\b/.test(text)) score += 8;
  if (role === "proof" && sourceType === "WEB") score += 12;
  if (role === "recommendation" && /\b(start|should|must|recommend|next|begin|adopt|prioriti[sz]e)\b/i.test(text)) score += 10;
  if (role === "recommendation" && /\b(start|launch|begin)\s+(?:a|the|your)\s+(?:chapter|project|program|workshop|pilot|team|deck)\b/i.test(text)) score += 12;
  if (role === "recommendation" && /\b(deck|output|deliverable|diagram|image|storyboard|video)\b/i.test(text)) score += 5;
  score += sourcePriority;
  if (/https?:\/\/|\.(md|json|tsx?|html)\b|\/Users\//i.test(text)) score -= 8;
  if ((text.match(/:/g) ?? []).length > 2) score -= 4;
  return score;
}
function selectDeckClaims(state: WorkshopState) {
  const topicTerms = deckTopicTerms(state.title);
  const chunks = new Map(state.sourceChunks.map((chunk) => [chunk.id, chunk]));
  const candidates = activeClaimsFor(state).map((claim, order) => {
    const source = state.sourceItems.find((candidate) => candidate.id === claim.sourceId);
    return { claim, order, raw: chunks.get(claim.chunkId)?.text ?? claim.text, text: prose(claim.text), sourceType: source?.type, topicContext: source?.type === "WEB" ? claim.text : `${claim.text} ${source?.title ?? ""}`, sourcePriority: Math.max(0, state.activeSourceIds.length - state.activeSourceIds.indexOf(claim.sourceId)) };
  });
  const used = new Set<string>();
  return deckRoles.flatMap((role) => {
    const scored = candidates
      .filter((candidate) => !used.has(candidate.claim.id))
      .map((candidate) => ({ ...candidate, roleMatch: roleSignals[role].test(candidate.text), score: deckCandidateScore(candidate.text, role, candidate.raw, candidate.sourcePriority, topicTerms, candidate.topicContext, candidate.sourceType) }))
      .filter((candidate) => Number.isFinite(candidate.score));
    const roleMatched = scored.filter((candidate) => candidate.roleMatch);
    const ranked = (roleMatched.length ? roleMatched : scored)
      .sort((left, right) => right.score - left.score || Number(right.roleMatch) - Number(left.roleMatch) || left.order - right.order);
    const selected = ranked[0];
    if (!selected) return [];
    used.add(selected.claim.id);
    return [{ ...selected, role }];
  });
}
function parallelTransformation(text: string) {
  const match = text.match(/^(.+?)\s+(becomes?|turns? into)\s+([^,.;]+?)\s+and\s+([^,.;]+)[.]?$/i);
  if (!match) return undefined;
  const [, subject, verb, primary, rawSecondary] = match;
  const article = primary.match(/^(a|an)\s+/i)?.[1];
  const secondary = article && !/^(?:a|an|the)\s+/i.test(rawSecondary) ? `${article} ${rawSecondary}` : rawSecondary;
  return {
    heading: `${subject} ${verb} ${primary}`,
    body: `${subject} also ${verb} ${secondary}.`,
  };
}
function deckHeading(text: string, role: DeckRole) {
  const transformation = text.match(/\b(?:should show how|shows? how)\s+(.+?)\s+(becomes?|turns? into)\s+([^,.;]+)/i);
  if (transformation) {
    const heading = `${transformation[1]} ${transformation[2]} ${transformation[3]}`.trim();
    return `${heading.charAt(0).toUpperCase()}${heading.slice(1)}`;
  }
  const parallel = parallelTransformation(text);
  if (parallel) return `${parallel.heading.charAt(0).toUpperCase()}${parallel.heading.slice(1)}`;
  const sequence = deckSequence(text);
  if (sequence.length >= 3) return `One continuous path from ${sequence[0]} to ${sequence.at(-1)}`;
  if (role === "recommendation") {
    const action = text.match(/\b(?:start|launch|begin)\s+(?:a|the|your)\s+(?:chapter|project|program|workshop|pilot|team|deck)(?:\s+(?:in|for|with)\s+[^,.;]+)?/i)?.[0];
    if (action) return action.charAt(0).toUpperCase() + action.slice(1);
  }
  const clause = text.split(/\s*[—–]\s*|[;:]\s|,\s+(?=(?:but|because|while|which|with|without|so)\b)|\s+(?=(?:using|through|that)\b)/i)[0]?.trim() ?? text;
  return outputHeading(clause.length >= 24 ? clause : text, role === "recommendation" ? 96 : 82);
}
function deckBody(text: string, heading: string) {
  const transformation = text.match(/\b(?:should show how|shows? how)\s+(.+?)\s+(becomes?|turns? into)\s+([^,.;]+)/i);
  if (transformation?.index !== undefined) {
    const remainder = text.slice(transformation.index + transformation[0].length).replace(/^\s*,\s*/, "").replace(/[.]$/, "").trim();
    if (remainder) return canonicalDeckObjects(`The path continues through ${remainder}.`);
  }
  const parallel = parallelTransformation(text);
  if (parallel) return canonicalDeckObjects(parallel.body);
  if (deckSequence(text).length >= 3) return "";
  const headingPrefix = heading.replace(/…$/, "").trim();
  if (heading.endsWith("…") && text.toLowerCase().startsWith(headingPrefix.toLowerCase())) return text.slice(headingPrefix.length).replace(/^\s*[,;:—–-]\s*/, "").trim();
  if (!text.toLowerCase().startsWith(heading.toLowerCase())) return text;
  const remainder = text.slice(heading.length);
  const sentenceBreak = /^\s*[:;—–-]\s*/.test(remainder);
  const clean = remainder.replace(/^\s*[,;:—–-]\s*/, "").trim();
  return sentenceBreak ? `${clean.charAt(0).toUpperCase()}${clean.slice(1)}` : clean;
}
function canonicalDeckObjects(text: string) {
  return text.replace(/\bbrief\b/g, "Brief").replace(/\bstoryboard\b/g, "Storyboard").replace(/\b(?:demo\s+)?video\b/g, "Video");
}
function deckSequence(text: string) {
  const match = text.match(/\b[A-Z][\p{L}\p{N}-]{2,}\s*(?:(?:→|to)\s*[A-Z][\p{L}\p{N}-]{2,}\s*){2,5}/u);
  return match ? match[0].trim().split(/\s*(?:→|to)\s*/i) : [];
}
function displaySourceTitle(title: string) {
  const clean = title.replace(/\.(?:pdf|docx?|pptx?|txt)$/i, "").trim();
  const segments = clean.split(/\s+[|·]\s+/).map((segment) => segment.trim()).filter(Boolean);
  const selected = segments.length > 1 ? segments.at(-1)! : clean;
  return selected.length > 58 ? `${selected.slice(0, 57).trimEnd()}…` : selected;
}
function citationLabel(state: WorkshopState, sourceId: string, locator: string) {
  const source = state.sourceItems.find((candidate) => candidate.id === sourceId);
  const position = locator.split(" · ").at(-1);
  const sourceTitle = source?.origin.includes("capture-only fallback")
    ? "Voice brainstorm"
    : source?.origin === "Founder-provided recording"
      ? "Founder brainstorm"
      : displaySourceTitle(source?.title ?? "Source");
  return [sourceTitle, position].filter(Boolean).join(" · ");
}
async function embeddedLocalLogo(style: WorkshopStyle, root: string) {
  for (const asset of style.brandAssets) {
    const path = resolve(root, asset.localPath); const bytes = await readFile(path);
    if (createHash("sha256").update(bytes).digest("hex") !== asset.sha256) throw new Error("Selected brand asset hash no longer matches the reviewed local copy.");
    const dimensions = validateBrandAsset(bytes, asset.contentType); if (dimensions.width !== asset.width || dimensions.height !== asset.height) throw new Error("Selected brand asset dimensions no longer match the reviewed local copy.");
    return { data: `data:${asset.contentType};base64,${bytes.toString("base64")}`, width: dimensions.width, height: dimensions.height };
  }
  const contentTypes: Record<string, string> = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".svg": "image/svg+xml", ".webp": "image/webp" };
  for (const logo of style.logos) {
    if (/^https?:\/\//i.test(logo)) continue;
    const path = isAbsolute(logo) ? logo : resolve(root, logo); const contentType = contentTypes[extname(path).toLowerCase()];
    if (!contentType) continue;
    try { const bytes = await readFile(path); if (bytes.length > 2_000_000) continue; const dimensions = validateBrandAsset(bytes, contentType as WorkshopBrandAsset["contentType"]); return { data: `data:${contentType};base64,${bytes.toString("base64")}`, width: dimensions.width, height: dimensions.height }; } catch { continue; }
  }
  return undefined;
}
async function generatedDeckCoverVisual(current: WorkshopState, root: string): Promise<RenderVisual | undefined> {
  if (!current.imageBatch || current.imageBatch.stale) return undefined;
  const panel = current.imageBatch.panels.find((candidate) => candidate.id === "image-panel-1" && candidate.state === "generated")
    ?? current.imageBatch.panels.find((candidate) => candidate.state === "generated");
  if (!panel?.relativePath || !panel.sha256) return undefined;
  const bytes = await readFile(join(root, panel.relativePath));
  if (createHash("sha256").update(bytes).digest("hex") !== panel.sha256) throw new Error("Presentation visual hash no longer matches the reviewed image.");
  const dimensions = validateBrandAsset(bytes, "image/png");
  return { data: `data:image/png;base64,${bytes.toString("base64")}`, aspectRatio: dimensions.width / dimensions.height, panelId: panel.id, panelVersion: panel.version, sha256: panel.sha256 };
}
export async function generateOutput(type: "deck" | "infographic", root?: string): Promise<WorkshopState> {
  const current = readWorkshopState(root);
  if (!current.briefApproved || !current.frame || current.frame.stale) throw new Error("Creating work requires an approved current Brief.");
  if (!current.style || current.style.stale) throw new Error("Creating work requires a current Style.");
  const dataRoot = root ?? repositoryDataRoot(); const selectedClaims = selectDeckClaims(current);
  const blocks = selectedClaims.length ? selectedClaims.map(({ claim, text, role }) => {
    const heading = deckHeading(text, role);
    const body = deckBody(text, heading);
    const sequence = deckSequence(text);
    return { id: claim.id, heading, body: outputBody(body), items: sequence.length >= 3 ? sequence : undefined, citations: [claim.locator], citationLabel: citationLabel(current, claim.sourceId, claim.locator), layout: sequence.length >= 3 ? "sequence" as const : role };
  }) : current.mapNodes.filter((node) => node.kind === "grounded").slice(0, 4).map((node, index, all) => ({ id: node.id, heading: outputHeading(prose(node.title)), body: outputBody(prose(node.body)), citations: [node.locator], layout: index === 0 ? "statement" as const : index === all.length - 1 ? "recommendation" as const : index % 2 ? "split" as const : "proof" as const }));
  const outputId = `${type}-v${current.outputs.filter((output) => output.type === type).length + 1}`;
  const logo = await embeddedLocalLogo(current.style, dataRoot);
  const coverVisual = type === "deck" ? await generatedDeckCoverVisual(current, dataRoot) : undefined;
  const sourceCount = current.activeSourceIds.length;
  const summary = current.style.intentProfile === "board_deck"
    ? `Decision context and evidence grounded in ${sourceCount} selected ${sourceCount === 1 ? "source" : "sources"}.`
    : current.style.intentProfile === "internal_workshop"
      ? `A working plan grounded in ${sourceCount} selected ${sourceCount === 1 ? "source" : "sources"}.`
      : `A decision-ready brief grounded in ${sourceCount} selected ${sourceCount === 1 ? "source" : "sources"}.`;
  const rendered = await writeRenderedArtifact(dataRoot, current.id === defaultWorkshopId ? outputId : `${current.id}/${outputId}`, type, { workshopTitle: current.title, summary, version: "Approved Brief", style: { accent: current.style.accent, ink: current.style.ink, paper: current.style.paper, fonts: current.style.licensedFonts, intent: current.style.intentProfile, name: current.style.name, logoData: logo?.data, logoAspectRatio: logo ? logo.width / logo.height : undefined }, blocks, coverVisual });
  const stored = await storeArtifact(dataRoot, `${current.id}-${outputId}`, Buffer.from(await readFile(join(dataRoot, rendered.relativePath))), "text/html");
  const editableStored = rendered.editableRelativePath ? await storeArtifact(dataRoot, `${current.id}-${outputId}-editable`, Buffer.from(await readFile(join(dataRoot, rendered.editableRelativePath))), "application/vnd.openxmlformats-officedocument.presentationml.presentation") : undefined;
  const createdAt = new Date().toISOString();
  const outputRecovery = { ...current.outputRecovery }; delete outputRecovery[type];
  const priorOutputs = current.outputs.map((output) => output.type === type && !output.stale ? { ...output, stale: true } : output);
  const imagePanels = coverVisual ? [{ id: coverVisual.panelId, version: coverVisual.panelVersion, sha256: coverVisual.sha256 }] : undefined;
  return write({ ...current, outputRecovery, outputs: [...priorOutputs, { id: outputId, type, relativePath: rendered.relativePath, editableRelativePath: rendered.editableRelativePath, artifactPath: stored.relativePath, editableArtifactPath: editableStored?.relativePath, claimIds: blocks.map((block) => block.id), imageBatchId: coverVisual ? current.imageBatch?.id : undefined, imagePanels, stale: false, createdAt }], firstRenderedOutputAt: current.firstRenderedOutputAt ?? createdAt, updatedAt: createdAt }, root);
}

export function recordOutputFailure(type: "deck" | "infographic", root?: string): WorkshopState { const current = readWorkshopState(root); const updatedAt = new Date().toISOString(); const previous = current.outputRecovery?.[type]; const label = type === "deck" ? "Presentation" : "Infographic"; return write({ ...current, outputRecovery: { ...current.outputRecovery, [type]: { message: `${label} could not be created. Your Brief and Style are safe.`, attempts: (previous?.attempts ?? 0) + 1, updatedAt } }, updatedAt }, root); }

function audioOverviewPosture(state: WorkshopState): WorkshopAudioOverview["posture"] {
  return state.style?.intentProfile === "board_deck" ? "decision_review" : state.style?.intentProfile === "internal_workshop" ? "overview" : "executive";
}
function audioEvidence(claim: WorkshopClaim): WorkshopEvidenceReference { return { claimId: claim.id, sourceId: claim.sourceId, chunkId: claim.chunkId, locator: claim.locator }; }
function buildAudioOverviewScript(title: string, sections: WorkshopAudioOverviewSection[]) { return [`Briefing: ${title}.`, ...sections.map((section) => section.text.trim())].join("\n\n"); }
export function generateAudioOverview(root?: string): WorkshopState {
  const current = readWorkshopState(root);
  if (!current.briefApproved || !current.frame || current.frame.stale) throw new Error("Audio Overview requires an approved current Brief.");
  if (!current.style || current.style.stale) throw new Error("Audio Overview requires a current Style and intent.");
  const claims = activeClaimsFor(current).slice(0, 3);
  if (!claims.length) throw new Error("Audio Overview requires at least one grounded claim.");
  const claimAt = (index: number) => claims[index % claims.length]!;
  const definitions = [
    ["Executive summary", `The central finding is this: ${prose(claimAt(0).text)}`],
    ["What the evidence shows", `The evidence adds an important point: ${prose(claimAt(1).text)}`],
    ["Decision review", `The practical decision is how to act on this: ${prose(claimAt(2).text)}`],
  ] as const;
  const sections = definitions.map(([title, text], index): WorkshopAudioOverviewSection => ({ id: `audio-section-${index + 1}`, title, text, evidence: [audioEvidence(claimAt(index))], edited: false }));
  const version = current.audioOverviews.reduce((highest, item) => Math.max(highest, item.version), 0) + 1;
  const createdAt = new Date().toISOString();
  const overview: WorkshopAudioOverview = { id: `audio-overview-v${version}`, version, graphRevision: graphFor(current).graph.revision, briefVersion: current.frame.version, styleVersion: current.style.version, title: `${current.title} briefing`, posture: audioOverviewPosture(current), sections, script: buildAudioOverviewScript(current.title, sections), claimIds: [...new Set(sections.flatMap((section) => section.evidence.flatMap((reference) => reference.claimId ? [reference.claimId] : [])))], status: "script_ready", disclosure: "AI-generated voice", stale: false, createdAt, updatedAt: createdAt };
  return write({ ...current, audioOverviews: [...staleAudioOverviews(current), overview], updatedAt: createdAt }, root);
}
export function updateAudioOverview(id: string, edits: Array<{ id: string; text: string }>, root?: string): WorkshopState {
  const current = readWorkshopState(root); const overview = current.audioOverviews.find((item) => item.id === id);
  if (!overview || overview.stale) throw new Error("A current Audio Overview script is required.");
  if (edits.length !== overview.sections.length || new Set(edits.map((edit) => edit.id)).size !== edits.length) throw new Error("Audio Overview edits must include every section exactly once.");
  const textById = new Map(edits.map((edit) => [edit.id, edit.text.trim()]));
  if (overview.sections.some((section) => !textById.get(section.id))) throw new Error("Every Audio Overview section requires text.");
  const sections = overview.sections.map((section) => ({ ...section, text: textById.get(section.id)!, edited: textById.get(section.id)! !== section.text }));
  const script = buildAudioOverviewScript(current.title, sections);
  if (script.length > 4096) throw new Error("Audio Overview script exceeds the 4,096-character speech limit.");
  const version = current.audioOverviews.reduce((highest, item) => Math.max(highest, item.version), 0) + 1; const updatedAt = new Date().toISOString();
  const next: WorkshopAudioOverview = { ...overview, id: `audio-overview-v${version}`, version, sections, script, status: "script_ready", audio: undefined, error: undefined, stale: false, createdAt: updatedAt, updatedAt };
  return write({ ...current, audioOverviews: [...staleAudioOverviews(current), next], updatedAt }, root);
}
export function recordAudioOverviewAudio(id: string, audio: NonNullable<WorkshopAudioOverview["audio"]>, root?: string): WorkshopState {
  const current = readWorkshopState(root); const overview = current.audioOverviews.find((item) => item.id === id);
  if (!overview || overview.stale) throw new Error("A current Audio Overview script is required.");
  if (!audio.relativePath || !/^[a-f0-9]{64}$/.test(audio.sha256) || audio.byteCount <= 0 || audio.durationSeconds <= 0) throw new Error("Audio Overview provenance is incomplete.");
  const updatedAt = new Date().toISOString();
  return write({ ...current, audioOverviews: current.audioOverviews.map((item) => item.id === id ? { ...item, audio, status: "audio_ready", error: undefined, updatedAt } : item), firstRenderedOutputAt: current.firstRenderedOutputAt ?? updatedAt, updatedAt }, root);
}
export function recordAudioOverviewFailure(id: string, root?: string): WorkshopState {
  const current = readWorkshopState(root); const overview = current.audioOverviews.find((item) => item.id === id);
  if (!overview || overview.stale) throw new Error("A current Audio Overview script is required.");
  const updatedAt = new Date().toISOString();
  return write({ ...current, audioOverviews: current.audioOverviews.map((item) => item.id === id ? { ...item, status: "failed", error: "Audio could not be created. Your reviewed script is safe.", updatedAt } : item), updatedAt }, root);
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function pngChunk(type: string, data: Uint8Array): Buffer {
  const typeBytes = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const checksum = Buffer.alloc(4); checksum.writeUInt32BE(crc32(Buffer.concat([typeBytes, data])));
  return Buffer.concat([length, typeBytes, data, checksum]);
}

function rgb(hex: string): [number, number, number] {
  const normalized = /^#[0-9a-f]{6}$/i.test(hex) ? hex.slice(1) : "000000";
  return [Number.parseInt(normalized.slice(0, 2), 16), Number.parseInt(normalized.slice(2, 4), 16), Number.parseInt(normalized.slice(4, 6), 16)];
}

/** Deterministic, text-free reference board shared by every image in a batch. */
function buildStyleReferencePng(palette: ImageCoherenceContract["palette"]): Buffer {
  const width = 512; const height = 512; const paper = rgb(palette.paper); const ink = rgb(palette.ink); const accent = rgb(palette.accent);
  const raw = Buffer.alloc((width * 4 + 1) * height);
  const card = (x: number, y: number) => x >= 54 && x < 458 && y >= 64 && y < 448;
  const focal = (x: number, y: number) => x >= 72 && x < 214 && y >= 88 && y < 424;
  const line = (x: number, y: number) => x >= 246 && x < 424 && ((y >= 120 && y < 136) || (y >= 176 && y < 188) || (y >= 228 && y < 240));
  for (let y = 0; y < height; y += 1) {
    const row = y * (width * 4 + 1); raw[row] = 0;
    for (let x = 0; x < width; x += 1) {
      const pixel = row + 1 + x * 4;
      const color = focal(x, y) ? accent : line(x, y) ? ink : card(x, y) ? paper : ink;
      raw[pixel] = color[0]; raw[pixel + 1] = color[1]; raw[pixel + 2] = color[2]; raw[pixel + 3] = 255;
    }
  }
  const header = Buffer.alloc(13); header.writeUInt32BE(width, 0); header.writeUInt32BE(height, 4); header[8] = 8; header[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), pngChunk("IHDR", header), pngChunk("IDAT", deflateSync(raw)), pngChunk("IEND", Buffer.alloc(0))]);
}

export function createImageBatch(root?: string): WorkshopState {
  const current = readWorkshopState(root);
  if (!current.briefApproved || !current.frame || current.frame.stale) throw new Error("Image batch generation requires an approved current brief.");
  if (!current.style || current.style.stale) throw new Error("Image batch generation requires a locked current style.");
  const dataRoot = root ?? repositoryDataRoot(); const visualDna = current.visualDna && !current.visualDna.stale ? current.visualDna : undefined;
  const graphRevision = graphFor(current).graph.revision;
  const panelIds = Array.from({ length: 6 }, (_, index) => `image-panel-${index + 1}`); const referenceId = `style-v${current.style.version}${visualDna ? `-dna-v${visualDna.version}` : ""}`; const createdAt = new Date().toISOString();
  const coherence: ImageCoherenceContract = { visualDnaVersion: visualDna?.version, palette: visualDna?.palette ?? { accent: current.style.accent, ink: current.style.ink, paper: current.style.paper }, compositionRules: visualDna?.compositionRules ?? current.style.references, textureRules: visualDna?.textureRules ?? ["Restrained natural texture with clean negative space."], imageRules: visualDna?.imageRules ?? ["Evidence-aware editorial framing with one clear focal object."], negativeRules: visualDna?.negativeRules ?? current.style.negativeRules, siblingPanelIds: panelIds };
  const referenceBytes = buildStyleReferencePng(coherence.palette); const referencePath = workshopGeneratedPath(current.id, "references", `${referenceId}.png`); mkdirSync(join(dataRoot, dirname(referencePath)), { recursive: true }); writeFileSync(join(dataRoot, referencePath), referenceBytes);
  const claims = activeClaimsFor(current);
  const groundedNodes = current.mapNodes.filter((node): node is WorkshopMapNode & { sourceId: string } => node.kind === "grounded" && typeof node.sourceId === "string" && current.activeSourceIds.includes(node.sourceId));
  const usedClaims = new Set<string>();
  const evidenceFor = (index: number, keywords: readonly string[]): { idea: string; evidence: WorkshopEvidenceReference[] } => {
    const available = claims.filter((claim) => !usedClaims.has(claim.id));
    const ranked = available.map((claim, order) => ({ claim, order, score: keywords.filter((keyword) => prose(claim.text).toLowerCase().includes(keyword)).length })).sort((left, right) => right.score - left.score || left.order - right.order);
    const claim = ranked[0]?.claim ?? claims[index % Math.max(1, claims.length)];
    if (claim) usedClaims.add(claim.id);
    if (claim) return { idea: outputBody(prose(claim.text)), evidence: [{ claimId: claim.id, sourceId: claim.sourceId, chunkId: claim.chunkId, locator: claim.locator }] };
    const node = groundedNodes[index % Math.max(1, groundedNodes.length)];
    if (node) return { idea: outputBody(prose(`${node.title}: ${node.body}`)), evidence: [{ sourceId: node.sourceId, locator: node.locator }] };
    return { idea: outputBody(prose(current.title)), evidence: [] };
  };
  const roles = [
    ["Hero concept", "Turn the approved idea into one memorable object-led transformation metaphor. Place the focal object in the lower-right and preserve generous upper-left negative space for a presentation headline.", ["start", "turn", "become", "outcome", "promise", "professional", "client", "leadership"]],
    ["Systems diagram", "Translate the approved idea into an unlabeled systems diagram made from geometric nodes, layers, and connectors. Show relationships without implying invented quantities.", ["system", "map", "process", "workflow", "chain", "connect", "brief", "organize", "relationship"]],
    ["Evidence chain", "Show source-like paper forms progressing through connected proof points into one polished decision artifact. Make provenance visually legible without words or interface chrome.", ["evidence", "source", "claim", "trace", "provenance", "locator", "citation", "grounded", "defend"]],
    ["Decision visual", "Build a clear tension-to-resolution composition with two contrasting fields joined by one accent-colored bridge. Do not invent data, scales, or labels.", ["approve", "only", "must", "should", "decision", "gate", "review", "sign-off", "recommend"]],
    ["Storyboard sequence", "Create a four-beat storyboard strip inside one square composition, keeping the same objects, lighting, and camera language across every beat.", ["sequence", "path", "step", "storyboard", "capture", "map", "brief", "create", "journey", "continuous"]],
    ["Section art", "Create polished closing section art: the approved idea resolved into a cohesive family of abstract presentation, diagram, and video-frame forms, with ample negative space.", ["deck", "presentation", "infographic", "image", "video", "brand", "finished", "output", "delivery"]],
  ] as const;
  const panels = roles.map(([role, direction, keywords], index) => {
    const grounded = evidenceFor(index, keywords);
    const prompt = `Visual role: ${role}. ${direction} Approved idea to communicate: ${grounded.idea}. Preserve the shared reference composition, palette, lighting, material treatment, folded-plane motif, and editorial restraint. This is panel ${index + 1} of one continuous six-panel art direction. Create a presentation-ready 1:1 visual with no readable text, logos, watermarks, UI chrome, generic people-at-work scenes, device mockups, or stock-photo cliches.`;
    return { id: panelIds[index]!, version: 1, prompt, evidence: grounded.evidence, state: "planned" as const, referenceId, history: [] };
  });
  return write({ ...current, imageBatch: { id: `image-batch-v${(current.imageBatch ? Number(current.imageBatch.id.match(/\d+$/)?.[0]) + 1 : 1)}`, graphRevision, briefVersion: current.frame.version, styleVersion: current.style.version, referenceId, referencePath, referenceSha256: createHash("sha256").update(referenceBytes).digest("hex"), coherence, createdAt, stale: false, panels }, updatedAt: createdAt }, root);
}
export function selectImagePanelForRegeneration(panelId: string, root?: string, revisionRequest?: string): WorkshopState {
  const current = readWorkshopState(root); if (!current.imageBatch || current.imageBatch.stale) throw new Error("A current image batch is required."); const found = current.imageBatch.panels.some((panel) => panel.id === panelId); if (!found) throw new Error(`Image panel not found: ${panelId}.`);
  const request = revisionRequest?.trim();
  if (request && request.length > 400) throw new Error("Describe the image change in 400 characters or fewer.");
  const storyboardDependsOnPanel = current.storyboard.panels.some((panel) => panel.imagePanelId === panelId); const storyboard = storyboardDependsOnPanel ? { ...current.storyboard, stale: true, panels: current.storyboard.panels.map((panel) => panel.imagePanelId === panelId ? { ...panel, stale: true, approved: false } : panel) } : current.storyboard;
  return write({ ...current, imageBatch: { ...current.imageBatch, panels: current.imageBatch.panels.map((panel) => {
    if (panel.id !== panelId) return panel;
    const basePrompt = panel.basePrompt ?? panel.prompt.replace(/ Professional revision request: .*$/s, "");
    const history = panel.state === "generated" && panel.relativePath && panel.sha256 && panel.provenance && !(panel.history ?? []).some((item) => item.version === panel.version)
      ? [...(panel.history ?? []), { version: panel.version, prompt: panel.prompt, revisionRequest: panel.revisionRequest, evidence: panel.evidence, relativePath: panel.relativePath, sha256: panel.sha256, provenance: panel.provenance }]
      : panel.history ?? [];
    return { ...panel, history, basePrompt, prompt: request ? `${basePrompt} Professional revision request: ${request}` : basePrompt, revisionRequest: request, version: panel.version + 1, state: "selected_for_regeneration", error: undefined };
  }) }, outputs: current.outputs.map((output) => output.imagePanels?.some((panel) => panel.id === panelId) ? { ...output, stale: true } : output), storyboard, narration: storyboardDependsOnPanel && current.narration ? { ...current.narration, stale: true } : current.narration, videos: storyboardDependsOnPanel ? staleVideos(current) : current.videos, storyboardApproved: storyboardDependsOnPanel ? false : current.storyboardApproved, videoState: storyboardDependsOnPanel ? "blocked" : current.videoState, updatedAt: new Date().toISOString() }, root);
}
export function markImagePanelFailed(panelId: string, error: string, root?: string): WorkshopState {
  const current = readWorkshopState(root); if (!current.imageBatch || current.imageBatch.stale) throw new Error("A current image batch is required."); const message = error.trim(); if (!message) throw new Error("A failed image panel requires an error message."); const found = current.imageBatch.panels.some((panel) => panel.id === panelId); if (!found) throw new Error(`Image panel not found: ${panelId}.`);
  return write({ ...current, imageBatch: { ...current.imageBatch, panels: current.imageBatch.panels.map((panel) => panel.id === panelId ? { ...panel, state: "failed", error: message } : panel) }, updatedAt: new Date().toISOString() }, root);
}
export function recordGeneratedImagePanel(panelId: string, artifact: Pick<ImageBatchPanel, "relativePath" | "sha256" | "provenance">, root?: string): WorkshopState {
  const current = readWorkshopState(root);
  if (!current.imageBatch || current.imageBatch.stale) throw new Error("A current image batch is required.");
  if (!artifact.relativePath || !artifact.sha256 || !artifact.provenance) throw new Error("Generated image provenance is incomplete.");
  const generatedPanel = current.imageBatch.panels.find((panel) => panel.id === panelId);
  if (!generatedPanel) throw new Error(`Image panel not found: ${panelId}.`);
  const boundPanel = current.storyboard.panels.find((panel) => panel.imagePanelId === panelId);
  const storyboardBindingChanged = Boolean(boundPanel && boundPanel.imagePanelVersion !== generatedPanel.version);
  const storyboardPanels = current.storyboard.panels.map((panel) => panel.imagePanelId === panelId
    ? { ...panel, imagePanelVersion: generatedPanel.version, imageRelativePath: artifact.relativePath, imageSha256: artifact.sha256, approved: true, stale: false }
    : panel);
  const storyboard = boundPanel
    ? { ...current.storyboard, version: storyboardBindingChanged ? current.storyboard.version + 1 : current.storyboard.version, panels: storyboardPanels, stale: storyboardPanels.some((panel) => panel.stale), approved: storyboardBindingChanged ? false : current.storyboard.approved }
    : current.storyboard;
  const panels = current.imageBatch.panels.map((panel) => panel.id === panelId ? { ...panel, ...artifact, state: "generated" as const, error: undefined } : panel);
  const completed = panels.every((panel) => panel.state === "generated");
  const outputs = completed ? current.outputs.map((output) => output.type === "deck" && !output.imageBatchId ? { ...output, stale: true } : output) : current.outputs;
  return write({ ...current, imageBatch: { ...current.imageBatch, panels }, outputs, storyboard, storyboardHistory: storyboardBindingChanged ? storyboardHistoryWithCurrent(current) : current.storyboardHistory, narration: storyboardBindingChanged && current.narration ? { ...current.narration, stale: true } : current.narration, videos: storyboardBindingChanged ? staleVideos(current) : current.videos, storyboardApproved: storyboardBindingChanged ? false : current.storyboardApproved, videoState: storyboardBindingChanged ? "blocked" : current.videoState, updatedAt: new Date().toISOString() }, root);
}
export function recordNarration(narration: WorkshopNarration, root?: string): WorkshopState {
  const current = readWorkshopState(root);
  if (!current.storyboardApproved || current.storyboard.stale) throw new Error("Narration requires an approved current storyboard.");
  if (narration.storyboardVersion !== current.storyboard.version) throw new Error("Narration belongs to a different storyboard version.");
  const panelIds = new Set(current.storyboard.panels.map((panel) => panel.id));
  const narrationPanelIds = narration.panels.map((panel) => panel.panelId);
  if (narrationPanelIds.length !== panelIds.size || new Set(narrationPanelIds).size !== narrationPanelIds.length || narrationPanelIds.some((panelId) => !panelIds.has(panelId))) throw new Error("Narration must cover every current storyboard panel exactly once.");
  return write({ ...current, narration: { ...narration, failures: [], stale: false }, videos: staleVideos(current), videoState: "blocked", updatedAt: new Date().toISOString() }, root);
}
export function recordNarrationProgress(narration: WorkshopNarration, root?: string): WorkshopState {
  const current = readWorkshopState(root);
  if (!current.storyboardApproved || current.storyboard.stale) throw new Error("Narration requires an approved current storyboard.");
  if (narration.storyboardVersion !== current.storyboard.version) throw new Error("Narration belongs to a different storyboard version.");
  const panelIds = new Set(current.storyboard.panels.map((panel) => panel.id));
  const recordedIds = narration.panels.map((panel) => panel.panelId);
  const failedIds = narration.failures?.map((failure) => failure.panelId) ?? [];
  if (recordedIds.some((panelId) => !panelIds.has(panelId)) || failedIds.some((panelId) => !panelIds.has(panelId))) throw new Error("Narration progress contains an unknown storyboard panel.");
  if (new Set(recordedIds).size !== recordedIds.length || new Set(failedIds).size !== failedIds.length) throw new Error("Narration progress contains duplicate panels.");
  if (recordedIds.some((panelId) => failedIds.includes(panelId))) throw new Error("A narration panel cannot be both complete and failed.");
  return write({ ...current, narration: { ...narration, stale: true }, videos: staleVideos(current), videoState: "blocked", updatedAt: new Date().toISOString() }, root);
}
export function updateStoryboardPanel(panelId: string, patch: Pick<StoryboardPanel, "title" | "narration" | "durationSeconds">, root?: string): WorkshopState {
  const current = readWorkshopState(root); const index = current.storyboard.panels.findIndex((panel) => panel.id === panelId); if (index < 0) throw new Error(`Storyboard panel not found: ${panelId}.`);
  if (!patch.title.trim() || !patch.narration.trim() || !Number.isInteger(patch.durationSeconds) || patch.durationSeconds < 1 || patch.durationSeconds > 120) throw new Error("Storyboard panel requires a title, narration, and duration from 1 to 120 seconds.");
  const panels = [...current.storyboard.panels]; panels[index] = { ...panels[index], ...patch, approved: true, stale: false };
  return write({ ...current, storyboard: { version: current.storyboard.version + 1, panels, stale: false, approved: false }, storyboardHistory: storyboardHistoryWithCurrent(current), narration: current.narration ? { ...current.narration, stale: true } : undefined, videos: staleVideos(current), storyboardApproved: false, videoState: "blocked", updatedAt: new Date().toISOString() }, root);
}
export function recordRenderedVideo(input: RenderedVideoInput, root?: string, workshopId?: string): WorkshopState {
  const current = readWorkshopState(root, workshopId);
  if (!current.storyboardApproved || current.storyboard.stale || current.storyboard.panels.some((panel) => panel.stale || !panel.approved)) throw new Error("A rendered Video requires an approved current Storyboard.");
  if (!current.style || current.style.stale) throw new Error("A rendered Video requires a current Style.");
  if (input.storyboardVersion !== current.storyboard.version || input.styleVersion !== current.style.version) throw new Error("Rendered Video inputs do not match the current Storyboard and Style versions.");
  if (input.visualDnaVersion !== current.visualDna?.version || input.imageBatchId !== current.imageBatch?.id) throw new Error("Rendered Video visual inputs do not match the current Workshop.");
  if (!input.buildTrace.htmlPath || !input.buildTrace.dataPath || !/^[a-f0-9]{64}$/.test(input.buildTrace.htmlSha256) || !/^[a-f0-9]{64}$/.test(input.buildTrace.dataSha256)) throw new Error("Rendered Video build trace is incomplete.");
  const expectedClaimIds = [...new Set(current.storyboard.panels.flatMap((panel) => panel.claimIds))].sort();
  if ([...new Set(input.claimIds)].sort().join("|") !== expectedClaimIds.join("|")) throw new Error("Rendered Video claim IDs do not match the approved Storyboard.");
  const version = current.videos.reduce((highest, video) => Math.max(highest, video.version), 0) + 1;
  const createdAt = new Date().toISOString();
  const video: WorkshopVideo = { ...input, id: `video-v${version}`, version, stale: false, createdAt };
  return write({ ...current, videos: [...staleVideos(current), video], videoState: "rendered", firstRenderedOutputAt: current.firstRenderedOutputAt ?? createdAt, updatedAt: createdAt }, root);
}
export function setVideoState(videoState: Exclude<WorkshopState["videoState"], "rendered" | "failed" | "cancelled">, root?: string, workshopId?: string) { const current = readWorkshopState(root, workshopId); const updatedAt = new Date().toISOString(); return write({ ...current, videoState, updatedAt }, root); }
export function recordVideoFailure(error: string, attempts: number, root?: string, workshopId?: string): WorkshopState { const current = readWorkshopState(root, workshopId); const updatedAt = new Date().toISOString(); return write({ ...current, videoState: "failed", videoRecovery: { outcome: "failed", message: "Video could not be created. Your approved Storyboard is safe.", attempts, updatedAt }, updatedAt }, root); }
export function cancelVideoRender(root?: string): WorkshopState { const current = readWorkshopState(root); const db = dbFor(root); const job = db.prepare("SELECT id, attempts FROM job WHERE workshop_id=? AND kind='render_video' AND state IN ('queued','retrying') ORDER BY created_at DESC LIMIT 1").get(current.id) as { id: string; attempts: number } | undefined; if (!job || !cancelJob(db, job.id)) throw new Error("No queued video render is available to cancel."); const updatedAt = new Date().toISOString(); return write({ ...current, videoState: "cancelled", videoRecovery: { outcome: "cancelled", message: "Video creation was cancelled. Your approved Storyboard is ready when you are.", attempts: job.attempts, updatedAt }, updatedAt }, root); }
export function applyWorkshopAction(action: "approveBrief" | "lockManualStyle" | "approveStoryboard" | "renderVideo", root?: string): WorkshopState {
  const current = readWorkshopState(root); const updatedAt = new Date().toISOString();
  if (action === "approveBrief") {
    if (current.frame && mapNeedsUpdate(current)) throw new Error("Update the Map with the current Sources before approving the Brief.");
    const approvalState = current.frame ? current : { ...current, mapInputClaimIds: activeClaimsFor(current).map((claim) => claim.id) };
    return write({ ...approvalState, frame: frameFor(approvalState, updatedAt, root), videos: staleVideos(approvalState), briefApproved: true, storyboardApproved: false, videoState: "blocked", updatedAt }, root);
  }
  if (action === "lockManualStyle") return lockManualStyle({}, root);
  if (action === "approveStoryboard") {
    if (!current.briefApproved) throw new Error("Storyboard approval requires an approved current brief.");
    if (!current.style || current.style.stale) throw new Error("Storyboard approval requires a locked current style.");
    if (current.storyboard.stale || current.storyboard.panels.some((panel) => panel.stale || !panel.approved)) throw new Error("Storyboard approval requires current approved panels.");
    assertStoryboardGrounding(current);
    for (const panel of current.storyboard.panels) { if (!panel.imagePanelId) continue; const image = current.imageBatch?.panels.find((candidate) => candidate.id === panel.imagePanelId); if (!current.imageBatch || current.imageBatch.stale || !image || image.version !== panel.imagePanelVersion) throw new Error(`Storyboard panel ${panel.id} requires its current bound image version.`); }
    return write({ ...current, storyboard: { ...current.storyboard, approved: true }, storyboardApproved: true, updatedAt }, root);
  }
  if (!current.storyboardApproved) throw new Error("Video render requires an approved current storyboard.");
  const db = dbFor(root); enqueue(db, { id: `job-video-${Date.now()}`, workshopId: current.id, kind: "render_video", inputKey: `${current.id}:storyboard-approved:${current.updatedAt}`, payload: { workshopId: current.id } });
  return write({ ...current, videoState: "queued", videoRecovery: undefined, updatedAt }, root);
}
