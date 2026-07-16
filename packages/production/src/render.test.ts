import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fitLogoBox, renderDeck, renderInfographic, writeRenderedArtifact } from "./render.js";

const brief = { workshopTitle: "WorkshopLM", version: "brief-v1", style: { accent: "#1668E3", ink: "#171816", paper: "#F4F2EC", fonts: ["Arial", "Arial"], intent: "client_facing_pitch" as const, name: "WorkshopLM", logoData: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEAQH/6X8XWQAAAABJRU5ErkJggg==" }, blocks: [
  { id: "claim-1", heading: "A traced claim", body: "Evidence remains inspectable.", citations: ["meeting · 12:41"] },
  { id: "claim-2", heading: "A second proof point", body: "The layout adapts to the role of the content.", citations: ["brief · section 2"] },
  { id: "claim-3", heading: "The recommendation", body: "Move from understanding to finished work.", citations: ["strategy · recommendation"] },
] };
describe("production renderers", () => {
  it("fits wide and tall brand marks without changing their proportions", () => {
    expect(fitLogoBox(4, 1.6, 0.68)).toEqual({ width: 1.6, height: 0.4 });
    expect(fitLogoBox(0.5, 1.6, 0.68)).toEqual({ width: 0.34, height: 0.68 });
    expect(fitLogoBox(undefined, 1.6, 0.68)).toEqual({ width: 0.68, height: 0.68 });
  });
  it("renders varied source-traceable layouts into deck and infographic HTML", () => {
    const deck = renderDeck(brief);
    expect(deck).toContain("meeting · 12:41");
    expect(deck).toContain('class="slide cover"');
    expect(deck).toContain('class="slide statement"');
    expect(deck).toContain('class="slide split"');
    expect(deck).toContain('class="slide recommendation"');
    expect(deck).toContain('class="brand-logo"');
    expect(deck).toContain("WorkshopLM · Client presentation");
    const infographic = renderInfographic(brief);
    expect(infographic).toContain("Source-defensible brief");
    expect(infographic).toContain('class="infographic-grid"');
    expect(infographic.match(/<article class="block">/g)).toHaveLength(3);
  });
  it("treats a claim with no supporting sentence as an intentional sparse slide", () => {
    const deck = renderDeck({ ...brief, blocks: [{ id: "claim-only", heading: "One defensible statement", body: "", citations: ["meeting · 12:41"], layout: "statement" }] });
    expect(deck).toContain('class="slide statement is-sparse"');
    expect(deck).not.toContain('<p class="body"></p>');
    expect(deck).toContain("02 · Core insight");
  });
  it("renders a sparse split claim as an intentional dark editorial composition", () => {
    const deck = renderDeck({ ...brief, blocks: [{ id: "claim-only", heading: "A decisive change", body: "", citations: ["meeting · 12:41"], layout: "split" }] });
    expect(deck).toContain('class="slide split is-sparse"');
    expect(deck).toContain(".split.is-sparse{display:flex;align-items:center;background:var(--ink)");
    expect(deck).toContain("A decisive change");
    expect(deck).not.toContain('<p class="body"></p>');
  });
  it("turns numeric proof into client-facing metrics while keeping exact trace metadata", () => {
    const deck = renderDeck({ ...brief, blocks: [{ id: "scale", heading: "180+ chapters across 40+ countries", body: "A global network supported by 400+ volunteer organizers.", citations: ["newsletter · chunk 79"], citationLabel: "AI Collective Newsletter · chunk 79", layout: "proof" }] });
    expect(deck).toContain('class="slide proof metrics"');
    expect(deck).toContain("<strong>180+</strong><span>chapters</span>");
    expect(deck).toContain("<strong>40+</strong><span>countries</span>");
    expect(deck).toContain("Source: AI Collective Newsletter");
    expect(deck).not.toContain("Source: AI Collective Newsletter · chunk 79");
    expect(deck).toContain('data-source="newsletter · chunk 79"');
  });
  it("chooses readable foreground text for a light brand accent", () => {
    const deck = renderDeck({ ...brief, style: { ...brief.style, accent: "#FF97E2", ink: "#171816", paper: "#FFFFFF" } });
    expect(deck).toContain("--accent-foreground:#000000");
    expect(deck).toContain("color:var(--accent-foreground)");
  });
  it("turns Intent Profiles into distinct visual and editorial systems", () => {
    const client = renderDeck(brief);
    const board = renderDeck({ ...brief, style: { ...brief.style, intent: "board_deck" } });
    const workshop = renderDeck({ ...brief, style: { ...brief.style, intent: "internal_workshop" } });
    expect(client).toContain('class="deck intent-client-facing-pitch" data-intent="client_facing_pitch"');
    expect(client).toContain("02 · Core insight");
    expect(board).toContain('class="deck intent-board-deck" data-intent="board_deck"');
    expect(board).toContain("WorkshopLM · Board presentation");
    expect(board).toContain("02 · Executive summary");
    expect(board).toContain(".intent-board-deck .cover{background:var(--paper)");
    expect(workshop).toContain('class="deck intent-internal-workshop" data-intent="internal_workshop"');
    expect(workshop).toContain("02 · Working point");
    expect(workshop).toContain(".intent-internal-workshop .cover{background:var(--accent)");
    expect(workshop).toContain(".intent-internal-workshop .split.is-sparse{background:color-mix");
    expect(new Set([client, board, workshop]).size).toBe(3);
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
