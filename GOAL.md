# WorkshopLM Goal

Last updated: 2026-07-17 CT

This file is the current product compass. It defines the durable product contract, completion bar, and immediate execution path. Chronological implementation evidence belongs in [`log.md`](log.md).

## 1. North star

> WorkshopLM is the professional knowledge workspace that turns conversations and source material into presentations, graphics, audio overviews, visual maps, storyboards and videos. Every expression shares the same knowledge, visual identity and connection to its sources.

> NotebookLM helps people learn from sources. WorkshopLM helps professionals create from them.

WorkshopLM is for consultants, strategists, enablement leads, marketers, researchers, and team leaders who repeatedly turn meetings, documents, research, and incomplete thinking into work used by colleagues, clients, leaders, or public audiences.

The repeated problem is fragmentation. Thinking happens in conversations and notes, research lives elsewhere, visual identity lives in brand files, and each format is recreated in a different tool. Context, trust, and consistency are lost at every handoff.

A Workshop is the shared knowledge layer. Sources, Conversation, Map, Brief, Style, created work, revisions, approvals, and source connections remain part of one coherent workspace.

WorkshopLM creates multiple first-class expressions of the same knowledge: presentations, graphics and infographics, Audio Overviews, Maps and Sketches, image sets, Storyboards, and Videos. No single format is the product's ultimate destination.

WorkshopLM wins when a professional can move from messy material to coherent professional knowledge work without repeatedly rebuilding context, visual identity, or the source trail.

The current phase is **product-quality consolidation and final proof**. The core product exists. Work now concentrates on making the connected experience clear and professionally useful, then proving it through the authentic founder Workshop and submission.

The hackathon category is **Work & Productivity**. Education mode, general-purpose design-tool scope, and unsupported public claims remain outside the product direction.

## 2. Locked product contract

### One Workshop, one body of knowledge

- Workshops organize projects the way Notebooks organize work in NotebookLM.
- Every Workshop has one selected Source set, one grounded Conversation, one semantic Map, one approved Brief, one current Style, and a connected family of created work.
- Every expression uses the same approved knowledge and visual identity rather than behaving like an unrelated generator.
- A professional can always understand what they are viewing, which Sources support it, and what action comes next.

### Inputs and capture

- Start from voice, typed text, local documents, websites, meeting transcripts, and pasted professional notes.
- Voice and text are equal inputs to the same Conversation; neither creates a separate mode or workflow.
- The core local experience does not require cloud upload. Local files remain local unless the professional explicitly chooses a shareable path.
- Connectors and plugins may broaden source access, but the core demonstration cannot depend on private accounts or external storage.
- Capture should feel immediate: the professional can speak or paste before learning product concepts.

### Sources and grounded Conversation

- Sources remain visible and understandable without dominating the workspace.
- Conversation answers use the selected Sources and retain inspectable links to exact excerpts or locators.
- Search, retrieval, and source inspection may use local deterministic indexing or compatible platform tools; the product promise is source grounding, not a particular retrieval vendor.
- Source-linked means the claim retains an evidence edge. It must not be presented as independently proven truth.
- Private, sanitized, and shareable source permissions remain explicit and fail closed for public packaging.

### Visual thinking and approval

- The semantic Excalidraw Map is the primary thinking surface.
- The Map is a constrained, auto-organized semantic canvas—not a generic whiteboard or an Excalidraw feature surface.
- It must instantly communicate hierarchy, meaningful clusters, evidence, synthesis, direction, and a recommended path forward.
- WorkshopLM organizes, prioritizes, and links ideas while preserving direct editing, movement, resizing, and undo where those actions improve the thinking.
- The professional works with ideas, not Excalidraw mechanics.
- Map items retain evidence state and source connections.
- Sketch is a hand-drawn expression of the same semantic Map, not a second independent whiteboard engine.
- The Map becomes the Brief only through an explicit professional approval.
- Brief approval is the first of exactly two consequential sign-offs.
- Approval creates an inspectable, versioned `FRAME.md` that defines the intended outcome, audience, claims, and creation direction.
- Created work cannot silently use an unapproved or stale Brief.

### Style and visual identity

- A professional can create Style from a website, uploaded brand assets, or direct manual choices.
- Website analysis proposes a Style; the professional reviews it before use.
- Style preserves exact colors, typography, layout preferences, image treatment, tone, logo use, and negative rules in a versioned `DESIGN.md` and machine-readable tokens.
- Styles can be saved and reused across Workshops.
- Every created format applies the same visual identity in a way appropriate to that format.
- If an official Apps in ChatGPT component exists, use it. New composites must be grounded only in the locked official primitives, tokens, spacing, typography, focus, and responsive behavior.

### Created work

The following are first-class expressions of one Workshop:

- **Presentations:** editable, visually varied, source-connected, and suitable for professional presentation or refinement.
- **Graphics and infographics:** concise visual explanations with appropriate editable or directed-refinement paths.
- **Audio Overviews:** grounded scripts with reviewable sections and clearly disclosed AI-generated voice.
- **Maps and Sketches:** spatial and hand-drawn views of the same semantic knowledge.
- **Image sets:** coherent GPT Image 2 visuals with shared art direction and selective replacement.
- **Storyboards:** editable sequences with image, narration, timing, Style, and Source connections.
- **Videos:** local HyperFrames compositions created only from an approved Storyboard.

Presentations are important professional work, but they do not define the boundary or final destination of WorkshopLM.

### Storyboard and Video control

- Storyboard approval is the second and final consequential sign-off.
- Changing a panel, image, narration, or timing creates a new Storyboard version and revokes approval.
- Video creation uses the exact approved Storyboard, current `DESIGN.md`, approved `FRAME.md`, selected image versions, grounded narration, timing, and audio.
- HyperFrames runs locally and remains the composition path for both product Video and the hackathon demonstration.
- Motion must be calm, stable, and intentional. Interface or artifact footage must not use synthetic zoom or spatial drift.
- The professional sees simple actions such as `Create video`, not timeline, command-line, or orchestration mechanics.

### Trust, revision, and history

- Any factual claim in created work traces to its supporting Source in one consistent interaction.
- Source, Map, Brief, Style, image, Storyboard, and created-work versions remain inspectable.
- Source or dependency changes mark affected work `Needs update` without destroying the previously reviewed version.
- Regeneration is explicit, selective when possible, and preserves history.
- Appropriate refinement paths exist for every format: direct editing, editable export, directed replacement, or return to the upstream editor.
- Approval bypass, stale-version rendering, citation corruption, and private-source packaging fail closed.

### Experience contract

- The primary Workshop model is **Capture → Map → Brief → Create**. It is a compact index of the work, not a literal list of every feature the professional must learn.
- Conversation and Sources live inside Capture. Style and all created formats live inside Create. The expanded Workshop index may expose these objects without complicating the primary model.
- The happy path is: **speak or type → build the grounded Map → approve the Brief → choose Style and create professional knowledge work**. Storyboard approval appears contextually when creating Video.
- The interface behaves like a native ChatGPT/Codex workbench: quiet, spacious, focused, confident, and immediately understandable.
- Use progressive disclosure, contextual actions, sheets, and focused object views instead of persistent tab rows or dashboards.
- Show one dominant current object and one obvious next action.
- Keep creation status visible but quiet.
- Use short human labels and familiar nouns. Do not expose file names, IDs, provider mechanics, internal states, or duplicate actions in the primary interface.
- Preserve responsive behavior at realistic desktop, compact, and mobile widths.
- A new professional should understand the current object, Source scope, and next action within five seconds.

### Active vocabulary

Use: professional knowledge work; created work; presentation; graphic or infographic; Audio Overview; Map or Sketch; Storyboard; Video; Sources; Brief; Style; create, refine, present, share, or publish; ready to use; professional quality; Capture → Map → Brief → Create.

Do not frame the active product around one presentation format, logistics metaphors, market-entry terminology, or a single artifact as the destination. Historical evidence may retain earlier wording when changing it would falsify the record.

### Platform and truth boundaries

- The hackathon product runs locally in the ChatGPT/Codex in-app browser or a supported local browser surface.
- The demonstration does not require hosting, user accounts, cloud storage, or remote workers.
- WorkshopLM may integrate with ChatGPT/Codex plugins and local tools, but it must not claim a private or official OpenAI product integration.
- The public judge path uses sanitized data and requires no judge-supplied API spend.
- OpenAI APIs provide grounded reasoning, Realtime voice, image generation, and voice generation where they materially improve the experience.
- Exact model routing is governed by measured quality, latency, cost, and current evidence—not exposed as a product concept.
- The authorized OpenAI API ceiling is $50. Exact spend and provider calls belong in `log.md`, not product claims in this file.
- Third-party names, assets, fonts, code, and services must be used honestly and with appropriate permission or licensing.

### Non-goals

- Education or student workflows.
- A general-purpose design suite.
- Hosted multi-user collaboration or a separate native wrapper.
- Autonomous publishing or every possible connector.
- Exposing model selection, retrieval mechanics, command-line controls, hashes, IDs, or implementation terminology in the primary professional interface.
- Adding another format, mode, navigation surface, infrastructure layer, or speculative workflow before the authentic connected experience and public demonstration are complete.

## 3. Definition of complete

WorkshopLM is complete for OpenAI Build Week only when current evidence proves these outcomes:

- A professional can begin with messy voice, text, documents, a website, or meeting material without first learning the system.
- Conversation and Sources remain visibly connected, and grounded answers trace to exact source material.
- The semantic Map genuinely improves organization and thinking rather than merely restating the transcript.
- The Map makes hierarchy, clusters, evidence, and a recommended path visible without requiring the professional to manually arrange a generic whiteboard.
- The professional can edit the Map and deliberately approve it as the Brief.
- Website-derived or manual Style creates one reusable visual identity that remains coherent across every created format.
- Presentations, graphics or infographics, Audio Overviews, Maps or Sketches, image sets, Storyboards, and Videos are recognizable expressions of the same Workshop knowledge and Style.
- Each format is editable or has an appropriate refinement path for the professional's final judgment.
- Claims retain Source connections across creation, revision, export, and presentation.
- Source and dependency changes propagate honestly through versions, approvals, and `Needs update` states.
- The approved Storyboard controls a stable, narrated, locally rendered HyperFrames Video.
- The authentic founder brainstorm becomes a real Workshop and a coherent set of professional knowledge work.
- The public video is under three minutes and clearly proves the transformation from raw thinking to connected, styled, source-traceable work.
- The public demonstration accurately explains Codex collaboration and OpenAI model use without conflating fixture, sample, founder, or public evidence.
- The local judge path is repeatable from documented instructions with sanitized data.
- Core checks, responsive behavior, privacy boundaries, claim integrity, public links, and submission requirements pass against live artifacts.

Completion is an outcome judgment, not a count of routes, tests, files, provider calls, generated assets, or local refinements.

## 4. Current critical path

- [ ] **Finish the connected product-quality pass.** Simplify first use and navigation around `Capture → Map → Brief → Create`; make the constrained Map clarify evidence, synthesis, direction, and the recommended path; keep grounding visible across created work; and resolve visible responsive or repository-hygiene blockers without adding breadth.
  - Current implementation evidence covers the complete four-stage spine, simplified first use, a live `Build my Map` handoff to GPT-5.6 Terra, and an honest deterministic fallback that converts grounded claims into Evidence → Synthesis → Direction without recording a provider run. A professional can now paste one Source and build the grounded Map in one action; a successful voice capture saves its transcript as a Source and makes the same transition. The initial Source is named automatically, while the quiet Source sheet retains explicit naming and multi-source control. The complete action set remains visible at default desktop, compact, and mobile heights. The constrained semantic Map uses auto-organized cluster lanes, presents one recommended direction instead of duplicating the canvas as a navigation chain, clips every relationship to card boundaries, and keeps the sample graph on one legible Evidence → Synthesis → Direction route. Only directly evidenced Sources appear as canvas objects while the complete Source selection remains available in the quiet shelf. The Map refits the complete hierarchy when the workbench resizes and opens mobile in Direction → Synthesis → Evidence order. Brief approval now creates a source-grounded professional contract with a complete Outcome, intended Audience, approved Direction, and sentence-complete Evidence; the rendered Brief preserves that hierarchy responsively. A fresh professional test now reaches six connected formats from one meeting Source, with a polished editable Presentation, source-traceable Infographic, and a Storyboard that turns grounded claims into a coherent narrative arc instead of listing output formats. Storyboard panels preserve exact evidence and image bindings, and their styled preview remains useful before images exist. Create and focused-object transitions reliably begin at the title and primary action instead of preserving stale inner scroll. Created work retains visible source-link depth; design/public/plugin contracts align; the repository authority chain prevents the dated plan or technical spec from overriding current UX direction; and the ignored-cache boundary passes a from-scratch check. Founder visual acceptance remains the completion gate.
  - Created work previews now behave as quiet, non-interactive imagery at every responsive width: embedded artifact scrollbars and duplicate assistive-technology content are removed while the accessible card retains its name, Source coverage, and freshness state.
- [ ] **Record and run the authentic founder Workshop.** Capture the authentic founder voice recording and exact transcript outside the public data root, review Source sharing explicitly, then create the founder-derived Map, approved Brief, Style, connected professional knowledge work, approved Storyboard, and local HyperFrames Video.
- [ ] **Review and refine the resulting knowledge work.** Inspect every format together for knowledge quality, visual coherence, source trust, and professional usefulness; repair only visible blockers and obtain an intended-audience `Ready` or concrete revision judgment.
- [ ] **Complete and review the public video.** Replace sample-only evidence with founder-derived proof, preserve the meta reveal, verify stable motion and audio, and complete a final founder and target-audience taste review.
- [ ] **Verify and submit.** Re-run the clean judge path, reconcile claims, publish the under-three-minute video, finish Devpost, verify all public links while logged out, and record final submission evidence.

### Alignment test

Every proposed change must answer **yes** to at least one question:

1. Does it make input capture easier?
2. Does it improve the professional's thinking?
3. Does it improve the quality or coherence of created knowledge work?
4. Does it strengthen source trust or controlled revision?
5. Does it materially improve the final demonstration?

If not, it does not enter the active goal. A visible blocker on the authentic path outranks another local refinement, speculative feature, document, or test.

Until the five current items are complete:

- keep the end-to-end product seam green;
- do not add breadth unless it fixes a visible blocker on this path;
- do not treat more tests, more documents, or another deterministic refinement as progress by themselves;
- do not weaken privacy, source, approval, Style, or provenance boundaries to accelerate the demonstration;
- keep `PLAN-2026-07-13.md` advisory only where it agrees with this file, current implementation truth, and the latest user direction.

## 5. Evidence pointers

Use these locations to verify current state. Do not copy their chronology back into this file.

- **Historical implementation evidence:** [`log.md`](log.md)
- **Current product design system:** [`DESIGN.md`](DESIGN.md)
- **Current product and architecture specification:** [`docs/superpowers/specs/2026-07-13-workshoplm-design.md`](docs/superpowers/specs/2026-07-13-workshoplm-design.md)
- **Live OpenAI provider evidence:** [`artifacts/live/provider-run.json`](artifacts/live/provider-run.json) and [`artifacts/live-review/`](artifacts/live-review/)
- **Current responsive UI proof:** the implemented Focus Canvas, Editorial Brief, Created Work Gallery, and Storyboard Cinema screenshots in [`artifacts/ui-review/`](artifacts/ui-review/), plus the explicitly refreshed current-product browser baselines in [`apps/web/tests/visual/__screenshots__/`](apps/web/tests/visual/__screenshots__/)
- **UI concept exploration:** [`artifacts/ui-concepts/README.md`](artifacts/ui-concepts/README.md) and the two ten-direction concept boards that established the implemented visual grammar
- **Current created-work proof:** [`artifacts/live-review/presentation-v7/`](artifacts/live-review/presentation-v7/), [`artifacts/live-review/infographic-v6/`](artifacts/live-review/infographic-v6/), [`artifacts/live-review/audio-overview.png`](artifacts/live-review/audio-overview.png), and [`artifacts/live-review/gpt-image-2-contact-sheet.png`](artifacts/live-review/gpt-image-2-contact-sheet.png)
- **Current stable HyperFrames proof:** [`artifacts/live-review/hyperframes-stable-motion-2026-07-16/`](artifacts/live-review/hyperframes-stable-motion-2026-07-16/)
- **Current sample video proof:** the redesigned 2:20 Cedar-narrated local HyperFrames cut in [`outputs/demo-film-sample/workshoplm-demo-sample.mp4`](outputs/demo-film-sample/workshoplm-demo-sample.mp4), its [`manifest.json`](outputs/demo-film-sample/manifest.json), and ten-frame review sheet
- **Demo narrative and public claim controls:** [`submission/DEMO-SCRIPT.md`](submission/DEMO-SCRIPT.md), [`submission/CLAIM-LEDGER.md`](submission/CLAIM-LEDGER.md), and [`submission/EVIDENCE-AUDIT.md`](submission/EVIDENCE-AUDIT.md)
- **Submission requirements and remaining public gates:** [`research/hackathon/SUBMISSION-CHECKLIST.md`](research/hackathon/SUBMISSION-CHECKLIST.md)
- **Public project description:** [`submission/DEVPOST-DRAFT.md`](submission/DEVPOST-DRAFT.md)
- **Founder and provider runbook:** [`docs/planning/2026-07-15-live-provider-authorization.md`](docs/planning/2026-07-15-live-provider-authorization.md)

When an evidence pointer and this compass appear to disagree, inspect the live product and append-only log, correct the current truth here, and preserve the historical record.
