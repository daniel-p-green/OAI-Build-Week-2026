"use client";

import { Button, Card } from "@workshoplm/ui";
import { useEffect, useMemo, useRef, useState } from "react";
import { emptyRealtimeTranscript, realtimeTranscriptEvidence, realtimeTranscriptText, reduceRealtimeTranscript, type RealtimeTranscriptState } from "./realtime-transcript";

type CapturePhase = "idle" | "connecting" | "recording" | "review" | "saving" | "error";
type TokenResponse = { value?: string; expiresAt?: number; model?: "gpt-realtime-2.1"; transcriptionModel?: "gpt-realtime-whisper"; error?: string };

export function RealtimeCapture({ disabled = false, onSave, onProviderToolEvent }: { disabled?: boolean; onSave: (text: string, evidence: { transport: "webrtc"; model: "gpt-realtime-2.1"; transcriptionModel: "gpt-realtime-whisper"; itemIds: string[]; eventIds: string[] }) => Promise<boolean>; onProviderToolEvent?: (event: unknown) => Promise<Record<string, unknown> | undefined> }) {
  const [phase, setPhase] = useState<CapturePhase>("idle");
  const [transcript, setTranscript] = useState<RealtimeTranscriptState>(() => emptyRealtimeTranscript());
  const [error, setError] = useState("");
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const channelRef = useRef<RTCDataChannel | null>(null);
  const modelRef = useRef<{ model: "gpt-realtime-2.1"; transcriptionModel: "gpt-realtime-whisper" } | null>(null);
  const text = useMemo(() => realtimeTranscriptText(transcript), [transcript]);
  const providerEvents = useMemo(() => realtimeTranscriptEvidence(transcript), [transcript]);

  function release() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    channelRef.current?.close();
    peerRef.current?.close();
    streamRef.current = null;
    channelRef.current = null;
    peerRef.current = null;
    modelRef.current = null;
  }

  useEffect(() => () => release(), []);

  async function start() {
    setPhase("connecting");
    setError("");
    setTranscript(emptyRealtimeTranscript());
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone capture is not available in this browser.");
      const tokenResponse = await fetch("/api/realtime/token", { method: "POST" });
      const token = await tokenResponse.json() as TokenResponse;
      if (!tokenResponse.ok || !token.value || token.model !== "gpt-realtime-2.1" || token.transcriptionModel !== "gpt-realtime-whisper") throw new Error(token.error ?? "Voice capture could not start.");
      modelRef.current = { model: token.model, transcriptionModel: token.transcriptionModel };
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const peer = new RTCPeerConnection();
      peerRef.current = peer;
      for (const track of stream.getAudioTracks()) peer.addTrack(track, stream);
      const channel = peer.createDataChannel("oai-events");
      channelRef.current = channel;
      channel.addEventListener("message", (message) => {
        try {
          const event = JSON.parse(String(message.data)) as { type?: string };
          setTranscript((current) => reduceRealtimeTranscript(current, event));
          if (event.type === "response.function_call_arguments.done" && onProviderToolEvent) {
            void onProviderToolEvent(event).then((providerOutput) => {
              if (!providerOutput || channel.readyState !== "open") return;
              channel.send(JSON.stringify(providerOutput));
              channel.send(JSON.stringify({ type: "response.create" }));
            }).catch(() => setError("WorkshopLM could not complete that voice action."));
          }
        }
        catch { setError("WorkshopLM received an unreadable transcript event."); setPhase("error"); }
      });
      channel.addEventListener("open", () => setPhase("recording"));
      channel.addEventListener("error", () => { setError("The voice connection was interrupted."); setPhase("error"); });
      const offer = await peer.createOffer();
      await peer.setLocalDescription(offer);
      if (!offer.sdp) throw new Error("The browser could not create a voice connection.");
      const answerResponse = await fetch("https://api.openai.com/v1/realtime/calls", { method: "POST", body: offer.sdp, headers: { Authorization: `Bearer ${token.value}`, "Content-Type": "application/sdp" } });
      if (!answerResponse.ok) throw new Error(`Voice connection failed (${answerResponse.status}).`);
      await peer.setRemoteDescription({ type: "answer", sdp: await answerResponse.text() });
    } catch (caught) {
      release();
      setError(caught instanceof Error ? caught.message : "Voice capture could not start.");
      setPhase("error");
    }
  }

  function stop() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (channelRef.current?.readyState === "open") channelRef.current.send(JSON.stringify({ type: "input_audio_buffer.commit" }));
    setPhase("review");
  }

  function cancel() {
    release();
    setTranscript(emptyRealtimeTranscript());
    setError("");
    setPhase("idle");
  }

  async function save() {
    if (!text.trim()) return;
    setPhase("saving");
    const provider = modelRef.current;
    if (!provider || !providerEvents.itemIds.length || providerEvents.itemIds.length !== providerEvents.eventIds.length) { setError("Provider transcript evidence is incomplete. Record the thought again."); setPhase("review"); return; }
    const saved = await onSave(text.trim(), { transport: "webrtc", ...provider, ...providerEvents });
    if (saved) { release(); return; }
    setError("The transcript was captured but could not be added. Try again.");
    setPhase("review");
  }

  const transcriptError = transcript.error || error;
  return <Card className="realtime-capture" aria-label="Record voice">
    <div className="realtime-capture-copy"><h3>Record voice</h3><p>Your spoken thought becomes a private Source and stays in this Conversation.</p></div>
    <div className="realtime-capture-status" aria-live="polite">
      {phase === "connecting" && <p>Connecting to voice…</p>}
      {phase === "recording" && <p><span className="recording-dot" aria-hidden="true" /> Listening</p>}
      {phase === "review" && !text && <p>Finishing transcript…</p>}
      {text && <blockquote>{text}</blockquote>}
      {transcriptError && <p className="capture-error" role="alert">{transcriptError}</p>}
    </div>
    <div className="button-row">
      {(phase === "idle" || phase === "error") && <Button disabled={disabled} onClick={() => { void start(); }}>Record voice</Button>}
      {phase === "connecting" && <Button disabled>Connecting…</Button>}
      {phase === "recording" && <Button onClick={stop}>Stop</Button>}
      {phase === "review" && <Button disabled={!text.trim() || !providerEvents.itemIds.length} onClick={() => { void save(); }}>Add transcript</Button>}
      {phase === "saving" && <Button disabled>Adding…</Button>}
      {phase !== "idle" && phase !== "saving" && <Button variant="secondary" onClick={cancel}>Cancel</Button>}
    </div>
  </Card>;
}
