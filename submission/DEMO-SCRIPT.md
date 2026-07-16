# WorkshopLM public demo script

Target: 2:20. Treat 2:55 as the absolute export ceiling so YouTube cannot report a rules-breaking duration. The current rough cut already runs 2:20 with verified Cedar narration; replace only the two blocked evidence beats.

## Evidence selector before recording

Every answer must point to an inspected artifact in `log.md`. A missing or ambiguous answer is `No`.

| Gate | Current state | Recording consequence |
| --- | --- | --- |
| Live GPT-5.6 result | **Yes.** Terra request/result provenance and inspected grounded Map exist. | Show the provider-backed source-to-Map result. |
| Live GPT Image 2 set | **Yes.** Six hashed images, request provenance, coherence review, and gallery footage exist. | Show the provider-backed gallery insert. |
| Provider narration | **Yes.** Five product-Video clips and ten editorial-film Cedar clips are hash-bound and inspected. | Disclose AI-generated voice. |
| Live Realtime voice | **Yes, controlled Chrome.** Grounded speech, durable transcript/tool provenance, interruption, and confirmed write are recorded. | Do not imply the automated Codex in-app browser granted microphone permission. |
| Codex plugin doorway captured | **Yes.** Legible Codex-side footage opens the local Workshop. | Keep the current doorway shot. |
| Founder brainstorm captured | **No.** Dated recording and transcript are missing. | Call it a contemporaneous brainstorm, never pre-code evidence. This blocks shot 3. |
| Final submission produced in WorkshopLM | **No.** The founder-derived ready Output set is missing. | Do not call the current partial fixture the final submission. This blocks shot 10. |
| Primary `/feedback` ID recorded | **No.** | Required before final submission, but not a film-content gate. |

| Time | Screen action | Narration |
| --- | --- | --- |
| 0:00–0:13 | Open the finished presentation, then pull back to its WorkshopLM Map. | “From your meetings and documents to a deck you can defend, with every claim traced to its source.” |
| 0:13–0:26 | Show the captured Codex-side WorkshopLM doorway and use it to open the Workshop. | “WorkshopLM is one unified plugin: Codex stays the conversation surface and opens the visual production workspace.” |
| 0:26–0:44 | Open Sources and the dated founder brainstorm, then show the provider-backed Terra Map result. | “GPT-5.6 turns this source into a grounded graph while retaining chunk and source locators.” |
| 0:44–0:58 | Open a source locator, then move or rename one Map node. | “The Map stays editable, and a meaningful change makes dependent work stale.” |
| 0:58–1:10 | Choose `Approve brief`, then show the readable Brief. | “The first approval turns the current Map into an inspectable executable Brief.” |
| 1:10–1:22 | Show the Style summary with palette, type, layout, and negative rules. | “Style is set once and stays reviewable, so this deck and every supporting asset follow the same visual rules.” |
| 1:22–1:36 | Open the presentation first, show its exact evidence, then reveal the provider-backed GPT Image 2 set. | “The hero output is a branded deck I can edit and defend. Its factual claims retain exact evidence, and GPT Image 2 gives the supporting work one coherent visual direction.” |
| 1:36–1:49 | Open Storyboard, edit one panel, save, then choose `Approve storyboard`. | “The Storyboard remains editable. This is the second and final blocking approval before video creation.” |
| 1:49–2:04 | Show the approved Storyboard becoming the current narrated MP4. | “The local worker renders only the approved current Storyboard. The same trace follows finished work back through the Brief and Map to exact evidence.” |
| 2:04–2:20 | Reveal the contemporaneous brainstorm beside the verified founder-derived Output set, then show concise Codex and GPT-5.6 evidence. | “This trace shows how the source became the submission on screen. You watched GPT-5.6 shape it; Codex accelerated the implementation and verification.” |

## Recording guardrails

- Use the recorded fixture or the bounded local live operator path; do not show personal sources, API keys, or hidden local paths.
- Disclose the current editorial and product narration as AI-generated Cedar voice. Keep deterministic fixture audio labeled separately wherever it appears.
- The Codex doorway is required footage. A local web-app shot alone does not prove the unified-plugin architecture.
- Show exactly two approvals: Map as Brief, then Storyboard. Style review and deck export are not additional approval gates.
- Treat the presentation as the hero deliverable. Infographic, images, Storyboard, and Video are supporting proof, not equal-weight feature tours.
- Show the verified Terra result during the source-to-Map beat; do not leave it as a spoken end-card claim.
- A new founder-brainstorm recording must be timestamped and described as a contemporaneous source. It is not the missing original pre-code brainstorm.
- Keep the YouTube title, thumbnail, and Devpost project name free of Google or NotebookLM marks. The comparison may appear only in narration or explanatory prose.
- Include no third-party music, logos, or unlicensed media.
- Before upload, resolve every gated row in `submission/CLAIM-LEDGER.md` with captured evidence or use its bounded wording.

## Recording gate and order

1. Capture and timestamp the founder brainstorm plus transcript; label it truthfully as a current recording.
2. Run the bounded founder operator to create the Source-derived Terra Map, six-image batch, Cedar narration, Audio Overview, HyperFrames Video, and verified submission package.
3. Run `pnpm demo:film:final`; it replaces the two blocked beats and refuses false finality.
4. Retrieve the `/feedback` ID from the session that most honestly represents the core implementation; record the selected ID and rationale in `log.md`.
5. Reject any final export longer than 2:55, then verify the public upload logged out.

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

The current draft is 51.84 seconds of screen-only fixture footage, not the final submission video. It proves the current workbench and deterministic no-credential path. The rough-cut builder combines it with separately verified Codex doorway and provider media inserts.

## Editorial rough cut

Assemble the current ten-shot plan before recording the final provider footage:

```bash
pnpm demo:film:rough
```

This writes the 2:20 review cut, manifest, ten shot frames, and contact sheet to `outputs/demo-film-rough-cut/`. It reuses the existing ten-clip OpenAI Cedar manifest by default and marks the two blocked shots explicitly. Never publish it as the final demo.

## Evidence-gated edit plan

Run the draft verifier before editing:

```bash
pnpm demo:film:verify
```

`submission/demo-film-plan.json` is the machine-readable paper edit. It fixes the intended runtime at 2:20 across ten contiguous shots, maps all twelve fixture beats into the film, checks narration density, and names the exact external evidence required by each unfinished shot. Its report is written to `outputs/demo-film-plan/`.

The final export gate is intentionally separate:

```bash
pnpm demo:film:verify-final
```

That command must fail until every shot is marked ready, every named evidence file exists, the plan status is `final`, and `outputs/demo-film-final/workshoplm-demo.mp4` has both video and audio streams with a verified duration no longer than 2:55. Do not bypass the failure by removing evidence entries; replace blocked inputs with inspected artifacts and update their shot state.
