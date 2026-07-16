export type RealtimeTranscriptState = { draftByItem: Record<string, string>; finalByItem: Record<string, string>; eventByItem: Record<string, string>; assistantDraftByResponse: Record<string, string>; assistantFinalByResponse: Record<string, string>; assistantEventByResponse: Record<string, string>; error?: string };
export const emptyRealtimeTranscript = (): RealtimeTranscriptState => ({ draftByItem: {}, finalByItem: {}, eventByItem: {}, assistantDraftByResponse: {}, assistantFinalByResponse: {}, assistantEventByResponse: {} });

function record(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : undefined;
}

export function reduceRealtimeTranscript(state: RealtimeTranscriptState, rawEvent: unknown): RealtimeTranscriptState {
  const event = record(rawEvent);
  if (!event || typeof event.type !== "string") return state;
  const itemId = typeof event.item_id === "string" ? event.item_id : "unknown";
  if (event.type === "conversation.item.input_audio_transcription.delta" && typeof event.delta === "string") {
    return { ...state, draftByItem: { ...state.draftByItem, [itemId]: `${state.draftByItem[itemId] ?? ""}${event.delta}` } };
  }
  if (event.type === "conversation.item.input_audio_transcription.completed") {
    const transcript = (typeof event.transcript === "string" ? event.transcript : state.draftByItem[itemId] ?? "").trim();
    if (!transcript) return state;
    const eventId = typeof event.event_id === "string" ? event.event_id : "";
    return { ...state, draftByItem: { ...state.draftByItem, [itemId]: transcript }, finalByItem: { ...state.finalByItem, [itemId]: transcript }, eventByItem: eventId ? { ...state.eventByItem, [itemId]: eventId } : state.eventByItem };
  }
  if (event.type === "conversation.item.input_audio_transcription.failed") {
    const message = record(event.error)?.message;
    return { ...state, error: typeof message === "string" ? message : "The voice transcript could not be completed." };
  }
  const responseId = typeof event.response_id === "string" ? event.response_id : "unknown";
  if (event.type === "response.output_audio_transcript.delta" && typeof event.delta === "string") {
    return { ...state, assistantDraftByResponse: { ...state.assistantDraftByResponse, [responseId]: `${state.assistantDraftByResponse[responseId] ?? ""}${event.delta}` } };
  }
  if (event.type === "response.output_audio_transcript.done") {
    const transcript = (typeof event.transcript === "string" ? event.transcript : state.assistantDraftByResponse[responseId] ?? "").trim();
    if (!transcript) return state;
    const eventId = typeof event.event_id === "string" ? event.event_id : "";
    return { ...state, assistantDraftByResponse: { ...state.assistantDraftByResponse, [responseId]: transcript }, assistantFinalByResponse: { ...state.assistantFinalByResponse, [responseId]: transcript }, assistantEventByResponse: eventId ? { ...state.assistantEventByResponse, [responseId]: eventId } : state.assistantEventByResponse };
  }
  if (event.type === "error") {
    const error = record(event.error);
    const code = error?.code;
    if (code === "input_audio_buffer_commit_empty") return state;
    return { ...state, error: typeof error?.message === "string" ? error.message : "The Realtime session reported an error." };
  }
  return state;
}

export function realtimeTranscriptEvidence(state: RealtimeTranscriptState): { itemIds: string[]; eventIds: string[] } {
  const itemIds = Object.keys(state.finalByItem).filter((itemId) => state.eventByItem[itemId]);
  return { itemIds, eventIds: itemIds.map((itemId) => state.eventByItem[itemId]!) };
}

export function realtimeTranscriptText(state: RealtimeTranscriptState): string {
  const final = Object.values(state.finalByItem).map((value) => value.trim()).filter(Boolean);
  if (final.length) return final.join("\n");
  return Object.values(state.draftByItem).map((value) => value.trim()).filter(Boolean).join("\n");
}

export function realtimeAssistantTranscript(state: RealtimeTranscriptState): { text: string; responseId?: string; eventIds: string[] } {
  const responseIds = Object.keys(state.assistantFinalByResponse);
  const text = responseIds.map((responseId) => state.assistantFinalByResponse[responseId]?.trim()).filter(Boolean).join("\n");
  const latest = responseIds.at(-1);
  return { text, responseId: latest, eventIds: responseIds.flatMap((responseId) => state.assistantEventByResponse[responseId] ? [state.assistantEventByResponse[responseId]!] : []) };
}

export function realtimeFunctionOutput(callId: string, result: unknown): Record<string, unknown> {
  if (!callId.trim()) throw new Error("Realtime call ID is required.");
  return { type: "conversation.item.create", item: { type: "function_call_output", call_id: callId, output: JSON.stringify(result) } };
}
