# WorkshopLM public demo script

Target: 2:40–2:45 after editing. Treat 2:55 as the absolute export ceiling so YouTube cannot report a rules-breaking duration. Record the live local app and its real local outputs. Do not record a provider feature unless its evidence has been logged.

## Evidence selector before recording

Every answer must point to an inspected artifact in `log.md`. A missing or ambiguous answer is `No`.

| Gate | Yes only when | Recording consequence |
| --- | --- | --- |
| Live GPT-5.6 result? | Product request, response, route, and inspected grounded result exist. | Use the provider-backed source-to-Map line only when `Yes`. |
| Live GPT Image 2 set? | Six image files, provider provenance, coherence review, and gallery inspection exist. | Otherwise show the planned image set and say `planned`. |
| Provider narration? | Provider clips and the current narrated MP4 have been inspected. | Otherwise keep the placeholder-tone disclosure visible. |
| Live Realtime voice? | A microphone turn is persisted with final provider transcript and item/event IDs. | Otherwise use the sanitized transcript fixture and do not call it live voice. |
| Codex plugin doorway captured? | Legible footage shows Codex opening the correct local Workshop. | The final take cannot close until this is `Yes`. |
| Founder brainstorm captured? | A dated recording and transcript exist. | Call it a contemporaneous brainstorm, never pre-code evidence. |
| Final submission produced in WorkshopLM? | Final Devpost copy, deck, thumbnail, Storyboard, narration, and public Video appear in one verified non-partial Output set. | Otherwise call the reveal a traced recorded fixture, not a self-built final submission. |
| Primary `/feedback` ID recorded? | The representative eligible Session ID and rationale are in `log.md`. | Required before final submission, but do not show disposable proof-task IDs. |

| Time | Screen action | Narration |
| --- | --- | --- |
| 0:00–0:12 | Open the finished presentation, then pull back to its WorkshopLM Map. | “From your meetings and documents to a deck you can defend, with every claim traced to its source.” |
| 0:12–0:22 | Show the captured Codex-side WorkshopLM doorway and use it to open the Workshop. | “WorkshopLM is one unified plugin: Codex stays the conversation surface and opens the visual production workspace.” |
| 0:22–0:45 | Open Sources and the dated raw founder-brainstorm recording. If and only if a logged GPT-5.6 runtime result exists, show the model extracting the graph here. Otherwise show the recorded local extraction and make no direct provider-runtime claim. | Provider-backed cut: “GPT-5.6 turns this source into a grounded graph while retaining chunk and source locators.” Recorded cut: “This sanitized local fixture replays the grounded graph path without credentials or paid calls.” |
| 0:45–1:00 | Open a source locator, then move or rename one Map node. | “The Map stays editable, and a meaningful change makes dependent work stale.” |
| 1:00–1:15 | Choose `Approve brief`, then show the readable Brief. Open technical Details only if the export is useful to the narration. | “The first approval turns the current Map into an inspectable executable Brief.” |
| 1:15–1:28 | Show the Style summary with palette, type, layout, and negative rules. | “Style is set once and stays reviewable, so this deck and every supporting asset follow the same visual rules.” |
| 1:28–1:47 | Open the presentation first. Show real layout variety, a quiet citation, `Show source`, and the editable PowerPoint action. Then return to Outputs and briefly reveal the infographic and image set. If a logged live image set exists, show it; otherwise keep `Planned` visible. | “The hero output is a branded deck I can edit and defend. Its factual claims retain exact evidence; the infographic and image set support the same story. In this recorded path, images remain honestly planned rather than passed off as provider pixels.” |
| 1:47–2:05 | Open Storyboard, edit one panel, save, then choose `Approve storyboard`. | “The Storyboard remains editable. This is the second and final blocking approval before video creation.” |
| 2:05–2:23 | Choose `Create video`, show the MP4, then return to the presentation's evidence view. | “The local worker renders only the approved current Storyboard. The same trace still follows the finished presentation back through the Brief and Map to exact evidence.” |
| 2:23–2:42 | Reveal the contemporaneous brainstorm beside the traced Output set, then show concise Codex and GPT-5.6 evidence. Call it the final submission only if that evidence gate is `Yes`. | Provider-backed cut: “This trace shows how the source became the work on screen. You watched GPT-5.6 shape it; Codex accelerated the implementation and verification.” Recorded cut: “This traced fixture shows how raw thinking became the work on screen. Codex accelerated the implementation and verification; this take does not claim a separate GPT-5.6 product-runtime result.” |

## Recording guardrails

- Use the recorded fixture or the bounded local live operator path; do not show personal sources, API keys, or hidden local paths.
- Keep the deterministic local audio disclosure visible if using the current fixture render. Do not call it AI voice.
- The Codex doorway is required footage. A local web-app shot alone does not prove the unified-plugin architecture.
- Show exactly two approvals: Map as Brief, then Storyboard. Style review and deck export are not additional approval gates.
- Treat the presentation as the hero deliverable. Infographic, images, Storyboard, and Video are supporting proof, not equal-weight feature tours.
- If a live GPT-5.6 result is captured, show the result during the source-to-Map beat; do not leave it as a spoken end-card claim.
- A new founder-brainstorm recording must be timestamped and described as a contemporaneous source. It is not the missing original pre-code brainstorm.
- Keep the YouTube title, thumbnail, and Devpost project name free of Google or NotebookLM marks. The comparison may appear only in narration or explanatory prose.
- Include no third-party music, logos, or unlicensed media.
- Before upload, resolve every gated row in `submission/CLAIM-LEDGER.md` with captured evidence or use its bounded wording.

## Recording gate and order

1. Obtain explicit spend authorization before any paid provider call.
2. If authorized, capture and log one GPT-5.6 runtime result and one image batch before choosing the provider-backed script lines.
3. Retrieve the `/feedback` ID from the session that most honestly represents the core implementation; record the selected ID and rationale in `log.md`. If the surface still cannot produce one, contact the organizers immediately and preserve that correspondence.
4. Capture and timestamp the raw founder brainstorm; label it truthfully as a current recording.
5. Reset the sanitized fixture, rehearse the complete seam, and capture the required Codex plugin doorway moment.
6. Record the first full take, edit to 2:40–2:45, and reject any export longer than 2:55.

## Repeatable fixture draft

Run the browser capture before each recording session:

```bash
pnpm demo:capture-draft
```

This production-build command resets an isolated sanitized recording root, captures the real Map → Sources → source trace → Brief approval → Style → Outputs → Storyboard edit → Storyboard approval → local render → original-brainstorm reveal path at 1200×800, and writes:

- `outputs/demo-recording-draft/workshoplm-fixture-walkthrough.webm`;
- `outputs/demo-recording-draft/manifest.json` with exact beat timings, hashes, stream metadata, final gate state, and limitations;
- `outputs/demo-recording-draft/contact-sheet.png` for quick editorial review;
- `outputs/demo-recording-draft/original-reveal.png` as final-beat proof.

The draft is screen-only fixture footage, not the final submission video. It deliberately keeps planned-image and deterministic-narration disclosures and omits the separately recorded Codex doorway. After live provider evidence exists, rerun the same capture against the provider-backed fixture and replace only the shots whose claim gates changed.

## Editorial rough cut

Assemble the current ten-shot plan before recording the final provider footage:

```bash
pnpm demo:film:rough
```

This writes a 2:42 review cut, manifest, ten shot frames, and contact sheet to `outputs/demo-film-rough-cut/`. The local macOS guide voice and every blocked shot are explicitly labeled. Use the cut to review pacing and replace only the five evidence-pending shots; never publish it as the provider-backed demo.

## Evidence-gated edit plan

Run the draft verifier before editing:

```bash
pnpm demo:film:verify
```

`submission/demo-film-plan.json` is the machine-readable paper edit. It fixes the intended runtime at 2:42 across ten contiguous shots, maps all twelve fixture beats into the film, checks narration density, and names the exact external evidence required by each unfinished shot. Its report is written to `outputs/demo-film-plan/`.

The final export gate is intentionally separate:

```bash
pnpm demo:film:verify-final
```

That command must fail until every shot is marked ready, every named evidence file exists, the plan status is `final`, and `outputs/demo-film-final/workshoplm-demo.mp4` has both video and audio streams with a verified duration no longer than 2:55. Do not bypass the failure by removing evidence entries; replace blocked inputs with inspected artifacts and update their shot state.
