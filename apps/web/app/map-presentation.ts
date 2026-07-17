export type MapPresentationNode = {
  id: string;
  body: string;
  kind: "grounded" | "derived" | "creative";
  locator: string;
  sourceId?: string;
};

export type MapPresentationEdge = { from: string; to: string };

const normalized = (value: string) => value.replace(/\s+/g, " ").trim().toLowerCase();

export function prioritizeMapEvidence<T extends MapPresentationNode>(
  nodes: T[],
  edges: MapPresentationEdge[],
  limit = 3,
  linkedOnly = true,
) {
  const derivedIds = new Set(nodes.filter((node) => node.kind === "derived").map((node) => node.id));
  const connectedOrder = new Map<string, number>();
  for (const edge of edges) {
    if (!derivedIds.has(edge.to) || connectedOrder.has(edge.from)) continue;
    connectedOrder.set(edge.from, connectedOrder.size);
  }

  const directions = nodes.filter((node) => node.kind === "creative");
  const duplicatesDirection = (node: T) => directions.some((direction) =>
    node.sourceId && node.sourceId === direction.sourceId
      && node.locator === direction.locator
      && normalized(node.body) === normalized(direction.body),
  );
  const grounded = nodes.filter((node) => node.kind === "grounded");
  const candidates = grounded
    .filter((node) => !duplicatesDirection(node))
    .sort((left, right) => {
      const leftOrder = connectedOrder.get(left.id) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = connectedOrder.get(right.id) ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder || nodes.indexOf(left) - nodes.indexOf(right);
    });
  const connectedCandidates = candidates.filter((node) => connectedOrder.has(node.id));
  const presentationPool = linkedOnly && connectedCandidates.length ? connectedCandidates : candidates;
  const selectedIds = new Set(presentationPool.slice(0, limit).map((node) => node.id));

  return {
    nodes: nodes.filter((node) => node.kind !== "grounded" || selectedIds.has(node.id)),
    hiddenEvidenceCount: Math.max(0, grounded.length - selectedIds.size),
  };
}
