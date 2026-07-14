# Engineering direction

Updated: 2026-07-13

## Repository decision

Use a TypeScript monorepo with **pnpm workspaces** and **Turborepo**. Keep the runtime architecture simple; the monorepo exists to share domain contracts and isolate long-running production work, not to create microservices.

## Proposed shape

```text
apps/
  web/                  Next.js product UI, route handlers, auth, project APIs
  worker/               ingestion, clustering, image batches, coherence checks, renders
packages/
  domain/               Zod schemas, state machine, IDs, dependency graph
  ai/                   OpenAI Responses, Realtime, File Search, GPT Image adapters
  production/           deck, infographic, storyboard, HyperFrames handoff builders
  ui/                   shared shadcn compositions and application components
  config/               shared TypeScript, lint, and build configuration
```

Do not create a separate API application initially. The web application's route handlers can own the authenticated product API; the worker handles only queued long-running jobs.

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

## Pipeline state machine

```text
capturing
  → transcript_ready
  → board_draft
  → board_approved
  → brief_ready
  → style_locked
  → asset_plan_ready
  → generating_assets
  → storyboard_review
  → storyboard_approved
  → rendering_video
  → outputs_ready
```

Failures remain attached to the stage and individual job. A failed image panel should not invalidate an already generated deck or require restarting the whole package.

## Dependency graph

The semantic dependency graph is the strongest technical differentiator.

Examples:

- transcript segment → idea node → approved claim → slide 4;
- idea cluster → narrative beat → storyboard panels 3–5;
- Brand Foundation + Intent Profile → Visual DNA v3 → image batch;
- storyboard panel → HyperFrames scene and voiceover segment.

When an upstream object changes, downstream objects become `stale` until patched, regenerated, or explicitly accepted. This is what turns a collection of generators into a coherent production system.

## Data and jobs

- Postgres for Workshop, graph, version, and job metadata.
- Object storage for source files, logos, fonts, reference images, generated assets, audio, and rendered video.
- OpenAI vector stores/File Search for grounded retrieval.
- A durable job table or lightweight queue for long-running image and render work.
- Server-issued ephemeral credentials for browser Realtime sessions.

Select concrete infrastructure vendors during implementation planning; do not add several databases or queue systems for the hackathon.

## Verification strategy

- Schema tests for every canonical object and state transition.
- Fixture-based transcript → graph tests.
- Referential-integrity tests from claims to artifact components.
- Deterministic storyboard → HyperFrames handoff snapshots.
- Coherence evaluator tests with deliberately mismatched batch fixtures.
- Browser tests for the Capture → Shape → Deliver happy path.
- A clean, sanitized judge fixture that requires no private connector.

## Scope guardrails

- One repository, two applications, a small number of focused packages.
- No microservice split by model or artifact type.
- No duplicated types between web and worker.
- No business logic hidden inside React components.
- No direct final-video generation that bypasses storyboard approval.
