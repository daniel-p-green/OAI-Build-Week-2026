"use client";

import dynamic from "next/dynamic";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { useEffect, useMemo, useRef } from "react";

const Excalidraw = dynamic(() => import("@excalidraw/excalidraw").then((module) => module.Excalidraw), { ssr: false });

type MapNode = { id: string; title: string; body: string; kind: "grounded" | "derived" | "creative"; x: number; y: number };
type CanvasNodePatch = Pick<MapNode, "id" | "title" | "x" | "y">;
type SceneElement = { id: string; x: number; y: number; text?: string };

export function ExcalidrawMap({ nodes, editable, onSync }: { nodes: MapNode[]; editable: boolean; onSync: (nodes: CanvasNodePatch[]) => void }) {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null); const lastSent = useRef(""); useEffect(() => () => { if (timeout.current) clearTimeout(timeout.current); }, []);
  const elements = useMemo(() => convertToExcalidrawElements(nodes.flatMap((node) => {
    const backgroundColor = node.kind === "grounded" ? "#e4f2eb" : node.kind === "derived" ? "#f7edd8" : "#eee8fa";
    return [
      { type: "rectangle" as const, id: `shape-${node.id}`, x: node.x * 10, y: node.y * 7, width: 210, height: 110, backgroundColor, strokeColor: "#171816", roughness: 1, locked: true },
      { type: "text" as const, id: `label-${node.id}`, x: node.x * 10 + 14, y: node.y * 7 + 14, text: node.title, fontSize: 18, width: 182, height: 22 },
      { type: "text" as const, id: `body-${node.id}`, x: node.x * 10 + 14, y: node.y * 7 + 45, text: node.body.slice(0, 96), fontSize: 13, width: 182, height: 48, locked: true },
    ];
  })), [nodes]);

  const key = nodes.map((node) => `${node.id}:${node.title}:${node.x}:${node.y}`).join("|");
  function onChange(scene: readonly SceneElement[]) {
    if (!editable) return;
    const changed = nodes.flatMap((node) => { const shape = scene.find((element) => element.id === `shape-${node.id}`); const label = scene.find((element) => element.id === `label-${node.id}`); const title = label?.text?.trim() || node.title; const x = shape ? shape.x / 10 : node.x; const y = shape ? shape.y / 7 : node.y; return title !== node.title || x !== node.x || y !== node.y ? [{ id: node.id, title, x, y }] : []; }); const signature = JSON.stringify(changed); if (!changed.length || signature === lastSent.current) return;
    if (timeout.current) clearTimeout(timeout.current); timeout.current = setTimeout(() => { lastSent.current = signature; onSync(changed); }, 600);
  }
  return <div className="excalidraw-map" aria-label="Excalidraw Map"><Excalidraw key={key} initialData={{ elements, appState: { viewBackgroundColor: "#f4f2ec" } }} viewModeEnabled={!editable} onChange={onChange} /></div>;
}
