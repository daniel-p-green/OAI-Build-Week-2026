import { describe, expect, it } from "vitest";
import { mutationGate, toolDefinitions } from "./tools.js";

describe("WorkshopLM plugin tools", () => {
  it("publishes the complete compact doorway tool surface", () => {
    expect(toolDefinitions.map((tool) => tool.name)).toContain("workshop_render_video");
    expect(toolDefinitions.filter((tool) => tool.kind === "read").map((tool) => tool.name)).toEqual(expect.arrayContaining(["search", "fetch", "workshop_get_trace"]));
  });
  it("does not bypass approval gates", () => {
    expect(mutationGate("workshop_render_video", { storyboardApproved: false, storyboardCurrent: true })).toMatch(/blocked/);
  });
});
