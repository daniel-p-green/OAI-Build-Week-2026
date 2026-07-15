# WorkshopLM completion evidence audit

Audit date: 2026-07-15 CT. This is a current-state audit, not a completion claim. Public wording is governed by `submission/CLAIM-LEDGER.md`.

| Requirement | Current evidence | Status |
| --- | --- | --- |
| Local Capture → Shape → Deliver seam | `pnpm demo:e2e` records grounded Sources, current planned image set, five-panel Storyboard, six gates, and MP4. | Proven locally |
| Editable Excalidraw Map | Production-route browser coverage directly edits bound text, moves a semantic node, persists size/position/title through typed history, and proves WorkshopLM Undo; responsive screenshots cover desktop, compact, and mobile review. | Proven locally |
| Brief, Style, Outputs, Storyboard, and stale state | Worker/domain tests and production-route browser runs are recorded in `log.md`; Outputs retain real previews, version history, freshness, and source coverage. | Proven locally |
| Current-storyboard video | HyperFrames worker generates a current five-panel MP4; `ffprobe` verified streams and duration. | Proven locally |
| Privacy-safe judge fixture | `demo:reset`, `demo:e2e`, `demo:render`, and `demo:thumbnail` need no credentials. | Proven locally |
| Local source retrieval | SQLite FTS5 indexes normalized chunk and linked claim text; worker and plugin search use BM25 ranking, while exact fetch remains bound to source and chunk IDs. The live fixture and refreshed installed plugin each retain three indexed sanitized chunks. | Proven locally |
| Public repository and setup | GitHub CLI recorded public `main`; README has fixture/plugin instructions. | Proven |
| Installed Codex skill, MCP grounding, and browser doorway | Codex desktop task `019f5eb9-d996-7f42-ac5a-d4ed2cc8a324` activated `$workshoplm`, called `workshop_list → search → fetch`, and returned exact chunk `chunk-seed-design`, verified claim `claim-seed-design-system`, and locator `Design · Map`; the root local doorway returned HTTP 200 and rendered the current Map in the Codex in-app browser with no new console errors. Installed and worktree tool hashes match after refresh. | Proven on Codex desktop, read-only |
| Realtime capture boundary | Server-minted ephemeral-secret route, capture-only session configuration, transcript reducer, durable provenance, and fail-closed behavior pass tests. | Implemented; live microphone turn open |
| Native ChatGPT task/voice sync | Capture-only Realtime is the final demo voice path; native task/account synchronization is unsupported and not claimed. | Closed as out of demo scope |
| GPT-5.6 runtime routing | Policy and spend-gated Sol/Terra/Luna benchmark exist; no paid result. | Open |
| GPT Image 2 coherent batch | Direct spike runner/manifest exists; no authorized live generation/evaluation. | Open |
| GPT-4o mini TTS narration | Local placeholder tones are disclosed; no provider TTS artifact/provenance. | Open |
| Fresh ChatGPT Work-surface plugin proof | Codex desktop skill/tool and local browser proof exists, but no Work-surface invocation or write-confirmation evidence exists. | Open |
| Original pre-code brainstorm | No authentic pre-code artifact found in the checkout. A new dated founder-brainstorm recording may serve as a truthful demo source, but cannot be described as pre-code evidence. | Open; cannot backfill |
| Recorded submission Output set | A 15-asset set has source locators, hashes, an input fingerprint, per-scene Video provenance, and immutable HTML/JSON build records; its manifest is explicitly `partial` because provider images, narration, and final public video are absent. | Proven partial |
| Public video and YouTube | Timed evidence-gated recording script, local render, and thumbnails exist; no final public recording/upload. | Open |
| Devpost form and `/feedback` Session ID | Draft copy exists; external form and session ID unavailable on this surface. | Open |
| Repository license | Root `LICENSE` contains MIT; public `main` was verified with GitHub CLI. | Proven |

## Completion decision

WorkshopLM is **not complete**. The local deterministic product, editable Map, versioned Outputs, Codex desktop plugin read/browser path, and evidence chain are substantial and verified. Provider-backed GPT-5.6 reasoning, image bytes, narration, one live Realtime microphone turn, ChatGPT Work proof, independent orientation reviews, the final public video, and submitted links remain open under `GOAL.md`.
