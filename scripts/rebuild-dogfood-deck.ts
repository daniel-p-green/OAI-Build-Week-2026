import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

import { renderDeck, writeEditableDeck, type RenderBrief } from "../packages/production/src/render.js";

type DeckInput = Omit<RenderBrief, "style"> & {
  style: RenderBrief["style"] & { logoPath?: string };
};

function logoPayload(bytes: Buffer, path: string) {
  const source = bytes.toString("utf8");
  const svg = /^\s*(?:<\?xml[^>]*>\s*)?<svg\b/i.test(source);
  const viewBox = svg ? source.match(/\bviewBox=["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i) : undefined;
  const width = Number(viewBox?.[1]);
  const height = Number(viewBox?.[2]);
  const contentType = svg ? "image/svg+xml" : path.toLowerCase().endsWith(".jpg") || path.toLowerCase().endsWith(".jpeg") ? "image/jpeg" : "image/png";
  return {
    data: `data:${contentType};base64,${bytes.toString("base64")}`,
    aspectRatio: width > 0 && height > 0 ? width / height : undefined,
  };
}

async function main() {
  const root = resolve(process.cwd());
  const outputDir = join(root, "outputs", "dogfood-ai-collective-chapter-brief");
  const inputPath = join(outputDir, "deck-input.json");
  const input = JSON.parse(await readFile(inputPath, "utf8")) as DeckInput;
  if (input.blocks.length < 6) throw new Error("External dogfood deck must contain a decision-ready narrative, not a four-claim teaser.");
  for (const block of input.blocks) {
    if (!block.citations.length) throw new Error(`Deck block ${block.id} is missing source trace.`);
    if (block.id.startsWith("derived-") && !block.citationLabel?.toLowerCase().includes("derived") && !block.citationLabel?.toLowerCase().includes("recommendation")) throw new Error(`Derived block ${block.id} must be visibly labeled.`);
    if ((block.layout === "plan" || block.layout === "decision") && (block.items?.length ?? 0) < 3) throw new Error(`${block.layout} block ${block.id} needs at least three actionable items.`);
  }
  const { logoPath, ...style } = input.style;
  const logo = logoPath ? logoPayload(await readFile(join(outputDir, logoPath)), logoPath) : undefined;
  const brief: RenderBrief = { ...input, style: { ...style, logoData: logo?.data, logoAspectRatio: logo?.aspectRatio } };

  const stem = "chapter-launch-brief";
  const htmlPath = join(outputDir, `${stem}.html`);
  const pptxPath = join(outputDir, `${stem}.pptx`);
  const pdfPath = join(outputDir, `${stem}.pdf`);

  await writeFile(htmlPath, renderDeck(brief), "utf8");
  await writeEditableDeck(pptxPath, brief);
  await rm(pdfPath, { force: true });
  execFileSync("soffice", ["--headless", "--convert-to", "pdf", "--outdir", outputDir, pptxPath], { stdio: "inherit" });

  for (let page = 1; page <= brief.blocks.length + 1; page += 1) {
    const previewStem = join(outputDir, `preview-${String(page).padStart(2, "0")}`);
    await rm(`${previewStem}.png`, { force: true });
    execFileSync("pdftoppm", ["-png", "-r", "110", "-f", String(page), "-l", String(page), "-singlefile", pdfPath, previewStem]);
  }

  const contactSheetPath = join(outputDir, "contact-sheet.png");
  await rm(contactSheetPath, { force: true });
  const previews = Array.from({ length: brief.blocks.length + 1 }, (_, index) => join(outputDir, `preview-${String(index + 1).padStart(2, "0")}.png`));
  const scaled = previews.map((_, index) => `[${index}:v]scale=960:540:force_original_aspect_ratio=decrease,pad=960:540:(ow-iw)/2:(oh-ih)/2:color=white[s${index}]`).join(";");
  const layout = previews.map((_, index) => `${(index % 2) * 960}_${Math.floor(index / 2) * 540}`).join("|");
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...previews.flatMap((path) => ["-i", path]), "-filter_complex", `${scaled};${previews.map((_, index) => `[s${index}]`).join("")}xstack=inputs=${previews.length}:layout=${layout}:fill=white[out]`, "-map", "[out]", "-frames:v", "1", contactSheetPath]);

  const files = [htmlPath, pptxPath, pdfPath, contactSheetPath];
  const hashes = Object.fromEntries(await Promise.all(files.map(async (path) => [
    basename(path),
    createHash("sha256").update(await readFile(path)).digest("hex")
  ])));

  process.stdout.write(`${JSON.stringify({ input: basename(inputPath), slides: brief.blocks.length + 1, hashes }, null, 2)}\n`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
