# WorkshopLM public claim ledger

Last reconciled: 2026-07-15 CT.

Use this ledger before recording, editing the Devpost entry, or publishing screenshots. A claim is eligible only when the named evidence exists, has been inspected, and still matches the recorded product. If a gate is not met, use the bounded wording or omit the claim.

## Claims supported now

| Public claim | Allowed wording | Direct evidence | Boundary |
| --- | --- | --- | --- |
| End-to-end local workflow | “The recorded fixture moves grounded Sources through an editable Map, approved Brief, Style, Outputs, approved Storyboard, and local video.” | `pnpm demo:e2e`; `.workshoplm/acceptance/generated/submission-output-set-v1/manifest.json` | Say `recorded fixture`, not live provider run. |
| Source grounding | “Factual claims in the recorded presentation and infographic link back to exact source excerpts and locators; local search ranks normalized evidence with SQLite FTS5/BM25.” | `pnpm demo:e2e`; `artifacts/spikes/grounding-fts5-2026-07-15.json`; focused Output `Show source` path | Do not imply every creative element is verified evidence or call local retrieval hosted OpenAI File Search. |
| Editable semantic Map | “The Excalidraw Map supports direct movement, resize, text editing, source inspection, and WorkshopLM Undo.” | `apps/web/tests/visual/completed-ui.spec.ts`; worker graph-history tests; responsive Map screenshots | Do not imply mobile spatial editing; mobile is a review outline. |
| Approval control | “WorkshopLM has exactly two blocking approvals: Brief and Storyboard.” | Recorded acceptance gates; worker gate tests; current UI | Do not describe other review steps as blocking approvals. |
| Brief and Style contracts | “The approved Map becomes a readable Brief; Style preserves palette, type, layout, and negative rules.” | Current Brief and Style views; exported `FRAME-v1.md`, `DESIGN-v1.md`, and token file in the acceptance fixture | Technical filenames belong only in Details or export discussion. |
| Source-traceable Outputs | “The fixture creates a presentation and one-page infographic with retained source links and editable PowerPoint exports, plus a planned six-panel image set and editable five-panel Storyboard.” | Submission Output-set manifest; rendered HTML Outputs; both `.pptx` files; Storyboard artifact | Keep `planned` attached to the image set until provider image bytes exist. |
| Output history and freshness | “Outputs retain real previews, source coverage, versions, and `Needs update` state.” | Production-route UI test `Outputs preserve recognizable version history and source coverage`; responsive screenshots; five orientation reviews | The reviews prove screenshot orientation, not uncoached use of an empty Workshop. |
| Professional return visit | “Adding a new meeting expands the Map, marks dependent work `Needs update`, preserves the saved Style, and produces a new presentation version traced to the new Source after Brief reapproval.” | Worker weekly-return regression; `artifacts/spikes/weekly-return-visit-2026-07-15.json`; inspected browser screenshot | Proven with an isolated local Workshop, not yet with a returning external user. |
| Editable professional deck candidate | “WorkshopLM produced a five-slide AI Collective organizer brief with varied layouts, concise citations, official supplied branding, and an editable PowerPoint export.” | `outputs/dogfood-ai-collective-chapter-brief/`; `artifacts/spikes/external-deck-dogfood-2026-07-15.json` | Call it a dogfood candidate, not shipped or externally approved, until a real professional returns `Send` or `Revise`. |
| Local video rendering | “The local worker renders the approved current Storyboard to an MP4.” | `pnpm demo:e2e`; acceptance MP4; stream inspection recorded in `log.md` | Current fixture audio is disclosed placeholder tone, not AI narration. |
| Local-first judge path | “The sanitized fixture runs without an account, private connector, paid API call, or judge-supplied credits.” | `demo:reset`, `demo:e2e`, and submission build/verify commands | Provider-backed production remains a separate gated path. |
| Unified Codex plugin | “The packaged plugin exposes grounded local search and fetch plus version-gated workflow writes. A fresh Codex desktop task activated `$workshoplm`, fetched exact grounded evidence, and opened the local Workshop doorway; an isolated service run proved the write path through queued Video.” | `artifacts/spikes/plugin-desktop-host-2026-07-15.json`; `artifacts/spikes/plugin-skill-activation-2026-07-15.json`; `artifacts/spikes/plugin-supported-host-2026-07-15.json`; plugin server/service tests and the write-path entry in `log.md` | Codex desktop/CLI is the supported executable host. The separately installed classic ChatGPT app exposed no unified local-plugin surface, so ChatGPT Work support is not claimed; no `/feedback` Session ID is inferred. |
| Codex contribution | “Codex accelerated implementation and verification across the monorepo, local state, plugin, UI, worker, and evidence path.” | Dated commits; `log.md`; package checks and acceptance records | Do not substitute a disposable task ID for the required `/feedback` Session ID. |
| GPT-5.6 build contribution | “The build used Codex on GPT-5.6 for implementation, orchestration, review, and verification.” | Codex task history; dated commits; `log.md` | Keep this separate from product-runtime use. Do not say WorkshopLM called GPT-5.6 until provider request/result provenance exists. |
| Self-build trace | “Every rendered Video carries a build record from the raw transcript and grounded Sources through approved inputs, hashed Outputs, Build Week commits, and honest provider limitations.” | Version-specific `BUILD-TRACE.html` and `BUILD-TRACE.json`; Video build-trace hashes; submission manifest | The recorded fixture must keep zero live-provider counts visible until provider evidence exists. |
| Current verification floor | “The current recorded build passes checks across 13 packages, 15 web contract/unit tests, 18 production-route browser tests, six acceptance gates, and submission integrity verification.” | Latest `pnpm check`, production-route Playwright, `pnpm demo:e2e`, and `pnpm submission:verify` entries in `log.md` | Re-run before final publication; counts may change as tests are added. |

## Claims that remain gated

| Claim | Evidence required before use | Until then |
| --- | --- | --- |
| Live GPT-5.6 product reasoning | Authorized benchmark or product run with request/result provenance, inspected output, and logged model route | Say the deterministic fixture replays the path. Separately describe GPT-5.6 use in Codex only when the final session evidence supports it. |
| Coherent GPT Image 2 batch | Six provider image files, request provenance, coherence evaluation, and gallery inspection | Call the current six panels a planned image set. |
| Provider narration | Provider audio files, request provenance, audible inspection, and current narrated render | Disclose deterministic placeholder-tone audio. |
| Live Realtime voice | One microphone turn persisted with final provider transcript plus provider item and event IDs, then grounded downstream | Say the capture boundary is implemented and tested, not live-verified. |
| ChatGPT Work support | A future installed Work surface that exposes and invokes the bundled local plugin | Not a current product or submission claim. The verified supported host is Codex desktop/CLI with the local in-app browser. |
| Plugin doorway footage | A captured, legible Codex-side opening of the local Workshop that matches the final cut | Do not imply the web app alone proves plugin integration. |
| Original pre-code brainstorm | An authentic dated pre-code artifact | It cannot be backfilled. A new recording must be called a contemporaneous founder brainstorm. |
| Professional send-it validation | A cold professional reviews the external-use deck candidate and returns `Send` or names the first required revision | Say the editable candidate passed deterministic and visual inspection, not external approval. |
| Final self-produced submission | Final Devpost copy, README narrative, deck, thumbnails, Storyboard, narration, and public Video in one verified Output set, with provider-backed media where claimed | Say Codex built WorkshopLM from the goal file and WorkshopLM produced a traced `partial` recorded-fixture set. Do not say the product built itself or produced the final public submission. |
| Public judge experience | Final under-three-minute public YouTube video, logged-out verification, stable release tag, and working submitted links | Keep all drafts and local recordings labeled as drafts. |

## Final publication gate

Before the Devpost entry or video is final:

1. Re-run `pnpm check`, the production-route UI suite, `pnpm demo:e2e`, and `pnpm submission:verify`.
2. Resolve each gated claim above from an inspected artifact, or remove it from the final copy.
3. Confirm the screen labels and narration use `Sources`, `Map`, `Brief`, `Style`, `Outputs`, `Storyboard`, `Video`, and `Show source`.
4. Verify the final video against the product state shown; the video and description must not promise behavior the build does not demonstrate.
5. Record the primary Codex `/feedback` Session ID, public YouTube URL, stable release tag, and logged-out link checks in `log.md`.
