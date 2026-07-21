# WorkshopLM — Devpost review copy

This is the proposed public copy for Daniel's review. It does not change the live Devpost project.

## Project name

WorkshopLM

## Tagline

Turn one conversation into finished work—without losing the source.

## Category

Work & Productivity

## Project description

### Why I built it

Meetings aren't the problem. It's everything that happens after them.

The transcript, research, and decisions are all there, but someone still has to rebuild the same thinking as a deck, a graphic, an audio briefing, and sometimes a video. Each handoff loses context. The style drifts. A few revisions later, nobody can tell which sentence came from which source.

I built WorkshopLM because I wanted one conversation to become a body of finished work without losing the thinking behind it.

### What it does

WorkshopLM is a local-first workspace built around one path: **Capture → Map → Brief → Create.**

Start by talking, pasting notes, adding a website, or importing a document. GPT-5.6 turns that material into a visual Map that separates evidence, synthesis, and direction. Every grounded idea keeps a locator back to the exact source excerpt.

Approve the Brief, choose a Style, and WorkshopLM can create a presentation, infographic, image set, Audio Overview, Storyboard, and narrated Video from the same knowledge base. Presentations export as editable PowerPoint files. Storyboards stay editable panel by panel. Video renders locally with HyperFrames.

There are two deliberate sign-offs: the Brief before anything downstream is created, and the Storyboard before Video renders. If a source or decision changes, affected work moves to **Needs update** instead of quietly passing stale material forward.

The part I care about most is the source trail. Open a source link beside a claim, graphic, or Storyboard panel and WorkshopLM shows the supporting excerpt. Add a new meeting later and the Map can grow without erasing the earlier version.

### The hard part

Generating another asset wasn't the difficult part. The challenge was keeping every output connected to the same decisions, style, and evidence while still making the product feel simple.

That led to one semantic graph behind the Map and every downstream artifact, plus versioned approvals and provenance checks around the moments where a person should stay in control. WorkshopLM stores its state locally in SQLite, retrieves normalized source chunks with FTS5/BM25, and writes a provenance sidecar for rendered Video.

The judge fixture follows the same path with sanitized data and no account, connector, API key, or paid request.

### How I used Codex

I used Codex to build, test, and review WorkshopLM. `GOAL.md` held the product decisions and completion gates. `AGENTS.md` required evidence before a task could be called done, and `log.md` became the append-only build record.

Codex implemented the domain contracts, local persistence, graph engine, visual Map, Style system, renderers, job queue, HyperFrames worker, and the WorkshopLM plugin. It also red-teamed approval bypass, stale rendering, broken citations, and interrupted jobs.

One moment in the build captures the process well: an agent called the UI rebuild complete, another inspected the rendered styles, disproved the claim, and reopened the work. I left that correction in the log because it shows how I actually used Codex: as a build-and-review loop.

WorkshopLM also ships as a Codex plugin. Its `$workshoplm` skill and local MCP server let Codex search and fetch exact evidence from a Workshop.

### How I used GPT-5.6

GPT-5.6 worked at two levels. Codex on GPT-5.6 handled implementation, orchestration, review, and verification. Inside the product, `gpt-5.6-terra` turns grounded sources into the semantic Map shown in the demo.

I benchmarked Sol, Terra, and Luna on the real graph, brief, and triage operations instead of choosing by feel. All three passed the deterministic quality bar. Terra became the Map default after producing a valid structure in 2.8 seconds, compared with Sol's 6.8 seconds in the final comparable run.

The live provider run preserves the request, response hash, and model route. It generated six GPT Image 2 visuals, a grounded Cedar Audio Overview, and five Cedar Storyboard clips. The recorded judge fixture replays the sanitized media bytes by hash, so judges can inspect the complete experience without credentials or spend.

### Try it

```bash
pnpm install --frozen-lockfile
pnpm judge:start
```

That rebuilds the sanitized Workshop and serves the full Capture → Map → Brief → Create flow at the printed local URL. The verified platform is macOS with Codex desktop or CLI. The README includes the optional live-provider path and plugin installation.

## Judge access and testing instructions

The fastest path is the public demo video. To inspect the working product without credentials, clone the tagged release and run:

```bash
pnpm install --frozen-lockfile
pnpm judge:start
```

The command rebuilds and serves the sanitized acceptance Workshop. It requires no account, connector, API key, or paid request.

For the Codex plugin on macOS:

```bash
codex plugin marketplace add daniel-p-green/OAI-Build-Week-2026
codex plugin add workshoplm@workshoplm-local
```

Start a fresh Codex task and activate `$workshoplm` to search and fetch grounded Workshop evidence. The repository includes setup details, sample data, the build log, product goal, and claim ledger.

## Review-only launch values

- Thumbnail: `outputs/demo-film-highres/workshoplm-cover-devpost-3x2.png` (crop-safe Devpost derivative of the approved 16:9 cover)
- Repository: `https://github.com/daniel-p-green/OAI-Build-Week-2026`
- Submitter type: Individual
- Country: United States
- Category: Work & Productivity
- Codex `/feedback` Session ID: `019f5eb9-d996-7f42-ac5a-d4ed2cc8a324`
- Video URL: keep the current value until Daniel approves and publishes the replacement video

## Human-review gate

Before any Devpost update, Daniel reviews the exact tagline, description, thumbnail, judge instructions, and replacement public YouTube URL. No field in this file has been published automatically.
