# Product opportunity and hackathon strategy

> Host-boundary update, 2026-07-15: Codex desktop/CLI owns development, plugin, and launch responsibilities; WorkshopLM's self-contained in-app browser owns the professional's grounded text and Realtime voice Conversation plus Sources, Map, Brief, Style, and Outputs. The installed classic ChatGPT app does not expose the unified local plugin, so ChatGPT Work parity is not claimed. See root `DESIGN.md`, `GOAL.md`, and the approved technical spec for current implementation truth.

Updated: 2026-07-13

**Project name:** WorkshopLM  
**Tagline:** Turn raw thinking into finished work.

## Positioning shorthand

**Internal thesis:** NotebookLM, but better for professional production and built with OpenAI.

**Judge-facing line:**

> WorkshopLM is NotebookLM for finished work—built on the OpenAI API.

The comparison supplies immediate category recognition. The demo must earn the improvement claim by showing what is visibly different: Realtime voice capture, an editable semantic whiteboard, source-aware revisions, exact reusable style systems, coherent image batches, storyboard approval, and deterministic video production.

Do not use “better” as an unsupported blanket claim in public materials. Name the specific workflow improvement and prove it on screen.

## Strategic direction

The product is exclusively for professional and team workflows. The Education/Learning vertical has been removed.

Enter **Work & Productivity**.

## Product thesis

> Turn messy professional thinking into coherent, on-brand finished work.

This is not a notes application and not a general Canva replacement. It is a **thought-to-delivery system** for serious teams that care about both speed and output quality.

## Primary user

A product marketer, communications lead, founder, strategist, consultant, or other knowledge worker who can explain an idea faster than they can structure and produce it.

Their current workflow fragments across meeting notes, chat, whiteboards, slide tools, design tools, image generators, and video editors. The product removes the handoff seams while preserving control at the thinking and storyboard stages.

## Three-stage happy path

### 1. Capture — voice conversation

The user starts talking before the idea disappears. The assistant asks only high-value follow-ups while capturing the raw, unstructured thinking verbatim.

Outputs:

- timestamped transcript;
- source and connector references;
- candidate goals, audience, claims, constraints, and deliverables;
- unresolved questions, visibly marked rather than silently guessed.

### 2. Shape — visual whiteboard hub

The transcript becomes an interactive whiteboard. Ideas are clustered, prioritized, linked, and grounded. The user can move, merge, edit, add, delete, and promote ideas while continuing the conversation by text or Realtime voice.

The whiteboard is the thinking layer: spatial, editable, and alive. Once approved, its semantic graph becomes the production brief.

Outputs:

- editable Excalidraw scene;
- semantic idea graph beneath the scene;
- approved narrative and claim set;
- `FRAME.md` production brief;
- asset plan.

### 3. Deliver — guided Studio output types

The approved whiteboard and active Style Library feed Studio output types that can create one output or a coordinated output set rather than unrelated one-off generations.

Core outputs:

- branded presentation;
- single-page infographic;
- editable storyboard;
- coherent image batch;
- final narrated HyperFrames video after storyboard approval.

## Product differentiator

NotebookLM turns sources into outputs but often jumps directly to the final artifact. This product inserts an editable spatial thinking layer and an editable storyboard between raw information and expensive media generation.

Canva makes assets editable but does not make source-grounded professional thinking the central object. Pomelli operationalizes brand identity but does not treat an evolving whiteboard and evidence graph as the brief.

The differentiator is the connected chain:

> Raw voice → grounded idea graph → approved brief → locked visual direction → synchronized outputs.

## Style Library model

Style is layered rather than stored as one vague prompt.

### Brand Foundation

Imported from a website or entered manually:

- logos and usage rules;
- exact hex values and color roles;
- custom fonts and typography hierarchy;
- photography, illustration, and icon direction;
- prohibited treatments and brand constraints.

### Intent Profile

Saved for a repeatable professional situation:

- **High-stakes board deck:** conservative composition, muted palette, dense but legible data, restrained imagery.
- **Client-facing pitch:** generous whitespace, bold hierarchy, persuasive narrative, brand-safe color range.
- **Internal workshop:** informal, fast to skim, action-oriented, visually annotated.

Each profile stores typography, color overrides, layout density, tone, image treatment, motion, and output defaults. Switching intent changes the complete production system while preserving the underlying content.

### Visual DNA Run

A project-specific locked art direction:

- approved visual reference image(s);
- palette and lighting treatment;
- composition, camera, texture, and illustration rules;
- negative constraints;
- version identifier used by every generated image and scene.

## Coherent batch image generation

GPT Image 2 can generate multiple images in one request and can use multiple high-fidelity reference images. However, a batch request by itself does not prove cross-image consistency.

The product therefore uses a coherence pipeline:

1. Generate several candidate style anchors from the Style Library.
2. User locks one direction.
3. Convert the storyboard into per-frame scene specifications.
4. Generate the batch with the locked anchor and shared Visual DNA as references.
5. Evaluate palette, lighting, subject treatment, composition family, and prohibited elements.
6. Regenerate only outlier frames.
7. Lock approved frames as ingredients for downstream video.

Text and logos should be composed by deterministic renderers wherever possible rather than baked into generated images.

## Storyboard-first video

Video is never the first expensive generation.

Every storyboard panel contains:

- narrative beat and purpose;
- source/claim references;
- composition sketch or generated frame;
- voiceover line;
- on-screen text;
- duration and transition intent;
- visual ingredients and generation prompt;
- approval state.

The user can reorder, rewrite, reframe, regenerate, or remove individual panels. HyperFrames receives only an approved storyboard and renders the deterministic timeline, motion, captions, narration, and transitions.

## Meta-demo strategy

The Build Week demo is itself a generated output of the product.

1. Record the original raw voice brainstorm.
2. Use the product to create the whiteboard, brief, Style Library, presentation, infographic, storyboard, images, narration, and video timeline.
3. Present the polished assets normally.
4. Reveal the raw transcript near the end.
5. Show the trace from rambling voice → organized board → storyboard → final demo.

The strongest honest claim is **“No manual design pass”** or **“One guided production run.”** Do not claim “no cleanup” or “no iteration” unless the captured build evidence proves that literally. Review and approval are part of the product value, not a weakness to conceal.

## Hackathon MVP

- Realtime voice capture with transcript.
- File, URL, and sanitized meeting-source ingestion with grounded citations.
- Transcript → editable semantic Excalidraw whiteboard.
- Whiteboard edits synchronized to `FRAME.md` and asset plan.
- Website/manual Style Library creation with one saved Intent Profile.
- Coherent multi-image batch with a locked visual anchor.
- Branded presentation and infographic.
- Editable storyboard with panel-level regeneration.
- HyperFrames render from the approved storyboard.
- Meta-demo built through the product flow.

## Explicit non-goals

- Education or student workflows.
- A full general-purpose Canva canvas.
- Every connector or asset format.
- Autonomous publishing to public channels.
- Generating final video before storyboard approval.
- Unsupported claims about perfect visual consistency or zero human review.

## Three-minute demo spine

- **0:00–0:20 — Promise:** messy thinking becomes a finished campaign package.
- **0:20–0:45 — Capture:** show the original voice brainstorm entering live.
- **0:45–1:10 — Shape:** transcript becomes a clustered, cited whiteboard; move one idea and promote it into the brief.
- **1:10–1:35 — Style:** show website-derived brand foundation and select an Intent Profile.
- **1:35–2:05 — Deliver:** generate the deck, infographic, and coherent storyboard batch.
- **2:05–2:30 — Control:** revise one storyboard panel before video generation.
- **2:30–2:50 — Render:** show the finished HyperFrames demo sequence.
- **2:50–3:00 — Meta reveal:** this demo and every asset in it came from the raw voice brainstorm just shown.

## Success criteria

A judge can see and understand:

1. raw voice becoming structured spatial thinking;
2. source grounding surviving into the whiteboard and assets;
3. an exact style system controlling multiple formats;
4. a visibly coherent image family rather than independent generations;
5. storyboard approval preceding final video;
6. the product producing its own demo package;
7. meaningful use of GPT-5.6, Codex, Realtime, File Search, GPT Image 2, and HyperFrames.
