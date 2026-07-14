"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";

type View = "Map" | "Sketch" | "Brief" | "Design" | "Story" | "Trace";
type SourceItem = { id: string; type: "TXT" | "PDF" | "WEB"; title: string; origin: string; claimCount: number; excerpt: string; locator: string; permission: "private" | "sanitized" | "shareable" };
type MapNode = { id: string; title: string; body: string; kind: "grounded" | "derived" | "creative"; locator: string; sourceId?: string; x: number; y: number };
const ExcalidrawMap = dynamic<{ nodes: MapNode[] }>(() => import("./excalidraw-map.js").then((module) => module.ExcalidrawMap), { ssr: false });
type PersistedWorkshop = { briefApproved: boolean; storyboardApproved: boolean; videoState: "blocked" | "queued" | "rendering" | "rendered"; firstTranscriptAt?: string; firstRenderedOutputAt?: string; sourceItems: SourceItem[]; sourceChunks?: { id: string; sourceId: string; text: string; locator: string }[]; claims?: { id: string; sourceId: string; chunkId: string; text: string; locator: string }[]; candidates?: { id: string; category: "goal" | "audience" | "claim" | "constraint" | "question"; text: string; locator: string }[]; mapNodes: MapNode[]; mapEdges?: { id: string; from: string; to: string; kind: string; label?: string }[]; storyboard: { version: number; stale: boolean; panels: { id: string; title: string; narration: string; durationSeconds: number; approved: boolean; stale: boolean }[] }; imageBatch?: { id: string; stale: boolean; referenceId: string; panels: { id: string; version: number; prompt: string; state: "planned" | "selected_for_regeneration" }[] }; outputs: { id: string; type: "deck" | "infographic"; stale: boolean; artifactPath: string }[]; frame?: { version: number; markdown: string; stale: boolean }; style?: { version: number; name: string; accent: string; ink: string; paper: string; logos: string[]; licensedFonts: string[]; references: string[]; negativeRules: string[]; intentProfile: "client_facing_pitch" | "board_deck" | "internal_workshop"; stale: boolean } };
type ManualStylePayload = Pick<NonNullable<PersistedWorkshop["style"]>, "name" | "accent" | "ink" | "paper" | "logos" | "licensedFonts" | "references" | "negativeRules" | "intentProfile">;

export default function WorkshopPage() {
  const [view, setView] = useState<View>("Map");
  const [selected, setSelected] = useState("promise");
  const [briefApproved, setBriefApproved] = useState(false);
  const [storyApproved, setStoryApproved] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [selectedSource, setSelectedSource] = useState<SourceItem | null>(null);
  const [sourceInputOpen, setSourceInputOpen] = useState(false);
  const [sourceTitle, setSourceTitle] = useState("");
  const [sourceOrigin, setSourceOrigin] = useState("Local note");
  const [sourcePermission, setSourcePermission] = useState<SourceItem["permission"]>("sanitized");
  const [sourceText, setSourceText] = useState("");
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceUrl, setSourceUrl] = useState("");
  const [fallbackCaptureOpen, setFallbackCaptureOpen] = useState(false);
  const [fallbackCaptureText, setFallbackCaptureText] = useState("");
  const [fallbackCaptureStatus, setFallbackCaptureStatus] = useState<string | null>(null);
  const [nodeLabel, setNodeLabel] = useState("");
  const [edgeTarget, setEdgeTarget] = useState("");
  const [persisted, setPersisted] = useState<PersistedWorkshop | null>(null);
  const activeNodes = persisted?.mapNodes ?? [];
  const selectedNode = useMemo(() => activeNodes.find((node) => node.id === selected) ?? activeNodes[0], [activeNodes, selected]);

  useEffect(() => { fetch("/api/workshop").then((response) => response.ok ? response.json() : null).then(setPersisted).catch(() => setPersisted(null)); }, []);
  async function mutate(action: "approveBrief" | "lockManualStyle" | "approveStoryboard" | "renderVideo") {
    const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
    const state = await response.json() as { error?: string; briefApproved?: boolean; storyboardApproved?: boolean; videoState?: "blocked" | "queued" | "rendering" | "rendered" };
    if (!response.ok) throw new Error(state.error ?? "Workshop action failed");
    setPersisted((previous) => ({ ...(previous ?? { sourceItems: [], mapNodes: [] }), ...(state as Omit<PersistedWorkshop, "sourceItems" | "mapNodes">) }));
  }

  function renderVideo() {
    setRendering(true);
    void mutate("renderVideo").finally(() => setRendering(false));
  }
  async function addSource() {
    const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "ingestSource", source: { title: sourceTitle, origin: sourceOrigin, text: sourceText, permission: sourcePermission } }) });
    const state = await response.json() as PersistedWorkshop & { error?: string };
    if (!response.ok) throw new Error(state.error ?? "Source ingestion failed");
    setPersisted(state);
    setSelected(state.mapNodes.at(-1)?.id ?? "promise");
    setSourceInputOpen(false);
    setSourceTitle(""); setSourceText("");
  }
  async function addPublicUrl() {
    const url = sourceUrl.trim();
    if (!url) return;
    const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "ingestUrl", url }) });
    const state = await response.json() as PersistedWorkshop & { error?: string };
    if (!response.ok) throw new Error(state.error ?? "Public URL ingestion failed");
    setPersisted(state); setSelected(state.mapNodes.at(-1)?.id ?? "promise"); setSourceInputOpen(false); setSourceUrl("");
  }
  async function uploadPdf() {
    if (!sourceFile) return;
    const body = new FormData(); body.set("action", "ingestPdfUpload"); body.set("file", sourceFile); body.set("permission", sourcePermission);
    const response = await fetch("/api/workshop", { method: "POST", body });
    const state = await response.json() as PersistedWorkshop & { error?: string };
    if (!response.ok) throw new Error(state.error ?? "PDF upload failed");
    setPersisted(state); setSelected(state.mapNodes.at(-1)?.id ?? "promise"); setSourceInputOpen(false); setSourceFile(null);
  }
  async function captureFallbackTranscript() {
    const text = fallbackCaptureText.trim();
    if (!text) return;
    setFallbackCaptureStatus("Saving capture…");
    const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "captureFallbackTranscript", text }) });
    const state = await response.json() as PersistedWorkshop & { error?: string };
    if (!response.ok) { setFallbackCaptureStatus(state.error ?? "Capture failed"); return; }
    setPersisted(state); setFallbackCaptureText(""); setFallbackCaptureStatus("Captured as grounded local evidence.");
  }
  async function editSelectedNode() {
    if (!selectedNode || !nodeLabel.trim()) return;
    const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "mapOperation", operation: { type: "update_node", nodeId: `node-${selectedNode.id}`, patch: { label: nodeLabel.trim() } } }) });
    const state = await response.json() as PersistedWorkshop & { error?: string };
    if (!response.ok) throw new Error(state.error ?? "Map edit failed");
    setPersisted(state);
  }
  async function undoMapEdit() {
    const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "undoMapOperation" }) });
    const state = await response.json() as PersistedWorkshop & { error?: string };
    if (!response.ok) throw new Error(state.error ?? "Map undo failed");
    setPersisted(state); setNodeLabel("");
  }
  async function addMapIdea() {
    const nodeId = `node-manual-${Date.now()}`;
    const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "mapOperation", operation: { type: "add_node", node: { id: nodeId, kind: "idea", label: "Untitled idea", evidenceState: "creative", metadata: { body: "A user-authored Map idea.", locator: "Manual Map edit" } } } }) });
    const state = await response.json() as PersistedWorkshop & { error?: string };
    if (!response.ok) throw new Error(state.error ?? "Map add failed");
    setPersisted(state); setSelected(nodeId.replace(/^node-/, "")); setNodeLabel("Untitled idea");
  }
  async function removeSelectedNode() {
    if (!selectedNode) return;
    const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "mapOperation", operation: { type: "remove_node", nodeId: `node-${selectedNode.id}` } }) });
    const state = await response.json() as PersistedWorkshop & { error?: string };
    if (!response.ok) throw new Error(state.error ?? "Map remove failed");
    setPersisted(state); setSelected(state.mapNodes[0]?.id ?? ""); setNodeLabel("");
  }
  async function addMapEdge() {
    if (!selectedNode || !edgeTarget) return;
    const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "mapOperation", operation: { type: "add_edge", edge: { id: `edge-${selectedNode.id}-${edgeTarget}-${Date.now()}`, from: `node-${selectedNode.id}`, to: `node-${edgeTarget}`, kind: "relates_to", label: "relates to" } } }) });
    const state = await response.json() as PersistedWorkshop & { error?: string };
    if (!response.ok) throw new Error(state.error ?? "Map link failed");
    setPersisted(state); setEdgeTarget("");
  }
  async function removeMapEdge(edgeId: string) {
    const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "mapOperation", operation: { type: "remove_edge", edgeId } }) });
    const state = await response.json() as PersistedWorkshop & { error?: string };
    if (!response.ok) throw new Error(state.error ?? "Map unlink failed");
    setPersisted(state);
  }
  async function generateOutput(outputType: "deck" | "infographic") {
    const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "generateOutput", outputType }) });
    const state = await response.json() as PersistedWorkshop & { error?: string };
    if (!response.ok) throw new Error(state.error ?? "Output generation failed");
    setPersisted(state);
  }
  async function createImageBatch() { const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "createImageBatch" }) }); const state = await response.json() as PersistedWorkshop & { error?: string }; if (!response.ok) throw new Error(state.error ?? "Image batch creation failed"); setPersisted(state); }
  async function regenerateImagePanel(panelId: string) { const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "regenerateImagePanel", panelId }) }); const state = await response.json() as PersistedWorkshop & { error?: string }; if (!response.ok) throw new Error(state.error ?? "Image panel selection failed"); setPersisted(state); }
  async function lockWebsiteStyle(url: string) { const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "lockWebsiteStyle", url }) }); const state = await response.json() as PersistedWorkshop & { error?: string }; if (!response.ok) throw new Error(state.error ?? "Website style capture failed"); setPersisted(state); }
  async function lockManualStyle(manualStyle: ManualStylePayload) { const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "lockManualStyle", manualStyle }) }); const state = await response.json() as PersistedWorkshop & { error?: string }; if (!response.ok) throw new Error(state.error ?? "Manual style lock failed"); setPersisted(state); }
  async function extractCandidates() { const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "extractCandidates" }) }); const state = await response.json() as PersistedWorkshop & { error?: string }; if (!response.ok) throw new Error(state.error ?? "Candidate extraction failed"); setPersisted(state); }

  return (
    <main className="workspace">
      <header className="topbar">
        <div className="title-lockup"><span className="mark">W</span><span>Workshop</span><button className="switcher">WorkshopLM Build Week <span>⌄</span></button></div>
        <div className="topmeta"><span className="sync"><i />Local Workshop state</span><button className="quiet">Trace</button><button className="quiet">•••</button></div>
      </header>

      <aside className="sources" aria-label="Sources">
        <div className="rail-heading"><div><span className="eyebrow">CAPTURE</span><h2>Sources</h2></div><button className="icon-button" aria-label="Add source" onClick={() => setSourceInputOpen(true)}>+</button></div>
        <div className="source-group">Selected for this Map <span>{persisted?.sourceItems.length ?? "…"}</span></div>
        <div className="source-list">
          {(persisted?.sourceItems ?? []).map((source, index) => <button className={`source-row ${index === 0 ? "active-source" : ""}`} onClick={() => { setSelectedSource(source); setSourceOpen(true); }} key={source.id}>
            <span className="file-type">{source.type}</span><span className="source-copy"><strong>{source.title}</strong><small>{source.origin} · {source.permission} · indexed</small></span><span className="claim-count">{source.claimCount} claims</span>
          </button>)}
        </div>
        <section className="candidate-list" aria-label="Grounded candidates">
          <div><span className="eyebrow">CANDIDATES</span><button onClick={() => { void extractCandidates(); }}>Extract</button></div>
          {(persisted?.candidates ?? []).slice(0, 5).map((candidate) => <article key={candidate.id}><span>{candidate.category}</span><p title={candidate.locator}>{candidate.text}</p></article>)}
          {!persisted?.candidates?.length && <p className="candidate-empty">Extract grounded goals, audience, claims, constraints, and open questions.</p>}
        </section>
        <div className="source-footer"><span className="ground-dot" />All selected sources are indexed</div>
      </aside>

      <section className="center" aria-label="Workshop canvas">
        <nav className="views" aria-label="Workspace view">
          {(["Map", "Sketch", "Brief", "Design", "Story", "Trace"] as View[]).map((item) => <button key={item} className={view === item ? "selected" : ""} onClick={() => setView(item)}>{item}{item === "Brief" && briefApproved ? <em>approved</em> : null}</button>)}
          <span className="view-spacer" />
          {view === "Map" && <button className="approve" onClick={() => { void mutate("approveBrief").then(() => { setBriefApproved(true); setView("Brief"); }); }}>Approve map as brief</button>}
        </nav>
        {view === "Map" ? <section className="map" aria-label="Semantic Map">
          <div className="map-label">Evidence becoming structure <button onClick={() => { void addMapIdea(); }}>+ Add idea</button></div>
          <ExcalidrawMap nodes={activeNodes} />
          <svg className="map-edges" aria-label="Map relationships">{(persisted?.mapEdges ?? []).map((edge) => { const from = activeNodes.find((node) => node.id === edge.from); const to = activeNodes.find((node) => node.id === edge.to); if (!from || !to) return null; return <g key={edge.id}><line x1={`${from.x}%`} y1={`${from.y}%`} x2={`${to.x}%`} y2={`${to.y}%`} /><text x={`${(from.x + to.x) / 2}%`} y={`${(from.y + to.y) / 2}%`}>{edge.label ?? edge.kind}</text></g>; })}</svg>
          {activeNodes.map((node) => <button key={node.id} className={`claim-card ${node.kind} ${selected === node.id ? "focus" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => { setSelected(node.id); setNodeLabel(node.title); }}>
            <span className="claim-kind">{node.kind === "grounded" ? "Grounded" : node.kind === "derived" ? "Derived" : "Creative"}</span><strong>{node.title}</strong><span>{node.body}</span><small>{node.locator}</small>
          </button>)}
          <div className="cluster cluster-one">Narrative</div><div className="cluster cluster-two">Delivery proof</div>
          {selectedNode && <section className="map-inspector"><span className={`state-dot ${selectedNode.kind}`} /><div><input aria-label="Map node title" value={nodeLabel || selectedNode.title} onChange={(event) => setNodeLabel(event.target.value)} /><p>{selectedNode.locator}</p></div><select aria-label="Link selected Map node to" value={edgeTarget} onChange={(event) => setEdgeTarget(event.target.value)}><option value="">Link to…</option>{activeNodes.filter((node) => node.id !== selectedNode.id).map((node) => <option key={node.id} value={node.id}>{node.title}</option>)}</select><button disabled={!edgeTarget} onClick={() => { void addMapEdge(); }}>Link</button>{(persisted?.mapEdges ?? []).filter((edge) => edge.from === selectedNode.id || edge.to === selectedNode.id).map((edge) => <button className="edge-remove" key={edge.id} title={`Remove ${edge.label ?? edge.kind} relationship`} onClick={() => { void removeMapEdge(edge.id); }}>Unlink</button>)}<button onClick={() => { void editSelectedNode(); }}>Save edit</button><button onClick={() => { void undoMapEdit(); }}>Undo</button><button className="danger-action" onClick={() => { void removeSelectedNode(); }}>Delete</button><button onClick={() => { setSelectedSource(persisted?.sourceItems.find((source) => source.id === selectedNode.sourceId) ?? persisted?.sourceItems[0] ?? null); setSourceOpen(true); }}>Open evidence ↗</button></section>}
        </section> : view === "Sketch" ? <Sketch nodes={activeNodes} approved={Boolean(persisted?.briefApproved)} /> : view === "Brief" ? <Brief approved={persisted?.briefApproved ?? briefApproved} frame={persisted?.frame} /> : view === "Story" ? <Storyboard storyboard={persisted?.storyboard} approved={persisted?.storyboardApproved ?? storyApproved} ready={Boolean(persisted?.style && !persisted.style.stale)} onChange={setPersisted} onApprove={() => { void mutate("approveStoryboard").then(() => setStoryApproved(true)); }} /> : view === "Design" ? <DesignReview style={persisted?.style} onLock={lockManualStyle} onWebsiteLock={lockWebsiteStyle} /> : <Trace state={persisted} />}
      </section>

      <aside className="studio" aria-label="Studio">
        <div className="rail-heading"><div><span className="eyebrow">DELIVER</span><h2>Studio</h2></div><button className="icon-button" aria-label="Studio options">•••</button></div>
        <section className="output-actions"><span>Output types</span><div><button onClick={() => { void generateOutput("deck"); }}>Deck</button><button onClick={() => { void generateOutput("infographic"); }}>Infographic</button><button onClick={() => { void createImageBatch(); }}>Images</button><button onClick={() => setView("Story")}>Storyboard</button><button disabled={!storyApproved} onClick={renderVideo}>Video</button></div></section>
        <section className="queue"><h3>Production queue</h3><article><span className="job-icon">▤</span><div><strong>Build Week deck</strong><small>Current · brief v1</small></div><span className="done">Ready</span></article><article><span className="job-icon">◫</span><div><strong>Visual contact sheet</strong><small>Current · 6 assets</small></div><span className="done">Ready</span></article><article className={!(persisted?.storyboardApproved ?? storyApproved) ? "blocked" : ""}><span className="job-icon">▷</span><div><strong>Meta-demo video</strong><small>{rendering ? "Rendering locally…" : (persisted?.videoState ?? "blocked") === "queued" ? "Queued in local worker" : (persisted?.storyboardApproved ?? storyApproved) ? "Storyboard approved" : "Needs storyboard approval"}</small></div><span>{rendering ? "…" : (persisted?.videoState ?? "blocked") === "queued" ? "Queued" : (persisted?.storyboardApproved ?? storyApproved) ? "Ready" : "Blocked"}</span></article></section>
        <section className="history"><h3>Output history</h3><button>FRAME.md <small>{persisted?.frame?.stale ? "stale" : persisted?.frame ? `v${persisted.frame.version} current` : "awaiting map approval"}</small></button><button>DESIGN.md <small>{persisted?.style ? `v${persisted.style.version} locked` : "awaiting lock"}</small></button>{persisted?.imageBatch && <div className="image-batch"><span>Image batch <small>{persisted.imageBatch.stale ? "stale" : `${persisted.imageBatch.panels.length} panels · ${persisted.imageBatch.referenceId}`}</small></span>{persisted.imageBatch.panels.map((panel) => <button key={panel.id} disabled={persisted.imageBatch?.stale} title={panel.prompt} onClick={() => { void regenerateImagePanel(panel.id); }}><span>{panel.id.replace("image-panel-", "Panel ")} · v{panel.version}</span><small>{panel.state === "selected_for_regeneration" ? "selected" : "Regenerate"}</small></button>)}</div>}{(persisted?.outputs ?? []).map((output) => <button key={output.id}>{output.type} <small>{output.stale ? "stale" : output.artifactPath}</small></button>)}</section>
      </aside>
      <footer className="host-strip"><span><i />Sanitized local fixture · sources and outputs persist locally</span><div><button className="capture-control" onClick={() => { setFallbackCaptureOpen(true); setFallbackCaptureStatus(null); }}>Capture fallback</button><button>Open Trace ↗</button></div></footer>

      {sourceOpen && selectedSource && <div className="evidence-sheet" role="dialog" aria-label="Evidence source"><div className="sheet-head"><div><span className="eyebrow">SOURCE EVIDENCE</span><h2>{selectedSource.title}</h2></div><button className="icon-button" onClick={() => setSourceOpen(false)}>×</button></div><p>“{selectedSource.excerpt}”</p><div className="locator-line">{selectedSource.locator}</div><button className="approve" onClick={() => { setSelected("promise"); setSourceOpen(false); }}>Show on Map</button></div>}
      {sourceInputOpen && <form className="evidence-sheet source-form" aria-label="Add source" onSubmit={(event) => { event.preventDefault(); void addSource(); }}><div className="sheet-head"><div><span className="eyebrow">CAPTURE</span><h2>Add local source</h2></div><button type="button" className="icon-button" onClick={() => setSourceInputOpen(false)}>×</button></div><label>Text file<input type="file" accept="text/plain,text/markdown,.txt,.md,.csv" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; void file.text().then((text) => { setSourceTitle(file.name); setSourceOrigin(`Local file · ${file.name}`); setSourceText(text); }); }} /></label><label>Text source title<input required value={sourceTitle} onChange={(event) => setSourceTitle(event.target.value)} placeholder="Sanitized meeting notes" /></label><label>Text source origin<input required value={sourceOrigin} onChange={(event) => setSourceOrigin(event.target.value)} placeholder="Local file or URL" /></label><label>Permission<select value={sourcePermission} onChange={(event) => setSourcePermission(event.target.value as SourceItem["permission"])}><option value="private">Private</option><option value="sanitized">Sanitized fixture</option><option value="shareable">Shareable</option></select></label><label>Source text<textarea required value={sourceText} onChange={(event) => setSourceText(event.target.value)} placeholder="Paste sanitized text from a local file or meeting." /></label><button className="approve" type="submit">Normalize & add text to Map</button><div className="source-divider"><span>or</span></div><label>Text-based PDF<input type="file" accept="application/pdf,.pdf" onChange={(event) => setSourceFile(event.target.files?.[0] ?? null)} /></label><button type="button" className="outline-action" disabled={!sourceFile} onClick={() => { void uploadPdf(); }}>Extract PDF text & add to Map</button><div className="source-divider"><span>or</span></div><label>Safe public URL<input type="url" value={sourceUrl} onChange={(event) => setSourceUrl(event.target.value)} placeholder="https://example.com" /></label><button type="button" className="outline-action" disabled={!sourceUrl.trim()} onClick={() => { void addPublicUrl(); }}>Fetch, normalize & add URL</button></form>}
      {fallbackCaptureOpen && <form className="evidence-sheet source-form fallback-capture" aria-label="Capture-only Realtime fallback" onSubmit={(event) => { event.preventDefault(); void captureFallbackTranscript(); }}><div className="sheet-head"><div><span className="eyebrow">CAPTURE-ONLY FALLBACK</span><h2>Save a transcript segment</h2></div><button type="button" className="icon-button" onClick={() => setFallbackCaptureOpen(false)}>×</button></div><p className="capture-note">Use only when native ChatGPT voice sync is unavailable. This is not a chat composer: it stores a bounded transcript segment as local source evidence.</p><label>Transcript segment<textarea required value={fallbackCaptureText} onChange={(event) => setFallbackCaptureText(event.target.value)} placeholder="Paste or dictate the captured segment here." /></label>{fallbackCaptureStatus && <small className="capture-status">{fallbackCaptureStatus}</small>}<button className="approve" type="submit">Capture to Workshop</button></form>}
    </main>
  );
}

function Brief({ approved, frame }: { approved: boolean; frame?: PersistedWorkshop["frame"] }) { return <section className="document"><div className="document-copy"><span className="eyebrow">EXECUTABLE BRIEF</span><h1>FRAME.md</h1><p className="lede">{frame?.markdown.split("\n").find((line) => line.startsWith("## Outcome")) ? frame.markdown.split("\n")[3] : "Approve the current Map to generate this source-grounded brief."}</p><pre className="frame-markdown">{frame?.markdown ?? "Preview only — no approved Map version yet."}</pre></div><aside><span className={approved && !frame?.stale ? "approved-label" : "pending-label"}>{approved && !frame?.stale ? `Map v${frame?.version ?? 1} approved` : frame?.stale ? "Map changed — stale" : "Preview only"}</span><dl><dt>Dependency</dt><dd>Current Map</dd><dt>Version</dt><dd>{frame ? `FRAME v${frame.version}` : "—"}</dd></dl></aside></section>; }
function Sketch({ nodes, approved }: { nodes: MapNode[]; approved: boolean }) { return <section className="sketch"><div><span className="eyebrow">REGENERABLE SKETCH</span><h1>Concept flow</h1><p>{approved ? "Current approved Map translated into a concise narrative flow." : "Preview generated from the current Map; approve the Map to lock this version."}</p></div><ol>{nodes.map((node, index) => <li key={node.id}><span>{index + 1}</span><div><strong>{node.title}</strong><p>{node.body}</p><small>{node.kind} · {node.locator}</small></div></li>)}</ol></section>; }
function DesignReview({ style, onLock, onWebsiteLock }: { style?: PersistedWorkshop["style"]; onLock: (input: ManualStylePayload) => Promise<void>; onWebsiteLock: (url: string) => Promise<void> }) { const [websiteUrl, setWebsiteUrl] = useState(""); const [websiteStatus, setWebsiteStatus] = useState<string | null>(null); const [name, setName] = useState(style?.name ?? "Editorial thinking instrument"); const [accent, setAccent] = useState(style?.accent ?? "#1668E3"); const [ink, setInk] = useState(style?.ink ?? "#171816"); const [paper, setPaper] = useState(style?.paper ?? "#F4F2EC"); const [logos, setLogos] = useState(style?.logos.join(", ") ?? ""); const [fonts, setFonts] = useState(style?.licensedFonts.join(", ") ?? ""); const [references, setReferences] = useState(style?.references.join(", ") ?? ""); const [negativeRules, setNegativeRules] = useState(style?.negativeRules.join(", ") ?? ""); const [intentProfile, setIntentProfile] = useState<ManualStylePayload["intentProfile"]>(style?.intentProfile ?? "client_facing_pitch"); const split = (value: string) => value.split(",").map((item) => item.trim()).filter(Boolean); async function captureWebsite() { try { setWebsiteStatus("Inspecting public site…"); await onWebsiteLock(websiteUrl); setWebsiteStatus("Website tokens locked."); } catch (error) { setWebsiteStatus(error instanceof Error ? error.message : "Website style capture failed"); } } async function lock() { try { setWebsiteStatus("Locking manual foundation…"); await onLock({ name, accent, ink, paper, logos: split(logos), licensedFonts: split(fonts), references: split(references), negativeRules: split(negativeRules), intentProfile }); setWebsiteStatus("Manual foundation locked."); } catch (error) { setWebsiteStatus(error instanceof Error ? error.message : "Manual style lock failed"); } } return <section className="document design-doc"><div className="document-copy"><span className="eyebrow">STYLE LIBRARY</span><h1>DESIGN.md</h1><div className="swatches"><i style={{ background: accent }} /><i style={{ background: ink }} /><i style={{ background: paper }} /><i /></div><h3>{style?.name ?? "Manual Brand Foundation"}</h3><p>Lock an inspectable foundation with exact hex colors, licensed inputs, references, negative rules, and an intent profile.</p><div className="manual-style-grid"><label>Name<input value={name} onChange={(event) => setName(event.target.value)} /></label><label>Intent<select value={intentProfile} onChange={(event) => setIntentProfile(event.target.value as ManualStylePayload["intentProfile"])}><option value="client_facing_pitch">Client-facing pitch</option><option value="board_deck">Board deck</option><option value="internal_workshop">Internal workshop</option></select></label><label>Accent hex<input value={accent} onChange={(event) => setAccent(event.target.value)} /></label><label>Ink hex<input value={ink} onChange={(event) => setInk(event.target.value)} /></label><label>Paper hex<input value={paper} onChange={(event) => setPaper(event.target.value)} /></label><label>Licensed fonts<input value={fonts} onChange={(event) => setFonts(event.target.value)} placeholder="Inter, Source Serif" /></label><label>Logos / asset refs<input value={logos} onChange={(event) => setLogos(event.target.value)} placeholder="local/logo.svg" /></label><label>Visual references<input value={references} onChange={(event) => setReferences(event.target.value)} placeholder="editorial grid, product photography" /></label><label>Negative rules<input value={negativeRules} onChange={(event) => setNegativeRules(event.target.value)} placeholder="no gradients, no stock clichés" /></label></div>{websiteStatus && <small className="capture-status">{websiteStatus}</small>}<button className="outline-action" onClick={() => { void lock(); }}>Lock manual style</button><label className="website-style">Public website URL<input type="url" value={websiteUrl} onChange={(event) => setWebsiteUrl(event.target.value)} placeholder="https://example.com" /></label><button className="outline-action" disabled={!websiteUrl} onClick={() => { void captureWebsite(); }}>Capture website style</button></div><aside><span className={style && !style.stale ? "approved-label" : "pending-label"}>{style && !style.stale ? `Style v${style.version} locked` : "Style not locked"}</span><dl><dt>Brand foundation</dt><dd>{style?.name ?? "Manual tokens"}</dd><dt>Intent</dt><dd>{style?.intentProfile?.replaceAll("_", " ") ?? "Client-facing pitch"}</dd><dt>Licensed fonts</dt><dd>{style?.licensedFonts.join(", ") || "—"}</dd><dt>Negative rules</dt><dd>{style?.negativeRules.join(", ") || "—"}</dd></dl></aside></section>; }
function Storyboard({ storyboard, approved, ready, onChange, onApprove }: { storyboard?: PersistedWorkshop["storyboard"]; approved: boolean; ready: boolean; onChange: (state: PersistedWorkshop) => void; onApprove: () => void }) { const [panelId, setPanelId] = useState(""); const panel = storyboard?.panels.find((item) => item.id === panelId) ?? storyboard?.panels[0]; const [title, setTitle] = useState(""); const [narration, setNarration] = useState(""); const [duration, setDuration] = useState(0); useEffect(() => { if (panel) { setPanelId(panel.id); setTitle(panel.title); setNarration(panel.narration); setDuration(panel.durationSeconds); } }, [panel?.id]); async function save() { if (!panel) return; const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "updateStoryboardPanel", panel: { id: panel.id, title, narration, durationSeconds: duration } }) }); const state = await response.json() as PersistedWorkshop & { error?: string }; if (!response.ok) throw new Error(state.error ?? "Storyboard edit failed"); onChange(state); } return <section className="storyboard"><div className="filmstrip">{(storyboard?.panels ?? []).map((item, index) => <button key={item.id} onClick={() => setPanelId(item.id)} className={item.id === panel?.id ? "frame selected-frame" : "frame"}><span>{index + 1}</span><strong>{item.title}</strong><small>0:{String(item.durationSeconds).padStart(2, "0")}</small></button>)}</div>{panel && <article className="panel-editor"><span className="eyebrow">EDITABLE PANEL · {panel.id}</span><label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>Narration<textarea value={narration} onChange={(event) => setNarration(event.target.value)} /></label><label>Seconds<input type="number" min="1" value={duration} onChange={(event) => setDuration(Number(event.target.value))} /></label><button className="approve" onClick={() => { void save(); }}>Save panel</button></article>}<button className="approve render-approve" disabled={approved || !ready || storyboard?.stale} onClick={onApprove}>{approved ? "Storyboard approved" : ready && !storyboard?.stale ? "Approve storyboard & render" : "Lock style or refresh Map"}</button></section>; }
function Trace({ state }: { state: PersistedWorkshop | null }) { const source = state?.sourceItems.find((item) => item.origin.includes("capture-only fallback")) ?? state?.sourceItems[0]; const chunk = state?.sourceChunks?.find((item) => item.sourceId === source?.id) ?? state?.sourceChunks?.[0]; const claim = state?.claims?.find((item) => item.chunkId === chunk?.id) ?? state?.claims?.[0]; const map = state?.mapNodes.find((item) => item.sourceId === source?.id) ?? state?.mapNodes[0]; const output = state?.outputs.find((item) => !item.stale) ?? state?.outputs[0]; const elapsed = state?.firstTranscriptAt && state.firstRenderedOutputAt ? Math.max(0, Date.parse(state.firstRenderedOutputAt) - Date.parse(state.firstTranscriptAt)) : undefined; const rows = [{ label: source ? `Source · ${source.title}` : "No persisted source selected" }, { label: chunk ? `Chunk · ${chunk.locator}` : "No chunk yet" }, { label: claim ? `Verified claim · ${claim.text}` : "No verified claim yet" }, { label: map ? `Map node · ${map.title}` : "No Map node yet" }, { label: state?.frame ? `FRAME.md · v${state.frame.version}${state.frame.stale ? " stale" : " current"}` : "No approved FRAME.md" }, { label: output ? `${output.type} · ${output.artifactPath}` : "No generated output yet" }]; return <section className="trace"><span className="eyebrow">WHY IS THIS HERE?</span><h1>Evidence trace</h1>{elapsed !== undefined && <p className="trace-metric">First transcript → first rendered output: <strong>{(elapsed / 1000).toFixed(1)}s</strong></p>}{rows.map((item, i) => <div className="trace-row" key={item.label}><span>{i + 1}</span><strong>{item.label}</strong>{i < rows.length - 1 && <i />}</div>)}</section>; }
