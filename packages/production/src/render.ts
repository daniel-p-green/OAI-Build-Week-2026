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
    logoAspectRatio?: number;
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
const colorLuminance = (value: string) => {
  const channels = value.replace(/^#/, "").match(/.{2}/g)?.map((channel) => Number.parseInt(channel, 16) / 255).map((channel) => channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4) ?? [0, 0, 0];
  return channels[0]! * 0.2126 + channels[1]! * 0.7152 + channels[2]! * 0.0722;
};
const colorContrast = (left: string, right: string) => { const values = [colorLuminance(left), colorLuminance(right)].sort((a, b) => b - a); return (values[0]! + 0.05) / (values[1]! + 0.05); };
const accentForeground = (brief: RenderBrief) => [brief.style.paper, brief.style.ink, "#FFFFFF", "#000000"].sort((left, right) => colorContrast(right, brief.style.accent) - colorContrast(left, brief.style.accent))[0]!;
const headingFont = (brief: RenderBrief) => brief.style.fonts?.[0] || "Arial";
const bodyFont = (brief: RenderBrief) => brief.style.fonts?.[1] || brief.style.fonts?.[0] || "Arial";
export function fitLogoBox(aspectRatio: number | undefined, maxWidth: number, maxHeight: number) {
  const ratio = aspectRatio && Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1;
  if (ratio >= maxWidth / maxHeight) return { width: maxWidth, height: maxWidth / ratio };
  return { width: maxHeight * ratio, height: maxHeight };
}
const deckLabel = (brief: RenderBrief) => `${brief.style.name ?? "Workshop"} · ${brief.style.intent === "board_deck" ? "Leadership brief" : brief.style.intent === "internal_workshop" ? "Team workshop" : "Client presentation"}`;
const deckSummary = (brief: RenderBrief) => brief.blocks[0]?.body || brief.blocks[0]?.heading || "A grounded brief with every factual claim connected to its source.";
const slideLayout = (block: RenderBlock, index: number, count: number): SlideLayout => block.layout ?? (index === 0 ? "statement" : index === count - 1 ? "recommendation" : index % 2 ? "split" : "proof");
const slideLabel = (layout: SlideLayout) => layout === "proof" ? "Evidence" : layout === "recommendation" ? "Recommended next move" : layout === "split" ? "What changes" : "Core insight";
const visibleCitationLabel = (block: RenderBlock) => (block.citationLabel ?? (block.citations.join(" · ") || "Approved Workshop brief")).replace(/\s+·\s+chunk\s+\d+\b/i, "");
const proofMetrics = (block: RenderBlock) => [...block.heading.matchAll(/(\d[\d,.]*[+%×x]?)[ ]+([A-Za-z][A-Za-z-]*)/gi)].filter((match) => !/^(?:and|for|in|of|to|with)$/i.test(match[2]!)).slice(0, 2).map((match) => ({ value: match[1]!, label: match[2]!.trim() }));

function shell(title: string, brief: RenderBrief, body: string) {
  const heading = escapeHtml(headingFont(brief));
  const text = escapeHtml(bodyFont(brief));
  const accentText = accentForeground(brief);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title><style>
  :root{--accent:${brief.style.accent};--accent-foreground:${accentText};--ink:${brief.style.ink};--paper:${brief.style.paper};--muted:color-mix(in srgb,var(--ink) 56%,var(--paper));--line:color-mix(in srgb,var(--ink) 15%,var(--paper));--heading:'${heading}',Arial,sans-serif;--body:'${text}',Arial,sans-serif}
  *{box-sizing:border-box}html{background:#e8e8e5}body{margin:0;color:var(--ink);font-family:var(--body);background:#e8e8e5}.deck{display:grid;gap:28px;padding:28px}.slide{position:relative;overflow:hidden;width:min(1280px,calc(100vw - 56px));aspect-ratio:16/9;margin:auto;background:var(--paper);padding:6.4%;box-shadow:0 18px 52px rgba(0,0,0,.12)}.slide:after{content:attr(data-page);position:absolute;right:4.8%;bottom:4%;font-size:11px;color:var(--muted)}.cover{display:flex;flex-direction:column;justify-content:flex-end;background:var(--ink);color:var(--paper)}.cover:before{content:'';position:absolute;width:38%;aspect-ratio:1;border-radius:50%;background:var(--accent);right:-10%;top:-25%}.brand-logo{position:absolute;left:6.4%;top:6.4%;width:auto;height:64px;max-width:160px;object-fit:contain}.eyebrow{position:relative;color:var(--accent);font:700 11px/1 var(--body);letter-spacing:.14em;text-transform:uppercase}.cover .eyebrow{color:var(--paper);opacity:.72}.title{position:relative;font:500 clamp(38px,5.1vw,76px)/.98 var(--heading);letter-spacing:-.04em;max-width:88%;margin:22px 0}.subtitle{position:relative;max-width:68%;font-size:18px;line-height:1.45;color:color-mix(in srgb,var(--paper) 72%,transparent)}.slide h2{font:500 clamp(28px,3.7vw,56px)/1.02 var(--heading);letter-spacing:-.035em;margin:18px 0 28px;max-width:86%}.slide p{font-size:clamp(16px,1.55vw,23px);line-height:1.45;margin:0}.statement{display:flex;flex-direction:column;justify-content:center}.statement h2{font-size:clamp(38px,4.6vw,70px)}.statement .body{max-width:68%;border-left:5px solid var(--accent);padding-left:24px}.statement.is-sparse h2{max-width:92%;font-size:clamp(44px,5.3vw,78px)}.split{display:grid;grid-template-columns:30% 1fr;gap:8%;align-items:center;background:linear-gradient(90deg,color-mix(in srgb,var(--accent) 8%,var(--paper)) 0 31%,var(--paper) 31%)}.split .number{font:500 clamp(100px,15vw,220px)/.8 var(--heading);color:var(--accent);letter-spacing:-.08em}.split.is-sparse h2{max-width:94%;font-size:clamp(34px,4vw,62px)}.proof{display:grid;grid-template-columns:1fr 36%;gap:8%;align-items:end}.proof .proof-card{align-self:stretch;border-radius:4px;background:var(--ink);color:var(--paper);padding:30px;display:flex;flex-direction:column;justify-content:flex-end}.proof .proof-card strong{font:500 26px/1.15 var(--heading)}.proof.is-sparse>div{align-self:center}.proof.metrics{display:flex;flex-direction:column;justify-content:center;align-items:stretch}.metric-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5%;margin:36px 0 30px}.metric{border-top:2px solid var(--accent);padding-top:18px}.metric strong{display:block;font:500 clamp(64px,8vw,120px)/.85 var(--heading);letter-spacing:-.065em;color:var(--ink)}.metric span{display:block;margin-top:12px;color:var(--muted);font-size:14px;text-transform:uppercase;letter-spacing:.12em}.proof.metrics .body{max-width:76%;font-size:clamp(15px,1.35vw,20px)}.recommendation{background:var(--accent);color:var(--accent-foreground);display:flex;flex-direction:column;justify-content:center}.recommendation .eyebrow,.recommendation .cite{color:var(--accent-foreground)}.recommendation h2{font-size:clamp(40px,5vw,76px);max-width:92%}.recommendation.is-sparse h2{font-size:clamp(46px,5.4vw,82px)}.cite{position:absolute;left:6.4%;bottom:4%;max-width:78%;font-size:10px!important;line-height:1.3!important;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.infographic{position:relative;width:min(1280px,calc(100vw - 48px));aspect-ratio:16/9;margin:24px auto;background:var(--paper);padding:5.2% 6%;box-shadow:0 18px 52px rgba(0,0,0,.12)}.infographic:before{content:'';position:absolute;inset:0 auto 0 0;width:18px;background:var(--accent)}.infographic .title{font-size:clamp(34px,3.8vw,58px);margin:18px 0 34px;max-width:82%}.infographic-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px 42px}.infographic .block{position:relative;min-height:180px;border-top:2px solid var(--line);padding:22px 0 30px 64px}.infographic .block-number{position:absolute;left:0;top:22px;color:var(--accent);font-weight:700}.infographic .block h2{font:500 clamp(20px,2vw,29px)/1.08 var(--heading);letter-spacing:-.025em;margin:0 0 12px}.infographic .block>div>p:not(.cite){color:var(--muted);font-size:clamp(13px,1.15vw,17px);line-height:1.35}.infographic .block .cite{position:absolute;left:64px;bottom:8px;margin:0!important;max-width:calc(100% - 64px);white-space:nowrap}
  .split.is-sparse{display:flex;align-items:center;background:var(--ink);color:var(--paper);padding-left:8%;padding-right:8%}.split.is-sparse:before{content:'';position:absolute;left:6.4%;top:18%;bottom:18%;width:6px;background:var(--accent)}.split.is-sparse .number{position:absolute;right:4%;bottom:-10%;font-size:clamp(180px,24vw,340px);line-height:.8;opacity:.92}.split.is-sparse>div:not(.number){position:relative;z-index:1;width:82%;padding-left:4%}.split.is-sparse .eyebrow{color:var(--accent)}.split.is-sparse h2{max-width:78%;font-size:clamp(44px,5.3vw,78px);color:var(--paper)}.split.is-sparse .cite{color:color-mix(in srgb,var(--paper) 62%,transparent)}
  @media print{html,body{background:white}.deck{display:block;padding:0}.slide{width:100vw;height:100vh;box-shadow:none;break-after:page}.infographic{box-shadow:none;margin:0;width:100vw;height:100vh}}@media(max-width:720px){.deck{padding:12px;gap:12px}.slide{width:calc(100vw - 24px);padding:7%}.split,.proof{display:flex;flex-direction:column;align-items:stretch;justify-content:center}.split .number{font-size:72px}.split.is-sparse .number{font-size:120px}.proof .proof-card{display:none}.cite{max-width:72%}.infographic{width:calc(100vw - 24px);aspect-ratio:auto;margin:12px;padding:44px 28px 44px 38px}.infographic-grid{grid-template-columns:1fr}.infographic .block{min-height:160px}}
  </style></head><body>${body}</body></html>`;
}

function citationText(block: RenderBlock) { return block.citations.length ? `Source: ${visibleCitationLabel(block)}` : "Source: approved Workshop brief"; }
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
    if (layout === "proof") {
      const metrics = proofMetrics(block);
      if (metrics.length) return `<section class="slide proof metrics" data-page="${page}">${eyebrow}<div class="metric-grid">${metrics.map((metric) => `<div class="metric"><strong>${escapeHtml(metric.value)}</strong><span>${escapeHtml(metric.label)}</span></div>`).join("")}</div>${body}${cite}</section>`;
      return `<section class="slide proof${sparse ? " is-sparse" : ""}" data-page="${page}"><div>${eyebrow}${heading}${body}</div><aside class="proof-card"><span class="eyebrow">Source-backed</span><strong>${escapeHtml(visibleCitationLabel(block))}</strong></aside>${cite}</section>`;
    }
    return `<section class="slide ${layout}${sparse ? " is-sparse" : ""}" data-page="${page}">${eyebrow}${heading}${body}${cite}</section>`;
  }).join("\n");
  return shell(`${brief.workshopTitle} deck`, brief, `<main class="deck">${cover}${slides}</main>`);
}

export function renderInfographic(brief: RenderBrief): string {
  const blocks = brief.blocks.map((block, index) => `<article class="block"><div class="block-number">${String(index + 1).padStart(2, "0")}</div><div><h2>${escapeHtml(block.heading)}</h2><p>${escapeHtml(block.body)}</p><p class="cite"${citationData(block)}>${escapeHtml(citationText(block))}</p></div></article>`).join("\n");
  return shell(`${brief.workshopTitle} infographic`, brief, `<main class="infographic"><div class="eyebrow">Source-defensible brief</div><h1 class="title">${escapeHtml(brief.workshopTitle)}</h1><section class="infographic-grid">${blocks}</section></main>`);
}

function addPptxFooter(slide: PptxSlide, brief: RenderBrief, block: RenderBlock | undefined, page: number, foreground?: string) {
  const muted = foreground ?? pptxColor(brief.style.ink);
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
  const paper = pptxColor(brief.style.paper); const ink = pptxColor(brief.style.ink); const accent = pptxColor(brief.style.accent); const accentText = pptxColor(accentForeground(brief));

  const cover = pptx.addSlide(); cover.background = { color: ink };
  cover.addShape(pptx.ShapeType.ellipse, { x: 9.8, y: -2.1, w: 5.5, h: 5.5, fill: { color: accent }, line: { color: accent } });
  if (brief.style.logoData) {
    const logo = fitLogoBox(brief.style.logoAspectRatio, 1.6, 0.68);
    cover.addImage({ data: brief.style.logoData, x: 0.75, y: 0.62 + (0.68 - logo.height) / 2, w: logo.width, h: logo.height });
  }
  cover.addText(deckLabel(brief).toUpperCase(), { x: 0.75, y: 4.75, w: 7.6, h: 0.25, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: paper, charSpacing: 1.6, margin: 0 });
  cover.addText(brief.workshopTitle, { x: 0.72, y: 5.12, w: 10.7, h: 1.15, fontFace: headingFont(brief), fontSize: 42, bold: false, color: paper, margin: 0, breakLine: false, fit: "shrink" });
  cover.addText(deckSummary(brief), { x: 0.75, y: 6.38, w: 7.8, h: 0.42, fontFace: bodyFont(brief), fontSize: 12, color: paper, transparency: 22, margin: 0, fit: "shrink" });
  addPptxFooter(cover, brief, undefined, 1, paper);

  brief.blocks.forEach((block, index) => {
    const layout = slideLayout(block, index, brief.blocks.length); const slide = pptx.addSlide(); slide.background = { color: layout === "recommendation" ? accent : paper };
    const foreground = layout === "recommendation" ? accentText : ink; const label = slideLabel(layout).toUpperCase(); const body = block.body.trim();
    if (layout === "split") {
      if (!body) {
        slide.background = { color: ink };
        slide.addShape(pptx.ShapeType.rect, { x: 0.75, y: 1.32, w: 0.07, h: 4.55, fill: { color: accent }, line: { color: accent, transparency: 100 } });
        slide.addText(String(index + 1).padStart(2, "0"), { x: 10.15, y: 4.72, w: 2.55, h: 2.15, fontFace: headingFont(brief), fontSize: 104, color: accent, transparency: 10, margin: 0, fit: "shrink", align: "right" });
        slide.addText(label, { x: 1.1, y: 1.48, w: 5.6, h: 0.2, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: accent, charSpacing: 1.5, margin: 0 });
        slide.addText(block.heading, { x: 1.08, y: 2.0, w: 9.2, h: 2.8, fontFace: headingFont(brief), fontSize: 44, color: paper, margin: 0, breakLine: false, fit: "shrink", valign: "mid" });
      } else {
        slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 3.72, h: 7.5, fill: { color: accent, transparency: 92 }, line: { color: accent, transparency: 100 } });
        slide.addText(String(index + 1).padStart(2, "0"), { x: 0.72, y: 2.1, w: 3.0, h: 2.1, fontFace: headingFont(brief), fontSize: 104, color: accent, margin: 0, fit: "shrink" });
        slide.addText(label, { x: 4.25, y: 1.28, w: 5.6, h: 0.2, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: accent, charSpacing: 1.5, margin: 0 });
        slide.addText(block.heading, { x: 4.22, y: 1.72, w: 7.8, h: 1.55, fontFace: headingFont(brief), fontSize: 30, color: ink, margin: 0, breakLine: false, fit: "shrink" });
        slide.addText(body, { x: 4.25, y: 3.55, w: 7.45, h: 1.55, fontFace: bodyFont(brief), fontSize: 17, color: ink, margin: 0, breakLine: false, fit: "shrink", valign: "top" });
      }
    } else if (layout === "proof") {
      const metrics = proofMetrics(block);
      slide.addText(label, { x: 0.75, y: 0.82, w: 5.6, h: 0.2, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: accent, charSpacing: 1.5, margin: 0 });
      if (metrics.length) {
        const metricWidth = metrics.length === 1 ? 5.4 : 5.35;
        metrics.forEach((metric, metricIndex) => {
          const x = 0.75 + metricIndex * 6.05;
          slide.addShape(pptx.ShapeType.rect, { x, y: 1.48, w: metricWidth, h: 0.025, fill: { color: accent }, line: { color: accent, transparency: 100 } });
          slide.addText(metric.value, { x, y: 1.78, w: metricWidth, h: 1.45, fontFace: headingFont(brief), fontSize: 58, color: ink, margin: 0, breakLine: false, fit: "shrink" });
          slide.addText(metric.label.toUpperCase(), { x, y: 3.24, w: metricWidth, h: 0.42, fontFace: bodyFont(brief), fontSize: 8, bold: true, color: ink, transparency: 34, margin: 0 });
        });
        if (body) slide.addText(body, { x: 0.75, y: 4.25, w: 9.8, h: 1.05, fontFace: bodyFont(brief), fontSize: 16, color: ink, margin: 0, breakLine: false, fit: "shrink", valign: "top" });
      } else {
        slide.addText(block.heading, { x: 0.72, y: body ? 1.25 : 2.0, w: 7.3, h: body ? 1.6 : 2.15, fontFace: headingFont(brief), fontSize: body ? 32 : 38, color: ink, margin: 0, breakLine: false, fit: "shrink" });
        if (body) slide.addText(body, { x: 0.75, y: 3.05, w: 7.0, h: 1.65, fontFace: bodyFont(brief), fontSize: 18, color: ink, margin: 0, breakLine: false, fit: "shrink", valign: "top" });
        slide.addShape(pptx.ShapeType.rect, { x: 8.55, y: 0.72, w: 4.05, h: 5.95, fill: { color: ink }, line: { color: ink }, radius: 0.04 });
        slide.addText("SOURCE-BACKED", { x: 8.95, y: 4.25, w: 3.15, h: 0.22, fontFace: bodyFont(brief), fontSize: 8, bold: true, color: accent, charSpacing: 1.2, margin: 0 });
        slide.addText(visibleCitationLabel(block), { x: 8.92, y: 4.72, w: 3.1, h: 1.15, fontFace: headingFont(brief), fontSize: 20, color: paper, margin: 0, breakLine: false, fit: "shrink", valign: "bottom" });
      }
    } else {
      slide.addText(label, { x: 0.75, y: layout === "statement" ? 1.18 : 1.02, w: 5.6, h: 0.2, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: layout === "recommendation" ? accentText : accent, charSpacing: 1.5, margin: 0 });
      slide.addText(block.heading, { x: 0.72, y: body ? (layout === "statement" ? 1.72 : 1.55) : 2.2, w: 11.35, h: body ? 2.15 : 2.7, fontFace: headingFont(brief), fontSize: body ? (layout === "recommendation" ? 42 : 38) : (layout === "recommendation" ? 48 : 44), color: foreground, margin: 0, breakLine: false, fit: "shrink" });
      if (body) {
        slide.addShape(pptx.ShapeType.rect, { x: 0.75, y: 4.42, w: 0.07, h: 1.28, fill: { color: layout === "recommendation" ? accentText : accent, transparency: layout === "recommendation" ? 20 : 0 }, line: { color: layout === "recommendation" ? accentText : accent, transparency: 100 } });
        slide.addText(body, { x: 1.1, y: 4.38, w: 8.9, h: 1.35, fontFace: bodyFont(brief), fontSize: 18, color: foreground, margin: 0, breakLine: false, fit: "shrink", valign: "mid" });
      }
    }
    addPptxFooter(slide, brief, block, index + 2, layout === "recommendation" ? accentText : layout === "split" && !body ? paper : undefined);
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
  const logo = brief.style.logoData ? fitLogoBox(brief.style.logoAspectRatio, 1.3, 0.5) : undefined;
  if (brief.style.logoData && logo) slide.addImage({ data: brief.style.logoData, x: 0.68, y: 0.48 + (0.5 - logo.height) / 2, w: logo.width, h: logo.height });
  slide.addText("SOURCE-DEFENSIBLE BRIEF", { x: logo ? 0.68 + logo.width + 0.2 : 0.68, y: 0.58, w: logo ? 4.8 - logo.width : 4.8, h: 0.2, fontFace: bodyFont(brief), fontSize: 8, bold: true, color: accent, charSpacing: 1.4, margin: 0 });
  slide.addText(brief.workshopTitle, { x: 0.68, y: 1.05, w: 11.8, h: 0.76, fontFace: headingFont(brief), fontSize: 30, color: ink, margin: 0, breakLine: false, fit: "shrink" });
  const blocks = brief.blocks.slice(0, 4); const cardWidth = 5.58; const cardHeight = 1.82;
  blocks.forEach((block, index) => {
    const column = index % 2; const row = Math.floor(index / 2); const x = 0.72 + column * 6.08; const y = 2.02 + row * 2.27;
    const headingPrefix = block.heading.replace(/…$/, "").trim();
    const bodyRepeatsHeading = Boolean(headingPrefix && block.body.toLowerCase().startsWith(headingPrefix.toLowerCase()));
    const primaryText = block.heading.endsWith("…") && bodyRepeatsHeading ? block.body : block.heading;
    const supportingText = block.body.trim() && !bodyRepeatsHeading ? block.body : undefined;
    slide.addShape(pptx.ShapeType.rect, { x, y, w: cardWidth, h: 0.02, fill: { color: ink, transparency: 82 }, line: { color: ink, transparency: 100 } });
    slide.addText(String(index + 1).padStart(2, "0"), { x, y: y + 0.28, w: 0.5, h: 0.28, fontFace: bodyFont(brief), fontSize: 10, bold: true, color: accent, margin: 0 });
    slide.addText(primaryText, { x: x + 0.68, y: y + 0.22, w: cardWidth - 0.68, h: supportingText ? 0.68 : 1.02, fontFace: headingFont(brief), fontSize: supportingText ? 17 : 19, color: ink, margin: 0, breakLine: false, fit: "shrink", valign: "top" });
    if (supportingText) slide.addText(supportingText, { x: x + 0.68, y: y + 0.94, w: cardWidth - 0.68, h: 0.5, fontFace: bodyFont(brief), fontSize: 10, color: ink, transparency: 28, margin: 0, breakLine: false, fit: "shrink", valign: "top" });
    slide.addText(citationText(block), { x: x + 0.68, y: y + cardHeight - 0.18, w: cardWidth - 0.68, h: 0.18, fontFace: bodyFont(brief), fontSize: 6.5, color: ink, transparency: 42, margin: 0, breakLine: false, fit: "shrink" });
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
