"use client";

import dynamic from "next/dynamic";
import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { useMemo } from "react";

const Excalidraw = dynamic(() => import("@excalidraw/excalidraw").then((module) => module.Excalidraw), { ssr: false });

type MapNode = { id: string; title: string; body: string; kind: "grounded" | "derived" | "creative"; x: number; y: number };

export function ExcalidrawMap({ nodes }: { nodes: MapNode[] }) {
  const elements = useMemo(() => convertToExcalidrawElements(nodes.flatMap((node) => {
    const backgroundColor = node.kind === "grounded" ? "#e4f2eb" : node.kind === "derived" ? "#f7edd8" : "#eee8fa";
    return [
      { type: "rectangle" as const, id: `shape-${node.id}`, x: node.x * 10, y: node.y * 7, width: 210, height: 110, backgroundColor, strokeColor: "#171816", roughness: 1 },
      { type: "text" as const, id: `label-${node.id}`, x: node.x * 10 + 14, y: node.y * 7 + 14, text: node.title, fontSize: 18, width: 182, height: 22, containerId: `shape-${node.id}` },
      { type: "text" as const, id: `body-${node.id}`, x: node.x * 10 + 14, y: node.y * 7 + 45, text: node.body.slice(0, 96), fontSize: 13, width: 182, height: 48, containerId: `shape-${node.id}` },
    ];
  })), [nodes]);

  return <div className="excalidraw-map" aria-label="Excalidraw Map projection"><Excalidraw initialData={{ elements, appState: { viewBackgroundColor: "#f4f2ec" } }} viewModeEnabled /></div>;
}
