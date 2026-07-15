import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

import { renderDeck, writeEditableDeck, type RenderBrief } from "../packages/production/src/render.js";

type DeckInput = Omit<RenderBrief, "style"> & {
  style: RenderBrief["style"] & { logoPath?: string };
};

async function main() {
  const root = resolve(process.cwd());
  const outputDir = join(root, "outputs", "dogfood-ai-collective-chapter-brief");
  const inputPath = join(outputDir, "deck-input.json");
  const input = JSON.parse(await readFile(inputPath, "utf8")) as DeckInput;
  const { logoPath, ...style } = input.style;
  const logoData = logoPath
    ? `data:image/png;base64,${(await readFile(join(outputDir, logoPath))).toString("base64")}`
    : undefined;
  const brief: RenderBrief = { ...input, style: { ...style, logoData } };

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

  const files = [htmlPath, pptxPath, pdfPath];
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
