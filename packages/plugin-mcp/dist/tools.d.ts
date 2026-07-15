export type ToolKind = "read" | "write";
export type ToolAnnotations = {
    readOnlyHint: boolean;
    destructiveHint: boolean;
    openWorldHint: boolean;
};
export type ToolDefinition = {
    name: string;
    kind: ToolKind;
    description: string;
    inputSchema: {
        type: "object";
        properties: Record<string, unknown>;
        required?: string[];
    };
    annotations: ToolAnnotations;
};
export type WorkshopChunk = {
    id: string;
    sourceId: string;
    text: string;
    locator: string;
    ordinal: number;
};
export type WorkshopClaim = {
    id: string;
    sourceId: string;
    chunkId: string;
    text: string;
    evidenceState: "verified" | "derived" | "creative" | "unverified";
    locator: string;
};
export type WorkshopState = {
    id: string;
    title: string;
    briefApproved: boolean;
    storyboardApproved: boolean;
    videoState: "blocked" | "queued" | "rendering" | "rendered";
    sources: number;
    groundedClaims: number;
    sourceChunks?: WorkshopChunk[];
    claims?: WorkshopClaim[];
    graphState?: string;
    frame?: {
        stale: boolean;
        version: number;
    };
    style?: {
        stale: boolean;
        version: number;
    };
    assetPlan?: {
        stale: boolean;
        version: number;
    };
    storyboard?: {
        stale: boolean;
        version: number;
        panels?: Array<{
            claimIds?: string[];
        }>;
    };
    outputs?: Array<{
        id: string;
        claimIds: string[];
        stale: boolean;
    }>;
    videos?: Array<{
        id: string;
        claimIds: string[];
        stale: boolean;
        buildTrace?: {
            htmlPath: string;
            dataPath: string;
        };
    }>;
    imageBatch?: {
        id: string;
        stale: boolean;
        panels: Array<{
            id: string;
            state: string;
        }>;
    };
    updatedAt: string;
};
export type ToolResult = {
    text: string;
    data?: Record<string, unknown>;
    isError?: boolean;
};
export declare const toolDefinitions: ToolDefinition[];
export declare function mutationGate(tool: string, state: {
    mapCurrent?: boolean;
    storyboardApproved?: boolean;
    storyboardCurrent?: boolean;
}): "Map approval blocked: the requested Map version is stale or ineligible." | "Video render blocked: storyboard approval and current version are required." | null;
export declare function listWorkshops(): WorkshopState[];
export declare function searchEvidence(query: string): Array<WorkshopChunk & {
    claims: WorkshopClaim[];
    score: number;
}>;
export declare function fetchEvidence(sourceId: string, chunkId: string): (WorkshopChunk & {
    claims: WorkshopClaim[];
}) | null;
export declare function executeTool(name: string, arguments_?: Record<string, unknown>): ToolResult;
