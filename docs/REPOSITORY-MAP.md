# Repository map

This repository contains product source, deterministic fixtures, and visual regression baselines. Generated review media, research screenshots, raw Sources, and publication packages stay outside Git.

## Authority

1. [`GOAL.md`](../GOAL.md) is the current product compass and execution queue.
2. [`DESIGN.md`](../DESIGN.md) is the current interface contract.
3. [`AGENTS.md`](../AGENTS.md) defines durable execution and verification rules.
4. [`log.md`](../log.md) is append-only historical evidence.
5. [`PLAN-2026-07-13.md`](../PLAN-2026-07-13.md) and `docs/planning/` are dated references. They do not override newer product truth.

## Product source

- `apps/web/` — local Workshop workbench and browser acceptance tests.
- `apps/worker/` — durable Workshop state, local jobs, provider adapters, and creation orchestration.
- `packages/domain/` — shared contracts and approval or staleness invariants.
- `packages/production/` — source-traceable renderers and editable exports.
- `packages/plugin-mcp/` — packaged Codex skill and local MCP doorway.
- `packages/ui/` — official Apps in ChatGPT primitive contract.
- `scripts/` — deterministic fixture, provider, rendering, and verification commands.
- `spikes/` — isolated integration probes retained as executable evidence.

## Versioned verification material

- `apps/web/tests/visual/__screenshots__/` — current production-browser regression baselines. These are product test fixtures, not marketing mockups.
- `fixtures/` — sanitized, licensed, or hash-bound inputs required for deterministic verification.

## Local-only state

The following remain Git-ignored and must not be treated as repository proof:

- `.workshoplm/` and `.workshoplm-*/` runtime databases, jobs, private Sources, and generated work;
- `node_modules/`, `.next/`, `.turbo/`, Playwright results, and local caches;
- `.env*` credentials;
- `outputs/` generated product, demo, capture, and review media;
- `artifacts/` provider reports, design explorations, and review exports;
- `research/screenshots/` visual references;
- `submission/` publication drafts and packages;
- founder recording and transcript inputs.

## Hygiene contract

Run:

```bash
pnpm repo:hygiene
```

The check fails when a cache, generated artifact, research screenshot, or publication-only path becomes tracked; when an active-document link breaks; when a required ignore boundary disappears; or when a tracked file exceeds the repository's 10 MiB review threshold. Git history preserves the Build Week development record without keeping generated media in the current tree.
