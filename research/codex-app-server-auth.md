# Codex app-server account and session boundary

Verified: 2026-07-13 CT

## Live runtime evidence

Installed runtime:

- binary: `/opt/homebrew/bin/codex`
- version observed: `codex-cli 0.144.1`
- login status observed: `Logged in using ChatGPT`

`codex app-server` supports stdio, Unix socket, and local WebSocket transports. Non-loopback WebSocket listeners require capability-token or signed-bearer-token transport authentication.

The generated v2 protocol schema exposes:

- `account/read`
- `account/login/start`
- `account/login/cancel`
- `account/logout`
- `account/updated`
- `account/login/completed`
- ChatGPT, device-code, and API-key login modes

`account/read` returns safe account state including account type and, for ChatGPT accounts, email and plan type. The response does not expose the stored access token.

The supported ChatGPT login flow returns an authorization URL and login ID. An external-token login variant is explicitly marked unstable/internal and must not be used.

## WorkshopLM decision

- WorkshopLM has no separate account database or login credentials.
- A server-side adapter talks to the local app-server control surface.
- Browser code receives only safe account display state.
- Codex owns ChatGPT token persistence and refresh.
- WorkshopLM never reads token files, serializes tokens to the browser, or stores tokens in SQLite.
- The app-server account session identifies the active local operator; Workshop data remains local.
- This account bridge does not automatically grant API access to every OpenAI endpoint. Image, TTS, Realtime fallback, and other direct API calls still require whatever project credential the live API adapter supports; the spike must keep account login and API entitlement as separate verified facts.

## Conversation/task boundary

The ChatGPT task is the product's Conversation surface. A live spike must determine the supported method for linking the current task to a Workshop and persisting native typed/voice-originated turns without duplication. Until that succeeds, no document may claim that native voice synchronization is implemented.
