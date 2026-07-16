import { describe, expect, it } from "vitest";
import { ArtifactJson, Claim, ConversationTurn, DomainError, GraphOperation, SemanticGraph, StoryboardPanel, SubmissionOutputSet, appendGraphOperation, applyGraphOperation, applyStalePropagation, assertCommandEligible, assertEligible, collectStaleDependents, deriveGates, openAiWorkshopTools, parseGraphState, parseWorkshopToolInput, serializeGraphState, undoGraphOperation, undoLatestGraphOperation, workshopToolRegistry, workshopToolsFor } from "./index.js";

const now = "2026-07-13T12:00:00.000Z";
const ids = { workshopId: "workshop-1", graphId: "graph-1", nodeA: "node-a", nodeB: "node-b", edge: "edge-1", claim: "claim-1", source: "source-1", chunk: "chunk-1", artifact: "artifact-1" };
const graph = () => SemanticGraph.parse({ id: ids.graphId, workshopId: ids.workshopId, revision: 0, staleState: "current", nodes: [{ id: ids.nodeA, kind: "claim", label: "Grounded value", claimId: ids.claim, evidenceState: "verified", priority: 1 }], edges: [] });

describe("domain contracts", () => {
  it("rejects a verified claim without evidence", () => expect(() => Claim.parse({ id: ids.claim, workshopId: ids.workshopId, text: "value", evidenceState: "verified", evidence: [], provenance: "user", createdAt: now })).toThrow(/require evidence/));
  it("validates durable grounded Conversation turns", () => {
    const turn = ConversationTurn.parse({ id: "turn-1", workshopId: ids.workshopId, role: "assistant", input: "system", text: "Grounded answer", createdAt: now, evidence: [{ sourceId: ids.source, chunkId: ids.chunk, claimId: ids.claim, locator: "Fixture · chunk 01", snippet: "proof", snippetHash: "hash" }], operation: { name: "search", status: "completed" } });
    expect(turn.evidence[0]).toMatchObject({ sourceId: ids.source, chunkId: ids.chunk });
    expect(() => ConversationTurn.parse({ ...turn, operation: { name: "publish", status: "completed" } })).toThrow();
  });
  it("publishes one strict Workshop tool contract across text, voice, and plugin adapters", () => {
    expect(new Set(workshopToolRegistry.map((tool) => tool.name)).size).toBe(workshopToolRegistry.length);
    expect(workshopToolsFor("responses").map((tool) => tool.name)).toEqual(workshopToolsFor("realtime").map((tool) => tool.name));
    expect(workshopToolsFor("plugin").map((tool) => tool.name)).toEqual(expect.arrayContaining(["workshop_list", "search", "workshop_render_video"]));
    expect(openAiWorkshopTools("realtime").find((tool) => tool.name === "search")).toMatchObject({ type: "function", parameters: { additionalProperties: false, required: ["query"] } });
    expect(workshopToolsFor("responses").filter((tool) => tool.kind === "write").every((tool) => tool.requiresExplicitUserIntent)).toBe(true);
    expect(parseWorkshopToolInput("search", { query: "source proof" })).toEqual({ query: "source proof" });
    expect(() => parseWorkshopToolInput("search", { query: "source proof", publish: true })).toThrow(/does not accept publish/);
    expect(() => parseWorkshopToolInput("workshop_approve_brief", { workshopId: ids.workshopId })).toThrow(/requires mapVersion/);
  });
  it("applies graph operations and undoes an AI mutation", () => {
    const result = applyGraphOperation(graph(), GraphOperation.parse({ type: "add_node", node: { id: ids.nodeB, kind: "idea", label: "Narrative", evidenceState: "derived" } }));
    expect(result.graph.nodes).toHaveLength(2); expect(undoGraphOperation(result.graph, result.inverse).nodes).toHaveLength(1);
  });
  it("undos a node update without writing its immutable ID into the patch", () => {
    const result = applyGraphOperation(graph(), GraphOperation.parse({ type: "update_node", nodeId: ids.nodeA, patch: { label: "Edited" } }));
    expect(undoGraphOperation(result.graph, result.inverse).nodes[0].label).toBe("Grounded value");
  });
  it("persists typed graph operations, hydrates safely, and undoes the latest operation", () => {
    const history = { graphVersionId: ids.graphId as never, records: [] };
    const appended = appendGraphOperation(graph(), history, GraphOperation.parse({ type: "add_node", node: { id: ids.nodeB, kind: "idea", label: "Narrative", evidenceState: "derived" } }), { id: "operation-1", actor: "assistant", createdAt: now });
    const hydrated = parseGraphState(serializeGraphState(appended.graph, appended.history));
    expect(hydrated.history.records[0].operation.type).toBe("add_node");
    const undone = undoLatestGraphOperation(hydrated.graph, hydrated.history);
    expect(undone.graph.nodes.map((node) => node.id)).toEqual([ids.nodeA]);
    expect(undone.record.status).toBe("undone");
  });
  it("rejects graph snapshots that are malformed or attached to another graph", () => {
    expect(() => parseGraphState("not json")).toThrow(expect.objectContaining({ code: "INVALID" }));
    expect(() => appendGraphOperation(graph(), { graphVersionId: "another-graph" as never, records: [] }, GraphOperation.parse({ type: "add_node", node: { id: ids.nodeB, kind: "idea", label: "Narrative", evidenceState: "derived" } }), { id: "operation-1", actor: "user", createdAt: now })).toThrow(/different graph version/);
  });
  it("prevents dangling edges and locked-node mutations", () => {
    expect(() => applyGraphOperation(graph(), GraphOperation.parse({ type: "add_edge", edge: { id: ids.edge, from: ids.nodeA, to: ids.nodeB, kind: "supports" } }))).toThrow(DomainError);
    const locked = SemanticGraph.parse({ ...graph(), nodes: [{ ...graph().nodes[0], locked: true }] });
    expect(() => applyGraphOperation(locked, GraphOperation.parse({ type: "update_node", nodeId: ids.nodeA, patch: { label: "No" } }))).toThrow(/locked/);
  });
  it("derives independent gates and blocks only ineligible transitions", () => {
    const gates = deriveGates({ transcriptSegments: 1, boardApprovedCurrent: true, briefCurrent: true, styleLockedCurrent: false, storyboardApprovedCurrent: false, videoRenderedCurrent: false });
    expect(gates.transcript_ready).toBe(true); expect(() => assertEligible("render_video", gates)).toThrow(/storyboard_approved/); expect(() => assertEligible("create_output", gates)).not.toThrow();
  });
  it("requires a current transcript-backed Map before brief approval", () => {
    const base = { transcriptReady: true, mapCurrent: true, boardApprovedCurrent: false, briefCurrent: false, styleLockedCurrent: false, storyboardCurrent: false, storyboardApproved: false, allStoryboardPanelsCurrent: false };
    expect(() => assertCommandEligible("approve_brief", base)).not.toThrow();
    expect(() => assertCommandEligible("approve_brief", { ...base, mapCurrent: false })).toThrow(expect.objectContaining({ code: "STALE" }));
  });
  it("blocks a video render for stale or partially approved storyboard inputs", () => {
    const current = { transcriptReady: true, mapCurrent: true, boardApprovedCurrent: true, briefCurrent: true, styleLockedCurrent: true, storyboardCurrent: true, storyboardApproved: true, allStoryboardPanelsCurrent: true };
    expect(() => assertCommandEligible("render_video", current)).not.toThrow();
    expect(() => assertCommandEligible("render_video", { ...current, allStoryboardPanelsCurrent: false })).toThrow(expect.objectContaining({ code: "STALE" }));
    expect(() => assertCommandEligible("render_video", { ...current, storyboardApproved: false })).toThrow(expect.objectContaining({ code: "GATE_BLOCKED" }));
  });
  it("requires Storyboard image bindings to pin both panel identity and version", () => {
    const panel = { id: "panel-1", purpose: "Show approved work", claimIds: [], evidence: [{ sourceId: ids.source, chunkId: ids.chunk, locator: "Fixture · chunk 01" }], voiceover: "Show the reviewed image.", onScreenText: "Approved", durationSeconds: 4, composition: "Full bleed image", visualDnaVersionId: "dna-v1", transition: "cut", approved: true, staleState: "current" };
    expect(StoryboardPanel.parse({ ...panel, imagePanelId: "image-panel-1", imagePanelVersion: 2 })).toMatchObject({ imagePanelId: "image-panel-1", imagePanelVersion: 2 });
    expect(() => StoryboardPanel.parse({ ...panel, imagePanelId: "image-panel-1" })).toThrow(/both panel ID and version/);
    expect(() => StoryboardPanel.parse({ ...panel, claimIds: [ids.claim] })).toThrow(/claim IDs must match/);
  });
  it("propagates staleness transitively without staling the changed input", () => {
    const stale = collectStaleDependents("graph-1" as never, [{ upstreamId: "graph-1" as never, downstreamId: "brief-1" as never, reason: "graph" }, { upstreamId: "brief-1" as never, downstreamId: "deck-1" as never, reason: "brief" }]);
    expect([...stale]).toEqual(["brief-1", "deck-1"]);
    expect(applyStalePropagation([{ id: "graph-1" as never, staleState: "current" as const }, { id: "deck-1" as never, staleState: "current" as const }], "graph-1" as never, [{ upstreamId: "graph-1" as never, downstreamId: "deck-1" as never, reason: "graph" }])[1].staleState).toBe("stale");
  });
  it("validates renderer-safe artifact provenance", () => {
    expect(ArtifactJson.parse({ schemaVersion: 1, artifactId: ids.artifact, versionId: "version-1", workshopId: ids.workshopId, outputType: "deck", title: "Deck", staleState: "current", createdAt: now, inputVersions: { graph: ids.graphId }, claimIds: [ids.claim], evidence: [{ sourceId: ids.source, chunkId: ids.chunk, snippet: "proof", snippetHash: "hash" }], renderer: { name: "html", version: "1", settings: {} }, files: [{ path: "deck.pdf", mimeType: "application/pdf", sha256: "a".repeat(64) }] }).outputType).toBe("deck");
  });
  it("requires a complete, path-safe submission Output set", () => {
    const assets = ["devpost_description", "readme_narrative", "deck", "infographic", "image_manifest", "thumbnail", "storyboard", "narration", "video", "evidence"].map((type) => ({ type, relativePath: `${type}.md`, mimeType: "text/markdown", sha256: "a".repeat(64), byteCount: 12, claimIds: [ids.claim], sourceLocators: ["Fixture · chunk 01"], provenance: "source_trace" }));
    const outputSet = { schemaVersion: 1, id: "submission-v1", workshopId: ids.workshopId, title: "WorkshopLM submission", version: 1, status: "partial", createdAt: now, inputFingerprint: "b".repeat(64), inputs: { graphRevision: 1, briefVersion: 1, styleVersion: 1, assetPlanVersion: 1, storyboardVersion: 1, imageBatchId: "images-v1", activeSourceIds: [ids.source], claimIds: [ids.claim], outputIds: [ids.artifact], videoState: "rendered" }, claimIds: [ids.claim], sourceLocators: ["Fixture · chunk 01"], limitations: ["Provider media is not present."], assets };
    expect(SubmissionOutputSet.parse(outputSet).assets).toHaveLength(10);
    expect(() => SubmissionOutputSet.parse({ ...outputSet, status: "ready" })).toThrow(/cannot retain limitations/);
    expect(() => SubmissionOutputSet.parse({ ...outputSet, assets: assets.slice(1) })).toThrow(/requires devpost_description/);
    expect(() => SubmissionOutputSet.parse({ ...outputSet, assets: assets.map((asset, index) => index === 0 ? { ...asset, relativePath: "../outside.md" } : asset) })).toThrow(/inside the package/);
  });
});
