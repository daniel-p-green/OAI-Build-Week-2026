import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";

const repository = resolve(process.cwd(), "../..");
const generated = resolve(repository, ".workshoplm", "acceptance", "generated");
const presentationRoot = resolve(repository, "artifacts", "live-review", "presentation-v7");
const infographicRoot = resolve(repository, "artifacts", "live-review", "infographic-v5");
const sha256 = (bytes: Uint8Array | string) => createHash("sha256").update(bytes).digest("hex");

async function captureSlides(htmlPath: string, outputRoot: string, selector = ".slide"): Promise<string[]> {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 });
    await page.goto(pathToFileURL(htmlPath).href);
    await page.locator("img").evaluateAll((images) => Promise.all(images.map((image) => image.complete ? undefined : new Promise<void>((done) => { image.addEventListener("load", () => done(), { once: true }); image.addEventListener("error", () => done(), { once: true }); }))));
    const slides = page.locator(selector);
    const count = await slides.count();
    if (!count) throw new Error(`No slides found in ${htmlPath}.`);
    const paths: string[] = [];
    for (let index = 0; index < count; index += 1) {
      const path = resolve(outputRoot, `slide-${index + 1}.png`);
      await slides.nth(index).screenshot({ path, animations: "disabled" });
      paths.push(path);
    }
    return paths;
  } finally {
    await browser.close();
  }
}

async function contactSheet(paths: string[], outputPath: string): Promise<void> {
  const images = await Promise.all(paths.map(async (path) => `data:image/png;base64,${(await readFile(path)).toString("base64")}`));
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    await page.setContent(`<style>*{box-sizing:border-box}body{margin:0;padding:16px;background:#111}.sheet{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}.sheet img{display:block;width:100%;height:auto}</style><div class="sheet">${images.map((source) => `<img src="${source}">`).join("")}</div>`);
    await page.locator(".sheet").screenshot({ path: outputPath, animations: "disabled" });
  } finally {
    await browser.close();
  }
}

async function main(): Promise<void> {
  await Promise.all([mkdir(presentationRoot, { recursive: true }), mkdir(infographicRoot, { recursive: true })]);
  const presentationHtml = resolve(generated, "deck-v1.deck.html");
  const presentationPptx = resolve(generated, "deck-v1.presentation.pptx");
  const infographicHtml = resolve(generated, "infographic-v1.infographic.html");
  const infographicPptx = resolve(generated, "infographic-v1.infographic.pptx");
  const checked = await Promise.all([presentationHtml, infographicHtml].map((path) => readFile(path, "utf8")));
  for (const html of checked) if (/Capture (?:to|→) Deliver|<span>Deliver<\/span>|connected Output set|client-ready deliverable/i.test(html)) throw new Error("Created-work proof still contains retired active product language.");

  await Promise.all([
    copyFile(presentationHtml, resolve(presentationRoot, "presentation-v7.html")),
    copyFile(presentationPptx, resolve(presentationRoot, "presentation-v7.pptx")),
    copyFile(infographicHtml, resolve(infographicRoot, "infographic-v5.html")),
    copyFile(infographicPptx, resolve(infographicRoot, "infographic-v5.pptx")),
  ]);
  const presentationSlides = await captureSlides(presentationHtml, presentationRoot);
  const infographicSlides = await captureSlides(infographicHtml, infographicRoot, ".infographic");
  await contactSheet(presentationSlides, resolve(presentationRoot, "contact-sheet.png"));
  await copyFile(infographicSlides[0]!, resolve(infographicRoot, "infographic-v5.png"));

  const evidence = {
    generatedAt: new Date().toISOString(),
    source: ".workshoplm/acceptance",
    providerCalls: 0,
    presentation: { htmlSha256: sha256(await readFile(presentationHtml)), pptxSha256: sha256(await readFile(presentationPptx)), slides: presentationSlides.length },
    infographic: { htmlSha256: sha256(await readFile(infographicHtml)), pptxSha256: sha256(await readFile(infographicPptx)), slides: infographicSlides.length },
  };
  await Promise.all([
    writeFile(resolve(presentationRoot, "evidence.json"), `${JSON.stringify(evidence.presentation, null, 2)}\n`),
    writeFile(resolve(infographicRoot, "evidence.json"), `${JSON.stringify(evidence.infographic, null, 2)}\n`),
    writeFile(resolve(presentationRoot, "README.md"), "# Current Presentation proof\n\nDeterministically rendered from the current recorded acceptance Workshop after the active product vocabulary moved to Capture → Shape → Create. The editable PowerPoint, HTML, five slide images, and contact sheet share the same approved Brief, Style, and Sources. No provider request was made for this capture.\n"),
    writeFile(resolve(infographicRoot, "README.md"), "# Current Infographic proof\n\nDeterministically rendered from the current recorded acceptance Workshop after the active product vocabulary moved to Capture → Shape → Create. The editable PowerPoint, HTML, and visual proof share the same approved Brief, Style, and Sources. No provider request was made for this capture.\n"),
  ]);
  console.log(JSON.stringify(evidence));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
