# WorkshopLM experience acceptance criteria

Last verified: 2026-07-14

## Experience brief

WorkshopLM must feel obvious to a NotebookLM user within twenty seconds, then reveal—one beat later—that everything can be edited, branded, approved, traced, and trusted.

Borrow NotebookLM's calm and legibility. Preserve WorkshopLM's control moat.

## Six required gains

### 1. Explain itself instantly

Use **Capture → Shape → Deliver** as ambient phase language everywhere.

Acceptance:

- A first-time viewer can identify where evidence enters, where thinking happens, and where finished work appears without opening documentation.
- Internal artifact nouns never compete with the three phase words in the first-run experience.
- Empty-state copy describes the transformation, not the implementation.

### 2. Preserve spatial stability

Keep one dominant object canvas. Sources always originate from the left edge; Library and Outputs always originate from the same right-side action and sheet position.

Acceptance:

- The same control always opens the same place from Map, Brief, Outputs, and Storyboard.
- Closing a sheet restores the previous object without navigation surprise.
- Mobile uses the same conceptual geography even when the Map becomes a readable outline.

### 3. Make source scope tangible

Show a persistent active-source count. Source checkboxes govern the evidence used for the Map and newly generated outputs.

Acceptance:

- The count updates immediately when scope changes.
- Generation uses only checked sources.
- Changing scope marks dependent artifacts stale instead of silently rewriting them.

### 4. Make outputs feel real

Every finished artifact gets a real visual preview: rendered deck, infographic, image contact strip, storyboard filmstrip, or playable video.

Acceptance:

- No finished artifact is represented only by a metadata row.
- Cards quietly show current/stale state, brief/style version, and evidence count.
- The gallery contains one card per artifact. Duplicate previews are a release-blocking visual defect.
- Planned image tiles stay explicitly labeled planned until provider image bytes exist.

### 5. Keep first run calm

No concept appears before the user can act on it.

Acceptance:

- Approval controls appear only when their gate is reachable.
- Stale and version language appears only when an object can actually become stale or versioned.
- The common path exposes no more than five immediate actions and one dominant next action.

### 6. Make citations immediate

The citation chip is the universal control. One click opens the source excerpt and locator without changing modes.

Acceptance:

- The same interaction works on a Map note, brief line, output block, and storyboard panel.
- The first click shows the relevant excerpt and locator.
- Multi-hop provenance remains one level deeper for inspection and the meta-demo reveal.

## Do not borrow

- Do not recreate chat in the browser workspace. ChatGPT is the conversation layer.
- Do not adopt one-shot generation. Brief approval and storyboard approval remain deliberate ceremonies.

## Live audit findings

- The focused current-object shell, left Sources sheet, right Workshop Library, active source count, contextual citations, Brief style settings, and editable Storyboard satisfy the architectural direction.
- The real Outputs fixture renders deck, infographic, and video previews, but the current gallery duplicates the deck and infographic cards. Deduplicate before recording.
- Image tiles are still planned manifests, not GPT Image 2 media. Keep the distinction visible until a live batch is stored.
- The current mobile Map becomes a readable vertical evidence outline and preserves source access.

