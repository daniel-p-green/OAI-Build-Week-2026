import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { executeWorkshopTool, workshopToolContext } from "./workshop-tools.js";
import { applyWorkshopAction, ingestSource, lockManualStyle, readWorkshopState } from "./workshop-service.js";

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
  it("exposes the exact current IDs and approval versions required by provider tools", async () => {
    const root = await groundedRoot(); const state = readWorkshopState(root);
    expect(workshopToolContext(state)).toEqual({ workshopId: state.id, mapVersion: mapVersion(root), storyboardVersion: `storyboard-v${state.storyboard.version}`, activeSourceIds: state.activeSourceIds, briefApproved: false, storyboardApproved: false });
  });
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
    const applied = await executeWorkshopTool({ name: "workshop_set_source_scope", arguments: { workshopId: before.id, sourceIds: selected }, channel: "realtime", explicitUserIntent: true, provider: { model: "gpt-realtime-2.1", callId: "scope-blocked", eventId: "event-scope-1" } }, root);
    expect(applied.result.isError).toBe(false);
    expect(applied.state.activeSourceIds).toEqual(selected);
    expect(applied.state.briefApproved).toBe(false);
    const replayed = await executeWorkshopTool({ name: "workshop_set_source_scope", arguments: { workshopId: before.id, sourceIds: before.activeSourceIds }, channel: "realtime", explicitUserIntent: true, provider: { model: "gpt-realtime-2.1", callId: "scope-blocked", eventId: "event-scope-1" } }, root);
    expect(replayed.replayed).toBe(true);
    expect(replayed.state.activeSourceIds).toEqual(selected);
    expect(readWorkshopState(root).toolCalls).toHaveLength(2);
    expect(readWorkshopState(root).toolCalls.map((call) => call.explicitUserIntent)).toEqual([false, true]);
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

  it("creates a first-class grounded Audio Overview through the shared tool surface", async () => {
    const root = await groundedRoot(); const state = readWorkshopState(root);
    applyWorkshopAction("approveBrief", root); lockManualStyle({ intentProfile: "client_facing_pitch" }, root);
    const created = await executeWorkshopTool({ name: "workshop_create_output", arguments: { workshopId: state.id, outputType: "audio_overview" }, channel: "responses", explicitUserIntent: true, provider: { callId: "audio-overview-1" } }, root);
    expect(created.result).toMatchObject({ isError: false, data: { outputType: "audio_overview", outputId: "audio-overview-v1" } });
    expect(created.state.audioOverviews[0]).toMatchObject({ status: "script_ready", stale: false });
    expect(created.state.audioOverviews[0]!.sections).toHaveLength(3);
    expect(created.state.audioOverviews[0]!.sections[0]!.evidence[0]).toMatchObject({ claimId: expect.stringMatching(/^claim-/), sourceId: expect.stringMatching(/^source-/), chunkId: expect.stringMatching(/^chunk-/) });
  });

  it("creates a Presentation through the professional model-facing format name", async () => {
    const root = await groundedRoot(); const state = readWorkshopState(root);
    applyWorkshopAction("approveBrief", root); lockManualStyle({ intentProfile: "client_facing_pitch" }, root);
    const created = await executeWorkshopTool({ name: "workshop_create_output", arguments: { workshopId: state.id, outputType: "presentation" }, channel: "responses", explicitUserIntent: true, provider: { callId: "presentation-1" } }, root);
    expect(created.result).toMatchObject({ isError: false, summary: "Created Presentation.", data: { outputType: "presentation" } });
    expect(created.state.outputs.at(-1)).toMatchObject({ type: "deck", stale: false });
  });
});
