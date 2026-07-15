# Live provider authorization runbook

Status: ready, not authorized, zero provider generation calls made.

WorkshopLM has two separate spend-gated runs. Request ceilings are enforced in code, but they are not dollar estimates. Before either run, set the desired dollar limit in the OpenAI project and confirm the current official pricing separately.

## 1. GPT-5.6 routing benchmark

This run makes exactly nine Responses API requests: three compact cases across Sol, Terra, and Luna. It records latency, reported usage, parseability, evidence-term coverage, and the provider response model.

```bash
WORKSHOPLM_LIVE_OPENAI=1 \
WORKSHOPLM_MAX_PAID_REQUESTS=9 \
OPENAI_API_KEY=... \
pnpm --filter @workshoplm/ai probe:gpt56
```

The command refuses to start when the ceiling is missing or below nine. Inspect the resulting `artifacts/spikes/gpt56-routing-*.json` before changing any operation default.

## 2. Live thought-to-delivery run

This run makes exactly twelve planned OpenAI requests:

- one GPT-5.6 grounded Map request;
- six GPT Image 2 requests;
- five `gpt-4o-mini-tts` narration requests.

```bash
WORKSHOPLM_LIVE_OPENAI=1 \
WORKSHOPLM_MAX_PAID_REQUESTS=12 \
OPENAI_API_KEY=... \
pnpm demo:live -- --execute
```

The command refuses to start when the ceiling is missing or below twelve. One shared counter reserves requests before dispatch, including concurrent image requests, and counts failed provider attempts. It cannot silently exceed the supplied ceiling.

Before authorization, run the zero-spend plan:

```bash
pnpm demo:live
```

## Inspection gate

Do not upgrade any public claim until a person inspects:

- the benchmark artifact and routing decision;
- the GPT-5.6 Map proposal and its claim edges;
- all six image files, hashes, request IDs, and coherence as one set;
- all five narration clips, hashes, request IDs, and AI-voice disclosure;
- the final narrated MP4 and its approved Storyboard version;
- the rebuilt submission manifest and its remaining limitations.

If either run is partial, preserve successful artifacts, record the exact failed request, and use selective retry rather than rerunning the complete batch.
