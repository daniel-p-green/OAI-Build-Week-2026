# WorkshopLM

> Turn raw thinking into finished work.

WorkshopLM turns meetings, documents, and half-formed thinking into a branded deck a professional can defend, with every factual claim traced to its source. It is built for consultants, strategists, and enablement leads who produce client-facing or leadership-facing work every week.

Notebook-style tools help people understand source material. WorkshopLM is designed to help them ship from it: capture the conversation in ChatGPT/Codex, shape the evidence on an editable Map, approve the Brief, apply a reusable Style, and create a presentation that remains editable in PowerPoint. Infographic, Image set, Storyboard, and Video are supporting Outputs around that wedge.

The local product keeps one clear boundary: ChatGPT/Codex owns the conversation; the in-app browser owns the focused Map, Brief, Outputs, and Storyboard workspace. WorkshopLM does not add a second chat composer.

## The professional path

```text
Meeting or documents → grounded Map → approved Brief + reusable Style
  → editable, source-defensible Presentation → supporting Outputs → approved Storyboard → Video
```

Two approvals carry visible consequence: `Approve brief` freezes the production direction, and `Approve storyboard` authorizes Video. Source or Style changes preserve history while marking dependent work `Needs update`.

## Current, verified slice

The repository currently provides a local-first deterministic seam with:

- SQLite WAL state, hash-addressed local artifacts, and leased local jobs;
- normalized, locally searchable sanitized source fixtures and claim-level evidence in the recorded acceptance run;
- local ingestion for pasted notes, public URLs, and absolute PDF paths, plus an implemented and tested capture-only Realtime transport awaiting its first provider-backed microphone proof;
- an editable, persisted Excalidraw Map with typed operations and versioned approvals;
- materialized `FRAME.md`, `DESIGN.md`, style-token, asset-plan, deck, infographic, and editable storyboard artifacts;
- independent brief and storyboard approval gates, stale propagation, retry, and queued-render cancellation;
- source-traceable presentation and infographic previews plus editable PowerPoint handoffs with claim locators and source notes;
- a versioned local HyperFrames Video render with per-scene provenance for the approved sanitized Storyboard fixture;
- a unified `0.1.2` plugin whose stdio tools search and fetch grounded local evidence and route authorized workflow writes through the same loopback Workshop API;
- a responsive Apps in ChatGPT-aligned interface where the current Presentation is the hero Output and supporting work remains one interaction away.

This is active Build Week work, not a claim that every locked capability is complete. Native ChatGPT durable voice synchronization is not supported in this build. Paid GPT-5.6 reasoning, live GPT Image 2 rendering, a provider-backed Realtime microphone turn, provider narration, and the final public demo remain unproven or in progress. The recorded path uses labeled deterministic fallbacks where provider behavior has not been demonstrated. See [GOAL.md](GOAL.md) for the exact completion definition and [log.md](log.md) for dated evidence.

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

After `pnpm dev` starts, open `http://localhost:3000` in the ChatGPT/Codex in-app browser. The sanitized Workshop opens on its grounded Map; the same fixture includes the approved Brief, reusable Style, real presentation and infographic previews, editable PowerPoint files, planned Image set, editable Storyboard, and local Video. Judges do not need OpenAI credentials or their own API spend to understand the recorded path.

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

Verified installation surface: the Codex CLI marketplace flow on macOS. Fresh Codex tasks have activated the bundled skill and called `workshop_list → search → fetch` against the sanitized local evidence. The write-capable stdio tools and loopback service path pass isolated contract and end-to-end tests; ChatGPT Work invocation remains unverified and must not be inferred from Codex proof. Refresh the installed plugin after a public update before testing new behavior.

## Architecture

```text
Capture sources → normalized evidence → grounded Map → approved brief
      → traceable outputs → approved storyboard → local HyperFrames video
```

- `apps/web` — focused Map, Brief, Outputs, Storyboard, and source-evidence workspace.
- `apps/worker` — SQLite state, queue, artifact store, and render executor.
- `packages/domain` — schemas, approvals, dependencies, graph operations, and provenance contracts.
- `packages/plugin-mcp` — unified skill and stdio MCP entry point for grounded reads and version-gated local workflow writes.
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
