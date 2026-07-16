import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { RESPONSES_CONVERSATION_URL, runResponsesConversation, type ResponsesConversationEvent } from "./responses-conversation.js";
import { ingestSource, readWorkshopState } from "./workshop-service.js";

const roots: string[] = [];
async function rootWithEvidence() { const root = await mkdtemp(join(tmpdir(), "responses-conversation-")); roots.push(root); await ingestSource({ title: "Strategy", origin: "Fixture", text: "The presentation must remain source-defensible and editable." }, root); return root; }
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });
function sse(events: unknown[]) { return new Response(events.map((event) => `data: ${JSON.stringify(event)}\n\n`).join(""), { status: 200, headers: { "content-type": "text/event-stream" } }); }
const config = { apiKey: "test-key", liveEnabled: true, model: "gpt-5.6-terra", maxRequests: 3 };

describe("Responses Conversation stream", () => {
  it("persists a streamed assistant turn and continuation without a tool call", async () => {
    const root = await rootWithEvidence(); const emitted: ResponsesConversationEvent[] = [];
    const fetchImpl = (async () => sse([
      { type: "response.created", response: { id: "resp-simple" } },
      { type: "response.output_text.delta", delta: "A concise " },
      { type: "response.output_text.delta", delta: "answer." },
      { type: "response.completed", response: { id: "resp-simple", status: "completed" } },
    ])) as typeof fetch;
    const state = await runResponsesConversation({ text: "Summarize this.", messageId: "message-simple" }, config, (event) => { emitted.push(event); }, root, fetchImpl);
    expect(state.conversationTurns.map((turn) => [turn.role, turn.text])).toEqual([["user", "Summarize this."], ["assistant", "A concise answer."]]);
    expect(state.conversationContinuation).toMatchObject({ responseId: "resp-simple", model: "gpt-5.6-terra" });
    expect(emitted.filter((event) => event.type === "text_delta")).toHaveLength(2);
  });

  it("feeds a grounded function output into a continuation and attaches exact evidence", async () => {
    const root = await rootWithEvidence(); const state = readWorkshopState(root); const requests: Array<Record<string, unknown>> = []; let call = 0;
    const fetchImpl = (async (url: string | URL | Request, init?: RequestInit) => {
      expect(String(url)).toBe(RESPONSES_CONVERSATION_URL); requests.push(JSON.parse(String(init?.body)) as Record<string, unknown>); call += 1;
      if (call === 1) return sse([
        { type: "response.created", response: { id: "resp-tool" } },
        { type: "response.output_item.done", item: { id: "fc-tool", type: "function_call", name: "search", call_id: "call-tool", arguments: JSON.stringify({ workshopId: state.id, query: "source defensible editable" }) } },
        { type: "response.completed", response: { id: "resp-tool", status: "completed" } },
      ]);
      return sse([
        { type: "response.created", response: { id: "resp-final" } },
        { type: "response.output_text.delta", delta: "The presentation remains source-defensible and editable." },
        { type: "response.completed", response: { id: "resp-final", status: "completed" } },
      ]);
    }) as typeof fetch;
    const final = await runResponsesConversation({ text: "What must the presentation preserve?", messageId: "message-tool" }, config, () => {}, root, fetchImpl);
    expect(requests).toHaveLength(2);
    expect(requests[0]).toMatchObject({ tool_choice: "required", safety_identifier: expect.stringMatching(/^[a-f0-9]{64}$/) });
    expect(requests[1]).toMatchObject({ tool_choice: "auto" });
    expect(requests[1]).toMatchObject({ previous_response_id: "resp-tool", input: [expect.objectContaining({ type: "function_call_output", call_id: "call-tool" })] });
    expect(final.conversationTurns.at(-1)).toMatchObject({ role: "assistant" });
    expect(final.conversationTurns.at(-1)?.evidence).toEqual(expect.arrayContaining([
      expect.objectContaining({ locator: "Fixture · chunk 01", snippet: "The presentation must remain source-defensible and editable." }),
    ]));
    expect(final.conversationContinuation?.responseId).toBe("resp-final");
  });

  it("fails closed before persistence when live access or its request ceiling is missing", async () => {
    const root = await rootWithEvidence(); const before = readWorkshopState(root).conversationTurns;
    await expect(runResponsesConversation({ text: "Hello", messageId: "disabled" }, { ...config, liveEnabled: false }, () => {}, root)).rejects.toThrow(/disabled/);
    await expect(runResponsesConversation({ text: "Hello", messageId: "ceiling" }, { ...config, maxRequests: 0 }, () => {}, root)).rejects.toThrow(/request ceiling/);
    expect(readWorkshopState(root).conversationTurns).toEqual(before);
  });
});
