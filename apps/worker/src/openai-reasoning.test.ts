import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { generateGroundedMapWithGpt56 } from "./openai-reasoning.js";
import { ingestSource, readWorkshopState } from "./workshop-service.js";

const roots: string[] = [];
async function rootWithEvidence(): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), "workshop-gpt56-map-"));
  roots.push(root);
  await ingestSource({ title: "Evidence", origin: "Fixture", text: "Professional teams need a visible proof chain.\n\nEvery factual output must keep a source locator." }, root);
  return root;
}
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });

describe("GPT-5.6 grounded Map adapter", () => {
  it("persists a claim-validated assistant graph and model-run provenance", async () => {
    const root = await rootWithEvidence();
    const claims = readWorkshopState(root).claims;
    const proposal = { nodes: [
      { id: "proof-chain", title: "Visible proof chain", body: "Teams need to see the chain from evidence to output.", evidenceState: "grounded", evidenceClaimIds: [claims[0]!.id], x: 20, y: 25 },
      { id: "source-locators", title: "Source locators", body: "Every factual output retains its source locator.", evidenceState: "grounded", evidenceClaimIds: [claims[1]!.id], x: 65, y: 25 },
      { id: "professional-trust", title: "Professional trust", body: "Visible evidence and locators make the production path inspectable.", evidenceState: "derived", evidenceClaimIds: [claims[0]!.id, claims[1]!.id], x: 42, y: 65 },
      { id: "review-first", title: "Review the evidence-to- proof chain", body: "Review the evidence path before creating professional work.", evidenceState: "direction", evidenceClaimIds: [claims[0]!.id, claims[1]!.id], x: 78, y: 65 },
    ], edges: [
      { id: "edge-proof-trust", from: "proof-chain", to: "professional-trust", kind: "supports", label: "builds" },
      { id: "edge-locator-trust", from: "source-locators", to: "professional-trust", kind: "supports", label: "grounds" },
      { id: "edge-trust-review", from: "professional-trust", to: "review-first", kind: "depends_on", label: "guides" },
    ] };
    const fetchImpl: typeof fetch = async (_input, init) => {
      const body = JSON.parse(String(init?.body)) as { model: string; store: boolean; text: { format: { type: string } } };
      expect(body).toMatchObject({ model: "gpt-5.6-sol", store: false, text: { format: { type: "json_schema" } } });
      return new Response(JSON.stringify({ output: [{ type: "message", content: [{ type: "output_text", text: JSON.stringify(proposal) }] }] }), { status: 200, headers: { "content-type": "application/json", "x-request-id": "response-request-1" } });
    };

    const state = await generateGroundedMapWithGpt56(root, { apiKey: "test-key", model: "gpt-5.6-sol", reasoningEffort: "medium" }, fetchImpl);
    expect(state.mapNodes).toHaveLength(4);
    expect(state.mapEdges).toHaveLength(3);
    expect(state.mapNodes[0]).toMatchObject({ kind: "grounded", locator: "Fixture · chunk 01", sourceId: claims[0]!.sourceId });
    expect(state.mapNodes[2]).toMatchObject({ kind: "derived" });
    expect(state.mapNodes[3]).toMatchObject({ kind: "creative", title: "Review the evidence-to-proof chain", locator: "Fixture · chunk 01" });
    expect(state.graphState).toContain('"actor":"assistant"');
    expect(state.aiRuns[0]).toMatchObject({ operation: "grounded_graph", model: "gpt-5.6-sol", inputClaimIds: expect.arrayContaining([claims[0]!.id, claims[1]!.id]), requestId: "response-request-1", outputSha256: expect.stringMatching(/^[a-f0-9]{64}$/) });
  });

  it("rejects model output that cites a claim outside the active source scope", async () => {
    const root = await rootWithEvidence();
    const invalid = { nodes: [
      { id: "one", title: "One", body: "One", evidenceState: "grounded", evidenceClaimIds: ["claim-not-active"], x: 20, y: 20 },
      { id: "two", title: "Two", body: "Two", evidenceState: "derived", evidenceClaimIds: [], x: 70, y: 70 },
    ], edges: [] };
    const fetchImpl: typeof fetch = async () => new Response(JSON.stringify({ output_text: JSON.stringify(invalid) }), { status: 200, headers: { "content-type": "application/json" } });
    await expect(generateGroundedMapWithGpt56(root, { apiKey: "test-key", model: "gpt-5.6-terra", reasoningEffort: "medium" }, fetchImpl)).rejects.toThrow(/outside the active source scope/);
    expect(readWorkshopState(root).aiRuns).toEqual([]);
  });

  it("keeps evidence uniqueness in the domain validator without an unsupported response-schema keyword", async () => {
    const root = await rootWithEvidence();
    const claims = readWorkshopState(root).claims;
    const invalid = { nodes: [
      { id: "one", title: "One", body: "One", evidenceState: "grounded", evidenceClaimIds: [claims[0]!.id, claims[0]!.id], x: 20, y: 20 },
      { id: "two", title: "Two", body: "Two", evidenceState: "derived", evidenceClaimIds: [], x: 70, y: 70 },
    ], edges: [] };
    const fetchImpl: typeof fetch = async (_input, init) => {
      expect(JSON.stringify(JSON.parse(String(init?.body)))).not.toContain("uniqueItems");
      return new Response(JSON.stringify({ output_text: JSON.stringify(invalid) }), { status: 200, headers: { "content-type": "application/json" } });
    };
    await expect(generateGroundedMapWithGpt56(root, { apiKey: "test-key", model: "gpt-5.6-terra", reasoningEffort: "medium" }, fetchImpl)).rejects.toThrow(/duplicate evidence claims/);
  });

  it("rejects an ungrounded recommended direction", async () => {
    const root = await rootWithEvidence();
    const claims = readWorkshopState(root).claims;
    const invalid = { nodes: [
      { id: "one", title: "One", body: "One", evidenceState: "grounded", evidenceClaimIds: [claims[0]!.id], x: 20, y: 20 },
      { id: "next", title: "Next", body: "Do something unrelated.", evidenceState: "direction", evidenceClaimIds: [], x: 75, y: 20 },
    ], edges: [] };
    const fetchImpl: typeof fetch = async () => new Response(JSON.stringify({ output_text: JSON.stringify(invalid) }), { status: 200, headers: { "content-type": "application/json" } });
    await expect(generateGroundedMapWithGpt56(root, { apiKey: "test-key", model: "gpt-5.6-terra", reasoningEffort: "medium" }, fetchImpl)).rejects.toThrow(/Direction Map node next requires evidence/);
  });
});
