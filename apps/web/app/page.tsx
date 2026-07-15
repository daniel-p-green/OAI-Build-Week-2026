"use client";

import {
  ArrowLeftIcon,
  Button,
  Card,
  Carousel,
  CarouselRow,
  Checkbox,
  CloseIcon,
  EntityCard,
  FileIcon,
  FullScreenShell,
  IconButton,
  Input,
  ListGroup,
  ListRow,
  NavigationHeader,
  PlusIcon,
  TextArea,
  Token,
} from "@workshoplm/ui";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";

type ObjectView = "map" | "brief" | "outputs" | "storyboard";
type Sheet = "sources" | "evidence" | "add-source" | null;
type SourceItem = { id: string; type: "TXT" | "PDF" | "WEB"; title: string; origin: string; claimCount: number; excerpt: string; locator: string; permission: "private" | "sanitized" | "shareable" };
type MapNode = { id: string; title: string; body: string; kind: "grounded" | "derived" | "creative"; locator: string; sourceId?: string; x: number; y: number };
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
  frame?: { version: number; markdown: string; stale: boolean };
  style?: { version: number; name: string; accent: string; ink: string; paper: string; stale: boolean };
  assetPlan?: { version: number; stale: boolean; evidenceClaimIds: string[] };
  storyboard: { version: number; stale: boolean; panels: { id: string; title: string; narration: string; durationSeconds: number; approved: boolean; stale: boolean }[] };
  imageBatch?: { id: string; stale: boolean; panels: { id: string; version: number; prompt: string; state: "planned" | "selected_for_regeneration" | "failed" }[] };
  outputs: { id: string; type: "deck" | "infographic"; stale: boolean; artifactPath: string; claimIds?: string[] }[];
};

const VIEW_TITLES: Record<ObjectView, string> = { map: "Map", brief: "Brief", outputs: "Outputs", storyboard: "Storyboard" };

export default function WorkshopPage() {
  const [state, setState] = useState<PersistedWorkshop | null>(null);
  const [view, setView] = useState<ObjectView>("map");
  const [sheet, setSheet] = useState<Sheet>(null);
  const [selectedNodeId, setSelectedNodeId] = useState("");
  const [selectedSource, setSelectedSource] = useState<SourceItem | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => { void reload(); }, []);

  const selectedNode = useMemo(() => state?.mapNodes.find((node) => node.id === selectedNodeId), [state, selectedNodeId]);
  const selectedPanel = useMemo(() => state?.storyboard.panels.find((panel) => panel.id === selectedPanelId) ?? state?.storyboard.panels[0], [state, selectedPanelId]);
  const canDeliver = Boolean(state?.briefApproved && state.style && !state.style.stale);

  async function reload() {
    const response = await fetch("/api/workshop");
    if (response.ok) setState(await response.json() as PersistedWorkshop);
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
      setNotice(error instanceof Error ? error.message : "That action did not work");
      return null;
    } finally {
      setBusy(false);
    }
  }

  function openView(next: ObjectView) {
    setView(next);
    closeSheet();
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
    if (!state?.imageBatch || state.imageBatch.stale) await post({ action: "createImageBatch" });
    await post({ action: "generateAssetPlan" });
    await post({ action: "generateStoryboard" });
    setNotice("Outputs created from your brief, style, and sources.");
    openView("outputs");
  }

  const sourceCount = state?.activeSourceIds.length ?? 0;

  return (
    <FullScreenShell className="workshop-shell">
      <NavigationHeader className="workshop-header">
        <div className="header-identity">
          <IconButton label="Back to Map" disabled={view === "map"} onClick={() => openView("map")}><ArrowLeftIcon /></IconButton>
          <div className="workshop-identity"><strong>{state?.title || "WorkshopLM"}</strong><span aria-hidden="true">/</span><b>{VIEW_TITLES[view]}</b></div>
        </div>
        <div className="header-actions">
          <Token onClick={() => openSheet("sources")}>{sourceCount} sources</Token>
          {view === "map" && (state?.briefApproved && !state.frame?.stale
            ? <Button onClick={() => openView("brief")}>View brief</Button>
            : <Button disabled={busy || !state?.mapNodes.length} onClick={() => { void post({ action: "approveBrief" }).then((next) => next && openView("brief")); }}>Approve brief</Button>)}
          {view === "brief" && canDeliver && <Button onClick={() => openView("outputs")}>View outputs</Button>}
          {view === "outputs" && (state?.storyboard.panels.length ?? 0) > 0 && <Button onClick={() => openView("storyboard")}>View storyboard</Button>}
          {view === "storyboard" && <Button disabled={busy || state?.storyboardApproved || state?.storyboard.stale} onClick={() => { void post({ action: "approveStoryboard" }); }}>{state?.storyboardApproved ? "Storyboard approved" : "Approve storyboard"}</Button>}
        </div>
      </NavigationHeader>

      {notice && <Card className="notice" role="status"><span>{notice}</span><IconButton label="Dismiss" onClick={() => setNotice(null)}><CloseIcon /></IconButton></Card>}

      <section className="object-canvas" aria-label={VIEW_TITLES[view]}>
        {view === "map" && <MapCanvas state={state} selectedNode={selectedNode} busy={busy} onSelect={setSelectedNodeId} onSync={(canvasNodes) => { void post({ action: "syncMapCanvas", canvasNodes }); }} onShowSource={showSource} onApprove={() => { void post({ action: "approveBrief" }).then((next) => next && openView("brief")); }} />}
        {view === "brief" && <BriefView state={state} busy={busy} onPost={post} onShowSource={showSource} />}
        {view === "outputs" && <OutputsView state={state} busy={busy} onCreateOutputs={() => { void createOutputs(); }} onShowSource={showSource} />}
        {view === "storyboard" && <StoryboardView storyboard={state?.storyboard} approved={Boolean(state?.storyboardApproved)} panel={selectedPanel} busy={busy} videoState={state?.videoState} onSelect={setSelectedPanelId} onPost={post} onShowSource={showSource} />}
      </section>

      {sheet === "sources" && <SourcesSheet sources={state?.sourceItems ?? []} activeIds={state?.activeSourceIds ?? []} selected={selectedSource} onClose={closeSheet} onSelect={setSelectedSource} onToggle={(sourceId) => { const current = state?.activeSourceIds ?? []; const sourceIds = current.includes(sourceId) ? current.filter((id) => id !== sourceId) : [...current, sourceId]; void post({ action: "setActiveSourceScope", sourceIds }); }} onAdd={() => setSheet("add-source")} onShowMap={(source) => { setSelectedNodeId(state?.mapNodes.find((node) => node.sourceId === source.id)?.id ?? ""); openView("map"); }} />}
      {sheet === "evidence" && selectedSource && <EvidenceSheet source={selectedSource} onClose={closeSheet} onShowMap={() => { setSelectedNodeId(state?.mapNodes.find((node) => node.sourceId === selectedSource.id)?.id ?? ""); openView("map"); }} />}
      {sheet === "add-source" && <AddSourceSheet onClose={() => setSheet("sources")} onPost={post} />}
    </FullScreenShell>
  );
}

function MapCanvas({ state, selectedNode, busy, onSelect, onSync, onShowSource, onApprove }: { state: PersistedWorkshop | null; selectedNode?: MapNode; busy: boolean; onSelect: (id: string) => void; onSync: (nodes: Pick<MapNode, "id" | "title" | "x" | "y">[]) => void; onShowSource: (sourceId?: string) => void; onApprove: () => void }) {
  const sources = (state?.sourceItems ?? []).filter((source) => state?.activeSourceIds.includes(source.id));
  const nodes = (state?.mapNodes ?? []).filter((node) => !node.sourceId || state?.activeSourceIds.includes(node.sourceId));
  const grounded = nodes.filter((node) => node.kind === "grounded");
  const implications = nodes.filter((node) => node.kind !== "grounded");
  const positioned = new Map<string, { x: number; y: number }>();
  sources.forEach((source, index) => positioned.set(`source:${source.id}`, { x: 11, y: 25 + index * (50 / Math.max(1, sources.length - 1)) }));
  grounded.forEach((node, index) => positioned.set(node.id, { x: 43, y: 28 + index * (48 / Math.max(1, grounded.length - 1)) }));
  implications.forEach((node, index) => positioned.set(node.id, { x: 72, y: 31 + index * (38 / Math.max(1, implications.length - 1)) }));
  const relatedSourceId = (node: MapNode, index: number) => node.sourceId ?? sources[index % Math.max(1, sources.length)]?.id;
  const selectedSourceId = selectedNode ? relatedSourceId(selectedNode, Math.max(0, nodes.indexOf(selectedNode))) : undefined;
  const source = sources.find((item) => item.id === selectedSourceId);
  const related = (node: MapNode) => !selectedNode || node.id === selectedNode.id || (selectedNode.kind !== "grounded" && node.kind === "grounded") || (selectedNode.kind === "grounded" && node.kind !== "grounded");

  return <div className={`map-canvas ${selectedNode ? "tracing" : ""}`} data-domain-ui="map-canvas">
    <div className="map-caption" data-domain-ui="map-caption"><strong>Map</strong><span>{nodes.length} ideas from {sources.length} sources</span></div>
    <div className="map-cluster source-cluster" data-domain-ui="map-cluster"><span>Sources</span></div>
    <div className="map-cluster claim-cluster" data-domain-ui="map-cluster"><span>Claims</span></div>
    <div className="map-cluster decision-cluster" data-domain-ui="map-cluster"><span>Decisions</span></div>
    <svg className="relationship-lines" data-domain-ui="relationship-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {grounded.map((node, index) => { const from = positioned.get(`source:${relatedSourceId(node, index)}`); const to = positioned.get(node.id); return from && to ? <path key={`source-${node.id}`} className={selectedNode && selectedNode.id !== node.id && selectedSourceId !== relatedSourceId(node, index) ? "dim" : selectedNode ? "active" : ""} d={`M ${from.x + 7} ${from.y} C 27 ${from.y}, 28 ${to.y}, ${to.x - 9} ${to.y}`} /> : null; })}
      {implications.map((node, index) => { const fromNode = grounded[index % Math.max(1, grounded.length)]; const from = fromNode && positioned.get(fromNode.id); const to = positioned.get(node.id); return from && to ? <path key={`claim-${node.id}`} className={selectedNode && selectedNode.id !== node.id && selectedNode.id !== fromNode.id ? "dim" : selectedNode ? "active" : ""} d={`M ${from.x + 9} ${from.y} C 56 ${from.y}, 57 ${to.y}, ${to.x - 9} ${to.y}`} /> : null; })}
    </svg>
    {sources.map((item) => { const point = positioned.get(`source:${item.id}`)!; const active = !selectedNode || item.id === selectedSourceId; return <button key={item.id} type="button" className={`source-anchor ${active ? "path-active" : "path-dim"}`} data-domain-ui="source-anchor" style={{ left: `${point.x}%`, top: `${point.y}%` }} onClick={() => onShowSource(item.id)}><span>{item.type}</span><strong>{item.title}</strong><small>{item.claimCount} claims</small></button>; })}
    {nodes.map((node) => { const point = positioned.get(node.id)!; return <button key={node.id} type="button" className={`map-note ${node.kind} ${selectedNode?.id === node.id ? "selected-note" : ""} ${related(node) ? "path-active" : "path-dim"}`} data-domain-ui="map-note" style={{ left: `${point.x}%`, top: `${point.y}%` }} onClick={() => onSelect(selectedNode?.id === node.id ? "" : node.id)}><span>{node.kind === "grounded" ? "Verified" : node.kind === "derived" ? "Derived" : "Idea"}</span><strong>{node.title}</strong><p>{node.body}</p><small>{node.locator}</small></button>; })}
    {selectedNode
      ? <ClaimInspector node={selectedNode} source={source} busy={busy} onClose={() => onSelect("")} onSave={(title) => onSync([{ id: selectedNode.id, title, x: selectedNode.x, y: selectedNode.y }])} onShowSource={() => onShowSource(selectedSourceId)} />
      : <Card className="approval-card"><div><strong>{state?.briefApproved && state.frame && !state.frame.stale ? "Brief approved" : "Ready to approve"}</strong><p>{grounded.length} verified claims · {sources.length} sources</p></div>{state?.briefApproved && state.frame && !state.frame.stale ? <Status>Up to date</Status> : <Button disabled={busy || nodes.length === 0} onClick={onApprove}>Approve brief</Button>}</Card>}
  </div>;
}

function ClaimInspector({ node, source, busy, onClose, onSave, onShowSource }: { node: MapNode; source?: SourceItem; busy: boolean; onClose: () => void; onSave: (title: string) => void; onShowSource: () => void }) {
  const [title, setTitle] = useState(node.title);
  useEffect(() => setTitle(node.title), [node.id, node.title]);
  return <Card className="claim-inspector"><header><div><small>{node.kind === "grounded" ? "Verified claim" : node.kind === "derived" ? "Derived point" : "Idea"}</small><strong>{node.title}</strong></div><IconButton label="Close claim" onClick={onClose}><CloseIcon /></IconButton></header><Input label="Claim" value={title} onChange={(event) => setTitle(event.target.value)} /><blockquote>{source?.excerpt ?? node.body}</blockquote><p className="source-locator">{source?.locator ?? node.locator}</p><div className="button-row"><Button variant="secondary" disabled={busy || title.trim() === node.title || !title.trim()} onClick={() => onSave(title.trim())}>Save</Button><Button variant="text" onClick={onShowSource}>Show source</Button></div></Card>;
}

function BriefView({ state, busy, onPost, onShowSource }: { state: PersistedWorkshop | null; busy: boolean; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null>; onShowSource: (sourceId?: string) => void }) {
  const [name, setName] = useState(state?.style?.name ?? "WorkshopLM editorial");
  const [accent, setAccent] = useState(state?.style?.accent ?? "#0285FF");
  const locked = Boolean(state?.style && !state.style.stale);
  const saveStyle = () => { const style: ManualStylePayload = { name, accent, ink: "#0D0D0D", paper: "#FFFFFF", logos: [], licensedFonts: ["SF Pro"], references: ["calm editorial work surface"], negativeRules: ["no decorative gradients"], intentProfile: "client_facing_pitch" }; void onPost({ action: "lockManualStyle", manualStyle: style }); };

  return <article className="brief-view">
    <Card className="brief-document">
      <div className="brief-meta"><Status>Approved</Status><span>{state?.activeSourceIds.length ?? 0} sources · {state?.mapNodes.filter((node) => node.kind === "grounded").length ?? 0} verified claims</span></div>
      <h1>Turn raw thinking into finished, traceable work.</h1>
      <p className="document-intro">This brief guides every output.</p>
      <pre>{state?.frame?.markdown ?? "No approved brief yet."}</pre>
      <div className="citation-row">{state?.claims?.slice(0, 3).map((claim) => <Token key={claim.id} onClick={() => onShowSource(claim.sourceId)}>{claim.locator}</Token>)}</div>
    </Card>
    <Card className="style-panel">
      <div className="panel-heading"><div><small>Style</small><h2>{locked ? state?.style?.name : "Choose a style"}</h2></div>{locked && <Status>In use</Status>}</div>
      <Input label="Style name" value={name} onChange={(event) => setName(event.target.value)} />
      <Input label="Accent color" value={accent} onChange={(event) => setAccent(event.target.value)} />
      <div className="palette-preview" data-domain-ui="palette-preview"><i style={{ background: accent }} /><i style={{ background: "#0D0D0D" }} /><i style={{ background: "#FFFFFF" }} /></div>
      <div className="type-preview" data-domain-ui="type-preview"><strong>Aa</strong><span>SF Pro · clear hierarchy</span></div>
      <div className="mini-output-previews" data-domain-ui="mini-output-previews"><i style={{ "--accent": accent } as CSSProperties} /><i style={{ "--accent": accent } as CSSProperties} /><i style={{ "--accent": accent } as CSSProperties} /></div>
      <Button disabled={busy} onClick={saveStyle}>{locked ? "Update style" : "Use this style"}</Button>
    </Card>
  </article>;
}

function OutputsView({ state, busy, onCreateOutputs, onShowSource }: { state: PersistedWorkshop | null; busy: boolean; onCreateOutputs: () => void; onShowSource: (sourceId?: string) => void }) {
  const evidenceCount = state?.assetPlan?.evidenceClaimIds.length ?? state?.claims?.length ?? 0;
  const ready = Boolean(state?.briefApproved && state.style && !state.style.stale);
  return <article className="outputs-view">
    <div className="page-heading"><div><h1>Outputs</h1><p>{state?.activeSourceIds.length ?? 0} sources · {state?.style?.name ?? "No style selected"}</p></div><Button disabled={busy || !ready} onClick={onCreateOutputs}>{state?.outputs.length ? "Update outputs" : "Create outputs"}</Button></div>
    {!ready ? <Card className="empty-state"><strong>Choose a style first</strong><p>Your approved brief and style are needed before creating outputs.</p></Card> : <>
      <section className="output-grid">{state?.outputs.map((output) => <EntityCard className={`output-card ${output.stale ? "needs-update" : ""}`} key={output.id}><div className="artifact-preview" data-domain-ui="artifact-preview"><iframe title={`${output.type} preview`} sandbox="allow-same-origin" src={`/api/workshop/artifacts/${output.id}`} /></div><div className="output-card-body"><div><Status tone={output.stale ? "waiting" : "current"}>{output.stale ? "Needs update" : "Up to date"}</Status><h2>{output.type === "deck" ? "Build Week presentation" : "Evidence infographic"}</h2><p>{output.claimIds?.length ?? evidenceCount} cited claims</p></div><div className="button-row"><a className="open-link" href={`/api/workshop/artifacts/${output.id}`} target="_blank">Open</a><Button variant="text" onClick={() => onShowSource(state?.claims?.find((claim) => output.claimIds?.includes(claim.id))?.sourceId)}>Show source</Button></div></div></EntityCard>)}
      {state?.videoState === "rendered" && <EntityCard className="output-card"><div className="artifact-preview" data-domain-ui="artifact-preview"><video controls src="/api/workshop/artifacts/video" /></div><div className="output-card-body"><div><Status>Up to date</Status><h2>Demo video</h2><p>Based on the approved storyboard</p></div><a className="open-link" href="/api/workshop/artifacts/video" target="_blank">Open</a></div></EntityCard>}</section>
      {state?.imageBatch && <Carousel className="image-set"><div><Status tone="waiting">Images not created yet</Status><h2>Image set</h2><p>{state.imageBatch.panels.length} planned images in one style</p></div><CarouselRow>{state.imageBatch.panels.map((panel, index) => <div className="image-tile" data-domain-ui="image-tile" key={panel.id} style={{ "--tile": index } as CSSProperties}><span>{String(index + 1).padStart(2, "0")}</span><small>{panel.state === "planned" ? "Planned" : panel.state}</small></div>)}</CarouselRow></Carousel>}
      {(state?.storyboard.panels.length ?? 0) > 0 && <Card className="storyboard-summary"><CarouselRow>{state?.storyboard.panels.map((panel, index) => <div className="film-frame" data-domain-ui="film-frame" key={panel.id}><span>{index + 1}</span><strong>{panel.title}</strong><small>{panel.durationSeconds}s</small></div>)}</CarouselRow><div><h2>Storyboard</h2><p>{state?.storyboardApproved ? "Approved for video" : "Review before video"}</p></div></Card>}
    </>}
  </article>;
}

function StoryboardView({ storyboard, approved, panel, busy, videoState, onSelect, onPost, onShowSource }: { storyboard?: PersistedWorkshop["storyboard"]; approved: boolean; panel?: PersistedWorkshop["storyboard"]["panels"][number]; busy: boolean; videoState?: PersistedWorkshop["videoState"]; onSelect: (id: string) => void; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null>; onShowSource: (sourceId?: string) => void }) {
  const [title, setTitle] = useState("");
  const [narration, setNarration] = useState("");
  useEffect(() => { if (panel) { setTitle(panel.title); setNarration(panel.narration); } }, [panel]);
  const duration = (storyboard?.panels ?? []).reduce((sum, item) => sum + item.durationSeconds, 0);
  return <article className="storyboard-view">
    <div className="page-heading"><div><h1>Storyboard</h1><p>{storyboard?.panels.length ?? 0} panels · {duration} seconds</p></div><Status tone={approved ? "current" : "waiting"}>{approved ? "Approved" : "Draft"}</Status></div>
    <CarouselRow className="storyboard-strip">{(storyboard?.panels ?? []).map((item, index) => <button type="button" key={item.id} className={`film-frame ${item.id === panel?.id ? "selected" : ""}`} data-domain-ui="film-frame" style={{ "--panel": index } as CSSProperties} onClick={() => onSelect(item.id)}><span>{String(index + 1).padStart(2, "0")}</span><strong>{item.title}</strong><small>{item.durationSeconds}s</small></button>)}</CarouselRow>
    {panel && <Card className="panel-editor"><div className="panel-visual" data-domain-ui="panel-visual" style={{ "--panel": Math.max(0, storyboard?.panels.findIndex((item) => item.id === panel.id) ?? 0) } as CSSProperties}><small>Preview</small><span>{panel.title}</span><p>{panel.narration}</p></div><div className="panel-fields"><Status>Based on sources</Status><Input label="Panel title" value={title} onChange={(event) => setTitle(event.target.value)} /><TextArea label="Narration" value={narration} onChange={(event) => setNarration(event.target.value)} /><div className="button-row"><Button variant="secondary" disabled={busy} onClick={() => { void onPost({ action: "updateStoryboardPanel", panel: { id: panel.id, title, narration, durationSeconds: panel.durationSeconds } }); }}>Save</Button><Button variant="text" onClick={() => onShowSource()}>Show source</Button></div></div></Card>}
    <Card className="storyboard-gate"><div><strong>{approved ? "Ready to create video" : "Review and approve the storyboard"}</strong><p>{storyboard?.panels.length ?? 0} panels · {duration} seconds</p></div>{approved ? <Button disabled={busy || videoState === "queued" || videoState === "rendering"} onClick={() => { void onPost({ action: "renderVideo" }); }}>{videoState === "rendered" ? "Create again" : videoState === "queued" || videoState === "rendering" ? "Creating…" : "Create video"}</Button> : <Status tone="waiting">Approval needed</Status>}</Card>
  </article>;
}

function SourcesSheet({ sources, activeIds, selected, onClose, onSelect, onToggle, onAdd, onShowMap }: { sources: SourceItem[]; activeIds: string[]; selected: SourceItem | null; onClose: () => void; onSelect: (source: SourceItem) => void; onToggle: (id: string) => void; onAdd: () => void; onShowMap: (source: SourceItem) => void }) {
  const active = selected ?? sources[0];
  return <Sheet title="Sources" onClose={onClose}><div className="sheet-heading"><p>{activeIds.length} of {sources.length} selected</p><Button variant="secondary" onClick={onAdd}><PlusIcon /> Add source</Button></div><ListGroup>{sources.map((source) => <ListRow className={active?.id === source.id ? "source-row selected" : "source-row"} key={source.id}><Checkbox aria-label={`Use ${source.title}`} checked={activeIds.includes(source.id)} onChange={() => onToggle(source.id)} /><Button variant="text" className="source-row-button" onClick={() => onSelect(source)}><FileIcon label={source.type} /><span><strong>{source.title}</strong><small>{source.origin} · {source.claimCount} claims</small></span></Button></ListRow>)}</ListGroup>{active && <Card className="source-preview"><strong>{active.title}</strong><p>“{active.excerpt}”</p><small>{active.locator}</small><Button variant="text" onClick={() => onShowMap(active)}>Show on map</Button></Card>}</Sheet>;
}

function EvidenceSheet({ source, onClose, onShowMap }: { source: SourceItem; onClose: () => void; onShowMap: () => void }) {
  return <Sheet title="Source" onClose={onClose}><Status>Exact source</Status><blockquote className="evidence-quote">“{source.excerpt}”</blockquote><p className="source-locator">{source.locator}</p><dl className="evidence-meta"><dt>Source</dt><dd>{source.title}</dd><dt>Origin</dt><dd>{source.origin}</dd></dl><Button onClick={onShowMap}>Show on map</Button></Sheet>;
}

function AddSourceSheet({ onClose, onPost }: { onClose: () => void; onPost: (body: Record<string, unknown>) => Promise<PersistedWorkshop | null> }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  return <Sheet title="Add source" onClose={onClose}><p className="sheet-intro">Paste material you are allowed to use.</p><Input label="Title" value={title} onChange={(event) => setTitle(event.target.value)} /><TextArea label="Text" value={text} onChange={(event) => setText(event.target.value)} /><Button disabled={!title.trim() || !text.trim()} onClick={() => { void onPost({ action: "ingestSource", source: { title, origin: "Local note", text, permission: "sanitized" } }).then((next) => next && onClose()); }}>Add source</Button></Sheet>;
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return <aside className="side-sheet" role="dialog" aria-modal="true" aria-label={title}><header><h2>{title}</h2><IconButton label={`Close ${title}`} onClick={onClose}><CloseIcon /></IconButton></header>{children}</aside>;
}

function Status({ children, tone = "current" }: { children: ReactNode; tone?: "current" | "waiting" }) {
  return <span className={`status status--${tone}`}>{children}</span>;
}
