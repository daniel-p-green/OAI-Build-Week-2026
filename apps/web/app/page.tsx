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
  ObjectSwitcher,
} from "@workshoplm/ui";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { RealtimeCapture } from "./realtime-capture";
import { ExcalidrawMap } from "./excalidraw-map";
import { claimsForArtifact } from "./artifact-evidence";
import { sourceInputKind, sourceTitleFromText } from "./source-input";
import { realtimeFunctionOutput } from "./realtime-transcript";

type ObjectView = "conversation" | "map" | "brief" | "outputs" | "storyboard" | "output";
type Sheet = "workshops" | "sources" | "evidence" | "add-source" | "style" | "original" | "help" | null;
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
  graphState?: string;
  frame?: { version: number; markdown: string; stale: boolean };
  style?: { version: number; source: "manual" | "website"; name: string; accent: string; ink: string; paper: string; paletteRoles: StylePaletteRoles; typographyRoles: StyleTypographyRoles; brandAssets: BrandAsset[]; logos: string[]; licensedFonts: string[]; references: string[]; negativeRules: string[]; intentProfile: ManualStylePayload["intentProfile"]; referenceUrl?: string; libraryId?: string; libraryFamilyId?: string; libraryRevision?: number; stale: boolean };
  assetPlan?: { version: number; stale: boolean; evidenceClaimIds: string[] };
  storyboard: { version: number; stale: boolean; panels: { id: string; title: string; narration: string; durationSeconds: number; claimIds: string[]; evidence: { claimId?: string; sourceId: string; chunkId?: string; locator: string }[]; imagePanelId?: string; imagePanelVersion?: number; approved: boolean; stale: boolean }[] };
  imageBatch?: { id: string; graphRevision: number; briefVersion: number; styleVersion: number; referenceId: string; stale: boolean; panels: { id: string; version: number; prompt: string; evidence: { claimId?: string; sourceId: string; chunkId?: string; locator: string }[]; state: "planned" | "selected_for_regeneration" | "generated" | "failed"; relativePath?: string }[] };
  outputs: { id: string; type: "deck" | "infographic"; stale: boolean; artifactPath: string; editableRelativePath?: string; claimIds?: string[]; createdAt: string }[];
  videos: { id: string; version: number; storyboardVersion: number; styleVersion: number; relativePath: string; provenancePath: string; artifactPath: string; claimIds: string[]; buildTrace?: { htmlPath: string; dataPath: string; htmlSha256: string; dataSha256: string; milestoneCount: number; commitCount: number; taskIds: string[] }; stale: boolean; createdAt: string }[];
};

const VIEW_TITLES: Record<ObjectView, string> = { conversation: "Conversation", map: "Map", brief: "Brief", outputs: "Outputs", storyboard: "Storyboard", output: "Output" };
const outputTitle = (type: "deck" | "infographic") => type === "deck" ? "Presentation" : "Infographic";
const outputType = (type: "deck" | "infographic") => type === "deck" ? "Presentation" : "Infographic";

function outputSetStatus(state: PersistedWorkshop | null) {
  if (!state) return { incomplete: false, stale: false, actionRequired: false };
  const latest = (type: "deck" | "infographic") => [...state.outputs].reverse().find((output) => output.type === type);
  const deck = latest("deck");
  const infographic = latest("infographic");
  const generationStarted = Boolean(state.outputs.length || state.assetPlan || state.imageBatch);
  const currentVideo = [...(state.videos ?? [])].sort((left, right) => right.version - left.version)[0];
  const failedImages = Boolean(state.imageBatch?.panels.some((panel) => panel.state === "failed"));
  const failedOutputs = Boolean(state.outputRecovery && Object.keys(state.outputRecovery).length);
  const incomplete = Boolean(generationStarted && (!deck || !infographic || !state.imageBatch || !state.storyboard.panels.length)) || failedImages || failedOutputs;
  const replacementIds = new Set(state.imageBatch?.panels.filter((panel) => panel.state === "selected_for_regeneration").map((panel) => panel.id) ?? []);
  const replacementOnlyStoryboardStale = replacementIds.size > 0
    && state.storyboard.stale
    && state.storyboard.panels.filter((panel) => panel.stale).every((panel) => Boolean(panel.imagePanelId && replacementIds.has(panel.imagePanelId)));
  const stale = Boolean(
    deck?.stale
    || infographic?.stale
    || state.assetPlan?.stale
    || state.imageBatch?.stale
    || (state.storyboard.stale && !replacementOnlyStoryboardStale)
    || currentVideo?.stale
  );
  return { incomplete, stale, actionRequired: incomplete || stale };
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
  if (state.outputs.some((output) => output.type === "deck")) affected.push("Presentation");
  if (state.outputs.some((output) => output.type === "infographic")) affected.push("Infographic");
  if (state.imageBatch) affected.push("Image set");
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
  const [selectedOutputId, setSelectedOutputId] = useState("");
  const [notice, setNotice] = useState<{ message: string; tone: "status" | "error" } | null>(null);
  const [busy, setBusy] = useState(false);
  const [streamingReply, setStreamingReply] = useState("");
  const [realtimeContinuation, setRealtimeContinuation] = useState<Record<string, unknown> | undefined>();
  const [leftRailOpen, setLeftRailOpen] = useState(true);
  const [rightRailOpen, setRightRailOpen] = useState(true);
  const [pendingSourceScope, setPendingSourceScope] = useState<PendingSourceScope | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

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
    if (state?.onboarding.styleAnalysis?.status !== "reviewing") return;
    let stopped = false;
    const timer = window.setInterval(() => {
      void fetch("/api/workshop").then(async (response) => {
        if (!stopped && response.ok) setState(await response.json() as PersistedWorkshop);
      }).catch(() => undefined);
    }, 750);
    return () => { stopped = true; window.clearInterval(timer); };
  }, [state?.onboarding.styleAnalysis?.status]);

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

  async function handleRealtimeToolEvent(event: unknown): Promise<Record<string, unknown> | undefined> {
    try {
      const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "handleProviderToolEvent", providerEvent: { channel: "realtime", event, model: "gpt-realtime-2.1", explicitUserIntent: false } }) });
      const handled = await response.json() as { state?: PersistedWorkshop; providerOutput?: Record<string, unknown>; error?: string };
      if (!response.ok || !handled.state) throw new Error(handled.error ?? "That voice action did not work");
      setState(handled.state);
      return handled.providerOutput;
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
    if (source) setSelectedSource(source);
    setSheet(next);
  }

  function closeSheet() {
    setSheet(null);
    window.setTimeout(() => returnFocusRef.current?.focus(), 0);
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
    if (state?.outputRecovery?.deck || !state?.outputs.some((output) => output.type === "deck" && !output.stale)) await run({ action: "generateOutput", outputType: "deck" });
    if (state?.outputRecovery?.infographic || !state?.outputs.some((output) => output.type === "infographic" && !output.stale)) await run({ action: "generateOutput", outputType: "infographic" });
    await run({ action: "generateAssetPlan" });
    if (!state?.imageBatch || state.imageBatch.stale || state.imageBatch.panels.some((panel) => panel.state === "failed" || panel.state === "selected_for_regeneration")) await run({ action: "createImageBatch" });
    await run({ action: "generateStoryboard" });
    setNotice(complete ? { message: "Outputs created from your Brief, Style, and Sources.", tone: "status" } : { message: "Some Outputs need attention. Your finished work is still available.", tone: "error" });
    openView("outputs");
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
    setPendingSourceScope({ sourceIds, sourceTitle: source?.title ?? "this Source", change: removing ? "remove" : "add", affected });
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
  const currentTitle = view === "output" ? (selectedOutput ? outputTitle(selectedOutput.type) : selectedOutputId === "images" ? "Image set" : "Demo video") : VIEW_TITLES[view];
  const backTarget: ObjectView | null = view === "conversation" || view === "map" ? null : view === "brief" ? "map" : view === "outputs" ? "brief" : "outputs";
  const workflowAction = !state?.mapNodes.length
    ? <Button variant={sheet ? "secondary" : "primary"} disabled={busy} onClick={() => openSheet("add-source")}>Add source</Button>
    : !state.briefApproved || state.frame?.stale
      ? <Button variant={sheet ? "secondary" : "primary"} disabled={busy} onClick={() => { void post({ action: "approveBrief" }).then((next) => next && openView("brief")); }}>Approve brief</Button>
      : !canDeliver
        ? <Button variant={sheet ? "secondary" : "primary"} disabled={busy} onClick={() => openSheet("style")}>Choose style</Button>
        : imageFailureCount
          ? <Button variant={sheet ? "secondary" : "primary"} disabled={busy} onClick={() => openOutput("images")}>Review {imageFailureCount === 1 ? "image" : "images"}</Button>
        : !(state.outputs.length || state.imageBatch) || outputsNeedUpdate
          ? <Button variant={sheet ? "secondary" : "primary"} disabled={busy} onClick={() => { void createOutputs(); }}>{outputFailureCount ? "Try outputs again" : state.outputs.length ? "Update outputs" : "Create outputs"}</Button>
          : imageReplacementCount
            ? <Button variant="secondary" disabled>Creating replacement…</Button>
          : !state.storyboardApproved
            ? view === "storyboard"
              ? <Button variant={sheet ? "secondary" : "primary"} disabled={busy || state.storyboard.stale || !state.storyboard.panels.length} onClick={() => { void post({ action: "approveStoryboard" }); }}>Approve storyboard</Button>
              : <Button variant={sheet ? "secondary" : "primary"} onClick={() => openView("storyboard")}>Review storyboard</Button>
            : state.videoState === "rendered"
              ? <Button variant={sheet ? "secondary" : "primary"} onClick={() => openOutput([...state.videos].reverse().find((video) => !video.stale)?.id ?? "video")}>View video</Button>
              : state.videoState === "queued"
                ? <Button variant="secondary" disabled={busy} onClick={() => { void post({ action: "cancelVideoRender" }); }}>Cancel video</Button>
                : state.videoState === "rendering"
                  ? <Button variant="secondary" disabled>Creating…</Button>
                  : <Button variant={sheet ? "secondary" : "primary"} disabled={busy} onClick={() => { void post({ action: "renderVideo" }); }}>{state.videoState === "failed" || state.videoState === "cancelled" ? "Try video again" : "Create video"}</Button>;

  if (loadState === "ready" && state && state.onboarding.step !== "complete") {
    return <OnboardingFlow state={state} styleLibrary={styleLibrary} busy={busy} notice={notice} onPost={post} />;
  }

  return (
    <FullScreenShell className="workshop-shell">
      <NavigationHeader className="workshop-header">
        <div className="header-identity">
          {backTarget && <IconButton label={`Back to ${VIEW_TITLES[backTarget]}`} onClick={() => openView(backTarget)}><ArrowLeftIcon /></IconButton>}
          <div className="workshop-identity"><ListRowAction className="workshop-picker" aria-label="Switch Workshop" onClick={() => openSheet("workshops")}><strong>{state?.title || "WorkshopLM"}</strong></ListRowAction><span aria-hidden="true">/</span><b>{currentTitle}</b></div>
        </div>
        {loadState === "ready" && <div className="header-actions"><Button className="mobile-sources-trigger" variant="secondary" size="small" onClick={() => openSheet("sources")}>{visibleSourceCount} {visibleSourceCount === 1 ? "source" : "sources"}</Button><div className="mobile-workflow-action">{workflowAction}</div></div>}
      </NavigationHeader>

      {notice && <Card className={`notice notice--${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}><span>{notice.message}</span><IconButton label="Dismiss" onClick={() => setNotice(null)}><CloseIcon /></IconButton></Card>}

      <Workbench className={`workbench ${leftRailOpen ? "" : "left-rail-collapsed"} ${rightRailOpen ? "" : "right-rail-collapsed"}`}>
        {loadState === "ready" && <SourcesRail open={leftRailOpen} sources={state?.sourceItems ?? []} activeIds={state?.activeSourceIds ?? []} selected={selectedSource} pending={sheet === "sources" ? null : pendingSourceScope} busy={busy} conversationActive={view === "conversation"} onConversation={() => openView("conversation")} onSelect={setSelectedSource} onToggle={requestSourceScopeChange} onApplyScope={() => { void applySourceScopeChange(); }} onCancelScope={() => setPendingSourceScope(null)} onCollapse={() => setLeftRailOpen((current) => !current)} onAdd={() => openSheet("add-source")} onShowMap={(source) => { setSelectedNodeId(state?.mapNodes.find((node) => node.sourceId === source.id)?.id ?? ""); openView("map"); }} />}
        {loadState === "ready" && <ObjectSwitcher className="mobile-object-switcher" aria-label="Workshop objects"><Button variant="secondary" size="small" aria-pressed={view === "conversation"} onClick={() => openView("conversation")}>Chat</Button><Button variant="secondary" size="small" aria-pressed={view === "map"} onClick={() => openView("map")}>Map</Button><Button variant="secondary" size="small" aria-label="View brief" aria-pressed={view === "brief"} disabled={!state?.briefApproved} onClick={() => openView("brief")}>Brief</Button><Button variant="secondary" size="small" aria-label="View outputs" aria-pressed={view === "outputs" || view === "output"} disabled={!(state?.outputs.length || state?.imageBatch)} onClick={() => openView("outputs")}>Outputs</Button><Button variant="secondary" size="small" aria-label="View storyboard" aria-pressed={view === "storyboard"} disabled={!state?.storyboard.panels.length} onClick={() => openView("storyboard")}>Story</Button></ObjectSwitcher>}
        <section className="object-canvas" aria-label={currentTitle}>
          {loadState === "loading" && <StateMessage state="loading" title="Opening Workshop">Loading your Sources and work.</StateMessage>}
          {loadState === "error" && <StateMessage state="error" title="Couldn't open Workshop" action={<Button onClick={() => { void reload(); }}>Retry</Button>}>Your work is safe. Try opening it again.</StateMessage>}
          {loadState === "ready" && view === "conversation" && <ConversationView state={state} busy={busy} streamingReply={streamingReply} realtimeContinuation={realtimeContinuation} onRealtimeContinuationSent={() => setRealtimeContinuation(undefined)} onSend={sendConversation} onVoiceSave={async (text, capture) => Boolean(await post({ action: "captureFallbackTranscript", text, capture }))} onVoiceToolEvent={handleRealtimeToolEvent} onConfirmTool={confirmToolCall} onShowSource={showSource} />}
          {loadState === "ready" && view === "map" && <MapCanvas state={state} selectedNode={selectedNode} busy={busy} onSelect={setSelectedNodeId} onSync={(canvasNodes) => { void post({ action: "syncMapCanvas", canvasNodes }); }} onUndo={() => { void post({ action: "undoMapOperation" }); }} onShowSource={showSource} onDismissOrientation={() => { void post({ action: "dismissOrientation", orientation: "map" }); }} onReviewStyle={() => openSheet("style")} onRetryStyle={(url) => { void post({ action: "beginWebsiteStyleAnalysis", url }); }} onUseDefaultStyle={() => { void post({ action: "lockManualStyle", manualStyle: { name: "Clean professional", intentProfile: state?.onboarding.outcome } }); }} />}
          {loadState === "ready" && view === "brief" && <BriefView state={state} onChooseStyle={() => openSheet("style")} onShowSource={showSource} />}
          {loadState === "ready" && view === "outputs" && <OutputsView state={state} onOpenOutput={openOutput} onOpenStoryboard={() => openView("storyboard")} onDismissOrientation={() => { void post({ action: "dismissOrientation", orientation: "outputs" }); }} />}
          {loadState === "ready" && view === "storyboard" && <StoryboardView storyboard={state?.storyboard} imageBatch={state?.imageBatch} approved={Boolean(state?.storyboardApproved)} panel={selectedPanel} busy={busy} onSelect={setSelectedPanelId} onPost={post} onShowSource={showSource} />}
          {loadState === "ready" && view === "output" && <FocusedOutputView state={state} outputId={selectedOutputId} busy={busy} onShowSource={showSource} onShowOriginal={() => openSheet("original")} onRequestReplacement={async (panelId) => { const next = await post({ action: "regenerateImagePanel", panelId }); if (next) setNotice({ message: "Replacement requested. Review the new image in Storyboard before approving Video.", tone: "status" }); }} />}
        </section>
        {loadState === "ready" && <ProductionRail open={rightRailOpen} state={state} view={view} action={workflowAction} onCollapse={() => setRightRailOpen((current) => !current)} onOpenView={openView} onOpenOutput={openOutput} onOpenStyle={() => openSheet("style")} />}
      </Workbench>

      {sheet === "workshops" && <WorkshopsSheet workshops={workshops} busy={busy} onClose={closeSheet} onSelect={(workshopId) => { void post({ action: "selectWorkshop", workshopId }); }} onCreate={(title) => post({ action: "createWorkshop", title }).then(Boolean)} onHelp={() => setSheet("help")} />}
      {sheet === "sources" && <SourcesSheet sources={state?.sourceItems ?? []} activeIds={state?.activeSourceIds ?? []} selected={selectedSource} pending={pendingSourceScope} busy={busy} onClose={closeSheet} onSelect={setSelectedSource} onToggle={requestSourceScopeChange} onApplyScope={() => { void applySourceScopeChange(); }} onCancelScope={() => setPendingSourceScope(null)} onAdd={() => setSheet("add-source")} onShowMap={(source) => { setSelectedNodeId(state?.mapNodes.find((node) => node.sourceId === source.id)?.id ?? ""); openView("map"); }} />}
      {sheet === "evidence" && selectedSource && <EvidenceSheet source={selectedSource} evidence={selectedEvidence} onClose={closeSheet} onShowMap={() => { setSelectedNodeId(state?.mapNodes.find((node) => node.sourceId === selectedSource.id)?.id ?? ""); openView("map"); }} />}
      {sheet === "add-source" && <AddSourceSheet onClose={() => setSheet("sources")} onPost={post} />}
      {sheet === "style" && <StyleSheet style={state?.style} analysisSuggestion={state?.onboarding.styleAnalysis?.status === "ready" ? state.onboarding.styleAnalysis.suggestion : undefined} defaultIntent={state?.onboarding.outcome} library={styleLibrary} busy={busy} onClose={closeSheet} onPost={post} onAnalyzeWebsite={analyzeWebsiteStyle} />}
      {sheet === "original" && <OriginalRevealSheet state={state} onClose={closeSheet} />}
      {sheet === "help" && <HowItWorksSheet onClose={closeSheet} />}
    </FullScreenShell>
  );
}

const OUTCOME_OPTIONS: Array<{ id: WorkshopOutcome; title: string; detail: string; defaultName: string }> = [
  { id: "client_facing_pitch", title: "Client pitch", detail: "A persuasive, source-defensible recommendation.", defaultName: "Client pitch" },
  { id: "board_deck", title: "Board presentation", detail: "A concise leadership narrative with evidence.", defaultName: "Board presentation" },
  { id: "internal_workshop", title: "Team workshop", detail: "A practical working session with clear actions.", defaultName: "Team workshop" },
];

function OnboardingFlow({ state, styleLibrary, busy, notice, onPost }: { state: PersistedWorkshop; styleLibrary: StyleLibraryEntry[]; busy: boolean; notice: { message: string; tone: "status" | "error" } | null; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null> }) {
  const [outcome, setOutcome] = useState<WorkshopOutcome | undefined>(state.onboarding.outcome);
  const [title, setTitle] = useState(state.title === "WorkshopLM Build Week" ? "" : state.title);
  const [website, setWebsite] = useState("");
  const [source, setSource] = useState("");
  const [sourceTitle, setSourceTitle] = useState("");
  const sourceKind = sourceInputKind(source);
  const selectedOutcome = OUTCOME_OPTIONS.find((option) => option.id === outcome);

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
    if (!value) return;
    const body = sourceKind === "url"
      ? { action: "ingestUrl", url: value }
      : sourceKind === "pdf"
        ? { action: "ingestPdfFile", filePath: value, permission: "private" }
        : { action: "ingestSource", source: { title: sourceTitle.trim() || sourceTitleFromText(value), origin: "Pasted notes", text: value, permission: "private" } };
    const next = await onPost(body);
    if (next) { setSource(""); setSourceTitle(""); }
  }

  return <FullScreenShell className="onboarding-shell">
    <NavigationHeader className="onboarding-header"><strong>WorkshopLM</strong><span>From your meetings and documents to a deck you can defend.</span></NavigationHeader>
    {notice && <Card className={`notice notice--${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}>{notice.message}</Card>}
    <section className="onboarding-stage">
      {state.onboarding.step === "welcome" && <Card className="onboarding-card welcome-card">
        <div className="onboarding-copy"><small>New Workshop</small><h1>Turn raw thinking into finished work.</h1><p>What are you making?</p></div>
        <div className="outcome-grid" role="radiogroup" aria-label="What are you making?">{OUTCOME_OPTIONS.map((option) => <ListRowAction key={option.id} className={`outcome-choice ${outcome === option.id ? "selected" : ""}`} role="radio" aria-checked={outcome === option.id} onClick={() => { setOutcome(option.id); if (!title.trim()) setTitle(option.defaultName); }}><span><strong>{option.title}</strong><small>{option.detail}</small></span></ListRowAction>)}</div>
        {outcome && <Input autoFocus label="Workshop name" value={title} onChange={(event) => setTitle(event.target.value)} />}
        <Button disabled={busy || !outcome || !title.trim()} onClick={() => { void onPost({ action: "updateOnboarding", title: title.trim(), outcome, onboardingStep: "style" }); }}>Continue</Button>
      </Card>}

      {state.onboarding.step === "style" && <Card className="onboarding-card style-start-card">
        <div className="onboarding-copy"><small>Company Style</small><h1>Make every Output feel like yours.</h1><p>We’ll suggest colors, type, and brand assets for review. This website will not be added to Sources.</p></div>
        {styleLibrary.length > 0 && <section className="saved-style-start"><h2>Use your latest saved style</h2><ListGroup>{styleLibrary.slice(0, 1).map((entry) => <ListRow key={entry.id}><ListRowAction disabled={busy} onClick={() => { void chooseStyle({ action: "applyStyleLibrary", styleLibraryId: entry.id, intentProfile: outcome }); }}><div className="saved-style-row"><span><strong>{entry.name}</strong><small>{entry.source === "website" ? "From website" : "Set manually"} · Version {entry.revision}</small></span><div className="palette-preview compact" aria-hidden="true"><i style={{ background: entry.accent }} /><i style={{ background: entry.ink }} /><i style={{ background: entry.paper }} /></div></div></ListRowAction></ListRow>)}</ListGroup></section>}
        <div className="website-style-start"><Input label="Company website" placeholder="https://company.com" value={website} onChange={(event) => setWebsite(event.target.value)} /><Button disabled={busy || !website.trim()} onClick={() => { void reviewWebsite(); }}>Find my company style</Button></div>
        <div className="onboarding-secondary-actions"><Button variant="secondary" disabled={busy} onClick={() => { void chooseStyle({ action: "lockManualStyle", manualStyle: { name: "Clean professional", intentProfile: outcome } }); }}>Use a clean default for now</Button>{state.style && <Button variant="secondary" disabled={busy} onClick={() => { void onPost({ action: "updateOnboarding", onboardingStep: "sources" }); }}>Continue with {state.style.name}</Button>}<Button variant="secondary" disabled={busy} onClick={() => { void onPost({ action: "updateOnboarding", onboardingStep: "welcome" }); }}>Back</Button></div>
      </Card>}

      {state.onboarding.step === "sources" && <Card className="onboarding-card source-start-card">
        <div className="onboarding-copy"><small>{selectedOutcome?.title ?? "Workshop"}</small><h1>Add the thinking.</h1><p>Record the conversation or add meeting notes, a public content URL, or a local PDF. Your Company Style stays separate from factual Sources.</p></div>
        <RealtimeCapture onSave={async (transcript, capture) => Boolean(await onPost({ action: "captureFallbackTranscript", text: transcript, capture }))} />
        <div className="source-divider"><span>or add material</span></div>
        <TextArea label="Source" hint="Paste notes, https://…, or /path/to/file.pdf" value={source} onChange={(event) => setSource(event.target.value)} />
        {sourceKind === "text" && source.trim() && <Input label="Title (optional)" value={sourceTitle} onChange={(event) => setSourceTitle(event.target.value)} />}
        <div className="source-start-actions"><Button variant="secondary" disabled={busy || !source.trim()} onClick={() => { void addSource(); }}>Add source</Button><Button disabled={busy || state.sourceItems.length === 0} onClick={() => { void onPost({ action: "updateOnboarding", onboardingStep: "complete" }); }}>Build my Map</Button></div>
        {state.sourceItems.length > 0 && <p className="source-ready" role="status">{state.sourceItems.length} {state.sourceItems.length === 1 ? "source" : "sources"} ready</p>}
        <Button variant="secondary" disabled={busy} onClick={() => { void onPost({ action: "updateOnboarding", onboardingStep: "style" }); }}>Back</Button>
      </Card>}
    </section>
  </FullScreenShell>;
}

function MapCanvas({ state, selectedNode, busy, onSelect, onSync, onUndo, onShowSource, onDismissOrientation, onReviewStyle, onRetryStyle, onUseDefaultStyle }: { state: PersistedWorkshop | null; selectedNode?: MapNode; busy: boolean; onSelect: (id: string) => void; onSync: (nodes: Pick<MapNode, "id" | "title" | "x" | "y" | "width" | "height">[]) => void; onUndo: () => void; onShowSource: (target?: EvidenceTarget) => void; onDismissOrientation: () => void; onReviewStyle: () => void; onRetryStyle: (url: string) => void; onUseDefaultStyle: () => void }) {
  const sources = (state?.sourceItems ?? []).filter((source) => state?.activeSourceIds.includes(source.id));
  const nodes = (state?.mapNodes ?? []).filter((node) => !node.sourceId || state?.activeSourceIds.includes(node.sourceId));
  const relatedSourceId = (node: MapNode, index: number) => node.sourceId ?? sources[index % Math.max(1, sources.length)]?.id;
  const selectedSourceId = selectedNode ? relatedSourceId(selectedNode, Math.max(0, nodes.indexOf(selectedNode))) : undefined;
  const source = sources.find((item) => item.id === selectedSourceId);
  const canUndo = Boolean(state?.graphState && !state.graphState.includes('"records":[]'));
  const analysis = state?.onboarding.styleAnalysis;
  const analysisDomain = analysis ? new URL(analysis.url).hostname : "";

  if (!nodes.length) return <div className="state-surface"><StateMessage state="empty" title="Start with a source">From your meetings and documents to a deck you can defend, with every claim traced to its source.</StateMessage></div>;

  return <div className="map-canvas" data-domain-ui="map-canvas">
    <div className="map-caption" data-domain-ui="map-caption"><span>{nodes.length} ideas · Drag to organize · Double-click to edit</span>{canUndo && <Button variant="secondary" size="small" disabled={busy} onClick={onUndo}>Undo</Button>}</div>
    {!state?.onboarding.mapOrientationDismissed && <Card className="map-orientation"><div><strong>Your Map is ready.</strong><p>Shape the ideas, approve the Brief, then create branded Outputs. Use Show source to trace any factual point back to the material behind it.</p></div><Button variant="secondary" size="small" onClick={onDismissOrientation}>Got it</Button></Card>}
    {!state?.style && analysis && <Card className="style-analysis-status" role="status"><div><strong>{analysis.status === "reviewing" ? `Reviewing ${analysisDomain}…` : analysis.status === "ready" ? "Company style ready to review" : "Couldn't review this website"}</strong><p>{analysis.status === "reviewing" ? "Keep shaping the Map while WorkshopLM checks the public visual foundation." : analysis.status === "ready" ? "Review the suggested colors, type, and brand assets before creating Outputs." : analysis.error ?? "Try again or continue with a clean professional Style."}</p></div><div className="button-row">{analysis.status === "ready" && <Button variant="secondary" size="small" onClick={onReviewStyle}>Review style</Button>}{analysis.status === "error" && <><Button variant="secondary" size="small" disabled={busy} onClick={() => onRetryStyle(analysis.url)}>Try again</Button><Button variant="secondary" size="small" onClick={onReviewStyle}>Set manually</Button><Button variant="secondary" size="small" disabled={busy} onClick={onUseDefaultStyle}>Use a clean default</Button></>}</div></Card>}
    <ExcalidrawMap nodes={nodes} sources={sources} edges={state?.mapEdges ?? []} selectedNodeId={selectedNode?.id} onSelectNode={onSelect} onShowSource={(sourceId) => onShowSource({ sourceId })} onSync={onSync} />
    {selectedNode && <ClaimInspector node={selectedNode} source={source} busy={busy} onClose={() => onSelect("")} onSave={(title) => onSync([{ id: selectedNode.id, title, x: selectedNode.x, y: selectedNode.y, width: selectedNode.width, height: selectedNode.height }])} onShowSource={() => onShowSource({ sourceId: selectedSourceId, claimId: selectedNode.id, locator: selectedNode.locator })} />}
  </div>;
}

function ClaimInspector({ node, source, busy, onClose, onSave, onShowSource }: { node: MapNode; source?: SourceItem; busy: boolean; onClose: () => void; onSave: (title: string) => void; onShowSource: () => void }) {
  const [title, setTitle] = useState(node.title);
  useEffect(() => setTitle(node.title), [node.id, node.title]);
  return <Card className="claim-inspector"><header><div><small>{node.kind === "grounded" ? "Verified claim" : node.kind === "derived" ? "Derived point" : "Idea"}</small><strong>{node.title}</strong></div><IconButton label="Close claim" onClick={onClose}><CloseIcon /></IconButton></header><Input label="Claim" value={title} onChange={(event) => setTitle(event.target.value)} /><blockquote>{source?.excerpt ?? node.body}</blockquote><p className="source-locator">{source?.locator ?? node.locator}</p><div className="button-row"><Button variant="secondary" disabled={busy || title.trim() === node.title || !title.trim()} onClick={() => onSave(title.trim())}>Save</Button><Button variant="secondary" size="small" onClick={onShowSource}>Show source</Button></div></Card>;
}

function frameSection(markdown: string | undefined, heading: string) {
  if (!markdown) return "";
  return markdown.match(new RegExp(`## ${heading}\\n([\\s\\S]*?)(?=\\n## |$)`))?.[1]?.trim() ?? "";
}

function BriefView({ state, onChooseStyle, onShowSource }: { state: PersistedWorkshop | null; onChooseStyle: () => void; onShowSource: (target?: EvidenceTarget) => void }) {
  const outcome = frameSection(state?.frame?.markdown, "Outcome") || "Turn raw thinking into finished work.";
  const evidence = frameSection(state?.frame?.markdown, "Evidence").split("\n").map((line) => line.replace(/^[-*]\s*/, "").trim()).filter(Boolean).map((item) => {
    const separator = item.lastIndexOf(" — ");
    const text = separator >= 0 ? item.slice(0, separator).trim() : item;
    const locator = separator >= 0 ? item.slice(separator + 3).trim() : undefined;
    const claim = state?.claims?.find((candidate) => candidate.locator === locator && candidate.text === text) ?? state?.claims?.find((candidate) => candidate.locator === locator);
    return { text, locator, claim };
  });
  const proof = frameSection(state?.frame?.markdown, "Production proof");
  const locked = Boolean(state?.style && !state.style.stale);

  return <article className="brief-view">
    <Card className="brief-document">
      <div className="brief-meta"><Status>Approved</Status><span>{state?.activeSourceIds.length ?? 0} sources · {state?.mapNodes.filter((node) => node.kind === "grounded").length ?? 0} verified claims</span></div>
      <h1>{outcome}</h1>
      {evidence.length > 0 && <section className="brief-section"><h2>Evidence</h2><ul>{evidence.map((item) => <li className="brief-evidence-item" key={`${item.text}-${item.locator ?? "untraced"}`}><span>{item.text}</span>{item.locator && <Token onClick={() => onShowSource({ sourceId: item.claim?.sourceId, claimId: item.claim?.id, locator: item.locator })}>{item.locator}</Token>}</li>)}</ul></section>}
      {proof && <section className="brief-section"><h2>Success looks like</h2><p>{proof}</p></section>}
      <section className="style-summary" aria-label="Style"><div className="style-summary-copy"><small>Style</small><strong>{locked ? `${state?.style?.name} · Version ${state?.style?.libraryRevision ?? 1}` : "Not selected"}</strong></div><div className="palette-preview compact" data-domain-ui="palette-preview"><i style={{ background: state?.style?.accent ?? "#0285FF" }} /><i style={{ background: state?.style?.ink ?? "#0D0D0D" }} /><i style={{ background: state?.style?.paper ?? "#FFFFFF" }} /></div>{locked && <Button variant="secondary" size="small" onClick={onChooseStyle}>Edit</Button>}</section>
    </Card>
  </article>;
}

function StyleSheet({ style, analysisSuggestion, defaultIntent, library, busy, onClose, onPost, onAnalyzeWebsite }: { style?: PersistedWorkshop["style"]; analysisSuggestion?: WebsiteStyleSuggestion; defaultIntent?: WorkshopOutcome; library: StyleLibraryEntry[]; busy: boolean; onClose: () => void; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null>; onAnalyzeWebsite: (url: string) => Promise<WebsiteStyleSuggestion | null> }) {
  const [mode, setMode] = useState<"website" | "manual">(style?.source ?? (analysisSuggestion ? "website" : "manual"));
  const [website, setWebsite] = useState(style?.referenceUrl ?? analysisSuggestion?.referenceUrl ?? "");
  const [reviewedUrl, setReviewedUrl] = useState(style?.source === "website" ? style.referenceUrl ?? "" : analysisSuggestion?.referenceUrl ?? "");
  const [findings, setFindings] = useState<WebsiteStyleSuggestion["findings"] | null>(analysisSuggestion?.findings ?? null);
  const [name, setName] = useState(style?.name ?? analysisSuggestion?.name ?? "WorkshopLM editorial");
  const [accent, setAccent] = useState(style?.accent ?? analysisSuggestion?.accent ?? "#0285FF");
  const [ink, setInk] = useState(style?.ink ?? analysisSuggestion?.ink ?? "#0D0D0D");
  const [paper, setPaper] = useState(style?.paper ?? analysisSuggestion?.paper ?? "#FFFFFF");
  const [intent, setIntent] = useState<ManualStylePayload["intentProfile"]>(style?.intentProfile ?? defaultIntent ?? "client_facing_pitch");
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
  useEffect(() => {
    setMode(style?.source ?? (analysisSuggestion ? "website" : "manual")); setWebsite(style?.referenceUrl ?? analysisSuggestion?.referenceUrl ?? ""); setReviewedUrl(style?.source === "website" ? style.referenceUrl ?? "" : analysisSuggestion?.referenceUrl ?? ""); setFindings(analysisSuggestion?.findings ?? null); setName(style?.name ?? analysisSuggestion?.name ?? "WorkshopLM editorial"); setAccent(style?.accent ?? analysisSuggestion?.accent ?? "#0285FF"); setInk(style?.ink ?? analysisSuggestion?.ink ?? "#0D0D0D"); setPaper(style?.paper ?? analysisSuggestion?.paper ?? "#FFFFFF"); setIntent(style?.intentProfile ?? defaultIntent ?? "client_facing_pitch"); setLogos((style?.logos ?? analysisSuggestion?.logos ?? []).join("\n")); setSelectedAssetUrls(style?.brandAssets.map((asset) => asset.sourceUrl) ?? []); setAssetCandidates(analysisSuggestion?.assetCandidates ?? analysisSuggestion?.logos.map((url) => ({ url, kind: "logo" as const })) ?? []); setHeadingFont(style?.typographyRoles.heading.family ?? analysisSuggestion?.fontCandidates[0] ?? "system-ui"); setBodyFont(style?.typographyRoles.body.family ?? analysisSuggestion?.fontCandidates[1] ?? analysisSuggestion?.fontCandidates[0] ?? "system-ui"); setFontsConfirmed(Boolean(style && style.typographyRoles.heading.availability !== "unverified" && style.typographyRoles.body.availability !== "unverified")); setReferences((style?.references ?? analysisSuggestion?.references ?? ["calm editorial work surface"]).join("\n")); setNegativeRules((style?.negativeRules ?? analysisSuggestion?.negativeRules ?? ["no decorative gradients"]).join("\n")); setShowDetails(false); setShowCreator(library.length === 0 || Boolean(style) || Boolean(analysisSuggestion));
  }, [style, analysisSuggestion, defaultIntent, library.length]);
  const locked = Boolean(style && !style.stale);
  const splitLines = (value: string) => value.split(/[\n,]/).map((item) => item.trim()).filter(Boolean);
  const dirty = mode !== (style?.source ?? "manual") || website.trim() !== (style?.referenceUrl ?? "") || name.trim() !== (style?.name ?? "WorkshopLM editorial") || accent.trim().toUpperCase() !== (style?.accent ?? "#0285FF").toUpperCase() || ink.trim().toUpperCase() !== (style?.ink ?? "#0D0D0D").toUpperCase() || paper.trim().toUpperCase() !== (style?.paper ?? "#FFFFFF").toUpperCase() || intent !== (style?.intentProfile ?? "client_facing_pitch") || logos.trim() !== (style?.logos ?? []).join("\n") || selectedAssetUrls.join("\n") !== (style?.brandAssets.map((asset) => asset.sourceUrl) ?? []).join("\n") || headingFont.trim() !== (style?.typographyRoles.heading.family ?? "system-ui") || bodyFont.trim() !== (style?.typographyRoles.body.family ?? "system-ui") || fontsConfirmed !== Boolean(style && style.typographyRoles.heading.availability !== "unverified" && style.typographyRoles.body.availability !== "unverified") || references.trim() !== (style?.references ?? []).join("\n") || negativeRules.trim() !== (style?.negativeRules ?? []).join("\n");
  const reviewed = mode === "manual" || Boolean(reviewedUrl && reviewedUrl === website.trim());
  const findingSummary = findings ? `${findings.colors} color${findings.colors === 1 ? "" : "s"}, ${findings.fontCandidates} font candidate${findings.fontCandidates === 1 ? "" : "s"}, and ${findings.assets} brand asset${findings.assets === 1 ? "" : "s"}` : "";
  const reviewWebsite = () => { void onAnalyzeWebsite(website.trim()).then((suggestion) => { if (!suggestion) return; setReviewedUrl(website.trim()); setFindings(suggestion.findings); setName(suggestion.name); setAccent(suggestion.accent); setInk(suggestion.ink); setPaper(suggestion.paper); setLogos(""); setSelectedAssetUrls([]); setAssetCandidates(suggestion.assetCandidates ?? suggestion.logos.map((url) => ({ url, kind: "logo" as const }))); setHeadingFont(suggestion.fontCandidates[0] ?? "system-ui"); setBodyFont(suggestion.fontCandidates[1] ?? suggestion.fontCandidates[0] ?? "system-ui"); setFontsConfirmed(false); setReferences(suggestion.references.join("\n")); setNegativeRules(suggestion.negativeRules.join("\n")); }); };
  const saveStyle = () => {
    const manualStyle: ManualStylePayload = { name: name.trim(), accent: accent.trim(), ink: ink.trim(), paper: paper.trim(), headingFont: headingFont.trim(), bodyFont: bodyFont.trim(), fontsConfirmed, selectedAssetUrls, logos: mode === "manual" ? splitLines(logos) : [], licensedFonts: fontsConfirmed ? [...new Set([headingFont.trim(), bodyFont.trim()].filter(Boolean))] : [], references: splitLines(references), negativeRules: splitLines(negativeRules), intentProfile: intent };
    if (mode === "website") {
      void onPost({ action: "lockWebsiteStyle", url: website.trim(), intentProfile: intent, manualStyle }).then((next) => next && onClose());
      return;
    }
    void onPost({ action: "lockManualStyle", manualStyle }).then((next) => next && onClose());
  };
  const useSavedStyle = (entry: StyleLibraryEntry) => { void onPost({ action: "applyStyleLibrary", styleLibraryId: entry.id, intentProfile: entry.intentProfile }).then((next) => next && onClose()); };

  const intents: { id: ManualStylePayload["intentProfile"]; title: string; detail: string }[] = [
    { id: "client_facing_pitch", title: "Client pitch", detail: "Bold headlines and generous space" },
    { id: "board_deck", title: "Board presentation", detail: "Conservative layouts and dense evidence" },
    { id: "internal_workshop", title: "Team workshop", detail: "Fast to scan and action focused" },
  ];
  const toggleAsset = (url: string) => setSelectedAssetUrls((current) => current.includes(url) ? current.filter((candidate) => candidate !== url) : [...current, url].slice(0, 3));

  return <SideSheet title="Style" onClose={onClose}><p className="sheet-intro">{analysisSuggestion ? `We found this on ${new URL(analysisSuggestion.referenceUrl).hostname}. Keep what is right.` : "Use one visual system across every Output."}</p>
    {library.length > 0 && <fieldset className="style-options"><legend>Saved styles</legend><ListGroup>{library.map((entry) => <ListRow className="style-choice" key={entry.id}><ListRowAction aria-label={`Use saved style ${entry.name}, version ${entry.revision}`} disabled={busy || style?.libraryId === entry.id} onClick={() => useSavedStyle(entry)}><div className="palette-preview compact" data-domain-ui="palette-preview"><i style={{ background: entry.accent }} /><i style={{ background: entry.ink }} /><i style={{ background: entry.paper }} /></div><span><strong>{entry.name}</strong><small>{entry.intentProfile === "board_deck" ? "Board presentation" : entry.intentProfile === "internal_workshop" ? "Team workshop" : "Client pitch"} · Version {entry.revision}</small></span></ListRowAction></ListRow>)}</ListGroup></fieldset>}
    {!showCreator ? <Button variant="secondary" onClick={() => setShowCreator(true)}>Create another style</Button> : <><fieldset className="style-options"><legend>Start from</legend><ListGroup><ListRow className={`style-choice ${mode === "website" ? "selected" : ""}`}><ListRowAction aria-pressed={mode === "website"} onClick={() => setMode("website")}><span><strong>Website</strong><small>Pull the public visual foundation</small></span></ListRowAction></ListRow><ListRow className={`style-choice ${mode === "manual" ? "selected" : ""}`}><ListRowAction aria-pressed={mode === "manual"} onClick={() => setMode("manual")}><span><strong>Set manually</strong><small>Enter exact brand rules yourself</small></span></ListRowAction></ListRow></ListGroup></fieldset>
    {mode === "website" && <Input label="Website" type="url" placeholder="https://example.com" value={website} onChange={(event) => { setWebsite(event.target.value); setReviewedUrl(""); setFindings(null); setAssetCandidates([]); setSelectedAssetUrls([]); }} />}
    {reviewed && <><Input label="Name" value={name} onChange={(event) => setName(event.target.value)} /><div className="style-color-grid"><Input label="Accent" hint="Primary actions and emphasis" value={accent} onChange={(event) => setAccent(event.target.value)} /><Input label="Text" hint="Headlines and body copy" value={ink} onChange={(event) => setInk(event.target.value)} /><Input label="Background" hint="Slides and work surfaces" value={paper} onChange={(event) => setPaper(event.target.value)} /></div><section className="typography-review" aria-labelledby="typography-heading"><div><strong id="typography-heading">Typography</strong><small>{fontsConfirmed ? "Available for generated work" : mode === "website" ? "Found on the website · usage not verified" : headingFont === "system-ui" && bodyFont === "system-ui" ? "System type is always available" : "Custom type · usage not confirmed"}</small></div><div className="style-type-grid"><Input label="Heading" value={headingFont} onChange={(event) => setHeadingFont(event.target.value)} /><Input label="Body" value={bodyFont} onChange={(event) => setBodyFont(event.target.value)} /></div>{(headingFont !== "system-ui" || bodyFont !== "system-ui") && <label className="font-confirmation"><Checkbox checked={fontsConfirmed} onChange={(event) => setFontsConfirmed(event.target.checked)} /><span>I can use these fonts in generated work</span></label>}</section>{mode === "website" && assetCandidates.length > 0 && <fieldset className="brand-asset-review"><legend>Brand asset</legend><p>Select only an asset you are allowed to use. WorkshopLM validates and saves a local copy when you save this Style.</p><div className="brand-asset-grid">{assetCandidates.map((candidate) => <label className={selectedAssetUrls.includes(candidate.url) ? "brand-asset-candidate selected" : "brand-asset-candidate"} key={candidate.url}><Checkbox aria-label={`Use logo from ${new URL(candidate.url).hostname}`} checked={selectedAssetUrls.includes(candidate.url)} onChange={() => toggleAsset(candidate.url)} /><img alt="Logo candidate" src={`/api/workshop/brand-preview?url=${encodeURIComponent(candidate.url)}`} /><span>Logo</span></label>)}</div></fieldset>}{findings && <p className="style-findings" role="status">Found {findingSummary}. Review it before using this Style.</p>}{showDetails ? <div className="style-details">{mode === "manual" && <TextArea label="Local logo or brand asset" hint="One local path per line" value={logos} onChange={(event) => setLogos(event.target.value)} />}<TextArea label="Visual references" hint="One rule or reference per line" value={references} onChange={(event) => setReferences(event.target.value)} /><TextArea label="Avoid" hint="One negative rule per line" value={negativeRules} onChange={(event) => setNegativeRules(event.target.value)} /></div> : <Button variant="secondary" size="small" onClick={() => setShowDetails(true)}>{style ? "Edit brand details" : mode === "website" ? "Review brand details" : "Add brand details"}</Button>}</>}
    <fieldset className="style-options"><legend>Use it for</legend><ListGroup>{intents.map((profile) => <ListRow className={`style-choice ${intent === profile.id ? "selected" : ""}`} key={profile.id}><ListRowAction aria-pressed={intent === profile.id} onClick={() => setIntent(profile.id)}><span><strong>{profile.title}</strong><small>{profile.detail}</small></span></ListRowAction></ListRow>)}</ListGroup></fieldset>
    {reviewed && <div className="style-preview"><div className="palette-preview" data-domain-ui="palette-preview"><i title={`Accent ${accent}`} style={{ background: accent }} /><i title={`Text ${ink}`} style={{ background: ink }} /><i title={`Background ${paper}`} style={{ background: paper }} /></div><div className="type-preview" data-domain-ui="type-preview"><strong>Aa</strong><span>{fontsConfirmed || headingFont === "system-ui" ? headingFont : "System fallback"} · {fontsConfirmed ? "confirmed" : headingFont === "system-ui" ? "available" : "candidate not used until confirmed"}</span></div></div>}{mode === "website" && !reviewed ? <Button disabled={busy || !website.trim()} onClick={reviewWebsite}>Review style</Button> : (!locked || dirty) && <Button disabled={busy || !name.trim() || !accent.trim() || !ink.trim() || !paper.trim() || !headingFont.trim() || !bodyFont.trim()} onClick={saveStyle}>{locked ? "Save new version" : analysisSuggestion ? "Save company style" : "Use this style"}</Button>}</>}
  </SideSheet>;
}

function OutputsView({ state, onOpenOutput, onOpenStoryboard, onDismissOrientation }: { state: PersistedWorkshop | null; onOpenOutput: (id: string) => void; onOpenStoryboard: () => void; onDismissOrientation: () => void }) {
  const outputs = [...(state?.outputs ?? [])].sort((left, right) => left.type === right.type
    ? right.createdAt.localeCompare(left.createdAt)
    : left.type === "deck" ? -1 : 1);
  const videos = [...(state?.videos ?? [])].sort((left, right) => right.version - left.version);
  const generatedImages = state?.imageBatch?.panels.filter((panel) => panel.state === "generated").length ?? 0;
  const failedImages = state?.imageBatch?.panels.filter((panel) => panel.state === "failed").length ?? 0;
  const ready = Boolean(state?.briefApproved && state.style && !state.style.stale);
  const outputStatus = outputSetStatus(state);
  const partial = outputStatus.incomplete;
  const needsUpdate = outputStatus.stale;
  const heroDeckId = outputs.find((output) => output.type === "deck")?.id;
  return <article className="outputs-view">
    <h1 className="visually-hidden">Outputs</h1>
    {!ready ? <StateMessage state="empty" title="Choose a Style">Your Brief is ready. Add a Style to create Outputs.</StateMessage> : <>
      {!state?.onboarding.outputsOrientationDismissed && heroDeckId && <Card className="outputs-orientation"><div><strong>Your presentation is ready.</strong><p>Show source traces a claim back to its material. The Storyboard is your second and final approval before Video.</p></div><div className="button-row"><Button variant="secondary" size="small" onClick={() => onOpenOutput(heroDeckId)}>Open presentation</Button><Button variant="secondary" size="small" onClick={onDismissOrientation}>Got it</Button></div></Card>}
      {(state?.outputs.length ?? 0) === 0 && !state?.imageBatch && <StateMessage state="empty" title="Create your first Outputs">Turn this Brief into a presentation, infographic, image set, and Storyboard.</StateMessage>}
      {partial && !needsUpdate && <StateMessage state="partial" title="Some Outputs are ready">Review what is finished, then update Outputs to complete the set.</StateMessage>}
      {needsUpdate && <StateMessage state="needs-update" title="Outputs need an update">Your Sources, Brief, or Style changed. Update Outputs before sharing them.</StateMessage>}
      <section className="output-grid">{outputs.map((output) => {
        const versions = outputs.filter((item) => item.type === output.type).length;
        const version = outputVersion(output, state?.outputs ?? []);
        const sources = outputSourceCount(output, state);
        const name = `${outputTitle(output.type)}${versions > 1 ? `, version ${version}` : ""}`;
        const isHero = output.id === heroDeckId;
        return <EntityCardAction className={`output-card ${isHero ? "output-card--hero" : ""} ${output.stale ? "needs-update" : ""}`} data-output-role={isHero ? "hero" : "supporting"} key={output.id} aria-label={`Open ${name}`} onClick={() => onOpenOutput(output.id)}><div className="artifact-preview" data-domain-ui="artifact-preview"><iframe title={`${name} preview`} sandbox="allow-same-origin" src={`/api/workshop/artifacts/${output.id}`} /></div><div className="output-card-body"><h2>{outputTitle(output.type)}</h2><div className="output-meta"><span>{outputType(output.type)} · Version {version}</span><Status tone={output.stale ? "waiting" : "current"}>{output.stale ? "Needs update" : "Up to date"}</Status><span>{sources} {sources === 1 ? "source" : "sources"}</span></div></div></EntityCardAction>;
      })}
      {state?.imageBatch && <EntityCardAction className={`output-card ${state.imageBatch.stale ? "needs-update" : ""}`} aria-label="Open Image set" onClick={() => onOpenOutput("images")}><div className="artifact-preview image-contact-sheet" data-domain-ui="artifact-preview">{state.imageBatch.panels.map((panel, index) => <div className={`image-tile ${panel.state === "generated" ? "generated" : ""}`} data-domain-ui="image-tile" key={panel.id} style={{ "--tile": index } as CSSProperties}>{panel.state === "generated" && <img alt="" src={`/api/workshop/artifacts/${panel.id}`} />}<span>{String(index + 1).padStart(2, "0")}</span></div>)}</div><div className="output-card-body"><h2>Image set</h2><div className="output-meta"><span>{state.imageBatch.panels.length} images</span><Status tone={state.imageBatch.stale || failedImages ? "waiting" : generatedImages === state.imageBatch.panels.length ? "current" : "waiting"}>{state.imageBatch.stale ? "Needs update" : failedImages ? "Incomplete" : generatedImages === state.imageBatch.panels.length ? "Up to date" : "Planned"}</Status><span>{state?.activeSourceIds.length ?? 0} sources</span></div></div></EntityCardAction>}
      {(state?.storyboard.panels.length ?? 0) > 0 && <EntityCardAction className={`output-card ${state?.storyboard.stale ? "needs-update" : ""}`} aria-label="Open Storyboard" onClick={onOpenStoryboard}><div className="artifact-preview storyboard-card-preview" data-domain-ui="artifact-preview">{state?.storyboard.panels.slice(0, 6).map((panel, index) => { const image = boundImage(panel, state?.imageBatch); return <div className={`storyboard-card-frame ${image ? "has-image" : ""}`} key={panel.id} style={{ "--panel": index } as CSSProperties}>{image && <img alt="" src={`/api/workshop/artifacts/${image.id}`} />}<span>{String(index + 1).padStart(2, "0")}</span><strong>{panel.title}</strong></div>; })}</div><div className="output-card-body"><h2>Storyboard</h2><div className="output-meta"><span>{state?.storyboard.panels.length ?? 0} panels</span><Status tone={state?.storyboard.stale ? "waiting" : "current"}>{state?.storyboard.stale ? "Needs update" : state?.storyboardApproved ? "Approved" : "Ready for review"}</Status><span>{state?.activeSourceIds.length ?? 0} sources</span></div></div></EntityCardAction>}
      {videos.map((video) => <EntityCardAction className={`output-card ${video.stale ? "needs-update" : ""}`} key={video.id} aria-label={`Open Demo video, version ${video.version}`} onClick={() => onOpenOutput(video.id)}><div className="artifact-preview" data-domain-ui="artifact-preview"><video muted src={`/api/workshop/artifacts/${video.id}`} /></div><div className="output-card-body"><h2>Demo video</h2><div className="output-meta"><span>Video · Version {video.version}</span><Status tone={video.stale ? "waiting" : "current"}>{video.stale ? "Needs update" : "Up to date"}</Status><span>{state?.activeSourceIds.length ?? 0} sources · Storyboard {video.storyboardVersion}</span></div></div></EntityCardAction>)}</section>
    </>}
  </article>;
}

function imagePanelCopy(prompt: string, index: number) {
  const role = prompt.match(/Output role:\s*([^.]+)\./)?.[1]?.trim() ?? `Image ${index + 1}`;
  const idea = prompt.match(/Approved idea to communicate:\s*(.+?)\.\s+Preserve/)?.[1]?.trim() ?? "Grounded in the approved Brief.";
  return { role, idea };
}

function FocusedOutputView({ state, outputId, busy, onShowSource, onShowOriginal, onRequestReplacement }: { state: PersistedWorkshop | null; outputId: string; busy: boolean; onShowSource: (target?: EvidenceTarget) => void; onShowOriginal: () => void; onRequestReplacement: (panelId: string) => Promise<void> }) {
  const output = state?.outputs.find((item) => item.id === outputId);
  const isVideo = outputId === "video" || outputId.startsWith("video-v");
  const video = isVideo ? (outputId === "video" ? state?.videos?.find((item) => !item.stale) : state?.videos?.find((item) => item.id === outputId)) : undefined;
  const isImages = outputId === "images";
  const title = output ? outputTitle(output.type) : isImages ? "Image set" : "Demo video";
  const sourceCount = output ? outputSourceCount(output, state) : state?.activeSourceIds.length ?? 0;
  const detail = output
    ? `${outputType(output.type)} · Version ${outputVersion(output, state?.outputs ?? [])} · ${sourceCount} ${sourceCount === 1 ? "source" : "sources"}`
    : isImages ? `${state?.imageBatch?.panels.length ?? 0} images · ${sourceCount} ${sourceCount === 1 ? "source" : "sources"}` : `Video · Version ${video?.version ?? 1} · ${sourceCount} ${sourceCount === 1 ? "source" : "sources"}`;
  const artifactClaims = claimsForArtifact(output?.claimIds ?? video?.claimIds ?? [], state?.claims ?? []);
  const outputClaim = artifactClaims[0];
  const href = `/api/workshop/artifacts/${outputId}`;
  if (!output && (!isVideo || !video) && !isImages) return <div className="state-surface"><StateMessage state="error" title="Couldn't open Output">Return to Outputs and try opening it again.</StateMessage></div>;
  if (isImages) return <article className="focused-output"><div className="focused-output-heading"><div className="focused-output-context"><h1>{title}</h1><p>{detail} · One shared Style</p>{state?.imageBatch?.stale && <Status tone="waiting">Needs update</Status>}</div></div><div className="focused-image-grid" data-domain-ui="image-review-grid">{state?.imageBatch?.panels.map((panel, index) => {
    const { role, idea } = imagePanelCopy(panel.prompt, index);
    const status = panel.state === "generated" ? "Ready" : panel.state === "failed" ? "Couldn't create" : panel.state === "selected_for_regeneration" ? "Replacement requested" : "Planned";
    const preview = <div className={`focused-image-preview ${panel.state}`} data-domain-ui="image-tile">{panel.state === "generated" ? <img alt={`${role}: ${idea}`} src={`/api/workshop/artifacts/${panel.id}`} /> : <span>{String(index + 1).padStart(2, "0")}</span>}</div>;
    const evidence = panel.evidence[0];
    return <section className="focused-image-card" key={panel.id} aria-label={role}>{panel.state === "generated" ? <a href={`/api/workshop/artifacts/${panel.id}`} target="_blank" rel="noreferrer" aria-label={`Open ${role}`}>{preview}</a> : preview}<div className="focused-image-caption"><strong>{role}</strong><Status tone={panel.state === "generated" ? "current" : "waiting"}>{status}</Status></div><p>{idea}</p><div className="focused-image-actions"><Button variant="secondary" size="small" onClick={() => onShowSource({ sourceId: evidence?.sourceId, claimId: evidence?.claimId, locator: evidence?.locator })}>Show source</Button>{panel.state !== "planned" && <Button variant="secondary" size="small" disabled={busy || panel.state === "selected_for_regeneration"} onClick={() => { void onRequestReplacement(panel.id); }}>{panel.state === "selected_for_regeneration" ? "Requested" : "Request replacement"}</Button>}</div></section>;
  })}</div></article>;
  return <article className="focused-output"><div className="focused-output-heading"><div className="focused-output-context"><h1>{title}</h1><p>{detail}</p>{(output?.stale || video?.stale) && <Status tone="waiting">Needs update</Status>}</div><div className="button-row">{outputClaim && <Button size="small" onClick={() => onShowSource({ sourceId: outputClaim.sourceId, claimId: outputClaim.id, locator: outputClaim.locator })}>Show source</Button>}{isVideo && <Button variant="secondary" size="small" onClick={onShowOriginal}>Show original</Button>}{output?.editableRelativePath && <ButtonLink variant="secondary" size="small" href={`${href}?format=editable`}>Download PowerPoint</ButtonLink>}<ButtonLink variant="secondary" size="small" href={href} target="_blank" rel="noreferrer">{isVideo ? "Open video" : "Open preview"}</ButtonLink></div></div><div className={`focused-output-preview ${isVideo ? "video-preview" : ""}`} data-domain-ui="artifact-preview">{isVideo ? <video controls src={href} /> : <iframe title={title} sandbox="allow-same-origin" src={href} />}</div>{artifactClaims.length > 0 && <section className="artifact-source-trail" aria-labelledby="artifact-source-heading"><div><h2 id="artifact-source-heading">Sources in this output</h2><p>Select a claim to see the exact source text.</p></div><ListGroup>{artifactClaims.map((claim) => <ListRowAction key={claim.id} aria-label={`Show source for ${claim.text}`} onClick={() => onShowSource({ sourceId: claim.sourceId, claimId: claim.id, locator: claim.locator })}><span><strong>{claim.text}</strong><small>{claim.locator}</small></span></ListRowAction>)}</ListGroup></section>}</article>;
}

function OriginalRevealSheet({ state, onClose }: { state: PersistedWorkshop | null; onClose: () => void }) {
  const segment = state?.transcriptSegments?.[0];
  const source = state?.sourceItems.find((item) => /brainstorm|transcript/i.test(item.title)) ?? state?.sourceItems[0];
  const original = segment?.text ?? source?.excerpt ?? "No brainstorm transcript is attached to this Workshop yet.";
  const sourceKind = segment ? (segment.transport === "webrtc" ? "Realtime transcript" : "Recorded fixture transcript") : "Sanitized source excerpt";
  const sourceLocator = segment ? new Date(segment.capturedAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : source?.locator;
  const elapsedSeconds = state?.firstTranscriptAt && state.firstRenderedOutputAt
    ? Math.max(0, Math.round((Date.parse(state.firstRenderedOutputAt) - Date.parse(state.firstTranscriptAt)) / 1000))
    : null;
  const currentVideo = [...(state?.videos ?? [])].reverse().find((video) => !video.stale);
  const deliverables = [
    { title: "Presentation", detail: `${state?.outputs.filter((output) => output.type === "deck").length ?? 0} version${state?.outputs.filter((output) => output.type === "deck").length === 1 ? "" : "s"}` },
    { title: "Infographic", detail: `${state?.outputs.filter((output) => output.type === "infographic").length ?? 0} version${state?.outputs.filter((output) => output.type === "infographic").length === 1 ? "" : "s"}` },
    { title: "Image set", detail: `${state?.imageBatch?.panels.length ?? 0} ${state?.imageBatch?.panels.every((panel) => panel.state === "generated") ? "ready" : "planned"} images` },
    { title: "Storyboard", detail: `${state?.storyboard.panels.length ?? 0} editable panels` },
    { title: "Demo video", detail: currentVideo ? `Version ${currentVideo.version} ready` : state?.videos?.length ? `${state.videos.length} saved · Needs update` : "Not created yet" },
  ];

  return <SideSheet title="Original brainstorm" className="original-reveal" onClose={onClose}>
    <p className="sheet-intro">The finished submission started with this.</p>
    <Card className="original-transcript"><small>Before · {sourceKind}</small><blockquote>“{original}”</blockquote>{sourceLocator && <p className="source-locator">{sourceLocator}</p>}</Card>
    <div className="original-result"><small>After</small><h3>Became five connected Outputs</h3>{elapsedSeconds !== null && <p>{elapsedSeconds} seconds from first transcript to first rendered Output</p>}</div>
    <ListGroup>{deliverables.map((item) => <ListRow className="original-output-row" key={item.title}><FileIcon /><span><strong>{item.title}</strong><small>{item.detail}</small></span></ListRow>)}</ListGroup>
    {currentVideo?.buildTrace && <ButtonLink variant="secondary" href={`/api/workshop/artifacts/build-trace-v${currentVideo.version}`} target="_blank" rel="noreferrer">How this was built</ButtonLink>}
  </SideSheet>;
}

function ConversationView({ state, busy, streamingReply, realtimeContinuation, onRealtimeContinuationSent, onSend, onVoiceSave, onVoiceToolEvent, onConfirmTool, onShowSource }: { state: PersistedWorkshop | null; busy: boolean; streamingReply: string; realtimeContinuation?: Record<string, unknown>; onRealtimeContinuationSent: () => void; onSend: (text: string) => Promise<boolean>; onVoiceSave: (text: string, capture: { transport: "webrtc"; model: "gpt-realtime-2.1"; transcriptionModel: "gpt-realtime-whisper"; itemIds: string[]; eventIds: string[]; assistant?: { text: string; responseId: string; eventIds: string[] } }) => Promise<boolean>; onVoiceToolEvent: (event: unknown) => Promise<Record<string, unknown> | undefined>; onConfirmTool: (call: ConversationToolCall) => Promise<boolean>; onShowSource: (target?: EvidenceTarget) => void }) {
  const [draft, setDraft] = useState("");
  const [voiceOpen, setVoiceOpen] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);
  const turns = state?.conversationTurns ?? [];
  const toolCalls = state?.toolCalls ?? [];
  const confirmedProviderCalls = new Set(toolCalls.filter((call) => call.explicitUserIntent && call.provider?.callId).map((call) => `${call.channel}:${call.provider!.callId}`));
  const visibleToolCalls = toolCalls.filter((call) => !(call.provider?.callId && !call.explicitUserIntent && call.result.summary.includes("requires explicit user intent") && confirmedProviderCalls.has(`${call.channel}:${call.provider.callId}`)));
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
    <header className="conversation-heading"><div><h1>Work with your sources</h1><p>{state?.activeSourceIds.length ?? 0} selected · answers stay linked to evidence</p></div></header>
    <div className="conversation-thread" aria-live="polite">
      {!timeline.length && <div className="conversation-empty"><h2>What should we make clear?</h2><p>Ask a question across the selected Sources. Voice capture adds your spoken thought as a private Source before WorkshopLM responds.</p><div className="conversation-prompts"><Button variant="secondary" size="small" onClick={() => setDraft("What is the strongest recommendation in these sources?")}>Find the recommendation</Button><Button variant="secondary" size="small" onClick={() => setDraft("What evidence should lead the presentation?")}>Find the lead evidence</Button></div></div>}
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
  fetch: "Opened source evidence",
  workshop_get_trace: "Checked source trace",
  workshop_set_source_scope: "Updated selected sources",
  workshop_approve_brief: "Approved Brief",
  workshop_create_output: "Created an Output",
  workshop_approve_storyboard: "Approved Storyboard",
  workshop_render_video: "Started Video creation",
};
const TOOL_CONFIRM_LABELS: Record<string, string> = {
  workshop_set_source_scope: "Update sources",
  workshop_approve_brief: "Approve Brief",
  workshop_create_output: "Create Output",
  workshop_approve_storyboard: "Approve Storyboard",
  workshop_render_video: "Create Video",
};
const TOOL_FAILURE_MESSAGES: Record<string, string> = {
  search: "WorkshopLM couldn't search the selected Sources. Try asking again.",
  fetch: "That source excerpt isn't available in the selected Sources.",
  workshop_get_trace: "That Output's source trace isn't available.",
  workshop_set_source_scope: "The selected Sources changed. Review them and try again.",
  workshop_approve_brief: "The Map changed. Review the current Map before approving the Brief.",
  workshop_create_output: "The Brief or Style changed. Review them before creating this Output.",
  workshop_approve_storyboard: "The Storyboard changed. Review the current panels before approval.",
  workshop_render_video: "Approve the current Storyboard before creating the Video.",
};
function ToolActivity({ call, confirmed, busy, onConfirm }: { call: ConversationToolCall; confirmed: boolean; busy: boolean; onConfirm: (call: ConversationToolCall) => Promise<boolean> }) {
  const channel = call.channel === "realtime" ? "Voice" : call.channel === "responses" ? "Chat" : "Plugin";
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

function SourcesRail({ open, sources, activeIds, selected, pending, busy, conversationActive, onConversation, onSelect, onToggle, onApplyScope, onCancelScope, onCollapse, onAdd, onShowMap }: { open: boolean; sources: SourceItem[]; activeIds: string[]; selected: SourceItem | null; pending: PendingSourceScope | null; busy: boolean; conversationActive: boolean; onConversation: () => void; onSelect: (source: SourceItem) => void; onToggle: (id: string) => void; onApplyScope: () => void; onCancelScope: () => void; onCollapse: () => void; onAdd: () => void; onShowMap: (source: SourceItem) => void }) {
  const active = selected ?? sources[0];
  return <WorkbenchRail side="left" className="sources-rail" aria-label="Sources" data-collapsed={!open || undefined}>
    <header className={`rail-heading ${open ? "" : "rail-heading--collapsed"}`}>{open && <div><strong>Sources</strong><small>{activeIds.length} of {sources.length} selected</small></div>}<div className="rail-actions">{open && <IconButton label="Add material" onClick={onAdd}><PlusIcon /></IconButton>}<IconButton label={open ? "Collapse Sources" : "Expand Sources"} aria-expanded={open} onClick={onCollapse}><span className={open ? "" : "rail-chevron rail-chevron--right"}><ArrowLeftIcon /></span></IconButton></div></header>
    {!open ? null : <>
    <ListRow className={`conversation-entry ${conversationActive ? "selected" : ""}`}><ListRowAction aria-current={conversationActive ? "page" : undefined} onClick={onConversation}><span><strong>Conversation</strong><small>Ask across selected Sources</small></span></ListRowAction></ListRow>
    {pending && <SourceScopeImpact pending={pending} busy={busy} onApply={onApplyScope} onCancel={onCancelScope} />}
    {sources.length ? <ListGroup className="rail-source-list">{sources.map((source) => <ListRow className={active?.id === source.id ? "source-row selected" : "source-row"} key={source.id}><Checkbox aria-label={`Use ${source.title}`} checked={activeIds.includes(source.id)} onChange={() => onToggle(source.id)} /><ListRowAction onClick={() => onSelect(source)}><FileIcon label={source.type} /><span><strong>{source.title}</strong><small>{source.claimCount} claims</small></span></ListRowAction></ListRow>)}</ListGroup> : <p className="rail-empty">Add a meeting, document, or conversation.</p>}
    {active && <section className="rail-source-preview" aria-label={`Selected source: ${active.title}`}><strong>{active.title}</strong><p>“{active.excerpt}”</p><small>{active.locator}</small><Button variant="secondary" size="small" onClick={() => onShowMap(active)}>Show on map</Button></section>}
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
  const generatedImages = state?.imageBatch?.panels.filter((panel) => panel.state === "generated").length ?? 0;
  const failedImageCount = state?.imageBatch?.panels.filter((panel) => panel.state === "failed").length ?? 0;
  const pendingImageCount = state?.imageBatch?.panels.filter((panel) => panel.state === "planned" || panel.state === "selected_for_regeneration").length ?? 0;
  const briefReady = Boolean(state?.briefApproved && !state.frame?.stale);
  const styleReady = Boolean(state?.style && !state.style.stale);
  const hasOutputs = Boolean(deck || infographic || state?.imageBatch || state?.storyboard.panels.length || currentVideo);
  const deliverStatus = !briefReady ? "Blocked by Brief" : !styleReady ? "Choose Style" : hasOutputs ? outputSetStatus(state).actionRequired ? "Needs update" : "In progress" : "Ready";

  return <WorkbenchRail side="right" className="production-rail" aria-label="Production" data-collapsed={!open || undefined}>
    <header className={`rail-heading ${open ? "" : "rail-heading--collapsed"}`}>{open && <div><strong>Production</strong><small>From thinking to finished work</small></div>}<div className="rail-actions"><IconButton label={open ? "Collapse Production" : "Expand Production"} aria-expanded={open} onClick={onCollapse}><span className={open ? "rail-chevron rail-chevron--right" : ""}><ArrowLeftIcon /></span></IconButton></div></header>
    {!open ? null : <>
    <section className="stage-progress" aria-label="Workshop progress">
      <ListRowAction aria-current={view === "conversation" ? "step" : undefined} onClick={() => onOpenView("conversation")}><span><strong>Capture</strong><small>{state?.activeSourceIds.length ?? 0} active sources</small></span><Status tone={(state?.activeSourceIds.length ?? 0) > 0 ? "current" : "waiting"}>{(state?.activeSourceIds.length ?? 0) > 0 ? "Ready" : "Start"}</Status></ListRowAction>
      <ListRowAction aria-current={view === "map" || view === "brief" ? "step" : undefined} onClick={() => onOpenView(briefReady ? "brief" : "map")}><span><strong>Shape</strong><small>Map and Brief</small></span><Status tone={briefReady ? "current" : "waiting"}>{briefReady ? "Approved" : "Needs review"}</Status></ListRowAction>
      <ListRowAction aria-label={hasOutputs ? "View outputs" : "Open Deliver"} aria-current={view === "outputs" || view === "storyboard" || view === "output" ? "step" : undefined} onClick={() => onOpenView(hasOutputs ? "outputs" : "brief")}><span><strong>Deliver</strong><small>Style and Outputs</small></span><Status tone={hasOutputs && !outputSetStatus(state).actionRequired ? "current" : "waiting"}>{deliverStatus}</Status></ListRowAction>
    </section>
    <section className="next-action" aria-label="Next action"><small>Next</small>{action}</section>
    <ListGroup className="production-list">
      <ProductionItem title="Brief" detail={briefReady ? `Version ${state?.frame?.version ?? 1}` : "Map sign-off"} status={state?.frame?.stale ? "Needs update" : briefReady ? "Approved" : "Needs review"} tone={briefReady && !state?.frame?.stale ? "current" : "waiting"} onClick={() => onOpenView(briefReady ? "brief" : "map")} ariaLabel={briefReady ? "View brief" : "Review Brief"} />
      <ProductionItem title="Style" detail={styleReady ? state?.style?.name ?? "Company Style" : "Company and intent"} status={state?.style?.stale ? "Needs update" : styleReady ? "Ready" : "Not selected"} tone={styleReady ? "current" : "waiting"} onClick={onOpenStyle} />
      <ProductionItem title="Presentation" detail={state?.outputRecovery?.deck?.message ?? (deck ? `Version ${outputVersion(deck, state?.outputs ?? [])}` : "Editable PowerPoint")} status={state?.outputRecovery?.deck ? "Couldn't create" : deck?.stale ? "Needs update" : deck ? "Up to date" : "Planned"} tone={deck && !deck.stale && !state?.outputRecovery?.deck ? "current" : "waiting"} onClick={deck ? () => onOpenOutput(deck.id) : undefined} />
      <ProductionItem title="Infographic" detail={state?.outputRecovery?.infographic?.message ?? "One-page visual"} status={state?.outputRecovery?.infographic ? "Couldn't create" : infographic?.stale ? "Needs update" : infographic ? "Up to date" : "Planned"} tone={infographic && !infographic.stale && !state?.outputRecovery?.infographic ? "current" : "waiting"} onClick={infographic ? () => onOpenOutput(infographic.id) : undefined} />
      <ProductionItem title="Image set" detail={state?.imageBatch ? failedImageCount ? `${failedImageCount} ${failedImageCount === 1 ? "image needs" : "images need"} attention` : pendingImageCount ? `${generatedImages} of ${state.imageBatch.panels.length} ready` : `${generatedImages} images ready` : "Six coherent visuals"} status={state?.imageBatch?.stale ? "Needs update" : failedImageCount ? "Partly ready" : state?.imageBatch && generatedImages === state.imageBatch.panels.length ? "Up to date" : state?.imageBatch ? "In progress" : "Planned"} tone={state?.imageBatch && !state.imageBatch.stale && !failedImageCount && generatedImages === state.imageBatch.panels.length ? "current" : "waiting"} onClick={state?.imageBatch ? () => onOpenOutput("images") : undefined} ariaLabel={failedImageCount ? "Review images that need attention" : "View Image set"} />
      <ProductionItem title="Storyboard" detail={state?.storyboard.panels.length ? `${state.storyboard.panels.length} editable panels` : "Review before Video"} status={state?.storyboard.stale ? "Needs update" : state?.storyboardApproved ? "Approved" : state?.storyboard.panels.length ? "Needs review" : "Planned"} tone={state?.storyboardApproved && !state.storyboard.stale ? "current" : "waiting"} onClick={state?.storyboard.panels.length ? () => onOpenView("storyboard") : undefined} ariaLabel="View storyboard" />
      <ProductionItem title="Video" detail={currentVideo ? `Version ${currentVideo.version}` : state?.videoState === "failed" || state?.videoState === "cancelled" ? state.videoRecovery?.message ?? "Your approved Storyboard is safe." : "From approved Storyboard"} status={currentVideo?.stale ? "Needs update" : currentVideo ? "Up to date" : state?.videoState === "queued" ? "Waiting" : state?.videoState === "rendering" ? "Creating" : state?.videoState === "failed" ? "Couldn't create" : state?.videoState === "cancelled" ? "Cancelled" : "Planned"} tone={currentVideo && !currentVideo.stale ? "current" : "waiting"} onClick={currentVideo ? () => onOpenOutput(currentVideo.id) : undefined} />
    </ListGroup>
    </>}
  </WorkbenchRail>;
}

function StoryboardView({ storyboard, imageBatch, approved, panel, busy, onSelect, onPost, onShowSource }: { storyboard?: PersistedWorkshop["storyboard"]; imageBatch?: PersistedWorkshop["imageBatch"]; approved: boolean; panel?: PersistedWorkshop["storyboard"]["panels"][number]; busy: boolean; onSelect: (id: string) => void; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null>; onShowSource: (target?: EvidenceTarget) => void }) {
  const [title, setTitle] = useState(panel?.title ?? "");
  const [narration, setNarration] = useState(panel?.narration ?? "");
  useEffect(() => { if (panel) { setTitle(panel.title); setNarration(panel.narration); } }, [panel]);
  const duration = (storyboard?.panels ?? []).reduce((sum, item) => sum + item.durationSeconds, 0);
  const dirty = Boolean(panel && (title.trim() !== panel.title || narration.trim() !== panel.narration));
  const image = panel ? boundImage(panel, imageBatch) : undefined;
  if (!storyboard?.panels.length) return <article className="storyboard-view"><h1 className="visually-hidden">Storyboard</h1><StateMessage state="empty" title="Create Outputs first">The Storyboard appears after WorkshopLM creates the Output set.</StateMessage></article>;
  return <article className="storyboard-view">
    <h1 className="visually-hidden">Storyboard</h1>
    <p className="storyboard-meta"><Status tone={approved ? "current" : "waiting"}>{approved ? "Approved" : "Ready for review"}</Status><span>{storyboard?.panels.length ?? 0} panels · {duration} seconds</span></p>
    <CarouselRow className="storyboard-strip">{(storyboard?.panels ?? []).map((item, index) => <button type="button" key={item.id} className={`film-frame ${item.id === panel?.id ? "selected" : ""}`} data-domain-ui="film-frame" style={{ "--panel": index } as CSSProperties} onClick={() => onSelect(item.id)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong><small>{item.durationSeconds}s</small></button>)}</CarouselRow>
    {panel && <Card className="panel-editor"><div className={`panel-visual ${image ? "has-image" : ""}`} data-domain-ui="panel-visual" style={{ "--panel": Math.max(0, storyboard?.panels.findIndex((item) => item.id === panel.id) ?? 0) } as CSSProperties}>{image && <img alt="" src={`/api/workshop/artifacts/${image.id}`} />}<div className="panel-visual-copy"><small>{image ? "Bound image" : "Style preview"}</small><span>{panel.title}</span><p>{panel.narration}</p></div></div><div className="panel-fields"><Input label="Panel title" value={title} onChange={(event) => setTitle(event.target.value)} /><TextArea label="Narration" value={narration} onChange={(event) => setNarration(event.target.value)} /><div className="button-row">{dirty && <Button variant="secondary" disabled={busy || !title.trim() || !narration.trim()} onClick={() => { void onPost({ action: "updateStoryboardPanel", panel: { id: panel.id, title: title.trim(), narration: narration.trim(), durationSeconds: panel.durationSeconds } }); }}>Save</Button>}<Button variant="secondary" size="small" onClick={() => { const evidence = panel.evidence[0]; onShowSource({ sourceId: evidence?.sourceId, claimId: evidence?.claimId, locator: evidence?.locator }); }}>Show source</Button></div></div></Card>}
  </article>;
}

function WorkshopsSheet({ workshops, busy, onClose, onSelect, onCreate, onHelp }: { workshops: WorkshopSummary[]; busy: boolean; onClose: () => void; onSelect: (workshopId: string) => void; onCreate: (title: string) => Promise<boolean>; onHelp: () => void }) {
  const [title, setTitle] = useState("");
  return <SideSheet title="Workshops" onClose={onClose}>
    <p className="sheet-intro">Keep each project, its Sources, and its Outputs together.</p>
    <ListGroup>{workshops.map((workshop) => <ListRow className={workshop.active ? "workshop-row selected" : "workshop-row"} key={workshop.id}><ListRowAction disabled={busy || workshop.active} onClick={() => onSelect(workshop.id)}><span><strong>{workshop.title}</strong><small>{workshop.sources} {workshop.sources === 1 ? "source" : "sources"} · {workshop.outputs} {workshop.outputs === 1 ? "output" : "outputs"}{workshop.active ? " · Open" : ""}</small></span></ListRowAction></ListRow>)}</ListGroup>
    <div className="new-workshop"><Input label="New Workshop" placeholder="Project name" value={title} onChange={(event) => setTitle(event.target.value)} /><Button disabled={busy || !title.trim()} onClick={() => { void onCreate(title.trim()).then((created) => { if (created) setTitle(""); }); }}><PlusIcon /> Create</Button></div>
    <Button variant="secondary" size="small" onClick={onHelp}>How WorkshopLM works</Button>
  </SideSheet>;
}

function HowItWorksSheet({ onClose }: { onClose: () => void }) {
  const steps = [
    { title: "Capture", detail: "Talk, paste meeting notes, add a public page, or use a local PDF." },
    { title: "Shape", detail: "Organize the grounded Map and approve it as the Brief." },
    { title: "Deliver", detail: "Create the presentation and supporting Outputs, then approve the Storyboard before Video." },
  ];
  return <SideSheet title="How WorkshopLM works" onClose={onClose}>
    <p className="sheet-intro">From your meetings and documents to a deck you can defend, with every claim traced to its source.</p>
    <ListGroup>{steps.map((step) => <ListRow key={step.title}><div className="help-step"><strong>{step.title}</strong><small>{step.detail}</small></div></ListRow>)}</ListGroup>
    <Card className="help-trust"><strong>Stay in control</strong><p><b>Show source</b> traces factual work back to its material. Brief and Storyboard are the only two sign-offs.</p></Card>
  </SideSheet>;
}

function SourcesSheet({ sources, activeIds, selected, pending, busy, onClose, onSelect, onToggle, onApplyScope, onCancelScope, onAdd, onShowMap }: { sources: SourceItem[]; activeIds: string[]; selected: SourceItem | null; pending: PendingSourceScope | null; busy: boolean; onClose: () => void; onSelect: (source: SourceItem) => void; onToggle: (id: string) => void; onApplyScope: () => void; onCancelScope: () => void; onAdd: () => void; onShowMap: (source: SourceItem) => void }) {
  const active = selected ?? sources[0];
  return <SideSheet title="Sources" onClose={onClose}><div className="sheet-heading"><p>{activeIds.length} of {sources.length} selected</p><Button variant="secondary" onClick={onAdd}><PlusIcon /> Add source</Button></div>{pending && <SourceScopeImpact pending={pending} busy={busy} onApply={onApplyScope} onCancel={onCancelScope} />}<ListGroup>{sources.map((source) => <ListRow className={active?.id === source.id ? "source-row selected" : "source-row"} key={source.id}><Checkbox aria-label={`Use ${source.title}`} checked={activeIds.includes(source.id)} onChange={() => onToggle(source.id)} /><ListRowAction onClick={() => onSelect(source)}><FileIcon label={source.type} /><span><strong>{source.title}</strong><small>{source.origin} · {source.claimCount} claims</small></span></ListRowAction></ListRow>)}</ListGroup>{active && <Card className="source-preview"><strong>{active.title}</strong><p>“{active.excerpt}”</p><small>{active.locator}</small><Button variant="secondary" size="small" onClick={() => onShowMap(active)}>Show on map</Button></Card>}</SideSheet>;
}

function EvidenceSheet({ source, evidence, onClose, onShowMap }: { source: SourceItem; evidence: EvidenceSelection | null; onClose: () => void; onShowMap: () => void }) {
  return <SideSheet title="Source" onClose={onClose}><blockquote className="evidence-quote">“{evidence?.excerpt ?? source.excerpt}”</blockquote><p className="source-locator">{evidence?.locator ?? source.locator}</p><dl className="evidence-meta"><dt>Source</dt><dd>{source.title}</dd><dt>Origin</dt><dd>{source.origin}</dd></dl><Button onClick={onShowMap}>Show on map</Button></SideSheet>;
}

function AddSourceSheet({ onClose, onPost }: { onClose: () => void; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null> }) {
  const [title, setTitle] = useState("");
  const [source, setSource] = useState("");
  const kind = sourceInputKind(source);
  const add = () => {
    const value = source.trim();
    const body = kind === "url"
      ? { action: "ingestUrl", url: value }
      : kind === "pdf"
        ? { action: "ingestPdfFile", filePath: value, permission: "private" }
        : { action: "ingestSource", source: { title: title.trim() || sourceTitleFromText(value), origin: "Pasted notes", text: value, permission: "sanitized" } };
    void onPost(body).then((next) => next && onClose());
  };
  return <SideSheet title="Add source" onClose={onClose}><RealtimeCapture onSave={async (transcript, capture) => Boolean(await onPost({ action: "captureFallbackTranscript", text: transcript, capture }).then((next) => { if (next) onClose(); return next; }))} /><div className="source-divider"><span>or add material</span></div><p className="sheet-intro">Paste notes, a public website, or an absolute local PDF path.</p><TextArea label="Source" hint="Text, https://…, or /path/to/file.pdf" value={source} onChange={(event) => setSource(event.target.value)} />{kind === "text" && source.trim() && <Input label="Title (optional)" value={title} onChange={(event) => setTitle(event.target.value)} />}<Button disabled={!source.trim()} onClick={add}>Add source</Button></SideSheet>;
}

function Status({ children, tone = "current" }: { children: ReactNode; tone?: "current" | "waiting" }) {
  return <span className={`status status--${tone}`}>{children}</span>;
}
