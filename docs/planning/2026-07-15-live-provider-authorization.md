# Live provider authorization runbook

Status: ready, not authorized, zero provider generation calls made.

WorkshopLM has two separate spend-gated runs. Request ceilings are enforced in code, but they are not dollar estimates. The dated [provider cost envelope](./2026-07-15-provider-cost-envelope.md) converts the current fixed fixture into a reviewable estimate and records the remaining TTS pricing uncertainty.

Recommended boundary: set a **$5 OpenAI project budget or alert**, authorize exactly nine benchmark requests plus exactly twelve initial live-operator requests, and authorize at most one 60-second capture-only Realtime turn. Treat the project setting as an operating envelope, not as proof of a hard per-command cutoff. Retries require a new explicit ceiling after the zero-spend retry preflight.

Suggested authorization statement:

> Authorize the nine-request GPT-5.6 benchmark, the twelve-request WorkshopLM live operator, and one capture-only Realtime turn up to 60 seconds, under a $5 OpenAI project budget or alert. Do not run retries without a new explicit request ceiling.

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

Every authorized attempt writes a terminal record to `.workshoplm/live-operator-run.json`. A passed record includes request usage and provider evidence. A partial or failed record includes the failed stage, sanitized error, completed panel hashes and request IDs, recorded panel failures, and the exact recovery command. The record lives outside the operator root. If it proves reusable paid results, both normal preflight and normal execution refuse to reset the corresponding local state.

Before authorization, run the zero-spend plan:

```bash
pnpm demo:live
```

The first preflight intentionally reports `providerVoiceReady: false` and no executable `nextCommand`. Start the printed `viewCommand`, open **Add source**, use **Record voice**, and choose **Add transcript** after the provider transcript appears. Then rerun `pnpm demo:live`. The operator preserves that exact verified WebRTC transcript and provider item/event IDs while rebuilding the clean Workshop. Only then does preflight report `providerVoiceReady: true` and print the twelve-request command.

Live execution refuses before any paid GPT-5.6, Image, or Speech request when verified voice evidence is absent. This prevents a successful media run from remaining permanently `partial` at submission packaging time.

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

`--retry-failed` is evidence-bound: it runs only when the durable record proves a paid `partial` or post-Map `failed` attempt and its SHA-256 state fingerprint matches the current persisted reasoning, image, narration, Storyboard, and Video evidence. It refuses ordinary preflight state, a stale or fabricated record, a passed run, a no-call failure, and an initial GPT-5.6 Map failure. It never recreates the Workshop, re-ingests sources, reruns a successful GPT-5.6 Map, or regenerates successful media.

The retired `--keep` flag fails closed because its former behavior could duplicate setup and paid work. If the initial GPT-5.6 Map request itself fails, no downstream provider artifact exists yet; rerun the normal live command from a clean operator state after recording that failed request. After a passed or reusable partial run, intentionally discarding its local artifacts requires the explicit `--reset-paid-state` flag:

```bash
pnpm demo:live -- --reset-paid-state
```

That reset is destructive to the recoverable local operator state; do not use it as part of routine preflight or retry.
