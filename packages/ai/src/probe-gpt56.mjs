import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gpt56Models } from "./model-policy.mjs";
import { routingBenchmarkCases, scoreBenchmarkOutput } from "./benchmark.mjs";
import { responsesOutputText } from "./responses.mjs";

if (process.env.WORKSHOPLM_LIVE_OPENAI !== "1") throw new Error("Refusing paid provider calls: set WORKSHOPLM_LIVE_OPENAI=1 after spend authorization.");
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required for a live GPT-5.6 probe.");

const models = Object.values(gpt56Models);
const results = [];
for (const model of models) {
  for (const testCase of routingBenchmarkCases) {
    const startedAt = performance.now();
    const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" }, body: JSON.stringify({ model, input: testCase.prompt, store: false, reasoning: { effort: testCase.reasoningEffort }, max_output_tokens: testCase.maxOutputTokens }) });
    const payload = await response.json();
    const outputText = response.ok ? responsesOutputText(payload) : null;
    const outputError = response.ok && !outputText ? "Responses API returned no output_text content." : null;
    results.push({ model, case: testCase.id, operation: testCase.operation, status: response.status, latencyMs: Math.round(performance.now() - startedAt), responseModel: payload.model ?? null, usage: payload.usage ?? null, outputText, quality: scoreBenchmarkOutput(testCase, outputText), error: payload.error ?? outputError });
  }
}
const artifact = { generatedAt: new Date().toISOString(), task: "gpt56-routing-benchmark", methodology: { models, cases: routingBenchmarkCases.map(({ id, operation, reasoningEffort, maxOutputTokens }) => ({ id, operation, reasoningEffort, maxOutputTokens })), measures: ["HTTP status", "end-to-end latencyMs", "reported usage", "deterministic JSON/evidence score"], pricing: "No dollar estimate is inferred; compare usage against the current official model pricing at decision time." }, results };
const root = resolve(process.cwd(), "../../artifacts/spikes");
await mkdir(root, { recursive: true });
const path = resolve(root, `gpt56-routing-${Date.now()}.json`);
await writeFile(path, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ path, results: results.map(({ model, case: caseId, status, latencyMs, responseModel, usage, quality, error }) => ({ model, case: caseId, status, latencyMs, responseModel, usage, quality, error })) }, null, 2));
