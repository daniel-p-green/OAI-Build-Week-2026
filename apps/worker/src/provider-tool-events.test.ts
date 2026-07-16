import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { handleWorkshopProviderToolEvent } from "./provider-tool-events.js";
import { ingestSource, readWorkshopState } from "./workshop-service.js";

const roots: string[] = [];
async function groundedRoot() {
  const root = await mkdtemp(join(tmpdir(), "provider-events-")); roots.push(root);
  await ingestSource({ title: "Evidence", origin: "Fixture", text: "A professional can defend every claim in the presentation." }, root);
  return root;
}
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });

describe("provider tool event adapters", () => {
  it("persists a Responses continuation without mistaking a message for a tool call", async () => {
    const root = await groundedRoot();
    const handled = await handleWorkshopProviderToolEvent({ channel: "responses", model: "gpt-5.6-terra", event: { type: "response.created", response: { id: "resp-continue-1" } } }, root);
    expect(handled.handled).toBe(false);
    expect(handled.state.conversationContinuation).toMatchObject({ responseId: "resp-continue-1", model: "gpt-5.6-terra" });
  });

  it("executes a completed Responses function item and returns the exact function output", async () => {
    const root = await groundedRoot(); const state = readWorkshopState(root);
    const handled = await handleWorkshopProviderToolEvent({
      channel: "responses", model: "gpt-5.6-terra", responseId: "resp-search-2",
      event: { type: "response.output_item.done", item: { id: "fc-item-2", type: "function_call", name: "search", call_id: "call-search-2", arguments: JSON.stringify({ workshopId: state.id, query: "defend every claim" }) } },
    }, root);
    expect(handled.handled).toBe(true);
    expect(handled.execution?.result.isError).toBe(false);
    expect(handled.providerOutput).toMatchObject({ type: "function_call_output", call_id: "call-search-2" });
    expect(JSON.parse(String(handled.providerOutput?.output))).toMatchObject({ isError: false, data: { results: expect.any(Array) } });
    expect(handled.state.conversationContinuation).toMatchObject({ responseId: "resp-search-2" });
    expect(handled.state.toolCalls[0]).toMatchObject({ provider: { model: "gpt-5.6-terra", responseId: "resp-search-2", callId: "call-search-2", eventId: "fc-item-2" } });
  });

  it("executes a completed Realtime function event and returns a conversation item", async () => {
    const root = await groundedRoot(); const state = readWorkshopState(root);
    const handled = await handleWorkshopProviderToolEvent({
      channel: "realtime", model: "gpt-realtime-2.1",
      event: { type: "response.function_call_arguments.done", event_id: "event-3", response_id: "resp-3", item_id: "fc-3", call_id: "call-3", name: "search", arguments: JSON.stringify({ workshopId: state.id, query: "professional presentation" }) },
    }, root);
    expect(handled.execution?.result.isError).toBe(false);
    expect(handled.providerOutput).toMatchObject({ type: "conversation.item.create", item: { type: "function_call_output", call_id: "call-3" } });
    expect(handled.state.toolCalls[0]).toMatchObject({ channel: "realtime", provider: { model: "gpt-realtime-2.1", responseId: "resp-3", callId: "call-3", eventId: "event-3" } });
  });

  it("persists invalid provider arguments as a visible failed tool result", async () => {
    const root = await groundedRoot();
    const handled = await handleWorkshopProviderToolEvent({ channel: "responses", responseId: "resp-bad", event: { type: "response.output_item.done", item: { type: "function_call", name: "search", call_id: "call-bad", arguments: "not-json" } } }, root);
    expect(handled.execution?.result).toMatchObject({ isError: true, summary: expect.stringMatching(/Expected object, received string/) });
    expect(readWorkshopState(root).toolCalls).toHaveLength(1);
  });
});
