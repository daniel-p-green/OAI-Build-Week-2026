# AGENTS.md

These instructions apply to every task in this project unless the user explicitly overrides them.

## Project context

- This project is being built for **OpenAI Build Week**.
- The exact Devpost category is **Work & Productivity**.
- Treat [GOAL.md](./GOAL.md) as the editable source of truth for the current objective, locked decisions, phase, and remaining work.
- Treat [research/hackathon/README.md](./research/hackathon/README.md) as the local routing page for rules, judging criteria, submission requirements, and build-week notes.
- The official rules at https://openai.devpost.com/rules remain authoritative if local notes or plugin output conflict.

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
- Keep third-party data, SDKs, APIs, media, fonts, logos, and brand assets properly authorized and licensed.
- Keep setup simple, deterministic, and testable from a clean environment.
- Record demo proof as the product develops. The final public YouTube video must be under three minutes and explain what was built, how Codex was used, and how GPT-5.6 was used.

## Engineering defaults

- Prefer the smallest maintainable implementation that solves the real problem.
- Read relevant code, callers, tests, and configuration before editing.
- Preserve unrelated user changes and avoid speculative refactors or features.
- Run the narrowest meaningful verification first, then broaden checks when shared behavior or risk warrants it.
- Surface skipped checks, failed verification, uncertainty, and remaining risk clearly.
