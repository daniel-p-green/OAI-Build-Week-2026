# WorkshopLM

> Turn raw thinking into professional knowledge work.

WorkshopLM is the professional knowledge workspace that turns conversations and source material into presentations, graphics, Audio Overviews, visual Maps, Storyboards, and Videos. Every expression shares the same knowledge, visual identity, and connection to its Sources.

Notebook-style tools help people learn from Sources. WorkshopLM helps professionals create from them through one compact path: **Capture → Map → Brief → Create**. Presentations, Graphics and Infographics, Audio Overviews, Maps and Sketches, image sets, Storyboards, and Videos are first-class expressions of the same Workshop; no single format is the destination.

WorkshopLM runs locally in the Codex in-app browser as one focused workbench. Conversation, Sources, Map, Brief, Style, created work, and Storyboard stay in one product surface; contextual views and sheets preserve the full workflow without a persistent tab maze. Codex desktop/CLI is the verified plugin host and build environment. ChatGPT Work support is not claimed.

## Start here

- [GOAL.md](GOAL.md) is the current product compass and execution queue.
- [DESIGN.md](DESIGN.md) is the current interface and visual-system contract.
- [log.md](log.md) is the append-only implementation and verification record.
- [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) records dependency licenses, design-reference attribution, generated-media provenance, and the final publication inventory gate.
- [PLAN-2026-07-13.md](PLAN-2026-07-13.md) is a dated architecture, safety, spike, and acceptance reference—not the active checklist. `GOAL.md`, current implementation evidence, and newer user direction take precedence.
- [docs/REPOSITORY-MAP.md](docs/REPOSITORY-MAP.md) distinguishes product source, current proof, dated review material, and local-only state.

## The professional path

```text
Capture → Map → Brief → Create
```

- **Capture** contains Conversation, voice, and Sources.
- **Map** auto-organizes hierarchy, evidence clusters, synthesis, direction, and a recommended path.
- **Brief** is the deliberately approved creation direction.
- **Create** contains Style and the connected professional work: Presentation, Graphic, Infographic, Audio Overview, Map or Sketch, Image set, Storyboard, and Video.

Two approvals carry visible consequence: `Approve brief` freezes the creative direction, and `Approve storyboard` authorizes Video. Source or Style changes preserve history while marking dependent work `Needs update`.

## Current, verified slice

The repository currently provides a local-first deterministic seam with:

- SQLite WAL state, hash-addressed local artifacts, and leased local jobs;
- normalized, locally searchable sanitized source fixtures and claim-level evidence in the recorded acceptance run;
- local ingestion for pasted notes, public URLs, and absolute PDF paths, plus a live `gpt-realtime-2.1` WebRTC conversation that searched and fetched exact Workshop Sources, persisted transcript and tool provenance, handled interruption, and completed an explicitly confirmed Brief approval;
- an editable, persisted Excalidraw Map with typed operations and versioned approvals;
- materialized `FRAME.md`, `DESIGN.md`, style-token, asset-plan, Presentation, Infographic, and editable Storyboard artifacts;
- independent brief and storyboard approval gates, stale propagation, retry, and queued-render cancellation;
- source-traceable Presentation and Infographic previews plus editable PowerPoint handoffs with claim locators and source notes;
- a playable, grounded Cedar Audio Overview plus a versioned local HyperFrames Video render with per-scene provenance for the approved sanitized Storyboard fixture, and an inspected provider-backed Video using five OpenAI Cedar narration clips;
- a unified `0.1.3` plugin whose stdio tools search and fetch grounded local evidence, route authorized workflow writes through the same loopback Workshop API, and declare Granola and Google Drive as optional host-provided source apps using the current plugin manifest contract;
- a responsive Apps in ChatGPT-aligned interface where one current expression is the focus and the rest of the Workshop remains one interaction away.

The final founder-authorized run proves a grounded `gpt-5.6-terra` Map, six accepted GPT Image 2 panels, a shareable connected package, OpenAI Cedar narration, and a local HyperFrames Video. Its project-brainstorm source uses a disclosed AI voice from an authorized script; it is not Daniel's voice and is not presented as Realtime capture. Live grounded Realtime behavior is proven separately. The no-credential fixture remains a deterministic judge path with sanitized replay assets, while native ChatGPT durable voice synchronization is not supported or claimed. See [GOAL.md](GOAL.md) for current state, [log.md](log.md) for dated evidence, and the [public claim ledger](submission/CLAIM-LEDGER.md) for proof boundaries.

The [final 2:39 public-demo master](outputs/demo-film-final/workshoplm-demo.mp4) uses the founder-authorized source, verified Cedar narration, the full Daniel-provided `Different Window` master as its beat skeleton, and the ready connected Workshop. `pnpm demo:film:verify-final` verifies all ten song-phrase sections, beat-grid timing, both media streams, decode, hashes, source/package binding, mixed-export intelligibility, and the under-three-minute limit.

The exact sanitized 30-asset package shown in that film is mirrored at [`outputs/final-submission-output-set/`](outputs/final-submission-output-set/). Its manifest is hash-identical to the promoted operator package and includes editable PowerPoints, rendered previews, Audio Overview, Storyboard, Video, thumbnails, evidence, and build trace without the private local database or provider credentials.

## Run the recorded fixture

Requirements: Node.js 22+ and pnpm 10+ (HyperFrames also needs its locally configured runtime).

```bash
pnpm install --frozen-lockfile
pnpm judge:start
```

`pnpm judge:start` recreates the no-credential acceptance Workshop and serves that exact data root in one command. It does not require OpenAI credentials or paid model calls. The fixture completes first-use onboarding, dismisses tutorial cues, and opens directly on the grounded Map. `pnpm demo:render` can independently rerun the approved sanitized fixture through the local HyperFrames worker, and `pnpm demo:thumbnail` builds a hash-bound 1280×720 product thumbnail from the rendered Video, locked film plan, and current created-work proof. Ordinary `pnpm dev` intentionally opens the default product workspace rather than the judge fixture.

After `pnpm judge:start` starts the server, open the printed local URL in the Codex in-app browser. The sanitized Workshop opens on its grounded Map; the same fixture includes the approved Brief, reusable Style, a source-traced hand-drawn Sketch, real Presentation and Infographic previews, editable PowerPoint files, six hash-bound GPT Image 2 visuals, a playable 29.25-second Cedar Audio Overview, an editable image-bound Storyboard, and the local Video rendered from those reviewed frames. Judges do not need OpenAI credentials or their own API spend to understand the recorded path.

Two paid routing benchmark passes compared Sol, Terra, and Luna on compact grounded-graph, brief, and claim-triage cases. Their recorded latency, token usage, and deterministic JSON/evidence checks selected `gpt-5.6-terra` at medium reasoning as the current product default. Any rerun remains explicitly spend-gated and must not infer dollar costs from token counts.

## Prepare the live demo run

`pnpm demo:live` builds a fresh, isolated operator Workshop under `.workshoplm/live-operator/`. It ingests sanitized Sources, captures a transcript through the documented fallback, approves the Brief, locks the official demo Style, and creates a traced Presentation, Infographic, image plan, Audio Overview, and Storyboard. The Storyboard remains ready for the second deliberate approval after the real image set exists. The default command is a no-spend preflight: it validates both image coherence and every grounded narration input, prints the exact provider request count, and makes no OpenAI call.

After explicit spend authorization, the same command uses `gpt-5.6-terra` at medium reasoning to build a claim-validated grounded Map, generates six GPT Image 2 panels concurrently, generates one `gpt-4o-mini-tts` Cedar WAV per approved Storyboard panel, and renders those clips through the local HyperFrames worker:

```bash
WORKSHOPLM_LIVE_OPENAI=1 WORKSHOPLM_MAX_PAID_REQUESTS=13 OPENAI_API_KEY=… pnpm demo:live -- --execute
WORKSHOPLM_DATA_ROOT="$PWD/.workshoplm/live-operator" pnpm dev
```

The live command fails closed when either opt-in flag or credential is absent. The GPT-5.6 Map rejects any node that cites a claim outside the active source scope and records the model, request ID, input claim IDs, and output hash. Every image and narration clip is likewise stored locally with model, request, version, and SHA-256 provenance. A partial image batch retains completed panels and marks only failed panels for retry.

After the reviewed founder command succeeds and its submission manifest is `ready`, promote that exact Workshop into the public-film candidate without mutating the paid operator state:

```bash
pnpm demo:capture-final
pnpm demo:film:final
pnpm demo:film:verify-final
pnpm submission:promote-founder
```

`demo:capture-final` copies the founder-authorized Workshop into a disposable recording root, records all twelve browser beats, and refuses fixture, private-Source, stale-approval, incomplete-package, or unrendered-Video state. Final film mode consumes that capture; the sample film continues to use the sanitized fixture capture. `submission:promote-founder` then verifies the operator run, package fingerprint, Source permission, capture binding, final-film hashes and streams, sub-three-minute duration, and final edit-readiness report before resolving the Devpost candidate. The verified public demo is [available on YouTube](https://youtu.be/gwi_q6X1i5g).

The inspected authorized-sample run is recorded in [`artifacts/live/provider-run.json`](artifacts/live/provider-run.json). Visual review artifacts include the [GPT Image 2 contact sheet](artifacts/live-review/gpt-image-2-contact-sheet.png), [HyperFrames Video review](artifacts/live-review/hyperframes-v4/README.md), and [Realtime grounded-conversation record](artifacts/live-review/realtime-grounded-conversation.json). These prove provider behavior without implying that the final founder Source or public submission is complete.

### Rebuild from an authorized project brainstorm

The source handoff validates a recording and transcript, keeps the Source private inside the isolated final Workshop, and prepares a no-spend review before any public-film staging. To use an authorized script with disclosed AI narration, add `--ai-narrated-source`:

```bash
pnpm demo:founder -- --founder-recording /absolute/path/project.mov --founder-transcript /absolute/path/project.txt --ai-narrated-source
```

Source material is private by default. The preflight prints `viewCommand` for local review, withholds the paid command, and does not copy the raw recording or transcript into the final film-input directory. WorkshopLM also refuses to build a public submission package while any active Source is private. Only continue when the media and transcript are intentionally part of the public meta-demo, using the exact `shareablePreflightCommand` printed after review. Its equivalent is:

```bash
pnpm demo:live -- --root .workshoplm/final-operator --founder-recording /absolute/path/project.mov --founder-transcript /absolute/path/project.txt --ai-narrated-source --share-founder-source --stage-film-inputs
```

`--share-founder-source` marks that local Source as shareable so it may appear in generated submission evidence and the build trace. `--stage-film-inputs` copies the validated recording and transcript into the Git-ignored local film-input directory. Neither flag uploads or publishes anything. Only the second preflight prints the paid follow-up command, preserving both choices.

The founder manifest separates source time from staging time. It uses embedded media creation time when available; otherwise it records filesystem modification time and labels that weaker evidence explicitly. `stagedAt` always records when WorkshopLM copied the validated evidence.

## Checks

```bash
pnpm check
pnpm demo:e2e
```

## Codex plugin install

The repository is also a public Codex marketplace. From a machine with the Codex CLI:

```bash
codex plugin marketplace add daniel-p-green/OAI-Build-Week-2026
codex plugin add workshoplm@workshoplm-local
```

Set the local data root before opening the Codex task that will use WorkshopLM, then restart or open a fresh task so the plugin tools inherit it:

```bash
export WORKSHOPLM_DATA_ROOT="/absolute/path/to/OAI-Build-Week-2026/.workshoplm/live-operator"
```

The plugin forwards only that explicit local path to its stdio server. It does not upload the Workshop, scan arbitrary folders, or assume an installed cache shares the source checkout. Run the fixture or live-operator preflight before trying grounded `search` and `fetch`.

Verified installation surface: Codex CLI/Desktop on macOS with the local in-app browser. Fresh Codex tasks have activated the bundled skill and called `workshop_list → search → fetch` against sanitized local evidence; the write-capable stdio tools and loopback service path pass isolated contract and end-to-end tests. The separately installed classic ChatGPT app exposes the legacy `Work with Apps` list, not a WorkshopLM or unified local-plugin surface, so ChatGPT Work support is not claimed. Refresh the installed plugin after a public update before testing new behavior.

## Architecture

```text
Capture sources → normalized evidence → grounded Map → approved brief
      → traceable created work → approved storyboard → local HyperFrames video
```

- `apps/web` — focused Map, Brief, created work, Storyboard, and source-evidence workspace.
- `apps/worker` — SQLite state, queue, artifact store, and render executor.
- `packages/domain` — schemas, approvals, dependencies, graph operations, and provenance contracts.
- `packages/plugin-mcp` — unified skill and stdio MCP entry point for grounded reads and version-gated local workflow writes.
- `packages/production` — traceable created-work renderers and exports.
- `spikes/` — deterministic evidence for host sync, grounding, image manifests, and HyperFrames.
- `.agents/plugins/marketplace.json` — public Codex marketplace descriptor for the unified plugin.

## Privacy and judging

The default fixture is sanitized and local. No account system, hosted storage, or connected third-party source is required to understand the recorded path. The eventual public demo video is the primary judge experience; the fixture makes that demo repeatable without requiring judges to spend API credits.

## Build evidence

The project is built in dated commits during Build Week. Product decisions and verification results are recorded append-only in [log.md](log.md). The current execution path is maintained in [GOAL.md](GOAL.md); the dated [PLAN-2026-07-13.md](PLAN-2026-07-13.md) remains useful for enduring architecture and acceptance principles, and the UI contract is [DESIGN.md](DESIGN.md).

## How we built it

Codex accelerated the implementation and verification of the monorepo, local SQLite state, MCP doorway, typed Map operations, browser workspace, deterministic fixture, and HyperFrames render path. The dated commits and `log.md` record that work and its command-level evidence.

Human decisions locked the product boundary: professional work rather than education, one focused WorkshopLM workbench in the Codex in-app browser, exactly two approval gates, local-first judging, privacy-safe sample data, and proportional public claims.

GPT-5.6 contributes through Codex during implementation and through WorkshopLM's runtime path. Two inspected Sol/Terra/Luna benchmark passes selected `gpt-5.6-terra` at medium reasoning for the grounded Map, and the authorized sample run records its request ID and output hash. The deterministic recorded fixture remains credential-free and does not claim paid runtime calls; the separate provider-backed run supplies that evidence.
