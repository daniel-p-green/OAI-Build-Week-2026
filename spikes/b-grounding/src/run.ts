import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { answerFromEvidence, allChunks } from "./ground.js";
import { normalizeSource } from "./normalize.js";
import { LocalSearchIndex } from "./search.js";

const files = ["brief.md", "meeting.txt", "metrics.csv"];
const sources = files.map((name) => normalizeSource({ name, content: readFileSync(fileURLToPath(new URL(`../fixtures/${name}`, import.meta.url)), "utf8") }));
const index = new LocalSearchIndex(allChunks(sources));
const cases = ["source_trace_coverage_percent", "auditable support for decisions", "WorkshopLM guarantees forty percent revenue growth"];
console.log(JSON.stringify({ spike: "grounding", mode: "deterministic-local", sourceCount: sources.length, chunkCount: allChunks(sources).length, checks: cases.map((query) => ({ query, ...answerFromEvidence(query, index) })) }, null, 2));
