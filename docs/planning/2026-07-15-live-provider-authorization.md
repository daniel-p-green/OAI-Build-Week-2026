# Live provider authorization runbook

Status: current founder-run procedure, updated 2026-07-16. The authorized sample provider run has completed; the founder-derived run remains pending.

WorkshopLM has two separate spend-gated runs. Request ceilings are enforced in code, but they are not dollar estimates. The dated [provider cost envelope](./2026-07-15-provider-cost-envelope.md) converts the current fixed fixture into a reviewable estimate and records the remaining TTS pricing uncertainty.

Current boundary: Daniel has authorized up to **$50 of OpenAI API spend** for WorkshopLM. The executable still fails closed unless the founder run supplies an explicit ceiling of exactly thirteen planned requests: one grounded Map, six images, five Storyboard narration clips, and one Audio Overview. Treat the project setting as an operating envelope, not as proof of a hard per-command cutoff. Retries require a new explicit ceiling after the zero-spend retry preflight.

Suggested authorization statement:

> Run the reviewed founder Workshop with an explicit thirteen-request ceiling under the already authorized $50 project envelope. Do not run retries until the zero-spend retry preflight reports the exact missing requests.

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

This run makes exactly thirteen planned OpenAI requests:

- one GPT-5.6 grounded Map request;
- six GPT Image 2 requests;
- five `gpt-4o-mini-tts` Storyboard narration requests; and
- one `gpt-4o-mini-tts` Audio Overview request.

```bash
WORKSHOPLM_LIVE_OPENAI=1 \
WORKSHOPLM_MAX_PAID_REQUESTS=13 \
OPENAI_API_KEY=... \
pnpm demo:live -- --execute
```

The command refuses to start when the ceiling is missing or below thirteen. One shared counter reserves requests before dispatch, including concurrent image requests, and counts failed provider attempts. It cannot silently exceed the supplied ceiling.

Every authorized attempt writes a terminal record to `.workshoplm/live-operator-run.json`. A passed record includes request usage and provider evidence. A partial or failed record includes the failed stage, sanitized error, completed panel hashes and request IDs, recorded panel failures, and the exact recovery command. The record lives outside the operator root. If it proves reusable paid results, both normal preflight and normal execution refuse to reset the corresponding local state.

For the authentic founder run, keep the recording and transcript outside `.workshoplm/`, then run the private zero-spend preflight:

```bash
pnpm demo:founder -- --founder-recording /absolute/path/founder.mov --founder-transcript /absolute/path/founder.txt
```

The first preflight imports the recording transcript as a private Source, prints `viewCommand`, withholds paid execution, and does not stage founder evidence into the public film-input directory. Review that Workshop locally. If and only if those exact files are intended for the public meta-demo, run the printed `shareablePreflightCommand`. That second zero-spend preflight marks the founder Source shareable, stages hash-bound film inputs, and prints the exact thirteen-request `nextCommand`. A founder recording and transcript satisfy the capture-evidence gate without pretending the import was a provider Realtime turn.

The alternative Realtime capture path remains available for non-founder operation: run `pnpm demo:live`, open its `viewCommand`, use **Record voice**, choose **Add transcript**, and rerun the preflight. The operator preserves the verified WebRTC transcript and provider IDs. Do not combine that optional path with claims about the founder recording unless both evidence sources actually exist.

Preflight also validates the complete media contract before the first paid request: six unique current image panels with exact active-source edges and an untampered shared reference, every Storyboard narration's title, text, positive duration, active claim/source/chunk/locator edge, and 4,096-character Speech API limit, plus the grounded Audio Overview plan. The report prints panel and character counts. A defect blocks execution before GPT-5.6 or media spend.

Live execution refuses before any paid GPT-5.6, Image, or Speech request when neither verified Realtime voice evidence nor a validated founder recording/transcript exists. This prevents a successful media run from remaining permanently `partial` at submission packaging time.

## 3. Promote the reviewed Workshop into the final film

After the paid command passes and `.workshoplm/final-operator/generated/submission-output-set-v1/manifest.json` is `ready` without limitations, record the authentic product surface and build the final candidate:

```bash
pnpm demo:capture-final
pnpm demo:film:final
pnpm demo:film:verify-final
```

The capture command copies the founder Workshop into a disposable local root before interacting with the UI, so its editable-Map demonstration cannot stale or mutate the paid source of truth. It fails unless the founder Source is explicitly shareable, the Brief and Storyboard remain approved and current, the Video is rendered, and the submission package is ready. Final HyperFrames assembly uses this founder-derived browser capture; `demo:film:sample` remains bound to the sanitized fixture.

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
