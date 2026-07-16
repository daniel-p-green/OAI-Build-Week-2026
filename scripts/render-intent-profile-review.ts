import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join, resolve } from "node:path";

import { renderDeck, writeEditableDeck, type IntentProfile, type RenderBrief } from "../packages/production/src/render.js";

type DeckInput = Omit<RenderBrief, "style"> & { style: RenderBrief["style"] & { logoPath?: string } };

const profiles: Array<{ id: IntentProfile; name: string }> = [
  { id: "client_facing_pitch", name: "client-pitch" },
  { id: "board_deck", name: "board-presentation" },
  { id: "internal_workshop", name: "team-workshop" },
];

function svgLogo(bytes: Buffer) {
  const source = bytes.toString("utf8");
  const viewBox = source.match(/\bviewBox=["']\s*[-\d.]+\s+[-\d.]+\s+([\d.]+)\s+([\d.]+)\s*["']/i);
  const width = Number(viewBox?.[1]);
  const height = Number(viewBox?.[2]);
  return {
    data: `data:image/svg+xml;base64,${bytes.toString("base64")}`,
    aspectRatio: width > 0 && height > 0 ? width / height : undefined,
  };
}

async function sha256(path: string) {
  return createHash("sha256").update(await readFile(path)).digest("hex");
}

async function main() {
  const root = resolve(process.cwd());
  const sourceDir = join(root, "outputs", "dogfood-ai-collective-chapter-brief");
  const outputDir = join(root, "artifacts", "spikes", "intent-profile-review-2026-07-15");
  const input = JSON.parse(await readFile(join(sourceDir, "deck-input.json"), "utf8")) as DeckInput;
  const { logoPath, ...style } = input.style;
  const logo = logoPath ? svgLogo(await readFile(join(sourceDir, logoPath))) : undefined;
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  const reviewFrames: string[] = [];
  const outputs: Record<string, Record<string, string>> = {};
  for (const profile of profiles) {
    const brief: RenderBrief = { ...input, style: { ...style, intent: profile.id, logoData: logo?.data, logoAspectRatio: logo?.aspectRatio } };
    const htmlPath = join(outputDir, `${profile.name}.html`);
    const pptxPath = join(outputDir, `${profile.name}.pptx`);
    const pdfPath = join(outputDir, `${profile.name}.pdf`);
    await writeFile(htmlPath, renderDeck(brief), "utf8");
    await writeEditableDeck(pptxPath, brief);
    await rm(pdfPath, { force: true });
    execFileSync("soffice", ["--headless", "--convert-to", "pdf", "--outdir", outputDir, pptxPath], { stdio: "ignore" });
    for (const { page, label } of [{ page: 1, label: "cover" }, { page: 3, label: "middle" }, { page: 5, label: "recommendation" }]) {
      const frame = join(outputDir, `${profile.name}-${label}.png`);
      await rm(frame, { force: true });
      execFileSync("pdftoppm", ["-png", "-r", "110", "-f", String(page), "-l", String(page), "-singlefile", pdfPath, frame.replace(/\.png$/, "")]);
      reviewFrames.push(frame);
    }
    outputs[profile.id] = {
      html: await sha256(htmlPath),
      pptx: await sha256(pptxPath),
      pdf: await sha256(pdfPath),
    };
  }

  const contactSheet = join(outputDir, "contact-sheet.png");
  const scaled = reviewFrames.map((_, index) => `[${index}:v]scale=800:450:force_original_aspect_ratio=decrease,pad=800:450:(ow-iw)/2:(oh-ih)/2:color=white[s${index}]`).join(";");
  const layout = reviewFrames.map((_, index) => `${(index % 3) * 800}_${Math.floor(index / 3) * 450}`).join("|");
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...reviewFrames.flatMap((path) => ["-i", path]), "-filter_complex", `${scaled};${reviewFrames.map((_, index) => `[s${index}]`).join("")}xstack=inputs=${reviewFrames.length}:layout=${layout}:fill=white[out]`, "-map", "[out]", "-frames:v", "1", contactSheet]);

  const manifest = {
    recordedAt: new Date().toISOString(),
    input: "outputs/dogfood-ai-collective-chapter-brief/deck-input.json",
    comparison: "The same grounded brief and Company Style rendered through all three Workshop Intent Profiles.",
    frames: reviewFrames.map((path) => basename(path)),
    contactSheetSha256: await sha256(contactSheet),
    outputs,
  };
  await writeFile(join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(manifest, null, 2)}\n`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
