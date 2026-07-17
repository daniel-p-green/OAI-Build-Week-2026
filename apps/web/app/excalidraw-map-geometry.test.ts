import { describe, expect, it } from "vitest";
import { connectionBetween } from "./excalidraw-map-geometry";

describe("Map connection geometry", () => {
  it("connects horizontal cards at their visible edges", () => {
    expect(connectionBetween(
      { x: 10, y: 20, width: 100, height: 60 },
      { x: 210, y: 20, width: 100, height: 60 },
    )).toEqual({ x: 110, y: 50, width: 100, height: 0 });
  });

  it("clips diagonal relationships to both card boundaries", () => {
    expect(connectionBetween(
      { x: 0, y: 0, width: 100, height: 100 },
      { x: 200, y: 100, width: 100, height: 100 },
    )).toEqual({ x: 100, y: 75, width: 100, height: 50 });
  });
});
