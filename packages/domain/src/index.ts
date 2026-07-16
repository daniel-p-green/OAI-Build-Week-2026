import { z } from "zod";
import rawWorkshopToolRegistry from "../workshop-tools.json" with { type: "json" };

/** Canonical, opaque IDs. IDs are branded at compile time and validated at every boundary. */
const id = <T extends string>(kind: T) => z.string().min(1, `${kind} must not be empty`).brand<T>();
export const WorkshopId = id("WorkshopId");
export const SourceId = id("SourceId");
export const ChunkId = id("ChunkId");
export const ClaimId = id("ClaimId");
export const NodeId = id("NodeId");
export const EdgeId = id("EdgeId");
export const VersionId = id("VersionId");
export const ArtifactId = id("ArtifactId");
export const StoryboardId = id("StoryboardId");
export const JobId = id("JobId");

export type WorkshopId = z.infer<typeof WorkshopId>;
export type SourceId = z.infer<typeof SourceId>;
export type ChunkId = z.infer<typeof ChunkId>;
export type ClaimId = z.infer<typeof ClaimId>;
export type NodeId = z.infer<typeof NodeId>;
export type EdgeId = z.infer<typeof EdgeId>;
export type VersionId = z.infer<typeof VersionId>;
export type ArtifactId = z.infer<typeof ArtifactId>;
export type StoryboardId = z.infer<typeof StoryboardId>;
export type JobId = z.infer<typeof JobId>;

export const EvidenceState = z.enum(["verified", "derived", "creative", "unverified"]);
export type EvidenceState = z.infer<typeof EvidenceState>;
export const StaleState = z.enum(["current", "stale"]);
export type StaleState = z.infer<typeof StaleState>;
export const OutputType = z.enum(["map", "sketch", "deck", "infographic", "audio_overview", "images", "storyboard", "video"]);
export type OutputType = z.infer<typeof OutputType>;
export const PermissionState = z.enum(["private", "sanitized", "shareable"]);

export const Workshop = z.object({
  id: WorkshopId,
  title: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  currentGraphVersionId: VersionId.optional(),
  currentBriefVersionId: VersionId.optional(),
  currentDesignVersionId: VersionId.optional(),
  currentStoryboardVersionId: VersionId.optional(),
  gates: z.object({ transcript_ready: z.boolean(), board_approved: z.boolean(), brief_ready: z.boolean(), style_locked: z.boolean(), storyboard_approved: z.boolean(), video_rendered: z.boolean() }).strict(),
}).strict();
export const TranscriptSegment = z.object({
  id: z.string().min(1),
  workshopId: WorkshopId,
  adapter: z.enum(["chatgpt_task", "realtime_fallback", "manual_import"]),
  speaker: z.enum(["user", "assistant", "system"]),
  text: z.string().min(1),
  startedAt: z.string().datetime(),
  endedAt: z.string().datetime(),
  acknowledgedAt: z.string().datetime().optional(),
  hostTurnId: z.string().min(1).optional(),
}).strict();

export const NativeLocator = z.object({
  kind: z.enum(["page", "time", "section", "line", "url"]),
  value: z.string().min(1),
}).strict();
export const EvidenceLocator = z.object({
  sourceId: SourceId,
  chunkId: ChunkId,
  snippet: z.string().min(1),
  snippetHash: z.string().min(1),
  retrievalRank: z.number().int().positive().optional(),
  nativeLocator: NativeLocator.optional(),
}).strict();
export type EvidenceLocator = z.infer<typeof EvidenceLocator>;
export const ConversationEvidence = z.object({
  sourceId: SourceId,
  chunkId: ChunkId.optional(),
  claimId: ClaimId.optional(),
  locator: z.string().min(1),
  snippet: z.string().min(1),
  snippetHash: z.string().min(1),
}).strict();
export const WorkshopToolName = z.enum([
  "workshop_list",
  "workshop_create",
  "workshop_open",
  "workshop_add_source",
  "search",
  "fetch",
  "workshop_get_trace",
  "workshop_set_source_scope",
  "workshop_approve_brief",
  "workshop_create_output",
  "workshop_approve_storyboard",
  "workshop_render_video",
]);
export type WorkshopToolName = z.infer<typeof WorkshopToolName>;
export const ConversationTurn = z.object({
  id: z.string().min(1),
  workshopId: WorkshopId,
  role: z.enum(["user", "assistant"]),
  input: z.enum(["text", "voice", "system"]),
  text: z.string().min(1).max(16_000),
  createdAt: z.string().datetime(),
  evidence: z.array(ConversationEvidence),
  sourceId: SourceId.optional(),
  operation: z.object({ name: z.union([WorkshopToolName, z.literal("source_search"), z.literal("voice_capture")]), status: z.literal("completed") }).strict().optional(),
}).strict();
export type ConversationTurn = z.infer<typeof ConversationTurn>;

export type WorkshopToolKind = "read" | "write";
export type WorkshopToolChannel = "plugin" | "responses" | "realtime";
export type WorkshopToolAnnotations = { readOnlyHint: boolean; destructiveHint: boolean; openWorldHint: boolean };
export type WorkshopToolInputSchema = { type: "object"; properties: Record<string, unknown>; required?: string[]; additionalProperties: false };
export type WorkshopToolDefinition = {
  name: WorkshopToolName;
  kind: WorkshopToolKind;
  description: string;
  inputSchema: WorkshopToolInputSchema;
  annotations: WorkshopToolAnnotations;
  channels: readonly WorkshopToolChannel[];
  requiresExplicitUserIntent: boolean;
  effects: readonly ("none" | "creates_workshop" | "selects_workshop" | "adds_source" | "changes_source_scope" | "approves_brief" | "creates_output" | "approves_storyboard" | "queues_video")[];
};
export const WorkshopToolCall = z.object({
  id: z.string().min(1),
  workshopId: WorkshopId,
  name: WorkshopToolName,
  channel: z.enum(["plugin", "responses", "realtime"]),
  input: z.record(z.string(), z.unknown()),
  explicitUserIntent: z.boolean(),
  effect: z.enum(["none", "creates_workshop", "selects_workshop", "adds_source", "changes_source_scope", "approves_brief", "creates_output", "approves_storyboard", "queues_video"]),
  status: z.enum(["succeeded", "failed"]),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
  provider: z.object({ model: z.string().min(1).optional(), responseId: z.string().min(1).optional(), callId: z.string().min(1).optional(), eventId: z.string().min(1).optional() }).strict().optional(),
  result: z.object({ summary: z.string().min(1).max(1_000), isError: z.boolean(), data: z.record(z.string(), z.unknown()).optional() }).strict(),
}).strict();
export type WorkshopToolCall = z.infer<typeof WorkshopToolCall>;
const WorkshopToolDefinitionContract = z.object({
  name: WorkshopToolName,
  kind: z.enum(["read", "write"]),
  description: z.string().min(1),
  inputSchema: z.object({ type: z.literal("object"), properties: z.record(z.string(), z.unknown()), required: z.array(z.string()).optional(), additionalProperties: z.literal(false) }).strict(),
  annotations: z.object({ readOnlyHint: z.boolean(), destructiveHint: z.literal(false), openWorldHint: z.literal(false) }).strict(),
  channels: z.array(z.enum(["plugin", "responses", "realtime"])).min(1),
  requiresExplicitUserIntent: z.boolean(),
  effects: z.array(z.enum(["none", "creates_workshop", "selects_workshop", "adds_source", "changes_source_scope", "approves_brief", "creates_output", "approves_storyboard", "queues_video"])).min(1),
}).strict().superRefine((tool, context) => {
  for (const required of tool.inputSchema.required ?? []) if (!(required in tool.inputSchema.properties)) context.addIssue({ code: z.ZodIssueCode.custom, message: `${tool.name} requires an undefined property: ${required}` });
  if (tool.kind === "read" && !tool.annotations.readOnlyHint) context.addIssue({ code: z.ZodIssueCode.custom, message: `${tool.name} must advertise readOnlyHint` });
  if (tool.kind === "write" && (tool.annotations.readOnlyHint || !tool.requiresExplicitUserIntent)) context.addIssue({ code: z.ZodIssueCode.custom, message: `${tool.name} writes require explicit user intent` });
});

/**
 * The one canonical tool surface for MCP, Responses, and Realtime adapters.
 * Adapters may expose only tools allowed for their channel; they may not alter
 * names, parameters, approval intent, privacy assumptions, or effects.
 */
export const workshopToolRegistry = z.array(WorkshopToolDefinitionContract).parse(rawWorkshopToolRegistry) as WorkshopToolDefinition[];

export function workshopToolsFor(channel: WorkshopToolChannel): WorkshopToolDefinition[] {
  return workshopToolRegistry.filter((tool) => tool.channels.includes(channel)).map((tool) => ({ ...tool, channels: [...tool.channels], effects: [...tool.effects] }));
}

export function openAiWorkshopTools(channel: "responses" | "realtime") {
  return workshopToolsFor(channel).map((tool) => ({ type: "function" as const, name: tool.name, description: tool.description, parameters: tool.inputSchema }));
}

export function parseWorkshopToolInput(name: WorkshopToolName, input: unknown): Record<string, unknown> {
  const tool = workshopToolRegistry.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`Unknown Workshop tool: ${name}`);
  const value = z.record(z.string(), z.unknown()).parse(input);
  const allowed = new Set(Object.keys(tool.inputSchema.properties));
  const extra = Object.keys(value).find((key) => !allowed.has(key));
  if (extra) throw new Error(`${name} does not accept ${extra}`);
  for (const required of tool.inputSchema.required ?? []) if (!(required in value)) throw new Error(`${name} requires ${required}`);
  for (const [key, rawSchema] of Object.entries(tool.inputSchema.properties)) {
    if (!(key in value)) continue;
    const schema = rawSchema as { type?: string; minLength?: number; enum?: unknown[]; minItems?: number; uniqueItems?: boolean; items?: { type?: string; minLength?: number } };
    const candidate = value[key];
    if (schema.type === "string") {
      if (typeof candidate !== "string") throw new Error(`${name}.${key} must be a string`);
      if (schema.minLength && candidate.length < schema.minLength) throw new Error(`${name}.${key} must not be empty`);
      if (schema.enum && !schema.enum.includes(candidate)) throw new Error(`${name}.${key} is not supported`);
    }
    if (schema.type === "array") {
      if (!Array.isArray(candidate)) throw new Error(`${name}.${key} must be an array`);
      if (schema.minItems && candidate.length < schema.minItems) throw new Error(`${name}.${key} requires at least ${schema.minItems} item`);
      if (schema.uniqueItems && new Set(candidate.map((item) => JSON.stringify(item))).size !== candidate.length) throw new Error(`${name}.${key} must contain unique items`);
      for (const item of candidate) {
        if (schema.items?.type === "string" && typeof item !== "string") throw new Error(`${name}.${key} items must be strings`);
        if (schema.items?.minLength && typeof item === "string" && item.length < schema.items.minLength) throw new Error(`${name}.${key} items must not be empty`);
      }
    }
  }
  return value;
}

export const Source = z.object({
  id: SourceId,
  workshopId: WorkshopId,
  title: z.string().min(1),
  origin: z.enum(["local", "chatgpt_task", "granola", "drive", "url", "other"]),
  permission: PermissionState,
  contentHash: z.string().min(1),
  mimeType: z.string().min(1),
  status: z.enum(["queued", "parsed", "indexed", "failed"]),
  createdAt: z.string().datetime(),
}).strict();
export const EvidenceChunk = z.object({
  id: ChunkId,
  sourceId: SourceId,
  text: z.string().min(1),
  textHash: z.string().min(1),
  locator: NativeLocator.optional(),
  ordinal: z.number().int().nonnegative(),
}).strict();
export const Claim = z.object({
  id: ClaimId,
  workshopId: WorkshopId,
  text: z.string().min(1),
  evidenceState: EvidenceState,
  evidence: z.array(EvidenceLocator),
  provenance: z.enum(["user", "assistant", "import", "system"]),
  approved: z.boolean().default(false),
  createdAt: z.string().datetime(),
}).strict().superRefine((claim, context) => {
  if (claim.evidenceState === "verified" && claim.evidence.length === 0) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "verified claims require evidence" });
  }
});

export const GraphNodeKind = z.enum(["claim", "idea", "goal", "audience", "constraint", "question", "deliverable"]);
export const GraphNode = z.object({
  id: NodeId,
  kind: GraphNodeKind,
  label: z.string().min(1),
  claimId: ClaimId.optional(),
  evidenceState: EvidenceState,
  priority: z.number().int().min(0).max(5).default(0),
  confidence: z.number().min(0).max(1).optional(),
  unresolved: z.boolean().default(false),
  locked: z.boolean().default(false),
  metadata: z.record(z.string(), z.unknown()).default({}),
}).strict();
export const GraphEdge = z.object({
  id: EdgeId,
  from: NodeId,
  to: NodeId,
  kind: z.enum(["supports", "relates_to", "depends_on", "contradicts", "contains"]),
  label: z.string().max(280).optional(),
}).strict().refine((edge) => edge.from !== edge.to, "graph edges cannot be self-referential");
export const SemanticGraph = z.object({
  id: VersionId,
  workshopId: WorkshopId,
  revision: z.number().int().nonnegative(),
  staleState: StaleState.default("current"),
  nodes: z.array(GraphNode),
  edges: z.array(GraphEdge),
}).strict().superRefine((graph, context) => {
  const nodeIds = new Set(graph.nodes.map((node) => node.id));
  for (const edge of graph.edges) {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) context.addIssue({ code: z.ZodIssueCode.custom, message: `edge ${edge.id} references a missing node` });
  }
});
export type GraphNode = z.infer<typeof GraphNode>;
export type GraphEdge = z.infer<typeof GraphEdge>;
export type SemanticGraph = z.infer<typeof SemanticGraph>;
export const BoardSceneMapping = z.object({
  graphVersionId: VersionId,
  nodeId: NodeId,
  excalidrawElementId: z.string().min(1),
  x: z.number(), y: z.number(), width: z.number().positive(), height: z.number().positive(),
}).strict();

export const AddNodeOperation = z.object({ type: z.literal("add_node"), node: GraphNode }).strict();
export const RemoveNodeOperation = z.object({ type: z.literal("remove_node"), nodeId: NodeId }).strict();
export const UpdateNodeOperation = z.object({ type: z.literal("update_node"), nodeId: NodeId, patch: GraphNode.omit({ id: true }).partial() }).strict();
export const AddEdgeOperation = z.object({ type: z.literal("add_edge"), edge: GraphEdge }).strict();
export const RemoveEdgeOperation = z.object({ type: z.literal("remove_edge"), edgeId: EdgeId }).strict();
export const GraphOperation = z.discriminatedUnion("type", [AddNodeOperation, RemoveNodeOperation, UpdateNodeOperation, AddEdgeOperation, RemoveEdgeOperation]);
export type GraphOperation = z.infer<typeof GraphOperation>;

export class DomainError extends Error {
  constructor(public readonly code: "NOT_FOUND" | "CONFLICT" | "LOCKED" | "INVALID" | "GATE_BLOCKED" | "STALE", message: string) { super(message); }
}

export type AppliedGraphOperation = { graph: SemanticGraph; inverse: GraphOperation[]; contentChanged: boolean };
export function applyGraphOperation(input: SemanticGraph, rawOperation: GraphOperation): AppliedGraphOperation {
  const graph = SemanticGraph.parse(input);
  const operation = GraphOperation.parse(rawOperation);
  const nodes = [...graph.nodes];
  const edges = [...graph.edges];
  let inverse: GraphOperation[];
  switch (operation.type) {
    case "add_node": {
      if (nodes.some((node) => node.id === operation.node.id)) throw new DomainError("CONFLICT", `node ${operation.node.id} already exists`);
      nodes.push(operation.node); inverse = [{ type: "remove_node", nodeId: operation.node.id }]; break;
    }
    case "remove_node": {
      const node = nodes.find((item) => item.id === operation.nodeId);
      if (!node) throw new DomainError("NOT_FOUND", `node ${operation.nodeId} does not exist`);
      if (node.locked) throw new DomainError("LOCKED", `node ${operation.nodeId} is locked`);
      const removedEdges = edges.filter((edge) => edge.from === node.id || edge.to === node.id);
      inverse = [{ type: "add_node", node }, ...removedEdges.map((edge) => ({ type: "add_edge" as const, edge }))];
      return { graph: SemanticGraph.parse({ ...graph, revision: graph.revision + 1, staleState: "current", nodes: nodes.filter((item) => item.id !== node.id), edges: edges.filter((edge) => edge.from !== node.id && edge.to !== node.id) }), inverse, contentChanged: true };
    }
    case "update_node": {
      const index = nodes.findIndex((node) => node.id === operation.nodeId);
      if (index < 0) throw new DomainError("NOT_FOUND", `node ${operation.nodeId} does not exist`);
      if (nodes[index].locked) throw new DomainError("LOCKED", `node ${operation.nodeId} is locked`);
      const previous = nodes[index]; const next = GraphNode.parse({ ...previous, ...operation.patch, id: previous.id });
      nodes[index] = next;
      const { id: _nodeId, ...previousPatch } = previous;
      inverse = [{ type: "update_node", nodeId: previous.id, patch: previousPatch }]; break;
    }
    case "add_edge": {
      if (edges.some((edge) => edge.id === operation.edge.id)) throw new DomainError("CONFLICT", `edge ${operation.edge.id} already exists`);
      if (!nodes.some((node) => node.id === operation.edge.from) || !nodes.some((node) => node.id === operation.edge.to)) throw new DomainError("INVALID", "edges require existing endpoints");
      edges.push(operation.edge); inverse = [{ type: "remove_edge", edgeId: operation.edge.id }]; break;
    }
    case "remove_edge": {
      const edge = edges.find((item) => item.id === operation.edgeId);
      if (!edge) throw new DomainError("NOT_FOUND", `edge ${operation.edgeId} does not exist`);
      inverse = [{ type: "add_edge", edge }];
      return { graph: SemanticGraph.parse({ ...graph, revision: graph.revision + 1, staleState: "current", nodes, edges: edges.filter((item) => item.id !== edge.id) }), inverse, contentChanged: true };
    }
  }
  return { graph: SemanticGraph.parse({ ...graph, revision: graph.revision + 1, staleState: "current", nodes, edges }), inverse, contentChanged: true };
}
export function undoGraphOperation(graph: SemanticGraph, inverse: GraphOperation[]): SemanticGraph {
  return inverse.reduce((current, operation) => applyGraphOperation(current, operation).graph, graph);
}

/** JSON-safe audit history; persistence layers store this record rather than executable callbacks. */
export const GraphOperationRecord = z.object({
  id: z.string().min(1),
  graphVersionId: VersionId,
  operation: GraphOperation,
  inverse: z.array(GraphOperation).min(1),
  actor: z.enum(["user", "assistant", "system"]),
  createdAt: z.string().datetime(),
  status: z.enum(["applied", "undone"]),
}).strict();
export type GraphOperationRecord = z.infer<typeof GraphOperationRecord>;
export const GraphOperationHistory = z.object({ graphVersionId: VersionId, records: z.array(GraphOperationRecord) }).strict().superRefine((history, context) => {
  if (history.records.some((record) => record.graphVersionId !== history.graphVersionId)) context.addIssue({ code: z.ZodIssueCode.custom, message: "history records must belong to the current graph" });
});
export type GraphOperationHistory = z.infer<typeof GraphOperationHistory>;
export const GraphStateSnapshot = z.object({ schemaVersion: z.literal(1), graph: SemanticGraph, history: GraphOperationHistory }).strict().superRefine((snapshot, context) => {
  if (snapshot.graph.id !== snapshot.history.graphVersionId) context.addIssue({ code: z.ZodIssueCode.custom, message: "snapshot graph and history must share a graph version" });
});
export type GraphStateSnapshot = z.infer<typeof GraphStateSnapshot>;
export function appendGraphOperation(
  graph: SemanticGraph,
  history: GraphOperationHistory,
  rawOperation: GraphOperation,
  metadata: Pick<GraphOperationRecord, "id" | "actor" | "createdAt">,
): { graph: SemanticGraph; history: GraphOperationHistory; record: GraphOperationRecord } {
  const parsedGraph = SemanticGraph.parse(graph);
  const parsedHistory = GraphOperationHistory.parse(history);
  if (parsedGraph.id !== parsedHistory.graphVersionId) throw new DomainError("CONFLICT", "graph history belongs to a different graph version");
  const applied = applyGraphOperation(parsedGraph, rawOperation);
  const record = GraphOperationRecord.parse({ ...metadata, graphVersionId: parsedGraph.id, operation: rawOperation, inverse: applied.inverse, status: "applied" });
  return { graph: applied.graph, history: GraphOperationHistory.parse({ ...parsedHistory, records: [...parsedHistory.records, record] }), record };
}
export function undoLatestGraphOperation(graph: SemanticGraph, history: GraphOperationHistory): { graph: SemanticGraph; history: GraphOperationHistory; record: GraphOperationRecord } {
  const parsedGraph = SemanticGraph.parse(graph);
  const parsedHistory = GraphOperationHistory.parse(history);
  if (parsedGraph.id !== parsedHistory.graphVersionId) throw new DomainError("CONFLICT", "graph history belongs to a different graph version");
  const recordIndex = parsedHistory.records.map((record) => record.status).lastIndexOf("applied");
  if (recordIndex < 0) throw new DomainError("NOT_FOUND", "no applied graph operation is available to undo");
  const record = parsedHistory.records[recordIndex];
  const undone = undoGraphOperation(parsedGraph, record.inverse);
  const records = [...parsedHistory.records];
  records[recordIndex] = { ...record, status: "undone" };
  return { graph: undone, history: GraphOperationHistory.parse({ ...parsedHistory, records }), record: records[recordIndex] };
}
export function serializeGraphState(graph: SemanticGraph, history: GraphOperationHistory): string {
  return JSON.stringify(GraphStateSnapshot.parse({ schemaVersion: 1, graph, history }));
}
export function parseGraphState(serialized: string): GraphStateSnapshot {
  try { return GraphStateSnapshot.parse(JSON.parse(serialized)); }
  catch (error) { throw new DomainError("INVALID", `invalid graph state snapshot: ${error instanceof Error ? error.message : "unknown error"}`); }
}

export const GateFlags = z.object({
  transcript_ready: z.boolean(), board_approved: z.boolean(), brief_ready: z.boolean(), style_locked: z.boolean(), storyboard_approved: z.boolean(), video_rendered: z.boolean(),
}).strict();
export type GateFlags = z.infer<typeof GateFlags>;
export const GateInputs = z.object({ transcriptSegments: z.number().int().nonnegative(), boardApprovedCurrent: z.boolean(), briefCurrent: z.boolean(), styleLockedCurrent: z.boolean(), storyboardApprovedCurrent: z.boolean(), videoRenderedCurrent: z.boolean() }).strict();
export function deriveGates(input: z.input<typeof GateInputs>): GateFlags {
  const state = GateInputs.parse(input);
  return { transcript_ready: state.transcriptSegments > 0, board_approved: state.boardApprovedCurrent, brief_ready: state.briefCurrent, style_locked: state.styleLockedCurrent, storyboard_approved: state.storyboardApprovedCurrent, video_rendered: state.videoRenderedCurrent };
}
export function assertEligible(command: "approve_brief" | "create_output" | "approve_storyboard" | "render_video", gates: GateFlags): void {
  const requirements: Record<typeof command, (keyof GateFlags)[]> = { approve_brief: ["transcript_ready"], create_output: ["board_approved", "brief_ready"], approve_storyboard: ["board_approved", "brief_ready", "style_locked"], render_video: ["storyboard_approved"] };
  const missing = requirements[command].filter((key) => !gates[key]);
  if (missing.length) throw new DomainError("GATE_BLOCKED", `${command} blocked: ${missing.join(", ")} required`);
}

/** Current-version facts are deliberately separate from historical gate flags. */
export const CommandEligibility = z.object({
  transcriptReady: z.boolean(),
  mapCurrent: z.boolean(),
  boardApprovedCurrent: z.boolean(),
  briefCurrent: z.boolean(),
  styleLockedCurrent: z.boolean(),
  storyboardCurrent: z.boolean(),
  storyboardApproved: z.boolean(),
  allStoryboardPanelsCurrent: z.boolean(),
}).strict();
export type CommandEligibility = z.infer<typeof CommandEligibility>;
export function assertCommandEligible(command: "approve_brief" | "create_output" | "approve_storyboard" | "render_video", rawEligibility: z.input<typeof CommandEligibility>): void {
  const eligibility = CommandEligibility.parse(rawEligibility);
  const requirements: Record<typeof command, (keyof CommandEligibility)[]> = {
    approve_brief: ["transcriptReady", "mapCurrent"],
    create_output: ["boardApprovedCurrent", "briefCurrent"],
    approve_storyboard: ["boardApprovedCurrent", "briefCurrent", "styleLockedCurrent", "storyboardCurrent", "allStoryboardPanelsCurrent"],
    render_video: ["storyboardCurrent", "storyboardApproved", "allStoryboardPanelsCurrent"],
  };
  const missing = requirements[command].filter((key) => !eligibility[key]);
  if (!missing.length) return;
  const stale = missing.some((key) => key.endsWith("Current"));
  throw new DomainError(stale ? "STALE" : "GATE_BLOCKED", `${command} blocked: ${missing.join(", ")} required`);
}

export const DependencyEdge = z.object({ upstreamId: VersionId, downstreamId: VersionId, reason: z.enum(["source", "claim", "graph", "brief", "style", "storyboard", "render"]), }).strict().refine((edge) => edge.upstreamId !== edge.downstreamId, "dependencies cannot self-reference");
export type DependencyEdge = z.infer<typeof DependencyEdge>;
export function collectStaleDependents(changed: VersionId, edges: DependencyEdge[]): Set<VersionId> {
  const adjacency = new Map<string, VersionId[]>();
  for (const edge of edges.map((item) => DependencyEdge.parse(item))) adjacency.set(edge.upstreamId, [...(adjacency.get(edge.upstreamId) ?? []), edge.downstreamId]);
  const stale = new Set<VersionId>(); const queue = [changed];
  while (queue.length) for (const next of adjacency.get(queue.shift()!) ?? []) if (!stale.has(next)) { stale.add(next); queue.push(next); }
  return stale;
}
export function applyStalePropagation<T extends { id: VersionId; staleState: StaleState }>(versions: T[], changed: VersionId, edges: DependencyEdge[]): T[] {
  const stale = collectStaleDependents(changed, edges); return versions.map((version) => stale.has(version.id) ? { ...version, staleState: "stale" } : version);
}

export const FrameBrief = z.object({ id: VersionId, workshopId: WorkshopId, graphVersionId: VersionId, markdown: z.string().min(1), executable: z.record(z.string(), z.unknown()), approvedAt: z.string().datetime(), staleState: StaleState }).strict();
export const BrandFoundation = z.object({ id: VersionId, workshopId: WorkshopId, source: z.enum(["website", "manual"]), palette: z.record(z.string(), z.string()), logos: z.array(z.string().min(1)), licensedFonts: z.array(z.string().min(1)), visualReferences: z.array(z.string().min(1)), layoutRules: z.array(z.string().min(1)), voice: z.string().min(1), motionRules: z.array(z.string().min(1)), negativeConstraints: z.array(z.string().min(1)), staleState: StaleState }).strict();
export const IntentProfile = z.object({ id: VersionId, workshopId: WorkshopId, name: z.enum(["client_facing_pitch", "board_deck", "internal_workshop"]), audience: z.string().min(1), outcome: z.string().min(1), staleState: StaleState }).strict();
export const VisualDnaVersion = z.object({ id: VersionId, workshopId: WorkshopId, brandFoundationVersionId: VersionId, intentProfileVersionId: VersionId, referenceAnchors: z.array(z.string().min(1)), palette: z.record(z.string(), z.string()), lighting: z.string().min(1), compositionRules: z.array(z.string().min(1)), textureRules: z.array(z.string().min(1)), imageRules: z.array(z.string().min(1)), negativeConstraints: z.array(z.string().min(1)), lockedAt: z.string().datetime().optional(), staleState: StaleState }).strict();
export const DesignDocument = z.object({ id: VersionId, workshopId: WorkshopId, markdown: z.string().min(1), tokens: z.record(z.string(), z.unknown()), staleState: StaleState }).strict();
export const StoryboardEvidenceReference = z.object({ claimId: ClaimId.optional(), sourceId: SourceId, chunkId: ChunkId.optional(), locator: z.string().min(1) }).strict();
export const StoryboardPanel = z.object({ id: z.string().min(1), purpose: z.string().min(1), claimIds: z.array(ClaimId), evidence: z.array(StoryboardEvidenceReference).min(1), voiceover: z.string().min(1), onScreenText: z.string(), durationSeconds: z.number().positive(), composition: z.string().min(1), visualDnaVersionId: VersionId, imagePanelId: z.string().min(1).optional(), imagePanelVersion: z.number().int().positive().optional(), transition: z.string().min(1), approved: z.boolean(), staleState: StaleState }).strict().superRefine((panel, context) => { if (Boolean(panel.imagePanelId) !== Boolean(panel.imagePanelVersion)) context.addIssue({ code: z.ZodIssueCode.custom, message: "storyboard image bindings require both panel ID and version" }); const evidenceClaimIds = [...new Set(panel.evidence.flatMap((reference) => reference.claimId ? [reference.claimId] : []))].sort(); if ([...new Set(panel.claimIds)].sort().join("|") !== evidenceClaimIds.join("|")) context.addIssue({ code: z.ZodIssueCode.custom, message: "storyboard claim IDs must match its evidence references" }); });
export const Storyboard = z.object({ id: StoryboardId, versionId: VersionId, workshopId: WorkshopId, panels: z.array(StoryboardPanel).min(1), approvedAt: z.string().datetime().optional(), staleState: StaleState }).strict().superRefine((storyboard, context) => { if (storyboard.approvedAt && storyboard.panels.some((panel) => !panel.approved || panel.staleState === "stale")) context.addIssue({ code: z.ZodIssueCode.custom, message: "approved storyboards require current approved panels" }); });
export const ArtifactJson = z.object({
  schemaVersion: z.literal(1), artifactId: ArtifactId, versionId: VersionId, workshopId: WorkshopId, outputType: OutputType,
  title: z.string().min(1), staleState: StaleState, createdAt: z.string().datetime(),
  inputVersions: z.object({ graph: VersionId.optional(), brief: VersionId.optional(), sourceSelection: VersionId.optional(), claimSet: VersionId.optional(), brandFoundation: VersionId.optional(), intentProfile: VersionId.optional(), visualDna: VersionId.optional(), storyboard: VersionId.optional() }).strict(),
  claimIds: z.array(ClaimId), evidence: z.array(EvidenceLocator), renderer: z.object({ name: z.string().min(1), version: z.string().min(1), settings: z.record(z.string(), z.unknown()) }).strict(),
  files: z.array(z.object({ path: z.string().min(1), mimeType: z.string().min(1), sha256: z.string().regex(/^[a-f0-9]{64}$/i) }).strict()).min(1),
}).strict().superRefine((artifact, context) => { if (artifact.claimIds.length && !artifact.evidence.length) context.addIssue({ code: z.ZodIssueCode.custom, message: "claim-bearing artifacts require evidence" }); });
export type ArtifactJson = z.infer<typeof ArtifactJson>;
export const Output = z.object({ id: ArtifactId, workshopId: WorkshopId, type: OutputType, title: z.string().min(1), currentVersionId: VersionId.optional(), status: z.enum(["draft", "queued", "running", "succeeded", "failed", "partial", "cancelled"]), createdAt: z.string().datetime() }).strict();
export const ArtifactVersion = z.object({ id: VersionId, artifactId: ArtifactId, artifact: ArtifactJson, staleState: StaleState, approvedAt: z.string().datetime().optional() }).strict();
export const GenerationJob = z.object({ id: JobId, workshopId: WorkshopId, outputType: OutputType, inputVersionKey: z.string().min(1), state: z.enum(["queued", "running", "succeeded", "failed", "cancelled", "retrying"]), attempts: z.number().int().nonnegative(), maxAttempts: z.number().int().positive(), error: z.string().optional(), createdAt: z.string().datetime(), updatedAt: z.string().datetime() }).strict().superRefine((job, context) => { if (job.attempts > job.maxAttempts) context.addIssue({ code: z.ZodIssueCode.custom, message: "attempts cannot exceed maxAttempts" }); });

export const SubmissionAssetType = z.enum([
  "devpost_description",
  "readme_narrative",
  "deck",
  "infographic",
  "image_manifest",
  "image",
  "thumbnail",
  "storyboard",
  "narration",
  "video",
  "evidence",
]);
export type SubmissionAssetType = z.infer<typeof SubmissionAssetType>;
export const SubmissionAsset = z.object({
  type: SubmissionAssetType,
  relativePath: z.string().min(1).refine((path) => !path.startsWith("/") && !path.split("/").includes(".."), "submission asset paths must stay inside the package"),
  mimeType: z.string().min(1),
  sha256: z.string().regex(/^[a-f0-9]{64}$/i),
  byteCount: z.number().int().nonnegative(),
  claimIds: z.array(z.string().min(1)),
  sourceLocators: z.array(z.string().min(1)),
  provenance: z.enum(["workshop_output", "source_trace", "derived_copy", "generated_preview", "narration", "video_render"]),
}).strict();
export type SubmissionAsset = z.infer<typeof SubmissionAsset>;
export const SubmissionInputSnapshot = z.object({
  graphRevision: z.number().int().nonnegative(),
  briefVersion: z.number().int().positive(),
  styleVersion: z.number().int().positive(),
  assetPlanVersion: z.number().int().positive(),
  storyboardVersion: z.number().int().positive(),
  imageBatchId: z.string().min(1),
  narrationStoryboardVersion: z.number().int().positive().optional(),
  activeSourceIds: z.array(z.string().min(1)),
  claimIds: z.array(z.string().min(1)),
  outputIds: z.array(z.string().min(1)),
  videoState: z.literal("rendered"),
}).strict();
export type SubmissionInputSnapshot = z.infer<typeof SubmissionInputSnapshot>;
const requiredSubmissionAssets = new Set<SubmissionAssetType>(["devpost_description", "readme_narrative", "deck", "infographic", "image_manifest", "thumbnail", "storyboard", "narration", "video", "evidence"]);
export const SubmissionOutputSet = z.object({
  schemaVersion: z.literal(1),
  id: z.string().min(1),
  workshopId: z.string().min(1),
  title: z.string().min(1),
  version: z.number().int().positive(),
  status: z.enum(["ready", "partial"]),
  createdAt: z.string().datetime(),
  inputFingerprint: z.string().regex(/^[a-f0-9]{64}$/i),
  inputs: SubmissionInputSnapshot,
  claimIds: z.array(z.string().min(1)),
  sourceLocators: z.array(z.string().min(1)),
  limitations: z.array(z.string().min(1)),
  assets: z.array(SubmissionAsset).min(requiredSubmissionAssets.size),
}).strict().superRefine((outputSet, context) => {
  const paths = new Set<string>();
  const types = new Set<SubmissionAssetType>();
  for (const asset of outputSet.assets) {
    if (paths.has(asset.relativePath)) context.addIssue({ code: z.ZodIssueCode.custom, message: `duplicate submission asset path: ${asset.relativePath}` });
    paths.add(asset.relativePath);
    types.add(asset.type);
  }
  for (const type of requiredSubmissionAssets) if (!types.has(type)) context.addIssue({ code: z.ZodIssueCode.custom, message: `submission Output set requires ${type}` });
  if (outputSet.status === "ready" && outputSet.limitations.length) context.addIssue({ code: z.ZodIssueCode.custom, message: "ready submission Output sets cannot retain limitations" });
});
export type SubmissionOutputSet = z.infer<typeof SubmissionOutputSet>;
