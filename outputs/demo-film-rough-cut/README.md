# WorkshopLM editorial rough cut

Status: **reviewable fixture rough cut — do not publish**

This is the current assembled version of the ten-shot, 2:20 demo plan. It uses hash-bound OpenAI Cedar narration and exists to expose pacing, legibility, and the two remaining evidence gaps before final founder footage is recorded.

```bash
WORKSHOPLM_ROUGH_CUT_NARRATION_MANIFEST=outputs/demo-film-narration/manifest.json pnpm demo:film:rough
```

The command reads the checked-in paper edit and captured fixture beats, creates one narrated segment per shot, and writes:

- `workshoplm-demo-rough-cut.mp4` — 1280×720 H.264 video with 48 kHz AAC Cedar narration;
- `manifest.json` — source beats, hashes, stream metadata, provider-voice disclosure, and limitations;
- `review/01.jpg` through `review/10.jpg` — one midpoint frame per planned shot;
- `contact-sheet.jpg` — the complete visual sequence at a glance.

The voice is OpenAI Cedar and every shot is bound to its request ID and audio hash in `outputs/demo-film-narration/manifest.json`. Green labels mean the shot is supported by current fixture or captured provider/host evidence. Amber labels mean the final evidence named in `submission/demo-film-plan.json` is still missing.

## Current critique

What works:

- The professional promise appears in the first thirteen seconds.
- The Map, exact source trace, two approvals, editable Storyboard, local render, and original-brainstorm reveal read as one coherent product story.
- The restrained lower third and push-in keep the official Workshop interface legible instead of turning the demo into a marketing montage.
- The complete cut is 140.02 seconds; the longest detected transition silence is 1.81 seconds.

What must change before publication:

1. Replace shot 3 with the honestly dated founder brainstorm, an inspected Realtime turn, and the resulting GPT-5.6 Map.
2. Replace shot 10 only after the final non-partial submission Output set and eligible `/feedback` Session ID exist. Until then, the self-produced-submission claim stays visibly pending.
3. Have a human listen to the current Cedar narration and grade pronunciation, energy, pacing, and any final music balance. The Whisper round trip and silence checks prove intelligibility and timing, not taste.

## Verified build

- Duration: 140.021 seconds, below the 175-second edit ceiling.
- Video: H.264, 1280×720.
- Audio: OpenAI Cedar, AAC, 48 kHz; ten request/hash-bound source WAVs.
- Silence scan: no transition gap exceeds 1.81 seconds.
- Visual review: all ten midpoint frames preserve readable product UI, bounded captions, and honest evidence state.

The source manifest remains authoritative for the exact current hash and limitations.
