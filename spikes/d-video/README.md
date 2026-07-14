# Spike D — approved-storyboard local video render

The spike makes the render gate executable: exactly three scenes are built from
an approved, current storyboard. Each scene carries the storyboard and Design
versions, caption, narration reference, and visible `AI-generated voice`
disclosure. Draft or stale storyboards throw before any renderer is invoked.

## Verification

```bash
pnpm --filter @workshoplm/spike-video test
pnpm --filter @workshoplm/spike-video verify
```

`verify` creates deterministic local WAV fixtures with FFmpeg, regenerates
`index.html`, runs HyperFrames `doctor`, `lint`, `validate`, `inspect`, and
renders `artifacts/spikes/spike-d.mp4`. `ffprobe` then proves the result has
both audio and video streams and a six-second duration.

No HyperFrames cloud/auth/API path is used. These WAVs are renderer fixtures,
not synthetic speech. The later live narration seam may replace them with
disclosed `gpt-4o-mini-tts` panel clips when explicitly authorized.
