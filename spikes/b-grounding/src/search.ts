import { DatabaseSync } from "node:sqlite";
import type { NormalizedChunk } from "./normalize.js";

export type SearchResult = NormalizedChunk & { score: number; retrievalRank: number };

const tokens = (value: string) => value.toLowerCase().match(/[a-z0-9_]+/g) ?? [];
const escapeFts = (value: string) => value.replaceAll('"', '""');

/** SQLite FTS5 index with exact phrase and identifier boosts layered on BM25. */
export class LocalSearchIndex {
  readonly #db: DatabaseSync;

  constructor(chunks: NormalizedChunk[], databasePath = ":memory:") {
    this.#db = new DatabaseSync(databasePath);
    this.#db.exec(`CREATE VIRTUAL TABLE chunks USING fts5(chunk_id UNINDEXED, source_id UNINDEXED, source_name UNINDEXED, text, locator_kind UNINDEXED, locator_value UNINDEXED)`);
    const insert = this.#db.prepare("INSERT INTO chunks VALUES (?, ?, ?, ?, ?, ?)");
    for (const chunk of chunks) insert.run(chunk.chunkId, chunk.sourceId, chunk.sourceName, chunk.text, chunk.nativeLocator?.kind ?? null, chunk.nativeLocator?.value ?? null);
  }

  search(query: string, limit = 8): SearchResult[] {
    const words = tokens(query);
    if (!words.length) return [];
    const ftsQuery = words.map((word) => `\"${escapeFts(word)}\"`).join(" OR ");
    const rows = this.#db.prepare(`SELECT chunk_id, source_id, source_name, text, locator_kind, locator_value, bm25(chunks) AS bm25_score FROM chunks WHERE chunks MATCH ? ORDER BY bm25_score LIMIT ?`).all(ftsQuery, limit * 3) as Array<Record<string, unknown>>;
    const phrase = query.toLowerCase().trim();
    const identifier = /[a-z]+(?:_[a-z]+)+|\d+(?:\.\d+)?%?/i.test(query);
    return rows.map((row) => {
      const text = String(row.text);
      const lower = text.toLowerCase();
      const exactBoost = lower.includes(phrase) ? 10 : 0;
      const identifierBoost = identifier && words.some((word) => lower.includes(word)) ? 3 : 0;
      const locator = row.locator_kind && row.locator_value ? { kind: row.locator_kind as "page" | "time" | "section", value: String(row.locator_value) } : undefined;
      return { sourceId: String(row.source_id), chunkId: String(row.chunk_id), sourceName: String(row.source_name), text, nativeLocator: locator, score: -Number(row.bm25_score) + exactBoost + identifierBoost, retrievalRank: 0 };
    }).sort((a, b) => b.score - a.score || a.chunkId.localeCompare(b.chunkId)).slice(0, limit).map((result, index) => ({ ...result, retrievalRank: index + 1 }));
  }
}
