# Focused artifact fit review

The focused Output viewer previously sized the embedded Presentation to the remaining viewport height. At desktop width, that cropped the 16:9 cover before its title was fully visible and allowed the source trail to compete with the artifact.

The accepted viewer now gives Presentation, Infographic, and Video previews their real 16:9 frame, keeps them fixed-size inside the focused scroll surface, and places Sources and version history after the artifact.

Live provider-backed Presentation Version 3 was inspected at:

- [1200 × 800 desktop](desktop.png): preview 1056 × 594; complete slide and title visible; focused surface scrolls from 748 to 950 pixels.
- [1024 × 768 compact](compact.png): preview 896 × 504; complete slide and title visible; focused surface scrolls from 716 to 976 pixels.
- [760 × 900 narrow](narrow.png): preview 712 × 400.5; complete slide, title, Sources, and version history visible; zero document overflow.

SHA-256:

- Desktop: `b72ef3144affe6a646d55c3373cfdabd4388c0cc3f63e45812ab38073791536d`
- Compact: `1855d7225f5de8c92912d80f9481d0491596428c02fc213d6a78d7fb9e189b69`
- Narrow: `1d309ca4231d8e55376cad77dc4f551e0dfae7d00751b66854ead60eb3c8cafb`

The production-browser contract now verifies that both the first slide and its cover title fit inside the embedded frame. Updated snapshots intentionally replace the cropped Presentation and undersized Video baselines; the original-brainstorm sheet remains readable over the corrected Video frame.
