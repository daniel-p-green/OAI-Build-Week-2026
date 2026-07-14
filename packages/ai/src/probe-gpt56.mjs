import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { gpt56Models } from "./model-policy.mjs";

if (process.env.WORKSHOPLM_LIVE_OPENAI !== "1") throw new Error("Refusing paid provider calls: set WORKSHOPLM_LIVE_OPENAI=1 after spend authorization.");
if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is required for a live GPT-5.6 probe.");

const prompt = "Return JSON with one field named summary. Summarize: A grounded Map must preserve source evidence before an approved brief generates outputs.";
const models = Object.values(gpt56Models);
const results = [];
for (const model of models) {
  const startedAt = performance.now();
  const response = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "content-type": "application/json" }, body: JSON.stringify({ model, input: prompt, store: false, reasoning: { effort: "none" }, max_output_tokens: 120 }) });
  const payload = await response.json();
  results.push({ model, status: response.status, latencyMs: Math.round(performance.now() - startedAt), responseModel: payload.model ?? null, usage: payload.usage ?? null, outputText: payload.output_text ?? null, error: payload.error ?? null });
}
const artifact = { generatedAt: new Date().toISOString(), task: "gpt56-routing-baseline", results };
const root = resolve(process.cwd(), "../../artifacts/spikes");
await mkdir(root, { recursive: true });
const path = resolve(root, `gpt56-routing-${Date.now()}.json`);
await writeFile(path, `${JSON.stringify(artifact, null, 2)}\n`);
console.log(JSON.stringify({ path, results: results.map(({ model, status, latencyMs, responseModel, usage, error }) => ({ model, status, latencyMs, responseModel, usage, error })) }, null, 2));
