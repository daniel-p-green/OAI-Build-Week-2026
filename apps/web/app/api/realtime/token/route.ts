import { NextResponse } from "next/server";
import { createRealtimeClientSecret, type RealtimeMode } from "../realtime-server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as { mode?: unknown };
    const mode: RealtimeMode = body.mode === "conversation" ? "conversation" : "capture";
    return NextResponse.json(await createRealtimeClientSecret({ apiKey: process.env.OPENAI_API_KEY, liveEnabled: process.env.WORKSHOPLM_LIVE_OPENAI === "1", safetySeed: process.env.WORKSHOPLM_SAFETY_ID, mode }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Voice capture could not start.";
    const status = message.includes("disabled") || message.includes("required") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
