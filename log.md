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
