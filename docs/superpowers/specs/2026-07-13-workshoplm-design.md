# WorkshopLM technical design

Status: approved and execution-reconciled
Date: 2026-07-13
Owner: WorkshopLM Build Week team

## 1. Decision summary

WorkshopLM is a professional, source-grounded workspace that turns messy thinking into finished work. It keeps the familiar NotebookLM interaction model—one durable container, scoped Sources, central conversation, and a Studio of durable outputs—then adds the professional production controls that NotebookLM does not make central.

The user-facing unit is a **Workshop**. A Workshop contains its sources, live/text conversation, semantic Map, approved brief, style system, output history, and dependency state.

The core information architecture spans the native ChatGPT task and one local visual workspace:

```text
ChatGPT Work / Codex task
└── Conversation: text + native voice + WorkshopLM skill/tools
    ↕ shared Workshop commands
In-app browser
└── Workshop: Sources | Map/artifact workspace | Studio
```

The MVP proves one high-quality path:

```text
Native ChatGPT conversation/voice + grounded local sources
  → editable semantic Map
  → approved FRAME.md
  → reviewed DESIGN.md + Intent Profile + Visual DNA
  → deck + infographic + coherent image batch + editable storyboard
  → approved storyboard
  → narrated HyperFrames demo video
```

The demo is meta: WorkshopLM creates the material used to demonstrate WorkshopLM.

Execution is autonomous within the locked product boundaries. Routine implementation, compatible contract evolution, and evidence-backed fallback activation belong to the primary integrator; the user is not a standing approval dependency.

WorkshopLM's distributable product shape is a unified ChatGPT/Codex plugin. The plugin packages repeatable workflow skills, a local MCP server, compact review widgets, and optional source-app dependencies. It does not collapse the product into chat: the full Map, storyboard, batch review, and Studio remain in the local browser workspace.

## 2. Product boundaries

### In scope

- Work & Productivity users: product marketers, founders, strategists, consultants, and communications leads.
- One durable Workshop that supports voice, text, files, URLs, and sanitized meeting material.
- Claim-level source grounding and citations that survive into downstream artifacts.
- A canonical semantic graph rendered as editable Excalidraw Map and regenerable Sketch.
- Website/manual style setup that creates inspectable `DESIGN.md`, an Intent Profile, and versioned Visual DNA.
- Branded deck, infographic, coherent image batch, storyboard, narration, and final video.
- Explicit approvals, stale-state propagation, recoverable jobs, and a privacy-safe judge fixture.
- A local-first single-user demo runtime with durable local data and no hosting or account requirement.

### Out of scope

- Education workflows or a separate learning mode.
- A full Canva-like general design editor.
- Every possible connector, asset type, or publishing target.
- Autonomous public publishing.
- Video generation before a current storyboard is approved.
- Claims of perfect image coherence, zero human review, or production reliability without evidence.

## 3. User experience

The exact visual system, desktop composition, responsive behavior, and demo states are locked in the repository root `DESIGN.md`. This specification owns behavior and architecture; `DESIGN.md` owns visual execution.

### Workshops library

The library is intentionally recognizable to NotebookLM users. It presents Workshops as cards/list rows with title, active Intent Profile, source count, output count, collaborator state, last activity, and stale/attention state. `New Workshop` is the only primary action.

### Unified ChatGPT + Workshop shell

ChatGPT itself is the Conversation layer. WorkshopLM does not render a second chat thread or composer. The local browser workspace is a stable three-panel visual production surface:

| Area | Responsibility | Primary controls |
| --- | --- | --- |
| Sources, left | Ingested material, connectors, source grouping, selection, and citation viewer | add source, filter, select/deselect, inspect source, connector state |
| Center | The dominant visual work surface | Map editing, FRAME.md/DESIGN.md review, storyboard/output focus, approvals, undo/redo |
| Studio, right | output types, generation queue, output history, status, and focused output inspector | create output, open, approve, regenerate, inspect trace |

The WorkshopLM plugin connects the current ChatGPT task to a local Workshop and opens this application in the ChatGPT/Codex in-app browser. The ChatGPT conversation remains the place to talk, type, clarify, and invoke work; the browser remains the place to see, manipulate, approve, and inspect it.

Panels can collapse. A compact `Continue in ChatGPT` control returns focus to the native conversation, but the browser does not duplicate its composer.

### Capture

The user talks or types in the native ChatGPT task before an idea disappears. The plugin links that task to a Workshop and persists attributable user/assistant turns as the capture record. It extracts goals, audience, claims, constraints, deliverables, and unresolved questions, but never promotes an inference to a verified claim silently.

Source paths:

- Native ChatGPT voice and typed turns; narrow Realtime capture fallback only if durable host synchronization is unavailable.
- PDFs/documents and manual uploads.
- User-selected URLs/websites.
- Sanitized meeting notes or Granola material when authorized.
- Existing ChatGPT Work/Codex apps and MCP servers through standard `search`/`fetch` results when the user already has access.
- Authorized YouTube transcript/metadata as a later adapter.

Every source path normalizes into the same `Source` and `EvidenceChunk` contract. Connector/app identity, source URL/object ID, permission boundary, and native locator remain attached so downstream citations do not lose origin.

### Shape

The ChatGPT conversation can suggest typed graph operations through WorkshopLM tools; it may never mutate the graph directly with free-form model output. Map is the editable Excalidraw representation of the semantic graph. Users can move, resize, connect, merge, split, edit, lock, and delete nodes. Map edits become typed graph operations and are undoable.

Every Map node communicates at least one of: source evidence, claim state, priority, confidence, unresolved status, or downstream dependency. Selecting a citation opens its source and highlighted locator without losing context.

`Approve as brief` is the first production gate. It freezes a graph version, generates an inspectable `FRAME.md` plus an executable JSON representation, and creates a preview of the affected downstream outputs.

Sketch is a polished hand-drawn output generated from an approved Map version. It is not a second editing engine. Any content change returns through a graph operation; the old Sketch becomes stale.

### Style

Style has three layers:

1. **Brand Foundation** — exact brand facts extracted from a user-selected website or entered manually: logos, color roles, licensed fonts, visual references, layout rules, voice, motion, and negative constraints.
2. **Intent Profile** — a saved professional use case that changes the complete aesthetic system. The MVP provides `Client-facing pitch` and supports creation of `Board deck` or `Internal workshop` later.
3. **Visual DNA** — a project-specific, versioned art direction with approved reference anchors, palette, lighting, composition, texture, camera/illustration rules, and negative constraints.

Website extraction is reviewable, never automatic truth. The user can correct every finding before saving `DESIGN.md` and the machine-readable token record.

### Deliver — Studio and output types

Studio is an output history, not a blank generator. It shows durable outputs with a type, title, status, source/brief/style versions, and relevant controls.

MVP output types:

- Presentation.
- Infographic.
- Coherent image batch.
- Storyboard.
- Narrated HyperFrames video.

The Workshop also supports Map/Sketch as output objects. Audio overview and Site packaging are adapter-ready but not required to prove the MVP.

An **Output set** is any user-selected set of outputs generated from the same approved graph, brief, evidence, and style state. It replaces the rejected fixed-package concept.

### Production and review behavior

- The board must be current and explicitly approved before a brief is used for production.
- Selecting an Intent Profile is an inline review, not a separate blocking approval.
- Visual DNA must be locked before a coherent image batch starts.
- A storyboard is required before any video render starts.
- The user may regenerate one image or storyboard panel without rerunning unrelated outputs.
- Public/exportable outputs cannot silently include private evidence.

## 4. Canonical model and versioning

The canonical semantic graph is the system of record. Renderers, chat, voice, and Excalidraw consume and emit typed operations against it; none owns independent content truth.

### Core records

| Record | Purpose |
| --- | --- |
| `Workshop` | top-level user container and current state pointers |
| `Source` | immutable source metadata, origin, permissions, hash, locators, and indexing state |
| `TranscriptSegment` | timestamped, acknowledged text/audio segment |
| `Claim` | claim text, evidence links, state, approval, and provenance |
| `IdeaNode` / `IdeaEdge` | semantic Map graph and dependency relationships |
| `BoardSceneMapping` | node-to-Excalidraw element mapping; coordinates are presentation, not truth |
| `FrameBrief` | approved `FRAME.md` and executable brief JSON |
| `BrandFoundation` / `IntentProfile` / `VisualDnaVersion` | the style system and its revisions |
| `Output` / `ArtifactVersion` | a renderable artifact and immutable generated version |
| `Storyboard` / `StoryboardPanel` | editable scene plan and panel-level approvals |
| `GenerationJob` | durable work, status, retry metadata, and causal version inputs |
| `DependencyEdge` | upstream-to-downstream relationship used for stale propagation |

### Evidence states

- `verified`: directly supported by selected source evidence.
- `derived`: calculation or inference whose method is available.
- `creative`: non-factual messaging or visual invention.
- `unverified`: requires a user decision before publication.

Every claim, artifact block, narration segment, and storyboard panel retains IDs rather than copied citation text. Citation rendering is a view over evidence edges.

### Version and stale rules

Each artifact version records its exact input versions: graph, brief, source selection, claim set, Brand Foundation, Intent Profile, Visual DNA, prompt/instructions, model, and renderer settings.

When an upstream input changes, WorkshopLM computes its transitive downstream dependencies and marks only affected objects `stale`. It never silently overwrites an approved or rendered artifact. Users see a propagation preview and can regenerate, selectively patch, or explicitly accept the stale version where allowed.

Examples:

- changing a claim used by slide 4 marks slide 4, its infographic block, and affected storyboard panels stale;
- changing Visual DNA marks generated images and dependent storyboard panels stale, but not factual claims;
- moving a Map card without changing graph meaning does not stale downstream outputs;
- changing narrative priority does stale the brief and every output that consumes its narrative order.

## 5. Gates, job states, and failure behavior

### Workshop gates

Workshop progress is not one linear lifecycle. It is a set of independently derived gates over versioned objects:

- `transcript_ready`
- `board_approved`
- `brief_ready`
- `style_locked`
- `storyboard_approved`
- `video_rendered`

Commands derive eligibility from these gates and the current input versions. Users can return to Capture, Shape, Style, or Studio without “moving the Workshop backward.” Only two gates require explicit blocking user approval: Map-as-brief and storyboard-before-video. Style locking is inline review.

`stale` is an overlay on an individual graph, brief, style, storyboard, or output version, not a destructive reset of the Workshop. A gate may remain historically achieved while a command rejects a now-stale input version.

### Job states

`queued → running → succeeded | failed | cancelled | retrying`

Jobs are idempotent by a versioned input key. An image-panel failure does not invalidate an already completed deck. Video render cannot start until its input storyboard version is current and `approved`.

### Recovery rules

- Retriable provider/network errors use bounded exponential backoff and expose a retry action.
- Non-retriable validation errors identify the exact missing/invalid input.
- Cancellation retains completed immutable artifacts and cancels only queued/running dependent work.
- ChatGPT task synchronization is idempotent across adapter restart. If the Realtime fallback is activated, disconnection retains server-acknowledged transcript segments and displays a reconnect affordance.
- No model/tool error is turned into a successful-looking final output.

## 6. Architecture

### Repository

Use a TypeScript pnpm/Turborepo monorepo.

```text
apps/
  web/                  Next.js UI, route handlers, local product API
  worker/               durable ingestion, generation, evaluations, render jobs
packages/
  domain/               Zod schemas, IDs, gates, graph/dependency logic
  ai/                   OpenAI adapters and deterministic test doubles
  host/                 Codex app-server account/task bridge and safe browser DTOs
  plugin-mcp/           local stdio tools/resources shared by Work and Codex
  production/           deck, infographic, storyboard, narration, HyperFrames builders
  ui/                   shadcn compositions and shared application components
  config/               TypeScript, lint, test, and build configuration
.codex-plugin/
  plugin.json           unified plugin metadata and interface
.mcp.json               bundled local stdio MCP server
skills/
  workshoplm/SKILL.md   repeatable Capture → Shape → Deliver guidance
```

No separate API service is required for the MVP. Route handlers own validated local commands; the worker owns long-running side effects; the bundled MCP server invokes the same domain commands rather than duplicating business logic. React components and MCP handlers never call an AI provider directly.

### Unified plugin boundary

The plugin targets both ChatGPT Work and ChatGPT Codex and contains no required connected app for the judge path. A live host-surface spike must record whether the bundled local stdio server is callable from each surface; the design does not assume parity that has not been observed.

- **Skill:** teaches the Workshop workflow, approval gates, grounding rules, and when to open the full workspace.
- **Local MCP tools:** create/list/open a Workshop, add a sanitized source, inspect status/trace, approve the current brief/storyboard, enqueue an output, and render an eligible video.
- **Compact widgets:** status, trace, and output-review summaries only. They do not reproduce Excalidraw or the full storyboard editor.
- **Full workspace:** the local Next.js app in the in-app browser owns Conversation, Map, Style, batch review, and Studio editing.
- **Optional apps:** Granola, Google Drive, and later connectors can supply sources when available. They are never required for the sanitized fixture or core demo.

### Local runtime decisions

- **Database:** one local SQLite database in WAL mode for Workshop metadata, versions, dependency edges, approvals, and durable job rows.
- **Artifact storage:** one workspace-owned local directory for original/sanitized sources, fonts, logos, references, generated images, narration, reports, and videos. Persist relative asset paths and content hashes in SQLite.
- **Queue:** the local worker polls SQLite job rows using leases and idempotency keys. Web and worker may run as separate local processes through one `pnpm dev` command.
- **Account/session:** no separate WorkshopLM account. A server-side adapter connects to the local Codex app server, uses `account/read` for current ChatGPT account state, and may initiate the supported `account/login/start` flow when needed. Codex owns token persistence/refresh; WorkshopLM never receives tokens in browser code or stores them in SQLite.
- **Demo surface:** invoke the WorkshopLM plugin from ChatGPT Work or Codex, link the current task to a Workshop, then open the local Next.js workspace in the in-app browser. Deployment and a separate native wrapper are not required.
- **Judge package:** repository, deterministic setup/reset instructions, sanitized fixture, and public demo video.

### Command boundary

Client actions call typed server commands. Commands validate input, object version, gate eligibility, and approval rules before mutation.

Examples:

- `appendTranscriptSegment`
- `applyGraphOperation`
- `approveBoardVersion`
- `saveBrandFoundation`
- `lockVisualDna`
- `createOutput`
- `approveStoryboardVersion`
- `enqueueVideoRender`

The ChatGPT task or Realtime fallback may request a command, but model-authored arguments never mutate state without the same server validation.

## 7. OpenAI integration

All OpenAI SDK usage lives in `packages/ai` behind narrow adapters.

| Adapter | Model/API | Responsibility |
| --- | --- | --- |
| `createGroundedResponse` | Responses + `gpt-5.6-sol` | synthesis over locally retrieved evidence bundles, questions, typed plan proposals |
| `extractWorkshopGraph` | Responses + `gpt-5.6-sol` | structured claims, nodes, edges, and unresolved items |
| `syncChatGptTask` | Codex app-server protocol | account state, task linkage, durable native conversation turns |
| `createRealtimeClientSecret` | Realtime + `gpt-realtime-2.1` | fallback browser-safe WebRTC capture only if native task/voice synchronization cannot satisfy capture |
| `renderNarrationSegment` | Speech + `gpt-4o-mini-tts` | approved panel narration, default `marin` voice |
| `generateImageBatch` | direct Images + `gpt-image-2` | coherent image batch from Visual DNA and scene specs |
| `editImageConversationally` | Responses image-generation | conversational revision of one selected image |
| `evaluateImageCoherence` | structured model evaluation | palette/lighting/composition/negative-rule scoring |

### Grounding contract

Each Workshop owns a local normalized source corpus. Ingestion parses supported formats locally into deterministic chunks with source ID, content hash, page/section/time locator, and permission state. SQLite FTS5/BM25 plus exact search back standard MCP `search` and `fetch` tools used by ChatGPT Work/Codex and the production worker.

The retrieval layer may generate query variants with GPT-5.6, but retrieval results remain inspectable chunks. Existing connected apps/MCPs may provide remote `search`/`fetch` results; WorkshopLM normalizes them into the same evidence contract. Hosted OpenAI `file_search` can implement the interface later; it is not required for the core demo.

### ChatGPT host and voice contract

1. A server-side adapter connects only to the local Codex app-server control surface.
2. `account/read` provides safe account display state; browser code and SQLite never receive raw ChatGPT tokens.
3. The WorkshopLM plugin links the current ChatGPT task to one Workshop.
4. Native typed and voice-originated turns are persisted with stable task/turn provenance when the host exposes them.
5. If live verification shows native voice turns cannot be durably captured, a narrow fallback requests a short-lived Realtime secret server-side and connects to `gpt-realtime-2.1` over WebRTC. The fallback does not introduce a duplicate chat UI.

### Media contract

- Image prompt payloads include current scene spec, Visual DNA, approved anchors, negative constraints, and source/claim context.
- Batch output is evaluated; outliers alone are regenerated.
- Deterministic text/logo composition happens in renderers rather than inside generated image pixels where possible.
- Narration is rendered only from an approved storyboard panel, stored panel-by-panel, and always disclosed as AI-generated.

## 8. Production renderers

`packages/production` converts a current `artifact.json` into focused, editable deliverables.

### Presentation

Slides use deterministic HTML/CSS layout templates, `DESIGN.md` tokens, approved copy/claims, and image ingredients, exported to PDF/PNG. Each slide block stores claim IDs and output version metadata.

### Infographic

The infographic is a single-page structured composition, not a screenshot of an LLM response. Data labels, numbers, logos, and cited text are deterministic elements; generated imagery is an ingredient.

### Storyboard

Each panel stores purpose, claim IDs, voiceover, on-screen text, duration, composition, ingredients, Visual DNA version, transition, and approval state. Panels can be individually edited and regenerated.

### HyperFrames video

The local HyperFrames CLI receives only a current, approved storyboard and a renderer-safe `DESIGN.md`. It builds a deterministic HTML/GSAP composition, validates it, and renders through local Chrome/FFmpeg. WorkshopLM does not use a HyperFrames API, authentication layer, remote render job, polling loop, or download step. The final video includes synchronized narration, captions, a visible AI-voice disclosure, and traceable artifact metadata. A minimal local FFmpeg panel/caption/audio composition implements the same `renderVideo` contract if HyperFrames fails; Remotion is not a second default stack.

### ChatGPT Sites boundary

Studio may produce a reviewable Site project with grounded content and style tokens. It does not claim autonomous deployment through a public API. Publishing remains an explicit user action in the ChatGPT/Codex Sites surface.

## 9. Responsive and accessible design

- Desktop is the full production environment.
- Tablet supports Capture, source inspection, Map review/editing, approvals, and storyboarding.
- Mobile prioritizes voice capture, transcript/source review, output review, and approvals; it does not imitate a full whiteboard or slide editor.
- Use shadcn component composition and global CSS rather than modifying primitives.
- Meet WCAG AA contrast, visible focus, keyboard navigation, semantic labels, and non-color-only state indicators.
- Every AI mutation supports undo where the underlying operation is reversible.
- Status is always textual as well as visual: `Grounded`, `Derived`, `Creative`, `Unverified`, `Approved`, `Stale`, `Failed`.

## 10. Security, privacy, and judge access

- Treat every imported source as local/private by default and prevent private evidence from entering a shareable export without an explicit sanitized-output action.
- Keep OpenAI standard API keys server-only; use server-minted Realtime ephemeral secrets.
- Never expose connector tokens, unrelated workspace material, or private source content in the demo.
- Persist an audit trail of source ingestion, generation inputs, approvals, output versions, and stale propagation.
- Provide one sanitized sample Workshop that opens locally without a login or connector. It must demonstrate capture evidence, citations, Map, brief, Design, outputs, storyboard gate, and final video state.
- Provide a bounded “run it yourself” path on sanitized sample sources so judges can trigger a fresh brief, deck, image batch, and storyboard without private credentials or connectors.
- Document a clean local setup and reset command that recreates the judge fixture without relying on Daniel's machine state.

## 11. Verification strategy

### Automated

- Zod schema tests for every canonical object, gate derivation, and command transition.
- Fixture tests from transcript/source chunks to claims and semantic graph.
- Referential-integrity tests from claims to artifact blocks and citation locators.
- Dependency/stale propagation tests for graph, claim, and style changes.
- Deterministic renderer snapshots for deck, infographic, storyboard, and HyperFrames handoff.
- Coherence evaluator tests with deliberately mismatched image-batch fixtures.
- Route/command validation and approval-gate tests.
- Browser happy-path tests on the sanitized judge fixture at desktop, tablet, and mobile widths.

### Live verification

- Verify Codex app-server account state, supported login flow, task linkage, typed-turn persistence, and native voice-turn availability without token exposure.
- If activated, verify the Realtime fallback connection, interruption, transcript persistence, and recovery with a project-scoped API key.
- Verify local and connected-app `search`/`fetch` results are inspectable and produce durable citations; compare hosted File Search only if useful.
- Verify actual GPT Image 2 availability, latency, output handling, and selective regeneration.
- Verify narration disclosure and HyperFrames render from a current approved storyboard.
- Verify all submission links and the clean local judge fixture in a fresh browser profile.

## 12. Three-minute meta-demo

1. **Promise (0:00–0:20):** WorkshopLM turns raw professional thinking into finished work.
2. **Capture (0:20–0:45):** show the original messy voice brainstorm and selected sources.
3. **Shape (0:45–1:10):** switch to Map, show citations, make one meaningful change, and approve the brief.
4. **Style (1:10–1:35):** show website-derived `DESIGN.md`, Intent Profile, and locked Visual DNA.
5. **Studio (1:35–2:05):** open deck, infographic, and coherent image batch as one output set.
6. **Control (2:05–2:30):** change one storyboard panel; only then approve video rendering.
7. **Render and reveal (2:30–3:00):** show the final demo and reveal the original transcript → Map → brief → storyboard trace.

The judge-facing claim is **one guided, source-grounded production run**. We will not claim no cleanup, no iteration, or perfect consistency unless captured evidence proves it.

## 13. Acceptance criteria

A first-time professional can:

1. Create/open a Workshop and add/select sources.
2. Speak or type into a visible, reliable composer.
3. See the transcript become an editable, source-grounded Map.
4. Approve the Map and inspect the resulting `FRAME.md`.
5. Create/review a Brand Foundation, Intent Profile, and Visual DNA.
6. Create a deck, infographic, image batch, and storyboard that cite the same evidence and style system.
7. Regenerate a single outlier or storyboard panel without losing completed work.
8. See a video render blocked until the current storyboard is approved.
9. Trace a final artifact back to its claims and original evidence.
10. Open the sanitized judge Workshop locally in the ChatGPT/Codex in-app browser without credentials and understand the meta-demo in under three minutes.

## 14. Deferred decisions

- Hosted multi-user deployment and public web/worker infrastructure.
- Plugin Directory submission and production app authentication; the hackathon proves a locally installed unified plugin package.
- Granola and YouTube live adapters beyond sanitized fixture seams.
- Audio overview and Site project generation after the hero output path is proven.
- Team collaboration and shared-edit conflict resolution beyond a single owner/judge path.
- Pipecat integration unless later requirements introduce telephony, provider switching, or server-side audio orchestration.
