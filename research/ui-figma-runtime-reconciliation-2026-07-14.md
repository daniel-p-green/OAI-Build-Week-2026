# WorkshopLM official UI reconciliation

Date: 2026-07-14 CT

Figma source: `Apps in ChatGPT · OpenAI Official (Community)` imported file `jVilV9akIrMbbpl8sUqC6K`

Runtime: local Next.js app at `127.0.0.1:3102`

This table records the first implementation-level reconciliation after the false-positive CSS-label pass was removed. Values under Runtime were read from `getComputedStyle` in the live browser, not inferred from source CSS.

| Figma source | Code component | Required reference | Live runtime evidence | States checked | Screenshot evidence |
| --- | --- | --- | --- | --- | --- |
| Button set `2:465`; inspected instance `7:104094` | `packages/ui` `Button` | 36px; 8px 16px; 999px; SF Pro 14/20; primary `#0D0D0D` | 36px; 8px 16px; 999px; SF Pro stack; 14/20; `rgb(13,13,13)` | default, hover, pressed CSS, disabled, keyboard focus | `brief-1200x800.png`, `outputs-1200x800.png` |
| Token `2:373` | `packages/ui` `Token` | 42px; 12px 16px; 25px; 10% ink border; 13/18 | 42px; 12px 16px; 25px; `rgba(13,13,13,.1)`; 13/18 | default, hover, keyboard focus | `map-1024x768.png`, `sources-390x844.png` |
| Card `2004:22170` | `packages/ui` `Card` and `EntityCard` | 24px; .5px 15% ink; `0 4px 16px` 5% shadow | 24px; .5px `rgba(13,13,13,.15)`; white surface; exact shadow in UI stylesheet | default; domain content inside unchanged | all recorded desktop screens |
| Input `7:109657` | `packages/ui` `Input` | SF Pro label and value; official border and field composition | 42px; 10px 12px; 12px; SF Pro 14/20; 10% ink border | default, edited, keyboard focus, error API | `brief-1200x800.png`, `storyboard-1200x800.png` |
| TextArea `6:20458` | `packages/ui` `TextArea` | SF Pro label/value; official field composition | 120px minimum; 12px padding; 12px radius; SF Pro 14/20 | default, edited, keyboard focus, error API | `storyboard-1200x800.png` |
| Checkbox `5:34676` | `packages/ui` `Checkbox` | custom official control, not native browser appearance | 18px square; `appearance:none`; 5px radius; checked `#0D0D0D` | checked, unchecked action, keyboard focus | `sources-390x844.png` |
| Iconography page `2100:26850` | `ArrowLeftIcon`, `CloseIcon`, `PlusIcon` | exact 24px official assets | exact Figma paths from `2105:819`, `2105:904`, and `2105:886`; node ids retained in markup | default and IconButton focus/tooltip | `sources-390x844.png`, desktop headers |
| Navigation/Header `2:626` | `NavigationHeader` | 52px; 8px vertical; 4px left; 16px right | 52px with exact padding; current object remains visible at 390px | desktop, 1024px, 390px | every recorded screen |
| ListGroup `2004:21591`; ListRow `2002:21224` | `ListGroup`, `ListRow` | 68px row; 12px 16px; 12px gap; 44px media; 5% divider | 68px minimum; official padding/gap; 44px file media; 5% divider | selected source, checkbox change, row action | `sources-390x844.png` |
| Full screen `2133:27199`; mobile header `2124:13243` | `FullScreenShell` plus `NavigationHeader` | stable full-screen frame with responsive header | 1200, 1024, and 390 CSS px; 390px document width equals viewport width | desktop and mobile | `map-1024x768.png`, `map-390x844.png` |

## Named composites

The official kit marks Inspector as coming soon. The source sheet, evidence sheet, claim inspector, and approval summary therefore use only the recipes documented in `research/openai-apps-figma-component-inventory-2026-07-14.md`. No second button, field, card, list, token, badge, or icon system exists in application code.

## Behavioral comparison to NotebookLM

The implementation deliberately borrows NotebookLM's strongest orientation behaviors without copying its Google chrome: the Workshop and current object stay fixed in the header; one source count opens the same source list from every object; source selection is directly visible; outputs are named durable objects with previews and one open action; and a citation opens the exact excerpt and locator. The center remains a professional Map, Brief, Outputs view, or editable Storyboard rather than a duplicate chat surface.

## Remaining proof work

- Automate the screenshot matrix for both reset and completed fixtures, including evidence and focused output states.
- Exercise 200% browser zoom and keyboard-only completion of both approval paths in a clean reset fixture.
- Add a complete visible-copy snapshot rather than only the current retired-language rejection test.
