import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderDeck, renderInfographic, writeRenderedArtifact } from "./render.js";

const brief = { workshopTitle: "WorkshopLM", version: "brief-v1", style: { accent: "#1668E3", ink: "#171816", paper: "#F4F2EC" }, blocks: [{ id: "claim-1", heading: "A traced claim", body: "Evidence remains inspectable.", citations: ["meeting · 12:41"] }] };
describe("production renderers", () => {
  it("renders source locators into deck and infographic HTML", () => {
    expect(renderDeck(brief)).toContain("meeting · 12:41");
    expect(renderInfographic(brief)).toContain("SOURCE-TRACEABLE INFOGRAPHIC");
  });
  it("writes an inspectable deterministic artifact", async () => {
    const root = await mkdtemp(join(tmpdir(), "workshoplm-production-"));
    const artifact = await writeRenderedArtifact(root, "out-1", "deck", brief);
    expect(await readFile(join(root, artifact.relativePath), "utf8")).toContain("A traced claim");
    await rm(root, { recursive: true, force: true });
  });
});
