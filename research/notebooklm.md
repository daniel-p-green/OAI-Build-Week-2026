# NotebookLM research

Observed and checked: 2026-07-13

## What Google has solved

### Verified — live

- A clear three-part mental model: **Sources**, **Chat**, and **Studio**.
- Source selection is visible and reversible. A user can add files, websites, YouTube, Drive content, or copied text and choose which sources participate in a response.
- The empty state teaches the workflow instead of asking the user to invent one.
- Chat can be configured by role and response length.
- Studio turns the same notebook into multiple outputs: Audio Overview, Slide Deck, Video Overview, Mind Map, Reports, Flashcards, Quiz, Infographic, Data Table, and Notes.
- Output customization is staged before generation. Examples observed include deck format and length, infographic orientation and style, and Audio Overview format and focus.

### Verified — official

- Chat answers are grounded in notebook sources and include inline citations.
- A notebook is an independent source collection; NotebookLM cannot work across multiple notebooks at once.
- Imported sources have format-specific constraints. Web imports use page text, YouTube imports use the transcript, and some Drive content is a static copy unless manually re-synced.
- Audio Overviews can be interactive: a listener can speak to the hosts, receive a source-grounded answer, and then return to the program.
- Slide decks can be revised one slide at a time and exported as PDF or PowerPoint.
- NotebookLM Ultra chat can perform more agentic work, including web search, code execution, charts, images, and downloadable files.

## Important limitations

### Verified — official

- Notebook boundaries are hard; sources cannot be queried across several notebooks in one conversation.
- Exports do not stay synchronized with the notebook after they leave it.
- Slide revisions do **not** take notebook sources into account. A user also cannot add or remove slides through that revision flow, and each revision creates a new deck.
- Source imports can lose fidelity: web pages become text, YouTube becomes transcript, and some content types do not continuously sync.

### Inference

The opportunity is no longer “NotebookLM but it can make decks and videos.” It already can. The opportunity is to make the **source relationship survive production and revision**:

- A claim in a slide, voiceover, caption, or social card should retain its evidence link.
- A correction to an approved claim should offer a synchronized patch across all dependent assets.
- An unsourced creative statement should be labeled as creative, not presented as evidence.
- The project should expose the narrative and design contracts that NotebookLM keeps mostly implicit.

## Mechanics to borrow

1. The Sources / Chat / Studio information architecture.
2. Source checkboxes and visible citation affordances.
3. A focused chat that understands the current project rather than a blank general chat.
4. Output recipes with a few high-value controls before generation.
5. A persistent Studio history so users can return to prior artifacts.
6. Voice as an alternate interaction mode, not a separate product.

## Mechanics to improve

1. Replace isolated artifacts with a shared canonical project model.
2. Show claim provenance inside visual outputs, not only inside chat answers.
3. Keep revisions source-aware.
4. Use one `DESIGN.md` across every output instead of unrelated style presets.
5. Let the user promote discoveries into approved claims, narrative beats, or design rules.
6. Make generated files editable through structured controls without requiring a full canvas editor.

## Interface direction

Keep the validated three-pane model, but use a ChatGPT-like visual language:

- neutral surfaces, restrained borders, generous but not wasteful spacing;
- a familiar composer with attachment and voice controls;
- compact source chips and citation states;
- progressive disclosure for advanced generation controls;
- Studio as a production rail, not a grid of decorative AI cards.

This should feel like an OpenAI-native work surface, not a Google interface with different colors.
