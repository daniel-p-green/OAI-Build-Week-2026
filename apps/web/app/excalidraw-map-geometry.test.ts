import { describe, expect, it } from "vitest";
import { connectionBetween, semanticConnectionBetween } from "./excalidraw-map-geometry";

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

  it("routes semantic layers through the whitespace between them", () => {
    expect(semanticConnectionBetween(
      { x: 20, y: 20, width: 180, height: 100 },
      { x: 320, y: 240, width: 220, height: 120 },
    )).toEqual({
      x: 200,
      y: 70,
      width: 120,
      height: 230,
      points: [[0, 0], [60, 0], [60, 230], [120, 230]],
    });
  });

  it("falls back to boundary clipping after a professional rearranges nodes", () => {
    expect(semanticConnectionBetween(
      { x: 210, y: 20, width: 100, height: 60 },
      { x: 10, y: 20, width: 100, height: 60 },
    )).toEqual({ x: 210, y: 50, width: -100, height: 0 });
  });
});
