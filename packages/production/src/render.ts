import { mkdir, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

type PptxSlide = {
  background: { color: string };
  addImage: (options: Record<string, unknown>) => unknown;
  addShape: (shape: string, options: Record<string, unknown>) => unknown;
  addText: (text: string, options: Record<string, unknown>) => unknown;
  addNotes: (notes: string) => unknown;
};
type PptxPresentation = {
  layout: string; author: string; subject: string; title: string; company: string; lang: string;
  theme: { headFontFace: string; bodyFontFace: string; lang: string };
  ShapeType: { ellipse: string; rect: string };
  addSlide: () => PptxSlide;
  writeFile: (options: { fileName: string; compression: boolean }) => Promise<string>;
};
const PptxGenJS = createRequire(import.meta.url)("pptxgenjs") as new () => PptxPresentation;

export type SlideLayout = "statement" | "split" | "proof" | "recommendation";
export type RenderBlock = { id: string; heading: string; body: string; citations: readonly string[]; citationLabel?: string; layout?: SlideLayout };
export type RenderBrief = {
  workshopTitle: string;
  version: string;
  style: {
    accent: string;
    ink: string;
    paper: string;
    fonts?: readonly string[];
    intent?: "client_facing_pitch" | "board_deck" | "internal_workshop";
    name?: string;
    logoData?: string;
  };
  blocks: readonly RenderBlock[];
};
export type RenderedArtifact = {
  type: "deck" | "infographic";
  relativePath: string;
  editableRelativePath?: string;
  contentType: "text/html";
  sourceBlockIds: readonly string[];
};

const escapeHtml = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
const pptxColor = (value: string) => value.replace(/^#/, "").toUpperCase();
const headingFont = (brief: RenderBrief) => brief.style.fonts?.[0] || "Arial";
const bodyFont = (brief: RenderBrief) => brief.style.fonts?.[1] || brief.style.fonts?.[0] || "Arial";
const deckLabel = (brief: RenderBrief) => `${brief.style.name ?? "Workshop"} · ${brief.style.intent === "board_deck" ? "Leadership brief" : brief.style.intent === "internal_workshop" ? "Team workshop" : "Client presentation"}`;
const deckSummary = (brief: RenderBrief) => brief.blocks[0]?.body || brief.blocks[0]?.heading || "A grounded brief with every factual claim connected to its source.";
const slideLayout = (block: RenderBlock, index: number, count: number): SlideLayout => block.layout ?? (index === 0 ? "statement" : index === count - 1 ? "recommendation" : index % 2 ? "split" : "proof");
const slideLabel = (layout: SlideLayout) => layout === "proof" ? "Evidence" : layout === "recommendation" ? "Recommended next move" : layout === "split" ? "What changes" : "Core insight";

function shell(title: string, brief: RenderBrief, body: string) {
  const heading = escapeHtml(headingFont(brief));
  const text = escapeHtml(bodyFont(brief));
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title><style>
  :root{--accent:${brief.style.accent};--ink:${brief.style.ink};--paper:${brief.style.paper};--muted:color-mix(in srgb,var(--ink) 56%,var(--paper));--line:color-mix(in srgb,var(--ink) 15%,var(--paper));--heading:'${heading}',Arial,sans-serif;--body:'${text}',Arial,sans-serif}
  *{box-sizing:border-box}html{background:#e8e8e5}body{margin:0;color:var(--ink);font-family:var(--body);background:#e8e8e5}.deck{display:grid;gap:28px;padding:28px}.slide{position:relative;overflow:hidden;width:min(1280px,calc(100vw - 56px));aspect-ratio:16/9;margin:auto;background:var(--paper);padding:6.4%;box-shadow:0 18px 52px rgba(0,0,0,.12)}.slide:after{content:attr(data-page);position:absolute;right:4.8%;bottom:4%;font-size:11px;color:var(--muted)}.cover{display:flex;flex-direction:column;justify-content:flex-end;background:var(--ink);color:var(--paper)}.cover:before{content:'';position:absolute;width:38%;aspect-ratio:1;border-radius:50%;background:var(--accent);right:-10%;top:-25%}.brand-logo{position:absolute;left:6.4%;top:6.4%;width:auto;height:64px;max-width:160px;object-fit:contain}.eyebrow{position:relative;color:var(--accent);font:700 11px/1 var(--body);letter-spacing:.14em;text-transform:uppercase}.cover .eyebrow{color:var(--paper);opacity:.72}.title{position:relative;font:500 clamp(38px,5.1vw,76px)/.98 var(--heading);letter-spacing:-.04em;max-width:88%;margin:22px 0}.subtitle{position:relative;max-width:68%;font-size:18px;line-height:1.45;color:color-mix(in srgb,var(--paper) 72%,transparent)}.slide h2{font:500 clamp(28px,3.7vw,56px)/1.02 var(--heading);letter-spacing:-.035em;margin:18px 0 28px;max-width:86%}.slide p{font-size:clamp(16px,1.55vw,23px);line-height:1.45;margin:0}.statement{display:flex;flex-direction:column;justify-content:center}.statement h2{font-size:clamp(38px,4.6vw,70px)}.statement .body{max-width:68%;border-left:5px solid var(--accent);padding-left:24px}.statement.is-sparse h2{max-width:92%;font-size:clamp(44px,5.3vw,78px)}.split{display:grid;grid-template-columns:30% 1fr;gap:8%;align-items:center;background:linear-gradient(90deg,color-mix(in srgb,var(--accent) 8%,var(--paper)) 0 31%,var(--paper) 31%)}.split .number{font:500 clamp(100px,15vw,220px)/.8 var(--heading);color:var(--accent);letter-spacing:-.08em}.split.is-sparse h2{max-width:94%;font-size:clamp(34px,4vw,62px)}.proof{display:grid;grid-template-columns:1fr 36%;gap:8%;align-items:end}.proof .proof-card{align-self:stretch;border-radius:4px;background:var(--ink);color:var(--paper);padding:30px;display:flex;flex-direction:column;justify-content:flex-end}.proof .proof-card strong{font:500 26px/1.15 var(--heading)}.proof.is-sparse>div{align-self:center}.recommendation{background:var(--accent);color:var(--paper);display:flex;flex-direction:column;justify-content:center}.recommendation .eyebrow,.recommendation .cite{color:var(--paper)}.recommendation h2{font-size:clamp(40px,5vw,76px);max-width:92%}.recommendation.is-sparse h2{font-size:clamp(46px,5.4vw,82px)}.cite{position:absolute;left:6.4%;bottom:4%;max-width:78%;font-size:10px!important;line-height:1.3!important;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.infographic{width:min(920px,calc(100vw - 48px));margin:24px auto;background:var(--paper);padding:64px;box-shadow:0 18px 52px rgba(0,0,0,.12)}.infographic .title{font-size:58px}.block{display:grid;grid-template-columns:44px 1fr;border-top:1px solid var(--line);padding:26px 0;gap:18px}.block-number{color:var(--accent);font-weight:700}.block h2{font:500 26px/1.1 var(--heading);margin:0 0 8px}.block .cite{position:static;margin-top:12px!important;white-space:normal}
  @media print{html,body{background:white}.deck{display:block;padding:0}.slide{width:100vw;height:100vh;box-shadow:none;break-after:page}.infographic{box-shadow:none;margin:0;width:auto}}@media(max-width:720px){.deck{padding:12px;gap:12px}.slide{width:calc(100vw - 24px);padding:7%}.split,.proof{display:flex;flex-direction:column;align-items:stretch;justify-content:center}.split .number{font-size:72px}.proof .proof-card{display:none}.cite{max-width:72%}}
  </style></head><body>${body}</body></html>`;
}

function citationText(block: RenderBlock) { return block.citations.length ? `Source: ${block.citationLabel ?? block.citations.join(" · ")}` : "Source: approved Workshop brief"; }
function citationData(block: RenderBlock) { return block.citations.length ? ` data-source="${escapeHtml(block.citations.join(" | "))}"` : ""; }

export function renderDeck(brief: RenderBrief): string {
  const logo = brief.style.logoData ? `<img class="brand-logo" alt="" src="${escapeHtml(brief.style.logoData)}">` : "";
  const cover = `<section class="slide cover" data-page="01">${logo}<div class="eyebrow">${escapeHtml(deckLabel(brief))}</div><h1 class="title">${escapeHtml(brief.workshopTitle)}</h1><p class="subtitle">${escapeHtml(deckSummary(brief))}</p></section>`;
  const slides = brief.blocks.map((block, index) => {
    const layout = slideLayout(block, index, brief.blocks.length);
    const sparse = !block.body.trim();
    const page = String(index + 2).padStart(2, "0");
    const eyebrow = `<div class="eyebrow">${page} · ${escapeHtml(slideLabel(layout))}</div>`;
    const heading = `<h2>${escapeHtml(block.heading)}</h2>`;
    const body = sparse ? "" : `<p class="body">${escapeHtml(block.body)}</p>`;
    const cite = `<p class="cite"${citationData(block)}>${escapeHtml(citationText(block))}</p>`;
    if (layout === "split") return `<section class="slide split${sparse ? " is-sparse" : ""}" data-page="${page}"><div class="number">${String(index + 1).padStart(2, "0")}</div><div>${eyebrow}${heading}${body}</div>${cite}</section>`;
    if (layout === "proof") return `<section class="slide proof${sparse ? " is-sparse" : ""}" data-page="${page}"><div>${eyebrow}${heading}${body}</div><aside class="proof-card"><span class="eyebrow">Traceable by design</span><strong>${escapeHtml(block.citationLabel ?? block.citations[0] ?? "Approved Brief")}</strong></aside>${cite}</section>`;
    return `<section class="slide ${layout}${sparse ? " is-sparse" : ""}" data-page="${page}">${eyebrow}${heading}${body}${cite}</section>`;
  }).join("\n");
  return shell(`${brief.workshopTitle} deck`, brief, `<main class="deck">${cover}${slides}</main>`);
}

export function renderInfographic(brief: RenderBrief): string {
  const blocks = brief.blocks.map((block, index) => `<article class="block"><div class="block-number">${String(index + 1).padStart(2, "0")}</div><div><h2>${escapeHtml(block.heading)}</h2><p>${escapeHtml(block.body)}</p><p class="cite"${citationData(block)}>${escapeHtml(citationText(block))}</p></div></article>`).join("\n");
  return shell(`${brief.workshopTitle} infographic`, brief, `<main class="infographic"><div class="eyebrow">Source-defensible brief</div><h1 class="title">${escapeHtml(brief.workshopTitle)}</h1>${blocks}</main>`);
}

function addPptxFooter(slide: PptxSlide, brief: RenderBrief, block: RenderBlock | undefined, page: number) {
  const muted = pptxColor(brief.style.ink);
  slide.addText(block ? citationText(block) : brief.version, { x: 0.72, y: 7.16, w: 10.9, h: 0.18, fontFace: bodyFont(brief), fontSize: 8, color: muted, transparency: 34, margin: 0, breakLine: false, fit: "shrink" });
  slide.addText(String(page).padStart(2, "0"), { x: 12.05, y: 7.13, w: 0.55, h: 0.2, fontFace: bodyFont(brief), fontSize: 8, color: muted, transparency: 34, margin: 0, align: "right" });
  if (block) slide.addNotes(`WorkshopLM source trace\n${block.citations.join("\n") || "Approved Workshop brief"}\nClaim ID: ${block.id}`);
}

export async function writeEditableDeck(path: string, brief: RenderBrief): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "WorkshopLM";
  pptx.subject = "Grounded, source-defensible presentation";
  pptx.title = brief.workshopTitle;
  pptx.company = "WorkshopLM";
  pptx.lang = "en-US";
  pptx.theme = { headFontFace: headingFont(brief), bodyFontFace: bodyFont(brief), lang: "en-US" };
  const paper = pptxColor(brief.style.paper); const ink = pptxColor(brief.style.ink); const accent = pptxColor(brief.style.accent);

  const cover = pptx.addSlide(); cover.background = { color: ink };
  cover.addShape(pptx.ShapeType.ellipse, { x: 9.8, y: -2.1, w: 5.5, h: 5.5, fill: { color: accent }, line: { color: accent } });
  if (brief.style.logoData) cover.addImage({ data: brief.style.logoData, x: 0.75, y: 0.62, w: 0.56, h: 0.68 });
  cover.addText(deckLabel(brief).toUpperCase(), { x: 0.75, y: 4.75, w: 7.6, h: 0.25, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: paper, charSpacing: 1.6, margin: 0 });
  cover.addText(brief.workshopTitle, { x: 0.72, y: 5.12, w: 10.7, h: 1.15, fontFace: headingFont(brief), fontSize: 42, bold: false, color: paper, margin: 0, breakLine: false, fit: "shrink" });
  cover.addText(deckSummary(brief), { x: 0.75, y: 6.38, w: 7.8, h: 0.42, fontFace: bodyFont(brief), fontSize: 12, color: paper, transparency: 22, margin: 0, fit: "shrink" });
  addPptxFooter(cover, brief, undefined, 1);

  brief.blocks.forEach((block, index) => {
    const layout = slideLayout(block, index, brief.blocks.length); const slide = pptx.addSlide(); slide.background = { color: layout === "recommendation" ? accent : paper };
    const foreground = layout === "recommendation" ? paper : ink; const label = slideLabel(layout).toUpperCase(); const body = block.body.trim();
    if (layout === "split") {
      slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 3.72, h: 7.5, fill: { color: accent, transparency: 92 }, line: { color: accent, transparency: 100 } });
      slide.addText(String(index + 1).padStart(2, "0"), { x: 0.72, y: 2.1, w: 3.0, h: 2.1, fontFace: headingFont(brief), fontSize: 104, color: accent, margin: 0, fit: "shrink" });
      slide.addText(label, { x: 4.25, y: 1.28, w: 5.6, h: 0.2, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: accent, charSpacing: 1.5, margin: 0 });
      slide.addText(block.heading, { x: 4.22, y: body ? 1.72 : 2.08, w: 7.8, h: body ? 1.55 : 2.1, fontFace: headingFont(brief), fontSize: body ? 30 : 36, color: ink, margin: 0, breakLine: false, fit: "shrink" });
      if (body) slide.addText(body, { x: 4.25, y: 3.55, w: 7.45, h: 1.55, fontFace: bodyFont(brief), fontSize: 17, color: ink, margin: 0, breakLine: false, fit: "shrink", valign: "top" });
    } else if (layout === "proof") {
      slide.addText(label, { x: 0.75, y: 0.82, w: 5.6, h: 0.2, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: accent, charSpacing: 1.5, margin: 0 });
      slide.addText(block.heading, { x: 0.72, y: body ? 1.25 : 2.0, w: 7.3, h: body ? 1.6 : 2.15, fontFace: headingFont(brief), fontSize: body ? 32 : 38, color: ink, margin: 0, breakLine: false, fit: "shrink" });
      if (body) slide.addText(body, { x: 0.75, y: 3.05, w: 7.0, h: 1.65, fontFace: bodyFont(brief), fontSize: 18, color: ink, margin: 0, breakLine: false, fit: "shrink", valign: "top" });
      slide.addShape(pptx.ShapeType.rect, { x: 8.55, y: 0.72, w: 4.05, h: 5.95, fill: { color: ink }, line: { color: ink }, radius: 0.04 });
      slide.addText("TRACEABLE BY DESIGN", { x: 8.95, y: 4.25, w: 3.15, h: 0.22, fontFace: bodyFont(brief), fontSize: 8, bold: true, color: accent, charSpacing: 1.2, margin: 0 });
      slide.addText(block.citationLabel ?? block.citations[0] ?? "Approved Brief", { x: 8.92, y: 4.72, w: 3.1, h: 1.15, fontFace: headingFont(brief), fontSize: 20, color: paper, margin: 0, breakLine: false, fit: "shrink", valign: "bottom" });
    } else {
      slide.addText(label, { x: 0.75, y: layout === "statement" ? 1.18 : 1.02, w: 5.6, h: 0.2, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: layout === "recommendation" ? paper : accent, charSpacing: 1.5, margin: 0 });
      slide.addText(block.heading, { x: 0.72, y: body ? (layout === "statement" ? 1.72 : 1.55) : 2.2, w: 11.35, h: body ? 2.15 : 2.7, fontFace: headingFont(brief), fontSize: body ? (layout === "recommendation" ? 42 : 38) : (layout === "recommendation" ? 48 : 44), color: foreground, margin: 0, breakLine: false, fit: "shrink" });
      if (body) {
        slide.addShape(pptx.ShapeType.rect, { x: 0.75, y: 4.42, w: 0.07, h: 1.28, fill: { color: layout === "recommendation" ? paper : accent, transparency: layout === "recommendation" ? 20 : 0 }, line: { color: layout === "recommendation" ? paper : accent, transparency: 100 } });
        slide.addText(body, { x: 1.1, y: 4.38, w: 8.9, h: 1.35, fontFace: bodyFont(brief), fontSize: 18, color: foreground, margin: 0, breakLine: false, fit: "shrink", valign: "mid" });
      }
    }
    addPptxFooter(slide, brief, block, index + 2);
  });
  await mkdir(dirname(path), { recursive: true });
  await pptx.writeFile({ fileName: path, compression: true });
}

export async function writeEditableInfographic(path: string, brief: RenderBrief): Promise<void> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "WorkshopLM";
  pptx.subject = "Grounded, source-defensible infographic";
  pptx.title = `${brief.workshopTitle} infographic`;
  pptx.company = "WorkshopLM";
  pptx.lang = "en-US";
  pptx.theme = { headFontFace: headingFont(brief), bodyFontFace: bodyFont(brief), lang: "en-US" };
  const paper = pptxColor(brief.style.paper); const ink = pptxColor(brief.style.ink); const accent = pptxColor(brief.style.accent);
  const slide = pptx.addSlide(); slide.background = { color: paper };
  slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.22, h: 7.5, fill: { color: accent }, line: { color: accent } });
  if (brief.style.logoData) slide.addImage({ data: brief.style.logoData, x: 0.68, y: 0.48, w: 0.5, h: 0.6 });
  slide.addText("SOURCE-DEFENSIBLE BRIEF", { x: 1.35, y: 0.58, w: 4.8, h: 0.2, fontFace: bodyFont(brief), fontSize: 8, bold: true, color: accent, charSpacing: 1.4, margin: 0 });
  slide.addText(brief.workshopTitle, { x: 0.68, y: 1.05, w: 11.8, h: 0.76, fontFace: headingFont(brief), fontSize: 30, color: ink, margin: 0, breakLine: false, fit: "shrink" });
  const blocks = brief.blocks.slice(0, 4); const rowHeight = blocks.length > 3 ? 1.12 : 1.42; const startY = 2.05;
  blocks.forEach((block, index) => {
    const y = startY + index * rowHeight;
    const headingPrefix = block.heading.replace(/…$/, "").trim();
    const bodyRepeatsHeading = Boolean(headingPrefix && block.body.toLowerCase().startsWith(headingPrefix.toLowerCase()));
    const primaryText = block.heading.endsWith("…") && bodyRepeatsHeading ? block.body : block.heading;
    const supportingText = block.body.trim() && !bodyRepeatsHeading ? block.body : undefined;
    slide.addShape(pptx.ShapeType.rect, { x: 0.72, y, w: 11.85, h: 0.01, fill: { color: ink, transparency: 84 }, line: { color: ink, transparency: 100 } });
    slide.addText(String(index + 1).padStart(2, "0"), { x: 0.72, y: y + 0.25, w: 0.55, h: 0.26, fontFace: bodyFont(brief), fontSize: 11, bold: true, color: accent, margin: 0 });
    slide.addText(primaryText, { x: 1.42, y: y + 0.19, w: supportingText ? 3.5 : 8.65, h: 0.52, fontFace: headingFont(brief), fontSize: 17, color: ink, margin: 0, breakLine: false, fit: "shrink" });
    if (supportingText) slide.addText(supportingText, { x: 5.15, y: y + 0.18, w: 5.05, h: 0.52, fontFace: bodyFont(brief), fontSize: 11, color: ink, margin: 0, breakLine: false, fit: "shrink", valign: "mid" });
    slide.addText(citationText(block), { x: 10.45, y: y + 0.2, w: 2.0, h: 0.45, fontFace: bodyFont(brief), fontSize: 7, color: ink, transparency: 34, margin: 0, breakLine: false, fit: "shrink", valign: "mid" });
  });
  slide.addNotes(`WorkshopLM source trace\n${blocks.map((block) => `${block.id}\n${block.citations.join("\n") || "Approved Workshop brief"}`).join("\n\n")}`);
  slide.addText(`${brief.style.name ?? "Workshop"} · ${brief.version}`, { x: 0.72, y: 7.12, w: 8.5, h: 0.18, fontFace: bodyFont(brief), fontSize: 7, color: ink, transparency: 38, margin: 0 });
  await mkdir(dirname(path), { recursive: true });
  await pptx.writeFile({ fileName: path, compression: true });
}

export async function writeRenderedArtifact(root: string, id: string, type: RenderedArtifact["type"], brief: RenderBrief): Promise<RenderedArtifact> {
  const relativePath = join("generated", `${id}.${type}.html`);
  await mkdir(dirname(join(root, relativePath)), { recursive: true });
  await writeFile(join(root, relativePath), type === "deck" ? renderDeck(brief) : renderInfographic(brief), "utf8");
  const editableRelativePath = join("generated", `${id}.${type === "deck" ? "presentation" : "infographic"}.pptx`);
  if (type === "deck") await writeEditableDeck(join(root, editableRelativePath), brief);
  else await writeEditableInfographic(join(root, editableRelativePath), brief);
  return { type, relativePath, editableRelativePath, contentType: "text/html", sourceBlockIds: brief.blocks.map((block) => block.id) };
}
