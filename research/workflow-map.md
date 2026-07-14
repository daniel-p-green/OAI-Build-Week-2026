# WorkshopLM workflow map

Updated: 2026-07-13

## Product model

WorkshopLM is organized into **Workshops**, just as NotebookLM is organized into Notebooks. A Workshop is the durable container for one body of work: sources, conversation, semantic map, approved brief, style, and outputs.

WorkshopLM should not force every Workshop into one fixed package. It should provide one grounded core and several clear creation paths.

The shared core is:

> Sources → grounded conversation → semantic map → approved brief → styled outputs

Every source, claim, board node, brief section, and output block remains connected through durable evidence and version records. An output type is a recipe over that same Workshop state, not a separate product mode.

## Interface vocabulary

Recommended terms:

- **Workshop:** the top-level container users create, reopen, duplicate, and share.
- **Studio:** the place where users choose what to create.
- **Output type:** a guided creation path such as presentation, infographic, mind map, audio overview, storyboard, video, or Site.
- **Output:** an individual artifact such as a deck, infographic, mind map, audio overview, storyboard, video, or Site.
- **Output set:** a user-selected group of outputs generated from one approved brief and style version.

This replaces **Production Kit** and avoids exposing **Workflow** next to **Workshop** in the interface. It is more intuitive, supports one artifact or many, and keeps the NotebookLM association without implying that every Workshop must become a campaign bundle.

## Source paths

| Starting material | Ingestion behavior | Grounded Workshop result |
| --- | --- | --- |
| Realtime voice | Preserve audio and timestamped transcript; let the assistant ask only high-value clarifying questions | Goals, audience, claims, constraints, open questions, and source-linked transcript segments |
| Granola or meeting notes | Import the note and transcript when permitted; preserve speakers, timestamps, decisions, and action items | Meeting map with decisions, evidence, owners, tensions, and unresolved issues |
| PDFs and documents | Store originals, parse/index content, and retain page or section locators | Searchable claims and excerpts with inspectable citations |
| YouTube | Import an authorized transcript and metadata; retain timestamps and chapter boundaries | Cited themes, claims, quotes within policy, and a scene/segment map |
| Websites | Crawl the user-selected pages, preserve URLs and retrieval time, and distinguish content extraction from brand extraction | Source claims plus an optional Brand Foundation and inspectable `DESIGN.md` |
| Manual uploads | Accept logos, licensed fonts, images, audio, video, and explicit rules | Workshop ingredients with ownership, usage, and style metadata |

Multiple source paths can feed the same Workshop. The original source is immutable; normalization and model-derived interpretations are versioned separately.

## Common workflow spine

1. **Bring in sources.** The user talks, pastes a URL, uploads files, or connects approved meeting material.
2. **Ground the Workshop.** WorkshopLM indexes the material and builds claim-to-evidence edges with visible `Grounded`, `Derived`, `Creative`, and `Unverified` states.
3. **Shape the thinking.** Realtime voice or text edits the semantic graph. Map is the editable Excalidraw view; Sketch is the polished hand-drawn synthesis.
4. **Approve the brief.** The approved graph produces `FRAME.md`, the narrative/claim set, and an output plan.
5. **Apply style when relevant.** Visual outputs use Brand Foundation, Intent Profile, and locked Visual DNA. Audio-only outputs can skip visual setup.
6. **Choose an output type in Studio.** The user creates one output or an output set.
7. **Review before expensive generation.** Storyboards are required before video; Site builds are saved and reviewed before deployment.
8. **Propagate changes.** Upstream edits mark only dependent output blocks stale, with a preview before regeneration.

## Creation paths

### 1. Voice brainstorm → visual brief

Best for a founder, strategist, or product marketer starting with an unstructured idea.

`Realtime conversation → transcript → clustered Map → edited Map or generated Sketch → approved FRAME.md`

Primary outputs:

- editable mind map;
- polished whiteboard/Sketch;
- source-grounded brief;
- recommended next outputs.

### 2. Meeting → decision and communication set

Best for Granola notes, meeting transcripts, interviews, or workshops.

`Meeting source → decisions/tensions/actions → semantic Map → audience-specific brief → selected communications`

Possible outputs:

- executive decision deck;
- one-page infographic;
- internal workshop recap;
- launch or social graphics;
- storyboard and narrated recap video.

### 3. Research library → explained story

Best for PDFs, reports, websites, and mixed research.

`Source library → cited claims/themes → narrative Map → approved evidence set → explanatory outputs`

Possible outputs:

- cited presentation;
- infographic;
- mind map;
- audio overview;
- searchable resource Site.

### 4. Video or YouTube → reusable knowledge

Best for an owned or authorized video, webinar, talk, or product walkthrough.

`Transcript + timestamps → chapter/claim Map → selected narrative → transformed outputs`

Possible outputs:

- visual summary;
- slide deck;
- audio overview;
- storyboard for a shorter derivative video;
- on-brand social image batch.

WorkshopLM transforms the grounded transcript and user-provided media; it does not imply permission to republish third-party footage.

### 5. Website → on-brand deliverables

Best when the user needs Pomelli-like setup with stronger control and source grounding.

`Website URL → content sources + Brand Foundation → review DESIGN.md → choose Intent Profile → generate outputs`

Possible outputs:

- branded deck;
- infographic;
- coherent image batch;
- campaign storyboard;
- hosted Site source package.

The user can correct extracted logos, exact hex values, fonts, layout rules, tone, image treatment, motion, and prohibited treatments before saving the style.

### 6. Approved brief → multi-output Studio run

Best for a Workshop that already completed Shape.

`Approved FRAME.md + evidence version + style version → select outputs → dependency plan → parallel generation → review`

The user chooses any combination of deck, infographic, mind map, audio overview, image batch, storyboard, video, or Site. Shared claims, narrative, and Visual DNA stay locked while format-specific composition changes.

## Meta-demo workflow

The Build Week submission is the hero path and proof object:

1. Record the original, messy voice brainstorm for WorkshopLM.
2. Turn it into the cited semantic Map and approve the resulting `FRAME.md`.
3. Extract WorkshopLM's Brand Foundation from its own website or review a manually supplied style.
4. Use Studio to create the pitch deck, architecture infographic, coherent image batch, and demo storyboard.
5. Review and change one storyboard panel to prove control before rendering.
6. Generate narration and render the final submission video through HyperFrames.
7. Present the polished work, then reveal the original transcript and its trace through every output.

The honest claim is **one guided, source-grounded production run**. Human review and approval remain visible product strengths.

## ChatGPT Sites boundary

ChatGPT Sites is a real hosted-output surface in public beta. WorkshopLM can therefore make a **Site** a valid Studio output, but should not pretend that a public API currently provides autonomous Sites deployment.

For the hackathon, WorkshopLM should generate a compatible, reviewable Site project plus its content, citations, and style tokens. Publishing remains an explicit user action through the available ChatGPT/Codex Sites surface. Every deployment is production, so the creation path must separate saved-version review from deployment.

## Pipecat decision

**Do not add Pipecat to the MVP architecture.**

Pipecat is valuable when a product needs provider-neutral STT/LLM/TTS composition, a server-side Python frame pipeline, telephony, alternative WebRTC transports, or multi-agent voice handoffs. WorkshopLM's hackathon path is browser-first and deliberately OpenAI-first: `gpt-realtime-2.1` over WebRTC already handles the core conversational loop, while durable content orchestration belongs in the TypeScript worker and canonical project graph.

Adding Pipecat now would introduce a second runtime and overlapping realtime/session abstractions without improving the judge-visible happy path. Preserve a narrow `RealtimeConversationAdapter` boundary so Pipecat can be added later if telephony, provider switching, or server-side audio processing becomes a real requirement.

## MVP workflow boundary

The interface may show the broader Studio model, but the live hackathon build should deeply prove three connected creation paths:

1. **Voice brainstorm → visual brief**
2. **Website → reviewed DESIGN.md and Brand Foundation**
3. **Approved brief → deck, infographic, image batch, storyboard, and final meta-demo video**

PDF/URL ingestion and an audio overview should work through the same core if time permits. Granola, YouTube, mind-map export, and Sites packaging should use adapter seams and sanitized fixtures unless their live integration can be completed and verified without risking the hero path.
