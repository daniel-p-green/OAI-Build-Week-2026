# WorkshopLM plugin research

Last verified: 2026-07-14

## Decision

WorkshopLM should be one focused ChatGPT App with a strong interactive workspace, a small MCP tool surface, and optional source apps. The plugin ecosystem is a capability map, not a dependency list.

OpenAI now uses **apps** as the umbrella for both interactive interfaces and former connectors. Apps may provide interactive UI, search, deep research, sync, write actions, or custom MCP capabilities. The Apps SDK extends MCP so an app can define both its chat behavior and its interface. This validates the WorkshopLM split: ChatGPT owns conversation and connected context; WorkshopLM owns the visual Map, approvals, style contract, coherent outputs, and provenance.

Official references:

- [Introducing apps in ChatGPT](https://openai.com/index/introducing-apps-in-chatgpt/)
- [Build with the Apps SDK](https://help.openai.com/en/articles/12515353-build-with-the-apps-sdk)
- [Apps in ChatGPT](https://help.openai.com/en/articles/11487775-connectors-in-chatgpt)
- [Apps with sync](https://help.openai.com/en/articles/10847137-chatgpt-syn)
- [Developer mode and MCP apps](https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt)

## Recommended stack

| Priority | Plugin or family | WorkshopLM use | Decision |
| --- | --- | --- | --- |
| Use now | OpenAI Developers | Responses, Realtime, GPT Image 2, TTS, Apps SDK, MCP architecture | Core implementation reference |
| Use now | Browser | Real local UI inspection, responsive acceptance, screenshot proof | Required QA surface |
| Use now | Presentations | Editable deck creation, rendering, overflow checks, and final PPTX verification | Real output path and project-overview artifact |
| Use now | HyperFrames | Local approved-storyboard video, captions, voiceover, and HTML-to-video composition | Primary video renderer |
| Use now | Record & Replay | Capture milestone proof and the final demo seam | Recording evidence |
| Source adapter | Granola | Meeting discovery, transcript context, and citations | Best meeting-source demonstration after sanitized local input |
| Source adapter | Google Drive | Docs, Sheets, Slides, and files as bounded sources | High-value professional connector |
| Source adapter | Slack | Team decisions and conversation context | Useful, but not required for the judge path |
| Learn from | Figma / Product Design | Progressive disclosure, design-system rules, review loops | Reference patterns; do not add a second design runtime |
| Learn from | Canva / Creative Production | Brand systems, editable variations, campaign asset language | Reference output behavior; WorkshopLM remains the flagship UI |
| Fallback | Remotion | Programmatic React video | Keep behind the existing renderer seam only if HyperFrames fails |
| Optional finish | ChatCut | Post-render video editing and finishing | Do not make it part of the primary seam |
| Stretch output | Sites | Publish a traced project microsite | Only after the three-minute demo is locked |
| Later output | Documents / Spreadsheets | Briefs, reports, data workbooks | Valuable expansion, not demo-critical |

## What to borrow

### Presentations

- Treat decks as real editable artifacts, not metadata rows.
- Render every slide and run overflow/overlap checks before export.
- Preserve source locators and the active style contract in the artifact metadata.
- Keep a deterministic HTML/PDF renderer for the product seam while allowing PPTX as an additional professional handoff.

### Granola, Drive, and Slack

- Discover source material where professionals already work.
- Import a bounded, permission-aware snapshot into the Workshop.
- Preserve the originating app, item, timestamp or locator, and permission state.
- Never require a private connector for the sanitized judge experience.

### Figma, Product Design, and Canva

- Show the common path first and bring controls in only when they become actionable.
- Separate brand foundations from intent-specific presentation rules.
- Make finished assets openable, editable, and visually recognizable.
- Keep WorkshopLM's Map and output gallery native rather than embedding a second full editor.

### HyperFrames, Remotion, and ChatCut

- Keep storyboard approval ahead of expensive rendering.
- Maintain one canonical storyboard-to-video adapter contract.
- Use HyperFrames locally for the demo; keep one fallback, not parallel pipelines.

## Guardrails

1. Do not claim private ChatGPT product integration or direct app-to-app orchestration without live proof.
2. No connector, login, network call, or judge-supplied credit may be required to understand the submission video.
3. Imported app context becomes a local Workshop source with exact locators and evidence state.
4. A plugin is adopted only if it strengthens the capture → Map → brief → outputs → storyboard → video seam.
5. The host handles conversation, app selection, and connected knowledge. WorkshopLM handles spatial thinking, approval, style, production, and trace.

## Recommended demonstration

Use one sanitized local source path as the guaranteed demo. If connector proof is ready, add exactly one meeting-source moment—preferably Granola—then show the imported note becoming a checked Workshop source. Use Presentations and HyperFrames as visible output proof. Mention Drive and Slack as supported architecture, not as simultaneous demo dependencies.

