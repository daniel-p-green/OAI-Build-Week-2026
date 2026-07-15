# Live operator and provider media plan

Date: 2026-07-14
Owner: primary integrator
Status: provider-independent implementation complete; paid verification pending authorization

## Outcome

One isolated command prepares the sanitized WorkshopLM demo package without network spend. The same command, behind an explicit two-part opt-in, generates the real GPT Image 2 batch and approved-storyboard narration, then renders the narrated video locally through HyperFrames.

## Locked boundaries

- ChatGPT/Codex remains the conversation surface; this command does not add browser chat.
- `.workshoplm/live-operator/` is isolated from Daniel's working fixture and from the recorded acceptance fixture.
- The default command makes no paid provider request.
- Live execution requires both `WORKSHOPLM_LIVE_OPENAI=1` and `OPENAI_API_KEY`.
- Only an approved current storyboard can receive narration or enter the render queue.
- Generated files stay local and out of Git; state stores model, version, request ID when available, SHA-256, and relative artifact path.
- Failed image panels do not discard completed outputs or sibling panels.

## Implemented sequence

1. Reset or reuse the isolated operator root.
2. Capture the sanitized demo thesis and ingest two share-safe professional sources.
3. Extract grounded candidates and approve `FRAME.md`.
4. Lock the official demo Style and approve Visual DNA.
5. Generate the traced deck, infographic, image plan, asset plan, and editable storyboard.
6. Approve the storyboard.
7. In preflight mode, write and print the request plan without contacting OpenAI.
8. In live mode, use GPT-5.6 Sol to propose a structured Map from active claim IDs; reject out-of-scope citations and persist the assistant graph operations plus request/output provenance before Brief approval.
9. Generate six distinct GPT Image 2 panels concurrently from one locked Visual DNA block.
10. Generate one `gpt-4o-mini-tts` WAV per approved storyboard panel using `marin` and record the required AI-voice disclosure.
11. Copy current narration into the HyperFrames staging composition; use disclosed placeholder tones only when current provider narration is absent.
12. Render and store the final local MP4.
13. Launch the existing production UI against the isolated root with `WORKSHOPLM_DATA_ROOT="$PWD/.workshoplm/live-operator" pnpm dev` for inspection and recording.

## Verification

- `pnpm demo:live` must report `status: ready`, both approvals, two traced outputs, six planned image requests, five planned TTS requests, and `paidCallsMade: false`.
- `pnpm demo:live -- --execute` without the opt-in must fail before a provider call.
- Worker tests must prove six successful image artifacts, partial image retention, complete current-storyboard narration, and provider-narration rendering without FFmpeg tone generation.
- `pnpm check` and `pnpm demo:e2e` must remain green.
- Paid completion remains unproved until the live command records real provider request IDs/artifact hashes and the rendered MP4 is inspected.

## Next provider step

Run the separately spend-gated nine-request GPT-5.6 routing benchmark, select per-operation defaults from actual quality and latency evidence, then use the chosen grounded-graph/brief/storyboard routes in the live operator path. Do not claim provider-backed product use before those artifacts exist.
