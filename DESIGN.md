# WorkshopLM Interface Design System

Status: locked simplified interface for the hackathon build (updated 2026-07-15)

This file governs WorkshopLM's product UI. A Workshop's generated brand system is a separate technical export stored as `DESIGN.md` plus machine-readable tokens; it does not control WorkshopLM chrome.

## Design thesis

WorkshopLM is a **conversation-native thinking and production canvas**, not an AI dashboard.

It should feel native inside ChatGPT/Codex: one calm artifact surface, a clear next action, and complexity revealed only in context. Customer brand expression belongs inside generated work; WorkshopLM's structural chrome inherits the host's neutral system language without copying OpenAI marks or implying an official OpenAI product.

The memorable visual remains **evidence becoming structure**: a native ChatGPT conversation creates cited cards on a spacious Map, those cards become an approved Brief, and the same content becomes recognizable professional Outputs.

## Simplification rule

The product may be technically deep, but the default viewport must not expose the whole system. WorkshopLM renders **one current object at a time**. It has no persistent tabs, stage selector, generic Library, or destination rail inside a Workshop. Map, Brief, Outputs, Storyboard, Video, and each selected Output are reached through Back, a direct link, the host conversation, or the current screen's one contextual action.

Sources, Style, source evidence, creation controls, jobs, versions, and technical details are contextual sheets, inspectors, or disclosures. The default view shows the current work, `{n} sources`, and one next action—nothing else.

## Surface model

WorkshopLM has two coordinated native surfaces:

1. **Codex task** — conversation, questions, reasoning, and plugin commands; voice enters through the Workshop's capture control.
2. **In-app browser Workshop** — Sources, Map, Brief, Style, Outputs, Storyboard, Video, and exact source evidence.

The browser contains no second chat transcript or general chat composer. Codex remains the verified conversation surface. The final demo voice path is a narrow capture-only Realtime control inside `Add source`; it records a transcript Source and disappears when the sheet closes. ChatGPT Work parity is not part of the verified hackathon surface.

The inline plugin widget is a single-purpose doorway. It shows Workshop title, source count, current outcome/status, and at most two actions: one primary `Open workshop` action and one optional contextual secondary action. It has no tabs, nested navigation, or duplicate composer.

## Official component boundary

`Apps in ChatGPT · OpenAI Official (Community)` is the sole design-system source for WorkshopLM's product chrome. Every user-interface control and container must map to a verified component, variable, text style, effect style, icon, spacing value, or display-mode template from that file. Do not approximate a ChatGPT-like component, invent a parallel token, or keep custom shell styling merely because it already exists in the MVP.

Before a component or style is implemented, record its exact Figma name and source node or variable identifier in the project inventory. If the library has no matching primitive, compose verified library primitives; do not create a new visual language. WorkshopLM-specific content may remain custom only where it expresses the product's domain rather than application chrome—for example Map nodes and edges, evidence-path geometry, generated artifact imagery, charts, slide previews, and storyboard media. The frames, controls, labels, menus, sheets, status treatments, and typography around that content still come from the official library.

The verified source inventory is [research/openai-apps-figma-component-inventory-2026-07-14.md](research/openai-apps-figma-component-inventory-2026-07-14.md). The tables below are reconciled to that file. `packages/ui/src/contract.ts` is the machine-readable implementation allowlist, and `apps/web/app/oai-ui-contract.test.ts` enforces the boundary.

## Visual atmosphere

Calm, exact, and native to the ChatGPT/Codex environment. **Use the official chrome; reserve invention for the work itself.** WorkshopLM's identity lives in three proprietary work surfaces: the relational Map, exact source paths, and coherent Outputs and Storyboard media.

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
- **Evidence, locators, timing, and technical details:** use system body-small styling; monospace is reserved for explicit technical detail views.
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
│  optional Sources sheet                    optional claim inspector │
│                                                                      │
│                 contextual approval bar when ready                   │
└──────────────────────────────────────────────────────────────────────┘
```

- Top bar: 52px, flat white `Navigation/Header`. It contains Back when needed, `Workshop / current object`, the `{n} sources` secondary Button, and at most one context-sensitive primary Button.
- The current object title is not navigation. Object changes come from the active workflow, direct links, Back, or the host conversation.
- Sources: closed by default; the same control opens an official SideSheet from every object and returns focus to its trigger when closed.
- Creation: `Create outputs` produces the configured deliverables from the approved Brief, current Style, and active Sources. `Update outputs` replaces it when dependencies change or creation is partial.
- Context inspector: closed by default and appears only after selecting a Map claim. Its title and actions are specific; source evidence always opens the `Source` sheet.
- Center: at least 80% of default workspace width and never narrower than 640px on desktop.
- Technical state is absent from the default path. Do not reserve a permanent host strip, activity strip, status bar, or bottom approval bar.

## Primary screens

### 1. Workshop entry

Open the last active Workshop or sanitized demo Workshop immediately on its Map. Do not insert a dashboard, chooser, onboarding carousel, or Workshop library into the judged path.

### 2. Map — default visual home

The Map is the product's hero screen and opens by default after a task is linked.

- A quiet white Excalidraw canvas is the interaction engine. Its menus, toolbar, export controls, context menu, zoom controls, and other native product chrome stay hidden; the Apps in ChatGPT primitives remain the only WorkshopLM chrome.
- Sources occupy a stable left region. Semantic nodes occupy the open work field, with grounded, derived, and creative states distinguished by restrained green, orange, and blue treatments.
- Thin arrows expose direct source→node evidence and semantic node→node relationships. The canonical graph and durable locators remain the truth; Excalidraw owns presentation geometry only.
- Users drag and resize semantic nodes directly and double-click their bound text to edit it. Position, size, and title changes persist through typed graph operations, invalidate approved downstream work, and can be restored through WorkshopLM's `Undo` action.
- Selecting a node opens one contextual claim inspector. `Show source` opens the exact source excerpt and locator, and closing the sheet returns to the selected Map context.
- Source nodes are reference anchors rather than freeform content. Selecting one opens the Source sheet instead of introducing a second inspector or navigation system.
- Desktop and compact widths render the spatial canvas. Mobile renders a calm review outline over the same semantic graph; it does not pretend to be a miniature whiteboard.
- The approval action reads `Approve brief`; after approval, the same position becomes `View brief`.

The hackathon path does not depend on ingestion animation. New nodes may appear with a short standard transition only when it helps the user understand what changed; reduced-motion mode removes it.

### 3. Sources sheet

Source rows show:

- source type and title;
- origin: `Local`, `ChatGPT task`, `Granola`, `Drive`, or other connected app;
- source selection checkbox;
- grounded-claim count;
- a selected-source preview with exact excerpt and locator.

Clicking a row updates the preview without navigating. `Show on map` closes the sheet, returns to Map, and selects the related semantic node. A factual citation uses `Show source` to open the exact excerpt and locator in the Source sheet.

### 4. Brief and Style

The Brief is a readable product view, not raw Markdown. It shows the approved outcome, evidence, success condition, source locators, and current Style in one centered document.

Style opens as the `StyleSetup` composite: official SideSheet, selectable ListRows, fields, Buttons, and palette/type previews. `Start from` chooses a public website or manual rules; `Use it for` chooses Client pitch, Board presentation, or Team workshop. Manual brand details stay collapsed until requested. Both sources resolve into the same versioned Style data, and updating Style marks dependent work `Needs update`.

Technical exports such as `FRAME.md`, `DESIGN.md`, tokens, model IDs, hashes, and version mechanics appear only under technical Details or export. They never replace the formatted Brief or Style views.

### 5. Outputs history

After Brief approval and Style selection, Outputs becomes the durable history of professional work. Every completed Output has a distinct real thumbnail or playable preview above quiet metadata.

- `Create outputs` creates the selected types from the same Brief, Style, and source scope.
- Presentation and infographic versions remain visible newest-first with a real preview, type, version, freshness, source coverage, and one card-level open action.
- Video follows the same rule: the first render remains one ordinary peer card; after a re-render, immutable versions appear newest-first as `Video · Version N`, with older versions labeled `Needs update` and still openable at their original bytes.
- Presentation, infographic, image set, Storyboard, and Video are peers in one responsive card grid. None is demoted into a secondary rail or carousel.
- Image set and Storyboard cards use compact domain previews inside the official media-card boundary; each opens its one focused review surface.
- `Needs update` and partial messages appear only when they change the next action; current, stale, failed, and partial work remains visible without internal paths.
- A focused factual Output and the focused image set use `Show source`; the focused Video uses `Show original` for the meta-demo before/after reveal.
- Provider-planned images remain explicitly labeled until genuine provider bytes exist.

### 6. Image batch

The Outputs card uses a compact contact sheet for six visually coherent panels. Opening it replaces the gallery with a calm six-up review surface: three columns on wide desktop and two on compact/mobile. Each tile says `Planned`, `Ready`, `Needs update`, or `Couldn't create`; a ready tile opens its real image file. Shared Style, references, palette, and selective regeneration remain batch state rather than new permanent UI. Regenerating one panel may not disturb sibling IDs or versions.

### 7. Storyboard

Use a horizontal filmstrip above a large selected-panel editor. Every panel displays duration, editable title and narration, source access, and stale status. `Show source` resolves the selected panel's stored claim, chunk, source, and locator; it may not fall back to an unrelated first source. When an image set exists, each panel binds one exact image-panel ID and version; the filmstrip, selected-panel preview, and local video renderer must resolve those same bytes. Regenerating a bound image to a new version marks the affected Storyboard path `Needs update` and revokes its approval. The second and final blocking action is `Approve storyboard`. Only after approval does the same header position become `Create video`.

### 8. Source evidence and original reveal

`Show source` opens the contextual Source sheet from a factual claim. It answers “why is this here?” and displays only the complete available chain:

```text
source locator → evidence chunk → claim → Map node → brief block → output block
```

For the meta-demo, the focused Video replaces `Show source` with one secondary `Show original` action. It opens the `OriginalReveal` composite beside the finished Video so the before/after relationship is visible without adding navigation or another permanent panel. `OriginalReveal` is composed only from the official `SideSheet`, `Card`, body/caption text, `ListGroup`, `ListRow`, and `FileIcon` primitives. It shows the first durable transcript when present, otherwise an explicitly labeled sanitized source excerpt; it never upgrades fixture text into live voice evidence. Its After list names the presentation, infographic, image set, Storyboard, and Video with honest current states. Technical build evidence remains separate from this product-facing reveal.

Every rendered Video writes an immutable, version-specific MP4 and machine-readable provenance sidecar. Its persisted record pins the Storyboard, Style, Visual DNA, image batch, claims, content-addressed artifact, byte count, and creation time. For each timed scene the sidecar records the approved Storyboard panel, durable claim/source/chunk edge, exact locator and excerpt, bound image ID/version/hash, and narration hash/provider when present. Upstream edits mark prior records stale without deleting or redirecting them; the latest current version alone backs the canonical Video alias and submission package. The sidecar travels with the traced submission Output set and stays under technical evidence rather than becoming another primary Video control.

The same render emits a version-specific build record in human-readable HTML and machine-readable JSON. It is derived from the actual Workshop state, append-only `log.md`, and Build Week Git history at render time: transcript excerpts, active Source locators and permissions, Map size, approved Brief/Style/Storyboard versions, hashed current Outputs, Video hash, elapsed time, logged milestones, available Codex task IDs, provider-backed evidence counts, and explicit limitations. It is available contextually from `Show original → How this was built`, never as a permanent tab or primary workflow action, and both files travel in the verified submission Output set.

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
- brief approval → the current Map becomes the readable Brief;
- output job → visible staged progression;
- stale propagation → affected paths illuminate, then settle with persistent labels;
- storyboard approval → panels lock in sequence before render begins.

No looping ambient animation. Standard transitions are 140–220ms; the signature Map ingestion sequence may reach 700ms. Honor `prefers-reduced-motion`.

## Responsive behavior

- **Wide desktop (≥1200):** one current object with an optional Sources sheet or claim inspector; both are closed by default.
- **Compact desktop/tablet (621–1199):** one current object; only one sheet or inspector may be open at a time.
- **Mobile (≤620):** review and approval companion. Map becomes a semantic outline; Sources, evidence, Brief, Outputs, Storyboard, Video, and the original reveal remain readable. Do not render a fake miniature whiteboard or full slide editor.

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

1. A Codex-side WorkshopLM doorway opens the local Workshop.
2. A dated brainstorm Source becomes cited clusters on the editable Map.
3. `Show source` opens one exact excerpt and locator; a Map edit makes dependent work `Needs update`.
4. `Approve brief` creates the readable Brief.
5. Style visibly locks the palette and type system for every Output.
6. `Create outputs` produces the presentation, infographic, image set, and editable Storyboard.
7. `Approve storyboard` enables `Create video`; the local worker renders the approved current Storyboard.
8. A focused factual Output opens its Source; the focused Video uses `Show original` to reveal the brainstorm beside the five connected Outputs.
