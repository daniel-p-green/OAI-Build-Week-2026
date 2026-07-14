# WorkshopLM Goal

Last updated: 2026-07-13 21:23 CT

## Status

**Active phase:** Technical specification review  
**Implementation:** Not started  
**Current gate:** Review and approve the formal technical design. It consolidates the Workshop shell, Studio vocabulary, approval behavior, architecture, data flow, failure handling, responsive/accessibility behavior, and verification strategy. Implementation planning begins only after that review.

## Objective

Design, build, and verify a hackathon-ready professional thought-to-delivery product for OpenAI Build Week in a pnpm/Turborepo monorepo.

First finish and obtain approval for the product design, technical specification, and implementation plan. Then deliver one exceptionally intuitive **Capture → Shape → Deliver** happy path:

1. Grounded sources and a Realtime voice conversation become an editable semantic Excalidraw whiteboard.
2. The approved board, together with a website-derived or manually configured Style Library and Intent Profile, becomes the executable brief.
3. The brief produces a source-traceable presentation, infographic, visually coherent GPT Image 2 batch, and editable storyboard.
4. Only an approved storyboard may render a narrated HyperFrames video.

Preserve citations, exact brand rules, dependency-aware versions, and stale-state propagation across every artifact. Use WorkshopLM to create its own truthful hackathon demo package and final meta-demo video. Target **Work & Productivity**. Keep Education/Learning mode, general-purpose Canva scope, and unsupported production claims out of scope.

Completion requires verification of the live product, responsive UX, core tests, OpenAI integration behavior, and judge-facing submission artifacts against the current research and hackathon rules.

## Product identity

- **Name:** WorkshopLM
- **Tagline:** Turn raw thinking into finished work.
- **Internal thesis:** NotebookLM, but better for professional production and built with OpenAI.
- **Judge-facing shorthand:** WorkshopLM is NotebookLM for finished work—built on the OpenAI API.
- **Track:** Work & Productivity

The NotebookLM association is intentional category shorthand for hackathon judging. WorkshopLM must not imply affiliation with Google or present itself as an official OpenAI product.

## Locked decisions

- Professional and team workflows only; Education/Learning mode is removed.
- One focused Capture → Shape → Deliver experience rather than separate work and education products.
- TypeScript monorepo using pnpm workspaces and Turborepo.
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
- Preserve NotebookLM's familiar three-panel shell: Sources on the left, Conversation/Map in the center, and Studio on the right.
- The center workspace switches between Conversation and Map without leaving the Workshop; the same text/Realtime composer remains available.
- Deliver is a Studio of output types over one shared grounded Workshop core, not a mandatory fixed package.
- `Production Kit` is rejected as the output label.
- Pipecat is deferred from the MVP; retain an adapter seam and revisit only for telephony, provider switching, or server-side audio pipelines.
- OpenAI project reasoning and structured operations use the Responses API with `gpt-5.6`.
- Project RAG uses Files, per-project vector stores, and the Responses `file_search` tool with inspectable results and durable citation edges.
- Live browser voice uses `gpt-realtime-2.1` over WebRTC with server-minted ephemeral client secrets; standard API keys remain server-only.
- Narration uses `gpt-4o-mini-tts`, stores panel-level provenance, and clearly discloses that the voice is AI-generated.
- Batch image generation uses the direct Image API with `gpt-image-2`; conversational image edits may use the Responses image-generation tool.
- `Notedex`, `Notex`, and `ChatGPT Notes` are rejected names.

## Recommended defaults awaiting approval

These are the remaining product-level decisions that materially change the demo or user promise:

1. **Interface vocabulary:** **Studio** is the creation area, an **Output type** is a guided creation path, an **Output** is one artifact, and an **Output set** is any user-selected group generated from the same approved state.
2. **Explicit approval gates:** approve the whiteboard as the brief, then approve the storyboard before video. Style selection is an inline review rather than another blocking gate.
3. **Judge path:** one-click sanitized sample project with no login or private connectors required.

Until approved, these are recommendations rather than locked decisions.

## Engineering decisions delegated after product approval

The implementation specification may select and justify these without separate founder decisions, subject to final spec review:

- monorepo package boundaries and canonical schemas;
- database, object storage, and durable-job provider;
- renderer libraries and export implementation;
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

- [x] Approve the canonical semantic graph.
- [x] Approve Map and Sketch as two views over one graph.
- [x] Approve Workshop as the user-facing top-level container.
- [ ] Approve system architecture and component boundaries.
- [ ] Approve end-to-end UX and data flow.
- [ ] Approve versioning, stale-state propagation, and approval behavior.
- [ ] Approve failure, retry, cancellation, and partial-success behavior.
- [ ] Approve responsive and accessibility behavior.
- [ ] Approve verification strategy and judge-test path.
- [x] Approve the meta-demo scenario in which WorkshopLM creates its own submission assets and video.
- [ ] Approve Studio / Output type / Output as the replacement for the rejected fixed package label.
- [ ] Resolve how many approval moments the three-minute demo exposes.

### 3. Specification and implementation plan

- [x] Write the proposed design to `docs/superpowers/specs/`.
- [x] Self-review the specification for placeholders, contradictions, ambiguity, and excessive scope.
- [ ] Obtain user review of the written specification.
- [ ] Write the detailed implementation plan.

### 4. Repository and platform foundation

- [x] Initialize Git and preserve dated Build Week commits.
- [ ] Scaffold the pnpm/Turborepo monorepo.
- [ ] Create `apps/web`, `apps/worker`, and focused shared packages.
- [ ] Establish environment validation, linting, type checking, tests, and deterministic local setup.
- [ ] Select and configure the minimum database, object storage, and durable-job infrastructure.
- [ ] Create a sanitized judge fixture that requires no private connector.

### 5. Capture

- [ ] Ingest files, URLs, and sanitized meeting material.
- [ ] Index sources for grounded retrieval.
- [ ] Implement Realtime voice with visible session states and transcript persistence.
- [ ] Extract candidate goals, audience, claims, constraints, and unresolved questions.
- [ ] Preserve claim-level evidence locators and source permissions.

### 6. Shape

- [ ] Generate the typed semantic graph from the transcript and sources.
- [ ] Render and synchronize Excalidraw Map view.
- [ ] Support typed, undoable user and AI graph operations.
- [ ] Generate Sketch view from an approved graph version.
- [ ] Produce and approve `FRAME.md` plus its executable representation.

### 7. Style

- [ ] Create Brand Foundation from a public website URL.
- [ ] Support manual logos, exact hex values, licensed fonts, references, and negative rules.
- [ ] Create at least one professional Intent Profile.
- [ ] Create, preview, approve, and version Visual DNA.
- [ ] Produce inspectable `DESIGN.md` plus machine-readable tokens.

### 8. Deliver

- [ ] Generate an asset plan from the approved graph, brief, evidence, and style versions.
- [ ] Generate a source-traceable presentation.
- [ ] Generate a source-traceable infographic.
- [ ] Generate and evaluate a coherent GPT Image 2 batch.
- [ ] Generate an editable, panel-level storyboard.
- [ ] Block video rendering until the storyboard is approved and current.
- [ ] Render narrated video through HyperFrames from the approved storyboard.
- [ ] Propagate upstream changes into accurate downstream stale states.

### 9. Meta-demo and submission

- [ ] Capture the original raw voice brainstorm.
- [ ] Produce the demo deck, infographic, storyboard, images, narration, and video through WorkshopLM.
- [ ] Include real UI evidence and the raw-transcript reveal.
- [ ] Keep all judge-facing claims proportional to captured evidence.
- [ ] Produce a public YouTube demo under three minutes with clear audio.
- [ ] Complete repository, README, Codex collaboration, GPT-5.6, judge-access, and Devpost materials.

### 10. Completion verification

- [ ] Verify the full Capture → Shape → Deliver flow in the live application.
- [ ] Verify realistic desktop, tablet, and mobile behavior.
- [ ] Verify schema, state-machine, graph, grounding, rendering, and integration tests.
- [ ] Verify failure recovery and partial-package behavior.
- [ ] Verify all submitted links and judge access in a logged-out browser session.
- [ ] Audit every objective requirement against direct evidence before marking the goal complete.

## Current evidence

- [Product opportunity](research/product-opportunity.md)
- [Workflow map](research/workflow-map.md)
- [NotebookLM live user-flow map](research/notebooklm-user-flow.md)
- [Interface direction](research/interface-direction.md)
- [Engineering direction](research/engineering-direction.md)
- [OpenAI architecture](research/openai-architecture.md)
- [Whiteboard and production research](research/whiteboard-storyboard-production.md)
- [Naming and mission](research/naming-and-mission.md)
- [Hackathon reference](research/hackathon/README.md)
- [Submission checklist](research/hackathon/SUBMISSION-CHECKLIST.md)
- [Build log](log.md)

## Explicit non-goals

- Education or student workflows.
- A general-purpose Canva replacement.
- A second independent whiteboard engine.
- Every possible connector or export format.
- Autonomous publishing to public channels.
- Video generation that bypasses storyboard approval.
- Claims of perfect image consistency, zero iteration, or production readiness without proof.

## Updating this file

- Update `Last updated`, `Status`, and the relevant checkboxes after meaningful progress.
- Check an item only when the referenced file, command, runtime, test, or external surface proves it.
- Keep future work unchecked even when its design is documented.
- Put detailed historical evidence in `log.md`; keep this file focused on current truth and remaining work.
- If scope changes, update the objective, locked decisions, progress checklist, and non-goals together.
