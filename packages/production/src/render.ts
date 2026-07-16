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

export type SlideLayout = "statement" | "split" | "proof" | "sequence" | "plan" | "decision" | "recommendation";
export type IntentProfile = "client_facing_pitch" | "board_deck" | "internal_workshop";
export type RenderBlock = { id: string; heading: string; body: string; items?: readonly string[]; citations: readonly string[]; citationLabel?: string; layout?: SlideLayout };
export type RenderVisual = { data: string; aspectRatio: number; panelId: string; panelVersion: number; sha256: string };
export type RenderBrief = {
  workshopTitle: string;
  summary?: string;
  version: string;
  style: {
    accent: string;
    ink: string;
    paper: string;
    fonts?: readonly string[];
    intent?: IntentProfile;
    name?: string;
    logoData?: string;
    logoAspectRatio?: number;
  };
  blocks: readonly RenderBlock[];
  coverVisual?: RenderVisual;
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
const portableFont = (value: string | undefined) => !value || /^(?:system-ui|-apple-system|blinkmacsystemfont|ui-sans-serif|sans-serif|sf pro(?: system stack)?)$/i.test(value.trim()) ? "Arial" : value.trim();
const headingFont = (brief: RenderBrief) => portableFont(brief.style.fonts?.[0]);
const bodyFont = (brief: RenderBrief) => portableFont(brief.style.fonts?.[1] || brief.style.fonts?.[0]);
export function fitLogoBox(aspectRatio: number | undefined, maxWidth: number, maxHeight: number) {
  const ratio = aspectRatio && Number.isFinite(aspectRatio) && aspectRatio > 0 ? aspectRatio : 1;
  if (ratio >= maxWidth / maxHeight) return { width: maxWidth, height: maxWidth / ratio };
  return { width: maxHeight * ratio, height: maxHeight };
}
const deckLabel = (brief: RenderBrief) => `${brief.style.name ?? "Workshop"} · ${brief.style.intent === "board_deck" ? "Board presentation" : brief.style.intent === "internal_workshop" ? "Team workshop" : "Client presentation"}`;
const infographicLabel = (brief: RenderBrief) => brief.style.intent === "board_deck" ? "Leadership evidence brief" : brief.style.intent === "internal_workshop" ? "Workshop action brief" : "Source-defensible brief";
const intentProfile = (brief: RenderBrief): IntentProfile => brief.style.intent ?? "client_facing_pitch";
const intentClass = (brief: RenderBrief) => `intent-${intentProfile(brief).replaceAll("_", "-")}`;
const deckSummary = (brief: RenderBrief) => brief.summary?.trim() || (intentProfile(brief) === "board_deck"
  ? "Decision context and evidence from the approved Workshop."
  : intentProfile(brief) === "internal_workshop"
    ? "A grounded working plan for discussion and action."
    : "A source-defensible brief with a clear next move.");
const slideLayout = (block: RenderBlock, index: number, count: number): SlideLayout => block.layout ?? (index === 0 ? "statement" : index === count - 1 ? "recommendation" : index % 2 ? "split" : "proof");
const slideLabel = (layout: SlideLayout, intent: IntentProfile = "client_facing_pitch") => {
  if (intent === "board_deck") return layout === "proof" ? "Decision evidence" : layout === "sequence" ? "Operating sequence" : layout === "plan" ? "Execution plan" : layout === "decision" || layout === "recommendation" ? "Leadership decision" : layout === "split" ? "Decision context" : "Executive summary";
  if (intent === "internal_workshop") return layout === "proof" ? "What we know" : layout === "sequence" ? "How the work moves" : layout === "plan" ? "Working plan" : layout === "decision" ? "Decide together" : layout === "recommendation" ? "Next action" : layout === "split" ? "Discuss together" : "Working point";
  return layout === "proof" ? "Evidence" : layout === "sequence" ? "How it works" : layout === "plan" ? "Launch plan" : layout === "decision" ? "Decision required" : layout === "recommendation" ? "Recommended next move" : layout === "split" ? "What changes" : "Core insight";
};
const visibleCitationLabel = (block: RenderBlock) => (block.citationLabel ?? (block.citations.join(" · ") || "Approved Workshop brief")).replace(/\s+·\s+chunk\s+\d+\b/i, "");
const proofMetrics = (block: RenderBlock) => [...block.heading.matchAll(/(\d[\d,.]*[+%×x]?)[ ]+([A-Za-z][A-Za-z-]*)/gi)].filter((match) => !/^(?:and|for|in|of|to|with)$/i.test(match[2]!)).slice(0, 3).map((match) => ({ value: match[1]!, label: match[2]!.trim() }));
const sequenceStepDetail = (item: string) => {
  const normalized = item.trim().toLowerCase();
  if (normalized === "capture") return "Gather the raw material.";
  if (normalized === "shape") return "Organize what matters.";
  if (normalized === "deliver") return "Create the finished work.";
  return undefined;
};

function shell(title: string, brief: RenderBrief, body: string) {
  const heading = escapeHtml(headingFont(brief));
  const text = escapeHtml(bodyFont(brief));
  const accentText = accentForeground(brief);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${escapeHtml(title)}</title><style>
  :root{--accent:${brief.style.accent};--accent-foreground:${accentText};--ink:${brief.style.ink};--paper:${brief.style.paper};--muted:color-mix(in srgb,var(--ink) 56%,var(--paper));--line:color-mix(in srgb,var(--ink) 15%,var(--paper));--heading:'${heading}',Arial,sans-serif;--body:'${text}',Arial,sans-serif}
  *{box-sizing:border-box}html{background:#e8e8e5}body{margin:0;color:var(--ink);font-family:var(--body);background:#e8e8e5}.deck{display:grid;gap:28px;padding:28px}.slide{position:relative;overflow:hidden;width:min(1280px,calc(100vw - 56px));aspect-ratio:16/9;margin:auto;background:var(--paper);padding:6.4%;box-shadow:0 18px 52px rgba(0,0,0,.12)}.slide:after{content:attr(data-page);position:absolute;right:4.8%;bottom:4%;font-size:11px;color:var(--muted)}.cover{display:flex;flex-direction:column;justify-content:flex-end;background:var(--ink);color:var(--paper)}.cover:before{content:'';position:absolute;width:38%;aspect-ratio:1;border-radius:50%;background:var(--accent);right:-10%;top:-25%}.cover.has-visual:before{display:none}.cover-visual{position:absolute;right:4.8%;top:8%;width:42%;height:auto;max-height:78%;aspect-ratio:1;object-fit:contain}.cover.has-visual .title{max-width:52%}.cover.has-visual .subtitle{max-width:48%}.brand-logo{position:absolute;left:6.4%;top:6.4%;width:auto;height:64px;max-width:160px;object-fit:contain}.eyebrow{position:relative;color:var(--accent);font:700 11px/1 var(--body);letter-spacing:.14em;text-transform:uppercase}.cover .eyebrow{color:var(--paper);opacity:.72}.title{position:relative;font:500 clamp(38px,5.1vw,76px)/.98 var(--heading);letter-spacing:-.04em;max-width:88%;margin:22px 0}.subtitle{position:relative;max-width:68%;font-size:18px;line-height:1.45;color:color-mix(in srgb,var(--paper) 72%,transparent)}.slide h2{font:500 clamp(28px,3.7vw,56px)/1.02 var(--heading);letter-spacing:-.035em;margin:18px 0 28px;max-width:86%}.slide p{font-size:clamp(16px,1.55vw,23px);line-height:1.45;margin:0}.statement{display:flex;flex-direction:column;justify-content:center}.statement h2{font-size:clamp(38px,4.6vw,70px)}.statement .body{max-width:68%;border-left:5px solid var(--accent);padding-left:24px}.statement.is-sparse h2{max-width:92%;font-size:clamp(44px,5.3vw,78px)}.split{display:grid;grid-template-columns:30% 1fr;gap:8%;align-items:center;background:linear-gradient(90deg,color-mix(in srgb,var(--accent) 8%,var(--paper)) 0 31%,var(--paper) 31%)}.split .number{font:500 clamp(100px,15vw,220px)/.8 var(--heading);color:var(--accent);letter-spacing:-.08em}.split.is-sparse h2{max-width:94%;font-size:clamp(34px,4vw,62px)}.proof{display:grid;grid-template-columns:1fr 36%;gap:8%;align-items:end}.proof .proof-card{align-self:stretch;border-radius:4px;background:var(--ink);color:var(--paper);padding:30px;display:flex;flex-direction:column;justify-content:flex-end}.proof .proof-card strong{font:500 26px/1.15 var(--heading)}.proof.has-items{grid-template-columns:minmax(0,1fr) 42%;align-items:center}.proof-item-grid{display:grid;gap:14px;counter-reset:proof-item}.proof-item{counter-increment:proof-item;display:grid;grid-template-columns:38px 1fr;align-items:center;min-height:112px;padding:20px 22px;background:var(--ink);color:var(--paper);font:500 clamp(15px,1.35vw,20px)/1.28 var(--heading)}.proof-item:before{content:counter(proof-item,decimal-leading-zero);color:var(--accent);font:700 11px/1 var(--body);letter-spacing:.1em}.proof.is-sparse>div{align-self:center}.proof.metrics{display:flex;flex-direction:column;justify-content:center;align-items:stretch}.metric-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5%;margin:36px 0 30px}.metric-grid[data-count="3"]{grid-template-columns:repeat(3,minmax(0,1fr));gap:3.5%}.metric{border-top:2px solid var(--accent);padding-top:18px}.metric strong{display:block;font:500 clamp(64px,8vw,120px)/.85 var(--heading);letter-spacing:-.065em;color:var(--ink)}.metric-grid[data-count="3"] .metric strong{font-size:clamp(54px,6.4vw,96px)}.metric span{display:block;margin-top:12px;color:var(--muted);font-size:14px;text-transform:uppercase;letter-spacing:.12em}.proof.metrics .body{max-width:86%;font-size:clamp(15px,1.35vw,20px)}.recommendation{background:var(--accent);color:var(--accent-foreground);display:flex;flex-direction:column;justify-content:center}.recommendation .eyebrow,.recommendation .cite{color:var(--accent-foreground)}.recommendation h2{font-size:clamp(40px,5vw,76px);max-width:92%}.recommendation.is-sparse h2{font-size:clamp(46px,5.4vw,82px)}.cite{position:absolute;left:6.4%;bottom:4%;max-width:78%;font-size:10px!important;line-height:1.3!important;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.infographic{position:relative;width:min(1280px,calc(100vw - 48px));aspect-ratio:16/9;margin:24px auto;background:var(--paper);padding:5.2% 6%;box-shadow:0 18px 52px rgba(0,0,0,.12)}.infographic:before{content:'';position:absolute;inset:0 auto 0 0;width:18px;background:var(--accent)}.infographic .title{font-size:clamp(34px,3.8vw,58px);margin:18px 0 34px;max-width:82%}.infographic-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:28px 42px}.infographic .block{position:relative;min-height:180px;border-top:2px solid var(--line);padding:22px 0 30px 64px}.infographic .block-number{position:absolute;left:0;top:22px;color:var(--accent);font-weight:700}.infographic .block h2{font:500 clamp(20px,2vw,29px)/1.08 var(--heading);letter-spacing:-.025em;margin:0 0 12px}.infographic .block>div>p:not(.cite){color:var(--muted);font-size:clamp(13px,1.15vw,17px);line-height:1.35}.infographic .block .cite{position:absolute;left:64px;bottom:8px;margin:0!important;max-width:calc(100% - 64px);white-space:nowrap}
  .split:not(.is-sparse),.intent-board-deck .split:not(.is-sparse),.intent-internal-workshop .split:not(.is-sparse){grid-template-columns:minmax(0,45%) minmax(0,1fr);background:var(--paper)}.split-heading{align-self:center}.split-heading h2{max-width:100%}.split-body{border-left:5px solid var(--accent);padding-left:8%;font-size:clamp(16px,1.55vw,23px);line-height:1.45}
  .split.is-sparse{display:flex;align-items:center;background:var(--ink);color:var(--paper);padding-left:8%;padding-right:8%}.split.is-sparse:before{content:'';position:absolute;left:6.4%;top:18%;bottom:18%;width:6px;background:var(--accent)}.split.is-sparse .number{position:absolute;right:4%;bottom:-10%;font-size:clamp(180px,24vw,340px);line-height:.8;opacity:.92}.split.is-sparse>div:not(.number){position:relative;z-index:1;width:82%;padding-left:4%}.split.is-sparse .eyebrow{color:var(--accent)}.split.is-sparse h2{max-width:78%;font-size:clamp(44px,5.3vw,78px);color:var(--paper)}.split.is-sparse .cite{color:color-mix(in srgb,var(--paper) 62%,transparent)}
  .intent-board-deck .cover{background:var(--paper);color:var(--ink);border-top:14px solid var(--accent)}.intent-board-deck .cover:before{display:none}.intent-board-deck .cover .eyebrow{color:var(--ink);opacity:.7}.intent-board-deck .cover .title{max-width:74%;font-size:clamp(34px,4.4vw,64px)}.intent-board-deck .cover .subtitle{color:var(--muted);max-width:76%}.intent-board-deck .slide:not(.cover){border-top:7px solid var(--accent)}.intent-board-deck .slide h2{font-size:clamp(28px,3.2vw,48px);max-width:92%}.intent-board-deck .statement .body{max-width:82%}.intent-board-deck .split{grid-template-columns:24% 1fr}.intent-board-deck .split .number{font-size:clamp(72px,10vw,150px)}.intent-board-deck .recommendation{background:var(--ink);color:var(--paper)}.intent-board-deck .recommendation .eyebrow,.intent-board-deck .recommendation .cite{color:var(--paper)}
  .intent-internal-workshop .cover{background:var(--accent);color:var(--accent-foreground)}.intent-internal-workshop .cover:before{border-radius:0;background:var(--ink);opacity:.1;inset:0 0 0 auto;height:100%;width:30%}.intent-internal-workshop .cover .eyebrow,.intent-internal-workshop .cover .subtitle{color:var(--accent-foreground)}.intent-internal-workshop .cover .brand-logo{height:72px;max-width:176px;padding:8px;background:var(--paper);border-radius:4px}.intent-internal-workshop .slide:not(.cover){border-left:12px solid var(--accent)}.intent-internal-workshop .slide h2{max-width:92%}.intent-internal-workshop .split{grid-template-columns:22% 1fr;background:linear-gradient(90deg,color-mix(in srgb,var(--accent) 13%,var(--paper)) 0 23%,var(--paper) 23%)}.intent-internal-workshop .split .number{font-size:clamp(72px,10vw,150px)}.intent-internal-workshop .split.is-sparse{background:color-mix(in srgb,var(--accent) 10%,var(--paper));color:var(--ink)}.intent-internal-workshop .split.is-sparse h2{color:var(--ink)}.intent-internal-workshop .split.is-sparse .number{opacity:.18}.intent-internal-workshop .split.is-sparse .cite{color:var(--muted)}
  .sequence{display:flex;flex-direction:column;justify-content:center}.sequence h2{max-width:78%;margin-bottom:34px}.sequence-flow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:34px;counter-reset:sequence}.sequence-step{counter-increment:sequence;position:relative;min-height:190px;padding:28px 24px;background:color-mix(in srgb,var(--accent) 7%,var(--paper));border-top:4px solid var(--accent);display:flex;flex-direction:column}.sequence-step:before{content:counter(sequence,decimal-leading-zero);color:var(--accent);font:700 11px/1 var(--body);letter-spacing:.12em}.sequence-step:not(:last-child):after{content:'→';position:absolute;right:-27px;top:50%;transform:translateY(-50%);color:var(--accent);font:500 24px/1 var(--heading)}.sequence-step span{margin-top:auto;font:500 clamp(24px,2.35vw,36px)/1.05 var(--heading);letter-spacing:-.03em}.sequence-step small{display:block;min-height:2.7em;margin-top:12px;color:var(--muted);font:400 clamp(12px,1.1vw,16px)/1.35 var(--body)}
  .plan{display:flex;flex-direction:column;justify-content:center}.plan h2{margin-bottom:20px}.plan .body{max-width:78%;color:var(--muted);font-size:clamp(14px,1.25vw,18px)}.plan-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px;margin-top:34px}.plan-step{min-height:150px;border-top:3px solid var(--accent);padding:18px 14px;background:color-mix(in srgb,var(--accent) 5%,var(--paper))}.plan-step strong{display:block;color:var(--accent);font-size:11px;letter-spacing:.12em;text-transform:uppercase;margin-bottom:14px}.plan-step span{font:500 clamp(16px,1.45vw,21px)/1.25 var(--heading)}
  .decision{display:grid;grid-template-columns:1fr 44%;gap:7%;align-items:center}.decision h2{max-width:96%}.decision .body{max-width:88%;color:var(--muted);font-size:clamp(14px,1.3vw,19px)}.decision-list{display:grid;gap:12px;counter-reset:decision}.decision-item{counter-increment:decision;display:grid;grid-template-columns:34px 1fr;align-items:center;min-height:70px;padding:14px 16px;background:var(--ink);color:var(--paper);font-size:clamp(14px,1.2vw,18px)}.decision-item:before{content:counter(decision,decimal-leading-zero);color:var(--accent);font-size:11px;font-weight:700}
  .infographic .block[data-layout="sequence"]{background:color-mix(in srgb,var(--accent) 6%,var(--paper));border-top-color:var(--accent);padding-right:22px}.infographic-sequence{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:22px;margin-top:24px;counter-reset:infographic-sequence}.infographic-sequence span{counter-increment:infographic-sequence;position:relative;min-height:58px;padding:28px 12px 10px;border-top:3px solid var(--accent);font:500 clamp(14px,1.35vw,19px)/1.05 var(--heading)}.infographic-sequence span:before{content:counter(infographic-sequence,decimal-leading-zero);position:absolute;top:9px;left:12px;color:var(--accent);font:700 8px/1 var(--body);letter-spacing:.1em}.infographic-sequence span:not(:last-child):after{content:'→';position:absolute;right:-18px;top:27px;color:var(--accent);font:500 14px/1 var(--heading)}
  .infographic.intent-board-deck{border-top:14px solid var(--accent);padding-top:4.6%}.infographic.intent-board-deck:before{display:none}.infographic.intent-board-deck .title{font-size:clamp(30px,3.3vw,50px);max-width:72%}.infographic.intent-board-deck .block{padding-left:54px}.infographic.intent-board-deck .block .cite{left:54px;max-width:calc(100% - 54px)}
  .infographic.intent-internal-workshop{background:color-mix(in srgb,var(--accent) 8%,var(--paper))}.infographic.intent-internal-workshop:before{width:24px}.infographic.intent-internal-workshop .title{max-width:92%}.infographic.intent-internal-workshop .block{border-top:3px solid var(--accent);background:var(--paper);padding:22px 18px 30px 68px}.infographic.intent-internal-workshop .block-number{left:18px}.infographic.intent-internal-workshop .block .cite{left:68px;max-width:calc(100% - 86px)}
  @media print{html,body{background:white}.deck{display:block;padding:0}.slide{width:100vw;height:100vh;box-shadow:none;break-after:page}.infographic{box-shadow:none;margin:0;width:100vw;height:100vh}}@media(max-width:720px){.deck{padding:12px;gap:12px}.slide{width:calc(100vw - 24px);padding:7%}.split,.proof,.decision{display:flex;flex-direction:column;align-items:stretch;justify-content:center}.split .number{font-size:72px}.split.is-sparse .number{font-size:120px}.proof .proof-card{display:none}.sequence-flow{gap:14px}.sequence-step{min-height:92px;padding:14px 10px}.sequence-step:not(:last-child):after{display:none}.plan-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.plan-step{min-height:110px}.cite{max-width:72%}.infographic{width:calc(100vw - 24px);aspect-ratio:auto;margin:12px;padding:44px 28px 44px 38px}.infographic-grid{grid-template-columns:1fr}.infographic .block{min-height:160px}}
  </style></head><body>${body}</body></html>`;
}

function citationText(block: RenderBlock) { return block.citations.length ? `Source: ${visibleCitationLabel(block)}` : "Source: approved Workshop brief"; }
function citationData(block: RenderBlock) { return block.citations.length ? ` data-source="${escapeHtml(block.citations.join(" | "))}"` : ""; }

export function renderDeck(brief: RenderBrief): string {
  const logo = brief.style.logoData ? `<img class="brand-logo" alt="" src="${escapeHtml(brief.style.logoData)}">` : "";
  const coverVisual = brief.coverVisual ? `<img class="cover-visual" alt="" src="${escapeHtml(brief.coverVisual.data)}" data-image-panel="${escapeHtml(brief.coverVisual.panelId)}" data-image-version="${brief.coverVisual.panelVersion}" data-image-sha256="${brief.coverVisual.sha256}">` : "";
  const cover = `<section class="slide cover${coverVisual ? " has-visual" : ""}" data-page="01">${coverVisual}${logo}<div class="eyebrow">${escapeHtml(deckLabel(brief))}</div><h1 class="title">${escapeHtml(brief.workshopTitle)}</h1><p class="subtitle">${escapeHtml(deckSummary(brief))}</p></section>`;
  const slides = brief.blocks.map((block, index) => {
    const layout = slideLayout(block, index, brief.blocks.length);
    const sparse = !block.body.trim();
    const page = String(index + 2).padStart(2, "0");
    const eyebrow = `<div class="eyebrow">${page} · ${escapeHtml(slideLabel(layout, intentProfile(brief)))}</div>`;
    const heading = `<h2>${escapeHtml(block.heading)}</h2>`;
    const body = sparse ? "" : `<p class="body">${escapeHtml(block.body)}</p>`;
    const cite = `<p class="cite"${citationData(block)}>${escapeHtml(citationText(block))}</p>`;
    if (layout === "split") return sparse
      ? `<section class="slide split is-sparse" data-page="${page}"><div class="number">${String(index + 1).padStart(2, "0")}</div><div>${eyebrow}${heading}</div>${cite}</section>`
      : `<section class="slide split" data-page="${page}"><div class="split-heading">${eyebrow}${heading}</div><div class="split-body">${body}</div>${cite}</section>`;
    if (layout === "proof") {
      const metrics = proofMetrics(block);
      if (metrics.length) return `<section class="slide proof metrics" data-page="${page}">${eyebrow}<div class="metric-grid" data-count="${metrics.length}">${metrics.map((metric) => `<div class="metric"><strong>${escapeHtml(metric.value)}</strong><span>${escapeHtml(metric.label)}</span></div>`).join("")}</div>${body}${cite}</section>`;
      if (block.items?.length) return `<section class="slide proof has-items" data-page="${page}"><div>${eyebrow}${heading}${body}</div><div class="proof-item-grid">${block.items.slice(0, 3).map((item) => `<div class="proof-item">${escapeHtml(item)}</div>`).join("")}</div>${cite}</section>`;
      return `<section class="slide proof${sparse ? " is-sparse" : ""}" data-page="${page}"><div>${eyebrow}${heading}${body}</div><aside class="proof-card"><span class="eyebrow">Source-backed</span><strong>${escapeHtml(visibleCitationLabel(block))}</strong></aside>${cite}</section>`;
    }
    if (layout === "sequence") return `<section class="slide sequence" data-page="${page}">${eyebrow}${heading}<div class="sequence-flow">${(block.items ?? []).slice(0, 4).map((item) => { const detail = sequenceStepDetail(item); return `<div class="sequence-step"><span>${escapeHtml(item)}</span>${detail ? `<small>${escapeHtml(detail)}</small>` : ""}</div>`; }).join("")}</div>${cite}</section>`;
    if (layout === "plan") return `<section class="slide plan" data-page="${page}">${eyebrow}${heading}${body}<div class="plan-grid">${(block.items ?? []).map((item, itemIndex) => `<div class="plan-step"><strong>Week ${itemIndex + 1}</strong><span>${escapeHtml(item)}</span></div>`).join("")}</div>${cite}</section>`;
    if (layout === "decision") return `<section class="slide decision" data-page="${page}"><div>${eyebrow}${heading}${body}</div><div class="decision-list">${(block.items ?? []).map((item) => `<div class="decision-item">${escapeHtml(item)}</div>`).join("")}</div>${cite}</section>`;
    return `<section class="slide ${layout}${sparse ? " is-sparse" : ""}" data-page="${page}">${eyebrow}${heading}${body}${cite}</section>`;
  }).join("\n");
  return shell(`${brief.workshopTitle} deck`, brief, `<main class="deck ${intentClass(brief)}" data-intent="${intentProfile(brief)}">${cover}${slides}</main>`);
}

export function renderInfographic(brief: RenderBrief): string {
  const blocks = brief.blocks.map((block, index) => {
    const layout = slideLayout(block, index, brief.blocks.length);
    const body = layout === "sequence" && block.items?.length
      ? `<div class="infographic-sequence">${block.items.slice(0, 4).map((item) => `<span>${escapeHtml(item)}</span>`).join("")}</div>`
      : block.body.trim() ? `<p>${escapeHtml(block.body)}</p>` : "";
    return `<article class="block" data-layout="${layout}"><div class="block-number">${String(index + 1).padStart(2, "0")}</div><div><h2>${escapeHtml(block.heading)}</h2>${body}<p class="cite"${citationData(block)}>${escapeHtml(citationText(block))}</p></div></article>`;
  }).join("\n");
  return shell(`${brief.workshopTitle} infographic`, brief, `<main class="infographic ${intentClass(brief)}" data-intent="${intentProfile(brief)}"><div class="eyebrow">${escapeHtml(infographicLabel(brief))}</div><h1 class="title">${escapeHtml(brief.workshopTitle)}</h1><section class="infographic-grid">${blocks}</section></main>`);
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
  const intent = intentProfile(brief); const board = intent === "board_deck"; const workshop = intent === "internal_workshop";
  const coverBackground = board ? paper : workshop ? accent : ink; const coverForeground = board ? ink : workshop ? accentText : paper;

  const cover = pptx.addSlide(); cover.background = { color: coverBackground };
  if (brief.coverVisual) {
    const box = fitLogoBox(brief.coverVisual.aspectRatio, 5.6, 5.6);
    cover.addImage({ data: brief.coverVisual.data, x: 7.12 + (5.6 - box.width) / 2, y: 0.72 + (5.6 - box.height) / 2, w: box.width, h: box.height });
  }
  if (board) cover.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.12, fill: { color: accent }, line: { color: accent } });
  else if (workshop) cover.addShape(pptx.ShapeType.rect, { x: 9.45, y: 0, w: 3.9, h: 7.5, fill: { color: ink, transparency: 90 }, line: { color: ink, transparency: 100 } });
  else if (!brief.coverVisual) cover.addShape(pptx.ShapeType.ellipse, { x: 9.8, y: -2.1, w: 5.5, h: 5.5, fill: { color: accent }, line: { color: accent } });
  if (brief.style.logoData) {
    const logo = fitLogoBox(brief.style.logoAspectRatio, 1.6, 0.68);
    if (workshop) cover.addShape(pptx.ShapeType.rect, { x: 0.67, y: 0.52, w: logo.width + 0.16, h: 0.88, fill: { color: paper }, line: { color: paper } });
    cover.addImage({ data: brief.style.logoData, x: 0.75, y: 0.62 + (0.68 - logo.height) / 2, w: logo.width, h: logo.height });
  }
  const coverTextWidth = brief.coverVisual ? 5.9 : board ? 9.1 : 10.7;
  cover.addText(deckLabel(brief).toUpperCase(), { x: 0.75, y: 4.75, w: coverTextWidth, h: 0.25, fontFace: bodyFont(brief), fontSize: board ? 8.5 : 9, bold: true, color: coverForeground, transparency: 0, charSpacing: board ? 0 : 1.6, margin: 0 });
  cover.addText(brief.workshopTitle, { x: 0.72, y: 5.12, w: coverTextWidth, h: 1.15, fontFace: headingFont(brief), fontSize: board ? 36 : 42, bold: false, color: coverForeground, margin: 0, breakLine: false, fit: "shrink" });
  cover.addText(deckSummary(brief), { x: 0.75, y: 6.38, w: brief.coverVisual ? 5.9 : board ? 9.1 : 7.8, h: 0.42, fontFace: bodyFont(brief), fontSize: 12, color: coverForeground, transparency: board ? 34 : 22, margin: 0, fit: "shrink" });
  addPptxFooter(cover, brief, undefined, 1, coverForeground);

  brief.blocks.forEach((block, index) => {
    const layout = slideLayout(block, index, brief.blocks.length); const slide = pptx.addSlide(); slide.background = { color: layout === "recommendation" ? (board ? ink : accent) : paper };
    const foreground = layout === "recommendation" ? (board ? paper : accentText) : ink; const label = slideLabel(layout, intent).toUpperCase(); const body = block.body.trim();
    if (board) slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 0.07, fill: { color: accent }, line: { color: accent } });
    if (workshop) slide.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 0.12, h: 7.5, fill: { color: accent }, line: { color: accent } });
    if (layout === "split") {
      if (!body) {
        const sparseForeground = workshop ? ink : paper;
        slide.background = { color: workshop ? paper : ink };
        slide.addShape(pptx.ShapeType.rect, { x: 0.75, y: 1.32, w: 0.07, h: 4.55, fill: { color: accent }, line: { color: accent, transparency: 100 } });
        slide.addText(String(index + 1).padStart(2, "0"), { x: 10.15, y: 4.72, w: 2.55, h: 2.15, fontFace: headingFont(brief), fontSize: 104, color: accent, transparency: workshop ? 70 : 10, margin: 0, fit: "shrink", align: "right" });
        slide.addText(label, { x: 1.1, y: 1.48, w: 5.6, h: 0.2, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: accent, charSpacing: 1.5, margin: 0 });
        slide.addText(block.heading, { x: 1.08, y: 2.0, w: 9.2, h: 2.8, fontFace: headingFont(brief), fontSize: 44, color: sparseForeground, margin: 0, breakLine: false, fit: "shrink", valign: "mid" });
      } else {
        slide.addText(label, { x: 0.75, y: 1.15, w: 5.25, h: 0.2, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: accent, charSpacing: 1.5, margin: 0 });
        slide.addText(block.heading, { x: 0.72, y: 1.7, w: 5.3, h: 2.35, fontFace: headingFont(brief), fontSize: 32, color: ink, margin: 0, breakLine: false, fit: "shrink", valign: "mid" });
        slide.addShape(pptx.ShapeType.rect, { x: 6.55, y: 1.18, w: 0.055, h: 4.65, fill: { color: accent }, line: { color: accent, transparency: 100 } });
        slide.addText(body, { x: 7.05, y: 1.65, w: 5.05, h: 3.45, fontFace: bodyFont(brief), fontSize: 18, color: ink, margin: 0, breakLine: false, fit: "shrink", valign: "mid" });
      }
    } else if (layout === "proof") {
      const metrics = proofMetrics(block);
      slide.addText(label, { x: 0.75, y: 0.82, w: 5.6, h: 0.2, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: accent, charSpacing: 1.5, margin: 0 });
      if (metrics.length) {
        const metricGap = metrics.length === 3 ? 0.45 : 0.7;
        const metricWidth = metrics.length === 1 ? 5.4 : (11.8 - metricGap * (metrics.length - 1)) / metrics.length;
        metrics.forEach((metric, metricIndex) => {
          const x = 0.75 + metricIndex * (metricWidth + metricGap);
          slide.addShape(pptx.ShapeType.rect, { x, y: 1.48, w: metricWidth, h: 0.025, fill: { color: accent }, line: { color: accent, transparency: 100 } });
          slide.addText(metric.value, { x, y: 1.78, w: metricWidth, h: 1.45, fontFace: headingFont(brief), fontSize: metrics.length === 3 ? 50 : 58, color: ink, margin: 0, breakLine: false, fit: "shrink" });
          slide.addText(metric.label.toUpperCase(), { x, y: 3.24, w: metricWidth, h: 0.42, fontFace: bodyFont(brief), fontSize: 8, bold: true, color: ink, transparency: 34, margin: 0 });
        });
        if (body) slide.addText(body, { x: 0.75, y: 4.25, w: 9.8, h: 1.05, fontFace: bodyFont(brief), fontSize: 16, color: ink, margin: 0, breakLine: false, fit: "shrink", valign: "top" });
      } else {
        const proofItems = block.items?.slice(0, 3) ?? [];
        const contentWidth = proofItems.length ? 5.9 : 7.3;
        slide.addText(block.heading, { x: 0.72, y: body ? 1.25 : 2.0, w: contentWidth, h: body ? 1.6 : 2.15, fontFace: headingFont(brief), fontSize: body ? 32 : 38, color: ink, margin: 0, breakLine: false, fit: "shrink" });
        if (body) slide.addText(body, { x: 0.75, y: 3.05, w: proofItems.length ? 5.75 : 7.0, h: 1.65, fontFace: bodyFont(brief), fontSize: 18, color: ink, margin: 0, breakLine: false, fit: "shrink", valign: "top" });
        if (proofItems.length) {
          const itemGap = 0.18;
          const itemHeight = Math.min(1.72, (4.72 - itemGap * (proofItems.length - 1)) / proofItems.length);
          proofItems.forEach((item, itemIndex) => {
            const y = 1.18 + itemIndex * (itemHeight + itemGap);
            slide.addShape(pptx.ShapeType.rect, { x: 7.1, y, w: 5.45, h: itemHeight, fill: { color: ink }, line: { color: ink } });
            slide.addText(String(itemIndex + 1).padStart(2, "0"), { x: 7.38, y: y + itemHeight / 2 - 0.1, w: 0.42, h: 0.2, fontFace: bodyFont(brief), fontSize: 8, bold: true, color: accent, margin: 0 });
            slide.addText(item, { x: 8.02, y: y + 0.22, w: 4.05, h: itemHeight - 0.44, fontFace: headingFont(brief), fontSize: 16, color: paper, margin: 0, breakLine: false, fit: "shrink", valign: "mid" });
          });
        } else {
          slide.addShape(pptx.ShapeType.rect, { x: 8.55, y: 0.72, w: 4.05, h: 5.95, fill: { color: ink }, line: { color: ink }, radius: 0.04 });
          slide.addText("SOURCE-BACKED", { x: 8.95, y: 4.25, w: 3.15, h: 0.22, fontFace: bodyFont(brief), fontSize: 8, bold: true, color: accent, charSpacing: 1.2, margin: 0 });
          slide.addText(visibleCitationLabel(block), { x: 8.92, y: 4.72, w: 3.1, h: 1.15, fontFace: headingFont(brief), fontSize: 20, color: paper, margin: 0, breakLine: false, fit: "shrink", valign: "bottom" });
        }
      }
    } else if (layout === "sequence") {
      slide.addText(label, { x: 0.75, y: 0.82, w: 5.6, h: 0.2, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: accent, charSpacing: 1.5, margin: 0 });
      slide.addText(block.heading, { x: 0.72, y: 1.28, w: 10.4, h: 1.15, fontFace: headingFont(brief), fontSize: 34, color: ink, margin: 0, fit: "shrink" });
      const steps = (block.items ?? []).slice(0, 4);
      const gap = 0.38;
      const width = (11.83 - gap * Math.max(0, steps.length - 1)) / Math.max(1, steps.length);
      steps.forEach((item, itemIndex) => {
        const detail = sequenceStepDetail(item);
        const x = 0.75 + itemIndex * (width + gap);
        slide.addShape(pptx.ShapeType.rect, { x, y: 3.0, w: width, h: 0.045, fill: { color: accent }, line: { color: accent, transparency: 100 } });
        slide.addShape(pptx.ShapeType.rect, { x, y: 3.045, w: width, h: 2.12, fill: { color: accent, transparency: 94 }, line: { color: accent, transparency: 100 } });
        slide.addText(String(itemIndex + 1).padStart(2, "0"), { x: x + 0.22, y: 3.38, w: 0.44, h: 0.22, fontFace: bodyFont(brief), fontSize: 8, bold: true, color: accent, margin: 0 });
        slide.addText(item, { x: x + 0.22, y: detail ? 3.78 : 4.08, w: width - 0.44, h: detail ? 0.58 : 0.72, fontFace: headingFont(brief), fontSize: 24, color: ink, margin: 0, fit: "shrink", valign: "mid" });
        if (detail) slide.addText(detail, { x: x + 0.22, y: 4.48, w: width - 0.44, h: 0.46, fontFace: bodyFont(brief), fontSize: 10.5, color: ink, transparency: 34, margin: 0, fit: "shrink", valign: "top" });
        if (itemIndex < steps.length - 1) slide.addText("→", { x: x + width + 0.05, y: 3.92, w: gap - 0.1, h: 0.4, fontFace: headingFont(brief), fontSize: 18, color: accent, margin: 0, align: "center" });
      });
    } else if (layout === "plan") {
      slide.addText(label, { x: 0.75, y: 0.78, w: 5.6, h: 0.2, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: accent, charSpacing: 1.5, margin: 0 });
      slide.addText(block.heading, { x: 0.72, y: 1.18, w: 11.3, h: 0.95, fontFace: headingFont(brief), fontSize: 32, color: ink, margin: 0, fit: "shrink" });
      if (body) slide.addText(body, { x: 0.75, y: 2.12, w: 10.2, h: 0.42, fontFace: bodyFont(brief), fontSize: 12, color: ink, transparency: 28, margin: 0, fit: "shrink" });
      (block.items ?? []).slice(0, 4).forEach((item, itemIndex) => {
        const x = 0.75 + itemIndex * 3.05;
        slide.addShape(pptx.ShapeType.rect, { x, y: 3.0, w: 2.7, h: 0.035, fill: { color: accent }, line: { color: accent, transparency: 100 } });
        slide.addShape(pptx.ShapeType.rect, { x, y: 3.04, w: 2.7, h: 2.15, fill: { color: accent, transparency: 95 }, line: { color: accent, transparency: 100 } });
        slide.addText(`WEEK ${itemIndex + 1}`, { x: x + 0.18, y: 3.35, w: 2.3, h: 0.2, fontFace: bodyFont(brief), fontSize: 8, bold: true, color: accent, charSpacing: 1.2, margin: 0 });
        slide.addText(item, { x: x + 0.18, y: 3.82, w: 2.25, h: 0.88, fontFace: headingFont(brief), fontSize: 17, color: ink, margin: 0, fit: "shrink", valign: "mid" });
      });
    } else if (layout === "decision") {
      slide.addText(label, { x: 0.75, y: 1.02, w: 5.6, h: 0.2, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: accent, charSpacing: 1.5, margin: 0 });
      slide.addText(block.heading, { x: 0.72, y: 1.48, w: 6.2, h: 1.55, fontFace: headingFont(brief), fontSize: 34, color: ink, margin: 0, fit: "shrink" });
      if (body) slide.addText(body, { x: 0.75, y: 3.35, w: 5.7, h: 1.15, fontFace: bodyFont(brief), fontSize: 15, color: ink, transparency: 22, margin: 0, fit: "shrink", valign: "top" });
      (block.items ?? []).slice(0, 4).forEach((item, itemIndex) => {
        const y = 1.18 + itemIndex * 1.22;
        slide.addShape(pptx.ShapeType.rect, { x: 7.35, y, w: 5.2, h: 0.98, fill: { color: ink }, line: { color: ink } });
        slide.addText(String(itemIndex + 1).padStart(2, "0"), { x: 7.62, y: y + 0.36, w: 0.42, h: 0.18, fontFace: bodyFont(brief), fontSize: 8, bold: true, color: accent, margin: 0 });
        slide.addText(item, { x: 8.2, y: y + 0.22, w: 3.95, h: 0.52, fontFace: bodyFont(brief), fontSize: 14, color: paper, margin: 0, fit: "shrink", valign: "mid" });
      });
    } else {
      slide.addText(label, { x: 0.75, y: layout === "statement" ? 1.18 : 1.02, w: 5.6, h: 0.2, fontFace: bodyFont(brief), fontSize: 9, bold: true, color: layout === "recommendation" ? accentText : accent, charSpacing: 1.5, margin: 0 });
      slide.addText(block.heading, { x: 0.72, y: body ? (layout === "statement" ? 1.72 : 1.55) : 2.2, w: 11.35, h: body ? 2.15 : 2.7, fontFace: headingFont(brief), fontSize: body ? (layout === "recommendation" ? 42 : 38) : (layout === "recommendation" ? 48 : 44), color: foreground, margin: 0, breakLine: false, fit: "shrink" });
      if (body) {
        slide.addShape(pptx.ShapeType.rect, { x: 0.75, y: 4.42, w: 0.07, h: 1.28, fill: { color: layout === "recommendation" ? accentText : accent, transparency: layout === "recommendation" ? 20 : 0 }, line: { color: layout === "recommendation" ? accentText : accent, transparency: 100 } });
        slide.addText(body, { x: 1.1, y: 4.38, w: 8.9, h: 1.35, fontFace: bodyFont(brief), fontSize: 18, color: foreground, margin: 0, breakLine: false, fit: "shrink", valign: "mid" });
      }
    }
    addPptxFooter(slide, brief, block, index + 2, layout === "recommendation" ? foreground : layout === "split" && !body ? (workshop ? ink : paper) : undefined);
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
  const intent = intentProfile(brief); const board = intent === "board_deck"; const workshop = intent === "internal_workshop";
  const slide = pptx.addSlide(); slide.background = { color: paper };
  slide.addShape(pptx.ShapeType.rect, board ? { x: 0, y: 0, w: 13.333, h: 0.12, fill: { color: accent }, line: { color: accent } } : { x: 0, y: 0, w: workshop ? 0.3 : 0.22, h: 7.5, fill: { color: accent }, line: { color: accent } });
  const logo = brief.style.logoData ? fitLogoBox(brief.style.logoAspectRatio, 1.3, 0.5) : undefined;
  if (brief.style.logoData && logo) slide.addImage({ data: brief.style.logoData, x: 0.68, y: 0.48 + (0.5 - logo.height) / 2, w: logo.width, h: logo.height });
  slide.addText(infographicLabel(brief).toUpperCase(), { x: logo ? 0.68 + logo.width + 0.2 : 0.68, y: 0.58, w: logo ? 5.8 - logo.width : 5.8, h: 0.2, fontFace: bodyFont(brief), fontSize: 8, bold: true, color: accent, charSpacing: board ? 0 : 1.4, margin: 0 });
  slide.addText(brief.workshopTitle, { x: 0.68, y: 1.05, w: board ? 9.4 : 11.8, h: 0.76, fontFace: headingFont(brief), fontSize: board ? 27 : 30, color: ink, margin: 0, breakLine: false, fit: "shrink" });
  const blocks = brief.blocks.slice(0, 4); const cardWidth = 5.58; const cardHeight = 1.82;
  blocks.forEach((block, index) => {
    const column = index % 2; const row = Math.floor(index / 2); const x = 0.72 + column * 6.08; const y = 2.02 + row * 2.27;
    const layout = slideLayout(block, index, blocks.length);
    const headingPrefix = block.heading.replace(/…$/, "").trim();
    const bodyRepeatsHeading = Boolean(headingPrefix && block.body.toLowerCase().startsWith(headingPrefix.toLowerCase()));
    const primaryText = block.heading.endsWith("…") && bodyRepeatsHeading ? block.body : block.heading;
    const supportingText = block.body.trim() && !bodyRepeatsHeading ? block.body : undefined;
    if (workshop || layout === "sequence") slide.addShape(pptx.ShapeType.rect, { x, y: workshop ? y - 0.08 : y, w: cardWidth, h: workshop ? cardHeight + 0.18 : cardHeight, fill: { color: accent, transparency: 94 }, line: { color: accent, transparency: 100 } });
    slide.addShape(pptx.ShapeType.rect, { x, y, w: cardWidth, h: layout === "sequence" || workshop ? 0.035 : 0.02, fill: { color: layout === "sequence" || workshop ? accent : ink, transparency: layout === "sequence" || workshop ? 18 : 82 }, line: { color: layout === "sequence" || workshop ? accent : ink, transparency: 100 } });
    slide.addText(String(index + 1).padStart(2, "0"), { x, y: y + 0.28, w: 0.5, h: 0.28, fontFace: bodyFont(brief), fontSize: 10, bold: true, color: accent, margin: 0 });
    slide.addText(primaryText, { x: x + 0.68, y: y + 0.22, w: cardWidth - 0.68, h: layout === "sequence" ? 0.48 : supportingText ? 0.68 : 1.02, fontFace: headingFont(brief), fontSize: layout === "sequence" ? 15 : supportingText ? 17 : 19, color: ink, margin: 0, breakLine: false, fit: "shrink", valign: "top" });
    if (layout === "sequence" && block.items?.length) {
      const steps = block.items.slice(0, 4); const stepGap = 0.18; const stepWidth = (cardWidth - 0.68 - stepGap * Math.max(0, steps.length - 1)) / steps.length;
      steps.forEach((item, itemIndex) => {
        const stepX = x + 0.68 + itemIndex * (stepWidth + stepGap);
        slide.addShape(pptx.ShapeType.rect, { x: stepX, y: y + 0.88, w: stepWidth, h: 0.035, fill: { color: accent }, line: { color: accent, transparency: 100 } });
        slide.addText(String(itemIndex + 1).padStart(2, "0"), { x: stepX + 0.08, y: y + 1.0, w: 0.25, h: 0.14, fontFace: bodyFont(brief), fontSize: 5.5, bold: true, color: accent, margin: 0 });
        slide.addText(item, { x: stepX + 0.08, y: y + 1.22, w: stepWidth - 0.16, h: 0.3, fontFace: headingFont(brief), fontSize: 10.5, color: ink, margin: 0, fit: "shrink", valign: "mid" });
        if (itemIndex < steps.length - 1) slide.addText("→", { x: stepX + stepWidth, y: y + 1.16, w: stepGap, h: 0.22, fontFace: headingFont(brief), fontSize: 8, color: accent, margin: 0, align: "center" });
      });
    } else if (supportingText) slide.addText(supportingText, { x: x + 0.68, y: y + 0.94, w: cardWidth - 0.68, h: 0.5, fontFace: bodyFont(brief), fontSize: 10, color: ink, transparency: 28, margin: 0, breakLine: false, fit: "shrink", valign: "top" });
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
