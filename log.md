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

## 2026-07-16 03:51 CT — Final film assembly is deterministic and fail-closed

**Area:** Demo film / Meta reveal / Submission truth

### Changed

- Added `pnpm demo:film:final`, a one-command final compositor that preflights founder evidence and the final-operator submission package before touching final state.
- Final mode uses the verified Cedar narration set, substitutes the hash-bound founder recording for the capture beat, generates a raw-transcript-versus-submission reveal from the verified package thumbnails, and emits the 2:20 H.264/AAC public-film candidate.
- Final promotion is transactional: the plan becomes `final` only long enough to run the strict final verifier. Any error restores the original draft bytes and removes the emitted MP4 and manifest.
- The ready-submission film validator now invokes the complete package verifier against the owning Workshop state instead of trusting a `ready` string and an empty limitations array.
- Removed the Codex `/feedback` Session ID from film evidence. It remains an open Devpost form requirement, but it cannot truthfully block footage that proves the product workflow.
- Added `pnpm demo:film:preview-final` plus inspected 1280×720 clean-overlay, ten-shot contact-sheet, and meta-reveal previews under `outputs/demo-film-plan/`.

### Verified

- Visual inspection accepted the quiet bottom-caption treatment without covering native WorkshopLM controls. The meta reveal renders bounded transcript text beside three real package thumbnails and labels fixture preview content as sample-only.
- `pnpm check` passed all 13 packages, including 114 worker tests and 30 web tests.
- `pnpm demo:e2e` passed the complete recorded fixture seam. `pnpm submission:build` and `pnpm submission:verify` produced and verified the expected honest `partial` acceptance package.
- `pnpm demo:film:verify` passed in draft mode with eight ready shots, two blocked shots, a 140-second timeline, and exactly four open evidence items: founder MOV, founder transcript, final ready package, and final MP4.
- A deliberate `pnpm demo:film:final` attempt failed before assembly on the three missing prerequisite artifacts. The film-plan SHA-256 remained `4fd16337804e51d3ca983098f9c8057fab3ee7a212c3d7dbd6aa15094154db9b` before and after, and no final MP4 existed.
- `git diff --check` passed excluding the preserved unrelated `PLAN-2026-07-13.md` modification.

### Decisions

- Final film assembly should be repeatable and evidence-driven, not a last-minute editor checklist. The founder supplies only the genuinely human evidence; the repository now owns the remaining deterministic cut.
- `/feedback` proves Build Week participation in the submission form. It does not prove any visual film claim and stays out of the film gate.
- The rough cut retains its explicit fixture/pending labels. The clean editorial treatment is reserved for final mode and its non-claiming preview so draft truth is never visually laundered.

### Open items

- Founder MOV and transcript, final thirteen-request founder run, ready final-operator package, and final compositor execution remain open.
- External professional review, public upload/link verification, and eligible Session ID remain human-gated after the product and film are ready.
- No provider request ran in this milestone; the evidence ledger remains 97 HTTP operations and no exact-dollar total is invented.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 03:27 CT — Founder capture became a one-command, hash-bound final handoff

**Area:** Final demo input / Grounding / Provenance / Operator recovery

### Changed

- Added `pnpm demo:founder -- --founder-recording <video> --founder-transcript <text>` as the isolated final-Workshop entry point. It targets `.workshoplm/final-operator`; the existing paid `.workshoplm/live-operator` run is never reset or overwritten.
- The command now requires a paired recording and transcript, inspects the recording with `ffprobe`, requires video plus audio and at least three seconds, normalizes and bounds transcript content, and rejects inputs inside the reset target.
- Valid input is staged twice: private evidence under the final Workshop root and exact film inputs under `outputs/demo-film-inputs`. Both copies receive SHA-256, byte-count, duration, codec, and provenance manifests.
- Added an honest `manual_import` transcript path. A founder recording becomes a private grounded voice Source and Conversation turn without acquiring WebRTC provider fields or satisfying `verifiedRealtimeCaptures`.
- The live operator accepts a custom root only inside repository `.workshoplm`, preserves custom-root paid retry commands, and carries the founder file arguments into the paid execution command.
- The demo-film verifier now requires the founder recording and transcript to match `founder-capture.json`, re-probes playable audio/video, and rejects altered bytes or an overstated Realtime claim.

### Verified

- A real command-level preflight used a temporary 3.2-second H.264/AAC MOV and 182-character transcript. `demo:founder` returned `ready`, recorded `captureEvidence: founder-provided-recording-and-transcript`, kept `providerVoiceReady: false`, staged matching hashes, and emitted the isolated twelve-request paid command with the same founder inputs and film-staging flag.
- With those temporary files present, `pnpm demo:film:verify` accepted both founder evidence items and reduced the remaining missing list to the eligible Session record, ready final submission manifest, and final edited MP4. The temporary files were then removed; a second verifier run restored the honest current state of eight ready shots, two blocked shots, and five missing or unsatisfied items.
- Unit coverage now includes valid hash-bound staging, separate film staging, short-transcript rejection, missing-audio rejection, and private manual-import provenance. Worker coverage is 114 passing tests.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages. `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed; the deterministic acceptance submission remains correctly `partial`. `pnpm demo:film:verify` passed in draft mode and still refuses finality. `git diff --check` passed excluding the preserved unrelated `PLAN-2026-07-13.md` modification.

### Decisions

- A founder-provided recording is acceptable authentic meta-demo evidence and a grounded private voice Source. It is not OpenAI Realtime evidence unless the product actually records the provider item/event IDs over WebRTC.
- The final operator gets a separate durable root because replacing reusable paid sample evidence would add cost and destroy a useful recovery point.
- The film gate verifies content hashes and playable streams, not file existence. Tomorrow's recording should remove wiring work, not weaken the evidence standard.

### Open items

- Record and transcribe the real founder brainstorm, then run the one-command handoff. If the in-app browser microphone is available, prefer the genuine Realtime capture; otherwise keep the imported-file provenance label.
- Selectively execute the final Source-dependent provider run, build the ready final submission Output set, replace the two pending rough-cut shots, and export the final under-three-minute MP4.
- External professional deck review, public link verification, and an eligible Session ID remain open. `/feedback` is still intentionally deferred.
- No provider requests were made in this milestone. The evidence ledger remains 97 HTTP operations, with no unsupported exact-dollar claim.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 03:05 CT — Provider-backed film inputs and two-blocker rough cut verified

**Area:** Meta-demo / Evidence integrity / Film assembly

### Changed

- Added `pnpm demo:film:prepare-live`, a deterministic bridge from the current live-operator Workshop to privacy-safe film evidence. It validates the persisted Terra Map, all six GPT Image 2 panel hashes and requests, all five Cedar narration hashes and requests, and the current Video hash and streams before emitting anything.
- Produced `artifacts/live/provider-run.json` with the exact authorized-sample boundary, model/request provenance, hashes, media metadata, and explicit founder-Source limitation. Produced `artifacts/live/realtime-turn.json` from the inspected grounded WebRTC proof with an explicit controlled-synthetic-audio and non-founder disclosure.
- Copied the exact current provider-narrated HyperFrames Video into `outputs/demo-film-inputs/provider-narrated-video.mp4` and generated a six-second 1920×1080 film shot from the visually inspected live Outputs/gallery screen.
- Strengthened the film verifier so the provider-run JSON, Realtime evidence, gallery video, and narrated Video must satisfy their semantic and media contracts. Existence alone no longer clears those shots.
- Marked only the now-evidenced Outputs and render-and-trace shots ready; founder capture and final meta-reveal remain explicitly blocked. Rebuilt the full 2:42 editorial rough cut with the real provider-backed beats.

### Verified

- The preparation command verified Terra request `req_11ee10453c1e45cd8067e578171f82d6`, six distinct GPT Image 2 results, five current `gpt-4o-mini-tts` Cedar clips, and current Video Version 2.
- The copied Video remains byte-identical at SHA-256 `c2c7d29423c60cdd22a99a54fb591fb44697c79291bab2fec97f8616c8c356e2`; `ffprobe` reports H.264 video, AAC audio, and 25.002667 seconds.
- The gallery film input is H.264 1920×1080, six seconds, 80,370 bytes, and SHA-256 `c4a42738426da86d353e1557d3fe6949320c24f53de6779e74598b60c996673e`. Midpoint frame inspection shows the professional presentation, the complete six-panel coherent image set, the quiet Create summary, and approved Storyboard/Video state without overflow.
- `pnpm demo:film:verify` now reports eight ready shots, two blocked shots, and five remaining evidence gaps including the final export. The provider image and narration shots pass the new semantic/hash/media validators.
- `pnpm demo:film:rough` produced a 162.021333-second H.264/AAC editorial MP4 with SHA-256 `4175979e5bcf18254433dedd20544ba28d1f271b0577c729ae38f7cb61b41bfa`. Contact-sheet inspection confirms the live Outputs shot and provider Video appear in the intended beats.

### Decisions

- Reuse the already-inspected provider run instead of spending again for film assembly. The final founder Source will legitimately require selective regeneration; the sample run remains valuable technical evidence but cannot be misrepresented as the final meta-demo.
- Controlled Realtime audio proves transport and product behavior; it is preserved as technical evidence with a clear limitation while the separate founder recording remains the authentic capture requirement.
- A film readiness flag changes only after the evidence file and its semantic validator pass. Static `blocked` labels are not carried forward after the underlying provider evidence is actually complete.

### Open items

- Record the founder brainstorm and transcript in the Codex in-app browser, replace the sample Source, and rebuild only the provider outputs that must truthfully derive from it.
- Produce a non-partial final submission Output set, final edited MP4, and primary eligible Session ID record before changing the meta-reveal to ready.
- External professional deck review and public link verification remain open. No new provider request or paid call ran in this milestone; the evidence ledger remains at 87 operations.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 02:15 CT — Grounded Realtime voice and simplified visual contract verified

**Area:** Live OpenAI / Realtime voice / Grounding / Interruption / Visual acceptance

### Changed

- Removed `audio.input.transcription.prompt` from the `gpt-realtime-2.1` session configuration after the live provider returned `400` because that model does not support the field. The exact supported transcription shape is now regression-tested.
- Strengthened voice instructions so factual Workshop answers must use the shared grounded `search`/`fetch` tools before answering; writes remain behind the existing visible confirmation gate.
- Collapsed overlapping ASR completions so a shorter provider completion cannot duplicate the end of a spoken turn while retaining every provider item/event ID as evidence.
- Persisted interruption provenance from both `response.cancelled` and `response.done` with cancelled status. Saved capture evidence now carries the matching response and event IDs through the worker contract.
- Kept the Conversation activity summary calm by hiding a recovered read-tool failure only when a later call with the same tool and channel succeeds. Unrecovered failures remain visible.
- Added an explicitly authorized, isolated `live-realtime-proof.ts` harness that exercises the real browser WebRTC transport with deterministic microphone audio without mutating the live operator fixture.
- Reconciled the full visual snapshot set to the simplified Sources / current object / Create workbench. The accessibility test now begins immediately before the contextual next action instead of traversing Excalidraw's internal keyboard stops, and the old `Conversation` selector now follows the shipped `Chat` label.

### Verified

- A live grounded WebRTC run used `gpt-realtime-2.1` with `gpt-realtime-whisper`, persisted the spoken question and spoken answer, and completed one grounded `search` plus two exact `fetch` calls. Every successful call retains model, response, call, and event IDs. Evidence: `artifacts/live-review/realtime-grounded-conversation.json` and `.png`.
- A separate live WebRTC run recorded a real cancelled provider response when the user interrupted, then completed the redirected one-sentence answer with the same three grounded read calls. The saved Source/turn contains matching interruption response/event IDs. Evidence: `artifacts/live-review/realtime-interruption.json` and `.png`.
- Full-resolution inspection accepted the refreshed desktop Map, Outputs, Storyboard, Conversation, compact states, and 390×844 Outputs composition. The final production-build browser run passed all 28 visual/accessibility/responsive cases without snapshot updates.
- `pnpm check` passed all 13 packages: 30 web tests, 109 worker tests, 16 domain tests, 15 production tests, seven plugin tests, and every remaining suite.
- `pnpm demo:e2e` passed Capture → grounded Map → approved Brief/Style → six-image plan → five-panel Storyboard → approved rendered Video with one artifact-to-source trace.
- `pnpm submission:build` and `pnpm submission:verify` passed integrity checks. The deterministic acceptance set remains honestly `partial`; its fixture limitations do not erase or replace the separate live-provider evidence.
- Artifact SHA-256 values: grounded JSON `cfc5412410e6949900815d451b33729f024ff2e736cfa28eb76427f4bf7575ec`, grounded screenshot `bb5d997d964bb18c948d4af6696d749240f1272bedf768299839f368e091baf2`, interruption JSON `c56ab2cb18a91f44cd206dd1c4eb7c157008a53570da6df513b1e46ce3ef5a0d`, interruption screenshot `93abdcb02026a1fe3b3b36d16416dd95cfa92b849bb7106b9589cfa88a7ee07b`.

### Decisions

- Controlled Chrome is accepted as real provider/WebRTC proof because it exercised the shipped browser code, server-minted client secret, remote audio track, provider tools, durable persistence, and interruption events. It does not substitute for the founder's recording in the Codex in-app browser.
- The Codex in-app browser reached the current product and a valid Realtime token, but automation could not accept its microphone permission while it remained `prompt`. That is a recording interaction, not a provider or product-seam failure.
- A provider read retry that recovers should not make a successful grounded answer look broken. Diagnostic history remains durable; only the surface summary is condensed.
- `PLAN-2026-07-13.md` remains secondary to `GOAL.md`, implemented state, current evidence, and the user's prompt. Its unrelated working-tree modification remains preserved and excluded from this milestone.

### Spend and request evidence

- This increment initiated 22 additional OpenAI provider HTTP operations: four direct or in-app-browser client-secret probes and nine controlled proof sessions, each with one client-secret request and one WebRTC call. Together with the previously logged 42 attempts, the overnight run initiated 64 provider HTTP operations.
- Exact dollar debit is not returned by these responses. The additional Realtime sessions were short and the observed request shape remains safely below the authorized $50 ceiling, but no invented exact spend figure is claimed.

### Open items

- Grant microphone access once in the Codex in-app browser and record the founder's real brainstorm; capture one provider-originated write crossing the already-tested visible confirmation gate.
- Replace the sample Source, selectively regenerate only the outputs that the founder Source makes stale, and record the final under-three-minute public film.
- Obtain one external professional `Send` or blocking `Revise` response. The standalone provider Audio Overview, public links, and `/feedback` remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 01:33 CT — Live OpenAI seam and decisive product-quality pass

**Area:** Live providers / Grounded Map / GPT Image 2 / Cedar narration / HyperFrames / UI simplification / Visual QA

### Changed

- Ran two complete nine-request Sol/Terra/Luna benchmark passes against the real WorkshopLM routing tasks. All deterministic checks passed; the final comparable graph result selected `gpt-5.6-terra` as the grounded-Map default (2.815 seconds, 379 output tokens) over Sol (6.815 seconds, 424 output tokens).
- Completed the authorized sample-script live seam: one provider-grounded Terra Map, six coherent medium square GPT Image 2 panels, five current Cedar narration clips, approved Storyboard, and a deterministic local HyperFrames Video.
- Repaired two real provider seams rather than hiding them: strict Responses JSON schema compatibility and streaming WAV files with an unknown-length data sentinel. Rewrote overlong panel narration and derived scene timing from the approved spoken copy.
- Made `DESIGN.md` executable across production: intent-specific layout, image, and motion directives now flow into tokens, deck/infographic composition, GPT Image 2 prompts, Excalidraw palette treatment, HyperFrames staging, lint, inspection, and rendering.
- Replaced the crowded desktop workbench with contextual disclosure. Sources now show Chat plus compact source rows; the inline excerpt moved to the existing Source sheet. The right rail is only Brief, Style, Outputs, Storyboard, and Video. Completed work presents `View video` as the single next action. Outputs and focused artifacts automatically reclaim rail space.
- Replaced the timestamp-heavy live source label with `Voice brainstorm` in the visible product.
- Fixed an Excalidraw regression where its automatic text wrapping was written back as a user content edit and invalidated every finished artifact. The recovery removed only three whitespace-equivalent canvas operations, restored graph revision 24, and reactivated the exact approved Brief, Storyboard, Cedar narration, Outputs, and Video without a provider retry.
- Changed Map persistence so spatial movement and resizing remain editable but do not invalidate content-derived work. Direct label edits still stale the Brief and downstream work. Arranged the live seven-idea Map into a collision-free narrative grid and rendered connectors behind cards.
- Re-rendered local Video Version 2 with no provider calls: alternating 44/56 copy-and-art layouts, full-strength Cedar audio (`0.92`), quiet AI-voice disclosure, source-grounded eyebrow, scene counts, and the exact approved GPT Image 2 panel versions.
- Added a repeatable local UI review capture for desktop 1440×900 and compact 390×844 Map, Outputs, and Storyboard states.

### Verified

- Live Terra request ID: `req_11ee10453c1e45cd8067e578171f82d6`. Provider request and output hashes for the six images and five final Cedar clips remain in `.workshoplm/live-operator-run.json` and local Workshop state.
- OpenAI request accounting for this session: 42 attempts total — 18 benchmark, two schema-rejected Map attempts, one successful Terra Map, six successful GPT Image 2 panels, and 15 Cedar narration attempts across WAV validation and timing repair. Exact dollar debit was not returned by the provider responses; the request mix remained safely below the authorized $50 ceiling. No provider request was made for UI repair, Map recovery, or Video Version 2.
- `artifacts/live-review/gpt-image-2-contact-sheet.png` visually confirms six distinct professional jobs with one palette, folded-paper motif, lighting system, and no readable text, people, devices, logos, or stock-workplace scenes. No image regeneration was accepted as necessary.
- `artifacts/live-review/hyperframes-video-v2-contact-sheet.png` visually confirms five coherent scenes with readable hierarchy and materially stronger art direction than Version 1.
- Video Version 2: H.264 1920×1080 plus AAC audio, 25.002667 seconds, 1,250,904 bytes, SHA-256 `c2c7d29423c60cdd22a99a54fb591fb44697c79291bab2fec97f8616c8c356e2`.
- HyperFrames lint, transition inspection, and render completed through the normal local worker path before the immutable Version 2 artifact was recorded.
- `artifacts/ui-review/desktop-map.png`, `desktop-outputs.png`, `desktop-storyboard.png`, and their compact counterparts were generated from the real live Workshop. Full-resolution inspection confirmed no horizontal overflow, one obvious action, readable sources, collision-free Map cards, loaded artifact previews, and focused Storyboard editing.
- Web typecheck passed; 28 web tests passed. Worker typecheck passed; 109 worker tests passed, including spatial-only Map currency and semantic-edit invalidation. The live state remained Brief approved, Storyboard approved, Video rendered, two current deterministic document Outputs, six current provider images, and five current provider narration clips.

### Decisions

- Terra is the grounded-Map default because every candidate passed the quality gate and Terra was materially faster in the comparable live graph run. Sol remains the frontier candidate for quality-critical reasoning; Luna remains the fast candidate for repeatable bounded work.
- Audio Overview is optional in a finished Output set. Its absence no longer makes an otherwise complete deck/image/storyboard/video package falsely read `Needs update`; its own live provider proof remains a separate open item.
- Layout is presentation state, not claim content. Moving a grounded idea must not revoke professional approvals; renaming or changing its meaning must.
- Generated images should be visibly art-directed assets, not dark wallpaper. The renderer now reserves a deliberate image field and a separate copy field while preserving the current Style and negative rule against gradients.
- The user-facing demo truth remains `authorized sample voice brainstorm`, not provider-backed Realtime. No microphone, interruption, or live spoken write loop is claimed from this run.

### Open items

- Live-verify the Realtime microphone conversation, interruption, one read, one confirmed write, and durable provider event evidence.
- Generate and inspect one standalone provider-backed Audio Overview if it materially improves the final film.
- Capture the founder's real brainstorm, assemble the public under-three-minute meta-demo from the now-current live product, and complete external review, public links, submission fields, and `/feedback`.
- Exact account-side dollar debit is not visible in the API response artifacts; retain request-count evidence and the authorized $50 ceiling rather than inventing a precise spend figure.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 18:18 CT — Real Codex doorway replaces the rough-cut placeholder

**Area:** Host proof / Meta-demo / Privacy-safe capture

### Changed

- Opened the production WorkshopLM route at `127.0.0.1:3102` through the supported Codex in-app browser and recorded the containing ChatGPT/Codex window by macOS window ID.
- Cropped the recording to the in-app-browser pane before persistence so the final 12-second clip contains the real WorkshopLM tab, host browser chrome, local capture screen, and `Record voice` action without the unrelated Codex task pane or any other application.
- Extended `pnpm demo:film:rough` to consume a ready shot's captured `.mov`/`.mp4` evidence directly instead of falling back to a fixture still. The doorway shot now receives the truthful `CAPTURED EVIDENCE` label.
- Changed only the `codex-doorway` film state from blocked to ready and updated current instructions and GOAL evidence counts from five blocked shots to four.

### Verified

- The source clip probes as 12.000 seconds of 1920×1080 H.264 at 60 fps. SHA-256: `50a5d428e2010f4b149b7e693caa2a75b0aea6d70c7de97631ae6a565a29b67d`.
- Inspected a six-frame contact sheet and full-resolution midpoint frame from the final crop. No unrelated task text, other application, API key, private source content, or absolute local path appears in the persisted clip.
- Rebuilt the 2:42 rough cut and inspected its ten-shot contact sheet. Shot 2 now shows the real Codex in-app-browser doorway with a green evidence label rather than the Map still.
- `pnpm demo:film:verify` passed in honest draft mode with six ready shots, four blocked shots, and ten missing or unsatisfied final-evidence items. It still refuses to call the film final.
- No paid provider request occurred.

### Decisions

- Window-scoped capture is the privacy-safe host-proof path. Screen-region recording was discarded after another application crossed the region during the first take.
- This clip proves the local Workshop opens in the Codex in-app browser. It does not prove ChatGPT Work parity or a provider-backed Realtime turn.
- A ready external-video shot must be consumed by the film builder and recorded in its manifest; file existence alone is not sufficient evidence.

### Open items

- Replace the remaining four amber shots with the dated founder brainstorm plus Realtime/GPT-5.6 evidence, the inspected GPT Image 2 gallery, the provider-narrated render, and the final non-partial submission reveal.
- Put the external-use presentation in front of its intended professional audience and record `Send` or the first blocking revision.
- ChatGPT Work invocation, provider spend authorization, founder recording, public links, final audio review, and the Devpost `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 17:41 CT — Infographic becomes a shippable narrative canvas

**Area:** Deliver / Infographic / Send-it quality / Editable handoff

### Changed

- Audited the recorded-fixture infographic against the professional send-it bar. The original editable export was a narrow four-row table: traceable and functional, but visually closer to an implementation manifest than a client-facing artifact.
- Rebuilt the HTML and editable PowerPoint renderers around a 16:9 two-by-two narrative canvas with four numbered evidence cards, clearer headline hierarchy, supporting context, and quiet source labels.
- Added a responsive one-column browser layout below 720px and renderer assertions for the new semantic grid.
- Preserved exact source locators in HTML `data-source` attributes and exact claim IDs plus locators in PowerPoint speaker notes.

### Verified

- Regenerated the deterministic acceptance fixture, converted the editable PowerPoint through LibreOffice, and visually inspected the final 1334×750 review image. The PowerPoint remains a valid archive and the PDF reports one 16:9 page at 960.009×540 points.
- Inspected the notes XML and confirmed all four fixture claim IDs and exact chunk locators survived the editable handoff.
- Production renderer tests passed 7 cases and worker tests passed 84 cases. All 27 production browser tests passed at desktop, compact, and mobile widths; eight intended baselines changed only because their real infographic iframe content changed.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages. `pnpm demo:e2e` passed all six deterministic gates.
- The evidence record is `artifacts/spikes/professional-infographic-2026-07-15.json`, with visual proof at `artifacts/spikes/professional-infographic-2026-07-15.jpg`. No paid provider request occurred.

### Decisions

- A professional infographic should be a single visual argument, not a reformatted table. The four approved grounded claims therefore become a balanced narrative composition without changing their content or trace edges.
- The infographic remains a supporting output. Product-quality effort continues to prioritize the grounded editable presentation as the wedge deliverable.
- This internal visual and round-trip proof does not substitute for an external professional's cold `Send` or `Revise` judgment.

### Open items

- Put the external-use presentation in front of its intended professional audience and record `Send` or the first blocking revision.
- Record one provider-verified Realtime turn, rerun the zero-spend preflight, obtain explicit request authorization, and run the provider-backed Map, image, and narration path.
- Invoke the installed package from ChatGPT Work and record actual surface support without inferring parity from Codex.
- Provider-backed media, final founder recording, public links, and the Devpost `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 17:17 CT — Clean-start Shape becomes claim-level professional composition

**Area:** Product quality / Shape / Brief / Source trust

### Changed

- Reproduced the clean-start path with representative professional notes and found that six grounded claims were being collapsed into one oversized Map node and a mechanically fragmented Brief. The data was grounded, but the first draft did not yet communicate professional structure.
- Changed deterministic Source ingestion to create separately editable claim-level Map nodes with exact claim IDs, Source IDs, chunk locators, concise titles, and stable spatial placement. One Source with six verified statements now becomes six useful ideas instead of one Source summary.
- Changed `FRAME.md` composition to rank one concise, noncreative outcome and preserve up to three separate exact evidence statements. The outcome claim is not repeated as evidence.
- Attached each Brief evidence locator to its exact statement and made that control open the precise source sentence and chunk, rather than showing detached duplicate citation controls.
- Added regression coverage for realistic six-claim notes, graph placement, concise outcome selection, exact evidence composition, and claim-aware source trace.

### Verified

- A fresh isolated Workshop in the actual Codex in-app browser completed Client pitch → clean Style → one pasted Source → six-idea Map → approved Brief. The 1280px Map and Brief had no horizontal overflow.
- The Brief heading was exactly `WorkshopLM organizes messy thinking into a grounded Map`; it contained three evidence rows. Opening the first row's `Pasted notes · chunk 01` control showed the exact sentence `Professional teams lose hours turning meeting notes into client-ready presentations`.
- Worker tests passed 84 cases, including the new realistic composition regression. Web component/API tests passed 15 cases.
- The production build and all 27 browser tests passed at desktop, compact, and mobile widths after intentional visual-baseline review. `pnpm check` passed all 13 packages. `pnpm demo:e2e` passed the complete deterministic seam with all six gates green and the local rendered Video intact.
- The evidence record is `artifacts/spikes/claim-level-shape-2026-07-15.json`. No OpenAI provider request or paid generation occurred.

### Decisions

- The Map's deterministic fallback unit is a grounded claim, not a Source document. Source summaries remain useful metadata but are too coarse to be the professional thinking surface.
- A professional Brief leads with one outcome and keeps evidence exact, separate, and immediately traceable. Locator controls belong with the statement they support.
- This closes a deterministic composition defect only. Provider-backed organization and an uncoached professional's `Send`/`Revise` judgment remain separate evidence gates.

### Open items

- Record one provider-verified Realtime voice turn, rerun the zero-spend operator preflight, obtain explicit request authorization, and run the provider-backed Map, image, and narration path.
- Put the external-use deck in front of its intended professional audience for a cold `Send`/`Revise` decision.
- Invoke the installed package from ChatGPT Work and record actual surface support without inferring parity from Codex.
- Provider-backed media, final founder recording, public links, and the Devpost `/feedback` Session ID remain open.
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

---

## 2026-07-15 15:54 CT — Real website evidence forced a readable professional palette

**Area:** Product / Accessibility / Company Styles / Presentation quality / Live-site verification

### Changed

- The shared official SideSheet primitive now takes initial focus, contains forward and reverse Tab navigation, closes with Escape, and returns focus through the existing Workshop trigger contract.
- Failed actions remain assertively announced while the current Map and transient sheet stay available.
- Website palette inference now treats Text, Background, and Accent as semantic roles rather than taking the first vaguely named CSS variable. Text must retain at least 4.5:1 contrast against Background; decorative text colors cannot become body text; sparse theme colors remain Accent candidates; and distinctive brand colors outrank neutral surfaces for Accent.
- Saving either a website-derived or manual Style now refuses an unreadable Text/Background pair with a concrete contrast message.
- Preserved before/after evidence from the real Mozilla run in `research/screenshots/workshoplm/real-site-mozilla-before-palette-fix-1200x800.png` and `research/screenshots/workshoplm/real-site-mozilla-after-palette-fix-1200x800.png`.

### Verified

- The first live-site run found 43 colors, eight font candidates, five asset candidates, and four stylesheets on Mozilla's public site, but exposed a failed role assignment: pale gray Accent, pink Text, white Background, and an unsendable pink presentation. The screenshot is retained rather than promoted as success.
- After the fix, a fresh isolated production-browser run selected `#0060DF` Accent, `#000000` Text, and `#FFFFFF` Background, reached the first grounded Map in 619 ms, and reached an editable PowerPoint-backed deck in 1,644 ms with one Source, two claims, and no horizontal overflow. These are scripted local timings, not uncoached professional validation.
- The corrected presentation screenshot is visually readable and hashes to `64e1587b6c8d0e4af2d1d88808ed5bb5dfbd1cda32ce6b32be8744a509a8cc7c`; the retained failure hashes to `bce4ce1972304453d07119acd4396d9dc37c2918625bfd5ddc3cbc8f713cbfae`.
- OpenAI.com returned a blocked-review state in a separate fresh-root run. WorkshopLM kept the Map, offered the safe fallback, and produced an editable deck with the clean default; this proves recovery, not OpenAI website extraction.
- Worker tests passed all 81 cases across eight files. Web tests passed all 15 cases, and the production browser suite passed all 25 cases, including modal focus containment, Escape/restore behavior, assertive action errors, reduced motion, contrast, logical zoom, and the three target widths.
- `pnpm check` passed all 13 packages, `pnpm demo:e2e` passed all six recorded-fixture gates, `pnpm submission:build` produced the truthful 17-asset partial package with four provider limitations, `pnpm submission:verify` returned valid/not stale/not tampered, and `git diff --check` passed.

### Decisions

- A technically extracted palette is not a successful Company Style. The first rendered artifact is the quality proof, and a bad deck sends the implementation back to role inference.
- Website colors remain editable suggestions, but WorkshopLM will not knowingly create professional work with unreadable core text.
- The production-browser run is valid live-site product evidence because the in-app browser tool is not callable in this task. It is not recorded as Codex in-app-browser proof, and that host-specific check remains open.

### Open items

- The broader professional send-it review of the complete editable deck remains open; this increment fixes its color foundation but does not claim the narrative and layout system is presentation-ready.
- Repeat the clean-start path in the Codex in-app browser when callable.
- Manual local asset paths retain legacy behavior; selected remote website assets use the stronger verified asset contract.
- Own-material uncoached timing, provider-backed voice/Map/Image/Speech evidence, and the final public video remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 16:10 CT — Meta-demo deck becomes a real professional narrative

**Area:** Product / Deck planner / Presentation rendering / Dogfood zero

### Changed

- Rejected the recorded acceptance deck even though it passed generation tests: its source contained one sentence, so the output was only a cover and a repeated claim rather than a credible professional story.
- Rebuilt the sanitized raw-brainstorm fixture around six grounded paragraphs and made the daily acceptance gate require four distinct narrative beats and all four content layouts: outcome, problem, traceable proof, and recommendation.
- Made claim selection role-first when role-matched evidence exists, with explicit editorial priority for the professional outcome and exact-source proof. Build Week title overlap can no longer replace the customer promise with event metadata.
- Preserved useful supporting clauses when a long source sentence becomes a clipped slide headline, removed leftover leading punctuation, and sentence-cased copy after a true sentence break.
- Made recommendation-slide foregrounds contrast-aware in both HTML and editable PowerPoint so light Accent colors use dark text and dark Accents use light text.

### Verified

- `pnpm check` passed lint, typecheck, and tests across all 13 packages. Worker tests passed 81 cases and production-renderer tests passed six cases.
- `pnpm demo:e2e` passed all six recorded-fixture gates and now fails unless the deck contains four distinct grounded claims, the statement/split/proof/recommendation sequence, and the exact professional narrative beats.
- The generated PowerPoint contains five slide XML files. LibreOffice converted it to a five-page 960×540 PDF; the contact sheet showed no clipping or overflow and retained the four quiet source footers plus the proof card.
- The HTML contact sheet is preserved at `research/screenshots/workshoplm/meta-demo-deck-send-it-pass-1280x3611.png` with SHA-256 `e28c137e38b2eb90e099c177c30db65a6f88aea5f75b50a8886dbdbbee07349f`. The independent LibreOffice/PDF render is preserved at `research/screenshots/workshoplm/meta-demo-pptx-libreoffice-pass-1280x4500.png` with SHA-256 `8fe1a3e7438faf5de570be548e62d537f2d10256c444cbe0fddc541faea2860f`.
- The fixture-content change intentionally altered Output previews. After visual review, the baselines were refreshed; a clean production-browser run then passed all 25 tests across desktop, compact, mobile, focus, contrast, reduced-motion, state, and real-video paths.
- `pnpm submission:build` produced the truthful 17-asset `partial` set with the same four provider limitations; `pnpm submission:verify` returned valid, not stale, and not tampered. `git diff --check` passed.

### Decisions

- Passing a renderer test is not evidence that a deck tells a useful story. Dogfood fixtures must contain enough real narrative pressure to expose editorial failures.
- Claim-role fit outranks incidental title overlap. The professional outcome leads; event or submission context is supporting evidence, never the product promise.
- This is an internal send-it quality milestone, not a human `Send` decision. The external cold-review gate remains open.

### Open items

- Run the first provider-backed Map and six-panel GPT Image 2 batch, then grade each panel against whether it belongs in the deck.
- Put the reproducible external-use deck in front of its intended professional audience and record `Send` or the first required revision.
- Repeat the clean-start path in the Codex in-app browser when callable.
- Own-material uncoached timing, provider-backed voice/Speech evidence, final founder recording, and public submission links remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 16:23 CT — GPT Image 2 plan becomes grounded professional work before spend

**Area:** Product / GPT Image 2 / Source grounding / Live-provider readiness

### Changed

- Rejected the prior six-image plan before provider spend because it was a hardcoded WorkshopLM demo sequence with no panel-level evidence edges. That plan could demonstrate an API but could not prove a reusable grounded professional product.
- Each image batch now records the exact Map revision, approved Brief version, Style version, shared reference hash, and panel-specific claim/source locator.
- Replaced the generic scenes with six distinct professional deck jobs: Hero concept, Systems diagram, Evidence chain, Decision visual, Storyboard sequence, and Section art.
- Added role-aware evidence selection so the strongest available approved claim drives each visual instead of assigning claims by source order. The live fixture now maps the exact-source claim to Evidence chain, the approval constraint to Decision visual, the Capture → Shape → Deliver claim to Storyboard sequence, and the brand/output claim to Section art.
- Strengthened Visual DNA and provider direction around one folded-plane motif, matte paper material, restrained depth, soft directional shadow, negative space, and direct client/leadership-deck utility. Prompts explicitly reject readable text, invented quantities, logos, UI chrome, device mockups, generic people-at-work scenes, and stock-photo clichés.
- Image generation now fails before provider dispatch if any panel loses its evidence, uses a stale Map/Brief/Style, duplicates another prompt, or breaks the shared reference contract.
- Retry fingerprints now bind prompt hashes, evidence edges, input versions, and the shared reference hash in addition to provider results. The submission image manifest and generated image assets retain panel-specific claim IDs and source locators.
- `Create outputs` now builds the source-traceable asset plan before the image batch, then binds those planned images into the Storyboard.

### Verified

- The zero-spend `pnpm demo:live` preflight returned `status: ready`, `paidCallsMade: false`, a valid six-panel coherence report with zero issues, shared reference SHA-256 `abc850b041c0c02d30520640319b009b620def9b0b4ce7fad9cc8b00d92bd806`, and no executable paid command because provider voice evidence is still absent.
- The exact prompt bundle hashes to `446f2bfc5f1a6c4a1ecbc210110d48ef7109bd27304709231f6ea2def9ee42d1`. The sanitized plan and review rubric are checked in at `artifacts/spikes/gpt-image-2-preflight-2026-07-15.md`.
- Worker tests passed 83 cases across eight files, including role-to-evidence selection, prompt constraints, reference integrity, source-edge failure before spend, partial success, selective retry, narration limits, and submission trace behavior.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages. The production-browser build and all 25 visual/interaction/accessibility tests passed at desktop, compact, and mobile sizes.
- `pnpm demo:e2e` passed the complete deterministic seam. `pnpm submission:build` produced the truthful 17-asset `partial` package with the same four provider limitations; `pnpm submission:verify` returned valid, not stale, and not tampered. `git diff --check` passed.

### Decisions

- A coherent batch is not six similarly styled pictures. It is six different professional communication jobs sharing one art direction and each grounded in the approved Brief.
- Provider spend remains gated behind both a verified Realtime turn and explicit request authorization. Prompt quality and provenance can be completed before that boundary; generation cannot.
- Structural coherence checks prove prompt/reference/version integrity, not visual quality. The six generated panels still require a human deck-utility and coherence review.

### Open items

- Record one provider-verified Realtime voice turn in the local operator Workshop and rerun `pnpm demo:live` until it prints the exact twelve-request command.
- Obtain explicit authorization before running the paid GPT-5.6, GPT Image 2, or Speech requests; do not infer it from the prepared plan.
- Inspect all six generated panels against the checked-in rubric, selectively regenerate failures, and record the first usable set and timing.
- Put the external-use deck in front of its intended professional audience for `Send`/`Revise` feedback.
- Provider-backed voice/Map/Image/Speech evidence, final founder recording, public links, and Codex in-app-browser proof remain open.
- Codex Session ID: unavailable on this surface; not inferred.

## 2026-07-15 16:36 CT — Image set becomes a grounded professional review loop

**Area:** Product / Image review / Selective regeneration / Trust

### Changed

- Replaced generic `Image 1–6` review labels with six explicit professional jobs: Hero concept, Systems diagram, Evidence chain, Decision visual, Storyboard sequence, and Section art.
- Each image card now shows the approved grounded idea, honest generation state, exact panel Source action, and direct image link when generated. The focused surface has no global ambiguous source action and introduces no navigation or tabs.
- Added the user-facing `Request replacement` path for a generated or failed panel. The UI states the consequence plainly: the new image must be reviewed in Storyboard before Video approval.
- Repaired a contract defect in selective regeneration. A requested replacement previously revoked Storyboard approval but the finished new image never rebound its Storyboard panel. Recording the replacement now binds the exact new image version, clears only that panel's stale state, and deliberately keeps global Storyboard approval false until the professional signs off again.
- Prevented a replacement-only Storyboard stale state from surfacing the unrelated `Update outputs` action while the selected image is awaiting generation.

### Verified

- Worker tests passed 83 cases, including the full version-1 approval → version-2 replacement request → generated-image rebind → explicit reapproval sequence.
- Web typecheck and 15 component/API contract tests passed.
- The production Next build and all 26 browser tests passed at 1200×800, 1024×768, and 390×844, including exact Source content, selective replacement POST data, calm replacement status, responsive snapshots, official primitive states, keyboard behavior, reduced motion, contrast, and 200% logical zoom.
- The updated responsive review captures are `apps/web/tests/visual/__screenshots__/desktop-image-set.png`, `compact-image-set.png`, and `mobile-image-set.png`; desktop and mobile were visually inspected after capture.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages after clearing only a disposable duplicate Next visual-build cache.
- `pnpm demo:e2e` passed the complete deterministic seam. `pnpm submission:build` truthfully remained `partial` with 17 assets and the same four provider limitations; `pnpm submission:verify` returned valid, not stale, and not tampered.

### Decisions

- The image set is a professional art-direction review, not a contact sheet. Every panel must explain its communication job and evidence without exposing the full provider prompt.
- `Request replacement` is intentionally narrower and more truthful than `Regenerate`: it selects one panel for provider work and makes the downstream approval consequence visible.
- Replacement completion may restore panel-level currency, but it may never silently restore the global Storyboard approval gate.

### Open items

- Record one provider-verified Realtime voice turn, rerun the zero-spend operator preflight, and obtain explicit authorization before the first paid provider run.
- Generate all six GPT Image 2 panels, inspect them in this review surface against the checked-in deck-utility/coherence rubric, and selectively replace failures.
- Put the external-use deck in front of its intended professional audience for a cold `Send`/`Revise` decision.
- Provider-backed voice/Map/Image/Speech evidence, final founder recording, public links, and Codex in-app-browser proof remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 16:42 CT — Unified plugin manifest catches up to the current host contract

**Area:** Plugin / Codex host / Optional source apps / Installation proof

### Changed

- Audited WorkshopLM against the currently installed Granola, OpenAI Developers, Sites, and Data Analytics plugin manifests rather than relying on the older local plugin plan.
- Found that WorkshopLM's `.app.json` still used unsupported `widgets` and `dependencies` keys and referenced compact HTML files that were never copied into the built MCP package. That shape could not honestly represent the new unified app architecture.
- Replaced it with the current `apps` map: Granola (`asdk_app_697761cab6f48191b5ed345919a3ce8b`) and Google Drive (`connector_5f3c8c41a1e54ad7a76272c89e2554fa`) are explicit optional host-provided source apps with clear categories.
- Removed the unused compact status/trace HTML. WorkshopLM's strong visual GUI remains the local full-screen browser Workshop; the plugin is the skill, grounded MCP tool set, optional app relationships, and loopback doorway.
- Bumped the unified plugin and MCP server to `0.1.3`, rebuilt the distributable server, refreshed the real installed plugin, and updated the README's verified slice.

### Verified

- `codex plugin list --json` reports `workshoplm@workshoplm-local` version `0.1.3` installed and enabled from the local marketplace.
- Installed and repository SHA-256 hashes match for the plugin manifest, `.app.json`, built MCP server, and skill. The complete evidence record is `artifacts/spikes/plugin-unified-manifest-2026-07-15.json`.
- All seven plugin contract, tool, and stdio-server tests passed. The contract test now rejects a return of the obsolete `widgets` or `dependencies` shape and pins the two optional app IDs.
- A second `codex plugin add workshoplm@workshoplm-local --json` refresh confirmed the installed `0.1.3` bundle no longer contains either dead widget file. `pnpm check` passed lint, typecheck, and tests across all 13 packages, and `pnpm demo:e2e` kept all six deterministic acceptance gates green.
- Fresh ephemeral Codex task `019f67b9-177b-7250-a3cf-84d87774b14b` loaded the `0.1.3` MCP server and successfully called `workshop_list → search → fetch`. It returned Workshop `WorkshopLM Build Week`, source `source-2026259e182a`, chunk `chunk-2026259e182a-2`, locator `Sanitized fixture · chunk 02`, and evidence state `verified`.
- That fresh task did not activate `$workshoplm`: the host reported that Daniel's global installation exceeded the two-percent skill-context budget and omitted 304 skill descriptions. The installed skill hash is unchanged from the previously successful isolated and Codex desktop activations; this run is recorded as current tool proof, not new skill proof.
- No OpenAI provider request or paid generation occurred.

### Decisions

- `.app.json` declares relationships to registered host apps; it is not a registry for arbitrary local widget HTML.
- The visual product remains one full-screen local Workshop in the Codex/ChatGPT in-app browser. A second compact pseudo-interface would weaken both the product boundary and host compatibility.
- Spike E stays open only for an actual ChatGPT Work invocation. Current Codex success does not prove Work parity.

### Open items

- Invoke the installed package from ChatGPT Work and record the actual supported tools, optional source apps, and loopback-browser behavior without inferring parity from Codex.
- Record one provider-verified Realtime voice turn, obtain explicit request authorization, and run the provider-backed Map, image, and narration path.
- Put the external-use deck in front of its intended professional audience for a cold `Send`/`Revise` decision.
- ChatGPT Work proof, provider-backed media, final founder recording, public links, and the Devpost `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; ephemeral task ID above is not substituted.

---

## 2026-07-15 17:01 CT — Clean-start path passes in the actual Codex browser

**Area:** Host UX / Source trust / First-run verification

### Changed

- Ran an isolated first-use Workshop inside the actual Codex in-app browser from outcome selection through a grounded Map, approved Brief, editable presentation, and source trace.
- Moved transient success/error notices to the bottom-center snackbar position after the live host showed the output-created message covering the presentation's primary `Show source` action.
- Replaced generic source-level evidence with claim-aware evidence selection across Map, Brief citations, focused presentation and infographic, image review, and Storyboard. The Source sheet now shows the exact claim text and chunk locator used by the selected work.
- Made focused Outputs preserve the artifact's claim order so the presentation trace opens on its lead grounded claim rather than the first matching claim in global Source order.
- Added a production-browser regression that recreates fresh Outputs, verifies the status message does not overlap `Show source`, and requires the exact artifact claim plus locator in the Source sheet.

### Verified

- The isolated Codex-browser path completed Client pitch → clean Style → pasted notes → Map → Brief → Outputs in 37,961 ms of controlled agent interaction, including deliberate waits; the first Map appeared in 8,820 ms. This is scripted host proof, not uncoached timing.
- The final Codex-browser Source sheet showed the complete lead claim, `WorkshopLM organizes messy thinking into a grounded Map, then creates an editable deck with every factual claim linked to its exact source`, with locator `Pasted notes · chunk 01`.
- The final 1280px Codex-browser surface had no horizontal overflow and no captured console warnings or errors. The evidence record is `artifacts/spikes/codex-iab-clean-start-2026-07-15.json`.
- Web typecheck and all 15 component/API contract tests passed. The production build and all 27 browser tests passed at desktop, compact, and mobile widths. The three evidence snapshots were intentionally refreshed after visual inspection because they now show the exact selected claim rather than a generic Source excerpt.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages. `pnpm demo:e2e` passed all six deterministic acceptance gates with the rendered local Video and build trace intact.
- No OpenAI provider request or paid generation occurred.

### Decisions

- `Show source` means the exact claim and locator used by the current artifact, not merely the correct Source document. Source-level fallback remains only for controls that have no more specific evidence edge.
- Host proof may close the Codex in-app-browser clean-start item, but it does not close ChatGPT Work parity, live-provider behavior, or uncoached professional validation.
- A transient success message may confirm work, but it may never cover the next primary action.

### Open items

- Invoke the installed package from ChatGPT Work and record actual surface support without inferring parity from Codex.
- Record one provider-verified Realtime turn, obtain explicit request authorization, and run the provider-backed Map, image, and narration path.
- Put the external-use deck in front of its intended professional audience for a cold `Send`/`Revise` decision.
- Provider-backed media, final founder recording, public links, and the Devpost `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 17:22 CT — Build-log chronology correction and Map orientation proof

**Area:** Evidence hygiene / First-run Map

### Changed

- The preceding `17:17 CT — Clean-start Shape becomes claim-level professional composition` milestone was added above the later `16:42` and `17:01` entries because its append patch matched an earlier repeated Session-ID line. This entry records the chronology error without deleting or rewriting historical content; the 17:17 milestone's implementation and verification claims are unchanged.
- Moved the one-time `Your Map is ready` orientation card from the upper-left idea field to the empty lower-left canvas area so it no longer covers the Source node, claim nodes, or evidence edges at the recorded desktop width.

### Verified

- Rebuilt the production visual app, regenerated the one affected onboarding baseline, visually inspected the unobscured six-idea Map, and passed the targeted clean-start browser test against the new baseline.
- The full update-mode production browser suite passed all 27 cases before the targeted normal-baseline rerun passed.

### Open items

- Product evidence gates remain unchanged: provider-backed Map/media, uncoached professional `Send`/`Revise`, ChatGPT Work invocation, founder recording, public links, and `/feedback` Session ID.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 17:31 CT — Hero deck turns traceable proof into professional evidence

**Area:** Deliver / Presentation / Send-it quality / Editable handoff

### Changed

- Audited the current external-use AI Collective PowerPoint against the product's send-it standard. Exact trace data survived, but the exported proof slide spent its dominant visual area on an internal-looking Source box and exposed `chunk 79` in the visible footer instead of making the evidence itself persuasive.
- Added a deterministic proof-layout path that recognizes up to two numeric facts in a grounded proof heading and renders them as an editorial metric composition in both responsive HTML and editable PowerPoint.
- Rebuilt the candidate's evidence slide around `180+ chapters` and `40+ countries`, with the grounded `400+ volunteer organizers` supporting statement beneath it.
- Made visible citations use quiet professional source names while preserving exact chunk locators in HTML `data-source` attributes and exact locator plus claim ID in PowerPoint speaker notes.
- Extended `pnpm dogfood:deck:build` to recreate and hash the five-slide contact sheet from the current PowerPoint round trip so the cold-review image cannot silently remain stale.

### Verified

- `pnpm dogfood:deck:build` produced fresh HTML, editable PowerPoint, five-page PDF, five slide images, and a 1920×1620 contact sheet. The PowerPoint is a valid archive and the PDF reports five 16:9 pages at 960.009×540 points.
- Visually inspected the complete contact sheet and the full-size evidence slide after the LibreOffice round trip. The final exported metric labels render completely as `CHAPTERS` and `COUNTRIES`; no internal chunk number appears in the visible slide footer.
- Inspected the PowerPoint notes XML and confirmed it retains `https://newsletter.aicollective.com/ · chunk 79` plus `claim-60bb5377e97a-78-1` for the evidence slide.
- Production renderer tests passed 7 cases, worker tests passed 84 cases, and all 27 production browser tests passed. `pnpm check` passed all 13 packages. `pnpm demo:e2e` passed the deterministic seam with all six gates green.
- The evidence record is `artifacts/spikes/professional-deck-evidence-layout-2026-07-15.json`. No paid provider request occurred.

### Decisions

- A client-facing slide should show evidence as the composition. Source identity stays visible but subordinate; exact retrieval coordinates remain available through the product trace and editable handoff notes.
- Metric extraction is intentionally bounded to two numeric facts from the already-approved grounded heading. It does not invent statistics or promote unrelated numbers from supporting copy.
- This is a stronger external-use candidate, not a substitute for the intended professional's cold `Send`/`Revise` judgment.

### Open items

- Put this refreshed candidate in front of its intended professional audience and record `Send` or the first blocking revision.
- Record one provider-verified Realtime turn, rerun the zero-spend preflight, obtain explicit request authorization, and run the provider-backed Map, image, and narration path.
- Invoke the installed package from ChatGPT Work and record actual surface support without inferring parity from Codex.
- Provider-backed media, final founder recording, public links, and the Devpost `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 17:43 CT — Build-log chronology correction for infographic milestone

**Area:** Evidence hygiene / Deliver

### Changed

- The `17:41 CT — Infographic becomes a shippable narrative canvas` milestone was appended above later historical entries because its patch matched an earlier repeated Session-ID line. This correction records the chronology error without deleting or rewriting the original milestone; its implementation and verification claims are unchanged.

### Verified

- Confirmed this correction is the final entry in the append-only log and that the infographic evidence record, visual proof, renderer changes, and test baselines remain present in the working tree.

### Open items

- Product evidence gates remain unchanged: provider-backed Map/media, uncoached professional `Send`/`Revise`, ChatGPT Work invocation, founder recording, public links, and `/feedback` Session ID.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 17:55 CT — The 2:42 demo plan becomes a truthful reviewable rough cut

**Area:** Meta-demo / Recording loop / Film verification

### Changed

- Added `pnpm demo:film:rough`, a repository-native builder that maps the ten-shot evidence-gated paper edit onto the twelve captured UI beats and assembles a real 2:42 review MP4.
- Added restrained shot labels, bounded two-line captions, a four-percent editorial push-in, one midpoint review frame per shot, and a five-by-two contact sheet. Supported fixture shots are green; the five shots missing final evidence remain visibly amber.
- Added an explicitly disclosed local macOS guide voice and time-fitted each clip to its exact edit slot. This track exists only for pacing review and is not represented as OpenAI narration.
- Replaced the outdated `plugin widget` language in the film instructions with the actual Codex plugin doorway required by the locked product architecture.

### Verified

- `outputs/demo-film-rough-cut/workshoplm-demo-rough-cut.mp4` probes as 162.021 seconds with 1280×720 H.264 video and 48 kHz AAC audio, below the 175-second edit ceiling.
- Audio volume measures −16.3 dB mean and −1.9 dB maximum. A −45 dB silence scan found no interval lasting 1.5 seconds.
- Visually inspected the ten-shot contact sheet and representative full-resolution frames. The review loop caught and repaired clipped captions, a promise shot bleeding into the Sources action, static dead holds, and fixed-rate narration gaps up to 8.6 seconds.
- `manifest.json` hashes the MP4, contact sheet, and all ten review frames, identifies every source beat, discloses the local guide voice, and preserves the five blocked evidence states.

### Decisions

- A rough cut is useful before provider footage only if it exposes rather than conceals missing proof. Evidence-pending shots therefore remain present and visibly labeled so their exact replacements are obvious.
- Final publication still requires actual Codex doorway footage, founder/Realtime/GPT-5.6 capture, the inspected GPT Image 2 gallery, provider-narrated render, non-partial final Output set, and eligible `/feedback` Session ID.
- Automated stream, volume, silence, and frame checks do not prove narration quality. A human audible review remains required for the final voice and mix.

### Open items

- Replace the five amber shots with their named live evidence instead of editing around them.
- Put the external-use presentation in front of its intended professional audience and record `Send` or the first blocking revision.
- Record one provider-verified Realtime turn, rerun the zero-spend preflight, obtain explicit request authorization, and run the provider-backed Map, image, and narration path.
- ChatGPT Work invocation, founder recording, public links, final audio review, and the Devpost `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 18:21 CT — Build-log chronology correction for Codex doorway milestone

**Area:** Evidence hygiene / Host proof

### Changed

- The `18:18 CT — Real Codex doorway replaces the rough-cut placeholder` milestone was appended above later historical entries because its patch matched an earlier repeated Session-ID line. This correction records the chronology error without deleting or rewriting that milestone; its capture, privacy, integration, and verification claims are unchanged.

### Verified

- Confirmed this correction is the final entry in the append-only log, the doorway clip is the external source recorded for shot 2, and the current film report has six ready shots and four blocked shots.

### Open items

- Replace the remaining four amber shots with their named final evidence.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 18:32 CT — Spike E closes on the verified Codex host boundary

**Area:** Plugin / Host integration / Claim integrity

### Changed

- Audited both locally installed OpenAI desktop applications without sending a chat message or making a provider call. `/Applications/ChatGPT.app` is the Codex desktop app (`com.openai.codex`, `26.707.72221`, build `5307`) with tasks, plugin infrastructure, and the in-app browser. `/Applications/ChatGPT for Mac.app` is the classic ChatGPT app (`com.openai.chat`, `1.2026.183`, build `1783607847`) and exposed only the legacy `Work with Apps` list; no WorkshopLM or unified local-plugin surface was present.
- Removed and reinstalled WorkshopLM after discovering the live plugin cache was still on `0.1.2`. `codex plugin list` now reports `workshoplm@workshoplm-local` installed and enabled at `0.1.3`.
- Closed Spike E through its designed fallback and updated the goal, plan, design contract, README, research routing notes, evidence audit, and claim ledger: Codex desktop/CLI plus the local in-app browser is the supported executable host. ChatGPT Work parity is not a current claim or completion dependency, and hosting will not be added merely to force parity.
- Added the sanitized machine-readable host record at `artifacts/spikes/plugin-supported-host-2026-07-15.json`. No screenshots or private ChatGPT conversation content were retained in the repository.

### Verified

- Repository and installed-cache SHA-256 hashes match for `.codex-plugin/plugin.json`, `.app.json`, `.mcp.json`, `skills/workshoplm/SKILL.md`, and `packages/plugin-mcp/dist/server.js`.
- Started the installed `0.1.3` stdio MCP server directly against `.workshoplm/acceptance`. `initialize` returned WorkshopLM `0.1.3`; `tools/list` returned all eleven read/write tools; `workshop_list` returned `WorkshopLM Build Week`; `search("editable production system")` ranked `chunk-2026259e182a-2` first; and exact `fetch` returned that same `Sanitized fixture · chunk 02` plus verified claim `claim-2026259e182a-1-1`.
- This milestone used the sanitized local fixture only. It made zero paid OpenAI/provider calls and does not prove behavior in a future ChatGPT Work build.

### Decisions

- A current host boundary is more useful and more honest than keeping an unverifiable parity item open. The product remains local and judge-ready through its already-verified Codex doorway.
- Future Work support may be re-tested when an installed Work surface actually exposes the unified local plugin, but it is not required for this hackathon build.

### Open items

- Run the repository-wide check, deterministic demo acceptance, and film verifier after this documentation/evidence reconciliation.
- Product-runtime provider evidence, professional `Send`/`Revise`, founder/Realtime capture, the final public video, and `/feedback` Session ID remain open under `GOAL.md`.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 18:35 CT — Host-boundary reconciliation passes acceptance

**Area:** Verification / Integration

### Verified

- `pnpm check` passed lint, typecheck, and tests across all 13 packages, including 15 web tests, 84 worker tests, seven plugin-MCP tests, and the provider-independent domain, production, UI, and spike suites.
- `pnpm demo:e2e` passed the deterministic seam with all six gates true, one grounded source, the deck and infographic outputs, six image panels, five Storyboard panels, a current rendered Video artifact, and its build trace.
- `pnpm demo:film:verify` passed the draft-film contract at 162 seconds. Six shots remain evidence-ready and four remain visibly blocked only on the already-recorded founder/provider/final-submission evidence gates.
- `git diff --check` passed before staging.

### Open items

- The supported plugin host is now settled. Remaining blockers are product/provider/submission evidence, not ChatGPT Work parity.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 18:43 CT — Sparse professional claims become intentional presentation moments

**Area:** Deliver / Presentation quality / Submission claims

### Changed

- Audited the current external-use AI Collective deck against the professional send-it bar. The only source-backed claim without a separate supporting sentence still rendered as an underfilled pale split template dominated by a decorative index.
- Replaced that failure state in both responsive HTML and editable PowerPoint with a dark editorial claim composition: strong headline hierarchy, Accent rule, subordinate index, quiet visible citation, and no invented supporting copy. Split slides with real body copy retain their existing evidence-rail layout.
- Made dark-slide PowerPoint footers explicitly contrast-aware, including the cover and recommendation states, so visible citations survive the PowerPoint/LibreOffice round trip.
- Refreshed the five-slide HTML, editable PowerPoint, PDF, individual review frames, contact sheet, and their checked-in evidence hashes in `outputs/dogfood-ai-collective-chapter-brief/` and `artifacts/spikes/external-deck-dogfood-2026-07-15.json`.
- Corrected the generated submission narrative to the verified host boundary: Codex desktop/CLI owns conversation and commands, the local in-app browser owns the visual Workshop, WorkshopLM's capture-only Realtime control owns voice, and ChatGPT Work parity is not claimed.

### Verified

- Visually inspected the refreshed sparse slide and cover at full resolution. The sparse claim is now intentional and legible; the title, logo, source line, and page number remain visible on the cover and all other review frames retain their established layouts.
- `unzip -t` reported no PowerPoint archive errors. LibreOffice produced five 16:9 pages; `pdftotext -layout` retained the title, all four claims, `180+`, `40+`, both source labels, and the recommendation.
- `pnpm check` passed lint, typecheck, and tests across all 13 packages after one initial test-only failure exposed a wrong fixture filename (`README.md` instead of the actual `README-NARRATIVE.md`); the assertion was corrected and the complete suite reran green with eight production tests, 84 worker tests, and the existing package baselines.
- `pnpm demo:e2e` passed all six deterministic gates. `pnpm submission:build` produced a truthful 17-asset `partial` Output set, `pnpm submission:verify` returned valid/non-stale/non-tampered, and `pnpm demo:film:verify` kept six shots ready and four blocked on the named founder/provider/final-submission evidence.

### Decisions

- Sparse evidence should produce deliberate whitespace and visual rhythm, not fabricated prose. Output quality improved without weakening grounding.
- This is an internally verified candidate improvement, not external approval. The presentation send-it item remains open until the intended professional audience returns `Send` or the first required revision.

### Open items

- Obtain the cold external `Send`/`Revise` decision on the refreshed candidate.
- Provider-backed Map, image set, Realtime turn, narration, and final public video remain open under `GOAL.md`.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 18:54 CT — Opening the demo can no longer invalidate it

**Area:** Demo fixture / Map persistence / Live browser verification

### Changed

- Corrected the recorded-fixture entry path. `pnpm demo:e2e` now completes first-use onboarding and dismisses both orientation cues, while the new `pnpm demo:serve` command starts the web app against the exact verified `.workshoplm/acceptance` root. The README no longer tells a recorder to build one fixture and unknowingly open another workspace.
- Replaced absolute Excalidraw mount-time geometry persistence with a captured scene baseline. Excalidraw may normalize a label container's dimensions when it opens, but WorkshopLM now persists only the user's position, size, or title delta relative to that baseline.
- Added three focused web regressions proving that normalized initial geometry is a no-op, a real move persists the intended domain delta without leaking normalized dimensions, and a real label edit persists.

### Verified

- Rebuilt the sanitized Workshop with `pnpm demo:e2e`, started it with `pnpm demo:serve`, and opened it in the Codex in-app browser. It landed directly on `WorkshopLM Build Week / Map` with `1 source` and `View brief`; the server recorded only GET requests and no mutation request during load.
- Followed the live Map → Brief → Outputs → Presentation path. The gallery showed the Presentation hero, Infographic, six-image planned set, approved five-panel Storyboard, and rendered Video; the focused Presentation exposed `Show source`, `Download PowerPoint`, and its live preview.
- After browser inspection, `/api/workshop` still reported `briefApproved: true`, `storyboardApproved: true`, `videoState: rendered`, and zero stale Outputs.
- `pnpm check` passed all 13 packages, including 18 web tests and 84 worker tests. `pnpm demo:e2e` passed all six gates; `pnpm submission:build` and `pnpm submission:verify` produced and validated the truthful 17-asset `partial` set; `pnpm demo:film:verify` retained six ready shots and four provider/founder/final-evidence-blocked shots; `git diff --check` passed.

### Decisions

- A read-only open is part of the product contract. Canvas-library normalization must never masquerade as a professional edit or trigger downstream staleness.
- The judge capture command must name the verified fixture explicitly; relying on an ambient default data root is too easy to record incorrectly.

### Open items

- Provider-backed Map, six-image gallery, Realtime turn, narration, founder brainstorm, cold professional `Send`/`Revise`, final public Video, and `/feedback` Session ID remain open under `GOAL.md`.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 18:59 CT — Every artifact claim now has a direct source gesture

**Area:** Trust / Source grounding / Focused Outputs

### Changed

- Audited source trace across the Map, Brief, Presentation, Infographic, Image set, Storyboard, and Video. Image and Storyboard panels already exposed their own evidence, but focused Presentation and Infographic routed `Show source` to only the first claim and focused Video exposed no direct source action.
- Added a compact `Sources in this output` trail beneath each focused Presentation, Infographic, and Video. It preserves artifact claim order, removes duplicate edges, shows each exact locator, and opens that claim's source sentence in one click.
- Video now keeps `Show source`, `Show original`, and `Open video` as distinct actions. Its preview uses the available canvas height so the source trail remains visible without overlaying playback.
- Added focused claim-order/deduplication coverage and extended the official-component/copy contract to protect the claim-level source trail.

### Verified

- Opened the verified fixture in the Codex in-app browser and followed Map → Brief → Outputs → Presentation. All four Presentation claims appeared with `Sanitized fixture · chunk 01` through `chunk 04`; selecting the second claim opened the exact sentence and locator for `chunk 02`, not a generic source summary.
- Opened the rendered Video in the same browser. All four Video claim edges appeared below the unobscured player, while `Show source`, `Show original`, and `Open video` remained visible in the focused header.
- `pnpm check` passed all 13 packages, including 19 web tests and 84 worker tests. `pnpm demo:e2e` passed all six gates; `pnpm submission:build` and `pnpm submission:verify` produced and validated the truthful 17-asset `partial` set; `pnpm demo:film:verify` retained six ready shots and four explicitly evidence-blocked shots; `git diff --check` passed.

### Decisions

- An artifact-level provenance record is necessary but insufficient for the professional trust promise. A user must be able to choose the factual claim they are evaluating and reach that exact sentence directly.
- The source trail belongs inside the focused artifact, not in persistent navigation or another tab. This keeps provenance contextual and preserves the single-current-object interface.

### Open items

- Provider-backed Map, six-image gallery, Realtime turn, narration, founder brainstorm, cold professional `Send`/`Revise`, final public Video, and `/feedback` Session ID remain open under `GOAL.md`.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 19:03 CT — Narration now fails closed before provider spend

**Area:** Live operator / OpenAI media / Spend safety

### Changed

- Reran `pnpm demo:live` in its default zero-spend mode. It rebuilt the isolated operator Workshop, produced two four-claim Outputs, validated six distinct GPT Image 2 jobs against one untampered shared reference, planned one GPT-5.6 Map call plus six Image calls and five Speech calls, and made zero provider calls.
- Found that image coherence was validated during preflight while narration validity was deferred until after the Map and image requests. Added a narration-readiness contract that now runs before live execution can begin.
- The contract checks current Storyboard state, unique panels, non-empty titles and narration, positive durations, active claim/source/chunk/locator edges, source evidence, and the 4,096-character Speech API input limit. Live narration generation reuses the same contract before dispatch.
- Corrected the README's live-preflight description: the Brief is approved, but the Storyboard intentionally remains ready for the second approval until the generated images exist.

### Verified

- The repaired `pnpm demo:live` preflight reported `paidCallsMade: false`, `providerVoiceReady: false`, no executable paid command, six valid image panels with zero issues, and five valid narration panels totaling 507 characters with a 112-character maximum and zero issues.
- Added coverage proving a valid five-panel narration plan passes, an oversized panel fails before fetch, and a tampered locator fails the exact-source contract. The worker suite now passes 85 tests.
- `pnpm check` passed all 13 packages. `pnpm demo:e2e` passed all six gates; `pnpm submission:build` and `pnpm submission:verify` produced and validated the truthful 17-asset `partial` set; `pnpm demo:film:verify` retained six ready shots and four explicitly evidence-blocked shots; `git diff --check` passed.

### Decisions

- The live operator should discover every deterministic media-plan defect before the first paid request, not after the most expensive batch has already completed.
- Storyboard approval remains a real post-image sign-off. Preflight may validate the planned narration without pretending that the professional has approved the still-planned visual sequence.

### Open items

- Record and inspect one provider-backed Realtime turn, rerun this preflight to unlock its exact twelve-request command, and obtain explicit spend authorization before executing it.
- Provider-backed Map, six-image gallery, narration, founder brainstorm, cold professional `Send`/`Revise`, final public Video, and `/feedback` Session ID remain open under `GOAL.md`.
- Codex Session ID: unavailable on this surface; not inferred.

## 2026-07-15 19:09 CT — NotebookLM comparison identifies the next structural UX pass

**Area:** Product UX / Competitive reference audit

### Changed

- Added `research/NOTEBOOKLM-FLOW-AUDIT-2026-07-15.md`, a read-only flow audit comparing all seven saved NotebookLM reference screens against the current WorkshopLM desktop and mobile flow.
- Defined a target workbench that preserves WorkshopLM's Map, approvals, source scope, exact citations, Style, and immutable Outputs while adopting NotebookLM's stable `Sources | current object | production rail` geography.
- Ranked two critical, five high, five medium, and two low findings and split the recommended work into information architecture, contextual trust, and professional-finish phases.

### Verified

- Inspected the seven live local NotebookLM reference files, twelve representative current WorkshopLM flow captures, current `WorkshopPage` view/sheet orchestration, responsive CSS, `GOAL.md`, the execution plan, and the latest build log.
- Confirmed the top issue is structural rather than a missing feature: current full-screen views and transient sheets repeatedly remove source, current-object, or output context, while the underlying domain and acceptance path already preserve the stronger professional-work contract.

### Decisions

- Phase 1 should precede more per-screen polish. It should add stable desktop geography, a persistent/collapsible Sources rail, a persistent production rail, operational stage status, and one explicit next-action model without changing domain contracts.
- NotebookLM is a reference for orientation and continuity, not a product template. WorkshopLM's editable Map and approval/provenance system remain the differentiation.

### Open items

- Implement and visually verify Phase 1 at desktop, tablet, and mobile widths if authorized.
- Preserve all existing deterministic seam, stale-version, accessibility, and source-trace contracts during the redesign.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 19:13 CT — Mobile Video keeps playback and every source claim reachable

**Area:** Responsive UX / Focused Outputs / Visual acceptance

### Changed

- Extended the responsive acceptance contract for focused Presentation and Video: the primary `Show source` action is now distinguished from four claim-specific source actions, every claim trail must be visible, and the document must remain free of horizontal overflow at each recorded width.
- The first visual run exposed a real 390px defect: Video provenance extended below a fixed, non-scrollable focused canvas. Mobile focused artifacts now scroll vertically; Presentation retains its useful scaled preview, Video uses a compact 16:9 player, and the claim list no longer clips inside a fixed-height region.
- Refreshed only the intentional Presentation, Video, and original-reveal baselines across desktop, compact, and mobile after inspecting the changed frames.

### Verified

- Inspected the refreshed 1024×768 Presentation frame: the preview remains dominant and four claims form a quiet two-column evidence rail with no horizontal overflow.
- Inspected the refreshed 390×844 Presentation and Video frames. The Video header keeps `Show source`, `Show original`, and `Open video`; the player is fully visible; `Sources in this output` and all four claim rows are reachable in the same vertical surface.
- A normal, non-update visual run passed all 27 production-browser tests across 1200×800 desktop, 1024×768 compact, and 390×844 mobile, including reduced motion, contrast, 200% logical zoom, exact source trace, Video playback, and first-use flows.
- `pnpm check` passed all 13 packages with 19 web tests and 85 worker tests. `pnpm demo:e2e` passed all six gates; `pnpm submission:build` and `pnpm submission:verify` validated the truthful 17-asset `partial` set; `pnpm demo:film:verify` retained six ready shots and four explicitly evidence-blocked shots; `git diff --check` passed.

### Decisions

- Claim-level provenance is not responsive merely because it avoids horizontal overflow. Every evidence action must also be reachable inside the actual fixed app viewport.
- On mobile, a standard 16:9 Video player and one vertical scroll path are simpler and more useful than preserving the desktop preview's flexible-height grid.

### Open items

- Record and inspect one provider-backed Realtime turn, rerun the zero-spend preflight, and obtain explicit spend authorization before the exact twelve-request live run.
- Provider-backed Map, six-image gallery, narration, founder brainstorm, cold professional `Send`/`Revise`, final public Video, and `/feedback` Session ID remain open under `GOAL.md`.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 19:22 CT — Reviewed brand marks keep their shape in editable work

**Area:** Deliver / Presentation quality / Style fidelity

### Changed

- Audited the complete saved-Style path into the grounded presentation and found that HTML preserved selected-logo proportions with `object-fit`, while editable PowerPoint forced every logo into one fixed 0.56×0.68-inch rectangle. A wide wordmark would therefore be visibly distorted in the professional handoff even though its reviewed bytes and hash were correct.
- Added an aspect-preserving fit contract for wide, square, and tall marks. The worker now carries the validated selected asset dimensions into the renderer; PowerPoint centers the mark inside bounded cover and infographic regions without changing its proportions, and the infographic label moves beside the actual fitted width.
- Corrected the reproducible external-use deck rebuild to detect SVG content instead of trusting its misleading `.png` filename, carry the SVG viewBox ratio, and emit the correct data URI. Refreshed the editable PowerPoint, PDF, HTML, cover frame, contact sheet, and evidence hashes.

### Verified

- Added direct fit tests for 4:1, 1:2, and unspecified logo ratios. `pnpm check` passed all 13 packages with nine production tests, 19 web tests, and 85 worker tests.
- Inspected the refreshed five-slide contact sheet at full resolution. The selected AI Collective mark, typographic hierarchy, sparse editorial slide, metrics, citations, and recommendation remain visually intact with no observed overflow.
- `unzip -t` found no PowerPoint archive error. Its first-slide XML contains a real SVG image with `noChangeAspect` and a 515472×621792 EMU frame, preserving the selected source mark's 700×844.38 viewBox ratio. LibreOffice produced five 16:9 pages, and `pdftotext -layout` retained the title, claims, metrics, recommendation, and visible source labels.
- `pnpm demo:e2e` passed all six gates. `pnpm submission:build` and `pnpm submission:verify` validated the truthful 17-asset `partial` set; `pnpm demo:film:verify` retained six ready shots and four explicitly evidence-blocked shots; the four recorded external-deck hashes match the evidence record; `git diff --check` passed.

### Decisions

- A reviewed logo is not faithfully implemented if only its bytes survive; its proportions are part of the approved Style contract and must survive the editable PowerPoint handoff.
- This is deterministic send-it improvement, not external approval. The cold professional `Send`/`Revise` gate remains open.

### Open items

- Obtain the intended audience's cold `Send`/`Revise` decision on the refreshed external-use deck.
- Provider-backed Map, image set, Realtime turn, narration, founder brainstorm, final public Video, and `/feedback` Session ID remain open under `GOAL.md`.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 19:33 CT — Intent Profiles now change the work, not just its label

**Area:** Deliver / Presentation quality / Style system

### Changed

- Audited Client pitch, Board presentation, and Team workshop against the same grounded AI Collective Brief and Company Style. The saved profile previously changed only the cover label; HTML and editable PowerPoint otherwise shared one visual and editorial system.
- Made the profile executable in both renderers. Client pitch retains spacious editorial contrast and recommendation emphasis. Board presentation uses a restrained paper/ink cover, decision-oriented language, conservative rules, tighter hierarchy, and a dark leadership-decision close. Team workshop uses action language, an energetic cover, protected logo contrast, a light scan-first working slide, and a direct next-action close.
- Added `pnpm dogfood:intents:build`, which regenerates all three five-slide HTML, PowerPoint, and PDF variants from the exact same traced external Brief and Style, then produces nine review frames, a contact sheet, and a hash manifest under `artifacts/spikes/intent-profile-review-2026-07-15/`.

### Verified

- The first visual comparison exposed three defects not covered by tests: the Board label clipped, the Accent-colored Team logo disappeared on its Accent cover, and Team's sparse middle slide inherited the formal dark treatment. Rebuilt after each repair and inspected the final Board cover, Team middle slide, and nine-frame comparison at full resolution.
- The final comparison preserves the same title, selected logo, grounded claims, visible citations, and recommendation across all three profiles while changing the intended hierarchy, language, cover, working-slide treatment, and close. The three HTML, PowerPoint, and PDF hashes are distinct and recorded in the manifest.
- Added a production contract proving distinct profile classes, labels, and scan treatment. `pnpm check` passed all 13 packages with ten production tests, 19 web tests, and 85 worker tests.
- `pnpm demo:e2e` passed all six gates. `pnpm submission:build` and `pnpm submission:verify` validated the truthful 17-asset `partial` set; `pnpm demo:film:verify` retained six ready shots and four explicitly evidence-blocked shots; `git diff --check` passed.

### Decisions

- Company identity remains stable across Workshops, but Intent Profile must materially alter the deliverable's hierarchy, density, language, and meeting posture. Persisting a profile that only renames the cover is not an executable Style system.
- This is renderer and visual-comparison proof. It does not substitute for a cold professional `Send` decision or provider-backed output-quality evidence.

### Open items

- Obtain the intended audience's cold `Send`/`Revise` decision and run the provider-backed Map, image, Realtime, and narration path after explicit authorization.
- Founder brainstorm, final public Video, final submission Output set, public links, and `/feedback` Session ID remain open under `GOAL.md`.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 19:39 CT — Intent Profiles now reach the editable infographic

**Area:** Deliver / Infographic quality / Style system

### Changed

- Extended the executable Intent Profile contract from the hero deck into the one-page infographic. The previous infographic carried Company Style colors and fonts but ignored the Workshop's selected Client pitch, Board presentation, or Team workshop intent.
- Client pitch retains the source-defensible editorial grid. Board presentation uses restrained top framing, a tighter title hierarchy, and leadership-evidence language. Team workshop uses a warmer card system, stronger action framing, and a more scannable working surface. All three retain the same selected logo, exact four grounded claims, visible source labels, and editable PowerPoint handoff.
- Extended `pnpm dogfood:intents:build` to generate three infographic HTML previews, editable PowerPoints, PDFs, individual review frames, `infographic-contact-sheet.png`, and hashes beside the existing deck comparison.

### Verified

- Inspected the full-resolution three-up infographic comparison. Client remains editorial, Board reads as a restrained evidence brief, and Team reads as a card-based action artifact; no observed overlap, clipping, invisible logo, or citation loss remained.
- Added an HTML contract proving distinct profile classes, language, and treatment. `pnpm check` passed all 13 packages with 11 production tests, 19 web tests, and 85 worker tests.
- The manifest records distinct HTML, PowerPoint, and PDF hashes for each infographic profile. The same input Brief and Style drive all three, so the comparison isolates Intent Profile behavior rather than content drift.
- `pnpm demo:e2e` passed all six gates. `pnpm submission:build` and `pnpm submission:verify` validated the truthful 17-asset `partial` set; `pnpm demo:film:verify` retained six ready shots and four explicitly evidence-blocked shots; `git diff --check` passed.

### Decisions

- Intent is a Workshop-level production rule, so it must affect every editable professional output—not only the presentation cover. Company identity and grounding remain invariant while hierarchy and meeting posture change.
- This closes deterministic profile fidelity for the presentation and infographic. It does not claim provider image quality, professional send approval, or final submission readiness.

### Open items

- Obtain the cold professional `Send`/`Revise` decision and run the provider-backed Map, image, Realtime, and narration path after explicit authorization.
- Founder brainstorm, final public Video, final submission Output set, public links, and `/feedback` Session ID remain open under `GOAL.md`.
- Codex Session ID: unavailable on this surface; not inferred.

## 2026-07-15 19:51 CT — Three-column WorkshopLM workbench replaces the Codex-chat split

**Area:** Product direction / User-flow architecture

### Changed

- Updated `GOAL.md` to lock one NotebookLM-like WorkshopLM application with persistent `Sources | Conversation and current work | Studio` geography on desktop and an adaptive single-column object switcher on mobile.
- Made WorkshopLM's own grounded text and Realtime voice Conversation the primary user-facing chat surface. Codex remains the verified plugin/build/orchestration host and optional doorway, not the product's visible Conversation layer.
- Reopened the structural UX implementation and verification items while preserving the completed July 14 one-current-object shell as historical evidence and reusable accessibility, language, component, and test work.
- Made the established Apps in ChatGPT Figma library non-negotiable for the rebuild. New rails, composer, splitters, inspectors, collapse controls, and responsive patterns require documented WorkshopLM composites built only from verified primitives.

### Verified

- Reconciled the new decision against the objective, definition of done, locked interface contract, locked architecture decisions, Product Design checklist, current evidence, and the July 15 NotebookLM flow audit.
- Confirmed the decision changes composition and Conversation ownership but does not change the domain contracts for Sources, Map, Brief, Style, approvals, Outputs, staleness, source trace, or immutable Video history.

### Decisions

- Stable three-column geography is now the product architecture, not merely a reference pattern or optional layout.
- WorkshopLM will borrow NotebookLM's interaction continuity without copying Google's chrome, marks, language, education framing, or exact proportions.
- Provider-backed media and external `Send`/`Revise` proof remain active in parallel, but the three-column workbench is the next structural product increment.

### Open items

- Implement, visually inspect, and regression-test the new workbench and in-product Conversation surface.
- Reconcile root `DESIGN.md`, the Figma component inventory, and visual baselines as part of implementation rather than inventing page-local chrome.
- Codex Session ID: unavailable on this surface; not inferred.

## 2026-07-15 20:09 CT — Browser Conversation, collaborative voice, and Audio Overview become locked OpenAI-native scope

**Area:** Product architecture / OpenAI API research / Repository hygiene

### Changed

- Committed the complete pre-rebuild worktree as `69f5ee9` (`feat(web): checkpoint professional workflow polish`) after staging and reviewing all intended UI, visual-baseline, goal, audit, log, and submission-draft changes.
- Reconciled `DESIGN.md` so WorkshopLM owns one browser-based `Sources | Conversation and current work | Studio` product instead of splitting Conversation into Codex.
- Added `research/openai-api-capability-roadmap-2026-07-15.md`, mapping current official OpenAI APIs to WorkshopLM user value, priority, architecture, P0 tools, safety boundaries, and explicit deferrals.
- Locked two related but distinct audio experiences: Realtime speech-to-speech collaboration with typed canvas/tool control, and a durable source-grounded Audio Overview created through editable script review plus text-to-speech.
- Added the corresponding unchecked implementation and proof gates to `GOAL.md`.

### Verified

- Before the checkpoint commit, `git diff --check` passed, the intended files contained no detected OpenAI key/Bearer credential pattern, and `pnpm check` passed lint, typecheck, and tests across all 13 packages, including 20 web and 85 worker tests.
- Reviewed current official OpenAI documentation for Responses/Conversation state, tools, Structured Outputs, Realtime/WebRTC conversations, voice agents, speech-to-text, text-to-speech, File Search, image generation, and background mode.
- Official docs confirm browser WebRTC voice-agent sessions support low-latency speech-to-speech, natural turn taking, interruptions, and realtime tool use; Realtime conversations support text/audio generation, image input, and function calling; the Speech endpoint supports controllable TTS and streaming output with required AI-voice disclosure.

### Decisions

- OpenAI replaces Google's model/tool stack, not NotebookLM's proven information architecture.
- Local deterministic retrieval remains the core private grounding path. Hosted File Search, web search, multi-agent handoffs, translation, telephony, custom voices, and fine-tuning remain optional or deferred until the primary seam proves their need.
- Audio Overview is a finished Output; Realtime voice is an interaction mode. Neither substitutes for the other.
- The user's OpenAI API key is authorized for testing, but bounded provider execution must still record and enforce an explicit request ceiling before a paid batch begins.

### Open items

- Implement the three-column shell, browser Conversation, shared typed tool registry, upgraded Realtime voice agent, and first grounded Audio Overview in that order.
- Obtain and record the exact paid-request ceiling before provider-backed batch execution.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 20:12 CT — Stable workbench and professional replacement test become the execution hierarchy

**Area:** Product direction / Interface architecture / Verification

### Changed

- Replaced the swapping-header workflow with one stable desktop workbench: Sources stay left, the current Map/Brief/Output stays centered, and Production stays right with Capture → Shape → Deliver state and one explicit next action.
- Added reusable `Workbench`, `WorkbenchRail`, and `ObjectSwitcher` composites to the shared UI layer, documented their exact official Figma primitive recipes, and extended the UI conformance contract to require those recipes and exports.
- Preserved the same geography on compact screens and replaced the broken narrow-grid placement on mobile with a direct Map / Brief / Outputs / Story switcher.
- Reconciled `GOAL.md` and `DESIGN.md` around plain-language `Production` terminology and the professional replacement test: Presentation is the wedge, `Would I send this?` is the quality bar, the hackathon submission is dogfood zero, and grounded in-product Conversation is the next structural increment.

### Verified

- `pnpm check`, `pnpm demo:e2e`, `pnpm submission:build`, `pnpm submission:verify`, `pnpm demo:film:verify`, and `git diff --check` passed. The submission verifier correctly retained `partial` status because provider-backed Map, image, narration, and Realtime evidence remain absent.
- The web contract suite passed 20 tests. The production-browser suite passed all 27 cases across 1200px desktop, 1024px compact, 390px mobile, reduced motion, contrast, and 200% logical zoom.
- Inspected the final desktop Map screenshot: source scope, current work, production state, and `Review storyboard` next action are simultaneously visible without tabs or duplicate creation controls.

### Decisions

- `Production` is the user-facing name for the accumulating right rail. `Studio` remains retired from this shell because it is less direct and was inconsistent with the implemented UI.
- The stable workbench is Phase 1, not completion of the three-column goal. Conversation, collapse controls, and contextual evidence/affected-work disclosure remain open.
- No paid provider call ran in this increment.

### Open items

- Build WorkshopLM's grounded center Conversation with one text composer, integrated Realtime voice, typed Workshop tools, and persisted source-grounded turns.
- Make exact evidence and affected downstream work visible without losing the claim under review; complete rail collapse/retry behavior.
- Dogfood one real external deck, obtain the cold professional `Send`/`Revise` decision, then address the first concrete revision before expanding output breadth.
- Founder brainstorm, provider media, final public Video, public links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 20:26 CT — NotebookLM landing-page reference archived and translated for WorkshopLM

**Area:** Public product story / research

### Changed

- Preserved eleven user-supplied NotebookLM landing-page captures under `research/screenshots/notebooklm/landing-page-2026-07-15/` with stable, descriptive filenames.
- Added `research/notebooklm-landing-page-reference-2026-07-15.md`, separating NotebookLM's useful long-page information architecture from its Google visual identity and education framing.
- Defined an evidence-led WorkshopLM landing-page sequence: finished-work hero, professional gap, source-to-output proof diagram, production controls, version-aware outputs, example Workshops, qualified trust copy, FAQ, and demo CTA.

### Verified

- Confirmed all eleven supplied files exist in the named research directory.
- Reconciled the recommendation against the current WorkshopLM objective and existing NotebookLM flow audit: persistent source scope, source trace, approvals, output versions, and professional production remain the differentiators.

### Decisions

- Use NotebookLM's narrative sequence and progressive disclosure, not its marks, blue illustration system, academic vocabulary, or generic output cards.
- Keep the Build Week public page evidence-led: do not publish testimonial, privacy, or output claims before the corresponding artifact or policy evidence exists.
- Treat the public video as the primary CTA and strongest proof until a cold external professional `Send`/`Revise` review exists.

### Open items

- Select the first verified hero artifact and build the public landing page only when the user authorizes implementation.
- Founder recording, provider-backed media, final public video, external professional review, public links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 20:35 CT — Grounded Conversation becomes durable Workshop state

**Area:** Capture / Grounding / Interface / Domain contract

### Changed

- Added WorkshopLM's own center Conversation object with a durable SQLite-backed turn history, one text composer, source-scoped grounded replies, exact citation Tokens, and the existing Realtime capture inside the same surface.
- Added the canonical `ConversationTurn` and `ConversationEvidence` domain schemas. Assistant turns pin Source, chunk, claim, locator, snippet, and snippet hash; completed operations are explicitly typed as `source_search` or `voice_capture`.
- Kept a crucial trust boundary: a text question persists as Conversation but does not become a factual Source. A saved spoken thought explicitly becomes a private Source, durable transcript segment, user turn, and grounded assistant response.
- Added `ConversationSurface` to the shared official-Figma-derived UI layer and inventory. Desktop keeps Sources and Production visible; mobile adds `Chat` to the existing object switcher.

### Verified

- `pnpm check` passed all 13 packages with 14 domain tests, 20 web tests, and 86 worker tests. The new worker contract proves a grounded question does not change the Source count and does persist the exact retrieval edge.
- The 28-case production-browser suite passed after visual inspection and baseline reconciliation at 1200×800, 1024×768, and 390×844. It proves stable workbench context, citation opening to the exact locator, the composer, embedded voice capture, keyboard reachability, reduced motion, contrast, and 200% logical zoom.
- `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed. The 17-asset submission remains truthfully `partial`; `pnpm demo:film:verify` remains a draft with four evidence-blocked shots and no final video.

### Decisions

- Queries and Sources are different objects. WorkshopLM may use a question for retrieval, but it may not silently convert the question into evidence or stale downstream work.
- This closes the durable local Conversation and embedded capture UI, not the live-provider contract. Responses streaming, OpenAI continuation IDs, spoken assistant output, interruption, and shared Realtime tool calls remain open.
- No paid provider call ran in this increment.

### Open items

- Implement one shared typed Workshop tool registry and bind it to Responses and Realtime with the same approval, source-scope, stale-state, and privacy rules.
- Upgrade Conversation to Responses streaming and Realtime speech-to-speech behavior, then live-verify one safe read tool, one visible write tool, interruption, and durable provider provenance after explicit request authorization.
- Complete the contextual evidence/affected-work disclosure and collapsible rails.
- Dogfood an external professional deck and obtain the cold `Send`/`Revise` decision before expanding output breadth.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 20:49 CT — Text, voice, and plugin tools share one strict contract

**Area:** Conversation / Realtime / Plugin / Domain contract

### Changed

- Added `packages/domain/workshop-tools.json` as the single validated registry for MCP, Responses, and Realtime: twelve total local tools and the same eight conversational tools for both OpenAI adapters.
- Recorded each tool's strict JSON schema, read/write class, supported channels, explicit-user-intent requirement, and visible effect. All writes remain local, non-destructive, and confirmation-bound; source-scope changes continue through the existing downstream invalidation path.
- Replaced the MCP server's duplicated definitions with the canonical registry and added `workshop_set_source_scope`. The protocol now publishes only MCP fields rather than leaking internal channel/effect metadata, and the compiled plugin loads the checked-in JSON without a runtime TypeScript-package dependency.
- Changed new grounded Conversation replies from the legacy `source_search` label to the canonical `search` operation. Existing persisted legacy turns remain readable.
- Added the same official function-tool schemas to the Realtime client-secret session. Capture-only mode deliberately retains text-only output, disabled automatic responses, and `tool_choice: none`; this does not claim live voice tool execution.

### Verified

- Confirmed the current official Realtime API accepts session function tools with `type`, `name`, `description`, JSON Schema `parameters`, and `tool_choice`; no provider request was made.
- `pnpm check` passed all 13 packages with 15 domain tests, seven plugin tests, 20 web tests, and 86 worker tests. Contract tests prove text/voice schema parity, strict extra-property rejection, required version inputs, and explicit intent on every write.
- The compiled stdio plugin loaded twelve tools directly from the canonical JSON and exposed `workshop_set_source_scope` without a runtime domain import. Its end-to-end server tests passed grounded reads, version-gated writes, and protocol projection.
- `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed. The deterministic seam remains green; the 17-asset submission remains truthfully `partial` for the four recorded provider-media limitations.

### Decisions

- Schema parity precedes provider execution. Responses and Realtime may not invent adapter-specific tool names, parameters, approval behavior, privacy behavior, or mutation effects.
- Tool descriptions are not authorization. Every write requires explicit user intent, and capture-only Realtime receives tools with execution disabled until the server executor, visible-effect UI, result persistence, and interruption behavior are implemented.
- No paid provider call ran in this increment.

### Open items

- Implement one server-side executor for Responses and Realtime function calls, including strict input validation, source-scope enforcement, exact-version gates, durable calls/results/provider IDs, and visible write effects.
- Upgrade text Conversation to Responses streaming and voice to speech-to-speech Realtime; then live-verify one safe read, one visible write, interruption, and durable provider provenance after explicit request authorization.
- Complete contextual affected-work disclosure and collapsible rails; obtain the external deck's cold `Send`/`Revise` decision.
- Founder brainstorm, provider media, final public Video, public links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 20:51 CT — Installed Codex plugin cache refreshed to canonical tools

**Area:** Plugin runtime verification

### Changed

- Fast-forwarded the installed WorkshopLM `0.1.3` Codex plugin cache from `e626eff` to source commit `4893436` after the source checkpoint reached public `main`.
- Preserved the cache's untracked `submission/DEVPOST-DRAFT 2.md`: its SHA-256 exactly matched the newly tracked upstream file before the redundant untracked copy was removed and the cache was updated.

### Verified

- Imported the installed compiled `packages/plugin-mcp/dist/tools.js` from the real cache. It loaded twelve canonical tools and included `workshop_set_source_scope`.
- The installed cache reports commit `4893436` and a clean working tree.

### Open items

- A fresh Codex task is still required to prove the host reloads the refreshed tool list; the current task cannot hot-reload its own plugin process.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 21:02 CT — Shared provider tool executor persists trustworthy Workshop effects

**Area:** Conversation / Realtime / Responses / Durable state

### Changed

- Added one local server-side executor for every conversational Workshop tool in the canonical registry. Responses and Realtime now have the same strict input parser, channel allowlist, active-Workshop boundary, active Source-scope enforcement, exact Map and Storyboard version gates, and explicit-user-intent requirement for writes.
- Persisted successful and failed tool calls in Workshop state with their input, visible effect, result, model, response ID, call ID, event ID, timestamps, and error state. Provider retries with the same channel and call ID replay the original result instead of repeating a mutation; malformed retries are idempotent too.
- Added the local Workshop API boundary for executing a provider tool call. Search and fetch return exact grounded chunks and linked claims; source-scope, Brief approval, Output creation, Storyboard approval, and Video render calls reuse the existing Workshop mutation and stale-propagation paths.
- Reframed the product tracker around the next truthful boundary: provider event binding and visible Conversation activity remain open even though the shared executor is complete.

### Verified

- `pnpm check` passed all 13 packages with 16 domain tests, seven plugin tests, 20 web tests, and 91 worker tests. New executor tests cover grounded Responses evidence, explicit write intent, exact version rejection, Source-scope rejection, successful mutation, durable provider provenance, duplicate provider replay, and repeated malformed-call replay.
- `pnpm demo:e2e` passed the full deterministic seam through rendered Video.
- `pnpm submission:build` and `pnpm submission:verify` passed the 17-asset package without stale or tampered files. Its status remains truthfully `partial`: no provider-verified WebRTC transcript, no live GPT-5.6 Map, zero of six GPT Image 2 panels, and placeholder narration tones.
- `git diff --check` passed. No paid provider request ran.

### Decisions

- Provider identity is channel-scoped so a coincidentally reused call ID cannot collide across Responses and Realtime.
- Tool execution and tool presentation are separate completion bars. Durable server behavior is implemented; WorkshopLM will not claim a working agent loop until provider events call it and the professional sees each read, write, result, and consequence in Conversation.
- The colleague's product-first wedge does not require another scope rewrite: the live `GOAL.md` already makes the source-defensible Presentation the hero, grades Outputs against the send-it bar, and keeps trust, return use, and dogfood evidence ahead of additional breadth.

### Open items

- Bind Responses streaming and Realtime function-call events to the executor, persist continuation IDs, and render tool activity plus visible effects in Conversation.
- Enable and live-verify Realtime spoken responses, interruption, one safe read, and one explicit visible write only after request spend is authorized.
- Obtain the external-use deck's cold professional `Send`/`Revise` decision; provider media, founder recording, final public Video, public links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 21:14 CT — Official provider events reach visible Workshop Conversation activity

**Area:** Responses / Realtime / Conversation / Provider provenance

### Changed

- Added thin adapters for the official Responses `response.output_item.done` function item and Realtime `response.function_call_arguments.done` event. Both decode arguments, call the shared executor, persist exact provider IDs and results, and return the provider-specific function output envelope.
- Added durable Responses continuation state. Non-tool response lifecycle events and completed tool items can record the current response ID and model without making hosted state the Workshop source of truth.
- Wired the browser Realtime data channel to send completed function events through the local API, return `conversation.item.create` function output, and request continuation. Capture-only sessions still disable automatic tool choice, so this is ready plumbing rather than a live voice-agent claim.
- Merged persisted tool calls into the chronological Conversation timeline. Professionals see short activity such as `Searched selected sources · Chat` and the grounded result summary; raw tool names, call IDs, response IDs, and event IDs remain hidden.

### Verified

- `pnpm check` passed all 13 packages with 16 domain tests, seven plugin tests, 20 web tests, and 95 worker tests. New adapter tests cover Responses continuation, Responses function output, Realtime function output, grounded provenance, and invalid provider arguments as a durable failed result.
- Sent a simulated official Responses event through the real isolated local API. It searched the active Workshop, returned two exact evidence chunks, persisted `resp-ui-proof-1`, and created one successful Responses tool call with the exact item/call provenance.
- Inspected the real local Conversation using Chrome automation because the Codex in-app Browser tool was unavailable in this task. At 1200×800 and 390×844, the activity remained legible, fit the available width, and exposed no raw `workshop_` tool name or provider call ID. Evidence captures are `artifacts/spikes/provider-tool-event-ui-2026-07-15/desktop-conversation.png` (`2c7bcefd0552…`) and `mobile-conversation.png` (`c23054308183…`).
- `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed. The submission remains truthfully `partial` with the same four provider-media limitations. No paid request ran.

### Decisions

- Provider events remain adapters, not a second execution system. All policy, version, source-scope, mutation, idempotency, and persistence behavior stays in the shared executor.
- Model output is not user authorization. Realtime writes currently fail safely because the browser passes `explicitUserIntent: false`; the next loop must show a clear confirmation before retrying a write with authorization.
- Visible activity uses official UI tokens and plain professional language. An initial hard-coded OpenAI green was rejected by the design-system test and replaced with the inspected `--oai-green` token before acceptance.

### Open items

- Implement the actual spend-gated Responses SSE producer and continuation loop, persist streamed assistant text plus evidence, and add explicit write confirmation.
- Promote Realtime from capture-only to speech-to-speech with the same confirmation path, then live-verify interruption, one read, one write, transcript, and tool provenance after authorization.
- Collapsible rails, contextual affected-work disclosure, the external deck's cold `Send`/`Revise` decision, provider media, founder recording, final public Video, public links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 21:21 CT — Model writes require one visible professional confirmation

**Area:** Conversation / Trust / Approval safety

### Changed

- Added a shared confirmation retry contract for provider-generated writes. A call first rejected for missing explicit intent may be retried with the same provider call ID only after an explicit UI action; the confirmed attempt receives a distinct durable invocation ID and remains idempotent thereafter.
- Added plain-language confirmation cards inside Conversation for Source selection, Brief approval, Output creation, Storyboard approval, and Video creation. Each uses the exact user action as its button label.
- Suppressed the superseded failed-intent record after confirmation so the professional sees one final successful activity rather than a false lingering error. Durable state still retains both the rejected and confirmed attempts for audit.
- Separated professional recovery copy from durable diagnostics. Malformed inputs and stale versions no longer expose `workshop_*` names, provider IDs, or schema internals in Conversation.

### Verified

- Worker tests prove an initial Realtime write stays unchanged, the exact provider call succeeds once after explicit intent, both intent states persist in order, and later provider retries replay without a second mutation.
- Ran the real local browser/API seam against an isolated seeded Workshop. An official-shaped Realtime Brief-approval event produced `Confirmation required · Voice` and one `Approve Brief` button while `briefApproved` remained false. Clicking the activity button produced `Approved Brief · Voice`, set `briefApproved` true, persisted intents `[false, true]` with statuses `[failed, succeeded]`, removed the pending button, and exposed no `workshop_` text.
- Narrow worker, web, UI-contract, and type checks passed. No paid provider request ran.

### Decisions

- A model asking to write and a professional authorizing the write are separate events. Voice phrasing alone is not inferred as consent in this implementation.
- The rejected attempt remains in durable state for provenance but disappears from the visible timeline after its exact provider call is successfully confirmed.
- Confirmation uses existing official Button and Conversation primitives; no modal, third approval system, or settings concept was introduced.

### Open items

- Build the actual spend-gated Responses SSE producer/continuation loop and persist its final assistant text plus grounded evidence.
- Enable the same confirmation-aware Realtime speech loop, then live-verify interruption, one read, one write, transcript, and provider provenance after authorization.
- The external deck `Send`/`Revise` review and all final provider/demo/submission evidence remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 21:30 CT — Grounded Responses streaming reaches the browser Conversation

**Area:** Responses / Conversation / Grounding / Durable state

### Changed

- Added the spend-gated Responses producer and SSE loop. It sends the canonical Workshop tools, consumes text deltas and completed function items, returns local `function_call_output` records with the prior response ID, and enforces a one-to-four-request ceiling.
- Added idempotent provider Conversation persistence. The user turn is keyed to the browser message ID; the final assistant turn is keyed to the OpenAI response ID and stores the exact evidence returned by successful `search` or `fetch` calls plus the durable continuation ID.
- Added an NDJSON browser route and visible streaming assistant turn. When live access is disabled or unavailable, the UI uses the existing deterministic grounded answer without presenting provider configuration as a user-facing failure.

### Verified

- All 98 worker tests passed. New deterministic fetch tests cover a streamed direct response, a grounded search-to-continuation loop with exact evidence, and rejection before persistence when authorization or the request ceiling is missing.
- All 20 web tests and both worker/web typechecks passed.
- Ran the real local UI against a clean seeded data root using Chrome automation because the Codex in-app Browser tool was unavailable in this task. `/api/conversation` returned 503 with live flags absent; the visible answer completed through local grounding and the persisted assistant turn carried three evidence links while `conversationContinuation` remained unset.
- `pnpm check`, `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed. The 17-asset package remains honestly `partial` with no provider-verified voice, live GPT-5.6 reasoning, GPT Image 2 panels, or provider narration. No paid request ran.

### Decisions

- Provider streaming is additive to the local product, not a hidden dependency. The Workshop remains usable and source-grounded without credentials.
- The server owns API credentials, request ceilings, tool execution, evidence derivation, and durable continuation. The browser receives only bounded stream events and final Workshop state.
- This closes implementation and deterministic verification of the Responses loop, not provider-backed product proof.

### Open items

- Run the exact Responses path with authorized provider spend and inspect visible streamed text, source citations, tool activity, and continuation persistence.
- Promote Realtime to confirmation-aware speech-to-speech, then live-verify spoken response, interruption, one read, one write, transcript, and provider provenance after authorization.
- Obtain the external deck `Send`/`Revise` review; provider media, founder recording, final public Video, public links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 21:37 CT — Realtime conversation mode is ready for live voice proof

**Area:** Realtime / Voice / Conversation / Durable provenance

### Changed

- Split the Realtime control into truthful capture and conversation modes. Add Source keeps transcription-only capture; the center Conversation now requests audio output, `marin`, automatic Workshop tools, server-VAD response creation, and interruption.
- Attached the remote WebRTC media track for speech playback and reduced provider audio-transcript delta/done events into visible assistant text with response and event provenance.
- Persisted a completed voice session as a private Source plus durable user and assistant turns. When a provider-spoken answer exists, WorkshopLM saves that answer and its tool-derived evidence rather than creating a second deterministic reply.
- Kept the standard API key exclusively on the server and returned only the short-lived client secret plus explicit session mode to the browser.

### Verified

- Official current Realtime documentation confirms audio output includes a transcript, `output.voice` supports and recommends `marin`, and server VAD supports automatic response creation plus interruption.
- All 22 web tests passed, including separate capture/conversation session contracts and assistant transcript provenance. All 99 worker tests passed, including provider-spoken answer persistence without a duplicate assistant turn.
- The real local UI shows `Talk with WorkshopLM`, explains selected-Source grounding, and exposes one `Start talking` action. With live access disabled, the token route returned 503 before provider contact. No paid request ran.
- `pnpm check`, `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed. The submission remains truthfully `partial` with the same four provider-evidence limitations.

### Decisions

- Voice collaboration and source capture share transport but not behavior. Professionals can talk with WorkshopLM in Conversation without turning every Add Source action into an answering agent.
- The provider-spoken transcript is the durable assistant record. Local fallback text is used only when no provider assistant answer exists.
- This proves configuration, event handling, UI, and persistence—not live microphone, audio, grounding, or interruption behavior.

### Open items

- Return a successful confirmed write result to the active Realtime data channel so the spoken agent can acknowledge and continue after the professional's visible action.
- Live-verify one grounded read, one visible confirmed write, spoken response, interruption, input/assistant transcripts, and durable provider provenance after explicit spend authorization.
- Obtain the external deck `Send`/`Revise` review; provider media, founder recording, final public Video, public links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 21:40 CT — Voice confirmation resumes the same spoken session

**Area:** Realtime / Confirmation / Conversation continuity

### Changed

- Converted a successful visible Realtime confirmation into the official `conversation.item.create` function-output envelope and returned it to the still-open voice data channel, followed by `response.create`.
- Made the continuation single-use and connection-safe: it flushes immediately on an open channel or when a connecting channel opens, then clears from browser state.
- Discarded any unsent continuation when the voice surface closes or saves so an old confirmed action cannot enter a later session.

### Verified

- The new envelope test proves the exact call ID and serialized successful result returned to Realtime and rejects an empty call ID.
- All 23 web tests and web typecheck passed. `git diff --check` passed. No paid provider request ran.

### Decisions

- The visible confirmation remains the authorization boundary; voice never infers consent from speech alone.
- A confirmed result belongs only to the session that proposed it. Closing voice intentionally forfeits spoken acknowledgement while preserving the already-completed Workshop mutation and durable audit trail.

### Open items

- Provider-backed proof remains required for spoken grounding, remote audio, interruption, read-tool continuation, visible write confirmation, and post-confirmation speech.
- The external deck `Send`/`Revise` review and all final provider/demo/submission evidence remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 21:51 CT — External deck dogfood becomes a decision artifact

**Area:** Professional wedge / Deck / Dogfood one / Send-it quality

### Changed

- Rejected the original five-slide AI Collective chapter-launch candidate as a polished promotional teaser rather than treating clean rendering as product success. It lacked an executable plan, operating commitments, and a decision for its intended professional audience.
- Rebuilt the checked-in source-defensible brief as a nine-slide sequence: professional purpose, scale proof, repeatable event model, visibly derived four-week plan, sustainability commitment, trust policies, three launch decisions, and one recommendation.
- Added dedicated plan and decision layouts to responsive HTML and editable PowerPoint. The plan uses editable week cards; the decision view uses editable numbered decision cards. Both preserve quiet citations and exact source notes.
- Added the AI Collective Code of Conduct and Data Privacy and Use Policy to the evidence record. Derived plan and recommendation content is visibly labeled as derived and requiring AI Collective HQ validation.
- Hardened the rebuild command so an external candidate cannot silently regress to a teaser, omit source trace, hide derived content, or render plan/decision views without actionable items.

### Verified

- `pnpm dogfood:deck:build` produced nine slides, responsive HTML, editable PowerPoint, a nine-page 16:9 PDF, nine review frames, and a two-column contact sheet from the checked-in manifest.
- The PowerPoint ZIP archive passed `unzip -t`; LibreOffice completed the PowerPoint-to-PDF round trip; `pdfinfo` reported nine 960×540-point pages.
- Full-resolution inspection of the four-week plan, decision view, and complete contact sheet found no observed overflow, clipping, raw implementation labels, or unlabeled derived claims. A PNG viewer artifact was ruled out by rendering the same page to JPEG; the PDF footer remained intact.
- The output hashes are recorded in `artifacts/spikes/external-deck-dogfood-2026-07-15.json`. `pnpm check` passed all 13 packages, including 12 production, 23 web, and 99 worker tests. `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed; the 17-asset submission remains honestly `partial` with the four provider limitations unchanged.
- `git diff --check` and the scoped credential scan passed. No paid provider request ran.

### Decisions

- The professional wedge is a grounded, branded deck that helps someone make or communicate a decision—not a generic collection of attractive source summaries.
- Internal visual review may return `Revise` and drive product work, but it cannot substitute for the intended audience's cold `Send`/`Revise` judgment.
- Derived professional recommendations are allowed only when the output distinguishes them from source facts and names the required validation boundary.

### Open items

- Put the revised deck in front of its intended professional audience. Record the cold `Send`/`Revise` decision and apply concrete revisions until it clears the bar; no external approval is claimed yet.
- Provider-backed text, speech, image, and narration proof; founder recording; final public Video and links; and the `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 22:03 CT — The workbench makes room without hiding consequences

**Area:** Workbench / Source scope / Staleness / Responsive UX

### Changed

- Added independent desktop collapse controls to the persistent Sources and Production rails. Each open rail retains the locked three-column composition; each collapsed rail becomes one quiet 48px restore handle, and collapsing both gives the current object the reclaimed space.
- Added a pre-mutation Source-scope disclosure. Selecting or clearing a Source now identifies the affected Source, keeps its excerpt and locator visible, names every current downstream artifact that will need an update, and explicitly says the reusable Style stays the same.
- Kept the professional in control with only `Update sources` and `Cancel`. The checkbox reflects durable scope until the professional confirms; attempting to clear the last Source is rejected locally with plain-language copy.
- Reused the official Apps in ChatGPT IconButton, Card, Button, Checkbox, WorkbenchRail, and SideSheet primitives. No new navigation, modal system, settings concept, or custom raw control was introduced.
- The first browser implementation showed the same impact card in the rail and the open Sources sheet. Suppressed the background rail copy while the sheet owns the interaction, leaving exactly one visible disclosure.

### Verified

- In the real Codex in-app browser at 1280×720, the open Sources/Production/canvas widths were 220/252/808px. Both unique collapse controls reduced the rails to 48/48px and expanded the canvas to 1184px; both restore controls remained accessible.
- Added a second local test Source through the visible UI, then requested its removal. Before mutation the checked state stayed durable and one disclosure named Map, Brief, Presentation, Infographic, Image set, Storyboard, Video, and the preserved Style beside the selected Source excerpt.
- `Update sources` moved active scope from two Sources to one, returned the Map from seven ideas to six, preserved Style as `Ready`, and visibly marked Brief, Presentation, Infographic, Image set, Storyboard, and Video `Needs update`.
- At a 390px viewport, desktop rails remained hidden, the direct Source count and object switcher remained visible, and the same single disclosure fit in the Source sheet without horizontal overflow. Browser console and warning logs were empty.
- Direct comparison against the locked Map reference and the latest desktop/mobile screenshots passed the seven-point fidelity ledger in `artifacts/ui/workbench-rails-qa-2026-07-15.md`. The screenshots and exact responsive boundaries are checked in under `artifacts/ui/`.
- All 24 web tests passed, including the expanded official-component and collapse/impact contract. `pnpm check` passed all 13 packages; `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed after resetting the acceptance fixture. The 17-asset package remains honestly `partial` with the same four provider limitations. No paid request ran.

### Decisions

- Rail collapse is a reversible view preference, not Workshop data. It remains session-local and disappears entirely at the compact breakpoint where the established sheet/switcher model is clearer.
- Source scope is a high-consequence grounding decision after a Map exists. WorkshopLM must disclose its blast radius before changing durable scope rather than explaining stale work afterward.
- Style is deliberately excluded from Source-scope invalidation and is named as preserved so the disclosure communicates both impact and safety.

### Open items

- Production's complete failed/partial/retry state coverage remains open; provider-backed text, speech, image, and narration proof is still required.
- The external deck cold `Send`/`Revise` judgment, founder recording, final public Video and links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 22:20 CT — Production failures become recoverable work

**Area:** Production rail / Failure recovery / Partial success / Video jobs

### Changed

- Preserved Presentation and Infographic failures in durable Workshop state instead of letting a transient error toast disappear. Each failed deliverable names what happened, confirms that the approved Brief and Style are safe, and clears only after that deliverable succeeds.
- Exposed the existing two-attempt Video retry budget in product state. The first renderer failure requeues automatically; the second becomes a calm terminal `Couldn't create` state with `Try video again`.
- Changed queued Video from an inert `Creating…` state to a cancellable `Waiting` state. Cancellation preserves the approved Storyboard, records `Cancelled`, and offers the same bounded restart path.
- Made partial image failure route to the focused Image set with `Review image`; only the failed panel offers `Request replacement`. A requested replacement now holds the dominant action at `Creating replacement…` instead of sending the professional to approve a stale Storyboard.
- Kept all recovery inside the official Production rail, existing focused Image set, and existing Apps in ChatGPT primitives. No job dashboard, settings surface, tab, or raw provider/queue language was added.

### Verified

- In an isolated seeded Workshop in the real Codex in-app browser, queued Video showed `Cancel video`; cancelling showed `Cancelled` and `Try video again`; a controlled renderer failure stopped after two attempts, preserved the approved Storyboard, and showed `Couldn't create` plus `Try video again`.
- One controlled image failure showed `Partly ready`, `1 image needs attention`, and `Review image`. The focused Hero concept alone showed `Request replacement`; after selection it showed `Replacement requested`, Storyboard became `Needs update`, Video returned to `Planned`, and the dominant action remained `Creating replacement…`.
- One persisted Infographic failure retained the current Presentation, showed the safe recovery message and `Couldn't create`, and exposed `Try outputs again`. Browser console and warning logs were empty.
- The exact browser paths and screenshots are recorded in `artifacts/ui/production-recovery-qa-2026-07-15.md`. Visual inspection confirmed the partial Image set and failed Infographic states render cleanly in the 1280×720 workbench.
- `pnpm check` passed all 13 packages, including 25 web and 100 worker tests. `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed. The 17-asset package remains honestly `partial` with the same four provider limitations. `git diff --check` and the scoped credential scan passed. No paid provider request ran.

### Decisions

- Durable failure belongs to the work item that failed, not to a global notification or a separate queue-management product.
- Automatic Video retry is capped at two attempts. A professional may explicitly start a fresh bounded run after terminal failure or cancellation.
- Selective image replacement must make stale downstream approval visible and wait for new image work; it cannot silently recreate the full batch or let the old Storyboard advance.

### Open items

- Provider-backed text, speech, image, and narration proof remains required; this increment proves recovery behavior with deterministic local controls, not live provider reliability.
- The external deck cold `Send`/`Revise` judgment, founder recording, final public Video and links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 22:49 CT — Audio Overview becomes grounded, editable work

**Area:** Production Outputs / Speech / Source trace / Versioning

### Changed

- Added Audio Overview as a first-class domain and shared tool Output. An approved current Brief and Style now create a structured three-part professional briefing whose executive summary, evidence review, and decision review each retain exact claim, Source, chunk, and locator edges.
- Added immutable script editing: saving a reviewed change creates `audio-overview-vN`, marks the prior version stale, retains its source edges, and keeps the script under the Speech API input ceiling. Source-scope, Map, provider-graph, source-ingestion, and Style changes now honestly stale dependent Audio Overviews.
- Added the focused Production experience using the locked Apps in ChatGPT primitives: gallery and Production-rail status, editable sections, `Show source`, `Save script`, `Create audio`, local playback, `Download audio`, duration/source coverage, and explicit AI-voice disclosure.
- Added a spend-gated `gpt-4o-mini-tts` adapter that sends the reviewed script with `marin`, validates a structurally real WAV, stores the bytes locally, and records duration, byte count, SHA-256, model, voice, instructions, request ID, and generation time. Provider failure keeps the reviewed script and presents a recoverable state.
- Extended the local plugin/Responses/Realtime tool contract and trace lookup so Audio Overview creation and Output-to-claim-to-source inspection use the same canonical surface as other Outputs.
- Added the current grounded Audio Overview script to the recorded-fixture acceptance path without representing the deterministic script as provider audio.

### Verified

- In an isolated seeded Workshop in the real Codex in-app browser, the visible happy path approved the Brief, selected Style, created Outputs, and showed an Audio Overview gallery card with three sourced points. Opening it exposed all three editable sections; `Show source` revealed the exact excerpt, Source, origin, and locator.
- Editing the executive section and choosing `Save script` produced visible Version 2 while preserving three source edges and labeling the changed section `Edited`. With live media disabled, `Create audio` failed closed with `Live OpenAI media is not enabled for this Workshop`; no request or spend occurred.
- A deterministic one-second local WAV fixture proved the exact playback and download path. The focused view showed Version 2, one audio element, one download link, duration, `gpt-4o-mini-tts`, `marin`, and AI-generated-voice disclosure. The artifact route returned HTTP 200. Desktop screenshots are checked in at `artifacts/ui/audio-overview-gallery.png` and `artifacts/ui/audio-overview-playback.png`.
- At a 390px browser viewport the document width remained exactly 390px with no horizontal overflow; the browser console contained zero errors. The local fixture screenshot itself was discarded because the browser capture surface returned an unhelpfully short frame; responsive proof is the measured live DOM boundary, not that discarded image.
- Added source-edge, versioning, staleness, provider-request, WAV-validation, failure-recovery, canonical-tool, and official-copy regressions. `pnpm check` passed all 13 packages, including 105 worker, 25 web, 16 domain, and seven plugin tests.
- `pnpm demo:e2e` passed with one current three-section grounded Audio Overview. `pnpm submission:build` and `pnpm submission:verify` passed with 17 valid, current, untampered assets and the same honest `partial` provider limitations. `pnpm demo:film:verify` passed its draft truth gate at 162 seconds; six shots are ready and four remain evidence-blocked. `git diff --check` passed.

### Decisions

- Audio Overview is a Production deliverable, not a recording of the live voice assistant. It therefore requires its own grounded, editable script, immutable versions, provenance, and disclosure.
- Style Intent selects the initial professional posture; the first implementation remains one coherent briefing with three functional sections rather than a decorative two-host podcast simulation.
- Local fixture audio may prove playback and download plumbing but cannot close the live Speech API requirement or appear as provider evidence.

### Open items

- One explicitly authorized `gpt-4o-mini-tts` generation must still be audibly inspected before the Audio Overview goal item can close.
- Provider-backed GPT-5.6, Realtime, GPT Image 2, and Video narration proof; the external deck cold `Send`/`Revise` judgment; founder recording; final public Video and links; and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 23:00 CT — Submission trace now includes Audio Overview

**Area:** Submission Output set / Provenance / Judge-facing claims

### Changed

- Made the grounded Audio Overview a required member of the traced submission Output set. The package input fingerprint now binds its exact immutable version, and a package cannot build without a current grounded script.
- Added `AUDIO-OVERVIEW.md` with the reviewed sections and exact claim, Source, chunk, and locator edges. A provider-generated WAV is included only when its recorded SHA-256 matches the stored file; otherwise the manifest names the missing speech evidence instead of treating the script as audio.
- Expanded the recorded fixture package from 17 to 18 required assets and added Audio Overview state and provider provenance to the evidence report.
- Corrected stale generated copy that implied Codex owned the professional conversation surface. WorkshopLM's in-app browser owns grounded text and Realtime voice Conversation; Codex remains the development, verification, plugin, and launch host.
- Reconciled current architecture, workflow, opportunity, Devpost, and evidence-audit documents to the same host boundary and 18-asset package truth.

### Verified

- `pnpm check` passed all 13 packages, including 106 worker, 25 web, 16 domain, and seven plugin tests.
- Added submission regressions for the required Audio Overview, exact Source locator export, corrected host copy, 18-asset manifest, and hash-verified WAV copying.
- `pnpm demo:e2e` passed with the grounded three-section Audio Overview in the deterministic seam.
- `pnpm submission:build` and `pnpm submission:verify` passed with 18 valid, current, untampered assets. The manifest remains honestly `partial` and lists five evidence gaps: provider Realtime, GPT-5.6 Map reasoning, six GPT Image 2 panels, Video narration, and Audio Overview speech.
- `pnpm demo:film:verify` passed the draft truth gate at 162 seconds, with six ready shots and four evidence-blocked shots. The final video remains absent and the partial manifest is not accepted as final-ready evidence.
- `git diff --check`, the scoped credential scan, and the current-document stale-claim scan passed. No paid provider request ran.

### Decisions

- A grounded script is a real professional Output, but it is not provider-generated speech. The submission package preserves that distinction in both the asset list and limitations.
- The professional Conversation surface is part of WorkshopLM's product UI. Codex accelerates and hosts the development/plugin doorway but is not represented as the product's source-grounded chat interface.
- Submission provenance must bind every required Output version; adding Audio Overview without including its version in the fingerprint would permit an undetected stale package.

### Open items

- Explicit provider authorization and audible inspection are still required for Audio Overview speech, alongside the other provider evidence families.
- The external deck cold `Send`/`Revise` judgment, founder recording, final public Video and links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 23:09 CT — Presentation covers stop repeating slide one

**Area:** Professional send-it quality / Presentation renderer / Intent Profiles

### Changed

- Audited the actual nine-slide external-use contact sheet and found a concrete machine-assembly defect: the cover silently reused the first content slide's supporting sentence, then repeated it verbatim on slide two.
- Added an explicit executive-summary field to the presentation contract. Reviewable external briefs may supply an intentional framing line; normal Workshop generation now produces a factual Intent-aware summary grounded in the active Source count.
- Added distinct safe fallbacks for Client pitch, Board presentation, and Team workshop so older callers never regain the repeated-copy behavior.
- Rebuilt the AI Collective external-use HTML, editable PowerPoint, nine-page PDF, cover frame, and contact sheet with the non-repeating line `A decision-ready plan for launching a credible, repeatable local chapter.`
- Refreshed the three Intent Profile deck and infographic review sets and their hash manifest against the current renderer. Updated the external-deck evidence record to the exact current hashes.

### Verified

- The rebuilt cover and slide two were inspected at full resolution. The cover has its own executive framing line; the source-backed chapter-lead sentence now appears exactly once in both HTML and extracted PDF text.
- `unzip -t` reported no errors in the editable PowerPoint archive. LibreOffice completed the round trip, and `pdfinfo` reported nine 16:9 pages at 960×540 points.
- The refreshed three-profile contact sheet was visually inspected. Client, Board, and Team covers retain their distinct systems; metric and plan slides remain intact with no observed clipping or overflow.
- Added renderer regressions for explicit summaries, profile-aware fallbacks, and non-duplication. `pnpm check` passed all 13 packages, including 13 production, 106 worker, 25 web, 16 domain, and seven plugin tests.
- `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed. The 18-asset package remains valid, current, untampered, and honestly `partial` with five provider-evidence gaps.
- `pnpm demo:film:verify` passed its draft truth gate at 162 seconds; six shots are ready and four remain evidence-blocked. No paid provider request ran.

### Decisions

- Cover copy is editorial framing, not an implementation convenience. A renderer may use a calm profile-aware fallback, but it may not promote the first slide's evidence sentence into duplicated cover copy.
- Generated framing may state the selected Source count because that is durable Workshop state. It must not invent a business outcome or claim that is absent from the approved Brief.
- This removes a visible send-it defect but does not substitute internal visual review for the intended audience's cold judgment.

### Open items

- Put the refreshed nine-slide deck in front of its intended professional audience and record `Send` or the first blocking revision.
- Provider-backed text, speech, image, and narration proof; founder recording; final public Video and links; and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 23:15 CT — Empty Workshops capture before they style

**Area:** First five minutes / Onboarding / Excalidraw framing / Responsive UX

### Changed

- Removed Company Style as a prerequisite for adding the first Source. A new professional now chooses the outcome and Workshop name, then lands directly on voice, notes, public URL, or local PDF intake.
- Simplified the material screen to say `Choose the look after the thinking is clear.` Back returns to the outcome choice. The legacy Style onboarding state remains readable for durable compatibility, but new Workshops do not enter it.
- Preserved the real production requirement at the right boundary: after Brief approval, `Choose style` becomes the one next action, and Outputs remain unavailable until a reviewed current Style exists.
- Added initial Excalidraw scene fitting. WorkshopLM waits for the converted scene, then fits the complete Source card, claim nodes, and edges into 88% of the visible center canvas instead of clipping the final idea behind Production.
- Reconciled the first-use contract in `GOAL.md` to the actual Capture → Shape → Deliver order. Company Style is now explicitly post-Brief production setup rather than pre-Capture friction.

### Verified

- Started from an empty isolated data root in the real Codex in-app browser. Choosing `Client pitch` went directly to `Add the thinking` with `Record voice`, one unified Source field, `Add source`, and `Build my Map`; no Company Style decision appeared first.
- Pasted one realistic meeting note. The product created one private Source and three separately grounded Map ideas, preserved the exact excerpt and locator, and exposed `Approve brief` as the sole next action.
- The first 1280×720 run revealed the third idea clipping behind the right rail. After the fit repair, the Source card and all three claims were simultaneously visible with Sources and Production open; no manual pan, zoom, or rail collapse was required.
- At 390×844, the same three claims rendered as readable verified cards. Measured `innerWidth`, document width, and body width were all exactly 390px; there was no horizontal overflow.
- Approving the Brief moved to the Brief view and changed the Production next action to `Choose style`, proving Style moved to the intended boundary rather than being removed.
- Browser console and warning logs were empty. Evidence screenshots are checked in at `artifacts/ui/capture-first-map-desktop-2026-07-15.png` and `artifacts/ui/capture-first-map-mobile-2026-07-15.png`.
- Added onboarding and visible-scene-fit regressions. `pnpm check` passed all 13 packages, including 27 web, 106 worker, 16 domain, 13 production, and seven plugin tests.
- `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed. The 18-asset submission remains valid, current, untampered, and honestly `partial` with five provider-evidence gaps. `pnpm demo:film:verify` passed its 162-second draft truth gate. No paid provider request ran.

### Decisions

- A professional should not configure production aesthetics before WorkshopLM proves it understands the work. The first magic moment is grounded structure; Style becomes consequential only after the Brief is approved.
- Scene fitting changes only the viewport, not graph geometry. It therefore cannot create false Map edits, revoke approvals, or alter persisted semantic positions.
- The full initial Map must be legible with both professional context rails open. Rail collapse remains optional workspace control, not a prerequisite for understanding the product.

### Open items

- The same under-two-minute path must still run with provider-backed GPT-5.6 organization and a real Realtime microphone turn before the live first-five-minutes gate can close.
- The external deck cold `Send`/`Revise` judgment, provider media, founder recording, final public Video and links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 23:24 CT — Style stops asking the same question twice

**Area:** Product wedge / First 15 minutes / Company Style / Responsive UX

### Changed

- Reconciled the proposed product-first roadmap against `GOAL.md`. The current goal already names the weekly professional persona, grounded branded deck wedge, send-it bar, trust and return-visit tests, dogfood ladder, and kill list; the hackathon remains a deadline and distribution event rather than the product definition.
- Corrected the fresh post-Brief Style path after live inspection. A new Workshop now starts with website extraction selected instead of opening the full manual brand form.
- Removed the duplicate `Use it for` chooser from Style. `Client pitch`, `Board presentation`, or `Team workshop` is chosen once when the Workshop is created and appears in Style only as context.
- Applying a saved Company Style now preserves the current Workshop outcome rather than silently applying the Intent Profile stored on the reusable brand revision.
- Updated the locked first-use contract and Style checklist in `GOAL.md` to make Workshop outcome and reusable Company Style separate product concepts.

### Verified

- Inspected the real post-Brief Style surface in the Codex in-app browser. Before the change, fresh manual setup extended below the 1280×720 viewport and repeated all three outcome choices. After the change, Website, its URL field, `For Client pitch`, and `Review style` fit in one calm decision surface.
- Repeated the same inspection at 390×844. `innerWidth`, document width, and body width were all 390px; there was no horizontal overflow.
- Updated and visually inspected the intentional desktop, compact, and mobile website-Style baselines. Focused production-browser coverage passed for website-first setup and completed website review.
- `pnpm check` passed all 13 packages, including 27 web, 106 worker, 16 domain, 13 production, and seven plugin tests.
- `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed. The 18-asset submission remains valid, current, untampered, and honestly `partial` with five provider-evidence gaps.
- `pnpm demo:film:verify` passed its 162-second draft truth gate; six shots remain ready and four evidence-blocked. No paid provider request ran.

### Decisions

- NotebookLM already establishes a strong source-grounded understanding model. WorkshopLM's differentiated promise is carrying that trust into editable, branded work a professional will send—not claiming grounding itself is novel.
- Company identity is reusable; production intent belongs to the Workshop. Reusing a brand must never change what the professional is making.
- The website path is the product's promised low-friction default. Exact manual rules remain fully available as the fallback, not as the first screen.

### Open items

- The product-first roadmap does not change the two highest-leverage external gates: intended-audience `Send`/`Revise` review of the nine-slide deck and provider-backed proof after explicit spend authorization.
- Founder recording, final public Video and links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 23:44 CT — The full browser contract catches up to the product

**Area:** Production-browser regression / Responsive baselines / Current product truth

### Changed

- Reconciled accumulated browser-test drift from the recent capture-first onboarding, fitted Map, grounded Conversation voice, source-scope confirmation, Audio Overview, image-specific recovery, and six-Output reveal changes.
- Replaced coordinate-dependent completed-Map selection with the semantic outline control while retaining a direct Excalidraw selection, edit, drag, persistence, and Undo check in the reset path.
- Updated the cold-start acceptance test to follow the real sequence: choose outcome, add material, build Map, approve Brief, choose Style, then create the editable deck.
- Updated partial-output recovery to review and replace the failed image instead of regenerating unaffected work, and removed a timing assertion that required the local Video render to remain visibly queued even when it completed immediately.
- Refreshed the inspected responsive screenshot and label baselines to the current fitted Map, six Outputs, website-first Style, Audio Overview, and capture-first flow.

### Verified

- `pnpm --filter @workshoplm/web test:visual --update-snapshots` completed all 28 cases after the intentional baselines were inspected and accepted.
- A clean `pnpm --filter @workshoplm/web test:visual` rerun passed all 28 cases in 46.3 seconds without updating a single baseline.
- The suite covers desktop 1200×800, compact 1024×768, mobile 390×844, keyboard approval, focus return, source evidence, empty/loading/error/partial/needs-update states, output history, image replacement, original brainstorm reveal, local Video completion, and empty-Workshop onboarding.

### Decisions

- Visual regression tests must encode the current professional workflow, not preserve obsolete screens merely because their screenshots are stable.
- Fast local completion is valid behavior. The durable requirement is that the finished `View video` state appears, not that a transient `Creating…` frame remains observable for a minimum time.

### Open items

- This closes current deterministic browser regression drift. It does not close the provider-backed proof, intended-audience `Send`/`Revise`, founder recording, public Video, links, or `/feedback` Session ID gates.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 23:51 CT — The external proof slide earns its third metric

**Area:** Product wedge / Deck renderer / External dogfood / Send-it quality

### Changed

- Re-read the product-first roadmap against the current `GOAL.md`. The weekly professional persona, grounded branded deck wedge, send-it bar, trust and return-visit gates, reality ladder, and kill list were already locked; no hackathon-only scope replaced them.
- Inspected the nine-slide AI Collective chapter-launch candidate at full resolution. The plan and decision slides were already balanced; the actionable defect was the evidence slide, which visually promoted only two of its three strongest verified measures.
- Extended the shared HTML and editable-PowerPoint renderer from at most two headline metrics to a responsive one-, two-, or three-metric composition.
- Reframed the external proof content so `180+ chapters`, `40+ countries`, and `400+ organizers` share equal hierarchy while the global-community sentence remains supporting context.
- Inspected the complete contact sheet after the metric repair. It exposed two populated split slides still sacrificing roughly a quarter of the canvas to giant decorative page numbers.
- Rebuilt populated split slides as a quiet claim/context composition separated by one Accent rule in HTML and editable PowerPoint. Sparse editorial slides retain their deliberate oversized index treatment.

### Verified

- `pnpm --filter @workshoplm/production test` passed 14 renderer tests, including a new three-metric regression.
- `pnpm dogfood:deck:build` regenerated the nine-slide HTML, editable PowerPoint, PDF, individual previews, contact sheet, and hashes.
- Full-resolution inspection of `preview-03.png` confirmed a balanced three-column evidence layout with no overflow or duplicate measure in the supporting copy.
- Full-resolution inspection of `preview-04.png` and `preview-06.png` confirmed that the event-format and sustainability claims now use the reclaimed canvas cleanly, with no overflow or empty decorative rail.
- `unzip -t` reported no errors in the `.pptx`; `pdfinfo` reported nine 16:9 pages; `pdftotext` recovered all three figures, their labels, supporting sentence, source name, and page number.
- `pnpm check` passed all 13 packages, including 14 production, 106 worker, 27 web, 16 domain, and seven plugin tests.
- `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed. The 18-asset package remains valid, current, untampered, and honestly `partial` with five named provider limitations.
- `pnpm demo:film:verify` passed the 2:42 draft truth gate with six ready shots, four blocked shots, and no final-video claim.
- No paid provider request ran.

### Decisions

- Output quality means promoting the information a professional needs to scan, not merely preserving it somewhere on the slide.
- The renderer should support the content hierarchy chosen by the Brief. It must not force a strong third fact into paragraph copy because a template was designed around two columns.
- Page furniture must earn its space. A large index remains valid for an intentionally sparse editorial beat, but not when it compresses a populated professional slide.
- External `Send` remains a human audience judgment. Internal visual inspection can improve the candidate but cannot close that gate.

### Open items

- Put the rebuilt deck in front of its intended AI Collective audience and obtain a cold `Send` or specific `Revise`; treat any required revision as product work.
- Provider-backed Map, Realtime, Images, narration, founder recording, final public Video and links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-15 23:59 CT — Intent-profile evidence catches up to the renderer

**Area:** Product wedge / Intent Profiles / Evidence integrity / Editable exports

### Changed

- Audited every unchecked `GOAL.md` requirement after the external-deck quality pass. The remaining top-level gates require paid provider proof, intended-audience or uncoached-professional behavior, founder-only recording/session evidence, or the final public submission; none can be honestly closed by another deterministic check.
- Found one unblocked evidence-integrity risk: the shared renderer had changed, while the checked-in three-Intent comparison set still represented its prior output.
- Ran `pnpm dogfood:intents:build` to regenerate Client pitch, Board presentation, and Team workshop decks and infographics in HTML, editable PowerPoint, PDF, individual review frames, contact sheets, and the hash manifest.

### Verified

- Inspected the full-resolution nine-frame deck contact sheet. All profiles preserve their distinct cover and editorial language while sharing the current three-metric evidence composition and balanced four-week plan.
- Inspected the full-resolution three-frame infographic contact sheet. Client, Board, and Team variants remain distinct, readable, balanced, and source-labeled.
- Independently recomputed and matched all 18 output hashes recorded in the manifest.
- Independently recomputed and matched both deck and infographic contact-sheet hashes.
- `unzip -t` passed all six editable PowerPoint archives; `pdfinfo` recognized all six PDF exports.
- No provider request or paid call ran.

### Decisions

- Renderer proof is part of the product evidence, so checked-in comparisons must be regenerated whenever shared layout behavior changes.
- Deterministic evidence synchronization is useful progress, but it cannot be promoted into provider proof or a professional's `Send` decision.

### Open items

- The next product gate remains the intended-audience review of the external AI Collective deck: `Send` or one concrete `Revise`.
- Provider-backed Map, Realtime, Images, narration, founder recording, final public Video and links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 00:08 CT — Dogfood one becomes a six-file handoff

**Area:** External dogfood / Professional review / Privacy-safe distribution / Send-it gate

### Changed

- Added `pnpm dogfood:review:build`, a repeatable builder for the external AI Collective cold-review packet.
- The builder fails closed unless the current deck has nine slides, the PDF has nine pages, the PowerPoint archive is valid, and every required input exists with bytes.
- The resulting ZIP contains exactly six shareable files: `START-HERE.html`, the PDF, editable PowerPoint, contact sheet, `FEEDBACK.txt`, and a hash manifest.
- `START-HERE.html` shows the finished sequence before project explanation, asks one professional decision—`Send` or the first blocking `Revise`—and downloads feedback locally. It has no analytics, account, form endpoint, private Workshop state, or automatic transmission.
- Added the packet build and honest external-review boundary to the dogfood README.

### Verified

- Built the packet twice with the identical ZIP SHA-256 `28f96b028e4d5288db0e4f734df42d6764bc8bd4761fbb98841523bc384657f9`.
- `unzip -t` passed and the archive contained exactly the six declared files in manifest order.
- All six reviewer links returned HTTP success from a clean local server. PDF extraction recovered the final recommendation, and PowerPoint XML retained the `180+` proof.
- In the Codex in-app browser, full-page desktop inspection showed the actual nine-slide contact sheet, two document actions, and one focused feedback surface. The empty decision and unexplained `Revise` paths returned the correct validation messages; a completed revision returned the local-download success state with no console warnings or errors.
- At 390×844, body, document, and viewport widths were all exactly 390px. Fields, choices, feedback action, and privacy notice remained readable with no horizontal overflow.
- A recursive privacy scan found no absolute local path, API key marker, private ChatGPT locator, or sanitized fixture marker in the packet.
- `pnpm check` passed all 13 workspace packages, including 14 production tests, 106 worker tests, 27 web tests, 16 domain tests, and seven plugin tests.
- `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed. The submission manifest remains honestly `partial` because its five provider/final-media gaps are still open.
- `pnpm demo:film:verify` passed the 162-second draft plan with six ready shots and four evidence-blocked shots; it correctly reported that no final Video exists instead of promoting the draft.
- No external message was sent and no provider request or paid call ran.

### Decisions

- The product cannot manufacture external approval, but it can make honest uncoached review a one-file handoff instead of a coordination project.
- Feedback stays local and reviewer-controlled. The packet records no response until the reviewer deliberately returns the downloaded text file.
- A verified review instrument is readiness evidence, not `Send` evidence; the product and dogfood checkboxes remain open.

### Open items

- Share `workshoplm-ai-collective-cold-review.zip` with one intended-audience professional and ingest the returned `Send` or first blocking `Revise` as the next product decision.
- Provider-backed Map, Realtime, Images, narration, founder recording, final public Video and links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 00:16 CT — Qualitative evidence becomes decision content

**Area:** Product wedge / Deck renderer / External dogfood / Send-it quality

### Changed

- Re-audited every unchecked `GOAL.md` item. Provider-backed media and speech require explicit spend, professional-use gates require real people, and founder footage/session evidence cannot be manufactured; the highest-value zero-spend work remained the hero deck itself.
- Full-sequence inspection found the trust slide spending roughly a third of the canvas on a dark card that repeated `AI Collective · Conduct and Privacy policies` instead of communicating what a professional must do.
- Extended qualitative proof blocks with explicit items into numbered commitment cards in responsive HTML and editable PowerPoint. Numeric proof continues to use the existing metric composition, and proof without structured items retains its source-backed fallback.
- Reframed the trust slide around one synthesis sentence plus two source-backed operating standards: conduct coverage and privacy coverage. This removed duplicated body copy and made the evidence actionable at a glance.
- Rebuilt the external PDF, editable PowerPoint, contact sheet, review packet, and all three Intent-profile evidence sets from the current renderer.

### Verified

- `pnpm --filter @workshoplm/production test` passed 15 renderer tests, including the new qualitative-commitment regression.
- Full-resolution inspection of `preview-07.png` confirmed balanced hierarchy, two readable commitment cards, a quiet visible policy source, and no overflow or duplicated copy.
- Full-resolution page-seven inspection of the Board presentation and Team workshop variants confirmed the same commitments remain balanced under their distinct Intent-profile framing.
- `unzip -t` passed the editable PowerPoint; `pdfinfo` reported nine 16:9 pages; page-seven text extraction recovered the synthesis, both commitments, policy source, and page number.
- The rebuilt deterministic cold-review ZIP has SHA-256 `c80996ab36a2f51db5df135c89c1274791a5da2cbf2fc6d03b8ac3a951e8dd10` and contains the current PDF, editable PowerPoint, contact sheet, feedback page, fallback, and manifest.
- `pnpm check` passed all 13 packages, including 15 production, 106 worker, 27 web, 16 domain, and seven plugin tests.
- `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed. The 18-asset set remains honestly `partial` with its five named provider gaps.
- `pnpm demo:film:verify` passed the 162-second draft gate with six ready shots, four evidence-blocked shots, and no final-video claim.
- No external message was sent and no provider request or paid call ran.

### Decisions

- A source label is provenance, not visual evidence. When a grounded claim contains distinct operating commitments, the slide should communicate those commitments and keep provenance quiet.
- Structured qualitative evidence belongs in the shared renderer so the improvement applies across Company Styles and Intent Profiles, not only to one dogfood file.
- This improves the candidate without substituting internal judgment for the required external `Send`/`Revise` response.

### Open items

- Send the refreshed cold-review ZIP to one intended-audience professional and ingest the returned `Send` or first blocking `Revise`.
- Provider-backed Map, Realtime, Images, narration, founder recording, final public Video and links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 00:23 CT — Professional feedback is bound to the deck reviewed

**Area:** External dogfood / Evidence integrity / Review loop / Send-it gate

### Changed

- Added a content-derived Review ID to the cold-review manifest, no-JavaScript fallback, and downloaded browser response. The current ID `aic-53586afb923fa3ca` is derived from the exact reviewed PDF bytes.
- Added `pnpm dogfood:review:ingest -- <returned-feedback.txt>` to validate and preserve a returned review against the current packet and source deck.
- Ingestion rejects an untouched `Send / Revise` template, missing role, unexplained `Revise`, mismatched Review ID, tampered packet document, or a packet whose PDF/PowerPoint no longer matches the current source deck.
- A valid response records its decision, role, blocker, reason, returned-file hash, and reviewed PDF/PowerPoint hashes under `artifacts/dogfood/reviews/`. It explicitly records that reviewer identity is not independently authenticated and does not automatically close `GOAL.md`.
- Documented the return command and evidence boundary in the external dogfood README; rebuilt the six-file review ZIP.

### Verified

- Dry-run ingestion accepted a complete current-version `Send` response and returned the exact Review ID, reviewer role, reviewed document hashes, and identity boundary without writing project evidence.
- Negative round-trip checks rejected a stale Review ID, an unexplained `Revise`, and the untouched fallback template with distinct fail-closed messages.
- A current-version `Revise` dry run preserved both lines of a multiline reason and the exact first blocker instead of truncating reviewer context.
- A second packet build produced the same Review ID and deterministic ZIP SHA-256 `a3abb4752bfe364fcfd149b785c59fa86db5ee95e0ed905eedbb479d353cb35d`.
- The ZIP archive test passed; both `START-HERE.html` and `FEEDBACK.txt` contain the current Review ID.
- `pnpm check` passed all 13 packages, including 15 production, 106 worker, 27 web, 16 domain, and seven plugin tests.
- `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed. The 18-asset set remains honestly `partial` with five provider gaps.
- `pnpm demo:film:verify` passed the 162-second draft truth gate with six ready shots, four evidence-blocked shots, and no final-video claim.
- No external message was sent and no provider request or paid call ran.

### Decisions

- A `Send` response is useful only if it can be tied to the exact candidate reviewed. Review IDs are content-derived rather than manually versioned.
- Evidence ingestion must fail closed when the source deck moves after the packet was built; an internally valid old packet is still stale product evidence.
- The tool preserves the returned response but cannot authenticate the human behind it. That boundary stays explicit instead of being promoted into stronger external-validation proof.

### Open items

- Send the current ZIP to one intended-audience professional and ingest the returned response. No external review evidence exists yet.
- Provider-backed Map, Realtime, Images, narration, founder recording, final public Video and links, and `/feedback` Session ID remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 01:34 CT — Log placement correction

The new 01:33 CT live-provider and product-quality milestone was inserted after an earlier matching `Codex Session ID` marker instead of the physical end of this append-only file. It appears before three older 00:08–00:23 CT entries, but its timestamp and evidence are correct. This later note restores the chronological boundary without rewriting prior log content. The 01:33 entry supersedes the older open-item statement above for provider-backed Map, Images, and narration; Realtime, founder recording, public submission media/links, external review, and `/feedback` remain open.

---

## 2026-07-16 01:37 CT — Overnight live seam and workbench milestone verified

**Area:** Acceptance / Live media / HyperFrames / UI simplification

### Changed

- Completed the live authorized sample path with a Terra grounded Map, six GPT Image 2 panels, five Cedar narration clips, and an immutable HyperFrames Video Version 2.
- Replaced the persistent stage dashboard with a contextual five-item Create summary and one next action; collapsed surrounding context for focused Outputs while keeping Sources and Production directly recoverable.
- Made Excalidraw geometry edits non-destructive, repaired whitespace-only canvas normalization without regeneration, and arranged the live Map into a collision-free narrative grid.
- Reworked the video from dark image wallpaper into a quiet editorial image/copy split with readable hierarchy, AI-voice disclosure, and audible Cedar narration.

### Verified

- `pnpm check` passed lint, typecheck, and tests for all 13 packages: 109 worker tests, 28 web tests, and every remaining package suite passed.
- `pnpm demo:e2e` passed the complete recorded-fixture seam through rendered Video.
- `hyperframes lint` passed with zero errors and one non-blocking timeline-density warning; `hyperframes inspect --at-transitions` passed nine samples with zero issues.
- Video Version 2 is H.264 1920×1080 with AAC audio, 25.002667 seconds, 1,250,904 bytes, and SHA-256 `c2c7d29423c60cdd22a99a54fb591fb44697c79291bab2fec97f8616c8c356e2`.
- Real live-product review captures exist at desktop and 390×844 widths for Map, Outputs, and Storyboard. The targeted capture completed without horizontal overflow. The broader seeded visual-suite invocation still has a data-root setup defect and is not claimed as passing.
- `pnpm submission:build` and `pnpm submission:verify` passed integrity checks for the separate deterministic acceptance set. That set remains honestly `partial`; its five fixture limitations do not describe the provider-backed live-operator data root.

### Decisions

- Terra remains the grounded-Map default based on the completed comparable benchmark; no additional paid calls are needed for UI or renderer work.
- Map position and size are presentation state, not semantic source changes. Only content edits invalidate approved work.
- A standalone Audio Overview is not required for the finished-state Create summary because Cedar narration already supports the approved Storyboard and Video; the Audio Overview capability remains available and honestly open for live provider proof.
- `PLAN-2026-07-13.md` is treated only as enduring architecture and acceptance guidance. Its current unrelated working-tree edit was preserved and is not part of this milestone.

### Open items

- Live-verify the Realtime microphone conversation, interruption, and visible tool-result loop; record the founder brainstorm through that path.
- Replace the sample Source in the final meta-demo, record the under-three-minute public film, and complete public links.
- Obtain one external professional deck review. `/feedback` remains intentionally deferred.
- Exact OpenAI dollar debit is not exposed by the response artifacts. This session made 42 attempts and stayed within the authorized $50 operating ceiling based on the recorded request envelope.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 02:18 CT — Realtime milestone placement correction

The 02:15 CT grounded Realtime voice and simplified visual-contract milestone was inserted after an earlier matching `Codex Session ID` marker instead of the physical end of this append-only file. Its evidence and decisions are unchanged. This later note restores the chronological boundary without rewriting history. The 02:15 milestone supersedes the older open-item statement immediately above: grounded Realtime speech, read tools, interruption, and durable provider provenance are live-proven; the founder's in-app-browser microphone recording and one provider-originated confirmed write remain open.

---

## 2026-07-16 02:58 CT — Live Conversation writes, Responses grounding, and Cedar Audio Overview verified

**Area:** Live OpenAI seam / Conversation / Audio / Acceptance

### Changed

- Realtime sessions now receive the exact current Workshop, Map, Storyboard, Source-scope, and approval context. Voice instructions require one write request, then pause while the local product handles visible confirmation.
- Rejected provider writes no longer trigger an automatic continuation that can repeat the mutation request. Server VAD owns audio commits; stopping the local capture no longer sends a second manual commit.
- The grounded Responses Conversation default is four bounded provider requests instead of three. A live retrieval run proved that search, fetch, and their continuations can consume the first three requests before the final answer exists.
- Audio Overview now presents the human-facing `Cedar voice · AI-generated voice` label while retaining the exact model, request, duration, and hash metadata in provenance.
- Added isolated live proof harnesses for provider-confirmed Realtime writes, grounded Responses text, and standalone Audio Overview generation/download. Each uses a cloned data root and leaves the live operator fixture unchanged.

### Verified

- Realtime WebRTC heard `I want to approve this map. Please make the current map the brief now.`, requested `workshop_approve_brief` exactly once with Workshop `workshop-build-week` and Map `map-r7`, failed closed with `explicitUserIntent: false`, then succeeded with the same provider call ID after visible confirmation and persisted `briefApproved: false → true`. The provider continued aloud: `Done—the current map is now approved as the Brief.` Evidence: `artifacts/live-review/realtime-confirmed-write.json` and `.png`.
- A real `gpt-5.6-terra` Responses SSE run answered `what must the final WorkshopLM demo prove?` after one grounded search and one exact fetch. It persisted two successful provider tool calls, three claim-to-source evidence edges, final assistant text, and continuation ID `resp_0e7be4243393d77b006a588ca82dc481979809876c88b26147`. Evidence: `artifacts/live-review/responses-grounded-conversation.json` and `.png`.
- A real `gpt-4o-mini-tts` Cedar request created a 35.7-second, 24 kHz mono PCM WAV. Persisted and downloaded bytes both hash to `4929d08428849a07771f6264836389c1fb126ce75e80b99fa8a40d099f843a96`; request ID is `req_65133c0f98074ce6a7dfff9220fc2e50`. Local Whisper transcription recovered the intended executive finding, fragmented-workflow evidence, and exact-source-locator decision point. Evidence: `artifacts/live-review/audio-overview.json`, `.wav`, and `.png`.
- Direct visual inspection accepted all three product screenshots: quiet source rail, one dominant Conversation or Audio object, no raw IDs/model clutter, visible evidence, and one clear next action.
- `pnpm check` passed all 13 packages, including 111 worker and 30 web tests. `pnpm demo:e2e` passed the complete recorded-fixture seam. The production build plus all 28 visual tests passed at desktop, compact, mobile, reduced-motion, contrast, and logical-zoom states.
- `pnpm submission:build` and `pnpm submission:verify` passed integrity checks for the separate deterministic acceptance set. It remains honestly `partial` because the final submission fixture has not yet been rebuilt from the founder Source and provider media. `pnpm demo:film:verify` passed the 162-second draft truth gate and correctly kept four shots blocked rather than promoting the draft to a final video.
- `git diff --check` passed. `PLAN-2026-07-13.md` remains an unrelated user/teammate modification and is intentionally excluded from this milestone.

### Decisions

- Controlled synthetic microphone audio is sufficient to verify the product's full provider behavior; the founder's physical-microphone turn remains required only as authentic demo footage and Source replacement.
- A confirmation boundary must suppress provider continuation until the professional acts. Returning an error and immediately asking the model to continue invites duplicate write requests even when the model instructions are correct.
- Four is the smallest bounded Responses ceiling that completed the live grounded answer. It remains the hard product default rather than opening an unbounded agent loop.
- Model names stay in provenance; the primary player uses human language. Cedar remains the locked voice.

### Open items

- Grant microphone access in the Codex in-app browser, record the founder brainstorm, and replace the authorized sample Source in the final meta-demo.
- Rebuild the final traced submission Output set from that Source, capture the remaining provider-media shots, and cut the public under-three-minute video.
- Obtain one intended-audience `Send` or blocking `Revise` response on the external deck. `/feedback` remains intentionally deferred.
- The evidence ledger now totals 87 provider HTTP operations. Exact dollar debit is not exposed by the response artifacts; the recorded mix remains safely below the authorized $50 ceiling, but no unsupported exact spend is claimed.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 03:06 CT — Film milestone placement correction

The 03:05 CT provider-backed film-input and two-blocker rough-cut milestone was inserted after an earlier matching `Codex Session ID` marker instead of the physical end of this append-only file. Its evidence and decisions are unchanged. This note restores the chronological boundary without rewriting history. The 03:05 milestone supersedes the earlier film-readiness count: the current verifier has eight ready shots, two blocked shots, and five missing or unsatisfied final-evidence items.

The final acceptance sequence also proved that `pnpm demo:e2e` intentionally resets `.workshoplm/acceptance` and removes any prior submission manifest. A standalone `pnpm submission:verify` immediately after that reset failed with the expected missing-manifest error; `pnpm submission:build && pnpm submission:verify` then passed, followed by the semantic film verifier. The required order is reset/acceptance → submission build → submission verify, not verification against pre-reset state.

---

## 2026-07-16 03:13 CT — Cedar editorial master tightened to 2:20

**Area:** Demo narration / Editorial pacing / Live-provider evidence

### Changed

- Added a bounded, explicit-opt-in ten-request film narration generator. It binds every Cedar WAV to the current ten-shot plan with request ID, byte count, duration, slot duration, and SHA-256.
- Taught the rough-cut builder to verify and consume provider narration without changing the honest `editorial-rough-cut` state. It refuses a missing, changed, overlong, or plan-mismatched clip.
- Recut the same ten-beat story from 162 seconds to 140 seconds after the first natural-Cedar assembly exposed long dead holds. Provider narration is no longer slowed to fill a shot; only clips longer than their available slot are modestly compressed, and shorter clips keep their natural cadence.

### Verified

- Ten `gpt-4o-mini-tts` Cedar requests completed with ten distinct request IDs and playable WAVs. Individual durations range from 10.65 to 16.6 seconds; every clip fits its revised 12–18 second slot without excessive compression.
- The 140.021333-second editorial MP4 has H.264 video, AAC 48 kHz audio, and SHA-256 `8e1cfe904a93659893b05c5b38ee7d64e205d0486710604fc0ab06f6854f1396`.
- A full local Whisper round trip recovered every intended sentence, including WorkshopLM, Realtime, GPT 5.6, GPT Image 2, HyperFrames, the two approvals, source trace, and Codex's implementation role. Minor recognizer spellings such as `texturpt` do not change the audible script or stored source text.
- `silencedetect` found no gap longer than 1.81 seconds. The former 4–6 second dead holds are gone; the written pace is 129.4 words per minute over the final 2:20 plan.
- `pnpm demo:film:verify` still reports eight ready shots and two honestly blocked shots. Cedar narration improves the review artifact without weakening the founder/meta finality gates.

### Decisions

- A shorter 2:20 film is stronger than a 2:42 film padded around a naturally brisk professional voice. The judge story and all ten required beats are unchanged.
- Do not regenerate these ten clips merely because the founder Source changes; the editorial narration describes the product workflow and remains valid unless the final script changes materially.
- The complete provider evidence ledger is now 97 HTTP operations. Exact dollar debit remains unavailable; no exact spend is invented, and the run remains safely inside the authorized $50 ceiling.

### Open items

- Founder physical-microphone capture and transcript, final Source-derived Output set, eligible Session ID record, final edited export, external deck review, and public link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 03:28 CT — Founder-handoff milestone placement correction

The 03:27 CT founder-capture and final-operator milestone was inserted after an earlier matching `Codex Session ID` marker instead of the physical end of this append-only file. Its implementation, tests, and evidence remain correct. This later note restores the chronological boundary without rewriting history. The current state is unchanged: the one-command founder handoff is verified and ready, while the real founder files, final Source-derived Output set, final MP4, eligible Session record, external review, and public links remain open.

---

## 2026-07-16 03:32 CT — Final operator now completes Audio Overview and submission packaging

**Area:** Final provider run / Submission Output set / Film finality

### Changed

- The final preflight now creates a grounded Audio Overview script alongside the presentation, infographic, image set, and Storyboard.
- The paid ceiling is thirteen requests: Terra Map `1`, GPT Image 2 `6`, Cedar Storyboard narration `5`, and Cedar Audio Overview `1`. Retry budgeting adds the Audio Overview request only when its current version is not already `audio_ready`.
- After the approved HyperFrames Video succeeds, the operator builds and verifies the traced submission Output set in the same final data root and records manifest path, status, limitations, asset count, and integrity result in its run evidence.
- The film meta-reveal now requires `.workshoplm/final-operator/generated/submission-output-set-v1/manifest.json`. The deterministic acceptance package can no longer accidentally satisfy finality.

### Verified

- A no-spend command-level founder preflight reported exactly thirteen planned requests, one planned Audio Overview request, a thirteen-request next command, and one current grounded Audio Overview script in SQLite.
- Retry unit coverage proves an incomplete Audio Overview adds exactly one request to a partial image/narration recovery. The pre-contract fallback now reports the complete thirteen-request clean run.
- `pnpm check` passed all 13 packages with 114 worker and 30 web tests. `pnpm demo:e2e`, `pnpm submission:build`, and `pnpm submission:verify` passed. `pnpm demo:film:verify` passed in draft mode and now reports the absent final-operator manifest instead of the acceptance fixture's known partial manifest.
- `git diff --check` passed excluding the preserved unrelated `PLAN-2026-07-13.md` modification.

### Decisions

- Audio Overview belongs in the final operator because the submission package already treats provider-backed speech as a readiness criterion. Leaving it as a separate manual request would make the one-command handoff incomplete.
- The final package may still be `partial` when the founder transcript is imported from a file. That is correct: authentic founder footage and provider-verified WebRTC evidence are separate claims.
- Package construction is part of the operator success condition. A rendered Video without a verified traced Output set is not a passed final run.

### Open items

- Record the real founder files. Prefer capturing a provider-verified microphone turn in `.workshoplm/final-operator`; otherwise accept the honest one-limitation package from the file import and keep the Realtime proof as separate product evidence.
- Run the thirteen-request final generation only after inspecting the real no-spend preflight, then replace the two blocked film shots and export the final MP4.
- Eligible Session ID, external professional review, public links, and final Devpost actions remain human-gated.
- No provider request ran in this milestone; the ledger remains 97 HTTP operations and no exact-dollar total is invented.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 03:53 CT — Final-film milestone placement correction

The 03:51 CT deterministic final-film milestone was inserted after an earlier matching `Codex Session ID` marker instead of the physical end of this append-only file. Its implementation and verification evidence remain correct. This later note restores the chronological boundary without rewriting history. The current state is unchanged: the clean final compositor is verified to fail closed, while founder files, the ready final-operator package, and the actual final MP4 remain open.

---

## 2026-07-16 03:55 CT — Real Outputs gallery reconciled and reveal composition refined

**Area:** Visual gallery / Final-film polish

### Changed and verified

- Closed the stale gallery checklist item: the authorized GPT Image 2 bytes now appear in the six-up Image set, Storyboard, complete Outputs gallery, and provider-narrated Video alongside the real Presentation and Infographic previews. `outputs/workshoplm-current-ui/20-real-output-gallery.png` and the live-review contact sheets are the captured proof.
- Removed the generic bottom caption from only the final meta-reveal shot so it cannot cover the evidence mosaic or compete with the reveal itself.
- Changed the three submission thumbnails from crop-to-fill to contained compositions on black stages. The complete titles and visual hierarchy remain visible instead of being clipped to fit unequal slots.
- Re-rendered and visually inspected the ten-shot final-style contact sheet and 1280×720 meta-reveal preview. The preview retains its explicit sample-only label; final mode still requires the real founder transcript and verified package.
- `node --check scripts/build-demo-rough-cut.mjs` and `git diff --check` passed. No provider request ran; the ledger remains 97 HTTP operations.

### Open items

- Founder capture, final Source-derived provider run, ready final package, and final MP4 remain the next critical path. External review and public submission actions remain human-gated.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 04:16 CT — Live Outputs reduced to current work with focused history

**Area:** Product UI / Source language / Version history

### Changed

- The Outputs gallery now shows only the newest Presentation, Infographic, Audio Overview, and Video. Older immutable versions remain reachable through a focused `Version history` instead of repeating full-size cards in the primary gallery.
- Focused Presentation, Infographic, Audio Overview, and Video views expose history only when more than one version exists, with current and `Needs update` states preserved.
- Visible generated-output citations now translate the capture-only provider origin into `Voice brainstorm`; founder-file origins become `Founder brainstorm`. Exact provider text and chunk locators remain in artifact metadata and source-trace behavior.
- Source trails reuse the professional Source title plus the chunk locator, and singular Source counts now read correctly.

### Verified

- The Codex in-app browser exposed the real defect on `.workshoplm/live-operator`: two full-size Presentation cards, two Video cards, and a timestamp-heavy fallback citation that deterministic fixture review had not made obvious.
- A disposable copy of that real provider-backed root proved the repair at desktop and 390×844. Captures are `artifacts/ui-review/outputs-latest-only-desktop-2026-07-16.png`, `outputs-latest-only-compact-2026-07-16.png`, and `presentation-version-history-compact-2026-07-16.png`.
- `pnpm --filter @workshoplm/worker test` passed 114 tests, `pnpm --filter @workshoplm/web typecheck` passed, and `pnpm check` passed all 13 packages with 114 worker and 30 web tests.
- The strict production-browser suite passed all 28 tests after intentional baseline refresh, then passed again without updates. Desktop, compact, mobile, accessibility, official primitive, source-trace, version-history, and final-reveal checks stayed green.
- `pnpm demo:e2e` passed the complete recorded seam. The submission Output-set builder and verifier remained valid, not stale, and untampered. `pnpm demo:film:verify` correctly remained draft and failed final readiness on only the real founder files, final-operator package, and final MP4.

### Decisions

- A gallery is for current deliverables; version comparison belongs to the object being reviewed. This preserves every implemented versioning capability while materially reducing first-glance complexity.
- Friendly labels replace provider mechanics only in visible copy. Grounding integrity still depends on the unchanged exact locator and hidden trace metadata.
- No provider request was needed. The evidence ledger remains 97 HTTP operations; exact dollar debit is still unavailable and no exact spend is invented.

### Open items

- Founder capture, the final thirteen-request Source-derived operator run, verified final package, final MP4, external send/revise review, eligible Session ID, and public submission links remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 04:31 CT — Image replacement becomes a directed professional revision

**Area:** Output editability / GPT Image 2 / Storyboard control

### Changed

- Replaced the blind one-click image retry with a focused `Replace image` sheet built from the locked official Apps in ChatGPT primitives.
- The professional sees the current grounded image and describes one change in at most 400 characters. WorkshopLM retains the original base prompt, approved idea, Style, Visual DNA, evidence edge, and reference image while appending only the current revision request.
- A second revision replaces the prior request rather than stacking contradictory instructions. The current image stays visible while the selected panel is pending, and the requested change is visible in the Image set.
- Existing dependency behavior remains intact: only the selected image version advances, the bound Storyboard panel becomes stale, Storyboard approval is revoked, and Video remains blocked until the replacement is generated and reviewed.

### Verified

- The real provider-backed `.workshoplm/live-operator` Image set was copied to an isolated data root and inspected in the Codex in-app browser. The desktop sheet was calm, focused, and preserved the authorized GPT Image 2 preview before and after submission.
- Production-browser snapshots at 1200×800 and 390×844 prove the focused sheet fits without horizontal overflow: `desktop-image-replacement.png` and `mobile-image-replacement.png`.
- Adapter coverage proves the exact revision text reaches only the selected `/v1/images/edits` request and records Version 2 without weakening the six-panel coherence contract.
- Worker tests passed 115/115, including bounded revision, non-stacking prompt, selected-request transport, preserved image, and Storyboard invalidation coverage.
- The strict production-browser suite passed all 28 cases after the two intentional new snapshots, then passed again without updates. `pnpm check` passed all 13 packages, and `pnpm demo:e2e` passed the complete recorded seam.

### Decisions

- Professionals need to direct the last 10 percent, but they should not have to edit model prompts. The product accepts the desired visual change and preserves the grounded production contract automatically.
- A pending replacement must not erase the current work. The prior image remains reviewable until valid replacement bytes are recorded.
- No provider request ran in this milestone. The evidence ledger remains 97 HTTP operations; exact dollar debit is unavailable and no exact spend is invented.

### Open items

- The final founder Source should exercise this directed replacement only if one generated panel fails the send-it bar; do not spend a request merely to demonstrate the control.
- Founder capture, final operator package, final MP4, intended-audience review, eligible Session ID, and public submission links remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 04:41 CT — Voice-language milestone passes final acceptance

- The production-browser suite passed 29/29 without snapshot updates, including the new raw-provider Source disclosure boundary and the restored exact evidence locator.
- `pnpm check` passed all 13 packages with 115 worker tests and 30 web tests. `pnpm demo:e2e` passed the full recorded Capture → Shape → Deliver seam, and `git diff --check` passed excluding the preserved unrelated `PLAN-2026-07-13.md` modification.
- No provider request ran; the evidence ledger remains 97 HTTP operations.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 04:38 CT — Voice provenance gets a professional-language boundary

**Area:** Sources / Map language / Grounding integrity

### Changed

- Capture-only provider Sources now appear as `Voice brainstorm` with origin `Voice`; founder-file Sources appear as `Founder brainstorm` with origin `Recording`.
- The seeded Map card `Voice capture fallback` became `Voice stays available`, with plain copy about preserving spoken thinking when the host cannot retain the turn.
- Source navigation uses the friendly title and locator. The focused Source evidence sheet deliberately retains the exact underlying locator while showing the friendly Source title and origin.

### Verified

- A new 390×844 production-browser case injects the real raw shape `gpt-realtime-2.1 capture-only fallback` and proves the Sources sheet contains `Voice brainstorm`, `Voice`, and a friendly chunk locator without exposing the model or fallback phrase.
- The first run caught an overreach: simplifying the evidence sheet locator broke the existing exact-locator assertion. The implementation now restores that exact value only in the evidence view, preserving the product's trust contract.
- Worker tests passed 115/115 and web typecheck passed. The updated 29-case production-browser suite passed with the intentional Map/layer snapshots refreshed; `mobile-map.png` was visually inspected and accepted at 390×844.

### Decisions

- Provider transport is implementation detail in navigation, not in evidence. The product can be calm without making provenance vague.
- Exact locators remain authoritative in `Show source`; friendly locator labels are only an orientation aid elsewhere.
- No provider request ran. The evidence ledger remains 97 HTTP operations.

### Open items

- Re-run the strict visual suite without snapshot updates, then run the full repository and recorded seam before shipping this milestone.
- Founder capture, final operator package, final MP4, intended-audience review, eligible Session ID, and public submission links remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 04:42 CT — Voice-language verification placement correction

The 04:41 CT verification entry was inserted before the 04:38 implementation entry because an earlier matching end marker was selected. No history was rewritten. This physical-end correction records the current state: the strict production-browser suite passed 29/29 without updates, `pnpm check` passed all 13 packages with 115 worker and 30 web tests, `pnpm demo:e2e` passed, and `git diff --check` passed outside the preserved stale plan. The milestone is ready to ship; founder capture and the final submission artifacts remain open.

---

## 2026-07-16 05:00 CT — Judge footage is reconciled to the current workbench

**Area:** Demo capture / editorial rough cut / acceptance automation

### Changed

- Repaired the deterministic recording harness after the capture-first onboarding and simplified workbench made its old selectors and assertions stale. The recorder now chooses the professional outcome, enters the Map from an existing voice Source, uses the desktop Sources rail, opens the exact Source before returning to the selected Map claim, applies the current manual Style path, opens the hero Presentation unambiguously, follows the current Storyboard action, recognizes queued Video state, and verifies the six-Output reveal.
- Recorded a fresh 41.36-second, 12-beat fixture walkthrough through Map, Sources, exact evidence, semantic edit, Brief approval, Style, Outputs, focused evidence, Storyboard edit, Storyboard approval, local render, and original-brainstorm reveal.
- Rebuilt the 2:20 editorial rough cut from the current footage. The Storyboard frame no longer exposes provider transport language inside creative narration; exact provider provenance remains visible only in the focused Source evidence view.
- Fixed the rough-cut builder so an existing verified `outputs/demo-film-narration/manifest.json` is the default narration source. A routine rebuild can no longer silently downgrade the already verified OpenAI Cedar film to macOS guide speech.

### Verified

- `pnpm --filter @workshoplm/web capture:demo` completed with 12 beats, SHA-256 `46f3e8c1b76779947229aa1d5fd36b22aa473a1b9dc31855edef290d39e3a7b9`, `briefApproved: true`, `storyboardApproved: true`, and `videoState: rendered`.
- `pnpm demo:film:rough` produced a 140.021-second 1280×720 H.264/AAC rough cut with SHA-256 `517e7f3764cd08fc6913c09cb15e69761663e24894386cea4260a6ef49cfcf99`. Its manifest records OpenAI `gpt-4o-mini-tts`, Cedar, ten hash-bound requests, and `finalProviderNarration: true`.
- The refreshed recording contact sheet and editorial contact sheet were visually inspected. Focused review of shots 03, 08, and 10 accepted the friendly Sources rail, exact evidence boundary, current Storyboard workbench, and six-Output reveal.
- `pnpm demo:film:verify` remains honestly in draft mode with eight ready shots and two blocked shots. Only the founder recording/transcript, ready final-operator submission manifest, and final MP4 are missing.
- `node --check scripts/build-demo-rough-cut.mjs`, `pnpm check`, `pnpm demo:e2e`, and `git diff --check` outside the explicitly preserved stale-plan modification all passed. The repository suite remains green across 13 packages with 115 worker and 30 web tests.

### Decisions

- The judge artifact must be rebuilt whenever the visible workbench changes materially; green product tests do not prove the film still demonstrates the current product.
- Generated, hash-verified provider narration is a durable local build input. Reusing it is the honest no-spend default; a local guide voice is only a fallback when that manifest does not exist.
- Exact provider locators belong in `Show source`, not in Storyboard narration or primary navigation.
- No provider request ran in this milestone. The evidence ledger remains 97 HTTP operations; exact dollar debit is unavailable and no exact spend is invented.

### Open items

- Founder capture, final thirteen-request Source-derived operator run, verified final package, final MP4, external send/revise review, eligible Session ID, and public submission links remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 05:11 CT — Submission packet catches up to the live product

**Area:** Devpost copy / claim ledger / demo script / evidence gates

### Changed

- Reconciled the Devpost draft, public demo script, claim ledger, completion evidence audit, and submission checklist against the current provider evidence and refreshed 2:20 rough cut.
- Promoted only directly proven runtime claims: the Terra grounded Map, six GPT Image 2 panels, five Cedar product-Video clips, ten Cedar editorial-film clips, grounded Realtime read/interruption/confirmed-write behavior, and the current Codex doorway.
- Kept the evidence boundary explicit: the paid run uses the authorized sample Source, not the missing founder recording; the deterministic no-credential fixture remains a separate fallback path; ChatGPT Work remains unclaimed.
- Removed the tracked `submission/DEVPOST-DRAFT 2.md` because it was a competing pre-spend source of truth that still said no provider run existed.
- Retimed the demo script to the actual contiguous 0:00–2:20 film plan. The only film-content gates now named as `No` are founder capture and the founder-derived verified final Output set.
- Added `pnpm submission:packet:verify`. It binds public copy to the Terra/Image 2/Cedar provider manifest, ten-clip editorial narration manifest, 2:20 H.264/AAC rough-cut manifest, eight-ready/two-blocked film plan, four remaining founder/final-package brackets, and the absence of known stale phrases or duplicate drafts.

### Verified

- The first full command chain correctly failed because `pnpm demo:e2e` resets the acceptance root and `submission:verify` was called before rebuilding its manifest. No verifier was weakened. The final publication instructions now require `submission:build` before `submission:verify`.
- `pnpm submission:build` recreated the honest 18-asset `partial` fixture set; `pnpm submission:verify` then passed with `valid: true`, `stale: false`, and `tampered: false`.
- `pnpm submission:packet:verify` passed with `gpt-5.6-terra`, six GPT Image 2 panels, five product narration clips, Cedar editorial voice, 140.021 seconds, eight ready shots, two blocked shots, and four unresolved founder/final-package slots.
- `pnpm demo:film:verify` remained correctly in draft mode with only the founder recording/transcript, ready final-operator manifest, and final MP4 absent.
- `pnpm check` passed all 13 packages with 115 worker and 30 web tests. `pnpm demo:e2e` passed the complete deterministic seam. `node --check scripts/verify-submission-packet.mjs` passed.

### Decisions

- The public packet must follow evidence, not preserve contingency prose after evidence exists. Verified provider behavior is now stated directly; only unresolved founder/final-publication claims retain brackets.
- There is one Devpost source of truth. A duplicate stale draft is more dangerous than retaining historical prose in Git history.
- Submission verification is a build→verify sequence after fixture reset. A missing manifest is not tampering and not success; it is an invalid command order that must fail visibly.
- No provider request ran in this milestone. The evidence ledger remains 97 HTTP operations; exact dollar debit is unavailable and no exact spend is invented.

### Open items

- Founder capture, final thirteen-request Source-derived operator run, verified final package, final MP4, external send/revise review, eligible Session ID, and public submission links remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 05:21 CT — Current UI evidence replaces the discarded MVP archive

**Area:** Judge evidence / UI gallery / film preview integrity

### Changed

- Replaced the twenty numbered July 14 tabbed-MVP screenshots in `outputs/workshoplm-current-ui/` with a curated sixteen-screen journey through the current Capture → Shape → Deliver workbench.
- Added `pnpm ui:gallery:build`, which copies only named current visual baselines, probes their dimensions, binds each source and byte payload by SHA-256, renders a 1920×1280 contact sheet, and creates a flat shareable ZIP.
- Kept the evidence boundary explicit: screen 08 is the inspected provider-backed Outputs gallery; the other screens are sanitized fixture evidence, and the pre-generation Image plan is labeled as such.
- Repaired the final-film overlay preview and still fallback so they no longer reference deleted screenshots from the discarded interface.
- Extended `pnpm submission:packet:verify` to require the canonical sixteen-screen manifest, verify every screenshot hash, require the provider-backed Outputs source, and reject retired filenames. The ignored shareable ZIP remains reproducible from the tracked builder rather than becoming a clean-checkout requirement.
- Reconciled the NotebookLM flow audit and stale 37.76-second GOAL reference to the current sixteen-screen gallery and 41.36-second recording.

### Verified

- `pnpm ui:gallery:build` produced sixteen screenshots, `contact-sheet.png`, `manifest.json`, and `outputs/workshoplm-current-ui.zip` with SHA-256 `a464209ca7ce866c9503fe9a4f5813e4055e2624c201ea3dceddf975609f506a`. The ZIP contains exactly nineteen flat entries: README, manifest, contact sheet, and sixteen screens.
- The full contact sheet was visually inspected. The current interface is consistent across onboarding, Map, Conversation, Source evidence, Brief, Style, provider-backed Outputs, Presentation, Image plan/replacement, Storyboard, Video, original reveal, and two mobile states.
- `pnpm demo:film:preview-final` rebuilt the ten-frame editorial overlay and meta-reveal previews exclusively from current filenames. Both previews were visually inspected and accepted.
- `pnpm submission:packet:verify` passed with Terra, six provider images, five product narration clips, the 2:20 Cedar film, eight ready/two blocked shots, sixteen current UI screens, and four unresolved founder/final-package slots.
- `pnpm check` passed all thirteen packages with 115 worker and 30 web tests. `pnpm demo:e2e` passed the complete recorded-fixture seam. Node syntax checks and `git diff --check` outside the preserved stale-plan modification passed.

### Decisions

- A canonical screenshot directory is evidence, not an archive. Superseded UI belongs in Git history, not beside the current judge path.
- Provider-backed pixels and deterministic fixture pixels may coexist only when the boundary is visible and machine-verifiable.
- Film previews must consume the same canonical UI evidence that the shareable gallery exposes; deleted legacy filenames should fail rather than silently survive.
- No provider request ran in this milestone. The evidence ledger remains 97 HTTP operations; exact dollar debit is unavailable and no exact spend is invented.

### Open items

- Founder capture, final thirteen-request Source-derived operator run, verified final package, final MP4, external send/revise review, eligible Session ID, and public submission links remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 05:43 CT — Provider visual enters the editable Presentation

**Area:** Presentation quality / generated-media provenance / PowerPoint portability

### Changed

- Made an approved generated image a first-class Presentation dependency instead of leaving GPT Image 2 output beside an otherwise deterministic deck. The current HTML preview and editable PowerPoint now embed `image-panel-1` Version 1 from `image-batch-v1` and record its exact SHA-256.
- Added dependency-aware invalidation in both directions: completing a live image batch rebuilds an image-less current Presentation, and requesting a replacement marks every dependent Presentation `Needs update` while preserving immutable history.
- Extended the live operator to perform that local rebuild after all six image panels land and before Storyboard approval. This uses the already generated bytes and adds no provider request.
- Repaired PowerPoint portability after the first round trip exposed the configured `SF Pro system stack` as a serif fallback. Generic and system font aliases now map to Arial in editable Office output while the HTML preview retains the configured Style stack.
- Rebuilt the canonical sixteen-screen UI gallery so its provider-backed Outputs screen shows Presentation Version 4 with the real generated cover visual.

### Verified

- `pnpm --filter @workshoplm/production test` passed 17 tests; `pnpm --filter @workshoplm/production typecheck` passed.
- `pnpm --filter @workshoplm/worker test` passed 116 tests; `pnpm --filter @workshoplm/worker typecheck` passed. Coverage includes exact image provenance and image-revision staleness.
- LibreOffice rendered the editable Presentation to a five-page 16:9 PDF. The PowerPoint archive is valid, `slide1.xml` uses portable Arial, and the `.pptx`, PDF, extracted text, five slide images, and contact sheet are preserved under `artifacts/live-review/presentation-v4/`.
- The accepted editable PowerPoint SHA-256 is `51889a25a776454611728a369ca9ee83feda2ffbc77e546882bf500c703babda`; the review contact sheet SHA-256 is `d99534f0eae6290421476a0814cc0b539fd46fda1fee64ef0e2cb98bf9aa2caa`.
- The local product served `/api/workshop/artifacts/deck-v4` with heading `WorkshopLM Build Week`; the refreshed Outputs gallery visibly showed the generated hero, Presentation Version 4, `Up to date`, and two Sources. The rebuilt sixteen-screen contact sheet passed visual inspection.
- `pnpm check` passed all thirteen packages with 116 worker, 30 web, and 17 production tests. `pnpm demo:e2e` passed the complete recorded-fixture seam.
- `pnpm demo:film:preview-final` rebuilt the ten-frame final-style preview with the new provider-backed Presentation and passed visual inspection. `pnpm submission:packet:verify` passed with sixteen current screens, Terra, six provider images, five product narration clips, eight ready shots, two blocked shots, and four honest founder/final-package gaps. `pnpm demo:film:verify` remained correctly in draft mode.
- `git diff --check` passed outside the preserved user-owned `PLAN-2026-07-13.md` modification.

### Decisions

- Generated visuals must participate in dependency and staleness semantics before they may appear inside a professional deliverable. Copying bytes without the panel version and hash would weaken the product's trust promise.
- Presentation generation remains available before images finish, but the live operator automatically replaces that image-less draft once the coherent batch is complete. Professionals retain a fast first draft without accepting disconnected final work.
- Office portability outranks preserving a macOS-only font alias in an editable export. The browser preview may use the approved system stack; PowerPoint uses the closest dependable portable family.
- No provider request ran in this milestone. The evidence ledger remains 97 HTTP operations; exact dollar debit is unavailable and no exact spend is invented.

### Open items

- The intended-audience `Send` or first blocking `Revise` response remains the presentation gate. Founder capture, the founder-derived final operator run, verified final package, final MP4, eligible Session ID, and public submission links also remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 06:09 CT — Provider-narrated Video gains real editorial motion

**Area:** HyperFrames rendering / professional Video quality / judge-visible evidence

### Changed

- Replaced the provider-narrated Video's static composition with a repository-local GSAP timeline rendered by HyperFrames. Every approved scene now has a restrained copy entrance, short scene fade, and subtle image scale/horizontal settle while retaining the exact approved Storyboard, Style, image, claim, Source, and Cedar narration inputs.
- Added hard opacity kills at every clip boundary and animate only an inner scene wrapper rather than the HyperFrames clip element. This preserves correct state during nonlinear seeking and keeps HyperFrames in control of clip layout.
- Copied the pinned GSAP runtime into each local staging directory instead of loading a CDN. The rendered demo remains deterministic and offline-capable beyond the already completed provider generation.
- Increased the scene-number treatment to a high-contrast dark pill after the first inspection exposed a weak contrast edge.
- Rendered immutable Video Version 4, refreshed the current provider-backed Outputs screenshot and canonical sixteen-screen gallery, and rebuilt the provider film inputs, final-style overlay preview, and 2:20 rough cut around the current Video.

### Verified

- The first HyperFrames lint run failed correctly on missing exit kills, direct clip animation, and initially visible fullscreen overlays. The implementation was repaired rather than bypassing the checks.
- The final HyperFrames check reports `ok: true`, zero lint errors, zero layout errors, and 25/25 contrast passes. Its only intentional media-fit warnings record that the five Cedar clips are shorter than their approved five-second scenes; no narration is clipped.
- Video Version 4 is a 25.002667-second 1920×1080 H.264/AAC MP4 with SHA-256 `bc3723f7cdc39fe0f08824b33d8a59956ccb018eb1c44290518ef19e8a120212`. Its provenance sidecar SHA-256 is `e5b06d3bda2157cf6bb8a7ec97f4e7fcbc6aa23f7c0b89dd05e06cb3d7e73da3`.
- Twelve sampled frames across all five scenes passed internal visual inspection. The review contact sheet SHA-256 is `5f16216082e12197071dbbfdb1df34230c83e04e9c7e2119a5ccda87e0a702e6`; evidence is preserved under `artifacts/live-review/hyperframes-v4/`.
- The live local Outputs surface showed `Video · Version 4` and `Up to date`. The refreshed 2:20 rough cut has SHA-256 `6fb6b24c101e70b495f7d149e1c4a4f408131b68272a842e0e477c66dd2b73a8` and passed contact-sheet inspection with the animated Image-set frame present.
- `pnpm check` passed all thirteen packages with 116 worker, 30 web, and 17 production tests. `pnpm demo:e2e` passed the complete recorded-fixture seam.
- `pnpm submission:packet:verify` passed with Terra, six provider images, five product Cedar clips, ten editorial Cedar clips, the 2:20 film, eight ready/two blocked shots, sixteen current UI screens, and four honest founder/final-package gaps. `pnpm demo:film:verify` remained correctly in draft mode.

### Decisions

- Motion is part of the professional quality bar, not decorative scope. A technically valid but static Video did not support the product's finished-work promise.
- The Video uses calm editorial motion rather than spectacle: one readable entrance system, restrained image movement, and no competing transitions. The approved Storyboard remains the contract.
- Local HyperFrames plus a pinned local timeline runtime remains the implementation boundary. No API, remote renderer, CDN, authentication, or additional video stack was introduced.
- No provider request ran in this milestone. The evidence ledger remains 97 HTTP operations; exact dollar debit is unavailable and no exact spend is invented.

### Open items

- Internal visual review passed, but the leadership or professional social-post `Send`/`Revise` review remains open and the GOAL checkbox remains unchecked.
- Founder capture, the founder-derived final operator run, verified final package, final MP4, eligible Session ID, and public submission links remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 06:31 CT — Default workbench metadata becomes object-first

**Area:** UI simplification / Outputs hierarchy / responsive judge evidence

### Changed

- Removed repeated artifact type and Version labels from the default Outputs gallery. Presentation, Infographic, Audio Overview, and Video cards now foreground only source scope, useful quantity, and freshness; revision mechanics remain in the focused object and Version history.
- Removed revision numbers from the default Brief and Create rail. Brief now names its active Source count, and Video names its scene count. Style revision remains visible inside the editing sheet where choosing or creating a new revision has consequence.
- Replaced `Company and intent`, `Map sign-off`, `Output set`, and `Bound image` with `Brand and format`, `Approve the Map`, `Outputs`, and `Image` in the relevant professional surfaces.
- Corrected the Create rail's ready total to count every current shareable deliverable rather than only Presentation, Infographic, and Image set. A Storyboard counts only after approval; failed or stale Audio and Video never count as ready.
- Rebuilt every production-browser baseline, the canonical sixteen-screen gallery, provider-backed Outputs screen, provider gallery film input, final-style overlay preview, and 2:20 rough cut.

### Verified

- The strict production-browser suite passed all 29 tests after two intentionally caught contract failures: the Brief revision assertion was moved into the Style sheet, and the gallery history test now proves Version is absent from cards but present in the focused object and Version history.
- Visual inspection accepted the regenerated desktop, compact, mobile, stale-state, Video, provider-backed Outputs, sixteen-screen contact sheet, rough-cut contact sheet, and final-style overlay evidence. The live provider-backed screen shows five current deliverables, three Sources on the approved Brief, and five Video scenes without default revision clutter.
- `pnpm check` passed all thirteen packages with 116 worker, 30 web, and 17 production tests. `pnpm demo:e2e` passed the complete recorded-fixture seam.
- `pnpm submission:packet:verify` passed with Terra, six provider images, five product Cedar clips, ten editorial Cedar clips, the 2:20 film, eight ready/two blocked shots, sixteen current UI screens, and four honest founder/final-package gaps. `pnpm demo:film:verify` remained correctly in draft mode.

### Decisions

- Versioning is a trust feature, not the product's primary information architecture. It stays visible when reviewing history or a focused artifact and stays out of the default gallery when the professional is choosing what to open.
- A ready count must describe work that can actually advance or ship. Planned Storyboards, failed audio, and stale media do not qualify merely because records exist.
- Familiar object language outranks internal workflow vocabulary. Exact IDs, provider models, revisions, and locators remain available only in the evidence or provenance layer that needs them.
- No provider request ran in this milestone. The evidence ledger remains 97 HTTP operations; exact dollar debit is unavailable and no exact spend is invented.

### Open items

- The language gate remains continuous through founder-Source and final-film review; this milestone does not claim uncoached-user or external `Send` evidence.
- Founder capture, the founder-derived final operator run, verified final package, final MP4, external professional review, eligible Session ID, and public submission links remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 06:36 CT — Video exposes its real revision loop

**Area:** Last-10-percent control / Storyboard approval / responsive Video UX

### Changed

- Added `Edit storyboard` as a contextual secondary action in the focused Video view. It sits beside `Show source`, `Show original`, and `Open video`, so the professional can revise the production contract without discovering a hidden backtracking path.
- Kept the action navigational only. Opening Storyboard does not mutate the approved artifact; an actual saved panel edit continues to revoke approval, mark downstream Video stale, and require the existing approve-and-render sequence.
- Rebuilt the desktop, compact, and mobile Video viewer baselines, original-reveal states, canonical sixteen-screen gallery, and final-style film preview.

### Verified

- The production-browser regression clicks `Edit storyboard` at all three widths, reaches the editable panel title and narration fields, confirms no `Approve storyboard` action appears before a change, and returns through the existing `View video` action.
- The complete production-browser suite passed all 29 tests. The refreshed mobile screenshot proves the four contextual Video actions wrap into two quiet rows without horizontal overflow.
- `pnpm --filter @workshoplm/web test` passed 30 tests, and web typecheck passed. The rebuilt sixteen-screen gallery and manifest passed `pnpm submission:packet:verify` with the same honest eight-ready/two-blocked film state.
- `pnpm check` passed all thirteen packages with 116 worker, 30 web, and 17 production tests. `pnpm demo:e2e` passed the complete recorded-fixture seam after the navigation change.

### Decisions

- A capability does not satisfy the last-10-percent promise if the professional must infer how to reach it. Revision belongs on the finished object's focused surface.
- `Edit storyboard` means inspect and revise the approved contract; it never means silently mutate or regenerate the finished Video.
- No provider request ran in this milestone. The evidence ledger remains 97 HTTP operations; exact dollar debit is unavailable and no exact spend is invented.

### Open items

- Founder-Source dogfood and intended-audience review still determine whether the complete revision loop clears the professional send-it bar.
- Founder capture, the founder-derived final operator run, verified final package, final MP4, external professional review, eligible Session ID, and public submission links remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 06:48 CT — Storyboard edits now lead to the correct next action

**Area:** Professional revision flow / approval consequences / Video staleness

### Changed

- Added concise consequence copy to the dirty Storyboard panel: `Saving will require Storyboard approval and a new Video.` Renamed the conditional action to `Save changes` so it describes a real edit rather than a generic state transition.
- Repaired the workflow action priority exposed by the new browser proof. A stale existing Video no longer marks the Presentation, Infographic, Image set, or Audio Overview as needing regeneration; after a Storyboard edit, `Approve storyboard` is the dominant next action and the existing Video remains honestly `Needs update`.
- Extended the real Video regression beyond navigation: it edits narration, saves the new Storyboard version, proves approval is revoked, returns to Outputs, and proves the current Video is stale.
- Made that regression independently runnable by explicitly seeding the same completed fixture environment used by the production browser server. A focused test no longer relies on an earlier test having opened the seeded Workshop first.

### Verified

- The first full run failed at the expected post-save assertion and exposed the incorrect `Update outputs` priority. The product logic was corrected; the assertion was not weakened.
- The focused Storyboard revision regression passed independently in 26.9 seconds.
- The complete production-browser suite passed all 29 tests at desktop, compact, and 390×844 mobile widths.
- `pnpm check` passed all thirteen packages with 116 worker, 30 web, and 17 production tests.
- `pnpm demo:e2e` passed the recorded seam through grounded Map, approvals, outputs, Storyboard, and rendered Video.
- `pnpm submission:packet:verify` passed with Terra, six GPT Image 2 panels, five product Cedar clips, the 2:20 Cedar editorial film, eight ready/two blocked shots, sixteen current UI screens, and four honest founder/final-package gaps.
- `git diff --check` passed outside the preserved user-owned `PLAN-2026-07-13.md` modification.

### Decisions

- Video is downstream of Storyboard, not part of the general Output regeneration set. Editing Storyboard requires approval and a new Video; it must not imply that already-current decks, images, or audio need to be rebuilt.
- Consequences belong at the moment of edit, in plain language. The product should never surprise a professional by revoking approval or staling finished work after an unlabeled save.
- No provider request ran in this milestone. The evidence ledger remains 97 HTTP operations; exact dollar debit is unavailable and no exact spend is invented.

### Open items

- Founder capture, the founder-derived final operator run, verified final package, final MP4, external professional review, eligible Session ID, and public submission links remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 07:01 CT — Provider Presentation becomes content-aware

**Area:** Professional output quality / editable PowerPoint / real-artifact review

### Changed

- Audited the actual provider-backed Presentation Version 4 instead of treating prior generation tests as the quality bar. The contact sheet exposed a visibly clipped opening claim and a sparse process slide that reduced Capture → Shape → Deliver to a large decorative page number.
- Taught the deck planner to recognize spoken transformation phrasing such as `should show how … becomes …`. It now produces a complete executive headline plus a grammatical supporting thought rather than splitting at an arbitrary character count.
- Added a dedicated content-aware sequence layout in responsive HTML and editable PowerPoint. Explicit three-stage source language becomes aligned Capture, Shape, and Deliver process cards with clear order, restrained Accent treatment, and the exact source footer.
- Preserved the approved GPT Image 2 cover binding, Style tokens, claim IDs, source locators, immutable Presentation history, and image-revision staleness contract.
- Generated live Presentation Version 6 locally, refreshed the provider-backed Outputs evidence, rebuilt the canonical UI gallery, provider film input, final-style overlay preview, and 2:20 Cedar rough cut. No provider request was needed.

### Verified

- `@workshoplm/production` passed 18 tests and typecheck; the new regression verifies both HTML and editable PowerPoint sequence output.
- `@workshoplm/worker` passed 117 tests and typecheck; the new regression starts from the same spoken sample structure and rejects the retired clipped headline.
- The real Version 6 PowerPoint archive passed `unzip -t`. LibreOffice produced five 16:9 pages at 960.009×540 points; `pdftotext -layout` retained the complete headline, support, Capture/Shape/Deliver stages, recommendation, and all visible source labels.
- Full-resolution contact-sheet inspection found no observed clipping or overflow. The editable PowerPoint SHA-256 is `174c91330c066f7ca719aed9d73df175373c2e371e7b4daddac4b6eadf3413f5`; the PDF is `5edc7a03865408741bac5b35dbc5207d003d1fe89213eee16a14d487663631a3`; the accepted contact sheet is `4ea967c3860983b0c45edb7253a9ea9d5d6d04dd3cd61d3d5267e021a56551a2`.
- A live 1200×800 browser run opened current Outputs and Presentation Version 6 with zero horizontal overflow. The current-only gallery retained one hero Presentation and moved Versions 1–5 into focused history.
- `pnpm check` passed all thirteen packages. `pnpm demo:e2e` passed the complete recorded seam. The strict production-browser suite passed all 29 tests.
- `pnpm submission:packet:verify` passed with Terra, six GPT Image 2 panels, five product Cedar clips, the 2:20 Cedar film, eight ready/two blocked shots, sixteen current UI screens, and four honest founder/final-package gaps.
- `git diff --check` passed outside the preserved user-owned `PLAN-2026-07-13.md` modification.

### Decisions

- Presentation layout must follow the semantic structure of the approved content. Alternating templates is not enough when the source explicitly describes a process, proof set, plan, or decision.
- Source fidelity does not require preserving spoken scaffolding or arbitrary truncation. A professional headline may remove `should show how` while the supporting thought and exact source edge preserve the complete meaning.
- Internal visual acceptance improves the artifact but does not satisfy the open intended-audience `Send`/`Revise` gate.
- The provider evidence ledger remains 97 HTTP operations. Exact dollar debit is unavailable and no exact spend is invented.

### Open items

- Founder capture, the founder-derived final operator run, verified final package, final MP4, external professional review, eligible Session ID, and public submission links remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 07:21 CT — Provider Infographic becomes content-aware

**Area:** Professional output quality / editable PowerPoint / responsive preview / film evidence

### Changed

- Audited the actual provider-backed Infographic Version 1 instead of relying on renderer tests. Its PowerPoint/PDF exposed a clipped opening idea, a timestamp-heavy voice label, and Capture → Shape → Deliver as an ordinary text card.
- Regenerated the content through the repaired semantic planner so spoken transformation language becomes one complete idea plus support and visible provenance becomes `Voice brainstorm` while exact locator metadata remains intact.
- Added a dedicated Infographic process composition in responsive HTML and editable PowerPoint. Explicit sequence items now render as ordered Capture, Shape, and Deliver steps with restrained Accent treatment rather than another generic numbered block.
- The first strict browser run rejected the embedded fixture preview and exposed a CSS namespace collision: Presentation-level `statement` and `recommendation` classes were styling Infographic cards. Replaced those shared classes with Infographic-scoped `data-layout` semantics, regenerated the live artifact as Version 4, and kept Versions 1–3 in history as `Needs update`.
- Refreshed the real provider-backed Outputs evidence, sixteen-screen UI gallery, six-second provider gallery film input, final-style overlay preview, and 2:20 Cedar rough cut. The first gallery capture was rejected because its file-size drop and grey contact-sheet media revealed that embedded assets had not finished loading; the accepted recapture waits for every image and iframe asset to report real dimensions. No provider request ran.

### Verified

- `@workshoplm/production` passed 19 tests and typecheck. The new regression verifies the sequence in both responsive HTML and editable PowerPoint.
- Infographic Version 4 passed PowerPoint archive validation, a one-page LibreOffice PDF round trip at 960.009×540 points, and layout-preserving text extraction with the complete opening idea, all three process stages, and every visible source label.
- Desktop 1200×800 and compact 760×900 live workbench runs opened the focused current Infographic with zero horizontal overflow and found Capture, Shape, and Deliver inside the embedded preview. Full-page screenshots are preserved under `artifacts/ui-review/`.
- The final strict production-browser run passed all 29 states after the namespace repair; the old baseline was not updated to conceal the collision.
- `pnpm check` passed all thirteen packages with 117 worker, 30 web, and 19 production tests. `pnpm demo:e2e`, `pnpm demo:film:verify`, and `pnpm submission:packet:verify` passed with the honest eight-ready/two-blocked film boundary.
- The editable PowerPoint SHA-256 is `3be57ed413ceba66ceabd8444a46ca459d649646bf1451e817c7cb503fa06b68`; the PDF is `d00f6d31acb837c97e5c713ab612c4527eb907306913b84afc88f7ecdc72e5f0`; the accepted full-resolution frame is `86dffd1e18c8e61376524b9423281a85f5b7ea82db1d03f9c8237f9de76d4d07`.
- `git diff --check` passed outside the preserved user-owned `PLAN-2026-07-13.md` modification.

### Decisions

- Infographics need content-aware composition, not just smaller Presentation typography. A source explicitly describing a process should become a process visual in every relevant Output.
- Layout semantics must remain scoped to the rendering surface. Shared names are acceptable in the domain contract, but CSS selectors may not let one Output family silently restyle another.
- Internal visual acceptance improves the artifact but does not satisfy the open intended-audience `Send`/`Revise` gate.
- The provider evidence ledger remains 97 HTTP operations. Exact dollar debit is unavailable and no exact spend is invented.

### Open items

- Founder capture, the founder-derived final operator run, verified final package, final MP4, external professional review, eligible Session ID, and public submission links remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 07:41 CT — External-use provider first-draft proof and production repair

**Area:** First five minutes / live Terra Map / editable Presentation / professional output quality

### Changed

- Added a fail-closed external-use proof harness that permits exactly one `gpt-5.6-terra` request, isolates its local data root, imports five shareable AI Collective evidence blocks, builds the provider Map, approves the Brief, applies the AI Collective Style, and creates an editable PowerPoint.
- Ran the proof once. The product completed the provider Map and first editable Presentation, but the harness initially rejected the correct result because it expected the retired `grounded_map` operation name and `providerRequestId` field. Repaired only the harness, reused the already-paid state, and did not issue a second request for evidence bookkeeping.
- Inspected the first real PowerPoint instead of accepting latency alone. It exposed two production defects: a `Source locator:` paragraph had been sentence-split into a slide claim, and `A chapter lead becomes a visible facilitator and go-to resource…` became a clipped headline plus an orphan `community` body.
- Repaired source normalization so locator/citation metadata paragraphs remain searchable source material but cannot become claims. Added a backward-compatible deck-selection guard so already-persisted metadata claims also cannot become slide content.
- Added content-aware handling for `becomes X and Y`: the renderer now writes a complete executive headline and grammatical supporting sentence instead of truncating by character count.
- Regenerated the accepted Presentation as Version 3 locally with no additional provider request. Preserved the first-draft timing/hash separately from the repaired-output hashes and added an honest checked-in evidence packet under `artifacts/live-review/first-fifteen-external/`.

### Verified

- Provider request `req_67fce808cc364de8be8834dd2481e33c` produced a six-node, five-edge Map with output SHA-256 `41fc4ca58f8ed11178ed2582a081a9799ddca9f83af1684cbfc85ded63d2eda4` under a one-request ceiling.
- Recovered timing from the normalized Source timestamp records 5.957927 seconds to the provider Map and 5.983927 seconds to the first editable Presentation. It deliberately does not claim the earlier ingestion interval or provider-only duration.
- The first Presentation PowerPoint SHA-256 remains `1cd257f51c7887738a39193c5c54aead915416aa7c46af9e73b8c6b13a7f2699`; it is preserved as measured first-draft evidence, not accepted quality evidence.
- The repaired Version 3 archive passed `unzip -t`. LibreOffice rendered five 16:9 pages at 960.009 × 540 points, and layout-preserving text extraction retained the complete chapter-lead headline/support, `180+ / 40+ / 400+` proof, recommendation, and visible source labels without locator leakage.
- Full-resolution contact-sheet inspection found no clipping or overflow. The accepted editable PowerPoint SHA-256 is `14dc2bcbf3806160b49f53c31ef6eb74023ab8a40f78cc2fb48dce1d1ad1acda`; PDF `6144a6feefeb322fa434e77f63777628a6acd1723ed7c5d7a82122d49d3371cf`; contact sheet `4fc1512f491d9ea236280d09977b286bb87057eff40f2db422432fc4d93a60fd`.
- Controlled Playwright inspected the real provider Map and focused Presentation at 1200×800 and 760×900. Both widths had document, body, and viewport widths equal with zero horizontal overflow; screenshots and their hashes are in the evidence packet.
- `@workshoplm/worker` passed 118 tests and typecheck. The new regression proves metadata paragraphs do not become claims and the chapter-lead transformation remains complete.

### Decisions

- Provider latency is necessary evidence, not an acceptance criterion. A fast malformed deck is a failed first draft; visual inspection must be allowed to reject it and feed a product-level repair.
- Explicit source locators are provenance metadata, not narrative evidence. They remain in normalized source chunks for retrieval but may not become Map ideas or Output claims.
- Historical proof distinguishes the timed first Presentation from the accepted repaired Presentation. Regeneration may not silently rewrite the first-draft hash or claim that no repair occurred.
- The evidence ledger increases from 97 to 98 OpenAI HTTP operations. Exact dollar debit remains unavailable and is not invented.

### Open items

- The named first-use gates remain open: this was controlled automation over external-use material, not an uncoached professional using their own files. The recovered timer excludes the initial ingestion interval, and no external professional has returned `Send` or `Revise`.
- Founder capture, the founder-derived final operator run, verified final package, final MP4, eligible Session ID, and public submission links remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 07:44 CT — External-use repair clears full acceptance

**Area:** Integration / production-browser regression / submission truth

### Verified

- `pnpm check` passed all thirteen packages with 118 worker, 30 web, and 19 production tests.
- `pnpm demo:e2e` passed the recorded seam through grounded Map, both approvals, editable Outputs, Storyboard, and rendered Video.
- `pnpm --filter @workshoplm/web test:visual` rebuilt the production app and passed all 29 desktop, compact, mobile, recovery, accessibility, source-trace, and revision states in 1.1 minutes.
- `pnpm submission:packet:verify` passed with Terra, six GPT Image 2 panels, five product Cedar clips, the 2:20 Cedar editorial film, eight ready/two blocked shots, sixteen current UI screens, and four honest founder/final-package gaps.
- `git diff --check` passed outside the preserved user-owned `PLAN-2026-07-13.md` modification.

### Decisions

- The product repair is compatible with the complete judge seam and may ship as one isolated milestone. The stale plan remains untouched and excluded from staging.
- No additional provider request ran during repair or broad verification; the evidence ledger remains 98 HTTP operations.

### Open items

- The professional-own-material, external `Send`/`Revise`, founder capture, final package, final MP4, eligible Session ID, and public submission gates remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 07:56 CT — Focused Outputs show the complete artifact first

**Area:** Professional workbench / Presentation and Video review / responsive artifact fit

### Changed

- Used the checked-in external-use screenshot to audit the actual focused Presentation viewer. At 1200×800, the clean PowerPoint cover was still cropped inside the product before its title became visible because the iframe inherited the leftover viewport height.
- Replaced the height-squeezed focused layout with one scroll surface and an intrinsic 16:9 artifact frame. Sources and version history now follow the complete artifact instead of shrinking or overlaying it.
- Kept Audio Overview on its purpose-built grid and retained the existing narrow mobile scaling behavior. Presentation, Infographic, and Video share the corrected professional review frame.
- Added a production-browser assertion that the first slide and its cover title both fit inside the iframe. It fails on the retired desktop viewer even when horizontal overflow remains zero.
- Replaced only the six intentionally changed visual contracts: desktop/compact Presentation, Video, and original-brainstorm reveal. The strict first run rejected the old cropped Presentation snapshot before any baseline update.

### Verified

- The live provider-backed Presentation Version 3 fit completely at 1200×800, 1024×768, and 760×900. Measured preview frames were 1056×594, 896×504, and 712×400.5 respectively; slide and title bottoms remained inside each iframe.
- The 1200px and 1024px focused surfaces scroll vertically to Sources and history rather than clipping them. The 760px view fits the complete artifact, Sources, and history with document width equal to viewport width.
- Visual inspection accepted the updated fixture Presentation and full-size Video viewers plus the original-brainstorm sheet over the corrected Video frame. Evidence and hashes are under `artifacts/ui-review/presentation-fit/` and the production snapshot directory.
- The snapshot-update run passed all 29 production-browser states after changing only the six reviewed baselines.

### Decisions

- In a professional artifact viewer, the artifact owns its real aspect ratio. Provenance remains immediately adjacent but may move below the frame and scroll; it may not reduce the artifact to an unreadable crop.
- Snapshot changes require a strict failure and visual review of the actual replacement. This pass did not broadly regenerate unrelated visual baselines.
- No provider request ran; the evidence ledger remains 98 HTTP operations.

### Open items

- Run the complete production-browser suite strictly after the reviewed snapshot replacement, then run the broader repository and submission gates before committing.
- The professional-own-material, external `Send`/`Revise`, founder capture, final package, final MP4, eligible Session ID, and public submission gates remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 08:00 CT — Artifact-first viewer clears strict acceptance

**Area:** Integration / visual contract / demo seam

### Verified

- The strict production-browser suite rebuilt the production app and passed all 29 states in 1.1 minutes with no snapshot updates. The new slide/title fit assertion passed at desktop, compact, and mobile widths.
- `pnpm check` passed all thirteen packages with 118 worker, 30 web, and 19 production tests.
- `pnpm demo:e2e` passed the full recorded Capture → Map → Brief → Style → Outputs → Storyboard → Video seam.
- `pnpm submission:packet:verify` passed with Terra, six GPT Image 2 panels, five product Cedar clips, the 2:20 Cedar editorial film, eight ready/two blocked shots, sixteen current UI screens, and four honest founder/final-package gaps.
- `git diff --check` passed outside the preserved user-owned `PLAN-2026-07-13.md` modification.

### Decisions

- The focused-viewer repair is isolated, visually reviewed, and compatible with the complete product and submission seam. It is ready to commit without additional provider spend.

### Open items

- The professional-own-material, external `Send`/`Revise`, founder capture, final package, final MP4, eligible Session ID, and public submission gates remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 08:09 CT — Focused Outputs lead with the finishing action

**Area:** Product / professional Output review / visual hierarchy

### Changed

- Audited the accepted focused Presentation at desktop, compact, and mobile widths against the one-dominant-action rule. The primary black action was `Show source` even though the same exact claim trace was already directly below the artifact; editable PowerPoint was visually secondary.
- Removed that duplicate header action. Presentation and Infographic now make `Download PowerPoint` primary, and Video makes `Edit storyboard` primary. `Open preview`, `Open video`, `Show original`, claim-by-claim source trace, and Version history remain available without competing for emphasis.
- Updated the demo-capture source-trace beat to use the visible claim trail, which is the same interaction a professional now sees.
- Added browser assertions for the new hierarchy: no duplicate exact `Show source` in focused headers, editable PowerPoint is primary for rendered documents, and Storyboard editing is primary for Video.

### Verified

- The first strict production-browser run rejected the retired desktop Presentation baseline. The actual replacement was visually inspected: it removes one redundant button, retains the complete artifact, and leaves exact source claims immediately below it.
- The stateful snapshot-review run passed all 29 production-browser cases and regenerated only the eight focused Presentation/Video views whose action hierarchy actually changed, including the original-brainstorm sheet over Video.
- A second strict `pnpm --filter @workshoplm/web test:visual` run rebuilt the production app and passed all 29 desktop, compact, mobile, recovery, accessibility, source-trace, and revision states in 1.1 minutes without snapshot updates.
- `pnpm --filter @workshoplm/web test` passed all 30 web unit and contract tests.

### Decisions

- Source grounding stays prominent, but it has one consistent home: the claim trail adjacent to the artifact. The header is reserved for the action that finishes or revises the current object.
- The stale dated plan remains untouched and excluded from execution and staging. No provider request ran; the evidence ledger remains 98 HTTP operations.

### Open items

- Run the broader repository, recorded seam, and submission packet gates before committing this milestone.
- The professional-own-material, external `Send`/`Revise`, founder capture, final package, final MP4, eligible Session ID, and public submission gates remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 08:11 CT — Finishing-action hierarchy clears the complete seam

**Area:** Integration / acceptance / submission evidence

### Verified

- `pnpm check` passed lint, typecheck, and tests across all thirteen packages, including 118 worker, 30 web, and 19 production tests.
- `pnpm demo:e2e` passed the complete recorded Capture → grounded Map → Brief → Style → editable Outputs → Storyboard → rendered Video seam.
- `pnpm submission:packet:verify` passed with Terra, six GPT Image 2 panels, five product Cedar clips, the 2:20 Cedar editorial film, eight ready/two blocked shots, sixteen current UI screens, and four honest founder/final-package gaps.
- `git diff --check` passed across the milestone while excluding only the preserved user-owned `PLAN-2026-07-13.md` modification.

### Decisions

- The action-hierarchy repair preserves the full capability and evidence floor and is ready to ship as an isolated milestone. No provider request ran; the evidence ledger remains 98 HTTP operations.

### Open items

- The professional-own-material, external `Send`/`Revise`, founder capture, final package, final MP4, eligible Session ID, and public submission gates remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 08:25 CT — The last persistent mobile tab strip is gone

**Area:** Product / responsive navigation / official component compliance

### Changed

- Visual review of the accepted mobile Presentation exposed a remaining five-button `Chat / Map / Brief / Outputs / Story` strip. Although styled as small official buttons, it still behaved as a persistent tab bar and competed with Sources, the current object, and the next action.
- Replaced that row with one secondary `Views` trigger in the compact header. It opens a focused `Workshop views` sheet built only from the locked SideSheet, ListGroup, ListRow, and ListRowAction primitives.
- The sheet preserves one-interaction access to Chat, Map, Brief, Outputs, and Storyboard, labels each purpose in plain language, marks incomplete objects `Available later`, disables the current object, closes after selection, and restores keyboard focus to `Views`.
- Removed the 42-pixel navigation row from the responsive workbench grid so the Map, Presentation, Outputs, Storyboard, Video, recovery states, and Conversation all regain vertical space.
- Updated browser navigation helpers to exercise the visible desktop rails above 900 pixels and the real `Views` sheet below that boundary. Added a dedicated mobile screenshot and readiness assertions for the new sheet.
- Rebuilt the sixteen-screen shareable UI gallery. Its mobile Map and Outputs now show the no-tab header, while the refreshed focused Presentation, Video, and original-reveal frames carry the prior finishing-action hierarchy.

### Verified

- The first strict production-browser run rejected the retired `mobile-reset-map` baseline. The current 390×844 Map visibly shows only `Views`, source count, and the next action above the reclaimed canvas.
- Visual inspection rejected the first sheet render because title and detail ran together, then accepted the repaired stacked typography. The final `mobile-workshop-views.png` shows five calm object rows with clear readiness copy and no tab strip.
- A stateful snapshot review passed all 29 production-browser cases after updating only materially affected mobile states. A subsequent strict production build passed all 29 cases in 1.1 minutes with no snapshot updates.
- `pnpm ui:gallery:build` rebuilt sixteen screenshots, the contact sheet, and `outputs/workshoplm-current-ui.zip` with SHA-256 `0bedb7d9e0cc26af3362f61243f0475dd8b5e705bfdafd95ae509679faf8abc1`.

### Decisions

- Compact navigation is progressive disclosure, not a permanent stage list. The current object and next action remain visible; non-current destinations live in one predictable sheet.
- The stale dated plan remains untouched and excluded from execution and staging. No provider request ran; the evidence ledger remains 98 HTTP operations.

### Open items

- Run the complete repository, recorded seam, and submission packet gates against the refreshed gallery before committing.
- The professional-own-material, external `Send`/`Revise`, founder capture, final package, final MP4, eligible Session ID, and public submission gates remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 08:27 CT — No-tab workbench clears full acceptance

**Area:** Integration / responsive UX / submission evidence

### Verified

- The strict production-browser suite rebuilt the current production app and passed all 29 desktop, compact, mobile, recovery, accessibility, source-trace, navigation, and revision states in 1.1 minutes without snapshot updates.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages, including 118 worker, 30 web, and 19 production tests.
- `pnpm demo:e2e` passed the complete recorded Capture → grounded Map → Brief → Style → editable Outputs → Storyboard → rendered Video seam.
- `pnpm submission:packet:verify` passed against the refreshed sixteen-screen gallery with Terra, six GPT Image 2 panels, five product Cedar clips, the 2:20 Cedar editorial film, eight ready/two blocked shots, and four honest founder/final-package gaps.
- `git diff --check` passed across the milestone while excluding only the preserved user-owned `PLAN-2026-07-13.md` modification.

### Decisions

- The no-tab compact navigation preserves the complete product seam and official-component boundary and is ready to ship as an isolated milestone. No provider request ran; the evidence ledger remains 98 HTTP operations.

### Open items

- The professional-own-material, external `Send`/`Revise`, founder capture, final package, final MP4, eligible Session ID, and public submission gates remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 08:50 CT — Public clean-clone path is truthful and executable

**Area:** Judge access / release verification / local HyperFrames

### Changed

- Reconciled the public README to the current product and evidence floor. WorkshopLM now correctly owns the focused Conversation inside the Codex in-app browser; Codex desktop/CLI remains the verified plugin host, and ChatGPT Work remains unclaimed.
- Replaced stale pre-provider language with the inspected `gpt-5.6-terra`, six-panel GPT Image 2, Cedar narration, grounded Realtime, and local HyperFrames proof while preserving the strict boundary between the deterministic fixture, authorized sample run, and still-open founder-derived final package.
- Added the required thirteen-request ceiling to the documented paid command and linked the exact provider, image-review, Video-review, Realtime, and claim-ledger artifacts.
- A first clean clone exposed that `demo:render` targeted `.workshoplm/` while the verified fixture and server use `.workshoplm/acceptance`; its unconditional approval calls staled the already-approved Storyboard, its HyperFrames inspection command was deprecated, and its returned failed job did not make the process fail. `demo:thumbnail` used the same wrong root.
- Pointed render and thumbnail generation at the acceptance root by default with an explicit `WORKSHOPLM_DATA_ROOT` override, made render setup idempotent, made failed/idle worker outcomes exit nonzero, replaced deprecated `hyperframes inspect` with `hyperframes check`, and pinned HyperFrames `0.7.60` in the lockfile.

### Verified

- Warm-checkout repair verification passed `pnpm check`, `pnpm demo:reset`, `pnpm demo:e2e`, `pnpm demo:render`, and `pnpm demo:thumbnail`. The second immutable fixture Video was a 2,109,433-byte MP4 with SHA-256 `6e6206288b89724f1a32a044b22e07d85f1ebf4ecf2b114d617f25c69ffe6fc3`; the 165,976-byte thumbnail hash was `d748a1efbfecff0390ed84fd3a8f241eeb180246d10584d5c4d0b315cbe9d586`.
- Pushed public commit `4cd938d9c8fb6598a0836884ebbd90045ceccce2`, then cloned it into a new temporary directory. `pnpm install --frozen-lockfile` installed the exact lockfile including HyperFrames `0.7.60`.
- The clean clone passed lint, typecheck, and tests across all thirteen packages, including 118 worker tests, 30 web tests, and 19 production tests.
- The clean clone passed the recorded Capture → Map → Brief → Style → Outputs → Storyboard → Video acceptance seam, then independently produced Video Version 2 and the same hash-bound thumbnail through the public README commands.
- `pnpm demo:serve` started the clean clone. Port 3000 was already occupied, so Next selected 3001; `GET /api/workshop` and `GET /` both returned HTTP 200. The API reported `WorkshopLM Build Week`, `briefApproved: true`, `videoState: rendered`, and two rendered document Outputs.
- README local-link validation found ten local links and zero missing targets. `pnpm plugin:inspect` passed all seven plugin tests before the public correction was committed.
- `git diff --check` passed. The stale user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from both commits.

### Decisions

- Judge-access verification follows the public repository and documented commands, not a warm checkout. A clean-clone failure is a product defect even when the internal acceptance seam is green.
- HyperFrames is now a pinned local dependency so the judge path cannot silently float to an incompatible CLI. The renderer still runs locally and requires no HyperFrames API or account.
- No provider request ran during this milestone; the evidence ledger remains 98 OpenAI HTTP operations and no dollar debit is inferred.

### Open items

- The professional-own-material, external `Send`/`Revise`, founder capture, final ready package, public under-three-minute Video, eligible `/feedback` Session ID, release tag, Devpost fields, and final logged-out link checks remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 09:02 CT — Real pasted notes retain the private-source boundary

**Area:** Product privacy / language / browser regression

### Changed

- Audited every remaining visible grounding, provider, file, model, and implementation term in the primary web surface while reconciling the unchecked plain-language goal.
- Found that pasted notes added during onboarding were correctly stored as `private`, but the same notes added later through the main `Add source` sheet were sent as `sanitized`. Corrected the workbench request to preserve real professional material as private. Public URLs retain their existing public-content path, while local PDFs and Realtime transcripts were already private.
- Added a production-browser assertion that fills the real workbench Source field, captures the outgoing request, and requires `origin: Pasted notes` plus `permission: private` without mutating the shared fixture.
- Replaced visible `source-defensible`, `grounded thinking`, and provider-transcript language with direct copy about sourced claims, organizing ideas, using only selected Sources, and retrying a transcript WorkshopLM could not verify.
- Simplified the Audio Overview disclosure to explain that every script edit and Source remains reviewable before audio is created.
- Stabilized the focused Video visual check by requiring the correct Workshop and object identity before the screenshot is taken; the existing accepted baseline remained unchanged.

### Verified

- `pnpm --filter @workshoplm/web test` passed all 30 unit and UI-contract tests. The contract now requires both pasted-note entry points to use `private` and rejects the retired provider-evidence error.
- The strict production-browser suite rebuilt the optimized app and passed all 29 desktop, compact, mobile, privacy-request, source-scope, Realtime, artifact, recovery, accessibility, and revision scenarios in 1.1 minutes without snapshot updates.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages, including 118 worker tests, 30 web tests, and 19 production tests.
- `pnpm demo:e2e` passed the recorded Capture → Map → Brief → Style → Outputs → Storyboard → Video seam.
- `pnpm submission:packet:verify` passed with Terra, six GPT Image 2 panels, five product Cedar clips, the 2:20 editorial rough cut, sixteen current UI screens, eight ready shots, two blocked shots, and four honest founder/final-package gaps.
- `git diff --check` passed. The stale user-owned `PLAN-2026-07-13.md` modification remained untouched.

### Decisions

- `sanitized` is an explicit demo/share classification, never the implicit default for notes a professional enters in the live product. Local-first storage does not justify weakening that semantic boundary.
- Implementation provenance remains inspectable in trace details, but primary UI copy describes the user's material, action, and consequence rather than the provider mechanism.
- No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no dollar debit is inferred.

### Open items

- Founder-Source dogfood and the intended-audience `Send`/`Revise` decision remain necessary before closing the continuous language, last-10-percent, and send-it gates.
- The founder recording, final ready package, public Video, eligible `/feedback` Session ID, release tag, Devpost fields, and final submitted-link checks remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 09:08 CT — Public packaging now fails closed on private Sources

**Area:** Submission privacy / founder handoff / acceptance

### Changed

- Traced the newly corrected private pasted-note boundary through submission export and found a downstream leak: the exporter copied active Source metadata, claims, transcript-derived locators, and the complete build trace without enforcing Source permissions.
- Made public submission packaging refuse to run while any active Source is `private`, before reading or copying its shareable evidence. The error names the private Source so the operator can resolve the scope deliberately.
- Kept founder recording imports private by default and added `--share-founder-source` as the explicit local consent switch for the public meta-demo. The paid follow-up command preserves that choice; the flag never uploads or publishes material.
- Added narrow Git ignore rules for the staged raw founder recording and transcript while retaining the existing sanitized demo-film inputs in version control.
- Documented the private-default and explicit-share commands in the README and reconciled the current handoff in `GOAL.md`.

### Verified

- `pnpm --filter @workshoplm/worker test` passed all 119 worker tests, including a new regression that adds a private client transcript to an otherwise buildable Workshop and requires submission packaging to reject it.
- `pnpm --filter @workshoplm/worker typecheck` passed.
- `pnpm demo:e2e` passed the sanitized recorded Capture → Map → Brief → Style → Outputs → Storyboard → rendered Video seam, proving the new guard does not block authorized shareable fixture content.
- `pnpm submission:packet:verify` passed with Terra, six GPT Image 2 panels, five product Cedar clips, the 2:20 editorial rough cut, sixteen UI screens, eight ready shots, two blocked shots, and four honest founder/final-package gaps.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages. No provider call ran; the evidence ledger remains 98 OpenAI HTTP operations and no dollar debit is inferred.

### Decisions

- Local capture and public packaging are separate permissions. Private is the default for professional and founder material; `sanitized` or explicitly `shareable` is required for a public Output set.
- The founder transcript reveal remains available as the demo's climax, but it requires an operator choice that is visible in the command and preserved across the paid handoff.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- Founder recording, deliberate public-share decision, final provider regeneration, final ready package, under-three-minute public Video, intended-audience `Send`/`Revise`, eligible `/feedback` Session ID, release tag, Devpost fields, and logged-out link checks remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 09:12 CT — Judge-film proof captions no longer truncate

**Area:** Demo film / visual quality / final-export guardrail

### Changed

- Audited the current 2:20 Cedar rough cut at full-frame resolution rather than relying on its passing manifest. Shot nine visibly clipped the HyperFrames/OpenAI proof statement with an ellipsis, weakening the most technical judge-facing beat.
- Separated the on-screen proof caption from spoken narration. Each of the ten film-plan shots now owns a deliberate short caption, while the Cedar script remains unchanged.
- Updated both rough-cut and clean-final overlay styles to render the explicit caption. The film verifier now requires every caption and rejects any longer than 80 characters before assembly.
- Rebuilt the complete 1280×720 H.264/AAC rough cut, ten review frames, contact sheet, and hash manifest without making a provider request.

### Verified

- Full-resolution inspection accepted the repaired render frame: `Only approved work becomes the narrated Video` appears completely with no ellipsis or collision. The ten-frame contact sheet shows one concise, complete proof statement per shot.
- `pnpm demo:film:verify` passed the 140-second, ten-shot plan at 129.4 narration words per minute with eight ready shots and the same two honest founder/final-package blocks.
- `pnpm demo:film:rough` produced a 140.021333-second H.264/AAC Video with SHA-256 `631c2bc1507c841c94ebb5cafe9ef1a21b807f1b708fdec29b6df90712854d35` using the existing ten hash-bound OpenAI Cedar clips.
- `pnpm submission:packet:verify` passed with Terra, six GPT Image 2 panels, five product Cedar clips, ten editorial Cedar clips, sixteen UI screens, eight ready shots, two blocked shots, and four honest unresolved founder/final-package slots.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages. No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no dollar debit is inferred.

### Decisions

- Spoken narration and on-screen proof copy have different jobs. Captions must be intentionally scannable and complete; the compositor must not silently truncate narration into UI.
- The two blocked shots remain visibly pending. Improving the edit does not upgrade founder or final-submission evidence that does not yet exist.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- A human taste review of Cedar pacing and the provider Video remains open, along with founder recording, final ready package, final public MP4, intended-audience deck review, `/feedback`, release, Devpost, and link verification.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 09:15 CT — Judge-film visuals now match their narrated proof

**Area:** Demo film / editorial alignment / evidence quality

### Changed

- Continued the full-frame review after repairing captions and found three narration/visual mismatches. Short captured actions played once and then held their last frame for most of the shot, so evidence/edit held on the later Brief, Brief approval held on the next Style sheet, and Style held on the later Outputs screen.
- Added an explicit `captureEndHoldbackSeconds` edit control to captured film-plan shots. The compositor now stops each source beat before unrelated navigation begins, and the verifier rejects holdbacks outside 0.2–2 seconds.
- Tuned the Map, Source, evidence/edit, Brief, Style, Storyboard, and original-reveal beats independently, then rebuilt the complete rough cut and evidence set.

### Verified

- Full-resolution review accepted the repaired midpoint frames: shot four shows the editable verified-claim inspector, shot five shows the approved Brief and `Choose style` next action, shot six shows `WorkshopLM editorial · Version 1` applied, and shot eight shows the approved editable Storyboard with `Create video` next.
- `pnpm demo:film:verify` passed the unchanged 140-second, ten-shot plan with eight ready shots, two blocked shots, and four honest missing founder/final-export evidence items.
- `pnpm demo:film:rough` rebuilt the H.264/AAC OpenAI Cedar edit at 140.021333 seconds with SHA-256 `46ac7709f313d702af166183bc6f8b9ac15986179c60fee4420a6da08071e2a7`.
- `pnpm submission:packet:verify` and `pnpm check` passed. No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no dollar debit is inferred.

### Decisions

- A shot is not truthful merely because its source clip contains the claimed action somewhere. The frame held under the narration must show the same object, state, and consequence.
- Capture timing is now explicit plan data rather than an implicit compositor constant, so founder footage can be aligned without rewriting the edit engine.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- Founder capture and final meta-reveal remain the only blocked film shots. Human taste review, intended-audience deck review, final ready package, final public MP4, `/feedback`, release, Devpost, and link checks remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 09:21 CT — Clean final-film preview is current and claim-safe

**Area:** Demo film / meta reveal / stale-artifact prevention

### Changed

- Inspected the clean final overlay and meta-reveal preview after the rough-cut repairs. The Video preview still used a loading frame, and the reveal labeled a visibly bounded excerpt as the full `unedited transcript` while also calling the final share-authorized Source private.
- Replaced the preview's loading frame with an inspected provider-Video still. Renamed the reveal text to `Founder brainstorm · Verbatim excerpt` and now state that the full hash-bound Source remains in the Workshop.
- Found that `demo:film:preview-final` could report an old meta-reveal file when the current sanitized submission package was absent. Preview generation now removes every previous output before rendering and only reports a meta reveal created in the current run.
- Built and verified the current sanitized 18-asset submission package before regenerating the preview. The strict packet gate then found twenty retired untracked UI screenshots in the canonical gallery directory; they were preserved under `/tmp/workshoplm-retired-ui-2026-07-16/` rather than deleted, leaving only the current sixteen-screen tracked gallery judge-visible.

### Verified

- `pnpm submission:build` produced a hash-verified 18-asset `partial` fixture package with its five explicit provider limitations; `pnpm submission:verify` returned valid, current, and untampered.
- `pnpm demo:film:preview-final` regenerated the clean ten-shot overlay, representative frame, and current meta reveal. Full-resolution JPEG inspection accepted the quiet overlay, real Video proof, `Sample excerpt` preview label, bounded ellipsis, and accurate evidence footer.
- The first `pnpm submission:packet:verify` failed loudly on retired `01-map.png`, proving the gallery guard. After preserving all twenty retired files outside the repository, the same gate passed with sixteen current screens, eight ready shots, two blocked shots, and four unresolved founder/final-package slots.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages. No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no dollar debit is inferred.

### Decisions

- A meta-demo may show a verbatim excerpt, but must not label a truncated excerpt as the complete transcript. The full Source remains available through the product trace.
- Preview commands are evidence builders and therefore must never reuse stale files silently.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- Founder capture, final ready package, final public MP4, human film taste review, intended-audience deck review, `/feedback`, release, Devpost, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 09:24 CT — Film and Devpost evidence gates are reconciled

**Area:** Submission truth / film handoff / regression guard

### Changed

- A judge-facing wording sweep found the rough-cut README still required an eligible `/feedback` Session ID before replacing the final meta-reveal shot. That contradicted the implemented film verifier and the canonical demo script, which correctly treat `/feedback` as a separate Devpost form requirement.
- Corrected shot ten to require only the verified non-partial founder-derived Output set. The handoff now states explicitly that `/feedback` does not prove film content.
- Added the rough-cut README to `pnpm submission:packet:verify` and require both the final-package sentence and the separate-Devpost boundary so the documents cannot drift silently again.

### Verified

- `pnpm submission:packet:verify` passed with Terra, six GPT Image 2 panels, five product Cedar clips, the ten-clip 2:20 editorial film, sixteen current UI screens, eight ready shots, two blocked shots, and four honest unresolved founder/final-package slots.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages. No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no dollar debit is inferred.

### Decisions

- `/feedback` is required for the Devpost submission record, but it is not visual evidence that WorkshopLM created the founder-derived Output set. Film and form gates stay separate.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- Founder capture, final ready package, final public MP4, human film taste review, intended-audience deck review, `/feedback`, release, Devpost, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 09:29 CT — Optional judge path is exact and one command

**Area:** Judge access / public documentation / submission compliance

### Changed

- Refreshed the live OpenAI Build Week rules before finalizing the optional inspection path. The current rules require a working-as-depicted project, a public sub-three-minute YouTube video, relevant source and licensing access, `/feedback`, and concise installation, platform, and test instructions for plugin/developer-tool submissions.
- Verified the repository's MIT `LICENSE`, then found a concrete judge-path defect: the Devpost draft instructed judges to run `pnpm dev`, which opens the default product workspace rather than the recorded acceptance Workshop.
- Added `pnpm judge:start`, which runs the credential-free recorded acceptance and then serves its exact data root. Replaced the README and Devpost instructions with a frozen install plus that single command.
- Added packet assertions for the exact script and public instructions. The submission verifier now rejects a return to the incorrect `pnpm demo:e2e && pnpm dev` path.

### Verified

- `PORT=3107 pnpm judge:start` completed every recorded acceptance gate and started the local app. Live requests to `/` and `/api/workshop` both returned HTTP 200.
- API inspection returned `WorkshopLM Build Week`, one Source, approved Brief, approved Storyboard, rendered Video, and current Presentation plus Infographic outputs. The served HTML response was 14,022 bytes.
- `pnpm submission:packet:verify`, `pnpm check`, and `git diff --check` passed. No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no dollar debit is inferred.

### Decisions

- The public video remains the canonical judge path. The local fixture is a bounded, one-command optional inspection surface, not a second hosted product or a claim that judges will recreate the provider run.
- Ordinary `pnpm dev` remains useful for development and intentionally opens the default local workspace; judge instructions must use the explicit acceptance-root command.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- Founder capture, final ready package, final public MP4, human film taste review, intended-audience deck review, `/feedback`, release, Devpost, and logged-out submitted-link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 09:42 CT — Presentation process slides carry real hierarchy

**Area:** Output quality / editable presentation / visual review

### Changed

- Audited the remaining autonomous GOAL items against current artifacts. The clearest judge-visible weakness was still the provider deck's process slide: Capture, Shape, and Deliver were correctly recognized as a sequence, but the three editable cards contained only their labels.
- Added one quiet supporting definition to each canonical stage in responsive HTML and editable PowerPoint: gather the raw material, organize what matters, and create the finished work.
- Kept the definitions deliberately semantic rather than product-specific. The renderer improves comprehension without asserting that an arbitrary Source included voice, particular file types, or another unsupported capability.
- Updated both renderer-level and worker integration coverage for the complete generated markup.

### Verified

- The first full `pnpm check` correctly failed because a worker integration assertion still required the old label-only HTML. The assertion was updated to the intended richer contract; the second full run passed lint, typecheck, and tests across all thirteen packages, including 119 worker tests.
- A dedicated editable two-slide PowerPoint was generated through the real renderer, converted through LibreOffice to a 16:9 PDF, and inspected at 2001×1125. The accepted process slide has no clipping, overlap, duplicate text, or citation loss.
- Direct PowerPoint XML inspection found exactly one stage label and one definition for each of Capture, Shape, and Deliver, plus the unchanged visible `Source: Voice brainstorm` footer.
- `pnpm demo:e2e` passed the complete recorded seam after the final wording change. `pnpm submission:packet:verify` and `git diff --check` also passed. No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no dollar debit is inferred.

### Decisions

- Generated stage explanations may clarify a familiar workflow noun, but may not silently introduce a new sourced claim. Richer hierarchy and source discipline must land together.
- Visual review artifacts are preserved under `artifacts/live-review/presentation-sequence-detail/` as editable PowerPoint, PDF, and a full-resolution JPEG.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- Intended-audience `Send` or blocking `Revise` feedback remains required before the presentation send-it gate can close. Founder capture, final ready package, final public MP4, film taste review, `/feedback`, release, Devpost, and logged-out submitted-link verification also remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 09:53 CT — Judge-film proof shots stay visually alive

**Area:** Editorial film / objective quality control / submission evidence

### Changed

- Audited the current 2:20 Cedar rough cut with full-timeline freeze, black-frame, and EBU R128 measurements instead of relying on its contact sheet alone. Audio delivery was already strong, but five consecutive proof shots contained 12–18 second static holds after their short UI actions finished.
- Added one restrained editorial motion treatment to every shot: a maximum 6% push-in with a duration-aware horizontal drift. This keeps the current proof surface dominant while preventing narration-backed screenshots from reading as an unfinished slide show.
- Bound the motion contract into `pnpm submission:packet:verify`, including all ten shots, the maximum scale, and per-frame rate. Rebuilt the MP4, review frames, contact sheet, and manifest from the verified Cedar narration.

### Verified

- FFmpeg `freezedetect=n=0.0001:d=3` reduced repeated 12–18 second holds to one 3.03-second low-motion tail at the end of the honestly blocked founder-capture placeholder. `blackdetect` found no black interval.
- FFmpeg EBU R128 measurement remains -22.9 LUFS integrated loudness, 4.4 LU loudness range, and -2.9 dB true peak. The motion repair did not disturb the accepted Cedar mix.
- Visually inspected the regenerated 10-frame 1280x720 contact sheet at original resolution. The official workbench, exact-source reveal, Brief, Style, provider-backed Outputs, Storyboard, local Video, and original-brainstorm reveal remain legible; no proof caption is cropped or obscured.
- `pnpm demo:film:verify` passed with a 140-second draft, eight ready shots, two blocked shots, and the same four honest founder/final-export evidence gaps.
- `pnpm submission:packet:verify` passed with Terra, six GPT Image 2 panels, five product Cedar clips, ten editorial Cedar clips, sixteen current UI screens, eight ready shots, and two blocked shots.
- `pnpm demo:e2e` passed the complete recorded Source-to-render seam. `pnpm check` passed lint, typecheck, and tests across all thirteen packages, including 119 worker tests.

### Decisions

- The single 3.03-second tail is accepted only in the draft because it belongs to the explicit founder-capture placeholder that the real recording replaces. It is not evidence that the final film is complete and does not close human taste review.
- Motion stays subordinate to product proof: no decorative transition system, synthetic camera cuts, or new visual language was introduced.
- No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no dollar debit is inferred.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- Founder capture, founder-derived ready package, final public MP4, human film taste review, intended-audience deck review, `/feedback`, release, Devpost, and logged-out submitted-link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 10:02 CT — Submission thumbnail shows the actual product promise

**Area:** Judge-facing media / Output quality / deterministic packaging

### Changed

- Audited `pnpm demo:thumbnail` against the send-it bar and found it still extracted the frame at one second from the local Storyboard Video. The command technically produced a PNG but did not communicate WorkshopLM's product, transformation, or professional quality.
- Replaced the frame grab with a deterministic 1280×720 title composition using the film plan's locked `From rough thought to finished work` copy and the canonical provider-backed Outputs screen. The result uses the quiet black, white, and status-green product language already present in the official workbench rather than introducing a separate campaign style.
- The thumbnail renderer now binds the source Video, film plan, product proof, dimensions, and final PNG by SHA-256. It writes the runtime asset under the selected Workshop data root and a checked-in preview plus deterministic manifest under `outputs/demo-film-plan/`.
- Extended `pnpm submission:packet:verify` to reject the wrong dimensions, a changed image or product-proof hash, drift from the locked film-plan text, or Google/NotebookLM marks.

### Verified

- `pnpm demo:thumbnail` rendered the fixture asset and deterministic preview with SHA-256 `fceb6d2c279eacc4c5197bd2fb4261a8fc57052b06238c3cd75476f9437c04e3`; the source Video remains bound at `6e6206288b89724f1a32a044b22e07d85f1ebf4ecf2b114d617f25c69ffe6fc3`.
- Inspected the 1280×720 PNG after lossless render and a 640×360 JPEG reduction. The WorkshopLM name, three-line promise, Capture-to-Deliver shorthand, source-trace statement, and real Outputs proof remain identifiable at both review sizes without collisions or trademark leakage.
- `pnpm submission:packet:verify` passed with the new composition, exact 1280×720 dimensions, verified PNG and product-proof hashes, Terra, six GPT Image 2 panels, Cedar media, sixteen current UI screens, and the unchanged four honest founder/final-package slots.
- `pnpm demo:e2e` passed the complete recorded Source-to-render seam, and `pnpm check` passed lint, typecheck, and tests across all thirteen packages, including 119 worker tests. A post-reset thumbnail rebuild reproduced the exact same PNG hash.
- No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no dollar debit is inferred.

### Decisions

- A submission thumbnail is a product proof surface, not an arbitrary Video still. Its pixels must remain deterministic and tied to current evidence even though the final public upload is a later external action.
- The visual should foreground one promise and one real product surface. Additional feature lists, model badges, and decorative generated art would reduce clarity.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- The thumbnail is ready as a local candidate, but the founder-derived final Output set, public Video and Devpost upload, and logged-out submitted-link check remain open. Founder capture, intended-audience deck review, film taste review, `/feedback`, and release also remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 10:07 CT — Styled thumbnail reaches the traced Output set

**Area:** Submission package / Style integration / visual evidence

### Changed

- Traced the new standalone thumbnail through `buildSubmissionOutputSet` and found the real meta-demo package still generated all three thumbnails as automatic Video frame grabs. A polished preview therefore did not yet prove that WorkshopLM's own traced Output set contained the send-it asset.
- Replaced the packaged opening frame with a deterministic 1280×720 cover generated from the current Workshop's locked ink, paper, Accent, Style name, active Source count, and traced claim count. A ready provider package embeds the first current hash-verified generated image; the no-provider fixture uses an honest editorial fallback motif.
- Preserved `thumbnail-process.png` and `thumbnail-result.png` as timestamped frames from the actual rendered Video so the package includes both a designed public cover and direct process/result media proof.
- Kept the injectable frame renderer used by unit tests and added a pure SVG contract test for the product promise, exact Style tokens, evidence counts, and third-party-mark boundary.
- Corrected the public README so `pnpm demo:thumbnail` names all three inputs it now binds rather than claiming a simple Video frame extraction.

### Verified

- The worker suite passed 120 tests and typecheck. The new contract test verifies the locked Style and current evidence state enter the cover without introducing NotebookLM branding.
- `pnpm submission:build` produced the real 18-asset acceptance Output set with the styled `thumbnail-opening.png`; `pnpm submission:verify` returned `valid: true`, `stale: false`, and `tampered: false` with the five expected fixture-only limitations unchanged.
- Inspected the rendered 1280×720 packaged cover through a JPEG review conversion because the local PNG viewer intermittently displayed incomplete tiles. The accepted frame has a dominant promise, quiet evidence count, exact fixture Style, visible Style name, and no collision or overflow.
- `pnpm demo:e2e` passed the complete recorded Source-to-render seam. A fresh post-reset `submission:build` and `submission:verify` reproduced the valid 18-asset package, `pnpm submission:packet:verify` passed the full judge packet, and `pnpm check` passed lint, typecheck, and tests across all thirteen packages.
- No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no dollar debit is inferred.

### Decisions

- The first thumbnail is the public cover; the second and third are proof frames. Treating all three as interchangeable timestamp captures weakens both communication and provenance.
- Provider images enter the cover only after their persisted SHA-256 passes the same fail-closed check used for package copying. A missing generated image uses an explicit deterministic motif rather than a fake provider visual.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- The package integration is complete for both fixture and provider-ready mechanics, but the founder-derived ready package, public upload, film taste review, intended-audience deck review, `/feedback`, release, Devpost, and link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 10:13 CT — The self-produced package now tells the winning product story

**Area:** Generated submission copy / Meta-demo / claim integrity

### Changed

- Audited the actual `DEVPOST.md` and `README-NARRATIVE.md` inside the traced 18-asset Output set instead of assuming the stronger hand-authored submission draft reached the package. The files were accurate but generic: they listed features, buried the professional problem, and did not make the two approvals, claim-level receipts, last-10-percent path, or meta-demo compelling.
- Rebuilt the generated Devpost narrative around the weekly professional handoff gap, the complete Capture → Shape → Deliver product path, two consequential sign-offs, reusable Style, exact Source trace, editable Outputs, version/staleness behavior, and the fact that the package is itself product proof.
- Added dynamic OpenAI/Codex evidence: current GPT-5.6 Map run count, GPT Image 2 panel count, verified Realtime turns, Storyboard speech coverage, Audio Overview status, Codex build role, HyperFrames provenance, elapsed state, Source/claim totals, package status, and exact limitations all come from the current Workshop rather than fixed launch copy.
- Replaced the generic repository narrative with a concise six-step product path, package inventory, one-command judge reproduction, persisted version summary, and explicit separation between sanitized fixture and provider evidence.

### Verified

- The first worker test run correctly rejected a hardcoded one-Source expectation because the seeded fixture normalizes four active Sources. The assertion now verifies correct singular/plural copy for any current count.
- The second worker run correctly rejected a retired README phrase after the narrative rewrite. The contract now asserts the stronger current ownership sentence instead of preserving stale wording.
- The third worker run passed all 120 tests. Worker typecheck passed.
- Rebuilt and verified the real acceptance Output set. `DEVPOST.md` is 649 words, `README-NARRATIVE.md` is 290 words, and the 18-asset package remains `valid: true`, `stale: false`, and `tampered: false` with exactly the five honest fixture limitations.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages; `pnpm demo:e2e` passed the complete recorded Source-to-render seam. A final post-reset `pnpm submission:build`, `pnpm submission:verify`, and `pnpm submission:packet:verify` reproduced the valid untampered package, the 1280×720 thumbnail hash, all sixteen UI screenshots, and the unchanged four honest founder/final-package slots. `git diff --check` passed.
- No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no dollar debit is inferred.

### Decisions

- The hand-authored Devpost draft remains the publication control surface, but the product-generated copy must independently clear the judge-story bar for the meta-demo claim to be honest.
- Generated public copy may explain the product thesis and workflow, but every provider count, timing statement, and readiness claim must be computed from the packaged Workshop state.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- Founder capture, founder-derived ready package, final public MP4, human film taste review, intended-audience deck review, `/feedback`, release, Devpost publication, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 10:34 CT — Source grounding says exactly what it proves

**Area:** UI language / trust / contextual sheets / responsive verification

### Changed

- Audited the current workbench strings and sixteen-screen gallery against the locked plain-language vocabulary. The remaining material problem was not another tab or card: source-backed statements were labeled `Verified`, which could imply that WorkshopLM had established truth rather than preserved a trace to user material.
- Replaced that label with `Sourced` in the editable Map outline and claim inspector. The approved Brief now reports sourced claims and uses `Sources behind this brief`; Chat says answers stay linked to Sources and offers `Find the lead source`; the Board presentation onboarding choice says it is grounded in the professional's Sources.
- Updated the locked design token description and visible-copy contract so `Verified claim` and `verified claims` cannot return to the primary UI. Exact locators, excerpts, derived/creative distinctions, and internal evidence contracts remain unchanged.
- Production-browser review exposed a separate interaction defect while closing Original brainstorm: restoring focus could move a focused Output 23–31 pixels under the header. Contextual sheets now record and restore the exact prior scroll position, and all sheet focus operations use `preventScroll`.
- Extended the Video browser contract to prove that Original brainstorm preserves scroll and focus across desktop, compact, and mobile. Increased that media-heavy test's own timeout to reflect three real video seek cycles rather than weakening its assertions.

### Verified

- Inspected the updated 1200×800 Brief with the website Style sheet, the desktop onboarding choice, and the Video before accepting only the intentional screenshot baselines. The new labels fit without clipping, reflow, or extra chrome.
- `pnpm --filter @workshoplm/web test` passed 30 tests; web and UI typechecks passed. The targeted three-width Video interaction passed after the scroll restoration repair.
- The complete production-browser suite passed all 29 cases in one run, covering reset and completed fixtures, empty first use, website Style, Map, Sources, Brief, Outputs, image replacement, Storyboard, Video, source trace, focus containment, reduced motion, contrast, logical zoom, and desktop/compact/mobile behavior.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages, including 120 worker tests. `pnpm demo:e2e` passed the complete recorded Source-to-render seam.
- Rebuilt the canonical sixteen-screen UI gallery from the accepted baselines; its shareable ZIP now hashes to `a0424b875ac8211d73a32ea824e44384a107b1232faa047be49db025ca6657ec`. `pnpm submission:packet:verify` passed with the refreshed gallery, current Terra/Image 2/Cedar evidence, eight ready and two honestly blocked film shots, and the unchanged four founder/final-package slots.
- No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no dollar debit is inferred.

### Decisions

- `Sourced` is the honest professional label for a factual statement with a durable Source edge. `Verified` is reserved for evidence ledgers and checks that actually establish a specific technical fact.
- A sheet is contextual, so opening and closing it must preserve both the originating control and the user's exact place in the underlying object.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- The final founder Source, founder-derived ready package, public film, human taste review, intended-audience deck review, `/feedback`, release, Devpost publication, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 10:45 CT — Current workbench reaches the Cedar film again

**Area:** Demo capture / success-notice UX / editorial film / judge evidence

### Changed

- Re-ran the canonical twelve-beat fixture recorder after the source-truth language pass so the film no longer depended on older `Verified` UI. The first attempt exposed a genuine product defect: the `Outputs created` success notice never expired and intercepted the next claim-level `Show source` action for the full 30-second browser timeout.
- Added a four-second lifetime for status notices while keeping errors persistent and manually dismissible. The production browser contract now proves a success notice is initially readable, does not cover the primary PowerPoint action, and then leaves automatically.
- Recaptured the complete Map → Source → edit → Brief → Style → Outputs → exact source → Storyboard edit → approval → local render → original reveal sequence. The new 51.84-second VP8 fixture has SHA-256 `dd4d16741171be56cbdd34372d4f6485a28cedb28a04c6947100918256c6b3fd`, twelve bounded beats, and the expected final gates: Brief approved, Storyboard approved, Video rendered, one Source, two rendered text Outputs, six planned fixture images, and five Storyboard panels.
- Rebuilt the 2:20 editorial rough cut from the current capture while reusing the existing ten hash-bound OpenAI Cedar clips. The refreshed H.264/AAC film hashes to `273498a8d6de86975e9e22529d8026a9a7d3c1fba0d3e55a3654c309f218b666`; the contact sheet hashes to `c658fbb610009b65f1be557d342c503e367bec597abdf4214b97c819d607f7e0`.
- Reconciled GOAL, demo-script, evidence-audit, film-plan, capture, and rough-cut manifests to the new duration and hashes. Founder capture and final meta-reveal remain the only blocked film shots.

### Verified

- Visually inspected the new twelve-beat capture contact sheet and ten-shot rough-cut contact sheet. `Sourced claim`, `Sources behind this brief`, current Style, current Outputs, the exact Source sheet, both approvals, provider-backed imagery, and the original reveal are legible and free of retired tabs or terminology.
- `pnpm demo:film:verify` passed the 140-second draft with ten shots, 302 narration words, eight ready shots, two honestly blocked shots, and exactly four missing founder/final-package evidence items.
- FFprobe confirmed 1280×720 H.264 video, 48 kHz AAC audio, and 140.021333 seconds. `blackdetect` found no black interval. `freezedetect=n=0.0001:d=3` found only the intentional 3.03-second tail on the founder placeholder. Audio remains -22.9 LUFS integrated, 4.4 LU range, -2.9 dBFS true peak, with only 1.805- and 1.799-second quiet transitions at the 1.8-second diagnostic threshold.
- `pnpm --filter @workshoplm/web test:visual` passed all 29 production-browser cases in one run, including the new expiring-notice contract. `pnpm check` passed all thirteen packages with 120 worker tests, and `pnpm demo:e2e` passed the complete recorded Source-to-render seam.
- `pnpm submission:packet:verify` passed with the refreshed Cedar rough cut, current Terra/Image 2 evidence, current sixteen-screen gallery, eight ready/two blocked shots, and four unresolved founder/final-package slots.
- No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no dollar debit is inferred.

### Decisions

- Success feedback must be readable but transient. A notice that blocks the next action is not calm confirmation; it is accidental navigation.
- The judge film must be regenerated when visible product language changes materially, even when the underlying workflow and narration have not changed.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, human film taste review, intended-audience deck review, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 12:08 CT — The no-credential judge Workshop receives exact provider imagery

**Area:** Provider evidence / judge fixture / demo capture / submission truth

### Changed

- Ran one sanitized six-request GPT Image 2 batch for the optional judge Workshop, inspected every panel, and accepted a coherent black, white, and blue folded-paper family spanning the hero, systems diagram, evidence chain, decision visual, Storyboard sequence, and section art.
- Added a hash-bound provider-image fixture with model, quality, size, reference, request ID, generation time, and SHA-256 provenance. The recorded acceptance path validates those records and exact bytes, copies them into its isolated data root, persists them as generated image versions, binds the hero to the Presentation and five current images to the Storyboard, and renders the approved Video locally without credentials or paid replay calls.
- Updated the production fixture recorder to apply the exact sanitized Style, create and approve its Visual DNA, seed the reviewed provider files after Output creation, and require real imagery before capture. The refreshed screen recording and rough cut now show the image-backed Presentation and Storyboard instead of planned placeholders.
- Tightened the submission-packet verifier so it rejects a missing image, hash mismatch, non-GPT-Image provenance, wrong request count, or a rough-cut disclosure that regresses to planned panels.
- Reconciled `GOAL.md`, the README, demo script, evidence audit, film plan, and capture manifests to the new truth boundary. `PLAN-2026-07-13.md` remained untouched and excluded from this milestone.

### Verified

- The six checked-in PNGs match their manifest: `489e9a5da001b15823baab8e5dc3ef771a61a94ef3ae6ecc1af6cc1b97c83ed3`, `ba9137bb4160e4215e177614c3465be78db4a9f2338e304b185726fe044117e5`, `7b7440bf3cfada93dad0e7cf0488fc61ebbd367dfd96dceb53c1e65a634c549c`, `99b13f3ad39020dce620cd958c4a6adf5da80408d59581209f28e262f1845cb4`, `687c16e036b7a40b47fbf7f4a72d276a847a593eb27bc53cd295990adfdf7515`, and `0dfdcc782c4924c67482d8a890cc6350427e91f99680f3331f30c3208b8eb7af`.
- `pnpm demo:e2e` passed after the implementation and again as the final acceptance run. It reported six generated provider-fixture panels, a current image-bound Presentation, five image-version Storyboard bindings, and a rendered Video with `imageMode: hash-bound-provider-fixture`.
- `pnpm demo:capture-draft` passed a 58.8-second twelve-beat production capture with SHA-256 `0664ea8ccd365ab63475dce2410a90084f6dbc32c734be93a1180b7375c45f4a`. Visual inspection accepted its contact sheet (`efcbfedbb3c3f275c5eae5690e15d67889a6e206073a09299fa2f27785f18f6f`) and original-brainstorm reveal (`614277c74b4a071d68454d65a4da22ad84532c5fa0c37c10f7867af5187d6fac`).
- The rebuilt 140.021333-second H.264/AAC rough cut hashes to `4280adfd66ae8e723cf8b9e83a03b1bec008cf6b8671e5e1b3a79f2630f72ba4`; its inspected contact sheet hashes to `15f383a5aab6a46d62a04c39c89048c8b5762f814c1b90fbade73feb7e3b8917`.
- `pnpm demo:film:verify` passed with eight ready shots and the two honestly blocked founder/final-package shots. `pnpm submission:packet:verify` passed and reported six provider-backed judge images with zero paid replay calls.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages, including 30 web tests and 120 worker tests.
- A live `pnpm judge:start` smoke run on port 3113 returned HTTP 200 for the page, Workshop API, and first image route. The API exposed all six generated `gpt-image-2` panels, the exact Presentation hero dependency, five current Storyboard image edges, and the rendered Video; the served first PNG retained its exact 1024×1024 dimensions and manifest hash.
- The evidence ledger is now 104 OpenAI HTTP operations: the prior 98 plus these six image requests. Exact dollar debit was not returned; the recorded request shape remains safely below the authorized $50 ceiling.

### Decisions

- The optional judge surface should visibly prove provider output quality without requiring a judge credential or silently spending money. Exact reviewed provider bytes plus immutable provenance are the smallest honest bridge between those requirements.
- The fixture is a deterministic replay, not a claim that GPT Image 2 runs during `pnpm judge:start`. Product and submission copy disclose that boundary directly.
- No additional speculative feature or provider request outranks replacing the sample Source with the founder brainstorm and producing the final audience-reviewed Output set.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, human film taste review, intended-audience deck review, uncoached professional tests, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 14:29 CT — Log-order correction

- The complete `14:28 CT — The final reveal visibly proves its build record` milestone was appended using an ambiguous repeated anchor and therefore appears earlier in this append-only file than the 13:10, 13:20, 13:42, and 14:21 entries that were already present.
- No historical entry was moved or rewritten. Treat the entry's explicit 14:28 timestamp as authoritative and this correction as the chronological tail marker.

---

## 2026-07-16 14:28 CT — The final reveal visibly proves its build record

**Area:** Judge film / meta-demo / provenance / final-package integrity

### Changed

- Audited the current 2:20 rough cut, ten midpoint frames, clean final overlay, and meta-reveal layout against the judge-visible send-it bar. The product sequence and Cedar edit remain strong, but the final frame said `traced body of work` while showing only the brainstorm and three Output thumbnails.
- Bound the meta-reveal directly to the final submission manifest and `BUILD-TRACE.json`. The compositor now derives and displays the actual connected Output count, source-linked claim count, two recorded sign-offs, and hashed asset count. It does not carry acceptance numbers into the founder build.
- Added `build-record` to the film's required-moment contract. A plan that drops the visible provenance proof now fails verification even if the narration still mentions it.
- Preserved the existing 140-second, ten-shot edit. This improvement adds no navigation, shot, provider request, runtime, or unsupported claim.

### Verified

- Rebuilt and visually inspected the 1280×720 final-style preview. The final frame now reads `7 Outputs · 6 source-linked claims · 2 sign-offs · 24 hashed assets`, all derived from the rebuilt acceptance package. The text is legible, subordinate to the original → submission transformation, and contained inside the finished-work frame. Its SHA-256 is `cb2797d772dd056742bc828e446e38bee48254e1fc968fa5b3564421ccfc97bc`.
- The complete ten-frame clean overlay preview remains coherent and hashes to `200377b4829a46a2e66c14b490674f1d0a990afd75ef7a74e0725119504918ed`; its representative first frame hashes to `990befc347ffbd679db8e21ef9033800df0a13d21c89a07189fef29735c59505`.
- `pnpm demo:film:verify` passes the 140-second plan at 129.4 narration words per minute, keeps eight shots ready, and reports only the same honest two blocked shots plus the final export. `pnpm check` passes all thirteen packages, including 30 web tests and 120 worker tests. `pnpm submission:packet:verify` remains green with Terra, six provider-backed images, five Cedar product clips, sixteen UI screenshots, and four unresolved founder slots.
- No OpenAI request ran. The provider-operation ledger remains at 104 and exact dollar debit remains unavailable from response metadata.

### Decisions

- The meta-reveal must show the provenance claim, not merely say it. One compact manifest-derived proof strip is more persuasive than adding another technical screen or extending the film.
- Final numbers are render-time evidence. Hard-coded acceptance counts would make the founder reveal visually polished but potentially false.
- The two approvals remain the visible human-control story; raw implementation evidence stays inside the linked build record rather than crowding the final frame.
- `PLAN-2026-07-13.md` remained advisory only for enduring acceptance principles. Its pre-existing user modification was untouched and excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, human film taste review, intended-audience deck review, uncoached professional tests, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 13:41 CT — Image replacements preserve the last good visual and exact history

**Area:** GPT Image 2 revision control / artifact integrity / progressive disclosure / responsive UX

### Changed

- Audited selective image replacement against the immutable Storyboard and Video contracts. The service incremented a panel version but reused the old path while pending, then overwrote the only state record when the replacement completed; the artifact route also hid the last generated image as soon as replacement was requested.
- Added backward-compatible per-panel image history. Starting a replacement archives the generated version's prompt, revision request, evidence, path, SHA-256, and provider provenance exactly once before incrementing the panel.
- Kept the last good image visible while replacement is pending. The canonical panel route continues to serve the existing bytes until a validated provider result advances it; version-specific `image-panel-N-vM` routes resolve current or archived versions independently.
- Extended the existing `Replace image` sheet with one quiet `Version history` section using the locked official Card, ButtonLink, ListGroup, ListRow, and ListRowAction primitives. A professional can preview and open an earlier image without changing the active version or entering another navigation mode.
- Replaced internal `Current` copy in the new surface with the clearer `Latest`. The browser copy audit now waits for the stable Sources rail so a fast production run cannot accidentally snapshot the loading shell.

### Verified

- `pnpm check` passed lint, typecheck, and tests across all thirteen packages. The worker suite passed all 120 tests and the web suite passed all 30 tests.
- The replacement regression proves Version 1 is archived, the default route still returns Version 1 while Version 2 is pending, Version 2 becomes canonical only after recording validated bytes, and the exact Version 1 route remains available afterward.
- Rebuilt the production browser artifact from current source, force-refreshed the three affected baselines, and ran the complete production-browser suite: all 30 cases passed in 1.3 minutes. The image case proves latest and earlier previews, exact historical URL, selective replacement, Source access, desktop and 390×844 layouts, and zero added navigation.
- Visually inspected the 1200×800 historical preview and 390×844 latest-version sheet. The Image set remains dominant on desktop, the sheet is calm and scannable, and mobile retains a single-column editing flow without horizontal overflow. `desktop-image-history.png` hashes to `b2f346a4350418dff15e5747de5b55502d92cd6000c585728916b138f0bb9401`; `desktop-image-replacement.png` to `4ce94c5d48c2be4d15266e54450c7056b71e3236ebc1b6d0caabc55be23fd779`; `mobile-image-replacement.png` to `c7c52b2c023946fcf2c7e10659fda95dfb9761d6799e5d396f10a70247c52028`.
- `pnpm demo:e2e` passed the complete recorded Source-to-Video seam. `pnpm submission:packet:verify` passed with Terra, six provider-backed GPT Image 2 panels, Cedar narration, sixteen current UI screens, eight ready film shots, two honest blocked shots, and four unchanged founder/final-package slots.
- No provider request ran. The evidence ledger remains at 104 OpenAI HTTP operations; exact dollar debit is still not inferred.

### Decisions

- A pending replacement is a request, not a reason to remove usable work. The last validated image remains visible until the new bytes pass the provider-media gate.
- Revision history belongs inside the contextual replacement sheet. It supports review and recovery without creating a tab, library, or separate image-management mode.
- Image provenance must follow the same immutable path-and-hash standard as Storyboard and Video provenance; a retained filename without a user-visible version route is insufficient.
- `PLAN-2026-07-13.md` was used only for enduring acceptance principles. Its pre-existing user modification remained untouched and excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, human film taste review, intended-audience deck review, uncoached professional tests, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 12:42 CT — Log sequence correction

The 12:41 CT judge-film Sketch entry was appended after an earlier repeated Open-items footer rather than after the already-existing 12:34 CT entry. Its evidence and timestamp are correct; this note preserves the append-only record instead of moving or rewriting history.

---

## 2026-07-16 12:41 CT — Sketch enters the judge-facing film seam

**Area:** Demo truth / film assembly / visual verification

### Changed

- Audited the refreshed capture against the actual rough-cut assembly and found that the new focused Sketch was present in raw footage but could still be omitted because the Outputs chapter preferred its external GPT Image 2 gallery evidence.
- Assigned the full `create-outputs` → `output-evidence` capture span to the Outputs chapter and added an explicit, shot-local `preferCapture` decision. The rough-cut builder now shows the integrated workbench for that chapter while retaining the provider image gallery and sanitized provider run as required evidence.
- Removed the reversed `video-render` → `output-evidence` span from the render chapter. That chapter now uses only the separately verified provider-narrated render it is meant to prove.
- Reconciled the current fixture duration and Output-set language across `GOAL.md`, the demo script, and the completion evidence audit.

### Verified

- Rebuilt the ten-shot Cedar rough cut. The 140.021333-second H.264/AAC file hashes to `b662b5913d160ac0dc52ec31d16d1babff6c951285a8aedce54ac60b4f81182d`; its contact sheet hashes to `a3cc99f2ea4eedeab37868f0a0621cd583bcd9c99192caebb0fabedb3f659ec9`.
- Extracted and visually inspected the judge-film frame at 85.2 seconds. It shows the real focused `Sketch`, `Download SVG`, `Open full size`, the hand-drawn styled artifact, Source count, and captured-fixture disclosure. The frame hashes to `d4fb1e9804b5c1dc2f8f9728703f2e0b4c44f3018025fb712e8f4c3b1ac2c660`.
- The rough-cut manifest records `sourceBeats: [create-outputs, output-evidence]` and the exact 12.608–18.289-second fixture span for the Outputs shot.
- `pnpm demo:film:verify` passed the 140-second, 302-word plan with the current 58.0-second capture, twelve referenced beats, eight ready shots, and two honest blocked shots.
- `pnpm submission:packet:verify` passed with Terra, six provider-backed GPT Image 2 panels, Cedar narration, the sixteen-screen UI gallery, zero paid judge-replay calls, and the unchanged four founder/final-package evidence slots.
- No provider request ran. The evidence ledger remains at 104 OpenAI HTTP operations, and no exact dollar debit is inferred.

### Decisions

- Judge-visible product integration outranks showing a provider asset in isolation when the same chapter still retains hash-bound provider evidence. Sketch is now visible as part of the actual professional workflow, not as an unconnected capability claim.
- Shot source selection is explicit and local. `preferCapture` is used only where a chapter must show the integrated workbench despite also carrying external media evidence.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, human film taste review, intended-audience deck review, uncoached professional tests, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

## 2026-07-16 10:51 CT — Current public main survives a clean-room judge run

**Area:** Distribution truth / clean installation / optional judge path

### Changed

- Cloned the public GitHub repository into a new isolated `/tmp/workshoplm-clean-current` checkout and confirmed its shallow `HEAD` was the current pushed `main`, commit `3d7221b194bccf639bbd0023c5f57820d0ec628b`.
- Rebuilt the deterministic acceptance Workshop, rendered a second local HyperFrames Video, regenerated its bound thumbnail, and launched the documented one-command judge route from that checkout. No source-repository artifact or local developer state was used to make the clean clone pass.
- Updated the current tracker to supersede the older clean-clone commit reference while retaining the still-open public Video, `/feedback`, Devpost, release, and logged-out link gates.

### Verified

- `pnpm install --frozen-lockfile` completed from the clean clone with the committed lockfile.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages, including all 120 worker tests.
- `pnpm demo:reset`, `pnpm demo:e2e`, `pnpm demo:render`, `pnpm demo:thumbnail`, and `pnpm submission:packet:verify` passed sequentially. The clean render produced a 2,109,433-byte H.264/AAC MP4 with SHA-256 `6e6206288b89724f1a32a044b22e07d85f1ebf4ecf2b114d617f25c69ffe6fc3`; the clean thumbnail hashed to `fceb6d2c279eacc4c5197bd2fb4261a8fc57052b06238c3cd75476f9437c04e3`.
- `pnpm judge:start` replayed the complete recorded seam before serving the exact acceptance data root. Port 3000 was already occupied, so Next selected 3001. Direct requests to `/` and `/api/workshop` both returned HTTP 200; the API exposed `WorkshopLM Build Week`, one Source, approved Brief, approved Storyboard, rendered Video, Presentation, and Infographic.
- The live server was stopped cleanly after the smoke test. No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no exact dollar debit is inferred.

### Decisions

- Clean-clone proof is tied to the exact current public commit, not inherited from an older passing checkout. This recheck covers the generated-copy, source-language, status-notice, recapture, and rough-cut milestones added after the prior proof.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, human film taste review, intended-audience deck review, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 11:29 CT — Voice provenance leaves the implementation vocabulary behind

**Area:** UI language / Source trust / responsive evidence / demo film

### Changed

- Audited the remaining visible provenance language after the broader UI simplification. Three implementation phrases still reached the exact surfaces judges will see: the seeded voice Source appeared as `Raw voice brainstorm` from `ChatGPT task`, its locator exposed the raw task timestamp, and the meta reveal said `Recorded fixture transcript` or `Sanitized source excerpt`.
- Unified voice-facing language across Sources, the Excalidraw Map, claim inspection, exact Source evidence, focused Output trails, and the original-brainstorm reveal. Voice material now appears as `Voice brainstorm` or `Founder brainstorm`; its origin is `Voice` or `Recording`; the reveal says `Voice transcript`; and the visible locator keeps only the useful position, such as `Voice brainstorm · chunk 04`.
- Preserved the exact original task/provider locator in persisted Source, claim, chunk, Storyboard, and build-trace provenance. This is a display-layer repair, not a provenance rewrite or weaker evidence model.
- Strengthened the focused-object return path. Pointer focus no longer causes the Original brainstorm trigger to move the Video before the sheet opens, focused output containers opt out of browser scroll anchoring, and close restoration reapplies the saved position after layout. The browser contract now checks the professional invariant: the return is within one line and the object title remains visibly aligned below the app header.
- Made the affected production-browser fixtures independently seedable instead of relying on earlier serial tests to have created the completed Workshop. Accepted source, evidence, Map, Style, focused Output, mobile, and original-reveal baselines now use the current professional language. The visual threshold remains bounded at 0.3% for desktop/compact and 0.6% for general mobile antialiasing; the existing 1.5% exception remains limited to media-heavy mobile Output previews.
- Rebuilt the canonical sixteen-screen gallery, twelve-beat browser capture, and 2:20 Cedar rough cut so judge evidence matches the product. The new fixture is 52.2 seconds with SHA-256 `69de3439f342a13f02d00bd671bd145230d65e0a9f50ca324e05d22adc214e56`; the rough cut hashes to `6d353cc1684510c94405721dd7056efd350d3fc9987c0b6388f495b66357f03a`.

### Verified

- Visually inspected the responsive Voice Source sheet, exact Source evidence, desktop/compact/mobile original reveal, the 12-beat capture contact sheet, the dedicated reveal frame, and the rebuilt ten-shot film contact sheet. The useful Source position remains legible; raw task/provider and fixture terminology do not appear; the focused Video title and actions remain visible after the sheet closes.
- The complete production-browser suite passed all 29 cases in one run. It covers the official Apps in ChatGPT component contract, reset and completed Workshops, voice capture, Conversation, Sources, exact evidence, Map, Brief, Style, Outputs, selective image replacement, Storyboard, local Video, original reveal, focus containment, reduced motion, contrast, logical zoom, desktop, compact, and mobile.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages, including 30 web tests and all 120 worker tests. `pnpm demo:e2e` passed the complete recorded Source-to-render seam.
- `pnpm demo:film:verify` passed the 140-second draft with 302 words, eight ready shots, two honestly blocked shots, and the same four founder/final-package evidence slots. `pnpm submission:packet:verify` passed with the current Terra, six GPT Image 2 panels, Cedar product/editorial narration, sixteen-screen gallery, and updated rough cut.
- The gallery ZIP hashes to `e3d6c86bbda89c94fdea6d2a3b940ef917443836642431281b9e2bc886e0ad40`; its contact sheet hashes to `36d7a5bd00f61a243a0c2bd04f894e7cbe88188223032dd18afce519326cd146`. The rough-cut contact sheet hashes to `c460f171494a83706dd9380fe3ad279ba4cb9f6e638454affd6fe4ff75c6cb8f`.
- No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no exact dollar debit is inferred.

### Decisions

- Professionals need the exact Source position, not transport or host implementation mechanics. Raw provenance remains inspectable in durable artifacts, while primary UI names the thing the professional understands.
- Visual regression checks should enforce visible composition and interaction invariants while tolerating bounded browser text antialiasing. They must not convert subpixel rendering noise into false product failures.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, human film taste review, intended-audience deck review, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 11:35 CT — Provider Outputs receive one cold send-it review

**Area:** Output quality / professional bar / scope truth

### Changed

- Performed a fresh cold review of the actual provider-backed Presentation Version 6, Infographic Version 4, six-panel GPT Image 2 set, and HyperFrames Video Version 4 composition rather than relying on fixture thumbnails or passing generators.
- Reconciled the result into the current goal: no additional renderer, prompt, or interface defect was found that justified another local change or paid request. The remaining content-depth test now points explicitly to the founder-derived Workshop and intended audience rather than the deliberately thin authorized sample.

### Verified

- Inspected `artifacts/live-review/presentation-v6/contact-sheet.png` at full resolution. The five-slide deck has clear hierarchy, varied title/insight/process/evidence/recommendation layouts, unobtrusive Source labels, and a coherent editable visual system.
- Inspected `artifacts/live-review/infographic-v4/infographic-v4.png` at full resolution. The one-page output preserves the complete approved idea, a visible Capture → Shape → Deliver sequence, quiet Source labels, and a scan-safe information hierarchy.
- Inspected `artifacts/live-review/gpt-image-2-contact-sheet.png` at full resolution. All six panels share the locked black/white/blue visual DNA while serving distinct professional roles: hero, system diagram, evidence flow, decision visual, storyboard sequence, and deliverable set.
- Inspected `artifacts/live-review/hyperframes-v4/contact-sheet.png` and its immutable evidence record. The 25.002667-second 1920×1080 H.264/AAC composition uses the approved five Storyboard panels, five unchanged Cedar clips, five current generated images, a calm local GSAP timeline, zero lint/layout errors, and 25/25 contrast checks.
- Inspected the canonical current-workbench contact sheet. The five-second test holds across onboarding, Map, exact Source, Brief, Style, Outputs, image revision, Storyboard, Video, original reveal, and compact Output states without a persistent tab maze.
- No provider request ran; the evidence ledger remains 98 OpenAI HTTP operations and no exact dollar debit is inferred.

### Decisions

- The provider image set clears the internal professional-use bar. The current motion composition clears the internal visual-coherence bar; leadership/social pacing and voice taste remain a human review boundary.
- The deck and infographic are credible, editable product proofs, but the authorized sample Source cannot honestly prove board-ready content depth. Adding unsupported detail would weaken WorkshopLM's source-truth promise.
- The next quality multiplier is the founder-derived Output set and a real intended-audience `Send` or concrete `Revise` judgment, not another speculative template or paid generation pass.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, human film taste review, intended-audience deck review, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 12:09 CT — Log sequence correction

The 12:08 CT provider-backed judge-fixture entry was added after the 10:45 CT entry but before the already-existing 10:51, 11:29, and 11:35 CT entries because its append patch matched an earlier repeated footer. Its evidence and timestamp are correct; this note preserves the append-only record rather than silently relocating it.

---

## 2026-07-16 12:34 CT — Hand-drawn Sketch becomes a real source-traced Output

**Area:** Whiteboard modes / progressive disclosure / responsive UX / provenance

### Changed

- Audited the locked Sketch requirement against the actual product and found a false-completion gap: service state and isolated tests existed, but professionals could not see, share, or regenerate the hand-drawn whiteboard mode anywhere in the workbench.
- Replaced the state-only object with a deterministic 1600×900 SVG artifact built from the approved semantic Map. It inherits the active Style's paper, ink, Accent, and heading type; preserves semantic Sourced, Derived, and Creative color; draws exact recorded graph edges; and records graph revision, Style version, claim IDs, file path, and SHA-256.
- Added Sketch to the standard `Create outputs` / `Update outputs` path and exposed it as one supporting card in Outputs. It opens in the existing focused-object pattern with a full artifact first, source claims second, `Download SVG` as the finishing action, and `Open full size` as a quiet secondary action. No tab, new editor, approval gate, or permanent navigation was added.
- Map edits, Source-scope changes, and Style changes now mark Sketch `Needs update` without deleting its bytes. The focused object offers `Update sketch`; the standard Output refresh also writes the next version. The approved semantic Map remains the only editing engine.
- Replaced the brittle numbered original-reveal claim with `Became a connected Output set`, then added Sketch to the exact deliverable list. This preserves the meta-demo's clarity as the package evolves.
- Fixed browser scroll anchoring discovered during visual review so opening Sketch from a lower gallery card always shows its object title. Contextual Source sheets still preserve the professional's later reading position.

### Verified

- The worker suite passed all 120 tests. The expanded Sketch test verifies the SVG file, 64-character hash, source claims, artifact resolution, version, approval state, and Map-driven staleness.
- The full production-browser suite passed all 30 cases after desktop and mobile Sketch proof was added. It verifies the served SVG's 1600-pixel natural width, source-trail region, download route, focused-entry scroll position, zero horizontal overflow, official component contracts, visible copy, and the unchanged broader Workshop path.
- Visually inspected the standalone six-idea SVG and the focused workbench at 1200×800 and 390×844. The desktop baseline hashes to `62afadd87227155fd076a3ea76b894eeabb7e58bf3add8509f2e9479aad3d00b`; the mobile baseline hashes to `2a93cd4689f405b3d60a34ec410936ac5b0453cf213c02eb0104dbfb429a013b`.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages, including 30 web tests and 120 worker tests.
- `pnpm demo:e2e` passed the full recorded Source-to-Video seam and now reports Sketch Version 1, six ideas, and `generated/sketch-v1.svg`; the current SVG hashes to `b6cf254a42d51107cf3b3e709b64051d5c9745fa5a45638c1585ac6945c2b510`.
- `pnpm submission:packet:verify` remains green with Terra, six provider-backed judge images, Cedar narration, the 2:20 rough film, the current UI gallery, eight ready shots, and two honest founder/final-package blocks.
- No provider request ran. The evidence ledger remains 104 OpenAI HTTP operations, and no exact dollar debit is inferred.

### Decisions

- Sketch belongs in Outputs as the shareable whiteboard view, not beside Map as a peer navigation mode. This satisfies the two-whiteboard promise while preserving the simplified object model.
- SVG is the right finishing format for this pass: it is local, deterministic, inspectable, infinitely scalable, and editable in common professional design tools without introducing a second in-product canvas engine.
- Hand-drawn character comes from bounded double strokes, slight deterministic rotation, and curved links; typography, spacing, palette, evidence semantics, and source truth remain professional and Style-controlled.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, human film taste review, intended-audience deck review, uncoached professional tests, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 12:43 CT — Log sequence correction

The 12:41 CT judge-film Sketch entry and its first 12:42 CT correction matched an earlier repeated footer rather than the true end of the append-only log. Their evidence and timestamps are correct; this note records their actual sequence after the 12:34 CT milestone without moving or rewriting prior entries.

---

## 2026-07-16 12:55 CT — Sketch versions become immutable professional history

**Area:** Output editability / version integrity / Workshop truth / judge evidence

### Changed

- Audited the complete professional finishing path instead of assuming the new Sketch satisfied the same version contract as Presentation, Infographic, Audio Overview, images, Storyboard, and Video. The audit found that Sketch Version 1 bytes remained on disk after regeneration, but state and routes exposed only the newest object.
- Added an additive `sketchHistory` state contract with backward-compatible normalization for existing Workshops. Regeneration now moves the prior record into immutable history, marks it honestly stale, and preserves its graph revision, Style version, Source claim IDs, artifact path, hash, and creation time.
- Extended artifact resolution to serve and download exact `sketch-vN` SVGs. The focused object reuses the existing Version history pattern, opens a prior Sketch without replacing current work, and retains the same source trail and finishing actions. No tab, new editor, or navigation mode was added.
- Corrected Workshop summaries to count Output families rather than every stored revision. Sketch, Audio Overview, Image set, Storyboard, and Video now participate alongside Presentation and Infographic, while repeated versions do not inflate the Workshop-list count.
- Replaced the canonical gallery's lower-value pre-generation image-plan frame with the focused hand-drawn Sketch. Visual inspection then caught a stale desktop original-reveal baseline that still said `six connected Outputs`; it was regenerated from the production route and now says `Became a connected Output set` with Sketch in the deliverable list.

### Verified

- The worker suite passed all 120 tests. The Sketch contract test creates Version 1, stales it through a Map edit, reapproves the Brief, creates Version 2, verifies the immutable Version 1 record and downloadable version-specific route, and confirms the Workshop summary counts two families—Storyboard and Sketch—not two Sketch revisions.
- The complete production-browser suite passed all 30 cases in 1.3 minutes. The expanded Sketch case proves desktop/mobile current views, Version 2 regeneration, visible history, Version 1 reopening, exact prior-version download URL, SVG response type, source trail, top-of-object entry, and zero horizontal overflow.
- Visually inspected the dedicated history state at 1200×800. The current styled artifact remains dominant, Sources follow it, and the two compact version rows sit below without crowding the object. The baseline hashes to `68456d21af9b894511b0300b3dbc3dd30858fe35871ce65c269d167285f15688`.
- Rebuilt and visually inspected the canonical sixteen-screen UI contact sheet. It now includes focused Sketch and current original-reveal copy; the contact sheet hashes to `5342126b42915edf99f0a5610db4d9b3950f579017b497dbca79559e7541cedf`, and the shareable ZIP hashes to `57de8a6131e71d97fc935ee9e68f6b083f2d5f9b58600a53833ef54310415da3`.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages. `pnpm demo:e2e` passed the complete recorded Source-to-Video seam with the source-traced Sketch. `pnpm submission:packet:verify` passed with Terra, six provider-backed GPT Image 2 panels, Cedar narration, sixteen current UI screens, eight ready film shots, two honest blocks, and four unchanged founder/final-package evidence slots.
- No provider request ran. The evidence ledger remains at 104 OpenAI HTTP operations, and no exact dollar debit is inferred.

### Decisions

- Persisted bytes are not version history unless the professional can identify, reopen, trace, and export them. Sketch now meets the same user-visible preservation bar as the other versioned Outputs.
- Workshop summaries describe distinct deliverables, not database rows. A regenerated Presentation or Sketch remains one Output family in the Workshop list.
- The canonical gallery should optimize for finished-work proof. Directed image replacement still demonstrates image control; the pre-generation image-plan screenshot was the least valuable frame to trade for Sketch.
- The partially stale, user-owned `PLAN-2026-07-13.md` modification remained untouched and excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, human film taste review, intended-audience deck review, uncoached professional tests, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 13:10 CT — Approved Storyboards preserve exact reviewed history

**Area:** Storyboard control / image-version integrity / Video provenance / progressive disclosure

### Changed

- Audited Storyboard and Video revision integrity after completing immutable Sketch history. Video already preserved immutable render versions, but Storyboard edits overwrote the reviewed object and a regenerated image could rebind new bytes without incrementing the Storyboard version.
- Added backward-compatible `storyboardHistory` persistence and an explicit per-version approval record. Storyboard generation, panel edits, and version-changing image rebinding now archive the prior object before creating a new unapproved version.
- Bound every generated Storyboard panel to its exact image relative path and SHA-256 in addition to image-panel ID and version. A version-specific artifact route now resolves the historical bytes instead of consulting the current image batch.
- Image replacement still revokes Storyboard approval, stales narration, blocks Video creation, and marks prior Videos `Needs update`. The completed replacement now also increments the Storyboard version, so the reviewed and replacement compositions cannot share an identity.
- Added one subordinate `Version history` section below the current Storyboard. Earlier versions open read-only in the existing official `SideSheet`, `CarouselRow`, `Card`, `ListGroup`, `ListRow`, `ListRowAction`, `Status`, and `Button` primitives. The sheet shows approval state, exact reviewed visual, narration, duration, and Source access without exposing edit or save actions.

### Verified

- The worker suite passed all 120 tests. Focused regressions prove that five initial image bindings can be approved, a replacement creates the next Storyboard version, the former approved version retains its Version 1 image path/hash, the version-specific route returns the original bytes, and a panel edit preserves the former approved title and narration.
- The complete production-browser suite passed all 30 cases in 1.3 minutes. It verifies the current exact image binding, visible Storyboard history, approved-version status, historical title and narration, version-specific image URL, absent save action, desktop/compact/mobile behavior, accessibility states, and the unchanged end-to-end workbench.
- Visually inspected the 1200×800 history state. The current Storyboard remains dominant, history is a quiet lower section, and the selected prior version stays focused inside the standard sheet. The accepted baseline is `apps/web/tests/visual/__screenshots__/desktop-storyboard-history.png`, SHA-256 `013a0d026b2d6a51d0e17ad26d88dfbb19cdc60e481fb3970979bc114eeac40e`.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages. `pnpm demo:e2e` passed the complete recorded Source-to-Video seam. `pnpm submission:packet:verify` passed with Terra, six provider-backed GPT Image 2 panels, Cedar narration, sixteen gallery screens, eight ready film shots, two honest blocks, and four unchanged founder/final-package slots.
- No provider request ran. The evidence ledger remains at 104 OpenAI HTTP operations; exact dollar debit is still not inferred.

### Decisions

- A Storyboard version is the reviewed production contract, not merely a mutable sequence number. Any new visual binding or narrative edit creates a distinct approval target.
- Historical Storyboards are recovery and provenance, not another navigation mode. They remain read-only and subordinate to the current editable Storyboard.
- Historical media must resolve from the path and hash stored on that Storyboard version. Resolving through the mutable current image batch would make the provenance claim false.
- `PLAN-2026-07-13.md` was treated only as enduring acceptance guidance. Its pre-existing user modification remained untouched and excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, human film taste review, intended-audience deck review, uncoached professional tests, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 13:20 CT — Storyboard timing becomes an editable production decision

**Area:** Storyboard editability / Video control / responsive UX / validation

### Changed

- Audited the product's `editable Storyboard` claim against the live interface. Panel title and narration were editable, but the persisted duration that directly controls narrated HyperFrames scene timing was visible only as a generated label.
- Added one official `Input` labeled `Seconds` to the existing focused panel. It sits with title and narration rather than creating a timing mode, advanced drawer, or separate control surface.
- Added matching client and service validation: duration must be a whole number from 1 to 120. Invalid timing stays local, explains the repair in one sentence, and disables `Save changes`; malformed direct requests fail closed in the worker service.
- A valid timing edit reuses the immutable Storyboard contract: it creates the next version, preserves the formerly approved duration in history, revokes Storyboard approval, marks narration and prior Videos `Needs update`, and makes approval the next action before another render.

### Verified

- The worker suite passed all 120 tests. The Storyboard edit regression now rejects zero and fractional timing before proving that a valid six-second edit preserves the earlier approved version and creates a new unapproved version.
- The complete production-browser suite passed all 30 cases in 1.3 minutes. The real Video-revision path rejects zero, enables and saves seven seconds, shows `7s` on the selected panel, revokes approval, and marks the existing Video `Needs update`.
- Visually inspected the active timing edit at 1200×800 and the restored current timing at 1024×768. The control fits the existing official field hierarchy, the primary canvas remains dominant, compact scrolling reveals the whole editor and Version history without horizontal overflow, and no new navigation appears. Desktop proof hashes to `f6fdd20e2a3aa33aa5453a8d98a525b4a97fbc8a823c2bb2c8d281be409721ba`; compact proof hashes to `f1e7dc38136d524734ab3d4658674edfaf4c716719a58f99623a41991d24f162`.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages. `pnpm demo:e2e` passed the complete recorded Source-to-Video seam. `pnpm submission:packet:verify` remains green with Terra, six provider-backed GPT Image 2 panels, Cedar narration, the 2:20 film plan, sixteen gallery screens, eight ready shots, and two honest founder/final-package blocks.
- No provider request ran. The evidence ledger remains at 104 OpenAI HTTP operations; exact dollar debit is still not inferred.

### Decisions

- Timing belongs beside the words and visual it controls. A dedicated timeline would add complexity without improving the current professional approval task.
- Whole seconds are the right initial contract for a short professional storyboard: easy to scan, deterministic for narration and local HyperFrames staging, and bounded against accidental multi-minute panels.
- `PLAN-2026-07-13.md` remained advisory only for enduring acceptance principles. Its pre-existing user modification was untouched and excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, human film taste review, intended-audience deck review, uncoached professional tests, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 13:42 CT — Log-order correction

- The complete `13:41 CT — Image replacements preserve the last good visual and exact history` milestone was appended using an ambiguous repeated anchor and therefore appears earlier in this append-only file than the 12:55, 13:10, and 13:20 entries that were already present.
- No historical entry was moved or rewritten. Treat the entry's explicit 13:41 timestamp as authoritative and this correction as the chronological tail marker.

---

## 2026-07-16 14:21 CT — The build record becomes judge-ready product proof

**Area:** Meta-demo / provenance / visual quality / browser determinism

### Changed

- Rebuilt the generated `How this was built` artifact around the full connected Output set instead of a technical inventory that stopped at Presentation and Infographic. The record now follows Capture → Shape → Deliver, shows the active Style, both deliberate sign-offs, every current Output's format/version/status/hash/source-linked claims, provider evidence, honest limitations, and a stable link to the exact versioned JSON trace.
- Added first-class trace coverage for Presentation, Infographic, Sketch, a complete generated Image set, the latest current Audio Overview or script, the current Storyboard, and the rendered Video. Partial work is not promoted: the Image set appears only when every panel has validated bytes and a hash.
- Reordered real build milestones by timestamp and filtered correction-only log entries so append-only log repairs remain honest without corrupting the judge-facing chronology. Commit and Codex task evidence remain available under progressive disclosure.
- Promoted `How this was built` to the primary action inside the existing Original brainstorm reveal, immediately after the elapsed before/after result and before the supporting Output list. No tab, route family, or persistent navigation was added.
- Added a fixture-only reset contract guarded by `WORKSHOPLM_SEEDED_FIXTURE=1`. Every production-browser test now starts from an isolated SQLite state, while tests that need a completed Workshop seed it explicitly. This removed the serial-suite state leakage that had made the reveal and visible-copy contracts depend on test order.

### Verified

- Visually inspected the generated build record at 1200×900 and 390×844. The accepted Style-derived desktop proof hashes to `6791f5d446d484b68df53afa8a810c2a0f35d675bc8314f49dd979c50fcea553`; mobile hashes to `fb2950311701c2dcc4ba73722f08d5ab1148c73f86a0e7aa89eace65ec77c795`.
- Visually inspected the Original brainstorm reveal at desktop, compact, and mobile widths. The reveal keeps the raw transcript and 102-second transformation visible while moving the provenance action above the fold. Snapshot hashes are `e98305fab3a0785e7ee4f7224c62b1e0fb378a811c0e4db2f272a88c1e6da7cc`, `2de827b8b77ccadcd9b49f83b1ecb3908f542245d3894cb083d31a34113ddc48`, and `7a3617a19b2ce2b93fce41433aad8c45977b724091c9dd1143f57b37bcb86cf3`.
- The complete production-browser suite passed all 30 cases in 1.4 minutes after three consecutive debugging passes established deterministic isolation. The final pass includes desktop, compact, mobile, local Video render, Original brainstorm reveal, official component contract, plain-copy snapshot, responsive states, and exact source trace.
- `pnpm check` passed lint, typecheck, and tests across all thirteen packages, including 30 web unit tests and 120 worker tests. `pnpm demo:e2e` passed the complete recorded Source-to-Video seam and verified all seven trace Output families plus the versioned JSON route. `pnpm submission:packet:verify` remains green with Terra, six provider-backed images, five Cedar product-narration clips, a 140.021-second film, sixteen UI screenshots, eight ready shots, two honest blocked shots, and four unresolved founder slots.
- No OpenAI request ran. The evidence ledger remains at 104 provider HTTP operations and exact dollar debit remains unreported by the provider responses.

### Decisions

- The strongest meta-demo proof is a product artifact, not a developer appendix. The primary story therefore leads with transformation, approvals, Outputs, and traceability; raw commit/task evidence remains available but collapsed.
- A generated Output is listed only when its current bytes and hash satisfy that Output family's integrity contract. This keeps the visible count meaningful instead of inflating it with planned or stale work.
- Visual tests must own their starting state. Test-order coupling is not an acceptable substitute for a fixture, especially when screenshots are used as judge-film evidence.
- `PLAN-2026-07-13.md` remained advisory only for enduring acceptance principles. Its pre-existing user modification was untouched and excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, human film taste review, intended-audience deck review, uncoached professional tests, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 14:30 CT — Log-order correction

- The complete `14:28 CT — The final reveal visibly proves its build record` milestone and its first `14:29 CT` correction were appended using ambiguous repeated anchors and therefore appear earlier in this append-only file than later entries that were already present.
- No historical entry was moved or rewritten. Treat the milestone's explicit 14:28 timestamp as authoritative and this correction as the chronological tail marker.

---

## 2026-07-16 14:39 CT — The clean judge-film treatment becomes a complete reviewable movie

**Area:** Judge film / editorial quality / evidence integrity / truthful fallback

### Changed

- Added `pnpm demo:film:sample`, a clean 2:20 editorial rehearsal that uses the final caption and motion treatment without weakening `pnpm demo:film:final`. It reuses the verified ten-shot OpenAI Cedar narration, the authorized sample transcript, the deterministic current walkthrough, the inspected provider-backed image and Video footage, and the acceptance submission package.
- The final beat is now generated inside the sample movie instead of existing only as a still preview. It is visibly labeled `AUTHORIZED SAMPLE · EDITORIAL CUT`, shows the sample transcript beside the finished-work thumbnails, and derives `7 Outputs · 6 source-linked claims · 2 sign-offs · 24 hashed assets` from the acceptance `BUILD-TRACE.json` and manifest at render time.
- Added `pnpm demo:film:verify-sample`. The verifier rejects a missing disclosure, changed Cedar identity, changed movie, missing H.264/AAC streams, a changed contact sheet or review frame, a changed acceptance manifest/build trace, fewer than ten shots, or any attempt to hide the two still-blocked final-evidence beats. The generated folder includes a concise README, movie, manifest, contact sheet, and one full-resolution review frame per shot.
- Bound the exact authorized sample transcript, acceptance manifest, and build trace into the sample-film manifest by SHA-256. Final mode continues to require the founder transcript and final-operator package and remains transactionally fail-closed.

### Verified

- `pnpm demo:film:sample` rendered `outputs/demo-film-sample/workshoplm-demo-sample.mp4`: 140.021333 seconds, 1280×720 H.264, 48 kHz AAC, SHA-256 `a880b39194a48e430d5ec83b04a4e15b0bb46c42ee30bb2eb5ca671378f7e09e`.
- `pnpm demo:film:verify-sample` passed all transcript, package, trace, narration, stream, movie, contact-sheet, ten-frame, and blocked-state integrity checks. The sample transcript hash is `a82500834d6cccaf325971623048633facc707c570f72a128c07c79662616519`; the acceptance manifest and build-trace hashes are `5c2a9cd874aee29e4dcc77b4231ba82376a4cb2ab6511443faa191501db80a79` and `3db2c7adc4837a645c00cdbc4d8a0c67386445746a975ea30b5f9e0cf87af77a`.
- Visually inspected the ten-shot contact sheet, the complete meta-reveal frame, and the Codex doorway at multiple points. The clean captions remain readable, the final trace is subordinate but legible, and the film no longer shows fixture-state banners. Objective `blackdetect`, `freezedetect`, and `silencedetect` found no black interval, freeze longer than 3.5 seconds, or silence longer than 2.5 seconds. Audio measures -22.9 LUFS integrated, 4.4 LU range, and -2.9 dB true peak.
- The ordinary draft verifier still reports exactly eight ready shots, two blocked shots, and four missing founder/final-export evidence items. `pnpm check` passed lint, typecheck, and tests across all thirteen packages, including 30 web tests and 120 worker tests. `pnpm submission:packet:verify` passed with Terra, six provider-backed images, five product Cedar clips, ten editorial Cedar clips, sixteen UI screenshots, and the two honest film blocks.
- The first `pnpm demo:film:verify` attempt hit a sandbox-only `tsx` IPC permission error. Running the same TypeScript entry through `node --import tsx` passed; no application or evidence failure was hidden.
- No OpenAI request ran. The evidence ledger remains at 104 provider HTTP operations and exact dollar debit remains unavailable from provider responses.

### Decisions

- A full clean rehearsal is materially stronger verification than a contact sheet alone, but it must remain visibly and structurally distinct from founder evidence. The sample mode therefore gets the final visual system and trace while preserving explicit sample language, two blocked states, and four limitations.
- The final compositor remains the only path allowed to write the public demo location or promote the film plan to final. Sample mode writes a separate Output root and cannot satisfy the final verifier.
- `PLAN-2026-07-13.md` remained advisory only for enduring acceptance principles. Its pre-existing user modification was untouched and excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, founder/target-audience film taste review, intended-audience deck review, uncoached professional tests, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- The existing Codex doorway footage proves the correct in-app-browser surface but foregrounds the Workshop more than the host conversation. If the founder recording permits, the final capture should make the one plugin invocation visually unmistakable without exposing private task content.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 14:42 CT — The real Codex doorway becomes unmistakable without fake host UI

**Area:** Judge film / host boundary / editorial clarity / evidence integrity

### Changed

- Added one compact clean-film cue over the existing privacy-safe Codex in-app-browser footage: `CODEX → WORKSHOPLM` and `Conversation opens the visual workbench`. It identifies the real transition that the underlying capture already proves without drawing a simulated chat, inventing a host control, adding another shot, or exposing private task content.
- Recorded `editorialCue: codex-to-workshoplm` on the exact doorway shot and made the sample-film verifier reject a clean cut that omits it. Sample and final modes share the cue; the diagnostic rough cut remains unchanged.

### Verified

- Rebuilt and visually inspected full-resolution doorway review frame `outputs/demo-film-sample/review/02.jpg`. The cue is immediately legible against the browser chrome, remains subordinate to the product, and does not collide with the existing bottom proof caption. Its SHA-256 is `260b77f5aa5be547b68d47b5b5e0d5025f5900bec61038d241105c3a8654a5cb`.
- `pnpm demo:film:verify-sample` passed with the required doorway cue, ten shots, ten hash-verified review frames, two retained final-evidence blocks, verified Cedar narration, and the same acceptance trace. The rebuilt 140.021333-second movie hashes to `e9247846803d3cbaa2d508a1a5b6da55a91e81a2dc7653e9045b28004a545aee`; this supersedes the pre-cue sample-film hash recorded in the prior append-only milestone.
- Repeated black, freeze-over-3.5-second, and silence-over-2.5-second detection found no events. No OpenAI request ran; the evidence ledger remains at 104 provider HTTP operations.

### Decisions

- An editorial label can clarify what truthful footage shows; it may not substitute for missing footage or fabricate product chrome. The cue therefore names only the already-proven relationship between the Codex host and the visual Workshop.
- The founder recording no longer needs to solve doorway comprehension. It remains responsible only for the honest founder brainstorm, transcript, and founder-derived final package.
- `PLAN-2026-07-13.md` remained advisory only for enduring acceptance principles. Its pre-existing user modification was untouched and excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, founder/target-audience film taste review, intended-audience deck review, uncoached professional tests, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 15:04 CT — The last internal UI language leaves the workbench

**Area:** Product language / accessibility / responsive UI / acceptance evidence

### Changed

- Renamed the visible and accessible right rail from `Production` to `Create`, matching the professional action already presented in the interface. Tool activity now identifies `Workshop` instead of `Plugin`, and the Excalidraw surface is announced simply as `Editable Map` rather than exposing its semantic implementation.
- Rewrote the original-brainstorm transformation from `Became a connected Output set` to `Became finished work` and the elapsed-time line from first `rendered Output` to first `finished Output`. The underlying evidence, Output history, and trace links are unchanged.
- Simplified the public claim-ledger label from `Editable semantic Map` to `Editable Map`. Updated the copy contract, recording selector, browser scenarios, and responsive reveal baselines so the old terms fail closed.
- Replaced one timing-sensitive header-coordinate assertion with the actual user contract: after the Original brainstorm sheet closes, the focused Video title must remain inside the viewport. Scroll restoration and full visual snapshots remain independently enforced.

### Verified

- Visually inspected the refreshed desktop and 390×844 Original brainstorm screens plus the quiet desktop Conversation surface. The before/after outcome is now immediately legible without production-system vocabulary, and the mobile sheet keeps the same hierarchy without horizontal overflow.
- The complete production-browser suite passed all 30 scenarios after focused regressions for the renamed rail, original reveal, and Video return path. `pnpm check` passed lint, typecheck, and tests across all thirteen packages, including 30 web tests and 120 worker tests.
- `pnpm demo:e2e` passed the complete recorded Source-to-Video seam. Because that reset correctly removed the derived submission package, `pnpm submission:packet:verify` initially failed on the missing manifest; a fresh `pnpm submission:build` plus `pnpm submission:verify` produced a valid, current, untampered 24-asset package. The clean sample film was rebound to the new acceptance-manifest and build-trace hashes, `pnpm demo:film:verify-sample` passed, and `pnpm submission:packet:verify` passed with Terra, six provider-backed images, Cedar narration, the generated meta-reveal, and the Codex doorway cue.
- No OpenAI request ran. The evidence ledger remains at 104 provider HTTP operations and exact dollar debit remains unavailable from provider responses.

### Decisions

- Primary UI language names the professional's action or outcome; implementation architecture remains available only in code and technical evidence. `Create`, `Workshop`, `Map`, and `finished work` are therefore the durable surface terms.
- Browser checks should assert what a professional can perceive and use. Exact subpixel overlap with a sticky header is not a stable contract when viewport visibility, scroll restoration, and screenshot review already prove the intended behavior.
- `PLAN-2026-07-13.md` remained advisory only for enduring acceptance principles. Its pre-existing user modification was untouched and excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, founder/target-audience film taste review, intended-audience deck review, uncoached professional tests, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 14:45 CT — Submission evidence now routes through the clean film

**Area:** Submission packet / public evidence / claim integrity / reviewer path

### Changed

- Promoted the verified clean authorized-sample movie to the canonical pre-founder review artifact in the public README, GOAL evidence links, demo handoff, claim ledger, and submission-packet verifier. The badge-heavy film remains available as the diagnostic evidence-state cut rather than the default thing a reviewer watches.
- Extended `pnpm submission:packet:verify` to require the clean cut's explicit sample/non-public disclosure, Cedar narration, ten shots, two final-evidence blocks, generated meta-reveal, Codex doorway cue, H.264/AAC streams, exact movie hash, ten review-frame hashes, acceptance-manifest hash, and build-trace hash. The packet reports the diagnostic rough cut separately instead of conflating the two purposes.
- Corrected the claim ledger's stale verification floor from 115 to 120 worker tests and from 29 to 30 production-browser scenarios. The web-test count remains 30.
- Rewrote the demo handoff around `pnpm demo:film:sample` plus `pnpm demo:film:verify-sample`; `pnpm demo:film:rough` is now documented only for inspecting fixture and pending-evidence banners.

### Verified

- `pnpm submission:packet:verify` passed and now reports `sample-editorial-cut`, 140.021333 seconds, Cedar, eight ready shots, two blocked shots, a generated meta-reveal, and `codex-to-workshoplm`, while retaining the 140.021333-second diagnostic rough cut as a separate record.
- `pnpm demo:film:verify-sample` passed the complete clean-film hash and truth boundary. `pnpm check` passed all thirteen packages, including 120 worker tests and 30 web tests. `git diff --check` passed.
- No OpenAI request ran. The evidence ledger remains at 104 provider HTTP operations and exact dollar debit remains unavailable from provider responses.

### Decisions

- A reviewer should encounter the most polished truthful artifact first. Diagnostic state labels remain valuable for builders, but they should not define the judge-facing experience once a clean, equally honest cut exists.
- The word `sample` remains visible in the movie, README, manifest, verifier, and claim ledger. Canonical pre-founder review status does not promote the cut to founder footage or the final public demo.
- `PLAN-2026-07-13.md` remained advisory only for enduring acceptance principles. Its pre-existing user modification was untouched and excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, founder/target-audience film taste review, intended-audience deck review, uncoached professional tests, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.

---

## 2026-07-16 15:06 CT — Log-order correction

- The complete `15:04 CT — The last internal UI language leaves the workbench` milestone was appended using an ambiguous repeated open-items anchor and therefore appears immediately before the already-present `14:45 CT` milestone rather than after it.
- No historical entry was moved or rewritten. Treat the milestone's explicit 15:04 timestamp as authoritative and this correction as the chronological tail marker.

---

## 2026-07-16 15:37 CT — The judge Workshop gets its real Cedar briefing

**Area:** OpenAI voice / grounded replay / responsive UI / submission evidence

### Changed

- Added a fail-closed judge-fixture seeder for the already verified 35.7-second `gpt-4o-mini-tts` Cedar Audio Overview. It rehashes the tracked WAV and requires the current Audio Overview ID, title, complete script, section copy, claim IDs, exact Source/chunk/locator edges, disclosure, model, voice, request ID, byte count, and duration to match before recording provider provenance in the sanitized Workshop.
- Proved the guard by attempting to reuse the artifact against the separate one-claim recording draft: the source/script mismatch was rejected, and that draft stayed on its honest fallback. The six-claim acceptance Workshop passes and exposes the exact `1,713,644`-byte WAV with SHA-256 `4929d08428849a07771f6264836389c1fb126ce75e80b99fa8a40d099f843a96`.
- Fixed a mobile flex-layout defect that collapsed native audio controls to zero height. The focused Audio Overview now keeps its player, 36-second duration, Cedar/AI-voice disclosure, and three editable source-linked sections visible at desktop and 390×844 widths.
- Extended packet verification to require the provider metadata, exact audio hash and bytes, its narration role in the package, and the absence of the former no-provider-speech limitation. Rebuilt the judge package from 24 to 25 verified assets and refreshed the clean sample film's generated `25 hashed assets` meta-reveal.

### Verified

- Inspected the actual acceptance Workshop at desktop and 390×844 in the production server. `GET /api/workshop/artifacts/audio-overview-v1` returned `200`; accepted captures are `artifacts/ui-review/judge-audio-overview-desktop-2026-07-16.png` and `artifacts/ui-review/judge-audio-overview-mobile-2026-07-16.png`.
- The complete production-browser suite passed 31/31 scenarios, including a new desktop/mobile Audio Overview regression that requires visible playback controls and fetches a real WAV route. `pnpm check` passed lint, typecheck, and tests across all thirteen packages, including 120 worker tests and 30 web tests.
- `pnpm demo:e2e` passed the complete Source-to-Video seam with `audio_ready` and `mode: hash-bound-provider-fixture`. `pnpm submission:build` produced 25 assets; `pnpm submission:verify` reported valid, current, and untampered. `pnpm demo:film:verify-sample` passed the rebuilt 140.021-second H.264/AAC movie with SHA-256 `5ac26ed6505b1402d83b33499c78cca36fa2c58f8663116fa26be6a30427d1d8`. `pnpm submission:packet:verify` passed and reports six provider-backed images, one provider-backed Cedar Audio Overview, and zero paid replay calls.
- `git diff --check` passed. No OpenAI request ran; the evidence ledger remains at 104 provider HTTP operations and exact dollar debit remains unavailable from provider responses.

### Decisions

- Provider artifacts may be replayed in the no-credential judge path only when content, grounding edges, provenance, and bytes all match. A nearby but semantically different Workshop must fail rather than inherit impressive-looking media.
- Audio Overview and Video narration remain separate evidence claims. The judge Audio Overview is provider-backed; the fixture Video narration remains explicitly disclosed as fallback audio.
- `PLAN-2026-07-13.md` remained advisory only for enduring principles. Its pre-existing user modification was untouched and will be excluded from staging.

### Open items

- Founder recording and transcript, founder-derived ready Output set, final compositor run, founder/target-audience film taste review, intended-audience deck review, uncoached professional tests, `/feedback`, release, public upload, Devpost submission, and logged-out link verification remain open.
- Codex Session ID: unavailable on this surface; not inferred.
