export type RealtimeTranscriptState = { draftByItem: Record<string, string>; finalByItem: Record<string, string>; eventByItem: Record<string, string>; error?: string };
export const emptyRealtimeTranscript = (): RealtimeTranscriptState => ({ draftByItem: {}, finalByItem: {}, eventByItem: {} });

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
