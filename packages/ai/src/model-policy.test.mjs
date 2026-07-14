import assert from "node:assert/strict";
import { gpt56Models, operationProfiles, selectModel } from "./model-policy.mjs";

assert.equal(selectModel("grounded_graph"), gpt56Models.frontier);
assert.equal(selectModel("claim_triage"), gpt56Models.efficient);
assert.equal(selectModel("executable_brief", { benchmarkWinner: gpt56Models.frontier }), gpt56Models.frontier);
assert.equal(selectModel("source_normalization", { benchmarkWinner: gpt56Models.frontier }), gpt56Models.efficient);
assert.deepEqual(operationProfiles.storyboard_structure.candidates, [gpt56Models.balanced, gpt56Models.frontier]);
console.log("GPT-5.6 routing policy tests passed.");
