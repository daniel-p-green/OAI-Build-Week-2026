# WorkshopLM editorial rough cut

Status: **reviewable fixture rough cut — do not publish**

This is the first assembled version of the ten-shot, 2:42 demo plan. It exists to expose pacing, legibility, and evidence gaps before the final provider-backed footage is recorded.

```bash
pnpm demo:film:rough
```

The command reads the checked-in paper edit and captured fixture beats, creates one narrated segment per shot, and writes:

- `workshoplm-demo-rough-cut.mp4` — 1280×720 H.264 video with 48 kHz AAC guide audio;
- `manifest.json` — source beats, hashes, stream metadata, guide-voice disclosure, and limitations;
- `review/01.jpg` through `review/10.jpg` — one midpoint frame per planned shot;
- `contact-sheet.jpg` — the complete visual sequence at a glance.

The guide voice is local macOS speech synthesis, time-fitted only for editorial pacing. It is not OpenAI narration and must be replaced before publication. Green labels mean the shot is supported by current fixture evidence. Amber labels mean the final evidence named in `submission/demo-film-plan.json` is still missing.

## Current critique

What works:

- The professional promise appears in the first twelve seconds.
- The Map, exact source trace, two approvals, editable Storyboard, local render, and original-brainstorm reveal read as one coherent product story.
- The restrained lower third and push-in keep the official Workshop interface legible instead of turning the demo into a marketing montage.
- The complete cut is 162.02 seconds with no detected silence longer than 1.5 seconds.

What must change before publication:

1. Replace shot 2's still with legible Codex host footage opening the correct Workshop.
2. Replace shot 3 with the honestly dated founder brainstorm, an inspected Realtime turn, and the resulting GPT-5.6 Map.
3. Replace shot 7's planned image tiles with the inspected six-panel GPT Image 2 gallery; keep the editable presentation as the visual hero.
4. Replace shot 9 with the audibly reviewed provider-narrated render and its source trace.
5. Replace shot 10 only after the final non-partial submission Output set and eligible `/feedback` Session ID exist. Until then, the self-produced-submission claim stays visibly pending.
6. Have a human listen to the final narration and grade pronunciation, energy, pacing, and music balance. Stream and silence checks do not prove audio quality.

## Verified build

- Duration: 162.021 seconds, below the 175-second edit ceiling.
- Video: H.264, 1280×720.
- Audio: AAC, 48 kHz; mean volume −16.3 dB, maximum −1.9 dB.
- Silence scan: no interval at or below −45 dB lasted 1.5 seconds.
- Visual review: all ten midpoint frames preserve readable product UI, bounded captions, and honest evidence state.

The source manifest remains authoritative for the exact current hash and limitations.
