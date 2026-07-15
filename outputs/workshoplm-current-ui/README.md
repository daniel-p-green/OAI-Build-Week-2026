# Current WorkshopLM UI gallery

The authoritative screenshots are captured from the production Next.js route by the visual acceptance suite. They use the deterministic local fixture and cover the current no-tabs interface at desktop (`1200×800`), compact (`1024×768`), and mobile (`390×844`) widths.

## Core journey

| Screen | Desktop | Compact | Mobile |
| --- | --- | --- | --- |
| Map | [desktop](../../apps/web/tests/visual/__screenshots__/desktop-map.png) | [compact](../../apps/web/tests/visual/__screenshots__/compact-map.png) | [mobile](../../apps/web/tests/visual/__screenshots__/mobile-map.png) |
| Sources | [desktop](../../apps/web/tests/visual/__screenshots__/desktop-sources.png) | [compact](../../apps/web/tests/visual/__screenshots__/compact-sources.png) | [mobile](../../apps/web/tests/visual/__screenshots__/mobile-sources.png) |
| Source evidence | [desktop](../../apps/web/tests/visual/__screenshots__/desktop-evidence.png) | [compact](../../apps/web/tests/visual/__screenshots__/compact-evidence.png) | [mobile](../../apps/web/tests/visual/__screenshots__/mobile-evidence.png) |
| Add source and voice | [desktop](../../apps/web/tests/visual/__screenshots__/desktop-add-source.png) | [compact](../../apps/web/tests/visual/__screenshots__/compact-add-source.png) | [mobile](../../apps/web/tests/visual/__screenshots__/mobile-add-source.png) |
| Brief | [desktop](../../apps/web/tests/visual/__screenshots__/desktop-brief.png) | [compact](../../apps/web/tests/visual/__screenshots__/compact-brief.png) | [mobile](../../apps/web/tests/visual/__screenshots__/mobile-brief.png) |
| Style | [desktop](../../apps/web/tests/visual/__screenshots__/desktop-style.png) | [compact](../../apps/web/tests/visual/__screenshots__/compact-style.png) | [mobile](../../apps/web/tests/visual/__screenshots__/mobile-style.png) |
| Outputs | [desktop](../../apps/web/tests/visual/__screenshots__/desktop-outputs.png) | [compact](../../apps/web/tests/visual/__screenshots__/compact-outputs.png) | [mobile](../../apps/web/tests/visual/__screenshots__/mobile-outputs.png) |
| Focused Output | [desktop](../../apps/web/tests/visual/__screenshots__/desktop-output-viewer.png) | [compact](../../apps/web/tests/visual/__screenshots__/compact-output-viewer.png) | [mobile](../../apps/web/tests/visual/__screenshots__/mobile-output-viewer.png) |
| Storyboard | [desktop](../../apps/web/tests/visual/__screenshots__/desktop-storyboard.png) | [compact](../../apps/web/tests/visual/__screenshots__/compact-storyboard.png) | [mobile](../../apps/web/tests/visual/__screenshots__/mobile-storyboard.png) |
| Original brainstorm reveal | [desktop](../../apps/web/tests/visual/__screenshots__/desktop-original-reveal.png) | [compact](../../apps/web/tests/visual/__screenshots__/compact-original-reveal.png) | [mobile](../../apps/web/tests/visual/__screenshots__/mobile-original-reveal.png) |

## Product states

The same suite records empty, loading, partial, error, `Needs update`, and reset states at all three widths. Run:

```bash
pnpm --filter @workshoplm/web test:visual
```

The numbered PNG files retained in this directory are a July 14 pre-simplification archive. They show the discarded tabbed/Library MVP and are not evidence of the current interface.

These screenshots prove fixture-backed product behavior and responsive composition. They do not prove live GPT-5.6 product reasoning, GPT Image 2 generation, a provider-backed Realtime microphone turn, provider narration, or ChatGPT Work support.
