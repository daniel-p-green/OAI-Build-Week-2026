# Repository map

This repository contains product source, deterministic fixtures, inspected provider evidence, visual regression baselines, and temporary local work. Their roles are intentionally different.

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
- `scripts/` — deterministic fixture, provider, rendering, verification, and submission commands.
- `spikes/` — isolated integration probes retained as executable evidence.

## Proof and review material

- `apps/web/tests/visual/__screenshots__/` — current production-browser regression baselines. These are product test fixtures, not marketing mockups.
- `fixtures/` — sanitized, licensed, or hash-bound inputs required for deterministic verification.
- `artifacts/live/` — compact provider-run records.
- `artifacts/live-review/` — inspected provider and created-work evidence.
- `artifacts/spikes/` — sanitized integration reports; raw provider payloads and generated spike media stay ignored.
- `artifacts/ui-review/` and `artifacts/ui-concepts/` — dated design review and exploration, not current implementation authority.
- `outputs/demo-film-sample/` — verified sample editorial review cut. It is not the founder-derived final public Video.
- `outputs/demo-film-rough-cut/` and `outputs/demo-recording-draft/` — dated review evidence, not final submission proof.
- `outputs/dogfood-ai-collective-chapter-brief/` — external-workflow dogfood candidate and review packet.
- `submission/` — judge-facing drafts, claim boundaries, checklists, and machine-readable film plan.

## Local-only state

The following remain Git-ignored and must not be treated as repository proof:

- `.workshoplm/` and `.workshoplm-*/` runtime databases, jobs, private Sources, and generated work;
- `node_modules/`, `.next/`, `.turbo/`, Playwright results, and local caches;
- `.env*` credentials;
- founder recording and transcript inputs until explicitly sanitized and promoted;
- disposable capture previews unless deliberately reviewed and added as evidence.

## Hygiene contract

Run:

```bash
pnpm repo:hygiene
```

The check fails when a cache or runtime path becomes tracked, an active-document link breaks, a required ignore boundary disappears, or a newly tracked file exceeds the repository's 10 MiB review threshold. Existing evidence media remains intentional; rewriting Git history is outside routine hygiene work.
