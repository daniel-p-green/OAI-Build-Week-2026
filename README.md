# WorkshopLM

> Turn raw thinking into finished work.

WorkshopLM is an OpenAI Build Week 2026 project for moving from captured source material through a grounded Map, approvals, production outputs, and a locally rendered video. The local app is intentionally split: ChatGPT/Codex owns the conversation, while the in-app browser owns the focused Map, Brief, Outputs, and Storyboard workspace. It does not add a second chat composer.

## Current, verified slice

The repository currently provides a local-first deterministic seam with:

- SQLite WAL state, hash-addressed local artifacts, and leased local jobs;
- normalized, locally searchable sanitized source fixtures and claim-level evidence in the recorded acceptance run;
- local ingestion for text, URLs, and PDFs, plus a capture-only Realtime fallback for voice;
- an editable, persisted Excalidraw Map with typed operations and versioned approvals;
- materialized `FRAME.md`, `DESIGN.md`, style-token, asset-plan, deck, infographic, and editable storyboard artifacts;
- independent brief and storyboard approval gates, stale propagation, retry, and queued-render cancellation;
- source-traceable deck and infographic HTML artifacts with claim locators;
- a local HyperFrames render worker for the approved sanitized storyboard fixture;
- a thin stdio MCP/plugin shell that reads the same local fixture state.

This is active Build Week work, not a claim that every locked capability is complete. Native ChatGPT durable voice synchronization, paid GPT-5.6 reasoning, live GPT Image rendering, and the final public demo remain unproven or in progress. The local app uses deterministic fallbacks where provider access has not been demonstrated. See [GOAL.md](GOAL.md) for the exact completion definition and [log.md](log.md) for dated evidence.

## Run the recorded fixture

Requirements: Node.js 22+ and pnpm 10+ (HyperFrames also needs its locally configured runtime).

```bash
pnpm install
pnpm demo:reset
pnpm demo:e2e
pnpm demo:render
pnpm demo:thumbnail
pnpm dev
```

`pnpm demo:e2e` is recorded-fixture mode: it does not require OpenAI credentials or paid model calls. `pnpm demo:render` runs the approved sanitized fixture through the local HyperFrames worker. `pnpm demo:thumbnail` derives a local PNG thumbnail and hash metadata from that rendered video. The app data is stored under `.workshoplm/`, which is reset by `demo:reset`.

The GPT-5.6 routing benchmark is deliberately spend-gated. Once a paid-call authorization exists, run `WORKSHOPLM_LIVE_OPENAI=1 OPENAI_API_KEY=… pnpm --filter @workshoplm/ai probe:gpt56`; it compares Sol, Terra, and Luna on compact grounded-graph, brief, and claim-triage cases, recording latency, reported token usage, and deterministic JSON/evidence checks. It does not invent dollar costs from token counts.

## Prepare the live demo run

`pnpm demo:live` builds a fresh, isolated operator Workshop under `.workshoplm/live-operator/`. It ingests sanitized sources, captures a transcript through the documented fallback, approves the Brief and Storyboard, locks the official demo style, and creates the traced deck, infographic, image plan, and storyboard. The default command is a no-spend preflight: it prints the exact provider request count and makes no OpenAI call.

After explicit spend authorization and the routing benchmark, the same command uses GPT-5.6 Sol to build a claim-validated grounded Map, generates six GPT Image 2 panels concurrently, generates one `gpt-4o-mini-tts` WAV per approved storyboard panel, and renders those clips through the local HyperFrames worker:

```bash
WORKSHOPLM_LIVE_OPENAI=1 OPENAI_API_KEY=… pnpm demo:live -- --execute
WORKSHOPLM_DATA_ROOT="$PWD/.workshoplm/live-operator" pnpm dev
```

The live command fails closed when either opt-in flag or credential is absent. The GPT-5.6 Map rejects any node that cites a claim outside the active source scope and records the model, request ID, input claim IDs, and output hash. Every image and narration clip is likewise stored locally with model, request, version, and SHA-256 provenance. A partial image batch retains completed panels and marks only failed panels for retry.

## Checks

```bash
pnpm check
pnpm demo:e2e
```

## Codex plugin install

The repository is also a public Codex marketplace. From a machine with the Codex CLI:

```bash
codex plugin marketplace add daniel-p-green/OAI-Build-Week-2026
codex plugin add workshoplm@workshoplm-local
```

Set the local data root before opening the Codex task that will use WorkshopLM, then restart or open a fresh task so the plugin tools inherit it:

```bash
export WORKSHOPLM_DATA_ROOT="/absolute/path/to/OAI-Build-Week-2026/.workshoplm/live-operator"
```

The plugin forwards only that explicit local path to its stdio server. It does not upload the Workshop, scan arbitrary folders, or assume an installed cache shares the source checkout. Run the fixture or live-operator preflight before trying grounded `search` and `fetch`.

Verified installation surface: the Codex CLI marketplace flow on macOS. Codex can discover and call the bundled stdio tools; the installed version must be refreshed after a public plugin update before the latest data-root forwarding change is present.

## Architecture

```text
Capture sources → normalized evidence → grounded Map → approved brief
      → traceable outputs → approved storyboard → local HyperFrames video
```

- `apps/web` — focused Map, Brief, Outputs, Storyboard, and source-evidence workspace.
- `apps/worker` — SQLite state, queue, artifact store, and render executor.
- `packages/domain` — schemas, approvals, dependencies, graph operations, and provenance contracts.
- `packages/plugin-mcp` — compact stdio MCP/plugin entry point.
- `packages/production` — traceable production artifacts.
- `spikes/` — deterministic evidence for host sync, grounding, image manifests, and HyperFrames.
- `.agents/plugins/marketplace.json` — public Codex marketplace descriptor for the unified plugin.

## Privacy and judging

The default fixture is sanitized and local. No account system, hosted storage, or connected third-party source is required to understand the recorded path. The eventual public demo video is the primary judge experience; the fixture makes that demo repeatable without requiring judges to spend API credits.

## Build evidence

The project is built in dated commits during Build Week. Product decisions and verification results are recorded append-only in [log.md](log.md). The implementation plan is [PLAN-2026-07-13.md](PLAN-2026-07-13.md), and the UI contract is [DESIGN.md](DESIGN.md).

## How we built it

Codex accelerated the implementation and verification of the monorepo, local SQLite state, MCP doorway, typed Map operations, browser workspace, deterministic fixture, and HyperFrames render path. The dated commits and `log.md` record that work and its command-level evidence.

Human decisions locked the product boundary: professional work rather than education, one ChatGPT/Codex conversation surface plus one visual browser workspace, exactly two approval gates, local-first judging, privacy-safe sample data, and proportional public claims.

GPT-5.6 contributes through Codex during implementation and is also represented in WorkshopLM's operation-level runtime routing policy: Sol for quality-critical graph work, Terra for structured synthesis, and Luna for repeatable triage. The live API benchmark remains spend-gated; this repository does not claim that its recorded fixture used paid GPT-5.6 runtime calls.
