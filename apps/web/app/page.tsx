"use client";

import {
  ArrowLeftIcon,
  Button,
  ButtonLink,
  Card,
  Carousel,
  CarouselRow,
  Checkbox,
  CloseIcon,
  EntityCard,
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
} from "@workshoplm/ui";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { RealtimeCapture } from "./realtime-capture";
import { ExcalidrawMap } from "./excalidraw-map";

type ObjectView = "map" | "brief" | "outputs" | "storyboard" | "output";
type Sheet = "sources" | "evidence" | "add-source" | "style" | null;
type SourceItem = { id: string; type: "TXT" | "PDF" | "WEB"; title: string; origin: string; claimCount: number; excerpt: string; locator: string; permission: "private" | "sanitized" | "shareable" };
type MapNode = { id: string; title: string; body: string; kind: "grounded" | "derived" | "creative"; locator: string; sourceId?: string; x: number; y: number; width: number; height: number };
type MapEdge = { id: string; from: string; to: string; kind: "supports" | "relates_to" | "depends_on" | "contradicts" | "contains"; label?: string };
type ManualStylePayload = { name: string; accent: string; ink: string; paper: string; logos: string[]; licensedFonts: string[]; references: string[]; negativeRules: string[]; intentProfile: "client_facing_pitch" | "board_deck" | "internal_workshop" };
type PersistedWorkshop = {
  title: string;
  briefApproved: boolean;
  storyboardApproved: boolean;
  videoState: "blocked" | "queued" | "rendering" | "rendered";
  sourceItems: SourceItem[];
  activeSourceIds: string[];
  claims?: { id: string; sourceId: string; chunkId: string; text: string; locator: string }[];
  mapNodes: MapNode[];
  mapEdges: MapEdge[];
  graphState?: string;
  frame?: { version: number; markdown: string; stale: boolean };
  style?: { version: number; name: string; accent: string; ink: string; paper: string; stale: boolean };
  assetPlan?: { version: number; stale: boolean; evidenceClaimIds: string[] };
  storyboard: { version: number; stale: boolean; panels: { id: string; title: string; narration: string; durationSeconds: number; approved: boolean; stale: boolean }[] };
  imageBatch?: { id: string; stale: boolean; panels: { id: string; version: number; prompt: string; state: "planned" | "selected_for_regeneration" | "generated" | "failed"; relativePath?: string }[] };
  outputs: { id: string; type: "deck" | "infographic"; stale: boolean; artifactPath: string; claimIds?: string[] }[];
};

const VIEW_TITLES: Record<ObjectView, string> = { map: "Map", brief: "Brief", outputs: "Outputs", storyboard: "Storyboard", output: "Output" };
const outputTitle = (type: "deck" | "infographic") => type === "deck" ? "Build Week presentation" : "Evidence infographic";

export default function WorkshopPage() {
  const [state, setState] = useState<PersistedWorkshop | null>(null);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");
  const [view, setView] = useState<ObjectView>("map");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [selectedSource, setSelectedSource] = useState<SourceItem | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState("");
  const [selectedOutputId, setSelectedOutputId] = useState("");
  const [notice, setNotice] = useState<{ message: string; tone: "status" | "error" } | null>(null);
  const [busy, setBusy] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => { void reload(); }, []);

  const selectedNode = useMemo(() => state?.mapNodes.find((node) => node.id === selectedNodeId), [state, selectedNodeId]);
  const selectedPanel = useMemo(() => state?.storyboard.panels.find((panel) => panel.id === selectedPanelId) ?? state?.storyboard.panels[0], [state, selectedPanelId]);
  const selectedOutput = useMemo(() => state?.outputs.find((output) => output.id === selectedOutputId), [state, selectedOutputId]);
  const canDeliver = Boolean(state?.briefApproved && state.style && !state.style.stale);
  const outputsNeedUpdate = Boolean(state?.outputs.some((output) => output.stale) || state?.assetPlan?.stale || state?.imageBatch?.stale || state?.imageBatch?.panels.some((panel) => panel.state === "failed" || panel.state === "selected_for_regeneration") || state?.storyboard.stale);

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

  async function post(body: Record<string, unknown>) {
    setBusy(true);
    setNotice(null);
    try {
      const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const next = await response.json() as PersistedWorkshop & { error?: string };
      if (!response.ok) throw new Error(next.error ?? "That action did not work");
      setState(next);
      return next;
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : "That action did not work", tone: "error" });
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

  function showSource(sourceId?: string) {
    const source = state?.sourceItems.find((item) => item.id === sourceId) ?? state?.sourceItems[0] ?? null;
    if (source) openSheet("evidence", source);
  }

  async function createOutputs() {
    if (!state?.outputs.some((output) => output.type === "deck" && !output.stale)) await post({ action: "generateOutput", outputType: "deck" });
    if (!state?.outputs.some((output) => output.type === "infographic" && !output.stale)) await post({ action: "generateOutput", outputType: "infographic" });
    if (!state?.imageBatch || state.imageBatch.stale || state.imageBatch.panels.some((panel) => panel.state === "failed" || panel.state === "selected_for_regeneration")) await post({ action: "createImageBatch" });
    await post({ action: "generateAssetPlan" });
    await post({ action: "generateStoryboard" });
    setNotice({ message: "Outputs created from your Brief, Style, and Sources.", tone: "status" });
    openView("outputs");
  }

  const sourceCount = state?.activeSourceIds.length ?? 0;
  const currentTitle = view === "output" ? (selectedOutput ? outputTitle(selectedOutput.type) : "Demo video") : VIEW_TITLES[view];
  const backTarget: ObjectView | null = view === "map" ? null : view === "brief" ? "map" : view === "outputs" ? "brief" : "outputs";

  return (
    <FullScreenShell className="workshop-shell">
      <NavigationHeader className="workshop-header">
        <div className="header-identity">
          {backTarget && <IconButton label={`Back to ${VIEW_TITLES[backTarget]}`} onClick={() => openView(backTarget)}><ArrowLeftIcon /></IconButton>}
          <div className="workshop-identity"><strong>{state?.title || "WorkshopLM"}</strong><span aria-hidden="true">/</span><b>{currentTitle}</b></div>
        </div>
        {loadState === "ready" && <div className="header-actions">
          <Button variant="secondary" size="small" onClick={() => openSheet("sources")}>{sourceCount} sources</Button>
          {view === "map" && Boolean(state?.mapNodes.length) && (state?.briefApproved && !state.frame?.stale
            ? <Button variant={sheet ? "secondary" : "primary"} onClick={() => openView("brief")}>View brief</Button>
            : <Button variant={sheet ? "secondary" : "primary"} disabled={busy || !state?.mapNodes.length} onClick={() => { void post({ action: "approveBrief" }).then((next) => next && openView("brief")); }}>Approve brief</Button>)}
          {view === "brief" && (canDeliver ? <Button onClick={() => openView("outputs")}>View outputs</Button> : <Button disabled={busy} onClick={() => openSheet("style")}>Choose style</Button>)}
          {view === "outputs" && ((state?.outputs.length ?? 0) === 0 || outputsNeedUpdate
            ? <Button disabled={busy || !canDeliver} onClick={() => { void createOutputs(); }}>{state?.outputs.length ? "Update outputs" : "Create outputs"}</Button>
            : (state?.storyboard.panels.length ?? 0) > 0 && <Button onClick={() => openView("storyboard")}>View storyboard</Button>)}
          {view === "storyboard" && (!state?.storyboardApproved
            ? <Button disabled={busy || state?.storyboard.stale || !state?.storyboard.panels.length} onClick={() => { void post({ action: "approveStoryboard" }); }}>Approve storyboard</Button>
            : <Button disabled={busy || state?.videoState === "queued" || state?.videoState === "rendering"} onClick={() => { void post({ action: "renderVideo" }); }}>{state?.videoState === "queued" || state?.videoState === "rendering" ? "Creating…" : "Create video"}</Button>)}
        </div>}
      </NavigationHeader>

      {notice && <Card className={`notice notice--${notice.tone}`} role={notice.tone === "error" ? "alert" : "status"}><span>{notice.message}</span><IconButton label="Dismiss" onClick={() => setNotice(null)}><CloseIcon /></IconButton></Card>}

      <section className="object-canvas" aria-label={currentTitle}>
        {loadState === "loading" && <StateMessage state="loading" title="Opening Workshop">Loading your Sources and work.</StateMessage>}
        {loadState === "error" && <StateMessage state="error" title="Couldn't open Workshop" action={<Button onClick={() => { void reload(); }}>Retry</Button>}>Your work is safe. Try opening it again.</StateMessage>}
        {loadState === "ready" && view === "map" && <MapCanvas state={state} selectedNode={selectedNode} busy={busy} onSelect={setSelectedNodeId} onSync={(canvasNodes) => { void post({ action: "syncMapCanvas", canvasNodes }); }} onUndo={() => { void post({ action: "undoMapOperation" }); }} onShowSource={showSource} onAddSource={() => openSheet("add-source")} />}
        {loadState === "ready" && view === "brief" && <BriefView state={state} onChooseStyle={() => openSheet("style")} onShowSource={showSource} />}
        {loadState === "ready" && view === "outputs" && <OutputsView state={state} onOpenOutput={openOutput} />}
        {loadState === "ready" && view === "storyboard" && <StoryboardView storyboard={state?.storyboard} approved={Boolean(state?.storyboardApproved)} panel={selectedPanel} busy={busy} onSelect={setSelectedPanelId} onPost={post} onShowSource={showSource} />}
        {loadState === "ready" && view === "output" && <FocusedOutputView state={state} outputId={selectedOutputId} onShowSource={showSource} />}
      </section>

      {sheet === "sources" && <SourcesSheet sources={state?.sourceItems ?? []} activeIds={state?.activeSourceIds ?? []} selected={selectedSource} onClose={closeSheet} onSelect={setSelectedSource} onToggle={(sourceId) => { const current = state?.activeSourceIds ?? []; const sourceIds = current.includes(sourceId) ? current.filter((id) => id !== sourceId) : [...current, sourceId]; void post({ action: "setActiveSourceScope", sourceIds }); }} onAdd={() => setSheet("add-source")} onShowMap={(source) => { setSelectedNodeId(state?.mapNodes.find((node) => node.sourceId === source.id)?.id ?? ""); openView("map"); }} />}
      {sheet === "evidence" && selectedSource && <EvidenceSheet source={selectedSource} onClose={closeSheet} onShowMap={() => { setSelectedNodeId(state?.mapNodes.find((node) => node.sourceId === selectedSource.id)?.id ?? ""); openView("map"); }} />}
      {sheet === "add-source" && <AddSourceSheet onClose={() => setSheet("sources")} onPost={post} />}
      {sheet === "style" && <StyleSheet style={state?.style} busy={busy} onClose={closeSheet} onPost={post} />}
    </FullScreenShell>
  );
}

function MapCanvas({ state, selectedNode, busy, onSelect, onSync, onUndo, onShowSource, onAddSource }: { state: PersistedWorkshop | null; selectedNode?: MapNode; busy: boolean; onSelect: (id: string) => void; onSync: (nodes: Pick<MapNode, "id" | "title" | "x" | "y" | "width" | "height">[]) => void; onUndo: () => void; onShowSource: (sourceId?: string) => void; onAddSource: () => void }) {
  const sources = (state?.sourceItems ?? []).filter((source) => state?.activeSourceIds.includes(source.id));
  const nodes = (state?.mapNodes ?? []).filter((node) => !node.sourceId || state?.activeSourceIds.includes(node.sourceId));
  const relatedSourceId = (node: MapNode, index: number) => node.sourceId ?? sources[index % Math.max(1, sources.length)]?.id;
  const selectedSourceId = selectedNode ? relatedSourceId(selectedNode, Math.max(0, nodes.indexOf(selectedNode))) : undefined;
  const source = sources.find((item) => item.id === selectedSourceId);
  const canUndo = Boolean(state?.graphState && !state.graphState.includes('"records":[]'));

  if (!nodes.length) return <div className="state-surface"><StateMessage state="empty" title="Start with a source" action={<Button onClick={onAddSource}>Add source</Button>}>Add a transcript, document, or website to shape your first Map.</StateMessage></div>;

  return <div className="map-canvas" data-domain-ui="map-canvas">
    <div className="map-caption" data-domain-ui="map-caption"><span>{nodes.length} ideas · Drag to organize · Double-click to edit</span>{canUndo && <Button variant="secondary" size="small" disabled={busy} onClick={onUndo}>Undo</Button>}</div>
    <ExcalidrawMap nodes={nodes} sources={sources} edges={state?.mapEdges ?? []} selectedNodeId={selectedNode?.id} onSelectNode={onSelect} onShowSource={(sourceId) => onShowSource(sourceId)} onSync={onSync} />
    {selectedNode && <ClaimInspector node={selectedNode} source={source} busy={busy} onClose={() => onSelect("")} onSave={(title) => onSync([{ id: selectedNode.id, title, x: selectedNode.x, y: selectedNode.y, width: selectedNode.width, height: selectedNode.height }])} onShowSource={() => onShowSource(selectedSourceId)} />}
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

function BriefView({ state, onChooseStyle, onShowSource }: { state: PersistedWorkshop | null; onChooseStyle: () => void; onShowSource: (sourceId?: string) => void }) {
  const outcome = frameSection(state?.frame?.markdown, "Outcome") || "Turn raw thinking into finished work.";
  const evidence = frameSection(state?.frame?.markdown, "Evidence").split("\n").map((line) => line.replace(/^[-*]\s*/, "").trim()).filter(Boolean);
  const proof = frameSection(state?.frame?.markdown, "Production proof");
  const locked = Boolean(state?.style && !state.style.stale);

  return <article className="brief-view">
    <Card className="brief-document">
      <div className="brief-meta"><Status>Approved</Status><span>{state?.activeSourceIds.length ?? 0} sources · {state?.mapNodes.filter((node) => node.kind === "grounded").length ?? 0} verified claims</span></div>
      <h1>{outcome}</h1>
      {evidence.length > 0 && <section className="brief-section"><h2>Evidence</h2><ul>{evidence.map((item) => <li key={item}>{item}</li>)}</ul></section>}
      {proof && <section className="brief-section"><h2>Success looks like</h2><p>{proof}</p></section>}
      <div className="citation-row">{state?.claims?.slice(0, 3).map((claim) => <Token key={claim.id} onClick={() => onShowSource(claim.sourceId)}>{claim.locator}</Token>)}</div>
      <section className="style-summary" aria-label="Style"><div className="style-summary-copy"><small>Style</small><strong>{locked ? state?.style?.name : "Not selected"}</strong></div><div className="palette-preview compact" data-domain-ui="palette-preview"><i style={{ background: state?.style?.accent ?? "#0285FF" }} /><i style={{ background: state?.style?.ink ?? "#0D0D0D" }} /><i style={{ background: state?.style?.paper ?? "#FFFFFF" }} /></div>{locked && <Button variant="secondary" size="small" onClick={onChooseStyle}>Edit</Button>}</section>
    </Card>
  </article>;
}

function StyleSheet({ style, busy, onClose, onPost }: { style?: PersistedWorkshop["style"]; busy: boolean; onClose: () => void; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null> }) {
  const [name, setName] = useState(style?.name ?? "WorkshopLM editorial");
  const [accent, setAccent] = useState(style?.accent ?? "#0285FF");
  useEffect(() => { setName(style?.name ?? "WorkshopLM editorial"); setAccent(style?.accent ?? "#0285FF"); }, [style?.name, style?.accent]);
  const locked = Boolean(style && !style.stale);
  const dirty = name.trim() !== (style?.name ?? "WorkshopLM editorial") || accent.trim().toUpperCase() !== (style?.accent ?? "#0285FF").toUpperCase();
  const saveStyle = () => {
    const manualStyle: ManualStylePayload = { name: name.trim(), accent: accent.trim(), ink: "#0D0D0D", paper: "#FFFFFF", logos: [], licensedFonts: ["SF Pro"], references: ["calm editorial work surface"], negativeRules: ["no decorative gradients"], intentProfile: "client_facing_pitch" };
    void onPost({ action: "lockManualStyle", manualStyle }).then((next) => next && onClose());
  };

  return <SideSheet title="Style" onClose={onClose}><p className="sheet-intro">Use one visual system across every output.</p><Input label="Name" value={name} onChange={(event) => setName(event.target.value)} /><Input label="Accent color" value={accent} onChange={(event) => setAccent(event.target.value)} /><div className="style-preview"><div className="palette-preview" data-domain-ui="palette-preview"><i style={{ background: accent }} /><i style={{ background: "#0D0D0D" }} /><i style={{ background: "#FFFFFF" }} /></div><div className="type-preview" data-domain-ui="type-preview"><strong>Aa</strong><span>SF Pro · clear hierarchy</span></div></div>{(!locked || dirty) && <Button disabled={busy || !name.trim() || !accent.trim()} onClick={saveStyle}>{locked ? "Update style" : "Use this style"}</Button>}</SideSheet>;
}

function OutputsView({ state, onOpenOutput }: { state: PersistedWorkshop | null; onOpenOutput: (id: string) => void }) {
  const evidenceCount = state?.assetPlan?.evidenceClaimIds.length ?? state?.claims?.length ?? 0;
  const generatedImages = state?.imageBatch?.panels.filter((panel) => panel.state === "generated").length ?? 0;
  const failedImages = state?.imageBatch?.panels.filter((panel) => panel.state === "failed").length ?? 0;
  const ready = Boolean(state?.briefApproved && state.style && !state.style.stale);
  const partial = Boolean(state?.outputs.length === 1 || failedImages);
  const needsUpdate = Boolean(state?.outputs.some((output) => output.stale) || state?.assetPlan?.stale || state?.imageBatch?.stale || state?.storyboard.stale);
  return <article className="outputs-view">
    <h1 className="visually-hidden">Outputs</h1>
    {!ready ? <StateMessage state="empty" title="Choose a Style">Your Brief is ready. Add a Style to create Outputs.</StateMessage> : <>
      {(state?.outputs.length ?? 0) === 0 && !state?.imageBatch && <StateMessage state="empty" title="Create your first Outputs">Turn this Brief into a presentation, infographic, image set, and Storyboard.</StateMessage>}
      {partial && !needsUpdate && <StateMessage state="partial" title="Some Outputs are ready">Review what is finished, then update Outputs to complete the set.</StateMessage>}
      {needsUpdate && <StateMessage state="needs-update" title="Outputs need an update">Your Sources, Brief, or Style changed. Update Outputs before sharing them.</StateMessage>}
      <section className="output-grid">{state?.outputs.map((output) => <EntityCardAction className={`output-card ${output.stale ? "needs-update" : ""}`} key={output.id} aria-label={`Open ${outputTitle(output.type)}`} onClick={() => onOpenOutput(output.id)}><div className="artifact-preview" data-domain-ui="artifact-preview"><iframe title={`${output.type} preview`} sandbox="allow-same-origin" src={`/api/workshop/artifacts/${output.id}`} /></div><div className="output-card-body"><div>{output.stale && <Status tone="waiting">Needs update</Status>}<h2>{outputTitle(output.type)}</h2><p>{output.claimIds?.length ?? evidenceCount} cited claims</p></div></div></EntityCardAction>)}
      {state?.videoState === "rendered" && <EntityCardAction className="output-card" aria-label="Open Demo video" onClick={() => onOpenOutput("video")}><div className="artifact-preview" data-domain-ui="artifact-preview"><video muted src="/api/workshop/artifacts/video" /></div><div className="output-card-body"><div><h2>Demo video</h2><p>Based on the approved Storyboard</p></div></div></EntityCardAction>}</section>
      {state?.imageBatch && <Carousel className="image-set"><div>{generatedImages !== state.imageBatch.panels.length && <Status tone="waiting">Images not created yet</Status>}<h2>Image set</h2><p>{generatedImages ? `${generatedImages} of ${state.imageBatch.panels.length} images created` : `${state.imageBatch.panels.length} planned images in one style`}</p></div><CarouselRow>{state.imageBatch.panels.map((panel, index) => <div className={`image-tile ${panel.state === "generated" ? "generated" : ""}`} data-domain-ui="image-tile" key={panel.id} style={{ "--tile": index } as CSSProperties}>{panel.state === "generated" && <img alt="" src={`/api/workshop/artifacts/${panel.id}`} />}<span>{String(index + 1).padStart(2, "0")}</span><small>{panel.state === "planned" ? "Planned" : panel.state === "generated" ? "Ready" : panel.state === "failed" ? "Couldn't create" : "Needs update"}</small></div>)}</CarouselRow></Carousel>}
      {(state?.storyboard.panels.length ?? 0) > 0 && <Card className="storyboard-summary"><div><h2>Storyboard</h2><p>{state?.storyboardApproved ? "Approved for video" : "Review before video"}</p></div><CarouselRow>{state?.storyboard.panels.map((panel, index) => <div className="film-frame" data-domain-ui="film-frame" key={panel.id}><span>{index + 1}</span><strong>{panel.title}</strong><small>{panel.durationSeconds}s</small></div>)}</CarouselRow></Card>}
    </>}
  </article>;
}

function FocusedOutputView({ state, outputId, onShowSource }: { state: PersistedWorkshop | null; outputId: string; onShowSource: (sourceId?: string) => void }) {
  const output = state?.outputs.find((item) => item.id === outputId);
  const isVideo = outputId === "video";
  const title = output ? outputTitle(output.type) : "Demo video";
  const sourceId = state?.claims?.find((claim) => output?.claimIds?.includes(claim.id))?.sourceId;
  const href = isVideo ? "/api/workshop/artifacts/video" : `/api/workshop/artifacts/${outputId}`;
  if (!output && !isVideo) return <div className="state-surface"><StateMessage state="error" title="Couldn't open Output">Return to Outputs and try opening it again.</StateMessage></div>;
  return <article className="focused-output"><h1 className="visually-hidden">{title}</h1><div className="focused-output-heading">{output?.stale && <Status tone="waiting">Needs update</Status>}<div className="button-row"><Button variant="secondary" size="small" onClick={() => onShowSource(sourceId)}>Show source</Button><ButtonLink variant="secondary" size="small" href={href} target="_blank" rel="noreferrer">Open</ButtonLink></div></div><div className="focused-output-preview" data-domain-ui="artifact-preview">{isVideo ? <video controls src={href} /> : <iframe title={title} sandbox="allow-same-origin" src={href} />}</div></article>;
}

function StoryboardView({ storyboard, approved, panel, busy, onSelect, onPost, onShowSource }: { storyboard?: PersistedWorkshop["storyboard"]; approved: boolean; panel?: PersistedWorkshop["storyboard"]["panels"][number]; busy: boolean; onSelect: (id: string) => void; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null>; onShowSource: (sourceId?: string) => void }) {
  const [title, setTitle] = useState("");
  const [narration, setNarration] = useState("");
  useEffect(() => { if (panel) { setTitle(panel.title); setNarration(panel.narration); } }, [panel]);
  const duration = (storyboard?.panels ?? []).reduce((sum, item) => sum + item.durationSeconds, 0);
  const dirty = Boolean(panel && (title.trim() !== panel.title || narration.trim() !== panel.narration));
  if (!storyboard?.panels.length) return <article className="storyboard-view"><h1 className="visually-hidden">Storyboard</h1><StateMessage state="empty" title="Create Outputs first">The Storyboard appears after WorkshopLM creates the Output set.</StateMessage></article>;
  return <article className="storyboard-view">
    <h1 className="visually-hidden">Storyboard</h1>
    <p className="storyboard-meta"><Status tone={approved ? "current" : "waiting"}>{approved ? "Approved" : "Ready for review"}</Status><span>{storyboard?.panels.length ?? 0} panels · {duration} seconds</span></p>
    <CarouselRow className="storyboard-strip">{(storyboard?.panels ?? []).map((item, index) => <button type="button" key={item.id} className={`film-frame ${item.id === panel?.id ? "selected" : ""}`} data-domain-ui="film-frame" style={{ "--panel": index } as CSSProperties} onClick={() => onSelect(item.id)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong><small>{item.durationSeconds}s</small></button>)}</CarouselRow>
    {panel && <Card className="panel-editor"><div className="panel-visual" data-domain-ui="panel-visual" style={{ "--panel": Math.max(0, storyboard?.panels.findIndex((item) => item.id === panel.id) ?? 0) } as CSSProperties}><small>Preview</small><span>{panel.title}</span><p>{panel.narration}</p></div><div className="panel-fields"><Input label="Panel title" value={title} onChange={(event) => setTitle(event.target.value)} /><TextArea label="Narration" value={narration} onChange={(event) => setNarration(event.target.value)} /><div className="button-row">{dirty && <Button variant="secondary" disabled={busy || !title.trim() || !narration.trim()} onClick={() => { void onPost({ action: "updateStoryboardPanel", panel: { id: panel.id, title: title.trim(), narration: narration.trim(), durationSeconds: panel.durationSeconds } }); }}>Save</Button>}<Button variant="secondary" size="small" onClick={() => onShowSource()}>Show source</Button></div></div></Card>}
  </article>;
}

function SourcesSheet({ sources, activeIds, selected, onClose, onSelect, onToggle, onAdd, onShowMap }: { sources: SourceItem[]; activeIds: string[]; selected: SourceItem | null; onClose: () => void; onSelect: (source: SourceItem) => void; onToggle: (id: string) => void; onAdd: () => void; onShowMap: (source: SourceItem) => void }) {
  const active = selected ?? sources[0];
  return <SideSheet title="Sources" onClose={onClose}><div className="sheet-heading"><p>{activeIds.length} of {sources.length} selected</p><Button variant="secondary" onClick={onAdd}><PlusIcon /> Add source</Button></div><ListGroup>{sources.map((source) => <ListRow className={active?.id === source.id ? "source-row selected" : "source-row"} key={source.id}><Checkbox aria-label={`Use ${source.title}`} checked={activeIds.includes(source.id)} onChange={() => onToggle(source.id)} /><ListRowAction onClick={() => onSelect(source)}><FileIcon label={source.type} /><span><strong>{source.title}</strong><small>{source.origin} · {source.claimCount} claims</small></span></ListRowAction></ListRow>)}</ListGroup>{active && <Card className="source-preview"><strong>{active.title}</strong><p>“{active.excerpt}”</p><small>{active.locator}</small><Button variant="secondary" size="small" onClick={() => onShowMap(active)}>Show on map</Button></Card>}</SideSheet>;
}

function EvidenceSheet({ source, onClose, onShowMap }: { source: SourceItem; onClose: () => void; onShowMap: () => void }) {
  return <SideSheet title="Source" onClose={onClose}><blockquote className="evidence-quote">“{source.excerpt}”</blockquote><p className="source-locator">{source.locator}</p><dl className="evidence-meta"><dt>Source</dt><dd>{source.title}</dd><dt>Origin</dt><dd>{source.origin}</dd></dl><Button onClick={onShowMap}>Show on map</Button></SideSheet>;
}

function AddSourceSheet({ onClose, onPost }: { onClose: () => void; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null> }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  return <SideSheet title="Add source" onClose={onClose}><RealtimeCapture onSave={async (transcript, capture) => Boolean(await onPost({ action: "captureFallbackTranscript", text: transcript, capture }).then((next) => { if (next) onClose(); return next; }))} /><div className="source-divider"><span>or paste text</span></div><p className="sheet-intro">Paste material you are allowed to use.</p><Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} /><TextArea label="Text" value={text} onChange={(event) => setText(event.target.value)} /><Button disabled={!title.trim() || !text.trim()} onClick={() => { void onPost({ action: "ingestSource", source: { title, origin: "Local note", text, permission: "sanitized" } }).then((next) => next && onClose()); }}>Add source</Button></SideSheet>;
}

function Status({ children, tone = "current" }: { children: ReactNode; tone?: "current" | "waiting" }) {
  return <span className={`status status--${tone}`}>{children}</span>;
}
