# WorkshopLM

> Turn raw thinking into finished work.

WorkshopLM is an OpenAI Build Week 2026 project for moving from captured source material through a grounded Map, approvals, production outputs, and a locally rendered video. The local app is intentionally split: ChatGPT/Codex owns the conversation, while the in-app browser owns Sources, Map, and Studio. It does not add a second chat composer.

## Current, verified slice

The repository currently provides a local-first deterministic seam with:

- SQLite WAL state, hash-addressed local artifacts, and leased local jobs;
- normalized, locally searchable sanitized source fixtures and claim-level evidence in the recorded acceptance run;
- browser capture for text, URLs, and PDFs, plus a capture-only Realtime fallback for voice;
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
pnpm dev
```

`pnpm demo:e2e` is recorded-fixture mode: it does not require OpenAI credentials or paid model calls. `pnpm demo:render` runs the approved sanitized fixture through the local HyperFrames worker. The app data is stored under `.workshoplm/`, which is reset by `demo:reset`.

The GPT-5.6 routing benchmark is deliberately spend-gated. Once a paid-call authorization exists, run `WORKSHOPLM_LIVE_OPENAI=1 OPENAI_API_KEY=… pnpm --filter @workshoplm/ai probe:gpt56`; it compares Sol, Terra, and Luna on compact grounded-graph, brief, and claim-triage cases, recording latency, reported token usage, and deterministic JSON/evidence checks. It does not invent dollar costs from token counts.

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

Restart or open a fresh Codex task after installation so newly registered plugin tools are available. The plugin's stdio server reads the configured `WORKSHOPLM_DATA_ROOT`; in a source checkout that defaults to this repository's `.workshoplm/` directory. Run the fixture commands above before trying its grounded `search` and `fetch` tools.

Verified installation surface: the Codex CLI marketplace flow on macOS. Fresh-task tool invocation in the Codex desktop UI remains a separately recorded integration check.

## Architecture

```text
Capture sources → normalized evidence → grounded Map → approved brief
      → traceable outputs → approved storyboard → local HyperFrames video
```

- `apps/web` — Sources | Map | Studio local browser workspace.
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
