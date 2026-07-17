import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { analyzeWebsiteStyle, applyMapOperation, applyStyleLibrary, applyWorkshopAction, approveSketch, approveVisualDna, assertStoryboardGrounding, beginWebsiteStyleAnalysis, captureFallbackTranscript, captureImportedTranscript, createImageBatch, createSketch, createVisualDna, createWorkshop, dismissWorkshopOrientation, extractWorkshopCandidates, fetchWebsiteBrandAsset, generateAssetPlan, generateAudioOverview, generateOutput, generateStoryboard, ingestSource, ingestUrl, listStyleLibrary, listWorkshopSummaries, lockManualStyle, lockWebsiteStyle, markImagePanelFailed, normalizePdfLayoutText, readWorkshopState, recordGeneratedImagePanel, recordOutputFailure, repairBenignCanvasNormalization, resolveWorkshopArtifact, runWebsiteStyleAnalysis, searchWorkshopSources, selectImagePanelForRegeneration, selectWorkshop, sendConversationMessage, setActiveSourceScope, syncMapCanvas, undoMapOperation, updateAudioOverview, updateStoryboardPanel, updateWorkshopOnboarding } from "./workshop-service.js";
describe("Workshop service", () => { it("persists brief/style/storyboard gates and blocks video until the storyboard is approved", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-service-")); expect(() => applyWorkshopAction("renderVideo", root)).toThrow(/storyboard/); const brief = applyWorkshopAction("approveBrief", root); expect(brief.frame).toMatchObject({ markdownPath: "generated/FRAME-v1.md", executablePath: "generated/FRAME-v1.json" }); expect(await readFile(join(root, brief.frame!.markdownPath), "utf8")).toContain("# FRAME.md"); expect(JSON.parse(await readFile(join(root, brief.frame!.executablePath), "utf8"))).toMatchObject({ frameVersion: 1, schemaVersion: 1, evidence: expect.any(Array) }); applyWorkshopAction("lockManualStyle", root); expect(applyWorkshopAction("approveStoryboard", root).storyboardApproved).toBe(true); expect(applyWorkshopAction("renderVideo", root).videoState).toBe("queued"); expect(readWorkshopState(root).briefApproved).toBe(true); await rm(root, { recursive: true, force: true }); });
it("opens a genuinely fresh data root in durable onboarding and preserves outcome, name, and orientation state", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-onboarding-"));
  const priorFixtureMode = process.env.WORKSHOPLM_SEEDED_FIXTURE;
  delete process.env.WORKSHOPLM_SEEDED_FIXTURE;
  try {
    const fresh = readWorkshopState(root);
    expect(fresh).toMatchObject({ sources: 0, mapNodes: [], onboarding: { step: "welcome", mapOrientationDismissed: false, outputsOrientationDismissed: false } });
    const sourceStep = updateWorkshopOnboarding({ title: "Acme leadership update", outcome: "board_deck", step: "sources" }, root);
    expect(sourceStep).toMatchObject({ title: "Acme leadership update", style: undefined, onboarding: { step: "sources", outcome: "board_deck" } });
    expect(() => updateWorkshopOnboarding({ step: "complete" }, root)).toThrow(/source/);
    await ingestSource({ title: "Leadership notes", origin: "Fixture", text: "Leadership needs a source-defensible recommendation." }, root);
    const complete = updateWorkshopOnboarding({ step: "complete" }, root);
    expect(complete).toMatchObject({ style: undefined, onboarding: { step: "complete", outcome: "board_deck", mapOrientationDismissed: false } });
    expect(dismissWorkshopOrientation("map", root).onboarding.mapOrientationDismissed).toBe(true);
    expect(readWorkshopState(root)).toMatchObject({ title: "Acme leadership update", onboarding: { step: "complete", outcome: "board_deck", mapOrientationDismissed: true } });
  } finally {
    if (priorFixtureMode === undefined) delete process.env.WORKSHOPLM_SEEDED_FIXTURE;
    else process.env.WORKSHOPLM_SEEDED_FIXTURE = priorFixtureMode;
    await rm(root, { recursive: true, force: true });
  }
});
it("persists website Style analysis while source work proceeds and ignores stale completions", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-style-analysis-"));
  const started = beginWebsiteStyleAnalysis("https://example.com/brand", root);
  expect(started.onboarding.styleAnalysis).toMatchObject({ status: "reviewing", url: "https://example.com/brand" });
  expect(started.sourceItems).toHaveLength(3);
  expect(updateWorkshopOnboarding({ outcome: "board_deck", step: "sources" }, root).onboarding.step).toBe("sources");

  beginWebsiteStyleAnalysis("https://example.org/brand", root);
  const ignored = await runWebsiteStyleAnalysis("https://example.com/brand", root, (async () => new Response('<html><head><title>Old brand</title></head><body></body></html>', { status: 200, headers: { "content-type": "text/html" } })) as typeof fetch);
  expect(ignored.onboarding.styleAnalysis).toMatchObject({ status: "reviewing", url: "https://example.org/brand" });

  const ready = await runWebsiteStyleAnalysis("https://example.org/brand", root, (async () => new Response('<html><head><title>Current brand</title><meta name="theme-color" content="#2457D6"></head><body><img class="brand-logo" src="/logo.svg"></body></html>', { status: 200, headers: { "content-type": "text/html" } })) as typeof fetch);
  expect(ready.onboarding.styleAnalysis).toMatchObject({ status: "ready", url: "https://example.org/brand", suggestion: { name: "Current brand foundation", accent: "#2457D6", logos: ["https://example.org/logo.svg"] } });
  expect(ready.sourceItems).toHaveLength(3);

  beginWebsiteStyleAnalysis("https://example.net/brand", root);
  const failed = await runWebsiteStyleAnalysis("https://example.net/brand", root, async () => { throw new Error("Fixture network failure"); });
  expect(failed.onboarding.styleAnalysis).toMatchObject({ status: "error", errorCode: "scan_failed", error: "WorkshopLM could not review this website. Try again, set the Style manually, or use a clean default." });
  await rm(root, { recursive: true, force: true });
});
it("classifies website Style failures without exposing internals and preserves every fallback", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-style-failures-"));
  expect(() => beginWebsiteStyleAnalysis("not a website", root)).toThrow(/valid HTTP/);

  beginWebsiteStyleAnalysis("https://example.com/dynamic", root);
  const dynamic = await runWebsiteStyleAnalysis("https://example.com/dynamic", root, (async () => new Response('<html><body><div id="root"></div><script src="/app.js"></script></body></html>', { status: 200, headers: { "content-type": "text/html" } })) as typeof fetch);
  expect(dynamic.onboarding.styleAnalysis).toMatchObject({ status: "error", errorCode: "dynamic_site", error: expect.stringContaining("loads its visual system with JavaScript") });

  beginWebsiteStyleAnalysis("https://example.com/plain", root);
  const empty = await runWebsiteStyleAnalysis("https://example.com/plain", root, (async () => new Response("<html><head><title>Plain page</title></head><body>Company information without a public visual system.</body></html>", { status: 200, headers: { "content-type": "text/html" } })) as typeof fetch);
  expect(empty.onboarding.styleAnalysis).toMatchObject({ status: "error", errorCode: "no_useful_findings", error: expect.stringContaining("could not find usable public colors") });

  beginWebsiteStyleAnalysis("https://example.com/redirect", root);
  const redirected = await runWebsiteStyleAnalysis("https://example.com/redirect", root, (async () => new Response(null, { status: 302, headers: { location: "/again" } })) as typeof fetch);
  expect(redirected.onboarding.styleAnalysis).toMatchObject({ status: "error", errorCode: "redirect", error: expect.stringContaining("redirected too many times") });

  beginWebsiteStyleAnalysis("https://example.com/private", root);
  const privateTarget = await runWebsiteStyleAnalysis("https://example.com/private", root, (async () => new Response(null, { status: 302, headers: { location: "http://127.0.0.1/private" } })) as typeof fetch);
  expect(privateTarget.onboarding.styleAnalysis).toMatchObject({ status: "error", errorCode: "private_network", error: expect.stringContaining("private or local-network") });

  expect(lockManualStyle({ name: "Clean professional", intentProfile: "board_deck" }, root).style).toMatchObject({ name: "Clean professional", typographyRoles: { heading: { family: "system-ui", availability: "system" }, body: { family: "system-ui", availability: "system" } } });
  await rm(root, { recursive: true, force: true });
});
it("creates, lists, selects, and isolates durable Workshops", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-collection-"));
  const original = readWorkshopState(root);
  const created = createWorkshop("Client launch", root);
  expect(created).toMatchObject({ id: "workshop-client-launch", title: "Client launch", sources: 0, outputs: [], mapNodes: [] });
  expect(readWorkshopState(root).id).toBe(created.id);
  await ingestSource({ title: "Client notes", origin: "Fixture", text: "A separate Workshop keeps this evidence isolated." }, root);
  applyWorkshopAction("approveBrief", root);
  lockManualStyle({}, root);
  const generated = await generateOutput("deck", root);
  expect(generated.outputs[0]?.relativePath).toBe("generated/workshop-client-launch/deck-v1.deck.html");
  expect(readWorkshopState(root, original.id)).toMatchObject({ id: original.id, sources: 3, outputs: [] });
  expect(selectWorkshop(original.id, root).id).toBe(original.id);
  expect(listWorkshopSummaries(root)).toEqual(expect.arrayContaining([
    expect.objectContaining({ id: original.id, active: true, sources: 3 }),
    expect.objectContaining({ id: created.id, active: false, sources: 1, outputs: 1 }),
  ]));
  expect(createWorkshop("Client launch", root).id).toBe("workshop-client-launch-2");
  await rm(root, { recursive: true, force: true });
});
it("normalizes a sanitized source into durable chunks, claims, permissions, and typed grounded Map records", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-ingest-")); const ingested = await ingestSource({ title: "Sanitized meeting", origin: "Local fixture", text: "  Judges need a visible trail.\r\n\r\nThe Map must remain editable.  " }, root); const sourceId = ingested.sourceItems.at(-1)!.id; expect(ingested.sources).toBe(4); expect(ingested.sourceItems.at(-1)).toMatchObject({ title: "Sanitized meeting", origin: "Local fixture", type: "TXT", permission: "sanitized" }); expect(ingested.sourceChunks.filter((chunk) => chunk.sourceId === sourceId).at(-1)).toMatchObject({ sourceId, locator: "Local fixture · chunk 02" }); const claims = ingested.claims.filter((claim) => claim.sourceId === sourceId); expect(claims).toHaveLength(2); expect(searchWorkshopSources("editable Map", root).filter((chunk) => chunk.sourceId === sourceId)).toHaveLength(1); expect(ingested.mapNodes.filter((node) => node.sourceId === sourceId)).toMatchObject([{ id: claims[0]!.id, title: "Judges need a visible trail", body: "Judges need a visible trail", kind: "grounded" }, { id: claims[1]!.id, title: "The Map must remain editable", body: "The Map must remain editable", kind: "grounded" }]); expect(ingested.graphState).toContain("operation-source-"); expect(ingested.graphState).toContain('"actor":"system"'); const repeated = await ingestSource({ title: "Sanitized meeting", origin: "Local fixture", text: "Judges need a visible trail.\n\nThe Map must remain editable." }, root); expect(repeated.sources).toBe(4); await rm(root, { recursive: true, force: true }); });
it("turns realistic meeting notes into a six-idea grounded Map and a concise executable Brief", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-professional-shape-"));
  const priorFixtureMode = process.env.WORKSHOPLM_SEEDED_FIXTURE;
  delete process.env.WORKSHOPLM_SEEDED_FIXTURE;
  try {
    const text = "Professional teams lose hours turning meeting notes into client-ready presentations. WorkshopLM organizes messy thinking into a grounded Map, then creates an editable Presentation with every factual claim linked to its exact source.\n\nThe recommended workflow is Capture, Shape, Create. The professional reviews the Brief before creating professional knowledge work and reviews the Storyboard before video rendering.\n\nCompany Style keeps colors, typography, and layout rules consistent across presentations, diagrams, images, and video. The goal is professional work a consultant can defend and present without rebuilding it in another tool.";
    const ingested = await ingestSource({ title: "Client delivery notes", origin: "Pasted notes", text, permission: "private" }, root);
    expect(ingested.claims).toHaveLength(6);
    expect(ingested.mapNodes).toHaveLength(6);
    expect(ingested.mapNodes.every((node) => node.kind === "grounded" && node.sourceId === ingested.sourceItems[0]!.id)).toBe(true);
    expect(ingested.mapNodes.map((node) => node.id)).toEqual(ingested.claims.map((claim) => claim.id));
    expect(new Set(ingested.mapNodes.map((node) => `${node.x}:${node.y}`)).size).toBe(6);
    const approved = applyWorkshopAction("approveBrief", root);
    expect(approved.frame?.markdown).toContain("## Outcome\nWorkshopLM organizes messy thinking into a grounded Map");
    expect(approved.frame?.markdown).toContain("- Professional teams lose hours turning meeting notes into client-ready presentations — Pasted notes · chunk 01");
    expect(approved.frame?.markdown).not.toContain("Client delivery notes:");
    const executable = JSON.parse(await readFile(join(root, approved.frame!.executablePath), "utf8"));
    expect(executable).toMatchObject({ outcome: "WorkshopLM organizes messy thinking into a grounded Map" });
    expect(executable.evidence[0]).toMatchObject({ nodeId: ingested.claims[0]!.id, locator: "Pasted notes · chunk 01" });
  } finally {
    if (priorFixtureMode === undefined) delete process.env.WORKSHOPLM_SEEDED_FIXTURE;
    else process.env.WORKSHOPLM_SEEDED_FIXTURE = priorFixtureMode;
    await rm(root, { recursive: true, force: true });
  }
});
it("ships a BM25-searchable sanitized Workshop without an acceptance-only data-root override", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-seed-evidence-")); const state = readWorkshopState(root); expect(state.sourceChunks).toHaveLength(3); expect(state.claims).toHaveLength(5); expect(searchWorkshopSources("editable production system", root)[0]).toMatchObject({ sourceId: "source-design", locator: "Design · Map" }); const database = new DatabaseSync(join(root, "data", "workshoplm.sqlite")); expect((database.prepare("SELECT count(*) AS count FROM evidence_fts WHERE workshop_id=?").get(state.id) as { count: number }).count).toBe(3); database.close(); await rm(root, { recursive: true, force: true }); });
it("persists a grounded Conversation without turning a question into a Source", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-conversation-"));
  const before = readWorkshopState(root);
  const state = sendConversationMessage("What supports the editable production system?", root);
  expect(state.sources).toBe(before.sources);
  expect(state.conversationTurns).toHaveLength(2);
  expect(state.conversationTurns[0]).toMatchObject({ role: "user", input: "text", text: "What supports the editable production system?", evidence: [] });
  expect(state.conversationTurns[1]).toMatchObject({ role: "assistant", input: "system", operation: { name: "search", status: "completed" } });
  expect(state.conversationTurns[1]?.evidence[0]).toMatchObject({ sourceId: "source-design", chunkId: "chunk-seed-design", locator: "Design · Map" });
  expect(state.conversationTurns[1]?.text).toContain("Evidence becomes an editable production system");
  expect(() => sendConversationMessage("   ", root)).toThrow(/message first/);
  await rm(root, { recursive: true, force: true });
});
it("preserves the requested source permission", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-permission-")); const state = await ingestSource({ title: "Private notes", origin: "Fixture", text: "Keep this source private.", permission: "private" }, root); expect(state.sourceItems.at(-1)?.permission).toBe("private"); await rm(root, { recursive: true, force: true }); });
it("indexes readable website content instead of scripts and navigation", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-readable-web-"));
  const fetchImpl = async () => new Response('<html><head><title>Chapter &amp; community guide</title><script>window.__DATA__={"fake":"sandboxed iframe code"}</script></head><body><nav>Products Pricing Login</nav><main><h1>Build a trusted local chapter</h1><p>Community leaders connect builders and help useful ideas travel.</p><ul><li>Start with one welcoming event.</li><li>Keep every gathering safe and inclusive.</li></ul></main></body></html>', { status: 200, headers: { "content-type": "text/html" } });
  const state = await ingestUrl("https://example.com/chapter", root, fetchImpl as typeof fetch);
  const source = state.sourceItems.at(-1)!;
  const sourceText = state.sourceChunks.filter((chunk) => chunk.sourceId === source.id).map((chunk) => chunk.text).join(" ");
  expect(source).toMatchObject({ title: "Chapter & community guide", origin: "https://example.com/chapter", permission: "shareable" });
  expect(sourceText).toContain("Build a trusted local chapter");
  expect(sourceText).toContain("Start with one welcoming event.");
  expect(sourceText).not.toMatch(/window\.__DATA__|sandboxed iframe|Products Pricing Login/);
  await rm(root, { recursive: true, force: true });
});
it("reflows layout-preserving PDF text without joining separate bullets", () => {
  expect(normalizePdfLayoutText("What you get\n\n  ● First benefit continues\n    across a hard line wrap.\n  ● Second benefit stays separate.\fExpectations\n\n1. Host useful events\n   with some frequency.")).toBe("What you get\n\n● First benefit continues across a hard line wrap.\n\n● Second benefit stays separate.\n\nExpectations\n\n1. Host useful events with some frequency.");
});
it("persists a typed Map edit and can undo it", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-map-")); const edited = applyMapOperation({ type: "update_node", nodeId: "node-promise", patch: { label: "An editable proof" } }, root); expect(edited.mapNodes.find((node) => node.id === "promise")?.title).toBe("An editable proof"); expect(edited.graphState).toContain("update_node"); const undone = undoMapOperation(root); expect(undone.mapNodes.find((node) => node.id === "promise")?.title).toBe("The product promise"); await rm(root, { recursive: true, force: true }); });
it("persists a typed Map edge and can undo it", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-edge-")); const linked = applyMapOperation({ type: "add_edge", edge: { id: "edge-visual-risk", from: "node-visual", to: "node-risk", kind: "relates_to", label: "informs" } }, root); expect(linked.mapEdges).toContainEqual({ id: "edge-visual-risk", from: "visual", to: "risk", kind: "relates_to", label: "informs" }); expect(linked.mapEdges).toHaveLength(4); expect(undoMapOperation(root).mapEdges).toHaveLength(3); await rm(root, { recursive: true, force: true }); });
it("synchronizes direct canvas text, position, and size changes through typed graph history", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-canvas-")); applyWorkshopAction("approveBrief", root); const changed = syncMapCanvas([{ id: "promise", title: "Canvas proof", x: 31.2, y: 44.8, width: 29.5, height: 21.4 }], root); expect(changed.mapNodes.find((node) => node.id === "promise")).toMatchObject({ title: "Canvas proof", x: 31.2, y: 44.8, width: 29.5, height: 21.4 }); expect(changed.graphState).toContain("operation-canvas-"); expect(changed.briefApproved).toBe(false); expect(changed.frame?.stale).toBe(true); expect(undoMapOperation(root).mapNodes.find((node) => node.id === "promise")).toMatchObject({ title: "The product promise", width: 24, height: 18 }); await rm(root, { recursive: true, force: true }); });
it("keeps approved work current when the user only arranges the Map", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-canvas-layout-")); const approved = applyWorkshopAction("approveBrief", root); const promise = approved.mapNodes.find((node) => node.id === "promise")!; const arranged = syncMapCanvas([{ ...promise, x: 8, y: 12, width: 22, height: 16 }], root); expect(arranged.mapNodes.find((node) => node.id === "promise")).toMatchObject({ x: 8, y: 12, width: 22, height: 16 }); expect(arranged.briefApproved).toBe(true); expect(arranged.frame?.stale).toBe(false); await rm(root, { recursive: true, force: true }); });
it("creates and preserves immutable, source-traced Sketch versions", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-sketch-")); applyWorkshopAction("approveBrief", root); const sketch = createSketch(root).sketch; expect(sketch).toMatchObject({ version: 1, graphRevision: 0, relativePath: "generated/sketch-v1.svg", sha256: expect.stringMatching(/^[a-f0-9]{64}$/), stale: false, approved: false }); expect(sketch?.nodes).toHaveLength(4); expect(sketch?.claimIds.length).toBeGreaterThan(0); expect(await readFile(join(root, sketch!.relativePath), "utf8")).toContain("hand-drawn Sketch"); expect(resolveWorkshopArtifact("sketch", root)).toMatchObject({ contentType: "image/svg+xml; charset=utf-8" }); expect(approveSketch(root).sketch?.approved).toBe(true); expect(applyMapOperation({ type: "update_node", nodeId: "node-promise", patch: { label: "Changed" } }, root).sketch).toMatchObject({ stale: true, approved: false }); applyWorkshopAction("approveBrief", root); const regenerated = createSketch(root); expect(regenerated.sketch).toMatchObject({ version: 2, stale: false }); expect(regenerated.sketchHistory).toHaveLength(1); expect(regenerated.sketchHistory[0]).toMatchObject({ version: 1, stale: true, approved: false }); expect(resolveWorkshopArtifact("sketch-v1", root, undefined, "editable")).toMatchObject({ fileName: "workshop-sketch-v1.svg" }); expect(resolveWorkshopArtifact("sketch-v2", root)).toMatchObject({ contentType: "image/svg+xml; charset=utf-8" }); expect(listWorkshopSummaries(root).find((workshop) => workshop.active)?.outputs).toBe(2); await rm(root, { recursive: true, force: true }); });
it("locks manual style inputs as a versioned inspectable foundation", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-style-")); const state = lockManualStyle({ name: "Proof system", accent: "#1155AA", ink: "#111111", paper: "#F0EFEA", logos: ["local/logo.svg"], licensedFonts: ["Inter"], references: ["editorial grid"], negativeRules: ["no gradients"], intentProfile: "board_deck" }, root); expect(state.style).toMatchObject({ version: 1, source: "manual", accent: "#1155AA", logos: ["local/logo.svg"], licensedFonts: ["Inter"], negativeRules: ["no gradients"], intentProfile: "board_deck", stale: false }); expect(state.designArtifact).toMatchObject({ version: 1, styleVersion: 1, markdownPath: "generated/DESIGN-v1.md", tokensPath: "generated/DESIGN-v1.tokens.json", stale: false }); expect(await readFile(join(root, state.designArtifact!.markdownPath), "utf8")).toContain("# DESIGN.md"); expect(JSON.parse(await readFile(join(root, state.designArtifact!.tokensPath), "utf8"))).toMatchObject({ styleVersion: 1, palette: { accent: "#1155AA" }, intentProfile: "board_deck" }); expect(() => lockManualStyle({ accent: "blue" }, root)).toThrow(/six-digit hex/); await rm(root, { recursive: true, force: true }); });
it("reuses one saved Style across Workshops without coupling their versions", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-style-library-"));
  const original = readWorkshopState(root);
  const saved = lockManualStyle({ name: "Client system", accent: "#1155AA", ink: "#111111", paper: "#F0EFEA", logos: ["local/logo.svg"], licensedFonts: ["Inter"], references: ["quiet editorial grid"], negativeRules: ["no gradients"], intentProfile: "client_facing_pitch" }, root);
  const library = listStyleLibrary(root);
  expect(library).toMatchObject([{ id: saved.style?.libraryId, name: "Client system", accent: "#1155AA", intentProfile: "client_facing_pitch" }]);
  const nextWorkshop = createWorkshop("Weekly client update", root);
  const reused = applyStyleLibrary(library[0]!.id, "board_deck", root);
  expect(reused).toMatchObject({ id: nextWorkshop.id, style: { version: 1, libraryId: library[0]!.id, name: "Client system", accent: "#1155AA", logos: ["local/logo.svg"], licensedFonts: ["Inter"], intentProfile: "board_deck", stale: false } });
  expect(JSON.parse(await readFile(join(root, reused.designArtifact!.tokensPath), "utf8"))).toMatchObject({ styleVersion: 1, name: "Client system", palette: { accent: "#1155AA" }, intentProfile: "board_deck" });
  expect(readWorkshopState(root, original.id).style).toMatchObject({ version: 1, intentProfile: "client_facing_pitch" });
  expect(listStyleLibrary(root)[0]).toMatchObject({ intentProfile: "client_facing_pitch" });
  await rm(root, { recursive: true, force: true });
});
it("creates immutable Company Style revisions and applies them explicitly across Workshops", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-style-revisions-"));
  const firstWorkshop = readWorkshopState(root);
  const first = lockManualStyle({ name: "Client system", accent: "#1155AA", ink: "#111111", paper: "#F0EFEA", intentProfile: "client_facing_pitch" }, root);
  expect(first.style).toMatchObject({ libraryRevision: 1, libraryFamilyId: expect.stringMatching(/^style-/) });

  const secondWorkshop = createWorkshop("Weekly client update", root);
  await ingestSource({ title: "Client evidence", origin: "Fixture", text: "The client approved a weekly leadership update." }, root);
  applyWorkshopAction("approveBrief", root);
  const reused = applyStyleLibrary(first.style!.libraryId!, undefined, root);
  const withDeck = await generateOutput("deck", root);
  expect(withDeck.style).toMatchObject({ libraryRevision: 1, accent: "#1155AA" });
  expect(withDeck.outputs[0]).toMatchObject({ stale: false });

  selectWorkshop(firstWorkshop.id, root);
  const revised = lockManualStyle({ name: "Client system", accent: "#AA3355", ink: "#111111", paper: "#F0EFEA", intentProfile: "client_facing_pitch" }, root);
  expect(revised.style).toMatchObject({ libraryFamilyId: first.style!.libraryFamilyId, libraryRevision: 2, accent: "#AA3355" });
  expect(revised.style!.libraryId).not.toBe(first.style!.libraryId);
  expect(await readFile(join(root, revised.designArtifact!.markdownPath), "utf8")).toContain("Company Style revision: 2");
  expect(JSON.parse(await readFile(join(root, revised.designArtifact!.tokensPath), "utf8"))).toMatchObject({ libraryFamilyId: first.style!.libraryFamilyId, libraryRevision: 2 });
  expect(listStyleLibrary(root)).toMatchObject([{ id: revised.style!.libraryId, familyId: first.style!.libraryFamilyId, revision: 2, accent: "#AA3355" }]);

  const unchanged = readWorkshopState(root, secondWorkshop.id);
  expect(unchanged.style).toMatchObject({ libraryId: reused.style!.libraryId, libraryRevision: 1, accent: "#1155AA" });
  expect(unchanged.outputs[0]).toMatchObject({ stale: false });

  selectWorkshop(secondWorkshop.id, root);
  const applied = applyStyleLibrary(revised.style!.libraryId!, undefined, root);
  expect(applied.style).toMatchObject({ libraryRevision: 2, accent: "#AA3355" });
  expect(applied.outputs[0]).toMatchObject({ stale: true });
  expect(applied.storyboardApproved).toBe(false);
  const database = new DatabaseSync(join(root, "data", "workshoplm.sqlite"));
  expect((database.prepare("SELECT count(*) AS count FROM style_library").get() as { count: number }).count).toBe(2);
  database.close();
  await rm(root, { recursive: true, force: true });
});
it("marks existing work stale when a different saved Style is applied", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-style-library-stale-"));
  await ingestSource({ title: "Evidence", origin: "Fixture", text: "A saved Style change must update the client deck." }, root);
  applyWorkshopAction("approveBrief", root);
  const first = lockManualStyle({ name: "Client light", accent: "#1155AA" }, root);
  await generateOutput("deck", root);
  createWorkshop("Style setup", root);
  const second = lockManualStyle({ name: "Board dark", accent: "#552211", intentProfile: "board_deck" }, root);
  selectWorkshop(first.id, root);
  const changed = applyStyleLibrary(second.style!.libraryId!, undefined, root);
  expect(changed.style).toMatchObject({ name: "Board dark", accent: "#552211", intentProfile: "client_facing_pitch", version: 2, stale: false });
  expect(changed.outputs[0]).toMatchObject({ type: "deck", stale: true });
  expect(changed.storyboard).toMatchObject({ stale: true });
  expect(changed.storyboardApproved).toBe(false);
  await rm(root, { recursive: true, force: true });
});
it("refreshes the weekly Map and Brief after a new meeting while preserving the reused Style and exact deck trace", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-weekly-rhythm-"));
  const styleWorkshop = readWorkshopState(root);
  const saved = lockManualStyle({ name: "Client system", accent: "#1155AA", ink: "#111111", paper: "#F0EFEA", intentProfile: "client_facing_pitch" }, root);
  const weekly = createWorkshop("Weekly client update", root);
  await ingestSource({ title: "Monday client meeting", origin: "Meeting · Monday", text: "The weekly client update should focus leadership on launch readiness. The team has completed the research phase and should prepare the launch recommendation." }, root);
  const initialBrief = applyWorkshopAction("approveBrief", root);
  const styled = applyStyleLibrary(saved.style!.libraryId!, undefined, root);
  const first = await generateOutput("deck", root);
  const firstDeck = first.outputs.at(-1)!;

  const refreshed = await ingestSource({ title: "Thursday client meeting", origin: "Meeting · Thursday", text: "The weekly client update now confirms pilot approval from leadership. The team should start the client pilot on Monday and measure adoption during the first week." }, root);
  const newSource = refreshed.sourceItems.at(-1)!;
  expect(refreshed).toMatchObject({ id: weekly.id, briefApproved: false, storyboardApproved: false, videoState: "blocked" });
  expect(refreshed.mapNodes.filter((node) => node.sourceId === newSource.id)).toMatchObject([
    { body: "The weekly client update now confirms pilot approval from leadership", locator: "Meeting · Thursday · chunk 01" },
    { body: "The team should start the client pilot on Monday and measure adoption during the first week", locator: "Meeting · Thursday · chunk 01" },
  ]);
  expect(refreshed.frame).toMatchObject({ version: initialBrief.frame!.version, stale: true });
  expect(refreshed.style).toMatchObject({ libraryId: styled.style!.libraryId, version: 1, stale: false });
  expect(refreshed.outputs.find((output) => output.id === firstDeck.id)).toMatchObject({ stale: true });

  const nextBrief = applyWorkshopAction("approveBrief", root);
  const regenerated = await generateOutput("deck", root);
  const currentDeck = regenerated.outputs.at(-1)!;
  const newClaimIds = new Set(regenerated.claims.filter((claim) => claim.sourceId === newSource.id).map((claim) => claim.id));
  expect(nextBrief.frame).toMatchObject({ version: initialBrief.frame!.version + 1, stale: false });
  expect(regenerated.style).toMatchObject({ libraryId: styled.style!.libraryId, version: 1, stale: false });
  expect(currentDeck).toMatchObject({ id: "deck-v2", stale: false, editableRelativePath: expect.stringMatching(/\.pptx$/) });
  expect(currentDeck.claimIds.some((claimId) => newClaimIds.has(claimId))).toBe(true);
  expect(regenerated.outputs.filter((output) => output.type === "deck")).toHaveLength(2);
  expect(regenerated.outputs[0]).toMatchObject({ id: "deck-v1", stale: true });
  expect(readWorkshopState(root, styleWorkshop.id).style).toMatchObject({ version: 1, name: "Client system" });
  await rm(root, { recursive: true, force: true });
});
it("analyzes a public website and locks only the reviewed Style values", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-website-style-"));
  const requests: string[] = [];
  const fetchImpl = async (input: string | URL | Request) => {
    const url = String(input);
    requests.push(url);
    if (url.endsWith("brand.css")) return new Response(':root{--brand-primary:#2457D6;--ink:#102030;--paper:#FAF8F4;font-family:"Studio Sans",sans-serif}', { status: 200, headers: { "content-type": "text/css" } });
    if (url.endsWith("logo.svg")) return new Response('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><rect width="64" height="32" fill="#2457D6"/></svg>', { status: 200, headers: { "content-type": "image/svg+xml" } });
    return new Response('<html><head><title>Public Studio</title><meta name="theme-color" content="#2457D6"><link rel="stylesheet" href="/brand.css"></head><body><img class="brand-logo" src="/logo.svg"></body></html>', { status: 200, headers: { "content-type": "text/html" } });
  };
  const suggestion = await analyzeWebsiteStyle("https://example.com/style", fetchImpl as typeof fetch);
  expect(suggestion).toMatchObject({ name: "Public Studio foundation", accent: "#2457D6", ink: "#102030", paper: "#FAF8F4", paletteRoles: { accent: { value: "#2457D6", source: "website" }, text: { value: "#102030", source: "website" }, background: { value: "#FAF8F4", source: "website" } }, logos: ["https://example.com/logo.svg"], assetCandidates: [{ url: "https://example.com/logo.svg", kind: "logo" }], fontCandidates: ["Studio Sans"], typographyCandidates: [{ family: "Studio Sans", availability: "unverified", source: "website" }], findings: { colors: 3, fontCandidates: 1, assets: 1, stylesheets: 1 } });
  expect(requests).toHaveLength(2);
  const state = await lockWebsiteStyle("https://example.com/style", root, fetchImpl as typeof fetch, "board_deck", { name: suggestion.name, accent: "#335577", ink: suggestion.ink, paper: suggestion.paper, headingFont: "Studio Sans", bodyFont: "Studio Sans", fontsConfirmed: false, selectedAssetUrls: [suggestion.logos[0]!], references: suggestion.references, negativeRules: ["No gradients"], intentProfile: "board_deck" });
  expect(requests).toHaveLength(3);
  expect(state.style).toMatchObject({ source: "website", name: "Public Studio foundation", accent: "#335577", ink: "#102030", paper: "#FAF8F4", paletteRoles: { accent: { value: "#335577", source: "website" }, text: { value: "#102030", source: "website" }, background: { value: "#FAF8F4", source: "website" } }, typographyRoles: { heading: { family: "Studio Sans", availability: "unverified", source: "website" }, body: { family: "Studio Sans", availability: "unverified", source: "website" } }, brandAssets: [{ sourceUrl: "https://example.com/logo.svg", localPath: expect.stringMatching(/generated\/brand\/[a-f0-9]{64}\.svg$/), contentType: "image/svg+xml", width: 64, height: 32, sha256: expect.stringMatching(/^[a-f0-9]{64}$/) }], logos: [expect.stringMatching(/generated\/brand\/[a-f0-9]{64}\.svg$/)], licensedFonts: [], negativeRules: ["No gradients"], intentProfile: "board_deck", referenceUrl: "https://example.com/style" });
  expect(await readFile(join(root, state.style!.brandAssets[0]!.localPath), "utf8")).toContain("<svg");
  expect(state.designArtifact?.markdownPath).toBe("generated/DESIGN-v1.md");
  expect(await readFile(join(root, state.designArtifact!.markdownPath), "utf8")).toContain("Heading: Studio Sans (unverified)");
  expect(JSON.parse(await readFile(join(root, state.designArtifact!.tokensPath), "utf8"))).toMatchObject({ schemaVersion: 4, source: "website", palette: { accent: "#335577" }, paletteRoles: { accent: { value: "#335577", source: "website" } }, typographyRoles: { heading: { family: "Studio Sans", availability: "unverified" } }, layoutRules: expect.arrayContaining([expect.stringContaining("executive hierarchy")]), imageTreatmentRules: expect.any(Array), motionRules: expect.arrayContaining([expect.stringContaining("minimal fades")]), brandAssets: [{ sha256: state.style!.brandAssets[0]!.sha256 }], licensedFonts: [], intentProfile: "board_deck" });
  applyWorkshopAction("approveBrief", root);
  const output = await generateOutput("deck", root);
  expect(await readFile(join(root, output.outputs.at(-1)!.relativePath), "utf8")).toContain('class="brand-logo"');
  await writeFile(join(root, state.style!.brandAssets[0]!.localPath), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 32"><circle cx="16" cy="16" r="12"/></svg>');
  await expect(generateOutput("infographic", root)).rejects.toThrow(/hash no longer matches/);
  const confirmed = await lockWebsiteStyle("https://example.com/style", root, fetchImpl as typeof fetch, "board_deck", { name: suggestion.name, accent: "#335577", ink: suggestion.ink, paper: suggestion.paper, headingFont: "Studio Sans", bodyFont: "Studio Sans", fontsConfirmed: true, selectedAssetUrls: [], references: suggestion.references, negativeRules: ["No gradients"], intentProfile: "board_deck" });
  expect(confirmed.style).toMatchObject({ typographyRoles: { heading: { availability: "user_confirmed" }, body: { availability: "user_confirmed" } }, licensedFonts: ["Studio Sans"] });
  expect(confirmed.style!.brandAssets).toEqual([]);
  await rm(root, { recursive: true, force: true });
});
it("assigns website palette roles for readable professional outputs", async () => {
  const fetchImpl = async () => new Response('<html><head><title>Role stress test</title><style>:root{--text-highlight:#FF97E2;--text-primary:#0D0D0D;--background:#FFFFFF;--brand-primary:#FF97E2;--surface:#EDEDF0}</style></head></html>', { status: 200, headers: { "content-type": "text/html" } });
  const suggestion = await analyzeWebsiteStyle("https://example.com", fetchImpl as typeof fetch);
  expect(suggestion).toMatchObject({ accent: "#FF97E2", ink: "#0D0D0D", paper: "#FFFFFF" });
  const root = await mkdtemp(join(tmpdir(), "workshop-readable-style-"));
  expect(() => lockManualStyle({ ink: "#FF97E2", paper: "#FFFFFF" }, root)).toThrow(/4.5:1 contrast/);
  await rm(root, { recursive: true, force: true });
});
it("rejects unsafe or misleading website brand assets before persistence", async () => {
  const unsafeSvg = async () => new Response('<svg xmlns="http://www.w3.org/2000/svg" width="64" height="32"><script>alert(1)</script></svg>', { status: 200, headers: { "content-type": "image/svg+xml" } });
  await expect(fetchWebsiteBrandAsset("https://example.com/logo.svg", unsafeSvg as typeof fetch)).rejects.toThrow(/active content/);
  const fakePng = async () => new Response("not a png", { status: 200, headers: { "content-type": "image/png" } });
  await expect(fetchWebsiteBrandAsset("https://example.com/logo.png", fakePng as typeof fetch)).rejects.toThrow(/do not match/);
  const huge = async () => new Response("", { status: 200, headers: { "content-type": "image/png", "content-length": "2000001" } });
  await expect(fetchWebsiteBrandAsset("https://example.com/logo.png", huge as typeof fetch)).rejects.toThrow(/2 MB/);
});
it("rejects a website Style redirect into the local network", async () => {
  const fetchImpl = async () => new Response(null, { status: 302, headers: { location: "http://127.0.0.1/private.css" } });
  await expect(analyzeWebsiteStyle("https://example.com/style", fetchImpl as typeof fetch)).rejects.toThrow(/Private network URLs/);
});
it("creates, approves, and stales a versioned Visual DNA preview", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-dna-")); lockManualStyle({ references: ["editorial grid"], negativeRules: ["no gradients"] }, root); const preview = createVisualDna(root); expect(preview.visualDna).toMatchObject({ version: 1, styleVersion: 1, approved: false, stale: false, negativeRules: ["no gradients"] }); expect(approveVisualDna(root).visualDna?.approved).toBe(true); const relocked = lockManualStyle({ accent: "#1155AA" }, root); expect(relocked.visualDna).toMatchObject({ approved: false, stale: true }); await rm(root, { recursive: true, force: true }); });
it("writes a source-traceable output after current brief and style approval", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-output-")); await ingestSource({ title: "Evidence", origin: "Fixture", text: "Turn raw thinking into finished work without losing the trail back to source material." }, root); applyWorkshopAction("approveBrief", root); applyWorkshopAction("lockManualStyle", root); const generated = await generateOutput("deck", root); expect(generated.outputs[0]).toMatchObject({ type: "deck", stale: false, editableRelativePath: expect.stringMatching(/\.pptx$/), editableArtifactPath: expect.stringMatching(/^artifacts\//), claimIds: expect.arrayContaining([expect.stringMatching(/^claim-/)]) }); expect(generated.outputs[0].artifactPath).toMatch(/^artifacts\//); const html = await readFile(join(root, generated.outputs[0]!.relativePath), "utf8"); const pptx = await readFile(join(root, generated.outputs[0]!.editableRelativePath!)); const editable = resolveWorkshopArtifact(generated.outputs[0]!.id, root, undefined, "editable"); expect(html).not.toContain("FRAME"); expect(html).toContain("Turn raw thinking into finished work"); expect(html).toContain("without losing the trail back to source"); expect(html).toContain('class="body">material</p>'); expect(html).toContain('data-source="Fixture · chunk 01"'); expect(html).toContain('class="slide statement'); expect(pptx.subarray(0, 2).toString()).toBe("PK"); expect(editable).toMatchObject({ contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", fileName: "slides-v1.pptx" }); await rm(root, { recursive: true, force: true }); });
it("turns spoken transformation and process language into complete professional slide copy", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-polished-deck-"));
  createWorkshop("WorkshopLM Build Week", root);
  await ingestSource({ title: "Founder brainstorm", origin: "Founder-provided recording", text: "WorkshopLM should show how a messy spoken idea becomes a grounded Map, an approved Brief, coherent visuals, an editable Storyboard, and the final demo Video. Judges need one continuous Capture to Shape to Create path. Every factual claim must retain a visible source locator. The public demo Video must remain under three minutes." }, root);
  applyWorkshopAction("approveBrief", root);
  lockManualStyle({}, root);
  const generated = await generateOutput("deck", root);
  const html = await readFile(join(root, generated.outputs.at(-1)!.relativePath), "utf8");
  expect(html).toContain("A messy spoken idea becomes a grounded Map");
  expect(html).toContain("The path continues through an approved Brief, coherent visuals, an editable Storyboard, and the final demo Video.");
  expect(html).not.toContain("grounded Map, an…");
  expect(html).toContain('class="slide sequence"');
  expect(html).toContain('<div class="sequence-step"><span>Capture</span><small>Gather the raw material.</small></div>');
  expect(html).toContain('<div class="sequence-step"><span>Shape</span><small>Organize what matters.</small></div>');
  expect(html).toContain('<div class="sequence-step"><span>Create</span><small>Create the professional work.</small></div>');
  await rm(root, { recursive: true, force: true });
});
it("keeps source-locator metadata out of claims and writes a complete parallel transformation", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-source-metadata-"));
  createWorkshop("AI Collective chapter launch decision", root);
  const ingested = await ingestSource({
    title: "AI Collective chapter evidence",
    origin: "External-use chapter corpus",
    text: [
      "Build the local front door to applied AI",
      "A chapter lead becomes a visible facilitator and go-to resource for the local AI community.",
      "Source locator: Local PDF · GenAI Collective Chapter Startup FAQ.pdf · chunk 05",
      "180+ chapters, 40+ countries, 400+ organizers.",
      "Start with one repeatable event format.",
    ].join("\n\n"),
  }, root);
  expect(ingested.claims.map((claim) => claim.text)).not.toEqual(expect.arrayContaining([expect.stringMatching(/Source locator|FAQ|pdf · chunk/i)]));
  expect(ingested.sourceChunks.map((chunk) => chunk.text)).toEqual(expect.arrayContaining([expect.stringContaining("Source locator:")]));
  applyWorkshopAction("approveBrief", root);
  lockManualStyle({}, root);
  const generated = await generateOutput("deck", root);
  const html = await readFile(join(root, generated.outputs.at(-1)!.relativePath), "utf8");
  expect(html).toContain("A chapter lead becomes a visible facilitator");
  expect(html).toContain("A chapter lead also becomes a go-to resource for the local AI community.");
  expect(html).not.toMatch(/Source locator|FAQ|pdf · chunk|facilitator and go-to resource for the local AI…/i);
  await rm(root, { recursive: true, force: true });
});
it("plans a professional deck from narrative evidence instead of source metadata", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-deck-plan-"));
  createWorkshop("Leadership strategy", root);
  await ingestSource({
    title: "Strategy notes",
    origin: "Strategy brief",
    text: [
      "# Status",
      "Last refreshed: today.",
      "## North star",
      "A working professional turns messy inputs into a deliverable they can defend without lowering their standards.",
      "The current workflow is slow because evidence becomes disconnected from the finished work.",
      "Trust compounds when every factual claim remains linked to its exact source sentence.",
      "Teams should start with one real meeting and ship the grounded deck.",
    ].join("\n\n"),
  }, root);
  applyWorkshopAction("approveBrief", root);
  lockManualStyle({}, root);
  const generated = await generateOutput("deck", root);
  const html = await readFile(join(root, generated.outputs[0]!.relativePath), "utf8");
  expect(html).toContain("A working professional turns messy inputs");
  expect(html).toContain("Trust compounds when every factual claim");
  expect(html).toContain("Teams should start with one real meeting");
  expect(html).toContain("Source: Strategy notes");
  expect(html).not.toContain("Source: Strategy notes · chunk");
  expect(html).toContain("Strategy brief · chunk");
  expect(html).not.toMatch(/# Status|Last refreshed|## North star|\*\*/);
  await rm(root, { recursive: true, force: true });
});
it("keeps a professional deck on the Workshop topic when a broad website contains unrelated facts", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-deck-topic-"));
  createWorkshop("AI Collective chapter launch briefing", root);
  await ingestSource({ title: "Chapter guide", origin: "Organizer guide", text: "Leading a local chapter creates a trusted place for builders to connect. Chapter leaders commit five hours each week and host useful events with some frequency. Start a chapter by assembling a small organizing team and planning one welcoming event." }, root);
  await ingestSource({ title: "Public community page", origin: "Public website", text: "Users trust AI responses 91% of the time without checking. The AI Collective is a global non-profit with 180+ chapters across 40+ countries and 400+ volunteer organizers." }, root);
  applyWorkshopAction("approveBrief", root);
  lockManualStyle({}, root);
  const generated = await generateOutput("deck", root);
  const html = await readFile(join(root, generated.outputs[0]!.relativePath), "utf8");
  expect(html).toContain("Leading a local chapter");
  expect(html).toContain("<strong>180+</strong><span>chapters</span>");
  expect(html).toContain("<strong>40+</strong><span>countries</span>");
  expect(html).toContain("Start a chapter");
  expect(html).not.toContain("Users trust AI responses 91%");
  await rm(root, { recursive: true, force: true });
});
it("writes a source-traceable infographic with an editable PowerPoint export", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-infographic-")); await ingestSource({ title: "Evidence", origin: "Fixture locator", text: "An infographic should preserve a source locator." }, root); applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); const generated = await generateOutput("infographic", root); const output = generated.outputs[0]!; expect(output).toMatchObject({ type: "infographic", stale: false, editableRelativePath: expect.stringMatching(/\.infographic\.pptx$/), claimIds: expect.arrayContaining([expect.stringMatching(/^claim-/)]) }); expect(await readFile(join(root, output.relativePath), "utf8")).toContain("Fixture locator · chunk 01"); const editable = await readFile(join(root, output.editableRelativePath!)); expect(editable.subarray(0, 2).toString()).toBe("PK"); expect(resolveWorkshopArtifact(output.id, root, undefined, "editable")).toMatchObject({ path: join(root, output.editableRelativePath!), contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", fileName: "infographic-v1.pptx" }); await rm(root, { recursive: true, force: true }); });
it("builds an asset plan from approved graph, brief, evidence, and Style Foundation versions", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-plan-")); await ingestSource({ title: "Evidence", origin: "Fixture", text: "A plan must name its evidence." }, root); applyWorkshopAction("approveBrief", root); lockManualStyle({ intentProfile: "board_deck" }, root); createVisualDna(root); approveVisualDna(root); const plan = generateAssetPlan(root).assetPlan; expect(plan).toMatchObject({ version: 1, briefVersion: 1, styleVersion: 1, visualDnaVersion: 1, stale: false }); expect(plan?.items.map((item) => item.outputType)).toEqual(["deck", "infographic", "images", "storyboard", "video"]); expect(plan?.items.map((item) => item.title)).toEqual(["Presentation", "Infographic", "Image set", "Storyboard", "Demo video"]); expect(plan?.items.map((item) => item.prompt).join(" ")).not.toMatch(/FRAME\.md|Visual DNA|provenance|render/i); expect(plan?.evidenceClaimIds[0]).toMatch(/^claim-/); expect(plan?.items.every((item) => { const evidence = item.evidence[0]; return Boolean(evidence?.claimId && plan.evidenceClaimIds.includes(evidence.claimId) && evidence.sourceId && evidence.chunkId); })).toBe(true); await rm(root, { recursive: true, force: true }); });
it("generates concise editable storyboard narration while retaining source evidence separately", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-generated-story-")); await ingestSource({ title: "Evidence", origin: "Fixture", text: "The storyboard must inherit plan evidence." }, root); applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); generateAssetPlan(root); const state = generateStoryboard(root); expect(state.storyboard).toMatchObject({ stale: false }); expect(state.storyboard.panels).toHaveLength(5); expect(state.storyboard.panels[0]?.narration).not.toContain("Fixture · chunk 01"); expect(state.storyboard.panels.every((panel) => panel.durationSeconds >= Math.ceil(panel.narration.split(/\s+/).length / 2.5) + 1)).toBe(true); expect(state.storyboard.panels[0]).toMatchObject({ claimIds: [expect.stringMatching(/^claim-/)], evidence: [{ claimId: expect.stringMatching(/^claim-/), sourceId: expect.stringMatching(/^source-/), chunkId: expect.stringMatching(/^chunk-/), locator: "Fixture · chunk 01" }] }); expect(() => assertStoryboardGrounding({ ...state, storyboard: { ...state.storyboard, panels: state.storyboard.panels.map((panel, index) => index ? panel : { ...panel, claimIds: ["claim-tampered"] }) } })).toThrow(/claim IDs do not match/); expect(state.storyboardApproved).toBe(false); await rm(root, { recursive: true, force: true }); });
it("preserves the approved Storyboard and its exact image when a replacement is rebound", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-story-images-"));
  await ingestSource({ title: "Evidence", origin: "Fixture", text: "The approved video must use the images reviewed in its storyboard." }, root);
  applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); generateAssetPlan(root); createImageBatch(root);
  const generated = generateStoryboard(root);
  expect(generated.storyboard.panels.map((panel) => [panel.imagePanelId, panel.imagePanelVersion])).toEqual([["image-panel-1", 1], ["image-panel-2", 1], ["image-panel-3", 1], ["image-panel-4", 1], ["image-panel-5", 1]]);
  await mkdir(join(root, "generated/images"), { recursive: true });
  for (let index = 0; index < 5; index += 1) {
    const panelId = `image-panel-${index + 1}`; const relativePath = `generated/images/${panelId}-v1.png`; const bytes = Buffer.from(`image-${index + 1}-v1`); const sha256 = createHash("sha256").update(bytes).digest("hex");
    await writeFile(join(root, relativePath), bytes);
    recordGeneratedImagePanel(panelId, { relativePath, sha256, provenance: { model: "gpt-image-2", size: "1024x1024", quality: "medium", referenceId: generated.imageBatch!.referenceId, generatedAt: new Date().toISOString() } }, root);
  }
  const approved = applyWorkshopAction("approveStoryboard", root);
  expect(approved).toMatchObject({ storyboardApproved: true, storyboard: { approved: true } });
  const approvedVersion = approved.storyboard.version;
  const changed = selectImagePanelForRegeneration("image-panel-2", root);
  expect(changed.storyboardApproved).toBe(false);
  expect(changed.storyboard).toMatchObject({ stale: true, approved: true });
  expect(changed.storyboard.panels[1]).toMatchObject({ stale: true, approved: false, imagePanelVersion: 1 });
  expect(changed.imageBatch?.panels[1]?.history).toMatchObject([{ version: 1, relativePath: "generated/images/image-panel-2-v1.png" }]);
  expect(resolveWorkshopArtifact("image-panel-2", root)?.path).toBe(join(root, "generated/images/image-panel-2-v1.png"));
  expect(resolveWorkshopArtifact("image-panel-2-v1", root)?.path).toBe(join(root, "generated/images/image-panel-2-v1.png"));
  expect(() => applyWorkshopAction("approveStoryboard", root)).toThrow(/current approved panels/);
  const replacementPath = "generated/images/image-panel-2-v2.png"; const replacementBytes = Buffer.from("image-2-v2"); const replacementSha256 = createHash("sha256").update(replacementBytes).digest("hex");
  await writeFile(join(root, replacementPath), replacementBytes);
  const rebound = recordGeneratedImagePanel("image-panel-2", { relativePath: replacementPath, sha256: replacementSha256, provenance: { model: "gpt-image-2", size: "1024x1024", quality: "medium", referenceId: changed.imageBatch!.referenceId, generatedAt: new Date().toISOString() } }, root);
  expect(rebound.storyboardApproved).toBe(false);
  expect(rebound.storyboard).toMatchObject({ version: approvedVersion + 1, stale: false, approved: false });
  expect(rebound.storyboard.panels[1]).toMatchObject({ stale: false, approved: true, imagePanelVersion: 2, imageRelativePath: replacementPath, imageSha256: replacementSha256 });
  expect(resolveWorkshopArtifact("image-panel-2", root)?.path).toBe(join(root, replacementPath));
  expect(resolveWorkshopArtifact("image-panel-2-v1", root)?.path).toBe(join(root, "generated/images/image-panel-2-v1.png"));
  expect(rebound.storyboardHistory.find((item) => item.version === approvedVersion)).toMatchObject({ approved: true, panels: { 1: { imagePanelVersion: 1, imageRelativePath: "generated/images/image-panel-2-v1.png" } } });
  const historicalArtifact = resolveWorkshopArtifact(`storyboard-v${approvedVersion}-panel-2-image`, root);
  expect(historicalArtifact?.path).toBe(join(root, "generated/images/image-panel-2-v1.png"));
  expect(await readFile(historicalArtifact!.path)).toEqual(Buffer.from("image-2-v1"));
  expect(applyWorkshopAction("approveStoryboard", root)).toMatchObject({ storyboardApproved: true, storyboard: { approved: true } });
  await rm(root, { recursive: true, force: true });
});
it("keeps an approved Storyboard readable after a panel edit", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-story-"));
  applyWorkshopAction("approveBrief", root); applyWorkshopAction("lockManualStyle", root);
  const approved = applyWorkshopAction("approveStoryboard", root);
  expect(() => updateStoryboardPanel("panel-2", { title: "Evidence Map", narration: "Reveal linked source chunks.", durationSeconds: 0 }, root)).toThrow(/1 to 120 seconds/);
  expect(() => updateStoryboardPanel("panel-2", { title: "Evidence Map", narration: "Reveal linked source chunks.", durationSeconds: 2.5 }, root)).toThrow(/1 to 120 seconds/);
  const edited = updateStoryboardPanel("panel-2", { title: "Evidence Map", narration: "Reveal linked source chunks.", durationSeconds: 6 }, root);
  expect(edited.storyboardApproved).toBe(false);
  expect(edited.storyboard).toMatchObject({ version: approved.storyboard.version + 1, approved: false });
  expect(edited.storyboard.panels[1]).toMatchObject({ title: "Evidence Map", durationSeconds: 6, approved: true });
  expect(edited.storyboardHistory.find((item) => item.version === approved.storyboard.version)).toMatchObject({ approved: true, panels: { 1: { title: "Cited Map", narration: "Show the editable Map and evidence locators." } } });
  await rm(root, { recursive: true, force: true });
});
it("rejects unsafe URL ingestion before any network fetch", async () => { await expect(ingestUrl("http://localhost:3000/private")).rejects.toThrow(/Local network/); await expect(ingestUrl("file:///etc/passwd")).rejects.toThrow(/HTTP/); });
it("creates a grounded, presentation-ready six-panel image batch and selectively regenerates one panel with a bounded professional revision", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-images-")); await ingestSource({ title: "Evidence", origin: "Fixture", text: "A grounded image set should turn approved evidence into professional presentation visuals." }, root); applyWorkshopAction("approveBrief", root); applyWorkshopAction("lockManualStyle", root); const batch = createImageBatch(root); expect(batch.imageBatch).toMatchObject({ graphRevision: expect.any(Number), briefVersion: 1, styleVersion: 1 }); expect(batch.imageBatch?.panels).toHaveLength(6); expect(batch.imageBatch?.panels.every((panel) => panel.referenceId === "style-v1" && panel.evidence[0]?.claimId?.startsWith("claim-") && panel.prompt.includes("presentation-ready 1:1 visual"))).toBe(true); expect(batch.imageBatch?.panels.map((panel) => panel.prompt)).toEqual(expect.arrayContaining([expect.stringContaining("Output role: Hero concept"), expect.stringContaining("Output role: Systems diagram"), expect.stringContaining("Output role: Evidence chain"), expect.stringContaining("Output role: Decision visual"), expect.stringContaining("Output role: Storyboard sequence"), expect.stringContaining("Output role: Section art")])); const selected = selectImagePanelForRegeneration("image-panel-3", root, "Use fewer objects and leave more headline space."); expect(selected.imageBatch?.panels[2]).toMatchObject({ version: 2, state: "selected_for_regeneration", revisionRequest: "Use fewer objects and leave more headline space.", basePrompt: batch.imageBatch?.panels[2]?.prompt }); expect(selected.imageBatch?.panels[2]?.prompt).toContain("Professional revision request: Use fewer objects and leave more headline space."); const replacedAgain = recordGeneratedImagePanel("image-panel-3", { relativePath: "generated/images/image-panel-3-v2.png", sha256: "a".repeat(64), provenance: { model: "gpt-image-2", size: "1024x1024", quality: "medium", referenceId: selected.imageBatch!.referenceId, generatedAt: new Date().toISOString() } }, root); const secondRequest = selectImagePanelForRegeneration("image-panel-3", root, "Make the focal object larger."); expect(secondRequest.imageBatch?.panels[2]?.prompt).toContain("Professional revision request: Make the focal object larger."); expect(secondRequest.imageBatch?.panels[2]?.prompt).not.toContain("Use fewer objects"); expect(replacedAgain.imageBatch?.panels[2]?.relativePath).toContain("v2.png"); expect(() => selectImagePanelForRegeneration("image-panel-3", root, "x".repeat(401))).toThrow(/400 characters/); await rm(root, { recursive: true, force: true }); });
it("matches each professional image role to the strongest available evidence", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-image-roles-")); await ingestSource({ title: "Approved direction", origin: "Fixture", text: ["Professionals start with unstructured meeting notes.", "The Map organizes relationships into an approved Brief.", "Every claim retains an exact source locator.", "Only an approved Storyboard may render.", "One continuous Capture to Shape to Create path guides the sequence.", "Brand rules govern the Presentation, Infographic, image set, and Video."].join("\n\n") }, root); applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); const state = createImageBatch(root); const ideas = state.imageBatch!.panels.map((panel) => state.claims.find((claim) => claim.id === panel.evidence[0]?.claimId)?.text); expect(ideas).toEqual([expect.stringContaining("Professionals start"), expect.stringContaining("Map organizes"), expect.stringContaining("exact source locator"), expect.stringContaining("approved Storyboard"), expect.stringContaining("continuous Capture"), expect.stringContaining("Brand rules")]); await rm(root, { recursive: true, force: true }); });
it("retains a completed deck when an image panel fails and allows only that panel to retry", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-partial-")); await ingestSource({ title: "Evidence", origin: "Fixture", text: "A failed image panel must not discard a completed deck." }, root); applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); const deck = await generateOutput("deck", root); createImageBatch(root); const partial = markImagePanelFailed("image-panel-2", "Provider timeout", root); expect(partial.outputs).toEqual(deck.outputs); expect(partial.outputs[0]).toMatchObject({ type: "deck", stale: false }); expect(partial.imageBatch?.panels[1]).toMatchObject({ state: "failed", error: "Provider timeout", version: 1 }); const retried = selectImagePanelForRegeneration("image-panel-2", root); expect(retried.imageBatch?.panels[1]).toMatchObject({ state: "selected_for_regeneration", error: undefined, version: 2 }); expect(retried.imageBatch?.panels[0]).toMatchObject({ state: "planned", version: 1 }); await rm(root, { recursive: true, force: true }); });
it("embeds the reviewed hero image in the presentation and propagates its version dependency", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-visual-deck-"));
  await ingestSource({ title: "Evidence", origin: "Fixture", text: "A professional presentation should use the coherent generated image family without losing its source trail." }, root);
  applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); createImageBatch(root);
  const planned = readWorkshopState(root).imageBatch!; const bytes = await readFile(join(root, planned.referencePath));
  const relativePath = join("generated", "images", "hero.png"); await mkdir(join(root, "generated", "images"), { recursive: true }); await writeFile(join(root, relativePath), bytes);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  recordGeneratedImagePanel("image-panel-1", { relativePath, sha256, provenance: { model: "gpt-image-2", size: "1024x1024", quality: "medium", referenceId: planned.referenceId, generatedAt: new Date().toISOString() } }, root);
  const generated = await generateOutput("deck", root); const output = generated.outputs.at(-1)!;
  expect(output).toMatchObject({ imageBatchId: planned.id, imagePanels: [{ id: "image-panel-1", version: 1, sha256 }], stale: false });
  const html = await readFile(join(root, output.relativePath), "utf8"); expect(html).toContain('class="slide cover has-visual"'); expect(html).toContain('data-image-panel="image-panel-1"');
  const changed = selectImagePanelForRegeneration("image-panel-1", root, "Leave more headline space."); expect(changed.outputs.at(-1)?.stale).toBe(true);
  await rm(root, { recursive: true, force: true });
});
it("persists an output failure and clears only that recovery state after a successful retry", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-output-recovery-")); applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); const failed = recordOutputFailure("deck", root); expect(failed.outputRecovery?.deck).toMatchObject({ attempts: 1, message: "Presentation could not be created. Your Brief and Style are safe." }); const failedAgain = recordOutputFailure("deck", root); expect(failedAgain.outputRecovery?.deck?.attempts).toBe(2); const recovered = await generateOutput("deck", root); expect(recovered.outputRecovery?.deck).toBeUndefined(); expect(recovered.outputs.at(-1)).toMatchObject({ type: "deck", stale: false }); await rm(root, { recursive: true, force: true }); });
it("marks outputs and storyboard stale when the upstream Map changes", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-stale-")); await ingestSource({ title: "Evidence", origin: "Fixture", text: "An upstream Map edit must stale output." }, root); applyWorkshopAction("approveBrief", root); applyWorkshopAction("lockManualStyle", root); await generateOutput("deck", root); generateAssetPlan(root); generateStoryboard(root); applyWorkshopAction("approveStoryboard", root); const changed = applyMapOperation({ type: "update_node", nodeId: "node-promise", patch: { label: "Changed source meaning" } }, root); expect(changed.outputs[0]?.stale).toBe(true); expect(changed.storyboard.stale).toBe(true); expect(changed.storyboardApproved).toBe(false); expect(() => applyWorkshopAction("renderVideo", root)).toThrow(/storyboard/); await rm(root, { recursive: true, force: true }); });
it("marks output, plan, image, storyboard, and Visual DNA stale when Style Foundation changes", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-style-stale-")); await ingestSource({ title: "Evidence", origin: "Fixture", text: "A style change must stale rendered work." }, root); applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); await generateOutput("deck", root); createImageBatch(root); createVisualDna(root); approveVisualDna(root); generateAssetPlan(root); generateStoryboard(root); applyWorkshopAction("approveStoryboard", root); const changed = lockManualStyle({ accent: "#1155AA" }, root); expect(changed.outputs[0]?.stale).toBe(true); expect(changed.assetPlan?.stale).toBe(true); expect(changed.imageBatch?.stale).toBe(true); expect(changed.storyboard.stale).toBe(true); expect(changed.storyboardApproved).toBe(false); expect(changed.visualDna).toMatchObject({ stale: true, approved: false }); expect(changed.videoState).toBe("blocked"); await rm(root, { recursive: true, force: true }); });
it("persists capture-only fallback provenance without leaking its internal title into outputs", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-fallback-")); createWorkshop("Voice brief", root); const captured = await captureFallbackTranscript("Voice fallback captures a grounded source.", root); expect(captured.transcriptSegments[0]).toMatchObject({ origin: "realtime_fallback", transport: "fixture", provider: undefined }); expect(captured.sourceItems.at(-1)?.origin).toContain("capture-only fallback"); expect(captured.sourceItems.at(-1)?.permission).toBe("private"); expect(captured.firstTranscriptAt).toBe(captured.transcriptSegments[0]?.capturedAt); applyWorkshopAction("approveBrief", root); applyWorkshopAction("lockManualStyle", root); const output = await generateOutput("deck", root); expect(output.firstRenderedOutputAt).toBeDefined(); expect(Date.parse(output.firstRenderedOutputAt!) >= Date.parse(output.firstTranscriptAt!)).toBe(true); const html = await readFile(join(root, output.outputs.at(-1)!.relativePath), "utf8"); expect(html).toContain("Source: Voice brainstorm"); expect(html).not.toContain("Source: Voice capture-only fallback"); expect(html).not.toMatch(/Source: Voice brainstorm\s+\d{4}-\d{2}-\d{2}/); expect(html).toContain('data-source="gpt-realtime-2.1 capture-only fallback · chunk 01"'); await rm(root, { recursive: true, force: true }); });
it("imports a founder recording transcript as private grounded voice without claiming provider Realtime", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-founder-import-")); const captured = await captureImportedTranscript("The raw founder brainstorm should become a grounded presentation and final demo video.", { title: "Founder brainstorm", origin: "Founder-provided recording", permission: "private" }, root); expect(captured.transcriptSegments.at(-1)).toMatchObject({ origin: "manual_import", transport: "fixture" }); expect(captured.transcriptSegments.at(-1)).not.toHaveProperty("provider"); expect(captured.sourceItems.at(-1)).toMatchObject({ title: "Founder brainstorm", origin: "Founder-provided recording", permission: "private" }); expect(captured.conversationTurns.slice(-2)).toMatchObject([{ role: "user", input: "voice" }, { role: "assistant", input: "system" }]); await rm(root, { recursive: true, force: true }); });
it("records provider event provenance only for a WebRTC capture", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-webrtc-")); const captured = await captureFallbackTranscript("A real microphone turn.", root, { transport: "webrtc", model: "gpt-realtime-2.1", transcriptionModel: "gpt-realtime-whisper", itemIds: ["item-1"], eventIds: ["event-1"], interruptions: { responseIds: ["response-cancelled"], eventIds: ["event-cancelled"] } }); expect(captured.transcriptSegments[0]).toMatchObject({ transport: "webrtc", provider: { model: "gpt-realtime-2.1", transcriptionModel: "gpt-realtime-whisper", itemIds: ["item-1"], eventIds: ["event-1"], interruptions: { responseIds: ["response-cancelled"], eventIds: ["event-cancelled"] } } }); await expect(captureFallbackTranscript("Missing evidence.", root, { transport: "webrtc", model: "gpt-realtime-2.1", transcriptionModel: "gpt-realtime-whisper", itemIds: [], eventIds: [] })).rejects.toThrow(/item and event IDs/); await expect(captureFallbackTranscript("Bad interruption evidence.", root, { transport: "webrtc", model: "gpt-realtime-2.1", transcriptionModel: "gpt-realtime-whisper", itemIds: ["item-2"], eventIds: ["event-2"], interruptions: { responseIds: ["response-cancelled"], eventIds: [] } })).rejects.toThrow(/interruption evidence/); await rm(root, { recursive: true, force: true }); });
it("persists a provider-spoken Realtime answer instead of adding a deterministic duplicate", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-realtime-conversation-")); const captured = await captureFallbackTranscript("What should the deck prove?", root, { transport: "webrtc", model: "gpt-realtime-2.1", transcriptionModel: "gpt-realtime-whisper", itemIds: ["item-voice"], eventIds: ["event-voice"], assistant: { text: "It should prove that every recommendation traces to selected evidence.", responseId: "response-voice", eventIds: ["event-assistant"] } }); expect(captured.sourceItems.at(-1)?.origin).toBe("gpt-realtime-2.1 conversation"); expect(captured.conversationTurns.slice(-2)).toMatchObject([{ role: "user", input: "voice", text: "What should the deck prove?" }, { id: expect.stringContaining("turn-assistant-realtime"), role: "assistant", text: "It should prove that every recommendation traces to selected evidence." }]); expect(captured.conversationTurns.filter((turn) => turn.role === "assistant")).toHaveLength(1); await rm(root, { recursive: true, force: true }); });
it("extracts durable candidate categories from the selected grounded source scope", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-candidates-")); const ingested = await ingestSource({ title: "Planning notes", origin: "Fixture", text: "We need to build a cited Map. Judges are the audience. The demo must stay under three minutes. How do we show provenance?" }, root); const sourceId = ingested.sourceItems.at(-1)!.id; setActiveSourceScope([sourceId], root); const extracted = extractWorkshopCandidates(root); expect(extracted.candidates.map((candidate) => candidate.category)).toEqual(expect.arrayContaining(["goal", "audience", "constraint", "question"])); expect(extracted.candidates.every((candidate) => candidate.sourceId === sourceId && candidate.locator.includes("Fixture"))).toBe(true); await rm(root, { recursive: true, force: true }); });
it("makes active source scope a provenance contract and stales dependent work", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-scope-")); const first = await ingestSource({ title: "First evidence", origin: "First", text: "First source claim." }, root); const second = await ingestSource({ title: "Second evidence", origin: "Second", text: "Second source claim." }, root); const firstId = first.sourceItems.at(-1)!.id; const secondId = second.sourceItems.at(-1)!.id; applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); await generateOutput("deck", root); const scoped = setActiveSourceScope([firstId], root); expect(scoped.activeSourceIds).toEqual([firstId]); expect(scoped.briefApproved).toBe(false); expect(scoped.outputs[0]?.stale).toBe(true); expect(scoped.storyboard.stale).toBe(true); expect(() => setActiveSourceScope([], root)).toThrow(/at least one source/); expect(() => setActiveSourceScope([secondId, "unknown"], root)).toThrow(/unknown source/); const extracted = extractWorkshopCandidates(root); expect(extracted.candidates.every((candidate) => candidate.sourceId === firstId)).toBe(true); await rm(root, { recursive: true, force: true }); });
it("creates a grounded Audio Overview and preserves source edges through an edited version", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-audio-overview-"));
  await ingestSource({ title: "Leadership notes", origin: "Meeting transcript", text: "The leadership deck must make the recommendation defensible. Every decision should retain an exact source locator. The next review needs a concise executive briefing." }, root);
  applyWorkshopAction("approveBrief", root);
  lockManualStyle({ intentProfile: "board_deck" }, root);
  const generated = generateAudioOverview(root);
  const first = generated.audioOverviews[0]!;
  expect(first).toMatchObject({ id: "audio-overview-v1", version: 1, posture: "decision_review", status: "script_ready", disclosure: "AI-generated voice", stale: false });
  expect(first.sections).toHaveLength(3);
  expect(first.sections.every((section) => section.evidence.length === 1 && section.evidence[0]?.claimId && section.evidence[0]?.sourceId && section.evidence[0]?.chunkId && section.evidence[0]?.locator === "Meeting transcript · chunk 01")).toBe(true);
  expect(new Set(first.sections.flatMap((section) => section.evidence.map((edge) => edge.claimId)))).toEqual(new Set(first.claimIds));
  const editedText = `${first.sections[0]!.text} Lead with the decision.`;
  const updated = updateAudioOverview(first.id, first.sections.map((section, index) => ({ id: section.id, text: index === 0 ? editedText : section.text })), root);
  expect(updated.audioOverviews).toMatchObject([{ id: "audio-overview-v1", stale: true }, { id: "audio-overview-v2", version: 2, status: "script_ready", stale: false }]);
  expect(updated.audioOverviews[1]!.sections[0]).toMatchObject({ text: editedText, edited: true, evidence: first.sections[0]!.evidence });
  expect(updated.audioOverviews[1]!.sections[1]).toMatchObject({ edited: false, evidence: first.sections[1]!.evidence });
  await rm(root, { recursive: true, force: true });
});
it("honestly stales an Audio Overview when its Map or Style changes", async () => {
  const root = await mkdtemp(join(tmpdir(), "workshop-audio-stale-"));
  await ingestSource({ title: "Evidence", origin: "Fixture", text: "Audio must stay linked to the current brief and style." }, root);
  applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); generateAudioOverview(root);
  const changedMap = applyMapOperation({ type: "update_node", nodeId: "node-promise", patch: { label: "Changed promise" } }, root);
  expect(changedMap.audioOverviews[0]).toMatchObject({ stale: true });
  applyWorkshopAction("approveBrief", root); generateAudioOverview(root);
  const changedStyle = lockManualStyle({ accent: "#1155AA" }, root);
  expect(changedStyle.audioOverviews.at(-1)).toMatchObject({ id: "audio-overview-v2", stale: true });
  await rm(root, { recursive: true, force: true });
});
});
