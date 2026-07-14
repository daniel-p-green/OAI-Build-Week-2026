# WorkshopLM UI/UX simplification audit

Date: 2026-07-14

## Verdict

The MVP proves the product architecture, but it presents too much of that architecture at once. It currently feels like an internal production console laid over NotebookLM's three-column shell. The winning redesign should make WorkshopLM feel like a native ChatGPT/Codex capability: conversation initiates the work, one calm fullscreen canvas shows the artifact that matters now, and complexity appears only when the user asks for it.

This is not a reduction in product capability. It is a reduction in simultaneous decisions.

## Evidence reviewed

- The live NotebookLM notebook `The Eight Levels of AI Adoption` in Chrome.
- Local NotebookLM research, including `notebooklm-user-flow.md` and `interface-direction.md`.
- The current WorkshopLM `apps/web` implementation and its six center views.
- The official `Apps in ChatGPT · OpenAI Official` Figma community page.
- OpenAI's official Apps SDK UI guidelines.

The Figma community page exposes `Open in Figma` as a duplicate action rather than a read-only design URL. It was not clicked because that would create an external Figma artifact. The public page and official Apps SDK guidance were sufficient to establish the design-system direction. A copied `/design/{fileKey}` can be inspected with the Figma connector later if an editable Figma deliverable is useful.

## What NotebookLM gets right

NotebookLM has many controls, but its mental model stays stable:

1. **Sources** define the evidence boundary.
2. **Chat** is the one central activity.
3. **Studio** offers named outputs and keeps generated artifacts beneath the creation choices.

Its strengths are behavioral rather than ornamental:

- the current notebook title and source scope stay visible;
- citations are inline with answers instead of isolated in a provenance mode;
- generated outputs are recognizable objects with titles, type icons, duration/source metadata, and direct playback;
- side panels collapse;
- creation starts with a named outcome rather than an artifact schema;
- the interface hides storage paths, graph revisions, job leases, and other implementation details.

NotebookLM's weakness is that the center is still chat-first and Studio often jumps from source material to a slow final result with limited intermediate control. WorkshopLM should keep its simple mental model while replacing the center with an editable thinking-to-production canvas.

## Where the MVP became overcomplicated

| Current MVP behavior | User cost | Redesign |
| --- | --- | --- |
| Six peer center tabs: Map, Sketch, Brief, Design, Story, Trace | The user must learn the internal artifact model before making progress | Three destinations only: **Map, Brief, Outputs** |
| Sources and Studio are both permanently visible | The primary canvas is squeezed and every state competes for attention | Sources becomes a collapsible drawer; creation becomes one **Create** sheet |
| Sketch, Design, Story, and Trace are treated as navigation modes | Output types and diagnostic tools look equally important as the core workflow | Sketch and Storyboard are Outputs; Style is contextual settings; Trace opens from a citation or Details |
| FRAME.md, DESIGN.md, versions, artifact paths, asset IDs, and gate states are exposed in normal UI | Product internals read as setup work | Human labels first; technical provenance lives under Details |
| Studio shows metadata rows where visual previews should be | The product claims visual production without visually proving it | Every output card has a real thumbnail or playable preview |
| Image batch is a list of panel IDs and regeneration buttons | Coherence cannot be judged | Full contact sheet with six actual images, one selected image, and one contextual inspector |
| Trace can display `No chunk yet` and other empty internal stages | Trust UI looks broken before it becomes useful | Hide absent stages; open trace at the selected claim and show only a complete path |
| Approval actions compete with editing and generation controls | The two important human decisions lose emphasis | One sticky action bar appears only when a gate is ready |
| Warm editorial shell and custom type compete with host chrome | The app feels adjacent to ChatGPT rather than native within it | Inherit system type, system spacing, neutral surfaces, monochrome icons, restrained accent |
| Mobile attempts to preserve production editing | It becomes a cramped desktop instead of a useful companion | Mobile is review, evidence, approval, and playback only |

## Official ChatGPT app implications

The official guidance describes apps as experiences that extend ChatGPT without breaking conversation flow. The key constraints for WorkshopLM are decisive:

- inline cards are single-purpose;
- a card should expose one primary CTA and at most one secondary CTA;
- cards should not contain tabs, deep navigation, nested scrolling, or duplicate ChatGPT inputs;
- fullscreen is appropriate for a rich map or interactive diagram;
- fullscreen must work with the system composer and should deepen the task rather than reproduce a native app wholesale;
- system font, color, spacing, radii, and monochrome outlined icons should be inherited;
- partner styling belongs in artifact content and restrained accents, not structural chrome;
- custom gradients and custom fonts should not redefine the host UI.

WorkshopLM should therefore have two deliberately different surfaces:

1. **Inline Workshop card:** current outcome, source count, readiness, one primary action (`Open workshop`) and one optional secondary action (`Create output`).
2. **Fullscreen Workshop canvas:** the Map, Brief, or selected Output, with ChatGPT's native composer remaining the conversational control surface.

## Revision: remove destination tabs entirely

The first simplification concept still showed `Map · Brief · Outputs` as three persistent tabs and added output-type filters. That is cleaner than the MVP but still asks the user to manage the product's information architecture.

The stronger design is **one Workshop, one current object, one contextual action**:

- no persistent tabs;
- no persistent output-type filters;
- no permanent inspector;
- no separate Studio mode;
- no top-level workflow stage selector.

Map, Brief, Sketch, Deck, Infographic, Image Batch, Storyboard, and Video remain fully capable objects. They are reached through a transient Workshop Library, links from the current object, the host conversation, or Back—not through permanent chrome.

## New product architecture

### Global shell

- Compact top bar: Back, Workshop title/current object breadcrumb, Sources, and one context-sensitive primary action.
- The current object name is a title, not a tab. Its chevron opens the Workshop Library as a transient sheet.
- No permanent Studio rail.
- Sources collapse into a left drawer and open from one labeled button with a count.
- The center receives at least 80% of the usable width by default.
- A contextual right inspector appears only after selecting an object.
- Host/status information moves into a small Details popover; no permanent bottom strip.
- Create choices appear only after the brief is ready. Before that moment, the action is `Approve brief`; after it, the same toolbar position becomes `Create`.

### Map

- Default home and hero screen.
- Starts with the generated clusters, not an explanatory empty canvas.
- Source badges sit on claim cards and open the exact evidence in a drawer.
- Editing controls appear on selection; advanced graph operations stay in a contextual menu.
- When the current Map is eligible, one sticky bar reads `Ready to turn this into a brief` with `Approve brief` as the sole primary action.

### Brief

- Render the approved brief as a readable professional document.
- Use plain-language section names; `FRAME.md` is shown only in Details/export.
- Style is a compact `Style` control with a live visual preview, not a permanent peer destination.
- Website-derived design review appears as a focused sheet: logo, palette, type, imagery, confidence, and one `Use this style` action.

### Workshop Library and outputs

- A transient visual Library sheet is inspired by NotebookLM's durable output list but optimized for professional assets.
- Cards show a real thumbnail/player, title, type, current/stale state, and last update.
- `Create` opens a sheet with Deck, Infographic, Images, Storyboard, and Video.
- The Library opens as an overlay from the current object title or a keyboard shortcut. It has search, not persistent type filters.
- Clicking an output dismisses the Library and opens that object in the single canvas. Editing and provenance controls appear only for that object.
- Storyboard approval appears as the second and final sticky gate. Video rendering is a consequence of that approval, not another workflow mode.

### Grounding and provenance

- Citations live next to the claim, brief block, slide, image prompt, or storyboard panel they support.
- Selecting a citation opens an evidence drawer with source excerpt and locator.
- `Why this?` expands the downstream claim path when needed.
- The global build provenance view remains available from Details for the meta-demo, but it is not top-level navigation.

## OpenAI-aligned visual system

- Canvas: `#FFFFFF`; application background: `#F7F7F8`; primary text: `#0D0D0D`; muted text: `#6B6B6B`; dividers: `#E5E5E5`.
- Primary actions: near-black. Use `#10A37F` only for verified/current evidence states, never as decorative branding.
- Use the host system font stack. Do not use Newsreader, Instrument Sans, or IBM Plex Mono in structural UI.
- Use 8/12/16/24 spacing, 10–14px radii, restrained shadows, and monochrome outlined 16–20px icons.
- Reserve soft blue/lilac generative color for output imagery, loading, and selected creative content—not page backgrounds or navigation.
- Customer brand styles apply inside generated artifacts and previews, not to WorkshopLM chrome.

## Three concept screens

1. **Map / thinking canvas** — no tabs, Sources collapsed, evidence-backed clusters centered, inspector closed, and `Approve brief` as the only primary action.
2. **Workshop Library sheet** — a transient visual overlay with real thumbnails for the Map, Brief, deck, infographic, image batch, storyboard, and video; no filter tabs.
3. **Storyboard detail** — the Library is gone, the storyboard is the single object, narration/source details appear only after selection, and `Approve & render video` is the only primary action.

## Acceptance bar for “100x better”

The redesign is successful when:

- a first-time user can state what object is open and what to do next after five seconds;
- the default viewport exposes no more than five actionable controls;
- every screen has one visually dominant next action or none;
- the Map owns at least 80% of default workspace width;
- no raw filesystem path, internal asset ID, gate flag, or absent provenance stage appears in normal UI;
- every finished output has a visual preview above its metadata;
- citations open the exact source location in one interaction;
- the complete recorded-fixture flow still works without changing the domain model;
- desktop works at 1200×800, compact desktop opens one drawer at a time, and mobile is a deliberate review surface;
- the public demo can show the entire product promise through three visual states: Map, transient Library, Storyboard.

## Recommended implementation sequence

1. Remove the six-tab route without replacing it with another persistent tab row; render one current Workshop object at a time.
2. Add a title/breadcrumb-triggered Workshop Library sheet for object switching and search.
3. Convert Sources and creation/history into closed-by-default drawers/sheets; remove the permanent host strip.
4. Build real output cards and a center output preview using existing artifact data.
5. Move Style, Trace, Sketch, and Storyboard to contextual flows attached to their relevant objects.
6. Replace internal terminology and paths with human labels; retain technical details in a disclosure panel.
7. Apply the ChatGPT-aligned token and typography system without rewriting component primitives.
8. Add component tests for progressive disclosure, the two approval gates, and empty-state suppression.
9. Re-record desktop/mobile evidence and rerun `pnpm demo:e2e` before resuming judge-facing capture.
