# WorkshopLM Interface Design System

Status: locked direction for the hackathon build

This file governs WorkshopLM's product UI. Per-Workshop brand systems generated from customer sources are separate artifacts stored with that Workshop as `DESIGN.md` plus machine-readable tokens.

## Design thesis

WorkshopLM is an **editorial thinking instrument**, not an AI dashboard.

It should feel like a serious team spread a project across a beautiful physical worktable: source folders at hand, the thinking visible in the center, and production outputs arranged within reach. The interface borrows the composure and restraint of OpenAI's current ChatGPT/Codex surfaces without copying their chrome or implying an official OpenAI product.

The memorable visual is **evidence becoming structure**: a native ChatGPT conversation creates cited cards on a spacious Map, thin evidence threads lead back to sources, and the same cards visibly become polished outputs in Studio.

## Surface model

WorkshopLM has two coordinated native surfaces:

1. **ChatGPT task** — conversation, voice, questions, reasoning, and plugin commands.
2. **In-app browser Workshop** — Sources, Map, FRAME.md/DESIGN.md review, Studio, asset batches, storyboard, final outputs, and provenance.

The browser contains no second chat transcript or composer. A quiet `Continue in ChatGPT` control returns focus to the host conversation.

Compact plugin widgets may show Workshop status, an evidence trace, or an output preview. They may never reproduce the Map, storyboard editor, image-batch browser, or full Studio.

## Visual atmosphere

Calm, exact, tactile, and editorial. Dense enough for professional work, spacious enough that the Map remains legible. Warm paper replaces sterile gray dashboards. Structure comes from hairlines, alignment, and typography—not a stack of rounded floating cards.

Avoid:

- purple AI gradients, glassmorphism, neon glows, and chat bubbles;
- excessive pills, giant empty cards, and decorative metrics;
- copying NotebookLM colors or Google's visual identity;
- hiding evidence, approvals, or stale states behind hover-only UI;
- turning every section into the same shadcn card treatment.

## Color system

| Token | Value | Role |
| --- | --- | --- |
| `paper` | `#F4F2EC` | Map canvas and overall atmosphere |
| `surface` | `#FCFBF8` | Rails, inspectors, sheets, menus |
| `white` | `#FFFFFF` | Focused artifact pages and selected cards |
| `ink` | `#171816` | Primary text and high-emphasis strokes |
| `ink-muted` | `#686963` | Secondary labels and metadata |
| `hairline` | `#D9D7D0` | Dividers, card outlines, canvas grid |
| `action` | `#1668E3` | Primary actions, active tool, current selection |
| `action-soft` | `#E8F0FD` | Selected rows and focused evidence paths |
| `grounded` | `#177A55` | Verified source-backed claims |
| `grounded-soft` | `#E4F2EB` | Grounded card edge/background accent |
| `derived` | `#9A650F` | Reasoned but not directly quoted content |
| `derived-soft` | `#F7EDD8` | Derived content accent |
| `creative` | `#7356B8` | Deliberately invented visual/story content |
| `creative-soft` | `#EEE8FA` | Creative content accent |
| `danger` | `#B23B32` | Failed, blocked, destructive, or stale conflict |
| `danger-soft` | `#F8E8E5` | Error/stale background accent |

Color communicates evidence state only when paired with an icon and text label.

## Typography

- **Interface:** Instrument Sans, with system sans fallback. Compact, human, and neutral enough for dense professional work.
- **Workshop and artifact titles:** Newsreader. Use sparingly for a confident editorial voice; never for controls or long body copy.
- **Evidence, IDs, locators, timing, and provenance:** IBM Plex Mono.
- Default body size: 14px with 1.45 line height.
- Rail metadata: 12px; controls never smaller than 12px.
- Workshop title: 22–26px Newsreader, medium weight.
- Artifact titles: 30–42px Newsreader inside focused previews.

All shipped fonts must have a verified redistribution license or use local/system fallbacks.

## Desktop composition

Design first for the ChatGPT in-app browser at approximately 1200×800, then verify wider and narrower states.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ Workshop / title     sync + intent + account       trace  more      │ 52
├──────────────┬──────────────────────────────────────┬────────────────┤
│ Sources      │ Map · Brief · Design · Story · View │ Studio         │
│ 264 px       │ flexible, visual center             │ 320 px         │
│              │                                      │                │
│ groups       │ cited semantic cards / artifact     │ output types   │
│ source rows  │ preview / storyboard                │ jobs/history   │
│ evidence     │                                      │ approvals      │
│              │                                      │                │
├──────────────┴──────────────────────────────────────┴────────────────┤
│ host status · last grounded update          Continue in ChatGPT  ↗  │ 36
└──────────────────────────────────────────────────────────────────────┘
```

- Top bar: 52px, flat surface, one hairline bottom border.
- Sources rail: 264px default, resizable 220–360px, collapsible to a 48px icon rail.
- Studio rail: 320px default, resizable 280–400px, collapsible to a 48px status rail.
- Center: never narrower than 560px on desktop. It receives all surplus width.
- Bottom host strip: 36px and visually quiet. It shows linked ChatGPT task state and the return action; it is not a composer.
- Rails sit flush with the canvas. Use borders, not detached floating panels.

## Primary screens

### 1. Workshop entry

Open the last active Workshop or the sanitized demo Workshop immediately. A compact Workshop switcher in the title bar replaces a large dashboard for the judged path. An optional library route may show a restrained card/list hybrid, but it must not delay the first useful state.

### 2. Map — default visual home

The Map is the product's hero screen and opens by default after a task is linked.

- Subtle 24px dot grid at low contrast.
- Cards resemble clipped editorial notes: mostly squared, 8px corners, thin outline, almost no shadow.
- A 3px left edge communicates `Grounded`, `Derived`, `Creative`, or `Unverified`.
- Each claim card shows a short locator chip such as `Meeting · 12:41` or `Brief.pdf · p. 7`.
- Evidence connections are thin curved lines; selecting a claim highlights its full claim→chunk→source path in action blue and mutes unrelated content.
- Clusters use labeled background regions rather than giant container cards.
- Priority appears through scale and placement, not rainbow colors.
- The approval action reads `Approve map as brief` and stays in the center toolbar only when the current version is eligible.

Signature motion: when new ChatGPT turns synchronize, small ink pulses enter from the host strip, pause as candidate notes, then settle into a cluster. The movement lasts under 700ms and respects reduced motion.

### 3. Source rail

Source rows show:

- source type and title;
- origin: `Local`, `ChatGPT task`, `Granola`, `Drive`, or other connected app;
- indexed/parsed status;
- source selection checkbox;
- grounded-claim count;
- permission/privacy state when relevant.

Clicking a source opens an adjacent evidence sheet over part of the center, not a full navigation away. The sheet shows searchable normalized content with highlighted chunk/locator and a `Show on Map` action.

### 4. Brief and Design review

`FRAME.md` and per-Workshop `DESIGN.md` render as designed documents with a split view:

- readable formatted document on the left;
- executable fields/tokens and provenance on the right.

Editing a field previews exactly which outputs would become stale. Style review uses real palette, type, logo, image-treatment, and layout previews—not a JSON form.

### 5. Studio rail

Studio is a production queue and output history, not a gallery of prompt cards.

- Top: five compact Output type actions—Deck, Infographic, Images, Storyboard, Video.
- Middle: active jobs with real progress stages and cancellation.
- Bottom: durable output history grouped by approved brief/style version.
- Current, stale, failed, and partial outputs remain visible and honest.
- Output-set selection is a subtle multi-select mode, not a permanent package metaphor.

### 6. Image batch

Use a contact-sheet layout with one dominant selected image and five coherent companions. Show shared Visual DNA, locked references, palette, and regeneration controls in a narrow inspector. `Regenerate selected` may not disturb sibling asset IDs or versions.

### 7. Storyboard

Use a horizontal filmstrip above a large selected-panel editor. Every panel displays duration, claim/source badges, narration state, and stale status. The second and final blocking action reads `Approve storyboard & render` only when every required panel is current.

### 8. Provenance / trace

Trace is a purposeful overlay that answers “why is this here?” It displays a vertical chain:

```text
source locator → evidence chunk → claim → Map node → brief block → output block
```

For the meta-demo, a `How WorkshopLM built this` view adds the raw task transcript, `GOAL.md`, dated log/commits, model operations, generated assets, and elapsed time without exposing unrelated local machine data.

## Components and geometry

- Primary buttons: 8px corners, 36px height, ink or action fill, concise verb-first labels.
- Secondary buttons: flat surface with hairline border; no tinted background unless selected.
- Icon buttons: 32px square, visible tooltip and accessible label.
- Cards: 8px corners; artifact pages may use 2px corners for a paper-like edge.
- Menus/popovers: 10px corners, restrained 12px shadow blur, clear keyboard focus.
- Status chips: compact 22px height; use only for state or origin, never decoration.
- Focus ring: 2px action blue with 2px offset.

## Motion

Motion explains state change:

- synchronized turn → candidate notes → settled cluster;
- approval → brief sheet folds into Studio inputs;
- output job → visible staged progression;
- stale propagation → affected paths illuminate, then settle with persistent labels;
- storyboard approval → panels lock in sequence before render begins.

No looping ambient animation. Standard transitions are 140–220ms; the signature Map ingestion sequence may reach 700ms. Honor `prefers-reduced-motion`.

## Responsive behavior

- **Wide desktop (≥1280):** full Sources + center + Studio.
- **Compact desktop/tablet (800–1279):** one rail open at a time; center remains primary.
- **Mobile (<800):** review companion only—Sources, transcript/evidence, approvals, output review, and `Continue in ChatGPT`. Do not render a fake miniature whiteboard or full slide editor.

The judged desktop path must be visually complete at 1200×800 and remain usable at 1024×768.

## Accessibility and truthfulness

- WCAG AA contrast, visible focus, semantic headings/landmarks, and keyboard operation for every non-spatial action.
- Provide a structured outline alternative to spatial Map navigation.
- Never encode grounding, stale, or approval state by color alone.
- Every progress state has text; indeterminate model work never displays fake percentages.
- Generated and AI-narrated assets are labeled honestly.
- The GUI may show a capability only when the current adapter/runtime supports it.

## Demo visual sequence

The three-minute video should capture these visual beats:

1. ChatGPT voice/text task beside the empty Workshop Map.
2. Messy turns resolve into cited clusters on the Map.
3. One evidence path opens from claim to exact source locator.
4. `Approve map as brief` creates the designed FRAME.md view.
5. Website-derived style visibly changes the same content system.
6. Studio produces a coherent contact sheet, deck, and editable storyboard.
7. `Approve storyboard & render` runs local HyperFrames.
8. The provenance view reveals that the displayed submission came from the original raw task.
