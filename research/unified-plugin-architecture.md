# Unified plugin architecture

Verified: 2026-07-13 CT

## Current OpenAI product change

OpenAI changed the ChatGPT/Codex packaging model on July 9, 2026:

- the App Directory became the Plugin Directory;
- plugins are the primary discovery container across ChatGPT web/desktop, Work, and Codex;
- a plugin may package skills, apps, and app templates;
- apps remain the permissioned data/action integrations used by a plugin;
- a plugin may remain useful with skills alone when included apps are optional.

Official sources:

- [Plugins in ChatGPT and Codex](https://help.openai.com/en/articles/20001256-plugins-in-chatgpt-and-codex)
- [ChatGPT release notes — July 9, 2026](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)
- [ChatGPT app templates](https://help.openai.com/en/articles/20001247-chatgpt-app-templates)

## Live installed-package evidence

The current local OpenAI-maintained plugins use `.codex-plugin/plugin.json`, not the stale `.claude-plugin/plugin.json` convention described by an older generic plugin skill.

Relevant installed examples inspected:

- `data-analytics` packages `skills`, optional `apps`, a local `mcpServers` manifest, a stdio Node MCP server, and rich widget assets.
- `sales` packages many workflow skills plus app dependencies.
- `openai-developers` packages skills, a required OpenAI Platform app, and MCP servers.
- app-only listings package an `apps` manifest without workflow skills.

The Data Analytics shape is the closest precedent for WorkshopLM: guided workflow skills, optional source apps, a bundled local stdio tool/widget server, and rich artifacts.

## WorkshopLM decision

WorkshopLM is a unified plugin with two coordinated surfaces:

1. **Native plugin layer** — WorkshopLM skills, local stdio MCP tools, compact status/trace widgets, and optional source apps such as Granola and Google Drive.
2. **Full production workspace** — the local Next.js Sources/Map/Studio application opened in the ChatGPT/Codex in-app browser. ChatGPT itself remains the Conversation layer.

The plugin does not shrink the product into a chat-only flow. Excalidraw editing, brand/style review, image batches, storyboard editing, and output inspection need the full browser workspace.

The sanitized judge path requires no connected app, OAuth flow, hosted MCP server, or cloud deployment. A live spike must verify which installed surfaces can invoke a bundled local stdio MCP server. If Work is skill-only for that local server, Codex plus the in-app browser remains the executable demo path; the project will not add hosting only to force parity.

Existing ChatGPT apps and MCP servers are an architectural advantage rather than a dependency burden. WorkshopLM can normalize authorized `search`/`fetch` results from connected sources into the same local `Source`/`EvidenceChunk` contract used for local files. The source-app identity and native locator remain on every citation edge. The judge fixture remains connector-free.
