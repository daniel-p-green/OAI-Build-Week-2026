# Whiteboard, coherent images, and storyboard production research

Updated: 2026-07-13

## Excalidraw whiteboard feasibility

### Verified — official

Excalidraw is an open-source, embeddable React whiteboard with a hand-drawn visual style. Its package supports an infinite canvas, shapes, free drawing, arrows, images, libraries, undo/redo, dark mode, and export to PNG, SVG, clipboard, and an editable `.excalidraw` JSON format.

The official API exposes scene reads and writes, including `getSceneElements()` and `updateScene()`. Programmatic updates can participate in undo/redo history. This makes transcript-to-board generation and subsequent AI-assisted rearrangement technically viable.

### Product implication

Do not store product meaning only inside Excalidraw element text or coordinates. Maintain:

- a semantic graph of ideas, claims, citations, priorities, relationships, and downstream consumers;
- a mapping from semantic node IDs to Excalidraw element IDs;
- the Excalidraw scene for spatial layout and direct manipulation.

This separation lets the user move or restyle a card without breaking its source grounding, and lets the assistant reorganize the canvas without overwriting user-authored meaning.

## Whiteboard presentation modes

Excalidraw is already hand-drawn in appearance. The product can still support two useful treatments over the same semantic graph:

1. **Map view:** Excalidraw cards, arrows, frames, and freehand annotations optimized for active thinking. This is the editing surface.
2. **Sketch view:** a presentation-ready hand-drawn synthesis generated from the approved graph. This is a regenerable output for sharing and presentation, not a second independent editor.

**Decision — approved 2026-07-13:** ship both views over one canonical semantic graph. Node IDs, evidence links, selection state, and graph versions remain shared. User and AI edits occur through typed graph operations and are reflected back into Map view. Sketch view is refreshed from an approved graph version, so it cannot silently diverge from the executable brief.

Two separate whiteboard engines are explicitly out of scope.

## GPT Image 2 batch feasibility

### Verified — official

- The Image API supports `n` for multiple images in a single request; the current API reference permits 1–10 images.
- GPT Image 2 accepts one or more reference images and processes them at high input fidelity.
- The Responses API supports multi-turn image generation and editing, allowing an approved visual direction to remain in conversational context.
- Streaming partial images can make generation feel responsive.

### Important limitation

These capabilities do not promise perfect cross-image identity, palette, lighting, or composition consistency. “Same seed” should not be used as a product claim unless the actual API exposes and honors such a control.

### Recommended coherence system

- structured Visual DNA manifest;
- one or more approved reference anchors;
- shared negative constraints;
- per-frame scene specifications;
- batch generation;
- automated vision-based coherence evaluation;
- targeted regeneration of outliers;
- human lock/approval.

This adapts the useful “ingredients” model from Google Flow: consistent characters, objects, and stylistic references are created or uploaded before scene production and reused across the story.

## Google Flow mechanics worth adapting

### Verified — official

- Flow treats characters, objects, and stylistic references as reusable ingredients.
- Ingredients can be referenced across scenes for consistency.
- Frames-to-Video lets a creator define a starting or ending frame.
- Scenebuilder assembles clips into a narrative and supports continuity.
- Asset management keeps ingredients and prompts organized.

### Product implication

For this product, ingredients should include:

- logos and brand marks;
- approved style anchors;
- people, products, locations, and recurring objects;
- background, texture, and lighting references;
- approved storyboard frames.

## Storyboard contract

The storyboard is the boundary between generative exploration and deterministic production.

Each panel should be structured data, not a flattened image:

```json
{
  "id": "scene_04",
  "purpose": "Show the whiteboard becoming the brief",
  "claim_ids": ["claim_12"],
  "voiceover": "The board is not decoration. It is the production brief.",
  "on_screen_text": "Shape → Brief",
  "duration_seconds": 5.5,
  "composition": "wide interface close-up with highlighted cluster",
  "visual_dna_version": "vdna_03",
  "ingredient_ids": ["ui_capture_02", "style_anchor_01"],
  "transition": "cluster nodes converge into document",
  "status": "approved"
}
```

## HyperFrames handoff

HyperFrames uses HTML as the video source of truth and requires a defined visual identity before composition work. It is well suited to this product because approved storyboard data can deterministically control:

- scene duration and track placement;
- layout and responsive composition;
- captions and narration;
- transitions and entrance motion;
- fonts, exact colors, imagery, and overlays;
- repeatable validation and rendering.

The handoff rule is strict: storyboard approval precedes composition generation. HyperFrames should not be asked to invent the story while also rendering it.

## Meta-demo bootstrapping

The product can credibly create its own demo without an impossible recursive loop:

1. The raw voice brainstorm creates the content plan and asset package.
2. The product generates the deck, infographic, storyboard, images, narration, and HyperFrames composition.
3. A screen recording captures the working product flow.
4. The screen recording becomes an ingredient referenced by the approved storyboard.
5. The product/HyperFrames pipeline renders the final submitted video.

The result is genuinely product-generated while still containing real UI evidence.
