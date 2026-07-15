import { NextResponse } from "next/server";
import { createRealtimeClientSecret } from "../realtime-server";

export const runtime = "nodejs";

export async function POST() {
  try {
    return NextResponse.json(await createRealtimeClientSecret({ apiKey: process.env.OPENAI_API_KEY, liveEnabled: process.env.WORKSHOPLM_LIVE_OPENAI === "1", safetySeed: process.env.WORKSHOPLM_SAFETY_ID }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Voice capture could not start.";
    const status = message.includes("disabled") || message.includes("required") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
