import type { NormalizedChunk } from "./normalize.js";

export type FetchResult = { sourceId: string; chunkId: string; text: string; nativeLocator?: NormalizedChunk["nativeLocator"] };

export function fetchChunk(chunks: NormalizedChunk[], chunkId: string): FetchResult | undefined {
  const chunk = chunks.find((candidate) => candidate.chunkId === chunkId);
  return chunk && { sourceId: chunk.sourceId, chunkId: chunk.chunkId, text: chunk.text, nativeLocator: chunk.nativeLocator };
}
