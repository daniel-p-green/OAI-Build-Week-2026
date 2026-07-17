import { createHash } from "node:crypto";
import { responsesOutputText } from "@workshoplm/ai/responses";
import { applyGroundedMapProposal, readWorkshopState, type GroundedMapProposal, type WorkshopState } from "./workshop-service.js";

export type Gpt56Model = "gpt-5.6-sol" | "gpt-5.6-terra" | "gpt-5.6-luna";
export type OpenAiReasoningConfig = { apiKey: string; model: Gpt56Model; reasoningEffort: "low" | "medium" | "high" };

const groundedMapSchema = {
  type: "object",
  additionalProperties: false,
  required: ["nodes", "edges"],
  properties: {
    nodes: {
      type: "array",
      minItems: 2,
      maxItems: 12,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "title", "body", "evidenceState", "evidenceClaimIds", "x", "y"],
        properties: {
          id: { type: "string", pattern: "^[a-z0-9][a-z0-9-]{0,63}$" },
          title: { type: "string", minLength: 1, maxLength: 80 },
          body: { type: "string", minLength: 1, maxLength: 500 },
          evidenceState: { type: "string", enum: ["grounded", "derived", "direction"] },
          evidenceClaimIds: { type: "array", items: { type: "string" } },
          x: { type: "number", minimum: 0, maximum: 100 },
          y: { type: "number", minimum: 0, maximum: 100 },
        },
      },
    },
    edges: {
      type: "array",
      maxItems: 24,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "from", "to", "kind", "label"],
        properties: {
          id: { type: "string", minLength: 1, maxLength: 80 },
          from: { type: "string" },
          to: { type: "string" },
          kind: { type: "string", enum: ["supports", "relates_to", "depends_on", "contradicts", "contains"] },
          label: { type: "string", minLength: 1, maxLength: 80 },
        },
      },
    },
  },
} as const;

function redact(value: string): string {
  return value.replace(/sk-[A-Za-z0-9_-]+/g, "[redacted]").replace(/Bearer\s+[^\s]+/gi, "Bearer [redacted]").slice(0, 500);
}

export async function generateGroundedMapWithGpt56(root: string, config: OpenAiReasoningConfig, fetchImpl: typeof fetch = fetch): Promise<WorkshopState> {
  if (!config.apiKey.trim()) throw new Error("A live OpenAI API key is required.");
  const state = readWorkshopState(root);
  const claims = state.claims.filter((claim) => state.activeSourceIds.includes(claim.sourceId)).slice(0, 40);
  if (claims.length < 2) throw new Error("GPT-5.6 Map generation requires at least two active grounded claims.");
  const evidence = claims.map((claim) => ({ id: claim.id, text: claim.text, locator: claim.locator, sourceId: claim.sourceId }));
  const response = await fetchImpl("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "content-type": "application/json" },
    body: JSON.stringify({
      model: config.model,
      store: false,
      reasoning: { effort: config.reasoningEffort },
      max_output_tokens: 2200,
      input: [
        { role: "developer", content: "Turn only the supplied evidence into a compact professional thought map with a clear left-to-right hierarchy: grounded evidence, synthesis, then recommended direction. Include at least one grounded node, one derived synthesis node, and one direction node. Every grounded and direction node must cite supporting claim IDs; derived nodes should cite the claims they synthesize. A direction is a recommended next action grounded in the supplied evidence, not a new factual claim. Use a readable 0-100 canvas and connect the strongest evidence-to-synthesis-to-direction path." },
        { role: "user", content: JSON.stringify({ evidence }) },
      ],
      text: { format: { type: "json_schema", name: "workshoplm_grounded_map", strict: true, schema: groundedMapSchema } },
    }),
  });
  if (!response.ok) throw new Error(`Responses API returned HTTP ${response.status}: ${redact(await response.text())}`);
  const output = responsesOutputText(await response.json());
  if (!output) throw new Error("Responses API did not return structured text output.");
  let proposal: GroundedMapProposal;
  try { proposal = JSON.parse(output) as GroundedMapProposal; }
  catch { throw new Error("GPT-5.6 returned invalid grounded Map JSON."); }
  return applyGroundedMapProposal(proposal, { model: config.model, outputSha256: createHash("sha256").update(output).digest("hex"), requestId: response.headers.get("x-request-id") ?? undefined }, root);
}
