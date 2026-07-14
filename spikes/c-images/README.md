# Spike C — GPT Image 2 coherent batch

This spike proves the narrow production contract behind Studio's six-image
contact sheet: one locked Visual DNA/reference fixture, six stable panel IDs,
and selective regeneration that changes only the chosen panel.

## Deterministic verification

```bash
pnpm --filter @workshoplm/spike-images test
pnpm --filter @workshoplm/spike-images run
```

The runner defaults to a non-spending skipped report. It validates the six-panel
manifest but never makes a provider request.

## Live verification

Live generation is deliberately opt-in because it incurs API cost:

```bash
WORKSHOPLM_LIVE_OPENAI=1 OPENAI_API_KEY=... pnpm --filter @workshoplm/spike-images run
```

The runner submits each prompt to the direct `gpt-image-2` Image API edit path
with the local, licensed reference fixture. It writes generated media and a
sanitized report under `artifacts/spikes/c-images/`; do not commit generated
media or reports containing provider details. A live pass generates six panels,
then regenerates `panel-4` only and records per-image latency.

`fixtures/reference.png` is a locally authored one-pixel fixture, documented in
[`fixtures/LICENSE.md`](fixtures/LICENSE.md). It tests reference attachment, not
visual quality. The Visual DNA fixture is the deterministic source of coherence
rules for this spike.
