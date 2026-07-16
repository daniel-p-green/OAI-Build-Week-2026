# Workbench rails and Source-impact QA

Recorded: 2026-07-15 CT

## Reference

- Locked composition reference: `research/screenshots/workshoplm/p0-official-ui/map-1024x768.png`
- Current desktop: `artifacts/ui/workbench-rails-desktop-2026-07-15.png`
- Both rails collapsed: `artifacts/ui/workbench-rails-collapsed-2026-07-15.png`
- Desktop Source-impact disclosure: `artifacts/ui/source-impact-desktop-2026-07-15.png`
- Compact workbench: `artifacts/ui/workbench-mobile-390x720-2026-07-15.png`
- Compact Source-impact disclosure: `artifacts/ui/source-impact-mobile-390x720-2026-07-15.png`

## Fidelity ledger

| Check | Reference evidence | Render evidence | Result |
| --- | --- | --- | --- |
| Shell hierarchy | One restrained header and one dominant Map | Header remains 52px; Sources, Map, and Production remain the only desktop columns | Pass |
| Official component language | White surfaces, black primary actions, quiet borders, rounded sheets | Collapse controls use the official IconButton; impact disclosure uses Card and Button primitives | Pass |
| Canvas priority | The Map owns most of the viewport | Default canvas is 808px at 1280px; collapsing both rails expands it to 1184px while preserving 48px restore handles | Pass |
| Source context | Source selection and evidence stay near the current claim | Pending scope selects the affected Source and keeps its excerpt and locator visible beside the named impact | Pass |
| Consequence clarity | Approval and freshness states remain legible | Disclosure names Map, Brief, every existing Output, and the preserved Style before mutation; the accepted change visibly marks downstream work `Needs update` | Pass |
| Compact behavior | One canvas with direct access to Sources and current action | At 390px the rails are hidden, the object switcher remains available, and the Source sheet contains the one impact disclosure without horizontal overflow | Pass |
| Copy economy | No implementation vocabulary or duplicate navigation | Controls are `Collapse Sources`, `Collapse Production`, `Update sources`, and `Cancel`; no internal IDs or file names appear | Pass |

## Material mismatch found and repaired

The first browser pass rendered the same pending Source-impact disclosure in both the persistent rail and the open Sources sheet. The rail now suppresses its copy while the sheet owns the interaction, leaving one visible disclosure.

## Interaction evidence

1. Both desktop rail controls resolved uniquely and collapsed from 220px/252px to 48px/48px.
2. Adding a second local test Source expanded the Map from six to seven ideas.
3. Attempting to remove that Source left the checkbox unchanged and displayed the complete impact before the server mutation.
4. `Update sources` changed the active scope from two Sources to one, returned the Map to six ideas, preserved Style as `Ready`, and marked Brief, Presentation, Infographic, Image set, Storyboard, and Video `Needs update`.
5. The same pre-change disclosure fit inside a 390px Source sheet. Browser console and warning logs were empty.

## Intentional boundaries

- Rail open/closed state is session-local; it does not change Workshop data or create a settings concept.
- At widths at or below 900px, Sources remain a sheet and Production becomes the current header action plus object switcher. The 48px desktop handles are intentionally hidden.
- Provider-backed model quality and Realtime behavior were not exercised in this zero-spend UI pass.
