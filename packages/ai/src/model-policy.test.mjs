import assert from "node:assert/strict";
import { gpt56Models, operationProfiles, selectModel } from "./model-policy.mjs";
import { routingBenchmarkCases, scoreBenchmarkOutput } from "./benchmark.mjs";

assert.equal(selectModel("grounded_graph"), gpt56Models.frontier);
assert.equal(selectModel("claim_triage"), gpt56Models.efficient);
assert.equal(selectModel("executable_brief", { benchmarkWinner: gpt56Models.frontier }), gpt56Models.frontier);
assert.equal(selectModel("source_normalization", { benchmarkWinner: gpt56Models.frontier }), gpt56Models.efficient);
assert.deepEqual(operationProfiles.storyboard_structure.candidates, [gpt56Models.balanced, gpt56Models.frontier]);
assert.equal(routingBenchmarkCases.length, 3);
assert.deepEqual(scoreBenchmarkOutput(routingBenchmarkCases[2], '{"status":"verified","evidence":"source-a"}'), { parseable: true, matchedTerms: ["source-a", "verified"], score: 1 });
assert.equal(scoreBenchmarkOutput(routingBenchmarkCases[0], "not json").score, 0);
console.log("GPT-5.6 routing policy tests passed.");
