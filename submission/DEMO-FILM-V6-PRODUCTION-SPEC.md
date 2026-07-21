# WorkshopLM demo film v6 — production specification

Status: **capture approved; opening proof required before a full render**

## Outcome

Create a 2:39, why-first WorkshopLM film that uses native high-resolution product footage, the exact `Different Window (DOLBY).wav` master as its edit skeleton, dry Cedar narration, and restrained OpenAI-style focus choreography.

The current v5 render is reference material only. Its 1280×720 composition and 1280×720 source recording cannot be enlarged into the final master.

## Official OpenAI reference findings

Observed references:

- [Introducing Codex](https://openai.com/index/introducing-codex/)
- [Introducing ChatGPT agent](https://openai.com/index/introducing-chatgpt-agent/)
- [GPT-5.6 launch](https://openai.com/index/gpt-5-6/)

The reusable grammar is consistent:

1. Product proof is shown fullscreen or nearly fullscreen. Device mockups and gradient fields are brief context frames, not the main viewing mode.
2. Each shot has one focal region. The camera settles on the interaction or result being discussed instead of continuously roaming.
3. Reframing is slow and eased. Scale changes are modest; hard cuts carry task changes.
4. Interface text remains native and legible. There are no permanent step badges, oversized lower thirds, or decorative overlays covering the product.
5. Transitions are direct cuts, short dissolves, or motion-matched changes. The v5 blue sweep transition is retired.
6. The product is allowed to breathe. A completed state holds long enough to understand before the next cut.

## Capture contract

- Capture the real sanitized founder Workshop at a 1920×1080 CSS viewport with 2× device scale.
- Record real interaction motion at fullscreen 1920×1080 and capture every required proof state as a true 3840×2160 Retina PNG. Use the 4K states for eased focus moves and the video for cursor/click motion; never enlarge the old 720p recording.
- Use the light product theme and a clean browser surface with no unrelated tabs, notifications, account data, or local-machine chrome.
- Keep cursor movement deliberate. Pause before clicking, land the click, then hold the resulting state.
- Capture the complete sequence once, but edit from short task-specific selects.
- Required proof states: Map hierarchy, exact Source excerpt, approved Brief, applied Style, Created work gallery, one output-to-Source trace, editable Storyboard, approved Storyboard, rendered Video, and original-source reveal.

Command:

```bash
pnpm demo:capture-film-highres
```

The command writes to `outputs/demo-recording-film-highres/` and does not replace the existing 720p source.

## Motion contract

- Master canvas: 3840×2160, 30 fps delivery.
- Default shot: fullscreen product, scale 1.00.
- Focus move: 1.00 → 1.08–1.16 over 0.8–1.4 seconds with a smooth ease, then hold.
- Detail move: up to 1.22 only when the Source excerpt or approval state would otherwise be unreadable.
- Cut when the task changes; do not fly across unrelated regions of the interface.
- Use one brief gradient/window composition for the opening promise and, if needed, one for the Codex/GPT-5.6 proof. Everything else is product footage.
- No blue wipe, fake depth-of-field, perspective laptop mockup, bounce, cursor halo, or constant Ken Burns motion.

## 2:39 story skeleton

| Time | Story job | Picture |
| --- | --- | --- |
| 0:00–0:18 | Why good work breaks after the meeting | Approved cover into a clean, fragmented-work setup, then product fullscreen |
| 0:18–0:35 | WorkshopLM promise | Capture → Map → Brief → Create shown inside the real product |
| 0:35–1:45 | Working product | Map, Source, Brief approval, Style, and Created work in task-sized selects |
| 1:45–2:12 | Payoff | Beat-cut finished-output montage using real generated work |
| 2:12–2:31 | Build proof | Codex with GPT-5.6 Sol for orchestration; GPT-5.6 Terra for the grounded Map |
| 2:31–2:39 | Close | WorkshopLM cover and source-trace promise |

## Audio contract

- Use the authorized `Different Window (DOLBY).wav` stereo master unchanged except for gain automation.
- Use the approved Cedar voice, dry and single-tracked.
- No echo, doubling, reverb, delay, stem separation, filtering, pitch change, or time stretch.
- Duck by phrase rather than with obvious pumping. The opening narration receives the deepest reduction; instrumental gaps return naturally to the original track.
- Review narration-only, music-only, and the actual exported mix separately before approval.

## Review gates

1. Verify the new motion source is fullscreen 1920×1080, every required state has a genuine 3840×2160 PNG, and both are visually sharp.
2. Build only the first 30 seconds.
3. Review the opening silently for story and motion.
4. Review the same export for Cedar intelligibility and music balance.
5. Continue to the full 2:39 cut only after the opening passes.
6. Do not upload to YouTube, update Devpost, or post to X without Daniel reviewing the exact final export.
