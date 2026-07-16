# Production recovery QA — 2026-07-15

## Surface

- Codex in-app browser at `1280 × 720`
- Isolated seeded data root: `/tmp/workshoplm-recovery-qa`
- No provider calls or paid spend

## Verified paths

1. Approved Brief, applied Style, created Outputs, and approved the five-panel Storyboard through the visible UI.
2. Queued Video showed `Waiting` and changed the one dominant action to `Cancel video`.
3. Cancelling preserved the approved Storyboard, showed `Cancelled`, and changed the dominant action to `Try video again`.
4. A controlled local renderer failure retried automatically once, stopped after attempt two, preserved the approved Storyboard, showed `Couldn't create`, and offered `Try video again`.
5. One failed image changed Image set to `Partly ready`, named `1 image needs attention`, and changed the dominant action to `Review image`.
6. The focused Image set exposed only the failed Hero concept as `Couldn't create` with `Request replacement`. Requesting it changed that panel to `Replacement requested`, staled only the dependent Storyboard/Video path, and held the dominant action at `Creating replacement…` until new work exists.
7. A persisted Infographic failure retained the current Presentation, showed `Couldn't create` with calm recovery copy, and changed the dominant action to `Try outputs again`.
8. Browser console reported zero errors or warnings after the recovery paths.

## Evidence

- `production-failed-recovery-2026-07-15.png`
- `production-partial-recovery-2026-07-15.png`
- `production-output-failed-2026-07-15.png`

The screenshots are visual evidence of the rail-native states. Durable attempt limits, cancellation, selective image replacement, and output-recovery clearing are additionally covered by worker tests.
