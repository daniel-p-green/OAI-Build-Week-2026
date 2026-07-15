import { describe, expect, it } from "vitest";
import { mutationGate, toolDefinitions } from "./tools.js";

describe("WorkshopLM plugin tools", () => {
  it("publishes the complete compact doorway tool surface", () => {
    expect(toolDefinitions.map((tool) => tool.name)).toContain("workshop_render_video");
    expect(toolDefinitions.filter((tool) => tool.kind === "read").map((tool) => tool.name)).toEqual(expect.arrayContaining(["search", "fetch", "workshop_get_trace"]));
  });
  it("advertises accurate MCP safety annotations", () => {
    expect(toolDefinitions.filter((tool) => tool.kind === "read").every((tool) => tool.annotations.readOnlyHint && !tool.annotations.destructiveHint && !tool.annotations.openWorldHint)).toBe(true);
    expect(toolDefinitions.filter((tool) => tool.kind === "write").every((tool) => !tool.annotations.readOnlyHint && !tool.annotations.destructiveHint && !tool.annotations.openWorldHint)).toBe(true);
  });
  it("does not bypass approval gates", () => {
    expect(mutationGate("workshop_render_video", { storyboardApproved: false, storyboardCurrent: true })).toMatch(/blocked/);
  });
});
