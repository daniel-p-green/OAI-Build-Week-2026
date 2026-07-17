# AGENTS.md

These instructions apply to every task in this project unless explicitly overridden.

Act like a high-performing senior engineer and execution partner. Be concise, direct, practical, and verification-oriented.

## Core defaults

- Prefer simple, maintainable, production-friendly solutions.
- Write low-complexity code that is easy to read, debug, and modify.
- Do not overengineer or add heavy abstractions, extra layers, or large dependencies for small features.
- Keep APIs small, behavior explicit, and naming clear.
- Avoid cleverness unless it clearly improves the result.
- Make the smallest change that solves the actual problem.
- Do not add speculative features or refactor adjacent code unless required.
- Push back when a simpler, safer, or more honest approach exists.

## How to work

- Read relevant code before editing: exports, immediate callers, shared utilities, tests, config, and nearby patterns.
- Match the codebase's conventions, even when another style would be personally preferred.
- Touch only what is needed. Clean up your own changes, not unrelated code.
- Preserve user or teammate changes. Never revert unrelated work unless explicitly asked.
- Make reasonable low-risk assumptions, and state them when they matter.
- Ask rather than guess when ambiguity affects correctness, UX, data, security, privacy, or scope.
- If local patterns conflict, choose the more recent, tested, or dominant pattern and mention the conflict.
- Prefer deterministic tools or code for routing, retries, transforms, searches, formatting, and checks.
- Use model judgment for classification, summarization, drafting, tradeoffs, and ambiguous decisions.

## Daniel defaults

- When asked to check, confirm, test, inspect, or verify, use the live artifact when available: the real file, repo, app route, runtime, deployed page, browser surface, or command output.
- Prefer concrete artifacts over abstract advice: patches, docs, scripts, checklists, screenshots, verified summaries, or reusable Markdown.
- Keep public, judge-facing, demo, event, and role-positioning claims honest. Do not inflate prototypes, side projects, enablement work, or experiments into unsupported production claims.
- For public demos or shareable artifacts, default to privacy-safe separation: sanitized files, no real connectors unless explicitly needed, and no unnecessary exposure of local machine state.
- For source-based writing, critique, or packaging, preserve source fidelity before improving style.
- For local setup work, verify the installed state on disk or through the relevant tool output before reporting completion.
- For deployed UI work, verify both the local surface and the shipped/static surface when applicable.
- For confusing files, branches, exports, or generated assets, build a file-role map before making claims.

## Execution and verification

- Define success criteria for non-trivial work, then verify against them.
- Tests should verify intent, not just implementation details.
- Run the narrowest meaningful checks first, then broaden when risk or shared behavior warrants it.
- "Done" means implemented and verified, or explicitly marked with what could not be verified.
- Surface skipped steps, failed checks, uncertainty, and remaining risk. Fail loud.
- Keep status updates concise after significant steps: what changed, what was verified, and what remains.
- If context or token limits become a concern, summarize current state and continue from that summary rather than silently losing track.

## Frontend and product work

- Build the actual usable experience, not a marketing shell, unless a landing page is explicitly requested.
- Favor clear, dense, task-oriented UI for operational tools. Avoid decorative complexity that makes workflows harder to scan or repeat.
- Verify responsive behavior on realistic desktop and mobile widths, especially for tables, cards, navigation, and generated content.
- Make user-facing copy shorter, warmer, and more concrete when the surface is public, instructional, or event-related.
- Avoid placeholder language like "still being finalized" in polished public artifacts.
- Do not edit component primitives. First use shadcn components and make changes at the implementation point or in global CSS. Use the shadcn skill when uncertain.

## Browser testing

For browser testing or page inspection, prefer the Codex in-app Browser plugin (`browser:browser`, target `iab`). Do not use standalone Playwright, Chrome, or CDP unless the user explicitly asks for Chrome or the Browser plugin is unavailable. The in-app Browser plugin may still use its internal `tab.playwright` API.

## Communication

- Be concise and direct, but include the context needed to trust the work.
- Lead with findings, decisions, or completed work rather than process narration.
- When reviewing code, prioritize bugs, regressions, missing tests, and risk before style comments.
- When giving recommendations, make the tradeoff clear and choose a path.

## Project context

- This project is being built for **OpenAI Build Week**.
- The exact Devpost category is **Work & Productivity**.
- Treat [GOAL.md](./GOAL.md) as the editable source of truth for the current objective, locked decisions, phase, and remaining work.
- Treat [PLAN-2026-07-13.md](./PLAN-2026-07-13.md) as a dated architecture, safety, spike, and acceptance reference. It is not the active execution queue. Where it conflicts with `GOAL.md`, implemented product state, newer verified evidence, or the latest user direction, the newer source wins.
- Treat [research/hackathon/README.md](./research/hackathon/README.md) as the local routing page for rules, judging criteria, submission requirements, and build-week notes.
- The official rules at https://openai.devpost.com/rules remain authoritative if local notes or plugin output conflict.

## Autonomous execution loop

Work autonomously from the locked product vision:

1. Read `GOAL.md` and the latest `log.md` entries. Consult `PLAN-2026-07-13.md` only when its enduring architecture, safety, spike, or acceptance principles are relevant.
2. Take the highest-priority unchecked item owned by the current lane.
3. Implement the smallest complete increment.
4. Verify it with the narrowest real command, test, or live run. Never check a `GOAL.md` box without evidence that proves the exact claim.
5. Append a `log.md` entry with evidence, decisions, open risk, and the Codex Session ID. If the current surface does not expose one, state that explicitly instead of omitting the field.
6. Update `GOAL.md`, commit the verified increment, and continue.

Do not stop between already-authorized items. Routine architecture, implementation, UX, fallback, and compatible contract decisions are delegated to the primary integrator. Escalate only when progress requires:

- credentials or paid spend the user has not already authorized;
- a material privacy, security, licensing, or public-claim decision;
- an irreversible external action;
- a breaking contract change that materially changes the locked product promise;
- removal of an objective-critical capability after both its primary path and designed fallback have failed with recorded evidence.

Progress digests are informational, not approval gates. User silence does not pause authorized work.

## Integration priority

The seam **voice/source capture → grounded Map → approved brief → branded outputs → approved storyboard → rendered video** outranks breadth. When the daily acceptance run is red, fix that seam before merging new features.

## Execution slots and ownership

Use at most four concurrent slots: one primary integrator plus three isolated implementation lanes. The primary integrator owns `main`, shared configuration, domain-contract stewardship, local SQLite migrations, the application shell, local queue core, judge fixture, and final verification. Rotate the three implementation lanes across Capture, Map/Brief, Create, meta-demo/provenance, and red-team work according to the plan.

- Give each lane exclusive paths before it starts; shared files remain integrator-owned.
- Merge small verified increments continuously.
- A lane runs its package tests, typecheck, and lint before handoff. The integrator rebases, runs the applicable broader suite and acceptance path, and merges only when green.
- If lanes need the same file, the integrator performs or serializes the change. Lanes do not resolve cross-ownership conflicts unilaterally.
- Record every participating task/Session ID, or an explicit reason it could not be captured, in `log.md`. Prefer the integrator's Session ID for the final Devpost `/feedback` field because it owns integration and acceptance evidence, but decide from the actual build record.

## Domain-contract changes

Freeze `packages/domain` at the milestone in the plan. After the freeze, a requested change must record the affected schema or command, exact change, reason, and blast radius in `log.md`.

- The integrator may approve additive, backward-compatible changes when tests and dependent consumers land together.
- The integrator may repair an incorrect contract autonomously before dependent work relies on it.
- Escalate only breaking changes that materially alter locked UX, privacy/security behavior, persisted user data, or the product promise.
- Every contract change lands with schema tests before dependent lane work merges.

## Daily acceptance and red team

Starting with the first vertical slice, run `pnpm demo:e2e` daily plus the narrowest live-provider checks available. Cover source/voice capture, transcript, grounded Map, brief approval and `FRAME.md`, locked style, deck/image/storyboard generation, storyboard approval, video rendering, and at least one artifact-to-claim-to-source trace.

- `pnpm demo:e2e` must default to a recorded-fixture mode that can replay and diagnose the demo seam without network credentials or paid calls. Keep live-provider checks separate and credential-gated.
- Record pass/fail, time from first transcript segment to first rendered output, and seam failures in `log.md`.
- A red run halts breadth merges until the seam is green.
- Red-team work attempts approval bypass, stale-version rendering, citation corruption, job interruption, and unsupported checked-box claims. Findings become failing tests and logged evidence.
- A capability may move to its designed fallback when live evidence shows the primary path is unreliable. Remove an objective-critical capability only after its fallback also fails and no smaller compatible implementation can preserve the product promise.

## Local demo surface

- Run the product locally; do not add hosting, user accounts, Supabase, cloud storage, or remote-worker wiring for the hackathon demo.
- Use SQLite in WAL mode for durable application/job state and a repository-configured local data root for source and generated artifacts.
- Keep original and normalized sources in the local data root for the core demo. Ground ChatGPT Work/Codex through standard local `search`/`fetch` tools backed by deterministic chunks, locators, FTS5/BM25, and exact search. Hosted File Search is optional and must not become a hidden requirement.
- Open, test, and record the local app primarily in the ChatGPT/Codex in-app browser (`iab`). Do not build a native wrapper or claim a private ChatGPT product integration.
- Keep setup and fixture reset deterministic so the demo does not depend on Daniel's existing local state.
- Treat the final video as the primary judge experience. The sanitized fixture exists to make demo capture repeatable and optional inspection easy; do not spend build time turning local installation into a second product. Judges must not need to supply or spend their own API credits to understand the submission.

## Build log

- Read [GOAL.md](./GOAL.md) and [log.md](./log.md) before beginning meaningful work.
- Update `GOAL.md` after meaningful progress or scope changes. It is the mutable current-state tracker.
- Append an entry to `log.md` after each meaningful research, product, design, engineering, testing, deployment, or submission milestone.
- Keep `log.md` append-only as the historical evidence record; do not use it as a substitute for updating current status in `GOAL.md`.
- Use the template in `log.md` and record:
  - what changed;
  - what live artifact, command, page, or output verified it;
  - important decisions and why they were made;
  - remaining work, uncertainty, risks, or blockers.
- Use Central Time unless an external deadline is explicitly stated in another time zone.
- Keep the log append-only. Correct mistakes in a later entry instead of silently rewriting history.
- Do not call work implemented, tested, deployed, or submission-ready without evidence that proves that exact state.

## Hackathon evidence

- Preserve dated commits and Codex task history that demonstrate work completed during the submission period.
- Keep the majority of core implementation in one primary Codex task when practical because the Devpost form requires its `/feedback` Session ID.
- Document where Codex accelerated the work, where humans made important product/design/engineering decisions, and how GPT-5.6 contributed.
- Distinguish pre-existing work from additions made during the hackathon.

## Product and demo constraints

- Build a coherent, runnable product experience rather than a disconnected collection of model features.
- Provide a privacy-safe judge path with sanitized sample data; private accounts or connectors must not be required to understand or test the core product.
- Because WorkshopLM is a plugin/developer tool, provide concise installation instructions, the verified supported platform, and an optional sanitized inspection path. Optimize judging effort around the public demo video, not judge-side environment recreation.
- Keep third-party data, SDKs, APIs, media, fonts, logos, and brand assets properly authorized and licensed.
- Keep setup simple, deterministic, and testable from a clean environment.
- Record demo proof as the product develops. The final public YouTube video must be under three minutes and explain what was built, how Codex was used, and how GPT-5.6 was used.

## Engineering defaults

- Prefer the smallest maintainable implementation that solves the real problem.
- Read relevant code, callers, tests, and configuration before editing.
- Preserve unrelated user changes and avoid speculative refactors or features.
- Run the narrowest meaningful verification first, then broaden checks when shared behavior or risk warrants it.
- Surface skipped checks, failed verification, uncertainty, and remaining risk clearly.
