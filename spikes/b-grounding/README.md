# Local source-grounding spike

This lane proves a deterministic, connector-free source contract for the WorkshopLM fixture.

- `normalize.ts` produces stable source/chunk IDs and only emits native locators that the fixture proves.
- `search.ts` uses SQLite FTS5 (an optional file path makes the index durable), then applies deterministic exact-phrase and identifier boosts.
- `fetch.ts` retrieves the canonical normalized chunk.
- `ground.ts` creates inspectable citations and deliberately marks unsupported claims `unverified`.

The query-expansion implementation is offline and reports `0` estimated cost. A live GPT query-expander can replace it only if it preserves the same bounded metrics/result contract and never logs source content. The hostile paraphrase is intentionally lexical-mismatch coverage; it identifies the evidence-standard concept through deterministic keyword variants, not a semantic-vector claim.

Run `pnpm --filter @workshoplm/spike-grounding test` after the workspace foundation is installed, or `pnpm --filter @workshoplm/spike-grounding run` for the sanitized deterministic report.
