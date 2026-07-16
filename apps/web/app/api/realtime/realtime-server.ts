import { createHash } from "node:crypto";
import { openAiWorkshopTools } from "@workshoplm/domain";

export const REALTIME_MODEL = "gpt-realtime-2.1";
export const TRANSCRIPTION_MODEL = "gpt-realtime-whisper";
export const REALTIME_CLIENT_SECRET_URL = "https://api.openai.com/v1/realtime/client_secrets";

export type RealtimeClientSecret = { value: string; expiresAt: number; model: typeof REALTIME_MODEL; transcriptionModel: typeof TRANSCRIPTION_MODEL };
export type RealtimeServerConfig = { apiKey?: string; liveEnabled: boolean; safetySeed?: string };

export function realtimeSessionConfig() {
  return {
    session: {
      type: "realtime",
      model: REALTIME_MODEL,
      output_modalities: ["text"],
      instructions: "Capture the user's spoken brainstorm accurately. Do not respond. The transcript will become a private Workshop source.",
      tools: openAiWorkshopTools("realtime"),
      tool_choice: "none",
      audio: {
        input: {
          noise_reduction: { type: "far_field" },
          transcription: { model: TRANSCRIPTION_MODEL, language: "en", prompt: "A professional product brainstorm for WorkshopLM." },
          turn_detection: { type: "server_vad", create_response: false, interrupt_response: false, prefix_padding_ms: 300, silence_duration_ms: 700 },
        },
      },
    },
  } as const;
}

export async function createRealtimeClientSecret(config: RealtimeServerConfig, fetchImpl: typeof fetch = fetch): Promise<RealtimeClientSecret> {
  if (!config.liveEnabled) throw new Error("Live OpenAI capture is disabled. Set WORKSHOPLM_LIVE_OPENAI=1 to enable it.");
  if (!config.apiKey) throw new Error("OPENAI_API_KEY is required for live voice capture.");
  const safetyIdentifier = createHash("sha256").update(config.safetySeed ?? "workshoplm-local-demo").digest("hex");
  const response = await fetchImpl(REALTIME_CLIENT_SECRET_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json", "OpenAI-Safety-Identifier": safetyIdentifier },
    body: JSON.stringify(realtimeSessionConfig()),
  });
  if (!response.ok) throw new Error(`Realtime client secret request failed (${response.status}).`);
  const raw = await response.json() as { value?: unknown; expires_at?: unknown };
  if (typeof raw.value !== "string" || !raw.value || typeof raw.expires_at !== "number") throw new Error("Realtime client secret response was incomplete.");
  return { value: raw.value, expiresAt: raw.expires_at, model: REALTIME_MODEL, transcriptionModel: TRANSCRIPTION_MODEL };
}
