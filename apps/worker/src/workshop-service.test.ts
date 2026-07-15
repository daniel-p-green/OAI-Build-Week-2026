import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { describe, expect, it } from "vitest";
import { analyzeWebsiteStyle, applyMapOperation, applyStyleLibrary, applyWorkshopAction, approveSketch, approveVisualDna, assertStoryboardGrounding, captureFallbackTranscript, createImageBatch, createSketch, createVisualDna, createWorkshop, extractWorkshopCandidates, generateAssetPlan, generateOutput, generateStoryboard, ingestSource, ingestUrl, listStyleLibrary, listWorkshopSummaries, lockManualStyle, lockWebsiteStyle, markImagePanelFailed, normalizePdfLayoutText, readWorkshopState, resolveWorkshopArtifact, searchWorkshopSources, selectImagePanelForRegeneration, selectWorkshop, setActiveSourceScope, syncMapCanvas, undoMapOperation, updateStoryboardPanel } from "./workshop-service.js";
describe("Workshop service", () => { it("persists brief/style/storyboard gates and blocks video until the storyboard is approved", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-service-")); expect(() => applyWorkshopAction("renderVideo", root)).toThrow(/storyboard/); const brief = applyWorkshopAction("approveBrief", root); expect(brief.frame).toMatchObject({ markdownPath: "generated/FRAME-v1.md", executablePath: "generated/FRAME-v1.json" }); expect(await readFile(join(root, brief.frame!.markdownPath), "utf8")).toContain("# FRAME.md"); expect(JSON.parse(await readFile(join(root, brief.frame!.executablePath), "utf8"))).toMatchObject({ frameVersion: 1, schemaVersion: 1, evidence: expect.any(Array) }); applyWorkshopAction("lockManualStyle", root); expect(applyWorkshopAction("approveStoryboard", root).storyboardApproved).toBe(true); expect(applyWorkshopAction("renderVideo", root).videoState).toBe("queued"); expect(readWorkshopState(root).briefApproved).toBe(true); await rm(root, { recursive: true, force: true }); });
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
it("normalizes a sanitized source into durable chunks, claims, permissions, and typed grounded Map records", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-ingest-")); const ingested = await ingestSource({ title: "Sanitized meeting", origin: "Local fixture", text: "  Judges need a visible trail.\r\n\r\nThe Map must remain editable.  " }, root); const sourceId = ingested.sourceItems.at(-1)!.id; expect(ingested.sources).toBe(4); expect(ingested.sourceItems.at(-1)).toMatchObject({ title: "Sanitized meeting", origin: "Local fixture", type: "TXT", permission: "sanitized" }); expect(ingested.sourceChunks.filter((chunk) => chunk.sourceId === sourceId).at(-1)).toMatchObject({ sourceId, locator: "Local fixture · chunk 02" }); expect(ingested.claims.filter((claim) => claim.sourceId === sourceId)).toHaveLength(2); expect(searchWorkshopSources("editable Map", root).filter((chunk) => chunk.sourceId === sourceId)).toHaveLength(1); expect(ingested.mapNodes.at(-1)).toMatchObject({ title: "Sanitized meeting", kind: "grounded" }); expect(ingested.graphState).toContain("operation-source-"); expect(ingested.graphState).toContain('"actor":"system"'); const repeated = await ingestSource({ title: "Sanitized meeting", origin: "Local fixture", text: "Judges need a visible trail.\n\nThe Map must remain editable." }, root); expect(repeated.sources).toBe(4); await rm(root, { recursive: true, force: true }); });
it("ships a BM25-searchable sanitized Workshop without an acceptance-only data-root override", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-seed-evidence-")); const state = readWorkshopState(root); expect(state.sourceChunks).toHaveLength(3); expect(state.claims).toHaveLength(5); expect(searchWorkshopSources("editable production system", root)[0]).toMatchObject({ sourceId: "source-design", locator: "Design · Map" }); const database = new DatabaseSync(join(root, "data", "workshoplm.sqlite")); expect((database.prepare("SELECT count(*) AS count FROM evidence_fts WHERE workshop_id=?").get(state.id) as { count: number }).count).toBe(3); database.close(); await rm(root, { recursive: true, force: true }); });
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
it("creates and approves a versioned Sketch from an approved Map, then stales it", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-sketch-")); applyWorkshopAction("approveBrief", root); const sketch = createSketch(root).sketch; expect(sketch).toMatchObject({ version: 1, graphRevision: 0, stale: false, approved: false }); expect(sketch?.nodes).toHaveLength(4); expect(approveSketch(root).sketch?.approved).toBe(true); expect(applyMapOperation({ type: "update_node", nodeId: "node-promise", patch: { label: "Changed" } }, root).sketch).toMatchObject({ stale: true, approved: false }); await rm(root, { recursive: true, force: true }); });
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
  expect(changed.style).toMatchObject({ name: "Board dark", accent: "#552211", intentProfile: "board_deck", version: 2, stale: false });
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
  expect(refreshed.mapNodes.some((node) => node.sourceId === newSource.id && node.title === "Thursday client meeting")).toBe(true);
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
    return new Response('<html><head><title>Public Studio</title><meta name="theme-color" content="#2457D6"><link rel="stylesheet" href="/brand.css"></head><body><img class="brand-logo" src="/logo.svg"></body></html>', { status: 200, headers: { "content-type": "text/html" } });
  };
  const suggestion = await analyzeWebsiteStyle("https://example.com/style", fetchImpl as typeof fetch);
  expect(suggestion).toMatchObject({ name: "Public Studio foundation", accent: "#2457D6", ink: "#102030", paper: "#FAF8F4", logos: ["https://example.com/logo.svg"], fontCandidates: ["Studio Sans"], findings: { colors: 3, fontCandidates: 1, assets: 1, stylesheets: 1 } });
  expect(requests).toHaveLength(2);
  const state = await lockWebsiteStyle("https://example.com/style", root, fetchImpl as typeof fetch, "board_deck", { name: suggestion.name, accent: "#335577", ink: suggestion.ink, paper: suggestion.paper, logos: suggestion.logos, licensedFonts: suggestion.fontCandidates, references: suggestion.references, negativeRules: ["No gradients"], intentProfile: "board_deck" });
  expect(requests).toHaveLength(2);
  expect(state.style).toMatchObject({ source: "website", name: "Public Studio foundation", accent: "#335577", ink: "#102030", paper: "#FAF8F4", logos: ["https://example.com/logo.svg"], licensedFonts: ["Studio Sans"], negativeRules: ["No gradients"], intentProfile: "board_deck", referenceUrl: "https://example.com/style" });
  expect(state.designArtifact?.markdownPath).toBe("generated/DESIGN-v1.md");
  expect(JSON.parse(await readFile(join(root, state.designArtifact!.tokensPath), "utf8"))).toMatchObject({ source: "website", palette: { accent: "#335577" }, licensedFonts: ["Studio Sans"], intentProfile: "board_deck" });
  await rm(root, { recursive: true, force: true });
});
it("rejects a website Style redirect into the local network", async () => {
  const fetchImpl = async () => new Response(null, { status: 302, headers: { location: "http://127.0.0.1/private.css" } });
  await expect(analyzeWebsiteStyle("https://example.com/style", fetchImpl as typeof fetch)).rejects.toThrow(/Private network URLs/);
});
it("creates, approves, and stales a versioned Visual DNA preview", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-dna-")); lockManualStyle({ references: ["editorial grid"], negativeRules: ["no gradients"] }, root); const preview = createVisualDna(root); expect(preview.visualDna).toMatchObject({ version: 1, styleVersion: 1, approved: false, stale: false, negativeRules: ["no gradients"] }); expect(approveVisualDna(root).visualDna?.approved).toBe(true); const relocked = lockManualStyle({ accent: "#1155AA" }, root); expect(relocked.visualDna).toMatchObject({ approved: false, stale: true }); await rm(root, { recursive: true, force: true }); });
it("writes a source-traceable output after current brief and style approval", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-output-")); await ingestSource({ title: "Evidence", origin: "Fixture", text: "Turn raw thinking into finished work without losing the trail back to source material." }, root); applyWorkshopAction("approveBrief", root); applyWorkshopAction("lockManualStyle", root); const generated = await generateOutput("deck", root); expect(generated.outputs[0]).toMatchObject({ type: "deck", stale: false, editableRelativePath: expect.stringMatching(/\.pptx$/), editableArtifactPath: expect.stringMatching(/^artifacts\//), claimIds: expect.arrayContaining([expect.stringMatching(/^claim-/)]) }); expect(generated.outputs[0].artifactPath).toMatch(/^artifacts\//); const html = await readFile(join(root, generated.outputs[0]!.relativePath), "utf8"); const pptx = await readFile(join(root, generated.outputs[0]!.editableRelativePath!)); const editable = resolveWorkshopArtifact(generated.outputs[0]!.id, root, undefined, "editable"); expect(html).not.toContain("FRAME"); expect(html).toContain("without losing the trail…"); expect(pptx.subarray(0, 2).toString()).toBe("PK"); expect(editable).toMatchObject({ contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", fileName: "deck-v1.pptx" }); await rm(root, { recursive: true, force: true }); });
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
  expect(html).toContain("Source: Strategy notes · chunk");
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
  expect(html).toContain("180+ chapters across 40+ countries");
  expect(html).toContain("Start a chapter");
  expect(html).not.toContain("Users trust AI responses 91%");
  await rm(root, { recursive: true, force: true });
});
it("writes a source-traceable infographic with an editable PowerPoint export", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-infographic-")); await ingestSource({ title: "Evidence", origin: "Fixture locator", text: "An infographic should preserve a source locator." }, root); applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); const generated = await generateOutput("infographic", root); const output = generated.outputs[0]!; expect(output).toMatchObject({ type: "infographic", stale: false, editableRelativePath: expect.stringMatching(/\.infographic\.pptx$/), claimIds: expect.arrayContaining([expect.stringMatching(/^claim-/)]) }); expect(await readFile(join(root, output.relativePath), "utf8")).toContain("Fixture locator · chunk 01"); const editable = await readFile(join(root, output.editableRelativePath!)); expect(editable.subarray(0, 2).toString()).toBe("PK"); expect(resolveWorkshopArtifact(output.id, root, undefined, "editable")).toMatchObject({ path: join(root, output.editableRelativePath!), contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", fileName: "infographic-v1.pptx" }); await rm(root, { recursive: true, force: true }); });
it("builds an asset plan from approved graph, brief, evidence, and Style Foundation versions", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-plan-")); await ingestSource({ title: "Evidence", origin: "Fixture", text: "A plan must name its evidence." }, root); applyWorkshopAction("approveBrief", root); lockManualStyle({ intentProfile: "board_deck" }, root); createVisualDna(root); approveVisualDna(root); const plan = generateAssetPlan(root).assetPlan; expect(plan).toMatchObject({ version: 1, briefVersion: 1, styleVersion: 1, visualDnaVersion: 1, stale: false }); expect(plan?.items.map((item) => item.outputType)).toEqual(["deck", "infographic", "images", "storyboard", "video"]); expect(plan?.items.map((item) => item.title)).toEqual(["Presentation", "Infographic", "Image set", "Storyboard", "Demo video"]); expect(plan?.items.map((item) => item.prompt).join(" ")).not.toMatch(/FRAME|Visual DNA|provenance|render/i); expect(plan?.evidenceClaimIds[0]).toMatch(/^claim-/); expect(plan?.items.every((item) => { const evidence = item.evidence[0]; return Boolean(evidence?.claimId && plan.evidenceClaimIds.includes(evidence.claimId) && evidence.sourceId && evidence.chunkId); })).toBe(true); await rm(root, { recursive: true, force: true }); });
it("generates editable storyboard panels from the current approved-input asset plan", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-generated-story-")); await ingestSource({ title: "Evidence", origin: "Fixture", text: "The storyboard must inherit plan evidence." }, root); applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); generateAssetPlan(root); const state = generateStoryboard(root); expect(state.storyboard).toMatchObject({ stale: false }); expect(state.storyboard.panels).toHaveLength(5); expect(state.storyboard.panels[0]?.narration).toContain("Fixture · chunk 01"); expect(state.storyboard.panels[0]).toMatchObject({ claimIds: [expect.stringMatching(/^claim-/)], evidence: [{ claimId: expect.stringMatching(/^claim-/), sourceId: expect.stringMatching(/^source-/), chunkId: expect.stringMatching(/^chunk-/), locator: "Fixture · chunk 01" }] }); expect(() => assertStoryboardGrounding({ ...state, storyboard: { ...state.storyboard, panels: state.storyboard.panels.map((panel, index) => index ? panel : { ...panel, claimIds: ["claim-tampered"] }) } })).toThrow(/claim IDs do not match/); expect(state.storyboardApproved).toBe(false); await rm(root, { recursive: true, force: true }); });
it("binds Storyboard panels to image versions and revokes approval when a bound image version changes", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-story-images-")); await ingestSource({ title: "Evidence", origin: "Fixture", text: "The approved video must use the images reviewed in its storyboard." }, root); applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); generateAssetPlan(root); createImageBatch(root); const generated = generateStoryboard(root); expect(generated.storyboard.panels.map((panel) => [panel.imagePanelId, panel.imagePanelVersion])).toEqual([["image-panel-1", 1], ["image-panel-2", 1], ["image-panel-3", 1], ["image-panel-4", 1], ["image-panel-5", 1]]); expect(applyWorkshopAction("approveStoryboard", root).storyboardApproved).toBe(true); const changed = selectImagePanelForRegeneration("image-panel-2", root); expect(changed.storyboardApproved).toBe(false); expect(changed.storyboard).toMatchObject({ stale: true }); expect(changed.storyboard.panels[1]).toMatchObject({ stale: true, approved: false, imagePanelVersion: 1 }); expect(changed.imageBatch?.panels[1]).toMatchObject({ version: 2, state: "selected_for_regeneration" }); expect(() => applyWorkshopAction("approveStoryboard", root)).toThrow(/current approved panels/); await rm(root, { recursive: true, force: true }); });
it("persists an editable storyboard panel and invalidates its prior approval", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-story-")); applyWorkshopAction("approveBrief", root); applyWorkshopAction("lockManualStyle", root); applyWorkshopAction("approveStoryboard", root); const edited = updateStoryboardPanel("panel-2", { title: "Evidence Map", narration: "Reveal linked source chunks.", durationSeconds: 6 }, root); expect(edited.storyboardApproved).toBe(false); expect(edited.storyboard.panels[1]).toMatchObject({ title: "Evidence Map", durationSeconds: 6, approved: true }); await rm(root, { recursive: true, force: true }); });
it("rejects unsafe URL ingestion before any network fetch", async () => { await expect(ingestUrl("http://localhost:3000/private")).rejects.toThrow(/Local network/); await expect(ingestUrl("file:///etc/passwd")).rejects.toThrow(/HTTP/); });
it("creates a coherent six-panel image batch from the locked style and selectively regenerates one panel", () => { const root = join(tmpdir(), `workshop-images-${Date.now()}`); applyWorkshopAction("lockManualStyle", root); const batch = createImageBatch(root); expect(batch.imageBatch?.panels).toHaveLength(6); expect(batch.imageBatch?.panels.every((panel) => panel.referenceId === "style-v1")).toBe(true); const selected = selectImagePanelForRegeneration("image-panel-3", root); expect(selected.imageBatch?.panels[2]).toMatchObject({ version: 2, state: "selected_for_regeneration" }); });
it("retains a completed deck when an image panel fails and allows only that panel to retry", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-partial-")); await ingestSource({ title: "Evidence", origin: "Fixture", text: "A failed image panel must not discard a completed deck." }, root); applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); const deck = await generateOutput("deck", root); createImageBatch(root); const partial = markImagePanelFailed("image-panel-2", "Provider timeout", root); expect(partial.outputs).toEqual(deck.outputs); expect(partial.outputs[0]).toMatchObject({ type: "deck", stale: false }); expect(partial.imageBatch?.panels[1]).toMatchObject({ state: "failed", error: "Provider timeout", version: 1 }); const retried = selectImagePanelForRegeneration("image-panel-2", root); expect(retried.imageBatch?.panels[1]).toMatchObject({ state: "selected_for_regeneration", error: undefined, version: 2 }); expect(retried.imageBatch?.panels[0]).toMatchObject({ state: "planned", version: 1 }); await rm(root, { recursive: true, force: true }); });
it("marks outputs and storyboard stale when the upstream Map changes", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-stale-")); await ingestSource({ title: "Evidence", origin: "Fixture", text: "An upstream Map edit must stale output." }, root); applyWorkshopAction("approveBrief", root); applyWorkshopAction("lockManualStyle", root); await generateOutput("deck", root); generateAssetPlan(root); generateStoryboard(root); applyWorkshopAction("approveStoryboard", root); const changed = applyMapOperation({ type: "update_node", nodeId: "node-promise", patch: { label: "Changed source meaning" } }, root); expect(changed.outputs[0]?.stale).toBe(true); expect(changed.storyboard.stale).toBe(true); expect(changed.storyboardApproved).toBe(false); expect(() => applyWorkshopAction("renderVideo", root)).toThrow(/storyboard/); await rm(root, { recursive: true, force: true }); });
it("marks output, plan, image, storyboard, and Visual DNA stale when Style Foundation changes", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-style-stale-")); await ingestSource({ title: "Evidence", origin: "Fixture", text: "A style change must stale rendered work." }, root); applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); await generateOutput("deck", root); createImageBatch(root); createVisualDna(root); approveVisualDna(root); generateAssetPlan(root); generateStoryboard(root); applyWorkshopAction("approveStoryboard", root); const changed = lockManualStyle({ accent: "#1155AA" }, root); expect(changed.outputs[0]?.stale).toBe(true); expect(changed.assetPlan?.stale).toBe(true); expect(changed.imageBatch?.stale).toBe(true); expect(changed.storyboard.stale).toBe(true); expect(changed.storyboardApproved).toBe(false); expect(changed.visualDna).toMatchObject({ stale: true, approved: false }); expect(changed.videoState).toBe("blocked"); await rm(root, { recursive: true, force: true }); });
it("persists capture-only fallback provenance and time-to-first-output timestamps", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-fallback-")); const captured = await captureFallbackTranscript("Voice fallback captures a grounded source.", root); expect(captured.transcriptSegments[0]).toMatchObject({ origin: "realtime_fallback", transport: "fixture", provider: undefined }); expect(captured.sourceItems.at(-1)?.origin).toContain("capture-only fallback"); expect(captured.sourceItems.at(-1)?.permission).toBe("private"); expect(captured.firstTranscriptAt).toBe(captured.transcriptSegments[0]?.capturedAt); applyWorkshopAction("approveBrief", root); applyWorkshopAction("lockManualStyle", root); const output = await generateOutput("deck", root); expect(output.firstRenderedOutputAt).toBeDefined(); expect(Date.parse(output.firstRenderedOutputAt!) >= Date.parse(output.firstTranscriptAt!)).toBe(true); await rm(root, { recursive: true, force: true }); });
it("records provider event provenance only for a WebRTC capture", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-webrtc-")); const captured = await captureFallbackTranscript("A real microphone turn.", root, { transport: "webrtc", model: "gpt-realtime-2.1", transcriptionModel: "gpt-realtime-whisper", itemIds: ["item-1"], eventIds: ["event-1"] }); expect(captured.transcriptSegments[0]).toMatchObject({ transport: "webrtc", provider: { model: "gpt-realtime-2.1", transcriptionModel: "gpt-realtime-whisper", itemIds: ["item-1"], eventIds: ["event-1"] } }); await expect(captureFallbackTranscript("Missing evidence.", root, { transport: "webrtc", model: "gpt-realtime-2.1", transcriptionModel: "gpt-realtime-whisper", itemIds: [], eventIds: [] })).rejects.toThrow(/item and event IDs/); await rm(root, { recursive: true, force: true }); });
it("extracts durable candidate categories from the selected grounded source scope", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-candidates-")); const ingested = await ingestSource({ title: "Planning notes", origin: "Fixture", text: "We need to build a cited Map. Judges are the audience. The demo must stay under three minutes. How do we show provenance?" }, root); const sourceId = ingested.sourceItems.at(-1)!.id; setActiveSourceScope([sourceId], root); const extracted = extractWorkshopCandidates(root); expect(extracted.candidates.map((candidate) => candidate.category)).toEqual(expect.arrayContaining(["goal", "audience", "constraint", "question"])); expect(extracted.candidates.every((candidate) => candidate.sourceId === sourceId && candidate.locator.includes("Fixture"))).toBe(true); await rm(root, { recursive: true, force: true }); });
it("makes active source scope a provenance contract and stales dependent work", async () => { const root = await mkdtemp(join(tmpdir(), "workshop-scope-")); const first = await ingestSource({ title: "First evidence", origin: "First", text: "First source claim." }, root); const second = await ingestSource({ title: "Second evidence", origin: "Second", text: "Second source claim." }, root); const firstId = first.sourceItems.at(-1)!.id; const secondId = second.sourceItems.at(-1)!.id; applyWorkshopAction("approveBrief", root); lockManualStyle({}, root); await generateOutput("deck", root); const scoped = setActiveSourceScope([firstId], root); expect(scoped.activeSourceIds).toEqual([firstId]); expect(scoped.briefApproved).toBe(false); expect(scoped.outputs[0]?.stale).toBe(true); expect(scoped.storyboard.stale).toBe(true); expect(() => setActiveSourceScope([], root)).toThrow(/at least one source/); expect(() => setActiveSourceScope([secondId, "unknown"], root)).toThrow(/unknown source/); const extracted = extractWorkshopCandidates(root); expect(extracted.candidates.every((candidate) => candidate.sourceId === firstId)).toBe(true); await rm(root, { recursive: true, force: true }); });
});
