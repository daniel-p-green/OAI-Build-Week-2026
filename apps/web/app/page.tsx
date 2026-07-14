"use client";

import { useEffect, useMemo, useState } from "react";

type View = "Map" | "Brief" | "Design" | "Story" | "Trace";
type Claim = "promise" | "proof" | "visual" | "risk";

const nodes: Array<{ id: Claim; title: string; body: string; kind: "grounded" | "derived" | "creative"; locator: string; x: number; y: number }> = [
  { id: "promise", title: "The product promise", body: "Turn raw thinking into finished work without losing the trail back to source material.", kind: "grounded", locator: "Meeting · 12:41", x: 11, y: 18 },
  { id: "proof", title: "Judge proof", body: "Show one continuous capture → map → brief → storyboard → rendered video seam.", kind: "grounded", locator: "Build notes · §2", x: 48, y: 12 },
  { id: "visual", title: "Visual behavior", body: "Evidence first becomes an editable production system, not a static report.", kind: "creative", locator: "Design · Map", x: 39, y: 54 },
  { id: "risk", title: "Voice capture fallback", body: "Use a capture-only control when durable native voice linkage is not proven.", kind: "derived", locator: "Goal · capture", x: 70, y: 58 },
];

const sources = [
  ["TXT", "Raw voice brainstorm", "ChatGPT task", "5 claims"],
  ["PDF", "Build Week brief", "Local", "3 claims"],
  ["WEB", "WorkshopLM direction", "Local", "2 claims"],
];

export default function WorkshopPage() {
  const [view, setView] = useState<View>("Map");
  const [selected, setSelected] = useState<Claim>("promise");
  const [briefApproved, setBriefApproved] = useState(false);
  const [storyApproved, setStoryApproved] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [persisted, setPersisted] = useState<{ briefApproved: boolean; storyboardApproved: boolean; videoState: "blocked" | "queued" | "rendering" | "rendered" } | null>(null);
  const selectedNode = useMemo(() => nodes.find((node) => node.id === selected)!, [selected]);

  useEffect(() => { fetch("/api/workshop").then((response) => response.ok ? response.json() : null).then(setPersisted).catch(() => setPersisted(null)); }, []);
  async function mutate(action: "approveBrief" | "approveStoryboard" | "renderVideo") {
    const response = await fetch("/api/workshop", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action }) });
    const state = await response.json() as { error?: string; briefApproved?: boolean; storyboardApproved?: boolean; videoState?: "blocked" | "queued" | "rendering" | "rendered" };
    if (!response.ok) throw new Error(state.error ?? "Workshop action failed");
    setPersisted(state as NonNullable<typeof persisted>);
  }

  function renderVideo() {
    setRendering(true);
    void mutate("renderVideo").finally(() => setRendering(false));
  }

  return (
    <main className="workspace">
      <header className="topbar">
        <div className="title-lockup"><span className="mark">W</span><span>Workshop</span><button className="switcher">WorkshopLM Build Week <span>⌄</span></button></div>
        <div className="topmeta"><span className="sync"><i />Synced to ChatGPT task</span><button className="quiet">Trace</button><button className="quiet">•••</button></div>
      </header>

      <aside className="sources" aria-label="Sources">
        <div className="rail-heading"><div><span className="eyebrow">CAPTURE</span><h2>Sources</h2></div><button className="icon-button" aria-label="Add source">+</button></div>
        <div className="source-group">Selected for this Map <span>3</span></div>
        <div className="source-list">
          {sources.map(([type, title, origin, claims], index) => <button className={`source-row ${index === 0 ? "active-source" : ""}`} onClick={() => setSourceOpen(true)} key={title}>
            <span className="file-type">{type}</span><span className="source-copy"><strong>{title}</strong><small>{origin} · indexed</small></span><span className="claim-count">{claims}</span>
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
          {nodes.map((node) => <button key={node.id} className={`claim-card ${node.kind} ${selected === node.id ? "focus" : ""}`} style={{ left: `${node.x}%`, top: `${node.y}%` }} onClick={() => setSelected(node.id)}>
            <span className="claim-kind">{node.kind === "grounded" ? "Grounded" : node.kind === "derived" ? "Derived" : "Creative"}</span><strong>{node.title}</strong><span>{node.body}</span><small>{node.locator}</small>
          </button>)}
          <div className="cluster cluster-one">Narrative</div><div className="cluster cluster-two">Delivery proof</div>
          <section className="map-inspector"><span className={`state-dot ${selectedNode.kind}`} /><div><strong>{selectedNode.title}</strong><p>{selectedNode.locator}</p></div><button onClick={() => setSourceOpen(true)}>Open evidence ↗</button></section>
        </section> : view === "Brief" ? <Brief approved={persisted?.briefApproved ?? briefApproved} /> : view === "Story" ? <Storyboard approved={persisted?.storyboardApproved ?? storyApproved} onApprove={() => { void mutate("approveStoryboard").then(() => setStoryApproved(true)); }} /> : view === "Design" ? <DesignReview /> : <Trace />}
      </section>

      <aside className="studio" aria-label="Studio">
        <div className="rail-heading"><div><span className="eyebrow">DELIVER</span><h2>Studio</h2></div><button className="icon-button" aria-label="Studio options">•••</button></div>
        <section className="output-actions"><span>Output types</span><div><button>Deck</button><button>Infographic</button><button>Images</button><button onClick={() => setView("Story")}>Storyboard</button><button disabled={!storyApproved} onClick={renderVideo}>Video</button></div></section>
        <section className="queue"><h3>Production queue</h3><article><span className="job-icon">▤</span><div><strong>Build Week deck</strong><small>Current · brief v1</small></div><span className="done">Ready</span></article><article><span className="job-icon">◫</span><div><strong>Visual contact sheet</strong><small>Current · 6 assets</small></div><span className="done">Ready</span></article><article className={!(persisted?.storyboardApproved ?? storyApproved) ? "blocked" : ""}><span className="job-icon">▷</span><div><strong>Meta-demo video</strong><small>{rendering ? "Rendering locally…" : (persisted?.videoState ?? "blocked") === "queued" ? "Queued in local worker" : (persisted?.storyboardApproved ?? storyApproved) ? "Storyboard approved" : "Needs storyboard approval"}</small></div><span>{rendering ? "…" : (persisted?.videoState ?? "blocked") === "queued" ? "Queued" : (persisted?.storyboardApproved ?? storyApproved) ? "Ready" : "Blocked"}</span></article></section>
        <section className="history"><h3>Output history</h3><button>FRAME.md <small>{briefApproved ? "v1 current" : "awaiting map approval"}</small></button><button>DESIGN.md <small>v1 locked</small></button></section>
      </aside>
      <footer className="host-strip"><span><i />Linked ChatGPT task · last grounded update just now</span><button>Continue in ChatGPT ↗</button></footer>

      {sourceOpen && <div className="evidence-sheet" role="dialog" aria-label="Evidence source"><div className="sheet-head"><div><span className="eyebrow">SOURCE EVIDENCE</span><h2>Raw voice brainstorm</h2></div><button className="icon-button" onClick={() => setSourceOpen(false)}>×</button></div><p>“The judge should be able to see the messy original thought become a cited map, a real brief, and a finished piece of work.”</p><div className="locator-line">ChatGPT task · 12:41 · chunk 04</div><button className="approve" onClick={() => { setSelected("promise"); setSourceOpen(false); }}>Show on Map</button></div>}
    </main>
  );
}

function Brief({ approved }: { approved: boolean }) { return <section className="document"><div className="document-copy"><span className="eyebrow">EXECUTABLE BRIEF</span><h1>FRAME.md</h1><p className="lede">A source-grounded plan for proving WorkshopLM turns raw thinking into finished work.</p><h3>Audience</h3><p>Build Week judges evaluating a Work &amp; Productivity product.</p><h3>Core proof</h3><p>One visible chain links the raw brainstorm, cited Map, styled outputs, editable storyboard, and rendered video.</p></div><aside><span className={approved ? "approved-label" : "pending-label"}>{approved ? "Map v1 approved" : "Preview only"}</span><dl><dt>Sources</dt><dd>3 selected</dd><dt>Claims</dt><dd>5 grounded</dd><dt>Dependency</dt><dd>Map v1</dd></dl></aside></section>; }
function DesignReview() { return <section className="document design-doc"><div className="document-copy"><span className="eyebrow">STYLE LIBRARY</span><h1>DESIGN.md</h1><div className="swatches"><i /><i /><i /><i /></div><h3>Editorial thinking instrument</h3><p>Warm paper, hairline structure, Newsreader titles, and evidence-state color used only with text labels.</p></div><aside><span className="approved-label">Style v1 locked</span><dl><dt>Brand foundation</dt><dd>Manual tokens</dd><dt>Intent</dt><dd>Judge-facing demo</dd><dt>Visual DNA</dt><dd>Current</dd></dl></aside></section>; }
function Storyboard({ approved, onApprove }: { approved: boolean; onApprove: () => void }) { return <section className="storyboard"><div className="filmstrip">{["Raw thought", "Cited Map", "Approved brief", "Finished work"].map((label, index) => <button key={label} className={index === 1 ? "frame selected-frame" : "frame"}><span>{index + 1}</span><strong>{label}</strong><small>0:0{index + 3}</small></button>)}</div><article className="panel-editor"><span className="eyebrow">PANEL 2 · GROUNDED MAP</span><h1>Messy turns settle into cited clusters.</h1><p>Each card shows an evidence state and an inspectable source locator. Narration is AI-generated and disclosed.</p><div><span className="grounded-tag">Grounded · 2 sources</span><span>Duration 0:05</span></div></article><button className="approve render-approve" disabled={approved} onClick={onApprove}>{approved ? "Storyboard approved" : "Approve storyboard & render"}</button></section>; }
function Trace() { return <section className="trace"><span className="eyebrow">WHY IS THIS HERE?</span><h1>Evidence trace</h1>{["Brief.pdf · p. 7", "chunk_004 · supporting quote", "claim · judge proof", "Map node · delivery proof", "FRAME.md · core proof"].map((item, i) => <div className="trace-row" key={item}><span>{i + 1}</span><strong>{item}</strong>{i < 4 && <i />}</div>)}</section>; }
