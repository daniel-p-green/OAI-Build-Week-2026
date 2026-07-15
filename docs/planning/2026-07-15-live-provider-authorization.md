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

## Partial-run recovery

The live operator persists every successful image and narration clip before reporting a partial result. Inspect the exact failed panel IDs without making a provider call:

```bash
pnpm demo:live -- --retry-failed
```

The retry preflight reports only missing image and narration panels and prints the exact minimum request ceiling. Run that printed command after authorization. For example, one failed image after narration completed requires one request, not twelve:

```bash
WORKSHOPLM_LIVE_OPENAI=1 \
WORKSHOPLM_MAX_PAID_REQUESTS=1 \
OPENAI_API_KEY=... \
pnpm demo:live -- --execute --retry-failed
```

`--retry-failed` never recreates the Workshop, re-ingests sources, reruns a successful GPT-5.6 Map, or regenerates successful media. The retired `--keep` flag fails closed because its former behavior could duplicate setup and paid work. If the initial GPT-5.6 Map request itself fails, no downstream provider artifact exists yet; rerun the normal live command from a clean operator state after recording that failed request.
