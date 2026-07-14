# Engineering direction

Updated: 2026-07-13

## Repository decision

Use a TypeScript monorepo with **pnpm workspaces** and **Turborepo**. Keep the runtime architecture simple; the monorepo exists to share domain contracts and isolate long-running production work, not to create microservices.

## Proposed shape

```text
apps/
  web/                  Next.js visual Workshop UI and local route handlers
  worker/               ingestion, clustering, image batches, coherence checks, renders
packages/
  domain/               Zod schemas, gate derivation, IDs, dependency graph
  ai/                   OpenAI Responses, GPT Image, TTS, and optional Realtime adapters
  host/                 Codex app-server account/task bridge
  plugin-mcp/           local stdio tools and compact widgets
  production/           deck, infographic, storyboard, HyperFrames handoff builders
  ui/                   shared shadcn compositions and application components
  config/               shared TypeScript, lint, and build configuration
.codex-plugin/          unified ChatGPT/Codex plugin manifest
.mcp.json               bundled local stdio MCP server
skills/workshoplm/      Capture → Shape → Deliver workflow skill
```

Do not create a separate API application initially. The web application's local route handlers own validated product commands; the worker handles queued long-running jobs. ChatGPT is the Conversation UI; the web app contains Sources, Map/artifact workspace, and Studio rather than a duplicate composer.

Do not create a separate Excalidraw package unless reusable integration code becomes substantial. The semantic board contracts belong in `packages/domain`; the Excalidraw view and element mapping can begin inside `apps/web`.

## Canonical domain objects

- `Workshop`
- `Source`
- `TranscriptSegment`
- `Claim`
- `IdeaNode`
- `IdeaEdge`
- `BoardSceneMapping`
- `FrameBrief`
- `BrandFoundation`
- `IntentProfile`
- `VisualDnaVersion`
- `OutputSet`
- `Storyboard`
- `StoryboardPanel`
- `GenerationJob`
- `ArtifactVersion`

Every rendered artifact references the exact board, brief, style, Visual DNA, and claim versions that produced it.

## Progress gates

Workshop progress uses independently derived gates rather than one linear state: `transcript_ready`, `board_approved`, `brief_ready`, `style_locked`, `storyboard_approved`, and `video_rendered`. Object versions carry their own `stale` overlay. Failures remain attached to individual jobs; a failed image panel does not invalidate an already generated deck.

## Dependency graph

The semantic dependency graph is the strongest technical differentiator.

Examples:

- transcript segment → idea node → approved claim → slide 4;
- idea cluster → narrative beat → storyboard panels 3–5;
- Brand Foundation + Intent Profile → Visual DNA v3 → image batch;
- storyboard panel → HyperFrames scene and voiceover segment.

When an upstream object changes, downstream objects become `stale` until patched, regenerated, or explicitly accepted. This is what turns a collection of generators into a coherent production system.

## Local data, host, and jobs

- SQLite in WAL mode for Workshop, graph, version, approval, dependency, and job metadata.
- Local content-addressed artifact storage for sources, logos, fonts, references, generated assets, audio, and video.
- Local normalization plus standard MCP `search`/`fetch`, SQLite FTS5/BM25, and exact search for source grounding. Existing connected apps/MCPs normalize into the same evidence contract.
- A local worker polling leased SQLite job rows for long-running image and render work.
- Codex app-server for ChatGPT account state, supported login flow, and task linkage. WorkshopLM never stores ChatGPT tokens.
- Native ChatGPT voice is primary. Server-issued Realtime ephemeral credentials exist only if the host-sync spike requires the fallback.

## Verification strategy

- Schema tests for every canonical object and gate/command transition.
- Fixture-based transcript → graph tests.
- Referential-integrity tests from claims to artifact components.
- Deterministic storyboard → HyperFrames handoff snapshots.
- Coherence evaluator tests with deliberately mismatched batch fixtures.
- Plugin/MCP contract tests and browser tests for the ChatGPT task → visual Workshop → Deliver happy path.
- A clean, sanitized judge fixture that requires no private connector.

## Scope guardrails

- One repository, two applications, a small number of focused packages.
- No microservice split by model or artifact type.
- No duplicated types between web and worker.
- No business logic hidden inside React components.
- No direct final-video generation that bypasses storyboard approval.
