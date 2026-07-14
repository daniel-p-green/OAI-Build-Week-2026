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
