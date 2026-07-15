const SCENE_HEIGHT = 650;
const SCENE_WIDTH = 1000;
const NODE_SCALE_X = 7.45;

export type MapNodeGeometry = {
  id: string;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

export type CanvasNodePatch = MapNodeGeometry;

export type MapSceneElement = {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  containerId?: string | null;
  isDeleted?: boolean;
};

export type SceneNodeBaseline = {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
};

const shapeId = (nodeId: string) => `map-node-${nodeId}`;
const rounded = (value: number) => Math.round(value * 10) / 10;

export function baselineFromScene(nodes: MapNodeGeometry[], scene: readonly MapSceneElement[]) {
  const baseline = new Map<string, SceneNodeBaseline>();

  for (const node of nodes) {
    const shape = scene.find((element) => element.id === shapeId(node.id) && !element.isDeleted);
    if (!shape) return null;
    const label = scene.find((element) => element.containerId === shape.id && element.type === "text" && !element.isDeleted);
    baseline.set(node.id, {
      x: shape.x,
      y: shape.y,
      width: shape.width,
      height: shape.height,
      title: label?.text?.trim() || node.title,
    });
  }

  return baseline;
}

export function patchesFromScene(
  nodes: MapNodeGeometry[],
  scene: readonly MapSceneElement[],
  baseline: ReadonlyMap<string, SceneNodeBaseline>,
): CanvasNodePatch[] {
  return nodes.flatMap((node) => {
    const initial = baseline.get(node.id);
    const shape = scene.find((element) => element.id === shapeId(node.id) && !element.isDeleted);
    if (!initial || !shape) return [];
    const label = scene.find((element) => element.containerId === shape.id && element.type === "text" && !element.isDeleted);
    const patch = {
      id: node.id,
      title: label?.text?.trim() || initial.title,
      x: rounded(node.x + (shape.x - initial.x) / NODE_SCALE_X),
      y: rounded(node.y + (shape.y - initial.y) / (SCENE_HEIGHT / 100)),
      width: rounded(node.width + (shape.width - initial.width) / (SCENE_WIDTH / 100)),
      height: rounded(node.height + (shape.height - initial.height) / (SCENE_HEIGHT / 100)),
    };
    const changed = patch.title !== node.title || patch.x !== node.x || patch.y !== node.y || patch.width !== node.width || patch.height !== node.height;
    return changed ? [patch] : [];
  });
}
