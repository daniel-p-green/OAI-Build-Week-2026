export type ToolKind = "read" | "write";
export type ToolDefinition = { name: string; kind: ToolKind; description: string; inputSchema: { type: "object"; properties: Record<string, unknown>; required?: string[] } };

const object = (properties: Record<string, unknown>, required: string[] = []) => ({ type: "object" as const, properties, ...(required.length ? { required } : {}) });

export const toolDefinitions: ToolDefinition[] = [
  { name: "workshop_list", kind: "read", description: "List local Workshop summaries.", inputSchema: object({}) },
  { name: "workshop_create", kind: "write", description: "Create a local Workshop.", inputSchema: object({ title: { type: "string" } }, ["title"]) },
  { name: "workshop_open", kind: "read", description: "Return the local Workshop URL and status.", inputSchema: object({ workshopId: { type: "string" } }, ["workshopId"]) },
  { name: "workshop_add_source", kind: "write", description: "Import a sanctioned local file or URL.", inputSchema: object({ workshopId: { type: "string" }, source: { type: "string" } }, ["workshopId", "source"]) },
  { name: "search", kind: "read", description: "Search normalized source evidence.", inputSchema: object({ query: { type: "string" } }, ["query"]) },
  { name: "fetch", kind: "read", description: "Fetch a normalized evidence chunk.", inputSchema: object({ sourceId: { type: "string" }, chunkId: { type: "string" } }, ["sourceId", "chunkId"]) },
  { name: "workshop_get_trace", kind: "read", description: "Read artifact to claim to source traceability.", inputSchema: object({ artifactId: { type: "string" } }, ["artifactId"]) },
  { name: "workshop_approve_brief", kind: "write", description: "Approve only the current eligible Map version.", inputSchema: object({ workshopId: { type: "string" }, mapVersion: { type: "string" } }, ["workshopId", "mapVersion"]) },
  { name: "workshop_create_output", kind: "write", description: "Enqueue one typed output from approved current state.", inputSchema: object({ workshopId: { type: "string" }, outputType: { enum: ["deck", "infographic", "images", "storyboard", "video"] } }, ["workshopId", "outputType"]) },
  { name: "workshop_approve_storyboard", kind: "write", description: "Approve only the current storyboard version.", inputSchema: object({ workshopId: { type: "string" }, storyboardVersion: { type: "string" } }, ["workshopId", "storyboardVersion"]) },
  { name: "workshop_render_video", kind: "write", description: "Render only an approved, current storyboard.", inputSchema: object({ workshopId: { type: "string" }, storyboardVersion: { type: "string" } }, ["workshopId", "storyboardVersion"]) },
];

export function mutationGate(tool: string, state: { mapCurrent?: boolean; storyboardApproved?: boolean; storyboardCurrent?: boolean }) {
  if (tool === "workshop_approve_brief" && !state.mapCurrent) return "Map approval blocked: the requested Map version is stale or ineligible.";
  if (tool === "workshop_render_video" && (!state.storyboardApproved || !state.storyboardCurrent)) return "Video render blocked: storyboard approval and current version are required.";
  return null;
}
