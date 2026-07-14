# Interface direction

Updated: 2026-07-13

Current visual authority: root [`DESIGN.md`](../DESIGN.md). This file records the product rationale behind that system.

## Design intent

The interface should feel native beside ChatGPT: quiet, direct, and powerful without duplicating ChatGPT's conversation UI. NotebookLM contributes the clear relationship between Sources, conversation, and outputs; WorkshopLM distributes that model across the native ChatGPT task and one visual browser workspace. Pomelli contributes progressive brand extraction and review.

## Product shell

The ChatGPT task is the Conversation/voice layer. The WorkshopLM plugin links it to one durable Workshop and opens the local browser workspace. That workspace contains Sources, Map, Style, and Studio outputs, with three conceptual stages:

- **Capture** — voice and conversation;
- **Shape** — interactive whiteboard;
- **Deliver** — a Studio of output types and production controls.

Text and voice remain in ChatGPT. The browser never renders a second composer; it exposes a restrained `Continue in ChatGPT` return action.

## Stage 1: Capture

Primary surface: the native ChatGPT task with the WorkshopLM plugin selected. The linked browser Workshop reflects task turns, source scope, candidate claims, and readiness to shape.

The interface should encourage speed and messiness. Do not ask for a campaign type, format list, audience matrix, or design configuration before the user has expressed the idea.

## Stage 2: Shape

The whiteboard takes the majority of the browser workspace. Conversation remains in the adjacent/native ChatGPT task rather than a collapsible duplicate panel.

Primary whiteboard capabilities:

- auto-clustered idea cards;
- labeled relationships and dependency arrows;
- source/claim chips on grounded nodes;
- priority, confidence, and unresolved states;
- drag, resize, connect, merge, split, edit, lock, and delete;
- voice commands that act on the current selection;
- history and undo for both user and AI edits;
- “Approve as brief” as the production gate.

The Excalidraw scene is the visual representation, not the only data source. A semantic idea graph preserves node meaning, citations, hierarchy, and downstream dependencies independently of coordinates.

The approved whiteboard model exposes two treatments of that same graph:

- **Map:** the editable Excalidraw thinking surface and source of user spatial changes.
- **Sketch:** a polished hand-drawn synthesis generated from an approved graph version for presentation and sharing.

Sketch is not independently editable. A requested content change returns to the graph as a typed operation, updates Map, and marks the current Sketch output stale until refreshed.

## Stage 3: Deliver

Deliver opens as **Studio**, not an empty media editor or a mandatory fixed package. The user chooses an output type and can create one output or an output set from the same approved Workshop state.

Recommended layout:

- top: active Style Library, Intent Profile, and Visual DNA version;
- left rail: output types and existing outputs including presentation, infographic, mind map, audio overview, storyboard, images, video, and Site;
- center: selected asset or batch grid;
- right inspector: content, visual treatment, source trace, version, regeneration, and approval controls;
- bottom or background tray: generation queue with progress and failures.

The storyboard is a first-class asset and a required gate before video rendering. Each panel is directly editable and traceable to its source, narration, image prompt, and transition.

## Style Library onboarding

### URL path

1. Paste a website.
2. Watch named extraction steps: logo, color, typography, imagery, voice.
3. Review high-confidence findings first.
4. Correct uncertain or stale findings.
5. Save as a Brand Foundation.
6. Choose or create an Intent Profile.

### Manual path

- upload logos and reference images;
- enter exact hex values;
- upload or select licensed fonts;
- specify layout, voice, image, and motion rules;
- add negative constraints.

## Batch image experience

Borrow the useful interaction model of creative generation grids without copying Sora or Flow styling:

- show several candidates simultaneously;
- let users compare, favorite, lock, and regenerate;
- make the shared Visual DNA visible;
- identify outliers automatically;
- allow per-frame prompts while keeping shared constraints locked;
- never imply that a shared seed guarantees consistency when it does not.

## Visual language

- warm near-white canvas and high-contrast neutral text;
- restrained borders, minimal shadows, and medium radii;
- one product accent distinct from OpenAI's marks;
- editorial typography for assets, compact utility typography for controls;
- short functional motion for clustering, dependency highlights, progress, and asset swaps;
- no decorative gradients, floating glass cards, or generic “AI sparkle” motifs.

The generated asset package uses the active Style Library. The application shell retains its own stable neutral identity.

## Trust and status language

- `Grounded`: directly supported by a source.
- `Derived`: calculated or inferred, with method available.
- `Creative`: narrative or visual invention, not a factual source claim.
- `Unverified`: requires confirmation before production.
- `Approved`: explicitly accepted into the brief or storyboard.
- `Stale`: upstream source, claim, board, or style changed after generation.

Color is never the only status indicator.

## Responsive behavior

- Desktop is the full production environment.
- Tablet supports Capture, whiteboard review/editing, approvals, and storyboard work.
- Mobile browser mode prioritizes evidence, asset review, and approvals; voice capture remains in native ChatGPT. It does not pretend to be a full whiteboard or deck editor.

## Implementation guardrails

- Use shadcn components and composition/global CSS before modifying primitives.
- Meet WCAG AA contrast and keyboard-navigation requirements.
- Reflect host/task synchronization state; show custom voice states only if the Realtime fallback is activated.
- Keep every AI change undoable.
- Never show a generation as final before its dependencies are current.
- Do not use OpenAI's logo, wordmark, or product marks as this project's identity.

## Design acceptance test

A first-time professional should immediately understand:

1. that talking/typing happens in ChatGPT and the visual work appears in the linked Workshop;
2. how the transcript became the whiteboard;
3. which ideas are grounded or unresolved;
4. how the board becomes the brief;
5. which style system controls the package;
6. why the image batch looks coherent;
7. how to change the storyboard before spending time on video.
