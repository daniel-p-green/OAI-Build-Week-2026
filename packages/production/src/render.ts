import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

export type RenderBlock = { id: string; heading: string; body: string; citations: readonly string[] };
export type RenderBrief = { workshopTitle: string; version: string; style: { accent: string; ink: string; paper: string }; blocks: readonly RenderBlock[] };
export type RenderedArtifact = { type: "deck" | "infographic"; relativePath: string; contentType: "text/html"; sourceBlockIds: readonly string[] };

function shell(title: string, brief: RenderBrief, body: string) {
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${title}</title><style>body{margin:0;background:${brief.style.paper};color:${brief.style.ink};font-family:Arial,sans-serif}.page{padding:64px;min-height:640px;box-sizing:border-box}.eyebrow{color:${brief.style.accent};font-size:12px;font-weight:700;letter-spacing:.12em}.title{font:500 52px Georgia,serif;max-width:850px}.block{border-top:1px solid #d9d7d0;padding:22px 0}.cite{font:12px ui-monospace,monospace;color:#686963}</style></head><body>${body}</body></html>`;
}

export function renderDeck(brief: RenderBrief): string {
  const slides = brief.blocks.map((block, index) => `<section class="page"><div class="eyebrow">${String(index + 1).padStart(2, "0")} · ${brief.version}</div><h1 class="title">${block.heading}</h1><p>${block.body}</p><p class="cite">${block.citations.join(" · ")}</p></section>`).join("\n");
  return shell(`${brief.workshopTitle} deck`, brief, slides);
}

export function renderInfographic(brief: RenderBrief): string {
  const blocks = brief.blocks.map((block, index) => `<article class="block"><div class="eyebrow">${String(index + 1).padStart(2, "0")}</div><h2>${block.heading}</h2><p>${block.body}</p><p class="cite">${block.citations.join(" · ")}</p></article>`).join("\n");
  return shell(`${brief.workshopTitle} infographic`, brief, `<main class="page"><div class="eyebrow">SOURCE-TRACEABLE INFOGRAPHIC</div><h1 class="title">${brief.workshopTitle}</h1>${blocks}</main>`);
}

export async function writeRenderedArtifact(root: string, id: string, type: RenderedArtifact["type"], brief: RenderBrief): Promise<RenderedArtifact> {
  const relativePath = join("generated", `${id}.${type}.html`);
  await mkdir(join(root, "generated"), { recursive: true });
  await writeFile(join(root, relativePath), type === "deck" ? renderDeck(brief) : renderInfographic(brief), "utf8");
  return { type, relativePath, contentType: "text/html", sourceBlockIds: brief.blocks.map((block) => block.id) };
}
