# WorkshopLM Goal

Last updated: 2026-07-14 00:30 CT

## Status

**Active phase:** Full implementation — integration spikes and platform foundation in parallel
**Implementation:** Fully authorized for the complete locked WorkshopLM version in this file. Product discovery is closed; execute, verify, and ship.
**Current gate:** No founder approval gate. Execute the plan autonomously and escalate only for credentials/spend, material privacy/security/licensing decisions, irreversible external actions, or an objective-changing breaking decision.
**Known provider risk:** The configured API key authenticates and can retrieve `gpt-image-2`, `gpt-4o-mini-tts`, `gpt-realtime-2.1`, and the GPT-5.6 variants `gpt-5.6-luna`, `gpt-5.6-terra`, and `gpt-5.6-sol`. The bare `gpt-5.6` endpoint returns `404 model_not_found`. The locked runtime uses an operation-level GPT-5.6 routing policy; paid Responses benchmarks must validate cost, latency, and quality before claiming live product use or changing per-operation defaults.

**Hard schedule gates:**

- **July 20, 2026, end of day CT:** feature-complete. No new features merge after this point.
- **July 21, 2026:** verification and submission only. Target submission by 12:00 PM PT, five hours before the 5:00 PM PT deadline.

## Objective

Implement and verify the complete locked WorkshopLM product for OpenAI Build Week in a pnpm/Turborepo monorepo.

Deliver the full WorkshopLM scope through one exceptionally intuitive **Capture → Shape → Deliver** happy path:

1. The native ChatGPT conversation/voice experience and grounded sources become an editable semantic Excalidraw whiteboard in the in-app browser.
2. The approved board, together with a website-derived or manually configured Style Library and Intent Profile, becomes the executable brief.
3. The brief produces a source-traceable presentation, infographic, visually coherent GPT Image 2 batch, and editable storyboard.
4. Only an approved storyboard may render a narrated HyperFrames video.

Preserve citations, exact brand rules, dependency-aware versions, and stale-state propagation across every artifact. Use WorkshopLM to create its own truthful hackathon demo package and final meta-demo video. Target **Work & Productivity**. Keep Education/Learning mode, general-purpose Canva scope, and unsupported production claims out of scope.

Completion requires verification of the live product, responsive UX, core tests, OpenAI integration behavior, and judge-facing submission artifacts against the current research and hackathon rules.

## Definition of fully implemented

This goal is not complete when the architecture, shell, mocks, or isolated model calls exist. It is complete only when one coherent local product demonstrates all of the following:

1. A locally installed unified WorkshopLM plugin opens and controls the full visual Workshop in the ChatGPT/Codex in-app browser.
2. Native ChatGPT text/voice—or the deadline-triggered Realtime capture fallback—feeds a durable Workshop transcript without creating a duplicate browser chat product.
3. Local files, URLs, and sanitized meeting material become normalized, searchable sources with inspectable claim → chunk → source grounding.
4. GPT-5.6 turns the conversation and selected evidence into an editable semantic graph rendered as an Excalidraw Map, with typed operations, undo, evidence states, and a regenerable Sketch view.
5. `Approve map as brief` produces inspectable `FRAME.md` plus executable data; a website URL or manual assets produce a reviewable, versioned `DESIGN.md`, Brand Foundation, Intent Profile, and Visual DNA.
6. Studio generates the complete locked output set: source-traceable deck, source-traceable infographic, coherent GPT Image 2 batch, editable storyboard, and narrated local HyperFrames video.
7. Storyboard approval, dependency versions, stale propagation, retry/cancel/partial-success behavior, and artifact provenance work across the real seam—not only in isolated tests.
8. The provenance view traces the actual WorkshopLM submission from raw brainstorm through sources, Map, brief, style, outputs, build evidence, and measured time-to-first-output.
9. The under-three-minute public demo video shows the real working flow clearly enough that judges do not need to recreate the local plugin environment to understand or score it.
10. The repository passes the documented deterministic checks, the live demo seam is recorded from the intended surface, and all judge-facing claims match captured evidence.

All items above are committed scope for this hackathon version. Fallbacks may change implementation mechanics, but may not silently remove the user-visible capability they preserve.

## Integration priority

The seam **voice/source capture → grounded Map → approved brief → branded outputs → approved storyboard → rendered video** outranks breadth. If the daily acceptance run is red, repair the seam before merging new features; resume breadth when it is green.

## Product identity

- **Name:** WorkshopLM
- **Tagline:** Turn raw thinking into finished work.
- **Internal thesis:** NotebookLM, but better for professional production and built with OpenAI.
- **Judge-facing shorthand:** WorkshopLM is NotebookLM for finished work—built on the OpenAI API.
- **Track:** Work & Productivity

The NotebookLM association is intentional category shorthand for hackathon judging. WorkshopLM must not imply affiliation with Google or present itself as an official OpenAI product. Keep Google's marks out of the project title, video title, thumbnails, and product UI; use the comparison only in explanatory copy or narration.

## Locked decisions

- Professional and team workflows only; Education/Learning mode is removed.
- One focused Capture → Shape → Deliver experience rather than separate work and education products.
- TypeScript monorepo using pnpm workspaces and Turborepo.
- The hackathon demo is local-first and does not require hosting, a separate WorkshopLM account system, Supabase, cloud object storage, or a remote worker.
- Local persistence uses SQLite in WAL mode for Workshop metadata/jobs and a workspace-owned filesystem directory for sources and generated artifacts.
- Original source files and normalized representations remain in the local Workshop data directory for the core demo. Hosted indexing may be added later, but source grounding does not depend on upload.
- The only required network dependency for the core demo is the OpenAI API; HyperFrames and output rendering run locally.
- The ChatGPT task is WorkshopLM's Conversation layer: native text/voice, reasoning, clarification, and plugin invocation.
- The local web app in the ChatGPT/Codex in-app browser is WorkshopLM's visual layer: Sources, Map, brief/style, Studio, storyboard, outputs, and trace. It contains no duplicate chat composer.
- Codex app-server brokers ChatGPT/Codex login and account state. WorkshopLM does not receive, expose, or persist raw ChatGPT auth tokens and does not create a second account system.
- WorkshopLM is packaged as a unified ChatGPT/Codex plugin: workflow skills plus a bundled local stdio MCP server and compact review widgets. The plugin is the native discovery/orchestration layer; the local browser workspace remains the full production interface.
- Core plugin use requires no connected app. Granola, Google Drive, and other source apps are optional adapters after the sanitized file/URL path works.
- One canonical semantic project graph is the source of truth.
- The whiteboard has two views over that graph:
  - **Map:** editable Excalidraw thinking surface.
  - **Sketch:** polished, regenerable hand-drawn output of an approved graph version.
- Sketch is not a second editor. Graph changes mark it stale until refreshed.
- The whiteboard becomes the executable brief.
- Source claims and citations remain linked through downstream artifacts.
- Style is layered into Brand Foundation, Intent Profile, and versioned Visual DNA.
- Storyboard approval is mandatory before HyperFrames video rendering.
- Image coherence uses locked references, evaluation, and selective regeneration; no unsupported perfect-consistency claim.
- The product creates its own truthful demo package and final meta-demo video.
- The primary demo scenario is meta: WorkshopLM creates the assets and final video used for its own Build Week submission.
- WorkshopLM is organized into Workshops; each Workshop is the durable top-level container equivalent to a Notebook in NotebookLM.
- A Workshop contains its sources, conversation, semantic map, approved brief, style, and outputs.
- Preserve NotebookLM's familiar mental model across two native surfaces: ChatGPT owns Conversation; the in-app browser owns a three-panel visual Workshop with Sources left, Map/artifact workspace center, and Studio right.
- Deliver is a Studio of output types over one shared grounded Workshop core, not a mandatory fixed package.
- `Production Kit` is rejected as the output label.
- Pipecat is deferred from the MVP; retain an adapter seam and revisit only for telephony, provider switching, or server-side audio pipelines.
- OpenAI project reasoning and structured operations use the Responses API with the GPT-5.6 routing policy: `gpt-5.6-sol` for quality-critical reasoning, `gpt-5.6-terra` for balanced structured work, and `gpt-5.6-luna` for repeatable high-volume work. Per-operation defaults may change only with recorded quality, latency, and cost evidence.
- Project grounding uses local parsing, deterministic chunks/locators, SQLite FTS5/BM25, exact text search, and standard plugin `search`/`fetch` tools. GPT-5.6 receives retrieved evidence bundles and may not mark a factual claim `verified` without durable claim→chunk→source edges. Hosted OpenAI `file_search` is an optional adapter/comparison, not a requirement.
- Native ChatGPT voice is the primary capture path. A live spike must prove durable thread/voice-turn synchronization into WorkshopLM. If the host cannot expose the needed durable capture, fall back to a narrow `gpt-realtime-2.1` WebRTC capture surface; standard API keys remain server-only.
- Spike A has a hard decision deadline of July 14 end of day CT. If native voice-turn synchronization is not proven by then, activate the Realtime fallback automatically as a capture-only control in the host strip or top bar. It is visually distinct from a composer and does not duplicate ChatGPT conversation.
- Narration uses `gpt-4o-mini-tts`, stores panel-level provenance, and clearly discloses that the voice is AI-generated.
- Batch image generation uses the direct Image API with `gpt-image-2`; conversational image edits may use the Responses image-generation tool.
- `Notedex`, `Notex`, and `ChatGPT Notes` are rejected names.
- **Studio** is the creation area; an **Output type** is a guided creation path; an **Output** is one artifact; an **Output set** is a user-selected group generated from the same approved state.
- Exactly two blocking approval gates exist: approve the Map as the brief, then approve the storyboard before video. Style selection is inline review, not a third gate.
- The demo path includes a one-click sanitized sample Workshop with no private connector, plus a bounded live operator run on sample sources for recording and optional inspection.
- The public demo video is the primary judge experience and must prove the live thought-to-delivery seam clearly. The sanitized fixture makes recording repeatable and supports optional inspection without requiring judges to supply or spend their own API credits.
- The submission is a local plugin/developer-tool experience. Provide concise installation instructions and the verified supported platform, but do not divert implementation time into making judges recreate the full local stack. The verified Spike E surface controls the README, Devpost, and video platform claim.
- Workshop progress is represented by independent gate flags rather than one linear lifecycle: `transcript_ready`, `board_approved`, `brief_ready`, `style_locked`, `storyboard_approved`, and `video_rendered`. Staleness remains a per-object overlay.
- Five live integration spikes gate only the provider- or host-dependent implementation they inform: native ChatGPT task/account/voice synchronization (with Realtime fallback), local plugin search/fetch grounding (with optional File Search comparison), GPT Image 2 batching, local HyperFrames rendering, and unified-plugin loading across the available Work/Codex surfaces. Monorepo foundation, domain work, deterministic adapters, GUI shell, and fixture work proceed in parallel.
- The GUI is the flagship product proof. Plugin widgets remain compact doorways; they never duplicate the Map, Studio, storyboard editor, or asset browser.
- Freeze `packages/domain` contracts before parallel feature work. Afterward, the integrator may approve compatible changes with tests; only product-changing breaking decisions escalate.
- Freeze all provider-independent domain contracts by July 14 end of day. The transcript/turn schema may remain behind its adapter interface until Spike A resolves, but must freeze by July 15 morning without delaying independent lanes.
- Use at most four concurrent execution slots: one primary integrator and three isolated implementation lanes.
- Run a daily end-to-end acceptance path once the first vertical slice exists. A red run pauses breadth, not the build.
- Deterministic presentation and infographic rendering uses HTML/CSS templates exported to PDF/PNG.
- HyperFrames is the primary local deterministic video renderer. WorkshopLM uses no HyperFrames API, auth, remote job, polling, or download flow. A minimal local FFmpeg composition behind the same adapter is the fallback; do not add a parallel Remotion stack unless live evidence proves it necessary.
- Build a provenance surface showing how WorkshopLM and its submission were created, including `log.md`, commits, available Codex task evidence, and measured time-to-first-output.

## Engineering decisions delegated

The primary integrator selects and justifies these without separate founder approval unless a choice crosses an escalation boundary in `AGENTS.md`:

- monorepo package boundaries and canonical schemas;
- local database, artifact storage, and durable-job implementation within the locked SQLite/filesystem boundary;
- renderer implementation within the locked HTML/CSS and HyperFrames/FFmpeg boundaries;
- job retry, cancellation, timeout, and partial-success mechanics;
- cache, version, and stale-state implementation details;
- responsive breakpoints, accessible component behavior, and keyboard interactions;
- test organization, fixtures, mocks, and CI commands.

## Progress

### 1. Research and requirements

- [x] Verify Build Week rules, deadline, judging criteria, track, and submission requirements.
- [x] Research NotebookLM strengths and limitations.
- [x] Research Pomelli website-to-brand workflow.
- [x] Research Canva's editable multi-format boundary.
- [x] Research OpenAI Realtime, File Search, image generation, and tool architecture.
- [x] Verify and lock the official OpenAI API/model map for GPT-5.6, File Search, Realtime 2.1, GPT-4o mini TTS, and GPT Image 2.
- [x] Research Excalidraw, Google Flow coherence mechanics, and HyperFrames handoff.
- [x] Establish professional-only positioning and Work & Productivity track.
- [x] Select WorkshopLM as the working public name.
- [x] Map source-to-output workflows and evaluate ChatGPT Sites and Pipecat boundaries.
- [x] Inspect the live NotebookLM library, Sources, Chat, citation, Studio, and output-viewer flows in Chrome with privacy-safe screenshots.

### 2. Product design

- [x] Lock the flagship visual GUI contract in root `DESIGN.md`.
- [x] Approve the canonical semantic graph.
- [x] Approve Map and Sketch as two views over one graph.
- [x] Approve Workshop as the user-facing top-level container.
- [x] Approve system architecture and component boundaries.
- [x] Approve end-to-end UX and data flow.
- [x] Approve versioning, stale-state propagation, and approval behavior.
- [x] Approve failure, retry, cancellation, and partial-success behavior.
- [x] Approve responsive and accessibility behavior.
- [x] Approve verification strategy and judge-test path.
- [x] Approve the meta-demo scenario in which WorkshopLM creates its own submission assets and video.
- [x] Approve Studio / Output type / Output as the replacement for the rejected fixed package label.
- [x] Lock exactly two approval moments for the product and three-minute demo: brief and storyboard.

### 3. Specification and implementation plan

- [x] Write the proposed design to `docs/superpowers/specs/`.
- [x] Self-review the specification for placeholders, contradictions, ambiguity, and excessive scope.
- [x] Reconcile and lock the written specification and execution architecture.
- [x] Write the dated execution runbook (`PLAN-2026-07-13.md`).
- [x] Write the task-level foundation and integration-spike plan under `docs/superpowers/plans/`.
- [ ] Write subsequent task-level workstream plans as each reaches execution.

### 4. Integration spikes

- [ ] Capture and timestamp the original raw voice brainstorm before product code exists.
- [x] Verify API-key authentication and list access for the required OpenAI model IDs without spending generation credits; record any entitlement or spend-cap uncertainty.
- [ ] Spike A: Codex app-server account/login read, ChatGPT task linking, native text/voice-turn persistence, and `gpt-realtime-2.1` fallback decision.
- [x] Spike B: deterministic normalized local sources, standard plugin `search`/`fetch`, FTS5/exact retrieval, and durable Source/Claim citations; live GPT-5.6 expansion remains entitlement-gated.
- [x] Spike C: six-image batch manifest, locked reference, and selective regeneration contract; live image generation remains opt-in and unrun.
- [x] Spike D: local HyperFrames CLI health check, validated three-scene composition, disclosed narration fixture, and rendered MP4.
- [ ] Spike E: locally install the unified plugin, invoke its skill, call its stdio MCP tools, and record actual Work/Codex surface support.
- [x] Activate and verify the designed capture-only fallback for the unproven native task/voice synchronization spike; live Realtime transport remains separately unverified.

### 5. Repository and platform foundation

- [x] Initialize Git and preserve dated Build Week commits.
- [x] Scaffold the pnpm/Turborepo monorepo.
- [x] Create `apps/web`, `apps/worker`, and focused shared packages.
- [x] Create the unified plugin manifest, WorkshopLM skill, local MCP server, and compact status/trace widget with tested persisted-fixture tools.
- [x] Establish linting, type checking, tests, and deterministic local fixture reset; typed environment validation remains next.
- [ ] Record every participating Codex `/feedback` Session ID, or the explicit reason it is unavailable, and designate the primary integrator session from actual build evidence.
- [x] Configure local SQLite WAL persistence boundaries, atomic filesystem artifact storage, and idempotent leased local jobs.
- [x] Freeze `packages/domain` v1 schemas, commands, gate flags, dependency edges, and `artifact.json` shape with tests.
- [ ] Create a sanitized local demo fixture that requires no private connector and makes video capture deterministic.
- [ ] Create a bounded live operator path on sample sources for recording the real demo seam.

### 6. Capture

- [ ] Ingest files, URLs, and sanitized meeting material.
- [ ] Normalize local and connected-app/MCP sources for grounded `search`/`fetch` retrieval.
- [ ] Link the ChatGPT task/account to the Workshop and persist native typed/voice turns; implement the Realtime fallback only if required by the live spike.
- [ ] Extract candidate goals, audience, claims, constraints, and unresolved questions.
- [ ] Preserve claim-level evidence locators and source permissions.

### 7. Shape

- [ ] Generate the typed semantic graph from the transcript and sources.
- [ ] Render and synchronize Excalidraw Map view.
- [ ] Support typed, undoable user and AI graph operations.
- [ ] Generate Sketch view from an approved graph version.
- [ ] Produce and approve `FRAME.md` plus its executable representation.

### 8. Style

- [ ] Create Brand Foundation from a public website URL.
- [ ] Support manual logos, exact hex values, licensed fonts, references, and negative rules.
- [ ] Create at least one professional Intent Profile.
- [ ] Create, preview, approve, and version Visual DNA.
- [ ] Produce inspectable `DESIGN.md` plus machine-readable tokens.

### 9. Deliver

- [ ] Generate an asset plan from the approved graph, brief, evidence, and style versions.
- [ ] Generate a source-traceable presentation.
- [ ] Generate a source-traceable infographic.
- [ ] Generate and evaluate a coherent GPT Image 2 batch.
- [ ] Generate an editable, panel-level storyboard.
- [x] Block video enqueueing until the current storyboard approval is persisted; worker execution remains pending.
- [x] Render the sanitized approved storyboard through the local HyperFrames worker path with disclosed fixture narration and verified MP4 streams.
- [ ] Propagate upstream changes into accurate downstream stale states.

### 10. Meta-demo, provenance, and submission

- [ ] Build the “How this was built” provenance surface from dated build evidence.
- [ ] Instrument and display time from first transcript segment to first rendered output.
- [ ] Produce the Devpost description, README narrative, deck, thumbnails, storyboard, narration, and video as one traced WorkshopLM Output set.
- [ ] Include real UI evidence and the raw-transcript reveal.
- [ ] Make the public video the canonical judge path: show the live seam, one plugin widget moment, both approval gates, editable control, provenance, and the raw brainstorm → finished submission reveal in under three minutes.
- [ ] Keep all judge-facing claims proportional to captured evidence.
- [ ] Produce a public YouTube demo under three minutes with clear audio.
- [ ] Complete repository, README, Codex collaboration, GPT-5.6, judge-access, and Devpost materials.

### 11. Daily acceptance and completion verification

- [x] Add a recorded-fixture mode to `pnpm demo:e2e` for repeatable demo diagnosis, with live-provider checks kept separate.
- [ ] Maintain and log the end-to-end acceptance path daily once the first vertical slice exists.
- [ ] Verify the full Capture → Shape → Deliver flow in the live application.
- [ ] Verify realistic desktop, tablet, and mobile behavior.
- [ ] Verify schema, gate, graph, grounding, rendering, and integration tests.
- [ ] Verify failure recovery and partial-package behavior.
- [ ] Verify all submitted links, the repeatable recording setup, and the optional inspection instructions in a fresh ChatGPT/Codex in-app browser session.
- [ ] Audit every objective requirement against direct evidence before marking the goal complete.

## Current evidence

- [Public GitHub repository](https://github.com/daniel-p-green/OAI-Build-Week-2026)
- [WorkshopLM interface design system](DESIGN.md)
- [Product opportunity](research/product-opportunity.md)
- [Workflow map](research/workflow-map.md)
- [NotebookLM live user-flow map](research/notebooklm-user-flow.md)
- [Interface direction](research/interface-direction.md)
- [Engineering direction](research/engineering-direction.md)
- [OpenAI architecture](research/openai-architecture.md)
- [Unified ChatGPT/Codex plugin architecture](research/unified-plugin-architecture.md)
- [Codex app-server account/session boundary](research/codex-app-server-auth.md)
- [Whiteboard and production research](research/whiteboard-storyboard-production.md)
- [Naming and mission](research/naming-and-mission.md)
- [Hackathon reference](research/hackathon/README.md)
- [Submission checklist](research/hackathon/SUBMISSION-CHECKLIST.md)
- [Execution runbook](PLAN-2026-07-13.md)
- [Foundation and spike implementation plan](docs/superpowers/plans/2026-07-13-foundation-and-integration-spikes.md)
- [Build log](log.md)

## Explicit non-goals

- Education or student workflows.
- A general-purpose Canva replacement.
- A second independent whiteboard engine.
- Every possible connector or export format.
- Autonomous publishing to public channels.
- Hosted multi-user deployment, accounts, and cloud storage for the hackathon demo.
- Video generation that bypasses storyboard approval.
- Claims of perfect image consistency, zero iteration, or production readiness without proof.

## Updating this file

- Update `Last updated`, `Status`, and the relevant checkboxes after meaningful progress.
- Check an item only when the referenced file, command, runtime, test, or external surface proves it.
- Keep future work unchecked even when its design is documented.
- Put detailed historical evidence in `log.md`; keep this file focused on current truth and remaining work.
- If scope changes, update the objective, locked decisions, progress checklist, and non-goals together.
