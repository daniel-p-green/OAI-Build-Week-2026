# WorkshopLM user-flow audit against NotebookLM

Date: 2026-07-15

## Verdict

WorkshopLM has a stronger professional-work contract than NotebookLM: explicit source scope, an editable semantic Map, two meaningful approvals, immutable output versions, and claim-level source trails. The weakness is the interaction architecture around that contract.

NotebookLM keeps three questions continuously answered: **what material is active, what am I working on, and what has been produced?** WorkshopLM answers each question in a different full-screen view or temporary sheet. The result is a more capable product that feels harder to understand and slower to operate.

This does not need a NotebookLM clone. It needs NotebookLM's stable geography applied to WorkshopLM's Capture -> Shape -> Deliver model.

## Evidence reviewed

- Seven NotebookLM reference screenshots in `research/screenshots/notebooklm/`
- Sixteen current WorkshopLM journey screenshots plus a generated manifest, contact sheet, and shareable ZIP in `outputs/workshoplm-current-ui/`
- Current route and state orchestration in `apps/web/app/page.tsx`
- Current responsive/layout rules in `apps/web/app/globals.css`
- Current goal, plan, and latest build-log evidence

## Anti-pattern verdict

**Partial fail.** The restrained monochrome system avoids the usual neon/gradient AI aesthetic, and the output gallery has a credible editorial direction. The product still carries several generated-interface tells:

- too many rounded cards and rounded sheets with nearly identical visual weight;
- large underused canvases, especially the Map, Brief, and empty Outputs states;
- the interface explains its process in copy instead of making the process spatially obvious;
- repeated full-screen mode changes make a coherent workbench feel like a set of demos;
- placeholder-like storyboard visuals and generic pale-blue tiles weaken the professional finish.

## Executive summary

**Score: 6/10 today.** The core workflow is coherent in the data model and acceptance suite, but only partially coherent on screen.

Issue count: **2 critical, 5 high, 5 medium, 2 low.**

The top five improvements are:

1. Introduce a stable desktop workbench with persistent Sources, current object, and Outputs/progress regions.
2. Turn Capture -> Shape -> Deliver into an interactive progress model with status and the next required action.
3. Make source selection and exact evidence inspection adjacent instead of sheet-driven.
4. Replace implicit header action swapping with an explicit current-stage action block.
5. Make Outputs a persistent, visually rich production rail and reserve focused views for review/editing.

## What NotebookLM gets right

### Stable geography

Sources remain on the left, the reasoning surface remains in the center, and Studio remains on the right. Panels can collapse, but their meaning and location do not change. This dramatically reduces reorientation cost.

### Selection stays visible

Source checkboxes, group expansion, the selected source, the current response, citations, and generated artifacts remain visible together. A user can change scope and immediately understand its effect.

### Outputs feel like an accumulating library

Studio is not a destination reached after generation. It is a persistent production history. Empty state, queued work, playable media, and finished artifacts share one predictable location.

### Citation inspection is contextual

A citation opens the supporting excerpt without removing the response, selected source, or output list. The user evaluates evidence without losing the object under review.

### Focus mode is exceptional, not routine

The output viewer takes over only when the artifact deserves full attention. Routine navigation stays inside the workbench.

## What WorkshopLM should preserve

- The Map is a differentiator; do not replace it with chat.
- Brief approval and Storyboard approval are meaningful professional gates.
- Active source scope is explicit and downstream staleness is honest.
- Exact claim-to-source trails are stronger than NotebookLM's generic source counts.
- Style is a reusable production input rather than a decorative afterthought.
- Immutable output/video history supports real professional revision.
- Mobile correctly becomes a linear object flow rather than a squeezed three-column desktop.

## Detailed findings

### Critical

#### C1. The product has no stable workbench

- **Location:** `WorkshopPage` view/sheet state and full-screen object switching (`page.tsx:118-130`, `232-260`, `277-330`).
- **Impact:** Every move among Map, Brief, Outputs, Storyboard, focused Output, Sources, Evidence, Style, and Workshop library changes the user's spatial model. Users repeatedly reconstruct context instead of advancing the work.
- **Evidence:** NotebookLM screenshots 02-06 preserve all three regions. WorkshopLM screenshots 01-15 repeatedly replace the center or cover it with a side sheet.
- **Recommendation:** On desktop, use a resizable three-region shell: `Sources | Current object | Production rail`. Preserve focused views for Brief editing, Storyboard editing, and artifact review, but keep the side regions or a clear return context available.

#### C2. The next action is implicit and changes location/meaning

- **Location:** conditional header actions (`page.tsx:291-309`).
- **Impact:** The same top-right location cycles through Approve brief, View brief, Choose style, Create outputs, Update outputs, View storyboard, Approve storyboard, Create video, and View video. Users must infer the workflow state from a changing button rather than read it.
- **Recommendation:** Add a persistent stage/progress block with `Current`, `Ready`, `Needs review`, and `Blocked by` states. Keep one clearly labeled next action there. Header actions should remain global, not become the workflow engine.

### High

#### H1. Source scope is too hidden for a source-grounded product

- **Location:** Sources are available only through a transient sheet (`page.tsx:292`, `324-327`, `645-667`).
- **Impact:** Users cannot compare source scope, Map content, and output consequences at once. Changing a checkbox can mark downstream work stale, but the affected work is offscreen.
- **Recommendation:** Keep a compact persistent source rail on desktop with selection, type, claim count, and add/capture actions. Open source detail inline within that rail.

#### H2. Evidence inspection breaks object continuity

- **Location:** `showSource` opens a separate evidence sheet (`page.tsx:253-260`, `326`).
- **Impact:** The source excerpt overlays or displaces the artifact being verified. This is better than losing the artifact entirely, but weaker than NotebookLM's adjacent citation context.
- **Recommendation:** Use a contextual evidence inspector anchored beside the current claim. Keep the selected claim visually highlighted in the Map, Brief, Storyboard, or Output while its exact excerpt is open.

#### H3. Outputs arrive too late in the user's mental model

- **Location:** Outputs become a full-screen destination only after Brief and Style readiness (`page.tsx:296-303`, `515-576`).
- **Impact:** Users cannot see the production system accumulating as they work. Empty, planned, rendering, current, and stale states feel like separate screens rather than one pipeline.
- **Recommendation:** Introduce a persistent production rail from the start. Show locked/empty placeholders early, then transition each item through Planned -> Generating -> Review -> Current/Needs update.

#### H4. Capture -> Shape -> Deliver is decorative rather than operational

- **Location:** header stage labels and orientation copy; actions are implemented elsewhere.
- **Impact:** The user sees the stages but cannot use them to understand completed work, blockers, or revisit a stage. On mobile, most of the stage model disappears.
- **Recommendation:** Make each stage selectable and stateful. Show completion, the governing artifact (`Sources + Map`, `Brief + Style`, `Outputs + Storyboard + Video`), and the next unmet gate.

#### H5. The Map looks sparse rather than powerful

- **Location:** full-canvas Map composition and hidden Excalidraw chrome (`globals.css:63-86`).
- **Impact:** Four small cards spread across a large white field read as unfinished. The causal/relational value of a semantic Map is not immediately visible.
- **Recommendation:** Auto-fit meaningful clusters, strengthen connectors and source-to-claim relationships, add a compact outline/minimap, and reserve empty space for intentional expansion rather than default scattering.

### Medium

#### M1. Workshop switching is hidden inside the title

- **Impact:** The collection/library model is less discoverable than NotebookLM's explicit home/library screen.
- **Recommendation:** Add a recognizable collection affordance and a real workshop gallery with title, source count, last activity, stage, and representative output thumbnail.

#### M2. Brief and Style feel bolted together

- **Impact:** The Brief is a wide document while Style occupies a narrow form rail. Their joint role as the approved production contract is not visually expressed.
- **Recommendation:** Present them as two explicit inputs to Deliver, with status, version, and edit/review actions. Avoid embedding initial Style setup as an incidental sidebar on the Brief.

#### M3. Output creation is overly bundled and opaque

- **Location:** `createOutputs` performs five sequential operations behind one action (`page.tsx:263-271`).
- **Impact:** Users see a generic busy state rather than which artifact is generating, failed, or ready. Partial success is harder to understand.
- **Recommendation:** Keep the convenient `Create output set` action, but reveal per-artifact progress and allow bounded retry at the failed artifact.

#### M4. The Outputs page uses space inefficiently

- **Impact:** Earlier states show a small storyboard row in a mostly empty page; later states improve substantially but still hide chronology, versions, and production progress.
- **Recommendation:** Use a dense two-column gallery plus a right-side state/history rail. Give the latest hero artifact priority, then supporting outputs, then stale history.

#### M5. Mobile is readable but loses production context

- **Location:** mobile CSS hides the editable canvas and compresses identity/stage context (`globals.css:287-325`).
- **Impact:** The vertical Map and Sources screens work independently, but users cannot see where they are in the larger production path or move quickly between current objects.
- **Recommendation:** Use a sticky bottom stage switcher or compact object switcher with status badges. Preserve source scope and next action as sticky context.

### Low

#### L1. Visual hierarchy relies too heavily on rounded containers

- **Impact:** Sources, claims, outputs, orientation, inspectors, and forms blur into a generic card system.
- **Recommendation:** Flatten list regions, use dividers and typography for structure, and reserve cards for true artifacts or selected objects.

#### L2. Professional output previews are inconsistent

- **Impact:** The real gallery is credible, while planned storyboard tiles and generic gradients look like placeholders from a different product.
- **Recommendation:** Use actual bound imagery, purposeful neutral placeholders, and consistent artifact metadata across planned and generated states.

## Recommended target flow

### Desktop

1. **Workshop library:** choose or create a Workshop from a visual, status-rich gallery.
2. **Workbench opens:** left Sources rail, center Map, right Production rail.
3. **Capture:** record/add sources in place; source scope and extraction progress remain visible.
4. **Shape:** edit the Map; selecting a claim opens exact evidence in the left inspector. The right rail shows `Brief ready for review`.
5. **Approve Brief:** focused review opens, with source rail still available in compact form. Approve and return to the same workbench.
6. **Set Style:** Style appears as the second Deliver prerequisite in the right rail, with current version and preview.
7. **Create output set:** right rail items visibly progress independently. The center remains useful rather than becoming a loading destination.
8. **Review an Output:** selecting an artifact makes it the center object; exact sources remain adjacent.
9. **Approve Storyboard:** focused editor opens with filmstrip, bound image, narration, and evidence inspector.
10. **Render and review Video:** video becomes the center object; version history and all supporting Outputs remain visible in the production rail.

### Mobile

Use the same object model as a single column, not three columns. A sticky object/stage switcher should expose Sources, Map, Brief, Outputs, and Storyboard with status and the next action.

## Phased implementation order

### Phase 1: information architecture

- Build the stable desktop shell and persistent production rail.
- Move Sources from modal sheet to persistent/collapsible rail.
- Make stage progress interactive and stateful.
- Move the next action from conditional header swapping into the progress model.

This phase solves the largest usability problem without changing domain contracts or generation behavior.

### Phase 2: contextual trust

- Add adjacent evidence inspection with selected-claim highlighting.
- Show source-scope changes and affected downstream artifacts together.
- Add per-artifact generation states and retries.

### Phase 3: professional finish

- Redesign Workshop library cards around real output thumbnails and progress.
- Improve Map auto-layout, connectors, and density.
- Flatten generic cards and reconcile placeholder/generation visuals.
- Add the mobile object switcher and verify realistic phone widths.

## Acceptance criteria for the redesign

- At any desktop moment, the user can identify active Sources, current object, and produced/planned Outputs without opening a modal.
- Changing source scope shows which downstream artifacts become stale before the user leaves context.
- Every approval has one obvious prerequisite, one obvious action, and one visible result.
- Every factual claim can reveal its exact source without hiding the claim under review.
- A new user can move from first source to first generated Output without relying on orientation prose.
- Mobile preserves the complete workflow and next action without reproducing the desktop columns.
- Existing deterministic `pnpm demo:e2e`, visual, accessibility, and stale-version contracts remain green.

## Decision

Proceed with Phase 1 before further visual polish. The current product is feature-complete enough to benefit from a structural UX pass, and continuing to polish individual full-screen views would reinforce the wrong interaction architecture.
