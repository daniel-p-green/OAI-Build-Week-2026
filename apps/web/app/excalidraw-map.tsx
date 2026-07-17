"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { semanticConnectionBetween } from "./excalidraw-map-geometry";
import { baselineFromScene, patchesFromScene, type CanvasNodePatch, type MapSceneElement, type SceneNodeBaseline } from "./excalidraw-map-state";

const Excalidraw = dynamic(() => import("@excalidraw/excalidraw").then((module) => module.Excalidraw), { ssr: false });

const SCENE_WIDTH = 1000;
const SCENE_HEIGHT = 650;
const NODE_OFFSET_X = 0;
const NODE_SCALE_X = 7.45;

export type ExcalidrawMapNode = {
  id: string;
  title: string;
  body: string;
  kind: "grounded" | "derived" | "creative";
  locator: string;
  sourceId?: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type Source = { id: string; type: "TXT" | "PDF" | "WEB"; title: string; origin: string; claimCount: number };
type MapEdge = { id: string; from: string; to: string; kind: string; label?: string };
type MapStyle = { accent: string; ink: string; paper: string };
type SceneElement = MapSceneElement & {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  containerId?: string | null;
  isDeleted?: boolean;
  customData?: { nodeId?: string; sourceId?: string };
};
type SceneAppState = { selectedElementIds: Record<string, boolean> };

const shapeId = (nodeId: string) => `map-node-${nodeId}`;
const toSceneX = (value: number) => NODE_OFFSET_X + value * NODE_SCALE_X;
const toSceneY = (value: number) => value * (SCENE_HEIGHT / 100);
const toSceneWidth = (value: number) => value * (SCENE_WIDTH / 100);
const isVoiceSource = (source: Source) => source.title.startsWith("Voice capture-only fallback transcript")
  || source.title === "Raw voice brainstorm"
  || source.origin.toLowerCase() === "chatgpt task"
  || source.origin === "Founder-provided recording";
const sourceTitle = (source: Source) => isVoiceSource(source)
  ? source.origin === "Founder-provided recording" ? "Founder brainstorm" : "Voice brainstorm"
  : source.title;
const sourceType = (source: Source) => isVoiceSource(source) ? "VOICE" : source.type;
const compactSourceTitle = (source: Source) => {
  const title = sourceTitle(source);
  return title.length > 16 ? `${title.slice(0, 15).trimEnd()}…` : title;
};

function sceneSkeleton(nodes: ExcalidrawMapNode[], sources: Source[], edges: MapEdge[], style?: MapStyle) {
  const accent = style?.accent ?? "#0285ff";
  const ink = style?.ink ?? "#171816";
  const nodeIds = new Set(nodes.map((node) => node.id));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const groundedNodes = nodes.filter((node) => node.kind === "grounded");
  const sourceForNode = new Map(groundedNodes.flatMap((node, index) => {
    const sourceId = node.sourceId ?? sources[index % Math.max(1, sources.length)]?.id;
    return sourceId ? [[node.id, sourceId] as const] : [];
  }));
  const nodeGeometry = new Map(nodes.map((node) => [node.id, { x: toSceneX(node.x), y: toSceneY(node.y), width: toSceneWidth(node.width), height: toSceneY(node.height) }]));
  const clusterDescriptors = ([
    { id: "map-cluster-evidence", text: "EVIDENCE", kind: "grounded", fill: "#f7fbf8", stroke: "#008635" },
    { id: "map-cluster-synthesis", text: "SYNTHESIS", kind: "derived", fill: "#fafafa", stroke: ink },
    { id: "map-cluster-direction", text: "DIRECTION", kind: "creative", fill: `${accent}0b`, stroke: accent },
  ] as const).flatMap((descriptor) => {
    const members = nodes.filter((node) => node.kind === descriptor.kind).map((node) => nodeGeometry.get(node.id)).filter((geometry): geometry is NonNullable<typeof geometry> => Boolean(geometry));
    if (!members.length) return [];
    const x = Math.min(...members.map((member) => member.x)) - 18;
    const y = Math.min(...members.map((member) => member.y)) - 38;
    const right = Math.max(...members.map((member) => member.x + member.width)) + 18;
    const bottom = Math.max(...members.map((member) => member.y + member.height)) + 24;
    return [{ ...descriptor, x, y, width: right - x, height: bottom - y }];
  });
  const clusterFrames = clusterDescriptors.map((cluster) => ({
    type: "rectangle" as const,
    id: `${cluster.id}-frame`,
    x: cluster.x,
    y: cluster.y,
    width: cluster.width,
    height: cluster.height,
    backgroundColor: cluster.fill,
    strokeColor: `${cluster.stroke}22`,
    strokeWidth: 1,
    fillStyle: "solid" as const,
    roughness: 0,
    roundness: { type: 3 as const },
    locked: true,
  }));
  const clusterLabels = clusterDescriptors.map((cluster) => ({
    type: "text" as const,
    id: cluster.id,
    x: cluster.x + 14,
    y: cluster.y + 12,
    text: cluster.text,
    fontSize: 13,
    fontFamily: 2 as const,
    strokeColor: `${cluster.stroke}c4`,
    locked: true,
  }));
  const evidenceCluster = clusterDescriptors.find((cluster) => cluster.kind === "grounded");
  const nodeShapes = nodes.map((node) => ({
    type: "rectangle" as const,
    id: shapeId(node.id),
    x: toSceneX(node.x),
    y: toSceneY(node.y),
    width: toSceneWidth(node.width),
    height: toSceneY(node.height),
    label: { text: node.title, fontSize: node.kind === "grounded" ? 15 : node.kind === "derived" ? 17 : 18, fontFamily: 2 as const, textAlign: "left" as const, verticalAlign: "middle" as const },
    customData: { nodeId: node.id },
    backgroundColor: node.kind === "grounded" || node.kind === "derived" ? "#ffffff" : `${accent}14`,
    strokeColor: node.kind === "grounded" ? "#008635" : node.kind === "derived" ? `${ink}9a` : accent,
    strokeWidth: node.kind === "creative" ? 2.25 : 1.25,
    fillStyle: "solid" as const,
    roughness: 0,
    roundness: { type: 3 as const },
  }));
  const sourceCaptions = groundedNodes.flatMap((node) => {
    if (sources.length <= 1) return [];
    const sourceId = sourceForNode.get(node.id);
    const source = sources.find((item) => item.id === sourceId);
    const geometry = nodeGeometry.get(node.id);
    if (!source || !geometry) return [];
    return [{
      type: "text" as const,
      id: `map-source-caption-${node.id}`,
      x: geometry.x + 18,
      y: geometry.y + geometry.height + 7,
      text: `${sourceType(source)} · ${compactSourceTitle(source)}`,
      fontSize: 10,
      fontFamily: 2 as const,
      strokeColor: "#477259",
      locked: true,
    }];
  });
  const evidenceSynthesisTargets = [...new Set(edges.flatMap((edge) => nodeById.get(edge.from)?.kind === "grounded" && nodeById.get(edge.to)?.kind === "derived" ? [edge.to] : []))];
  const evidenceSynthesisLinks = evidenceCluster ? evidenceSynthesisTargets.flatMap((targetId) => {
    const end = nodeGeometry.get(targetId);
    if (!end) return [];
    return [{
      type: "arrow" as const,
      id: `graph-edge-evidence-cluster-${targetId}`,
      ...semanticConnectionBetween(evidenceCluster, end),
      strokeColor: `${ink}52`,
      strokeWidth: 1.15,
      roughness: 0,
      endArrowhead: "arrow" as const,
      locked: true,
    }];
  }) : [];
  const graphLinks = edges.flatMap((edge) => {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) return [];
    if (nodeById.get(edge.from)?.kind === nodeById.get(edge.to)?.kind) return [];
    if (nodeById.get(edge.from)?.kind === "grounded" && nodeById.get(edge.to)?.kind === "derived") return [];
    const start = nodeGeometry.get(edge.from);
    const end = nodeGeometry.get(edge.to);
    if (!start || !end) return [];
    const connection = semanticConnectionBetween(start, end);
    return [{
      type: "arrow" as const,
      id: `graph-edge-${edge.id}`,
      ...connection,
      strokeColor: edge.kind === "contradicts" ? "#e02e2a" : nodeById.get(edge.to)?.kind === "creative" ? accent : `${ink}52`,
      strokeWidth: nodeById.get(edge.to)?.kind === "creative" ? 2.5 : 1.15,
      roughness: 0,
      endArrowhead: "arrow" as const,
      locked: true,
    }];
  });

  return [...clusterFrames, ...evidenceSynthesisLinks, ...graphLinks, ...clusterLabels, ...nodeShapes, ...sourceCaptions];
}

export function ExcalidrawMap({ nodes, outlineNodes, sources, edges, style, selectedNodeId, onSelectNode, onShowSource, onSync }: {
  nodes: ExcalidrawMapNode[];
  outlineNodes?: ExcalidrawMapNode[];
  sources: Source[];
  edges: MapEdge[];
  style?: MapStyle;
  selectedNodeId?: string;
  onSelectNode: (id: string) => void;
  onShowSource: (id: string) => void;
  onSync: (nodes: CanvasNodePatch[]) => void;
}) {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fitFrame = useRef<number | null>(null);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const baseline = useRef<Map<string, SceneNodeBaseline> | null>(null);
  const lastSent = useRef("");
  const lastSelection = useRef("");
  const skeleton = useMemo(() => sceneSkeleton(nodes, sources, edges, style), [nodes, sources, edges, style?.accent, style?.ink, style?.paper]);
  const sceneKey = nodes.map((node) => `${node.id}:${node.title}:${node.x}:${node.y}:${node.width}:${node.height}`).join("|");
  const initialData = useMemo(() => async () => {
    const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
    return { elements: convertToExcalidrawElements(skeleton, { regenerateIds: false }), appState: { viewBackgroundColor: style?.paper ?? "#ffffff", selectedElementIds: selectedNodeId ? { [shapeId(selectedNodeId)]: true } : {} } };
  }, [skeleton, selectedNodeId, style?.paper]);

  useEffect(() => () => {
    if (timeout.current) clearTimeout(timeout.current);
    if (fitFrame.current !== null) cancelAnimationFrame(fitFrame.current);
  }, []);
  useEffect(() => {
    baseline.current = null;
    lastSent.current = "";
    if (timeout.current) clearTimeout(timeout.current);
    fitScene();
  }, [sceneKey]);
  useEffect(() => {
    const container = containerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => fitScene());
    observer.observe(container);
    return () => observer.disconnect();
  }, [sceneKey]);

  function fitScene(api = apiRef.current) {
    if (!api) return;
    if (fitFrame.current !== null) cancelAnimationFrame(fitFrame.current);
    fitFrame.current = requestAnimationFrame(() => {
      fitFrame.current = requestAnimationFrame(() => {
        const elements = api.getSceneElements();
        if (elements.length) api.scrollToContent(elements, { fitToViewport: true, viewportZoomFactor: 0.94, minZoom: 0.35, maxZoom: 1, animate: false });
        fitFrame.current = null;
      });
    });
  }

  function onChange(scene: readonly SceneElement[], appState: SceneAppState) {
    const selectedIds = Object.keys(appState.selectedElementIds).filter((id) => appState.selectedElementIds[id]);
    const selected = selectedIds.map((id) => scene.find((element) => element.id === id)).find(Boolean);
    const container = selected?.containerId ? scene.find((element) => element.id === selected.containerId) : selected;
    const nextNodeId = container?.customData?.nodeId ?? "";
    const nextSourceId = container?.customData?.sourceId ?? "";
    const selectionSignature = `${nextNodeId}:${nextSourceId}`;
    if (selectionSignature !== lastSelection.current) {
      lastSelection.current = selectionSignature;
      if (nextSourceId) onShowSource(nextSourceId);
      else onSelectNode(nextNodeId);
    }

    if (!baseline.current) {
      baseline.current = baselineFromScene(nodes, scene);
      return;
    }
    const changed = patchesFromScene(nodes, scene, baseline.current);
    const signature = JSON.stringify(changed);
    if (!changed.length || signature === lastSent.current) return;
    if (timeout.current) clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      lastSent.current = signature;
      onSync(changed);
    }, 500);
  }

  const mobileNodes = [...(outlineNodes ?? nodes)].sort((left, right) => ({ creative: 0, derived: 1, grounded: 2 })[left.kind] - ({ creative: 0, derived: 1, grounded: 2 })[right.kind]);

  return <div className="semantic-map" data-domain-ui="excalidraw-map">
    <div ref={containerRef} className="excalidraw-map" aria-label="Editable Map" onContextMenu={(event) => event.preventDefault()}>
      <Excalidraw
        key={sceneKey}
        initialData={initialData}
        excalidrawAPI={(api: ExcalidrawImperativeAPI) => { apiRef.current = api; fitScene(api); }}
        onChange={onChange}
        autoFocus={false}
        handleKeyboardGlobally={false}
        UIOptions={{ canvasActions: { changeViewBackgroundColor: false, clearCanvas: false, export: false, loadScene: false, saveToActiveFile: false, toggleTheme: false, saveAsImage: false }, tools: { image: false } }}
      />
    </div>
    <div className="map-mobile-outline" aria-label="Map ideas">
      {mobileNodes.map((node) => { const kind = node.kind === "grounded" ? "Evidence" : node.kind === "derived" ? "Synthesis" : "Direction"; return <button type="button" key={node.id} aria-label={`${kind}: ${node.title}`} className={`map-outline-node ${selectedNodeId === node.id ? "selected" : ""}`} onClick={() => onSelectNode(selectedNodeId === node.id ? "" : node.id)}><span>{kind}</span><strong>{node.kind === "grounded" ? node.body : node.title}</strong><small>{node.locator}</small></button>; })}
    </div>
  </div>;
}
