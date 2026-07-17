"use client";

import {
  ArrowLeftIcon,
  Button,
  ButtonLink,
  Card,
  CarouselRow,
  Checkbox,
  CloseIcon,
  ConversationSurface,
  EntityCardAction,
  FilePicker,
  FileIcon,
  FullScreenShell,
  IconButton,
  Input,
  ListGroup,
  ListRow,
  ListRowAction,
  NavigationHeader,
  PlusIcon,
  SideSheet,
  StateMessage,
  TextArea,
  Token,
  Workbench,
  WorkbenchRail,
} from "@workshoplm/ui";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { RealtimeCapture } from "./realtime-capture";
import { ExcalidrawMap } from "./excalidraw-map";
import { claimsForArtifact } from "./artifact-evidence";
import { sourceInputKind, sourceTitleFromText } from "./source-input";
import { realtimeFunctionOutput } from "./realtime-transcript";

type ObjectView = "conversation" | "map" | "brief" | "outputs" | "storyboard" | "output";
type WorkshopStage = "capture" | "map" | "brief" | "create";
type WorkshopIndexTarget = Exclude<ObjectView, "output"> | "sources" | "style";
type Sheet = "workshops" | "objects" | "sources" | "evidence" | "add-source" | "style" | "image-replacement" | "original" | "help" | null;
type WorkshopSummary = { id: string; title: string; sources: number; outputs: number; updatedAt: string; active: boolean };
type SourceItem = { id: string; type: "TXT" | "PDF" | "WEB"; title: string; origin: string; claimCount: number; excerpt: string; locator: string; permission: "private" | "sanitized" | "shareable" };
type EvidenceTarget = { sourceId?: string; claimId?: string; locator?: string };
type EvidenceSelection = { excerpt: string; locator: string };
type PendingSourceScope = { sourceIds: string[]; sourceTitle: string; change: "add" | "remove"; affected: string[] };
type ConversationTurn = { id: string; role: "user" | "assistant"; text: string; input: "text" | "voice" | "system"; createdAt: string; evidence: { claimId?: string; sourceId: string; chunkId?: string; locator: string }[]; sourceId?: string; operation?: { name: "search" | "source_search" | "voice_capture"; status: "completed" } };
type ConversationToolCall = { id: string; name: string; channel: "plugin" | "responses" | "realtime"; input: Record<string, unknown>; explicitUserIntent: boolean; effect: string; status: "succeeded" | "failed"; startedAt: string; completedAt: string; provider?: { model?: string; responseId?: string; callId?: string; eventId?: string }; result: { summary: string; isError: boolean } };
type MapNode = { id: string; title: string; body: string; kind: "grounded" | "derived" | "creative"; locator: string; sourceId?: string; x: number; y: number; width: number; height: number };
type MapEdge = { id: string; from: string; to: string; kind: "supports" | "relates_to" | "depends_on" | "contradicts" | "contains"; label?: string };
type FontAvailability = "system" | "user_confirmed" | "unverified";
type StylePaletteRoles = { accent: { value: string; source: "website" | "manual" | "default" }; text: { value: string; source: "website" | "manual" | "default" }; background: { value: string; source: "website" | "manual" | "default" } };
type StyleTypographyRoles = { heading: { family: string; availability: FontAvailability; source: "website" | "manual" | "default" }; body: { family: string; availability: FontAvailability; source: "website" | "manual" | "default" } };
type BrandAsset = { id: string; sourceUrl: string; localPath: string; contentType: string; byteCount: number; width: number; height: number; sha256: string; selectedAt: string };
type ManualStylePayload = { name: string; accent: string; ink: string; paper: string; headingFont: string; bodyFont: string; fontsConfirmed: boolean; selectedAssetUrls: string[]; logos: string[]; licensedFonts: string[]; references: string[]; negativeRules: string[]; intentProfile: "client_facing_pitch" | "board_deck" | "internal_workshop" };
type WorkshopOutcome = ManualStylePayload["intentProfile"];
type StyleLibraryEntry = Omit<ManualStylePayload, "headingFont" | "bodyFont" | "fontsConfirmed" | "selectedAssetUrls"> & { paletteRoles: StylePaletteRoles; typographyRoles: StyleTypographyRoles; brandAssets: BrandAsset[]; id: string; familyId: string; revision: number; source: "manual" | "website"; referenceUrl?: string; createdAt: string; updatedAt: string };
type WebsiteStyleSuggestion = Omit<ManualStylePayload, "headingFont" | "bodyFont" | "fontsConfirmed" | "selectedAssetUrls" | "licensedFonts" | "intentProfile"> & { referenceUrl: string; paletteRoles: StylePaletteRoles; assetCandidates: Array<{ url: string; kind: "logo" }>; fontCandidates: string[]; typographyCandidates: Array<{ family: string; availability: "unverified"; source: "website" }>; findings: { colors: number; fontCandidates: number; assets: number; stylesheets: number } };
type StoryboardPanelState = { id: string; title: string; narration: string; durationSeconds: number; claimIds: string[]; evidence: { claimId?: string; sourceId: string; chunkId?: string; locator: string }[]; imagePanelId?: string; imagePanelVersion?: number; imageRelativePath?: string; imageSha256?: string; approved: boolean; stale: boolean };
type StoryboardState = { version: number; stale: boolean; approved: boolean; panels: StoryboardPanelState[] };
type PersistedWorkshop = {
  id: string;
  title: string;
  onboarding: { step: "welcome" | "style" | "sources" | "complete"; outcome?: WorkshopOutcome; mapOrientationDismissed: boolean; outputsOrientationDismissed: boolean; completedAt?: string; styleAnalysis?: { status: "reviewing" | "ready" | "error"; url: string; startedAt: string; completedAt?: string; suggestion?: WebsiteStyleSuggestion; error?: string } };
  briefApproved: boolean;
  storyboardApproved: boolean;
  videoState: "blocked" | "queued" | "rendering" | "rendered" | "failed" | "cancelled";
  videoRecovery?: { outcome: "failed" | "cancelled"; message: string; attempts: number; updatedAt: string };
  outputRecovery?: Partial<Record<"deck" | "infographic", { message: string; attempts: number; updatedAt: string }>>;
  transcriptSegments?: { id: string; origin: "chatgpt" | "realtime_fallback"; transport: "fixture" | "webrtc"; text: string; capturedAt: string }[];
  conversationTurns?: ConversationTurn[];
  toolCalls?: ConversationToolCall[];
  conversationContinuation?: { responseId: string; model?: string; recordedAt: string };
  firstTranscriptAt?: string;
  firstRenderedOutputAt?: string;
  sourceItems: SourceItem[];
  activeSourceIds: string[];
  claims?: { id: string; sourceId: string; chunkId: string; text: string; locator: string }[];
  mapNodes: MapNode[];
  mapEdges: MapEdge[];
  mapInputClaimIds: string[];
  graphState?: string;
  frame?: { version: number; markdown: string; stale: boolean };
  sketch?: { version: number; graphRevision: number; styleVersion?: number; nodes: Pick<MapNode, "id" | "title" | "body" | "kind" | "locator">[]; edges: MapEdge[]; claimIds: string[]; relativePath: string; sha256: string; stale: boolean; approved: boolean; createdAt: string };
  sketchHistory: Array<{ version: number; graphRevision: number; styleVersion?: number; nodes: Pick<MapNode, "id" | "title" | "body" | "kind" | "locator">[]; edges: MapEdge[]; claimIds: string[]; relativePath: string; sha256: string; stale: boolean; approved: boolean; createdAt: string }>;
  style?: { version: number; source: "manual" | "website"; name: string; accent: string; ink: string; paper: string; paletteRoles: StylePaletteRoles; typographyRoles: StyleTypographyRoles; brandAssets: BrandAsset[]; logos: string[]; licensedFonts: string[]; references: string[]; negativeRules: string[]; intentProfile: ManualStylePayload["intentProfile"]; referenceUrl?: string; libraryId?: string; libraryFamilyId?: string; libraryRevision?: number; stale: boolean };
  assetPlan?: { version: number; stale: boolean; evidenceClaimIds: string[] };
  storyboard: StoryboardState;
  storyboardHistory: StoryboardState[];
  imageBatch?: { id: string; graphRevision: number; briefVersion: number; styleVersion: number; referenceId: string; stale: boolean; panels: { id: string; version: number; basePrompt?: string; prompt: string; revisionRequest?: string; evidence: { claimId?: string; sourceId: string; chunkId?: string; locator: string }[]; state: "planned" | "selected_for_regeneration" | "generated" | "failed"; relativePath?: string; sha256?: string; history?: { version: number; prompt: string; revisionRequest?: string; evidence: { claimId?: string; sourceId: string; chunkId?: string; locator: string }[]; relativePath: string; sha256: string }[] }[] };
  audioOverviews: { id: string; version: number; graphRevision: number; briefVersion: number; styleVersion: number; title: string; posture: "executive" | "overview" | "decision_review"; sections: { id: string; title: string; text: string; evidence: { claimId?: string; sourceId: string; chunkId?: string; locator: string }[]; edited: boolean }[]; script: string; claimIds: string[]; status: "script_ready" | "audio_ready" | "failed"; disclosure: "AI-generated voice"; stale: boolean; audio?: { relativePath: string; sha256: string; byteCount: number; durationSeconds: number; model: "gpt-4o-mini-tts"; voice: "cedar" | "marin"; instructions: string; requestId?: string; generatedAt: string }; error?: string; createdAt: string; updatedAt: string }[];
  outputs: { id: string; type: "deck" | "infographic"; stale: boolean; artifactPath: string; editableRelativePath?: string; claimIds?: string[]; createdAt: string }[];
  videos: { id: string; version: number; storyboardVersion: number; styleVersion: number; relativePath: string; provenancePath: string; artifactPath: string; claimIds: string[]; buildTrace?: { htmlPath: string; dataPath: string; htmlSha256: string; dataSha256: string; milestoneCount: number; commitCount: number; taskIds: string[] }; stale: boolean; createdAt: string }[];
};
type ImageBatchPanel = NonNullable<PersistedWorkshop["imageBatch"]>["panels"][number];

const VIEW_TITLES: Record<ObjectView, string> = { conversation: "Conversation", map: "Map", brief: "Brief", outputs: "Created work", storyboard: "Storyboard", output: "Created work" };
const stageForView = (view: ObjectView): WorkshopStage => view === "conversation" ? "capture" : view === "map" ? "map" : view === "brief" ? "brief" : "create";
const outputTitle = (type: "deck" | "infographic") => type === "deck" ? "Presentation" : "Infographic";
const outputType = (type: "deck" | "infographic") => type === "deck" ? "Presentation" : "Infographic";
const isVoiceSource = (source: SourceItem) => source.origin.includes("capture-only fallback")
  || source.origin.toLowerCase() === "chatgpt task"
  || source.title === "Raw voice brainstorm";
const sourceDisplayTitle = (source: SourceItem) => source.origin === "Founder-provided recording"
  ? "Founder brainstorm"
  : isVoiceSource(source) ? "Voice brainstorm" : source.title;
const sourceDisplayOrigin = (source: SourceItem) => source.origin === "Founder-provided recording"
  ? "Recording"
  : isVoiceSource(source) ? "Voice" : source.origin;
const locatorPosition = (locator: string) => {
  const position = locator.split(" · ").at(-1) ?? "";
  return /^normalized:[a-f0-9]+$/i.test(position) ? "Source material" : position;
};
const sourceEvidenceLocator = (source: SourceItem, locator: string) => {
  const position = locatorPosition(locator);
  if (position !== "Source material" && !isVoiceSource(source) && source.origin !== "Founder-provided recording") return locator;
  return [sourceDisplayTitle(source), position].filter(Boolean).join(" · ");
};
const claimDisplayLocator = (claim: { sourceId: string; locator: string }, state: Pick<PersistedWorkshop, "sourceItems"> | null) => {
  const source = state?.sourceItems.find((candidate) => candidate.id === claim.sourceId);
  const position = locatorPosition(claim.locator);
  return [source ? sourceDisplayTitle(source) : "Source", position].filter(Boolean).join(" · ");
};

function outputSetStatus(state: PersistedWorkshop | null) {
  if (!state) return { incomplete: false, stale: false, actionRequired: false };
  const latest = (type: "deck" | "infographic") => [...state.outputs].reverse().find((output) => output.type === type);
  const deck = latest("deck");
  const infographic = latest("infographic");
  const generationStarted = Boolean(state.outputs.length || state.audioOverviews.length || state.assetPlan || state.imageBatch || state.sketch);
  const audioOverview = [...(state.audioOverviews ?? [])].reverse().find((item) => !item.stale);
  const failedImages = Boolean(state.imageBatch?.panels.some((panel) => panel.state === "failed"));
  const failedOutputs = Boolean(state.outputRecovery && Object.keys(state.outputRecovery).length);
  const incomplete = Boolean(generationStarted && (!deck || !infographic || !state.sketch || !state.imageBatch || !state.storyboard.panels.length)) || failedImages || failedOutputs || audioOverview?.status === "failed";
  const replacementIds = new Set(state.imageBatch?.panels.filter((panel) => panel.state === "selected_for_regeneration").map((panel) => panel.id) ?? []);
  const replacementOnlyStoryboardStale = replacementIds.size > 0
    && state.storyboard.stale
    && state.storyboard.panels.filter((panel) => panel.stale).every((panel) => Boolean(panel.imagePanelId && replacementIds.has(panel.imagePanelId)));
  const stale = Boolean(
    deck?.stale
    || infographic?.stale
    || state.sketch?.stale
    || state.assetPlan?.stale
    || state.imageBatch?.stale
    || state.audioOverviews.at(-1)?.stale
    || (state.storyboard.stale && !replacementOnlyStoryboardStale)
  );
  return { incomplete, stale, actionRequired: incomplete || stale };
}

function workshopMapNeedsUpdate(state: PersistedWorkshop | null) {
  if (!state?.mapNodes.length) return false;
  const activeClaimIds = (state.claims ?? []).filter((claim) => state.activeSourceIds.includes(claim.sourceId)).map((claim) => claim.id);
  if (activeClaimIds.length !== state.mapInputClaimIds.length) return true;
  const included = new Set(state.mapInputClaimIds);
  return activeClaimIds.some((claimId) => !included.has(claimId));
}

function outputVersion(output: PersistedWorkshop["outputs"][number], outputs: PersistedWorkshop["outputs"]) {
  return outputs.filter((item) => item.type === output.type).findIndex((item) => item.id === output.id) + 1;
}

function outputSourceCount(output: PersistedWorkshop["outputs"][number], state: PersistedWorkshop | null) {
  const claimIds = new Set(output.claimIds ?? []);
  const sourceIds = new Set([
    ...(state?.claims ?? []).filter((claim) => claimIds.has(claim.id)).map((claim) => claim.sourceId),
    ...(state?.mapNodes ?? []).filter((node) => claimIds.has(node.id) && node.sourceId).map((node) => node.sourceId as string),
  ]);
  return sourceIds.size || state?.activeSourceIds.length || 0;
}

function boundImage(panel: PersistedWorkshop["storyboard"]["panels"][number], imageBatch: PersistedWorkshop["imageBatch"]) {
  return imageBatch?.panels.find((image) => image.id === panel.imagePanelId && image.version === panel.imagePanelVersion && image.state === "generated");
}

function affectedWorkForSourceScope(state: PersistedWorkshop | null) {
  if (!state) return [];
  const affected = state.mapNodes.length ? ["Map"] : [];
  if (state.frame || state.briefApproved) affected.push("Brief");
  if (state.sketch) affected.push("Sketch");
  if (state.outputs.some((output) => output.type === "deck")) affected.push("Presentation");
  if (state.outputs.some((output) => output.type === "infographic")) affected.push("Infographic");
  if (state.imageBatch) affected.push("Image set");
  if (state.audioOverviews.length) affected.push("Audio Overview");
  if (state.storyboard.panels.length) affected.push("Storyboard");
  if (state.videos.length) affected.push("Video");
  return affected;
}

export default function WorkshopPage() {
  const [state, setState] = useState<PersistedWorkshop | null>(null);
  const [workshops, setWorkshops] = useState<WorkshopSummary[]>([]);
  const [styleLibrary, setStyleLibrary] = useState<StyleLibraryEntry[]>([]);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [view, setView] = useState<ObjectView>("map");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [selectedSource, setSelectedSource] = useState<SourceItem | null>(null);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceSelection | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState("");
  const [selectedImagePanelId, setSelectedImagePanelId] = useState("");
  const [selectedOutputId, setSelectedOutputId] = useState("");
  const [notice, setNotice] = useState<{ message: string; tone: "status" | "error" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [creationProgress, setCreationProgress] = useState<{ label: string; completed: number; total: number } | null>(null);
  const [streamingReply, setStreamingReply] = useState("");
  const [realtimeContinuation, setRealtimeContinuation] = useState<Record<string, unknown> | undefined>();
  const [pendingSourceScope, setPendingSourceScope] = useState<PendingSourceScope | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const returnScrollRef = useRef<{ element: HTMLElement; top: number } | null>(null);
  const objectCanvasRef = useRef<HTMLElement | null>(null);

  useEffect(() => { void Promise.all([reload(), reloadWorkshops(), reloadStyleLibrary()]); }, []);
  useEffect(() => {
    if (state?.videoState !== "queued" && state?.videoState !== "rendering") return;
    let stopped = false;
    const timer = window.setInterval(() => {
      void fetch("/api/workshop").then(async (response) => {
        if (!stopped && response.ok) setState(await response.json() as PersistedWorkshop);
      }).catch(() => undefined);
    }, 1000);
    return () => { stopped = true; window.clearInterval(timer); };
  }, [state?.videoState]);
  useEffect(() => {
    if (notice?.tone !== "status") return;
    const currentNotice = notice;
    const timer = window.setTimeout(() => setNotice((current) => current === currentNotice ? null : current), 4_000);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    if (state?.onboarding.styleAnalysis?.status !== "reviewing") return;
    let stopped = false;
    const timer = window.setInterval(() => {
      void fetch("/api/workshop").then(async (response) => {
        if (!stopped && response.ok) setState(await response.json() as PersistedWorkshop);
      }).catch(() => undefined);
    }, 750);
    return () => { stopped = true; window.clearInterval(timer); };
  }, [state?.onboarding.styleAnalysis?.status]);
  useEffect(() => {
    const surface = objectCanvasRef.current?.querySelector<HTMLElement>(".conversation-view, .brief-view, .outputs-view, .storyboard-view, .focused-output");
    if (!surface) return;
    const reset = () => { surface.scrollTop = 0; surface.scrollLeft = 0; };
    reset();
    const frame = window.requestAnimationFrame(reset);
    const afterFocus = window.setTimeout(reset, 0);
    const afterPreview = window.setTimeout(reset, 120);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(afterFocus);
      window.clearTimeout(afterPreview);
    };
  }, [view, selectedOutputId]);

  const selectedNode = useMemo(() => state?.mapNodes.find((node) => node.id === selectedNodeId), [state, selectedNodeId]);
  const selectedPanel = useMemo(() => state?.storyboard.panels.find((panel) => panel.id === selectedPanelId) ?? state?.storyboard.panels[0], [state, selectedPanelId]);
  const selectedOutput = useMemo(() => state?.outputs.find((output) => output.id === selectedOutputId), [state, selectedOutputId]);
  const canDeliver = Boolean(state?.briefApproved && state.style && !state.style.stale);
  const outputsNeedUpdate = outputSetStatus(state).actionRequired;
  const outputFailureCount = Object.keys(state?.outputRecovery ?? {}).length;
  const imageFailureCount = state?.imageBatch?.panels.filter((panel) => panel.state === "failed").length ?? 0;
  const imageReplacementCount = state?.imageBatch?.panels.filter((panel) => panel.state === "selected_for_regeneration").length ?? 0;

  async function reload() {
    setLoadState("loading");
    try {
      const response = await fetch("/api/workshop");
      if (!response.ok) throw new Error("Workshop unavailable");
      setState(await response.json() as PersistedWorkshop);
      setLoadState("ready");
    } catch {
      setLoadState("error");
    }
  }

  async function reloadWorkshops() {
    try {
      const response = await fetch("/api/workshop?view=collection");
      if (!response.ok) throw new Error("Workshop collection unavailable");
      setWorkshops((await response.json() as { workshops?: WorkshopSummary[] }).workshops ?? []);
    } catch {
      setWorkshops([]);
    }
  }

  async function reloadStyleLibrary() {
    try {
      const response = await fetch("/api/workshop?view=styles");
      if (!response.ok) throw new Error("Style Library unavailable");
      setStyleLibrary((await response.json() as { styles?: StyleLibraryEntry[] }).styles ?? []);
    } catch {
      setStyleLibrary([]);
    }
  }

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const next = await response.json() as PersistedWorkshop & { error?: string };
      if (!response.ok) throw new Error(next.error ?? "That action did not work");
      setState(next);
      if (body.action === "createWorkshop" || body.action === "selectWorkshop") {
        setView("map"); setSelectedNodeId(""); setSelectedSource(null); setSelectedEvidence(null); setSelectedPanelId(""); setSelectedOutputId(""); setPendingSourceScope(null); closeSheet();
      }
      if (body.action === "lockManualStyle" || body.action === "lockWebsiteStyle" || body.action === "applyStyleLibrary") void reloadStyleLibrary();
      void reloadWorkshops();
      return next;
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : "That action did not work", tone: "error" });
      try { const response = await fetch("/api/workshop"); if (response.ok) setState(await response.json() as PersistedWorkshop); } catch { /* Keep the last readable Workshop state. */ }
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function uploadPdf(file: File, permission: SourceItem["permission"] = "private") {
    setBusy(true);
    setNotice(null);
    try {
      const form = new FormData();
      form.set("action", "ingestPdfUpload");
      form.set("permission", permission);
      form.set("file", file);
      const response = await fetch("/api/workshop", { method: "POST", body: form });
      const next = await response.json() as PersistedWorkshop & { error?: string };
      if (!response.ok) throw new Error(next.error ?? "That PDF could not be added");
      setState(next);
      void reloadWorkshops();
      return next;
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : "That PDF could not be added", tone: "error" });
      return null;
    } finally {
      setBusy(false);
    }
  }

  async function handleRealtimeToolEvent(event: unknown): Promise<{ output: Record<string, unknown>; createResponse: boolean } | undefined> {
    try {
      const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "handleProviderToolEvent", providerEvent: { channel: "realtime", event, model: "gpt-realtime-2.1", explicitUserIntent: false } }) });
      const handled = await response.json() as { state?: PersistedWorkshop; providerOutput?: Record<string, unknown>; requiresConfirmation?: boolean; error?: string };
      if (!response.ok || !handled.state || !handled.providerOutput) throw new Error(handled.error ?? "That voice action did not work");
      setState(handled.state);
      return { output: handled.providerOutput, createResponse: !handled.requiresConfirmation };
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : "That voice action did not work", tone: "error" });
      return undefined;
    }
  }

  async function sendConversation(text: string): Promise<boolean> {
    setBusy(true);
    setNotice(null);
    setStreamingReply("");
    try {
      const response = await fetch("/api/conversation", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ text, messageId: globalThis.crypto.randomUUID() }) });
      if (response.status === 503) {
        const fallback = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "sendConversationMessage", text }) });
        const next = await fallback.json() as PersistedWorkshop & { error?: string };
        if (!fallback.ok) throw new Error(next.error ?? "That message did not work");
        setState(next);
        void reloadWorkshops();
        return true;
      }
      if (!response.ok || !response.body) {
        const failure = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(failure.error ?? "That message did not work");
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let completed = false;
      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as { type: "text_delta" | "tool_result" | "done" | "error"; delta?: string; state?: PersistedWorkshop; message?: string };
          if (event.type === "text_delta" && event.delta) setStreamingReply((current) => current + event.delta);
          if (event.type === "done" && event.state) { setState(event.state); completed = true; }
          if (event.type === "error") throw new Error(event.message ?? "That message did not work");
        }
        if (done) break;
      }
      if (!completed) throw new Error("WorkshopLM did not finish its response.");
      setStreamingReply("");
      void reloadWorkshops();
      return true;
    } catch (error) {
      setStreamingReply("");
      setNotice({ message: error instanceof Error ? error.message : "That message did not work", tone: "error" });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function confirmToolCall(call: ConversationToolCall): Promise<boolean> {
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "executeTool", toolCall: { name: call.name, arguments: call.input, channel: call.channel, explicitUserIntent: true, provider: call.provider } }) });
      const confirmed = await response.json() as { state?: PersistedWorkshop; result?: { isError?: boolean; summary?: string; data?: unknown }; error?: string };
      if (!response.ok || !confirmed.state || confirmed.result?.isError) throw new Error(confirmed.error ?? confirmed.result?.summary ?? "That action could not be confirmed");
      setState(confirmed.state);
      if (call.channel === "realtime" && call.provider?.callId && confirmed.result) setRealtimeContinuation(realtimeFunctionOutput(call.provider.callId, confirmed.result));
      return true;
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : "That action could not be confirmed", tone: "error" });
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function analyzeWebsiteStyle(url: string) {
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "analyzeWebsiteStyle", url }) });
      const suggestion = await response.json() as WebsiteStyleSuggestion & { error?: string };
      if (!response.ok) throw new Error(suggestion.error ?? "That website could not be reviewed");
      return suggestion;
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : "That website could not be reviewed", tone: "error" });
      return null;
    } finally {
      setBusy(false);
    }
  }

  function openView(next: ObjectView) {
    setView(next);
    closeSheet();
  }

  function openOutput(id: string) {
    setSelectedOutputId(id);
    openView("output");
  }

  function openSheet(next: Exclude<Sheet, null>, source?: SourceItem) {
    returnFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const scrollContainer = returnFocusRef.current?.closest<HTMLElement>(".focused-output") ?? null;
    returnScrollRef.current = scrollContainer ? { element: scrollContainer, top: scrollContainer.scrollTop } : null;
    if (source) setSelectedSource(source);
    setSheet(next);
  }

  function closeSheet() {
    setSheet(null);
    window.setTimeout(() => {
      const scroll = returnScrollRef.current;
      returnFocusRef.current?.focus({ preventScroll: true });
      if (scroll?.element.isConnected) {
        const restoreScroll = () => { if (scroll.element.isConnected) scroll.element.scrollTop = scroll.top; };
        restoreScroll();
        window.requestAnimationFrame(restoreScroll);
        window.setTimeout(restoreScroll, 100);
      }
      returnScrollRef.current = null;
    }, 0);
  }

  function showSource(target: EvidenceTarget = {}) {
    const claim = state?.claims?.find((item) => item.id === target.claimId)
      ?? state?.claims?.find((item) => item.sourceId === target.sourceId && item.locator === target.locator)
      ?? state?.claims?.find((item) => item.sourceId === target.sourceId);
    const source = state?.sourceItems.find((item) => item.id === (target.sourceId ?? claim?.sourceId)) ?? state?.sourceItems[0] ?? null;
    if (!source) return;
    setSelectedEvidence({ excerpt: claim?.text ?? source.excerpt, locator: claim?.locator ?? target.locator ?? source.locator });
    openSheet("evidence", source);
  }

  async function createOutputs() {
    let complete = true;
    const run = async (body: Record<string, unknown>) => { const next = await post(body); complete = Boolean(next) && complete; return next; };
    openView("outputs");
    const tasks: Array<{ label: string; create: () => Promise<unknown> }> = [];
    if (state?.outputRecovery?.deck || !state?.outputs.some((output) => output.type === "deck" && !output.stale)) tasks.push({ label: "Presentation", create: () => run({ action: "generateOutput", outputType: "deck" }) });
    if (state?.outputRecovery?.infographic || !state?.outputs.some((output) => output.type === "infographic" && !output.stale)) tasks.push({ label: "Infographic", create: () => run({ action: "generateOutput", outputType: "infographic" }) });
    if (!state?.sketch || state.sketch.stale) tasks.push({ label: "Sketch", create: () => run({ action: "createSketch" }) });
    if (!state?.audioOverviews.some((overview) => !overview.stale)) tasks.push({ label: "Audio Overview", create: () => run({ action: "generateAudioOverview" }) });
    tasks.push({ label: "Image set", create: async () => {
      await run({ action: "generateAssetPlan" });
      if (!state?.imageBatch || state.imageBatch.stale || state.imageBatch.panels.some((panel) => panel.state === "failed" || panel.state === "selected_for_regeneration")) await run({ action: "createImageBatch" });
    } });
    tasks.push({ label: "Storyboard", create: () => run({ action: "generateStoryboard" }) });
    try {
      for (const [index, task] of tasks.entries()) {
        setCreationProgress({ label: task.label, completed: index, total: tasks.length });
        await task.create();
      }
      if (!complete) setNotice({ message: "Some work needs attention. Your current work is still available.", tone: "error" });
      else if (state?.onboarding.outputsOrientationDismissed) setNotice({ message: "Created work is ready from your Brief, Style, and Sources.", tone: "status" });
    } finally {
      setCreationProgress(null);
    }
  }

  function requestSourceScopeChange(sourceId: string) {
    const current = state?.activeSourceIds ?? [];
    const source = state?.sourceItems.find((item) => item.id === sourceId);
    const removing = current.includes(sourceId);
    const sourceIds = removing ? current.filter((id) => id !== sourceId) : [...current, sourceId];
    if (!sourceIds.length) {
      setNotice({ message: "Keep at least one Source selected.", tone: "error" });
      return;
    }
    if (source) setSelectedSource(source);
    const affected = affectedWorkForSourceScope(state);
    if (!affected.length) {
      void post({ action: "setActiveSourceScope", sourceIds });
      return;
    }
    setPendingSourceScope({ sourceIds, sourceTitle: source ? sourceDisplayTitle(source) : "this Source", change: removing ? "remove" : "add", affected });
  }

  async function applySourceScopeChange() {
    if (!pendingSourceScope) return;
    const next = await post({ action: "setActiveSourceScope", sourceIds: pendingSourceScope.sourceIds });
    if (next) setPendingSourceScope(null);
  }

  const sourceCount = state?.activeSourceIds.length ?? 0;
  const visibleSourceCount = view === "output" && selectedOutput
    ? outputSourceCount(selectedOutput, state)
    : sourceCount;
  const currentTitle = view === "output" ? (selectedOutput ? outputTitle(selectedOutput.type) : selectedOutputId?.startsWith("audio-overview-") ? "Audio Overview" : selectedOutputId?.startsWith("sketch") ? "Sketch" : selectedOutputId === "images" ? "Image set" : "Demo video") : VIEW_TITLES[view];
  const currentStage = stageForView(view);
  const backTarget: ObjectView | null = view === "conversation" || view === "map" ? null : view === "brief" ? "map" : view === "outputs" ? "brief" : "outputs";
  const mapUpdateRequired = workshopMapNeedsUpdate(state);
  const workflowAction = creationProgress
    ? <Button variant="secondary" disabled>Creating {creationProgress.label}…</Button>
    : !state?.mapNodes.length
    ? <Button variant={sheet ? "secondary" : "primary"} disabled={busy} onClick={() => openSheet("add-source")}>Add source</Button>
    : mapUpdateRequired
      ? <Button variant={sheet ? "secondary" : "primary"} disabled={busy} onClick={() => { void post({ action: "buildMap" }).then((next) => next && openView("map")); }}>Update Map</Button>
    : !state.briefApproved || state.frame?.stale
      ? <Button variant={sheet ? "secondary" : "primary"} disabled={busy} onClick={() => { void post({ action: "approveBrief" }).then((next) => next && openView("brief")); }}>Approve brief</Button>
      : !canDeliver
        ? <Button variant={sheet ? "secondary" : "primary"} disabled={busy} onClick={() => openSheet("style")}>Choose style</Button>
        : imageFailureCount
          ? <Button variant={sheet ? "secondary" : "primary"} disabled={busy} onClick={() => openOutput("images")}>Review {imageFailureCount === 1 ? "image" : "images"}</Button>
        : !(state.outputs.length || state.imageBatch) || outputsNeedUpdate
          ? <Button variant={sheet ? "secondary" : "primary"} disabled={busy} onClick={() => { void createOutputs(); }}>{outputFailureCount ? "Try again" : state.outputs.length ? "Update work" : "Create work"}</Button>
          : imageReplacementCount
            ? <Button variant="secondary" disabled>Creating replacement…</Button>
          : !state.storyboardApproved
            ? view === "storyboard"
              ? <Button aria-label="Approve storyboard" variant={sheet ? "secondary" : "primary"} disabled={busy || state.storyboard.stale || !state.storyboard.panels.length} onClick={() => { void post({ action: "approveStoryboard" }); }}>Approve</Button>
              : <Button variant={sheet ? "secondary" : "primary"} onClick={() => openView("storyboard")}>Review storyboard</Button>
            : state.videoState === "rendered"
              ? <Button variant={sheet ? "secondary" : "primary"} onClick={() => openOutput([...state.videos].reverse().find((video) => !video.stale)?.id ?? "video")}>View video</Button>
              : state.videoState === "queued"
                ? <Button variant="secondary" disabled={busy} onClick={() => { void post({ action: "cancelVideoRender" }); }}>Cancel video</Button>
                : state.videoState === "rendering"
                  ? <Button variant="secondary" disabled>Creating…</Button>
                  : <Button variant={sheet ? "secondary" : "primary"} disabled={busy} onClick={() => { void post({ action: "renderVideo" }); }}>{state.videoState === "failed" || state.videoState === "cancelled" ? "Try video again" : "Create video"}</Button>;

  if (loadState === "ready" && state && state.onboarding.step !== "complete") {
    return <OnboardingFlow state={state} styleLibrary={styleLibrary} busy={busy} notice={notice} onPost={post} onUploadPdf={uploadPdf} />;
  }

  return (
    <FullScreenShell className="workshop-shell">
      <NavigationHeader className="workshop-header">
        <div className="header-identity">
          {backTarget && <IconButton label={`Back to ${VIEW_TITLES[backTarget]}`} onClick={() => openView(backTarget)}><ArrowLeftIcon /></IconButton>}
          <div className="workshop-identity"><ListRowAction className="workshop-picker" aria-label="Switch Workshop" onClick={() => openSheet("workshops")}><strong>{state?.title || "WorkshopLM"}</strong></ListRowAction><span aria-hidden="true">/</span><b>{currentTitle}</b></div>
        </div>
        {loadState === "ready" && <WorkshopSpine current={currentStage} state={state} onOpenIndex={() => openSheet("objects")} onSelect={(stage) => {
          if (stage === "capture") return openView("conversation");
          if (stage === "map") return state?.mapNodes.length ? openView("map") : openSheet("sources");
          if (stage === "brief") return state?.briefApproved && !mapUpdateRequired ? openView("brief") : openView("map");
          if (state?.outputs.length || state?.imageBatch) return openView("outputs");
          if (state?.briefApproved) return openSheet("style");
          openView("map");
        }} />}
        {loadState === "ready" && <div className="header-actions"><Button className="header-source-trigger" variant="secondary" size="small" onClick={() => openSheet("sources")}>{visibleSourceCount} {visibleSourceCount === 1 ? "source" : "sources"}</Button><Button className="header-browse-trigger" aria-label="Open Workshop index" variant="secondary" size="small" onClick={() => openSheet("objects")}><span className="browse-label">Workshop</span><span className="browse-compact" aria-hidden="true">•••</span></Button><div className="workflow-action">{workflowAction}</div></div>}
      </NavigationHeader>

      {notice && <Card className={`notice notice--${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}><span>{notice.message}</span><IconButton label="Dismiss" onClick={() => setNotice(null)}><CloseIcon /></IconButton></Card>}

      <Workbench className="workbench">
        <section ref={objectCanvasRef} className="object-canvas" aria-label={currentTitle}>
          {loadState === "loading" && <StateMessage state="loading" title="Opening Workshop">Loading your Sources and work.</StateMessage>}
          {loadState === "error" && <StateMessage state="error" title="Couldn't open Workshop" action={<Button onClick={() => { void reload(); }}>Retry</Button>}>Your work is safe. Try opening it again.</StateMessage>}
          {loadState === "ready" && view === "conversation" && <ConversationView state={state} busy={busy} streamingReply={streamingReply} realtimeContinuation={realtimeContinuation} onRealtimeContinuationSent={() => setRealtimeContinuation(undefined)} onSend={sendConversation} onVoiceSave={async (text, capture) => Boolean(await post({ action: "captureFallbackTranscript", text, capture }))} onVoiceToolEvent={handleRealtimeToolEvent} onConfirmTool={confirmToolCall} onShowSource={showSource} />}
          {loadState === "ready" && view === "map" && <MapCanvas state={state} selectedNode={selectedNode} busy={busy} onSelect={setSelectedNodeId} onSync={(canvasNodes) => { void post({ action: "syncMapCanvas", canvasNodes }); }} onUndo={() => { void post({ action: "undoMapOperation" }); }} onShowSource={showSource} onOpenSources={() => openSheet("sources")} onOpenConversation={() => openView("conversation")} onReviewStyle={() => openSheet("style")} onRetryStyle={(url) => { void post({ action: "beginWebsiteStyleAnalysis", url }); }} onUseDefaultStyle={() => { void post({ action: "lockManualStyle", manualStyle: { name: "Clean professional", intentProfile: state?.onboarding.outcome } }); }} />}
          {loadState === "ready" && view === "brief" && <BriefView state={state} onChooseStyle={() => openSheet("style")} onShowSource={showSource} />}
          {loadState === "ready" && view === "outputs" && <OutputsView state={state} creationProgress={creationProgress} onOpenOutput={openOutput} onOpenStoryboard={() => openView("storyboard")} onDismissOrientation={() => { void post({ action: "dismissOrientation", orientation: "outputs" }); }} />}
          {loadState === "ready" && view === "storyboard" && <StoryboardView storyboard={state?.storyboard} storyboardHistory={state?.storyboardHistory ?? []} imageBatch={state?.imageBatch} style={state?.style} approved={Boolean(state?.storyboardApproved)} panel={selectedPanel} busy={busy} onSelect={setSelectedPanelId} onPost={post} onShowSource={showSource} />}
          {loadState === "ready" && view === "output" && <FocusedOutputView state={state} outputId={selectedOutputId} busy={busy} onPost={post} onOpenOutput={openOutput} onShowSource={showSource} onShowOriginal={() => openSheet("original")} onEditStoryboard={() => openView("storyboard")} onRequestReplacement={(panelId) => { setSelectedImagePanelId(panelId); openSheet("image-replacement"); }} />}
        </section>
      </Workbench>

      {sheet === "workshops" && <WorkshopsSheet workshops={workshops} busy={busy} onClose={closeSheet} onSelect={(workshopId) => { void post({ action: "selectWorkshop", workshopId }); }} onCreate={(title) => post({ action: "createWorkshop", title }).then(Boolean)} onHelp={() => setSheet("help")} />}
      {sheet === "objects" && <ObjectsSheet state={state} view={view} onClose={closeSheet} onSelect={(target) => {
        if (target === "sources" || target === "style") return setSheet(target);
        closeSheet(); openView(target);
      }} onWorkshops={() => setSheet("workshops")} />}
      {sheet === "sources" && <SourcesSheet sources={state?.sourceItems ?? []} activeIds={state?.activeSourceIds ?? []} selected={selectedSource} pending={pendingSourceScope} busy={busy} onClose={closeSheet} onSelect={setSelectedSource} onToggle={requestSourceScopeChange} onApplyScope={() => { void applySourceScopeChange(); }} onCancelScope={() => setPendingSourceScope(null)} onAdd={() => setSheet("add-source")} onShowMap={(source) => { setSelectedNodeId(state?.mapNodes.find((node) => node.sourceId === source.id)?.id ?? ""); openView("map"); }} />}
      {sheet === "evidence" && selectedSource && <EvidenceSheet source={selectedSource} evidence={selectedEvidence} onClose={closeSheet} onShowMap={() => { setSelectedNodeId(state?.mapNodes.find((node) => node.sourceId === selectedSource.id)?.id ?? ""); openView("map"); }} />}
      {sheet === "add-source" && <AddSourceSheet busy={busy} onClose={() => setSheet("sources")} onPost={post} onUploadPdf={uploadPdf} />}
      {sheet === "style" && <StyleSheet style={state?.style} analysisSuggestion={state?.onboarding.styleAnalysis?.status === "ready" ? state.onboarding.styleAnalysis.suggestion : undefined} defaultIntent={state?.onboarding.outcome} library={styleLibrary} busy={busy} onClose={closeSheet} onPost={post} onAnalyzeWebsite={analyzeWebsiteStyle} />}
      {sheet === "image-replacement" && state?.imageBatch && <ImageReplacementSheet panel={state.imageBatch.panels.find((panel) => panel.id === selectedImagePanelId)} busy={busy} onClose={closeSheet} onSubmit={async (panelId, revisionRequest) => { const next = await post({ action: "regenerateImagePanel", panelId, revisionRequest }); if (!next) return false; closeSheet(); setNotice({ message: "Creating one replacement. Review it in Storyboard before approving Video.", tone: "status" }); return true; }} />}
      {sheet === "original" && <OriginalRevealSheet state={state} onClose={closeSheet} />}
      {sheet === "help" && <HowItWorksSheet onClose={closeSheet} />}
    </FullScreenShell>
  );
}

function OnboardingFlow({ state, styleLibrary, busy, notice, onPost, onUploadPdf }: { state: PersistedWorkshop; styleLibrary: StyleLibraryEntry[]; busy: boolean; notice: { message: string; tone: "status" | "error" } | null; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null>; onUploadPdf: (file: File, permission?: SourceItem["permission"]) => Promise<PersistedWorkshop | null> }) {
  const outcome = state.onboarding.outcome ?? "client_facing_pitch";
  const [title, setTitle] = useState(state.title === "WorkshopLM Build Week" ? "" : state.title);
  const [website, setWebsite] = useState("");
  const [source, setSource] = useState("");
  const sourceKind = sourceInputKind(source);

  async function startWorkshop() {
    if (state.onboarding.outcome && state.onboarding.step !== "welcome") return state;
    return onPost({ action: "updateOnboarding", title: title.trim() || "New Workshop", outcome, onboardingStep: "sources" });
  }

  async function chooseStyle(body: Record<string, unknown>) {
    const styled = await onPost(body);
    if (styled) await onPost({ action: "updateOnboarding", onboardingStep: "sources" });
  }

  async function reviewWebsite() {
    const started = await onPost({ action: "beginWebsiteStyleAnalysis", url: website.trim() });
    if (started) await onPost({ action: "updateOnboarding", onboardingStep: "sources" });
  }

  async function addSource() {
    const value = source.trim();
    if (!value) return state;
    const started = await startWorkshop();
    if (!started) return null;
    const body = sourceKind === "url"
      ? { action: "ingestUrl", url: value }
      : sourceKind === "pdf"
        ? { action: "ingestPdfFile", filePath: value, permission: "private" }
        : { action: "ingestSource", source: { title: sourceTitleFromText(value), origin: "Pasted notes", text: value, permission: "private" } };
    const next = await onPost(body);
    if (next) setSource("");
    return next;
  }

  async function addPdf(file: File) {
    const started = await startWorkshop();
    if (!started) return false;
    return Boolean(await onUploadPdf(file));
  }

  async function buildMap() {
    const ready = source.trim() ? await addSource() : await startWorkshop();
    if (!ready || ready.sourceItems.length === 0) return;
    await onPost({ action: "buildMap", title: title.trim() || undefined, outcome });
  }

  return <FullScreenShell className="onboarding-shell">
    <NavigationHeader className="onboarding-header"><strong>WorkshopLM</strong><span>From conversations and Sources to professional knowledge work.</span></NavigationHeader>
    {notice && <Card className={`notice notice--${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}>{notice.message}</Card>}
    <section className="onboarding-stage">
      {state.onboarding.step === "style" && <Card className="onboarding-card style-start-card">
        <div className="onboarding-copy"><small>Company Style</small><h1>Make every format feel like yours.</h1><p>We’ll suggest colors, type, and brand assets for review. This website will not be added to Sources.</p></div>
        {styleLibrary.length > 0 && <section className="saved-style-start"><h2>Use your latest saved style</h2><ListGroup>{styleLibrary.slice(0, 1).map((entry) => <ListRow key={entry.id}><ListRowAction disabled={busy} onClick={() => { void chooseStyle({ action: "applyStyleLibrary", styleLibraryId: entry.id, intentProfile: outcome }); }}><div className="saved-style-row"><span><strong>{entry.name}</strong><small>{entry.source === "website" ? "From website" : "Set manually"} · Version {entry.revision}</small></span><div className="palette-preview compact" aria-hidden="true"><i style={{ background: entry.accent }} /><i style={{ background: entry.ink }} /><i style={{ background: entry.paper }} /></div></div></ListRowAction></ListRow>)}</ListGroup></section>}
        <div className="website-style-start"><Input label="Company website" placeholder="https://company.com" value={website} onChange={(event) => setWebsite(event.target.value)} /><Button disabled={busy || !website.trim()} onClick={() => { void reviewWebsite(); }}>Find my company style</Button></div>
        <div className="onboarding-secondary-actions"><Button variant="secondary" disabled={busy} onClick={() => { void chooseStyle({ action: "lockManualStyle", manualStyle: { name: "Clean professional", intentProfile: outcome } }); }}>Use a clean default for now</Button>{state.style && <Button variant="secondary" disabled={busy} onClick={() => { void onPost({ action: "updateOnboarding", onboardingStep: "sources" }); }}>Continue with {state.style.name}</Button>}<Button variant="secondary" disabled={busy} onClick={() => { void onPost({ action: "updateOnboarding", onboardingStep: "welcome" }); }}>Back</Button></div>
      </Card>}

      {(state.onboarding.step === "welcome" || state.onboarding.step === "sources") && <Card className="onboarding-card source-start-card">
        <div className="onboarding-copy"><small>New Workshop</small><h1>Start with what you know.</h1><p>Talk through the idea, paste meeting notes, add a public page, or choose a local PDF. WorkshopLM will organize it into a grounded Map.</p></div>
        <Input label="Workshop name (optional)" placeholder="Name this later" value={title} onChange={(event) => setTitle(event.target.value)} />
        <RealtimeCapture onSave={async (transcript, capture) => {
          const started = await startWorkshop();
          if (!started) return false;
          const captured = await onPost({ action: "captureFallbackTranscript", text: transcript, capture });
          if (!captured) return false;
          return Boolean(await onPost({ action: "buildMap", title: title.trim() || undefined, outcome }));
        }} />
        <div className="source-divider"><span>or add material</span></div>
        <TextArea label="Notes or website" hint="Paste meeting notes or a public URL" value={source} onChange={(event) => setSource(event.target.value)} />
        <div className="source-start-actions"><FilePicker className="local-pdf-picker" label="Choose PDF" accept="application/pdf,.pdf" disabled={busy} onChoose={(file) => { void addPdf(file); }} /><Button variant="secondary" disabled={busy || !source.trim()} onClick={() => { void addSource(); }}>Add source</Button><Button disabled={busy || (state.sourceItems.length === 0 && !source.trim())} onClick={() => { void buildMap(); }}>{busy ? "Building Map…" : "Build my Map"}</Button></div>
        {state.sourceItems.length > 0 && <p className="source-ready" role="status">{state.sourceItems.length} {state.sourceItems.length === 1 ? "source" : "sources"} ready</p>}
      </Card>}
    </section>
  </FullScreenShell>;
}

function WorkshopSpine({ current, state, onSelect, onOpenIndex }: { current: WorkshopStage; state: PersistedWorkshop | null; onSelect: (stage: WorkshopStage) => void; onOpenIndex: () => void }) {
  const created = Boolean(state?.outputs.length || state?.imageBatch || state?.audioOverviews.length || state?.sketch);
  const mapUpdateRequired = workshopMapNeedsUpdate(state);
  const stages: Array<{ id: WorkshopStage; label: string; ready: boolean; needsUpdate: boolean }> = [
    { id: "capture", label: "Capture", ready: Boolean(state?.activeSourceIds.length), needsUpdate: false },
    { id: "map", label: "Map", ready: Boolean(state?.mapNodes.length) && !mapUpdateRequired, needsUpdate: mapUpdateRequired },
    { id: "brief", label: "Brief", ready: Boolean(state?.briefApproved && !state.frame?.stale && !mapUpdateRequired), needsUpdate: Boolean(state?.frame?.stale || mapUpdateRequired) },
    { id: "create", label: "Create", ready: created, needsUpdate: created && outputSetStatus(state).actionRequired },
  ];
  return <nav className="workshop-spine" aria-label="Workshop progress">
    {stages.map((stage, index) => <div className="spine-step" key={stage.id}>
      {index > 0 && <span className="spine-arrow" aria-hidden="true">→</span>}
      <Button variant="secondary" size="small" className={`spine-stage ${current === stage.id ? "current" : ""} ${stage.ready ? "ready" : ""} ${stage.needsUpdate ? "needs-update" : ""}`} aria-current={current === stage.id ? "step" : undefined} aria-label={current === stage.id ? `Open Workshop index, ${stage.label}${stage.needsUpdate ? ", needs update" : ""}` : `${stage.label}${stage.needsUpdate ? ", needs update" : stage.ready ? ", ready" : ""}`} onClick={() => current === stage.id ? onOpenIndex() : onSelect(stage.id)}><span>{stage.label}</span>{stage.needsUpdate ? <i>Needs update</i> : stage.ready ? <i>Ready</i> : null}</Button>
    </div>)}
  </nav>;
}

function recommendedMapPath(nodes: MapNode[], edges: MapEdge[]) {
  if (!edges.length) return nodes.slice(0, 3);
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const incoming = new Set(edges.map((edge) => edge.to));
  const outgoing = new Map<string, string[]>();
  for (const edge of edges) outgoing.set(edge.from, [...(outgoing.get(edge.from) ?? []), edge.to]);
  const roots = nodes.filter((node) => !incoming.has(node.id));
  const candidates = roots.length ? roots : nodes;
  const paths = candidates.map((root) => {
    const path = [root];
    const seen = new Set([root.id]);
    let current = root;
    while (path.length < 4) {
      const next = (outgoing.get(current.id) ?? []).map((id) => nodeById.get(id)).find((node): node is MapNode => Boolean(node && !seen.has(node.id)));
      if (!next) break;
      path.push(next); seen.add(next.id); current = next;
    }
    return path;
  });
  return paths.sort((left, right) => right.length - left.length)[0] ?? nodes.slice(0, 1);
}

function organizedMapNodes(nodes: MapNode[], _edges: MapEdge[]) {
  if (!nodes.length) return nodes;
  const layerFor = (node: MapNode) => node.kind === "grounded" ? 0 : node.kind === "derived" ? 1 : 2;
  const layers = [0, 1, 2].map((layer) => nodes.filter((node) => layerFor(node) === layer));
  if (layers[0].length === nodes.length) {
    const columns = nodes.length <= 3 ? 1 : 2;
    const x = columns === 1 ? [34] : [18, 50];
    const rows = Math.ceil(nodes.length / columns);
    const step = rows <= 1 ? 0 : Math.min(26, 62 / (rows - 1));
    return nodes.map((node, index) => ({ ...node, x: x[index % columns]!, y: Math.round((18 + Math.floor(index / columns) * step) * 10) / 10, width: 26, height: 18 }));
  }
  return layers.flatMap((layer, layerIndex) => {
    if (layerIndex === 0 && layer.length > 3) {
      const rows = Math.ceil(layer.length / 2);
      const step = rows <= 1 ? 0 : Math.min(26, 58 / (rows - 1));
      return layer.map((node, index) => ({ ...node, x: index % 2 === 0 ? 1 : 33, y: Math.round((14 + Math.floor(index / 2) * step) * 10) / 10, width: 22, height: 16 }));
    }
    const x = [4, 73, 112];
    const step = layer.length <= 1 ? 0 : Math.min(23, 72 / (layer.length - 1));
    const start = layer.length <= 1 ? 41 : 10;
    return layer.map((node, index) => ({ ...node, x: x[layerIndex]!, y: Math.round((start + index * step) * 10) / 10, width: layerIndex === 0 ? 26 : layerIndex === 1 ? 23 : 24, height: layerIndex === 2 ? 20 : 18 }));
  });
}

function MapCanvas({ state, selectedNode, busy, onSelect, onSync, onUndo, onShowSource, onOpenSources, onOpenConversation, onReviewStyle, onRetryStyle, onUseDefaultStyle }: { state: PersistedWorkshop | null; selectedNode?: MapNode; busy: boolean; onSelect: (id: string) => void; onSync: (nodes: Pick<MapNode, "id" | "title" | "x" | "y" | "width" | "height">[]) => void; onUndo: () => void; onShowSource: (target?: EvidenceTarget) => void; onOpenSources: () => void; onOpenConversation: () => void; onReviewStyle: () => void; onRetryStyle: (url: string) => void; onUseDefaultStyle: () => void }) {
  const sources = (state?.sourceItems ?? []).filter((source) => state?.activeSourceIds.includes(source.id));
  const nodes = (state?.mapNodes ?? []).filter((node) => !node.sourceId || state?.activeSourceIds.includes(node.sourceId));
  const relatedSourceId = (node: MapNode, index: number) => node.sourceId ?? sources[index % Math.max(1, sources.length)]?.id;
  const selectedSourceId = selectedNode ? relatedSourceId(selectedNode, Math.max(0, nodes.indexOf(selectedNode))) : undefined;
  const source = sources.find((item) => item.id === selectedSourceId);
  const canUndo = Boolean(state?.graphState && !state.graphState.includes('"records":[]'));
  const analysis = state?.onboarding.styleAnalysis;
  const analysisDomain = analysis ? new URL(analysis.url).hostname : "";
  const shouldOrganize = !state?.graphState?.includes("operation-canvas-");
  const displayedNodes = useMemo(() => shouldOrganize ? organizedMapNodes(nodes, state?.mapEdges ?? []) : nodes, [nodes, state?.mapEdges, shouldOrganize]);
  const path = recommendedMapPath(nodes, state?.mapEdges ?? []);
  const recommendation = path[path.length - 1] ?? nodes[0];
  const clusterCounts = {
    evidence: displayedNodes.filter((node) => node.kind === "grounded").length,
    synthesis: displayedNodes.filter((node) => node.kind === "derived").length,
    direction: displayedNodes.filter((node) => node.kind === "creative").length,
  };

  if (!nodes.length) return <div className="state-surface"><StateMessage state="empty" title="Start with a source">Create professional knowledge work, with every factual claim traced to its Source.</StateMessage></div>;

  return <div className="map-canvas" data-domain-ui="map-canvas">
    <section className="map-insight-bar" aria-label="Map overview">
      <div className="map-clusters"><span><b>{clusterCounts.evidence}</b> Evidence</span>{clusterCounts.synthesis > 0 && <span><b>{clusterCounts.synthesis}</b> Synthesis</span>}{clusterCounts.direction > 0 && <span><b>{clusterCounts.direction}</b> Direction</span>}</div>
      {recommendation && <div className="map-path"><small>Recommended direction</small><Button variant="secondary" size="small" aria-label={`Recommended direction: ${recommendation.title}`} onClick={() => onSelect(recommendation.id)}>{recommendation.title}</Button></div>}
      {canUndo && <Button variant="secondary" size="small" disabled={busy} onClick={onUndo}>Undo</Button>}
    </section>
    {!state?.style && analysis && <Card className="style-analysis-status" role="status"><div><strong>{analysis.status === "reviewing" ? `Reviewing ${analysisDomain}…` : analysis.status === "ready" ? "Company style ready to review" : "Couldn't review this website"}</strong><p>{analysis.status === "reviewing" ? "Keep shaping the Map while WorkshopLM checks the public visual foundation." : analysis.status === "ready" ? "Review the suggested colors, type, and brand assets before creating work." : analysis.error ?? "Try again or continue with a clean professional Style."}</p></div><div className="button-row">{analysis.status === "ready" && <Button variant="secondary" size="small" onClick={onReviewStyle}>Review style</Button>}{analysis.status === "error" && <><Button variant="secondary" size="small" disabled={busy} onClick={() => onRetryStyle(analysis.url)}>Try again</Button><Button variant="secondary" size="small" onClick={onReviewStyle}>Set manually</Button><Button variant="secondary" size="small" disabled={busy} onClick={onUseDefaultStyle}>Use a clean default</Button></>}</div></Card>}
    <ExcalidrawMap nodes={displayedNodes} sources={sources} edges={state?.mapEdges ?? []} style={state?.style ? { accent: state.style.accent, ink: state.style.ink, paper: state.style.paper } : undefined} selectedNodeId={selectedNode?.id} onSelectNode={onSelect} onShowSource={(sourceId) => onShowSource({ sourceId })} onSync={onSync} />
    <section className="map-source-shelf" aria-label="Selected Sources"><div className="map-source-shelf-heading"><div><strong>Sources</strong><span>{sources.length} selected</span></div><Button variant="secondary" size="small" onClick={onOpenSources}>Manage</Button></div><div className="map-source-items">{sources.slice(0, 4).map((item) => <ListRowAction className="map-source-chip" key={item.id} onClick={() => onShowSource({ sourceId: item.id })}><FileIcon label={item.type} /><span><strong>{sourceDisplayTitle(item)}</strong><small>{item.claimCount} claims</small></span></ListRowAction>)}</div><Button variant="secondary" size="small" onClick={onOpenConversation}>Ask sources</Button></section>
    {selectedNode && <ClaimInspector node={selectedNode} source={source} busy={busy} onClose={() => onSelect("")} onSave={(title) => onSync([{ id: selectedNode.id, title, x: selectedNode.x, y: selectedNode.y, width: selectedNode.width, height: selectedNode.height }])} onShowSource={() => onShowSource({ sourceId: selectedSourceId, claimId: selectedNode.id, locator: selectedNode.locator })} />}
  </div>;
}

function ClaimInspector({ node, source, busy, onClose, onSave, onShowSource }: { node: MapNode; source?: SourceItem; busy: boolean; onClose: () => void; onSave: (title: string) => void; onShowSource: () => void }) {
  const [title, setTitle] = useState(node.title);
  useEffect(() => setTitle(node.title), [node.id, node.title]);
  return <Card className="claim-inspector"><header><div><small>{node.kind === "grounded" ? "Sourced claim" : node.kind === "derived" ? "Derived point" : "Idea"}</small><strong>{node.title}</strong></div><IconButton label="Close claim" onClick={onClose}><CloseIcon /></IconButton></header><Input label="Claim" value={title} onChange={(event) => setTitle(event.target.value)} /><blockquote>{source?.excerpt ?? node.body}</blockquote><p className="source-locator">{source ? sourceEvidenceLocator(source, source.locator) : node.locator}</p><div className="button-row"><Button variant="secondary" disabled={busy || title.trim() === node.title || !title.trim()} onClick={() => onSave(title.trim())}>Save</Button><Button variant="secondary" size="small" onClick={onShowSource}>Show source</Button></div></Card>;
}

function frameSection(markdown: string | undefined, heading: string) {
  if (!markdown) return "";
  return markdown.match(new RegExp(`## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`))?.[1]?.trim() ?? "";
}

function BriefView({ state, onChooseStyle, onShowSource }: { state: PersistedWorkshop | null; onChooseStyle: () => void; onShowSource: (target?: EvidenceTarget) => void }) {
  const outcome = frameSection(state?.frame?.markdown, "Outcome") || "Turn raw thinking into professional knowledge work.";
  const audience = frameSection(state?.frame?.markdown, "Audience");
  const evidence = frameSection(state?.frame?.markdown, "Evidence").split("\n").map((line) => line.replace(/^[-*]\s*/, "").trim()).filter(Boolean).map((item) => {
    const separator = item.lastIndexOf(" — ");
    const text = separator >= 0 ? item.slice(0, separator).trim() : item;
    const locator = separator >= 0 ? item.slice(separator + 3).trim() : undefined;
    const claim = state?.claims?.find((candidate) => candidate.locator === locator && candidate.text === text) ?? state?.claims?.find((candidate) => candidate.locator === locator);
    return { text, locator, claim };
  });
  const direction = frameSection(state?.frame?.markdown, "Direction") || frameSection(state?.frame?.markdown, "Success looks like") || frameSection(state?.frame?.markdown, "Production proof");
  const locked = Boolean(state?.style && !state.style.stale);
  const sourceCount = state?.activeSourceIds.length ?? 0;

  return <article className="brief-view">
    <Card className="brief-document"><main className="brief-editorial-main"><div className="brief-meta"><Status>Approved</Status><span>{sourceCount} {sourceCount === 1 ? "source" : "sources"} · {state?.mapNodes.filter((node) => node.kind === "grounded").length ?? 0} sourced claims</span></div>{audience && <p className="brief-audience"><span>For</span>{audience}</p>}<h1>{outcome}</h1>{direction && <section className="brief-section"><h2>Approved direction</h2><p>{direction}</p></section>}</main><aside className="brief-editorial-side">{evidence.length > 0 && <section className="brief-section brief-evidence"><h2>Evidence behind this brief</h2><ul>{evidence.map((item) => <li className="brief-evidence-item" key={`${item.text}-${item.locator ?? "untraced"}`}><span>{item.text}</span>{item.locator && <Token onClick={() => onShowSource({ sourceId: item.claim?.sourceId, claimId: item.claim?.id, locator: item.locator })}>{item.locator}</Token>}</li>)}</ul></section>}<section className="style-summary" aria-label="Style"><div className="style-summary-copy"><small>Style</small><strong>{locked ? state?.style?.name : "Not selected"}</strong></div><div className="palette-preview compact" data-domain-ui="palette-preview"><i style={{ background: state?.style?.accent ?? "#0285FF" }} /><i style={{ background: state?.style?.ink ?? "#0D0D0D" }} /><i style={{ background: state?.style?.paper ?? "#FFFFFF" }} /></div>{locked && <Button variant="secondary" size="small" onClick={onChooseStyle}>Edit</Button>}</section></aside></Card>
  </article>;
}

function StyleSheet({ style, analysisSuggestion, defaultIntent, library, busy, onClose, onPost, onAnalyzeWebsite }: { style?: PersistedWorkshop["style"]; analysisSuggestion?: WebsiteStyleSuggestion; defaultIntent?: WorkshopOutcome; library: StyleLibraryEntry[]; busy: boolean; onClose: () => void; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null>; onAnalyzeWebsite: (url: string) => Promise<WebsiteStyleSuggestion | null> }) {
  const [mode, setMode] = useState<"website" | "manual">(style?.source ?? "website");
  const [website, setWebsite] = useState(style?.referenceUrl ?? analysisSuggestion?.referenceUrl ?? "");
  const [reviewedUrl, setReviewedUrl] = useState(style?.source === "website" ? style.referenceUrl ?? "" : analysisSuggestion?.referenceUrl ?? "");
  const [findings, setFindings] = useState<WebsiteStyleSuggestion["findings"] | null>(analysisSuggestion?.findings ?? null);
  const [name, setName] = useState(style?.name ?? analysisSuggestion?.name ?? "WorkshopLM editorial");
  const [accent, setAccent] = useState(style?.accent ?? analysisSuggestion?.accent ?? "#0285FF");
  const [ink, setInk] = useState(style?.ink ?? analysisSuggestion?.ink ?? "#0D0D0D");
  const [paper, setPaper] = useState(style?.paper ?? analysisSuggestion?.paper ?? "#FFFFFF");
  const [intent, setIntent] = useState<ManualStylePayload["intentProfile"]>(defaultIntent ?? style?.intentProfile ?? "client_facing_pitch");
  const [logos, setLogos] = useState((style?.logos ?? analysisSuggestion?.logos ?? []).join("\n"));
  const [selectedAssetUrls, setSelectedAssetUrls] = useState(style?.brandAssets.map((asset) => asset.sourceUrl) ?? []);
  const [assetCandidates, setAssetCandidates] = useState(analysisSuggestion?.assetCandidates ?? analysisSuggestion?.logos.map((url) => ({ url, kind: "logo" as const })) ?? []);
  const [headingFont, setHeadingFont] = useState(style?.typographyRoles.heading.family ?? analysisSuggestion?.fontCandidates[0] ?? "system-ui");
  const [bodyFont, setBodyFont] = useState(style?.typographyRoles.body.family ?? analysisSuggestion?.fontCandidates[1] ?? analysisSuggestion?.fontCandidates[0] ?? "system-ui");
  const [fontsConfirmed, setFontsConfirmed] = useState(Boolean(style && style.typographyRoles.heading.availability !== "unverified" && style.typographyRoles.body.availability !== "unverified"));
  const [references, setReferences] = useState((style?.references ?? analysisSuggestion?.references ?? ["calm editorial work surface"]).join("\n"));
  const [negativeRules, setNegativeRules] = useState((style?.negativeRules ?? analysisSuggestion?.negativeRules ?? ["no decorative gradients"]).join("\n"));
  const [showDetails, setShowDetails] = useState(false);
  const [showCreator, setShowCreator] = useState(library.length === 0 || Boolean(style) || Boolean(analysisSuggestion));
  const [editingDetails, setEditingDetails] = useState(Boolean(style) || !analysisSuggestion);
  useEffect(() => {
    setMode(style?.source ?? "website"); setWebsite(style?.referenceUrl ?? analysisSuggestion?.referenceUrl ?? ""); setReviewedUrl(style?.source === "website" ? style.referenceUrl ?? "" : analysisSuggestion?.referenceUrl ?? ""); setFindings(analysisSuggestion?.findings ?? null); setName(style?.name ?? analysisSuggestion?.name ?? "WorkshopLM editorial"); setAccent(style?.accent ?? analysisSuggestion?.accent ?? "#0285FF"); setInk(style?.ink ?? analysisSuggestion?.ink ?? "#0D0D0D"); setPaper(style?.paper ?? analysisSuggestion?.paper ?? "#FFFFFF"); setIntent(defaultIntent ?? style?.intentProfile ?? "client_facing_pitch"); setLogos((style?.logos ?? analysisSuggestion?.logos ?? []).join("\n")); setSelectedAssetUrls(style?.brandAssets.map((asset) => asset.sourceUrl) ?? []); setAssetCandidates(analysisSuggestion?.assetCandidates ?? analysisSuggestion?.logos.map((url) => ({ url, kind: "logo" as const })) ?? []); setHeadingFont(style?.typographyRoles.heading.family ?? analysisSuggestion?.fontCandidates[0] ?? "system-ui"); setBodyFont(style?.typographyRoles.body.family ?? analysisSuggestion?.fontCandidates[1] ?? analysisSuggestion?.fontCandidates[0] ?? "system-ui"); setFontsConfirmed(Boolean(style && style.typographyRoles.heading.availability !== "unverified" && style.typographyRoles.body.availability !== "unverified")); setReferences((style?.references ?? analysisSuggestion?.references ?? ["calm editorial work surface"]).join("\n")); setNegativeRules((style?.negativeRules ?? analysisSuggestion?.negativeRules ?? ["no decorative gradients"]).join("\n")); setShowDetails(false); setShowCreator(library.length === 0 || Boolean(style) || Boolean(analysisSuggestion)); setEditingDetails(Boolean(style) || !analysisSuggestion);
  }, [style, analysisSuggestion, defaultIntent, library.length]);
  const locked = Boolean(style && !style.stale);
  const splitLines = (value: string) => value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
  const dirty = mode !== (style?.source ?? "manual") || website.trim() !== (style?.referenceUrl ?? "") || name.trim() !== (style?.name ?? "WorkshopLM editorial") || accent.trim().toUpperCase() !== (style?.accent ?? "#0285FF").toUpperCase() || ink.trim().toUpperCase() !== (style?.ink ?? "#0D0D0D").toUpperCase() || paper.trim().toUpperCase() !== (style?.paper ?? "#FFFFFF").toUpperCase() || intent !== (style?.intentProfile ?? "client_facing_pitch") || logos.trim() !== (style?.logos ?? []).join("\n") || selectedAssetUrls.join("\n") !== (style?.brandAssets.map((asset) => asset.sourceUrl) ?? []).join("\n") || headingFont.trim() !== (style?.typographyRoles.heading.family ?? "system-ui") || bodyFont.trim() !== (style?.typographyRoles.body.family ?? "system-ui") || fontsConfirmed !== Boolean(style && style.typographyRoles.heading.availability !== "unverified" && style.typographyRoles.body.availability !== "unverified") || references.trim() !== (style?.references ?? []).join("\n") || negativeRules.trim() !== (style?.negativeRules ?? []).join("\n");
  const reviewed = mode === "manual" || Boolean(reviewedUrl && reviewedUrl === website.trim());
  const findingSummary = findings ? `${findings.colors} color${findings.colors === 1 ? "" : "s"}, ${findings.fontCandidates} font candidate${findings.fontCandidates === 1 ? "" : "s"}, and ${findings.assets} brand asset${findings.assets === 1 ? "" : "s"}` : "";
  const reviewWebsite = () => { void onAnalyzeWebsite(website.trim()).then((suggestion) => { if (!suggestion) return; setReviewedUrl(website.trim()); setFindings(suggestion.findings); setName(suggestion.name); setAccent(suggestion.accent); setInk(suggestion.ink); setPaper(suggestion.paper); setLogos(""); setSelectedAssetUrls([]); setAssetCandidates(suggestion.assetCandidates ?? suggestion.logos.map((url) => ({ url, kind: "logo" as const }))); setHeadingFont(suggestion.fontCandidates[0] ?? "system-ui"); setBodyFont(suggestion.fontCandidates[1] ?? suggestion.fontCandidates[0] ?? "system-ui"); setFontsConfirmed(false); setReferences(suggestion.references.join("\n")); setNegativeRules(suggestion.negativeRules.join("\n")); setEditingDetails(false); }); };
  const saveStyle = () => {
    const manualStyle: ManualStylePayload = { name: name.trim(), accent: accent.trim(), ink: ink.trim(), paper: paper.trim(), headingFont: headingFont.trim(), bodyFont: bodyFont.trim(), fontsConfirmed, selectedAssetUrls, logos: mode === "manual" ? splitLines(logos) : [], licensedFonts: fontsConfirmed ? [...new Set([headingFont.trim(), bodyFont.trim()].filter(Boolean))] : [], references: splitLines(references), negativeRules: splitLines(negativeRules), intentProfile: intent };
    if (mode === "website") {
      void onPost({ action: "lockWebsiteStyle", url: website.trim(), intentProfile: intent, manualStyle }).then((next) => next && onClose());
      return;
    }
    void onPost({ action: "lockManualStyle", manualStyle }).then((next) => next && onClose());
  };
  const useSavedStyle = (entry: StyleLibraryEntry) => { void onPost({ action: "applyStyleLibrary", styleLibraryId: entry.id, intentProfile: defaultIntent ?? entry.intentProfile }).then((next) => next && onClose()); };
  const intentLabel = intent === "board_deck" ? "Board presentation" : intent === "internal_workshop" ? "Team workshop" : "Client pitch";
  const toggleAsset = (url: string) => setSelectedAssetUrls((current) => current.includes(url) ? current.filter((candidate) => candidate !== url) : [...current, url].slice(0, 3));
  const websiteHost = reviewedUrl ? new URL(reviewedUrl).hostname : "website";

  return <SideSheet title="Style" onClose={onClose}><p className="sheet-intro">{analysisSuggestion ? `We found this on ${new URL(analysisSuggestion.referenceUrl).hostname}. Keep what is right.` : "Use one visual system across every format."}</p>
    <p className="style-context">For <strong>{intentLabel}</strong></p>
    {library.length > 0 && <fieldset className="style-options"><legend>Saved styles</legend><ListGroup>{library.map((entry) => <ListRow className="style-choice" key={entry.id}><ListRowAction aria-label={`Use saved style ${entry.name}, version ${entry.revision}`} disabled={busy || style?.libraryId === entry.id} onClick={() => useSavedStyle(entry)}><div className="palette-preview compact" data-domain-ui="palette-preview"><i style={{ background: entry.accent }} /><i style={{ background: entry.ink }} /><i style={{ background: entry.paper }} /></div><span><strong>{entry.name}</strong><small>Company style · Version {entry.revision}</small></span></ListRowAction></ListRow>)}</ListGroup></fieldset>}
    {!showCreator ? <Button variant="secondary" onClick={() => setShowCreator(true)}>Create another style</Button> : <>{(!reviewed || editingDetails) && <fieldset className="style-options"><legend>Start from</legend><ListGroup><ListRow className={`style-choice ${mode === "website" ? "selected" : ""}`}><ListRowAction aria-pressed={mode === "website"} onClick={() => { setMode("website"); setEditingDetails(Boolean(reviewedUrl)); }}><span><strong>Website</strong><small>Pull the public visual foundation</small></span></ListRowAction></ListRow><ListRow className={`style-choice ${mode === "manual" ? "selected" : ""}`}><ListRowAction aria-pressed={mode === "manual"} onClick={() => { setMode("manual"); setEditingDetails(true); }}><span><strong>Set manually</strong><small>Enter exact brand rules yourself</small></span></ListRowAction></ListRow></ListGroup></fieldset>}
    {mode === "website" && (!reviewed || editingDetails) && <Input label="Website" type="url" placeholder="https://example.com" value={website} onChange={(event) => { setWebsite(event.target.value); setReviewedUrl(""); setFindings(null); setAssetCandidates([]); setSelectedAssetUrls([]); setEditingDetails(true); }} />}
    {reviewed && (editingDetails ? <><Input label="Name" value={name} onChange={(event) => setName(event.target.value)} /><div className="style-color-grid"><Input label="Accent" hint="Primary actions and emphasis" value={accent} onChange={(event) => setAccent(event.target.value)} /><Input label="Text" hint="Headlines and body copy" value={ink} onChange={(event) => setInk(event.target.value)} /><Input label="Background" hint="Presentations and work surfaces" value={paper} onChange={(event) => setPaper(event.target.value)} /></div><section className="typography-review" aria-labelledby="typography-heading"><div><strong id="typography-heading">Typography</strong><small>{fontsConfirmed ? "Available for generated work" : mode === "website" ? "Found on the website · usage not verified" : headingFont === "system-ui" && bodyFont === "system-ui" ? "System type is always available" : "Custom type · usage not confirmed"}</small></div><div className="style-type-grid"><Input label="Heading" value={headingFont} onChange={(event) => setHeadingFont(event.target.value)} /><Input label="Body" value={bodyFont} onChange={(event) => setBodyFont(event.target.value)} /></div>{(headingFont !== "system-ui" || bodyFont !== "system-ui") && <label className="font-confirmation"><Checkbox checked={fontsConfirmed} onChange={(event) => setFontsConfirmed(event.target.checked)} /><span>I can use these fonts in generated work</span></label>}</section>{mode === "website" && assetCandidates.length > 0 && <fieldset className="brand-asset-review"><legend>Brand asset</legend><p>Select only an asset you are allowed to use. WorkshopLM validates and saves a local copy when you save this Style.</p><div className="brand-asset-grid">{assetCandidates.map((candidate) => <label className={selectedAssetUrls.includes(candidate.url) ? "brand-asset-candidate selected" : "brand-asset-candidate"} key={candidate.url}><Checkbox aria-label={`Use logo from ${new URL(candidate.url).hostname}`} checked={selectedAssetUrls.includes(candidate.url)} onChange={() => toggleAsset(candidate.url)} /><img alt="Logo candidate" src={`/api/workshop/brand-preview?url=${encodeURIComponent(candidate.url)}`} /><span>Logo</span></label>)}</div></fieldset>}{findings && <p className="style-findings" role="status">Found {findingSummary}. Review it before using this Style.</p>}{showDetails ? <div className="style-details">{mode === "manual" && <TextArea label="Local logo or brand asset" hint="One local path per line" value={logos} onChange={(event) => setLogos(event.target.value)} />}<TextArea label="Visual references" hint="One rule or reference per line" value={references} onChange={(event) => setReferences(event.target.value)} /><TextArea label="Avoid" hint="One negative rule per line" value={negativeRules} onChange={(event) => setNegativeRules(event.target.value)} /></div> : <Button variant="secondary" size="small" onClick={() => setShowDetails(true)}>{style ? "Edit brand details" : mode === "website" ? "Review brand details" : "Add brand details"}</Button>}</> : <Card className="style-review-card"><div className="style-review-heading"><div><small>From {websiteHost}</small><h2>{name}</h2><p>Ready for {intentLabel.toLowerCase()}</p></div><Status>Ready to use</Status></div><div className="style-preview"><div className="palette-preview" data-domain-ui="palette-preview"><i title={`Accent ${accent}`} style={{ background: accent }} /><i title={`Text ${ink}`} style={{ background: ink }} /><i title={`Background ${paper}`} style={{ background: paper }} /></div><div className="type-preview" data-domain-ui="type-preview"><strong>Aa</strong><span>{headingFont === "system-ui" ? "System type" : `${headingFont} found`} · {fontsConfirmed ? "confirmed" : headingFont === "system-ui" ? "available" : "system fallback until confirmed"}</span></div></div><div className="style-review-facts"><span><small>Website review</small><strong>{findings ? findingSummary : "Visual foundation found"}</strong></span><span><small>Brand assets</small><strong>{assetCandidates.length ? `${assetCandidates.length} available` : "None required"}</strong></span></div></Card>)}
    {reviewed && editingDetails && <div className="style-preview"><div className="palette-preview" data-domain-ui="palette-preview"><i title={`Accent ${accent}`} style={{ background: accent }} /><i title={`Text ${ink}`} style={{ background: ink }} /><i title={`Background ${paper}`} style={{ background: paper }} /></div><div className="type-preview" data-domain-ui="type-preview"><strong>Aa</strong><span>{fontsConfirmed || headingFont === "system-ui" ? headingFont : "System fallback"} · {fontsConfirmed ? "confirmed" : headingFont === "system-ui" ? "available" : "candidate not used until confirmed"}</span></div></div>}{mode === "website" && !reviewed ? <Button disabled={busy || !website.trim()} onClick={reviewWebsite}>Review style</Button> : reviewed && !editingDetails ? <div className="button-row"><Button variant="secondary" onClick={() => setEditingDetails(true)}>Edit details</Button>{(!locked || dirty) && <Button disabled={busy || !name.trim() || !accent.trim() || !ink.trim() || !paper.trim() || !headingFont.trim() || !bodyFont.trim()} onClick={saveStyle}>Use this style</Button>}</div> : (!locked || dirty) && <Button disabled={busy || !name.trim() || !accent.trim() || !ink.trim() || !paper.trim() || !headingFont.trim() || !bodyFont.trim()} onClick={saveStyle}>{locked ? "Save new version" : "Use this style"}</Button>}</>}
  </SideSheet>;
}

function OutputsView({ state, creationProgress, onOpenOutput, onOpenStoryboard, onDismissOrientation }: { state: PersistedWorkshop | null; creationProgress: { label: string; completed: number; total: number } | null; onOpenOutput: (id: string) => void; onOpenStoryboard: () => void; onDismissOrientation: () => void }) {
  const allOutputs = [...(state?.outputs ?? [])].sort((left, right) => left.type === right.type
    ? right.createdAt.localeCompare(left.createdAt)
    : left.type === "deck" ? -1 : 1);
  const outputs = allOutputs.filter((output, index) => allOutputs.findIndex((candidate) => candidate.type === output.type) === index);
  const videos = [...(state?.videos ?? [])].sort((left, right) => right.version - left.version).slice(0, 1);
  const audioOverviews = [...(state?.audioOverviews ?? [])].sort((left, right) => right.version - left.version).slice(0, 1);
  const generatedImages = state?.imageBatch?.panels.filter((panel) => panel.state === "generated").length ?? 0;
  const failedImages = state?.imageBatch?.panels.filter((panel) => panel.state === "failed").length ?? 0;
  const ready = Boolean(state?.briefApproved && state.style && !state.style.stale);
  const outputStatus = outputSetStatus(state);
  const partial = outputStatus.incomplete;
  const needsUpdate = outputStatus.stale;
  const heroDeckId = outputs.find((output) => output.type === "deck")?.id;
  return <article className="outputs-view">
    <header className="object-page-header"><div><h1>Created work</h1><p>One Workshop, expressed in every format.</p></div><span>{[outputs.length, audioOverviews.length, state?.sketch ? 1 : 0, state?.imageBatch ? 1 : 0, state?.storyboard.panels.length ? 1 : 0, videos.length].reduce((sum, count) => sum + count, 0)} current</span></header>
    {!ready ? <StateMessage state="empty" title="Choose a Style">Your Brief is ready. Add a Style to create professional work.</StateMessage> : <>
      {creationProgress && <Card className="creation-progress" role="status" aria-live="polite"><div><strong>Creating your work</strong><p>{creationProgress.label}</p></div><span>{Math.min(creationProgress.completed + 1, creationProgress.total)} of {creationProgress.total}</span></Card>}
      {!creationProgress && !state?.onboarding.outputsOrientationDismissed && heroDeckId && <Card className="outputs-orientation"><div><strong>Your created work is ready.</strong><p>Every format shares this Workshop's Sources and Style. Open any item to review or refine it.</p></div><div className="button-row"><Button variant="secondary" size="small" onClick={onDismissOrientation}>Got it</Button></div></Card>}
      {!creationProgress && (state?.outputs.length ?? 0) === 0 && !state?.sketch && !state?.imageBatch && !state?.audioOverviews.length && <StateMessage state="empty" title="Create your first work">Turn this Brief into a Presentation, hand-drawn Sketch, Infographic, Audio Overview, Graphics, and Storyboard.</StateMessage>}
      {!creationProgress && partial && !needsUpdate && <StateMessage state="partial" title="Some work is ready">Review what is ready, then update the rest of the set.</StateMessage>}
      {!creationProgress && needsUpdate && <StateMessage state="needs-update" title="Created work needs an update">Your Sources, Brief, or Style changed. Update the work before sharing it.</StateMessage>}
      <section className="output-grid">{outputs.map((output) => {
        const versions = allOutputs.filter((item) => item.type === output.type).length;
        const version = outputVersion(output, state?.outputs ?? []);
        const sources = outputSourceCount(output, state);
        const sourceLinks = claimsForArtifact(output.claimIds ?? [], state?.claims ?? []).length;
        const name = `${outputTitle(output.type)}${versions > 1 ? `, version ${version}` : ""}`;
        const isHero = output.id === heroDeckId;
        return <EntityCardAction className={`output-card output-card--${output.type === "deck" ? "presentation" : output.type} ${isHero ? "output-card--hero" : ""} ${output.stale ? "needs-update" : ""}`} data-output-role={isHero ? "hero" : "supporting"} key={output.id} aria-label={`Open ${name}`} onClick={() => onOpenOutput(output.id)}><div className="artifact-preview" data-domain-ui="artifact-preview"><iframe aria-hidden="true" tabIndex={-1} scrolling="no" title={`${name} preview`} sandbox="allow-same-origin" src={`/api/workshop/artifacts/${output.id}`} /></div><div className="output-card-body"><h2>{outputTitle(output.type)}</h2><div className="output-meta"><span>{sources} {sources === 1 ? "source" : "sources"}</span>{sourceLinks > 0 && <span>{sourceLinks} source {sourceLinks === 1 ? "link" : "links"}</span>}<Status tone={output.stale ? "waiting" : "current"}>{output.stale ? "Needs update" : "Up to date"}</Status></div></div></EntityCardAction>;
      })}
      {audioOverviews.map((overview) => <EntityCardAction className={`output-card output-card--audio ${overview.stale ? "needs-update" : ""}`} key={overview.id} aria-label={`Open Audio Overview, version ${overview.version}`} onClick={() => onOpenOutput(overview.id)}><div className="artifact-preview audio-overview-preview" data-domain-ui="artifact-preview"><div className="audio-wave" aria-hidden="true">{[26, 54, 38, 72, 44, 64, 32, 58, 40, 68, 30, 50].map((height, index) => <i key={index} style={{ height: `${height}%` }} />)}</div><span>{overview.audio ? `${Math.round(overview.audio.durationSeconds)} sec` : `${overview.script.split(/\s+/).filter(Boolean).length} words`}</span></div><div className="output-card-body"><h2>Audio Overview</h2><div className="output-meta"><span>{overview.claimIds.length} sourced points</span><Status tone={!overview.stale && overview.status !== "failed" ? "current" : "waiting"}>{overview.stale ? "Needs update" : overview.status === "failed" ? "Couldn't create" : overview.status === "audio_ready" ? "Up to date" : "Ready for review"}</Status></div></div></EntityCardAction>)}
      {state?.sketch?.relativePath && <EntityCardAction className={`output-card output-card--sketch ${state.sketch.stale ? "needs-update" : ""}`} aria-label={`Open Sketch, version ${state.sketch.version}`} onClick={() => onOpenOutput("sketch")}><div className="artifact-preview sketch-preview" data-domain-ui="artifact-preview"><img alt="" src="/api/workshop/artifacts/sketch" /></div><div className="output-card-body"><h2>Sketch</h2><div className="output-meta"><span>{state.sketch.nodes.length} ideas</span><Status tone={state.sketch.stale ? "waiting" : "current"}>{state.sketch.stale ? "Needs update" : "Up to date"}</Status><span>{state.activeSourceIds.length} {state.activeSourceIds.length === 1 ? "source" : "sources"}</span></div></div></EntityCardAction>}
      {state?.imageBatch && <EntityCardAction className={`output-card output-card--images ${state.imageBatch.stale ? "needs-update" : ""}`} aria-label="Open Image set" onClick={() => onOpenOutput("images")}><div className="artifact-preview image-contact-sheet" data-domain-ui="artifact-preview">{state.imageBatch.panels.map((panel, index) => <div className={`image-tile ${panel.state === "generated" ? "generated" : ""}`} data-domain-ui="image-tile" key={panel.id} style={{ "--tile": index } as CSSProperties}>{panel.state === "generated" && <img alt="" src={`/api/workshop/artifacts/${panel.id}`} />}<span>{String(index + 1).padStart(2, "0")}</span></div>)}</div><div className="output-card-body"><h2>Image set</h2><div className="output-meta"><span>{state.imageBatch.panels.length} images</span><Status tone={state.imageBatch.stale || failedImages ? "waiting" : generatedImages === state.imageBatch.panels.length ? "current" : "waiting"}>{state.imageBatch.stale ? "Needs update" : failedImages ? "Incomplete" : generatedImages === state.imageBatch.panels.length ? "Up to date" : "Planned"}</Status><span>{state?.activeSourceIds.length ?? 0} {(state?.activeSourceIds.length ?? 0) === 1 ? "source" : "sources"}</span></div></div></EntityCardAction>}
      {(state?.storyboard.panels.length ?? 0) > 0 && <EntityCardAction className={`output-card output-card--storyboard ${state?.storyboard.stale ? "needs-update" : ""}`} aria-label="Open Storyboard" onClick={onOpenStoryboard}><div className="artifact-preview storyboard-card-preview" data-domain-ui="artifact-preview">{state?.storyboard.panels.slice(0, 6).map((panel, index) => { const image = boundImage(panel, state?.imageBatch); return <div className={`storyboard-card-frame ${image ? "has-image" : ""}`} key={panel.id} style={{ "--panel": index } as CSSProperties}>{image && <img alt="" src={`/api/workshop/artifacts/${image.id}`} />}<span>{String(index + 1).padStart(2, "0")}</span><strong>{panel.title}</strong></div>; })}</div><div className="output-card-body"><h2>Storyboard</h2><div className="output-meta"><span>{state?.storyboard.panels.length ?? 0} panels</span><Status tone={state?.storyboard.stale ? "waiting" : "current"}>{state?.storyboard.stale ? "Needs update" : state?.storyboardApproved ? "Approved" : "Ready for review"}</Status><span>{state?.activeSourceIds.length ?? 0} {(state?.activeSourceIds.length ?? 0) === 1 ? "source" : "sources"}</span></div></div></EntityCardAction>}
      {videos.map((video) => <EntityCardAction className={`output-card output-card--video ${video.stale ? "needs-update" : ""}`} key={video.id} aria-label={`Open Demo video, version ${video.version}`} onClick={() => onOpenOutput(video.id)}><div className="artifact-preview" data-domain-ui="artifact-preview"><video muted src={`/api/workshop/artifacts/${video.id}`} /></div><div className="output-card-body"><h2>Demo video</h2><div className="output-meta"><span>{state?.storyboard.panels.length ?? 0} scenes</span><Status tone={video.stale ? "waiting" : "current"}>{video.stale ? "Needs update" : "Up to date"}</Status><span>{state?.activeSourceIds.length ?? 0} {(state?.activeSourceIds.length ?? 0) === 1 ? "source" : "sources"}</span></div></div></EntityCardAction>)}</section>
    </>}
  </article>;
}

function imagePanelCopy(prompt: string, index: number) {
  const role = prompt.match(/(?:Visual|Output) role:\s*([^.]+)\./)?.[1]?.trim() ?? `Image ${index + 1}`;
  const idea = prompt.match(/Approved idea to communicate:\s*(.+?)\.\s+Preserve/)?.[1]?.trim() ?? "Grounded in the approved Brief.";
  return { role, idea };
}

function AudioOverviewView({ overview, history, busy, onPost, onOpenOutput, onShowSource }: { overview: PersistedWorkshop["audioOverviews"][number]; history: PersistedWorkshop["audioOverviews"]; busy: boolean; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null>; onOpenOutput: (id: string) => void; onShowSource: (target?: EvidenceTarget) => void }) {
  const [sections, setSections] = useState(() => Object.fromEntries(overview.sections.map((section) => [section.id, section.text])));
  const [editing, setEditing] = useState(false);
  useEffect(() => { setSections(Object.fromEntries(overview.sections.map((section) => [section.id, section.text]))); setEditing(false); }, [overview]);
  const dirty = overview.sections.some((section) => sections[section.id]?.trim() !== section.text);
  const words = overview.script.split(/\s+/).filter(Boolean).length;
  const duration = overview.audio ? `${Math.floor(overview.audio.durationSeconds / 60)}:${String(Math.round(overview.audio.durationSeconds % 60)).padStart(2, "0")}` : undefined;
  const save = async () => {
    const next = await onPost({ action: "updateAudioOverview", audioOverviewId: overview.id, audioSections: overview.sections.map((section) => ({ id: section.id, text: sections[section.id]?.trim() ?? "" })) });
    const current = next?.audioOverviews.at(-1); if (current) onOpenOutput(current.id);
  };
  const cancelEditing = () => { setSections(Object.fromEntries(overview.sections.map((section) => [section.id, section.text]))); setEditing(false); };
  return <article className="focused-output audio-overview-view"><div className="focused-output-heading"><div className="focused-output-context"><h1>Audio Overview</h1><p>Version {overview.version} · {overview.sections.length} chapters · {overview.claimIds.length} sourced points</p><Status tone={overview.stale || overview.status === "failed" ? "waiting" : "current"}>{overview.stale ? "Needs update" : overview.status === "failed" ? "Couldn't create" : overview.status === "audio_ready" ? "Audio ready" : "Ready for review"}</Status></div><div className="button-row">{editing ? <><Button variant="secondary" size="small" disabled={busy} onClick={cancelEditing}>Cancel</Button><Button size="small" disabled={busy || !dirty || overview.sections.some((section) => !sections[section.id]?.trim())} onClick={() => { void save(); }}>Save script</Button></> : <Button variant="secondary" size="small" onClick={() => setEditing(true)}>Edit script</Button>}{!overview.stale && overview.status !== "audio_ready" && <Button variant="secondary" size="small" disabled={busy || dirty} onClick={() => { void onPost({ action: "generateAudioOverviewAudio" }); }}>{overview.status === "failed" ? "Try audio again" : "Create audio"}</Button>}{overview.audio && <ButtonLink variant="secondary" size="small" href={`/api/workshop/artifacts/${overview.id}`}>Download audio</ButtonLink>}</div></div>
    {overview.audio ? <Card className="audio-player"><div className="audio-player-title"><small>READY TO LISTEN</small><strong>{overview.title}</strong><span>{duration} · {words} words</span></div><audio controls src={`/api/workshop/artifacts/${overview.id}`} /><div className="audio-player-voice"><strong>Cedar</strong><small>{overview.disclosure}</small></div></Card> : <StateMessage state={overview.status === "failed" ? "error" : "empty"} title={overview.status === "failed" ? "Audio needs another try" : "Review the script first"}>{overview.error ?? "Check the three chapters and their sources, then create the voiced briefing."}</StateMessage>}
    <section className={`audio-script ${editing ? "is-editing" : ""}`} aria-label="Audio Overview script"><div className="audio-script-intro"><div><h2>{editing ? "Edit script" : "Chapters"}</h2><p>{editing ? "Refine the narration without losing its source trail." : "A concise briefing shaped from the approved Brief."}</p></div><span>{overview.sections.length} chapters</span></div>{overview.sections.map((section, index) => { const evidence = section.evidence[0]; return <div className="audio-script-section" key={section.id}><div className="audio-chapter-number">{String(index + 1).padStart(2, "0")}</div><div className="audio-chapter-copy"><div className="audio-script-heading"><div><h3>{section.title}</h3>{section.edited && <Status tone="waiting">Edited</Status>}</div><Button variant="secondary" size="small" onClick={() => onShowSource({ sourceId: evidence?.sourceId, claimId: evidence?.claimId, locator: evidence?.locator })}>Show source</Button></div>{editing ? <TextArea label={`${section.title} script`} value={sections[section.id] ?? ""} maxLength={1800} onChange={(event) => setSections((current) => ({ ...current, [section.id]: event.target.value }))} /> : <p>{section.text}</p>}</div></div>; })}</section>
    <p className="audio-disclosure">Voiced with Cedar · {overview.disclosure} · Every chapter remains connected to its source.</p>
    {history.length > 1 && <section className="artifact-source-trail output-version-history" aria-labelledby="audio-version-history-heading"><div><h2 id="audio-version-history-heading">Version history</h2><p>Open an earlier script or recording without replacing the current one.</p></div><ListGroup>{history.sort((left, right) => right.version - left.version).map((item) => <ListRowAction key={item.id} aria-label={`Open Audio Overview, version ${item.version}`} onClick={() => onOpenOutput(item.id)}><span><strong>Version {item.version}</strong><small>{item.id === overview.id ? "Current view" : item.stale ? "Needs update" : item.status === "audio_ready" ? "Audio ready" : "Script ready"}</small></span></ListRowAction>)}</ListGroup></section>}
  </article>;
}

function FocusedOutputView({ state, outputId, busy, onPost, onOpenOutput, onShowSource, onShowOriginal, onEditStoryboard, onRequestReplacement }: { state: PersistedWorkshop | null; outputId: string; busy: boolean; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null>; onOpenOutput: (id: string) => void; onShowSource: (target?: EvidenceTarget) => void; onShowOriginal: () => void; onEditStoryboard: () => void; onRequestReplacement: (panelId: string) => void }) {
  const sketchViewRef = useRef<HTMLElement | null>(null);
  const output = state?.outputs.find((item) => item.id === outputId);
  const audioOverview = state?.audioOverviews.find((item) => item.id === outputId);
  const isVideo = outputId === "video" || outputId.startsWith("video-v");
  const video = isVideo ? (outputId === "video" ? state?.videos?.find((item) => !item.stale) : state?.videos?.find((item) => item.id === outputId)) : undefined;
  const isImages = outputId === "images";
  const isSketch = outputId === "sketch" || outputId.startsWith("sketch-v");
  const sketch = isSketch ? (outputId === "sketch" ? state?.sketch : [state?.sketch, ...(state?.sketchHistory ?? [])].find((candidate) => candidate && outputId === `sketch-v${candidate.version}`)) : undefined;
  useEffect(() => { if (isSketch) sketchViewRef.current?.scrollTo({ top: 0 }); }, [isSketch, outputId]);
  const title = output ? outputTitle(output.type) : audioOverview ? "Audio Overview" : isSketch ? "Sketch" : isImages ? "Image set" : "Demo video";
  const sketchSourceCount = sketch ? new Set(sketch.claimIds.map((id) => state?.claims?.find((claim) => claim.id === id)?.sourceId).filter(Boolean)).size : 0;
  const sourceCount = output ? outputSourceCount(output, state) : sketch ? sketchSourceCount : state?.activeSourceIds.length ?? 0;
  const artifactClaims = claimsForArtifact(output?.claimIds ?? sketch?.claimIds ?? video?.claimIds ?? [], state?.claims ?? []);
  const sourceLinkDetail = artifactClaims.length > 0 ? ` · ${artifactClaims.length} source ${artifactClaims.length === 1 ? "link" : "links"}` : "";
  const detail = output
    ? `${outputType(output.type)} · Version ${outputVersion(output, state?.outputs ?? [])} · ${sourceCount} ${sourceCount === 1 ? "source" : "sources"}${sourceLinkDetail}`
    : sketch ? `Hand-drawn view · Version ${sketch.version} · ${sourceCount} ${sourceCount === 1 ? "source" : "sources"}${sourceLinkDetail}`
    : isImages ? `${state?.imageBatch?.panels.length ?? 0} images · ${sourceCount} ${sourceCount === 1 ? "source" : "sources"}` : `Video · Version ${video?.version ?? 1} · ${sourceCount} ${sourceCount === 1 ? "source" : "sources"}${sourceLinkDetail}`;
  const href = `/api/workshop/artifacts/${outputId}`;
  const versionHistory = output
    ? (state?.outputs.filter((item) => item.type === output.type).sort((left, right) => right.createdAt.localeCompare(left.createdAt)) ?? [])
    : video ? ([...(state?.videos ?? [])].sort((left, right) => right.version - left.version)) : [];
  if (audioOverview) return <AudioOverviewView overview={audioOverview} history={[...(state?.audioOverviews ?? [])]} busy={busy} onPost={onPost} onOpenOutput={onOpenOutput} onShowSource={onShowSource} />;
  if (!output && (!isVideo || !video) && !isImages && (!isSketch || !sketch?.relativePath)) return <div className="state-surface"><StateMessage state="error" title="Couldn't open this work">Return to Created work and try opening it again.</StateMessage></div>;
  if (isImages) return <article className="focused-output"><div className="focused-output-heading"><div className="focused-output-context"><h1>{title}</h1><p>{detail} · One shared Style</p>{state?.imageBatch?.stale && <Status tone="waiting">Needs update</Status>}</div></div><div className="focused-image-grid" data-domain-ui="image-review-grid">{state?.imageBatch?.panels.map((panel, index) => {
    const { role, idea } = imagePanelCopy(panel.prompt, index);
    const status = panel.state === "generated" ? "Ready" : panel.state === "failed" ? "Couldn't create" : panel.state === "selected_for_regeneration" ? "Replacement requested" : "Planned";
    const hasPreview = Boolean(panel.relativePath);
    const preview = <div className={`focused-image-preview ${panel.state}`} data-domain-ui="image-tile">{hasPreview ? <img alt={`${role}: ${idea}`} src={`/api/workshop/artifacts/${panel.id}`} /> : <span>{String(index + 1).padStart(2, "0")}</span>}</div>;
    const evidence = panel.evidence[0];
    return <section className="focused-image-card" key={panel.id} aria-label={role}>{hasPreview ? <a href={`/api/workshop/artifacts/${panel.id}`} target="_blank" rel="noreferrer" aria-label={`Open ${role}`}>{preview}</a> : preview}<div className="focused-image-caption"><strong>{role}</strong><Status tone={panel.state === "generated" ? "current" : "waiting"}>{status}</Status></div><p>{panel.revisionRequest && panel.state === "selected_for_regeneration" ? `Change requested: ${panel.revisionRequest}` : idea}</p><div className="focused-image-actions"><Button variant="secondary" size="small" onClick={() => onShowSource({ sourceId: evidence?.sourceId, claimId: evidence?.claimId, locator: evidence?.locator })}>Show source</Button>{panel.state !== "planned" && <Button variant="secondary" size="small" disabled={busy || panel.state === "selected_for_regeneration"} onClick={() => { onRequestReplacement(panel.id); }}>{panel.state === "selected_for_regeneration" ? "Requested" : "Request replacement"}</Button>}</div></section>;
  })}</div></article>;
  if (isSketch && sketch) {
    const sketchHref = `/api/workshop/artifacts/${outputId}`;
    const sketchHistory = [state?.sketch, ...(state?.sketchHistory ?? [])].filter((item): item is NonNullable<typeof item> => Boolean(item)).sort((left, right) => right.version - left.version);
    const currentSketch = sketch.version === state?.sketch?.version;
    return <article ref={sketchViewRef} className="focused-output"><div className="focused-output-heading"><div className="focused-output-context"><h1>Sketch</h1><p>{detail} · From the approved Map</p>{sketch.stale && <Status tone="waiting">Needs update</Status>}</div><div className="button-row">{currentSketch && sketch.stale && <Button size="small" disabled={busy} onClick={() => { void onPost({ action: "createSketch" }); }}>Update sketch</Button>}<ButtonLink variant={currentSketch && !sketch.stale ? "primary" : "secondary"} size="small" href={`${sketchHref}?format=editable`}>Download SVG</ButtonLink>{artifactClaims.length > 0 && <Button variant="secondary" size="small" onClick={() => document.getElementById("sketch-source-trail")?.scrollIntoView({ behavior: "smooth", block: "start" })}>View source links</Button>}<ButtonLink variant="secondary" size="small" href={sketchHref} target="_blank" rel="noreferrer">Open full size</ButtonLink></div></div><div className="focused-output-preview sketch-focused-preview" data-domain-ui="artifact-preview"><img alt={`${state?.title ?? "Workshop"} hand-drawn Sketch`} src={sketchHref} /></div>{artifactClaims.length > 0 && <section id="sketch-source-trail" className="artifact-source-trail" aria-labelledby="sketch-source-heading"><div><h2 id="sketch-source-heading">Sources in this Sketch</h2><p>Select an idea to see the exact source text.</p></div><ListGroup>{artifactClaims.map((claim) => <ListRowAction key={claim.id} aria-label={`Show source for ${claim.text}`} onClick={() => onShowSource({ sourceId: claim.sourceId, claimId: claim.id, locator: claim.locator })}><span><strong>{claim.text}</strong><small>{claimDisplayLocator(claim, state)}</small></span></ListRowAction>)}</ListGroup></section>}{sketchHistory.length > 1 && <section className="artifact-source-trail output-version-history" aria-labelledby="sketch-version-history-heading"><div><h2 id="sketch-version-history-heading">Version history</h2><p>Open an earlier Sketch without replacing the current one.</p></div><ListGroup>{sketchHistory.map((item) => <ListRowAction key={item.version} aria-label={`Open Sketch, version ${item.version}`} onClick={() => onOpenOutput(item.version === state?.sketch?.version ? "sketch" : `sketch-v${item.version}`)}><span><strong>Version {item.version}</strong><small>{item.version === sketch.version ? "Current view" : item.stale ? "Needs update" : "Up to date"}</small></span></ListRowAction>)}</ListGroup></section>}</article>;
  }
  return <article className="focused-output"><div className="focused-output-heading"><div className="focused-output-context"><h1>{title}</h1><p>{detail}</p>{(output?.stale || video?.stale) && <Status tone="waiting">Needs update</Status>}</div><div className="button-row">{isVideo && <Button size="small" onClick={onEditStoryboard}>Edit storyboard</Button>}{output?.editableRelativePath && <ButtonLink size="small" href={`${href}?format=editable`}>Download PowerPoint</ButtonLink>}{output && artifactClaims.length > 0 && <Button variant="secondary" size="small" onClick={() => document.getElementById("artifact-source-trail")?.scrollIntoView({ behavior: "smooth", block: "start" })}>View source links</Button>}{isVideo && <Button variant="secondary" size="small" onPointerDown={(event) => event.preventDefault()} onClick={(event) => { const surface = event.currentTarget.closest<HTMLElement>(".focused-output"); if (surface) surface.scrollTop = 0; event.currentTarget.focus({ preventScroll: true }); onShowOriginal(); }}>Show original</Button>}<ButtonLink variant="secondary" size="small" href={href} target="_blank" rel="noreferrer">{isVideo ? "Open video" : "Open preview"}</ButtonLink></div></div><div className={`focused-output-preview ${isVideo ? "video-preview" : ""}`} data-domain-ui="artifact-preview">{isVideo ? <video controls src={href} /> : <iframe title={title} sandbox="allow-same-origin" src={href} />}</div>{artifactClaims.length > 0 && <section id="artifact-source-trail" className="artifact-source-trail" aria-labelledby="artifact-source-heading"><div><h2 id="artifact-source-heading">Sources in this work</h2><p>Select a claim to see the exact source text.</p></div><ListGroup>{artifactClaims.map((claim) => <ListRowAction key={claim.id} aria-label={`Show source for ${claim.text}`} onClick={() => onShowSource({ sourceId: claim.sourceId, claimId: claim.id, locator: claim.locator })}><span><strong>{claim.text}</strong><small>{claimDisplayLocator(claim, state)}</small></span></ListRowAction>)}</ListGroup></section>}{versionHistory.length > 1 && <section className="artifact-source-trail output-version-history" aria-labelledby="output-version-history-heading"><div><h2 id="output-version-history-heading">Version history</h2><p>Open earlier work without replacing the current version.</p></div><ListGroup>{versionHistory.map((item) => { const version = "type" in item ? outputVersion(item, state?.outputs ?? []) : item.version; return <ListRowAction key={item.id} aria-label={`Open ${title}, version ${version}`} onClick={() => onOpenOutput(item.id)}><span><strong>Version {version}</strong><small>{item.id === outputId ? "Current view" : item.stale ? "Needs update" : "Up to date"}</small></span></ListRowAction>; })}</ListGroup></section>}</article>;
}

function ImageReplacementSheet({ panel, busy, onClose, onSubmit }: { panel?: ImageBatchPanel; busy: boolean; onClose: () => void; onSubmit: (panelId: string, revisionRequest: string) => Promise<boolean> }) {
  const [revisionRequest, setRevisionRequest] = useState("");
  const [previewVersion, setPreviewVersion] = useState(panel?.version ?? 0);
  useEffect(() => { setPreviewVersion(panel?.version ?? 0); }, [panel?.id, panel?.version]);
  if (!panel) return <SideSheet title="Replace image" onClose={onClose}><StateMessage state="error" title="Couldn't open image">Close this sheet and choose the image again.</StateMessage></SideSheet>;
  const { role, idea } = imagePanelCopy(panel.basePrompt ?? panel.prompt, Math.max(0, Number(panel.id.match(/\d+$/)?.[0] ?? 1) - 1));
  const history = [...(panel.history ?? [])].sort((left, right) => right.version - left.version);
  const selectedVersion = previewVersion === panel.version ? { version: panel.version, current: true } : history.find((item) => item.version === previewVersion);
  const previewHref = selectedVersion && "current" in selectedVersion ? `/api/workshop/artifacts/${panel.id}` : `/api/workshop/artifacts/${panel.id}-v${selectedVersion?.version ?? panel.version}`;
  return <SideSheet title="Replace image" onClose={onClose}>
    <p className="sheet-intro">Keep the approved idea and Style. Describe only what should change in this image.</p>
    <Card className="replacement-image-preview"><img alt={`${role}: ${idea}`} src={previewHref} /><div><strong>{role}</strong><small>Version {selectedVersion?.version ?? panel.version}{selectedVersion && "current" in selectedVersion ? " · Latest" : " · Earlier"}</small><small>{idea}</small><ButtonLink variant="secondary" size="small" href={previewHref} target="_blank" rel="noreferrer">Open full size</ButtonLink></div></Card>
    {history.length > 0 && <section className="replacement-version-history" aria-labelledby="image-version-history-heading"><div><h3 id="image-version-history-heading">Version history</h3><p>Earlier images stay available without replacing the latest one.</p></div><ListGroup><ListRow><ListRowAction aria-current={previewVersion === panel.version ? "true" : undefined} onClick={() => setPreviewVersion(panel.version)}><span><strong>Version {panel.version}</strong><small>Latest</small></span></ListRowAction></ListRow>{history.map((item) => <ListRow key={item.version}><ListRowAction aria-current={previewVersion === item.version ? "true" : undefined} onClick={() => setPreviewVersion(item.version)}><span><strong>Version {item.version}</strong><small>Earlier</small></span></ListRowAction></ListRow>)}</ListGroup></section>}
    <TextArea label="What should change?" hint={`${revisionRequest.length}/400`} maxLength={400} placeholder="Make the layout simpler and leave more space for a headline." value={revisionRequest} onChange={(event) => setRevisionRequest(event.target.value)} />
    <Button disabled={busy || !revisionRequest.trim()} onClick={() => { void onSubmit(panel.id, revisionRequest.trim()); }}>Create replacement</Button>
  </SideSheet>;
}

function OriginalRevealSheet({ state, onClose }: { state: PersistedWorkshop | null; onClose: () => void }) {
  const segment = state?.transcriptSegments?.[0];
  const source = state?.sourceItems.find((item) => /brainstorm|transcript/i.test(item.title)) ?? state?.sourceItems[0];
  const original = segment?.text ?? source?.excerpt ?? "No brainstorm transcript is attached to this Workshop yet.";
  const sourceKind = segment || (source && (isVoiceSource(source) || source.origin === "Founder-provided recording")) ? "Voice transcript" : "Source excerpt";
  const sourceLocator = segment
    ? new Date(segment.capturedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })
    : source?.locator ? claimDisplayLocator({ sourceId: source.id, locator: source.locator }, { sourceItems: state?.sourceItems ?? [] }) : undefined;
  const elapsedSeconds = state?.firstTranscriptAt && state.firstRenderedOutputAt
    ? Math.max(0, Math.round((Date.parse(state.firstRenderedOutputAt) - Date.parse(state.firstTranscriptAt)) / 1000))
    : null;
  const currentVideo = [...(state?.videos ?? [])].reverse().find((video) => !video.stale);
  const createdWork = [
    { title: "Presentation", detail: `${state?.outputs.filter((output) => output.type === "deck").length ?? 0} version${state?.outputs.filter((output) => output.type === "deck").length === 1 ? "" : "s"}` },
    { title: "Sketch", detail: state?.sketch ? `Version ${state.sketch.version} · ${state.sketch.nodes.length} ideas` : "Not created yet" },
    { title: "Infographic", detail: `${state?.outputs.filter((output) => output.type === "infographic").length ?? 0} version${state?.outputs.filter((output) => output.type === "infographic").length === 1 ? "" : "s"}` },
    { title: "Audio Overview", detail: state?.audioOverviews.at(-1)?.audio ? `Version ${state.audioOverviews.at(-1)!.version} ready` : state?.audioOverviews.length ? "Script ready" : "Not created yet" },
    { title: "Image set", detail: `${state?.imageBatch?.panels.length ?? 0} ${state?.imageBatch?.panels.every((panel) => panel.state === "generated") ? "ready" : "planned"} images` },
    { title: "Storyboard", detail: `${state?.storyboard.panels.length ?? 0} editable panels` },
    { title: "Demo video", detail: currentVideo ? `Version ${currentVideo.version} ready` : state?.videos?.length ? `${state.videos.length} saved · Needs update` : "Not created yet" },
  ];

  return <SideSheet title="Original brainstorm" className="original-reveal" onClose={onClose}>
    <p className="sheet-intro">The created work started with this.</p>
    <Card className="original-transcript"><small>Before · {sourceKind}</small><blockquote>“{original}”</blockquote>{sourceLocator && <p className="source-locator">{sourceLocator}</p>}</Card>
    <div className="original-result"><small>After</small><h3>Became professional knowledge work</h3>{elapsedSeconds !== null && <p>{elapsedSeconds} seconds from first transcript to first created work</p>}{currentVideo?.buildTrace && <ButtonLink href={`/api/workshop/artifacts/build-trace-v${currentVideo.version}`} target="_blank" rel="noreferrer">How this was built</ButtonLink>}</div>
    <ListGroup>{createdWork.map((item) => <ListRow className="original-output-row" key={item.title}><FileIcon /><span><strong>{item.title}</strong><small>{item.detail}</small></span></ListRow>)}</ListGroup>
  </SideSheet>;
}

function ConversationView({ state, busy, streamingReply, realtimeContinuation, onRealtimeContinuationSent, onSend, onVoiceSave, onVoiceToolEvent, onConfirmTool, onShowSource }: { state: PersistedWorkshop | null; busy: boolean; streamingReply: string; realtimeContinuation?: Record<string, unknown>; onRealtimeContinuationSent: () => void; onSend: (text: string) => Promise<boolean>; onVoiceSave: (text: string, capture: { transport: "webrtc"; model: "gpt-realtime-2.1"; transcriptionModel: "gpt-realtime-whisper"; itemIds: string[]; eventIds: string[]; assistant?: { text: string; responseId: string; eventIds: string[] }; interruptions?: { responseIds: string[]; eventIds: string[] } }) => Promise<boolean>; onVoiceToolEvent: (event: unknown) => Promise<{ output: Record<string, unknown>; createResponse: boolean } | undefined>; onConfirmTool: (call: ConversationToolCall) => Promise<boolean>; onShowSource: (target?: EvidenceTarget) => void }) {
  const [draft, setDraft] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const turns = state?.conversationTurns ?? [];
  const toolCalls = state?.toolCalls ?? [];
  const confirmedProviderCalls = new Set(toolCalls.filter((call) => call.explicitUserIntent && call.provider?.callId).map((call) => `${call.channel}:${call.provider!.callId}`));
  const visibleToolCalls = toolCalls.filter((call) => {
    if (call.provider?.callId && !call.explicitUserIntent && call.result.summary.includes("requires explicit user intent") && confirmedProviderCalls.has(`${call.channel}:${call.provider.callId}`)) return false;
    if (call.result.isError && call.effect === "none" && toolCalls.some((later) => later.channel === call.channel && later.name === call.name && !later.result.isError && Date.parse(later.completedAt) > Date.parse(call.completedAt))) return false;
    return true;
  });
  const timeline = [
    ...turns.map((turn) => ({ kind: "turn" as const, at: turn.createdAt, value: turn })),
    ...visibleToolCalls.map((call) => ({ kind: "tool" as const, at: call.completedAt, value: call })),
  ].sort((left, right) => Date.parse(left.at) - Date.parse(right.at));
  useEffect(() => { endRef.current?.scrollIntoView({ block: "end" }); }, [timeline.length, streamingReply]);

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    if (await onSend(text)) setDraft("");
  }

  return <ConversationSurface className="conversation-view" aria-label="WorkshopLM Conversation">
    <header className="conversation-heading"><div><h1>Work with your sources</h1><p>{state?.activeSourceIds.length ?? 0} selected · answers stay linked to Sources</p></div></header>
    <div className="conversation-thread" aria-live="polite">
      {!timeline.length && <div className="conversation-empty"><h2>What should we make clear?</h2><p>Ask a question across the selected Sources. Voice capture adds your spoken thought as a private Source before WorkshopLM responds.</p><div className="conversation-prompts"><Button variant="secondary" size="small" onClick={() => setDraft("What is the strongest recommendation in these Sources?")}>Find the recommendation</Button><Button variant="secondary" size="small" onClick={() => setDraft("Which Source should lead the Presentation?")}>Find the lead Source</Button></div></div>}
      {timeline.map((entry) => entry.kind === "turn" ? <article className={`conversation-turn conversation-turn--${entry.value.role}`} key={entry.value.id}>
        <small>{entry.value.role === "assistant" ? "WorkshopLM" : "You"}{entry.value.input === "voice" ? " · Voice" : ""}</small>
        <p>{entry.value.text}</p>
        {entry.value.evidence.length > 0 && <div className="conversation-citations" aria-label="Sources used">{entry.value.evidence.map((evidence, index) => { const source = state?.sourceItems.find((item) => item.id === evidence.sourceId); return <Token key={`${entry.value.id}-${evidence.chunkId ?? index}`} onClick={() => onShowSource(evidence)}>{source?.title ?? `Source ${index + 1}`}</Token>; })}</div>}
      </article> : <ToolActivity call={entry.value} confirmed={Boolean(entry.value.provider?.callId && confirmedProviderCalls.has(`${entry.value.channel}:${entry.value.provider.callId}`))} busy={busy} onConfirm={onConfirmTool} key={entry.value.id} />)}
      {streamingReply && <article className="conversation-turn conversation-turn--assistant" aria-busy="true"><small>WorkshopLM</small><p>{streamingReply}</p></article>}
      <div ref={endRef} />
    </div>
    <div className="conversation-compose">
      {voiceOpen && <RealtimeCapture mode="conversation" disabled={busy} continuationOutput={realtimeContinuation} onContinuationSent={onRealtimeContinuationSent} onProviderToolEvent={onVoiceToolEvent} onSave={async (text, capture) => { const saved = await onVoiceSave(text, capture); if (saved) { onRealtimeContinuationSent(); setVoiceOpen(false); } return saved; }} />}
      <form className="conversation-composer" onSubmit={(event) => { event.preventDefault(); void send(); }}>
        <TextArea aria-label="Message WorkshopLM" placeholder="Ask about the selected Sources…" value={draft} maxLength={4000} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void send(); } }} />
        <div className="conversation-actions"><Button type="button" variant="secondary" aria-expanded={voiceOpen} onClick={() => { onRealtimeContinuationSent(); setVoiceOpen((current) => !current); }}>{voiceOpen ? "Close voice" : "Voice"}</Button><Button type="submit" disabled={busy || !draft.trim()}>{busy ? "Working…" : "Send"}</Button></div>
      </form>
    </div>
  </ConversationSurface>;
}

const TOOL_ACTIVITY_LABELS: Record<string, string> = {
  search: "Searched selected sources",
  fetch: "Opened source",
  workshop_get_trace: "Checked source trace",
  workshop_set_source_scope: "Updated selected sources",
  workshop_approve_brief: "Approved Brief",
  workshop_create_output: "Created a new piece of work",
  workshop_approve_storyboard: "Approved Storyboard",
  workshop_render_video: "Started Video creation",
};
const TOOL_CONFIRM_LABELS: Record<string, string> = {
  workshop_set_source_scope: "Update sources",
  workshop_approve_brief: "Approve Brief",
  workshop_create_output: "Create work",
  workshop_approve_storyboard: "Approve Storyboard",
  workshop_render_video: "Create Video",
};
const TOOL_FAILURE_MESSAGES: Record<string, string> = {
  search: "WorkshopLM couldn't search the selected Sources. Try asking again.",
  fetch: "That source excerpt isn't available in the selected Sources.",
  workshop_get_trace: "That work's source trace isn't available.",
  workshop_set_source_scope: "The selected Sources changed. Review them and try again.",
  workshop_approve_brief: "The Map changed. Review the current Map before approving the Brief.",
  workshop_create_output: "The Brief or Style changed. Review them before creating this work.",
  workshop_approve_storyboard: "The Storyboard changed. Review the current panels before approval.",
  workshop_render_video: "Approve the current Storyboard before creating the Video.",
};
function ToolActivity({ call, confirmed, busy, onConfirm }: { call: ConversationToolCall; confirmed: boolean; busy: boolean; onConfirm: (call: ConversationToolCall) => Promise<boolean> }) {
  const channel = call.channel === "realtime" ? "Voice" : call.channel === "responses" ? "Chat" : "Workshop";
  const label = TOOL_ACTIVITY_LABELS[call.name] ?? "Workshop action";
  const needsConfirmation = !confirmed && !call.explicitUserIntent && call.result.isError && call.result.summary.includes("requires explicit user intent") && Boolean(TOOL_CONFIRM_LABELS[call.name]);
  const visibleLabel = needsConfirmation ? `Confirmation required · ${channel}` : call.result.isError ? `Couldn't complete: ${label.toLocaleLowerCase()} · ${channel}` : `${label} · ${channel}`;
  return <article className={`conversation-tool ${call.result.isError ? "conversation-tool--error" : ""}`} aria-label={`${label}: ${call.status}`}>
    <small>{visibleLabel}</small>
    <p>{needsConfirmation ? `WorkshopLM needs your confirmation to ${TOOL_CONFIRM_LABELS[call.name]!.toLocaleLowerCase()}.` : call.result.isError ? (TOOL_FAILURE_MESSAGES[call.name] ?? "WorkshopLM couldn't complete that action. Try again.") : call.result.summary}</p>
    {needsConfirmation && <Button size="small" disabled={busy} onClick={() => { void onConfirm(call); }}>{TOOL_CONFIRM_LABELS[call.name]}</Button>}
  </article>;
}

function SourceScopeImpact({ pending, busy, onApply, onCancel }: { pending: PendingSourceScope; busy: boolean; onApply: () => void; onCancel: () => void }) {
  return <Card className="source-scope-impact" role="status" aria-label="Source change impact">
    <div><strong>{pending.change === "remove" ? "Remove" : "Add"} {pending.sourceTitle}?</strong><p>{pending.affected.join(", ")} will need an update. Your Style stays the same.</p></div>
    <div className="button-row"><Button size="small" disabled={busy} onClick={onApply}>Update sources</Button><Button variant="secondary" size="small" disabled={busy} onClick={onCancel}>Cancel</Button></div>
  </Card>;
}

function SourcesRail({ open, sources, activeIds, pending, busy, conversationActive, onConversation, onSelect, onToggle, onApplyScope, onCancelScope, onCollapse, onAdd }: { open: boolean; sources: SourceItem[]; activeIds: string[]; pending: PendingSourceScope | null; busy: boolean; conversationActive: boolean; onConversation: () => void; onSelect: (source: SourceItem) => void; onToggle: (id: string) => void; onApplyScope: () => void; onCancelScope: () => void; onCollapse: () => void; onAdd: () => void }) {
  return <WorkbenchRail side="left" className="sources-rail" aria-label="Sources" data-collapsed={!open || undefined}>
    <header className={`rail-heading ${open ? "" : "rail-heading--collapsed"}`}>{open && <div><strong>Sources</strong><small>{activeIds.length} of {sources.length} selected</small></div>}<div className="rail-actions">{open && <IconButton label="Add material" onClick={onAdd}><PlusIcon /></IconButton>}<IconButton label={open ? "Collapse Sources" : "Expand Sources"} aria-expanded={open} onClick={onCollapse}><span className={open ? "" : "rail-chevron rail-chevron--right"}><ArrowLeftIcon /></span></IconButton></div></header>
    {!open ? null : <>
    <ListRow className={`conversation-entry ${conversationActive ? "selected" : ""}`}><ListRowAction aria-current={conversationActive ? "page" : undefined} onClick={onConversation}><span><strong>Chat</strong><small>Ask your sources</small></span></ListRowAction></ListRow>
    {pending && <SourceScopeImpact pending={pending} busy={busy} onApply={onApplyScope} onCancel={onCancelScope} />}
    {sources.length ? <ListGroup className="rail-source-list">{sources.map((source) => <ListRow className="source-row" key={source.id}><Checkbox aria-label={`Use ${sourceDisplayTitle(source)}`} checked={activeIds.includes(source.id)} onChange={() => onToggle(source.id)} /><ListRowAction onClick={() => onSelect(source)}><FileIcon label={source.type} /><span><strong>{sourceDisplayTitle(source)}</strong><small>{source.claimCount} {source.claimCount === 1 ? "claim" : "claims"}</small></span></ListRowAction></ListRow>)}</ListGroup> : <p className="rail-empty">Add a meeting, document, or conversation.</p>}
    </>}
  </WorkbenchRail>;
}

function ProductionItem({ title, detail, status, tone = "waiting", onClick, ariaLabel }: { title: string; detail: string; status: string; tone?: "current" | "waiting"; onClick?: () => void; ariaLabel?: string }) {
  const content = <><span className="production-item-copy"><strong>{title}</strong><small>{detail}</small></span><Status tone={tone}>{status}</Status></>;
  return <ListRow className="production-item">{onClick ? <ListRowAction aria-label={ariaLabel} onClick={onClick}>{content}</ListRowAction> : <div className="production-item-static">{content}</div>}</ListRow>;
}

function ProductionRail({ open, state, view, action, onCollapse, onOpenView, onOpenOutput, onOpenStyle }: { open: boolean; state: PersistedWorkshop | null; view: ObjectView; action: ReactNode; onCollapse: () => void; onOpenView: (view: ObjectView) => void; onOpenOutput: (id: string) => void; onOpenStyle: () => void }) {
  const latest = (type: "deck" | "infographic") => [...(state?.outputs ?? [])].reverse().find((output) => output.type === type);
  const deck = latest("deck");
  const infographic = latest("infographic");
  const currentVideo = [...(state?.videos ?? [])].reverse().find((video) => !video.stale) ?? [...(state?.videos ?? [])].reverse()[0];
  const briefReady = Boolean(state?.briefApproved && !state.frame?.stale);
  const styleReady = Boolean(state?.style && !state.style.stale);
  const hasOutputs = Boolean(deck || infographic || state?.sketch || state?.imageBatch || state?.storyboard.panels.length || currentVideo);
  const currentAudio = [...(state?.audioOverviews ?? [])].reverse().find((overview) => !overview.stale && overview.status !== "failed");
  const outputCount = [deck && !deck.stale, infographic && !infographic.stale, state?.sketch && !state.sketch.stale, currentAudio, state?.imageBatch && !state.imageBatch.stale, state?.storyboardApproved && !state.storyboard.stale, currentVideo && !currentVideo.stale].filter(Boolean).length;
  const outputsCurrent = hasOutputs && !outputSetStatus(state).actionRequired;

  return <WorkbenchRail side="right" className="production-rail" aria-label="Create" data-collapsed={!open || undefined}>
    <header className={`rail-heading ${open ? "" : "rail-heading--collapsed"}`}>{open && <div><strong>Create</strong><small>{currentVideo && !currentVideo.stale ? "Ready to share" : "From Brief to created work"}</small></div>}<div className="rail-actions"><IconButton label={open ? "Collapse Create" : "Expand Create"} aria-expanded={open} onClick={onCollapse}><span className={open ? "rail-chevron rail-chevron--right" : ""}><ArrowLeftIcon /></span></IconButton></div></header>
    {!open ? null : <>
    <section className="next-action" aria-label="Next action"><small>Next</small>{action}</section>
    <ListGroup className="production-list">
      <ProductionItem title="Brief" detail={briefReady ? `${state?.activeSourceIds.length ?? 0} ${(state?.activeSourceIds.length ?? 0) === 1 ? "source" : "sources"}` : "Approve the Map"} status={state?.frame?.stale ? "Needs update" : briefReady ? "Approved" : "Needs review"} tone={briefReady && !state?.frame?.stale ? "current" : "waiting"} onClick={() => onOpenView(briefReady ? "brief" : "map")} ariaLabel={briefReady ? "View brief" : "Review Brief"} />
      <ProductionItem title="Style" detail={styleReady ? state?.style?.name ?? "Company Style" : "Brand and format"} status={state?.style?.stale ? "Needs update" : styleReady ? "Ready" : "Not selected"} tone={styleReady ? "current" : "waiting"} onClick={onOpenStyle} />
      <ProductionItem title="Created work" detail={outputCount ? `${outputCount} ready` : "Presentation, visuals, audio"} status={outputsCurrent ? "Up to date" : hasOutputs ? "Needs update" : "Not created"} tone={outputsCurrent ? "current" : "waiting"} onClick={() => onOpenView("outputs")} ariaLabel="View created work" />
      <ProductionItem title="Storyboard" detail={state?.storyboard.panels.length ? `${state.storyboard.panels.length} editable panels` : "Review before Video"} status={state?.storyboard.stale ? "Needs update" : state?.storyboardApproved ? "Approved" : state?.storyboard.panels.length ? "Needs review" : "Planned"} tone={state?.storyboardApproved && !state.storyboard.stale ? "current" : "waiting"} onClick={state?.storyboard.panels.length ? () => onOpenView("storyboard") : undefined} ariaLabel="View storyboard" />
      <ProductionItem title="Video" detail={currentVideo ? `${state?.storyboard.panels.length ?? 0} scenes` : state?.videoState === "failed" || state?.videoState === "cancelled" ? state.videoRecovery?.message ?? "Your approved Storyboard is safe." : "From approved Storyboard"} status={currentVideo?.stale ? "Needs update" : currentVideo ? "Up to date" : state?.videoState === "queued" ? "Waiting" : state?.videoState === "rendering" ? "Creating" : state?.videoState === "failed" ? "Couldn't create" : state?.videoState === "cancelled" ? "Cancelled" : "Planned"} tone={currentVideo && !currentVideo.stale ? "current" : "waiting"} onClick={currentVideo ? () => onOpenOutput(currentVideo.id) : undefined} />
    </ListGroup>
    </>}
  </WorkbenchRail>;
}

function StoryboardView({ storyboard, storyboardHistory, imageBatch, style, approved, panel, busy, onSelect, onPost, onShowSource }: { storyboard?: PersistedWorkshop["storyboard"]; storyboardHistory: PersistedWorkshop["storyboardHistory"]; imageBatch?: PersistedWorkshop["imageBatch"]; style?: PersistedWorkshop["style"]; approved: boolean; panel?: PersistedWorkshop["storyboard"]["panels"][number]; busy: boolean; onSelect: (id: string) => void; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null>; onShowSource: (target?: EvidenceTarget) => void }) {
  const [title, setTitle] = useState(panel?.title ?? "");
  const [narration, setNarration] = useState(panel?.narration ?? "");
  const [seconds, setSeconds] = useState(String(panel?.durationSeconds ?? ""));
  const [historyVersion, setHistoryVersion] = useState<number | null>(null);
  const [historyPanelIndex, setHistoryPanelIndex] = useState(0);
  useEffect(() => { if (panel) { setTitle(panel.title); setNarration(panel.narration); setSeconds(String(panel.durationSeconds)); } }, [panel]);
  useEffect(() => { if (historyVersion !== null && !storyboardHistory.some((item) => item.version === historyVersion)) setHistoryVersion(null); }, [historyVersion, storyboardHistory]);
  const duration = (storyboard?.panels ?? []).reduce((sum, item) => sum + item.durationSeconds, 0);
  const parsedSeconds = Number(seconds);
  const timingValid = Number.isInteger(parsedSeconds) && parsedSeconds >= 1 && parsedSeconds <= 120;
  const dirty = Boolean(panel && (title.trim() !== panel.title || narration.trim() !== panel.narration || parsedSeconds !== panel.durationSeconds));
  const image = panel ? boundImage(panel, imageBatch) : undefined;
  const panelVisualStyle = {
    "--story-accent": style?.accent ?? "#0285FF",
    "--story-ink": style?.ink ?? "#0D0D0D",
    "--story-paper": style?.paper ?? "#FFFFFF",
  } as CSSProperties;
  const historicalStoryboard = storyboardHistory.find((item) => item.version === historyVersion);
  const historicalPanel = historicalStoryboard?.panels[historyPanelIndex] ?? historicalStoryboard?.panels[0];
  if (!storyboard?.panels.length) return <article className="storyboard-view"><h1 className="visually-hidden">Storyboard</h1><StateMessage state="empty" title="Create work first">Your Storyboard appears after you create the first set of work.</StateMessage></article>;
  return <article className="storyboard-view">
    <header className="object-page-header"><div><h1>Storyboard</h1><p>Review the sequence before creating Video.</p></div><Status tone={approved ? "current" : "waiting"}>{approved ? "Approved" : "Ready for review"}</Status></header>
    <p className="storyboard-meta"><span>{storyboard?.panels.length ?? 0} panels · {duration} seconds</span></p>
    <CarouselRow className="storyboard-strip">{(storyboard?.panels ?? []).map((item, index) => { const thumbnail = boundImage(item, imageBatch); return <button type="button" key={item.id} className={`film-frame ${thumbnail ? "has-image" : ""} ${item.id === panel?.id ? "selected" : ""}`} data-domain-ui="film-frame" style={{ "--panel": index } as CSSProperties} onClick={() => onSelect(item.id)}>{thumbnail && <img alt="" src={`/api/workshop/artifacts/${thumbnail.id}`} />}<span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong><small>{item.durationSeconds}s</small></button>; })}</CarouselRow>
    {panel && <Card className="panel-editor"><div className={`panel-visual ${image ? "has-image" : ""}`} data-domain-ui="panel-visual" style={panelVisualStyle}>{image && <img alt="" src={`/api/workshop/artifacts/${image.id}`} />}<div className="panel-visual-copy"><small>{image ? "Image" : "Style preview"}</small><span>{panel.title}</span><p>{panel.narration}</p></div></div><div className="panel-fields"><Input label="Panel title" value={title} onChange={(event) => setTitle(event.target.value)} /><TextArea label="Narration" value={narration} onChange={(event) => setNarration(event.target.value)} /><Input label="Seconds" type="number" min={1} max={120} step={1} inputMode="numeric" value={seconds} onChange={(event) => setSeconds(event.target.value)} />{seconds && !timingValid && <p className="panel-change-note" role="alert">Use a whole number from 1 to 120.</p>}{dirty && timingValid && <p className="panel-change-note">Saving will require Storyboard approval and a new Video.</p>}<div className="button-row">{dirty && <Button variant="secondary" disabled={busy || !title.trim() || !narration.trim() || !timingValid} onClick={() => { void onPost({ action: "updateStoryboardPanel", panel: { id: panel.id, title: title.trim(), narration: narration.trim(), durationSeconds: parsedSeconds } }); }}>Save changes</Button>}<Button variant="secondary" size="small" onClick={() => { const evidence = panel.evidence[0]; onShowSource({ sourceId: evidence?.sourceId, claimId: evidence?.claimId, locator: evidence?.locator }); }}>Show source</Button></div></div></Card>}
    {storyboardHistory.length > 0 && <section className="artifact-source-trail output-version-history" aria-labelledby="storyboard-history-heading"><div><h2 id="storyboard-history-heading">Version history</h2><p>Earlier Storyboards stay available with the exact visuals reviewed at the time.</p></div><ListGroup>{[...storyboardHistory].sort((left, right) => right.version - left.version).map((item) => <ListRow key={item.version}><ListRowAction onClick={() => { setHistoryPanelIndex(0); setHistoryVersion(item.version); }}><span><strong>Version {item.version}</strong><small>{item.approved ? "Approved" : "Earlier version"} · {item.panels.length} panels</small></span></ListRowAction></ListRow>)}</ListGroup></section>}
    {historicalStoryboard && historicalPanel && <SideSheet title={`Storyboard · Version ${historicalStoryboard.version}`} onClose={() => setHistoryVersion(null)}><p className="sheet-intro"><Status tone={historicalStoryboard.approved ? "current" : "waiting"}>{historicalStoryboard.approved ? "Approved version" : "Earlier version"}</Status> <span>{historicalStoryboard.panels.length} panels · {historicalStoryboard.panels.reduce((sum, item) => sum + item.durationSeconds, 0)} seconds</span></p><CarouselRow className="storyboard-strip storyboard-history-strip">{historicalStoryboard.panels.map((item, index) => <button type="button" key={`${historicalStoryboard.version}-${item.id}-${index}`} className={`film-frame ${index === historyPanelIndex ? "selected" : ""}`} data-domain-ui="film-frame" style={{ "--panel": index } as CSSProperties} onClick={() => setHistoryPanelIndex(index)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong><small>{item.durationSeconds}s</small></button>)}</CarouselRow><Card className="panel-editor historical-panel"><div className={`panel-visual ${historicalPanel.imageRelativePath ? "has-image" : ""}`} data-domain-ui="panel-visual" style={{ "--panel": historyPanelIndex } as CSSProperties}>{historicalPanel.imageRelativePath && <img alt="" src={`/api/workshop/artifacts/storyboard-v${historicalStoryboard.version}-panel-${historyPanelIndex + 1}-image`} />}<div className="panel-visual-copy"><small>{historicalPanel.imageRelativePath ? "Reviewed image" : "Style preview"}</small><span>{historicalPanel.title}</span><p>{historicalPanel.narration}</p></div></div><div className="panel-fields"><small>Panel {historyPanelIndex + 1} · {historicalPanel.durationSeconds} seconds</small><h3>{historicalPanel.title}</h3><p>{historicalPanel.narration}</p><Button variant="secondary" size="small" onClick={() => { const evidence = historicalPanel.evidence[0]; onShowSource({ sourceId: evidence?.sourceId, claimId: evidence?.claimId, locator: evidence?.locator }); }}>Show source</Button></div></Card></SideSheet>}
  </article>;
}

function WorkshopsSheet({ workshops, busy, onClose, onSelect, onCreate, onHelp }: { workshops: WorkshopSummary[]; busy: boolean; onClose: () => void; onSelect: (workshopId: string) => void; onCreate: (title: string) => Promise<boolean>; onHelp: () => void }) {
  const [title, setTitle] = useState("");
  return <SideSheet title="Workshops" onClose={onClose}>
    <p className="sheet-intro">Keep each project, its Sources, and its created work together.</p>
    <ListGroup>{workshops.map((workshop) => <ListRow className={workshop.active ? "workshop-row selected" : "workshop-row"} key={workshop.id}><ListRowAction disabled={busy || workshop.active} onClick={() => onSelect(workshop.id)}><span><strong>{workshop.title}</strong><small>{workshop.sources} {workshop.sources === 1 ? "source" : "sources"} · {workshop.outputs} {workshop.outputs === 1 ? "piece" : "pieces"} of work{workshop.active ? " · Open" : ""}</small></span></ListRowAction></ListRow>)}</ListGroup>
    <div className="new-workshop"><Input label="New Workshop" placeholder="Project name" value={title} onChange={(event) => setTitle(event.target.value)} /><Button disabled={busy || !title.trim()} onClick={() => { void onCreate(title.trim()).then((created) => { if (created) setTitle(""); }); }}><PlusIcon /> Create</Button></div>
    <Button variant="secondary" size="small" onClick={onHelp}>How WorkshopLM works</Button>
  </SideSheet>;
}

function ObjectsSheet({ state, view, onClose, onSelect, onWorkshops }: { state: PersistedWorkshop | null; view: ObjectView; onClose: () => void; onSelect: (target: WorkshopIndexTarget) => void; onWorkshops: () => void }) {
  const groups: Array<{ stage: WorkshopStage; title: string; items: Array<{ target: WorkshopIndexTarget; title: string; detail: string; ready: boolean }> }> = [
    { stage: "capture", title: "Capture", items: [
      { target: "conversation", title: "Conversation", detail: "Talk or ask across your Sources", ready: true },
      { target: "sources", title: "Sources", detail: `${state?.activeSourceIds.length ?? 0} selected`, ready: true },
    ] },
    { stage: "map", title: "Map", items: [
      { target: "map", title: "Map", detail: "Evidence, synthesis, and direction", ready: Boolean(state?.mapNodes.length) },
    ] },
    { stage: "brief", title: "Brief", items: [
      { target: "brief", title: "Brief", detail: "The approved direction", ready: Boolean(state?.briefApproved) },
    ] },
    { stage: "create", title: "Create", items: [
      { target: "style", title: "Style", detail: state?.style?.name ?? "Choose the visual system", ready: Boolean(state?.briefApproved) },
      { target: "outputs", title: "Created work", detail: "Presentation, visuals, and audio", ready: Boolean(state?.outputs.length || state?.imageBatch) },
      { target: "storyboard", title: "Storyboard", detail: "Review the sequence before Video", ready: Boolean(state?.storyboard.panels.length) },
    ] },
  ];
  const current = view === "output" ? "outputs" : view;
  return <SideSheet title="Workshop" onClose={onClose}>
    <p className="sheet-intro">Capture the material, shape the Map, approve the Brief, then create.</p>
    <div className="workshop-index">{groups.map((group, groupIndex) => <section className="workshop-index-group" key={group.stage} aria-labelledby={`workshop-index-${group.stage}`}>
      <header><span>{String(groupIndex + 1).padStart(2, "0")}</span><strong id={`workshop-index-${group.stage}`}>{group.title}</strong></header>
      <ListGroup>{group.items.map((item) => <ListRow className={`object-view-row ${current === item.target ? "selected" : ""}`} key={item.target}><ListRowAction aria-current={current === item.target ? "page" : undefined} disabled={!item.ready || current === item.target} aria-label={`Open ${item.title}`} onClick={() => onSelect(item.target)}><span><strong>{item.title}</strong><small>{item.ready ? item.detail : "Available later"}</small></span></ListRowAction></ListRow>)}</ListGroup>
    </section>)}</div><Button className="browse-workshops" variant="secondary" size="small" onClick={onWorkshops}>All Workshops</Button>
  </SideSheet>;
}

function HowItWorksSheet({ onClose }: { onClose: () => void }) {
  const steps = [
    { title: "Capture", detail: "Talk, paste meeting notes, add a public page, or use a local PDF." },
    { title: "Map", detail: "See the evidence, synthesis, and recommended direction." },
    { title: "Brief", detail: "Review the direction and approve what should be created." },
    { title: "Create", detail: "Choose Style and create professional knowledge work. Review the Storyboard before Video." },
  ];
  return <SideSheet title="How WorkshopLM works" onClose={onClose}>
    <p className="sheet-intro">From your meetings and documents to a polished Presentation, visuals, audio, and Video—with every factual claim traced to its Source.</p>
    <ListGroup>{steps.map((step) => <ListRow key={step.title}><div className="help-step"><strong>{step.title}</strong><small>{step.detail}</small></div></ListRow>)}</ListGroup>
    <Card className="help-trust"><strong>Stay in control</strong><p><b>Show source</b> traces factual work back to its material. Brief and Storyboard are the only two sign-offs.</p></Card>
  </SideSheet>;
}

function SourcesSheet({ sources, activeIds, selected, pending, busy, onClose, onSelect, onToggle, onApplyScope, onCancelScope, onAdd, onShowMap }: { sources: SourceItem[]; activeIds: string[]; selected: SourceItem | null; pending: PendingSourceScope | null; busy: boolean; onClose: () => void; onSelect: (source: SourceItem) => void; onToggle: (id: string) => void; onApplyScope: () => void; onCancelScope: () => void; onAdd: () => void; onShowMap: (source: SourceItem) => void }) {
  const active = selected ?? sources[0];
  return <SideSheet title="Sources" onClose={onClose}><div className="sheet-heading"><p>{activeIds.length} of {sources.length} selected</p><Button variant="secondary" onClick={onAdd}><PlusIcon /> Add source</Button></div>{pending && <SourceScopeImpact pending={pending} busy={busy} onApply={onApplyScope} onCancel={onCancelScope} />}<ListGroup>{sources.map((source) => <ListRow className={active?.id === source.id ? "source-row selected" : "source-row"} key={source.id}><Checkbox aria-label={`Use ${sourceDisplayTitle(source)}`} checked={activeIds.includes(source.id)} onChange={() => onToggle(source.id)} /><ListRowAction onClick={() => onSelect(source)}><FileIcon label={source.type} /><span><strong>{sourceDisplayTitle(source)}</strong><small>{sourceDisplayOrigin(source)} · {source.claimCount} claims</small></span></ListRowAction></ListRow>)}</ListGroup>{active && <Card className="source-preview"><strong>{sourceDisplayTitle(active)}</strong><p>“{active.excerpt}”</p><small>{claimDisplayLocator({ sourceId: active.id, locator: active.locator }, { sourceItems: sources })}</small><Button variant="secondary" size="small" onClick={() => onShowMap(active)}>Show on map</Button></Card>}</SideSheet>;
}

function EvidenceSheet({ source, evidence, onClose, onShowMap }: { source: SourceItem; evidence: EvidenceSelection | null; onClose: () => void; onShowMap: () => void }) {
  const locator = evidence?.locator ?? source.locator;
  return <SideSheet title="Source" onClose={onClose}><blockquote className="evidence-quote">“{evidence?.excerpt ?? source.excerpt}”</blockquote><p className="source-locator">{sourceEvidenceLocator(source, locator)}</p><dl className="evidence-meta"><dt>Source</dt><dd>{sourceDisplayTitle(source)}</dd><dt>Origin</dt><dd>{sourceDisplayOrigin(source)}</dd></dl><Button onClick={onShowMap}>Show on map</Button></SideSheet>;
}

function AddSourceSheet({ busy, onClose, onPost, onUploadPdf }: { busy: boolean; onClose: () => void; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null>; onUploadPdf: (file: File, permission?: SourceItem["permission"]) => Promise<PersistedWorkshop | null> }) {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const kind = sourceInputKind(source);
  const add = () => {
    const value = source.trim();
    const body = kind === "url"
      ? { action: "ingestUrl", url: value }
      : kind === "pdf"
        ? { action: "ingestPdfFile", filePath: value, permission: "private" }
        : { action: "ingestSource", source: { title: title.trim() || sourceTitleFromText(value), origin: "Pasted notes", text: value, permission: "private" } };
    void onPost(body).then((next) => next && onClose());
  };
  const addPdf = async (file: File) => {
    const next = await onUploadPdf(file);
    if (next) onClose();
    return Boolean(next);
  };
  return <SideSheet title="Add source" onClose={onClose}><RealtimeCapture onSave={async (transcript, capture) => Boolean(await onPost({ action: "captureFallbackTranscript", text: transcript, capture }).then((next) => { if (next) onClose(); return next; }))} /><div className="source-divider"><span>or add material</span></div><p className="sheet-intro">Paste notes or a public website, or choose a PDF from this Mac.</p><FilePicker className="local-pdf-picker" label="Choose PDF" accept="application/pdf,.pdf" disabled={busy} onChoose={(file) => { void addPdf(file); }} /><TextArea label="Notes or website" hint="Paste text or a public URL" value={source} onChange={(event) => setSource(event.target.value)} />{kind === "text" && source.trim() && <Input label="Title (optional)" value={title} onChange={(event) => setTitle(event.target.value)} />}<Button disabled={busy || !source.trim()} onClick={add}>Add source</Button></SideSheet>;
}

function Status({ children, tone = "current" }: { children: ReactNode; tone?: "current" | "waiting" }) {
  return <span className={`status status--${tone}`}>{children}</span>;
}
