import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { copyFile, mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const repository = resolve(process.cwd());
const root = resolve(process.env.WORKSHOPLM_DATA_ROOT ?? resolve(repository, ".workshoplm", "acceptance"));
const video = resolve(root, "generated", "workshoplm-demo.mp4");
const outputDirectory = resolve(root, "submission");
const thumbnail = resolve(outputDirectory, "workshoplm-demo-thumbnail.png");
const planPath = resolve(repository, "submission", "demo-film-plan.json");
const productProofPath = resolve(repository, "outputs", "workshoplm-current-ui", "08-current-outputs.png");
const trackedPreview = resolve(repository, "outputs", "demo-film-plan", "thumbnail-preview.png");
const trackedManifest = resolve(repository, "outputs", "demo-film-plan", "thumbnail-preview.json");
const svgPath = resolve(outputDirectory, ".workshoplm-demo-thumbnail.svg");

function sha256(bytes) { return createHash("sha256").update(bytes).digest("hex"); }
function escapeXml(value) { return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"); }
function wrapHeadline(value) {
  const words = value.trim().split(/\s+/).filter(Boolean);
  const lines = [];
  for (const word of words) {
    const current = lines.at(-1);
    if (!current || (current.length + word.length + 1 > 13 && lines.length < 3)) lines.push(word);
    else lines[lines.length - 1] = `${current} ${word}`;
  }
  return lines.slice(0, 3);
}

try { await stat(video); } catch { throw new Error("No rendered storyboard video exists. Run pnpm demo:render first."); }
const plan = JSON.parse(await readFile(planPath, "utf8"));
if (typeof plan.thumbnailText !== "string" || !plan.thumbnailText.trim()) throw new Error("The film plan needs thumbnail text.");
if (/google|notebooklm/i.test(`${plan.publicTitle ?? ""} ${plan.thumbnailText}`)) throw new Error("Public thumbnail copy must not contain third-party product marks.");
const [videoBytes, proofBytes, planBytes] = await Promise.all([readFile(video), readFile(productProofPath), readFile(planPath)]);
const proofData = `data:image/png;base64,${proofBytes.toString("base64")}`;
const headline = wrapHeadline(plan.thumbnailText);
const headlineMarkup = headline.map((line, index) => `<tspan x="64" dy="${index ? 82 : 0}">${escapeXml(line)}</tspan>`).join("");
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
  <defs>
    <clipPath id="proof"><rect x="604" y="78" width="612" height="564" rx="26"/></clipPath>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="18" stdDeviation="18" flood-color="#000" flood-opacity=".24"/></filter>
  </defs>
  <rect width="1280" height="720" fill="#0d0d0d"/>
  <circle cx="1180" cy="-38" r="210" fill="#10a37f" opacity=".95"/>
  <text x="64" y="76" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700">WorkshopLM</text>
  <rect x="64" y="112" width="171" height="32" rx="16" fill="#1e1e1e" stroke="#3a3a3a"/>
  <text x="149.5" y="133" text-anchor="middle" fill="#b7f5e3" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="700" letter-spacing="1.4">SOURCE-GROUNDED</text>
  <text x="64" y="238" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="72" font-weight="500" letter-spacing="-3.4">${headlineMarkup}</text>
  <text x="64" y="536" fill="#c9c9c9" font-family="Arial, Helvetica, sans-serif" font-size="20">Voice or notes → Map → Brief → finished work</text>
  <line x1="64" y1="578" x2="516" y2="578" stroke="#343434"/>
  <text x="64" y="618" fill="#8f8f8f" font-family="Arial, Helvetica, sans-serif" font-size="15">Every factual claim stays linked to its source.</text>
  <g filter="url(#shadow)"><rect x="604" y="78" width="612" height="564" rx="26" fill="#f7f7f5"/></g>
  <g clip-path="url(#proof)"><image href="${proofData}" x="604" y="78" width="612" height="564" preserveAspectRatio="xMidYMid slice"/></g>
  <rect x="604.5" y="78.5" width="611" height="563" rx="25.5" fill="none" stroke="#353535"/>
</svg>`;
await mkdir(outputDirectory, { recursive: true });
await mkdir(resolve(repository, "outputs", "demo-film-plan"), { recursive: true });
await writeFile(svgPath, svg, "utf8");
try { await exec("rsvg-convert", ["-w", "1280", "-h", "720", svgPath, "-o", thumbnail]); }
finally { await rm(svgPath, { force: true }); }
const bytes = await readFile(thumbnail);
const probe = JSON.parse((await exec("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "json", thumbnail])).stdout);
const dimensions = probe.streams?.[0];
if (dimensions?.width !== 1280 || dimensions?.height !== 720) throw new Error("The submission thumbnail must be exactly 1280x720.");
await copyFile(thumbnail, trackedPreview);
const deterministic = {
  schemaVersion: 1,
  composition: "workshoplm-product-proof-v1",
  thumbnailText: plan.thumbnailText,
  dimensions,
  filmPlanSha256: sha256(planBytes),
  productProof: "outputs/workshoplm-current-ui/08-current-outputs.png",
  productProofSha256: sha256(proofBytes),
  thumbnailSha256: sha256(bytes),
  byteCount: bytes.length,
};
await writeFile(trackedManifest, `${JSON.stringify(deterministic, null, 2)}\n`, "utf8");
const metadata = { ...deterministic, sourceVideo: "generated/workshoplm-demo.mp4", sourceVideoSha256: sha256(videoBytes), thumbnail: "submission/workshoplm-demo-thumbnail.png", generatedAt: new Date().toISOString() };
await writeFile(resolve(outputDirectory, "thumbnail.json"), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(JSON.stringify(metadata));
