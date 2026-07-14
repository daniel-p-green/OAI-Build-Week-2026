"use client";

import { useEffect, useMemo, useState } from "react";

type View = "Map" | "Brief" | "Design" | "Story" | "Trace";
type SourceItem = { id: string; type: "TXT" | "PDF" | "WEB"; title: string; origin: string; claimCount: number; excerpt: string; locator: string };
type MapNode = { id: string; title: string; body: string; kind: "grounded" | "derived" | "creative"; locator: string; sourceId?: string; x: number; y: number };
type PersistedWorkshop = { briefApproved: boolean; storyboardApproved: boolean; videoState: "blocked" | "queued" | "rendering" | "rendered"; sourceItems: SourceItem[]; mapNodes: MapNode[]; storyboard: { version: number; stale: boolean; panels: { id: string; title: string; narration: string; durationSeconds: number; approved: boolean; stale: boolean }[] }; imageBatch?: { id: string; stale: boolean; panels: { id: string; version: number; state: string }[] }; outputs: { id: string; type: "deck" | "infographic"; stale: boolean; artifactPath: string }[]; frame?: { version: number; markdown: string; stale: boolean }; style?: { version: number; name: string; accent: string; ink: string; paper: string; stale: boolean } };

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
  const [sourceText, setSourceText] = useState("");
  const [nodeLabel, setNodeLabel] = useState("");
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
    const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "ingestSource", source: { title: sourceTitle, origin: sourceOrigin, text: sourceText } }) });
    const state = await response.json() as PersistedWorkshop & { error?: string };
    if (!response.ok) throw new Error(state.error ?? "Source ingestion failed");
    setPersisted(state);
    setSelected(state.mapNodes.at(-1)?.id ?? "promise");
    setSourceInputOpen(false);
    setSourceTitle(""); setSourceText("");
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
  async function generateOutput(outputType: "deck" | "infographic") {
    const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "generateOutput", outputType }) });
    const state = await response.json() as PersistedWorkshop & { error?: string };
    if (!response.ok) throw new Error(state.error ?? "Output generation failed");
    setPersisted(state);
  }
  async function createImageBatch() { const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "createImageBatch" }) }); const state = await response.json() as PersistedWorkshop & { error?: string }; if (!response.ok) throw new Error(state.error ?? "Image batch creation failed"); setPersisted(state); }

  return (
    <main className="workspace">
      <header className="topbar">
        <div className="title-lockup"><span className="mark">W</span><span>Workshop</span><button className="switcher">WorkshopLM Build Week <span>⌄</span></button></div>
        <div className="topmeta"><span className="sync"><i />Synced to ChatGPT task</span><button className="quiet">Trace</button><button className="quiet">•••</button></div>
      </header>

      <aside className="sources" aria-label="Sources">
        <div className="rail-heading"><div><span className="eyebrow">CAPTURE</span><h2>Sources</h2></div><button className="icon-button" aria-label="Add source" onClick={() => setSourceInputOpen(true)}>+</button></div>
        <div className="source-group">Selected for this Map <span>{persisted?.sourceItems.length ?? "…"}</span></div>
        <div className="source-list">
          {(persisted?.sourceItems ?? []).map((source, index) => <button className={`source-row ${index === 0 ? "active-source" : ""}`} onClick={() => { setSelectedSource(source); setSourceOpen(true); }} key={source.id}>
            <span className="file-type">{source.type}</span><span className="source-copy"><strong>{source.title}</strong><small>{source.origin} · indexed</small></span><span className="claim-count">{source.claimCount} claims</span>
          </button>)}
        </div>
        <div className="source-footer"><span className="ground-dot" />All selected sources are indexed</div>
      </aside>

      <section className="center" aria-label="Workshop canvas">
        <nav className="views" aria-label="Workspace view">
          {(["Map", "Brief", "Design", "Story", "Trace"] as View[]).map((item) => <button key={item} className={view === item ? "selected" : ""} onClick={() => setView(item)}>{item}{item === "Brief" && briefApproved ? <em>approved</em> : null}</button>)}
          <span className="view-spacer" />
          {view === "Map" && <button className="approve" onClick={() => { void mutate("approveBrief").then(() => { setBriefApproved(true); setView("Brief"); }); }}>Approve map as brief</button>}
        </nav>
        {view === "Map" ? <section className="map" aria-label="Semantic Map">
          <div className="map-label">Evidence becoming structure</div>
          <svg className="threads" viewBox="0 0 900 620" aria-hidden="true"><path d="M210 180 C340 110 430 135 510 180" /><path d="M240 225 C335 340 430 380 475 410" /><path d="M580 220 C665 305 690 390 700 435" /></svg>
          {activeNodes.map((node) => <button key={node.id} className={`claim-card ${node.kind} ${selected === node.id ? "focus" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => { setSelected(node.id); setNodeLabel(node.title); }}>
            <span className="claim-kind">{node.kind === "grounded" ? "Grounded" : node.kind === "derived" ? "Derived" : "Creative"}</span><strong>{node.title}</strong><span>{node.body}</span><small>{node.locator}</small>
          </button>)}
          <div className="cluster cluster-one">Narrative</div><div className="cluster cluster-two">Delivery proof</div>
          {selectedNode && <section className="map-inspector"><span className={`state-dot ${selectedNode.kind}`} /><div><input aria-label="Map node title" value={nodeLabel || selectedNode.title} onChange={(event) => setNodeLabel(event.target.value)} /><p>{selectedNode.locator}</p></div><button onClick={() => { void editSelectedNode(); }}>Save edit</button><button onClick={() => { void undoMapEdit(); }}>Undo</button><button onClick={() => { setSelectedSource(persisted?.sourceItems.find((source) => source.id === selectedNode.sourceId) ?? persisted?.sourceItems[0] ?? null); setSourceOpen(true); }}>Open evidence ↗</button></section>}
        </section> : view === "Brief" ? <Brief approved={persisted?.briefApproved ?? briefApproved} frame={persisted?.frame} /> : view === "Story" ? <Storyboard storyboard={persisted?.storyboard} approved={persisted?.storyboardApproved ?? storyApproved} ready={Boolean(persisted?.style && !persisted.style.stale)} onChange={setPersisted} onApprove={() => { void mutate("approveStoryboard").then(() => setStoryApproved(true)); }} /> : view === "Design" ? <DesignReview style={persisted?.style} onLock={() => { void mutate("lockManualStyle"); }} /> : <Trace />}
      </section>

      <aside className="studio" aria-label="Studio">
        <div className="rail-heading"><div><span className="eyebrow">DELIVER</span><h2>Studio</h2></div><button className="icon-button" aria-label="Studio options">•••</button></div>
        <section className="output-actions"><span>Output types</span><div><button onClick={() => { void generateOutput("deck"); }}>Deck</button><button onClick={() => { void generateOutput("infographic"); }}>Infographic</button><button onClick={() => { void createImageBatch(); }}>Images</button><button onClick={() => setView("Story")}>Storyboard</button><button disabled={!storyApproved} onClick={renderVideo}>Video</button></div></section>
        <section className="queue"><h3>Production queue</h3><article><span className="job-icon">▤</span><div><strong>Build Week deck</strong><small>Current · brief v1</small></div><span className="done">Ready</span></article><article><span className="job-icon">◫</span><div><strong>Visual contact sheet</strong><small>Current · 6 assets</small></div><span className="done">Ready</span></article><article className={!(persisted?.storyboardApproved ?? storyApproved) ? "blocked" : ""}><span className="job-icon">▷</span><div><strong>Meta-demo video</strong><small>{rendering ? "Rendering locally…" : (persisted?.videoState ?? "blocked") === "queued" ? "Queued in local worker" : (persisted?.storyboardApproved ?? storyApproved) ? "Storyboard approved" : "Needs storyboard approval"}</small></div><span>{rendering ? "…" : (persisted?.videoState ?? "blocked") === "queued" ? "Queued" : (persisted?.storyboardApproved ?? storyApproved) ? "Ready" : "Blocked"}</span></article></section>
        <section className="history"><h3>Output history</h3><button>FRAME.md <small>{persisted?.frame?.stale ? "stale" : persisted?.frame ? `v${persisted.frame.version} current` : "awaiting map approval"}</small></button><button>DESIGN.md <small>{persisted?.style ? `v${persisted.style.version} locked` : "awaiting lock"}</small></button>{persisted?.imageBatch && <button>Image batch <small>{persisted.imageBatch.stale ? "stale" : `${persisted.imageBatch.panels.length} planned panels`}</small></button>}{(persisted?.outputs ?? []).map((output) => <button key={output.id}>{output.type} <small>{output.stale ? "stale" : output.artifactPath}</small></button>)}</section>
      </aside>
      <footer className="host-strip"><span><i />Linked ChatGPT task · last grounded update just now</span><button>Continue in ChatGPT ↗</button></footer>

      {sourceOpen && selectedSource && <div className="evidence-sheet" role="dialog" aria-label="Evidence source"><div className="sheet-head"><div><span className="eyebrow">SOURCE EVIDENCE</span><h2>{selectedSource.title}</h2></div><button className="icon-button" onClick={() => setSourceOpen(false)}>×</button></div><p>“{selectedSource.excerpt}”</p><div className="locator-line">{selectedSource.locator}</div><button className="approve" onClick={() => { setSelected("promise"); setSourceOpen(false); }}>Show on Map</button></div>}
      {sourceInputOpen && <form className="evidence-sheet source-form" aria-label="Add source" onSubmit={(event) => { event.preventDefault(); void addSource(); }}><div className="sheet-head"><div><span className="eyebrow">CAPTURE</span><h2>Add local source</h2></div><button type="button" className="icon-button" onClick={() => setSourceInputOpen(false)}>×</button></div><label>Text file<input type="file" accept="text/plain,text/markdown,.txt,.md,.csv" onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; void file.text().then((text) => { setSourceTitle(file.name); setSourceOrigin(`Local file · ${file.name}`); setSourceText(text); }); }} /></label><label>Title<input required value={sourceTitle} onChange={(event) => setSourceTitle(event.target.value)} placeholder="Sanitized meeting notes" /></label><label>Origin<input required value={sourceOrigin} onChange={(event) => setSourceOrigin(event.target.value)} placeholder="Local file or URL" /></label><label>Source text<textarea required value={sourceText} onChange={(event) => setSourceText(event.target.value)} placeholder="Paste sanitized text from a local file, URL capture, or meeting." /></label><button className="approve" type="submit">Normalize & add to Map</button></form>}
    </main>
  );
}

function Brief({ approved, frame }: { approved: boolean; frame?: PersistedWorkshop["frame"] }) { return <section className="document"><div className="document-copy"><span className="eyebrow">EXECUTABLE BRIEF</span><h1>FRAME.md</h1><p className="lede">{frame?.markdown.split("\n").find((line) => line.startsWith("## Outcome")) ? frame.markdown.split("\n")[3] : "Approve the current Map to generate this source-grounded brief."}</p><pre className="frame-markdown">{frame?.markdown ?? "Preview only — no approved Map version yet."}</pre></div><aside><span className={approved && !frame?.stale ? "approved-label" : "pending-label"}>{approved && !frame?.stale ? `Map v${frame?.version ?? 1} approved` : frame?.stale ? "Map changed — stale" : "Preview only"}</span><dl><dt>Dependency</dt><dd>Current Map</dd><dt>Version</dt><dd>{frame ? `FRAME v${frame.version}` : "—"}</dd></dl></aside></section>; }
function DesignReview({ style, onLock }: { style?: PersistedWorkshop["style"]; onLock: () => void }) { return <section className="document design-doc"><div className="document-copy"><span className="eyebrow">STYLE LIBRARY</span><h1>DESIGN.md</h1><div className="swatches"><i /><i /><i /><i /></div><h3>{style?.name ?? "Manual Brand Foundation"}</h3><p>Manual, inspectable tokens for the judge-facing production path. Lock this version before approving the storyboard.</p></div><aside><span className={style && !style.stale ? "approved-label" : "pending-label"}>{style && !style.stale ? `Style v${style.version} locked` : "Style not locked"}</span><dl><dt>Brand foundation</dt><dd>Manual tokens</dd><dt>Intent</dt><dd>Judge-facing demo</dd></dl><button className="approve" onClick={onLock}>Lock manual style</button></aside></section>; }
function Storyboard({ storyboard, approved, ready, onChange, onApprove }: { storyboard?: PersistedWorkshop["storyboard"]; approved: boolean; ready: boolean; onChange: (state: PersistedWorkshop) => void; onApprove: () => void }) { const [panelId, setPanelId] = useState(""); const panel = storyboard?.panels.find((item) => item.id === panelId) ?? storyboard?.panels[0]; const [title, setTitle] = useState(""); const [narration, setNarration] = useState(""); const [duration, setDuration] = useState(0); useEffect(() => { if (panel) { setPanelId(panel.id); setTitle(panel.title); setNarration(panel.narration); setDuration(panel.durationSeconds); } }, [panel?.id]); async function save() { if (!panel) return; const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "updateStoryboardPanel", panel: { id: panel.id, title, narration, durationSeconds: duration } }) }); const state = await response.json() as PersistedWorkshop & { error?: string }; if (!response.ok) throw new Error(state.error ?? "Storyboard edit failed"); onChange(state); } return <section className="storyboard"><div className="filmstrip">{(storyboard?.panels ?? []).map((item, index) => <button key={item.id} onClick={() => setPanelId(item.id)} className={item.id === panel?.id ? "frame selected-frame" : "frame"}><span>{index + 1}</span><strong>{item.title}</strong><small>0:{String(item.durationSeconds).padStart(2, "0")}</small></button>)}</div>{panel && <article className="panel-editor"><span className="eyebrow">EDITABLE PANEL · {panel.id}</span><label>Title<input value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>Narration<textarea value={narration} onChange={(event) => setNarration(event.target.value)} /></label><label>Seconds<input type="number" min="1" value={duration} onChange={(event) => setDuration(Number(event.target.value))} /></label><button className="approve" onClick={() => { void save(); }}>Save panel</button></article>}<button className="approve render-approve" disabled={approved || !ready || storyboard?.stale} onClick={onApprove}>{approved ? "Storyboard approved" : ready && !storyboard?.stale ? "Approve storyboard & render" : "Lock style or refresh Map"}</button></section>; }
function Trace() { return <section className="trace"><span className="eyebrow">WHY IS THIS HERE?</span><h1>Evidence trace</h1>{["Brief.pdf · p. 7", "chunk_004 · supporting quote", "claim · judge proof", "Map node · delivery proof", "FRAME.md · core proof"].map((item, i) => <div className="trace-row" key={item}><span>{i + 1}</span><strong>{item}</strong>{i < 4 && <i />}</div>)}</section>; }
