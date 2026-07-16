import { executeWorkshopTool, type ExecuteWorkshopToolResult } from "./workshop-tools.js";
import { readWorkshopState, recordConversationContinuation, type WorkshopState } from "./workshop-service.js";

type ProviderEventChannel = "responses" | "realtime";
export type WorkshopProviderToolEvent = {
  channel: ProviderEventChannel;
  event: unknown;
  model?: string;
  responseId?: string;
  explicitUserIntent?: boolean;
};
export type WorkshopProviderToolEventResult = {
  handled: boolean;
  execution?: ExecuteWorkshopToolResult;
  providerOutput?: Record<string, unknown>;
  state: WorkshopState;
};

function object(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}
function decodedArguments(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); }
  catch { return value; }
}
function resultOutput(execution: ExecuteWorkshopToolResult): string {
  return JSON.stringify(execution.result);
}

export async function handleWorkshopProviderToolEvent(request: WorkshopProviderToolEvent, root?: string): Promise<WorkshopProviderToolEventResult> {
  const event = object(request.event);
  if (!event) throw new Error("Provider event must be an object.");
  const recordedAt = new Date().toISOString();

  if (request.channel === "realtime" && event.type === "response.function_call_arguments.done") {
    if (typeof event.name !== "string" || typeof event.call_id !== "string") throw new Error("Realtime function event is missing its name or call ID.");
    const responseId = typeof event.response_id === "string" ? event.response_id : request.responseId;
    const execution = await executeWorkshopTool({
      name: event.name,
      arguments: decodedArguments(event.arguments),
      channel: "realtime",
      explicitUserIntent: request.explicitUserIntent,
      provider: { model: request.model, responseId, callId: event.call_id, eventId: typeof event.event_id === "string" ? event.event_id : undefined },
    }, root);
    return {
      handled: true,
      execution,
      providerOutput: { type: "conversation.item.create", item: { type: "function_call_output", call_id: event.call_id, output: resultOutput(execution) } },
      state: execution.state,
    };
  }

  if (request.channel === "responses" && event.type === "response.output_item.done") {
    const item = object(event.item);
    if (item?.type !== "function_call") return { handled: false, state: recordContinuationIfPresent(request, event, root, recordedAt) };
    if (typeof item.name !== "string" || typeof item.call_id !== "string") throw new Error("Responses function item is missing its name or call ID.");
    const execution = await executeWorkshopTool({
      name: item.name,
      arguments: decodedArguments(item.arguments),
      channel: "responses",
      explicitUserIntent: request.explicitUserIntent,
      provider: { model: request.model, responseId: request.responseId, callId: item.call_id, eventId: typeof item.id === "string" ? item.id : undefined },
    }, root);
    const state = request.responseId ? recordConversationContinuation({ responseId: request.responseId, model: request.model, recordedAt: new Date().toISOString() }, root) : execution.state;
    return { handled: true, execution, providerOutput: { type: "function_call_output", call_id: item.call_id, output: resultOutput(execution) }, state };
  }

  return { handled: false, state: recordContinuationIfPresent(request, event, root, recordedAt) };
}

function recordContinuationIfPresent(request: WorkshopProviderToolEvent, event: Record<string, unknown>, root: string | undefined, recordedAt: string): WorkshopState {
  const response = object(event.response);
  const responseId = request.responseId ?? (typeof response?.id === "string" ? response.id : undefined);
  if (!responseId || request.channel !== "responses") {
    return readWorkshopState(root);
  }
  return recordConversationContinuation({ responseId, model: request.model, recordedAt }, root);
}
