import assert from "node:assert/strict";
import { responsesOutputText } from "./responses.mjs";

assert.equal(responsesOutputText({ output_text: '{"source":"top-level"}' }), '{"source":"top-level"}');
assert.equal(
  responsesOutputText({ output: [{ type: "message", content: [{ type: "output_text", text: '{"source":' }, { type: "output_text", text: '"nested"}' }] }] }),
  '{"source":"nested"}',
);
assert.equal(responsesOutputText({ output: [{ type: "reasoning", content: [] }, { type: "message", content: [{ type: "refusal", refusal: "No" }] }] }), null);
assert.equal(responsesOutputText({ output_text: "   ", output: [] }), null);
assert.equal(responsesOutputText(null), null);

console.log("Responses output parser tests passed.");
