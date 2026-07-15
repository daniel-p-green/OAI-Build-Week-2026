# Apps in ChatGPT UI inventory

Status: verified from the editable local import on 2026-07-14

## Source and boundary

- Source supplied by Daniel: `/Users/danielgreen/Downloads/Apps in ChatGPT · OpenAI Official (Community).fig`
- Editable imported Figma file: `jVilV9akIrMbbpl8sUqC6K`
- Official library key: `lk-24d24d963bf059b4e22691f6b8f402164b1a11a53c467f75ea5b85d46c1f02c20d75fb2278bb55e74a42fe03dc1d24d2b52cd3531fff494c4f24e2b3ff79c9b4`
- Official Community library key: `lk-f306f8d233f5cb87d9954fdb03451abcf25354bd03b280b77e53ac158796e0ed8f3c594e0dc3791be1859984909d1c6268631ab4e88c2714a0429a6ba6e44347`

This inventory is the implementation allowlist for WorkshopLM chrome. Custom drawing is limited to WorkshopLM domain content: Map geometry and evidence paths, charts, generated media, slide previews, and storyboard imagery. The containers, controls, labels, typography, menus, status treatments, and spacing around that content must use an entry below.

## Verified pages

| Page | Node id |
| --- | --- |
| Foundations | `2001:3517` |
| Color | `2001:3519` |
| Typography | `2001:4032` |
| Iconography | `2100:26850` |
| Spacing | `2112:10169` |
| Display mode templates | `2002:3882` |
| Inline Card | `2002:3884` |
| Inline Carousel | `2004:28243` |
| Full screen | `2117:15672` |
| Inspector (Coming soon) | `2117:15673` |
| PiP | `2117:15674` |
| Core ChatGPT Components | `2001:74647` |
| Desktop Web | `5:37558` |
| Mobile Web | `5:38916` |
| Desktop & Mobile Web | `0:1` |

## Foundations

### Color

| Token | Light | Dark |
| --- | --- | --- |
| background primary | `#FFFFFF` | `#212121` |
| background secondary | `#E8E8E8` | `#303030` |
| background tertiary | `#F3F3F3` | `#414141` |
| text / icon primary | `#0D0D0D` | `#FFFFFF` |
| text / icon secondary | `#5D5D5D` | `#CDCDCD` |
| text / icon tertiary | `#8F8F8F` | `#AFAFAF` |
| accent blue | `#0285FF` | `#0285FF` |
| accent red | `#E02E2A` | `#FF8583` |
| accent orange | `#E25507` | `#FF9E6C` |
| accent green | `#008635` | `#40C977` |

Borders and shadows use primary ink with the opacity specified by the component rather than a separate invented gray token.

### Typography — web

Web uses SF Pro. The implementation uses the Apple system fallback chain so the same family resolves locally without bundling a font.

| Style | Size / line | Weight | Tracking |
| --- | --- | --- | --- |
| Heading 1 | `36 / 40` | `600` | `-0.10px` |
| Heading 2 | `24 / 28` | `600` | `-0.25px` |
| Heading 3 | `18 / 26` | `600` | `-0.45px` |
| Body regular / emphasized | `16 / 26` | `400 / 600` | `-0.40px` |
| Body small regular / emphasized | `14 / 18` | `400 / 600` | `-0.30px` |
| Caption regular / emphasized | `12 / 16` | `400 / 600` | `-0.10px` |

Component-specific mobile/card typography is also verified: Card header `17/23`, ListRow title `17/24`, ListRow subtitle and description `14/20`, and primary Button label `14/20` with `-0.18px` tracking.

### Spacing

`space-0=0`, `space-1=2px`, `space-2=4px`, `space-4=8px`, `space-6=12px`, `space-8=16px`, `space-12=24px`, `space-16=32px`, `space-20=40px`, `space-24=48px`, `space-32=64px`, `space-64=128px`.

## Components and exact anatomy

| Component | Figma source | Verified implementation facts | WorkshopLM use |
| --- | --- | --- | --- |
| Button | set `2:465`, key `d7098df…`; inspected instance `7:104094`; set verified directly through the Plugin API | primary/secondary/destructive/sec-destructive; large `36px`/`8px 16px`; small `30px`/`6px 16px`; 4px gap; 999px radius; `14/20`; exact hover, pressed, and inactive opacity/color variants | every labeled action and `ButtonLink` composition |
| IconButton | Desktop Web component; iconography page `2100:26850` | icon-only action with accessible label; exact 24px icon assets | Back, close, dismiss |
| Chevron left icon | `2105:819` | exact `icon / chevron-left-lg` path from Figma asset | Back |
| Close icon | `2105:904` | exact `icon / x, crossed` path from Figma asset | Close and dismiss |
| Plus icon | `2105:886` | exact `icon / plus-lg, 18px, add` path from Figma asset | Add source |
| SegmentedControl | set `6:20104`, key `7dd52a…` | large round 44px, 4px padding, 999px radius, secondary background | mutually exclusive view choices when needed |
| Token | set `2:373`, key `b623…` | 42px, `12px 16px`, 8px gap, 25px radius, 10% ink stroke, `13/18`; hover 2% fill/5% stroke; press 5% fill/stroke; inactive 5% stroke | citation tokens |
| Checkbox | set `5:34676`, key `2b762…` | 18px; 2.7px radius; 0.9px 10% ink stroke; checked, indeterminate, hover, press, and inactive variants; label `16/28` | active source scope |
| Radio | set `5:34763` | checked and interaction variants; label `16/28` | exclusive settings |
| Toggle | set `2:16199` | state variants; label `16/28` | boolean settings |
| Menu | main `6:9803`, key `41da4…` | 6px padding, 12px radius, white, 10% ink stroke, two restrained shadows, `13/18` labels | popovers and overflow menus |
| DropdownMenu | set `2:415`, key `8a190…` | popover/expanded variants | compact selection controls |
| Navigation/Header | set `2:626` | 52px high, `8px` vertical, `4px` left, `16px` right | Workshop top bar |
| Input | main `7:109657`; field set `6:20042` | 284×66 reference; title/optional/placeholder `14/20`; inner field 38px high, 8px radius, white, 10% ink stroke | single-line fields |
| TextArea | main `6:20458`; field set `6:20049` | 600×104 reference; title/placeholder `14/20`; inner field 76px high, 8px radius, white, 10% ink stroke | narration and source text |
| Modal/Input | set `7:109664` | 592×402 reference, 40px outer padding, scrim variants, title `20/25` | add-source dialog composition |
| Card | main `2004:22170`, key `e871ab…` | 24px radius, white, 0.5px 15% ink border, `0 4px 16px` 5% shadow, 361px reference | approvals, output objects, inspectors |
| ListGroup | main `2004:21591` | grouped ListRows | source list |
| ListRow | set `2002:21224` | 68px image row, `12px 16px`, 12px gap, 5% divider; image 44px/10px radius | source and evidence rows |
| EntityCard / Simple | `2006:3897` in set `2006:4116` | 345px square, Card border/shadow, title/subtitle | visual output tile |
| EntityCard / Media or map | `2117:34873` | media/map card composition | artifact previews |
| Badge | `2105:7638` | 40px square, 38px radius | app attribution only |
| Carousel | set `2004:30840` | title/subtitle/body/badge/image size variants | coherent asset set |
| CarouselRow | set `2004:29867` | positional variants | storyboard/contact strip |
| Full screen modal | `2133:27199`, key `bf2f…` | Header + content columns + optional side list + bottom composer; white shell | Workshop app display mode |
| Header mobile | `2124:13243` | full-screen mobile header | mobile review |
| Sidebar desktop header | `2123:26990` | full-screen side list header | Sources column |
| Map card | `2117:33652` | 16px padding, 12px gap, 72px media/18px radius, title `17/23`, subhead `14/20` | source anchors and evidence objects |
| Composer scoped | set `2117:32175` | 768px centered, 28px radius, 10px internal padding, 15% border, Card shadow | not used; ChatGPT owns conversation |

The library labels Inspector as “Coming soon.” WorkshopLM therefore composes its contextual evidence panel from verified Full screen columns, Card, Input, Button, and ListRow primitives; it does not claim a shipped official Inspector component.

## WorkshopLM composites

The official library does not ship a finished Inspector. WorkshopLM uses only these named compositions for missing product-specific surfaces:

| Composite | Official recipe | No new chrome |
| --- | --- | --- |
| `SourceSheet` | Full screen side column + Sidebar desktop header + IconButton + Button + ListGroup/ListRow + Checkbox + Card | Uses the official white surface, 10% divider, spacing scale, and primitive interaction states. |
| `EvidenceSheet` | Full screen content column + Sidebar desktop header + IconButton + caption/body type + Button | The excerpt and locator are content; there is no invented inspector control family. |
| `ClaimInspector` | Card + IconButton + Input + Button + caption/body type | Map-specific content sits inside official primitives. |
| `ApprovalSummary` | Card + caption/body type + Button | Current state is plain official caption text, not a badge or custom pill. |
| `ButtonLink` | Button variants + semantic anchor | Export/open actions retain the exact Button geometry, typography, state colors, and focus behavior without inventing a separate link control. |
| `ListRowAction` | ListRow typography/media anatomy + Button keyboard/focus behavior | The source title region is a transparent row action inside ListRow; it introduces no new fill, border, shadow, radius family, or type scale. |
| `EntityCardAction` | EntityCard / Media or map + Button keyboard/focus behavior | Makes the entire visual Output card the open action without adding a second button, border, shadow, radius, or type family. |
| `SideSheet` | Full screen side column + Sidebar desktop header `2123:26990` + IconButton | Reusable temporary layer for Sources, Evidence, Add source, and Style; content is composed only from mapped primitives. |
| `StateMessage` | Card `2004:22170` + heading/body typography + optional Button | Empty, loading, partial, error, and needs-update messages share one calm composition; the optional action is always an official Button. |

Map nodes, provenance edges, generated previews, image tiles, and storyboard imagery remain domain content. Their surrounding controls and containers use the official primitives above.

## Judge-visible mapping

| WorkshopLM surface | Required official composition |
| --- | --- |
| Application frame | Full screen + Navigation/Header |
| Header actions | Button, IconButton, Token |
| Sources | Full screen side column + Sidebar desktop header + ListGroup/ListRow + Checkbox |
| Evidence/claim panel | Full screen content column + Card + Input + Button |
| Brief approval and storyboard gate | Card + Button |
| Brief/style fields | Input/TextArea + Button |
| Outputs | Card or EntityCard / Media or map |
| Image batch | Carousel + CarouselRow inside Card |
| Storyboard strip | CarouselRow; custom imagery is allowed inside the media area |
| Status | body-small/caption text plus an official accent; no decorative custom pill |
| Mobile review | Header mobile + ListRow/Card stack |

## Conformance rule

`packages/ui/src/contract.ts` is the machine-readable allowlist. `apps/web/app/oai-ui-contract.test.ts` verifies the official token values, required source identifiers, reusable component exports, plain-language boundary, and judge-visible custom-domain manifest. A new shell primitive may not land until its exact Figma source is added here and to the contract. Domain-only drawing must be marked as such and may not leak its custom visual language into application chrome.
