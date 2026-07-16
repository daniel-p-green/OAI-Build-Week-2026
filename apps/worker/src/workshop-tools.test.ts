import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { executeWorkshopTool } from "./workshop-tools.js";
import { ingestSource, readWorkshopState } from "./workshop-service.js";

const roots: string[] = [];
async function groundedRoot() {
  const root = await mkdtemp(join(tmpdir(), "workshop-tools-")); roots.push(root);
  await ingestSource({ title: "Strategy", origin: "Fixture A", text: "Professionals need a source-defensible deck. Every factual claim retains its exact locator." }, root);
  await ingestSource({ title: "Brand", origin: "Fixture B", text: "The approved style uses a restrained blue accent. Outputs must remain editable." }, root);
  return root;
}
function mapVersion(root: string) {
  const state = readWorkshopState(root); const revision = Number((JSON.parse(state.graphState ?? "{}") as { graph?: { revision?: number } }).graph?.revision ?? 0);
  return `map-r${revision}`;
}
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });

describe("shared Workshop tool executor", () => {
  it("persists a grounded Responses read with exact provider and evidence provenance", async () => {
    const root = await groundedRoot(); const state = readWorkshopState(root);
    const execution = await executeWorkshopTool({ name: "search", arguments: { query: "source defensible deck", workshopId: state.id }, channel: "responses", provider: { model: "gpt-5.6-terra", responseId: "resp-search-1", callId: "call-search-1" } }, root);
    expect(execution.result.isError).toBe(false);
    expect(execution.result.data?.results).toEqual(expect.arrayContaining([expect.objectContaining({ sourceId: expect.any(String), locator: "Fixture A · chunk 01", claims: expect.arrayContaining([expect.objectContaining({ evidenceState: "verified" })]) })]));
    expect(execution.call).toMatchObject({ name: "search", channel: "responses", explicitUserIntent: false, effect: "none", status: "succeeded", provider: { responseId: "resp-search-1", callId: "call-search-1" } });
    expect(readWorkshopState(root).toolCalls).toEqual([execution.call]);
  });

  it("fails a write without explicit intent, applies it once with intent, and replays duplicate provider calls", async () => {
    const root = await groundedRoot(); const before = readWorkshopState(root); const selected = [before.sourceItems[0]!.id];
    const blocked = await executeWorkshopTool({ name: "workshop_set_source_scope", arguments: { workshopId: before.id, sourceIds: selected }, channel: "realtime", provider: { callId: "scope-blocked" } }, root);
    expect(blocked.result).toMatchObject({ isError: true, summary: expect.stringMatching(/explicit user intent/) });
    expect(blocked.state.activeSourceIds).toEqual(before.activeSourceIds);
    const applied = await executeWorkshopTool({ name: "workshop_set_source_scope", arguments: { workshopId: before.id, sourceIds: selected }, channel: "realtime", explicitUserIntent: true, provider: { model: "gpt-realtime-2.1", callId: "scope-visible-1", eventId: "event-scope-1" } }, root);
    expect(applied.result.isError).toBe(false);
    expect(applied.state.activeSourceIds).toEqual(selected);
    expect(applied.state.briefApproved).toBe(false);
    const replayed = await executeWorkshopTool({ name: "workshop_set_source_scope", arguments: { workshopId: before.id, sourceIds: before.activeSourceIds }, channel: "realtime", explicitUserIntent: true, provider: { model: "gpt-realtime-2.1", callId: "scope-visible-1", eventId: "event-scope-1" } }, root);
    expect(replayed.replayed).toBe(true);
    expect(replayed.state.activeSourceIds).toEqual(selected);
    expect(readWorkshopState(root).toolCalls).toHaveLength(2);
  });

  it("persists stale-version rejection and approves only the exact current Map", async () => {
    const root = await groundedRoot(); const state = readWorkshopState(root);
    const stale = await executeWorkshopTool({ name: "workshop_approve_brief", arguments: { workshopId: state.id, mapVersion: "map-r999" }, channel: "responses", explicitUserIntent: true, provider: { callId: "brief-stale" } }, root);
    expect(stale.result).toMatchObject({ isError: true, summary: expect.stringContaining(`current version is ${mapVersion(root)}`) });
    const approved = await executeWorkshopTool({ name: "workshop_approve_brief", arguments: { workshopId: state.id, mapVersion: mapVersion(root) }, channel: "responses", explicitUserIntent: true, provider: { callId: "brief-current" } }, root);
    expect(approved.result.isError).toBe(false);
    expect(approved.state).toMatchObject({ briefApproved: true, frame: { stale: false } });
    expect(readWorkshopState(root).toolCalls.map(({ status }) => status)).toEqual(["failed", "succeeded"]);
  });

  it("rejects evidence fetches outside the active source scope", async () => {
    const root = await groundedRoot(); const state = readWorkshopState(root); const excluded = state.sourceItems[1]!;
    await executeWorkshopTool({ name: "workshop_set_source_scope", arguments: { workshopId: state.id, sourceIds: [state.sourceItems[0]!.id] }, channel: "responses", explicitUserIntent: true, provider: { callId: "scope-one" } }, root);
    const chunk = state.sourceChunks.find((candidate) => candidate.sourceId === excluded.id)!;
    const fetched = await executeWorkshopTool({ name: "fetch", arguments: { workshopId: state.id, sourceId: excluded.id, chunkId: chunk.id }, channel: "responses", provider: { callId: "fetch-excluded" } }, root);
    expect(fetched.result).toMatchObject({ isError: true, summary: expect.stringMatching(/outside the active source scope/) });
  });

  it("replays a provider retry even when the original strict-input failure is repeated", async () => {
    const root = await groundedRoot(); const state = readWorkshopState(root);
    const request = { name: "search", arguments: { workshopId: state.id, query: 42 }, channel: "responses" as const, provider: { callId: "invalid-search-1" } };
    const failed = await executeWorkshopTool(request, root);
    const replayed = await executeWorkshopTool(request, root);
    expect(failed.result).toMatchObject({ isError: true, summary: expect.stringMatching(/query must be a string/) });
    expect(replayed).toMatchObject({ replayed: true, call: { id: failed.call.id } });
    expect(readWorkshopState(root).toolCalls).toHaveLength(1);
  });
});
