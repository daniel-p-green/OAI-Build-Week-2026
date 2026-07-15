# WorkshopLM Goal

Last updated: 2026-07-15 00:40 CT

## Status

**Active phase:** P0 interface simplification, then live demo proof
**Implementation:** Fully authorized for the complete locked WorkshopLM version in this file. Product discovery is closed; execute, verify, and ship.
**Current gate:** The P0 screen-composition and language rebuild plus bounded Realtime capture UI are implemented and pass the full repository checks, recorded demo seam, and final three-width visual suite. The remaining interface completion gates are five independent first-time orientation reviews and provider-backed GPT Image 2 gallery media. The Realtime transport is ready for its first provider-backed microphone turn but is not yet live-verified. Provider media may proceed in isolated files; do not record the final demo until the review gate is complete and any critical navigation finding is repaired.
**Known provider risk:** The configured API key authenticates and can retrieve `gpt-image-2`, `gpt-4o-mini-tts`, `gpt-realtime-2.1`, and the GPT-5.6 variants `gpt-5.6-luna`, `gpt-5.6-terra`, and `gpt-5.6-sol`. The bare `gpt-5.6` endpoint returns `404 model_not_found` for this account even though the current public model page describes it as a Sol alias. The locked runtime uses an operation-level GPT-5.6 routing policy; a spend-gated nine-request Responses benchmark is ready to measure Sol, Terra, and Luna on latency, reported usage, and deterministic quality checks. The benchmark and live grounded-Map adapter now share a tested parser for both top-level and nested Responses text, but no request has run. The current model catalog labels `gpt-4o-mini-tts` deprecated while the current speech guide still recommends it; verify the actual live response before recording. Do not claim live product use or change per-operation defaults before these checks.
**Known host risk:** The July 14 host-sync verification is credential-blocked and the decision deadline has passed, so the capture-only `gpt-realtime-2.1` fallback is the final demo voice path. Native task and voice-turn persistence remain unproven and must not be claimed. The server-minted ephemeral session route, browser WebRTC control, final-transcript reducer, durable Source boundary, and provider event provenance are implemented and tested; one provider-backed microphone turn still must be captured and inspected before recording.

**Hard schedule gates:**

- **July 20, 2026, end of day CT:** feature-complete. No new features merge after this point.
- **July 21, 2026:** verification and submission only. Target submission by 12:00 PM PT, five hours before the 5:00 PM PT deadline.

## Objective

Implement and verify the complete locked WorkshopLM product for OpenAI Build Week in a pnpm/Turborepo monorepo.

Deliver the full WorkshopLM scope through one exceptionally intuitive **Capture → Shape → Deliver** path:

1. Start with a ChatGPT text or voice conversation and select the sources that matter.
2. WorkshopLM turns that material into an editable, source-grounded Map.
3. Approve the Map as the Brief and choose a Style from a website or uploaded brand assets.
4. Create source-traceable Outputs: a presentation, infographic, coherent image set, and editable storyboard.
5. Review and approve the storyboard, then create the narrated local video.

Keep citations, exact brand rules, version history, and clear `Needs update` states throughout the work. Use WorkshopLM to create its own truthful hackathon submission and final meta-demo video. Target **Work & Productivity**. Keep Education/Learning mode, general-purpose design-tool scope, and unsupported production claims out of scope.

Completion requires verification of the live product, responsive UX, core tests, OpenAI integration behavior, and judge-facing submission artifacts against the current research and hackathon rules.

## Definition of fully implemented

This goal is not complete when the architecture, shell, mocks, or isolated model calls exist. It is complete only when one coherent local product demonstrates all of the following:

1. The WorkshopLM plugin opens the visual Workshop in the ChatGPT/Codex in-app browser.
2. ChatGPT text or voice becomes a durable Workshop transcript without adding a second browser chat.
3. Local files, websites, and sanitized meeting notes become searchable Sources with an inspectable path from claim to exact source excerpt.
4. GPT-5.6 turns the conversation and selected Sources into an editable Map with undo, evidence states, and a regenerable Sketch.
5. `Approve brief` creates inspectable `FRAME.md`; a website or manual brand assets create reviewable, versioned `DESIGN.md` and Style data.
6. `Create outputs` produces a source-traceable presentation, infographic, coherent GPT Image 2 image set, editable storyboard, and narrated local HyperFrames video.
7. Storyboard approval, version changes, `Needs update` states, retry, cancel, and partial success work across the real end-to-end path—not only in isolated tests.
8. `How this was built` traces the real submission from raw brainstorm through Sources, Map, Brief, Style, Outputs, build evidence, and measured time to first output.
9. The public demo video is under three minutes and shows the real flow clearly enough that judges do not need to install the local plugin.
10. The repository passes the documented checks, the live demo is recorded from the intended surface, and every judge-facing claim matches captured evidence.
11. Every judge-visible control and container comes from the verified Apps in ChatGPT inventory or a documented WorkshopLM composite made only from those primitives. A first-time professional can identify the current object, source scope, and next action within five seconds, without seeing internal file names, IDs, implementation terms, or duplicate controls.

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

## Locked interface contract

WorkshopLM borrows NotebookLM's strongest orientation patterns, then expresses them with the official Apps in ChatGPT design system:

1. **One Workshop, one current object.** The header always names the Workshop and the open object: Map, Brief, Outputs, Storyboard, or a selected Output.
2. **Sources stay one click away.** The same `{n} sources` control opens the source list everywhere. Selecting a citation opens the exact excerpt and locator, and closing it returns focus to the originating claim.
3. **The work owns the screen.** There are no persistent workflow tabs, three-column dashboard, duplicate chat, generic inspector, or always-open output rail. Drawers and sheets appear only when needed.
4. **One obvious next action.** Each screen has at most one visually dominant action. The two blocking actions are `Approve brief` and `Approve storyboard`; video creation comes only after storyboard approval.
5. **Outputs look like work, not records.** Every Output has a recognizable name, real preview, source coverage, freshness, and one obvious open action. Creation controls never compete with the Output history.
6. **Progressive disclosure is structural.** The default screen shows the current work, its source count, and the next action. Style settings, evidence, versions, source management, technical details, and secondary actions open only when requested or when they block progress.
7. **Status earns its space.** Show a state only when it changes what the user can or should do. Do not repeat `Approved`, `Up to date`, source counts, or version labels across the header, body, and cards.
8. **The product renders work, not source files.** Brief and Style are readable product views. `FRAME.md`, `DESIGN.md`, raw Markdown syntax, artifact paths, model names, IDs, hashes, and version mechanics remain available only under technical Details or export.

`Apps in ChatGPT · OpenAI Official (Community)` is the only source for product chrome. Use verified primitives, variables, text styles, effects, icons, spacing, and display-mode templates from the recorded Figma inventory. If a needed pattern is absent, build a named WorkshopLM composite from those primitives and document its recipe before implementation. Never invent a parallel button, card, field, sheet, token, icon, type, radius, shadow, or interaction system. Custom visuals are allowed only for WorkshopLM's work itself: Map geometry, evidence paths, generated media, charts, slide previews, image tiles, and storyboard frames.

All primary language is plain, professional, and action-first. Object names are `Workshop`, `Sources`, `Map`, `Brief`, `Style`, `Outputs`, `Storyboard`, and `Video`. Primary actions are `Add source`, `Record voice`, `Add transcript`, `Show source`, `Show on map`, `Approve brief`, `Choose style`, `Create outputs`, `Approve storyboard`, and `Create video`. Supporting actions may use `Back`, `Close`, `Edit`, `Save`, `Retry`, `Cancel`, and `Open`. States are limited to `Draft`, `Ready for review`, `Approved`, `In progress`, `Ready`, `Needs update`, and `Couldn't create`. Technical terms such as gate, contract, package, artifact, provenance, render, Visual DNA, model ID, version ID, `FRAME.md`, and `DESIGN.md` appear only in technical Details or exported files.

## Locked decisions

- Professional and team workflows only; Education/Learning mode is removed.
- One focused Capture → Shape → Deliver experience rather than separate work and education products.
- TypeScript monorepo using pnpm workspaces and Turborepo.
- The hackathon demo is local-first and does not require hosting, a separate WorkshopLM account system, Supabase, cloud object storage, or a remote worker.
- Local persistence uses SQLite in WAL mode for Workshop metadata/jobs and a workspace-owned filesystem directory for sources and generated artifacts.
- Original source files and normalized representations remain in the local Workshop data directory for the core demo. Hosted indexing may be added later, but source grounding does not depend on upload.
- The only required network dependency for the core demo is the OpenAI API; HyperFrames and output rendering run locally.
- The ChatGPT task is WorkshopLM's Conversation layer: native text/voice, reasoning, clarification, and plugin invocation.
- The local web app in the ChatGPT/Codex in-app browser is WorkshopLM's visual layer: Sources, Map, Brief/Style, Outputs, Storyboard, and source trace. It contains no duplicate chat composer.
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
- Preserve NotebookLM's familiar Sources → central work → Outputs mental model across two native surfaces, but remove permanent destination navigation: ChatGPT owns Conversation; the in-app browser renders one current Workshop object with contextual Sources, creation, and evidence sheets.
- Preserve the layout lessons visible in the NotebookLM reference screenshots: the Workshop identity stays fixed, Sources always open from the same place, the current work object owns the center, Outputs remain a durable history of recognizable objects, and citation selection reveals the exact source without changing products. Adapt these patterns to professional production rather than copying Google's chrome, terminology, three-column proportions, or education framing.
- Product language is plain, professional, and action-first. Prefer familiar nouns (`Sources`, `Map`, `Brief`, `Outputs`, `Storyboard`, `Video`) and short verb–noun actions (`Add source`, `Approve brief`, `Create outputs`, `Show source`, `Create video`). Internal nouns such as gate, contract, package, artifact, provenance, render, Visual DNA, and version identifiers stay out of primary labels unless the user opens technical Details.
- Deliver is the durable Outputs history over one shared grounded Workshop core, not a mandatory fixed package.
- `Production Kit` is rejected as the output label.
- Pipecat is deferred from the MVP; retain an adapter seam and revisit only for telephony, provider switching, or server-side audio pipelines.
- OpenAI project reasoning and structured operations use the Responses API with the GPT-5.6 routing policy: `gpt-5.6-sol` for quality-critical reasoning, `gpt-5.6-terra` for balanced structured work, and `gpt-5.6-luna` for repeatable high-volume work. Per-operation defaults may change only with recorded quality, latency, and cost evidence.
- Project grounding uses local parsing, deterministic chunks/locators, SQLite FTS5/BM25, exact text search, and standard plugin `search`/`fetch` tools. GPT-5.6 receives retrieved evidence bundles and may not mark a factual claim `verified` without durable claim→chunk→source edges. Hosted OpenAI `file_search` is an optional adapter/comparison, not a requirement.
- Native ChatGPT voice is the primary capture path. A live spike must prove durable thread/voice-turn synchronization into WorkshopLM. If the host cannot expose the needed durable capture, fall back to a narrow `gpt-realtime-2.1` WebRTC capture surface; standard API keys remain server-only.
- Spike A has a hard decision deadline of July 14 end of day CT. If native voice-turn synchronization is not proven by then, activate the Realtime fallback as a capture-only task control. It is visually distinct from a composer and does not duplicate ChatGPT conversation.
- Narration uses `gpt-4o-mini-tts`, stores panel-level provenance, and clearly discloses that the voice is AI-generated.
- Batch image generation uses the direct Image API with `gpt-image-2`; conversational image edits may use the Responses image-generation tool.
- `Notedex`, `Notex`, and `ChatGPT Notes` are rejected names.
- **Outputs** is the user-facing creation and history area; an **Output type** is a guided creation path; an **Output** is one professional deliverable; an **Output set** is a user-selected group created from the same approved state. `Studio` may remain an internal research comparison but is not a WorkshopLM navigation label.
- Exactly two blocking approval gates exist: approve the Map as the brief, then approve the storyboard before video. Style selection is inline review, not a third gate.
- The demo path includes a one-click sanitized sample Workshop with no private connector, plus a bounded live operator run on sample sources for recording and optional inspection.
- The public demo video is the primary judge experience and must prove the live thought-to-delivery seam clearly. The sanitized fixture makes recording repeatable and supports optional inspection without requiring judges to supply or spend their own API credits.
- The submission is a local plugin/developer-tool experience. Provide concise installation instructions and the verified supported platform, but do not divert implementation time into making judges recreate the full local stack. The verified Spike E surface controls the README, Devpost, and video platform claim.
- Workshop progress is represented by independent gate flags rather than one linear lifecycle: `transcript_ready`, `board_approved`, `brief_ready`, `style_locked`, `storyboard_approved`, and `video_rendered`. Staleness remains a per-object overlay.
- Five live integration spikes gate only the provider- or host-dependent implementation they inform: native ChatGPT task/account/voice synchronization (with Realtime fallback), local plugin search/fetch grounding (with optional File Search comparison), GPT Image 2 batching, local HyperFrames rendering, and unified-plugin loading across the available Work/Codex surfaces. Monorepo foundation, domain work, deterministic adapters, GUI shell, and fixture work proceed in parallel.
- The GUI is the flagship product proof. Plugin widgets remain compact doorways; they never duplicate the Map, Outputs, Storyboard editor, or asset browser.
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
- [x] Research the installed ChatGPT/Codex plugin landscape and lock the use-now, source-adapter, reference, fallback, and stretch boundaries in `research/plugins/README.md`.

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
- [x] Approve Outputs / Output type / Output as the replacement for the rejected fixed-package label.
- [x] Lock exactly two approval moments for the product and three-minute demo: brief and storyboard.
- [x] Audit the live MVP against NotebookLM and the official Apps in ChatGPT UI guidance; record the simplification direction in `research/ui-ux-simplification-audit-2026-07-14.md`.
- [x] Supersede both the persistent three-rail/six-tab MVP and the interim three-tab concept with one current object, an optional Workshop switcher outside the active Workshop, and progressive disclosure in `DESIGN.md`.
- [x] Finish the simplified OpenAI-aligned shell: keep the verified official primitive layer, but rebuild the screen compositions around one current object, contextual Sources/evidence sheets, and no persistent tabs, generic Library drawer, host strip, or permanent secondary panel.
- [x] Move Style behind a compact Brief summary and an on-demand sheet; keep Sketch and Storyboard inside Outputs; keep source trace and technical data in contextual source/Details sheets.
- [ ] Complete the visual Outputs gallery with real presentation, infographic, image-set, storyboard, and video previews.
  - 2026-07-14: persisted deck and infographic HTML now render as real gallery previews and the completed local MP4 is served as a playable preview. Image generation still has only a planned manifest, not provider image bytes; keep this item open.
- [x] Remove raw Markdown, artifact paths, internal IDs, version mechanics, absent trace stages, and gate implementation language from normal UI while preserving them under Details or export.
- [x] Make each screen expose no more than three labeled actions in the default viewport and exactly one visually dominant next action when progress is possible. Hide actions that do not apply to the current state.
- [x] Add frontend tests for progressive disclosure, contextual citations, two approval bars, visual output previews, and suppression of incomplete provenance rows.
- [x] Re-verify the final simplified UI at 1200×800, 1024×768, and 390×844; capture a replacement screenshot set for the demo storyboard.
- [x] Adopt the six NotebookLM legibility gains as implementation acceptance criteria: instant explanation, stable geography, tangible source scope, real output previews, calm first run, and one-click citations.
- [x] Capture a privacy-safe live UI gallery covering the reset and complete recorded fixtures, including Map, Sources, citation, Brief, Style, Outputs, Storyboard, focused Output, and mobile states.
- [x] Rebuild the judge path around the official Apps in ChatGPT boundary: ChatGPT owns Conversation; the full-screen Workshop owns only Map, source trace, Brief, Style, Outputs, and Storyboard interactions.
- [x] Replace the broken Excalidraw judge path with a constrained relational Map: source anchors, grounded claims, implications, labeled clusters, visible edges, path highlighting, and one adjacent claim/evidence inspector.
- [x] Replace trivial approval states with a Brief coverage receipt, live Style contract, Storyboard coverage/runtime summary, and visibly named approved versions.
- [x] Replace four equal creation actions with one `Create outputs` action and ensure each Output appears exactly once.
- [x] Remove the persistent stage spine, generic Library, generic Details, browser capture composer, and other shell chrome that competed with ChatGPT.
- [x] Inventory the exact components, variables, styles, icons, and display-mode templates in `Apps in ChatGPT · OpenAI Official (Community)` from an editable Figma design-file copy; record names and source identifiers without inference.
- [x] Replace every approximated or custom WorkshopLM shell component and style with real reusable implementations of verified assets or documented compositions from the official Figma library. Permit custom rendering only for domain content such as Map geometry and generated artifact media. `data-oai-component` attributes and final-cascade CSS overrides do not satisfy this item.
- [x] Replace the string-presence UI test with conformance checks that cover every judge-visible element, the full CSS cascade, rendered computed styles, interaction states, responsive layouts, icons, and accessibility behavior.
- [x] Capture a fresh final screenshot set for the simplified Map, source trace, Brief/Style, Outputs, Storyboard, focused Output, and mobile review path.
- [x] Update frontend regression coverage for the judge path, including duplicate-artifact, one-dominant-action, hidden-unavailable-action, and no-raw-internal-language assertions. Full empty/loading/partial/error state coverage remains separately open below.
- [x] Re-verify keyboard focus order, WCAG AA contrast, reduced motion, and 200% zoom after the screen-composition rebuild.
  - 2026-07-14: the production UI passed at a real 600×800 Chrome viewport, the exact CSS-pixel reflow equivalent of 200% on a 1200px-wide browser, with no horizontal overflow. The automated browser boundary did not expose its native zoom-menu value, so no claim is made that the browser chrome itself was inspected at `200%`.

#### P0 official-component rebuild

Completion means implementation fidelity, not visual resemblance:

The reusable primitive foundation below is verified and remains complete. It does **not** prove that the current screen composition, information hierarchy, or language is finished; those gates are reopened in the next two sections.

- [x] Turn `packages/ui` into the real WorkshopLM UI layer with tested exports for `FullScreenShell`, `NavigationHeader`, `Button`, `IconButton`, `Token`, `Checkbox`, `Input`, `TextArea`, `Card`, `ListGroup`, `ListRow`, `EntityCard`, `Carousel`, and `CarouselRow`.
- [x] Implement each primitive from its recorded Figma node, variants, typography, spacing, state, radius, border, shadow, and icon source. Form controls must inherit the verified SF Pro web stack and match hover, pressed, focus, disabled, selected, checked, and error states.
- [x] Replace every ordinary HTML control and shell container in the judged path with the reusable UI layer. Domain interactions such as Map nodes, evidence edges, charts, slide media, image tiles, and storyboard imagery may stay custom, but their controls and containers may not.
- [x] Replace text glyphs and improvised symbols with the verified official iconography. Every IconButton must have an accessible name and visible tooltip where its meaning is not obvious.
- [x] When the library has no ready-made component, add a named WorkshopLM composite only after documenting its recipe in the Figma inventory. A composite may arrange official primitives and spacing tokens; it may not introduce independent chrome tokens, control geometry, typography, shadows, or interaction behavior.
- [x] Remove dead MVP shell CSS and isolate allowed domain rendering so no legacy selector can override official component states. The full application cascade must contain no retired structural color, radius, type, shadow, or spacing value outside explicitly documented generated-media exceptions.
- [x] Correct the known audit failures: 44px source Token versus the verified 42px reference, non-inheriting button fonts, legacy green locked-Style shadow, native checkbox appearance, glyph Back/Close icons, unmapped Brief/Storyboard actions and fields, the unmapped approval receipt, and missing current-object identity on mobile.
- [x] Add one inventory-backed exception manifest for custom domain rendering. Any custom judge-visible class absent from that manifest fails conformance.

#### P0 professional layout and language

Use NotebookLM's screenshots as behavioral evidence, then express the result in the official OpenAI system:

- [x] Keep one stable orientation frame: Workshop name and current object at top left, Sources in one consistent location, one focused center object, and one primary next action. Do not reintroduce persistent workflow tabs or a duplicate browser chat.
- [x] Make Sources feel as immediate as NotebookLM: one labeled count opens the source list; selection is directly visible; one click from any citation reveals the exact source excerpt and locator; closing it returns focus to the originating claim.
- [ ] Make Outputs behave like NotebookLM's useful Studio history without copying its panel: each output is a recognizable named object with a real preview, type, freshness, source coverage, and one obvious open action. Creation controls do not compete with the output history.
- [x] Preserve the professional control advantage through progressive disclosure: Map editing, Brief approval, Style selection, Storyboard editing, and Storyboard approval appear only when relevant. The user sees two blocking approvals—Brief and Storyboard—not internal gate machinery.
- [ ] Replace judge-visible copy using this canonical dictionary:

| Current or internal wording | Required user-facing wording |
| --- | --- |
| `Grounding this Workshop` | remove; the control reads `{n} sources` |
| `Evidence becomes structure` | `Map` or remove when the object title already says Map |
| `Approve as brief` / `Approve map as brief` | `Approve brief` |
| `Production contract` | `Brief` |
| `Visual contract` | `Style` |
| `Lock one coherent system` | `Choose a style` |
| `Lock Style v1` | `Use this style` |
| `Update Style v1` | `Update style` |
| `Coherent delivery package` | `Outputs` |
| `One system. Every format.` | a concrete output title or remove |
| `Generate package` / `Refresh package` | `Create outputs` / `Update outputs` |
| `Open package` | `View outputs` |
| `Trace` | `Show source` |
| `Illuminate path on Map` / `Highlight on Map` | `Show on map` |
| `Provider render pending` | `Images not created yet` |
| `Editable before the expensive step` | `Review before video` or remove |
| `Prepare render` | `Create video` |
| `Current` / `Stale` | `Up to date` / `Needs update` |
| `FRAME.md` / raw Markdown | formatted `Brief`; file name only under Details or export |
| `DESIGN.md` / `Visual DNA` | `Style`; technical name only under Details or export |
| `Brief approved` / `Style in use` repeated in cards | show `Approved` or `Current` once, only when it affects the next action |
| `Save` on an unchanged form | hide until the user changes something |
| `Update outputs` while outputs are current | hide; show only when an input `Needs update` |
| repeated `Open` and `Show source` buttons in the gallery | make the output card open; move source trace into the focused Output |

- [x] Audit every visible string. Labels identify the object; buttons state the result of clicking them; helper text explains only a consequence the user would not reasonably know. Use sentence case, avoid redundant subtitles and marketing copy, keep primary actions to two or three words, and never expose implementation terms in the default view.
- [ ] Pass a five-second orientation test on Map, Brief, Outputs, Storyboard, Sources, and mobile: a first-time professional can answer `Where am I?`, `What is this based on?`, and `What should I do next?` without opening another surface.

#### P0 screen-by-screen simplification

Use the NotebookLM screenshots for orientation behavior and the official Apps in ChatGPT inventory for every piece of chrome. Preserve all implemented capability; reduce only simultaneous exposure.

- [x] **Shared frame:** use `FullScreenShell` + `NavigationHeader`; show Workshop, current object, one `{n} sources` control, and at most one primary action. Back appears only for a nested object. A compact Workshop/current-object identity is allowed; workflow breadcrumbs, stage navigation, duplicate page titles, and persistent side rails are not.
- [x] **Map:** let the source → claim → decision relationships own the canvas. Open one `ClaimInspector` only after selection. Show `Approve brief` when reviewable or `View brief` when approved; do not add a second approval card or repeated state block to the default canvas.
- [x] **Sources and evidence:** use `SourceSheet` and `EvidenceSheet` as temporary layers. Source selection stays visible and reversible. A citation opens the exact excerpt and locator in one click, then returns focus to the originating claim when closed.
- [x] **Brief and Style:** render the Brief as a readable executive document, never raw Markdown. Show Style as one compact summary row or card; `Choose style` opens the fields in a sheet. Do not keep a Style editor beside the Brief. Show `Create outputs` only after Brief and Style are ready.
- [x] **Outputs:** use media-first `EntityCard`/`Carousel` compositions. The card itself opens the Output; source trace lives inside the focused Output. Show `Create outputs` for an empty state, `Update outputs` only when inputs need update, and `View storyboard` only when a Storyboard exists. Do not repeat freshness or source counts when they do not change a decision.
- [x] **Storyboard:** use one `CarouselRow` filmstrip, one large selected panel, and one contextual editor. `Save` appears only when dirty. `Approve storyboard` is the only dominant action before approval; `Create video` replaces it after approval. Secondary source trace opens on demand.
- [x] **Focused Output:** give the work maximum space. Keep Back/Close, title, and only the relevant edit/export/source actions. Technical Details stay collapsed.
- [x] **States:** design empty, loading, partial, error, ready, and needs-update states with the same official primitives. Each state names what happened and the single best next action; it never exposes provider or queue internals.

#### P0 component derivation rule

- [x] Before adding any judge-visible pattern that is absent from the official inventory, document a named composite in `research/openai-apps-figma-component-inventory-2026-07-14.md` with its exact official primitive recipe and Figma sources.
- [x] Implement that composite in `packages/ui`, add it to the machine-readable allowlist, test its states and responsive behavior, and only then use it in `apps/web`.
- [x] Do not create page-local buttons, inputs, sheets, cards, badges, pills, menus, tabs, icons, type styles, radii, shadows, spacing values, or interaction states. Custom rendering remains limited to Map geometry, evidence paths, charts, and generated media inside official containers.
- [x] Maintain a screen-to-component reconciliation table for Shared frame, Map, Sources, Evidence, Brief, Style, Outputs, Storyboard, and focused Output. Any unmapped judge-visible element blocks completion.

#### P0 proof before completion

- [x] Update structural tests so they fail for unmapped interactive elements, raw shell controls, glyph icons, unapproved tokens, page-local chrome, or custom chrome outside the exception manifest.
- [x] Re-run computed-style assertions for exact official geometry and typography in every interaction state used by the redesigned screens.
- [x] Replace screenshot baselines for reset and completed fixtures at 1200×800, 1024×768, and 390×844 across Map, Sources, Evidence, Brief/Style, Outputs, Storyboard, and focused Output.
- [x] Verify keyboard-only completion of both approval paths, focus return after sheets, visible focus, WCAG AA contrast, reduced motion, screen-reader names, 200% zoom, and no horizontal overflow.
- [x] Run a copy inventory test that snapshots every judge-visible label and rejects retired/internal vocabulary outside technical Details and exported files.
- [x] Complete a manual Figma-to-runtime reconciliation table with source node, code component, rendered measurement, state coverage, and screenshot evidence for the final compositions.
- [ ] Conduct five independent first-time review passes: each reviewer must identify the current object, source scope, and next action within five seconds on every primary screen, with zero critical navigation failures.

### 3. Specification and implementation plan

- [x] Write the proposed design to `docs/superpowers/specs/`.
- [x] Self-review the specification for placeholders, contradictions, ambiguity, and excessive scope.
- [x] Reconcile and lock the written specification and execution architecture.
- [x] Write the dated execution runbook (`PLAN-2026-07-13.md`).
- [x] Write the task-level foundation and integration-spike plan under `docs/superpowers/plans/`.
- [x] Write subsequent task-level workstream plans as each reaches execution.

### 4. Integration spikes

- [ ] Capture and timestamp the original raw voice brainstorm before product code exists.
  - This can no longer be backfilled. Capture a dated contemporaneous founder-brainstorm recording for the demo reveal, label it honestly, and keep the original pre-code requirement open.
- [x] Verify API-key authentication and list access for the required OpenAI model IDs without spending generation credits; record any entitlement or spend-cap uncertainty.
- [x] Spike A: the app-server host probe remained credential-blocked through the July 14 deadline, so native text/voice-turn persistence is unproven and the implemented capture-only `gpt-realtime-2.1` fallback is the final demo decision.
- [x] Spike B: deterministic normalized local sources, standard plugin `search`/`fetch`, FTS5/exact retrieval, and durable Source/Claim citations; live GPT-5.6 expansion remains entitlement-gated.
- [x] Spike C: six-image batch manifest, locked reference, and selective regeneration contract; live image generation remains opt-in and unrun.
- [x] Spike D: local HyperFrames CLI health check, validated three-scene composition, disclosed narration fixture, and rendered MP4.
- [ ] Spike E: locally install the unified plugin, invoke its skill, call its stdio MCP tools, and record actual Work/Codex surface support.
  - Codex tool proof is complete: installed `workshoplm@workshoplm-local` version `0.1.2` matches the repository bundle, and fresh task `019f6448-5a04-7753-b585-e156aec9f1b6` called `workshop_list → search → fetch` against the sanitized fixture without confirmation after the read-only annotation repair.
  - Keep this open: the current machine's unusually large installation exceeded Codex's initial 2% skill-list budget and omitted `$workshoplm`, and ChatGPT Work invocation remains unverified. The read-only host also withheld `workshop_render_video`, so no unauthorized write occurred.
- [x] Activate and verify the designed capture-only fallback for the unproven native task/voice synchronization spike; live Realtime transport remains separately unverified.

### 5. Repository and platform foundation

- [x] Initialize Git and preserve dated Build Week commits.
- [x] Scaffold the pnpm/Turborepo monorepo.
- [x] Create `apps/web`, `apps/worker`, and focused shared packages.
- [x] Create the unified plugin manifest, WorkshopLM skill, local MCP server, and compact status/trace widget with tested persisted-fixture tools.
- [x] Establish linting, type checking, tests, deterministic local fixture reset, and fail-closed live-provider environment validation.
- [ ] Record every participating Codex `/feedback` Session ID, or the explicit reason it is unavailable, and designate the primary integrator session from actual build evidence.
- [x] Configure local SQLite WAL persistence boundaries, atomic filesystem artifact storage, and idempotent leased local jobs.
- [x] Freeze `packages/domain` v1 schemas, commands, gate flags, dependency edges, and `artifact.json` shape with tests.
- [x] Create a sanitized local demo fixture that requires no private connector and makes video capture deterministic.
- [x] Create a bounded live operator path on sample sources for recording the real demo seam.
  - 2026-07-14: `pnpm demo:live` passed its isolated no-spend preflight with two approvals, two traced outputs, six planned GPT Image 2 requests, five planned TTS requests, and zero provider calls. Paid execution remains unrun.
- [x] Share and test Responses text extraction across the GPT-5.6 benchmark and live grounded-Map adapter so nested `output[].content[]` payloads cannot be mis-scored as empty.

### 6. Capture

- [x] Ingest local text/PDF files, safe public URLs, and sanitized meeting material.
- [x] Normalize local and connected-app/MCP sources for grounded `search`/`fetch` retrieval.
- [ ] Persist a live voice turn through the final capture-only `gpt-realtime-2.1` path and its existing durable transcript/source contract; native ChatGPT task/account turn linkage remains an explicitly unsupported future path.
  - The server-minted ephemeral credential route, direct browser WebRTC session, capture-only VAD configuration, final transcript reducer, private Source persistence, and provider item/event provenance are implemented and tested. Keep this open until an inspected live microphone turn proves the provider path.
- [x] Extract candidate goals, audience, claims, constraints, and unresolved questions from grounded claims with source locators.
- [x] Preserve claim-level evidence locators and source permissions.

### 7. Shape

- [x] Generate the typed semantic graph from transcript/source ingestion with durable source metadata.
- [x] Render and synchronize Excalidraw Map view.
- [x] Support typed, undoable user and AI graph operations.
- [x] Generate Sketch view from an approved graph version.
- [x] Produce and approve `FRAME.md` plus its executable representation.

### 8. Style

- [x] Create Brand Foundation from a public website URL.
- [x] Support manual logos, exact hex values, licensed fonts, references, and negative rules.
- [x] Create professional Intent Profiles for client-facing pitch, board deck, and internal workshop use.
- [x] Create, preview, approve, and version Visual DNA.
- [x] Produce inspectable `DESIGN.md` plus machine-readable tokens.

### 9. Deliver

- [x] Generate an asset plan from the approved graph, brief, evidence, Style Foundation, and Visual DNA versions.
- [x] Generate a source-traceable presentation.
- [x] Generate a source-traceable infographic.
- [ ] Generate and evaluate a coherent GPT Image 2 batch.
- [x] Generate an editable, panel-level storyboard.
- [x] Block video enqueueing until the current storyboard approval is persisted; the worker accepts current provider narration when present and otherwise uses the disclosed deterministic fallback.
- [x] Render the sanitized approved storyboard through the local HyperFrames worker path with disclosed fixture narration and verified MP4 streams.
- [x] Propagate upstream Map and Style changes into accurate downstream stale states.

### 10. Meta-demo, provenance, and submission

- [x] Build the “How this was built” provenance surface from dated build evidence.
- [x] Instrument and display time from first transcript segment to first rendered output.
- [ ] Produce the Devpost description, README narrative, deck, thumbnails, storyboard, narration, and video as one traced WorkshopLM Output set. The recorded fixture now builds and verifies a 12-asset `partial` Output set with source locators, file hashes, and an input fingerprint; close this only after the provider-backed media and final submission video replace the explicitly recorded fallbacks.
- [ ] Include real UI evidence and the raw-transcript reveal.
- [ ] Make the public video the canonical judge path: show the live seam, one plugin widget moment, both approval gates, editable control, provenance, and the raw brainstorm → finished submission reveal in under three minutes.
- [ ] Keep all judge-facing claims proportional to captured evidence.
- [ ] Produce a public YouTube demo under three minutes with clear audio.
- [ ] Complete repository, README, Codex collaboration, GPT-5.6, judge-access, and Devpost materials.

### 11. Daily acceptance and completion verification

- [x] Add a recorded-fixture mode to `pnpm demo:e2e` for repeatable demo diagnosis, with live-provider checks kept separate.
- [ ] Maintain and log the end-to-end acceptance path daily once the first vertical slice exists.
- [x] Verify the full Capture → Shape → Deliver flow in the live application.
- [x] Verify realistic desktop, tablet, and mobile behavior.
- [x] Verify schema, gate, graph, grounding, rendering, and integration tests.
- [x] Verify failure recovery and partial-package behavior.
- [ ] Verify all submitted links, the repeatable recording setup, and the optional inspection instructions in a fresh ChatGPT/Codex in-app browser session.
- [x] Audit every objective requirement against direct evidence before marking the goal complete.

## Current evidence

- [Public GitHub repository](https://github.com/daniel-p-green/OAI-Build-Week-2026)
- [WorkshopLM interface design system](DESIGN.md)
- [Verified Apps in ChatGPT Figma component inventory](research/openai-apps-figma-component-inventory-2026-07-14.md)
- [UI/UX simplification audit](research/ui-ux-simplification-audit-2026-07-14.md)
- [Judge-path interaction rebuild](research/judge-path-interaction-rebuild-2026-07-14.md)
- [Experience acceptance criteria](research/ui-experience-acceptance-criteria-2026-07-14.md)
- [Plugin research and adoption map](research/plugins/README.md)
- [Current UI screenshot gallery](outputs/workshoplm-current-ui/README.md)
- [Comprehensive WorkshopLM project overview deck](outputs/workshoplm-project-overview.pptx)
- [Traced submission Output-set builder and verifier](apps/worker/src/submission-package.ts)
- [Realtime voice capture UI](apps/web/app/realtime-capture.tsx)
- [Server-only Realtime client-secret boundary](apps/web/app/api/realtime/realtime-server.ts)
- [Fresh Codex plugin-host evidence](artifacts/spikes/plugin-host-2026-07-15.json)
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
