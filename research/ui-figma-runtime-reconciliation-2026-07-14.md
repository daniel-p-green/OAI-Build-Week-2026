# WorkshopLM official UI reconciliation

Date: 2026-07-14 CT

Figma source: `Apps in ChatGPT · OpenAI Official (Community)` imported file `jVilV9akIrMbbpl8sUqC6K`

Runtime: production Next.js visual suite at `127.0.0.1:3103`; live IAB/Chrome verification at `127.0.0.1:3104`

This table records the first implementation-level reconciliation after the false-positive CSS-label pass was removed. Values under Runtime were read from `getComputedStyle` in the live browser, not inferred from source CSS.

| Figma source | Code component | Required reference | Live runtime evidence | States checked | Screenshot evidence |
| --- | --- | --- | --- | --- | --- |
| Button set `2:465`; Plugin API variant read | `packages/ui` `Button` and `ButtonLink` | Four types; 36px large; 30px small; exact primary/secondary/destructive/sec-destructive hover, pressed, inactive values; 999px; SF Pro 14/20 | Exact large/small geometry and all four default/hover/pressed/inactive variants pass rendered computed-style assertions; ButtonLink shares the same classes | default, hover, pressed, inactive, keyboard focus; all four types and both sizes | `brief-1200x800.png`, `outputs-1200x800.png` |
| Token `2:373`; Plugin API variant read | `packages/ui` `Token` | 42px; 12px 16px; 25px; 10% ink border; hover 2% fill/5% stroke; press 5% fill/stroke; inactive 5% stroke; 13/18 | Exact geometry and state colors pass; all application-level compact overrides were removed | default, hover, pressed, inactive, keyboard focus | Brief citations and computed-state fixture |
| Card `2004:22170` | `packages/ui` `Card` and `EntityCard` | 24px; .5px 15% ink; `0 4px 16px` 5% shadow | 24px; .5px `rgba(13,13,13,.15)`; white surface; exact shadow in UI stylesheet | default; domain content inside unchanged | all recorded desktop screens |
| Input `7:109657`; field set `6:20042` | `packages/ui` `Input` | 38px inner field; 8px radius; SF Pro label/value 14/20; 10% ink stroke | 38px; 9px 12px optical centering; 8px; SF Pro 14/20; exact stroke; error uses official red and accessibility focus uses official blue | default, edited, error, inactive, keyboard focus | `brief-1200x800.png`, `storyboard-1200x800.png` |
| TextArea `6:20458`; field set `6:20049` | `packages/ui` `TextArea` | 76px inner field; 8px radius; SF Pro label/value 14/20; 10% ink stroke | 76px minimum; 12px padding; 8px; SF Pro 14/20; exact stroke; error uses official red and accessibility focus uses official blue | default, edited, error, inactive, keyboard focus | `storyboard-1200x800.png` |
| Checkbox `5:34676`; Plugin API variant read | `packages/ui` `Checkbox` | 18px; 2.7px radius; 0.9px 10% stroke; checked/indeterminate/hover/press/inactive | 18px; `appearance:none`; 2.7px; authored .9px stroke rasterizes to a 1px computed device boundary in Chrome; exact state fills/strokes; checked and indeterminate marks | checked, unchecked, indeterminate, hover, pressed, inactive, keyboard focus | `sources-390x844.png` and computed-state fixture |
| Iconography page `2100:26850` | `ArrowLeftIcon`, `CloseIcon`, `PlusIcon` | exact 24px official assets | exact Figma paths from `2105:819`, `2105:904`, and `2105:886`; node ids retained in markup | default and IconButton focus/tooltip | `sources-390x844.png`, desktop headers |
| Navigation/Header `2:626` | `NavigationHeader` | 52px; 8px vertical; 4px left; 16px right | 52px with exact padding; current object remains visible at 390px | desktop, 1024px, 390px | every recorded screen |
| ListGroup `2004:21591`; ListRow `2002:21224` | `ListGroup`, `ListRow`, `ListRowAction` composite | 68px row; 12px 16px; 12px gap; 44px media; 5% divider | 68px minimum; official padding/gap; 44px file media; 5% divider; transparent row action reuses official title/subtitle typography and blue focus | selected source, checkbox change, row action, keyboard focus | `sources-390x844.png` |
| Full screen `2133:27199`; mobile header `2124:13243` | `FullScreenShell` plus `NavigationHeader` | stable full-screen frame with responsive header | 1200, 1024, and 390 CSS px; 390px document width equals viewport width | desktop and mobile | `map-1024x768.png`, `map-390x844.png` |

## Named composites

The official kit marks Inspector as coming soon. The source sheet, evidence sheet, claim inspector, and approval summary therefore use only the recipes documented in `research/openai-apps-figma-component-inventory-2026-07-14.md`. No second button, field, card, list, token, badge, or icon system exists in application code.

## Behavioral comparison to NotebookLM

The implementation deliberately borrows NotebookLM's strongest orientation behaviors without copying its Google chrome: the Workshop and current object stay fixed in the header; one source count opens the same source list from every object; source selection is directly visible; outputs are named durable objects with previews and one open action; and a citation opens the exact excerpt and locator. The center remains a professional Map, Brief, Outputs view, or editable Storyboard rather than a duplicate chat surface.

## Fidelity ledger

| Comparison point | Reference evidence | Runtime evidence | Result |
| --- | --- | --- | --- |
| Stable orientation | NotebookLM keeps the notebook identity and named regions fixed | Workshop and current object stay in the 52px header on every object; mobile keeps the current object | matched behavior in OpenAI chrome |
| Immediate source scope | NotebookLM exposes Sources without navigating away | One `n sources` Button opens the same checked ListRows from every object and returns focus on close | matched and keyboard verified |
| One focused work object | NotebookLM's center is always the active notebook object | Map, Brief, Outputs, and Storyboard each replace the center canvas; no workflow tabs or duplicate chat | matched professional adaptation |
| Tangible output history | NotebookLM Studio shows named durable outputs | WorkshopLM shows real deck/infographic previews, image-set state, storyboard strip, and video preview with one open action each | stronger professional control; provider image bytes remain honestly absent |
| Citation reveal | NotebookLM citations reveal source context | Claim → Show source opens exact excerpt and locator; Show on map returns to the grounded object | matched and screenshot verified |
| Action hierarchy | NotebookLM keeps creation actions separate from history | Every normal object has one enabled primary next action; Sources intentionally has zero while it is a selection sheet | duplicate-primary mismatch fixed |
| Official component fidelity | Official Apps in ChatGPT Figma nodes and variants | 8-test production suite covers exact geometry, state colors, focus, responsive screenshots, copy, and accessibility | matched for every used shell primitive and documented composite |

The above-the-fold copy snapshot did not gain new labels during the state correction. The only visual hierarchy changes were demoting `Update style`, `Update outputs`, and background header navigation while a source sheet is open.

## Remaining proof boundary

- The production suite passes the 600px CSS viewport that a 1200px surface exposes at 200% zoom. The same 600px no-overflow result was repeated in the real Chrome extension surface with Map, source scope, and one primary action visible.
- Both available controlled browser surfaces ignore browser-chrome zoom keyboard shortcuts, so the browser UI's displayed `200%` menu value is not directly captured. This is an automation-control limitation, not a layout failure; keep the literal native-menu proof separate from the passing 200%-equivalent acceptance result.
