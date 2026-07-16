# Product research index

Last updated: 2026-07-13 (America/Chicago)

This directory is the durable research base for the OpenAI Build Week project. It separates current observations from product recommendations so we do not accidentally turn an inference into a competitive claim.

## Working thesis

Build an **evidence-bound creative workspace**: a project starts with source material, gains an explicit narrative and visual identity, and produces a family of cited, synchronized assets through chat or voice.

The product should borrow NotebookLM's legible Sources / Chat / Studio model, Pomelli's brand-first workflow, and Canva's editable multi-format production model. Its distinct promise is stronger:

> Every output stays connected to the same approved evidence, claims, story, and design system—even after a revision.

This is more defensible than “NotebookLM with more models” or “Canva in a chat.” Both NotebookLM and Canva already cover broad generation and conversational editing.

Current verified architecture: Codex desktop/CLI is the development, plugin, and launch host; WorkshopLM's self-contained in-app browser owns the professional's grounded text and Realtime voice Conversation, local tools, Sources, Map, Brief, Style, and Outputs. The installed classic ChatGPT app does not expose the unified local plugin, so Work parity is not claimed. Root [`DESIGN.md`](../DESIGN.md), [`GOAL.md`](../GOAL.md), and the approved technical spec are authoritative when earlier research translations differ.

## Research files

- [Hackathon reference](hackathon/README.md): live Devpost rules, judging, track, announcements, and submission checklist.
- [NotebookLM](notebooklm.md): what Google has solved, current limitations, and transferable mechanics.
- [NotebookLM live user-flow map](notebooklm-user-flow.md): privacy-safe Chrome screenshots, actual Sources / Chat / Studio interactions, and the WorkshopLM translation.
- [Pomelli](pomelli.md): website-to-brand modeling and brand-consistent campaign generation.
- [Canva](canva.md): Visual Suite, Canva AI, and where a general creative editor is already strong.
- [Public user signals](user-signals.md): recurring praise, friction, and the resulting cross-product experience principles.
- [OpenAI architecture](openai-architecture.md): source grounding, Realtime voice, image generation, connectors, and a shared artifact model.
- [Unified plugin architecture](unified-plugin-architecture.md): the July 9 plugin model, installed manifest evidence, and WorkshopLM packaging decision.
- [Codex app-server account/session boundary](codex-app-server-auth.md): live protocol evidence for ChatGPT account state, login, and task synchronization.
- [Whiteboard, coherent images, and storyboard production](whiteboard-storyboard-production.md): verified Excalidraw, GPT Image 2, Google Flow, and HyperFrames mechanics.
- [Interface direction](interface-direction.md): NotebookLM-inspired structure with a distinct, ChatGPT-familiar visual and interaction language.
- [Engineering direction](engineering-direction.md): monorepo boundaries, canonical domain objects, pipeline state, and verification strategy.
- [Product opportunity](product-opportunity.md): recommended wedge, experience model, MVP boundary, and hackathon track.
- [Workflow map](workflow-map.md): input paths, shared grounded core, Studio recipes, meta-demo flow, and Pipecat/Sites boundaries.
- [Naming and mission](naming-and-mission.md): naming verdict, working candidates, and decisions that still need founder input.
- [Sources](sources.md): official references and access dates.

## Evidence convention

- **Verified — live:** observed in the current product interface on 2026-07-13.
- **Verified — official:** stated in first-party documentation or product pages.
- **Announced:** described by the vendor but not confirmed as generally available.
- **Inference:** our interpretation or product recommendation.

Signed-in screenshots were intentionally not saved. Some live surfaces contained private workspace or brand information; only sanitized interaction patterns are recorded here.

## Current go/no-go judgment

**Go**, with a narrow first wedge: messy professional thinking → an approved visual brief → a user-selected set of grounded, on-brand outputs. The demonstration must prove one synchronized revision across multiple outputs and one claim-level source trace.

Do not build a freeform Canva competitor during the hackathon. Use structured, high-quality editing controls and deterministic renderers instead.
