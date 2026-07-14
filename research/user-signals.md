# Public user signals

Updated: 2026-07-13

This file supplements first-party feature documentation with public reviews and community discussions. These signals are directional, not statistically representative. Vendor-sponsored surveys and unofficial product blogs are labeled accordingly.

## NotebookLM

### What users repeatedly value

1. **A bounded trust surface.** People understand that a notebook is about the material they supplied. Even when they do not use the word “RAG,” the selected sources and citations make the experience feel more inspectable than a general chat.
2. **Transformation without design expertise.** Users describe the relief of dropping in rough notes and getting a usable presentation, infographic, study guide, or audio program instead of starting from a blank document.
3. **Multiple ways to consume the same material.** Audio, visual summaries, flashcards, and chat make the same source collection useful in different moments.
4. **Low setup cost.** A source set is enough to create value; the user does not need to configure a complex agent or workflow first.
5. **A focused workspace.** A notebook gives the conversation a purpose and a visible boundary.

### Recurring friction

- Users want to inspect sources in their original format, especially PDFs, rather than only a transformed text representation.
- Power users ask for better folder/workspace organization and more continuity across projects.
- Mobile and on-the-go audio workflows are described as less complete than desktop.
- Users report uneven output reliability, including truncated answers, unavailable output generation, and quality changes after product updates.
- Audio users want more voice choice and less performative host behavior for technical material.
- Dense technical and academic users still worry about hallucinations and need stronger diagnostics than a citation badge alone.
- Officially, slide revision is not source-aware, cannot add or remove slides, and creates a new deck for each revision.

### Product implication

Do not compete on the number of output buttons. Preserve the bounded workspace and make the trust model stronger:

- show the original source beside extracted text;
- expose why a source supports a claim;
- show evidence gaps and disagreement;
- keep chat, voice, and artifacts on one versioned project state;
- make mobile useful for review, listening, approvals, and voice direction even if full visual editing remains desktop-first.

## Pomelli

### What users and reviewers value

1. **The URL is the setup.** Starting from a website removes the blank-brand-kit problem.
2. **Identity comes before output.** Users can inspect and correct Business DNA before generating a campaign.
3. **The first result arrives quickly.** The workflow compresses brand setup, campaign ideation, and asset generation into a short sequence.
4. **Suggestions reduce prompt burden.** The product proposes campaign directions based on the brand instead of presenting a blank composer.
5. **The identity is reusable.** Brand context is established once and then applied across multiple creation tasks.

### Recurring friction

- A homepage alone can be too shallow to understand a specific offer, product, or campaign.
- Extraction can misclassify colors, tone, or imagery and therefore requires a human review pass.
- One website may contain several sub-brands or outdated styles that should not be blended.
- Generated work can converge on a safe, generic aesthetic.
- Natural-language editing is convenient but can be less precise than direct design controls.
- Third-party reviews consistently position it as useful for fast SMB marketing, not a replacement for deep professional design work.

### Product implication

Website extraction should be the beginning of a design conversation, not an assertion of truth:

- report confidence and source element for every extracted rule;
- distinguish organization identity, product identity, and campaign-specific direction;
- let the user exclude stale pages or irrelevant site regions;
- capture negative constraints such as “never use stock photography” or “do not sound corporate”;
- show the design system as a living, editable contract.

## Canva

### What users and the market value

1. **Manual control remains available.** AI accelerates a task without removing direct editing.
2. **Layered, editable outputs.** Users can change a component rather than regenerate an entire flattened result.
3. **A broad production surface.** One environment can move between documents, presentations, social graphics, video, web, and print.
4. **Templates and assets shorten the path to acceptable work.** The user is rarely forced to begin with an empty canvas.
5. **Brand systems are operational.** Fonts, colors, logos, and rules are applied during production rather than stored only as documentation.

### Recurring friction and market pressure

- Canva's own marketer research says brand consistency is a leading concern as AI content volume increases. Treat the exact percentage as vendor research, not an independent market estimate.
- Users still expect cleanup and human judgment; AI output can feel generic or visibly machine-made.
- General creative breadth produces a large interface and many possible starting points.
- Layered editing is becoming table stakes, so “editable AI output” alone is not a durable distinction.

### Product implication

Do not build a general-purpose canvas. Build an inspectable, structured editor around the project's evidence and creative contracts:

- direct editing for text, imagery, layout choice, density, and ordering;
- component regeneration rather than whole-output replacement;
- a visible dependency graph between a claim, scene, slide, caption, and chart;
- export to specialist tools when pixel-level control is required.

## Cross-product experience principles

### 1. Derive, reveal, confirm

The system may infer sources, claims, audience, or design rules, but it should reveal the inferred model before using it for expensive or public work.

### 2. Replace blank canvases with a recommended next move

The first screen should ask for what the user already has—sources, a website, or a meeting—not a perfect prompt. After ingestion, recommend one high-value output based on the material.

### 3. Treat truth, story, and style as separate contracts

- `SOURCES.json` and `CLAIMS.json`: what is known and why.
- `FRAME.md`: what the project is trying to communicate.
- `DESIGN.md`: how the project should look and feel.

Separating these allows a correction to truth without erasing the story, and a brand refresh without changing the approved claims.

### 4. Make every generated result editable at the right level

Users need direct edits, structured regeneration, and conversational revision. A good default does not remove the need for control.

### 5. Show consequences before propagation

When one claim or design rule changes, preview the affected assets and let the user approve the synchronized update.

### 6. Make voice spatially aware

Voice should understand the current selection: “this source,” “that chart,” or “the second scene.” It should not behave like a separate voice assistant disconnected from the visible workspace.

### 7. Preserve originals and versions

Keep the original source, extracted representation, approved project state, and rendered outputs inspectable. Never make a user choose between a polished artifact and the ability to audit it.

## Strongest emerging product insight

NotebookLM makes information approachable. Pomelli makes identity operational. Canva makes creation editable. The combined opportunity is to make **evidence operational across an editable creative system**.

That is the ambition to preserve as the product is narrowed for Build Week.
