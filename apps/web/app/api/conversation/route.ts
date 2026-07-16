import { NextRequest, NextResponse } from "next/server";
import { runResponsesConversation, type ResponsesConversationEvent } from "../../../../worker/src/responses-conversation";

export const runtime = "nodejs";

type ConversationRequest = { text?: string; messageId?: string };

function liveConfig() {
  return {
    apiKey: process.env.OPENAI_API_KEY,
    liveEnabled: process.env.WORKSHOPLM_LIVE_OPENAI === "1" && process.env.WORKSHOPLM_LIVE_CONVERSATION === "1",
    model: process.env.WORKSHOPLM_CONVERSATION_MODEL?.trim() || "gpt-5.6-terra",
    maxRequests: Number(process.env.WORKSHOPLM_MAX_CONVERSATION_REQUESTS ?? "3"),
    safetySeed: process.env.WORKSHOPLM_SAFETY_SEED,
  };
}

export async function POST(request: NextRequest) {
  let body: ConversationRequest;
  try { body = await request.json() as ConversationRequest; }
  catch { return NextResponse.json({ error: "A valid message is required." }, { status: 400 }); }
  if (!body.text?.trim() || !body.messageId?.trim()) return NextResponse.json({ error: "Message text and ID are required." }, { status: 400 });

  const config = liveConfig();
  if (!config.liveEnabled || !config.apiKey || !Number.isInteger(config.maxRequests) || config.maxRequests < 1 || config.maxRequests > 4) {
    return NextResponse.json({ error: "Live Conversation is not configured." }, { status: 503 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const emit = (event: ResponsesConversationEvent) => { controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`)); };
      void runResponsesConversation({ text: body.text!, messageId: body.messageId! }, config, emit)
        .catch((error) => emit({ type: "error", message: error instanceof Error ? error.message.slice(0, 600) : "Conversation failed." }))
        .finally(() => controller.close());
    },
  });
  return new Response(stream, { headers: { "content-type": "application/x-ndjson; charset=utf-8", "cache-control": "no-store" } });
}
