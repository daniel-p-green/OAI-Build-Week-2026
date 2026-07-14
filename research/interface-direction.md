# Interface direction

Updated: 2026-07-13

## Design intent

The interface should feel aligned with ChatGPT: quiet, direct, conversational, and powerful without exposing implementation complexity. NotebookLM contributes the clear relationship between Sources, Chat, and outputs. Pomelli contributes progressive brand extraction and review. The product's own identity comes from the three-stage professional workflow.

## Product shell

The left navigation holds **Workshops**, recent work, Style Libraries, and connectors. Creating or opening a Workshop enters one durable container for its Sources, Conversation, Map, Style, and Studio outputs. The main workspace has three stable stages:

- **Capture** — voice and conversation;
- **Shape** — interactive whiteboard;
- **Deliver** — a Studio of output types and production controls.

The same composer follows the user across all stages. Text, attachments, and voice never move to an unrelated surface.

## Stage 1: Capture

Primary surface:

- large, calm conversation area;
- prominent but familiar voice control;
- live transcript with unobtrusive timestamps;
- source and connector chips;
- short assistant follow-ups;
- “Shape this” as the primary progression action.

The interface should encourage speed and messiness. Do not ask for a campaign type, format list, audience matrix, or design configuration before the user has expressed the idea.

## Stage 2: Shape

The whiteboard takes the majority of the workspace. Conversation remains available as a collapsible side panel or floating composer.

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
- Mobile prioritizes voice capture, transcript review, asset review, and approvals; it does not pretend to be a full whiteboard or deck editor.

## Implementation guardrails

- Use shadcn components and composition/global CSS before modifying primitives.
- Meet WCAG AA contrast and keyboard-navigation requirements.
- Preserve visible voice states: idle, listening, thinking, speaking, interrupted, and failed.
- Keep every AI change undoable.
- Never show a generation as final before its dependencies are current.
- Do not use OpenAI's logo, wordmark, or product marks as this project's identity.

## Design acceptance test

A first-time professional should immediately understand:

1. where to start talking;
2. how the transcript became the whiteboard;
3. which ideas are grounded or unresolved;
4. how the board becomes the brief;
5. which style system controls the package;
6. why the image batch looks coherent;
7. how to change the storyboard before spending time on video.
