import { createHash } from "node:crypto";
import { openAiWorkshopTools } from "@workshoplm/domain";
import { handleWorkshopProviderToolEvent } from "./provider-tool-events.js";
import { beginProviderConversation, completeProviderConversation, readWorkshopState, type WorkshopState } from "./workshop-service.js";
import { workshopToolContext } from "./workshop-tools.js";

export const RESPONSES_CONVERSATION_URL = "https://api.openai.com/v1/responses";
export type ResponsesConversationConfig = { apiKey?: string; liveEnabled: boolean; model: string; maxRequests: number; safetySeed?: string };
export type ResponsesConversationEvent =
  | { type: "text_delta"; delta: string }
  | { type: "tool_result"; callId: string; isError: boolean; summary: string }
  | { type: "done"; state: WorkshopState; responseId: string }
  | { type: "error"; message: string };

function object(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}
function boundedProviderError(value: string): string {
  return value.replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]").slice(0, 600);
}
async function* sseEvents(body: ReadableStream<Uint8Array>): AsyncGenerator<Record<string, unknown>> {
  const reader = body.getReader(); const decoder = new TextDecoder(); let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });
    const blocks = buffer.split(/\r?\n\r?\n/); buffer = blocks.pop() ?? "";
    for (const block of blocks) {
      const data = block.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n");
      if (!data || data === "[DONE]") continue;
      const parsed = JSON.parse(data) as unknown; const event = object(parsed);
      if (event) yield event;
    }
    if (done) break;
  }
  const finalData = buffer.split(/\r?\n/).filter((line) => line.startsWith("data:")).map((line) => line.slice(5).trimStart()).join("\n");
  if (finalData && finalData !== "[DONE]") { const event = object(JSON.parse(finalData)); if (event) yield event; }
}

export async function runResponsesConversation(
  input: { text: string; messageId: string },
  config: ResponsesConversationConfig,
  emit: (event: ResponsesConversationEvent) => void | Promise<void>,
  root?: string,
  fetchImpl: typeof fetch = fetch,
): Promise<WorkshopState> {
  if (!config.liveEnabled) throw new Error("Live Conversation is disabled.");
  if (!config.apiKey) throw new Error("OPENAI_API_KEY is required for live Conversation.");
  if (!Number.isInteger(config.maxRequests) || config.maxRequests < 1 || config.maxRequests > 4) throw new Error("Live Conversation requires a request ceiling between 1 and 4.");
  beginProviderConversation(input.text, input.messageId, root);
  const initial = readWorkshopState(root); let previousResponseId = initial.conversationContinuation?.responseId;
  let nextInput: unknown = input.text.trim(); let finalText = ""; let finalResponseId = ""; const toolCallIds: string[] = [];
  const safetyIdentifier = createHash("sha256").update(config.safetySeed ?? "workshoplm-local-conversation").digest("hex");

  for (let requestNumber = 1; requestNumber <= config.maxRequests; requestNumber += 1) {
    const body: Record<string, unknown> = {
      model: config.model,
      input: nextInput,
      instructions: `You are WorkshopLM for professional work. Answer only from the selected Workshop Sources. Use search and fetch before factual claims and keep answers concise. When the user asks to change the Workshop, call the appropriate write tool exactly once with the current context; the local product will pause it for visible confirmation. Do not repeat the call while confirmation is pending, and never claim a write succeeded from a rejected tool result. Current exact tool context: ${JSON.stringify(workshopToolContext(readWorkshopState(root)))}. Use these IDs and versions verbatim for tool arguments; never invent or expose them to the user.`,
      tools: openAiWorkshopTools("responses"),
      tool_choice: requestNumber === 1 ? "required" : "auto",
      stream: true,
      store: true,
      safety_identifier: safetyIdentifier,
    };
    if (previousResponseId) body.previous_response_id = previousResponseId;
    const response = await fetchImpl(RESPONSES_CONVERSATION_URL, { method: "POST", headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json", Accept: "text/event-stream" }, body: JSON.stringify(body) });
    if (!response.ok || !response.body) throw new Error(`Responses Conversation failed (${response.status}): ${boundedProviderError(await response.text())}`);

    const functionOutputs: Record<string, unknown>[] = [];
    let responseId = "";
    for await (const event of sseEvents(response.body)) {
      if (event.type === "response.created") {
        const created = object(event.response); if (typeof created?.id === "string") responseId = created.id;
        await handleWorkshopProviderToolEvent({ channel: "responses", event, model: config.model, responseId: responseId || undefined }, root);
      }
      if (event.type === "response.output_text.delta" && typeof event.delta === "string") { finalText += event.delta; await emit({ type: "text_delta", delta: event.delta }); }
      if (event.type === "response.output_item.done") {
        const handled = await handleWorkshopProviderToolEvent({ channel: "responses", event, model: config.model, responseId: responseId || undefined, explicitUserIntent: false }, root);
        if (handled.handled && handled.execution && handled.providerOutput) {
          functionOutputs.push(handled.providerOutput); toolCallIds.push(handled.execution.call.id);
          await emit({ type: "tool_result", callId: handled.execution.call.id, isError: handled.execution.result.isError, summary: handled.execution.result.summary });
        }
      }
      if (event.type === "response.completed") {
        const completed = object(event.response); if (typeof completed?.id === "string") responseId = completed.id;
      }
      if (event.type === "error") throw new Error(typeof event.message === "string" ? boundedProviderError(event.message) : "The Responses stream reported an error.");
    }
    if (!responseId) throw new Error("Responses Conversation did not return a response ID.");
    finalResponseId = responseId; previousResponseId = responseId;
    if (!functionOutputs.length) {
      const state = completeProviderConversation({ text: finalText, responseId: finalResponseId, model: config.model, toolCallIds }, root);
      await emit({ type: "done", state, responseId: finalResponseId });
      return state;
    }
    nextInput = functionOutputs;
  }
  throw new Error(`Responses Conversation reached its ${config.maxRequests}-request ceiling before completing.`);
}
