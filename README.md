# WorkshopLM

> Turn raw thinking into finished work.

WorkshopLM is an OpenAI Build Week 2026 project for moving from captured source material through a grounded Map, approvals, production outputs, and a locally rendered video. The local app is intentionally split: ChatGPT/Codex owns the conversation, while the in-app browser owns Sources, Map, and Studio. It does not add a second chat composer.

## Current, verified slice

The repository currently provides a local-first deterministic seam with:

- SQLite WAL state, hash-addressed local artifacts, and leased local jobs;
- normalized, locally searchable sanitized source fixtures and claim-level evidence in the recorded acceptance run;
- a persistent browser shell for Sources, Map state, approvals, and video-job status;
- independent brief and storyboard approval gates;
- source-traceable deck and infographic HTML artifacts;
- a local HyperFrames render worker for the approved sanitized storyboard fixture;
- a thin stdio MCP/plugin shell that reads the same local fixture state.

This is active Build Week work, not a claim that every locked capability is complete. Native ChatGPT voice synchronization, GPT-5.6 graph extraction, live GPT Image generation, full source ingestion UI, Excalidraw editing, style capture, and the final public demo are still in progress. See [GOAL.md](GOAL.md) for the exact completion definition and [log.md](log.md) for dated evidence.

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

Restart or open a fresh Codex task after installation so newly registered plugin tools are available. The plugin's stdio server uses the local workspace state; run the fixture commands above before trying its grounded `search` and `fetch` tools.

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
