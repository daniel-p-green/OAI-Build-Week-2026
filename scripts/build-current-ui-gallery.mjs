import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readdir, readFile, rm, copyFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const outputRoot = resolve(repository, "outputs/workshoplm-current-ui");
const zipPath = resolve(repository, "outputs/workshoplm-current-ui.zip");

const gallery = [
  ["01-start.png", "apps/web/tests/visual/__screenshots__/desktop-onboarding-welcome.png", "Choose the professional outcome"],
  ["02-add-thinking.png", "apps/web/tests/visual/__screenshots__/desktop-onboarding-sources.png", "Start with voice or source material"],
  ["03-grounded-map.png", "apps/web/tests/visual/__screenshots__/desktop-map.png", "Shape grounded claims on the semantic Map"],
  ["04-grounded-chat.png", "apps/web/tests/visual/__screenshots__/desktop-conversation.png", "Ask selected Sources with text or voice"],
  ["05-source-evidence.png", "apps/web/tests/visual/__screenshots__/desktop-evidence.png", "Inspect the exact supporting Source"],
  ["06-approved-brief.png", "apps/web/tests/visual/__screenshots__/desktop-brief.png", "Review the approved executable Brief"],
  ["07-company-style.png", "apps/web/tests/visual/__screenshots__/desktop-style.png", "Apply one reviewable visual system"],
  ["08-current-outputs.png", "artifacts/ui-review/outputs-latest-only-desktop-2026-07-16.png", "Review the current provider-backed deliverables"],
  ["09-presentation.png", "apps/web/tests/visual/__screenshots__/desktop-output-viewer.png", "Open the hero presentation and its source trail"],
  ["10-sketch.png", "apps/web/tests/visual/__screenshots__/desktop-sketch-viewer.png", "Open the source-traced hand-drawn Sketch"],
  ["11-replace-image.png", "apps/web/tests/visual/__screenshots__/desktop-image-replacement.png", "Direct one image replacement without prompt editing"],
  ["12-storyboard.png", "apps/web/tests/visual/__screenshots__/desktop-storyboard.png", "Edit and approve the Storyboard"],
  ["13-narrated-video.png", "apps/web/tests/visual/__screenshots__/desktop-video-viewer.png", "Review the locally rendered Video"],
  ["14-original-reveal.png", "apps/web/tests/visual/__screenshots__/desktop-original-reveal.png", "Trace finished work back to the original thought"],
  ["15-mobile-map.png", "apps/web/tests/visual/__screenshots__/mobile-map.png", "Review the Map on mobile"],
  ["16-mobile-outputs.png", "apps/web/tests/visual/__screenshots__/mobile-outputs.png", "Review current Outputs on mobile"],
];

const existing = await readdir(outputRoot);
await Promise.all(existing.filter((name) => name.endsWith(".png") || name === "manifest.json" || name === "contact-sheet.png").map((name) => rm(resolve(outputRoot, name), { force: true })));
await rm(zipPath, { force: true });

for (const [name, source] of gallery) await copyFile(resolve(repository, source), resolve(outputRoot, name));

const records = await Promise.all(gallery.map(async ([name, source, label]) => {
  const path = resolve(outputRoot, name);
  const bytes = await readFile(path);
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "stream=width,height", "-of", "json", path], { encoding: "utf8" }));
  return { name, label, source, sha256: createHash("sha256").update(bytes).digest("hex"), width: probe.streams?.[0]?.width, height: probe.streams?.[0]?.height };
}));

const filter = records.map((_, index) => `[${index}:v]scale=480:320:force_original_aspect_ratio=decrease,pad=480:320:(ow-iw)/2:(oh-ih)/2:color=#f7f7f5[s${index}]`).join(";");
const layout = records.map((_, index) => `${(index % 4) * 480}_${Math.floor(index / 4) * 320}`).join("|");
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...records.flatMap((record) => ["-i", resolve(outputRoot, record.name)]), "-filter_complex", `${filter};${records.map((_, index) => `[s${index}]`).join("")}xstack=inputs=${records.length}:layout=${layout}:fill=#f7f7f5[out]`, "-map", "[out]", "-frames:v", "1", resolve(outputRoot, "contact-sheet.png")]);

const contactSheet = await readFile(resolve(outputRoot, "contact-sheet.png"));
const manifest = { schemaVersion: 1, status: "current-workbench-gallery", builtAt: new Date().toISOString(), screenshots: records, contactSheet: { name: "contact-sheet.png", sha256: createHash("sha256").update(contactSheet).digest("hex"), width: 1920, height: 1280 } };
await writeFile(resolve(outputRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

execFileSync("zip", ["-j", "-q", zipPath, resolve(outputRoot, "README.md"), resolve(outputRoot, "manifest.json"), resolve(outputRoot, "contact-sheet.png"), ...records.map((record) => resolve(outputRoot, record.name))]);
const zip = await readFile(zipPath);
process.stdout.write(`${JSON.stringify({ status: "built", screenshots: records.length, zip: "outputs/workshoplm-current-ui.zip", zipSha256: createHash("sha256").update(zip).digest("hex"), contactSheet: "outputs/workshoplm-current-ui/contact-sheet.png" }, null, 2)}\n`);
