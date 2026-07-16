import { NextResponse } from "next/server";
import { createRealtimeClientSecret, type RealtimeMode } from "../realtime-server";
import { readWorkshopState } from "../../../../../worker/src/workshop-service";
import { workshopToolContext } from "../../../../../worker/src/workshop-tools";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as { mode?: unknown };
    const mode: RealtimeMode = body.mode === "conversation" ? "conversation" : "capture";
    const context = mode === "conversation" ? workshopToolContext(readWorkshopState()) : undefined;
    return NextResponse.json(await createRealtimeClientSecret({ apiKey: process.env.OPENAI_API_KEY, liveEnabled: process.env.WORKSHOPLM_LIVE_OPENAI === "1", safetySeed: process.env.WORKSHOPLM_SAFETY_ID, mode, workshopContext: context }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Voice capture could not start.";
    const status = message.includes("disabled") || message.includes("required") ? 503 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
