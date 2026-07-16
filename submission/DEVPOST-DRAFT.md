# WorkshopLM — Submission Packet

Working draft in submission-ready form. Every sentence maps to `submission/CLAIM-LEDGER.md`. Bracketed `[LIVE]` slots upgrade automatically once the authorized provider run and founder assets exist; each has fallback wording so the packet ships truthfully in either world. Final publication still requires the gate at the bottom.

---

## Devpost project name

WorkshopLM

## Tagline (under 200 characters)

Turn raw thinking into finished work. WorkshopLM turns meetings and documents into a branded, source-defensible deck, with every factual claim traced to its source.

## Category

Work & Productivity

## Built with

TypeScript, Node.js, Next.js, React, pnpm, Turborepo, SQLite (WAL + FTS5), Excalidraw, OpenAI Responses API (GPT-5.6 Sol/Terra/Luna), GPT Image 2, GPT-4o mini TTS, gpt-realtime, Codex (plugin, skills, MCP), HyperFrames, Playwright

---

## Project description

### The problem

Every consultant, strategist, and enablement lead lives the same Tuesday. The meeting happened. The documents exist. The thinking is real. And now someone has to turn all of it into a deck for leadership, on brand, defensible line by line, by Thursday. AI tools help you understand your material. Almost none of them help you ship it. The ones that generate slides can't tell you where a claim came from, don't know your brand, and hand you a finished artifact you can't edit. So professionals do what they've always done: rebuild everything by hand and hope nobody asks "where did that number come from?"

### What WorkshopLM does

WorkshopLM is a local-first production workspace that turns raw inputs into deliverables you can defend.

You talk and add sources. WorkshopLM turns them into an editable Map: your claims, decisions, and evidence as a live semantic whiteboard, each card carrying its exact source locator. You shape the Map, then approve it as the Brief. You point it at a website or your brand assets, review what it found, and lock a Style with your exact colors, fonts, and rules. Then one action creates the work: a presentation with an editable PowerPoint export, a supporting infographic, a coherent image set, and an editable storyboard. You review the storyboard panel by panel, approve it, and WorkshopLM renders a narrated video locally.

Two things make this different from every generate-a-deck tool:

**You stay in charge at exactly two moments.** Approve the Brief. Approve the Storyboard. Nothing expensive or final happens without your sign-off, and everything downstream honestly shows `Needs update` when your thinking changes upstream.

**Every claim keeps its receipt.** Click any factual statement in any output, in a slide, an infographic block, or a storyboard panel, and WorkshopLM opens the exact source excerpt it came from. Not a citations page. The sentence.

It's built for the weekly rhythm, not the one-off demo: add Monday's new meeting to an existing Workshop and the Map expands, dependent work flags itself, your saved Style carries over, and one reapproval produces the next deck version, traced to the new source, with the old version preserved in history.

### The product proof is its production record

Codex built WorkshopLM from a goal file. WorkshopLM then used the same provenance model on its own recorded submission fixture.

This project started as two files: a goal document and an operating agreement for autonomous agents. Codex, running on GPT-5.6, implemented the product from that goal file across the submission period, working through an evidence-gated checklist, verifying its own work, and appending every milestone to a public, append-only build log. The log even records the moment the system caught itself: one agent claimed the UI rebuild was complete, a second agent disproved the claim with computed-style evidence, reopened the checklist, and rebuilt it properly. That entry is in the repo, timestamped, unedited.

WorkshopLM currently preserves a traced, 18-asset partial Output set from sanitized sources through Sources, Map, approved Brief, Style, editable PowerPoint files, grounded Audio Overview script, Storyboard, and local Video, with hashes and per-scene provenance. `Show original` lets a reviewer walk from a finished fixture Output to the transcript excerpt that started it.

`[LIVE: The final Devpost copy, deck, thumbnail, Storyboard, narration, and public demo Video were produced and verified as one WorkshopLM Output set.]`
`[FALLBACK: The current recorded fixture proves the traced production model, but the final public submission was assembled from those verified outputs outside the product.]`

`[LIVE: The measured path from first transcript to first finished output in the recorded live run was {X minutes}.]`
`[FALLBACK: omit the sentence.]`

### How Codex was used

Codex is not a tool we used on this project. Codex is how this project happened.

- **Autonomous implementation from a goal file.** `GOAL.md` defines the objective, locked decisions, and an evidence-gated checklist. `AGENTS.md` defines the operating rules: verify before checking any box, log evidence with every milestone, escalate only for spend, credentials, and irreversible actions. Codex executed that loop across the monorepo: domain contracts, SQLite persistence, the typed graph engine, the Excalidraw Map, the Style system, renderers, the HyperFrames video worker, the plugin, and more than 4,700 lines of dated build log.
- **Agents verifying agents.** The build ran with an integrator plus isolated implementation lanes, a red-team pass attacking approval gates and stale propagation, and conformance tests that fail on any UI element not traceable to the verified Apps in ChatGPT component inventory. The self-correction event above is this system working.
- **A unified Codex plugin.** WorkshopLM ships as a Codex plugin: a `$workshoplm` skill, a bundled local MCP server exposing grounded `search` and `fetch` over the Workshop's evidence, and the local browser workspace as its doorway. A fresh Codex desktop task activated the installed skill, retrieved an exact grounded source excerpt with its verified claim and locator, and rendered the live Workshop in the in-app browser.

### How GPT-5.6 was used

Two layers, both evidenced.

**GPT-5.6 contributed through Codex.** The build used Codex on GPT-5.6 for implementation, orchestration, review, and verification. The dated commits, task history, and build log record the work; this is separate from the still-gated claim that WorkshopLM itself completed a paid GPT-5.6 API call.

`[LIVE: **GPT-5.6 runs the product.** In the verified live run, gpt-5.6-terra turned the grounded transcript and sources into the semantic Map on screen, with the request, response, and routing captured in the run's provenance record. Two nine-request benchmark passes measured Sol, Terra, and Luna on the product's real graph, brief, and triage operations. All variants cleared the deterministic quality bar; Terra became the grounded-Map default because it produced the valid structure in 2.8 seconds versus Sol's 6.8 seconds in the final comparable pass.]`
`[FALLBACK: **GPT-5.6 in the runtime.** WorkshopLM implements an operation-level GPT-5.6 routing policy (Sol for quality-critical graph reasoning, Terra for structured synthesis, Luna for repeatable triage) behind a spend-gated adapter, with a benchmark harness ready to set defaults from measured quality, latency, and cost.]`

### Under the hood

Local-first by design: SQLite in WAL mode, FTS5/BM25 retrieval over normalized evidence chunks, a workspace-owned artifact store, and a leased local job queue. One canonical semantic graph is the source of truth; the Map is an editable projection with typed, undoable operations. Style is layered (Brand Foundation, Intent Profile, versioned Visual DNA) and materializes as inspectable design tokens. Deterministic HTML/CSS renderers produce the presentation and infographic with editable PowerPoint exports. HyperFrames renders video locally; every render emits a provenance sidecar with per-scene claim, source, image, and narration hashes. Nothing requires hosting, an account system, or anyone's credentials except one OpenAI API key for live generation.

### Try it

The judge path needs no account, connector, credentials, or spend:

```
pnpm install
pnpm demo:reset && pnpm demo:e2e
pnpm dev
```

That runs the complete recorded seam (Sources → Map → Brief → Style → Outputs → Storyboard → rendered MP4) and opens the Workshop in your browser. The README covers the Codex plugin installation from the public marketplace snapshot and the optional live-provider path. The current build passes checks across 13 packages, the production-route browser suite, all six acceptance gates, and submission integrity verification. The final publication gate will pin a tagged judge release and preserve it through the winner announcement.

### Scope, honestly

`[LIVE: The live run generated the GPT Image 2 set and provider narration shown; the Realtime capture path persisted an inspected live microphone turn. ChatGPT Work invocation is not claimed; the verified plugin surface is Codex desktop and CLI.]`
`[FALLBACK: The recorded fixture uses a planned image set and disclosed placeholder-tone narration pending the authorized provider run; the Realtime capture boundary is implemented and tested but not yet live-verified. The verified plugin surface is Codex desktop and CLI, not ChatGPT Work.]`
Every public claim in this description is reconciled against the evidence ledger in the repository. Where the product knows less than certainty, it says so on screen too.

---

## Devpost form fields

| Field | Value |
| --- | --- |
| Submitter type | Individual |
| Country | United States |
| Category | Work & Productivity |
| Repository URL | https://github.com/daniel-p-green/OAI-Build-Week-2026 |
| Video URL | `[final public YouTube URL after logged-out verification]` |
| Codex /feedback Session ID | `[designated primary session ID; rationale logged in log.md]` |

## Judge access and testing instructions (form field)

WorkshopLM is a local-first Codex plugin and browser workspace. You can score it three ways, in increasing depth:

1. **Video (3 min):** the captured product flow, both approval gates, the plugin moment, and the source-to-submission provenance reveal.
2. **Recorded fixture (5 min, no credentials):** clone the repo at the tagged release, run `pnpm install && pnpm demo:reset && pnpm demo:e2e && pnpm dev`. Sanitized data, no account, no API key, no cost.
3. **Codex plugin (10 min):** `codex plugin marketplace add daniel-p-green/OAI-Build-Week-2026` then `codex plugin add workshoplm@workshoplm-local`. Activate `$workshoplm` in a fresh task to search and fetch grounded evidence, and open the local Workshop doorway. Verified platform: macOS with Codex desktop/CLI; Chrome-based in-app browser at 1200×800.

The append-only build log (`log.md`), goal file (`GOAL.md`), and claim ledger (`submission/CLAIM-LEDGER.md`) document the autonomous build and bound every public claim to direct evidence.

## Video narration spine (aligns with the 2:42 paper edit)

1. **Why (0:00–0:30):** the Tuesday problem; the promise: raw thinking to a deck you can defend.
2. **How (0:30–1:30):** live seam: sample voice brainstorm, Sources, Map organizing `[LIVE: on gpt-5.6-terra, on screen]`, edit a card, Approve brief, Style, Create outputs.
3. **What (1:30–2:25):** the deck with its receipt (click a claim, see the source sentence), storyboard edit, Approve storyboard, video renders, one Codex widget doorway moment.
4. **Reveal (2:25–2:42):** `Show original`: this submission was made by WorkshopLM from the founder's raw brainstorm, and Codex on GPT-5.6 built WorkshopLM from a goal file. Disclosure line: what Codex built, where GPT-5.6 ran, AI voice disclosed.

## Final publication gate (unchanged)

1. Re-run `pnpm check`, the browser suite, `pnpm demo:e2e`, `pnpm submission:verify`; refresh the counts.
2. Resolve every `[LIVE]`/`[FALLBACK]` pair from inspected artifacts; no bracket ships.
3. Verify title, thumbnail, and project name carry no Google or NotebookLM marks.
4. Record the Session ID, public YouTube URL, release tag, and logged-out link checks in `log.md`.
