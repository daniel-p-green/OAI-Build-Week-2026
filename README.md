# WorkshopLM

> Turn raw thinking into professional knowledge work.

WorkshopLM is a local-first workspace that turns conversations and source material into connected presentations, graphics, Audio Overviews, visual Maps, Storyboards, and Videos. Every expression shares the same knowledge, visual identity, and traceable connection to its Sources.

The product follows one compact path:

```text
Capture → Map → Brief → Create
```

- **Capture** brings Conversation, voice, notes, websites, and documents together as Sources.
- **Map** organizes grounded evidence into synthesis and a recommended direction.
- **Brief** records the direction a professional has deliberately approved.
- **Create** produces connected, editable work in a shared Style.

Two approvals carry visible consequences: approving the Brief locks the creation direction, and approving the Storyboard authorizes Video. Source or Style changes preserve history and mark dependent work `Needs update`.

## What is implemented

- A focused, responsive Workshop workbench for Capture, Map, Brief, and Create.
- Local SQLite state in WAL mode, durable jobs, and hash-addressed artifacts.
- Grounded source search with exact locators and visible Source links.
- An editable semantic Map with typed operations, hierarchy, synthesis, and version history.
- Versioned Brief and Storyboard approvals with stale-state propagation.
- Source-traceable Presentation, Infographic, Audio Overview, Sketch, image-set, Storyboard, and Video workflows.
- Editable PowerPoint and SVG handoffs plus local HyperFrames video rendering.
- A Codex plugin whose tools search and fetch Workshop evidence and route authorized writes through the local service.
- A sanitized, credential-free judge fixture that exercises the complete workflow without paid API calls.

## Run the judge fixture

Requirements: Node.js 22+ and pnpm 10+.

```bash
pnpm install --frozen-lockfile
pnpm judge:start
```

`pnpm judge:start` recreates the deterministic Workshop and starts the local app. Open the printed URL in the Codex in-app browser. The fixture includes a grounded Map, approved Brief, reusable Style, connected created work, an editable Storyboard, and a locally rendered Video. It does not require OpenAI credentials or judge-funded API usage.

For ordinary development:

```bash
pnpm dev
```

## Optional live-provider path

`pnpm demo:live` prepares an isolated Workshop under `.workshoplm/live-operator/`. Without explicit opt-in it performs a no-spend preflight. A paid run requires both an API key and a bounded request ceiling:

```bash
WORKSHOPLM_LIVE_OPENAI=1 \
WORKSHOPLM_MAX_PAID_REQUESTS=13 \
OPENAI_API_KEY=… \
pnpm demo:live -- --execute
```

The live path fails closed when authorization is incomplete. Generated provider artifacts, private Sources, runtime databases, and review media remain local and Git-ignored.

## Checks

```bash
pnpm check
pnpm demo:e2e
```

## Codex plugin

The repository includes the WorkshopLM Codex plugin and public marketplace descriptor:

```bash
codex plugin marketplace add daniel-p-green/OAI-Build-Week-2026
codex plugin add workshoplm@workshoplm-local
```

Set the local data root before opening the Codex task that will use WorkshopLM:

```bash
export WORKSHOPLM_DATA_ROOT="/absolute/path/to/OAI-Build-Week-2026/.workshoplm/acceptance"
```

The plugin reads only the configured Workshop data root. It does not upload the Workshop or scan unrelated local files.

## Architecture

```text
Sources → grounded evidence → semantic Map → approved Brief
        → styled created work → approved Storyboard → Video
```

- `apps/web` — the local Workshop workbench and browser tests.
- `apps/worker` — SQLite state, jobs, provider adapters, and orchestration.
- `packages/domain` — shared schemas, approvals, dependencies, and provenance contracts.
- `packages/production` — source-traceable renderers and editable exports.
- `packages/plugin-mcp` — the WorkshopLM skill and local MCP doorway.
- `packages/ui` — shared interface primitives.
- `fixtures` — sanitized inputs required for deterministic verification.

## Project record

[GOAL.md](GOAL.md) is the current product compass, [DESIGN.md](DESIGN.md) is the interface contract, and [log.md](log.md) is the append-only Build Week record. [PLAN-2026-07-13.md](PLAN-2026-07-13.md) is a dated architecture reference, not the active checklist. The source tree intentionally excludes submission packages, raw recordings, generated review media, research screenshots, and local-machine paths.

Codex accelerated implementation and verification across the monorepo, local state, typed Map operations, plugin doorway, browser workspace, deterministic fixture, and render path. Human decisions set the product boundary, approval model, privacy defaults, and public claims. GPT-5.6 contributes through Codex during development and through the optional grounded Map provider path; the default judge fixture remains deterministic and credential-free.
