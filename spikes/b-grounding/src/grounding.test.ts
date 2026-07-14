import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { answerFromEvidence, allChunks } from "./ground.js";
import { fetchChunk } from "./fetch.js";
import { normalizeSource } from "./normalize.js";
import { LocalSearchIndex } from "./search.js";

const fixture = (name: string) => readFileSync(fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url)), "utf8");
const sources = ["brief.md", "meeting.txt", "metrics.csv"].map((name) => normalizeSource({ name, content: fixture(name) }));
const chunks = allChunks(sources);
const index = new LocalSearchIndex(chunks);

describe("local grounding", () => {
  it("normalizes into stable chunk IDs and only proven locators", () => {
    const repeat = normalizeSource({ name: "meeting.txt", content: fixture("meeting.txt") });
    expect(repeat.chunks.map((chunk) => chunk.chunkId)).toEqual(sources[1].chunks.map((chunk) => chunk.chunkId));
    expect(sources[1].chunks[0].nativeLocator).toEqual({ kind: "time", value: "00:00" });
    expect(sources[2].chunks[0].nativeLocator).toEqual({ kind: "section", value: "row 2" });
  });

  it("finds exact terms with a citation that fetches the same normalized chunk", () => {
    const answer = answerFromEvidence("source_trace_coverage_percent", index);
    expect(answer.status).toBe("verified");
    expect(answer.citations[0]?.snippetHash).toMatch(/^[a-f0-9]{64}$/);
    expect(fetchChunk(chunks, answer.citations[0]!.chunkId)?.sourceId).toBe(answer.citations[0]?.sourceId);
  });

  it("recalls a hostile paraphrase through bounded deterministic expansion", () => {
    const answer = answerFromEvidence("auditable support for decisions", index);
    expect(answer.status).toBe("verified");
    expect(answer.citations.some((citation) => citation.snippet.includes("evidence edge"))).toBe(true);
    expect(answer.queryExpansion).toMatchObject({ inputTokens: expect.any(Number), outputTokens: expect.any(Number), estimatedCostUsd: 0 });
  });

  it("does not fabricate support for an unsupported claim", () => {
    const answer = answerFromEvidence("WorkshopLM guarantees forty percent revenue growth", index);
    expect(answer.status).toBe("unverified");
    expect(answer.answer).toContain("unverified");
  });
});
