import { describe, expect, it } from "vitest";
import storyboardFixture from "../storyboard.json" with { type: "json" };
import { buildComposition, buildIndexHtml, type ApprovedStoryboard } from "./build-composition.js";

const storyboard = storyboardFixture as ApprovedStoryboard;

describe("approved storyboard composition", () => {
  it("builds three deterministic narrated scenes with exact approvals and disclosure", () => {
    const composition = buildComposition(storyboard);
    expect(composition.durationSeconds).toBe(6);
    expect(composition.scenes).toHaveLength(3);
    expect(composition.scenes.map((scene) => [scene.id, scene.startSeconds, scene.endSeconds])).toEqual([
      ["panel-1", 0, 2], ["panel-2", 2, 4], ["panel-3", 4, 6],
    ]);
    expect(composition.scenes.every((scene) => scene.audioPath.startsWith("assets/"))).toBe(true);
    expect(composition.scenes.every((scene) => scene.storyboardVersion === 1 && scene.designVersion === "workshoplm-design-v1")).toBe(true);
    expect(buildIndexHtml(composition)).toContain("Narration: AI-generated voice");
    expect(buildIndexHtml(composition)).toContain(storyboard.panels[1]!.caption);
  });

  it("rejects stale and unapproved storyboard versions", () => {
    expect(() => buildComposition({ ...storyboard, status: "draft" })).toThrow("approved");
    expect(() => buildComposition({ ...storyboard, stale: true })).toThrow("stale");
  });
});
