import { describe, expect, it } from "vitest";
import { ArtifactJson, Claim, DomainError, GraphOperation, SemanticGraph, applyGraphOperation, applyStalePropagation, assertEligible, collectStaleDependents, deriveGates, undoGraphOperation } from "./index.js";

const now = "2026-07-13T12:00:00.000Z";
const ids = { workshopId: "workshop-1", graphId: "graph-1", nodeA: "node-a", nodeB: "node-b", edge: "edge-1", claim: "claim-1", source: "source-1", chunk: "chunk-1", artifact: "artifact-1" };
const graph = () => SemanticGraph.parse({ id: ids.graphId, workshopId: ids.workshopId, revision: 0, staleState: "current", nodes: [{ id: ids.nodeA, kind: "claim", label: "Grounded value", claimId: ids.claim, evidenceState: "verified", priority: 1 }], edges: [] });

describe("domain contracts", () => {
  it("rejects a verified claim without evidence", () => expect(() => Claim.parse({ id: ids.claim, workshopId: ids.workshopId, text: "value", evidenceState: "verified", evidence: [], provenance: "user", createdAt: now })).toThrow(/require evidence/));
  it("applies graph operations and undoes an AI mutation", () => {
    const result = applyGraphOperation(graph(), GraphOperation.parse({ type: "add_node", node: { id: ids.nodeB, kind: "idea", label: "Narrative", evidenceState: "derived" } }));
    expect(result.graph.nodes).toHaveLength(2); expect(undoGraphOperation(result.graph, result.inverse).nodes).toHaveLength(1);
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
  it("propagates staleness transitively without staling the changed input", () => {
    const stale = collectStaleDependents("graph-1" as never, [{ upstreamId: "graph-1" as never, downstreamId: "brief-1" as never, reason: "graph" }, { upstreamId: "brief-1" as never, downstreamId: "deck-1" as never, reason: "brief" }]);
    expect([...stale]).toEqual(["brief-1", "deck-1"]);
    expect(applyStalePropagation([{ id: "graph-1" as never, staleState: "current" as const }, { id: "deck-1" as never, staleState: "current" as const }], "graph-1" as never, [{ upstreamId: "graph-1" as never, downstreamId: "deck-1" as never, reason: "graph" }])[1].staleState).toBe("stale");
  });
  it("validates renderer-safe artifact provenance", () => {
    expect(ArtifactJson.parse({ schemaVersion: 1, artifactId: ids.artifact, versionId: "version-1", workshopId: ids.workshopId, outputType: "deck", title: "Deck", staleState: "current", createdAt: now, inputVersions: { graph: ids.graphId }, claimIds: [ids.claim], evidence: [{ sourceId: ids.source, chunkId: ids.chunk, snippet: "proof", snippetHash: "hash" }], renderer: { name: "html", version: "1", settings: {} }, files: [{ path: "deck.pdf", mimeType: "application/pdf", sha256: "a".repeat(64) }] }).outputType).toBe("deck");
  });
});
