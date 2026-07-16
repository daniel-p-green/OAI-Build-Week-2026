import { createHash } from "node:crypto";
import { WorkshopToolCall as WorkshopToolCallSchema, WorkshopToolName, parseWorkshopToolInput, workshopToolRegistry, type WorkshopToolCall, type WorkshopToolChannel, type WorkshopToolDefinition } from "@workshoplm/domain";
import {
  applyWorkshopAction,
  createImageBatch,
  generateAssetPlan,
  generateOutput,
  generateStoryboard,
  readWorkshopState,
  recordWorkshopToolCall,
  searchWorkshopSources,
  setActiveSourceScope,
  type WorkshopState,
} from "./workshop-service.js";

export type WorkshopToolProvider = { model?: string; responseId?: string; callId?: string; eventId?: string };
export type ExecuteWorkshopToolInput = {
  name: string;
  arguments?: unknown;
  channel: WorkshopToolChannel;
  explicitUserIntent?: boolean;
  provider?: WorkshopToolProvider;
};
export type ExecuteWorkshopToolResult = { call: WorkshopToolCall; result: WorkshopToolCall["result"]; state: WorkshopState; replayed: boolean };

function graphRevision(state: WorkshopState): number {
  try { return Number((JSON.parse(state.graphState ?? "{}") as { graph?: { revision?: number } }).graph?.revision ?? 0); }
  catch { return 0; }
}
function versionsFor(state: WorkshopState) { return { mapVersion: `map-r${graphRevision(state)}`, storyboardVersion: `storyboard-v${state.storyboard.version}` }; }
function stateSummary(state: WorkshopState): Record<string, unknown> {
  return { workshopId: state.id, activeSourceIds: state.activeSourceIds, ...versionsFor(state), briefApproved: state.briefApproved, storyboardApproved: state.storyboardApproved, outputCount: state.outputs.length, videoState: state.videoState };
}
function traceFor(state: WorkshopState, artifactId: string): Record<string, unknown> | undefined {
  const output = state.outputs.find((candidate) => candidate.id === artifactId);
  const video = state.videos.find((candidate) => candidate.id === artifactId);
  const image = state.imageBatch?.panels.find((candidate) => candidate.id === artifactId);
  if (!output && !video && !image) return undefined;
  const claimIds = output?.claimIds ?? video?.claimIds ?? image?.evidence.flatMap((reference) => reference.claimId ? [reference.claimId] : []) ?? [];
  const evidence = state.claims.filter((claim) => claimIds.includes(claim.id)).map((claim) => ({ claimId: claim.id, sourceId: claim.sourceId, chunkId: claim.chunkId, locator: claim.locator, text: claim.text }));
  return { artifactId, workshopId: state.id, stale: output?.stale ?? video?.stale ?? state.imageBatch?.stale ?? false, claimIds, evidence, buildTrace: video?.buildTrace };
}
function toolDefinition(name: WorkshopToolName): WorkshopToolDefinition {
  const definition = workshopToolRegistry.find((candidate) => candidate.name === name);
  if (!definition) throw new Error(`Unknown Workshop tool: ${name}.`);
  return definition;
}
function callId(input: ExecuteWorkshopToolInput, name: string, startedAt: string): string {
  const stable = `${input.channel}\n${input.provider?.callId ?? `${name}\n${startedAt}\n${JSON.stringify(input.arguments ?? {})}`}\nintent:${Boolean(input.explicitUserIntent)}`;
  return `tool-call-${createHash("sha256").update(stable).digest("hex").slice(0, 16)}`;
}
function boundedError(error: unknown): string { return (error instanceof Error ? error.message : "Workshop tool execution failed.").slice(0, 1_000); }

async function runTool(name: WorkshopToolName, input: Record<string, unknown>, root: string | undefined, state: WorkshopState): Promise<{ state: WorkshopState; summary: string; data?: Record<string, unknown> }> {
  if (name === "search") {
    const query = input.query as string;
    const active = new Set(state.activeSourceIds);
    const results = searchWorkshopSources(query, root, state.id).filter((chunk) => active.has(chunk.sourceId)).slice(0, 10).map((chunk) => ({ ...chunk, claims: state.claims.filter((claim) => claim.sourceId === chunk.sourceId && claim.chunkId === chunk.id) }));
    return { state, summary: results.length ? `Found ${results.length} grounded evidence chunk${results.length === 1 ? "" : "s"}.` : "No grounded evidence matched the active Sources.", data: { results } };
  }
  if (name === "fetch") {
    const sourceId = input.sourceId as string; const chunkId = input.chunkId as string;
    if (!state.activeSourceIds.includes(sourceId)) throw new Error("Evidence fetch is outside the active source scope.");
    const chunk = state.sourceChunks.find((candidate) => candidate.sourceId === sourceId && candidate.id === chunkId);
    if (!chunk) throw new Error(`Evidence chunk not found: ${sourceId}/${chunkId}.`);
    return { state, summary: `Fetched grounded evidence chunk ${chunk.id}.`, data: { result: { ...chunk, claims: state.claims.filter((claim) => claim.sourceId === sourceId && claim.chunkId === chunkId) } } };
  }
  if (name === "workshop_get_trace") {
    const artifactId = input.artifactId as string; const trace = traceFor(state, artifactId);
    if (!trace) throw new Error(`Artifact trace not found: ${artifactId}.`);
    return { state, summary: `Found source trace for ${artifactId}.`, data: { trace } };
  }
  if (name === "workshop_set_source_scope") {
    const next = setActiveSourceScope(input.sourceIds as string[], root);
    return { state: next, summary: `Updated the active source scope to ${next.activeSourceIds.length} Source${next.activeSourceIds.length === 1 ? "" : "s"}.`, data: stateSummary(next) };
  }
  if (name === "workshop_approve_brief") {
    const current = versionsFor(state).mapVersion; const requested = input.mapVersion as string;
    if (requested !== current) throw new Error(`Map approval blocked: requested ${requested}; current version is ${current}.`);
    const next = applyWorkshopAction("approveBrief", root);
    return { state: next, summary: "Map approved as the current Brief.", data: stateSummary(next) };
  }
  if (name === "workshop_create_output") {
    if (!state.briefApproved || !state.frame || state.frame.stale) throw new Error("Output creation blocked: approve the current Map as the Brief first.");
    const outputType = input.outputType as string; let next: WorkshopState;
    if (outputType === "deck" || outputType === "infographic") next = await generateOutput(outputType, root);
    else if (outputType === "images") next = createImageBatch(root);
    else if (outputType === "storyboard") { if (!state.assetPlan || state.assetPlan.stale) generateAssetPlan(root); next = generateStoryboard(root); }
    else if (outputType === "video") next = applyWorkshopAction("renderVideo", root);
    else throw new Error(`Unsupported Output type: ${outputType}.`);
    return { state: next, summary: outputType === "video" ? "Video render queued." : `Created ${outputType}.`, data: { outputType, ...stateSummary(next) } };
  }
  if (name === "workshop_approve_storyboard") {
    const current = versionsFor(state).storyboardVersion; const requested = input.storyboardVersion as string;
    if (requested !== current || state.storyboard.stale) throw new Error(`Storyboard approval blocked: requested ${requested}; current eligible version is ${current}.`);
    const next = applyWorkshopAction("approveStoryboard", root);
    return { state: next, summary: "Storyboard approved for local Video rendering.", data: stateSummary(next) };
  }
  if (name === "workshop_render_video") {
    const current = versionsFor(state).storyboardVersion; const requested = input.storyboardVersion as string;
    if (requested !== current || state.storyboard.stale || !state.storyboardApproved) throw new Error(`Video render blocked: approved current ${current} is required.`);
    const next = applyWorkshopAction("renderVideo", root);
    return { state: next, summary: "Video render queued from the approved current Storyboard.", data: stateSummary(next) };
  }
  throw new Error(`${name} is not available to Workshop Conversation.`);
}

export async function executeWorkshopTool(request: ExecuteWorkshopToolInput, root?: string): Promise<ExecuteWorkshopToolResult> {
  const startedAt = new Date().toISOString(); const active = readWorkshopState(root);
  const parsedName = WorkshopToolName.safeParse(request.name);
  if (!parsedName.success) throw new Error(`Unknown Workshop tool: ${request.name}.`);
  const name = parsedName.data; const definition = toolDefinition(name); let input: Record<string, unknown> = {};
  const prior = request.provider?.callId ? [...active.toolCalls].reverse().find((call) => call.channel === request.channel && call.provider?.callId === request.provider?.callId) : undefined;
  const confirmedRetry = Boolean(prior && definition.requiresExplicitUserIntent && request.explicitUserIntent && !prior.explicitUserIntent && prior.status === "failed" && prior.result.summary.includes("requires explicit user intent"));
  if (prior && !confirmedRetry) return { call: prior, result: prior.result, state: active, replayed: true };
  try { input = parseWorkshopToolInput(name, request.arguments ?? {}); }
  catch (error) {
    const completedAt = new Date().toISOString(); const result = { summary: boundedError(error), isError: true };
    const call = WorkshopToolCallSchema.parse({ id: callId(request, request.name, startedAt), workshopId: active.id, name, channel: request.channel, input: {}, explicitUserIntent: Boolean(request.explicitUserIntent), effect: definition.effects[0] ?? "none", status: "failed", startedAt, completedAt, provider: request.provider, result });
    return { call, result, state: recordWorkshopToolCall(call, root), replayed: false };
  }
  const requestedWorkshopId = typeof input.workshopId === "string" ? input.workshopId : active.id;
  let state = active;
  let result: WorkshopToolCall["result"];
  let status: WorkshopToolCall["status"];
  try {
    if (!definition.channels.includes(request.channel)) throw new Error(`${name} is not available in ${request.channel}.`);
    if (requestedWorkshopId !== active.id) throw new Error(`Tool call is scoped to active Workshop ${active.id}, not ${requestedWorkshopId}.`);
    if (definition.requiresExplicitUserIntent && !request.explicitUserIntent) throw new Error(`${name} requires explicit user intent before changing the Workshop.`);
    const executed = await runTool(name, input, root, active); state = executed.state;
    result = { summary: executed.summary, isError: false, data: executed.data }; status = "succeeded";
  } catch (error) {
    result = { summary: boundedError(error), isError: true }; status = "failed";
  }
  const completedAt = new Date().toISOString();
  const call = WorkshopToolCallSchema.parse({ id: callId(request, name, startedAt), workshopId: active.id, name, channel: request.channel, input, explicitUserIntent: Boolean(request.explicitUserIntent), effect: definition.effects[0] ?? "none", status, startedAt, completedAt, provider: request.provider, result });
  return { call, result, state: recordWorkshopToolCall(call, root), replayed: false };
}
