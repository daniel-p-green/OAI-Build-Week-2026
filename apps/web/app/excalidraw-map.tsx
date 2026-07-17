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
const sourceShapeId = (sourceId: string) => `map-source-${sourceId}`;
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

function sceneSkeleton(nodes: ExcalidrawMapNode[], sources: Source[], edges: MapEdge[], style?: MapStyle) {
  const accent = style?.accent ?? "#0285ff";
  const ink = style?.ink ?? "#171816";
  const activeSourceIds = new Set(sources.map((source) => source.id));
  const nodeIds = new Set(nodes.map((node) => node.id));
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const sourceGeometry = new Map(sources.map((source, index) => [source.id, { x: 24, y: 70 + index * 180, width: 184, height: 108 }]));
  const nodeGeometry = new Map(nodes.map((node) => [node.id, { x: toSceneX(node.x), y: toSceneY(node.y), width: toSceneWidth(node.width), height: toSceneY(node.height) }]));
  const clusterDescriptors = ([
    { id: "map-cluster-evidence", text: "EVIDENCE", kind: "grounded", fill: "#eef8f1", stroke: "#008635" },
    { id: "map-cluster-synthesis", text: "SYNTHESIS", kind: "derived", fill: "#f3f3f3", stroke: ink },
    { id: "map-cluster-direction", text: "DIRECTION", kind: "creative", fill: `${accent}12`, stroke: accent },
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
    strokeColor: `${cluster.stroke}28`,
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
    fontSize: 11,
    fontFamily: 2 as const,
    strokeColor: `${cluster.stroke}c4`,
    locked: true,
  }));
  const sourceShapes = sources.map((source) => {
    const geometry = sourceGeometry.get(source.id)!;
    return {
      type: "rectangle" as const,
      id: sourceShapeId(source.id),
      ...geometry,
      label: { text: `${sourceType(source)}  ${sourceTitle(source)}\n${source.claimCount} ${source.claimCount === 1 ? "claim" : "claims"}`, fontSize: 13, fontFamily: 2 as const, textAlign: "left" as const },
      customData: { sourceId: source.id },
      backgroundColor: `${ink}08`,
      strokeColor: `${ink}85`,
      strokeWidth: 1.25,
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
    backgroundColor: node.kind === "grounded" ? "#eef8f1" : node.kind === "derived" ? "#f3f3f3" : `${accent}12`,
    strokeColor: node.kind === "grounded" ? "#008635" : node.kind === "derived" ? `${ink}9a` : accent,
    strokeWidth: node.kind === "creative" ? 2.25 : 1.5,
    fillStyle: "solid" as const,
    roughness: 0,
    roundness: { type: 3 as const },
  }));

  const linkedSourceIds = new Set<string>();
  const sourceLinks = nodes.flatMap((node, index) => {
    const sourceId = node.sourceId ?? (node.kind === "grounded" ? sources[index % Math.max(1, sources.length)]?.id : undefined);
    if (!sourceId || !activeSourceIds.has(sourceId) || linkedSourceIds.has(sourceId)) return [];
    const start = sourceGeometry.get(sourceId);
    const end = nodeGeometry.get(node.id);
    if (!start || !end) return [];
    linkedSourceIds.add(sourceId);
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
      strokeColor: `${ink}54`,
      strokeWidth: 1.4,
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
      strokeColor: edge.kind === "contradicts" ? "#e02e2a" : nodeById.get(edge.to)?.kind === "creative" ? accent : `${ink}88`,
      strokeWidth: nodeById.get(edge.to)?.kind === "creative" ? 2.5 : 1.5,
      roughness: 0,
      endArrowhead: "arrow" as const,
      locked: true,
    }];
  });

  return [...clusterFrames, ...sourceLinks, ...graphLinks, ...clusterLabels, ...sourceShapes, ...nodeShapes];
}

export function ExcalidrawMap({ nodes, sources, edges, style, selectedNodeId, onSelectNode, onShowSource, onSync }: {
  nodes: ExcalidrawMapNode[];
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

  const mobileNodes = [...nodes].sort((left, right) => ({ creative: 0, derived: 1, grounded: 2 })[left.kind] - ({ creative: 0, derived: 1, grounded: 2 })[right.kind]);

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
      {mobileNodes.map((node) => <button type="button" key={node.id} className={`map-outline-node ${selectedNodeId === node.id ? "selected" : ""}`} onClick={() => onSelectNode(selectedNodeId === node.id ? "" : node.id)}><span>{node.kind === "grounded" ? "Evidence" : node.kind === "derived" ? "Synthesis" : "Direction"}</span><strong>{node.title}</strong><small>{node.locator}</small></button>)}
    </div>
  </div>;
}
