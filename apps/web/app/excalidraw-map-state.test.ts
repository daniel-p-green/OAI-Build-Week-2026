import { describe, expect, it } from "vitest";
import { baselineFromScene, patchesFromScene, type MapNodeGeometry, type MapSceneElement } from "./excalidraw-map-state";

const node: MapNodeGeometry = { id: "one", title: "Original", x: 10, y: 20, width: 24, height: 16 };
const normalizedScene: MapSceneElement[] = [
  { id: "map-node-one", type: "rectangle", x: 300, y: 130, width: 260, height: 112 },
  { id: "label-one", type: "text", x: 300, y: 130, width: 200, height: 30, text: "Original", containerId: "map-node-one" },
];

describe("Excalidraw Map persistence", () => {
  it("treats Excalidraw's normalized initial geometry as an unchanged baseline", () => {
    const baseline = baselineFromScene([node], normalizedScene);
    expect(baseline).not.toBeNull();
    expect(patchesFromScene([node], normalizedScene, baseline!)).toEqual([]);
  });

  it("persists user deltas without writing Excalidraw's normalization back to the domain", () => {
    const baseline = baselineFromScene([node], normalizedScene)!;
    const moved = normalizedScene.map((element) => element.id === "map-node-one" ? { ...element, x: element.x + 74.5 } : element);
    expect(patchesFromScene([node], moved, baseline)).toEqual([{ ...node, x: 20 }]);
  });

  it("persists an edited label", () => {
    const baseline = baselineFromScene([node], normalizedScene)!;
    const renamed = normalizedScene.map((element) => element.id === "label-one" ? { ...element, text: "Revised" } : element);
    expect(patchesFromScene([node], renamed, baseline)).toEqual([{ ...node, title: "Revised" }]);
  });

  it("ignores Excalidraw line wrapping in a fitted label", () => {
    const baseline = baselineFromScene([node], normalizedScene)!;
    const wrapped = normalizedScene.map((element) => element.id === "label-one" ? { ...element, text: "Orig\ninal" } : element);
    expect(patchesFromScene([node], wrapped, baseline)).toEqual([{ ...node, title: "Orig inal" }]);

    const phraseNode = { ...node, title: "Continuous Capture → Shape → Deliver path" };
    const phraseScene = normalizedScene.map((element) => element.id === "label-one" ? { ...element, text: "Continuous Capture → Shape\n→ Deliver path" } : element);
    const phraseBaseline = baselineFromScene([phraseNode], phraseScene)!;
    expect(patchesFromScene([phraseNode], phraseScene, phraseBaseline)).toEqual([]);
  });
});
