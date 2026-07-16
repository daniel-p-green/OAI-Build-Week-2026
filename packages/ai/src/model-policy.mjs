export const gpt56Models = Object.freeze({
  frontier: "gpt-5.6-sol",
  balanced: "gpt-5.6-terra",
  efficient: "gpt-5.6-luna",
});

export const operationProfiles = Object.freeze({
  grounded_graph: { defaultModel: gpt56Models.balanced, candidates: [gpt56Models.balanced, gpt56Models.frontier], reasoningEffort: "medium", rationale: "benchmark-selected evidence synthesis: Terra matched Sol's deterministic quality with materially lower latency and token use" },
  executable_brief: { defaultModel: gpt56Models.balanced, candidates: [gpt56Models.balanced, gpt56Models.frontier], reasoningEffort: "medium", rationale: "structured synthesis with a quality escalation path" },
  storyboard_structure: { defaultModel: gpt56Models.balanced, candidates: [gpt56Models.balanced, gpt56Models.frontier], reasoningEffort: "low", rationale: "creative structure with bounded schema output" },
  claim_triage: { defaultModel: gpt56Models.efficient, candidates: [gpt56Models.efficient, gpt56Models.balanced], reasoningEffort: "none", rationale: "repeatable high-volume classification with escalation on uncertainty" },
  source_normalization: { defaultModel: gpt56Models.efficient, candidates: [gpt56Models.efficient, gpt56Models.balanced], reasoningEffort: "none", rationale: "deterministic cleanup and tagging; no factual verification authority" },
});

export function selectModel(operation, { benchmarkWinner } = {}) {
  const profile = operationProfiles[operation];
  if (!profile) throw new Error(`Unknown GPT-5.6 operation: ${operation}`);
  return profile.candidates.includes(benchmarkWinner) ? benchmarkWinner : profile.defaultModel;
}
