# WorkshopLM Interface Design System

Status: revised simplification direction for the hackathon build (2026-07-14)

This file governs WorkshopLM's product UI. Per-Workshop brand systems generated from customer sources are separate artifacts stored with that Workshop as `DESIGN.md` plus machine-readable tokens.

## Design thesis

WorkshopLM is a **conversation-native thinking and production canvas**, not an AI dashboard.

It should feel native inside ChatGPT/Codex: one calm artifact surface, a clear next action, and complexity revealed only in context. Customer brand expression belongs inside generated work; WorkshopLM's structural chrome inherits the host's neutral system language without copying OpenAI marks or implying an official OpenAI product.

The memorable visual remains **evidence becoming structure**: a native ChatGPT conversation creates cited cards on a spacious Map, those cards become an approved brief, and the same content becomes a gallery of polished outputs.

## Simplification rule

The product may be technically deep, but the default viewport must not expose the whole system. WorkshopLM renders **one current object at a time**. It has no persistent tabs, stage selector, or generic Library drawer inside a Workshop. Map, Brief, the output package, Storyboard, and every generated asset are reached through Back, direct links, the host conversation, or the current screen's one contextual action.

Sources, Style, Trace, creation controls, jobs, versions, and technical provenance are contextual drawers, sheets, inspectors, or disclosures. This rule supersedes older clauses in this document that prescribe persistent rails, center tabs, output filters, a host strip, or Studio as an always-open production console.

## Surface model

WorkshopLM has two coordinated native surfaces:

1. **ChatGPT task** — conversation, voice, questions, reasoning, and plugin commands.
2. **In-app browser Workshop** — Sources, Map, FRAME.md/DESIGN.md review, Studio, asset batches, storyboard, final outputs, and provenance.

The browser contains no second chat transcript, composer, or capture textarea. ChatGPT remains the conversation and voice surface. If native voice synchronization fails its July 14 spike deadline, the capture-only fallback remains an implementation seam invoked from the host—not a competing browser interface.

The inline plugin widget is a single-purpose doorway. It shows Workshop title, source count, current outcome/status, and at most two actions: one primary `Open workshop` action and one optional contextual secondary action. It has no tabs, nested navigation, or duplicate composer.

## Official component boundary

`Apps in ChatGPT · OpenAI Official (Community)` is the sole design-system source for WorkshopLM's product chrome. Every user-interface control and container must map to a verified component, variable, text style, effect style, icon, spacing value, or display-mode template from that file. Do not approximate a ChatGPT-like component, invent a parallel token, or keep custom shell styling merely because it already exists in the MVP.

Before a component or style is implemented, record its exact Figma name and source node or variable identifier in the project inventory. If the library has no matching primitive, compose verified library primitives; do not create a new visual language. WorkshopLM-specific content may remain custom only where it expresses the product's domain rather than application chrome—for example Map nodes and edges, evidence-path geometry, generated artifact imagery, charts, slide previews, and storyboard media. The frames, controls, labels, menus, sheets, status treatments, and typography around that content still come from the official library.

The verified source inventory is [research/openai-apps-figma-component-inventory-2026-07-14.md](research/openai-apps-figma-component-inventory-2026-07-14.md). The tables below are now reconciled to that file. `apps/web/app/oai-ui-contract.ts` is the machine-readable implementation allowlist.

## Visual atmosphere

Calm, exact, and native to the ChatGPT/Codex environment. **Use the official chrome; reserve invention for the work itself.** WorkshopLM's identity lives in three proprietary work surfaces: the relational Map, the synchronized evidence trace, and the coherent output package/storyboard.

Avoid:

- decorative AI gradients, glassmorphism, neon glows, and chat bubbles;
- excessive pills, giant empty cards, and decorative metrics;
- copying NotebookLM colors or Google's visual identity;
- hiding evidence, approvals, or stale states behind hover-only UI;
- turning every section into the same shadcn card treatment.

## Color system

| Token | Value | Role |
| --- | --- | --- |
| `paper` | `#FFFFFF` | Primary canvas and artifact background |
| `surface-secondary` | `#E8E8E8` | Segmented controls and secondary surfaces |
| `surface-tertiary` | `#F3F3F3` | Selected rows and quiet grouped areas |
| `ink` | `#0D0D0D` | Primary text and high-emphasis strokes |
| `ink-secondary` | `#5D5D5D` | Secondary labels and metadata |
| `ink-tertiary` | `#8F8F8F` | Tertiary labels and disabled metadata |
| `hairline-5` | `rgba(13,13,13,.05)` | Dividers and quiet boundaries |
| `hairline-10` | `rgba(13,13,13,.10)` | Controls and menus |
| `hairline-15` | `rgba(13,13,13,.15)` | Cards and stronger boundaries |
| `action` | `#0D0D0D` | Primary actions and highest-emphasis controls |
| `accent-blue` | `#0285FF` | Focus, selected evidence paths, and creative labels |
| `accent-green` | `#008635` | Verified source-backed claims and current state |
| `accent-orange` | `#E25507` | Derived content and waiting state |
| `accent-red` | `#E02E2A` | Failed, blocked, destructive, or stale conflict |

Color communicates evidence state only when paired with an icon and text label.

## Typography

- **Interface:** SF Pro on web through the Apple system font stack.
- **Workshop titles:** use the same system family with restrained weight and size changes.
- **Generated artifacts:** may use the active Workshop style library inside the artifact preview only.
- **Evidence, locators, timing, and provenance:** use system body-small styling; monospace is reserved for explicit technical detail views.
- Heading 1: 36/40, semibold, -0.10px tracking.
- Heading 2: 24/28, semibold, -0.25px tracking.
- Heading 3: 18/26, semibold, -0.45px tracking.
- Body: 16/26 regular or semibold, -0.40px tracking.
- Body small: 14/18 regular or semibold, -0.30px tracking.
- Caption: 12/16 regular or semibold, -0.10px tracking.
- Artifact titles: follow the generated artifact's own style inside focused previews.

All shipped fonts must have a verified redistribution license or use local/system fallbacks.

## Desktop composition

Design first for the ChatGPT in-app browser at approximately 1200×800, then verify wider and narrower states.

```text
┌──────────────────────────────────────────────────────────────────────┐
│ ‹  Workshop / current object       Sources 3        primary action  │ 52
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│                     one focused canvas                               │
│              Map / Brief / selected Output                           │
│                                                                      │
│  optional source drawer                    optional context inspector│
│                                                                      │
│                 contextual approval bar when ready                   │
└──────────────────────────────────────────────────────────────────────┘
```

- Top bar: 52px, flat white `Navigation/Header`. It contains Back, the current object title and purpose, a source-scope Token, and one context-sensitive primary Button.
- The current object title is not navigation. Object changes come from the active workflow, direct links, Back, or the host conversation.
- Sources: closed by default; a 360px reference column may expand to 420px for readable ListRows and evidence excerpts.
- Creation: one `Generate package` action creates the configured deliverable set. Output-type customization is secondary. There is no permanent Studio rail.
- Context inspector: closed by default and appears only after selecting a Map node, citation, storyboard panel, or output element. Its title is specific—Evidence, Claim, Source, Panel, or Artifact—never generic Details.
- Center: at least 80% of default workspace width and never narrower than 640px on desktop.
- Host synchronization and technical state live under Details. Do not reserve a permanent bottom strip.

## Primary screens

### 1. Workshop entry

Open the last active Workshop or the sanitized demo Workshop immediately. A compact Workshop switcher in the title bar replaces a large dashboard for the judged path. An optional library route may show a restrained card/list hybrid, but it must not delay the first useful state.

### 2. Map — default visual home

The Map is the product's hero screen and opens by default after a task is linked.

- A quiet white Excalidraw canvas is the interaction engine. Its menus, toolbar, export controls, context menu, zoom controls, and other native product chrome stay hidden; the Apps in ChatGPT primitives remain the only WorkshopLM chrome.
- Sources occupy a stable left region. Semantic nodes occupy the open work field, with grounded, derived, and creative states distinguished by restrained green, orange, and blue treatments.
- Thin arrows expose direct source→node evidence and semantic node→node relationships. The canonical graph and durable locators remain the truth; Excalidraw owns presentation geometry only.
- Users drag and resize semantic nodes directly and double-click their bound text to edit it. Position, size, and title changes persist through typed graph operations, invalidate approved downstream work, and can be restored through WorkshopLM's `Undo` action.
- Selecting a node opens one contextual claim inspector. `Show source` opens the exact source excerpt and locator, and closing the sheet returns to the selected Map context.
- Source nodes are reference anchors rather than freeform content. Selecting one opens its source trace instead of introducing a second inspector or navigation system.
- Desktop and compact widths render the spatial canvas. Mobile renders a calm review outline over the same semantic graph; it does not pretend to be a miniature whiteboard.
- The approval action reads `Approve brief`; after approval, the same position becomes `View brief`.

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

### 5. Coherent output package

After Brief and Style approval, the output package becomes the primary home. Every completed output has a distinct real thumbnail or playable preview above its metadata.

- One `Generate package` action creates the selected output types from the same Brief, Style, and source scope.
- The package header surfaces Brief version, Style version, active source count, and stale status.
- Each artifact shows its own aspect ratio, Style version, citation coverage, current/stale state, and one Open or Trace action.
- A compact activity disclosure shows real job stages, cancellation, failures, and partial success.
- Current, stale, failed, and partial outputs remain visible and honest without exposing internal artifact paths.
- Provider-planned images remain explicitly labeled until genuine provider bytes exist.

### 6. Image batch

Use a contact-sheet layout with one dominant selected image and five coherent companions. Show shared Visual DNA, locked references, palette, and regeneration controls in a narrow inspector. `Regenerate selected` may not disturb sibling asset IDs or versions.

### 7. Storyboard

Use a horizontal filmstrip above a large selected-panel editor. Every panel displays duration, claim/source badges, narration state, and stale status. The second and final blocking action reads `Approve storyboard & render` only when every required panel is current.

### 8. Provenance / trace

Trace is a contextual evidence drawer opened from a citation or `Why this?` control. It answers “why is this here?” and displays only the complete available chain:

```text
source locator → evidence chunk → claim → Map node → brief block → output block
```

For the meta-demo, a `How WorkshopLM built this` view adds the raw task transcript, `GOAL.md`, dated log/commits, model operations, generated assets, and elapsed time without exposing unrelated local machine data.

## Components and geometry

- Primary buttons: verified Button large, 36px height, 8px 16px padding, 4px content gap, 999px radius, ink fill, and 14/20 medium label.
- Secondary buttons: the corresponding Button secondary variant with the same geometry.
- Icon buttons: verified IconButton with accessible label.
- Tokens: 42px reference height, 12px 16px padding, 25px radius, and 10% ink stroke; compact citation compositions may reduce vertical padding while preserving the Token language.
- Cards: 24px radius, 0.5px 15% ink border, and 0 4px 16px 5% shadow.
- Menus/popovers: 12px radius, 6px inner padding, 10% ink stroke, and the verified two-part shadow.
- Status is body-small or caption text paired with an official accent. Do not invent a decorative status pill.
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

- **Wide desktop (≥1280):** one current object with optional source drawer or context inspector; both are closed by default.
- **Compact desktop/tablet (800–1279):** only one drawer may be open at a time; center remains primary.
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
6. The approved system produces one coherent package: contact sheet, deck, infographic, storyboard, and video.
7. `Approve storyboard & render` runs local HyperFrames.
8. A compact plugin trace widget opens the provenance view, which reveals that the displayed submission came from the original raw task.
