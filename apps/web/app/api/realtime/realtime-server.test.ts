import { describe, expect, it, vi } from "vitest";
import { openAiWorkshopTools } from "@workshoplm/domain";
import { REALTIME_CLIENT_SECRET_URL, createRealtimeClientSecret, realtimeSessionConfig } from "./realtime-server";

describe("Realtime client-secret boundary", () => {
  it("fails closed before a provider request unless live capture is enabled", async () => {
    const fetchImpl = vi.fn<typeof fetch>();
    await expect(createRealtimeClientSecret({ apiKey: "server-secret", liveEnabled: false }, fetchImpl)).rejects.toThrow(/disabled/);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("mints a transcription-only ephemeral session without returning the standard API key", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ value: "ek_test", expires_at: 1_800_000_000 }), { status: 200, headers: { "content-type": "application/json" } }));
    const secret = await createRealtimeClientSecret({ apiKey: "server-secret", liveEnabled: true, safetySeed: "local-user" }, fetchImpl);
    expect(secret).toEqual({ value: "ek_test", expiresAt: 1_800_000_000, model: "gpt-realtime-2.1", transcriptionModel: "gpt-realtime-whisper" });
    const [url, init] = fetchImpl.mock.calls[0]!;
    expect(url).toBe(REALTIME_CLIENT_SECRET_URL);
    expect(init?.headers).toMatchObject({ Authorization: "Bearer server-secret", "OpenAI-Safety-Identifier": expect.stringMatching(/^[a-f0-9]{64}$/) });
    expect(JSON.parse(String(init?.body))).toEqual(realtimeSessionConfig());
    expect(JSON.stringify(secret)).not.toContain("server-secret");
    expect(realtimeSessionConfig().session.audio.input.turn_detection).toMatchObject({ create_response: false, interrupt_response: false });
    expect(realtimeSessionConfig().session.tools).toEqual(openAiWorkshopTools("realtime"));
    expect(realtimeSessionConfig().session.tool_choice).toBe("none");
  });

  it("rejects incomplete provider responses", async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ expires_at: 1_800_000_000 }), { status: 200 }));
    await expect(createRealtimeClientSecret({ apiKey: "server-secret", liveEnabled: true }, fetchImpl)).rejects.toThrow(/incomplete/);
  });
});
