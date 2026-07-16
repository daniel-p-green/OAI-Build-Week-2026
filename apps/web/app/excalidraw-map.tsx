"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import { baselineFromScene, patchesFromScene, type CanvasNodePatch, type MapSceneElement, type SceneNodeBaseline } from "./excalidraw-map-state";

const Excalidraw = dynamic(() => import("@excalidraw/excalidraw").then((module) => module.Excalidraw), { ssr: false });

const SCENE_WIDTH = 1000;
const SCENE_HEIGHT = 650;
const NODE_OFFSET_X = 205;
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

type Source = { id: string; type: "TXT" | "PDF" | "WEB"; title: string; claimCount: number };
type MapEdge = { id: string; from: string; to: string; kind: string; label?: string };
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
const sourceShapeId = (sourceId: string) => `map-source-${sourceId}`;
const toSceneX = (value: number) => NODE_OFFSET_X + value * NODE_SCALE_X;
const toSceneY = (value: number) => value * (SCENE_HEIGHT / 100);
const toSceneWidth = (value: number) => value * (SCENE_WIDTH / 100);

function sceneSkeleton(nodes: ExcalidrawMapNode[], sources: Source[], edges: MapEdge[]) {
  const activeSourceIds = new Set(sources.map((source) => source.id));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const sourceGeometry = new Map(sources.map((source, index) => [source.id, { x: 24, y: 70 + index * 180, width: 174, height: 108 }]));
  const nodeGeometry = new Map(nodes.map((node) => [node.id, { x: toSceneX(node.x), y: toSceneY(node.y), width: toSceneWidth(node.width), height: toSceneY(node.height) }]));
  const sourceShapes = sources.map((source) => {
    const geometry = sourceGeometry.get(source.id)!;
    return {
      type: "rectangle" as const,
      id: sourceShapeId(source.id),
      ...geometry,
      label: { text: `${source.type}  ${source.title}\n${source.claimCount} claims`, fontSize: 12, fontFamily: 2 as const, textAlign: "left" as const },
      customData: { sourceId: source.id },
      backgroundColor: "#f3f3f3",
      strokeColor: "#b4b4b4",
      strokeWidth: 1,
      fillStyle: "solid" as const,
      roughness: 0,
      roundness: { type: 3 as const },
    };
  });
  const nodeShapes = nodes.map((node) => ({
    type: "rectangle" as const,
    id: shapeId(node.id),
    x: toSceneX(node.x),
    y: toSceneY(node.y),
    width: toSceneWidth(node.width),
    height: toSceneY(node.height),
    label: { text: node.title, fontSize: 17, fontFamily: 2 as const, textAlign: "left" as const, verticalAlign: "middle" as const },
    customData: { nodeId: node.id },
    backgroundColor: node.kind === "grounded" ? "#e8f7ee" : node.kind === "derived" ? "#fff1e8" : "#eaf3ff",
    strokeColor: node.kind === "grounded" ? "#008635" : node.kind === "derived" ? "#e25507" : "#0285ff",
    strokeWidth: 1.5,
    fillStyle: "solid" as const,
    roughness: 0,
    roundness: { type: 3 as const },
  }));

  const sourceLinks = nodes.flatMap((node, index) => {
    const sourceId = node.sourceId ?? (node.kind === "grounded" ? sources[index % Math.max(1, sources.length)]?.id : undefined);
    if (!sourceId || !activeSourceIds.has(sourceId)) return [];
    const start = sourceGeometry.get(sourceId);
    const end = nodeGeometry.get(node.id);
    if (!start || !end) return [];
    const x = start.x + start.width;
    const y = start.y + start.height / 2;
    return [{
      type: "arrow" as const,
      id: `source-edge-${sourceId}-${node.id}`,
      x,
      y,
      width: end.x - x,
      height: end.y + end.height / 2 - y,
      start: { id: sourceShapeId(sourceId) },
      end: { id: shapeId(node.id) },
      strokeColor: "#b4b4b4",
      strokeWidth: 1.2,
      roughness: 0,
      endArrowhead: "arrow" as const,
      locked: true,
    }];
  });
  const graphLinks = edges.flatMap((edge) => {
    if (!nodeIds.has(edge.from) || !nodeIds.has(edge.to)) return [];
    const start = nodeGeometry.get(edge.from);
    const end = nodeGeometry.get(edge.to);
    if (!start || !end) return [];
    const x = start.x + start.width / 2;
    const y = start.y + start.height / 2;
    return [{
      type: "arrow" as const,
      id: `graph-edge-${edge.id}`,
      x,
      y,
      width: end.x + end.width / 2 - x,
      height: end.y + end.height / 2 - y,
      start: { id: shapeId(edge.from) },
      end: { id: shapeId(edge.to) },
      label: edge.label ? { text: edge.label, fontSize: 12, fontFamily: 2 as const } : undefined,
      strokeColor: edge.kind === "contradicts" ? "#e02e2a" : "#8f8f8f",
      strokeWidth: 1.5,
      roughness: 0,
      endArrowhead: "arrow" as const,
      locked: true,
    }];
  });

  return [...sourceShapes, ...nodeShapes, ...sourceLinks, ...graphLinks];
}

export function ExcalidrawMap({ nodes, sources, edges, selectedNodeId, onSelectNode, onShowSource, onSync }: {
  nodes: ExcalidrawMapNode[];
  sources: Source[];
  edges: MapEdge[];
  selectedNodeId?: string;
  onSelectNode: (id: string) => void;
  onShowSource: (id: string) => void;
  onSync: (nodes: CanvasNodePatch[]) => void;
}) {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fitFrame = useRef<number | null>(null);
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const baseline = useRef<Map<string, SceneNodeBaseline> | null>(null);
  const lastSent = useRef("");
  const lastSelection = useRef("");
  const skeleton = useMemo(() => sceneSkeleton(nodes, sources, edges), [nodes, sources, edges]);
  const sceneKey = nodes.map((node) => `${node.id}:${node.title}:${node.x}:${node.y}:${node.width}:${node.height}`).join("|");
  const initialData = useMemo(() => async () => {
    const { convertToExcalidrawElements } = await import("@excalidraw/excalidraw");
    return { elements: convertToExcalidrawElements(skeleton, { regenerateIds: false }), appState: { viewBackgroundColor: "#ffffff", selectedElementIds: selectedNodeId ? { [shapeId(selectedNodeId)]: true } : {} } };
  }, [skeleton, selectedNodeId]);

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

  function fitScene(api = apiRef.current) {
    if (!api) return;
    if (fitFrame.current !== null) cancelAnimationFrame(fitFrame.current);
    fitFrame.current = requestAnimationFrame(() => {
      fitFrame.current = requestAnimationFrame(() => {
        const elements = api.getSceneElements();
        if (elements.length) api.scrollToContent(elements, { fitToViewport: true, viewportZoomFactor: 0.88, minZoom: 0.35, maxZoom: 1, animate: false });
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

  return <div className="semantic-map" data-domain-ui="excalidraw-map">
    <div className="excalidraw-map" aria-label="Editable semantic Map" onContextMenu={(event) => event.preventDefault()}>
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
      {nodes.map((node) => <button type="button" key={node.id} className={`map-outline-node ${selectedNodeId === node.id ? "selected" : ""}`} onClick={() => onSelectNode(selectedNodeId === node.id ? "" : node.id)}><span>{node.kind === "grounded" ? "Verified" : node.kind === "derived" ? "Derived" : "Idea"}</span><strong>{node.title}</strong><small>{node.locator}</small></button>)}
    </div>
  </div>;
}
