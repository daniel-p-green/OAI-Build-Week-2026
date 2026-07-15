# Build Log

Append-only record of meaningful work completed for the OpenAI Build Week project.

## Logging rules

- Add an entry after each meaningful research, product, design, engineering, testing, deployment, or submission milestone.
- Use Central Time unless an external deadline is explicitly given in another time zone.
- Record what changed, how it was verified, important decisions, and anything still uncertain.
- Keep claims proportional to evidence. Distinguish written, implemented, locally tested, deployed, and judge-verified states.
- Preserve earlier entries. Correct mistakes in a new entry rather than silently rewriting history.
- Link to relevant workspace files and include commands, task IDs, commit hashes, URLs, or screenshots when they are useful evidence.

## Entry template

```markdown
## YYYY-MM-DD HH:MM CT — Short milestone

**Area:** Research | Product | Design | Engineering | Testing | Deployment | Submission

### Changed

- What was added, changed, or decided.

### Verified

- The live artifact, command, page, or output used as evidence.

### Decisions

- Important choices and why they were made.

### Open items

- Remaining work, uncertainty, risks, or blockers.
```

---

## 2026-07-13 23:32 CT — Durable sanitized-source ingestion reaches the browser Map

**Area:** Capture / Runtime / Product

### Changed

- Added a local source-ingestion command that normalizes pasted sanitized text, hashes and stores it beneath the local Workshop data root, persists source metadata in SQLite, and creates a grounded Map evidence card in the same state document.
- Added the browser's **Add local source** panel and the corresponding `POST /api/workshop` action. The panel accepts a title, origin, and source text; no account or remote connector is involved.

### Verified

- Worker tests passed 5/5 and worker typecheck passed.
- Web typecheck and production build passed.
- A production server HTTP request ingested a source, returned four sources and five Map nodes, then exposed the new source and grounded node on a subsequent `GET /api/workshop`.
- Reset and `pnpm demo:e2e` passed after the live route check.

### Decisions

- This is a durable sanitized-text path, not yet file-byte or URL fetching. Those remain explicitly open rather than being represented as complete by the UI's origin field.

### Open items

- Add local-file and safe URL adapters, normalized chunk/claim persistence, typed graph operation UI/undo, and the full source-to-claim provenance query.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:27 CT — Public source repository established

**Area:** Submission / Repository

### Changed

- Created the public repository at `https://github.com/daniel-p-green/OAI-Build-Week-2026` and pushed the existing `main` history.

### Verified

- GitHub CLI confirmed the repository exists, is `PUBLIC`, has `main` as its default branch, and the local `main` branch tracks `origin/main`.
- A tracked-file credential-pattern scan found only `.env.example` and intentional redaction-test strings; no token-shaped credential was found in tracked content.

### Decisions

- The repository is public now so dated commits and the evolving implementation are inspectable throughout Build Week. Judge-facing completion claims remain gated on the evidence in this log and `GOAL.md`.

### Open items

- Add the public-facing README/install and sanitized-fixture instructions only after the live product path they describe is verified.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:28 CT — Public repository entry point

**Area:** Submission / Documentation

### Changed

- Added a root README with local recorded-fixture commands, architecture routing, privacy/judge context, and links to the evidence records.

### Verified

- The documented commands match root package scripts: `demo:reset`, `demo:e2e`, `demo:render`, `dev`, and `check`.

### Decisions

- The README explicitly separates the verified deterministic slice from unfinished locked scope so the newly public repository does not overstate readiness.

### Open items

- Replace the in-progress wording with captured product proof only as each public-facing path is actually verified.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 — Hackathon reference established

**Area:** Research / Submission

### Changed

- Created `research/hackathon/` as the durable OpenAI Build Week reference directory.
- Added a rules digest, submission checklist, judging and track notes, practical build notes, and announcement log.
- Confirmed the exact Devpost submission category is **Work & Productivity**.

### Verified

- Pulled the current OpenAI Build Week overview, official rules, submission fields, dates, judging criteria, prizes, and announcements from the authenticated Devpost Hackathons app.
- Verified the category dropdown offers `Work & Productivity` exactly.
- Verified the submission deadline is July 21, 2026 at 5:00 PM Pacific.
- Verified required submission evidence includes a working project, public YouTube demo under three minutes with audio, repository and README, judge access, and the primary Codex `/feedback` Session ID.

### Decisions

- Treat the official rules and hackathon website as authoritative when plugin data, announcements, or local notes conflict.
- Keep the project and judge credentials available through at least the August 12 winner announcement because Devpost currently exposes inconsistent judging-end dates.
- Maintain one primary Codex task for the majority of core implementation so the required `/feedback` Session ID represents the build accurately.
- Provide a privacy-safe sample-data path that does not require judges to connect private accounts or services.

### Open items

- Refresh rules and announcements before final submission.
- Initialize the project repository and begin dated implementation commits.
- Decide the final project name and product scope.
- Define the judge-test path and sanitized sample dataset.

---

## 2026-07-13 — Project agent instructions established

**Area:** Product / Engineering

### Changed

- Added a root-level `AGENTS.md` for project-specific execution guidance.
- Made maintaining this append-only `log.md` a durable instruction for future work.
- Added hackathon evidence, privacy-safe demo, licensing, verification, and implementation defaults.

### Verified

- Confirmed no project-local `AGENTS.md` existed before the change.
- Verified the new file points to the hackathon reference directory and requires milestone entries in this log.

### Decisions

- Keep detailed rules in `research/hackathon/` and use `AGENTS.md` for concise behavioral requirements rather than duplicating the entire ruleset.
- Require evidence-specific status language so local drafts, implementations, tests, deployments, and submission readiness are not confused.

### Open items

- Revisit `AGENTS.md` when the application stack and required verification commands are established.

---

## 2026-07-13 19:19 CT — Naming collision pass completed

**Area:** Research / Product

### Changed

- Rejected `Notedex` and `Notex` as public product names based on exact, adjacent product collisions.
- Recorded current collisions across the obvious brief, signal, shape, trace, source, frame, loom, and form naming territory.
- Established that design work will use neutral project language and a replaceable internal slug until a public name passes a dedicated review.

### Verified

- Inspected the live NoteDex product, which already combines visual note cards, handwriting, canvases, audio transcription, AI summarization, and storyboards.
- Inspected the current NoteX product description, which already positions itself as AI meeting intelligence that transforms voice conversations into structured knowledge.
- Checked live product pages and current search results for BriefCraft, SignalCraft, ShapeWork, TraceWork, SourceFrame, DraftLoom, Contexture, Formant, Groundline, and Threadform.
- Verified `threadform.com` resolves to an existing canvas-products business and that the exact name also appears on a current mobile game.

### Decisions

- Do not use an OpenAI product mark, `Notedex`, or `Notex` in the project identity.
- Do not let naming delay the product-design and architecture gates.
- Treat this as collision discovery, not legal trademark clearance.

### Open items

- Develop and screen a smaller final-name shortlist after the core interaction design is approved.
- Complete domain, app-store, repository, social-handle, and trademark checks before selecting the public submission name.

---

## 2026-07-13 20:44 CT — Whiteboard model approved

**Area:** Product / Design

### Changed

- Locked one canonical semantic graph with two whiteboard treatments.
- Defined Map as the editable Excalidraw thinking surface.
- Defined Sketch as a polished, regenerable hand-drawn output of an approved graph version rather than a second editor.

### Verified

- Recorded the user's explicit approval in the primary whiteboard and interface research documents.
- Confirmed the design retains shared node IDs, evidence links, graph versions, and stale-state behavior across both views.

### Decisions

- All content edits flow through typed semantic-graph operations.
- Sketch cannot diverge silently: upstream graph changes mark it stale until regenerated.
- Two independent whiteboard engines are out of scope.

### Open items

- Obtain approval for the remaining product architecture, end-to-end data flow, failure handling, and verification design.
- Write and self-review the consolidated specification after all design sections are approved.

---

## 2026-07-13 20:58 CT — WorkshopLM name approved

**Area:** Product / Submission

### Changed

- Adopted **WorkshopLM** as the working public name for the product and hackathon submission.
- Added the tagline **“Turn raw thinking into finished work.”**
- Defined the intentional NotebookLM association and the language that distinguishes WorkshopLM from a study or note-taking product.

### Verified

- Current exact-name web searches returned no WorkshopLM product.
- GitHub's repository-name search returned zero exact matches.
- The npm registry returned no `workshoplm` package.
- DNS checks returned no current records for `workshoplm.com` or `workshoplm.ai`.
- The user explicitly confirmed that the NotebookLM association is beneficial for hackathon judging.

### Decisions

- Use the association as fast category shorthand, then differentiate through the professional Capture → Shape → Deliver workflow.
- Do not imply affiliation with Google or use OpenAI, ChatGPT, GPT, Google, or NotebookLM marks in the product identity.
- Keep the internal package slug replaceable pending formal trademark and domain review.

### Open items

- Complete trademark, app-store, repository, social-handle, and registrant checks before treating the name as commercially cleared.
- Apply WorkshopLM naming consistently when the product scaffold and submission materials are created.

---

## 2026-07-13 20:59 CT — WorkshopLM positioning locked

**Area:** Product / Submission

### Changed

- Added the internal thesis: “NotebookLM, but better for professional production and built with OpenAI.”
- Added the judge-facing line: “WorkshopLM is NotebookLM for finished work—built on the OpenAI API.”

### Verified

- The user explicitly confirmed the intended product frame: “It's NotebookLM but better and with OpenAI.”
- Recorded the positioning in both the product-opportunity and naming documents.

### Decisions

- Use NotebookLM as category shorthand during the hackathon pitch.
- Replace an unsupported blanket “better” claim in public materials with demonstrated advantages visible in the product flow.

### Open items

- Validate every claimed advantage in the live demo before using it in judge-facing copy.

---

## 2026-07-13 21:00 CT — Living goal tracker established

**Area:** Product / Engineering

### Changed

- Added root-level `GOAL.md` as the editable source of truth for the full objective, locked decisions, current phase, progress checklist, evidence, and non-goals.
- Updated `AGENTS.md` to require reading and maintaining both the living goal and append-only build log.

### Verified

- Confirmed no prior `GOAL.md` or `goal.md` existed in the workspace.
- Derived the checklist from the active WorkshopLM objective, approved product decisions, current research, engineering direction, and hackathon requirements.
- Kept all implementation and verification work unchecked because no application repository or runtime exists yet.

### Decisions

- Use `GOAL.md` for current truth and remaining work.
- Continue using `log.md` for dated, append-only evidence and decision history.
- Check progress only when direct file, command, runtime, test, or external-surface evidence proves it.

### Open items

- Continue the remaining product-design approvals before writing the formal specification.
- Initialize Git only after the design gate permits repository setup.

---

## 2026-07-13 21:05 CT — OpenAI model architecture locked

**Area:** Research / Product / Engineering

### Changed

- Locked the official OpenAI API and model responsibilities for WorkshopLM.
- Assigned GPT-5.6 and the Responses API to structured project reasoning and orchestration.
- Assigned hosted File Search and per-project vector stores to RAG while preserving WorkshopLM-owned evidence records.
- Assigned `gpt-realtime-2.1` over browser WebRTC to live conversation, `gpt-4o-mini-tts` to approved narration, and direct `gpt-image-2` calls to coherent batch production.
- Reserved the Responses image-generation tool for conversational image edits.

### Verified

- Fetched current official OpenAI developer documentation through the OpenAI Developer Docs MCP server.
- Verified official JavaScript examples use `gpt-5.6` with Responses and File Search.
- Verified browser Realtime guidance uses `gpt-realtime-2.1`, WebRTC, and server-minted ephemeral client secrets from `/v1/realtime/client_secrets`.
- Verified standard OpenAI API keys must remain on the server.
- Verified current speech guidance recommends `gpt-4o-mini-tts` and requires disclosure that generated voices are AI-generated.
- Verified the current GPT Image 2 model ID, snapshot, direct image endpoints, multi-turn Responses editing, and automatic high-fidelity reference processing.

### Decisions

- Keep all OpenAI SDK calls inside `packages/ai` adapters rather than React components or renderers.
- Persist model, prompt/instructions, inputs, source/claim context, and version metadata with every generated artifact.
- Use deterministic adapters and fixtures for tests instead of spending API credits.
- Treat batch generation and visual coherence as separate concerns; evaluate and selectively regenerate outliers.

### Open items

- Confirm the four proposed founder defaults before writing the consolidated design specification.
- Configure a project-scoped API key only when implementation begins.
- Validate actual model access, quotas, latency, and organization verification in the live environment.

---

## 2026-07-13 21:15 CT — NotebookLM live user flow mapped

**Area:** Research / Product / Interface

### Changed

- Added a privacy-safe live user-flow map for the NotebookLM library, Sources, Chat, citations, Studio, and focused output viewer.
- Saved seven reference screenshots under `research/screenshots/notebooklm/`.
- Locked Workshop as the user-facing top-level container and preserved the familiar Sources / center workspace / Studio shell.
- Defined the WorkshopLM center as a Conversation / Map switch with one persistent text and Realtime composer.

### Verified

- Inspected the signed-in NotebookLM product through Chrome using public featured notebooks only.
- Verified the library filters, search, grid/list toggle, sort, source counts, and create entry point.
- Verified grouped source selection, active-source scoping, inline citation behavior, adjacent source preview, durable Studio output history, audio interactive-mode controls, and focused output viewing.
- Confirmed that no notebook was created, copied, edited, or shared during inspection.

### Decisions

- Product constraint: “We are not reinventing the Notebook wheel. We are making it grow up and go to work.”
- Preserve NotebookLM's navigational familiarity; differentiate through professional shaping, style, provenance, approvals, editability, and deterministic production.
- Avoid introducing a long wizard or a second unrelated production application.

### Open items

- Approve the Studio / Output type / Output vocabulary and the remaining approval gates.
- Create a disposable NotebookLM notebook only if deeper first-run/source-add research becomes necessary and explicitly authorized.

---

## 2026-07-13 21:22 CT — WorkshopLM technical design drafted

**Area:** Product / Engineering

### Changed

- Added `docs/superpowers/specs/2026-07-13-workshoplm-design.md` as the consolidated product and technical design.
- Captured the approved Workshops → Sources | Conversation/Map | Studio information architecture, full Capture → Shape → Deliver path, canonical model, state machines, style system, job behavior, rendering contracts, security boundary, and verification plan.
- Selected a hackathon-minimal platform direction: TypeScript pnpm/Turborepo, Next.js web, worker process, Supabase Postgres/Storage/Auth, and Postgres-backed durable jobs.
- Aligned older engineering/OpenAI research from the ambiguous `Project` term to the approved durable `Workshop` domain term.

### Verified

- Self-reviewed the specification for objective coverage, missing production gates, contradictory package/container vocabulary, unresolved placeholders, and accidental expansion into a general-purpose design product.
- Confirmed the specification retains every objective-critical integration: File Search, Realtime/WebRTC, GPT Image 2, GPT-4o mini TTS, Excalidraw, HyperFrames, citations, exact style rules, stale propagation, and the sanitized meta-demo.

### Decisions

- Treat Studio / Output type / Output set and the two production gates as proposed defaults to be explicitly reviewed in the technical design rather than silently embedded in the build.
- Keep Pipecat outside the MVP and preserve a narrow realtime-adapter seam.

### Open items

- Obtain founder review of the technical design before writing the detailed implementation plan.
- Technical design and research committed as `a68f0a8` (`docs: capture WorkshopLM technical design`).

---

## 2026-07-13 21:49 CT — Autonomous execution architecture locked

**Area:** Product / Engineering / Planning

### Changed

- Reconciled the three files in `/Users/danielgreen/Downloads/hack-build-revised.zip` with the existing project instead of applying them as blind replacements.
- Preserved the full WorkshopLM product scope and locked the integration-first execution architecture, four-slot model, contract freeze, red-team role, and daily acceptance seam.
- Merged the colleague's autonomous loop into the broader project instructions supplied by Daniel; routine product, engineering, fallback, and compatible contract decisions no longer wait for scheduled founder approval.
- Locked Studio vocabulary, exactly two blocking approvals, the sanitized judge fixture plus bounded live sample path, independent gate flags, HTML/CSS presentation rendering, and the meta-demo provenance surface.
- Added the dated root execution runbook and a task-level test-first foundation/integration-spike plan.
- Replaced the proposed linear Workshop lifecycle in the technical design with independently derived gate flags and per-object stale overlays.
- Simplified the demo to a local-first runtime: SQLite WAL persistence, filesystem artifacts, local worker, local HyperFrames, and no hosting/auth/cloud-storage requirement.
- Selected the ChatGPT/Codex in-app browser as the primary demo surface.
- Reframed WorkshopLM as a unified ChatGPT/Codex plugin that packages workflow skills, a bundled local stdio MCP server, and compact review widgets while retaining the full local browser workspace for Map/Studio production.

### Verified

- Inspected every file in the colleague zip from an isolated `/tmp` extraction before editing the workspace.
- Verified the installed HyperFrames guidance describes a local Node/HTML/GSAP/Chrome/FFmpeg CLI workflow with `doctor`, `lint`, `validate`, `inspect`, and `render` commands—not a hosted authenticated submit/poll API.
- Corrected Spike D to require a local `DESIGN.md`, local MP4 verification, and a narrow FFmpeg fallback; removed Remotion as a preselected duplicate stack.
- Compared the revised documents against the existing design, GOAL, log, and project instructions for approval bottlenecks and lifecycle/renderer contradictions.
- Verified OpenAI's July 9, 2026 plugin change from current official help/release material: plugins are now the discovery container across ChatGPT Work and Codex and may package skills, apps, and app templates.
- Inspected current installed OpenAI plugin manifests. The Data Analytics plugin provides a directly relevant working pattern: skills, optional apps, a local stdio MCP server, and rich widgets in one plugin package.

### Decisions

- Daniel's directive to avoid making him the bottleneck authorizes autonomous execution inside the locked product vision.
- Progress digests are informational. Escalation is reserved for credentials/spend, material privacy/security/licensing or public-claim decisions, irreversible external actions, product-changing breaking decisions, and evidence-backed inability to preserve an objective-critical capability.
- The primary integrator may approve additive contract evolution with tests and may activate designed fallbacks from live evidence.
- HyperFrames remains the primary video renderer because it directly supports the intended DESIGN.md-driven deterministic production path.
- The plugin is the OpenAI-native packaging and orchestration boundary, not a replacement for the rich local workspace. Core judge use has no required app connection; Granola/Drive remain optional source adapters.

### Open items

- Capture and timestamp the original raw meta-demo brainstorm before application code begins.
- Scaffold the monorepo and run the four live integration spikes.
- Live OpenAI and Supabase verification will require project credentials; no credential availability has been claimed yet.
- Record the active Codex `/feedback` Session ID when the product surface exposes it; none was invented for this entry.

---

## 2026-07-13 22:08 CT — Unified ChatGPT host and flagship GUI locked

**Area:** Product / Architecture / Design

### Changed

- Split the product cleanly across the new unified ChatGPT application: the native ChatGPT task is WorkshopLM's Conversation/voice layer, while the in-app browser is its visual Sources/Map/Studio production workspace.
- Removed the duplicate WorkshopLM chat/composer from the browser design.
- Added Codex app-server as the account/task bridge so WorkshopLM does not create a second login system or persist ChatGPT tokens.
- Made native ChatGPT voice/task synchronization the primary capture path; retained `gpt-realtime-2.1` only as a spike-gated fallback.
- Replaced hosted-vector-store dependency with plugin-native source grounding: normalized evidence, standard `search`/`fetch`, SQLite FTS5/BM25, exact search, and durable claim→chunk→source edges. Hosted File Search remains an optional adapter/comparison.
- Added optional existing ChatGPT apps/MCPs as source lanes that normalize into the same evidence contract; the judge fixture remains connector-free.
- Added root `DESIGN.md` as the concrete flagship GUI contract for layout, palette, typography, Map behavior, evidence visuals, Studio, image batches, storyboard, provenance, motion, accessibility, and demo beats.

### Verified

- Verified the live installed `codex-cli 0.144.1` app-server commands and generated its current v2 JSON protocol schema into `/tmp`.
- Verified `account/read`, supported ChatGPT login start/cancel/logout flows, account update/completion notifications, and safe ChatGPT account response fields.
- Verified the external-token login variant is marked unstable/internal and excluded it from the architecture.
- Verified the current local Codex session reports `Logged in using ChatGPT` without reading or exposing credential files.
- Verified current installed unified plugins can bundle skills, optional apps, a local stdio MCP server, and rich widget assets.

### Decisions

- Plugin complexity is contained by a thin-shell rule: status/trace/open/actions only; no duplicate Map, Studio, storyboard editor, asset browser, chat, or Realtime client unless the fallback is activated.
- Existing Granola, Drive, and other app/MCP integrations are optional accelerators, not judge-path dependencies.
- Source grounding is a product invariant, not a commitment to one retrieval vendor. `verified` claims require durable evidence edges regardless of retrieval adapter.
- Codex app-server authentication does not automatically prove entitlement to direct Image, TTS, Realtime, or other API endpoints; live provider credentials remain a separate spike fact.

### Open items

- Run the host-sync spike to prove current-task linkage and whether native voice-originated turns are durably observable.
- Run the plugin-host spike to prove actual local stdio/widget support separately in Work and Codex.
- Build and visually verify the root `DESIGN.md` shell in the in-app browser before expanding feature breadth.

---

## 2026-07-13 22:41 CT — Full implementation goal and video-first judge path locked

**Area:** Product / Engineering / Submission

### Changed

- Reconciled the colleague's execution-readiness audit into the live goal and plans without reducing WorkshopLM's product scope.
- Converted `GOAL.md` from an architecture/planning tracker into an explicit full-implementation mandate with ten observable completion conditions.
- Made the public under-three-minute demo video the canonical judge experience; the sanitized fixture now supports repeatable recording and optional inspection rather than a separate judge-installation product.
- Pre-decided the Spike A fallback placement and deadline, split the domain freeze around the transcript adapter, strengthened the hostile retrieval fixture, and made recorded-fixture E2E replay explicit.
- Made Codex Session ID recording unconditional: each milestone records the ID or explicitly states why the surface could not expose it.

### Verified

- Read the colleague's complete archive review and compared each finding against the current `GOAL.md`, `AGENTS.md`, `DESIGN.md`, execution runbook, foundation plan, submission checklist, and build-log tail.
- Verified an OpenAI API key is present in the current environment without exposing its value. Model entitlement and spend-cap behavior have not yet been proven by a live provider check.
- Confirmed the revised goal retains every locked user-visible capability: unified plugin/browser surface, voice capture, grounded sources, Map and Sketch, `FRAME.md`, website/manual style, deck, infographic, coherent images, editable storyboard, HyperFrames video, stale propagation, and provenance.

### Decisions

- Full product implementation is authorized. Integration spikes gate only the provider-dependent code they inform; foundation, contracts, deterministic adapters, GUI, and fixture work proceed in parallel.
- Judges should not be expected to recreate the local Codex/plugin environment. The video must show a real functioning product, while setup instructions and a sanitized inspection path remain concise supporting evidence.
- Designed fallbacks may change mechanics but may not silently remove the user-visible capability they preserve.

### Open items

- Start the implementation run in a fresh Codex task using the revised `GOAL.md`, on the user's requested Terra model.
- Capture and timestamp the original raw voice brainstorm before application implementation begins.
- Run the no-spend model-list authentication check, then the five live spikes and parallel platform foundation.
- Codex `/feedback` Session ID: the current surface has not exposed a verified `/feedback` ID for this milestone; do not infer one from unrelated local identifiers.

---

## 2026-07-13 22:45 CT — OpenAI key authentication and model visibility checked

**Area:** Engineering / Testing

### Changed

- Recorded the current API-key entitlement fact in `GOAL.md` before implementation handoff.

### Verified

- `GET /v1/models` returned HTTP 200 using the configured key; no generation call or paid model operation was made.
- Exact model endpoints returned HTTP 200 for `gpt-image-2`, `gpt-4o-mini-tts`, and `gpt-realtime-2.1`.
- `GET /v1/models/gpt-5.6` returned HTTP 404 with `model_not_found` for the current key/project context.
- The temporary response files were deleted after extracting only model IDs and error codes; no credential value was printed or persisted.

### Decisions

- Image, narration, and Realtime spikes may proceed with the configured key.
- Do not claim live GPT-5.6 product use until the correct model entitlement, alias, or project context is proven. Resolve it as an early provider spike without blocking deterministic foundation work.

### Open items

- Determine whether GPT-5.6 requires a different project-scoped key, model alias, or hackathon entitlement before the first paid reasoning call.
- Spend-cap availability is still unverified because the model endpoints do not expose project budget policy.
- Codex `/feedback` Session ID: the current surface has not exposed a verified `/feedback` ID for this milestone.

---

## 2026-07-13 22:59 CT — Foundation, GUI slice, and deterministic spikes

**Area:** Engineering / Product / Testing

### Changed

- Added the pnpm/Turborepo workspace, local deterministic reset, unified plugin shell, compact MCP tool surface, sanitized provider-report helpers, and a functional local Sources → Map → Brief → Storyboard UI slice.
- Added deterministic source-grounding, host-sync, and Image batch spikes. The visual workspace preserves the locked three-panel layout, no duplicate chat composer, evidence sheet, brief gate, storyboard gate, and local-video blocked state.

### Verified

- `pnpm check` passed after workspace type integration fixes; `pnpm --workspace-concurrency=1 test` passed all 12 package tasks (grounding 4 tests, image 2, host sync 3, plugin 3).
- `pnpm --filter @workshoplm/web build`, `pnpm demo:reset`, and `pnpm demo:e2e` passed. Browser verification at `http://localhost:3000` exercised Map approval, storyboard approval, and render eligibility. Browser plugin was unavailable, so Playwright was used as the documented fallback.
- Deterministic spike runners passed without provider spend. Image generation was not run live. Host-sync report is `credential_blocked` pending an explicitly opted-in disposable task and selects no native-voice pass.

### Decisions

- GPT-5.6 remains unclaimed in product behavior until the entitled alias/project is proven. Native voice remains undecided until its July 14 deadline; the UI is structured so a capture-only fallback can be added without a browser composer.

### Open items

- Implement durable SQLite/domain contracts, real worker outputs, provider-backed image/TTS checks, HyperFrames render spike, and actual in-app plugin installation validation.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:23 CT — Browser Sources and Map read durable Workshop state

**Area:** Product / Runtime / Testing

### Changed

- Moved the sanitized fixture source records and Map node records into the persisted `WorkshopState` document. The browser fetches and renders those records; its source evidence sheet now shows the selected persisted source.
- Added legacy state hydration so an existing local state record receives the fixture records without resetting approval state.

### Verified

- Worker tests, web typecheck, production web build, reset, and recorded E2E passed.
- A fresh production server returned three source titles and four Map node titles from `/api/workshop` after reset.

### Decisions

- This is a durable fixture query layer, not yet the full source ingestion/graph repository. The next step is replacing the fixture document with persisted normalized chunks, claims, and typed graph operations.

### Open items

- Wire local file/URL ingestion, graph mutations/undo, and output history to the same store; then validate the actual plugin host installation.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:21 CT — Queued HyperFrames worker execution verified

**Area:** Worker / Rendering / Testing

### Changed

- Added queue completion/failure recording, video state persistence, and a one-shot worker executor. The executor leases a queued `render_video` job, runs the local approved HyperFrames fixture composition, stores the MP4 atomically by SHA-256, and only marks the Workshop rendered after success.
- Added `pnpm demo:render` as the deterministic local render proof command.

### Verified

- Worker typecheck and four worker tests passed, including honest renderer-failure handling.
- `pnpm demo:reset && pnpm demo:render` returned a succeeded job and stored `video/mp4` artifact. `ffprobe` confirmed video and audio streams and a 6.037333-second duration. `pnpm demo:e2e` remained green.

### Decisions

- The worker runs the sanitized approved storyboard fixture through HyperFrames. It does not claim live TTS or arbitrary user-authored storyboard rendering yet.

### Open items

- Persist and render arbitrary current storyboard panels, replace remaining static browser content with durable entities, and prove plugin installation inside the actual supported host surface.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:18 CT — Plugin stdio state and command gates verified

**Area:** Plugin / Integration / Testing

### Changed

- Replaced generic MCP responses with persisted SQLite fixture state. `workshop_list` and `workshop_open` now return local Workshop state; brief/storyboard/render commands apply explicit gates and persist valid transitions.

### Verified

- Plugin build and five tests passed, including a spawned built stdio server receiving JSON-RPC initialize, tool list, and call requests. Domain tests (8) and recorded acceptance E2E also passed.

### Decisions

- Plugin mutations use the same durable state boundary as the browser fixture. Compact widgets remain doorway surfaces rather than duplicate Map/Studio editors.

### Open items

- Execute the queued render job through the local worker and verify actual plugin loading in the supported ChatGPT/Codex desktop path.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:13 CT — Browser approvals and queue now persist locally

**Area:** Product / Runtime / Testing

### Changed

- Added a server-side local Workshop service and `/api/workshop` route. The browser now reads persisted approval/queue state and sends Map approval, storyboard approval, and render enqueue mutations to the local SQLite runtime.
- Configured the worker data root from its source location so the web runtime and `pnpm demo:reset` share the repository-owned `.workshoplm` state directory.

### Verified

- Production Next build passed with the dynamic API route.
- After reset, the live local route on port 3002 returned `blocked`, then persisted brief approval, storyboard approval, and a queued video job in order through real HTTP requests.

### Decisions

- The browser is now a thin client for gate state; it does not itself claim a render has completed. The worker queue remains responsible for execution.

### Open items

- Replace remaining static source/Map/Studio fixture content with repository queries and connect the queued video job to the proven renderer.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:08 CT — Recorded Capture → Shape → Deliver acceptance seam

**Area:** Integration / Testing

### Changed

- Replaced the fixture-only E2E marker with a deterministic acceptance runner that normalizes source material, retrieves a cited answer, validates independent approvals, validates a current approved storyboard, writes deck/infographic artifacts, stores a hash-addressed artifact, and leases a video job from SQLite.

### Verified

- `pnpm demo:e2e` passed in recorded-fixture mode with one grounding citation, all pre-render gates true, one approved storyboard panel, deck/infographic paths, and a stored SHA-256 artifact path.

### Decisions

- This proves the deterministic seam only; it does not claim live GPT-5.6, image, TTS, voice sync, or a final HyperFrames render inside the worker queue.

### Open items

- Route the real UI/MCP commands through these durable services and connect the accepted storyboard job to the proven HyperFrames adapter.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:06 CT — Domain freeze, durable local runtime, and HyperFrames proof

**Area:** Engineering / Testing

### Changed

- Added v1 typed domain contracts for evidence, graph operations/undo, independent gates, stale propagation, FRAME/style/storyboard, jobs, and `artifact.json`.
- Added the SQLite WAL local worker boundary with foreign keys, atomic hash-addressed artifact storage, and idempotent input-key job leasing.
- Added the HyperFrames three-scene render spike and root `spike:video` command.

### Verified

- Domain typecheck and six schema/transition tests passed. Worker typecheck and two storage/queue tests passed.
- HyperFrames test/typecheck/verify passed; the local render at `artifacts/spikes/spike-d.mp4` has audio and video streams and is 6.037333 seconds by `ffprobe`.

### Decisions

- HyperFrames remains the local video renderer; no FFmpeg fallback is active. The fixture narration is deterministic/disclosed; live TTS remains separately unverified.

### Open items

- Connect domain/runtime commands to the web and MCP surface, persist the sanitized fixture into SQLite, implement source/graph/style/output commands, and prove plugin installation plus live provider behavior.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:37 CT — Typed, durable Map edit and undo

**Area:** Shape / Runtime / Product

### Changed

- Wired the domain graph-operation history into the local Workshop service. A Map operation is validated, persisted with its inverse and actor metadata, and reflected into the browser's Map nodes.
- Added an inline Map-card title editor and Undo control. A semantic Map edit clears brief/storyboard approvals and blocks video again, preventing an outdated downstream render.
- Repaired the strict domain undo contract: an inverse `update_node` now omits the immutable node ID from its patch.

### Verified

- Domain tests passed 11/11; worker tests passed 6/6; both packages typechecked.
- Web typecheck and optimized production build passed.
- A production HTTP sequence changed `node-promise`, returned `briefApproved: false`, `storyboardApproved: false`, and `videoState: blocked`, then restored the original title through `undoMapOperation`.
- `pnpm demo:reset` and `pnpm demo:e2e` passed afterward.

### Decisions

- Map edits use the canonical typed graph history rather than an untyped UI-only patch. The current browser control edits node titles; additive/remove/edge operation affordances remain the next UI increment.

### Open items

- Connect full graph-operation controls, durable source chunks/claims, real frame/style versions, output history, and complete stale propagation to the same document.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:40 CT — Persisted FRAME and manual Style Library gates

**Area:** Shape / Style / Runtime

### Changed

- Map approval now creates and stores a versioned `FRAME.md` document derived from current Map evidence. The Brief view reads that persisted markdown instead of presenting only a static brief.
- Added a manual Style Library lock with explicit palette tokens and version metadata. Storyboard approval now requires both a current approved brief and a locked current style.
- The Design view exposes the real manual-style lock action and the Storyboard view communicates when style is the blocking gate.

### Verified

- Worker tests passed 6/6 and worker typecheck passed; web typecheck and optimized production build passed.
- On a fresh production server, HTTP actions produced `FRAME.md` v1, persisted manual style v1 tokens, then approved the storyboard in the required order.
- Reset and `pnpm demo:e2e` passed after that live state check.

### Decisions

- The manual style path is intentionally available now; website extraction remains a separate required adapter, not a hidden claim made by the manual lock.

### Open items

- Add website style ingestion, durable generated-output history, editable storyboard panels, complete source chunks/claims, and transitive stale states across production artifacts.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:43 CT — Durable evidence chunks and plugin retrieval

**Area:** Capture / Plugin / Grounding

### Changed

- Local sanitized-source ingestion now persists normalized chunks and verified claim records with source and chunk locators, alongside its source and Map records.
- The source form can read supported local text files into the same normalized ingestion path.
- The plugin's `search` and `fetch` tools now query persisted chunks and linked claims, ranking matching evidence and returning explicit missing-chunk errors rather than placeholder fixture results.

### Verified

- Worker tests passed 6/6 and worker typecheck passed; the ingestion test proves a source becomes two linked claims, two durable chunks, and an exact local search result.
- Plugin tests passed 5/5, including its stdio fixture search/fetch flow; plugin typecheck passed.
- Web production build, `pnpm demo:reset`, and recorded `pnpm demo:e2e` passed.

### Decisions

- The browser file affordance intentionally accepts text-like local files only. PDF parsing and safe URL retrieval remain open adapters, so the UI does not pretend arbitrary file/URL import is complete.

### Open items

- Add PDF and safe URL adapters, claim selection/trace UI, full graph controls, output history, editable storyboard panels, and transitive stale propagation.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:44 CT — Broadened deterministic verification

**Area:** Integration / Testing

### Verified

- `pnpm check` passed: lint, typecheck, and tests succeeded across all 13 workspace packages.
- The suite includes domain graph/undo coverage, worker persistence and render-failure coverage, plugin stdio evidence retrieval, production renderer tests, grounding, host-sync fallback, image-manifest, and local HyperFrames spike tests.

### Open items

- Green deterministic checks do not prove unimplemented Studio output history, editable storyboard panels, PDF/URL adapters, live provider behavior, or a plugin installation in the host.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:46 CT — Durable Studio deck and infographic generation

**Area:** Deliver / Runtime / Product

### Changed

- Added current-brief/current-style-gated deck and infographic generation to the local Workshop service. Each renderer writes its real HTML output, stores a content-hashed artifact copy, and records its claim IDs and paths in durable Workshop state.
- Connected the Studio Deck and Infographic controls plus output history to that service. Map edits now mark prior generated outputs stale with the rest of the downstream state.

### Verified

- Worker tests passed 7/7 and worker typecheck passed; web typecheck and optimized production build passed.
- A fresh production HTTP run approved the brief and manual style, produced `deck-v1` and `infographic-v1`, and returned their hash-addressed artifact paths in persisted state.
- Reset and recorded `pnpm demo:e2e` passed after the local live check.

### Decisions

- Outputs are deliberately real deterministic HTML artifacts now, not screenshots or decorative cards. GPT Image batches and editable storyboard generation remain separate required output paths.

### Open items

- Add editable storyboard persistence, image-batch generation/evaluation, PDF/URL adapters, website style extraction, full provenance UI, and trace outputs directly to persisted chunks/claims.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:49 CT — Editable, versioned storyboard runtime

**Area:** Deliver / Runtime / Product

### Changed

- Added persisted storyboard panels with title, narration, duration, panel approval, staleness, and version state.
- Replaced the static Story panel with an editable panel selector/form. Saving a panel creates a new storyboard version, revokes prior storyboard approval, and blocks video until the edited storyboard is approved again.
- Map mutations now mark storyboard panels stale alongside brief and generated output artifacts.

### Verified

- Worker tests passed 8/8 and worker typecheck passed; web typecheck and optimized production build passed.
- On a fresh production server, a storyboard was approved, then `panel-2` was changed through the HTTP API; the service returned version 2 with `storyboardApproved: false` and `videoState: blocked`.
- Reset and recorded `pnpm demo:e2e` passed afterward.

### Decisions

- The storyboard remains a real, lightweight panel editor rather than a second canvas. It preserves the locked approval semantics needed for the local HyperFrames path.

### Open items

- Add coherent image-batch generation/evaluation, PDF/URL adapters, website style extraction, richer graph operations, full provenance UI, and live-provider/host proof.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:51 CT — Safe public-URL source adapter

**Area:** Capture / Grounding / Security

### Changed

- Added `ingestUrl`, a local adapter that accepts credential-free public HTTP(S) text responses, resolves DNS before retrieval, rejects localhost/private-network targets, caps fetched content at 1 MB, and normalizes the result into the same local source/chunk/claim/Map path.
- Exposed the adapter through the local Workshop API.

### Verified

- Worker tests passed 9/9 and worker typecheck passed; web typecheck and production build passed.
- A real local API request for `https://example.com` stored a `WEB` source with one normalized chunk and five verified claims.
- Unsafe localhost and non-HTTP URL inputs are covered by tests and reject before a network request. Reset and recorded `pnpm demo:e2e` passed afterward.

### Decisions

- URL ingestion is public-text only. It deliberately rejects credentials and private destinations to keep the local product from becoming a network pivot.

### Open items

- Add PDF parsing, website style extraction, coherent image-batch generation/evaluation, richer graph operations, full provenance UI, and live-provider/host proof.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:53 CT — Website-derived Style Library path

**Area:** Style / Runtime

### Changed

- Added a public-website style adapter that reuses the safe public-text fetch boundary, records the reference URL and page title, extracts available six-digit color tokens, and persists a website-derived Style Library version.
- Exposed `lockWebsiteStyle` through the local Workshop API; it resets downstream storyboard/video approval just like a manual style change.

### Verified

- Worker and web typechecks plus production web build passed.
- A real local API call to `https://example.com` produced `Example Domain foundation`, recorded the canonical URL, and returned `storyboardApproved: false` and `videoState: blocked`.
- Reset and recorded `pnpm demo:e2e` passed after the live call.

### Decisions

- Website style extraction is intentionally conservative: it captures inspectable page metadata/color evidence and retains manual style as the exact-token fallback. It does not claim arbitrary website asset licensing or a full brand scrape.

### Open items

- Add PDF parsing, coherent image-batch generation/evaluation, richer graph operations, full provenance UI, and live-provider/host proof.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:55 CT — Coherent image-batch manifest in Studio

**Area:** Deliver / Runtime / Product

### Changed

- Added a durable six-panel Image Batch manifest derived from the locked Style Library, with one reference ID shared by every panel, deterministic prompt intent, panel versions, stale state, and selective-regeneration state.
- Connected the Studio Images action and output history to this manifest.

### Verified

- Worker tests passed 10/10 and worker typecheck passed; web typecheck and production build passed.
- The focused worker test proves six panels share the locked style reference and that selecting panel 3 only increments that panel to version 2 with regeneration state.
- Reset and recorded `pnpm demo:e2e` passed.

### Decisions

- The batch is honestly marked `planned` pending a live GPT Image 2 run. Its deterministic coherence/version contract is implemented, but no provider image asset is claimed until the credential-gated provider path is recorded.

### Open items

- Add PDF parsing, live GPT Image 2 generation/evaluation when authorized, richer graph operations, full provenance UI, and live-provider/host proof.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:57 CT — Live persisted provenance Trace

**Area:** Provenance / Product

### Changed

- Replaced the static Trace illustration with a state-backed provenance chain: source → normalized chunk → verified claim → Map node → `FRAME.md` version → persisted generated artifact.
- The Trace view now shows unavailable steps honestly and surfaces current/stale status from the real local document.

### Verified

- Web typecheck and optimized production build passed.
- Reset and recorded `pnpm demo:e2e` passed with the Trace consuming the same `/api/workshop` state document as Sources, Map, and Studio.

### Decisions

- The first visible trace follows the selected/first available evidence chain. Full multi-claim artifact graph browsing remains a richer follow-up rather than a static claim of complete coverage.

### Open items

- Add PDF parsing, live GPT Image 2 generation/evaluation when authorized, richer graph operations, multi-claim provenance browsing, and live-provider/host proof.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-13 23:59 CT — Local text-PDF adapter

**Area:** Capture / Grounding

### Changed

- Added `ingestPdfFile`, a local `.pdf` source adapter using the installed `pdftotext` executable. Extracted text enters the existing normalized source/chunk/claim/Map ingestion path as `PDF` source material.
- Exposed the adapter through the local Workshop API.

### Verified

- `pdftotext` is available at `/opt/homebrew/bin/pdftotext` in this runtime.
- Worker tests/typecheck plus web typecheck/build passed; recorded fixture reset/E2E passed.

### Decisions

- The adapter supports text-extractable PDFs only and clearly errors for scanned/protected/unreadable files. OCR is a separate capability and is not claimed here.

### Open items

- Run an inspectable text-PDF fixture through the adapter, add live GPT Image 2 generation/evaluation when authorized, richer graph operations, multi-claim provenance browsing, and live-provider/host proof.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:01 CT — Read-only OpenAI model entitlement recheck

**Area:** Provider / Verification

### Verified

- A credentialed, read-only `GET /v1/models/{model}` probe returned `200` for `gpt-image-2`, `gpt-4o-mini-tts`, and `gpt-realtime-2.1`.
- The exact `gpt-5.6` ID still returns `404 model_not_found` for this key/project.

### Decisions

- No image, TTS, Realtime, or reasoning generation was invoked, so this establishes endpoint visibility only and incurs no generation spend.
- Continue using deterministic image/voice fallbacks and do not claim live GPT-5.6 product use until an entitled alias/project is established.

### Open items

- Resolve the entitled GPT-5.6 alias/project, run an inspectable text-PDF fixture, and record explicitly authorized live media generation before any claim of those provider outputs.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:03 CT — Stale-propagation red-team test

**Area:** Red Team / Runtime / Testing

### Changed

- Added a focused regression test for upstream Map changes after generation and storyboard approval.

### Verified

- The test proves a typed Map edit marks persisted deck output and storyboard stale, clears storyboard approval, and makes `renderVideo` reject the now-invalid state.
- Worker tests passed 11/11, worker typecheck passed, and reset/recorded `pnpm demo:e2e` passed.

### Decisions

- Stale rejection remains a runtime contract rather than an advisory UI indicator; the UI state follows the same service document.

### Open items

- Extend stale red-team coverage to every artifact type and job interruption/retry paths; resolve the entitled GPT-5.6 alias/project and run an inspectable PDF fixture.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:05 CT — Full local approval-to-video seam

**Area:** Integration / Rendering / Testing

### Verified

- A fresh production browser API sequence approved the Map brief, locked the manual style, approved the storyboard, and queued the video job in order.
- `pnpm demo:render` leased and completed that queued job through the local HyperFrames worker. It produced hash-addressed artifact `artifacts/a6/workshoplm-demo-a69896d3e9cd5e45b0d94c8964d1a1158d8889648ad9fd143a072c3a517072ab` (326,674 bytes).
- `ffprobe` confirms both audio and video streams and a 6.037333-second duration.

### Decisions

- This proves the local approved-fixture rendering path end to end. It does not claim live TTS, arbitrary user-authored video composition, or final demo recording.

### Open items

- Extend this acceptance run through live source ingestion and all generated artifact types; resolve GPT-5.6 entitlement; record the actual public demo and host/plugin installation proof.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:07 CT — Corrected unsupported host-sync UI claim

**Area:** Product / Claim Integrity

### Changed

- Replaced the browser's `Synced to ChatGPT task` and `Linked ChatGPT task` labels with accurate local-fixture/local-state language.

### Verified

- Web typecheck and production build passed; recorded `pnpm demo:e2e` passed.

### Decisions

- Native ChatGPT task/voice synchronization remains unproven and must not appear as live product state in judge-facing UI. The designed capture-only fallback stays the honest path until host evidence changes.

### Open items

- Prove host sync or activate/show the capture-only fallback, then record its supported scope in the UI and demo.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:01 CT — Native host sync fallback activated

**Area:** Capture / Host Integration

### Changed

- Corrected root `pnpm spike:host-sync` to call the package's actual `verify` command rather than a nonexistent `run` command.

### Verified

- The corrected command produced a sanitized report at `artifacts/spikes/host-sync-2026-07-14T05-01-12-803Z.json` with `credential_blocked` status and the explicit capture-only `gpt-realtime-2.1` fallback decision.
- Host-sync durable task-turn tests passed 3/3.

### Decisions

- Native durable task/voice sync remains unproven because no disposable task ID and explicit live opt-in were supplied. The designed capture-only fallback is active; it does not imply native task linkage.

### Open items

- Implement and record the bounded capture-only fallback UI/API path or provide a disposable task ID to run the live host probe.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:04 CT — Durable capture-only Realtime fallback

**Area:** Capture / Runtime

### Changed

- Added the bounded `captureFallbackTranscript` API/service path. It stores a transcript segment marked `realtime_fallback` and normalizes the same text into durable source, chunk, verified claim, and Map evidence records.
- The fallback is API-only and intentionally does not add a duplicate browser chat/composer.

### Verified

- Worker tests passed 12/12, including fallback provenance/evidence persistence; worker and web typechecks plus production web build passed.
- Reset and recorded `pnpm demo:e2e` passed.

### Decisions

- This preserves the deadline fallback's capture boundary without falsely claiming a live Realtime session or native ChatGPT task synchronization. Live Realtime transport remains separately unverified.

### Open items

- Invoke this path from an authorized Realtime session or plugin capture control, record a live fallback sample, and complete host installation proof.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:15 CT — Full deterministic workspace recheck

**Area:** Integration / Testing

### Verified

- `pnpm check` passed lint, typecheck, and tests across all 13 workspace packages after capture fallback, stale propagation, safe URL/PDF, storyboard, image-batch, and provenance changes.
- Reset and recorded `pnpm demo:e2e` passed immediately afterward.

### Open items

- This remains deterministic/local verification. It does not prove provider-media outputs, installed host/plugin surface, native voice synchronization, or the public demo recording.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:16 CT — Unified plugin marketplace install verified

**Area:** Plugin / Host Integration

### Changed

- Added `.agents/plugins/marketplace.json`, the Codex marketplace descriptor that exposes the repository's unified `workshoplm` plugin.
- Added concise public plugin-install instructions to `README.md`.

### Verified

- `codex plugin marketplace add . --json` registered the local repository as marketplace `workshoplm-local`.
- `codex plugin add workshoplm@workshoplm-local --json` installed version `0.1.0` into Codex's local plugin cache, and `codex plugin list` reported it as `installed, enabled`.

### Decisions

- Codex CLI discovers plugins through a marketplace descriptor; it does not install an arbitrary plugin directory directly. The descriptor resolves its local source from the marketplace root (`"path": "."`).
- The host is required to start a fresh task before newly registered plugin tools can appear. This entry therefore proves installation, not an in-task tool invocation or native Work surface support.

### Open items

- Install from the public GitHub marketplace snapshot, invoke the registered skill and MCP server in a fresh Codex task, and then complete Spike E evidence.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:17 CT — Public GitHub marketplace installation verified

**Area:** Plugin / Public Repository

### Verified

- After commit `7a2c7d3` was pushed to public `main`, `codex plugin marketplace add daniel-p-green/OAI-Build-Week-2026 --json` cloned the public marketplace snapshot.
- `codex plugin add workshoplm@workshoplm-local --json` installed WorkshopLM `0.1.0` from that snapshot; `codex plugin list` reported it `installed, enabled` at Codex's Git marketplace cache.

### Decisions

- README installation instructions now match the exact public GitHub command that was exercised, with the narrow verified-platform boundary stated explicitly.

### Open items

- A fresh Codex desktop task must still invoke the installed skill and stdio MCP tools before Spike E can be checked as complete.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:18 CT — Plugin runtime artifact packaged

**Area:** Plugin / Runtime Integrity

### Changed

- Added the compiled `packages/plugin-mcp/dist` entry point to the public plugin artifact; `.mcp.json` executes this JavaScript file directly.
- Corrected README wording to state the explicit `WORKSHOPLM_DATA_ROOT` boundary instead of implying an installed plugin cache automatically shares an arbitrary source checkout's state.

### Verified

- `pnpm --filter @workshoplm/plugin-mcp build` and its five tests passed.
- After `pnpm demo:reset`, the compiled stdio server answered `initialize`, `tools/list`, and a `search` tool call using MCP JSON-RPC.

### Decisions

- The initial public snapshot omitted `dist/server.js`, which made its declared MCP command unrunnable. The release artifact is now versioned deliberately; source-only package tests were not treated as enough evidence.

### Open items

- Reinstall from the public GitHub snapshot and invoke the packaged MCP process from its installed cache. A desktop fresh-task invocation and configured data-root handoff remain separate host checks.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:19 CT — Installed MCP write path repaired

**Area:** Plugin / Runtime Integrity

### Changed

- The MCP persistence helper now creates the configured SQLite data directory before a write connection is opened.
- The stdio server now reports malformed JSON separately from unexpected request-processing failures.
- Added an empty-data-root create/list regression test and rebuilt the versioned plugin runtime artifact.

### Verified

- Plugin build and typecheck passed; the stdio test suite passed 6/6, including a workshop create/list round trip from an empty data root.

### Decisions

- A valid installed `workshop_create` request previously surfaced as a `Parse error` because the broad server catch hid a missing SQLite directory. This was treated as a runtime defect, not a transient smoke-test failure.

### Open items

- Refresh the public GitHub plugin snapshot and repeat the installed-cache write/read smoke test; then exercise it from a fresh Codex desktop task.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:20 CT — GPT-5.6 entitlement narrowed and checklist audit corrected

**Area:** Provider / Planning Integrity

### Verified

- A read-only authenticated model-catalog request returned `gpt-5.6-luna`, `gpt-5.6-sol`, and `gpt-5.6-terra`; direct `GET /v1/models/{id}` requests for all three returned `200`.
- The bare `gpt-5.6` and `gpt-5.6-mini` identifiers returned `404 model_not_found`; `gpt-5` and `gpt-5.4` returned `200` but are not silent substitutes for the locked GPT-5.6 requirement.
- The repository contains `apps/web`, `apps/worker`, and seven focused shared packages, so the corresponding foundation item now reflects the actual filesystem.

### Decisions

- No Responses generation call was made because it can incur paid usage. An entitled GPT-5.6 alias must pass that narrow live check before the runtime identifier or judge-facing GPT-5.6 claim changes.
- The daily acceptance item is now an open recurring obligation. Its recorded-fixture mechanism is complete, but the full vertical slice is not yet complete.

### Open items

- Obtain paid-call authorization for a minimal Responses check against the candidate GPT-5.6 aliases and one real GPT Image 2 batch.
- Native host synchronization remains unproven; retain the active capture-only fallback decision through the Spike A deadline.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:21 CT — GPT-5.6 runtime identifier repaired from official guidance

**Area:** Provider / Domain Contract

### Changed

- Updated forward-looking reasoning and graph-extraction contracts from the unavailable bare `gpt-5.6` alias to `gpt-5.6-sol`.

### Verified

- Current official OpenAI model guidance identifies `gpt-5.6-sol` as the frontier GPT-5.6 model and says the bare `gpt-5.6` alias routes to it; it also recommends the Responses API for reasoning, tool calling, and multi-turn workflows.
- The configured project previously returned `200` for `GET /v1/models/gpt-5.6-sol`, while the bare alias returned `404`.

### Decisions

- This is a correction of an invalid project-specific identifier, not a model downgrade or a fallback narrative. No paid generation call has been made; live product use remains unclaimed until a minimal Responses smoke check passes.

### Open items

- Obtain paid-call authorization for one minimal `gpt-5.6-sol` Responses request and one GPT Image 2 batch.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:22 CT — Public installed MCP cache smoke test passed

**Area:** Plugin / Host Integration

### Verified

- Removed and reinstalled WorkshopLM from `daniel-p-green/OAI-Build-Week-2026` using the Codex CLI marketplace path.
- The newly installed cache executed its compiled MCP server with a configured local data root. A valid `workshop_create` JSON-RPC request returned `Created local Workshop: workshop-installed-plugin-smoke-test.` with persisted workshop state.
- The disposable local state was reset with `pnpm demo:reset`; the recorded `pnpm demo:e2e` acceptance run then passed.

### Decisions

- The public package now has verified marketplace discovery, installation, compiled MCP startup, and a write response from its installed cache. Spike E remains open because a fresh Codex desktop task has not yet invoked the registered plugin skill/tool surface through the host UI.

### Open items

- Capture the fresh-task Codex desktop invocation and its available `/feedback` Session ID if the surface exposes one.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:23 CT — Capture-only fallback made visible and verified

**Area:** Capture / Host Integration

### Changed

- Added a distinct `Capture fallback` host-strip control and bounded transcript-segment sheet. Its copy explicitly says it is not a chat composer and is only for the absence of native ChatGPT voice sync.

### Verified

- Web typecheck and production build passed.
- A production-server `captureFallbackTranscript` request persisted one `realtime_fallback` transcript segment, one new local source, and one new Map node. The fixture was reset afterward; `pnpm demo:e2e` passed.

### Decisions

- The designed fallback is now both visible and durable. This does not imply native task linkage, a live Realtime session, or any completed voice transport.

### Open items

- Resolve native host sync or run a separately authorized live Realtime transport capture.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:24 CT — GPT-5.6 operation routing and benchmark gate added

**Area:** Provider / Performance

### Changed

- Replaced blanket `gpt-5.6-sol` wording with a testable operation policy: Sol for quality-critical graph reasoning, Terra for balanced structured work, and Luna for repeatable high-volume work.
- Added a live-gated three-model Responses probe that records status, response model, latency, token usage, output, and errors in a dated local spike artifact.

### Verified

- Official OpenAI guidance assigns Sol to frontier capability, Terra to the intelligence/cost balance, and Luna to efficient high-volume workloads; it directs benchmarking task success, latency, and cost rather than optimizing for a single metric.
- AI-package syntax checks and routing-policy tests passed. Its live probe refused to run without explicit `WORKSHOPLM_LIVE_OPENAI=1`, so no paid request was made.

### Decisions

- `sol` is a quality default for grounded graph work, not a universal runtime choice. Defaults may move only when the same representative task passes quality checks with recorded latency and usage.

### Open items

- With paid-call authorization, run the three-model routing baseline and a representative graph-extraction quality comparison; use its artifact to choose final defaults.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:25 CT — Website-derived style path exposed in Studio

**Area:** Style / Runtime / GUI

### Changed

- Added a public-website URL capture control to the Design surface, beside the existing manual style lock.

### Verified

- Web typecheck and production build passed.
- A production-server `lockWebsiteStyle` request for `https://example.com` persisted `Example Domain foundation`, versioned tokens, source `website`, and the normalized reference URL. The fixture was reset afterward and `pnpm demo:e2e` passed.

### Decisions

- Website capture remains bounded to the safe public-URL adapter. This is a real style-source path, not yet a claim that automatic logo/manual asset extraction or the full Visual DNA evaluator is complete.

### Open items

- Add manual logo/font/image asset handling and visual-DNA evaluation/versioning.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:26 CT — Coherent image-batch regeneration exposed in Studio

**Area:** Deliver / GUI / Runtime

### Changed

- Studio now lists each persisted image-manifest panel with version, locked reference, state, and an individual selective-regeneration control.

### Verified

- Web typecheck and production build passed.
- A production route created a six-panel image batch after style lock. Selecting only `image-panel-2` changed it from `v1/planned` to `v2/selected_for_regeneration` while retaining `style-v1`; the fixture reset and `pnpm demo:e2e` passed.

### Decisions

- This is an editable coherent-batch contract and intentionally does not imply GPT Image 2 pixels were generated. The real provider batch remains an opt-in paid spike.

### Open items

- Run one authorized GPT Image 2 batch, attach generated assets and evaluation results to these panel records.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:27 CT — Durable typed Map add/delete controls verified

**Area:** Shape / GUI / Runtime

### Changed

- Added user-facing Map controls for typed `add_node` and `remove_node` operations alongside the existing update and undo controls.

### Verified

- Web typecheck and production build passed.
- Production API run: add `node-manual-smoke` → remove it → undo removal. Undo restored the exact manual node; the brief was invalidated and the storyboard marked stale. Fixture reset and `pnpm demo:e2e` passed.

### Decisions

- The Map UI now exposes real persisted typed user operations, but AI-proposed operations, visible edge editing, and Excalidraw rendering remain open; this does not complete the full Shape requirement.

### Open items

- Add evidence-aware edge controls, AI operation proposals, Excalidraw rendering, and Sketch regeneration.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:28 CT — Safe public URL capture exposed in Sources

**Area:** Capture / GUI / Grounding

### Changed

- Added an explicit safe-public-URL import control to the Sources capture sheet, separate from local text/file ingestion.

### Verified

- Web typecheck and production build passed.
- Production `ingestUrl` for `https://example.com` persisted a normalized WEB source, one chunk, five grounded claims, and a grounded Map evidence node. The fixture reset and `pnpm demo:e2e` passed.

### Decisions

- The UI delegates only to the existing safe public-URL adapter; unsafe/private targets continue to be rejected server-side.

### Open items

- Add browser-safe PDF upload/normalization and connected-app adapters; verify source permissions in the UI.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:29 CT — Broader workspace integration recheck passed

**Area:** Integration / Testing

### Verified

- `pnpm check` passed lint, typecheck, and tests across all 13 workspace packages after the capture fallback, source URL, Map operations, website style, image-batch, plugin runtime, and GPT-5.6 routing-policy changes.

### Open items

- This is deterministic/local verification; paid provider probes, native host synchronization, full Excalidraw/Sketch, and the final public demo remain separate proof obligations.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:30 CT — Excalidraw Map projection added to the production bundle

**Area:** Shape / GUI

### Changed

- Added the actual `@excalidraw/excalidraw` package and a client-only projection of persisted Map nodes behind the existing typed Map controls.

### Verified

- Web typecheck and production build passed after a client-only dynamic boundary resolved Excalidraw's browser-global SSR dependency.
- `pnpm demo:reset && pnpm demo:e2e` passed with the Excalidraw bundle present.

### Decisions

- The canvas is deliberately view-only/non-intercepting while the existing persisted add/update/delete/undo controls remain the editing path. This is a real Excalidraw rendering integration, but not yet direct-canvas edit synchronization; do not mark the Excalidraw Shape item complete.

### Open items

- Add direct Excalidraw element-to-typed-operation synchronization and an interactive browser proof.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:31 CT — Map-derived Sketch view added

**Area:** Shape / GUI

### Changed

- Added a dedicated Sketch view that converts the current semantic Map into an ordered concept flow with source/evidence locators and an approval-state indicator.

### Verified

- Web typecheck and production build passed; reset recorded `pnpm demo:e2e` passed.

### Decisions

- Sketch is currently a deterministic projection of the persisted Map, so Map edits regenerate it immediately. It is not yet a separately versioned artifact from an approved graph; that distinction remains open.

### Open items

- Version approved Sketch output and add direct Excalidraw edit synchronization.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:34 CT — Grounded candidate extraction added

**Area:** Capture / GUI / Grounding

### Changed

- Added durable candidate records derived from normalized grounded claims, with deterministic categories for goals, audience, claims, constraints, and unresolved questions.
- Exposed the extraction control and source-locator-backed candidate list in Sources, plus the production API action.

### Verified

- Worker tests passed: 13 tests across 3 files, including candidate category and locator coverage.
- Worker and web typechecks passed; the web production build passed.
- Production API replay after a fixture reset ingested sanitized planning text and persisted all four targeted categories (`goal`, `audience`, `constraint`, `question`) with `Sanitized acceptance fixture · chunk 01` locators.
- Fixture reset and `pnpm demo:e2e` passed in recorded-fixture mode.

### Decisions

- This initial extraction is deterministic and source-preserving, so it works without provider credentials or paid calls. Model-assisted clustering can be layered on later, but does not replace the durable evidence records.

### Open items

- Add PDF browser upload and connected-app adapters; improve candidate grouping/ranking when a live reasoning provider is authorized.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:37 CT — Browser-safe PDF capture added

**Area:** Capture / GUI / Runtime

### Changed

- Added a multipart PDF upload path to the visible Sources sheet. It writes each upload only to a temporary local directory, extracts text with the existing local adapter, and removes the temporary file afterward.
- Preserved a sanitized original PDF filename in the stored source title and locator; text files, safe public URLs, and manual sanitized meeting text remain separate capture paths.

### Verified

- `pdftotext` is present at `/opt/homebrew/bin/pdftotext`.
- Web typecheck and production build passed; fixture reset and `pnpm demo:e2e` passed.
- A real multipart replay against the production route uploaded a one-page text-based PDF and persisted `{ title: "workshop-upload.pdf", type: "PDF", locator: "Local PDF · workshop-upload.pdf · normalized:…", claimCount: 1 }` plus its grounded Map node.

### Decisions

- Uploads are limited to 10 MB and only text-based PDFs are supported in this increment. Scanned/image-only PDFs fail honestly instead of silently fabricating text.

### Open items

- Add connected-app/MCP source adapters, source-permission UI, and an optional OCR path if the demo needs scans.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:40 CT — Persisted Map relationships exposed

**Area:** Shape / Graph / GUI

### Changed

- Added persisted Map-edge projections to Workshop state and visible relationship lines/labels over the Map.
- Added link, unlink, and existing undo controls in the Map inspector, backed by the frozen typed `add_edge` and `remove_edge` graph operations.

### Verified

- Worker tests passed: 14 tests across 3 files, including add-edge persistence and undo.
- Worker/web typechecks and web production build passed; fixture reset and `pnpm demo:e2e` passed.
- Production API replay added `edge-production-smoke` from `promise` to `proof` as `supports/proves`, returned the expected persisted edge projection, then removed it and confirmed it was absent.

### Decisions

- Edge state remains canonical in the semantic graph snapshot; `mapEdges` is only the UI projection used to render and manage relationships.

### Open items

- Add AI-proposed graph operations and direct Excalidraw canvas synchronization before marking the full Shape operation requirement complete.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:41 CT — Local browser interaction smoke passed

**Area:** GUI / Verification

### Verified

- The available local browser surface loaded the production app at `http://localhost:3026/`; the required in-app Browser connector was unavailable in this runtime.
- In the live UI, selecting the `The product promise` Map node, choosing `Judge proof`, and pressing `Link` rendered the relationship label and surfaced an `Unlink` control.
- At a 390×844 mobile viewport, the workspace retained the top bar, Map navigation/canvas, and host strip without horizontal overflow in the accessibility snapshot.

### Open items

- This is a narrow local browser smoke only. Tablet review, visual screenshot review, and a fresh ChatGPT/Codex in-app-browser session remain unverified.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:43 CT — Source ingestion now records canonical typed graph operations

**Area:** Capture / Shape / Domain integration

### Changed

- Source ingestion now appends a validated, system-authored typed `add_node` operation to the canonical graph snapshot instead of only appending a separate UI Map record.
- The graph node retains its first claim ID, source ID, body, and locator; the Map projection is derived from that graph state.

### Verified

- Worker tests passed: 14 tests across 3 files, including ingestion assertions for typed graph history.
- Worker and web typechecks passed; web production build passed; fixture reset and `pnpm demo:e2e` passed.
- Production API replay ingested a sanitized source and returned a final graph-history record with `actor: system`, `operation: add_node`, and matching `claimId`, `sourceId`, and `Sanitized acceptance fixture` locator metadata.

### Decisions

- This is deterministic source-to-graph construction, not a claim that GPT-5.6 has yet proposed graph operations. AI proposal/review remains separate and open.

### Open items

- Add model-assisted, reviewable graph-operation proposals and direct Excalidraw element synchronization.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:47 CT — Source permissions made durable and visible

**Area:** Capture / Grounding / Privacy

### Changed

- Added durable `private`, `sanitized`, and `shareable` source permissions to Workshop state, including safe hydration of pre-existing local state.
- Added a visible permission control for local text/PDF ingestion and a permission label in Sources. Capture-only fallback sources are private; safe public-URL ingestion is shareable by default.

### Verified

- Worker tests passed: 15 tests across 3 files, including requested-permission persistence.
- Worker/web typechecks, web production build, fixture reset, and `pnpm demo:e2e` passed.
- Production route replays persisted a `private` local source and a `shareable` `https://example.com` source, each retaining its normalized locator.

### Decisions

- Permission is source-level local handling metadata in this local-first demo; it does not claim external connector ACL synchronization.

### Open items

- Add connected-app/MCP adapters and, if needed, adapter-specific permission import semantics.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:52 CT — Time-to-first-output instrumentation and trace coherence added

**Area:** Provenance / GUI / Runtime

### Changed

- Added persisted timestamps for the first capture-only transcript segment and first locally rendered output (deck, infographic, or video).
- Added the computed duration to Trace and corrected Trace selection so a captured transcript, its chunk, claim, and Map node are presented as one coherent provenance chain.

### Verified

- Worker tests passed: 15 tests across 3 files, including timestamp ordering from fallback transcript capture through deck rendering.
- Worker/web typechecks, web production build, fixture reset, and `pnpm demo:e2e` passed.
- Production replay captured a transcript, approved brief/style, generated a deck, and persisted `firstTranscriptAt`, `firstRenderedOutputAt`, and `elapsedMs: 59`.
- Live local Trace displayed `First transcript → first rendered output: 0.1s` with the matching capture source, fallback chunk, claim, Map node, `FRAME.md`, and stored deck artifact.

### Decisions

- This measures the local end-to-end path from persisted transcript capture to the first local output. It is not presented as a live-provider performance benchmark.

### Open items

- Record a bounded live operator run and surface delivery video timing once the full operator seam is exercised.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 00:57 CT — Configurable manual Style Foundation added

**Area:** Style / GUI / Runtime

### Changed

- Replaced the fixed manual style preset with a versioned foundation containing exact accent/ink/paper hex values, logo or asset references, licensed fonts, visual references, negative rules, and one of three professional Intent Profiles.
- Added safe hydration for earlier style records and surfaced the configured foundation in the Design review UI.

### Verified

- Worker tests passed: 16 tests across 3 files, including style versioning and exact-six-digit-hex rejection.
- Worker/web typechecks, web production build, fixture reset, and `pnpm demo:e2e` passed.
- Production API replay persisted `WorkshopLM proof system` with `#1155AA`, a local logo reference, `Inter` and `Source Serif`, two visual references, two negative rules, and the `board_deck` profile.
- Live local Design view displayed the locked style version, board-deck intent, licensed fonts, and negative rules.

### Decisions

- Asset references are deliberately local identifiers in the local-first demo; the app does not claim external asset upload, licensing verification, or brand-rights clearance.

### Open items

- Add separately previewable/approvable Visual DNA and richer website-derived foundation extraction beyond palette/title/reference URL.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:01 CT — Versioned Visual DNA review added

**Area:** Style / GUI / Versioning

### Changed

- Added a distinct Visual DNA record derived from the current Style Foundation: palette, composition, texture, image, and negative-rule guidance, with preview, explicit approval, version, and stale state.
- Added Design controls for creating a preview and approving it; a later style lock stales and unapproves the prior Visual DNA.

### Verified

- Worker tests passed: 17 tests across 3 files, including Visual DNA creation, approval, versioning, and style-change staleness.
- Worker/web typechecks, web production build, fixture reset, and `pnpm demo:e2e` passed.
- Production API replay locked a board-deck foundation, created Visual DNA v1, and approved it. The persisted record included the locked palette, executive composition rule, reference anchor, negative rule, and `approved: true`.
- Live local Design view displayed `Visual DNA v1 · approved` with the approval control correctly disabled.

### Decisions

- Visual DNA is intentionally a reviewable derivative of Style Foundation rather than another global theme; it becomes stale whenever the upstream foundation changes.

### Open items

- Feed approved Visual DNA rules into the live GPT Image 2 batch when provider spend is authorized.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:04 CT — Style-dependent stale propagation completed

**Area:** Deliver / Dependency integrity

### Changed

- Style Foundation replacements now stale existing output artifacts, image batches, storyboard panels, Visual DNA, storyboard approval, and video state.
- The first-ever style lock preserves the initial editable storyboard, avoiding a dead-end before the first approval; only actual style replacement invalidates downstream work.

### Verified

- Worker tests passed: 18 tests across 3 files, including Map and Style stale propagation plus the initial-style-flow regression.
- Worker/web typechecks, web production build, fixture reset, and `pnpm demo:e2e` passed.
- Production replay approved the brief, locked style v1, generated a deck and image batch, approved the storyboard, then locked style v2. It returned stale deck/image/storyboard state, `storyboardApproved: false`, and `videoState: blocked`.

### Decisions

- Style replacement is treated as an upstream dependency change. The team can always regenerate current outputs from the still-current brief and new style rather than render stale work.

### Open items

- Add user-visible regeneration guidance/history for each stale artifact; current state is correctly blocked but not yet a polished recovery wizard.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:08 CT — Approved-input asset plan added to Studio

**Area:** Deliver / Planning / GUI

### Changed

- Added a versioned `assetPlan` derived from the canonical graph revision, approved `FRAME.md`, current Style Foundation, optional current Visual DNA, and evidence claim IDs.
- The plan names and traces deck, infographic, coherent images, editable storyboard, and video; it is shown in Studio with inspectable prompts and stale state.
- Map and Style changes now stale the plan along with their downstream deliverables.

### Verified

- Worker tests passed: 19 tests across 3 files, including approved-input plan construction and stale propagation.
- Worker/web typechecks, web production build, fixture reset, and `pnpm demo:e2e` passed.
- Production replay ingested a sanitized source, approved its brief, locked style, and generated asset plan v1 with graph revision 1, brief/style version 1, a durable evidence claim ID, and all five output types.
- Live desktop Studio displayed the current plan and each output prompt.

### Decisions

- The plan is a durable scoped production contract, not a second approval gate. Existing storyboard approval remains the only delivery gate for video.

### Open items

- Feed plan records into GPT Image 2 execution/evaluation once provider spend is authorized and include plan inputs in the final public demo package.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:14 CT — Style locks materialize inspectable design artifacts

**Area:** Style / Local artifacts / GUI

### Changed

- Every manual or website-derived Style Foundation lock now writes a versioned `generated/DESIGN-vN.md` and paired `generated/DESIGN-vN.tokens.json` beneath the configured local data root.
- The persisted workshop state records both artifact paths and the Design UI displays them next to the locked foundation.
- Added a worker proof test that reads the generated Markdown and parses the token JSON after a manual lock.

### Verified

- Worker tests passed: 19 tests across 3 files. Worker and web typechecks passed; the web production build passed.
- A live local API replay locked `Judge-safe foundation` as style v2 and returned `generated/DESIGN-v2.md` plus `generated/DESIGN-v2.tokens.json`; both files were read from `.workshoplm/generated` and contained exact `#1155AA`, `#111111`, `#F0EFEA`, `Inter`, the board-deck profile, and the configured negative rule.
- The local browser Design view displayed `generated/DESIGN-v2.md · generated/DESIGN-v2.tokens.json`. The Codex in-app Browser plugin was unavailable, so this UI replay used the configured standalone Playwright fallback.

### Decisions

- Design artifacts are versioned historical records rather than mutable global files; replacing Style Foundation writes the next version and separately stales dependent production artifacts.

### Open items

- The website capture remains intentionally bounded to public title, palette, and reference URL; richer asset extraction needs a privacy/licensing review before it can become a stronger claim.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:17 CT — Approved Map materializes executable FRAME artifacts

**Area:** Shape / Brief / Local artifacts

### Changed

- `Approve map as brief` now writes a versioned `generated/FRAME-vN.md` and `generated/FRAME-vN.json` alongside the persisted approval state.
- The JSON representation records the graph revision, outcome, grounded node evidence, locators, and approval timestamp. The Brief UI exposes both local artifact paths.
- Added a worker proof test that reads and parses both brief artifacts after approval.

### Verified

- Worker tests passed: 19 tests across 3 files. Worker/web typechecks and the web production build passed.
- A live local API approval returned `generated/FRAME-v1.md` and `generated/FRAME-v1.json`; the executable JSON was read from the data root and contained schema version 1, graph revision 0, and all three visible evidence locators.
- The local browser Brief view displayed `generated/FRAME-v1.md · generated/FRAME-v1.json`. The Codex in-app Browser plugin was unavailable, so this UI replay used the configured standalone Playwright fallback.

### Decisions

- The executable brief is a concise deterministic projection of the approved graph, not an ungrounded model-generated replacement for it.

### Open items

- Map approval still needs a fully synchronized direct Excalidraw editing surface and an approved-version Sketch, tracked separately in Shape.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:21 CT — Direct Excalidraw Map synchronization added

**Area:** Shape / Map / GUI

### Changed

- Added an explicit **Edit canvas** mode that exposes the actual Excalidraw Map surface rather than the evidence-card overlay.
- Canvas title and position changes are debounced into typed `update_node` operations; position is stored in canonical graph-node metadata, so the graph remains the sole source of truth.
- Added `syncMapCanvas` API handling and a worker test covering canvas mutation, typed history, stale propagation, and undo.

### Verified

- Worker tests passed: 20 tests across 3 files. Worker/web typechecks and the web production build passed.
- Live local API replay sent a canvas-originated `promise` patch. It persisted title `Canvas-synced proof` with x `31.2` / y `44.8` and invalidated the brief as required.
- Local browser UI displayed the **Edit canvas** mode; its current console check returned zero errors. The Codex in-app Browser plugin was unavailable, so this UI replay used the configured standalone Playwright fallback.
- Fixture reset and `pnpm demo:e2e` passed after the synchronization change.

### Decisions

- Excalidraw is an editable projection of the typed graph, not a competing persisted drawing document. The bounded sync deliberately covers canonical node label and layout; relationship edits continue through typed Map controls to preserve edge semantics and provenance.

### Open items

- Produce a separately approved, versioned Sketch projection of the approved graph.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:24 CT — Approved-graph Sketch lifecycle added

**Area:** Shape / Versioning / GUI

### Changed

- Added a versioned Sketch record derived only from a current approved Map, with graph revision, deterministic node projection, explicit approval, and stale state.
- Added Sketch create/approve controls in the workspace and stale propagation from all Map mutations.

### Verified

- Worker tests passed: 21 tests across 3 files, including Sketch creation, approval, and Map-change staleness.
- Web production build passed. Fixture reset and `pnpm demo:e2e` passed.

### Decisions

- Sketch remains a non-editor projection of the canonical graph; any Map change invalidates its approval until it is regenerated.

### Open items

- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:25 CT — Public website Brand Foundation verified

**Area:** Style / Safety / Local artifacts

### Changed

- Added a deterministic test for the existing public-URL Style Foundation path, covering validated public DNS, title/palette extraction, reference provenance, and generated design artifacts.

### Verified

- Worker tests passed: 22 tests across 3 files; web typecheck, fixture reset, and `pnpm demo:e2e` passed.
- Live local API replay fetched `https://example.com`, locked `Example Domain foundation` as website style v1, recorded the canonical reference URL, and materialized `generated/DESIGN-v1.md` plus its token JSON.

### Decisions

- Website capture remains bounded to publicly reachable content and conservative metadata extraction. It does not claim logo licensing or richer brand-rights inference.

### Open items

- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:26 CT — Source-traceable deck and infographic verified

**Area:** Deliver / Rendering / Provenance

### Changed

- Added explicit coverage for the rendered infographic’s source locator, complementing the existing deck provenance test.

### Verified

- Worker tests passed: 23 tests across 3 files. The deck and infographic outputs both persist claim IDs; the infographic test reads the generated HTML and proves the original `Fixture locator · chunk 01` is embedded in the rendered artifact.
- Web production build, fixture reset, and `pnpm demo:e2e` passed. The recorded fixture produces both `generated/deck-v1.deck.html` and `generated/infographic-v1.infographic.html`.

### Decisions

- Deliverable provenance is emitted within each artifact’s visible citation line as well as persisted in output metadata, so it remains inspectable outside the app state.

### Open items

- Live GPT Image 2 execution remains pending paid-provider authorization and evaluation evidence.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:28 CT — Approved-input storyboard generation added

**Area:** Deliver / Storyboard / Provenance

### Changed

- Added storyboard generation from the current approved-input asset plan. It creates five editable panels for the plan’s deck, infographic, image batch, storyboard, and video outputs.
- Panel narration carries the plan prompt and its evidence locator; existing panel-level editing and final storyboard approval remain required before video enqueueing.

### Verified

- Worker tests passed: 24 tests across 3 files, including generated panel count, inherited evidence locator, and approval reset.
- Web typecheck, fixture reset, and `pnpm demo:e2e` passed.

### Decisions

- Storyboard generation is deterministic from the approved production plan until a paid reasoning path is benchmarked. This preserves exact provenance and keeps the no-credential fixture repeatable.

### Open items

- Live GPT Image 2 execution/evaluation remains pending paid-provider authorization.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:29 CT — Grounded MCP search and fetch verified

**Area:** Capture / Plugin / Grounding

### Verified

- Plugin MCP tests passed: 6 tests across 3 files; typecheck passed.
- The compact plugin tool surface exposes `search` over normalized evidence chunks and `fetch` by source/chunk identifier, returning grounded claims and locators without requiring a connected app.
- Fixture reset and `pnpm demo:e2e` passed.

### Decisions

- The core local source path is the authoritative retrieval baseline. Connected applications remain optional adapters; their absence does not weaken local grounding.

### Open items

- Native ChatGPT task/voice linkage is still unproven; the capture-only fallback remains the designed operating path.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:30 CT — Responsive local GUI verified and repaired

**Area:** GUI / Responsive verification

### Changed

- Tightened the mobile header: compacted spacing and hid nonessential sync/overflow controls below 800px, leaving a bounded title and Trace control.

### Verified

- Local browser snapshots verified the intended three-column desktop at 1440px, single-canvas tablet at 768px, and bounded mobile header/canvas at 390px. The 390px post-fix snapshot has no negative-position header control; browser console returned zero errors.
- Web typecheck, production build, fixture reset, and `pnpm demo:e2e` passed.
- The Codex in-app Browser plugin was unavailable, so responsive UI inspection used the configured standalone Playwright fallback.

### Open items

- Native ChatGPT task/voice linkage and live GPT Image 2 execution still require their respective external evidence.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:31 CT — Bounded video-render retry repair

**Area:** Worker / Failure recovery

### Changed

- A failed local video render now transitions its job to `retrying` for one additional leased attempt while retaining the error; the second failure becomes terminal and visibly blocks the video.

### Verified

- Worker tests passed: 24 tests across 3 files. The executor test proves first-failure requeue and retry-budget exhaustion behavior; worker typecheck passed.

### Open items

- Explicit user cancellation and multi-artifact partial-success recovery still need their own user-visible flow and evidence; the broad reliability checkbox remains open.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:32 CT — Queued video cancellation added

**Area:** Worker / Failure recovery

### Changed

- Added a durable cancellation path for queued or retrying local video jobs. Cancellation marks the job terminal, clears its lease, and returns the Workshop video state to blocked.

### Verified

- Worker tests passed: 25 tests across 3 files. The cancellation test queues an approved video, cancels it, and proves a subsequent worker pass is idle.
- Worker typecheck passed.

### Open items

- Multi-artifact partial-success recovery is still unimplemented; the broad reliability checkbox remains open.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:33 CT — Studio video cancellation control exposed

**Area:** Studio / Worker controls

### Changed

- Added `cancelVideoRender` API wiring and a Studio **Cancel video** action shown while a video render is queued or retrying.

### Verified

- Web typecheck and 25 worker tests passed. The control delegates to the previously verified durable cancellation path.

### Open items

- Partial-success recovery remains open; cancellation does not claim to salvage a partially rendered artifact.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:34 CT — In-app build provenance surface added

**Area:** Provenance / GUI

### Changed

- Extended the Evidence Trace view with a **How this was built** section tied to the local-first runtime, versioned FRAME/DESIGN artifacts, dated build log, Codex implementation/verification work, and the entitlement-gated GPT-5.6 routing policy.

### Verified

- Web typecheck and production build passed.

### Decisions

- The surface explicitly does not claim paid GPT-5.6 runtime execution; it reports the documented operation-level routing policy and separates it from pending provider evidence.

### Open items

- Final demo/video and paid-provider evidence remain unproven.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:35 CT — Full deterministic workspace baseline passed

**Area:** Integration / Verification

### Verified

- `pnpm test` passed all 13 workspace package tasks, covering domain schema/gates, plugin MCP, worker, production renderer, AI routing policy, and integration spikes.
- `pnpm typecheck` passed all 13 workspace package tasks.
- Fixture reset and `pnpm demo:e2e` passed the recorded Capture → Shape → Deliver seam with grounded evidence, approved gates, deck/infographic artifacts, storyboard approval, and deterministic timing.

### Open items

- The recorded fixture does not prove native ChatGPT task sync, paid provider generation, final demo video, or external submission links.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:36 CT — Studio cancellation semantics and public README corrected

**Area:** Studio / Public repository

### Changed

- The Studio now offers **Cancel video** only while a render is queued, which is the state supported by the durable worker cancellation path. During an active local render it shows a disabled **Rendering locally…** control instead of exposing a request that would return a conflict.
- Updated the public README to describe the implemented capture, editable Map, versioned artifacts, stale propagation, retry, and queued-cancellation behavior. Removed stale wording that listed already implemented UI capabilities as unfinished.

### Verified

- `pnpm --filter @workshoplm/web typecheck` passed.
- `git diff --check` passed.

### Open items

- Active-render interruption, multi-artifact partial-success recovery, paid provider runs, native durable ChatGPT sync, and the final public demo remain separate unproven or unfinished work.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:37 CT — Host-sync decision evidence remains credential-blocked

**Area:** Spike A / Capture

### Verified

- `pnpm spike:host-sync:verify` wrote `artifacts/spikes/host-sync-2026-07-14T06-37-52-460Z.json` with status `credential_blocked`.
- The credential-gated native checks (`accountRead`, task linkage, typed turn, native voice turn, and token scan) were skipped. No native host capability was inferred.

### Decisions

- Keep the already implemented capture-only fallback active. This run is evidence against claiming native durable synchronization, not a reason to remove the pending end-of-day Spike A decision.

### Open items

- A separately authorized live host check is required to pass the native route before the July 14 EOD CT deadline; otherwise the existing fallback becomes the final implemented path.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:39 CT — GPT-5.6 Sol/Terra/Luna routing benchmark prepared

**Area:** Provider evaluation / Cost-performance routing

### Changed

- Replaced the single-prompt GPT-5.6 probe with a spend-gated nine-request benchmark: Sol, Terra, and Luna each run compact grounded-graph, executable-brief, and claim-triage cases.
- Each result records HTTP status, end-to-end latency, API-reported usage, and a deterministic JSON/evidence-term score. The emitted artifact explicitly avoids inventing dollar costs from usage counts.

### Verified

- AI package lint and routing-policy tests passed, including deterministic scoring of valid and invalid model output.
- The probe refused to run without `WORKSHOPLM_LIVE_OPENAI=1`; no provider request or paid spend occurred.

### Open items

- Run the benchmark only with explicit paid-call authorization, then compare reported usage with current official pricing and decide operation defaults from measured quality, latency, and cost.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:41 CT — Recorded acceptance now renders the approved video

**Area:** Integration / Recorded fixture

### Changed

- Extended `pnpm demo:e2e` from a lease-only video assertion to the real local worker path: approve brief/style/storyboard, queue the video, execute the local renderer, verify the MP4 exists, persist the artifact, and require the `video_rendered` gate.

### Verified

- `pnpm demo:e2e` passed with all six gates true, including `video_rendered: true`.
- The run persisted `generated/workshoplm-demo.mp4` and a hash-addressed local video artifact under the acceptance fixture root.

### Open items

- The fixture currently exercises the approved default storyboard; it does not yet prove a current asset-plan-generated storyboard end to end. Paid provider paths and the final public recording remain separate evidence obligations.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:42 CT — Full deterministic baseline remains green

**Area:** Integration / Verification

### Verified

- `pnpm check` passed lint, typecheck, and tests in all 13 workspace packages after the expanded recorded acceptance path.
- `pnpm demo:reset && pnpm demo:e2e` passed afterward, including grounded evidence, approved brief/style/storyboard gates, traceable deck and infographic artifacts, and a persisted local video artifact.

### Open items

- The complete recorded seam does not substitute for paid-provider evaluation, native host synchronization, live asset-plan storyboard coverage, active-render cancellation, partial-package recovery, or public demo/submission proof.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:43 CT — Clean fixture render command repaired

**Area:** Public fixture / Video

### Changed

- Fixed `pnpm demo:render` to lock the required manual style between brief and storyboard approval, matching the product gate contract.

### Verified

- From `pnpm demo:reset`, `pnpm demo:render` completed successfully and returned a persisted `video/mp4` artifact (`326674` bytes) from the local worker.

### Open items

- This validates the sanitized fixture command, not a public demo recording or a live provider narration path.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:44 CT — Public repository visibility verified

**Area:** Judge access / Repository

### Verified

- GitHub CLI reports `daniel-p-green/OAI-Build-Week-2026` at `https://github.com/daniel-p-green/OAI-Build-Week-2026` with `visibility: PUBLIC`, `isPrivate: false`, and default branch `main`.

### Open items

- Public repository visibility does not prove final README completeness, public demo video, Devpost submission, or provider-backed feature claims.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:47 CT — Partial image output recovery made durable

**Area:** Studio / Failure recovery

### Changed

- Added a durable failed state and error message for individual image-batch panels.
- A failed panel is shown honestly in Studio as **Failed · Retry**; selective retry clears only its error and increments only its own version.

### Verified

- Worker tests passed: 26 tests across 3 files. The partial-recovery test creates a source-traceable deck, marks image panel 2 failed, proves the deck remains current, then proves retry changes only panel 2.
- Worker and web typechecks passed.

### Decisions

- This implements the locked recovery rule that an image-panel failure must not invalidate an already completed deck. It is a deterministic provider-adapter state, not a claim that live GPT Image generation has run.

### Open items

- Live GPT Image 2 error mapping and exponential provider retry remain pending paid-provider authorization.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:49 CT — Recorded fixture covers asset plan through video

**Area:** Integration / Recorded fixture

### Changed

- The acceptance runner now ingests a sanitized source into Workshop state, creates a current asset plan, generates its editable storyboard, and renders that storyboard rather than relying on the default storyboard fixture.

### Verified

- `pnpm demo:e2e` passed with all gates true, `assetPlanItems: 5`, `storyboardPanels: 5`, source-grounded deck/infographic artifacts, and a stored local MP4.

### Open items

- The deterministic fixture still uses planned image panels rather than a paid GPT Image 2 batch; live provider evidence, native host sync, and final judge-facing video remain separate obligations.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:52 CT — Live application Capture → Shape → Deliver seam passed

**Area:** Live local application / Integration

### Verified

- Current `apps/web` production build passed, then served successfully on isolated local port `3101`.
- Through the live `/api/workshop` surface, a capture-only transcript persisted; the app produced an approved brief and locked style, five-item asset plan, source-traceable deck and infographic, six-panel image manifest, editable five-panel storyboard, storyboard approval, and queued video.
- The local worker consumed that queued job and persisted a `326674`-byte `video/mp4` artifact. A final live API read confirmed `videoState: rendered`, current deck and infographic outputs, five storyboard panels, and transcript/output timestamps.
- Standalone Playwright was used because the Codex in-app Browser plugin was unavailable. At `1440×900`, the production UI displayed Sources, the captured fallback transcript Map node, Studio history with deck/infographic artifacts, and the capture fallback control. Browser console had zero errors.

### Decisions

- This is the first direct live-local application proof of the full deterministic seam. It does not claim a paid-provider or native ChatGPT host route.

### Open items

- Produce the public under-three-minute video, final submission materials, live-provider evaluation, and fresh intended in-app-browser inspection.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:54 CT — Installed plugin MCP surface reads live grounded fixture

**Area:** Spike E / Unified plugin

### Verified

- `codex plugin list` reports `workshoplm@workshoplm-local` as installed and enabled from the Codex local marketplace.
- Invoked the installed plugin's own stdio MCP server (not the source test helper) against the current `.workshoplm` data root. It initialized, exposed its tool list, and `search` returned the persisted live capture chunk with its verified claim and source locator.

### Open items

- Fresh-task skill invocation and actual ChatGPT Work-surface support remain unproven; do not mark Spike E complete from CLI/MCP evidence alone.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:56 CT — Worker now renders the current approved storyboard

**Area:** Deliver / HyperFrames renderer

### Changed

- Replaced the worker's fixed Spike D MP4 copy with a HyperFrames staging composition generated from the actual current approved storyboard, including panel title, narration, style colors, panel timing, and per-panel local audio files.
- The deterministic no-spend audio fallback is visibly labeled **Audio: deterministic local placeholder tone**. It does not claim live TTS or AI voice.

### Verified

- `pnpm demo:e2e` passed with a current five-panel asset-plan storyboard and a new hash-addressed MP4 artifact.
- `ffprobe` verified video and audio streams and a `22.037333`-second duration, matching the five approved panels rather than the prior six-second Spike D fixture.
- Worker tests (27) and worker typecheck passed. The composition test proves approved storyboard content and the disclosure reach the generated HyperFrames HTML.

### Open items

- Replace the honest placeholder tones with provider-backed, disclosed `gpt-4o-mini-tts` panel narration only after authorized live-provider verification.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:58 CT — Full workspace baseline passed after dynamic renderer repair

**Area:** Integration / Verification

### Verified

- `pnpm check` passed lint, typecheck, and tests across all 13 workspace packages.
- `pnpm demo:reset && pnpm demo:e2e` passed immediately afterward with all six gates true, five asset-plan items, five storyboard panels, source-traceable deck/infographic artifacts, and the newly rendered current-storyboard MP4 artifact.

### Open items

- Provider-backed image generation/TTS/GPT-5.6 evaluation, native host sync, public demo/video, and final submission evidence remain open.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 01:59 CT — Public README collaboration disclosure added

**Area:** Repository / Judge materials

### Changed

- Added a concise README disclosure of Codex implementation/verification work, the human product decisions that shaped scope, and the GPT-5.6 operation-level routing policy.

### Decisions

- The README explicitly separates GPT-5.6 contribution through Codex from unproven paid runtime API use. It does not claim that the deterministic fixture used GPT-5.6 responses.

### Open items

- License choice, final Devpost copy, public video, and paid-provider benchmark evidence still require their own proof or authority.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 02:01 CT — Truthful Devpost draft prepared

**Area:** Submission materials

### Changed

- Added `submission/DEVPOST-DRAFT.md` with judge-facing description, local verification commands, collaboration disclosure, and explicit provider/host scope boundaries.

### Decisions

- The draft contains no unverified paid-provider, native host-sync, final YouTube, or submission-completion claim. Irreversible Devpost/YouTube actions and submission identity fields remain human-controlled.

### Open items

- Produce/verify the public video, choose repository licensing, complete Devpost fields, and capture the `/feedback` Session ID when available.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 02:03 CT — Timed public-demo recording script prepared

**Area:** Submission materials / Video

### Changed

- Added `submission/DEMO-SCRIPT.md`, a 2:35–2:50 recording script that follows the verified local Capture → Shape → Deliver seam and explicitly includes both approval gates, edit control, provenance, plugin moment, and Codex/GPT-5.6 disclosure.

### Decisions

- The script prohibits claiming the local placeholder tone is AI voice and distinguishes planned image panels from paid GPT Image output.

### Open items

- Record, edit, upload, and verify the actual public YouTube video; this script is not evidence that those actions occurred.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 02:05 CT — Deterministic submission thumbnail command added

**Area:** Submission materials / Local media

### Changed

- Added `pnpm demo:thumbnail`, which derives a PNG preview and `thumbnail.json` SHA-256 metadata from the locally rendered storyboard MP4.

### Verified

- From a clean fixture reset, `pnpm demo:render` produced a current local MP4 and `pnpm demo:thumbnail` produced `submission/workshoplm-demo-thumbnail.png` (`137921` bytes) plus hash metadata in the local data root.

### Open items

- This local thumbnail is not yet a final public-video thumbnail or Devpost upload.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 02:07 CT — Completion evidence audit recorded

**Area:** Completion audit

### Changed

- Added `submission/EVIDENCE-AUDIT.md`, which maps each material requirement to direct current evidence or an explicit open boundary.

### Decisions

- The audit concludes the goal is not complete. It does not promote local deterministic proof into native host, paid-provider, or public-submission proof.

### Open items

- Native host sync, live GPT-5.6/Image/TTS evidence, pre-code brainstorm, fresh Work surface, public video, Devpost submission/session ID, and licensing remain open or require authority.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 02:08 CT — Public repository license decision

**Area:** Public repository and submission readiness

### Changed

- Added a root `LICENSE` containing the standard MIT License (copyright 2026 Daniel Green) and marked the corresponding local submission-checklist item complete.

### Decision

- Chose MIT as the simple, permissive license for a public hackathon repository. It lets judges and future users inspect, run, modify, and reuse the code without adding adoption friction.

### Alternatives considered

- Apache-2.0 provides an explicit patent grant but adds legal text without a demonstrated project need.
- GPL-family licenses impose copyleft obligations that are unnecessary for the intended judge path.
- Leaving the repository unlicensed would retain default all-rights-reserved restrictions and contradict the public-access checklist.

### Why and verification

- The user explicitly delegated non-spend decisions, with a requirement to record the chosen path, rationale, and alternatives in this log.
- `LICENSE` is present at the repository root; `git diff --check` passes. This license applies to repository code, not third-party services, API outputs, or external media whose terms remain separate.

### Open items

- Public video publication and Devpost submission remain external actions; paid-provider checks remain deliberately blocked pending spend authorization.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 02:10 CT — Submission checklist reconciled to repository evidence

**Area:** Public repository / judge inspection path

### Changed

- Marked only the already-evidenced README, fixture, intended-platform, supported-platform, and plugin-inspection-path checklist items complete.
- Updated the evidence audit to reflect the newly committed MIT license.

### Decision

- Treated a checked checklist item as a repository-evidence statement, not a claim that Devpost, YouTube, native host sync, or paid-provider proof is complete.

### Alternatives considered

- Leaving all checklist items open would hide verified judge-access work and make the audit less useful.
- Marking broader Project or Devpost items complete would be inaccurate because the public video, external submission form, and live-provider boundaries still lack direct proof.

### Verification

- Read the current `README.md`, `submission/EVIDENCE-AUDIT.md`, and `research/hackathon/SUBMISSION-CHECKLIST.md`; the README contains the matching commands, sanitization details, supported platform, collaboration disclosure, and plugin test path.

### Open items

- External submission, public video, fresh Work surface proof, and paid-provider checks remain unchecked and explicitly open.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 02:14 CT — Daily recorded-fixture acceptance rerun

**Area:** Integration acceptance / repeatable judge fixture

### Changed

- No product behavior changed. Reset and reran the complete sanitized fixture so the current public branch has fresh acceptance evidence.

### Verified

- `pnpm demo:reset && pnpm demo:e2e` passed with all six gates true: transcript ready, Map/brief approved, style locked, storyboard approved, and video rendered.
- The run produced a grounded source, a five-item asset plan, a five-panel storyboard, source-traceable deck and infographic HTML, and a current local MP4 artifact.
- `pnpm demo:render` then completed a separate approved-fixture render successfully, and `pnpm demo:thumbnail` produced the local PNG preview plus SHA-256 metadata without credentials or paid calls.

### Decision

- Kept the recurring daily-acceptance checkbox open. One verified run supplies today's evidence but cannot prove future daily execution.

### Alternatives considered

- Marking the recurring requirement complete after this run would misstate an ongoing operational obligation.
- Skipping the rerun because older output existed would leave the current public commit without fresh seam evidence.

### Open items

- This proves the sanitized recorded fixture, not native host sync, paid-provider results, a fresh Work-surface invocation, or public-video/Devpost completion.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 10:41 CT — UI simplification audit and revised design contract

**Area:** Product design / judge-facing Workshop experience

### Changed

- Audited the current six-view, persistent-three-rail MVP against the live NotebookLM notebook flow and the official Apps in ChatGPT Figma community page/UI guidelines.
- Added `research/ui-ux-simplification-audit-2026-07-14.md` with the evidence, complexity diagnosis, new information architecture, visual system, three target screens, acceptance bar, and implementation sequence.
- Revised `DESIGN.md` so Map, Brief, and Outputs are the only top-level destinations; Sources, Create, Style, Trace, Storyboard, jobs, and technical provenance now use progressive disclosure.
- Added the implementation and verification steps to `GOAL.md` without removing any underlying product capability.

### Verified

- The live NotebookLM workspace exposes a stable Sources / Chat / Studio model, collapsible side panels, inline citations, and recognizable output rows while hiding implementation details.
- The official Apps SDK guidance says inline cards should remain single-purpose, expose at most two actions, avoid tabs/deep navigation/nested scrolling, and use fullscreen for rich maps or interactive diagrams while retaining the native system composer.
- The official guidance also calls for system font, system color/spacing/radii, monochrome outlined icons, restrained partner accents, and no custom structural gradients.
- The Figma community page's `Open in Figma` control is a duplicate action with no read-only `/design/{fileKey}` link. It was intentionally not invoked because it would create an external artifact.
- `git diff --check` passed after the documentation changes.

### Decision

- Keep WorkshopLM's full capability set, but reduce the default mental model to three destinations and one primary action per state.
- Treat ChatGPT as the conversation layer, an inline Workshop card as the doorway, and a fullscreen Map/Brief/Output canvas as the production layer.
- Move OpenAI-aligned styling into the structural shell while preserving customer branding inside generated artifacts.

### Open items

- Implement the simplified shell, visual output gallery, contextual citations/trace, and the two focused approval bars.
- Add component-level tests and recapture desktop/mobile proof before judge-facing recording.
- A Figma connector inspection requires an actual copied design-file key; no external Figma file was created in this audit.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 10:55 CT — Persistent navigation removed from redesign

**Area:** Product design / interaction simplification

### Changed

- Rejected the interim `Map · Brief · Outputs` tab row and output-type filter row after visual review showed that they still made the product feel like a crowded web app.
- Revised the audit, `DESIGN.md`, and `GOAL.md` around one current Workshop object, a transient visual Library, a Sources drawer, and context-sensitive actions.
- Tightened the default action budget from seven controls to five and retained exactly one visually dominant action when a gate is ready.

### Decision

- Preserve every implemented and roadmapped object—Map, Brief, Style, Sketch, Deck, Infographic, Image Batch, Storyboard, Video, Sources, jobs, and provenance—without representing them as permanent destinations.
- Use spatially consistent Back navigation and sheets that originate from their trigger. Keep inspectors closed until selection and keep the current object visually dominant.
- Apply the Apple design distinction between simplicity and superficial minimalism: show the common path first, place advanced capability one level deeper, and retain enough context for clear wayfinding.

### Verification

- `git diff --check` passed after the revision.
- The updated design contract explicitly forbids persistent tabs, persistent type filters, a permanent Studio rail, a permanent inspector, and a permanent host strip.

### Open items

- Implement and interactively test the current-object shell and Library sheet against the existing recorded fixture.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 13:45 CT — Focused Workshop UI shell implemented and verified

**Area:** Flagship browser GUI / UX simplification

### Changed

- Replaced the persistent three-column dashboard, permanent Studio rail, and view-tab strip with a 64px contextual header and one current Workshop object.
- Made Map the visual home. Sources, Library/Create, Details, transcript capture, and source addition are transient sheets; evidence detail appears only after a Map selection.
- Retained the real local actions and state: source ingestion, capture-only fallback, Map approval, style lock, Sketch, Storyboard edit/approval, output creation, render enqueueing, and source-to-output trace.
- Added an intentional mobile review layout: the spatial Map becomes a readable evidence outline rather than a cropped miniature whiteboard.

### Decision

- Chose progressive disclosure and a single focused canvas because the previous interface exposed every capability at once and made a capable MVP feel like an admin dashboard.
- Kept a quiet `Continue in ChatGPT` control as a host-return affordance, without adding a second chat composer.

### Alternatives considered

- Incrementally shrinking the old rails and tabs would preserve the confusing information architecture and leave the most important action competing with setup controls.
- A decorative landing-page treatment would improve screenshots but not the working capture-to-render flow.
- Hiding advanced capability entirely would make the product feel simpler but would remove judge-visible proof of the Map, approvals, provenance, and deliverables.

### Verification

- `pnpm --filter @workshoplm/web lint` passed.
- `pnpm --filter @workshoplm/web test:e2e` passed its recorded-fixture UI contract: Map, both approval labels, and `Continue in ChatGPT` are present.
- A clean isolated production build passed. Chrome-headless was used because the in-app browser plugin was unavailable; 1200×800 and 390×844 screenshots verified the desktop focused canvas and the mobile outline fallback against `DESIGN.md`.

### Open items

- This is a major usability increment, not final product-polish sign-off. Continue testing the real capture-to-output path and refine any workflow friction found in the demo recording.
- Native host sync, paid-provider evidence, public video, and Devpost submission remain separate open requirements.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 13:52 CT — Final demo proof gates and recording branches locked

**Area:** Submission / Demo planning

### Changed

- Revised `submission/DEMO-SCRIPT.md` to target 2:40–2:45, cap exports at 2:55, and include the required Codex-side WorkshopLM widget doorway.
- Split the source-to-Map and closing narration into provider-backed and recorded-fixture branches. A live GPT-5.6 result may be claimed only if it is captured, logged, and shown on screen.
- Added the timestamped raw founder-brainstorm → finished submission reveal while preserving the evidence boundary that a current recording cannot replace the missing original pre-code artifact.
- Expanded the submission checklist with Session ID designation/escalation, public-not-unlisted YouTube visibility, Google-mark restrictions, a tagged judge release, and stable access through the winner announcement.

### Decision

- Sequence recording work as spend authorization → optional logged GPT-5.6 result and image batch → primary `/feedback` Session ID → dated founder brainstorm → fixture reset/rehearsal → first full recording.
- If no authorized provider run occurs, use only the truthful two-layer disclosure that Codex, running on GPT-5.6, built and verified the product; do not imply a separate WorkshopLM provider-runtime result.
- Preserve the absence of an authentic pre-code brainstorm as an open historical gap. The new recording is a contemporaneous source for the demo, not backfilled history.
- Keep judge access stable through August 12 rather than August 5. The live Devpost key-dates feed fetched July 14 reports judging through August 10 at 00:00 UTC and winners announced August 12 at 21:00 UTC.

### Verification

- Refreshed the live OpenAI Build Week key dates through the Devpost Hackathons plugin; submissions remain open and the date payload was complete.
- `git diff --check` passed after the documentation changes.

### Open items

- Paid GPT-5.6 and image generation remain blocked pending explicit spend authorization.
- Capture the primary `/feedback` Session ID from the most representative implementation session or contact organizers immediately if the eligible surface cannot produce one.
- Record the dated founder brainstorm, widget doorway, full demo seam, public YouTube video, and tagged judge release.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 14:00 CT — Simplified UI verified in the intended in-app surface

**Area:** Flagship browser GUI / responsive acceptance

### Changed

- Reconciled the concurrent focused-shell work without replacing teammate changes.
- Kept the Map as the single current object, with Sources, Library/Create, Details, and capture controls behind transient sheets.
- Clamped spatial Map-card positions to the usable canvas width so source cards cannot clip at the 1024px breakpoint.
- Disabled the already-completed brief action so the header retains one honest dominant next action without inviting a duplicate approval.

### Verification

- `WORKSHOPLM_NEXT_DIST=.codex-review2 pnpm --filter @workshoplm/web build` passed compilation, lint/type validation, static generation, and route optimization.
- `pnpm --filter @workshoplm/web typecheck` and `pnpm --filter @workshoplm/web lint` passed after the responsive fix.
- `pnpm demo:reset && pnpm demo:e2e` passed the full recorded seam with all six gates true, five planned assets, five storyboard panels, and a rendered video artifact.
- The Codex in-app browser loaded the real local route and API fixture. Map, Sources, Library, and Storyboard states were exercised; the console contained no product warnings or errors.
- Responsive checks passed at desktop, 1024×768, and 390×844 review widths. The 1024px check first exposed a clipped card; the clamp fix was rebuilt and rechecked before acceptance.
- Compared the implementation with the accepted generated concept and fresh Map, Library, Storyboard, and mobile captures. The shared contract is now: no persistent tabs or rails, one current-object canvas, restrained system typography, transient supporting surfaces, and one contextual approval action.

### Open items

- The Library uses coherent visual preview states, but real provider-generated deck, image-batch, and video thumbnails remain open work.
- Style placement, Trace placement, and automated frontend coverage remain unchecked in `GOAL.md`; this entry does not promote them to complete.
- Paid OpenAI provider evidence, the Spike A host decision, a dated founder brainstorm, and the primary `/feedback` Session ID still require founder authorization or founder-only access.
- Codex Session ID: unavailable on this surface; not inferred.

## 2026-07-15 12:43 CT — Office-hours guidance captured in hackathon notes

**Area:** Research / Submission

### Changed

- Added the user-provided OpenAI Build Week Office Hours notes to `research/hackathon/BUILD-NOTES.md`.
- Captured the workflow lessons on Sol/Terra orchestration, Figma library consistency, long-running `GOAL.md` work, unreliable AI time estimates, early submission-answer drafting, the “Start With Why” demo arc, and problem-first judging.
- Recorded the GPT-5.6 themes and the Goblins discussion with an explicit source/claim boundary.

### Verified

- Confirmed the notes file and existing Build Week reference structure locally.
- Opened the linked X post at `https://x.com/reagan_hsu/status/2027917087264674168`; the available page returned no readable post text, so no additional claims were extracted from it.

### Decisions

- Treat the office-hours material as strategy guidance, not as a replacement for the official Devpost rules.
- Keep the final demo centered on the problem solved and the coherent end-to-end outcome, consistent with the current WorkshopLM submission direction.

### Open items

- Revisit the linked X post if readable content or a text transcript becomes available.
- Apply the early-submission-draft and why/how/what guidance while finalizing the Devpost narrative and under-three-minute video.
- Codex Session ID: unavailable on this surface; not inferred.

## 2026-07-14 17:32 CT — Official Figma library made the exclusive UI system

**Area:** Product design system / implementation boundary

### Changed

- Locked `Apps in ChatGPT · OpenAI Official (Community)` as WorkshopLM's only source for product-chrome components and styles.
- Replaced the earlier loose `borrow the chrome` direction with a verifiable rule: every control, container, label, menu, sheet, status treatment, icon, spacing value, and typography treatment must map to an exact asset in the official file.
- Kept custom rendering only for WorkshopLM domain content such as Map geometry, evidence paths, generated media, charts, slide previews, and storyboard imagery; the UI surrounding that content remains library-owned.
- Added explicit inventory, implementation-reconciliation, and conformance-check work to `GOAL.md`.

### Evidence boundary

- The Figma connector is authenticated as Daniel and can access the account, but the Community source key `1625636989296445101` grants view access only. Connector metadata inspection failed because it requires edit access.
- No component names, variants, variables, or internal node identifiers have been inferred from the Community preview.
- No editable copy was created because duplicating the Community file would write to the user's Figma account and still requires an explicit target or authorization.

### Remaining work

- Resolve the editable copied design-file URL/key, then inventory the real library before changing the implementation.
- Reconcile the current provisional CSS tokens and custom shell primitives against that inventory; do not treat the present ChatGPT-like approximation as compliant.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 15:05 CT — Capture → Shape → Deliver UX and real artifact gallery

**Area:** Flagship browser GUI / source scope / delivery evidence

### Changed

- Adopted the six-part NotebookLM legibility mandate without restoring a duplicate browser chat surface: the header now carries the ambient `Capture → Shape → Deliver` spine; Sources and Workshop Library have stable opposite-edge origins.
- Made source scope durable rather than cosmetic. Source checkboxes persist `activeSourceIds`; scope governs candidate extraction, asset planning, and generated deck/infographic evidence. A scope change stales dependent brief, outputs, image plan, storyboard, and video approval rather than silently changing grounding.
- Moved Style into the approved Brief context, removed top-level Trace from normal navigation, and grouped the user-facing Library as Capture, Shape, and Deliver.
- Repaired the recorded fixture seam: deck and infographic are now created through the worker service and persist into `WorkshopState`, not only as files on disk.
- Added a state-authorized artifact route and visual Outputs gallery. The gallery previews actual rendered deck and infographic HTML, serves the rendered local MP4 as playable video, shows citation/source controls, and labels image tiles as planned until genuine provider image bytes exist.

### Decision

- Borrow NotebookLM’s calm, stable evidence-to-output geography while preserving WorkshopLM’s differentiated control layer: editable Map, approved brief, versioned style, stale propagation, storyboard approval, and artifact-level grounding.
- Do not represent image-plan tiles as generated images. The visual placeholder establishes the contact-sheet interaction only; live `gpt-image-2` output remains spend-gated and must supply actual media before the output-preview acceptance item can close.

### Alternatives considered

- Keeping source checkboxes UI-only would look familiar but would break the core provenance claim because outputs would still use deselected evidence.
- Using arbitrary filesystem paths in the web route would make local preview easy but would expose local-machine data. The route resolves only a current state-authorized output id or the current rendered video.
- Retaining Style, Sketch, Storyboard, and Trace as peer library objects would preserve implementation completeness but fail the twenty-second orientation test.

### Verification

- `pnpm check` passed: monorepo lint, typecheck, and tests; worker service suite has 28 passing tests including active-source-scope invalidation.
- `WORKSHOPLM_NEXT_DIST=.codex-ux-build pnpm --filter @workshoplm/web build` passed; the optimized build includes `/api/workshop/artifacts/[id]`.
- `pnpm demo:e2e` passed with all six gates true, two persisted real HTML outputs, five storyboard panels, and a rendered MP4.
- Live local route verification against the deterministic fixture returned `200 text/html` for the deck preview and `200 video/mp4` for the approved video preview.
- A fresh in-app Browser visual pass could not run because the shared Browser profile was locked by another active session. This entry does not claim visual-browser acceptance; rerun it before recording.

### Open items

- Run the intended in-app Browser acceptance pass for source toggling, Map citation drawer, Outputs gallery, and mobile review once the shared browser session releases.
- Implement real GPT Image 2 media storage/contact sheets after spend authorization; image tiles remain intentionally labeled planned.
- Sketch remains implemented in the domain/service but is not yet positioned as a Deliver object. Automated frontend tests remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 15:34 CT — Current UI evidence, plugin strategy, and comprehensive project deck

**Area:** Product communication / interface evidence / ChatGPT app ecosystem research

### Changed

- Captured a twenty-screen gallery of the real current WorkshopLM application across reset and complete recorded fixtures, including Map, source scope, citations, brief/style approvals, Outputs, storyboard, and mobile states.
- Converted the NotebookLM comparison into six implementation-level experience acceptance criteria: immediate Capture → Shape → Deliver orientation, stable Sources/Library geography, tangible source scope, visual outputs with provenance, calm first run, and one-click citation inspection.
- Researched the installed ChatGPT/Codex plugin landscape and locked a focused adoption map: OpenAI Developers, Browser, Presentations, HyperFrames, and Record & Replay now; Granola, Google Drive, and Slack as optional source adapters; Figma, Product Design, Canva, and Creative Production as design references; Remotion as fallback; ChatCut, Sites, Documents, and Spreadsheets only when their seams earn inclusion.
- Created a twenty-one-slide project overview for a reader with no prior context using the official OpenAI Simple Light Mode presentation template. It covers the problem, product model, control moat, real interface, local architecture, deterministic proof, honest evidence boundary, meta-demo, plugin strategy, next 48 hours, and founder-only actions.
- Added the current screenshot gallery, experience criteria, plugin map, and project deck to `GOAL.md` evidence. Logged the duplicate deck/infographic cards visible in the completed Outputs gallery as an explicit pre-recording fix rather than hiding the defect.

### Decision

- Treat WorkshopLM as one focused ChatGPT App plus a local MCP-backed visual workspace. Optional apps contribute source context; they do not become required dependencies or justify unsupported app-to-app orchestration claims.
- Borrow NotebookLM's legibility and evidence geography, not its center-chat layout or one-shot output model. WorkshopLM keeps its editable Map, approved brief, locked style, stale propagation, storyboard gate, and artifact-level provenance.
- Use the final video as the primary judge experience while keeping screenshots and the deck as inspectable project evidence.

### Verification

- `pnpm demo:e2e` passed in recorded-fixture mode with all six gates true, two persisted HTML outputs, five planned assets, five storyboard panels, and a rendered video artifact.
- The real local application was inspected and captured in the browser across desktop and 390px mobile states; the gallery README records which fixture produced each screen and preserves the planned-versus-generated image boundary.
- Presentation overflow testing passed with no overflow detected.
- Template fidelity validation passed with zero issues against the requested Simple Light Mode reference deck.
- Final visual QA covered all twenty-one slides; corrected workflow copy, architecture title placement, proof metrics, meta-demo order, dated execution sequence, and founder-action count were re-rendered and re-inspected.

### Open items

- Deduplicate repeated deck and infographic cards before recording the demo.
- Replace planned image tiles with genuine GPT Image 2 media only after bounded provider spend is explicitly authorized.
- Provider-backed GPT-5.6, image, and final narration evidence remains unproved; this milestone does not promote deterministic fixture evidence to live-provider proof.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 17:10 CT — Judge-path interaction rebuild

**Area:** ChatGPT-native product UI / Map / trace / approvals / output package / storyboard

### Changed

- Adopted the decisive product rule `borrow the chrome; invent the interaction`. The Apps in ChatGPT kit now governs the shell-level direction; WorkshopLM differentiation is concentrated in the relational Map, synchronized evidence trace, and coherent package/storyboard.
- Removed the persistent Capture → Shape → Deliver spine, generic Library, generic Details, browser capture composer, Outputs shortcut, `Continue in ChatGPT` chrome, and the visibly broken Excalidraw editor from the judged path.
- Rebuilt the Map with a constrained spatial grammar: source anchors on the left, grounded claims in the center, implications on the right, labeled cluster regions, curved provenance edges, and synchronized path highlighting.
- Replaced fragmented evidence overlays with one adjacent Claim/Evidence inspector that supports claim editing, exact excerpt and locator review, and one Open source action.
- Rebuilt the Brief as an approved strategic object with coverage, version, and downstream consequence. Rebuilt Style as a live visual contract with palette, typography, miniature output previews, locked version, and propagation semantics.
- Removed the duplicated artifact grid at its source. Replaced four equal output buttons with one Generate/Refresh package action and distinct presentation, infographic, image-set, storyboard, and video objects.
- Strengthened Storyboard with visual thumbnails, timing and citation states, selected-panel context, narration editing, and a persistent approval summary showing panel count, runtime, grounding coverage, and current dependencies.
- Renamed the narrow-screen Map state to `Evidence outline`; mobile review no longer claims to preserve a spatial editor.
- Revised `DESIGN.md`, `GOAL.md`, and the recorded web fixture vocabulary to match the rebuilt interaction model. Added the detailed rebuild record under `research/judge-path-interaction-rebuild-2026-07-14.md`.

### Figma evidence boundary

- Inspected the authenticated Community page for `Apps in ChatGPT · OpenAI Official`. Its visible page menu lists foundation pages, Inline Card, Inline Carousel, Full screen, Inspector, PiP, and platform component pages.
- The Community source did not grant connector edit access, so internal layers, variables, and component names were not inspected or inferred. No editable copy was created in the user's account.

### Verification

- `pnpm --filter @workshoplm/web build` passed after the rebuild.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages; the worker service retains twenty-eight passing tests.
- `pnpm demo:e2e` passed with all six gates true, two persisted HTML outputs, five planned assets, five storyboard panels, and a rendered video artifact.
- Live in-app browser review covered the rebuilt Map, claim-to-source trace, approved Brief, locked Style contract, deduplicated package, and approved Storyboard.
- The first Map review exposed overlapping grounded claims. Their constrained layout was corrected, rebuilt, reloaded, and visually rechecked before acceptance.
- A 390×844 responsive session confirmed the document remains 390px wide and switches to the mobile Evidence outline; the browser screenshot compositor displayed the overridden viewport inside a larger capture surface, so a fresh device screenshot remains an explicit follow-up rather than a completed evidence claim.

### Open items

- Capture a fresh final screenshot set for the rebuilt six states and mobile Evidence outline.
- Add automated frontend regression tests for duplicate outputs, progressive disclosure, approval summaries, and one-dominant-action behavior.
- Verify keyboard focus order, WCAG AA contrast, reduced motion, and 200% zoom.
- Replace planned image tiles with genuine GPT Image 2 media only after bounded provider spend is explicitly authorized.
- Provider-backed GPT-5.6, image, and final narration evidence remains unproved.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 21:24 CT — Official Apps in ChatGPT UI contract implemented

**Area:** Figma design system / application chrome / visual acceptance

### Changed

- Imported Daniel's local `Apps in ChatGPT · OpenAI Official (Community).fig` into an editable Figma design file and inspected the actual foundations, platform component pages, display-mode templates, component variants, and component anatomy rather than inferring them from screenshots.
- Recorded the exact editable file key, official library keys, relevant page/node ids, verified light/dark colors, SF Pro web type ramp, spacing scale, component geometry, and WorkshopLM mappings in `research/openai-apps-figma-component-inventory-2026-07-14.md`.
- Reconciled `DESIGN.md` to the verified source. Retired the provisional MVP palette, square button/card geometry, decorative status pills, 64–68px header, and unsupported typography assumptions.
- Added `apps/web/app/oai-ui-contract.ts` as the machine-readable allowlist and `official-ui.css` as the sole final cascade for application chrome. The app now maps its visible Full screen, Navigation/Header, Button, IconButton, Token, Checkbox, Input, TextArea, Card, ListGroup, ListRow, EntityCard, Carousel, and CarouselRow compositions in markup.
- Added a conformance suite that pins the editable Figma source and component ids, requires exact foundation values, rejects retired MVP colors, and requires all judge-visible shell families to be mapped.
- Preserved custom rendering only where it expresses WorkshopLM domain content: Map geometry/evidence edges and generated artifact/storyboard media. The surrounding chrome uses the official system.
- Corrected a ListRow regression found during live review: source title and metadata now retain the verified two-line hierarchy instead of collapsing into one line.

### Decision

- `Apps in ChatGPT · OpenAI Official (Community)` is an enforceable implementation boundary, not moodboard inspiration. New application chrome must first enter the verified inventory and machine-readable contract.
- The library's Inspector page is marked “Coming soon.” WorkshopLM composes its evidence panel from verified Full screen columns, Card, Input, ListRow, IconButton, and Button primitives and does not claim an official Inspector component exists.

### Verification

- Figma design context was retrieved for the visible primary Button instance `7:104094`, confirming 36px height, 8px/16px padding, 4px gap, 999px radius, `#0D0D0D` fill, and SF Pro 14/20 label treatment. Card, ListRow, and Full screen context had already been inspected from the editable copy.
- `pnpm --filter @workshoplm/web build` passed with the optimized application routes.
- `pnpm check` passed all thirteen package lint/typecheck/test tasks. The new web conformance suite passed 3/3 tests and the worker retained 28/28 passing tests.
- `pnpm demo:e2e` passed all six recorded-fixture gates with two persisted HTML outputs, five asset-plan items, five storyboard panels, and a rendered video artifact.
- Live local browser acceptance covered the 52px Full screen header, Map/Card composition, Token source scope, Sources ListGroup/ListRows and checkboxes, approved Brief and Style Card/Input composition, and the visual Outputs/Carousel package. The source-row defect was fixed and visually rechecked before acceptance.

### Open items

- This milestone proves exact local UI-system conformance and the deterministic product seam. It does not prove live GPT-5.6, GPT Image 2, Realtime, or final narration provider use.
- Refresh the permanent demo screenshot gallery after the remaining provider-backed content and final recording fixture are ready; temporary acceptance captures were not promoted to submission evidence.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 21:43 CT — UI compliance claim corrected and P0 rebuild goal locked

**Area:** Goal correction / official design system / professional UX language

### Corrected evidence

- A follow-up audit disproved the prior claim that the official Apps in ChatGPT system was fully implemented. The previous test checked only whether each component name appeared somewhere in `page.tsx` and scanned only `official-ui.css`; it did not prove per-element conformance or prevent legacy `globals.css` selectors from winning.
- The current `packages/ui` package has no component implementation. The judged page still contains unmapped ordinary controls, native checkbox appearance, glyph Back/Close icons, and data attributes that name official components without implementing reusable equivalents.
- Live computed-style inspection confirmed concrete drift: the source Token renders at 44px rather than the 42px reference, button controls do not consistently inherit the verified SF Pro stack, and the locked Style card still receives the retired green MVP shadow. Mobile avoids horizontal overflow but drops the current object name from the header.
- The two implementation/conformance items in `GOAL.md` were reopened. The exact inventory remains complete and valid.

### Goal revision

- Made official-component remediation the active P0 gate. Completion now requires a real tested `packages/ui` layer, official iconography, primitive-grounded composites for any library gaps, removal/isolation of legacy chrome CSS, and an exception manifest limited to WorkshopLM domain rendering.
- Reused the NotebookLM screenshot evidence for behavioral layout principles: fixed Workshop orientation, immediate source scoping, one focused center object, durable recognizable Outputs, and one-click source reveal. The goal explicitly rejects copying Google's branding, terminology, education framing, or exact three-column proportions.
- Locked a plain-language contract and canonical copy replacements. Primary UI now targets familiar professional nouns and short verb–noun actions such as `Approve brief`, `Create outputs`, `Show source`, `Show on map`, and `Create video`; implementation terms such as gate, contract, package, artifact, provenance, render, Visual DNA, and version identifiers move to technical Details.
- Added proof requirements for per-element structural conformance, complete-cascade token checks, computed styles, interaction states, screenshot regression at three viewports, keyboard/focus/contrast/reduced-motion/zoom verification, copy snapshots, and a manual Figma-to-runtime reconciliation table.

### Decision

- If the official library lacks a ready-made control, WorkshopLM may create a named composite only from verified primitives, spacing, typography, iconography, and interaction behavior. A missing component is permission to compose, not permission to invent a parallel visual system.
- The interface is not complete because it looks closer to ChatGPT. It is complete only when code structure, rendered behavior, language, and evidence all satisfy the locked system.

### Verification

- Re-read the privacy-safe NotebookLM Sources/Chat/Studio, populated output history, and citation/source screenshots together with the existing user-flow and simplification audits.
- Reviewed the revised `GOAL.md` for the prior false-completion state, the known runtime failures, NotebookLM translation boundary, explicit copy dictionary, executable implementation sequence, and completion evidence.
- This milestone changes the source-of-truth goal and does not claim that the P0 rebuild itself is implemented.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 21:58 CT — Official component layer and plain-language judge path implemented

**Area:** Design system / frontend / professional UX

### Changed

- Replaced the no-op `packages/ui` package with a real React UI layer exporting `FullScreenShell`, `NavigationHeader`, `Button`, `IconButton`, `Token`, `Checkbox`, `Input`, `TextArea`, `Card`, `ListGroup`, `ListRow`, `EntityCard`, `Carousel`, and `CarouselRow`.
- Removed the legacy `official-ui.css` override strategy and replaced the duplicated MVP cascade with one application-layout stylesheet plus the package-owned official component stylesheet. The retired green/violet/amber shell colors and competing control geometry no longer exist in the application cascade.
- Migrated the judged Map, Sources, Brief/Style, Outputs, and Storyboard path to the reusable layer. Only the inventoried domain surfaces—Map nodes/edges, generated previews, image tiles, and storyboard imagery—retain custom rendering.
- Retrieved the official 24px chevron-left, close, and plus assets from Figma nodes `2105:819`, `2105:904`, and `2105:886` and implemented their exact paths. Glyph Back/Close symbols are gone.
- Documented the Source sheet, Evidence sheet, Claim inspector, and Approval summary as primitive-only compositions because the official library's Inspector remains “Coming soon.” Status is plain official caption text, not an invented pill.
- Rewrote visible product language around familiar objects and outcomes: `Sources`, `Map`, `Brief`, `Outputs`, `Storyboard`, `Approve brief`, `Create outputs`, `Show source`, `Show on map`, and `Create video`. Internal gate, contract, package, provenance, and render wording is absent from the default interface.
- Added structural conformance tests for reusable exports, inspected Figma ids, raw controls, exact icons, retired cascade tokens, the domain exception manifest, and retired product language.
- Added the implementation reconciliation record at `research/ui-figma-runtime-reconciliation-2026-07-14.md` and a permanent screenshot set under `research/screenshots/workshoplm/p0-official-ui/`.

### Verified

- `pnpm --filter @workshoplm/web build` passed.
- `pnpm check` passed lint, typecheck, and tests in all thirteen packages. The new UI package passed 3 tests; web conformance passed 5 tests; worker retained 28 passing tests.
- `pnpm demo:e2e` passed the complete recorded seam with all six gate flags true, two rendered HTML outputs, five planned assets, five storyboard panels, and a rendered video artifact.
- Live browser computed styles matched the inspected references: Button 36px / 8px 16px / 999px / SF Pro 14/20; Token 42px / 12px 16px / 25px / SF Pro 13/18; Card 24px / .5px 15% ink; Input 42px / SF Pro 14/20; Checkbox 18px with `appearance:none` and the official checked ink.
- Live visual review covered Map at 1024×768, Brief/Style, Outputs, and Storyboard at 1200×800, and Map/Sources at 390×844. The first mobile run exposed a 421px header inside a 390px viewport; the header was corrected and rechecked at an exact 390px document width with the current object still visible.
- Keyboard focus displayed the official 2px blue focus ring, and closing Sources returned focus to the source-count control.
- Compared the live screens directly with the stored NotebookLM populated-Studio reference. WorkshopLM preserves fixed identity, immediate source scope, one focused center object, durable output history, and exact source reveal while using the official OpenAI visual system and a professional production workflow.

### Decisions

- NotebookLM remains behavioral reference, not visual source. The official OpenAI Figma file remains the exclusive chrome/component source.
- The rebuilt interface uses no persistent tabs and no duplicate chat. ChatGPT owns conversation; WorkshopLM shows one professional object and one next action.
- This milestone closes the implementation and language portion of the correction, but does not close P0 proof. The remaining automated state, screenshot, full-copy, keyboard-approval, and zoom checks stay open in `GOAL.md`.

### Open items

- Add automated computed-style coverage across every interaction state.
- Complete reset/completed screenshot regression for evidence and focused-output states at all three viewports.
- Verify keyboard-only completion of both approval paths, WCAG AA, reduced motion, and 200% browser zoom.
- Snapshot every judge-visible label, not only the retired-language allowlist.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 22:03 CT — Completed-fixture visual regression and copy snapshot added

**Area:** Frontend verification

### Changed

- Added a production-server Playwright suite using the locally installed Chrome channel rather than an unverified bundled browser.
- Added 21 image baselines covering Map, Sources, exact evidence, Brief/Style, Outputs, focused output viewer, and Storyboard at 1200×800, 1024×768, and 390×844.
- Added rendered computed-style assertions for Button, Token, Checkbox, and keyboard focus states.
- Added focus-return and no-horizontal-overflow assertions to every viewport path.
- Added a stable snapshot of the judge-visible buttons and headings across Map, Brief, Outputs, and Storyboard.

### Verified

- `pnpm --filter @workshoplm/web exec playwright test --config playwright.config.ts` passed 5/5 against the committed baselines after an independent baseline-generation run.
- All 21 completed-fixture screens matched within the locked 0.1% pixel tolerance.
- Button and Token geometry, official focus color, custom Checkbox appearance, source-drawer focus return, and document-width equality passed in the live production server.

### Decisions

- Visual regression runs against `next start`, not `next dev`, so the screenshot contract excludes development-only chrome.
- The current baseline proves the completed fixture only. The reset fixture remains explicitly open instead of being implied by the completed matrix.

### Open items

- Add reset-fixture visual coverage without leaving the shared local fixture in a reset state after failures.
- Complete keyboard-only approval, WCAG AA, reduced-motion, and 200% zoom verification.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 22:12 CT — Isolated reset matrix and keyboard approval proof added

**Area:** Frontend verification / accessibility

### Changed

- Isolated the visual suite under `.workshoplm-visual-test`; global setup and teardown remove that test root so screenshots never alter Daniel's working demo fixture.
- Added reset-state Map and Sources baselines at all three target viewports, bringing the visual contract to 27 image baselines plus one visible-copy snapshot.
- Added keyboard-only Brief approval and Style selection before deterministic output seeding, then keyboard-only Storyboard approval after all completed-state screenshots.
- Added reduced-motion, core WCAG contrast, accessible role/name, focus return, visible focus, no-overflow, and 600px logical viewport checks representing a 200% layout on a 1200px screen.

### Verified

- A fresh non-update run of `pnpm --filter @workshoplm/web exec playwright test --config playwright.config.ts` passed 7/7 after baseline generation.
- The suite proved reset and completed states without touching `.workshoplm`; the isolated data root was removed by teardown.
- Both approval actions completed through Tab and Enter, not pointer clicks.

### Decisions

- The visual matrix item is now complete. Native browser zoom remains open because the automated check currently proves the equivalent logical viewport, not the browser UI's zoom command itself.
- Computed-style proof remains open for untested hover, pressed, disabled, error, and secondary primitive variants even though core geometry and focus/checked states pass.

### Open items

- Add the remaining primitive interaction-state assertions.
- Verify native 200% browser zoom or document the browser-control limitation with an equivalent accepted check.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 22:16 CT — Official UI proof suite integrated with repository checks

**Area:** Frontend verification / build integration

### Changed

- Scoped the web unit-test command to `app` so Vitest does not collect the independent Playwright specifications.
- Added `test:visual` as the production build plus visual-contract command.

### Verified

- `pnpm --filter @workshoplm/web test` passed 5/5 unit tests.
- `pnpm check` passed lint, typecheck, and tests across all 13 workspace packages.
- `pnpm --filter @workshoplm/web test:visual` built the production app and passed all 7 Playwright cases against 27 image baselines and the visible-copy snapshot.
- Playwright teardown removed `.workshoplm-visual-test`; Daniel's working `.workshoplm` fixture was not changed.

### Decisions

- The production visual suite remains separate from the default repository unit-test loop because it builds and launches a real server. It is a required UI-proof command, not an accidental Vitest input.

### Open items

- P0 remains open only for the remaining primitive variants/states and native browser 200% zoom proof.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 22:45 CT — Official component and professional UX gate completed

**Area:** Product design / reusable UI / accessibility / visual verification

### Changed

- Re-read the official editable Figma component sets through the Plugin API and corrected the reusable layer to the recorded Button, Token, Checkbox, Input, and TextArea anatomy and interaction variants.
- Limited Button to the official primary, secondary, destructive, and secondary-destructive variants; added documented `ButtonLink` and `ListRowAction` compositions for semantic links and source-row selection without inventing a new control family.
- Removed remaining page-level geometry overrides for citations and compact header controls, restored the verified Button state colors and disabled opacities, and implemented checked, indeterminate, hover, pressed, focus, disabled, and error behavior for the applicable primitives.
- Simplified action hierarchy so every normal object state has one enabled primary action at most; maintenance actions are secondary and the Sources state intentionally has no primary action.
- Refreshed the permanent Map, Brief, Outputs, Storyboard, Sources, Evidence, and output-viewer screenshot gallery from the production visual baselines.
- Updated `GOAL.md` to close the official-component and professional-language proof gate and move the active phase to provider-backed demo evidence.

### Verified

- `pnpm --filter @workshoplm/web exec playwright test --config playwright.config.ts` passed 8/8 without updating snapshots. The suite covers 27 reset/completed baselines, visible copy, all implemented primitive variants and states, both keyboard-only approvals, focus return, accessible names, duplicate output prevention, one-dominant-action rules, reduced motion, contrast, and no horizontal overflow.
- `pnpm check` passed lint, typecheck, and tests across all 13 workspace packages.
- `pnpm demo:e2e` passed the deterministic Capture → Shape → Deliver seam with both approvals, five planned assets, five storyboard panels, and the rendered-video gate.
- The production app was inspected in the ChatGPT/Codex in-app browser and the Chrome extension surface. Real Chrome at 600×800—the exact CSS-pixel reflow equivalent of 200% on a 1200px-wide browser—kept the Map, Sources action, primary action, and document width usable without horizontal overflow.
- Manual comparison of the NotebookLM populated-workspace reference against the refreshed Map, Brief, Outputs, Storyboard, and mobile screens confirmed the intended behavioral adaptation: stable object identity, immediate source scope, one focused work area, tangible output history, and progressive disclosure in the official OpenAI visual system.
- An initial repository check correctly failed when the Figma inventory no longer named inspected Button instance `7:104094`; the source identifier was restored and the complete check reran green.

### Decisions

- P0 UI work is complete. Further shell or label changes require a concrete regression, not subjective churn.
- Literal native browser zoom-menu state is not exposed by the automation boundary. The claim is limited to verified 200% layout behavior through a real 600px Chrome viewport plus the same production-browser overflow contract; browser chrome itself is not claimed as inspected.
- NotebookLM remains behavioral layout evidence, not a visual skin. WorkshopLM preserves a professional Map → Brief → Outputs → Storyboard workflow while ChatGPT owns conversation.

### Open items

- Real GPT Image 2 bytes and provider-backed output evaluation remain unrun; the gallery still labels planned image content honestly.
- The next active proof is a bounded live operator run that produces provider-backed assets for the demo and submission package.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 22:58 CT — Bounded live operator and provider-media seam implemented

**Area:** OpenAI integration / local operator workflow / image and narration provenance

### Changed

- Added `pnpm demo:live`, an isolated operator path under `.workshoplm/live-operator/` that captures a sanitized transcript, ingests two share-safe sources, approves the Brief and Storyboard, locks the demo Style and Visual DNA, and creates the traced deck, infographic, image plan, and storyboard.
- Made the default operator command a no-spend preflight. Live execution requires both `WORKSHOPLM_LIVE_OPENAI=1` and `OPENAI_API_KEY`; either missing value stops execution before a provider call.
- Integrated GPT Image 2 into real Workshop state: six distinct panel requests run concurrently from one locked Visual DNA block, successful files receive SHA-256 and request/model/version provenance, and failed panels remain individually retryable without discarding siblings or completed outputs.
- Integrated `gpt-4o-mini-tts` narration into the approved-storyboard dependency chain. Each WAV records panel/version/model/voice/instructions/request/hash provenance, and upstream Map, Style, or Storyboard changes stale the narration.
- Updated the HyperFrames worker to copy current provider narration into the render composition and disclose the AI-generated OpenAI voice. It continues to synthesize and disclose deterministic tones only when current narration is absent.
- Added generated-image artifact serving and real image thumbnails in Outputs while retaining the honest planned/partial states.
- Added the task-level implementation record at `docs/superpowers/plans/2026-07-14-live-operator-and-provider-media.md` and documented the preflight, paid command, and isolated-view command in `README.md`.

### Verified

- Current official OpenAI documentation confirms direct `gpt-image-2` Image API generation, base64 image results, multiple-image support, and high-fidelity reference behavior; it also confirms `gpt-4o-mini-tts`, `marin`, WAV output, and mandatory AI-voice disclosure.
- `pnpm demo:live` returned `status: ready`, two approvals, two traced outputs with four claims each, six planned GPT Image 2 requests, five planned TTS requests, nine separately planned GPT-5.6 benchmark requests, and `paidCallsMade: false`.
- `pnpm demo:live -- --execute` without the live opt-in failed closed before any provider call.
- Worker tests passed 32/32 across four files. New tests cover a complete six-image batch, partial-image retention, image artifact resolution, complete approved-storyboard narration, and a narrated render that calls HyperFrames without generating placeholder tones.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages.
- `pnpm demo:e2e` passed the recorded Capture → Shape → Deliver seam with both approvals and the rendered-video gate.
- A clean production rebuild passed, followed by the non-update Playwright visual contract at 8/8. An earlier concurrent visual attempt hit a stale `.next` vendor-chunk cache; it was stopped, rebuilt sequentially, and rerun successfully rather than counted as product evidence.

### Decisions

- The live operator is the one recording path; provider spikes remain diagnostics, not a second manual production workflow.
- Generated images use six concurrent direct Image API requests because each storyboard/output panel needs a distinct prompt while sharing one Visual DNA block. One `n=6` request would produce variations from one prompt rather than six intentionally different scenes.
- Provider media is local-only and excluded from Git. The UI reads the same isolated state when launched with `WORKSHOPLM_DATA_ROOT="$PWD/.workshoplm/live-operator"`.

### Open items

- No paid OpenAI request was made. GPT-5.6 runtime outputs, real GPT Image 2 bytes, real narration, and the narrated provider-backed MP4 remain unproved.
- Run the nine-request GPT-5.6 benchmark and the live operator only after explicit spend authorization; inspect every image, narration clip, provenance record, and the final MP4 before changing the completion checkboxes.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 23:05 CT — GPT-5.6 grounded Map route integrated behind the spend gate

**Area:** OpenAI reasoning / grounding integrity / model provenance

### Changed

- Added a structured-output Responses adapter for GPT-5.6 grounded-Map generation and wired it into live Operator execution before Brief approval.
- The request supplies only active claim IDs, text, locators, and source IDs; the output contract allows grounded and derived nodes plus typed relationships on the existing 0–100 canvas.
- Added a service boundary that rejects duplicate/invalid nodes, invalid edges, out-of-bounds positions, grounded nodes without evidence, and any model citation outside the active source scope.
- Persisted accepted model output as typed graph operations with `assistant` actor history plus model, request ID, input claim IDs, output SHA-256, and timestamp provenance.
- Updated the operator request plan to name one GPT-5.6 grounded-Map request in addition to the separate nine-request routing benchmark, six image requests, and five narration requests.

### Verified

- Current official OpenAI model documentation identifies Sol, Terra, and Luna as the GPT-5.6 family, supports the Responses API and Structured Outputs, and recommends Sol for complex professional work.
- Worker tests passed 34/34 across five files. New cases prove valid assistant graph persistence and reject an out-of-scope claim without recording an AI run.
- `pnpm demo:live` passed again in no-spend mode and reported the complete request plan with `paidCallsMade: false`.
- The live command without opt-in failed closed before preparing state or contacting a provider.
- `pnpm check` passed all 13 packages and `pnpm demo:e2e` preserved the recorded acceptance seam.

### Decisions

- The live grounded-Map route remains `gpt-5.6-sol` until the benchmark supplies contrary evidence; no default was changed from the locked routing policy.
- Provider output is never its own grounding authority. WorkshopLM accepts only citations to active durable claims and records the raw structured-output hash.
- The current official model catalog and text-to-speech guide disagree on `gpt-4o-mini-tts` lifecycle status. Keep the implemented route because account access was verified, but treat the first paid TTS response as a gating check and preserve the disclosed local fallback.

### Open items

- No GPT-5.6 request has run. Structured-output compatibility, quality, latency, usage, and the account-specific bare-alias discrepancy remain live-verification items.
- No TTS request has run; the documentation lifecycle mismatch is unresolved in practice.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 23:08 CT — Interface goal reduced to one official, plain-language contract

**Area:** Product design / goal reconciliation

### Changed

- Rewrote the user-facing objective and completion bar around the five-step path a professional sees: talk and select Sources, shape the Map, approve the Brief and choose Style, create Outputs, approve the Storyboard, and create Video.
- Added one locked interface contract to `GOAL.md`: one current object, one consistent Sources control, one dominant next action, two approvals, and visual Outputs.
- Made the official Apps in ChatGPT Figma file the explicit sole source for product chrome. Any missing pattern must be a documented composite of verified primitives rather than a new control or styling system.
- Replaced remaining goal-level drift toward Studio, package, generic Library, host-strip, and engineering vocabulary with the canonical WorkshopLM objects and plain action labels.

### Verified

- Recompared the NotebookLM three-region and populated-output screenshots with the current WorkshopLM Map, Outputs, and Storyboard screenshots. The locked contract preserves stable Workshop identity, immediate Sources, focused work, tangible output history, and one-click source trace without copying Google's chrome or permanent three-column layout.
- `pnpm --filter @workshoplm/web test -- --run app/oai-ui-contract.test.ts` passed 5/5. The contract rejects retired copy and requires the canonical actions `Approve brief`, `Create outputs`, `Show source`, `Show on map`, and `Create video`.

### Decisions

- The app remains simpler than NotebookLM's permanent three-panel workspace because ChatGPT already owns Conversation. WorkshopLM borrows NotebookLM's orientation behaviors, not its column count.
- Technical names remain valid in code, logs, generated files, and technical Details; they do not become primary navigation, labels, or buttons.
- The official-component UI gate stays complete. Real GPT Image 2 media is the only reason the visual Outputs-gallery item remains open.

### Open items

- Generate and inspect the real provider-backed image set after explicit spend authorization, then close the visual Outputs-gallery item if the results meet the locked contract.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 23:11 CT — GPT-5.6 benchmark and live Map now share Responses parsing

**Area:** OpenAI integration / benchmark integrity

### Changed

- Added a typed, reusable Responses text parser in `@workshoplm/ai` that accepts both the SDK-style top-level `output_text` convenience field and the raw REST `output[].content[]` shape.
- Moved the live grounded-Map adapter onto the shared parser and exported the parser through the workspace package boundary.
- Fixed the nine-request GPT-5.6 benchmark so valid nested Responses output is scored instead of silently becoming a false zero. A successful response without text now records an explicit error rather than looking like a low-quality model result.
- Added deterministic parser coverage for top-level text, split nested text fragments, refusals/non-text output, blank output, and invalid payloads.

### Verified

- `pnpm --filter @workshoplm/ai test` passed the routing-policy and Responses-parser suites.
- `pnpm --filter @workshoplm/worker test` passed 34/34, including nested structured Responses output and active-source citation rejection.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages.
- `pnpm demo:e2e` passed the complete recorded seam with all six gates true, five storyboard panels, two source-traceable outputs, and the rendered-video gate.
- `pnpm demo:live` passed the isolated no-spend preflight and reported the planned 1 Map, 6 image, 5 narration, and 9 benchmark requests with `paidCallsMade: false`.
- `pnpm demo:live -- --execute` without `WORKSHOPLM_LIVE_OPENAI=1` failed closed before any provider call, as required.

### Decisions

- Raw Responses parsing belongs in the shared AI boundary, not separately in each caller. Benchmarks and production must interpret the same provider payload the same way.
- No benchmark result may score missing text as model quality without also identifying the missing-output condition.

### Open items

- The shared parser is provider-independent proof only. GPT-5.6 structured-output compatibility, quality, latency, and usage remain unverified until explicit spend authorization allows the live run.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 23:23 CT — Interface completion gate reopened around simplicity

**Area:** Product design / goal reconciliation / judge-visible UI

### Changed

- Revised `GOAL.md` so the official Apps in ChatGPT primitive layer is treated as a foundation, not proof that the composed interface is finished.
- Reopened the screen-composition, plain-language, screenshot, accessibility, and final conformance gates.
- Added explicit screen contracts for the shared frame, Map, Sources/Evidence, Brief/Style, Outputs, Storyboard, focused Output, and system states.
- Locked the missing-pattern rule: document an official-primitive recipe in the Figma inventory, implement the named composite in `packages/ui`, add it to the allowlist and tests, and only then use it in the app.
- Reduced the visible vocabulary to eight product objects, eight primary actions, seven supporting actions, and seven states. Raw Markdown, `FRAME.md`, `DESIGN.md`, provider/queue terms, IDs, and version mechanics are confined to technical Details or export.

### Verified

- Recompared NotebookLM's stable Sources/Chat/Studio and populated-output screenshots with WorkshopLM's current Map, Brief, Outputs, and Storyboard screenshots.
- The current Map already demonstrates the right one-object direction, but the Brief exposes raw `FRAME.md`, Style remains a competing permanent panel, Outputs repeat status and card actions, and Storyboard reveals a dense filmstrip, editor, source action, approval action, and approval summary simultaneously.
- Re-read the verified Figma inventory. The required screen recipes can be built from the existing `FullScreenShell`, `NavigationHeader`, `Button`, `IconButton`, `Token`, `Card`, `ListGroup`, `ListRow`, `EntityCard`, `Carousel`, and `CarouselRow` primitives; missing product-specific behavior must use documented composites rather than new chrome.

### Decisions

- Preserve every implemented capability; simplify simultaneous exposure through progressive disclosure.
- Borrow NotebookLM's orientation behaviors—stable identity, immediate source scope, durable output history, and one-click citations—without copying its permanent three-column layout or Google visual language.
- The final demo cannot be recorded until the revised screen contracts, copy inventory, responsive screenshots, component reconciliation, and first-time orientation checks pass.

### Open items

- Implement the reopened P0 screen-by-screen checklist before treating the UI as final.
- Provider-backed image and narration proof remains separately open and may proceed without changing the UI files.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-14 23:46 CT — Judge path rebuilt around one calm work object

**Area:** Product UI / official component conformance / planning

### Changed

- Rebuilt the active Workshop around one current object and one state-dependent primary action. Back now appears only for nested work; Map, Brief, Outputs, Storyboard, and focused Output no longer repeat their page title or approval controls in the body.
- Replaced raw Brief Markdown with a readable executive document. Moved Style from a permanent competing panel into a compact Brief summary and an on-demand task sheet.
- Made each Output card the single open action, moved source trace into the focused Output, removed repeated freshness/source controls, and gave the selected Output the full work area.
- Reduced Storyboard to one filmstrip, one selected panel, and one editor. `Save` appears only after an edit; the header changes from `Approve storyboard` to `Create video` after approval.
- Added the official-grounded `EntityCardAction` and `SideSheet` composites to `packages/ui`, the machine-readable contract, the Figma inventory, and the final screen-to-component reconciliation.
- Simplified generated Output and Storyboard language so judge-visible work no longer exposes `FRAME`, Visual DNA, or production-pipeline jargon.
- Preserved Daniel's rough six-phase submission sequence as `docs/planning/2026-07-14-submission-sequence-rough.md`. It is deferred input and does not override `GOAL.md`, the dated execution plan, or the current interface priority.

### Verified

- `pnpm check` passed lint, typecheck, and tests across all 13 packages. The worker suite passed 34/34, the UI contract passed 3/3, and the web shell contract passed 5/5.
- `pnpm demo:e2e` passed the recorded Capture → Map → Brief → Outputs → Storyboard → Video seam with all six gates true, two traced rendered outputs, five storyboard panels, and a rendered video artifact.
- `pnpm demo:live` passed the isolated preflight with two approvals and two traced outputs; `paidCallsMade` remained `false`.
- The production visual suite passed 8/8 while replacing the deliberate baselines, then passed 8/8 again without baseline updates. It covers reset and complete states at 1200×800, 1024×768, and 390×844; keyboard completion of both approvals; focus return; official computed styles and interaction states; screen-reader names; reduced motion; contrast; 200%-equivalent reflow; and no horizontal overflow.
- Inspected the final Map, Brief, Style, Outputs, Storyboard, focused Output, Sources, and Evidence screenshots at desktop and mobile widths. The Style sheet is a 440px contextual desktop layer and a clear full-width mobile task; the mobile focused Output uses a scaled document viewport rather than clipping its generated content.

### Decisions

- The official component foundation is necessary but not sufficient. Screen composition, visible language, and progressive disclosure remain separately evidenced completion gates.
- The simplified judge path is now the canonical UI. Provider-backed image media may land without reopening the screen architecture unless live evidence reveals a concrete failure.
- Five independent five-second orientation reviews remain a human proof gate; passing automated UI tests is not substituted for first-time comprehension.

### Open items

- Generate and inspect the provider-backed GPT Image 2 set before closing the visual Outputs-gallery item.
- Cover the remaining empty, loading, partial, error, and needs-update presentations before closing the full system-states item.
- Conduct five independent first-time reviews and repair any critical navigation failure before final recording.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 00:01 CT — Product-state contract completed and visually proved

**Area:** Product UI / recovery / visual acceptance

### Changed

- Added explicit loading and retryable load-error behavior so a failed Workshop request no longer leaves a blank or misleading Map.
- Added the official-grounded `StateMessage` composite for empty, loading, partial, error, and needs-update explanations. Ready remains the normal work object rather than another status card.
- Made a truly empty Workshop show only source scope and `Add source`; removed the disabled, inapplicable Brief action from that state.
- Made partial delivery name what is usable and keep `Update outputs` as the single next action. A failed or selected-for-regeneration image panel now makes Outputs updateable, and the update path replaces that failed batch with a fresh planned batch.
- Added focused-Output and empty-Storyboard fallbacks that explain the recovery path without exposing route, provider, or queue internals.

### Verified

- Production `next build` passed.
- The visual production suite passed 9/9 while creating 15 state baselines, then passed 9/9 again without updating snapshots.
- Empty, loading, partial, error, ready, and needs-update behavior is covered at 1200×800, 1024×768, and 390×844. The partial-state test executes `Update outputs` through intercepted production requests and proves `createImageBatch` is included when an image failed.
- Directly inspected desktop and mobile screenshots for every new state. The first pass exposed a too-tight state card and an inapplicable disabled Brief action; both were corrected before the final unchanged-baseline run.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages.
- `pnpm demo:e2e` passed all six gates through rendered video. `pnpm demo:live` passed the isolated preflight with `paidCallsMade: false`.

### Decisions

- State UI does not become a second progress system. It appears only when normal work cannot explain the next action clearly.
- Ready is proved by the real object surface. Partial and needs-update retain visible finished work so recovery does not erase context.
- Provider and queue details remain out of state copy; the user sees what happened and what to do next.

### Open items

- Generate and inspect the provider-backed GPT Image 2 set before closing the visual Outputs-gallery item.
- Conduct five independent first-time orientation reviews and repair any critical navigation failure before final recording.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 00:15 CT — Submission became a traced, self-verifying Output set

**Area:** Meta-demo / domain contract / evidence integrity

### Changed

- Added a first-class submission Output-set schema covering Devpost copy, README narrative, presentation, infographic, image manifest, thumbnails, Storyboard, narration, Video, evidence, source locators, file hashes, and the exact approved input versions.
- Added a deterministic package builder that refuses to run without a current approved Brief and Style, current output plan and image set, approved current Storyboard, current presentation and infographic, and rendered local Video.
- Added an input fingerprint over active Sources, normalized chunks and claims, transcript, Map, Brief, Style, output plan, Storyboard, image set, narration, model-run provenance, Outputs, and Video state.
- Added a verifier that independently detects missing or modified files, manifest status inflation, path escape, and later Workshop edits. Added `pnpm submission:build` and `pnpm submission:verify` as the repeatable operator path.
- Extended the recorded acceptance fixture to retain its six-panel image plan so the submission package contains the complete planned Output surface even before paid media generation.

### Verified

- Domain tests passed 12/12, including required asset coverage, path safety, and the rule that a `ready` package cannot retain limitations.
- Worker tests passed 37/37, including package gate rejection, a valid traced build, file-tamper detection, and dependency-fingerprint staleness after a Style edit.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages.
- `pnpm demo:e2e` passed all six gates with two traced rendered Outputs, six planned image panels, five Storyboard panels, and the local Video artifact.
- `pnpm submission:build` created a 12-asset package at `.workshoplm/acceptance/generated/submission-output-set-v1`; `pnpm submission:verify` returned `valid: true`, `stale: false`, `tampered: false`.
- Inspected all three FFmpeg-derived 1280px thumbnails. They accurately show the approved Storyboard frames and visibly disclose the deterministic placeholder audio.
- `ffprobe` verified the copied MP4 at 22.037 seconds and 1,202,306 bytes. The package manifest records the same Video SHA-256 as the accepted worker artifact.
- `pnpm demo:live` passed the isolated preflight with `paidCallsMade: false`; no provider spend occurred in this increment.

### Decisions

- The Output set is deliberately `partial`, not `ready`: it records an imported brainstorm rather than a durable voice transcript, no live GPT-5.6 Map run, 0/6 provider-generated image panels, and deterministic placeholder tones rather than provider narration.
- The broad GOAL item remains unchecked until the provider-backed assets and final public submission Video replace those fallbacks. A deterministic, honest package is progress evidence, not permission to claim the final meta-demo is complete.
- Runtime packages remain inside the Workshop data root and are regenerated from the accepted fixture; the final sanitized package will be promoted to a judge-facing tracked location only after its provider evidence and public Video are final.

### Open items

- Run and inspect the authorized live GPT-5.6, GPT Image 2, and narration path before upgrading package status.
- Replace the recorded fixture Video with the final under-three-minute meta-demo and rebuild the Output set from that approved state.
- Complete the five first-time orientation reviews before final recording.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 00:17 CT — Spike A deadline closed on the capture-only path

**Area:** Voice capture / host integration / fallback decision

### Changed

- Closed the Spike A decision after its July 14 end-of-day deadline elapsed without native durable task/voice-turn proof.
- Made the already-implemented capture-only `gpt-realtime-2.1` path the final demo voice architecture and removed native ChatGPT task/account turn linkage from the hackathon implementation claim.
- Corrected the runbook's Spike A location to the actual `spikes/a-host-sync/` workspace and separated the completed fallback decision from the still-open live WebRTC verification.

### Verified

- Re-read the latest persisted host report at `artifacts/spikes/host-sync-2026-07-14T06-37-52-460Z.json`: status `credential_blocked`; account, task, typed-turn, native-voice, and token checks were skipped; the report explicitly selects the capture-only fallback.
- Re-ran `pnpm spike:host-sync:verify` after the decision deadline. It again returned `credential_blocked`, recorded no inferred host capability, and selected the capture-only `gpt-realtime-2.1` fallback.
- Existing worker coverage proves the fallback transcript becomes a durable private Source, normalized chunk, verified claim, Map evidence, and time-to-first-output measurement. Existing production UI evidence proves the capture-only control is visible and distinct from a chat composer.

### Decisions

- Spike A is complete as a fallback decision, not as native host proof. No judge-facing surface may claim durable native ChatGPT task or voice synchronization.
- The Capture implementation remains open until one real voice turn crosses the `gpt-realtime-2.1` transport and lands in the already-verified durable transcript/source boundary.

### Open items

- Implement and verify the server-minted ephemeral Realtime session plus browser WebRTC capture against the existing `captureFallbackTranscript` boundary.
- Record the first live voice capture before filming the final demo.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 00:30 CT — Bounded Realtime voice capture implemented and verified without spend

**Area:** Voice capture / browser WebRTC / transcript provenance / interface

### Changed

- Added a server-only `POST /api/realtime/token` boundary that fails closed unless `WORKSHOPLM_LIVE_OPENAI=1` and `OPENAI_API_KEY` are present, then requests a one-minute ephemeral Realtime client secret without exposing the standard API key to the browser.
- Configured `gpt-realtime-2.1` as a capture-only session with `gpt-realtime-whisper` input transcription, server VAD, and both automatic response creation and interruption disabled.
- Added a bounded `Record voice` card inside the existing `Add source` sheet. It connects through browser WebRTC, shows recording and transcript-review states, and requires final provider transcript events before `Add transcript` becomes eligible.
- Added a deterministic reducer for Realtime transcript delta, completed, failed, and error events. Completed transcripts retain provider item and event IDs; an empty manual buffer commit is ignored rather than shown as a capture failure.
- Extended durable transcript provenance with an explicit `fixture` or `webrtc` transport. Only WebRTC captures with non-empty provider item/event evidence count as live voice in the submission Output set; older persisted transcripts are safely backfilled as fixtures.
- Documented `RealtimeCapture` as a WorkshopLM composite made only from the official Card, Button, secondary Button, and body/status text primitives. Added responsive Add Source screenshots at 1200×800, 1024×768, and 390×844.

### Verified

- Official OpenAI Realtime WebRTC guidance and API reference support the chosen boundary: a server mints the ephemeral client secret, the browser sends SDP directly to `/v1/realtime/calls`, and final input transcription arrives through `conversation.item.input_audio_transcription.completed` events.
- Web tests passed 10/10, including server fail-closed behavior, exact capture-only session configuration, standard-key non-disclosure, incomplete-secret rejection, transcript assembly, provider evidence retention, and transcript errors.
- Worker tests passed 38/38, including fixture-versus-WebRTC provenance and rejection of incomplete provider item/event evidence.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages.
- `pnpm demo:e2e` passed the recorded Capture → Map → Brief → Outputs → Storyboard → Video seam with all six gates true.
- `pnpm demo:live` passed the no-spend preflight with `paidCallsMade: false`; no provider call or credit spend occurred in this increment.
- `pnpm submission:verify` returned `valid: true`, `stale: false`, and `tampered: false`. Its limitations now explicitly say that fixture/imported transcript text is not live voice evidence.
- The production Next build passed and exposed `/api/realtime/token` as a dynamic server route. The visual suite passed 10/10 without baseline changes, including the Add Source composition at all three widths and a fail-closed browser path when live capture is disabled.
- Inspected the three new Add Source screenshots. The capture control remains contextual, uses one dominant action, does not add a composer or permanent toolbar, and preserves the text-source fallback on desktop and mobile.

### Decisions

- This increment proves the implementation and fail-closed behavior, not provider success. The live Capture checkbox remains open until an actual microphone turn is captured, persisted, and inspected with provider evidence.
- A deterministic demo transcript remains useful for replay, but it is permanently labeled `fixture`; it cannot upgrade the submission package to live voice.
- Standard OpenAI credentials stay on the Next.js server. The browser receives only the ephemeral Realtime secret required for its direct WebRTC connection.

### Open items

- Run one authorized provider-backed microphone turn and inspect the durable transcript, private Source, item/event IDs, and downstream grounding before final recording.
- Complete the five independent first-time orientation reviews before filming.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 00:40 CT — Fresh Codex task called the installed WorkshopLM evidence tools

**Area:** Plugin host / MCP safety metadata / grounded search and fetch

### Changed

- Added standard MCP safety annotations to every WorkshopLM tool. Read tools now advertise `readOnlyHint: true`, `destructiveHint: false`, and `openWorldHint: false`; local state-changing tools explicitly advertise `readOnlyHint: false` while remaining non-destructive and closed-world.
- Rewrote tool descriptions to start with their concrete use condition so model discovery distinguishes read evidence work from user-authorized local mutations.
- Rebuilt the distributed MCP bundle, refreshed the installed `workshoplm@workshoplm-local` version `0.1.2`, and recorded the host evidence in `artifacts/spikes/plugin-host-2026-07-15.json`.

### Verified

- Official OpenAI tool guidance requires `readOnlyHint` for retrieval-only tools and notes that tools without it are treated as writes. Official Codex skill guidance documents the initial 2% context budget and that large installations may omit skills from the model-visible list.
- Before the repair, fresh task `019f6445-5254-7491-99de-288759c224e8` discovered the WorkshopLM MCP server but did not activate `$workshoplm`; its first read call was cancelled under the host's write-style confirmation policy.
- `pnpm --filter @workshoplm/plugin-mcp test` passed 7/7, including exact safety-annotation assertions; plugin typecheck and distribution build passed.
- `codex plugin add workshoplm@workshoplm-local --json` refreshed the installed bundle. SHA-256 proved the installed manifest and generated tools match the repository versions exactly.
- Fresh read-only Codex task `019f6448-5a04-7753-b585-e156aec9f1b6` invoked the real installed MCP server and completed `workshop_list → search → fetch` without confirmation. It found one sanitized Workshop and fetched `Sanitized fixture · chunk 01` with its linked verified claim.
- Fresh read-only task `019f6449-577f-7de3-a39e-7079ff46ea98` could not access the write-classified `workshop_render_video` tool; no mutation occurred. This proves the host no longer treats read and write tools identically, but it does not replace an interactive confirmation test for an authorized write.
- Direct installed-bundle `tools/list` returned the expected annotations for all eleven tools.
- `pnpm check` passed across all 13 packages. `pnpm demo:e2e` passed all six gates. `pnpm demo:live` remained a no-spend preflight with `paidCallsMade: false`.

### Decisions

- Spike E remains open rather than overstated. Codex MCP read-tool invocation is proved; ChatGPT Work invocation and explicit WorkshopLM skill activation are not.
- The skill failure is recorded as a host-environment constraint: this machine exceeded the documented initial 2% skills context budget and omitted 311 additional skills. The plugin server and tools remained available.
- Read operations should never require write confirmation. Local write operations remain visibly classified and require an interactive authorization-capable surface.

### Open items

- Activate WorkshopLM from the desktop Skills surface or a clean plugin-only profile and record that result.
- Test the available ChatGPT Work surface explicitly; do not infer parity from Codex CLI.
- Run one interactive, intentionally bounded write confirmation without changing the sanitized fixture, or keep the current read-only demo doorway if write-tool proof adds no judge value.

---

## 2026-07-15 01:08 CT — Judge path restored as a real editable semantic Excalidraw Map

**Area:** Shape / semantic whiteboard / source trace / responsive product UI

### Changed

- Corrected an evidence contradiction: `GOAL.md` called the Map an editable Excalidraw surface, but the current judge path had replaced it with static HTML cards and SVG lines. Restored Excalidraw as the actual desktop/compact interaction engine without restoring its menus, toolbar, export controls, or other competing product chrome.
- Projected active Sources, semantic nodes, direct source evidence, and graph relationships into one constrained canvas. Sources keep stable left-side geography; grounded, derived, and creative semantic nodes use restrained evidence-state treatments.
- Persisted direct node movement, resize, and bound-text edits through the existing typed semantic graph history. WorkshopLM `Undo` now restores those canvas operations and downstream Brief/Output staleness remains enforced.
- Kept exact source trace contextual: selecting a semantic node opens one claim inspector; `Show source` opens the excerpt and locator in the official side sheet. Mobile uses a review outline over the same graph instead of a fake miniature canvas.
- Reconciled `DESIGN.md` and `GOAL.md` with the implemented boundary and refreshed the affected three-width screenshot baselines once.

### Contract change

- **Affected contract:** `WorkshopMapNode` and `CanvasNodePatch` in `apps/worker/src/workshop-service.ts`.
- **Exact change:** Added required numeric `width` and `height` fields, with durable backfill defaults of `24 × 18` for persisted v1 state. `syncMapCanvas` now validates, rounds, stores, and undoes size alongside title and position.
- **Reason:** Excalidraw resize would otherwise appear editable but silently revert after the next state refresh, violating the locked semantic-whiteboard promise.
- **Blast radius:** Local persisted Workshop JSON, the web API request shape, Map projection, worker synchronization, and worker/browser tests. No public plugin tool schema, source format, artifact format, or provider adapter changed.

### Verified

- Worker tests passed 38/38. The canvas test proves title, normalized position, and normalized size persist through typed history; Undo restores the original semantic node and dimensions.
- The production Next build passed. The page remains prerenderable because Excalidraw and its converter load only in the browser.
- The full production-route visual suite passed 10/10 unchanged after the one-time expected baseline refresh. It covers reset and completed Workshops at 1200×800, 1024×768, and 390×844; source and evidence sheets; official component computed states; plain-language stability; contrast; reduced motion; and 200% logical zoom.
- The browser interaction test directly double-clicked bound Excalidraw text, persisted `The product promise revised`, and restored the original title through WorkshopLM Undo. It then dragged the same node, proved the persisted normalized x-position changed, and restored `x: 11` through Undo.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages after removing three duplicate generated `.next/types/* 2.ts` cache files and rerunning from clean generated state. The initial failure and cache correction are retained here rather than hidden.
- `pnpm demo:e2e` passed the recorded Capture → Map → Brief → Outputs → Storyboard → Video seam with all six gates true, two traced rendered outputs, six image-panel plans, five storyboard panels, and a rendered MP4 artifact.
- `pnpm demo:live` passed no-spend preflight with `paidCallsMade: false`; no provider call or credit spend occurred in this increment.
- The first `pnpm submission:verify` correctly failed because the acceptance reset had removed its derived manifest. `pnpm submission:build` rebuilt 12 current assets with explicit provider limitations, and the subsequent verification returned `valid: true`, `stale: false`, and `tampered: false`.

### Decisions

- Excalidraw is the Map interaction engine, not a second product shell. WorkshopLM owns approval, Undo, source trace, and persistence; Apps in ChatGPT primitives own all surrounding chrome.
- A mobile outline is the honest responsive boundary for review and approval. Spatial editing remains desktop/compact work.
- The editable Excalidraw and typed-Undo claims are now supported. Live GPT-5.6 generation, provider image bytes, provider narration, and provider-backed voice remain open and are not upgraded by this work.

### Open items

- Complete the five independent first-time orientation reviews and repair any critical finding before final recording.
- Run and inspect the spend-gated live GPT-5.6, GPT Image 2, Realtime microphone, and TTS paths before changing provider claims.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 01:20 CT — Outputs became a version-aware, source-scoped work history

**Area:** Outputs / interface language / responsive product UI

### Changed

- Closed the remaining implementation gap behind the Studio-history requirement. The gallery now presents every retained presentation and infographic version as a recognizable object with its real rendered preview, specific title, output type, version number, `Up to date` or `Needs update` state, source coverage, and one card-level open action.
- Grouped presentation history before infographic history and ordered versions newest-first within each type so prior work stays available without destabilizing the main delivery order.
- Added the same source-scope signal to the image set, Storyboard, and rendered-video summaries. Removed cited-claim counts from gallery cards because source coverage is the user-facing decision signal; claim-level trace remains inside the focused Output.
- Expanded the canonical-copy contract to reject every retired phrase in the locked dictionary and require the approved action/state vocabulary. The default interface continues to reserve `FRAME.md`, `DESIGN.md`, and `Visual DNA` for exported or technical artifacts rather than judge-visible chrome.
- Refreshed only the expected Outputs, partial, needs-update, and visible-label baselines at 1200×800, 1024×768, and 390×844 after inspecting the new composition.

### Verified

- Production Next build passed and kept `/` statically prerenderable.
- The production-route Playwright suite passed 11/11, including the new version-history test, all three responsive judge paths, state handling, exact official primitive states, visible-copy snapshot, accessibility checks, reduced motion, contrast, and 200% logical zoom.
- The history test injects two presentation versions and proves both independently named card actions, version labels, current/stale language, source coverage, and three real iframe previews across the presentation/infographic set.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages; worker tests remained 38/38 and web tests remained 10/10.
- `pnpm demo:e2e` passed all six recorded gates with two traced rendered Outputs, six image plans, five Storyboard panels, and a rendered MP4.
- `pnpm demo:live` passed the isolated no-spend preflight with `paidCallsMade: false`.
- `pnpm submission:build` rebuilt the 12-asset partial submission set with provider limitations intact; `pnpm submission:verify` returned `valid: true`, `stale: false`, and `tampered: false`.
- Inspected the final desktop, compact, and mobile Outputs screenshots. Each exposes the current object, three-source scope, a singular `View storyboard` next action, readable previews, and quiet history metadata without introducing a tab, side rail, or duplicate composer.

### Decisions

- The Outputs-history and canonical-language implementation boxes are now supported by direct runtime and test evidence and are checked in `GOAL.md`.
- The five-second orientation and five-independent-review boxes remain open. Structural presence and agent inspection are useful evidence, but they are not independent first-time human comprehension tests.
- No provider capability claim changed. GPT Image 2 bytes, GPT-5.6 reasoning, Realtime microphone capture, and provider narration remain explicitly unverified.

### Open items

- Conduct five independent first-time orientation reviews and repair any critical navigation failure before recording.
- Run and inspect the authorized live GPT-5.6, GPT Image 2, Realtime microphone, and TTS paths before upgrading provider claims.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 01:27 CT — WorkshopLM skill activated from an isolated Codex profile

**Area:** Plugin host / skill discovery / grounded MCP read path

### Changed

- Created an ephemeral Codex home and installed only the current local `workshoplm@workshoplm-local` plugin. The normal Codex installation and its large skill catalog were not modified.
- Ran two read-only disposable tasks with `$workshoplm` named explicitly. The first proved skill discovery but used the default fixture, whose source cards had no indexed chunks; its search and fetch attempts correctly returned no grounded evidence. The second bound the same plugin to the deterministic acceptance fixture and completed the full read path.
- Added `artifacts/spikes/plugin-skill-activation-2026-07-15.json` with sanitized host, plugin, hash, task, skill, tool, evidence, and limitation fields.

### Verified

- The isolated plugin list contained exactly one enabled plugin: `workshoplm@workshoplm-local` version `0.1.2`.
- SHA-256 matched the isolated installed manifest, WorkshopLM skill, and distributed MCP server to their current worktree files.
- Codex task `019f6474-bb34-7bf1-8ed0-65527e91b224` announced use of the named skill, read its installed `SKILL.md`, and called only the WorkshopLM read tools `workshop_list`, `search`, and `fetch` after skill activation.
- `search("traced deck")` returned one grounded chunk. `fetch` returned `Judges need a traced deck, infographic, image batch, storyboard, and narrated video.` at `Sanitized fixture · chunk 01` with one linked verified claim.
- The task ran with a read-only sandbox and attempted zero WorkshopLM writes. Its final structured result reported `skill_used: true` and the exact three read tools.

### Decisions

- The previous global-catalog omission no longer blocks the Codex skill claim. A clean profile proves that the plugin packages a discoverable and executable `$workshoplm` skill alongside its MCP server.
- Spike E remains open because ChatGPT Work has not been invoked. Codex proof cannot establish Work parity, and the read-only run does not establish write-tool confirmation behavior.
- Disposable task IDs `019f6473-6e74-7a82-a796-7851c9eec1ad` and `019f6474-bb34-7bf1-8ed0-65527e91b224` are recorded as host-proof tasks, not as the missing primary Devpost `/feedback` Session ID.

### Open items

- Test the available ChatGPT Work surface explicitly and record whether it can activate the skill and call the local stdio server.
- Keep the judge-facing plugin claim Codex-specific until that Work proof exists.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 01:37 CT — Public claims reconciled to the verified product floor

**Area:** Devpost / demo script / evidence discipline / submission verification

### Changed

- Added `submission/CLAIM-LEDGER.md` as the publication gate for every material judge-facing claim. It maps supported wording to direct evidence and records the exact artifact required before live GPT-5.6 reasoning, GPT Image 2 pixels, provider narration, Realtime voice, ChatGPT Work, plugin-doorway footage, or final self-produced-submission language may appear.
- Rewrote the Devpost draft and timed demo script around the implemented product language: `Sources`, `Map`, `Brief`, `Style`, `Outputs`, `Storyboard`, `Video`, and `Show source`. Retired destination labels and raw technical filenames no longer appear as default judge-visible moments.
- Added a binary evidence selector to the recording script. Missing or ambiguous proof now selects the bounded recorded-fixture line rather than a provider claim.
- Refreshed the completion audit with July 15 evidence for the editable Excalidraw Map, version-aware Outputs history, Realtime implementation boundary, isolated Codex skill activation, grounded MCP read path, and verified 12-asset partial submission set.
- Updated `GOAL.md` and the submission checklist without closing the overall public-claims objective. Final video, Devpost entry, release tag, screenshots, and submitted links still must pass the same gate.

### Verified

- `pnpm check` passed lint, typecheck, and tests across all 13 packages; worker tests remained 38/38 and web unit tests remained 10/10.
- The production-route visual suite rebuilt the Next app and passed 11/11 tests, covering the three responsive judge paths, Realtime capture boundary, editable Map, Output history, official component states, canonical copy, accessibility, contrast, reduced motion, and 200% logical zoom.
- `pnpm demo:e2e` passed the recorded Sources → Map → Brief → Outputs → Storyboard → Video seam with all six gates true, two rendered source-traceable Outputs, six planned image panels, five Storyboard panels, and a local MP4.
- The first `pnpm submission:verify` correctly failed after the acceptance reset removed derived submission assets. `pnpm submission:build` then rebuilt the 12-asset `partial` set with all four provider limitations intact; the subsequent verifier returned `valid: true`, `stale: false`, and `tampered: false`.
- The ten demo beats are continuous from 0:00 through 2:42, below the 2:55 recording ceiling.
- Static checks found no retired `Studio`, `Story`, `Trace`, `asset plan`, or `image manifest` label in the Devpost draft, timed demo, or completion audit. All referenced local proof artifacts exist, and `git diff --check` passed.

### Decisions

- The public story now distinguishes product implementation from provider execution. Implemented-and-tested Realtime code is not called live voice; planned image panels are not called GPT Image 2 output; placeholder tones are not called AI narration.
- Codex plugin language remains Codex-specific until ChatGPT Work is exercised. The isolated proof task is evidence for skill/tool behavior, not the missing Devpost `/feedback` Session ID.
- The current 12-asset Output set is useful proof of trace and integrity but remains `partial`; it cannot support the final self-produced-submission claim until provider media and the public video replace its disclosed fallbacks.

### Open items

- Complete the five independent first-time orientation reviews and repair any critical navigation finding before recording.
- Capture and inspect authorized live GPT-5.6, GPT Image 2, Realtime microphone, and provider-narration artifacts before selecting their demo lines.
- Capture the Codex doorway, contemporaneous founder brainstorm, representative `/feedback` Session ID, final public video, release tag, and logged-out submitted links.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 01:44 CT — Finished Video gained the raw-brainstorm reveal

**Area:** Meta-demo / focused Video / responsive product UI / screenshot evidence

### Changed

- Added one contextual `Show original` action to the focused Video. It replaces the generic source action only for Video and opens the original brainstorm beside the finished work without adding a tab, rail, destination, or permanent panel.
- Built `OriginalReveal` exclusively from the official `SideSheet`, `Card`, body/caption text, `ListGroup`, `ListRow`, and `FileIcon` primitives. The composite is documented in `DESIGN.md`; the implementation adds no new primitive or design-system exception.
- The reveal reads the first durable transcript when one exists. A WebRTC segment is labeled `Realtime transcript`; a deterministic segment is labeled `Recorded fixture transcript`; absence of either falls back to an explicit `Sanitized source excerpt`. Fixture text can never appear as live voice evidence.
- Added an After list for the presentation, infographic, image set, Storyboard, and Video with real counts and current states, plus measured first-transcript-to-first-Output time when both timestamps exist.
- Replaced the stale screenshot-gallery index, which still described the discarded tabbed/Library MVP, with 30 links to the authoritative production-route screenshots for ten current screens at desktop, compact, and mobile widths. The older numbered PNGs are retained and labeled as pre-simplification archive evidence.

### Verified

- The first web-unit run failed because `OriginalReveal` was incorrectly marked as custom domain rendering. Removed that marker instead of expanding the exception allowlist; the UI contract then passed 10/10 and proves the reveal is ordinary chrome composed from approved primitives.
- The production Next build passed. The no-update visual suite passed 12/12, including the new focused Video → `Show original` path, exact transcript-state label, five resulting Outputs, 102-second fixture timing, focus return, and current snapshots at 1200×800, 1024×768, and 390×844.
- Visually inspected all three original-reveal screenshots at native resolution. Desktop and compact keep the finished Video visible beside the before/after sheet; mobile becomes a readable linear sequence with all five Outputs visible.
- All 30 links in the current UI gallery resolve to real screenshot files.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages; worker tests remained 38/38 and web unit tests remained 10/10.
- `pnpm demo:e2e` passed all six recorded gates with two rendered Outputs, six planned image panels, five Storyboard panels, and a local MP4.
- `pnpm submission:build` rebuilt the 12-asset `partial` set with all provider limitations intact; `pnpm submission:verify` returned `valid: true`, `stale: false`, and `tampered: false`.

### Decisions

- The mic-drop reveal belongs on the finished Video, not in primary navigation. This preserves the simple Capture → Map → Brief → Outputs → Storyboard path while making the meta-demo one click away at the exact moment it matters.
- `Show original` is more precise than `How this was built` for the product-facing moment. Commits, logs, model operations, and technical evidence remain a separate provenance concern rather than crowding the emotional before/after reveal.
- The raw-transcript goal remains open. The surface and fixture evidence are implemented, but a dated contemporaneous founder recording and final real footage still must replace the fixture before the submission claim can close.

### Open items

- Capture the dated founder brainstorm and persist its real transcript so the final reveal uses that source rather than the deterministic fixture.
- Complete five independent first-time orientation reviews before recording; repair any critical finding.
- Run and inspect the authorized live GPT-5.6, GPT Image 2, Realtime microphone, and provider narration paths before upgrading their claims.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 01:49 CT — Governing design system reconciled to the shipped interface

**Area:** Product design / canonical language / implementation guardrails

### Changed

- Reconciled root `DESIGN.md` to the locked no-tabs product instead of leaving legacy instructions beneath a simplification preface. Removed conflicting prescriptions for Studio, Library, source rails, raw technical-file views, a host strip, `Generate package`, `Approve map as brief`, and `Approve storyboard & render`.
- Rewrote the surface model and primary screens around the implemented objects and actions: one current object, contextual Sources sheet, editable Map, readable Brief, Style sheet, durable Outputs history, editable Storyboard, `Create video`, exact Source evidence, and the focused Video's `Show original` reveal.
- Corrected the design system's machine-readable contract reference from the nonexistent `apps/web/app/oai-ui-contract.ts` to `packages/ui/src/contract.ts` plus its enforcing web test.
- Aligned the responsive specification with the implemented boundary: spatial Map on desktop and compact widths, semantic review outline at mobile, and no fake miniature whiteboard.
- Replaced unsupported signature motion and crowded technical-state requirements with the actual restrained motion and progressive-disclosure rules.
- Added a deterministic design-document assertion to `oai-ui-contract.test.ts`. It rejects the legacy section names and actions and requires the canonical objects, approvals, evidence actions, and official contract path.

### Verified

- The updated UI contract passed 11/11 unit tests, including the new design-document alignment case.
- Static search found the remaining `FRAME.md` and `DESIGN.md` references only in explicit technical-export boundaries; `host strip` remains only in a prohibition. No legacy action or legacy primary-screen heading remains.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages; worker tests remained 38/38 and web tests increased to 11/11.
- `pnpm demo:e2e` passed all six recorded gates with two rendered Outputs, six planned image panels, five Storyboard panels, and a local MP4.
- `pnpm submission:build` rebuilt the 12-asset `partial` set with provider limitations intact; `pnpm submission:verify` returned `valid: true`, `stale: false`, and `tampered: false`.
- `git diff --check` passed.

### Decisions

- A governing design document may mention technical export names only to keep them out of the primary UI. It may not prescribe them as default product views.
- Design-language consistency is now executable. Future changes that restore the crowded MVP's vocabulary or actions fail the normal workspace test instead of relying on a reviewer to remember the correction.
- The product design lock is stronger, but the independent first-time orientation gate remains open because document and automated checks are not substitutes for five fresh human reviews.

### Open items

- Complete five independent first-time orientation reviews and repair any critical finding before final recording.
- Replace fixture-only image, voice, reasoning, and narration evidence with inspected provider-backed artifacts before upgrading public claims.
- Capture the dated founder brainstorm, Codex doorway footage, representative `/feedback` Session ID, final public video, stable release, and submitted links.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 02:03 CT — Website Style and professional intent became a usable product path

**Area:** Style / website foundation / Intent Profiles / responsive product UI

### Changed

- Rebuilt the Style sheet around two plain choices: `Website` and `Set manually`. Website mode accepts a public URL; manual mode accepts the name and exact accent, text, and background colors without exposing the full brand schema by default.
- Added `Client pitch`, `Board presentation`, and `Team workshop` as visible professional-use choices. The selected Intent Profile now travels through the web route and website-style worker path instead of silently defaulting every website to a client pitch.
- Kept logos, licensed fonts, visual references, and negative rules behind one `Add brand details` or `Edit brand details` disclosure in manual mode. This preserves the implemented brand system without making the common path feel like a configuration form.
- Documented `StyleSetup` as a WorkshopLM composite assembled from the approved SideSheet, ListGroup/ListRow/ListRowAction, Input/TextArea, and Button primitives. No new component primitive or parallel interaction system was added.
- Made completed-fixture visual seeding independent of test order. The seed now creates the approved Brief and manual Style when absent, so completed-route tests no longer rely on an earlier reset test's side effects.
- Added responsive Website Style screenshots and refreshed the manual Style screenshots at 1200×800, 1024×768, and 390×844.

### Verified

- The first complete check exposed six stale duplicate declarations in generated `.next/types` cache files. Removing only those generated duplicates and rebuilding resolved the failure; the production Next build then passed.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages. Worker tests passed 38/38, including website palette extraction, selected board-presentation intent persistence, and the generated token artifact. Web unit tests passed 11/11, including required plain-language Style labels.
- The first no-update visual run exposed an assertion race: it checked the routed POST payload before the browser request reached the test harness. The test now waits for the actual request. The rerun passed 13/13 production-route tests.
- The Website Style route test proves the exact request `{ action: "lockWebsiteStyle", url: "https://example.com/brand", intentProfile: "board_deck" }` and captures Website plus Board presentation as the selected controls at all three widths.
- Visual inspection at all three widths confirmed the manual Style path keeps secondary brand fields collapsed by default and the website path keeps source, URL, intended use, palette, and action in one focused sheet.
- `pnpm demo:e2e` passed all six recorded gates with two rendered Outputs, six planned image panels, five Storyboard panels, and a local MP4.
- `pnpm submission:build` rebuilt the 12-asset Output set as honestly `partial`; `pnpm submission:verify` returned `valid: true`, `stale: false`, and `tampered: false`.

### Decisions

- Intent is a product decision, not hidden metadata. It belongs beside the Style source because changing from a client pitch to a board presentation should change the entire output system.
- Advanced brand inputs remain available but collapsed. This is the simplest UI that preserves the locked professional brand capability without recreating the crowded MVP.
- Provider claims remain unchanged. This increment made Style usable and verified the deterministic seam; it did not run paid OpenAI calls or create provider-backed media.

### Open items

- Complete five independent first-time orientation reviews and repair any critical finding before final recording.
- Replace fixture-only image, voice, reasoning, and narration evidence with inspected provider-backed artifacts before upgrading public claims.
- Capture the dated founder brainstorm, Codex doorway footage, representative `/feedback` Session ID, final public video, stable release, and submitted links.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 02:19 CT — The local render became the finished Video experience

**Area:** Storyboard-to-Video handoff / local worker observation / responsive gallery evidence

### Changed

- Corrected the final Storyboard action. A successfully rendered current Storyboard now offers `View video`; it no longer offers the misleading `Create video` action again.
- Added bounded one-second state refresh while the local worker reports `queued` or `rendering`. The refresh updates Workshop state without replacing the current screen with a loading state and stops automatically when the job reaches a terminal state.
- Added an idempotent completed-fixture seed and a separate real-video seed. The video seed approves the current Storyboard, enqueues the normal render job, runs the actual local worker, and requires a persisted `rendered` state.
- Added six production-route screenshots: rendered Video inside Outputs and the focused Video player at desktop, compact, and mobile widths. The gallery index now links all six.
- Constrained the focused player to its native 16:9 surface. This removed the tall white letterbox inherited from document-style Outputs on mobile while preserving the official surrounding chrome.
- Excluded macOS conflict-copy filenames such as `.next/types/**/* 2.ts` and `* 3.ts` from TypeScript. This makes workspace verification immune to repeated duplicate declarations in generated Next cache files without excluding any product source.

### Verified

- Web lint and 11/11 unit tests passed after adding `View video` to the plain-language contract.
- A focused production-route test proved `Create video` returns a queued state, the browser refreshes it into `rendered`, and `View video` appears without a manual reload.
- The full production-route suite rebuilt Next and passed 15/15 tests. The final test ran the actual local FFmpeg/HyperFrames worker, required the served MP4 to reach browser media-ready state, sought a deterministic real frame, proved the Video card and focused player, and captured both states at 1200×800, 1024×768, and 390×844.
- Native-resolution inspection confirmed the real rendered frame is visible in the gallery and focused player; the mobile player now occupies one compact 16:9 surface with `Show original` and `Open` visible above it.
- The first direct Playwright attempt failed because it started a stale `.next` build without rebuilding. The build-before-Playwright path repaired that setup error. A later full workspace check exposed repeated generated `… 2.ts` declarations; the targeted TypeScript exclusion passed while those duplicate files were still present, proving the fix rather than relying on manual deletion.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages; worker tests remained 38/38 and web unit tests remained 11/11.
- `pnpm demo:e2e` passed all six recorded gates with two rendered source-traceable Outputs, six planned image panels, five Storyboard panels, and a local MP4.
- `pnpm submission:build` rebuilt the 12-asset Output set as honestly `partial`; `pnpm submission:verify` returned `valid: true`, `stale: false`, and `tampered: false`.

### Decisions

- Completion is a new product state, not a reason to repeat the creation action. The next action after render is to view the finished Video.
- The browser may observe local worker state, but it must not add a generic job dashboard, permanent progress rail, or manual refresh control to the happy path.
- The visual Outputs-gallery objective remains open because the image set still contains planned panels rather than GPT Image 2 bytes. This milestone proves the real local Video preview only and does not upgrade provider claims.

### Open items

- Complete five independent first-time orientation reviews and repair any critical finding before final recording.
- Replace the planned image tiles with inspected GPT Image 2 bytes and complete the gallery objective.
- Capture and inspect authorized live GPT-5.6 reasoning, one Realtime microphone turn, and provider narration before upgrading public claims.
- Capture the dated founder brainstorm, Codex doorway footage, representative `/feedback` Session ID, final public video, stable release, and submitted links.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 02:41 CT — Five-second orientation passed with artifact-specific Output grounding

**Area:** Independent orientation review / focused Output provenance / responsive product UI

### Changed

- Ran five independent cold screenshot reviews against Map, Brief, Outputs, Storyboard, Sources, focused Output, and focused Video at desktop, compact, and mobile widths. Review tasks received no product specification or implementation context before applying the five-second `current object / source scope / next action` rubric.
- Corrected the one repeated material finding: a presentation that showed `2 sources` in Outputs incorrectly reverted to the Workshop-wide `3 sources` badge when opened. The focused viewer and global source trigger now both preserve the artifact-specific count.
- Added a visible focused-Output title plus type, version, and source count. `Show source` is now the one dominant action; the secondary external action says `Open file` or `Open video` instead of the ambiguous `Open`.
- Stacked focused-Output context and actions on mobile so the full title and metadata remain readable without competing for one narrow header row.
- Added production-route assertions for the exact `Presentation · Version 1 · 2 sources` metadata, matching `2 sources` trigger, dominant source action, and explicit external-file action.

### Verified

- The first review round consistently passed Map, Brief, and the main Outputs flow and exposed the list/detail source-count contradiction. After the correction, five independent post-fix reviews passed every required surface with zero actual critical navigation failures.
- Two review renderers initially displayed corrupted Storyboard header text. Native PNG OCR returned `WorkshopLM Build Week / Storyboard`, `3 sources`, and `Approve storyboard` at desktop, compact, and mobile widths; the Playwright DOM also exposes the exact approval action. The reviewers amended those failures after inspecting the actual PNG pixels. No product change was made for a review-tool artifact.
- The Codex in-app Browser plugin was unavailable on this surface, so the documented Playwright fallback was used. The production Next route rebuilt successfully and the full visual suite passed 15/15, including real local video rendering and responsive focused viewers.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages; worker tests remained 38/38 and web tests remained 11/11.
- `pnpm demo:e2e` passed the six recorded gates with two source-traceable rendered Outputs, six planned image panels, five Storyboard panels, and a local MP4.
- `pnpm submission:build` rebuilt the 12-asset Output set as honestly `partial`; `pnpm submission:verify` returned `valid: true`, `stale: false`, and `tampered: false`.
- The first snapshot-refresh command passed an extra argument separator and therefore did not update the changed baseline. A direct Playwright refresh then passed. A later refresh started from a stale `.next` server and repeatedly missed generated chunks; rebuilding Next before the final Playwright run repaired the setup failure.

### Decisions

- Workshop scope and Output scope are different facts. The Workshop-wide count remains correct in Map, Brief, and Outputs; a focused artifact must show only the sources that actually support that artifact.
- A focused Output is an evidence-review surface. `Show source` outranks opening the generated file, while the external action names what it opens.
- Independent review findings remain evidence only after checking the underlying artifact. A renderer-induced text mask is not promoted into a product defect when native pixels, OCR, and DOM evidence contradict it.

### Open items

- Replace the planned image tiles with inspected GPT Image 2 bytes and complete the visual Outputs-gallery objective.
- Capture and inspect authorized live GPT-5.6 reasoning, one Realtime microphone turn, and provider narration before upgrading public claims.
- Capture the dated founder brainstorm, Codex doorway footage, representative `/feedback` Session ID, final public video, stable release, and submitted links.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 02:52 CT — Paid provider paths gained enforceable request ceilings

**Area:** Live-provider safety / GPT-5.6 benchmark / live operator authorization

### Changed

- Added a concurrency-safe provider request budget shared by the live operator's GPT-5.6 Map, GPT Image 2 batch, and narration calls. It reserves each request before dispatch, counts failed attempts, and refuses the next call once the ceiling is reached.
- Required `WORKSHOPLM_MAX_PAID_REQUESTS` for live execution. The thought-to-delivery run needs an explicit ceiling of at least twelve: one Map, six images, and five narration clips.
- Applied the same fail-closed rule to the separate GPT-5.6 routing benchmark. It needs an explicit ceiling of at least nine for three cases across Sol, Terra, and Luna, then records used and allowed requests in its artifact.
- Updated the no-spend operator plan to distinguish its twelve planned requests from the separate nine-request benchmark and print the exact authorized command.
- Added `docs/planning/2026-07-15-live-provider-authorization.md` with the two commands, the external dollar-budget boundary, artifact inspection gate, and partial-run behavior.

### Verified

- Worker lint passed and worker tests increased from 38/38 to 41/41. New tests prove successful and failed calls both consume budget, concurrent calls cannot race beyond the ceiling, and invalid ceilings fail before a provider client is used.
- AI lint and tests passed. The benchmark accepts ceiling nine and rejects missing or lower ceilings in deterministic tests.
- Live-command probes with a non-credential test string and either no ceiling or ceiling eleven refused before making any provider request. Benchmark probes likewise refused with no ceiling or ceiling eight.
- `pnpm demo:live` completed the isolated preflight with `paidCallsMade: false`, one planned Map request, six planned image requests, five planned narration requests, and the exact ceiling-12 next command.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages; web tests remained 11/11 and worker tests remained 41/41.
- `pnpm demo:e2e` passed all six recorded gates with two rendered Outputs, six planned image panels, five Storyboard panels, and a local MP4.

### Decisions

- Request ceilings are an application safety boundary, not a dollar estimate. Authorization still requires setting and checking an OpenAI project budget against current official pricing.
- The benchmark and live production run have separate ceilings and artifacts. Running one never silently authorizes the other.
- No paid OpenAI request was made in this increment, and no live-provider claim changed.

### Open items

- Obtain explicit provider-spend authorization and an external project budget before running either command.
- Run and inspect the nine-request benchmark before changing the operation routing defaults.
- Run and inspect the twelve-request live operator path before upgrading GPT-5.6, GPT Image 2, narration, or final-video claims.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 03:00 CT — Partial provider runs gained state-preserving selective retry

**Area:** Live-provider recovery / narration persistence / spend protection

### Changed

- Persist successful `gpt-4o-mini-tts` WAV files, hashes, request IDs, and panel provenance even when another narration request fails. Partial narration remains explicitly stale and records the failed panel and sanitized error until every current Storyboard panel is complete.
- Added one retry planner over the persisted Workshop state. It selects only image panels without generated bytes and Storyboard panels without current narration, then computes the exact number of remaining provider requests.
- Replaced the ambiguous live-operator `--keep` behavior with `--retry-failed`. Retry mode requires an existing operator database, never recreates the Workshop or re-ingests sources, skips the completed GPT-5.6 Map, preserves successful media, and renders locally without an API key when no provider request remains.
- Made the retired `--keep` flag fail closed because its prior setup behavior could duplicate sources and successful paid work.
- Expanded the provider authorization runbook with a zero-spend retry preflight and the exact authorized retry command.

### Verified

- Worker tests increased from 41/41 to 42/42. A forced third-panel speech failure preserved the other four clips; retry made one request for the missing panel, retained every prior hash, cleared the failure, and completed the five-panel narration set.
- The image adapter test now forces one of six image requests to fail, proves five generated panels persist, retries only the failed panel, and proves the other five hashes remain unchanged.
- `pnpm demo:live` returned the unchanged twelve-request zero-spend plan. `pnpm demo:live -- --retry-failed` read the same persisted Workshop without rebuilding it and returned an eleven-request plan for the six planned images plus five missing narration panels, with zero GPT-5.6 requests.
- The retired `pnpm demo:live -- --keep` path refused before setup. A retry execution probe with a ceiling of ten refused before any provider client could run because the persisted state required eleven requests.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages; web tests remained 11/11 and worker tests passed 42/42.
- `pnpm demo:e2e` passed all six recorded gates with two source-traceable Outputs, six planned image panels, five Storyboard panels, and a local MP4. `git diff --check` passed.
- No paid OpenAI request was made, and no provider-backed product or submission claim changed.

### Decisions

- Partial provider success is durable work, not a failed batch to discard. Retry budgets are derived from missing panels rather than the original twelve-request plan.
- A failed initial GPT-5.6 Map has no downstream provider artifacts to preserve; record that failed request and rerun the normal clean operator path. Selective retry begins after the live Workshop has reached its approved media plan.
- Partial narration is stored as `stale: true`, so the renderer and submission package continue to reject it as finished provider narration until all current panels exist.

### Open items

- Obtain explicit provider-spend authorization and an external project budget before running the benchmark or live operator.
- Run and inspect the nine-request benchmark, then run and inspect the provider-backed thought-to-delivery path. Use the retry preflight if either media stage is partial.
- Capture and inspect one Realtime microphone turn before upgrading the voice-capture claim.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 03:08 CT — Live attempts gained durable terminal evidence

**Area:** Provider-run audit trail / recovery evidence / failure classification

### Changed

- Added `.workshoplm/live-operator-run.json` as the terminal evidence artifact for every authorized live attempt. It begins as `running` only after the operator root exists and ends as `passed`, `partial`, or `failed`.
- Passed records include start/end timestamps, request usage, GPT-5.6 run provenance, image and narration hashes/request IDs, and final video state. Partial and failed records additionally include the failed stage, sanitized error, panel-level failures, selected retry scope, and exact recovery command.
- Kept the terminal record outside `.workshoplm/live-operator/`, so the normal preflight reset cannot erase evidence from the previous authorized attempt.
- Extracted error redaction, recovery-command calculation, failure classification, and state summarization into a deterministic worker module shared by the operator and tests.
- Updated the provider authorization runbook and current Goal evidence to name the terminal artifact and its reset boundary.

### Verified

- New tests prove API keys and bearer credentials are removed from stored errors and error text is bounded to 500 characters.
- A deterministic partial state with one completed image, one failed image, one completed narration clip, and one failed narration clip produced `partial`, retained both successful request IDs and hashes, exposed both failures, and calculated exactly nine remaining provider requests. The same state classifies a local video-stage failure as `failed`, not provider-partial.
- An unprepared Workshop state produces the clean twelve-request command rather than an invalid selective retry.
- `pnpm demo:live` still passed its zero-spend preflight with one planned Map, six planned images, five planned narration clips, both approvals, two traced Outputs, and `paidCallsMade: false`.
- `pnpm check` passed across all 13 packages; worker coverage increased from 42/42 to 45/45 and web tests remained 11/11.
- `pnpm demo:e2e` passed all six recorded gates with two grounded Outputs, six planned images, five Storyboard panels, and a local MP4. `git diff --check` passed.
- No paid OpenAI request was made, so no actual terminal live-run artifact or provider-backed claim is asserted yet.

### Decisions

- A command exiting nonzero is insufficient evidence for a paid run. The run artifact must preserve what completed, what failed, how much of the authorized request ceiling was consumed, and the smallest safe continuation.
- Pre-authorization refusal does not create a run record because no provider attempt started. Once the authorized operator root is initialized, every exit path records a terminal state.
- Local video failure after complete provider media is classified `failed`; partial is reserved for a provider media stage that leaves usable successful panels alongside missing work.

### Open items

- Obtain explicit provider-spend authorization and run the benchmark and live thought-to-delivery path; inspect the resulting terminal record together with the media.
- Capture and inspect one Realtime microphone turn before upgrading the voice claim.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 03:23 CT — Provider authorization gained a dated dollar envelope

**Area:** Official pricing evidence / paid-run boundary / narration preflight

### Changed

- Added `docs/planning/2026-07-15-provider-cost-envelope.md` with the current official GPT-5.6, GPT Image 2, and Realtime rates, exact WorkshopLM request and output-token boundaries, conservative fixture calculations, the public TTS-pricing gap, and a concrete authorization statement.
- Replaced the authorization runbook's vague `set the desired dollar limit` instruction with a $5 project budget-or-alert recommendation, nine benchmark requests, twelve initial live-operator requests, one capture-only Realtime turn capped at 60 seconds, and separately authorized retries.
- Added a fail-closed 4,096-character narration boundary from the current Speech API reference. An oversized Storyboard panel is rejected before output-directory creation or provider dispatch.

### Verified

- OpenAI's current standard pricing lists GPT-5.6 Sol/Terra/Luna at $5/$2.50/$1 input and $30/$15/$6 output per 1M short-context tokens; GPT Image 2 at $5 per 1M text-input tokens and $30 per 1M image-output tokens; and `gpt-realtime-whisper` at $0.017 per minute.
- The current image calculator lists a medium 1024×1024 GPT Image 2 output at $0.053, making the six-image output estimate $0.318 before small text-prompt charges.
- A deterministic calculation over the checked-in benchmark fixture proved 747 prompt characters and 620 maximum output tokens per model. The maximum output portion is $0.03162; treating every prompt character as an input token gives a conservative $0.0063495 input estimate and a combined estimate below $0.04.
- The current pricing page contains no `gpt-4o-mini-tts` or `tts-1` rate. The model page documents a 2,000-token input maximum and the Speech API reference documents a 4,096-character request maximum, so the cost document records the dollar rate as unknown instead of treating it as zero.
- Worker tests increased from 45/45 to 46/46. The new test creates an approved oversized Storyboard and proves narration refuses with zero fetch calls.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages; web tests remained 11/11 and worker tests passed 46/46.
- `pnpm demo:e2e` passed all six recorded gates with two grounded rendered Outputs, six planned image panels, five Storyboard panels, and a local MP4. `git diff --check` passed.
- No paid provider request was made.

### Decisions

- The $5 project setting is an intentionally generous operating envelope for the known sub-$1 initial path plus the unpublished TTS component. It is not represented as an application-enforced or platform-guaranteed hard cutoff.
- Explicit request ceilings remain the hard WorkshopLM spend boundary. A retry never inherits unused initial authorization; it receives a new exact ceiling after the zero-spend retry preflight.
- Pricing evidence is dated because provider rates can change. Recheck the official pages before any later run.

### Open items

- Obtain explicit provider-spend authorization matching the runbook statement before running the nine-request benchmark, twelve-request live operator, or one-minute Realtime capture.
- Inspect benchmark routing evidence before changing GPT-5.6 defaults, then inspect the live Map, six images, five narration clips, terminal run record, and narrated MP4 before upgrading claims.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 03:33 CT — The full fixture walkthrough became repeatable film evidence

**Area:** Demo capture / editorial proof / meta-demo recording loop

### Changed

- Added `pnpm demo:capture-draft`, which resets an isolated sanitized data root, production-builds the web app, and records the real browser flow at 1200×800 without touching Daniel's working data.
- Recorded twelve timed beats in one continuous path: editable grounded Map, source scope, exact source trace, semantic edit, Brief approval, Style intent, Output creation, Output evidence, Storyboard edit, Storyboard approval, local video render, and the original-brainstorm reveal.
- Added a stable WebM, contact sheet, final reveal frame, and machine-readable manifest containing hashes, stream metadata, final gate state, beat timings, and four explicit limitations.
- Documented the capture command and replacement boundary in `submission/DEMO-SCRIPT.md` so later provider-backed recording changes only the shots whose evidence gates have actually changed.

### Verified

- `pnpm demo:capture-draft` passed against a production Next build and produced a 37.76-second VP8 WebM at 1200×800 with twelve recorded beats.
- The manifest records both approvals as persisted, the video state as `rendered`, four active sources, two Outputs, six image panels, and five Storyboard panels.
- The video SHA-256 is `26c898f24bc0b643225e6abac69483d958b609a31200504e9797d57c3d7be8f7`; the contact sheet is `a07f04aa7131b044c2cd6dcd9f18a5fb0c12ffbcf88c75edc817e0200800ab94`; and the final reveal frame is `7e5cf63c81a9d9ba3ef406d95f5f603cfd2490f691ec144f9829cf040385f30f`.
- Visual inspection of the contact sheet confirmed the sequence remains legible across Map, Sources, Brief, Outputs, Storyboard, and render states. The final frame keeps the rendered video visible beside the honestly labeled original transcript and its five resulting Outputs.
- The first capture attempt correctly failed on a stale source label; the second exposed an unreliable hidden-text assertion after Map save. The final capture uses the current visible label and proves the persisted semantic edit through the Workshop API before continuing.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages; web tests remained 11/11 and worker tests remained 46/46.
- `pnpm demo:e2e` passed all six recorded gates with two source-traceable Outputs, six planned image panels, five Storyboard panels, and a local MP4.
- No paid provider request was made.

### Decisions

- This artifact is a screen-only editorial draft, not the public submission video. It must not be used to claim live GPT Image 2, provider narration, Realtime capture, or a native ChatGPT integration.
- The deterministic fixture remains valuable because it proves the film's complete interaction grammar before scarce live media and founder footage are introduced.
- The real Codex/plugin doorway stays a separate host-surface shot; the automated browser capture does not simulate it.

### Open items

- Obtain provider authorization, run and inspect the live Map/image/narration path, and recapture only the affected media beats.
- Record the dated founder brainstorm, the real Codex doorway, final narration, and the edited public video under three minutes.
- Capture the required `/feedback` Session ID from a surface that exposes it; it remains unavailable here and is not inferred.

---

## 2026-07-15 03:42 CT — The final film gained an evidence-gated paper edit

**Area:** Demo editorial architecture / claim gating / final-export verification

### Changed

- Added `submission/demo-film-plan.json` as the machine-readable 2:42 paper edit: ten contiguous shots, 291 narration words, every required judge moment, all twelve recorded fixture beats, and the exact external inputs still needed.
- Added `pnpm demo:film:verify` to validate timeline continuity, runtime below the 2:55 internal ceiling, narration density, public title/thumbnail trademark hygiene, source-footage hashes, required moments, declared shot state, and missing evidence.
- Added `pnpm demo:film:verify-final` as a fail-closed publication gate. It additionally requires a `final` plan, no blocked shots or missing evidence, and an edited MP4 with both video and audio streams inside the runtime ceiling.
- Added deterministic edit-readiness JSON and Markdown reports under `outputs/demo-film-plan/` and documented the replacement workflow in the public demo script.

### Verified

- The first verifier run exposed only 157 narration words across 2:42, an editorial pace of 58 words per minute. The plan was rewritten and the verifier now enforces a 100–155 words-per-minute window; the current 291-word script passes at 107.8 words per minute.
- Draft verification passed all timeline, pacing, trademark, required-moment, capture-beat, and source-hash checks. It maps twelve fixture beats into ten shots and reports five ready shots, five blocked shots, and ten exact missing evidence files including the final export.
- Two consecutive draft runs produced identical report hashes: `9fa5eec793cc2959f1c47a84a0e02b308706f1618bc758d1cb637b69a6bd584b` for JSON and `a5d46cff8565dd038322a41b581746c333686ce2c53be41407a021515abb6e5c` for Markdown.
- Final-mode verification exited 1 as designed and named five blocked shots and ten missing evidence files. It did not convert a valid fixture walkthrough into a false final-video claim.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages; web tests remained 11/11 and worker tests remained 46/46.
- `pnpm demo:e2e` passed all six recorded gates with two source-traceable Outputs, six planned image panels, five Storyboard panels, and a local MP4. `git diff --check` passed.
- No paid provider request was made.

### Decisions

- The final film is an evidence assembly problem, not an informal editing checklist. Every provider, founder, host, and Codex shot now has a named intake path and cannot become ready merely through copy changes.
- The film target remains 2:42 with a 2:55 hard internal ceiling, leaving five seconds of platform-encoding safety below the public three-minute rule.
- The narration now names Realtime, GPT-5.6, GPT Image 2, OpenAI voice, HyperFrames, and Codex only inside shots that remain blocked until their matching evidence exists.

### Open items

- Supply and inspect the ten named evidence inputs, update the five blocked shots only after those files exist, assemble the final MP4, and pass `pnpm demo:film:verify-final`.
- The provider-spend, founder recording, host footage, and `/feedback` Session ID gates remain open; no unsupported claim was upgraded.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 03:58 CT — Website Style became reviewable before it becomes truth

**Area:** Style extraction / progressive disclosure / `DESIGN.md` fidelity

### Changed

- Replaced the one-step website Style lock with `Review style` followed by `Use this style`. Analysis no longer mutates Workshop state; only the values the user reviewed and corrected become the website-sourced Style and versioned `DESIGN.md` tokens.
- Expanded extraction from one HTML hex scan to the page plus up to four linked public stylesheets. The analyzer resolves exact color candidates and roles, font-family candidates, logo/icon asset URLs, the page title, and the canonical reference URL.
- Kept the additional controls inside the existing Style sheet. Before analysis, the website path shows only URL, Intent Profile, and one `Review style` action. After analysis, it reveals editable name and colors plus one collapsed `Review brand details` control for assets, font licensing, references, and negative rules.
- Revalidated every redirect and linked stylesheet against the existing private-network boundary before fetching. Automatic review uses manual redirects and rejects local-network destinations.
- Added plain recovery copy for public sites that reject server-side analysis: try another public page or set the Style manually.

### Verified

- A deterministic page-plus-stylesheet test extracted `#2457D6`, `#102030`, `#FAF8F4`, `Studio Sans`, and an absolute logo URL; a reviewed accent edit to `#335577` was the value persisted in both Style state and tokens. Locking the reviewed result performed no second website fetch.
- A redirect test proved a public URL cannot redirect the analyzer to `127.0.0.1`. Worker coverage increased from 46/46 to 47/47.
- A live no-spend analysis of `https://www.w3.org/` succeeded across three linked stylesheets and found 29 colors, six font candidates, and five brand assets. `https://openai.com` returned HTTP 403 to the local server fetch and produced the intended plain fallback instruction rather than a false extraction.
- The website review path passed at 1200×800, 1024×768, and 390×844 with replacement visual baselines. Visual inspection confirmed the official SideSheet/ListRow/Input/Button language remains intact and the reviewed fields stay scrollable on mobile.
- The full production-route browser suite passed 15/15, including reduced motion, contrast, 200 percent logical zoom, output history, source coverage, video refresh, and the completed desktop/compact/mobile judge path.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages; web contract/unit tests remained 11/11. `pnpm demo:e2e`, `pnpm demo:film:verify`, and `git diff --check` passed.
- `pnpm submission:verify` first failed because the acceptance reset had removed its generated manifest. `pnpm submission:build` regenerated the honestly `partial` 12-asset set, after which verification passed with `valid: true`, `stale: false`, `tampered: false`, and no issues.
- No paid provider request was made.

### Decisions

- Website extraction is a suggestion, never automatic brand truth. Font candidates are explicitly presented for license confirmation before persistence.
- A site that blocks automated fetch remains a recoverable product state, not a reason to bypass its controls or pretend a fallback palette came from that site.
- The two approval gates remain unchanged. `Review style` is corrective setup, not a third blocking approval.

### Open items

- Provider-backed GPT Image 2 media remains the only open visual Output in the main product seam; website review does not upgrade any provider claim.
- Final provider, founder, host, Session ID, and public-video evidence remains open under the film verifier.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 04:07 CT — Image coherence changed from metadata to a real shared input

**Area:** GPT Image 2 integration / visual consistency / provider preflight

### Changed

- Replaced six independent production image-generation requests with six image-edit requests that all receive the same style-specific 512×512 PNG reference board.
- Bound the batch to an inspectable coherence contract: locked palette, composition, texture, image treatment, negative rules, Visual DNA version, sibling panel order, reference path, and reference SHA-256.
- Expanded each panel prompt into one continuous six-panel professional sequence and persisted the shared reference ID in every generated panel's provider provenance.
- Added a fail-closed preflight that blocks all provider dispatch when the reference is missing or altered, panel IDs drift, sibling order changes, references disagree, or the approved Visual DNA version no longer matches.
- Kept selective regeneration on the same contract and same reference bytes, preserving successful siblings rather than silently starting a new art direction.

### Verified

- Worker tests passed 48/48, including six multipart `/v1/images/edits` requests with identical nontrivial reference bytes, shared palette direction, panel provenance, partial-failure retry preservation, and a tampered-reference test that made zero provider calls.
- Worker typecheck and `git diff --check` passed.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages; web tests remained 11/11.
- `pnpm demo:e2e` passed all six recorded gates with six planned image panels and the local rendered MP4.
- The recorded acceptance run wrote a valid 512×512 RGBA PNG at `.workshoplm/acceptance/generated/references/style-v1.png`; its SHA-256 was `8b5c25bdaddc018758d30b573f49a5735056d87f949fb58db4db750859bb922d`.
- `pnpm demo:film:verify` remained honestly in draft mode with five ready shots, five blocked shots, and the provider gallery still named as missing evidence.
- No paid provider request was made.

### Decisions

- A database `referenceId` alone is not a coherence mechanism. Production now supplies actual shared visual bytes plus the same direction to every panel.
- Deterministic checks prove contract continuity, not aesthetic quality. The Deliver checkbox remains open until the six GPT Image 2 results are inspected together.
- The re-supplied six-phase submission sequence remains a deferred planning input in `docs/planning/2026-07-14-submission-sequence-rough.md`; it does not replace the active runbook or block safe pre-spend work.

### Open items

- After explicit spend authorization, run the provider-backed six-image batch, inspect palette, lighting, composition, subject continuity, and obvious defects as one contact sheet, then selectively regenerate only failed panels if needed.
- Provider narration, Realtime microphone evidence, founder recording, host footage, Session ID, and final public film remain open under the existing evidence gates.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 04:16 CT — All five deliverables became one quiet Output gallery

**Area:** Product UX / Outputs / responsive visual review

### Changed

- Replaced the mixed Outputs composition—primary presentation cards followed by separate image and Storyboard carousels—with one responsive official media-card grid for Presentation, Infographic, Image set, Storyboard, and Video.
- Added compact contact-sheet and storyboard previews inside those cards while keeping provider-planned images explicitly labeled.
- Made Image set a first-class focused object. Opening it shows six panels in a three-column desktop or two-column compact/mobile review grid, one `Show source` action, honest per-panel state, and a direct file link only when genuine image bytes exist.
- Kept Storyboard's existing editor as its focused object and routed the new Storyboard card directly there. No tab, drawer, or persistent navigation layer was added.
- Added `image-review-grid` to the explicit domain-surface exception list while retaining official FullScreen, NavigationHeader, EntityCardAction, Button, status text, and spacing/color primitives around it.

### Verified

- The production-route visual suite passed 15/15 at 1200×800, 1024×768, and 390×844, including the complete judge path, partial and needs-update states, keyboard behavior, reduced motion, contrast, and 200 percent logical zoom.
- New image-review baselines were rendered and visually inspected at all three widths. Their SHA-256 values are `2b9263aa6ebc7d87c7deb017e49ca3feb311041043d3e7e755d289325dedffd7` (desktop), `f1639f5ca706e97ba6d44992e03a8525329e0530fd0cb788c1503eda87140656` (compact), and `2dc146853a7b9970692f75a699b6d439dc5f79cd1fd66f0ddb0f497f55caa850` (mobile).
- Visual inspection confirmed one gallery hierarchy, legible card previews, an uncluttered six-up desktop review, and a usable two-column mobile review with no horizontal overflow.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages; web contract/unit tests remained 11/11 and the UI contract remained 3/3.
- `pnpm demo:e2e` passed the recorded six-gate seam. `pnpm demo:film:verify` remained correctly in draft mode because the provider gallery footage is still missing.
- No paid provider request was made.

### Decisions

- Output type should not determine visual importance. Every promised deliverable now starts from the same gallery hierarchy and opens its own focused review surface.
- The focused image review is a domain surface grounded inside official media-card and control primitives; it is not a new reusable shell family or an exception for ordinary controls.
- Planned panels remain visibly planned. A polished empty contact sheet does not count as real GPT Image 2 preview evidence.

### Open items

- Run and inspect the authorized GPT Image 2 batch, then capture the same gallery and focused review with real provider bytes before closing visual completion.
- Provider narration, Realtime microphone evidence, founder recording, host footage, Session ID, and final public film remain open under the existing evidence gates.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 04:35 CT — Storyboard approval now pins the exact video images

**Area:** Storyboard / image versions / HyperFrames handoff / live operator

### Changed

- Added image-panel ID and version bindings to generated Storyboard panels. The Storyboard filmstrip, selected-panel review, and HyperFrames composition now resolve the same generated image version.
- Made version-changing image regeneration revoke Storyboard approval, stale only the affected bound panel path, stale narration, and block video until the Storyboard is current and approved again.
- Staged the exact bound image bytes into the local HyperFrames render directory; the disclosed style preview remains only for a panel without generated bound media.
- Corrected the live-provider sequence so the no-spend preflight leaves the Storyboard `Ready for review`, all image requests finish before the operator crosses Storyboard approval, and narration stays blocked until approval.
- Kept partial image recovery state-preserving: retry planning now accepts a current unapproved Storyboard so a failed image request can be retried before approval without regenerating successful siblings.

### Verified

- Domain tests passed 13/13; worker tests passed 51/51, including exact binding, approval revocation, staged-byte equality, and pre-approval selective retry.
- `pnpm demo:live` passed with `paidCallsMade: false`, Brief approval true, Storyboard approval false, six planned image requests, five planned narration requests, and no provider call.
- The production visual suite passed 16/16 after making the image-bound Storyboard fixture independent of prior serial-test state. The inspected 1200×800 review shows five panels, `Ready for review`, the bound visual, and one `Approve storyboard` action; its SHA-256 is `7d26f0a6b492ec60a86ef45f6e94e89709e7c592441faf9051608ee01345bf77`.
- `pnpm check` passed across all 13 packages. `pnpm demo:e2e` passed the six recorded gates and local video artifact. `pnpm demo:film:verify` remained honestly `draft` with five ready shots, five blocked shots, and the same ten missing live/final evidence inputs. `git diff --check` passed.
- No paid provider request was made.

### Decisions

- Storyboard approval is a versioned production boundary, not a text-only flag: the images reviewed at approval are the images eligible for video.
- A provider image failure occurs before Storyboard approval in the live operator. Successful image bytes and provenance remain intact; retry finishes the visual set before narration or render can begin.
- The deterministic style preview remains useful for the recorded fixture but does not count as GPT Image 2 output or provider-backed video evidence.

### Open items

- Generate and inspect the authorized six-image GPT Image 2 set, then verify the live Storyboard and narrated HyperFrames output use those exact hashes before closing the provider image/video gates.
- Realtime microphone evidence, founder recording, host footage, primary Session ID, final edit, public upload, and Devpost submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 04:48 CT — Grounding now survives every Storyboard scene and the rendered Video

**Area:** Citation integrity / Storyboard / video provenance / submission evidence

### Changed

- Replaced copied Storyboard locator text as the only evidence with durable per-panel references containing claim ID, source ID, chunk ID, and locator. The asset plan distributes those references into every generated panel and keeps its aggregate claim set exact.
- Made Storyboard approval fail closed when a panel has no source reference, names an inactive or missing source, mismatches a chunk or claim to its source, or lets its `claimIds` drift from its evidence references.
- Routed Storyboard `Show source` through the selected panel's stored source ID instead of the generic first Source.
- Added a render-time `workshoplm-demo.provenance.json` sidecar. Every timed scene records its approved panel, claim IDs, exact source locator and excerpt, bound image ID/version/hash when present, and narration hash/model/voice when present; the Video entry records the content-addressed MP4 hash and byte count.
- Added the unchanged sidecar to the traced submission Output set as `VIDEO-PROVENANCE.json`, included source locators in `STORYBOARD.md`, and raised the honest recorded package from 12 to 13 assets.

### Verified

- Domain tests passed 13/13. Worker tests passed 52/52, including grounding-integrity rejection, render-sidecar contents, sidecar packaging, and manifest verification.
- The production browser suite passed 16/16. At desktop, compact, and mobile widths, selecting Storyboard panel 2 and `Show source` opened `Build Week brief` at `Build notes · §2`, proving panel-specific routing.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages. `pnpm demo:e2e` passed the six recorded gates and wrote the provenance sidecar beside the local MP4.
- The acceptance sidecar records claim `claim-c8c19f7b70c2-0-1` → chunk `chunk-c8c19f7b70c2-1` → source `source-c8c19f7b70c2` → `Sanitized fixture · chunk 01` for every scene. Its SHA-256 is `312873dd7b02c889ca3e2de97c25ded50073283151a6d87fb617a1b24ff0a53a`.
- `pnpm submission:build` produced a 13-asset honestly `partial` Output set; `pnpm submission:verify` reported `valid: true`, `stale: false`, `tampered: false`. The copied Video provenance file retained the exact same SHA-256.
- `pnpm demo:film:verify` remained honestly `draft` with five ready shots, five blocked shots, and ten missing live/final evidence inputs. `git diff --check` passed. No paid provider request was made.

### Decisions

- Citation text is a view, not the provenance contract. Approval and rendering now depend on durable IDs that can be resolved back to the exact active Source.
- Compatible domain-contract correction: `StoryboardPanel` now requires at least one evidence reference and exact agreement between `claimIds` and evidence claim IDs. Blast radius was limited to the domain fixture, recorded E2E fixture, persisted-state hydration, asset-plan/Storyboard generation, approval validation, and renderer/submission consumers; all dependent tests landed together.
- The focused Video keeps its simple `Show original` meta-demo action. Detailed per-scene evidence travels in the technical sidecar and submission manifest, avoiding another primary control while preserving the full audit path.
- Fixture evidence proves referential integrity and packaging, not live GPT-5.6, GPT Image 2, Realtime, or TTS use.

### Open items

- Run the authorized live provider path and verify the same sidecar contains real image and narration hashes before closing the provider-backed Video evidence gate.
- Founder recording, Realtime microphone proof, host footage, primary Session ID, final edit, public upload, and Devpost submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 05:07 CT — Video history is immutable and dependency-aware

**Area:** Video persistence / stale propagation / Outputs UX / submission trace

### Changed

- Replaced the fixed-file-only Video state with append-only persisted `video-vN` records. Each successful local render now owns an immutable MP4, provenance sidecar, Storyboard and Style versions, optional Visual DNA and image-batch inputs, claim set, content-addressed artifact path, SHA-256, byte count, and creation time.
- Kept `generated/workshoplm-demo.mp4` and its provenance sidecar as compatibility copies while making the version-specific files authoritative. The canonical `video` artifact route resolves only the latest current version; historical `video-vN` routes continue to resolve their original bytes after upstream changes.
- Made source-scope, Map, Style, Storyboard, bound-image, and narration invalidation mark every prior Video version `Needs update` without deleting it. A new render stales the previous current version and appends the next version.
- Added Video version cards to the existing Outputs grid and selected-version detail to the existing focused player. A first render still appears as one normal peer Output; history adds no tab, rail, or permanent navigation.
- Made submission packaging select the current immutable Video record, include its ID in the input snapshot, fingerprint Video history, and refuse a Video whose Storyboard, Style, or image-batch inputs do not match the current approved Workshop.
- Captured the founder-supplied six-phase closeout sequence at `research/2026-07-15-proposed-six-phase-closeout.md` as an explicitly unratified planning reference. It does not replace `GOAL.md` or the active execution runbook.

### Verified

- Worker tests passed 53/53, including a two-render regression proving `video-v1` remains byte-identical and addressable after `video-v2` becomes current.
- The production browser suite passed all 17 tests with no failed visual baselines. A dedicated history test proves Version 2 is current, Version 1 remains visible as `Needs update`, and the historical focused player requests `/api/workshop/artifacts/video-v1`.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages. `pnpm demo:e2e` passed all six recorded gates and persisted one current immutable Video record.
- `pnpm submission:build` produced the 13-asset honestly `partial` package from the version-specific Video and provenance paths; `pnpm submission:verify` reported `valid: true`, `stale: false`, `tampered: false`.
- `pnpm demo:film:verify` remained honestly `draft`: five ready shots, five blocked shots, and the same ten missing live/final evidence inputs. `git diff --check` passed. No paid provider request was made.

### Decisions

- Compatibility aliases are conveniences, not identity. A Video version is the immutable persisted record plus its version-specific media and provenance files.
- Historical Video versions remain user-visible only after history exists. This preserves the one-object, no-tabs interface while satisfying the product promise that approved work is never silently overwritten.
- Compatible domain-contract addition: `WorkshopState` now includes `videos`; older persisted states hydrate it as an empty array. Blast radius was limited to worker persistence/rendering, artifact resolution, submission packaging, live/recorded operators, the Outputs/focused Video views, and their tests. Existing plugin doorway state remains unchanged.
- The proposed six-phase closeout plan remains a reference because its Phase 1 assumes founder-authorized provider spend and strictly sequential gates that have not been ratified.

### Open items

- Generate and inspect the authorized provider-backed images, narration, Realtime turn, and GPT-5.6 Map; then render the next immutable Video version and verify its persisted record and per-scene sidecar contain the live hashes.
- Founder recording, host footage, primary Session ID, final edit, public upload, and Devpost submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 05:27 CT — Every Video now carries the submission's build record

**Area:** Meta-demo provenance / submission packaging / production-browser verification

### Changed

- Added an immutable HTML and JSON build record to every rendered Video version. The record is generated from the current Workshop, append-only build log, and Build Week Git history at render time rather than from hand-authored marketing copy.
- Traced the sanitized brainstorm or durable transcript through active Source titles, locators, and permissions; Map size; approved Brief, Style, asset-plan, Storyboard, and image-batch versions; hashed current Outputs; and the final Video hash.
- Added measured transcript-to-first-Output time, logged milestones, Build Week commits, available Codex task IDs, provider-evidence counts, and explicit limitations. The fixture correctly records zero Realtime, GPT-5.6, GPT Image 2, and narration evidence and does not present task IDs as the required `/feedback` Session ID.
- Added `How this was built` contextually inside the existing `Show original` sheet. It appears only when the selected current Video owns a build record and adds no tab, rail, or primary workflow action.
- Added `BUILD-TRACE.html` and `BUILD-TRACE.json` to the verified submission set, raising the recorded package from 13 to 15 assets. Packaging rejects missing, escaped, or hash-mismatched build records.
- Isolated production-browser builds under `.next-playwright` so parallel local Next processes cannot corrupt the generated chunks used by the acceptance suite. The visual command normalizes Next's generated type reference afterward so ordinary development continues to use `.next`.

### Verified

- Worker typecheck passed and all 53 worker tests passed, including build-record generation, stable artifact routing, persisted hashes, package inclusion, and manifest integrity.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages. The web suite passed 11/11 and the domain suite passed 13/13.
- `pnpm demo:e2e` passed all six recorded gates and proved the current immutable Video owns readable HTML and JSON build-record files.
- `pnpm submission:build` produced 15 assets with honest `partial` status. `pnpm submission:verify` reported `valid: true`, `stale: false`, `tampered: false`.
- The full isolated production-browser suite passed 17/17. At desktop, compact, and mobile widths, `Show original` exposed the version-specific build-record link and its live route returned `How this submission was built`.
- The generated JSON was inspected for source and Output hashes, zero provider counts, explicit limitations, and absence of local absolute paths or API-key patterns. `pnpm demo:film:verify` remained honestly `draft` with five ready shots, five blocked shots, and ten missing live/final inputs.
- `git diff --check` passed. No paid provider request was made.

### Decisions

- “How this was built” is now a render-time product artifact, not a checked documentation claim. Historical Videos retain their original record even when later inputs mark them `Needs update`.
- The product-facing reveal stays simple. The original brainstorm and five resulting Outputs remain the visual story; detailed build evidence is one contextual secondary link.
- Commit history is labeled `Build Week commit history`, not `Codex-produced`, because Git alone cannot prove each commit's authoring path. Codex task IDs are recorded separately and bounded honestly.
- Compatible contract addition: every new `WorkshopVideo` requires a hashed build-record pair. Older stored Videos without it remain readable but cannot back a new submission package.

### Open items

- Provider-backed images, narration, GPT-5.6 reasoning, and one inspected Realtime microphone turn remain unproved and intentionally show as zero in the build record.
- Founder brainstorm recording, Codex doorway footage, primary `/feedback` Session ID, final edited Video, public upload, and Devpost submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 05:42 CT — Codex desktop now grounds and opens the local Workshop

**Area:** Unified plugin / default fixture grounding / Codex desktop host proof

### Changed

- Corrected a real installed-host failure found by a read-only Codex desktop task: the default sanitized Workshop listed Sources but persisted no normalized chunks or verified claims, so plugin `search` and exact `fetch` failed unless an acceptance-only data-root override was supplied.
- Added three deterministic sanitized chunks and five verified claims to the default Workshop, plus a migration for legacy default states whose seed Sources existed with empty evidence. Newly ingested evidence is stored ahead of seed evidence so a professional's current material leads generated work without removing the built-in judge-safe grounding path.
- Corrected `workshop_open` from the nonexistent `/workshops/:id` route to the real root doorway, with `WORKSHOPLM_APP_URL` as an explicit override.
- Refreshed the locally installed `workshoplm@workshoplm-local` version `0.1.2`; installed and worktree `dist/tools.js` now share SHA-256 `dd8383cc2ec8fc5038ace7099698bcbcedfd6d3f25573783af276534ce908a06`.
- Recorded the before/after desktop proof in `artifacts/spikes/plugin-desktop-host-2026-07-15.json` and reconciled the public claim ledger and evidence audit.

### Verified

- The initial Codex desktop verification turn `019f6554-bee8-77d0-8b72-bdeb9ea8d18a` honestly failed grounded search/fetch and exposed the empty-evidence defect.
- After migration, Codex desktop task `019f5eb9-d996-7f42-ac5a-d4ed2cc8a324`, turn `019f655c-7580-7432-ad1b-f4c7994064a2`, activated `$workshoplm`, called `workshop_list → search → fetch`, and fetched `source-design` / `chunk-seed-design`, linked verified claim `claim-seed-design-system`, locator `Design · Map`.
- The restarted local root returned HTTP 200. The Codex in-app Playwright browser rendered `WorkshopLM Build Week`, the Map, `3 sources`, and `View brief`; a fresh navigation reported zero new console errors.
- Worker tests passed 54/54, plugin tests passed 7/7, and `pnpm check` passed lint, typecheck, and tests across all 13 packages. No provider request or paid call was made.
- `pnpm demo:e2e` passed all six recorded gates. Because that deterministic run recreates the acceptance root, the first package verification correctly reported its prior manifest missing; `pnpm submission:build` then rebuilt the honest 15-asset `partial` set and `pnpm submission:verify` reported `valid: true`, `stale: false`, and `tampered: false`.

### Decisions

- The default sanitized Workshop must be honestly searchable on its own. Hidden fallback to the acceptance fixture or an arbitrary checkout path would make the plugin appear grounded only under test-only configuration.
- Recent user Sources lead generation; built-in sanitized evidence remains searchable and keeps the first plugin interaction useful before import.
- Codex desktop support is now proven for the installed read path and local browser doorway. ChatGPT Work parity remains a separate unverified claim, and the running pre-refresh MCP process correctly requires a fresh task to inherit the refreshed `workshop_open` route.

### Open items

- Record the matching ChatGPT Work activation only if that surface exposes and successfully runs the plugin; keep Spike E open until then.
- Capture legible Codex-side plugin-to-browser footage for the final edit. The live proof exists, but it is not yet a recorded judge artifact.
- Provider-backed images, narration, GPT-5.6 reasoning, one Realtime microphone turn, founder recording, primary `/feedback` Session ID, final edit, public upload, and Devpost submission remain open.
- Codex Session ID: unavailable on this surface; task and turn IDs are recorded but not substituted.

---

## 2026-07-15 05:52 CT — Grounding now uses the promised FTS5/BM25 retrieval layer

**Area:** Local RAG / source grounding / installed plugin

### Changed

- Corrected a specification-to-runtime mismatch found during the completion audit: `GOAL.md` promised SQLite FTS5/BM25, but worker and plugin search still scored substring matches over JSON state.
- Added a durable `evidence_fts` virtual table using the Unicode tokenizer. Every Workshop write atomically reindexes normalized chunk text and its linked claim text while retaining workshop, source, chunk, and locator identity as unindexed provenance fields.
- Migrated existing Workshop state on read when the index row count is missing or stale. New default Workshops index their sanitized evidence immediately.
- Routed worker source search and installed plugin `search` through BM25. Exact `fetch` remains fail-closed on the requested `sourceId` and `chunkId`; older pre-migration databases keep a bounded read-only substring fallback until the worker creates the index.
- Refreshed installed `workshoplm@workshoplm-local` `0.1.2`; installed and worktree `dist/tools.js` share SHA-256 `77ff257eef3eea4ad3c7b62883edaaf661508834129b0664b265fd1a6b2eff1a`.

### Verified

- Worker tests passed 54/54 and plugin tests passed 7/7. Worker and plugin typechecks passed.
- The live fixture contains three FTS rows. Query `editable production system` ranked `chunk-seed-design` / `Design · Map` first with BM25 `-1.4966554538880497`, followed by `chunk-seed-brief` / `Build notes · §2`.
- The refreshed installed plugin cache contains the `evidence_fts` table and the same three indexed sanitized chunks. No provider or network retrieval call was made.
- `pnpm check` passed across all 13 packages. `pnpm demo:e2e` passed all six gates, and the rebuilt 15-asset `partial` submission set verified `valid: true`, `stale: false`, and `tampered: false`.

### Decisions

- Retrieval ranking is infrastructure, not a marketing label. The evidence artifact records the actual table, tokenizer, indexed fields, query, ranks, and installed package hash.
- FTS rows are derived from authoritative Workshop state. Source/chunk/claim IDs in persisted state remain the provenance contract; the search index can be rebuilt without changing citations.
- Local FTS5/BM25 is not described as hosted OpenAI File Search, and it does not prove live GPT-5.6 reasoning.

### Open items

- The completion audit continues. Plugin write tools still need to be checked against the same real-service boundary; provider media, Realtime microphone proof, founder footage, final video, `/feedback`, and submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 06:01 CT — Plugin writes now execute the real Workshop service

**Area:** Unified plugin / local service boundary / approval integrity

### Changed

- Replaced plugin write stubs that incremented counts, flipped approval booleans, or returned `accepted` without invoking WorkshopLM production behavior.
- Routed sanctioned source URLs, PDFs, and bounded text files through the real local `/api/workshop` ingestion actions. File paths are resolved locally, remote app hosts are rejected, and no source contents leave the loopback service.
- Added current `map-rN` and `storyboard-vN` tokens to plugin list/open results. Brief approval, Storyboard approval, and rendering reject missing or stale requested versions before dispatching any mutation.
- Routed deck/infographic, image-plan, Storyboard, and Video requests through their real service actions. Storyboard creation materializes its asset plan when necessary; Video remains blocked until the current Storyboard is approved.
- Replaced the empty trace stub with artifact lookup that returns persisted claim IDs and exact claim→chunk→source locators, plus a Video build-trace reference when present.

### Verified

- Plugin tests passed 7/7, including a loopback service double proving stale `map-r99` is rejected without dispatch and the valid Brief → Storyboard → render sequence persists through the service. Plugin typecheck and build passed.
- A separate isolated real-app run imported one local Markdown source through `workshop_add_source`, yielding 4 Sources, 59 FTS chunks, and 84 claims; approved exact `map-r1`; persisted `deck-v1` with four claim edges; created six image panels and `storyboard-v2`; approved exact `storyboard-v2`; and queued one real `render_video` job.
- `workshop_get_trace(deck-v1)` returned four exact claim→chunk→source edges from the persisted artifact. The main demo fixture was not mutated and no provider request or paid call occurred.
- The installed `0.1.2` package was refreshed after the proof; its final privacy-safe build records local text origins by filename rather than absolute path and has worktree `dist/tools.js` SHA-256 `6ba337e03dc737970abf44e1f45d8f1c5dc2c094517e4c0ac4e0b697fad2ecbe`.
- `pnpm check` passed across all 13 packages. `pnpm demo:e2e` passed all six gates, and the rebuilt 15-asset `partial` submission set verified `valid: true`, `stale: false`, and `tampered: false`.

### Decisions

- Plugin write tools are commands into the same local service as the visual Workshop, not a second implementation of business state.
- The loopback URL is explicitly restricted to local HTTP and bounded by a 15-second command timeout. A stopped app returns a visible tool error instead of silently acknowledging work.
- Version tokens are part of the approval contract. The conversational host must approve the version it actually inspected, matching the visual product's two deliberate gates.

### Open items

- Capture an actual Codex write invocation only when a safe isolated fixture is active. Do not mutate the main fixture merely to strengthen a claim.
- Multi-Workshop creation and switching still need completion-audit review; provider media, Realtime proof, founder footage, final video, `/feedback`, and submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 06:07 CT — Finish sequence captured for later reconciliation

**Area:** Planning / submission readiness

### Changed

- Preserved the founder-provided six-phase finish sequence in `docs/superpowers/plans/2026-07-15-submission-sequence-draft.md`.
- Marked it explicitly as a non-binding reference so it does not silently replace the active objective or execution plan while the implementation audit is still in progress.
- Retained phase exit conditions and the two standing evidence rules, while separating the future reconciliation questions from the checklist itself.

### Verified

- The captured document includes all six proposed phases: live-provider proof, live-asset integration, recording iterations, the meta-demo submission package, cold submission verification, and post-submission case-study conversion.
- The draft retains the exact evidence bar: acceptance gates every merge and no checkbox moves without proof of the exact claim.

### Decisions

- Phase 1 needs a later ownership pass because it currently mixes true founder-only inputs—spend authorization, founder footage, and `/feedback` access—with benchmark, integration, and verification work that the primary integrator should execute autonomously once inputs exist.
- `GOAL.md` and `PLAN-2026-07-13.md` remain authoritative until that reconciliation is performed deliberately.

### Open items

- Revisit this sequence after the current implementation audit, update it from then-current evidence, assign ownership, and promote only the reconciled version into the active goal.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 11:04 CT — Workshops become a real durable product boundary

**Area:** Product / Local runtime / Plugin / Testing

### Changed

- Replaced the hardcoded single-Workshop runtime with durable create, list, select, and active-Workshop state in SQLite. New Workshops start empty; the sanitized Build Week fixture remains the default teaching Workshop.
- Scoped source ingestion, FTS5/BM25 grounding, graph state, approvals, outputs, image plans, Storyboards, Videos, build traces, generated paths, and queued jobs to the owning Workshop. A background render now completes the Workshop recorded on the job without changing the Workshop open in the browser.
- Added one minimal Workshop picker using the official `ListRowAction` and `SideSheet` primitives. It opens from the Workshop name and does not add tabs, a dashboard, or persistent navigation.
- Routed plugin `workshop_create`, `workshop_open`, search, fetch, trace, and all mutations through the same local Workshop service. Search and fetch default to the active Workshop and return its ID, preventing cross-Workshop source collisions.
- Promoted the product strategy into `GOAL.md`: the primary user is a consultant, strategist, or enablement lead; the wedge is a grounded, branded, source-defensible deck; and the next implementation gate is professional send-it quality rather than more output breadth.

### Verified

- In the Codex in-app browser, an isolated run opened the seeded Workshop with three Sources, created `Client launch`, showed its honest zero-Source state, switched back to the original Workshop, and restored its three Sources and Map. The browser console had no errors.
- `pnpm demo:e2e` passed the complete recorded Source → Map → Brief → Style → Storyboard → Video seam and all six acceptance gates.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages: worker 56/56, web 12/12, and plugin 7/7 among the package suites.
- `pnpm submission:build` produced the honest 15-asset `partial` package; `pnpm submission:verify` reported `valid: true`, `stale: false`, and `tampered: false`.
- Installed and worktree plugin `dist/tools.js` both have SHA-256 `19d512634d7ada14b567d20ed9f76e20e47f58abc33e8c09343f6628108e3bf3`. Evidence is recorded in `artifacts/spikes/multi-workshop-2026-07-15.json`.

### Decisions

- Multiple Workshops are a collection boundary, not a new product mode. The active Workshop still has one current object and one dominant action.
- The browser, plugin, worker, and grounding layer share one Workshop identity contract; no surface keeps a parallel copy of business state.
- The professional wedge now controls sequencing. Deck layout quality, unobtrusive citations, exact Style use, and editable PowerPoint-world handoff outrank adding another pipeline feature.

### Open items

- Raise the deck to the documented professional send-it bar and inspect it against real external content. The current deterministic HTML deck proves traceability and rendering, not yet executive-grade design or editable PowerPoint handoff.
- Live GPT-5.6, GPT Image 2, provider narration, and one provider-backed Realtime microphone turn remain unproved and spend-gated. The submission package remains correctly labeled `partial`.
- Founder footage, primary `/feedback` Session ID, final edit, public upload, and Devpost submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 11:18 CT — Presentation output crosses from proof template to editable deck system

**Area:** Deliver / Product quality / Testing

### Changed

- Replaced the repeated one-page HTML presentation template with five content-aware slide compositions: cover, statement, split, evidence, and recommendation. The renderer chooses a stable narrative sequence while preserving exact Style colors and licensed font choices.
- Made source trace quiet but persistent: every preview slide retains its locator in the footer, and every editable slide stores the source locator and claim ID in speaker notes.
- Added a real `.pptx` handoff built from editable text and shapes. The focused Presentation view now offers `Download PowerPoint` alongside `Show source` and `Open preview`.
- Stored both HTML and PowerPoint bytes as content-addressed Workshop artifacts, resolved the editable format through the local artifact route, and added `presentation.pptx` as a separately hashed deck asset in the submission Output set.
- Escaped all source-derived HTML before rendering and used source chunks as supporting body copy rather than repeating each claim as both heading and body.

### Verified

- A five-slide leadership sample was visually inspected in the Codex in-app browser. Cover, statement, split, proof, and recommendation layouts had clear hierarchy, restrained citations, no observed overflow, and no browser console errors.
- The actual acceptance `.pptx` passed `unzip -t`, contained five slide XML files and five notes-slide files, opened through LibreOffice, converted to a five-page 16:9 PDF, and rendered without corruption. The default export uses the broadly compatible Arial family when no licensed font is selected.
- `pnpm demo:e2e` passed the full recorded seam and all six gates after the renderer change. `pnpm check` passed across all 13 packages; production passed 3/3, worker 56/56, and web 12/12 tests.
- The rebuilt submission package now contains 16 assets, including separately hashed HTML and editable PowerPoint deck files, and verifies `valid: true`, `stale: false`, and `tampered: false` while remaining honestly `partial` for live-provider gaps.
- Evidence is recorded in `artifacts/spikes/professional-deck-2026-07-15.json`.

### Decisions

- HTML remains the fast responsive in-product preview; `.pptx` is the professional editing and PowerPoint-world handoff. They are two representations of one grounded deck, not separate Outputs.
- Output quality now controls sequencing. This increment establishes the renderer and handoff floor, but the send-it goal stays open until a real external deliverable survives a cold professional review.
- Brand fonts are used only when recorded as licensed Style inputs. The portable default is Arial rather than a custom or platform-specific display face.

### Open items

- Dogfood a genuinely external professional deck, record friction as product defects, and obtain a cold send-or-revise judgment. Improve content planning and layout selection from that evidence rather than adding more templates speculatively.
- Live GPT-5.6 Map reasoning, GPT Image 2 media, provider narration, and a provider-backed Realtime microphone turn remain spend-gated and unproved.
- Founder footage, primary `/feedback` Session ID, final video edit, public upload, and Devpost submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 11:33 CT — Real-source dogfood repairs the deck story, not just its styling

**Area:** Product strategy / Deliver / Dogfood / Testing

### Changed

- Promoted the professional replacement test into `GOAL.md`: deck-first wedge, send-it quality, trust, return-visit behavior, and a reality ladder from submission dogfood through repeat external use. Build Week remains the deadline and distribution event, not the product definition.
- Ran WorkshopLM against three real project documents in an isolated Workshop. The first deck exposed a concrete product defect: source-order selection elevated Markdown headings, refresh metadata, and hackathon directory facts into the presentation narrative.
- Replaced first-four-claims selection with deterministic narrative planning across statement, risk, proof, and recommendation roles. The planner rejects headings, tables, metadata, path fragments, and weakly formed claims; strips Markdown; derives concise headings; and retains the selected claim IDs and exact locators.
- Separated professional visible source labels from exact provenance. Slides now show a readable Source title plus chunk while HTML data and editable PowerPoint speaker notes preserve the full original locator and claim ID.

### Verified

- The repaired real-source deck selects the product north star, output-quality risk, exact-source trust promise, and a concrete recommendation. It no longer exposes raw Markdown or source-file paths on-slide.
- The final editable `deck-v10.presentation.pptx` passed `unzip -t`, opened through LibreOffice, converted to a five-page 16:9 PDF, and was visually inspected with no observed overflow or corrupted layout. Evidence and hashes are in `artifacts/spikes/deck-dogfood-2026-07-15.json`.
- `pnpm check` passed across all 13 packages; production passed 3/3 tests, worker passed 57/57 tests, and web remained 12/12.
- `pnpm demo:e2e` passed the complete recorded seam and all six gates. The 16-asset submission set rebuilt and verified `valid: true`, `stale: false`, and `tampered: false`, while remaining honestly `partial` for provider media.

### Decisions

- Output quality is now an executable gate. A grounded file is not a professional deck merely because it renders, cites sources, and exports to PowerPoint; content selection and narrative order are product behavior.
- Exact provenance belongs in the artifact, but raw implementation-facing locators do not need to dominate the visible slide. The readable label and full locator remain two representations of the same grounded reference.
- The deck send-it goal remains open. This run is internal dogfood zero, not a genuinely external deliverable or a cold send-or-revise decision.

### Open items

- Produce one real external professional deck, observe an uncoached reviewer, and record the send-or-revise judgment plus every friction point.
- Implement the return-visit gaps now made explicit in the goal, especially reusable Style Libraries across Workshops and the weekly add-Source → refresh → regenerate rhythm.
- Live GPT-5.6 Map reasoning, six GPT Image 2 outputs, provider narration, and one Realtime microphone turn remain spend-gated and unproved.
- Founder footage, primary `/feedback` Session ID, final edit, public upload, and Devpost submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 11:45 CT — Saved Styles make the second Workshop materially faster

**Area:** Product / Style / Return visit / UI / Testing

### Changed

- Added a small global SQLite `style_library` table for reusable local Style snapshots. Each applied Workshop Style still receives its own version, `DESIGN.md`, tokens, and downstream dependency state.
- Manual and website Styles now save automatically by stable Style identity. A new `applyStyleLibrary` service and API command copies the exact palette, authorized assets, licensed fonts, visual rules, negative rules, source type, reference URL, and Intent Profile into the active Workshop.
- Added `Saved styles` to the existing Style sheet using only the approved `SideSheet`, `ListGroup`, `ListRow`, `ListRowAction`, palette preview, and Button primitives. No tab, Style dashboard, or persistent navigation was added.
- Simplified the new-Workshop state after live inspection: when a saved Style exists, the sheet shows that choice first and hides the full website/manual editor behind one secondary `Create another style` action.

### Verified

- In an isolated Codex in-app browser run, the Build Week Workshop saved `WorkshopLM editorial`; a separate `Weekly client update` Workshop ingested a meeting note, approved its Brief, displayed that saved Style as the only primary choice, and applied it in one click.
- SQLite inspection confirmed one library snapshot shared by two Workshops while both Workshops retained independent Style version 1 records and their own generated design artifacts.
- A dedicated service test applies a different saved Style to a Workshop with a current deck and verifies the deck and Storyboard become stale, Storyboard approval is revoked, and the applied Style remains current.
- `pnpm check` passed across all 13 packages. Worker passed 59/59 tests and web passed 13/13 tests. `pnpm demo:e2e` passed all six gates; the 16-asset submission set verified `valid: true`, `stale: false`, and `tampered: false` while remaining honestly `partial`.
- Evidence and the 1280×720 live screenshot are recorded in `artifacts/spikes/style-library-2026-07-15.json` and `artifacts/spikes/style-library-ui-2026-07-15.jpg`.

### Decisions

- The library stores reusable snapshots; it does not silently mutate existing Workshops when a similarly named Style is changed later. Professionals choose when a Workshop adopts a Style change, and normal staleness rules then make the consequence visible.
- The Intent Profile travels with a saved Style because `Client pitch`, `Board presentation`, and `Team workshop` are full aesthetic systems, not transient renderer flags.
- Saved-first progressive disclosure is the default return-visit experience. Brand setup remains available but no longer competes with the one-click reuse path.

### Open items

- Complete the weekly rhythm by verifying new meeting → refreshed Map and Brief → regenerated deck with the reused Style and intact claim trace as one live scenario.
- Produce a genuinely external professional deck and obtain a cold send-or-revise judgment.
- Live GPT-5.6 Map reasoning, six GPT Image 2 outputs, provider narration, and one Realtime microphone turn remain spend-gated and unproved.
- Founder footage, primary `/feedback` Session ID, final edit, public upload, and Devpost submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 12:08 CT — First external-use deck candidate repairs the real source-to-slide boundary

**Area:** Product quality / Grounding / Deliver / Dogfood one / Testing

### Changed

- Ran WorkshopLM against two privacy-safe sources outside the Build Week project: the AI Collective chapter-startup FAQ PDF and the current public AI Collective Newsletter page. The first generated deck failed the send-it test before styling: naive webpage ingestion produced 5,179 claims from scripts and configuration, layout-preserving PDF extraction broke bullets across hard line wraps, and the planner selected an unrelated `91%` article claim.
- Replaced tag stripping with readable HTML extraction that removes scripts, styles, templates, frames, SVG internals, and navigation; decodes entities; keeps structural paragraph boundaries; and uses the actual page title. The same current page now yields 63 readable claims with zero known script leaks.
- Added PDF layout reflow for wrapped paragraphs, bullet boundaries, numbered steps, page breaks, and zero-width characters. Incomplete colon-ending fragments are no longer eligible as slide claims.
- Made deck planning topic-aware, content-role-aware, and source-context-aware. Current public web evidence is favored for quantitative proof, while explicit action language wins the recommendation. The final story is local leadership value → sustainable organizer commitment → current 180+ chapter proof → `Start a chapter in your city`.
- Embedded an explicitly configured local logo into both HTML and PowerPoint, replaced WorkshopLM-internal cover language with the Style name and Intent Profile, shortened filename and webpage citations without losing exact locators, and removed duplicated heading text from slide bodies.
- Packaged the resulting HTML, editable PowerPoint, LibreOffice PDF, five rendered review slides, a cold-review prompt, and hashes in `outputs/dogfood-ai-collective-chapter-brief/`. It is labeled ready for review, not externally approved.

### Verified

- The final `.pptx` passed `unzip -t`, contains five slide XML files plus five source-trace note slides, opened through LibreOffice, converted to a five-page 16:9 PDF, and rendered without observed overflow or raw implementation labels. The official AI Collective mark is present in the browser preview and editable PowerPoint cover.
- The final artifact hashes are HTML `217b36d2b453a9af602723a4cdd990c69dd10043286ef523a35fa600342a4680`, PowerPoint `2f8df7e87092679b16a70f6e16eadf29518d528bddc73b0ca3e289cf7a8f60bc`, and PDF `913d9abe82cd06fa0d16d8a7aca604ded4eec1985c8085be062ed59da5ab66ba`.
- `pnpm check` passed across all 13 packages. Worker passed 62/62 tests, web 13/13, and production 3/3. `pnpm demo:e2e` passed all six gates. The rebuilt 16-asset submission set verified `valid: true`, `stale: false`, and `tampered: false` while remaining honestly `partial` for live-provider media.
- Structured evidence is recorded in `artifacts/spikes/external-deck-dogfood-2026-07-15.json`.

### Decisions

- A source is not safe to ground merely because it is public HTML. Readable-content extraction is part of the evidence boundary; script/config text must never compete with user-visible claims.
- The deck planner may use a source title as topic context for local documents, but broad web-page titles do not make every article claim relevant. Current web sources receive a proof preference only after claim-level topic relevance and content quality checks.
- Exact locators remain in HTML data and PowerPoint notes. Visible citations use a concise professional source label so trust does not become visual clutter.

### Open items

- Obtain a real cold `Send` or `Revise` judgment from someone outside the project. The candidate is external-use work, but no external person has reviewed or shipped it yet.
- Complete the weekly add-meeting → refreshed Map and Brief → regenerated deck scenario with the reused Style and intact trace.
- Live GPT-5.6 Map reasoning, six GPT Image 2 outputs, provider narration, and one Realtime microphone turn remain spend-gated and unproved.
- Founder footage, primary `/feedback` Session ID, final edit, public upload, and Devpost submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 12:31 CT — Weekly return visit now refreshes work without lying about history

**Area:** Product / Trust / Return visit / UI / Testing

### Changed

- Reproduced the professional weekly rhythm in an isolated real browser Workshop: one Monday meeting, approved Brief, reused saved Style, and Presentation Version 1; then a Thursday meeting arrived and had to change the work.
- Fixed Source ingestion as a dependency boundary. Every genuinely new Source now expands the typed Map, clears extracted candidates, revokes Brief and Storyboard approval, blocks Video, and marks the existing Frame, Sketch, asset plan, image batch, Storyboard, narration, Outputs, and Videos `Needs update`. The Style remains current because evidence changed, not the brand system.
- Added a complete service regression covering saved Style reuse, initial deck delivery, new-meeting ingestion, Map expansion, Brief Version 2, Presentation Version 2, retained Presentation Version 1 history, and a Version 2 claim ID that resolves to the Thursday Source.
- Fixed current-versus-history semantics in Outputs. The current state is derived from the newest presentation and infographic versions, current asset plan, image batch, Storyboard, and Video; a stale historical version no longer leaves the whole screen in a false `Update outputs` state.
- Kept partial success distinct from stale work. A failed or incomplete batch says `Some Outputs are ready`; a changed Source, Brief, or Style says `Outputs need an update`. Both retain one appropriate `Update outputs` action.
- Removed fixture-specific labels from professional Workshops: `Build Week presentation` is now `Presentation`, and `Evidence infographic` is now `Infographic`.
- Reconciled the production-browser suite with saved-first Style progressive disclosure, actual three-Source fixture coverage, exact `Open preview` language, and the Storyboard panel whose evidence really resolves to `Build Week brief`.

### Verified

- In the ChatGPT/Codex in-app browser, adding `Thursday client meeting` changed the header from `View brief` to `Approve brief`, expanded the Map from one to two ideas, and showed two selected Sources. Reapproval produced Brief Version 2 while `Client system` remained Style Version 1 and current.
- Before regeneration, Presentation Version 1 was visibly `Needs update`. After `Update outputs`, Presentation Version 2 was `Up to date`, showed two Sources, and cited Thursday's pilot approval and Monday-start recommendation. Version 1 remained visible as one-Source history without keeping the screen stale; the only primary next action became `View storyboard`.
- The isolated API state confirmed deck Version 1 stale, deck Version 2 current, infographic Version 1 current, current Storyboard Version 1, current Frame Version 2, Style Version 1, and exact claim IDs from both meeting Sources.
- `pnpm check` passed across all 13 packages. Worker passed 63/63 tests, web 13/13, and production 3/3. `pnpm demo:e2e` passed the complete recorded seam and all six gates.
- The production Next build passed. After intentional baseline reconciliation, the strict no-update Playwright run passed all 17/17 desktop, compact, mobile, state, provenance, Style, Storyboard, Video, accessibility, and visible-copy scenarios.
- `pnpm submission:build` produced the honest 16-asset `partial` set, and `pnpm submission:verify` reported `valid: true`, `stale: false`, and `tampered: false`.
- Structured evidence and the browser screenshot are recorded in `artifacts/spikes/weekly-return-visit-2026-07-15.json` and `artifacts/spikes/weekly-return-visit-2026-07-15.png`; the screenshot SHA-256 is `b4adc837dd2cb3f72a6ed73b51b574b993c4d6b2af30d1e6fad1a2aa198f02bd`.

### Decisions

- Adding evidence is a semantic graph change, not a harmless collection edit. Existing finished work must become stale until the professional reapproves the changed Brief.
- Style is independent of Source freshness. Reusing a saved Style across weekly updates should remove setup friction, not create another approval loop.
- Historical staleness is informative; current staleness is actionable. The UI must preserve both without confusing one for the other.
- Generic Output names belong in the product. Demo-specific names belong in the Workshop content, not the surrounding interface.

### Open items

- Obtain a real cold `Send` or `Revise` judgment from someone outside the project for the AI Collective deck candidate.
- Live GPT-5.6 Map reasoning, six GPT Image 2 outputs, provider narration, and one Realtime microphone turn remain spend-gated and unproved.
- Founder footage, primary `/feedback` Session ID, final video edit, public upload, submitted links, and Devpost submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

---

## 2026-07-15 12:38 CT — Product north star now governs the submission and roadmap

**Area:** Product strategy / Professional validation / Demo / Claims / Submission

### Changed

- Converted the professional replacement thesis into explicit `GOAL.md` gates for the first five minutes, send-it quality, trust and return behavior, and the reality ladder. The gates distinguish automated mechanics and screenshot orientation from provider-backed timing, cold professional judgment, uncoached use, and an external return visit.
- Recut the public demo around the grounded, branded presentation as the wedge. The opening now promises a deck the professional can defend; the Output beat demonstrates layout, quiet citation, exact `Show source`, and editable PowerPoint before briefly revealing the infographic, images, Storyboard, and Video as supporting proof.
- Reconciled the Devpost draft, claim ledger, evidence audit, and machine-readable film plan with the current product evidence. The public draft now describes the weekly meeting-to-new-presentation behavior, the external-use AI Collective deck candidate, and the verified 16-asset partial submission set without implying external approval or live provider execution.
- Corrected stale verification language: the current floor is 13 packages, 13 web contract/unit tests, 17 production-route browser tests, six acceptance gates, and submission integrity verification. Five screenshot-orientation reviews are proven; uncoached empty-Workshop use remains open.

### Verified

- `pnpm demo:film:verify` accepted the revised 2:42, ten-shot plan at 302 narration words and correctly remained `finalReady: false` with the same ten missing external/provider/final-export evidence items.
- `pnpm submission:build` produced an honest 16-asset `partial` set. `pnpm submission:verify` reported `valid: true`, `stale: false`, and `tampered: false`.
- `submission/demo-film-plan.json` parsed successfully and `git diff --check` passed.

### Decisions

- WorkshopLM is not a horizontal asset generator. The grounded, branded, source-defensible deck is the wedge; infographic, images, Storyboard, and Video demonstrate the system's supporting range.
- The hackathon is dogfood zero and a distribution deadline. Product completion evidence must come from professionals choosing to send, revise, reuse, and return—not from implementation breadth alone.
- A deterministic test can prove freshness mechanics or an export contract. It cannot prove two-minute magic, a fifteen-minute shippable deck, a cold `Send` decision, or an uncoached second use.

### Open items

- Obtain a cold `Send` or `Revise` judgment on the packaged AI Collective deck candidate and repair the first named issue.
- Measure the provider-backed own-material path against the two-minute Map and fifteen-minute first-deck gates after spend authorization.
- Capture one uncoached weekly return on representative material after the demo-critical provider and recording gates are closed.
- Live GPT-5.6 Map reasoning, six GPT Image 2 outputs, provider narration, one Realtime microphone turn, founder footage, primary `/feedback` Session ID, final edit, public upload, and Devpost submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 12:53 CT — Infographic now has a professional last-mile editing path

**Area:** Deliver / Editable Outputs / Browser UI / Submission integrity / Testing

### Changed

- Added a one-slide editable PowerPoint renderer for Infographic Outputs. It uses the same approved Style, grounded claims, concise citations, and source notes as the HTML preview; repeated or truncated claim headings are collapsed into one readable row instead of duplicated across columns.
- Made the existing focused-Output `Download PowerPoint` action available whenever an Output has an editable file. The Infographic route now serves its `.pptx` with the correct Office MIME type and download filename without adding another control or navigation concept.
- Added the editable infographic to the traced submission Output set beside the editable presentation. Both files now carry claim IDs, source locators, hashes, byte counts, and `workshop_output` provenance in the manifest.
- Closed the product gate requiring a credible last-10-percent path for every primary Output: editable presentation and infographic PowerPoints, direct image files and selective regeneration, in-product Storyboard editing, and standard MP4 Video handoff.

### Verified

- In the ChatGPT/Codex in-app browser, the focused Infographic showed one `Download PowerPoint` link at `/api/workshop/artifacts/infographic-v1?format=editable` beside `Show source` and `Open preview`; the rendered screen retained one clear dominant action and no new navigation.
- The generated `.pptx` passed `unzip -t`, contained one editable slide plus embedded source notes, opened in LibreOffice, converted to a one-page 16:9 PDF, and passed visual inspection after the duplicate-text repair.
- `pnpm check` passed all 13 packages. Production passed 4/4 tests, worker 63/63, and web 13/13. The production-browser suite passed all 17/17 responsive, state, provenance, Style, Storyboard, Video, accessibility, and visible-copy scenarios.
- A final serialized `pnpm demo:e2e` passed all six gates. `pnpm submission:build` produced the honest 17-asset `partial` set, and `pnpm submission:verify` reported `valid: true`, `stale: false`, and `tampered: false`.
- Two intermediate acceptance attempts collided with an already-running destructive acceptance reset from the broader visual-test command. Polling that session to completion and serializing later runs removed the collision; no provider or product-runtime failure was hidden.

### Decisions

- Professional editability should reuse the user's normal tools. A one-slide PowerPoint is a smaller and more credible infographic handoff than adding a second in-product vector editor.
- The presentation remains the wedge. Editable infographic support closes a workflow seam; it does not promote the infographic into an equal-weight hero flow.
- Submission integrity includes editable deliverables, not only previews. If the UI claims a professional can finish the last 10 percent, the self-produced package must contain and hash that file.

### Open items

- Obtain a cold `Send` or `Revise` judgment on the external-use presentation candidate.
- Provider-backed GPT-5.6 Map reasoning, six GPT Image 2 outputs, provider narration, and one Realtime microphone turn remain authorization-gated and unproved.
- Founder footage, primary `/feedback` Session ID, final video edit, public upload, submitted links, and Devpost submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 12:56 CT — Public release parity and verification floor restored

**Area:** Release hygiene / Public repository / Verification

### Changed

- Reconciled the visible-copy browser baseline with the intentional post-save UI: the removed `Save` control is no longer asserted as visible.
- Ignored local browser-build, visual-test state, test-result, local-run, and generated archive artifacts so normal release checks leave the worktree clean.
- Published the reviewed local history through `b21cfe57c78bf5de22f0e70e7b10e64d351d4402`, including editable infographic export and the explicit plugin data-root contract.

### Verified

- `pnpm check` passed across all 13 packages; the worker passed 63 tests, web passed 13 tests, and the production package passed 4 tests.
- `pnpm --filter @workshoplm/web test:visual` passed all 17 browser scenarios on the production Next build.
- `pnpm demo:reset && pnpm demo:e2e`, `pnpm submission:build && pnpm submission:verify`, and `pnpm demo:film:verify` completed. The submission set is the honest 17-asset `partial` set with `valid: true`, `stale: false`, and `tampered: false`.
- Local `HEAD` and `origin/main` both resolved to `b21cfe57c78bf5de22f0e70e7b10e64d351d4402` before this log entry; the subsequent documentation commit is pushed with the same release hygiene changes.

### Decisions

- The draft film verification is green as a gate, not a final-film claim: it correctly stays `finalReady: false` until the ten missing live/provider, footage, session-ID, and final-export artifacts exist.
- Release hygiene excludes generated artifacts rather than deleting them, preserving local evidence while preventing accidental publication.

### Open items

- The remaining submission blockers are unchanged: cold professional deck validation; provider-backed GPT-5.6, Image, narration, and Realtime evidence; founder/Codex footage; primary `/feedback` Session ID; final video; public upload; and Devpost submission.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 13:00 CT — Visual verification made repeatable

**Area:** Release verification / Browser tests

### Changed

- Added a visual-build preparation script that removes only stale generated `.next/types` declarations before the isolated production visual build. This prevents Next from typechecking duplicate generated route files left by earlier custom-dist builds.

### Verified

- Ran `pnpm --filter @workshoplm/web test:visual` twice consecutively. Both production builds and all 17 browser scenarios passed.

### Decisions

- Keep the cleanup scoped to generated route types. Application output, the visual-test data root, and local developer source files are not removed.

### Open items

- Submission blockers remain unchanged; see the preceding release-parity entry.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 13:01 CT — Submission packet reorganized around the professional story

**Area:** Submission materials / Claims

### Changed

- Replaced the short Devpost draft with the complete submission packet: Devpost fields, three-tier judge path, video narration spine, and a final publication gate.
- Reordered the description around the professional Tuesday problem, the product's approval-and-traceability promise, then the evidence-backed self-build story.
- Preserved live/fallback slots for provider-backed claims and changed the self-produced-submission passage to the recorded-fixture truth until final provider-backed assets, founder footage, and final output provenance exist.
- Refreshed mutable copy: the tagline is 194 characters, the build log is described as more than 4,700 lines, and the claim ledger now reflects 13 web contract/unit tests.

### Verified

- Counted the final tagline at 194 characters.
- `wc -l log.md` reported 4,765 lines before this entry; the latest recorded verification floor in `log.md` is 13 packages, 13 web tests, 17 production-route browser tests, six acceptance gates, and passing submission integrity verification.
- Reconciled the packet's recorded-fixture language with `submission/CLAIM-LEDGER.md`; no provider-backed or final self-produced-submission claim was promoted.

### Decisions

- The judge-facing narrative should make the professional outcome legible before its implementation details, while evidence boundaries remain compact and explicit rather than driving the full outline.
- A final self-produced-submission claim remains gated even in a working packet; the current fixture can demonstrate the provenance mechanism without claiming that the final public submission has already passed through it.

### Open items

- Resolve every `[LIVE]`/`[FALLBACK]` pair from inspected artifacts before publication, or remove the pair; no bracketed copy ships.
- Provider-backed GPT-5.6, image, narration, and Realtime evidence; founder footage; primary `/feedback` Session ID; final edit and public upload; and Devpost submission remain open.
- Codex `/feedback` Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 13:05 CT — Empty Workshop now reaches an editable deck without hidden UI steps

**Area:** Product quality / First session / Browser verification

### Changed

- Replaced the pasted-text-only Add Source form and required title with one progressive field that recognizes pasted notes, public `http(s)` URLs, and absolute local PDF paths; plain-text titles derive from the first meaningful line and remain optionally editable.
- Changed the approved Brief's next action from opening an empty Outputs screen to creating Outputs directly when a current Style is ready. `View outputs` now appears only when Outputs already exist.
- Initialized Storyboard fields from the selected panel so a transient, false `Save` action does not appear before the first client-side effect.
- Added unit coverage for input routing/title derivation and a production-browser scenario that creates a truly empty Workshop, adds fresh notes, approves the Brief, chooses or reuses a Style, creates Outputs, opens the presentation, and verifies its editable `.pptx` path.

### Verified

- `pnpm check` passed across all 13 packages; web now passes 15 unit/contract tests.
- `pnpm --filter @workshoplm/web test:visual` built the production Next app; the final strict Playwright run passed 18 of 18 browser scenarios and refreshed only the three intentionally changed Add Source screenshots.
- The new empty-Workshop scenario completed in 2.6 seconds of automated production-browser time and verified a derived `Weekly client meeting` Source title plus a presentation `editableRelativePath` ending in `.pptx`.
- Inspected the live local Add Source sheet in the Codex in-app browser: one visible `Source` field, one optional title only after text exists, voice above it, and one disabled-until-valid `Add source` action.
- `pnpm demo:e2e` passed all six recorded-fixture gates. The first immediate `pnpm submission:verify` correctly failed because the acceptance reset had not rebuilt the manifest; `pnpm submission:build && pnpm submission:verify` then produced and verified the honest 17-asset `partial` set with `valid: true`, `stale: false`, and `tampered: false`.

### Decisions

- Source type is inferred from the value instead of exposed as a mode choice. This keeps URLs and local PDFs available without asking a first-time professional to learn the ingestion model.
- Mechanical speed evidence does not close the 15-minute professional gate. A representative user still has to run the same path with their own material, uncoached, and record any repair work.

### Open items

- Provider-backed two-minute Map proof and the uncoached 15-minute deck test remain open.
- The broader submission blockers remain provider-backed GPT-5.6/Image/narration/Realtime evidence, founder and Codex footage, the primary `/feedback` Session ID, final video/export, public upload, and Devpost submission.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 13:20 CT — Presentation renderer clears its first visual send-it defect

**Area:** Deliver / Presentation quality / Editable export / Visual verification

### Changed

- Audited the generated five-slide fixture presentation as an actual editable PowerPoint, not only as HTML or a ZIP signature. The first render showed three professional-quality defects: empty body furniture on claim-only slides, a visually unstable split rail in LibreOffice, and recommendation copy repeated as both headline and body.
- Made sparse claims a first-class presentation composition. Statement, split, proof, and recommendation slides now omit empty body elements, enlarge and reposition the supported headline, and retain the quiet source footer and PowerPoint notes trace.
- Replaced generic `Key point` labels with `Core insight`, `What changes`, `Evidence`, and `Recommended next move`; corrected the client-facing deck label from `Organizer brief` to `Client presentation`.
- Added an explicit pale accent rail to the split layout so PowerPoint-compatible renderers produce an intentional two-zone composition instead of relying on transparent text-box behavior.
- Stabilized generated-preview browser screenshots by waiting for same-origin preview documents and fonts before capture. Mobile preview screens retain a bounded 1.5% raster tolerance for iframe font antialiasing; non-preview screens remain at 0.4% mobile and 0.1% desktop/compact.
- Preserved the inspected contact sheet at `artifacts/deck-send-it-audit-2026-07-15.png`.

### Verified

- Production renderer tests pass 5/5, including a new sparse-slide contract; worker tests pass 63/63, including full claim text, sparse recommendation composition, editable export, and source trace.
- `pnpm check` passed all 13 packages; web remained 15/15.
- `pnpm demo:reset && pnpm demo:e2e` passed all six gates and regenerated the presentation from the recorded fixture.
- LibreOffice opened and converted `.workshoplm/acceptance/generated/deck-v1.presentation.pptx` to a five-page 16:9 PDF. `unzip -t` found no archive errors. All five rasterized pages were inspected together; no empty placeholder furniture or duplicated recommendation remained.
- The strict production-browser suite passed 18/18 after updating the two presentation-affected mobile baselines. The presentation and infographic preview frames are now explicitly ready before screenshot comparison.
- `pnpm submission:build && pnpm submission:verify` produced the honest 17-asset `partial` package with `valid: true`, `stale: false`, and `tampered: false`.

### Decisions

- A one-sentence grounded claim should render as a strong sourced statement, not be padded with invented support or an empty text box. Output quality improves by adapting the layout to available evidence while preserving source fidelity.
- This is an internal visual-quality pass, not a cold professional endorsement. The `Send`/`Revise` product gate remains open until an external reviewer judges a real-use deck candidate.

### Open items

- Obtain the first cold professional `Send` or named revision on the external-use deck candidate and iterate from that evidence.
- Provider-backed GPT-5.6 Map reasoning, six GPT Image 2 panels, narration, and one Realtime microphone turn remain authorization-gated and unproved.
- Founder/Codex footage, primary `/feedback` Session ID, final video, public upload, and Devpost submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 13:27 CT — External-use deck candidate rebuilt through the current renderer

**Area:** Deliver / Dogfood one / Reproducible cold review

### Changed

- Rebuilt the AI Collective chapter-launch candidate after the presentation-layout improvement so the external reviewer no longer sees the stale pre-fix output.
- Added a checked-in, claim-level `deck-input.json` with exact source locators, the already-authorized embedded logo, and one root command, `pnpm dogfood:deck:build`, that recreates the responsive HTML, editable PowerPoint, PDF round trip, and five review images.
- Removed the vague `We’ll help you with this` support fragment from the financially-sustainable-events slide. The claim now uses the sparse grounded composition instead of padding a weak source sentence.
- Added a one-page contact sheet and refreshed the external dogfood evidence hashes.

### Verified

- `pnpm dogfood:deck:build` produced five slides and reported SHA-256 hashes for HTML, PowerPoint, and PDF.
- `unzip -t` found no errors in the editable `.pptx`; `pdfinfo` reported five 16:9 pages.
- Inspected all five PowerPoint-round-trip pages together in `outputs/dogfood-ai-collective-chapter-brief/contact-sheet.png`. The sequence has no observed overflow, raw implementation labels, duplicated recommendation, or empty body furniture.
- `pnpm --filter @workshoplm/production test` passed 5/5 renderer tests, and `pnpm check` passed lint, typecheck, and tests across all 13 packages.

### Decisions

- A cold reviewer must judge the same renderer version the product currently ships. External dogfood packages therefore need reproducible inputs and should be refreshed when a material output-quality fix lands.
- Source fidelity outranks filling space. When the selected evidence contains no useful supporting sentence, the layout should carry the grounded claim confidently rather than invent or retain weak copy.

### Open items

- A representative professional still needs to return `Send` or name the first blocking revision. Internal visual inspection does not close that gate.
- Provider-backed Map reasoning, GPT Image 2 panels, narration, and one Realtime microphone turn remain unproved; final video and submission publication remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 13:34 CT — Outputs now lead with the professional wedge

**Area:** Product strategy / Outputs hierarchy / Responsive verification

### Changed

- Corrected the mismatch between the professional product strategy and the Outputs gallery: the newest Presentation now owns the single full-width hero position instead of appearing as one equal card among five deliverables.
- Preserved Infographic, Image set, Storyboard, and Video as supporting Outputs in workflow order, with no new tabs, labels, controls, navigation, or product concepts.
- Kept the implementation inside the approved `EntityCardAction` and artifact-preview composition; the hierarchy is expressed through the existing media-card grid rather than new chrome.
- Added a browser assertion that exactly one hero Output exists and that it is the Presentation.

### Verified

- Inspected the production desktop, compact, and mobile Outputs screenshots. Desktop leads with a large, real presentation preview; compact and mobile retain the same first-item priority without horizontal overflow or extra interaction cost.
- The strict production Playwright suite passed 18/18 scenarios after refreshing the affected Outputs, partial, stale, and completed-video baselines.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages; web passed 15/15 unit and contract tests.
- `pnpm demo:e2e` passed all six recorded-fixture gates through rendered Video.

### Decisions

- The wedge should be obvious from composition, not from a badge explaining product strategy. The deck receives more visual weight while every supporting Output remains directly accessible.
- Only the newest Presentation is the hero. Older versions remain visible history but must not compete with the current deliverable.

### Open items

- Provider image bytes are still required to finish the visual gallery; the Image set remains honestly planned.
- The external deck still needs a representative professional's `Send` or first blocking revision.
- Provider-backed Map, image, narration, and Realtime evidence plus final founder footage and public submission remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 13:39 CT — Public README reconciled to the professional product truth

**Area:** Repository / Product narrative / Judge inspection

### Changed

- Replaced the implementation-first opening with the primary user, weekly professional problem, and source-defensible Presentation wedge.
- Added the one-line professional path from meeting or documents through grounded Map, approved Brief and reusable Style, editable Presentation, supporting Outputs, approved Storyboard, and Video.
- Corrected stale capability language: presentation and infographic now name their editable PowerPoint handoffs; Video names immutable local versions and per-scene provenance; plugin `0.1.2` names grounded reads plus version-gated local writes rather than a thin read-only shell.
- Added one deterministic local inspection route and preserved explicit boundaries around unsupported native ChatGPT synchronization, unverified ChatGPT Work invocation, and every paid-provider capability.

### Verified

- Parsed every local Markdown link in `README.md`; all five targets exist.
- `pnpm demo:reset`, `pnpm demo:e2e`, `pnpm demo:render`, and `pnpm demo:thumbnail` all passed in the documented order.
- The acceptance run passed all six gates, the worker produced a 671,469-byte MP4, and the thumbnail command produced a hashed PNG without changing tracked output.
- Reconciled plugin version and capabilities directly against `.codex-plugin/plugin.json`, `packages/plugin-mcp/src/server.ts`, and the tested tool definitions.

### Decisions

- The README should answer “does this replace part of my workflow?” before explaining the monorepo or hackathon machinery.
- Deterministic fixture proof and live-provider proof remain separate. A working fallback may teach the product without being described as a live model run.

### Open items

- Final provider evidence, public YouTube URL, `/feedback` Session ID, final Devpost fields, and a logged-out public-link pass still block the repository/submission completion item.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 13:42 CT — Meta-demo claim corrected before recording

**Area:** Submission / Claim integrity / Meta-demo

### Changed

- Removed `It built itself` from the tagline and replaced the broad `WorkshopLM built itself` passage with two separately provable claims: Codex built WorkshopLM from the goal file; WorkshopLM produced a traced partial submission fixture.
- Added a gated final-submission slot. The packet may say WorkshopLM produced the public submission only after final Devpost copy, deck, thumbnail, Storyboard, narration, and public Video verify together as a non-partial Output set.
- Replaced the unsupported present-tense tagged-release claim with a future publication requirement and changed the judge path from `complete live flow` to `captured product flow`.
- Updated the claim ledger and evidence audit to distinguish Codex desktop grounded-read/doorway proof from the locally tested plugin write-to-service boundary.
- Added the final self-produced-submission evidence check to the recording script and made the reveal wording safe for both provider-backed and recorded-fixture cuts.

### Verified

- The Devpost tagline is 164 characters, below the 200-character limit.
- Searched the tracked submission packet for `built itself`, `read-only MCP`, `pinned to`, `Every Codex session`, `complete live flow`, and `self-built`; no stale affirmative claim remains.
- `pnpm submission:build` produced a 17-asset manifest with status `partial`, input fingerprint `36a648eaf8f43657e7ba2200cfb27269ea92796824544c08bb28384fd44412b3`, and four explicit provider limitations.
- `pnpm submission:verify` returned `valid: true`, `stale: false`, `tampered: false`, and no issues.

### Decisions

- The meta-demo is stronger when each layer is precise. Codex building the product and WorkshopLM tracing its own fixture are both valuable without collapsing them into an unsupported self-build claim.
- Finality is an artifact state, not copywriting. The strong final-submission line unlocks only from a non-partial verified manifest.

### Open items

- Provider-backed media, the final public Video, and final Output-set verification still gate the strongest meta-demo line.
- Founder brainstorm footage, Codex doorway footage, `/feedback` Session ID, public URL, release tag, and logged-out checks remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 13:46 CT — Film verifier now checks submission finality semantically

**Area:** Demo video / Evidence gate / Final submission

### Changed

- Added `final-submission-output-set` as a required judge moment in the 2:42 paper edit's meta-reveal shot.
- Added the actual submission manifest as required evidence with a `ready-submission-manifest` validator.
- Changed evidence evaluation from file existence alone to `exists` plus `satisfied`, with an explicit issue when a present artifact fails its semantic requirement.
- The final-submission validator now requires manifest status `ready` and an empty limitations array; malformed JSON, a missing status, `partial`, or any remaining limitation fails closed.
- Added semantic failure reasons to both JSON and Markdown edit-readiness reports.

### Verified

- `pnpm demo:film:verify` passed structural validation of the ten-shot, 162-second plan and regenerated the draft report.
- The existing submission manifest is correctly reported as `exists: true`, `satisfied: false`, with `Submission status is partial, not ready.`
- `pnpm demo:film:verify-final` failed as designed: five blocked shots and eleven missing or unsatisfied evidence items, including the non-partial final submission Output set.
- Narration remains 302 words at 111.9 words per minute, inside the verifier's 100–155 range; the source walkthrough hash still matches its manifest.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages after the verifier change.

### Decisions

- Finality cannot be proven by dropping any JSON file at the expected path. The artifact must declare a ready state with no known limitations.
- The verifier may keep a strong final-reveal narration only because it is now impossible to mark that shot ready from the current partial fixture.

### Open items

- The meta-reveal remains blocked on both the eligible `/feedback` Session ID record and a ready, limitation-free final submission manifest.
- The other film blockers remain Codex doorway footage, founder brainstorm and transcript, Realtime/GPT-5.6 evidence, provider image gallery, provider narration, and final export.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 13:52 CT — Approved media now fails closed at the render boundary

**Area:** Video / Trust / Provenance integrity

### Changed

- Tightened current-narration eligibility from a panel-count check to an exact one-to-one identity check against the approved Storyboard.
- Staged narration in approved Storyboard order rather than provider-record order, so panel-to-clip identity cannot drift silently.
- Recomputed and compared SHA-256 for every provider narration clip and approved Storyboard image immediately before HyperFrames staging.
- A changed image or narration file now fails the render before HyperFrames runs and leaves the job in the existing retryable state.
- Added explicit tamper tests for narration and image bytes, and corrected success fixtures to use their real content hashes.

### Verified

- `pnpm --filter @workshoplm/worker test` passed 65 tests across eight files, including both new fail-closed cases.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages.
- `pnpm demo:e2e` passed the complete recorded Capture → Shape → Deliver seam with all six gates true and a rendered hashed MP4 artifact.

### Decisions

- Approval means the exact reviewed bytes, not merely a matching path, panel count, or filename. The video worker therefore treats provenance hashes as an enforcement boundary rather than documentary metadata.
- Provider narration may replace the disclosed deterministic fallback only as a complete current set. Partial provider audio is never mixed into a supposedly approved final render.
- The colleague's product-first framing is already reflected in `GOAL.md`: the professional deck is the wedge, the send-it bar is the quality test, and trust plus the weekly return visit outrank additional output breadth. This milestone strengthens that trust promise without reopening scope.

### Open items

- The provider-backed narration and six-image batch still require an explicitly authorized paid run and human visual/listening review before judge-facing use.
- Audio duration fit against each approved Storyboard panel remains a live-provider review item; no provider audio has run on this account yet.
- The external AI Collective deck still needs a real professional `Send` or first-revision verdict.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 13:57 CT — Provider narration is validated for identity, playability, and timing

**Area:** Video / Provider readiness / Professional quality

### Changed

- Added a worker-side defense-in-depth gate for malformed current narration records. The domain write boundary already rejects missing and duplicate panel identities; a corrupted persisted record now also fails before fallback or HyperFrames can run.
- Preserved fallback narration only for genuinely absent, stale, or older-Storyboard provider audio. A malformed current provider result is never silently presented as a successful fallback render.
- Added structural RIFF/WAVE inspection for Speech API bytes, including bounded chunk parsing, byte-rate validation, a non-empty playable data requirement, and truncated-file rejection.
- Added an approved-timing gate: any provider clip longer than its Storyboard panel by more than 250 ms becomes a retryable panel failure rather than clipped final narration.
- Replaced fake RIFF strings in adapter tests with deterministic valid PCM WAV fixtures and added malformed-audio and duration-overrun coverage.

### Verified

- The first broad `pnpm check` correctly exposed a TypeScript narrowing issue and DOM `Response` fixture mismatch that Vitest transpilation alone did not; both were repaired before acceptance.
- `pnpm --filter @workshoplm/worker test` passed 68 tests across eight files, including corrupted persistence, modified media hashes, malformed WAV, and narration overrun cases.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages.
- `pnpm demo:e2e` passed all six recorded gates and produced the same hashed deterministic Video artifact.

### Decisions

- A professional Video cannot clear the send-it bar if speech is truncated or an invalid provider payload is accepted as narration. Storyboard timing is therefore an executable approval constraint, not advisory metadata.
- Provider media remains panel-retryable so one invalid or overlong clip does not discard the valid clips or consume another full narration batch.

### Open items

- The first paid narration run still needs explicit request authorization, listening review, and confirmation that the selected voice consistently fits approved panel timing.
- No live-provider quality claim is unlocked by deterministic WAV fixtures.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 14:00 CT — GPT Image bytes now pass a real media gate

**Area:** Images / Provider readiness / Provenance integrity

### Changed

- Added structural validation between Image API base64 decoding and panel persistence.
- A provider image must have the PNG signature, a first valid IHDR chunk, positive width and height, bounded chunks, a terminal IEND chunk, no trailing bytes, and dimensions matching the requested output size.
- Invalid, truncated, incomplete, trailing-byte, or wrong-sized payloads become panel-level selective-retry failures. They never receive `generated` state or flow into Storyboard and Video provenance.
- Replaced arbitrary string image fixtures with the real deterministic Style reference PNG and added malformed-byte plus wrong-dimension regression cases.

### Verified

- `pnpm --filter @workshoplm/worker test` passed 69 tests across eight files.
- `pnpm --filter @workshoplm/worker typecheck` passed.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages.
- `pnpm demo:e2e` passed all six recorded gates and retained the deterministic rendered Video artifact.

### Decisions

- A `.png` filename and base64 transport do not prove an image is renderable. The provider adapter must validate the actual decoded media before upgrading panel state.
- Media validity is distinct from visual quality. This gate protects the production seam, while the real six-panel coherence and deck-usability review remains open until paid generation is explicitly authorized.

### Open items

- No real GPT Image 2 output has run or been visually reviewed; the image-gallery, coherence, and professional send-it checks remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 14:06 CT — Paid live-run recovery is evidence-bound and reset-safe

**Area:** Live operator / Spend safety / Recovery integrity

### Changed

- Bound `--retry-failed` to a durable paid `partial` or post-Map `failed` operator record. No-spend preflight state, passed runs, no-call failures, and failed initial GPT-5.6 Map attempts cannot enter retry mode.
- Added a SHA-256 state fingerprint over the persisted Workshop ID, Storyboard version, GPT reasoning evidence, image versions/status/request IDs/hashes, narration request IDs/hashes/failures, and immutable Video versions/hashes.
- Retry now requires the durable operator record's fingerprint to match the exact current persisted state, preventing an old, fabricated, or mismatched record from skipping GPT-5.6 or authorizing selective media claims.
- Normal preflight and execution now refuse to erase reusable paid state. Intentional discard requires the explicit `--reset-paid-state` flag; it cannot be combined with retry.
- Updated the live-provider runbook and current GOAL risk statement with the recovery and destructive-reset boundaries.

### Verified

- `pnpm demo:live` returned the expected no-spend twelve-request plan: one GPT-5.6 Map, six GPT Image 2 panels, and five narration clips.
- `pnpm demo:live -- --retry-failed` rejected ordinary preflight state because no eligible paid run record existed.
- With a simulated paid partial record, normal preflight failed closed and the SQLite SHA-256 remained exactly `3a0dbe195bd662a161bbee013d97b3aa6e5550667efc997ff921c13f9edb48dc` before and after the attempt.
- The same simulated record was then rejected for retry after fingerprint binding because it did not match persisted Workshop evidence. The temporary record was removed after the test.
- Worker tests passed 72 cases across eight files, including retry eligibility, paid-state protection, and fingerprint drift.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages; `pnpm demo:e2e` passed all six recorded gates.

### Decisions

- Request ceilings prevent overspend, but do not by themselves protect the truth of a recovery run. Retry authority must come from both the terminal run record and the exact state it describes.
- A routine preflight is not authorized to destroy paid evidence. Destructive reset remains available, but only through an explicit operator flag whose name states the consequence.

### Open items

- The normal twelve-request live run remains unexecuted pending explicit spend authorization.
- The single latest-run record is sufficient for the current bounded operator path; a multi-attempt historical ledger remains unnecessary unless more than one paid run must be retained for judge evidence.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 14:13 CT — Realtime voice now survives the final paid-run handoff

**Area:** Realtime / Live operator / Submission readiness

### Changed

- Added one canonical extractor for complete provider-verified WebRTC turns: exact `gpt-realtime-2.1` transport, `gpt-realtime-whisper` transcription, non-empty text, and matched non-empty provider item/event IDs.
- The live operator now snapshots those verified turns before its clean rebuild, re-ingests their exact text and provider provenance, and uses them as the transcript/source input for GPT-5.6 and downstream work.
- No-spend preflight now reports `providerVoiceReady`, `providerVoiceTurns`, a concrete voice-capture action, and no paid `nextCommand` while voice evidence is absent.
- Normal paid execution refuses before any GPT-5.6, GPT Image 2, or Speech request when verified voice is absent. `--reset-paid-state` deliberately discards preserved voice along with the rest of the clean operator state.
- Submission readiness now reuses the same strict WebRTC evidence definition instead of a looser duplicate check.

### Submission integrity added in the same pass

- `ready` now requires a hashed GPT-5.6 grounded-graph run, all six exact-reference GPT Image 2 panels with recorded file hashes, and one unique current OpenAI narration clip for every Storyboard panel.
- Packaging recomputes the MP4, image, and narration hashes from disk before copying them.
- Packaging parses the Video provenance sidecar and compares it with a freshly rebuilt expected per-scene provenance object from the current approved Storyboard, Style, image bindings, narration hashes, claims, and Sources.
- A changed sidecar or changed provider media now fails before `manifest.json` can be emitted.

### Verified

- Worker tests passed 75 cases across eight files, including verified-Realtime extraction, complete-ready provider evidence, incomplete narration, and tampered Video provenance.
- The no-spend preflight first returned `providerVoiceReady: false`, `providerVoiceTurns: 0`, and `nextCommand: null`.
- A paid-shaped command with a test key and twelve-request ceiling refused before provider dispatch because voice was absent.
- A synthetic local WebRTC-evidence turn was used only to test preservation: the next preflight returned `providerVoiceReady: true`, preserved one turn through the clean rebuild, and printed the bounded paid command. `--reset-paid-state` then removed that synthetic state; the current operator root is honestly back to `providerVoiceReady: false`.
- `pnpm submission:build` produced the expected 17-asset `partial` fixture with the same four explicit provider limitations; `pnpm submission:verify` returned valid, not stale, and not tampered.
- `pnpm check` passed all 13 packages and `pnpm demo:e2e` passed all six recorded gates.

### Decisions

- Realtime cannot remain a disconnected demo clip. The voice turn that judges see must be the same durable Source that the paid Map and outputs consume.
- The paid media run should not be allowed to succeed into a package that can never become `ready`; voice eligibility is therefore a pre-spend gate.
- A manifest hash is insufficient when source media or its provenance sidecar can be altered before packaging. The package builder enforces persisted hashes and semantic provenance before it creates the manifest.

### Open items

- A real microphone turn remains unrecorded. The current preflight now tells the operator exactly how to produce it and will not expose the paid command until it exists.
- The twelve-request GPT-5.6/Image/TTS run and human media review remain authorization-gated.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 14:08 CT — First-use onboarding and Company Styles are implementation-locked

**Area:** Product / Onboarding / Style / Testing plan

### Changed

- Added the complete welcome and new-user setup contract to `GOAL.md`: outcome selection, Workshop naming, nonblocking company-website analysis, unified source intake, first-Map orientation, visual Company Style review, Brief-to-Outputs enforcement, and first-Outputs orientation.
- Locked multiple reusable Company Styles plus a clean-default escape hatch. Company identity is reusable; Client pitch, Board presentation, and Team workshop remain Workshop-specific.
- Defined the visible Company Style review around selected logo candidates, exact editable hex colors with semantic roles, heading/body font candidates with availability and licensing truth, a live preview, and collapsed supporting guidance.
- Defined persistence, revision, migration, local-asset, SSRF/media safety, failure fallback, accessibility, responsive, regression, browser, and end-to-end acceptance requirements.

### Verified

- Re-read the current implementation: website analysis already inspects the public page and bounded linked stylesheets, extracts normalized color candidates, font-family candidates, and likely logo/icon URLs; the Style Library already reuses saved Styles across Workshops.
- Compared the contract with current official Canva Brand Kit patterns and Google's Pomelli/NotebookLM first-use patterns. The selected design keeps Canva-like reusable brand structure, Pomelli-like website analysis, and NotebookLM-like speed to the first useful grounded object.
- `git diff --check -- GOAL.md` passed after the implementation contract was added.

### Decisions

- A company website entered for Style analysis never enters factual Source scope automatically.
- Company Style saving is setup, not a third approval. Only Brief and Storyboard remain blocking approvals.
- Website analysis should run without blocking source ingestion or Map work; reviewed Style remains mandatory before Outputs.
- Existing Workshops and the judge fixture migrate as onboarding-complete so this increment cannot hijack established demo routes.

### Open items

- Implement every open onboarding acceptance item in the new dedicated GPT-5.6 Terra High task, including inspected in-app-browser proof and the full regression suite.
- Real uncoached professional use remains a separate human validation gate after deterministic clean-start testing passes.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 14:29 CT — The durable first-use path reaches real finished work

**Area:** Product / Onboarding / Company Styles / Browser verification

### Changed

- A genuinely fresh local data root now opens a Welcome flow instead of silently presenting the seeded Build Week fixture. Existing persisted Workshops and the explicitly seeded visual/judge fixture migrate or open as onboarding-complete.
- Added durable Workshop-specific outcome, onboarding step, completion time, and Map/Outputs orientation state without adding another approval gate. `Client pitch`, `Board presentation`, and `Team workshop` remain separate from reusable Company identity.
- Implemented the official-component Welcome → Company Style → unified Source intake → real editable Map path. The professional can use the latest saved Style, review a website suggestion, or save `Clean professional`; Company website copy explicitly says it is not a factual Source.
- Added one-time, persisted Map and first-Presentation orientation cards. The permanent header still exposes the source count and `Approve brief`; the only blocking approvals remain Brief and Storyboard.
- Applying a saved Company Style now preserves the current Workshop outcome instead of importing the Style snapshot's prior intent. The clean default inherits the selected Workshop outcome and becomes a real Style Library entry.
- Corrected the visible one-source label from `1 sources` to `1 source`.

### Verified

- Focused worker and web tests passed: 76 worker cases across eight files and 15 web unit/contract cases across four files.
- The production browser suite passed all 19 tests. It now proves a new Workshop can choose an outcome, persist its name, select or create a reusable Company Style, add representative meeting notes, build the real Excalidraw Map, dismiss orientation durably, approve the Brief, create Outputs, dismiss the first-Presentation cue, and open an editable PowerPoint.
- Inspected the four new 1200×800 browser baselines for Welcome, Company Style, Source intake, and the editable Map. The Map baseline waits for the real Excalidraw canvas and contains the ingested grounded node; the orientation card does not cover the Source count or `Approve brief`.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages.
- `pnpm demo:e2e` passed all six recorded gates after the fresh-root behavior changed.
- `pnpm submission:build` produced the expected truthful 17-asset `partial` set with four provider limitations; `pnpm submission:verify` returned valid, not stale, and not tampered.
- `git diff --check` passed before tracking updates.

### Decisions

- Production defaults to an honest empty first run. Seeded behavior now requires the explicit `WORKSHOPLM_SEEDED_FIXTURE=1` test/fixture boundary.
- The first-use surface shows only the latest saved Company Style, keeping the decision calm; the existing full Style Library remains available inside a Workshop.
- Website-derived brand findings remain candidates until reviewed. The remaining Company Style work must add explicit role/availability metadata and validated local asset persistence before those acceptance items close.

### Open items

- Website analysis still completes in the focused setup step rather than running as a persisted, reload-safe task beside Source ingestion. That contract remains open.
- Brand candidate classification, explicit palette/type roles, font availability/licensing truth, validated local asset copying/hashing, and failure-state coverage remain open.
- The orientation cards dismiss durably, but the quiet `How WorkshopLM works` return entry is not implemented yet.
- Mobile first-use screenshots and a real public-website in-app-browser run remain open; the existing completed-Workshop mobile/compact suite remains green.
- Live microphone, GPT-5.6, GPT Image 2, Speech, and final-video evidence remain unchanged and authorization-gated.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 14:40 CT — Company Style analysis runs beside the work

**Area:** Product / Onboarding / Company Styles / Browser verification

### Changed

- Company-website analysis is now a persisted Workshop task with honest `Reviewing`, `Ready`, and `Couldn't review` states. Starting it returns immediately to Source intake instead of holding the professional in a progress screen.
- Source ingestion, real Excalidraw Map creation, Map editing, and Brief approval remain available while analysis runs. The website remains brand evidence only and is never added to factual Sources.
- The Map quietly polls only while analysis is active. A compact status card exposes `Review style` when findings arrive and useful retry, manual, and clean-default fallbacks when analysis fails.
- Website findings open in the existing Company Style sheet with the analyzed domain, editable name, palette, type, and the current Workshop outcome already populated; saving creates the reusable Company Style.
- A stale asynchronous result cannot overwrite a newer website request. Worker tests prove persisted reviewing, ready, stale-result, and error transitions.

### Verified

- Focused worker tests passed all 77 cases across eight files; web unit and contract tests passed all 15 cases across four files.
- The production build passed, and the production browser suite passed all 20 tests. The new test proves a ready website review can open from the editable Map while the Source count, Excalidraw canvas, and `Approve brief` action remain available.
- Inspected `desktop-map-style-ready.png`: the style-ready card stays compact in the upper-right and does not displace the professional's grounded Map or next action.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages.
- `pnpm demo:e2e` passed all six recorded-fixture gates. `pnpm submission:build` produced the expected truthful 17-asset partial set with four provider limitations; `pnpm submission:verify` returned valid, not stale, and not tampered.

### Decisions

- Brand analysis is parallel setup, not a modal workflow or third approval gate. Only creating Outputs waits for a reviewed Company Style.
- The browser polls persisted task state instead of inventing progress percentages or relying on page-local promises, so reload and navigation cannot fabricate completion.
- The current website-analysis protections and bounded fetch path remain the authority; this increment adds orchestration and visible state without weakening source or network boundaries.

### Open items

- Explicit palette and typography roles, font availability/licensing truth, candidate asset review, and validated local asset copying and hashing remain open.
- The broader failure matrix, Company Style revision behavior, accessible orientation return entry, mobile first-use proof, and real-public-website in-app-browser run remain open.
- Live microphone, GPT-5.6, GPT Image 2, Speech, and final-video evidence remain unchanged and authorization-gated.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 14:55 CT — Company Styles distinguish brand evidence from usable inputs

**Area:** Product / Company Styles / Trust / Responsive verification

### Changed

- Company Styles now persist explicit Accent, Text, and Background roles with exact six-digit hex values and whether each value came from a website, manual entry, or the clean default.
- Heading and Body are now separate typography roles. Every role records whether the family is a system font, explicitly confirmed by the professional, or still an unverified website candidate.
- Website analysis returns candidate typography as unverified evidence. It no longer silently promotes a discovered CSS family into the renderer's licensed-font list.
- The Style review shows the three color jobs, exact values, Heading and Body fields, and a plain availability statement. Custom or website-discovered fonts require the professional to confirm that they can be used; otherwise the live preview and generated work use a safe system fallback.
- `DESIGN.md` and its versioned token file now preserve palette roles, typography roles, availability, evidence origin, and only the font families actually confirmed for generated work. Existing saved Styles normalize safely into the new metadata without losing their prior colors or confirmed fonts.

### Verified

- The deterministic linked-CSS fixture proves normalized role colors, an unverified website font candidate, a likely logo asset, editable correction, unconfirmed safe fallback, explicit confirmation, and the resulting version-two Style token contract.
- Worker tests passed all 77 cases across eight files; web tests passed all 15 cases across four files.
- The production build passed and the production browser suite passed all 20 tests from a normal non-update run. Website review is covered at 1200×800, 1024×768, and 390×844; the browser test proves an unconfirmed candidate is not sent as a licensed input and a confirmed candidate is.
- Inspected the responsive Style and website-review baselines plus current, stale, and Video Output states before accepting the intentional captures. Test fixture routing now isolates saved Styles so results do not depend on test order.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages. `pnpm demo:e2e` passed all six recorded-fixture gates.
- `pnpm submission:build` produced the expected truthful 17-asset partial set with four provider limitations; `pnpm submission:verify` returned valid, not stale, and not tampered.

### Decisions

- Finding a font on a public website proves visual evidence, not licensing or local availability. WorkshopLM must never collapse those claims.
- The legacy flat palette and font fields remain as renderer-compatible projections; the role metadata is the inspectable source of truth and can evolve without breaking current deck, infographic, image, and video consumers.
- Broad screenshot changes were accepted only where a clean full-suite run reproduced the current product state; no visual baseline was accepted in place of behavioral assertions.

### Open items

- Brand assets are still text candidates. Visual selection, media/SVG validation, bounded local copying, hashing, and renderer use remain open.
- The full website failure matrix, saved Style revision semantics, accessible orientation return entry, and real-public-website in-app-browser run remain open.
- Live microphone, GPT-5.6, GPT Image 2, Speech, and final-video evidence remain unchanged and authorization-gated.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 15:12 CT — Selected brand assets become verified local inputs

**Area:** Product / Company Styles / Trust / Output quality

### Changed

- Website Style review now renders each detected brand asset as a visual candidate and leaves it unselected until the professional explicitly opts in. The review explains that only authorized assets should be selected.
- A selected remote asset must be a bounded PNG, JPEG, WebP, or safe SVG from a public HTTP(S) target. WorkshopLM validates response type, file signature, byte size, dimensions, pixel count, and dangerous SVG constructs before it can enter a saved Style.
- Accepted bytes are copied into the Workshop data root under their SHA-256 digest. `DESIGN.md` and its version-three token file retain the local path, source URL, media metadata, dimensions, and hash.
- Presentation and infographic rendering read the reviewed local copy, recheck its hash and dimensions, and embed it directly. A changed or corrupt copy fails closed instead of silently entering finished work.
- Added a no-store brand-preview route that applies the same bounded validation without persisting unselected candidates.

### Verified

- Worker tests passed all 78 cases across eight files, including safe SVG persistence and renderer use, hash-tamper rejection, invalid SVG rejection, spoofed PNG rejection, oversized-media rejection, and clearing unselected assets.
- Web tests passed all 15 cases across four files. The production browser suite passed all 20 tests from a normal non-update run and proves the exact reviewed asset URL—not the raw candidate list—is submitted when saving the Style.
- Inspected the website Style review at 1200×800, 1024×768, and 390×844. The candidate remains legible and selectable without adding navigation or obscuring the existing Brief context.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages. `pnpm demo:e2e` passed all six recorded-fixture gates.
- `pnpm submission:build` produced the expected truthful 17-asset partial set with four provider limitations; `pnpm submission:verify` returned valid, not stale, and not tampered. `git diff --check` passed.

### Decisions

- Website discovery is evidence, not authorization. No detected asset is selected by default, and remote bytes never become a renderer input until the professional chooses the candidate and validation succeeds.
- Local content hashes are part of the Style contract, not merely cache keys. Generated work must fail closed when the reviewed bytes change.
- The product-first roadmap is now explicit in `GOAL.md`: complete the bounded Company Style reliability work, then prioritize provider-backed Map timing, an external professional deck review, and deck-usable GPT Image 2 media ahead of more output breadth.

### Open items

- The complete website-analysis failure/fallback matrix, saved Style revision semantics, quiet `How WorkshopLM works` return entry, accessibility closure, and a real-public-website in-app-browser run remain open.
- Manual local asset paths retain the legacy path behavior; this increment proves the selected remote website-asset contract and does not claim every manual file path has equivalent validation.
- The professional send-it review, uncoached own-material timing, live microphone, GPT-5.6, GPT Image 2, Speech, and final-video evidence remain open and must not be inferred from deterministic acceptance.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 15:19 CT — Company Style failures preserve the work and a clear way forward

**Area:** Product / Company Styles / Reliability / Browser verification

### Changed

- Website analysis now distinguishes invalid addresses, private/local-network targets, redirect abuse, blocked scans, JavaScript-only app shells, pages with no useful public style findings, and other scan failures.
- Persisted failure state carries a stable category and privacy-safe user message rather than exposing raw network or parser errors.
- A page with no real colors, font candidates, or brand assets can no longer silently become a website-derived Style made from defaults. JavaScript-only shells and genuinely empty findings fail honestly.
- The existing Map recovery card remains the single failure surface: the professional can keep shaping and approving the Brief, then `Try again`, `Set manually`, or `Use a clean default` without restarting the Workshop.

### Verified

- Worker tests passed all 79 cases across eight files. The new matrix covers invalid input, generic scan failure, dynamic-site failure, no useful findings, redirect loops, redirect to a private target, and system-font fallback; the existing media tests continue to cover unsafe SVG, spoofed images, and oversized assets.
- Web unit tests passed all 15 cases across four files and the production Next.js build succeeded.
- The production browser suite passed all 21 tests. Its new recovery test keeps the real Map and `Approve brief` visible, opens the manual Style editor, retries the same public URL, and applies the clean default through the exact API actions.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages. `pnpm demo:e2e` passed all six recorded-fixture gates.
- `pnpm submission:build` produced the expected truthful 17-asset partial set with four provider limitations; `pnpm submission:verify` returned valid, not stale, and not tampered. `git diff --check` passed.

### Decisions

- A syntactically valid website is not a successful Style result. Website provenance requires at least one real public visual finding.
- Recovery belongs beside the work, not in a blocking setup loop. Style failure may block Output creation, but never Source ingestion, Map editing, or Brief approval.
- Failure messages describe the professional's next action and intentionally omit raw infrastructure details.

### Open items

- Saved Style revision semantics, the quiet `How WorkshopLM works` return entry, accessibility closure, and the real-public-website in-app-browser run remain open Company Style work.
- Manual local asset paths still retain legacy behavior; selected remote website assets have the stronger verified contract.
- Professional send-it review, own-material live timing, provider-backed voice/Map/Image/Speech evidence, and the final public video remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 15:30 CT — Company Style edits become explicit immutable revisions

**Area:** Product / Company Styles / Versioning / Trust

### Changed

- Saving an edit to an existing Company Style now creates an immutable family revision with a new record and stable Version number instead of overwriting the prior library row.
- The Style Library returns only the latest revision for normal selection while retaining older records for Workshops that still reference them.
- Existing Workshops keep their prior Style snapshot and current Outputs. Applying the latest revision is an explicit action and invokes the existing dependency contract so presentation, infographic, Images, Storyboard, narration, and Video become `Needs update` where applicable.
- The Brief summary and saved Style choices show the active Version. Editing copy now says `Save new version`, making the consequence clear before submission.
- `DESIGN.md` and its executable token file record both the Workshop-local Style version and reusable Company Style family revision.

### Verified

- Worker tests passed all 80 cases across eight files. The new cross-Workshop test creates Version 1, reuses it in another Workshop with a current deck, creates Version 2, proves the other Workshop remains byte-for-byte on Version 1, then explicitly applies Version 2 and observes the deck become stale.
- The same test proves both immutable revision rows remain in SQLite while the normal Style Library returns only Version 2, and verifies revision metadata in `DESIGN.md` and its token file.
- Web unit tests passed all 15 cases across four files. The production browser suite passed all 22 tests after a clean `.next-playwright` rebuild; its new interaction test reads the current Version, edits Accent, uses `Save new version`, and verifies the exact Style-save request.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages after restoring the tracked default Next type reference. `pnpm demo:e2e` passed all six recorded-fixture gates.
- `pnpm submission:build` produced the expected truthful 17-asset partial set with four provider limitations; `pnpm submission:verify` returned valid, not stale, and not tampered. `git diff --check` passed.

### Decisions

- Company Style versioning is copy-on-write. A reusable brand system may advance without retroactively changing professional work already sent or under review.
- The everyday library stays simple by showing the latest revision only; old revisions remain addressable through the Workshop snapshots that use them rather than becoming a new history-management UI.
- Applying a newer revision is the user's explicit declaration that downstream work should be regenerated.

### Open items

- The quiet `How WorkshopLM works` return entry, accessibility closure, and the real-public-website in-app-browser run remain open Company Style/onboarding work.
- Manual local asset paths retain legacy behavior; selected remote website assets use the stronger verified asset contract.
- Professional send-it review, own-material live timing, provider-backed voice/Map/Image/Speech evidence, and the final public video remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 15:36 CT — Dismissed guidance remains quietly available

**Area:** Product / Onboarding / Navigation / Accessibility

### Changed

- The Workshop sheet now includes one secondary `How WorkshopLM works` entry so professionals can recover dismissed orientation without adding a persistent tab, toolbar item, or competing header action.
- The help sheet explains the product in three plain-language steps—Capture, Shape, Deliver—and names source tracing plus Brief and Storyboard as the only two sign-offs.
- Closing the help sheet returns keyboard focus to `Switch Workshop`, preserving the existing transient-sheet interaction contract.

### Verified

- Web unit tests passed all 15 cases across four files and the clean production Next.js build succeeded.
- The production browser suite passed all 23 tests. The new test opens and closes the help sheet at 1200×800, 1024×768, and 390×844, verifies the three steps and trust copy, detects no horizontal overflow, and confirms focus restoration.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages. `pnpm demo:e2e` passed all six recorded-fixture gates.
- `pnpm submission:build` produced the expected truthful 17-asset partial set with four provider limitations; `pnpm submission:verify` returned valid, not stale, and not tampered. `git diff --check` passed.

### Decisions

- Recoverable guidance belongs inside the existing Workshop switcher because it is infrequent reference material, not a primary mode or destination.
- The help surface teaches the durable workflow and trust contract only. It does not enumerate features or introduce internal vocabulary before the professional needs it.

### Open items

- Accessibility closure and the real-public-website Codex in-app-browser run remain open onboarding work.
- Manual local asset paths retain legacy behavior; selected remote website assets use the stronger verified asset contract.
- Professional send-it review, own-material live timing, provider-backed voice/Map/Image/Speech evidence, and the final public video remain open.
- Codex Session ID: unavailable on this surface; not inferred.
