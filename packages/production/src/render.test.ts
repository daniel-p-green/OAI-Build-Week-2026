import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { renderDeck, renderInfographic, writeRenderedArtifact } from "./render.js";

const brief = { workshopTitle: "WorkshopLM", version: "brief-v1", style: { accent: "#1668E3", ink: "#171816", paper: "#F4F2EC", fonts: ["Arial", "Arial"], intent: "client_facing_pitch" as const, name: "WorkshopLM", logoData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEAQH/6X8XWQAAAABJRU5ErkJggg==" }, blocks: [
  { id: "claim-1", heading: "A traced claim", body: "Evidence remains inspectable.", citations: ["meeting · 12:41"] },
  { id: "claim-2", heading: "A second proof point", body: "The layout adapts to the role of the content.", citations: ["brief · section 2"] },
  { id: "claim-3", heading: "The recommendation", body: "Move from understanding to finished work.", citations: ["strategy · recommendation"] },
] };
describe("production renderers", () => {
  it("renders varied source-traceable layouts into deck and infographic HTML", () => {
    const deck = renderDeck(brief);
    expect(deck).toContain("meeting · 12:41");
    expect(deck).toContain('class="slide cover"');
    expect(deck).toContain('class="slide statement"');
    expect(deck).toContain('class="slide split"');
    expect(deck).toContain('class="slide recommendation"');
    expect(deck).toContain('class="brand-logo"');
    expect(deck).toContain("WorkshopLM · Organizer brief");
    expect(renderInfographic(brief)).toContain("Source-defensible brief");
  });
  it("writes an inspectable preview and an editable PowerPoint deck", async () => {
    const root = await mkdtemp(join(tmpdir(), "workshoplm-production-"));
    const artifact = await writeRenderedArtifact(root, "out-1", "deck", brief);
    expect(await readFile(join(root, artifact.relativePath), "utf8")).toContain("A traced claim");
    expect(artifact.editableRelativePath).toBe("generated/out-1.presentation.pptx");
    const pptx = await readFile(join(root, artifact.editableRelativePath!));
    expect(pptx.subarray(0, 2).toString()).toBe("PK");
    expect(pptx.byteLength).toBeGreaterThan(10_000);
    await rm(root, { recursive: true, force: true });
  });
  it("writes an editable one-slide PowerPoint infographic", async () => {
    const root = await mkdtemp(join(tmpdir(), "workshoplm-infographic-"));
    const artifact = await writeRenderedArtifact(root, "out-2", "infographic", brief);
    expect(await readFile(join(root, artifact.relativePath), "utf8")).toContain("Source-defensible brief");
    expect(artifact.editableRelativePath).toBe("generated/out-2.infographic.pptx");
    const pptx = await readFile(join(root, artifact.editableRelativePath!));
    expect(pptx.subarray(0, 2).toString()).toBe("PK");
    expect(pptx.byteLength).toBeGreaterThan(10_000);
    await rm(root, { recursive: true, force: true });
  });
  it("escapes source content before placing it in HTML", () => {
    expect(renderDeck({ ...brief, blocks: [{ id: "unsafe", heading: "<script>", body: "A & B", citations: ["source > line"] }] })).not.toContain("<script>");
  });
});
