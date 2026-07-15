export const routingBenchmarkCases = Object.freeze([
  {
    id: "grounded-graph",
    operation: "grounded_graph",
    reasoningEffort: "medium",
    maxOutputTokens: 260,
    expectedTerms: ["source-a", "source-b", "node"],
    prompt: "From these evidence records, propose a compact semantic graph. source-a: buyers need a concise board deck with source citations. source-b: the visual system must use #1155AA and reject stock-photo aesthetics. Return JSON only with keys node, edge, and evidence. evidence must name both source-a and source-b.",
  },
  {
    id: "executable-brief",
    operation: "executable_brief",
    reasoningEffort: "medium",
    maxOutputTokens: 220,
    expectedTerms: ["audience", "constraint", "source-a"],
    prompt: "Create a compact executable brief from source-a: executive buyers need a concise board deck; source-b: use #1155AA and reject stock-photo aesthetics. Return JSON only with keys audience, constraint, and evidence. evidence must name source-a.",
  },
  {
    id: "claim-triage",
    operation: "claim_triage",
    reasoningEffort: "none",
    maxOutputTokens: 140,
    expectedTerms: ["source-a", "verified"],
    prompt: "Triage this claim: 'Executive buyers need a concise board deck.' It is supported by source-a. Return JSON only with keys status and evidence; status must be verified and evidence must name source-a.",
  },
]);

export function requireBenchmarkRequestCeiling(value, plannedRequests) {
  const ceiling = Number(value);
  if (!Number.isSafeInteger(ceiling) || ceiling < plannedRequests) {
    throw new Error(`WORKSHOPLM_MAX_PAID_REQUESTS must explicitly authorize at least ${plannedRequests} requests for the GPT-5.6 benchmark.`);
  }
  return ceiling;
}

export function scoreBenchmarkOutput(testCase, outputText) {
  if (typeof outputText !== "string") return { parseable: false, matchedTerms: [], score: 0 };
  let parsed;
  try { parsed = JSON.parse(outputText); } catch { return { parseable: false, matchedTerms: [], score: 0 }; }
  const normalized = JSON.stringify(parsed).toLowerCase();
  const matchedTerms = testCase.expectedTerms.filter((term) => normalized.includes(term.toLowerCase()));
  return { parseable: true, matchedTerms, score: matchedTerms.length / testCase.expectedTerms.length };
}
