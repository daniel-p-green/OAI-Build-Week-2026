# WorkshopLM technical design

Status: proposed for founder review  
Date: 2026-07-13  
Owner: WorkshopLM Build Week team

## 1. Decision summary

WorkshopLM is a professional, source-grounded workspace that turns messy thinking into finished work. It keeps the familiar NotebookLM interaction model—one durable container, scoped Sources, central conversation, and a Studio of durable outputs—then adds the professional production controls that NotebookLM does not make central.

The user-facing unit is a **Workshop**. A Workshop contains its sources, live/text conversation, semantic Map, approved brief, style system, output history, and dependency state.

The core information architecture is approved:

```text
Workshops library
└── Workshop
    ├── Sources
    ├── Center: Conversation ⇄ Map
    └── Studio: output types + output history
```

The MVP proves one high-quality path:

```text
Voice + grounded sources
  → editable semantic Map
  → approved FRAME.md
  → reviewed DESIGN.md + Intent Profile + Visual DNA
  → deck + infographic + coherent image batch + editable storyboard
  → approved storyboard
  → narrated HyperFrames demo video
```

The demo is meta: WorkshopLM creates the material used to demonstrate WorkshopLM.

## 2. Product boundaries

### In scope

- Work & Productivity users: product marketers, founders, strategists, consultants, and communications leads.
- One durable Workshop that supports voice, text, files, URLs, and sanitized meeting material.
- Claim-level source grounding and citations that survive into downstream artifacts.
- A canonical semantic graph rendered as editable Excalidraw Map and regenerable Sketch.
- Website/manual style setup that creates inspectable `DESIGN.md`, an Intent Profile, and versioned Visual DNA.
- Branded deck, infographic, coherent image batch, storyboard, narration, and final video.
- Explicit approvals, stale-state propagation, recoverable jobs, and a privacy-safe judge fixture.

### Out of scope

- Education workflows or a separate learning mode.
- A full Canva-like general design editor.
- Every possible connector, asset type, or publishing target.
- Autonomous public publishing.
- Video generation before a current storyboard is approved.
- Claims of perfect image coherence, zero human review, or production reliability without evidence.

## 3. User experience

### Workshops library

The library is intentionally recognizable to NotebookLM users. It presents Workshops as cards/list rows with title, active Intent Profile, source count, output count, collaborator state, last activity, and stale/attention state. `New Workshop` is the only primary action.

### Workshop shell

The desktop shell is a stable three-panel layout:

| Area | Responsibility | Primary controls |
| --- | --- | --- |
| Sources, left | Ingested material, connectors, source grouping, selection, and citation viewer | add source, filter, select/deselect, inspect source, connector state |
| Center | The work surface, switched between Conversation and Map | persistent text/voice composer, Map editing, approvals, undo/redo |
| Studio, right | output types, generation queue, output history, status, and focused output inspector | create output, open, approve, regenerate, inspect trace |

Panels can collapse, but no action should push the user into a separate application. The composer persists at the bottom of the center surface and supports text, attachments, and Realtime voice.

### Capture

The user can talk before an idea disappears. The system persists timestamped transcript segments and asks only high-value questions. It extracts goals, audience, claims, constraints, deliverables, and unresolved questions, but never promotes an inference to a verified claim silently.

Source paths:

- Realtime voice and typed notes.
- PDFs/documents and manual uploads.
- User-selected URLs/websites.
- Sanitized meeting notes or Granola material when authorized.
- Authorized YouTube transcript/metadata as a later adapter.

### Shape

Conversation can suggest typed graph operations; it may never mutate the graph directly with free-form model output. Map is the editable Excalidraw representation of the semantic graph. Users can move, resize, connect, merge, split, edit, lock, and delete nodes. Map edits become typed graph operations and are undoable.

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

## 5. State machines and failure behavior

### Workshop lifecycle

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

The Workshop may move backward through typed revisions. `stale` is an overlay state on an individual graph/brief/style/output object, not a destructive reset of the whole Workshop.

### Job states

`queued → running → succeeded | failed | cancelled | retrying`

Jobs are idempotent by a versioned input key. An image-panel failure does not invalidate an already completed deck. Video render cannot start until its input storyboard version is current and `approved`.

### Recovery rules

- Retriable provider/network errors use bounded exponential backoff and expose a retry action.
- Non-retriable validation errors identify the exact missing/invalid input.
- Cancellation retains completed immutable artifacts and cancels only queued/running dependent work.
- Realtime disconnection retains server-acknowledged transcript segments and displays a reconnect affordance.
- No model/tool error is turned into a successful-looking final output.

## 6. Architecture

### Repository

Use a TypeScript pnpm/Turborepo monorepo.

```text
apps/
  web/                  Next.js UI, route handlers, authentication, product API
  worker/               durable ingestion, generation, evaluations, render jobs
packages/
  domain/               Zod schemas, IDs, state machines, graph/dependency logic
  ai/                   OpenAI adapters and deterministic test doubles
  production/           deck, infographic, storyboard, narration, HyperFrames builders
  ui/                   shadcn compositions and shared application components
  config/               TypeScript, lint, test, and build configuration
```

No separate API service is required for the MVP. Route handlers own authenticated commands; the worker owns long-running side effects. React components never call an AI provider directly.

### Infrastructure decisions

- **Postgres:** Supabase Postgres for Workshop metadata, versions, permissions, dependency edges, and durable job rows.
- **Object storage:** Supabase Storage for original/sanitized sources, fonts, logos, references, generated images, narration, and video artifacts.
- **Queue:** Postgres-backed worker polling with row leases and idempotency keys. This avoids a second queue vendor for the hackathon and can later be replaced behind a `JobRepository` interface.
- **Authentication:** Supabase Auth for real workspaces; the judge fixture bypasses private authentication through a read-only sample route with sanitized data.
- **Deployment:** web and worker deploy separately only if required by runtime limits; local development uses a single database and worker process.

### Command boundary

Client actions call typed server commands. Commands validate authentication, permission, object version, state-machine eligibility, and approval gates before mutation.

Examples:

- `appendTranscriptSegment`
- `applyGraphOperation`
- `approveBoardVersion`
- `saveBrandFoundation`
- `lockVisualDna`
- `createOutput`
- `approveStoryboardVersion`
- `enqueueVideoRender`

The Realtime model may request a command, but model-authored arguments never mutate state without the same server validation.

## 7. OpenAI integration

All OpenAI SDK usage lives in `packages/ai` behind narrow adapters.

| Adapter | Model/API | Responsibility |
| --- | --- | --- |
| `createGroundedResponse` | Responses + `gpt-5.6` | source synthesis, questions, typed plan proposals |
| `extractWorkshopGraph` | Responses + `gpt-5.6` | structured claims, nodes, edges, and unresolved items |
| `createRealtimeClientSecret` | Realtime + `gpt-realtime-2.1` | browser-safe short-lived WebRTC session setup |
| `renderNarrationSegment` | Speech + `gpt-4o-mini-tts` | approved panel narration, default `marin` voice |
| `generateImageBatch` | direct Images + `gpt-image-2` | coherent image batch from Visual DNA and scene specs |
| `editImageConversationally` | Responses image-generation | conversational revision of one selected image |
| `evaluateImageCoherence` | structured model evaluation | palette/lighting/composition/negative-rule scoring |

### Grounding contract

Each Workshop owns an OpenAI vector store. Ingestion uploads a sanitized canonical representation to Files, attaches it to that vector store, waits for indexing, and stores the relationship to WorkshopLM `Source` IDs.

Responses retrieval requests `file_search_call.results` for inspection and converts `file_citation` annotations into durable evidence edges. File Search is retrieval, not the canonical evidence store.

### Realtime contract

1. Web client requests a short-lived client secret from the authenticated server.
2. Server creates the Realtime session using the standard API key, which never reaches the browser.
3. Client connects to `gpt-realtime-2.1` over WebRTC.
4. Transcript and tool events are acknowledged and persisted on the server.
5. Voice state is visible: idle, connecting, listening, thinking, speaking, interrupted, failed.

### Media contract

- Image prompt payloads include current scene spec, Visual DNA, approved anchors, negative constraints, and source/claim context.
- Batch output is evaluated; outliers alone are regenerated.
- Deterministic text/logo composition happens in renderers rather than inside generated image pixels where possible.
- Narration is rendered only from an approved storyboard panel, stored panel-by-panel, and always disclosed as AI-generated.

## 8. Production renderers

`packages/production` converts a current `artifact.json` into focused, editable deliverables.

### Presentation

Slides use deterministic layout templates, `DESIGN.md` tokens, approved copy/claims, and image ingredients. Each slide block stores claim IDs and output version metadata.

### Infographic

The infographic is a single-page structured composition, not a screenshot of an LLM response. Data labels, numbers, logos, and cited text are deterministic elements; generated imagery is an ingredient.

### Storyboard

Each panel stores purpose, claim IDs, voiceover, on-screen text, duration, composition, ingredients, Visual DNA version, transition, and approval state. Panels can be individually edited and regenerated.

### HyperFrames video

HyperFrames receives only a current, approved storyboard. It composes scene timing, captions, narration, motion, fonts, colors, assets, and transitions deterministically. The final demo video includes a visible AI-voice disclosure and traceable artifact metadata.

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

- Store source permissions and prevent private evidence from becoming public through an export.
- Keep OpenAI standard API keys server-only; use server-minted Realtime ephemeral secrets.
- Never expose connector tokens, unrelated workspace material, or private source content in the demo.
- Persist an audit trail of source ingestion, generation inputs, approvals, output versions, and stale propagation.
- Provide one sanitized sample Workshop that opens without a login or connector. It must demonstrate capture evidence, citations, Map, brief, Design, outputs, storyboard gate, and final video state.

## 11. Verification strategy

### Automated

- Zod schema tests for every canonical object and state transition.
- Fixture tests from transcript/source chunks to claims and semantic graph.
- Referential-integrity tests from claims to artifact blocks and citation locators.
- Dependency/stale propagation tests for graph, claim, and style changes.
- Deterministic renderer snapshots for deck, infographic, storyboard, and HyperFrames handoff.
- Coherence evaluator tests with deliberately mismatched image-batch fixtures.
- Route/command authorization and approval-gate tests.
- Browser happy-path tests on the sanitized judge fixture at desktop, tablet, and mobile widths.

### Live verification

- Verify Realtime connection, interruption, transcript persistence, and recovery with a project-scoped API key.
- Verify File Search output includes inspectable retrieval and usable citations.
- Verify actual GPT Image 2 availability, latency, output handling, and selective regeneration.
- Verify narration disclosure and HyperFrames render from a current approved storyboard.
- Verify all submission links and the judge fixture in a logged-out browser session.

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
10. Open the sanitized judge Workshop without credentials and understand the meta-demo in under three minutes.

## 14. Deferred decisions

- Exact public deployment host for web and worker.
- Granola and YouTube live adapters beyond sanitized fixture seams.
- Audio overview and Site project generation after the hero output path is proven.
- Team collaboration and shared-edit conflict resolution beyond a single owner/judge path.
- Pipecat integration unless later requirements introduce telephony, provider switching, or server-side audio orchestration.
