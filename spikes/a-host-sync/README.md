# ChatGPT/Codex host-sync spike

This spike uses captured-shaped account/turn fixtures to prove the local persistence and privacy boundary without reading credentials or calling the host.

- Turns use stable `taskId:turnId:itemId` identity, durable atomic writes, restart reads, deterministic ordering, user/assistant attribution, and a one-task-to-one-Workshop guard.
- Account responses are recursively scanned for token-shaped values and sensitive field names before being mapped to an allow-listed browser DTO.
- `verify.ts` does **nothing live** unless both `WORKSHOPLM_HOST_SYNC_LIVE=1` and a disposable `WORKSHOPLM_HOST_TASK_ID` are provided. It writes a sanitized report with an explicit fallback decision. The app-server protocol lacks a guessed task-turn method here; until a task/voice subscription is observed and added, native voice sync is unproven and the report activates the capture-only Realtime fallback.

Run `pnpm --filter @workshoplm/spike-host-sync test` after workspace wiring. For an explicit local app-server probe: `WORKSHOPLM_HOST_SYNC_LIVE=1 WORKSHOPLM_HOST_TASK_ID=<disposable-task-id> pnpm --filter @workshoplm/spike-host-sync verify`.
