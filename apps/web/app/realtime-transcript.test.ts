import { describe, expect, it } from "vitest";
import { emptyRealtimeTranscript, realtimeAssistantTranscript, realtimeFunctionOutput, realtimeInterruptionEvidence, realtimeTranscriptEvidence, realtimeTranscriptText, reduceRealtimeTranscript } from "./realtime-transcript";

describe("Realtime transcript events", () => {
  it("assembles deltas, replaces them with the final transcript, and keeps turn order", () => {
    let state = reduceRealtimeTranscript(emptyRealtimeTranscript(), { type: "conversation.item.input_audio_transcription.delta", item_id: "turn-1", delta: "Raw " });
    state = reduceRealtimeTranscript(state, { type: "conversation.item.input_audio_transcription.delta", item_id: "turn-1", delta: "thinking" });
    state = reduceRealtimeTranscript(state, { type: "conversation.item.input_audio_transcription.completed", item_id: "turn-1", event_id: "event-1", transcript: "Raw thinking." });
    state = reduceRealtimeTranscript(state, { type: "conversation.item.input_audio_transcription.completed", item_id: "turn-2", event_id: "event-2", transcript: "Make it visual." });
    expect(realtimeTranscriptText(state)).toBe("Raw thinking.\nMake it visual.");
    expect(realtimeTranscriptEvidence(state)).toEqual({ itemIds: ["turn-1", "turn-2"], eventIds: ["event-1", "event-2"] });
  });

  it("collapses a shorter overlapping recognition without discarding provider evidence", () => {
    let state = reduceRealtimeTranscript(emptyRealtimeTranscript(), { type: "conversation.item.input_audio_transcription.completed", item_id: "turn-short", event_id: "event-short", transcript: "Sources What should the final WorkshopLM demo prove?" });
    state = reduceRealtimeTranscript(state, { type: "conversation.item.input_audio_transcription.completed", item_id: "turn-full", event_id: "event-full", transcript: "Using the selected sources, what should the final WorkshopLM demo prove?" });
    expect(realtimeTranscriptText(state)).toBe("Using the selected sources, what should the final WorkshopLM demo prove?");
    expect(realtimeTranscriptEvidence(state)).toEqual({ itemIds: ["turn-short", "turn-full"], eventIds: ["event-short", "event-full"] });
  });

  it("surfaces transcription errors but ignores an empty manual commit", () => {
    const emptyCommit = reduceRealtimeTranscript(emptyRealtimeTranscript(), { type: "error", error: { code: "input_audio_buffer_commit_empty", message: "empty" } });
    expect(emptyCommit.error).toBeUndefined();
    expect(reduceRealtimeTranscript(emptyCommit, { type: "conversation.item.input_audio_transcription.failed", error: { message: "No speech detected" } }).error).toBe("No speech detected");
  });

  it("assembles the spoken assistant transcript with provider evidence", () => {
    let state = reduceRealtimeTranscript(emptyRealtimeTranscript(), { type: "response.output_audio_transcript.delta", response_id: "response-1", delta: "Grounded " });
    state = reduceRealtimeTranscript(state, { type: "response.output_audio_transcript.done", response_id: "response-1", event_id: "assistant-event-1", transcript: "Grounded answer." });
    expect(realtimeAssistantTranscript(state)).toEqual({ text: "Grounded answer.", responseId: "response-1", eventIds: ["assistant-event-1"] });
  });

  it("retains provider proof when WebRTC automatically interrupts a response", () => {
    let state = reduceRealtimeTranscript(emptyRealtimeTranscript(), { type: "response.cancelled", event_id: "event-cancelled", response: { id: "response-interrupted" } });
    state = reduceRealtimeTranscript(state, { type: "response.done", event_id: "event-done-cancelled", response: { id: "response-interrupted-current", status: "cancelled" } });
    expect(realtimeInterruptionEvidence(state)).toEqual({ responseIds: ["response-interrupted", "response-interrupted-current"], eventIds: ["event-cancelled", "event-done-cancelled"] });
  });

  it("builds the confirmed function result envelope for the open voice session", () => {
    expect(realtimeFunctionOutput("call-confirmed", { summary: "Brief approved", isError: false })).toEqual({ type: "conversation.item.create", item: { type: "function_call_output", call_id: "call-confirmed", output: JSON.stringify({ summary: "Brief approved", isError: false }) } });
    expect(() => realtimeFunctionOutput("", {})).toThrow(/call ID/);
  });
});
