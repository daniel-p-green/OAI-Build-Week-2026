import { snippetHash, type NormalizedChunk } from "./normalize.js";
import type { LocalSearchIndex, SearchResult } from "./search.js";

export type EvidenceLocator = { sourceId: string; chunkId: string; snippet: string; snippetHash: string; retrievalRank?: number; nativeLocator?: { kind: "page" | "time" | "section"; value: string } };
export type QueryExpansionMetrics = { latencyMs: number; inputTokens: number; outputTokens: number; estimatedCostUsd: number };
export type GroundedAnswer = { status: "verified" | "unverified"; citations: EvidenceLocator[]; answer: string; queryExpansion: QueryExpansionMetrics };

const excerpt = (text: string, maximum = 240) => text.length <= maximum ? text : `${text.slice(0, maximum - 1)}…`;

/** Deterministic offline query variants. A future model adapter may replace this, but must emit the same metrics. */
export function expandQuery(query: string): { variants: string[]; metrics: QueryExpansionMetrics } {
  const started = performance.now();
  // Bounded vocabulary is intentionally explicit: it keeps the fixture replayable
  // while providing a realistic adapter seam for later model-generated variants.
  const vocabulary: Record<string, string[]> = {
    auditable: ["inspectable"],
    support: ["evidence"],
    decisions: ["recommendation"],
    assertions: ["claim"],
  };
  const words = query.toLowerCase().match(/[a-z0-9_]+/g) ?? [];
  const variants = [...new Set([query, ...words.filter((word) => word.length > 3), ...words.flatMap((word) => vocabulary[word] ?? [])])];
  return { variants, metrics: { latencyMs: Math.round(performance.now() - started), inputTokens: query.split(/\s+/).filter(Boolean).length, outputTokens: variants.join(" ").split(/\s+/).filter(Boolean).length, estimatedCostUsd: 0 } };
}

export function toEvidenceLocator(result: SearchResult): EvidenceLocator {
  const snippet = excerpt(result.text);
  return { sourceId: result.sourceId, chunkId: result.chunkId, snippet, snippetHash: snippetHash(snippet), retrievalRank: result.retrievalRank, ...(result.nativeLocator ? { nativeLocator: result.nativeLocator } : {}) };
}

export function answerFromEvidence(query: string, index: LocalSearchIndex, minimumCitations = 1): GroundedAnswer {
  const expansion = expandQuery(query);
  const results = expansion.variants.flatMap((variant) => index.search(variant)).filter((result, index, all) => all.findIndex((candidate) => candidate.chunkId === result.chunkId) === index).slice(0, 3);
  const citations = results.map(toEvidenceLocator);
  const directTerms = (query.toLowerCase().match(/[a-z0-9_]+/g) ?? []).filter((term) => term.length > 3);
  const coveredTerms = directTerms.filter((term) => results.some((result) => result.text.toLowerCase().includes(term))).length;
  const knownExpansionTerms: Record<string, string[]> = { auditable: ["inspectable"], support: ["evidence"], decisions: ["recommendation"], assertions: ["claim"] };
  const hasSupportedSemanticExpansion = directTerms.some((term) => (knownExpansionTerms[term] ?? []).some((variant) => results.some((result) => result.text.toLowerCase().includes(variant))));
  // One matching product name is never enough to verify a multi-part claim.
  const hasEnoughDirectSupport = directTerms.length <= 2 ? coveredTerms >= 1 : coveredTerms / directTerms.length >= 0.5;
  if (citations.length < minimumCitations || (!hasEnoughDirectSupport && !hasSupportedSemanticExpansion)) return { status: "unverified", citations, answer: "This claim is unverified because the selected sources do not support it.", queryExpansion: expansion.metrics };
  return { status: "verified", citations, answer: citations.map((citation) => citation.snippet).join(" "), queryExpansion: expansion.metrics };
}

export const allChunks = (sources: Array<{ chunks: NormalizedChunk[] }>) => sources.flatMap((source) => source.chunks);
