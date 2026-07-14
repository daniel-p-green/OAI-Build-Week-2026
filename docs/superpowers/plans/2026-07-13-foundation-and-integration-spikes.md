# WorkshopLM Foundation and Integration Spikes Implementation Plan

> Execution plan for the primary integrator and three isolated spike lanes. Follow `AGENTS.md`; record provider results in `log.md`, and do not mark a spike passed from mocks alone.

**Goal:** Establish a deterministic pnpm/Turborepo foundation and prove the four external seams that constrain the WorkshopLM architecture before freezing `packages/domain`.

**Architecture:** A Next.js web application and Node worker consume small provider adapters from `packages/ai`; canonical schemas live in `packages/domain`; renderers live in `packages/production`. Throwaway spike apps may call provider adapters directly, but no React component may call OpenAI. Live checks are credential-gated and emit sanitized JSON reports; deterministic unit tests never spend credits.

**Stack:** TypeScript, pnpm workspaces, Turborepo, Next.js, Vitest, Zod, SQLite in WAL mode, local filesystem artifacts, OpenAI JavaScript SDK, HyperFrames CLI, FFmpeg. The primary demo and browser verification surface is the ChatGPT/Codex in-app browser.

---

## Task 1: Scaffold the monorepo and verification commands

**Owner:** primary integrator

**Files:**

- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `turbo.json`
- Create: `.npmrc`
- Create: `.env.example`
- Create: `tsconfig.base.json`
- Create: `vitest.workspace.ts`
- Create: `apps/web/package.json`
- Create: `apps/worker/package.json`
- Create: `packages/config/package.json`
- Create: `packages/domain/package.json`
- Create: `packages/ai/package.json`
- Create: `packages/host/package.json`
- Create: `packages/production/package.json`
- Create: `packages/plugin-mcp/package.json`
- Create: `packages/ui/package.json`
- Modify: `.gitignore`

### Step 1: Add a failing workspace smoke test

Create `packages/config/src/workspace.test.ts` that resolves every required workspace package manifest and asserts each exposes `typecheck`, `lint`, and `test` scripts where applicable.

Run: `pnpm exec vitest run packages/config/src/workspace.test.ts`

Expected: fail because the workspace and package manifests do not exist.

### Step 2: Add the smallest workspace configuration

Use `packageManager` and Corepack rather than a global pnpm assumption. Root scripts must include:

```json
{
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "check": "pnpm lint && pnpm typecheck && pnpm test"
  }
}
```

Configure Turborepo outputs only for real generated directories. Do not add cloud deployment or hosted-infrastructure dependencies.

### Step 3: Install and verify

Run:

```bash
corepack enable
pnpm install
pnpm exec vitest run packages/config/src/workspace.test.ts
pnpm check
```

Expected: all commands pass on the empty scaffold.

### Step 4: Record evidence and commit

Append the exact Node/pnpm versions and command results to `log.md`; update the foundation checklist in `GOAL.md`.

Commit: `build: scaffold WorkshopLM monorepo`

## Task 2: Implement typed environment validation

**Owner:** primary integrator

**Files:**

- Create: `packages/config/src/env.ts`
- Create: `packages/config/src/env.test.ts`
- Create: `packages/config/src/index.ts`
- Modify: `.env.example`

### Step 1: Write failing validation tests

Cover three cases:

1. deterministic/test mode runs without live credentials;
2. live OpenAI mode rejects a missing `OPENAI_API_KEY`;
3. local runtime rejects an artifact/database path outside the configured WorkshopLM data root.

Also assert error messages name missing variables without printing any value.

Run: `pnpm --filter @workshoplm/config test`

Expected: fail because `parseServerEnv` does not exist.

### Step 2: Implement the minimal schema

Export `parseServerEnv(input)` and separate browser-safe output from server-only secrets. Include an explicit live-OpenAI switch so unit tests and UI fixtures cannot accidentally spend credits. Resolve SQLite and artifact paths beneath one configurable local data root.

### Step 3: Verify

Run:

```bash
pnpm --filter @workshoplm/config test
pnpm --filter @workshoplm/config typecheck
```

Expected: pass; test output contains no secret values.

### Step 4: Record and commit

Commit: `feat(config): validate live provider environment`

## Task 2A: Implement local durable storage boundaries

**Owner:** primary integrator

**Files:**

- Create: `packages/domain/src/storage-paths.ts`
- Create: `packages/domain/src/storage-paths.test.ts`
- Create: `apps/worker/src/db/client.ts`
- Create: `apps/worker/src/db/migrate.ts`
- Create: `apps/worker/src/db/migrations/0001_local_runtime.sql`
- Create: `apps/worker/src/db/client.test.ts`
- Create: `apps/worker/src/artifacts/local-artifact-store.ts`
- Create: `apps/worker/src/artifacts/local-artifact-store.test.ts`

### Step 1: Write failing path and persistence tests

Assert that source/artifact paths stay beneath the configured data root, content hashes produce deterministic relative paths, SQLite enables WAL and foreign keys, and a second process can read a committed job row.

Run: `pnpm --filter @workshoplm/domain test && pnpm --filter @workshoplm/worker test`

Expected: fail because the storage path and SQLite clients do not exist.

### Step 2: Implement the smallest local stores

Use one SQLite file under `.workshoplm/data/` and one artifact root under `.workshoplm/artifacts/`. Persist relative paths, MIME type, byte count, and SHA-256; write artifacts through a temporary file followed by atomic rename. Enable WAL, foreign keys, and a bounded busy timeout.

### Step 3: Verify clean reset behavior

Run:

```bash
pnpm --filter @workshoplm/worker test
pnpm demo:reset
pnpm demo:reset
```

Expected: both resets succeed and produce the same sanitized fixture IDs and file hashes.

### Step 4: Commit

Commit: `feat(storage): add deterministic local runtime`

## Task 2B: Scaffold the unified ChatGPT/Codex plugin shell

**Owner:** primary integrator

**Files:**

- Create: `.codex-plugin/plugin.json`
- Create: `.app.json`
- Create: `.mcp.json`
- Create: `skills/workshoplm/SKILL.md`
- Create: `packages/plugin-mcp/src/server.ts`
- Create: `packages/plugin-mcp/src/tools.ts`
- Create: `packages/plugin-mcp/src/tools.test.ts`
- Create: `packages/plugin-mcp/src/widgets/status.html`
- Create: `packages/plugin-mcp/src/widgets/trace.html`
- Create: `packages/plugin-mcp/src/plugin-contract.test.ts`
- Modify: `packages/plugin-mcp/package.json`

### Step 1: Write failing plugin-contract tests

Assert the manifest uses the current `.codex-plugin/plugin.json` shape, points `skills` to `./skills/`, `apps` to `./.app.json`, and `mcpServers` to `./.mcp.json`, includes Interactive/Read/Write capabilities, and references existing icon/widget resources. Assert `.mcp.json` launches the built local stdio server with no network auth configuration. Assert Granola and Google Drive app dependencies are optional so the plugin and judge fixture remain usable without connections.

Run: `pnpm --filter @workshoplm/plugin-mcp test`

Expected: fail because manifests, server, and resources do not exist.

### Step 2: Implement the smallest tool surface

Register one job per tool with explicit schemas and accurate read/write annotations:

- `workshop_list` — read-only summaries;
- `workshop_create` — create one local Workshop;
- `workshop_open` — return the localhost workspace URL and current status;
- `workshop_add_source` — import a sanctioned local file/URL;
- `search` and `fetch` — standard read-only source discovery/retrieval across normalized local sources and available connected-app results;
- `workshop_get_trace` — read-only artifact → claim → source trace;
- `workshop_approve_brief` — approve only the current Map version;
- `workshop_create_output` — enqueue one typed output;
- `workshop_approve_storyboard` — approve only the current storyboard version;
- `workshop_render_video` — reject stale/unapproved inputs before enqueue.

Handlers call shared domain/application commands; they do not duplicate gate logic or call OpenAI directly.

### Step 3: Add the workflow skill and compact widgets

The skill explains Capture → Shape → Deliver, grounding, the two approvals, and when to open the full browser workspace. Status and trace widgets render concise `structuredContent`; they do not attempt to embed the Excalidraw Map or full storyboard editor.

### Step 4: Verify local plugin behavior

Run:

```bash
pnpm --filter @workshoplm/plugin-mcp build
pnpm --filter @workshoplm/plugin-mcp test
pnpm plugin:inspect
```

Expected: manifest/resource validation passes, MCP initialize/list-tools succeeds over stdio, read tools work against the sanitized fixture, and mutation tools return explicit gate errors when ineligible.

Then load the plugin through the supported local desktop development path and test one skill invocation in ChatGPT Work and Codex. Record surface-by-surface results. Do not claim Work can invoke bundled local stdio tools until observed; if it cannot, keep Work skill-only and use Codex plus the in-app browser for the executable demo path.

### Step 5: Commit

Commit: `feat(plugin): add unified WorkshopLM workflow shell`

## Task 3: Define spike-only provider report contracts

**Owner:** primary integrator

**Files:**

- Create: `spikes/_shared/report.ts`
- Create: `spikes/_shared/report.test.ts`
- Create: `spikes/_shared/redact.ts`
- Create: `spikes/_shared/redact.test.ts`
- Create: `artifacts/spikes/.gitkeep`
- Modify: `.gitignore`

### Step 1: Write failing report and redaction tests

Define a report shape with `spike`, `startedAt`, `finishedAt`, `status`, `checks`, `measurements`, `fallback`, and `sanitizedErrors`. Test that known secret patterns and environment values are removed before serialization.

Run: `pnpm exec vitest run spikes/_shared`

Expected: fail because report helpers do not exist.

### Step 2: Implement deterministic serialization

Write reports to `artifacts/spikes/<spike>-<timestamp>.json`. Git-ignore provider payloads, generated media, uploaded fixtures, and raw network captures; retain sanitized reports and explicitly licensed fixtures.

### Step 3: Verify

Run: `pnpm exec vitest run spikes/_shared`

Expected: pass, including snapshot proving redaction.

### Step 4: Commit

Commit: `test: add sanitized spike evidence reports`

## Task 4: Spike local search/fetch grounding

**Owner:** lane 1

**Files:**

- Create: `spikes/b-grounding/package.json`
- Create: `spikes/b-grounding/src/normalize.ts`
- Create: `spikes/b-grounding/src/search.ts`
- Create: `spikes/b-grounding/src/fetch.ts`
- Create: `spikes/b-grounding/src/ground.ts`
- Create: `spikes/b-grounding/src/grounding.test.ts`
- Create: `spikes/b-grounding/fixtures/brief.md`
- Create: `spikes/b-grounding/fixtures/meeting.txt`
- Create: `spikes/b-grounding/fixtures/metrics.csv`
- Create: `spikes/b-grounding/README.md`
- Modify: root `package.json`

### Step 1: Test deterministic normalization and citations

Given captured-shaped fixture results, assert mapping to:

```ts
type EvidenceLocator = {
  sourceId: string;
  chunkId: string;
  snippet: string;
  snippetHash: string;
  retrievalRank?: number;
  nativeLocator?: { kind: "page" | "time" | "section"; value: string };
};
```

The normalizer must produce stable chunk IDs and omit `nativeLocator` when it cannot prove one. Add a hostile paraphrase fixture with zero intentional lexical overlap with the source, plus an unsupported-claim fixture. Instrument query expansion to report latency, token use, and estimated cost per retrieval without logging source content.

Run: `pnpm --filter @workshoplm/spike-grounding test`

Expected: fail before implementation, then pass after the smallest mapper is written.

### Step 2: Implement standard local search/fetch

Parse the three fixtures locally, persist deterministic chunks in SQLite FTS5, and expose standard MCP `search` and `fetch` result shapes. Combine BM25 with exact phrase/identifier matches. Use GPT-5.6 only to generate bounded query variants and to answer from the retrieved evidence bundle.

### Step 3: Run live verification

Run: `pnpm spike:grounding`

Expected: exact and hostile-paraphrase queries retrieve the right source; the grounded response resolves at least three citations; the unsupported claim is marked `unverified`; ChatGPT/Codex and worker adapters return the same evidence shape; query-expansion latency, tokens, and estimated cost are present. If paraphrase recall is insufficient, record the evidence and activate optional semantic vectors or hosted File Search behind the same interface.

### Step 4: Record and commit

Append indexing time, query results, citation count, locator limitations, and any fallback decision to `log.md`.

Commit: `spike: verify local source grounding`

## Task 5: Spike GPT Image 2 batch behavior

**Owner:** lane 2

**Files:**

- Create: `spikes/c-images/package.json`
- Create: `spikes/c-images/src/run.ts`
- Create: `spikes/c-images/src/batch-manifest.ts`
- Create: `spikes/c-images/src/batch-manifest.test.ts`
- Create: `spikes/c-images/fixtures/visual-dna.json`
- Create: `spikes/c-images/fixtures/reference.png`
- Create: `spikes/c-images/README.md`
- Modify: root `package.json`

### Step 1: Test selective replacement

Create a six-entry manifest fixture. Assert `replaceAsset(manifest, panelId, nextAsset)` changes only the target asset/version while preserving all other IDs, hashes, and provenance.

Run: `pnpm --filter @workshoplm/spike-images test`

Expected: fail before implementation, then pass.

### Step 2: Implement a bounded live runner

Generate six images using one shared Visual DNA block and a licensed/reference fixture, persist local artifacts outside Git, record per-image latency/model/quality/size/reference metadata, then regenerate panel four only. Default to no live execution unless `WORKSHOPLM_LIVE_OPENAI=1`.

### Step 3: Verify manifests before and after live execution

Run:

```bash
pnpm spike:images
pnpm --filter @workshoplm/spike-images test
```

Expected: a sanitized report with six successful assets, selective replacement proof, latency, and cost estimate; otherwise a precise access/quota/credential failure.

### Step 4: Record and commit

Commit only the runner, licensed fixture, tests, and sanitized report—not generated image binaries.

Commit: `spike: measure coherent GPT Image 2 batch`

## Task 6: Spike ChatGPT account/task/voice synchronization

**Owner:** lane 3

**Files:**

- Create: `spikes/a-host-sync/package.json`
- Create: `spikes/a-host-sync/src/app-server-client.ts`
- Create: `spikes/a-host-sync/src/account.ts`
- Create: `spikes/a-host-sync/src/task-sync.ts`
- Create: `spikes/a-host-sync/src/task-sync.test.ts`
- Create: `spikes/a-host-sync/src/verify.ts`
- Create: `spikes/a-host-sync/README.md`
- Modify: root `package.json`

### Step 1: Test idempotent host-turn persistence

Use captured-shaped app-server fixtures and a temporary repository. Assert append idempotency, ordering by task/turn/item identity, restart reads, attribution of user versus assistant turns, and rejection of a turn linked to another Workshop.

Run: `pnpm --filter @workshoplm/spike-host-sync test`

Expected: fail before implementation, then pass.

### Step 2: Implement the app-server boundary

Connect server-side through `codex app-server proxy` or the managed local control socket. Implement initialize, `account/read`, supported `account/login/start`, task read/subscription, and reconnection. Browser responses may contain account type, email, and plan display state but never auth tokens. Add a response-body test that rejects JWT/token-shaped values.

### Step 3: Link a ChatGPT task to a Workshop

Persist the linked task ID and ingest one typed user turn plus the resulting assistant turn. Attempt one native voice-originated turn on the installed surface and record whether the protocol exposes durable equivalent content.

### Step 4: Run live verification

Run `pnpm spike:host-sync`, complete typed and voice capture attempts, restart the adapter, then run `pnpm spike:host-sync:verify`.

Expected: account state, task linkage, typed-turn persistence, restart idempotency, and token scanning pass. The report explicitly selects native voice sync or the narrow `gpt-realtime-2.1` fallback; uncertainty is not a passing result.

Stop native-path investigation at July 14 end of day CT. If durable native voice linkage is not proven, activate the fallback automatically as a capture-only host-strip or top-bar control. It must not add a text field, transcript pane, or duplicate conversation surface.

### Step 5: Record and commit

Commit: `spike: verify ChatGPT task and voice capture`

## Task 7: Spike local HyperFrames rendering

**Owner:** first lane freed by Tasks 4–6

**Files:**

- Create: `spikes/d-video/package.json`
- Create: `spikes/d-video/DESIGN.md`
- Create: `spikes/d-video/index.html`
- Create: `spikes/d-video/storyboard.json`
- Create: `spikes/d-video/src/build-composition.ts`
- Create: `spikes/d-video/src/build-composition.test.ts`
- Create: `spikes/d-video/src/verify-render.ts`
- Create: `spikes/d-video/README.md`
- Modify: root `package.json`

### Step 1: Write the storyboard-to-scene contract test

Assert the builder produces exactly three scenes, deterministic durations, caption text, audio references, approved storyboard version, Design version, and visible AI-voice disclosure. Assert stale or unapproved fixtures are rejected.

Run: `pnpm --filter @workshoplm/spike-video test`

Expected: fail before implementation, then pass.

### Step 2: Create the minimal designed composition

Write `DESIGN.md` first. Build an HTML/GSAP HyperFrames composition from `storyboard.json`; use deterministic local audio fixtures until live TTS is separately verified. Do not introduce remote HyperFrames auth or job polling.

### Step 3: Verify the CLI and render

Run:

```bash
npx hyperframes doctor
npx hyperframes lint
npx hyperframes validate
npx hyperframes inspect
npx hyperframes render --output artifacts/spikes/spike-d.mp4
pnpm spike:video:verify
```

Expected: HyperFrames commands pass and `ffprobe` confirms a playable audio/video MP4 with the expected duration.

### Step 4: Verify live narration seam

When `WORKSHOPLM_LIVE_OPENAI=1`, generate three disclosed `gpt-4o-mini-tts` segments, rebuild, and render again. Keep narration binaries out of Git.

### Step 5: Record and commit

Commit: `spike: render approved storyboard with HyperFrames`

## Task 8: Reconcile results and freeze the implementation direction

**Owner:** primary integrator

**Files:**

- Modify: `research/engineering-direction.md`
- Modify: `docs/superpowers/specs/2026-07-13-workshoplm-design.md`
- Modify: `GOAL.md`
- Modify: `log.md`
- Create: `docs/superpowers/plans/2026-07-14-domain-contracts.md`

### Step 1: Audit every spike against live evidence

For each report, classify `passed`, `fallback_active`, `credential_blocked`, or `failed`. A passing deterministic test is not a passing provider spike. Confirm temporary provider resources were cleaned up.

### Step 2: Lock adapter consequences

Update engineering direction only where live evidence changes latency, locators, persistence, rendering, queue behavior, or judge-fixture strategy. Activate fallbacks autonomously when the evidence threshold in `PLAN-2026-07-13.md` is met.

### Step 3: Write the domain-contract plan

The next plan must enumerate every Zod schema, command, gate derivation, dependency rule, fixture, and test required for the v1 freeze. Freeze provider-independent contracts by July 14 end of day. The transcript/turn schema alone may remain behind an adapter boundary until July 15 morning if Spike A changes its observable fields. It must incorporate the actual spike result shapes instead of guessed provider payloads.

### Step 4: Run the documentation consistency check

Run:

```bash
rg -n -g '!docs/superpowers/plans/2026-07-13-foundation-and-integration-spikes.md' "awaiting approval|founder review|Remotion fallback|HyperFrames auth|linear lifecycle|persistent text/voice composer" AGENTS.md GOAL.md PLAN-2026-07-13.md docs research
git diff --check
git status --short
```

Expected: no stale approval dependency or incorrect HyperFrames assumption; only intentional historical references may remain.

### Step 5: Commit

Commit: `docs: lock integration evidence and domain plan`
