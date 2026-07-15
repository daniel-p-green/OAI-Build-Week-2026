import { describe, expect, it } from "vitest";
import { emptyRealtimeTranscript, realtimeTranscriptEvidence, realtimeTranscriptText, reduceRealtimeTranscript } from "./realtime-transcript";

describe("Realtime transcript events", () => {
  it("assembles deltas, replaces them with the final transcript, and keeps turn order", () => {
    let state = reduceRealtimeTranscript(emptyRealtimeTranscript(), { type: "conversation.item.input_audio_transcription.delta", item_id: "turn-1", delta: "Raw " });
    state = reduceRealtimeTranscript(state, { type: "conversation.item.input_audio_transcription.delta", item_id: "turn-1", delta: "thinking" });
    state = reduceRealtimeTranscript(state, { type: "conversation.item.input_audio_transcription.completed", item_id: "turn-1", event_id: "event-1", transcript: "Raw thinking." });
    state = reduceRealtimeTranscript(state, { type: "conversation.item.input_audio_transcription.completed", item_id: "turn-2", event_id: "event-2", transcript: "Make it visual." });
    expect(realtimeTranscriptText(state)).toBe("Raw thinking.\nMake it visual.");
    expect(realtimeTranscriptEvidence(state)).toEqual({ itemIds: ["turn-1", "turn-2"], eventIds: ["event-1", "event-2"] });
  });

  it("surfaces transcription errors but ignores an empty manual commit", () => {
    const emptyCommit = reduceRealtimeTranscript(emptyRealtimeTranscript(), { type: "error", error: { code: "input_audio_buffer_commit_empty", message: "empty" } });
    expect(emptyCommit.error).toBeUndefined();
    expect(reduceRealtimeTranscript(emptyCommit, { type: "conversation.item.input_audio_transcription.failed", error: { message: "No speech detected" } }).error).toBe("No speech detected");
  });
});
