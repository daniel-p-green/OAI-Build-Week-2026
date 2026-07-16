import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const planPath = resolve(repository, "submission/demo-film-plan.json");
const finalBuild = process.argv.includes("--final");
const sampleEditorialBuild = process.argv.includes("--sample-editorial");
const previewFinalStyle = process.argv.includes("--preview-final-style");
if ([finalBuild, sampleEditorialBuild, previewFinalStyle].filter(Boolean).length > 1) throw new Error("Choose only one film build mode.");
const cleanEditorialStyle = finalBuild || sampleEditorialBuild || previewFinalStyle;
const outputRoot = resolve(repository, finalBuild ? "outputs/demo-film-final" : sampleEditorialBuild ? "outputs/demo-film-sample" : "outputs/demo-film-rough-cut");
const temporaryRoot = resolve(outputRoot, ".build");
const outputVideo = resolve(outputRoot, finalBuild ? "workshoplm-demo.mp4" : sampleEditorialBuild ? "workshoplm-demo-sample.mp4" : "workshoplm-demo-rough-cut.mp4");
const contactSheet = resolve(outputRoot, "contact-sheet.jpg");
const manifestPath = resolve(outputRoot, "manifest.json");
const reviewRoot = resolve(outputRoot, "review");
const verifiedNarrationManifest = resolve(repository, "outputs/demo-film-narration/manifest.json");
const narrationManifestPath = process.env.WORKSHOPLM_ROUGH_CUT_NARRATION_MANIFEST
  ? resolve(repository, process.env.WORKSHOPLM_ROUGH_CUT_NARRATION_MANIFEST)
  : finalBuild || existsSync(verifiedNarrationManifest) ? verifiedNarrationManifest : undefined;
const voice = process.env.WORKSHOPLM_ROUGH_CUT_VOICE || "Samantha";
const fixedSpeechRate = process.env.WORKSHOPLM_ROUGH_CUT_RATE ? Number(process.env.WORKSHOPLM_ROUGH_CUT_RATE) : undefined;
const width = 1280;
const height = 720;
const authorizedSampleTranscript = "I want a workspace where a professional can talk through a messy idea, ground it in their meetings and documents, shape it on a visual Map, approve the thinking, and ship polished slides, images, an audio overview, a storyboard, and video without losing the source trail. The product should feel simple but built for serious work, with OpenAI quality and two clear moments of human control.";
let filmIdentity = { accent: "#1668E3", ink: "#171816", paper: "#F4F2EC", heading: "system-ui", body: "system-ui", designMarkdownPath: undefined, designTokensPath: undefined, frameMarkdownPath: undefined, frameJsonPath: undefined, designSha256: undefined, frameSha256: undefined, frameVersion: undefined, outcome: undefined };
let finalAssemblyStarted = false;

function run(command, args) {
  const effectiveArgs = command === "ffmpeg" ? ["-hide_banner", "-loglevel", "error", ...args] : args;
  execFileSync(command, effectiveArgs, { cwd: repository, stdio: "inherit" });
}

function probe(path) {
  return JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_type,codec_name,width,height,sample_rate", "-of", "json", path], { encoding: "utf8" }));
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function loadFilmIdentity(submissionManifestPath) {
  if (!submissionManifestPath || !existsSync(submissionManifestPath)) return filmIdentity;
  const submission = JSON.parse(await readFile(submissionManifestPath, "utf8"));
  const dataRoot = resolve(dirname(submissionManifestPath), "../..");
  const designMarkdownPath = resolve(dataRoot, `generated/DESIGN-v${submission.inputs.styleVersion}.md`);
  const designTokensPath = resolve(dataRoot, `generated/DESIGN-v${submission.inputs.styleVersion}.tokens.json`);
  const frameMarkdownPath = resolve(dataRoot, `generated/FRAME-v${submission.inputs.briefVersion}.md`);
  const frameJsonPath = resolve(dataRoot, `generated/FRAME-v${submission.inputs.briefVersion}.json`);
  for (const path of [designMarkdownPath, designTokensPath, frameMarkdownPath, frameJsonPath]) if (!existsSync(path)) throw new Error(`The HyperFrames film requires the current ${path.endsWith(".md") ? "Markdown" : "JSON"} design/brief artifact: ${relative(repository, path)}`);
  const [designMarkdown, designTokensBytes, frameMarkdown, frameJsonBytes] = await Promise.all([readFile(designMarkdownPath), readFile(designTokensPath), readFile(frameMarkdownPath), readFile(frameJsonPath)]);
  const design = JSON.parse(designTokensBytes.toString("utf8"));
  const frame = JSON.parse(frameJsonBytes.toString("utf8"));
  if (design.styleVersion !== submission.inputs.styleVersion || frame.frameVersion !== submission.inputs.briefVersion) throw new Error("The HyperFrames film DESIGN.md or FRAME.md version does not match the submission package.");
  return { accent: design.palette.accent, ink: design.palette.ink, paper: design.palette.paper, heading: design.typographyRoles.heading.family, body: design.typographyRoles.body.family, designMarkdownPath, designTokensPath, frameMarkdownPath, frameJsonPath, designSha256: sha256(designMarkdown), frameSha256: sha256(frameMarkdown), frameVersion: frame.frameVersion, outcome: frame.outcome };
}

function escapeXml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}

function captionLines(text, maxCharacters = 66) {
  const words = text.split(/[.!?]/)[0].trim().split(/\s+/).filter(Boolean);
  const lines = [];
  for (const word of words) {
    const current = lines.at(-1);
    if (!current || (current.length + word.length + 1 > maxCharacters && lines.length < 2)) lines.push(word);
    else lines[lines.length - 1] = `${current} ${word}`;
  }
  if (lines.length > 2) lines.splice(2);
  const second = lines[1];
  if (second && second.length > maxCharacters) lines[1] = `${second.slice(0, maxCharacters - 1).trimEnd()}…`;
  return lines;
}

function wrappedLines(text, maxCharacters, maxLines) {
  const words = text.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);
  const lines = [];
  let truncated = false;
  for (const word of words) {
    const current = lines.at(-1);
    if (!current) {
      lines.push(word);
    } else if (current.length + word.length + 1 <= maxCharacters) {
      lines[lines.length - 1] = `${current} ${word}`;
    } else if (lines.length < maxLines) {
      lines.push(word);
    } else {
      truncated = true;
      break;
    }
  }
  if (truncated) lines[lines.length - 1] = `${lines.at(-1).replace(/[.,;:!?]?$/, "")}…`;
  return { lines, truncated };
}

function guideVoiceRate(text, durationSeconds) {
  if (fixedSpeechRate) return fixedSpeechRate;
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const requiredWordsPerMinute = words / Math.max(1, durationSeconds - 0.8) * 60;
  return Math.max(120, Math.min(180, Math.ceil(requiredWordsPerMinute * 1.05)));
}

function overlaySvg(shot, index) {
  const { accent, ink, paper } = filmIdentity;
  if (cleanEditorialStyle) {
    if (shot.id === "meta-reveal") return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"/>`;
    const lines = captionLines(shot.caption ?? shot.narration, 74);
    const doorwayCue = shot.id === "codex-doorway" ? `<rect x="28" y="24" width="306" height="62" rx="16" fill="${paper}" fill-opacity="0.97" stroke="${ink}" stroke-opacity="0.12"/>
  <text x="50" y="50" font-family="system-ui, sans-serif" font-size="11" font-weight="700" letter-spacing="1.1" fill="${ink}" fill-opacity="0.62">CODEX → WORKSHOPLM</text>
  <text x="50" y="72" font-family="system-ui, sans-serif" font-size="15" font-weight="700" fill="${ink}">Conversation opens the visual workbench</text>` : "";
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  ${doorwayCue}
  <rect x="22" y="606" width="1236" height="96" rx="18" fill="${paper}" fill-opacity="0.96" stroke="${ink}" stroke-opacity="0.10"/>
  <rect x="22" y="606" width="7" height="96" rx="3.5" fill="${accent}"/>
  <text x="48" y="632" font-family="system-ui, sans-serif" font-size="11" font-weight="700" letter-spacing="1.2" fill="${ink}" fill-opacity="0.62">${String(index + 1).padStart(2, "0")} · ${escapeXml(shot.title.toUpperCase())}</text>
  <text x="48" y="661" font-family="system-ui, sans-serif" font-size="19" font-weight="650" fill="${ink}">${escapeXml(lines[0] || "")}</text>
  <text x="48" y="687" font-family="system-ui, sans-serif" font-size="19" font-weight="650" fill="${ink}">${escapeXml(lines[1] || "")}</text>
</svg>`;
  }
  const state = shot.state === "ready" ? (shot.captureBeats.length ? "CAPTURED FIXTURE" : "CAPTURED EVIDENCE") : "FINAL EVIDENCE PENDING";
  const stateFill = shot.state === "ready" ? "#15803d" : "#b45309";
  const lines = captionLines(shot.caption ?? shot.narration);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect x="24" y="22" width="266" height="30" rx="15" fill="#0d0d0d" fill-opacity="0.88"/>
  <text x="40" y="42" font-family="Arial, sans-serif" font-size="12" font-weight="700" letter-spacing="1.2" fill="#ffffff">EDITORIAL ROUGH CUT · FIXTURE</text>
  <rect x="0" y="614" width="1280" height="106" fill="#ffffff" fill-opacity="0.94"/>
  <rect x="0" y="614" width="8" height="106" fill="#0d0d0d"/>
  <text x="42" y="650" font-family="Arial, sans-serif" font-size="13" font-weight="700" letter-spacing="1.4" fill="#5d5d5d">${String(index + 1).padStart(2, "0")} · ${escapeXml(shot.title.toUpperCase())}</text>
  <text x="42" y="682" font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="#0d0d0d">${escapeXml(lines[0] || "")}</text>
  <text x="42" y="710" font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="#0d0d0d">${escapeXml(lines[1] || "")}</text>
  <rect x="1018" y="644" width="220" height="30" rx="15" fill="${stateFill}"/>
  <text x="1128" y="664" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" font-weight="700" letter-spacing="0.9" fill="#ffffff">${state}</text>
</svg>`;
}

function hyperframesCompositionHtml(plan, identity) {
  const media = plan.shots.map((shot, index) => {
    const start = shot.startSeconds;
    const duration = shot.endSeconds - shot.startSeconds;
    const name = `${String(index + 1).padStart(2, "0")}-${shot.id}.mp4`;
    return `<video id="shot-${index + 1}" class="clip" src="media/${name}" muted playsinline data-start="${start}" data-duration="${duration}" data-track-index="0"></video><audio id="shot-${index + 1}-audio" src="media/${name}" data-start="${start}" data-duration="${duration}" data-track-index="1" data-volume="1"></audio>`;
  }).join("");
  const transitions = plan.shots.slice(1).map((shot, index) => `<div id="transition-${index + 1}" class="clip transition" data-start="${(shot.startSeconds - 0.32).toFixed(2)}" data-duration="0.64" data-track-index="2"></div>`).join("");
  const motion = plan.shots.slice(1).map((shot, index) => { const start = shot.startSeconds - 0.32; return `tl.set("#transition-${index + 1}",{xPercent:-101},${start.toFixed(2)});tl.to("#transition-${index + 1}",{xPercent:101,duration:0.64,ease:"power3.inOut"},${start.toFixed(2)});`; }).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>*{box-sizing:border-box}html,body,main{margin:0;width:${width}px;height:${height}px;overflow:hidden;background:${identity.paper};font-family:${identity.body},-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}.clip{visibility:hidden}video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:${identity.paper}}.transition{position:absolute;inset:-2px;background:${identity.accent};will-change:transform}</style></head><body><main data-composition-id="workshoplm-editorial-film" data-start="0" data-duration="${plan.targetDurationSeconds}" data-width="${width}" data-height="${height}" data-fps="30" data-design-sha256="${identity.designSha256}" data-frame-sha256="${identity.frameSha256}" data-frame-version="${identity.frameVersion}" data-frame-outcome="${escapeXml(identity.outcome ?? "")}" data-motion-system="stable-editorial-wipe">${media}${transitions}</main><script>window.__timelines=window.__timelines||{};const tl=gsap.timeline({paused:true});${motion}window.__timelines["workshoplm-editorial-film"]=tl;</script></body></html>`;
}

async function metaRevealSvg(finalManifestPath, options = {}) {
  const transcript = options.transcript || (await readFile(resolve(repository, "outputs/demo-film-inputs/founder-brainstorm.txt"), "utf8")).trim();
  const transcriptLayout = wrappedLines(transcript, 48, options.sample || options.preview ? 12 : 10);
  if ((options.sample || options.preview) && transcriptLayout.truncated) throw new Error("The authorized sample transcript must fit completely inside the meta reveal.");
  const transcriptLines = transcriptLayout.lines;
  const packageRoot = dirname(finalManifestPath);
  const submission = JSON.parse(await readFile(finalManifestPath, "utf8"));
  const trace = JSON.parse(await readFile(resolve(packageRoot, "BUILD-TRACE.json"), "utf8"));
  const outputCount = trace.outputs.length;
  const claimCount = trace.workshop.groundedClaims;
  const signOffCount = Number(Boolean(trace.inputs.briefVersion)) + Number(Boolean(trace.inputs.storyboardVersion));
  const assetCount = submission.assets.length;
  const thumbnailNames = ["thumbnail-opening.png", "thumbnail-process.png", "thumbnail-result.png"];
  const thumbnails = await Promise.all(thumbnailNames.map(async (name) => `data:image/png;base64,${(await readFile(resolve(packageRoot, name))).toString("base64")}`));
  const { accent, ink, paper, heading, body } = filmIdentity;
  const headingFamily = `${escapeXml(heading)}, system-ui, sans-serif`;
  const bodyFamily = `${escapeXml(body)}, system-ui, sans-serif`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="1280" height="720" fill="${paper}"/>
  <rect x="56" y="45" width="40" height="4" rx="2" fill="${accent}"/>
  <text x="108" y="62" font-family="${bodyFamily}" font-size="13" font-weight="700" letter-spacing="1.4" fill="${ink}" fill-opacity="0.58">THE ORIGINAL → THE SUBMISSION</text>
  <text x="56" y="110" font-family="${headingFamily}" font-size="34" font-weight="700" fill="${ink}">One raw thought. One traced body of work.</text>
  <rect x="56" y="148" width="500" height="474" rx="22" fill="${paper}" stroke="${ink}" stroke-opacity="0.13"/>
  <text x="84" y="184" font-family="${bodyFamily}" font-size="12" font-weight="700" letter-spacing="1.2" fill="${accent}">${options.sample ? "AUTHORIZED SAMPLE · COMPLETE TRANSCRIPT" : options.preview ? "LAYOUT PREVIEW · COMPLETE SAMPLE" : "FOUNDER BRAINSTORM · VERBATIM EXCERPT"}</text>
  ${transcriptLines.map((line, index) => `<text x="84" y="${220 + index * 32}" font-family="${bodyFamily}" font-size="18" font-weight="500" fill="${ink}">${escapeXml(line)}</text>`).join("\n  ")}
  <text x="84" y="594" font-family="${bodyFamily}" font-size="13" fill="${ink}" fill-opacity="0.58">${options.sample || options.preview ? "Complete sample · final mode requires hash-bound founder evidence" : "Verbatim excerpt · full hash-bound Source remains in the Workshop"}</text>
  <rect x="596" y="148" width="292" height="213" fill="${ink}"/>
  <rect x="908" y="148" width="292" height="213" fill="${ink}"/>
  <rect x="596" y="381" width="604" height="241" fill="${ink}"/>
  <image href="${thumbnails[0]}" x="596" y="148" width="292" height="213" preserveAspectRatio="xMidYMid meet"/>
  <image href="${thumbnails[1]}" x="908" y="148" width="292" height="213" preserveAspectRatio="xMidYMid meet"/>
  <image href="${thumbnails[2]}" x="596" y="381" width="604" height="241" preserveAspectRatio="xMidYMid meet"/>
  <rect x="596" y="568" width="604" height="54" fill="${paper}" fill-opacity="0.97"/>
  <text x="620" y="590" font-family="${bodyFamily}" font-size="10" font-weight="700" letter-spacing="1.1" fill="${accent}">HOW THIS WAS BUILT</text>
  <text x="620" y="610" font-family="${bodyFamily}" font-size="14" font-weight="700" fill="${ink}">${outputCount} Outputs · ${claimCount} source-linked claims · ${signOffCount} sign-offs · ${assetCount} hashed assets</text>
  <rect x="596" y="148" width="604" height="474" rx="22" fill="none" stroke="${ink}" stroke-opacity="0.13" stroke-width="2"/>
  <text x="1198" y="670" text-anchor="end" font-family="${bodyFamily}" font-size="14" font-weight="700" fill="${ink}">WORKSHOPLM · BUILT WITH OPENAI + CODEX</text>
</svg>`;
}

async function main() {
  const originalPlanBytes = await readFile(planPath);
  const plan = JSON.parse(originalPlanBytes.toString("utf8"));
  if (previewFinalStyle) {
    const previewRoot = resolve(repository, "outputs/demo-film-plan/final-overlay-preview");
    const previewPath = resolve(repository, "outputs/demo-film-plan/final-overlay-preview.png");
    const framePreviewPath = resolve(repository, "outputs/demo-film-plan/final-overlay-frame.png");
    const metaPreviewPath = resolve(repository, "outputs/demo-film-plan/meta-reveal-layout-preview.png");
    const previewBases = ["03-grounded-map.png", "04-grounded-chat.png", "02-add-thinking.png", "05-source-evidence.png", "06-approved-brief.png", "07-company-style.png", "08-current-outputs.png", "12-storyboard.png", "../../artifacts/live-review/video-v2-12s.png", "14-original-reveal.png"];
    await rm(previewRoot, { recursive: true, force: true });
    await Promise.all([previewPath, framePreviewPath, metaPreviewPath].map((path) => rm(path, { force: true })));
    await mkdir(previewRoot, { recursive: true });
    const frames = [];
    for (const [index, shot] of plan.shots.entries()) {
      const stem = String(index + 1).padStart(2, "0");
      const svg = resolve(previewRoot, `${stem}.svg`);
      const overlay = resolve(previewRoot, `${stem}-overlay.png`);
      const frame = resolve(previewRoot, `${stem}.png`);
      await writeFile(svg, overlaySvg(shot, index), "utf8");
      run("rsvg-convert", ["-w", String(width), "-h", String(height), svg, "-o", overlay]);
      run("ffmpeg", ["-y", "-i", resolve(repository, "outputs/workshoplm-current-ui", previewBases[index]), "-i", overlay, "-filter_complex", "[0:v]scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=#f7f7f5[base];[base][1:v]overlay=0:0,format=rgb24", "-frames:v", "1", frame]);
      frames.push(frame);
    }
    run("ffmpeg", ["-y", ...frames.flatMap((frame) => ["-i", frame]), "-filter_complex", `${frames.map((_, index) => `[${index}:v]scale=384:216[s${index}]`).join(";")};${frames.map((_, index) => `[s${index}]`).join("")}xstack=inputs=10:layout=0_0|384_0|768_0|1152_0|1536_0|0_216|384_216|768_216|1152_216|1536_216:fill=#f7f7f5[out]`, "-map", "[out]", "-frames:v", "1", previewPath]);
    await copyFile(frames[0], framePreviewPath);
    const previewSubmissionManifest = resolve(repository, ".workshoplm/acceptance/generated/submission-output-set-v1/manifest.json");
    if (existsSync(previewSubmissionManifest)) {
      filmIdentity = await loadFilmIdentity(previewSubmissionManifest);
      const metaSvgPath = resolve(previewRoot, "meta-reveal.svg");
      await writeFile(metaSvgPath, await metaRevealSvg(previewSubmissionManifest, {
        preview: true,
        transcript: authorizedSampleTranscript
      }), "utf8");
      run("rsvg-convert", ["-w", String(width), "-h", String(height), metaSvgPath, "-o", metaPreviewPath]);
    }
    await rm(previewRoot, { recursive: true, force: true });
    process.stdout.write(`${JSON.stringify({ status: "final-style-preview", preview: previewPath, frame: framePreviewPath, ...(existsSync(metaPreviewPath) ? { metaReveal: metaPreviewPath } : {}) }, null, 2)}\n`);
    return;
  }
  let finalSubmissionManifestPath;
  if (finalBuild) {
    execFileSync("pnpm", ["-s", "demo:film:verify"], { cwd: repository, stdio: "ignore" });
    const readiness = JSON.parse(await readFile(resolve(repository, "outputs/demo-film-plan/edit-readiness.json"), "utf8"));
    const missingBeforeExport = readiness.missingEvidence.filter((item) => item.shotId !== "final-export");
    if (missingBeforeExport.length) throw new Error(`Final film evidence is incomplete: ${missingBeforeExport.map((item) => item.label).join("; ")}`);
    const finalManifestEvidence = plan.shots.flatMap((shot) => shot.requiredEvidence).find((item) => item.validator === "ready-submission-manifest");
    if (!finalManifestEvidence) throw new Error("The film plan does not name the final submission manifest.");
    finalSubmissionManifestPath = resolve(repository, finalManifestEvidence.path);
  } else if (sampleEditorialBuild) {
    finalSubmissionManifestPath = resolve(repository, ".workshoplm/acceptance/generated/submission-output-set-v1/manifest.json");
    if (!existsSync(finalSubmissionManifestPath)) throw new Error("The acceptance submission package is required for the sample editorial cut.");
  }
  const identityManifestPath = finalSubmissionManifestPath ?? resolve(repository, ".workshoplm/acceptance/generated/submission-output-set-v1/manifest.json");
  filmIdentity = await loadFilmIdentity(identityManifestPath);
  const providerNarration = narrationManifestPath ? JSON.parse(await readFile(narrationManifestPath, "utf8")) : undefined;
  if (providerNarration) {
    if (providerNarration.model !== "gpt-4o-mini-tts" || providerNarration.voice !== "cedar" || providerNarration.shots?.length !== plan.shots.length) throw new Error("The provider narration manifest does not match the film plan.");
    const providerShotIds = new Set(providerNarration.shots.map((shot) => shot.id));
    if (providerShotIds.size !== plan.shots.length || plan.shots.some((shot) => !providerShotIds.has(shot.id))) throw new Error("The provider narration manifest does not cover every film shot exactly once.");
    for (const shot of providerNarration.shots) {
      const bytes = await readFile(resolve(repository, shot.relativePath));
      if (sha256(bytes) !== shot.sha256) throw new Error(`Provider narration ${shot.id} no longer matches its manifest.`);
      const planShot = plan.shots.find((candidate) => candidate.id === shot.id);
      if (!planShot || shot.slotSeconds !== planShot.endSeconds - planShot.startSeconds || shot.durationSeconds > shot.slotSeconds * 1.5) throw new Error(`Provider narration ${shot.id} no longer fits the film plan.`);
    }
  }
  const captureManifestPath = resolve(repository, plan.captureManifest);
  const capture = JSON.parse(await readFile(captureManifestPath, "utf8"));
  const sourceVideo = resolve(dirname(captureManifestPath), capture.video.relativePath);
  const beatsById = new Map(capture.beats.map((beat) => [beat.id, beat]));

  if (finalBuild) finalAssemblyStarted = true;
  await mkdir(outputRoot, { recursive: true });
  await rm(temporaryRoot, { recursive: true, force: true });
  await rm(reviewRoot, { recursive: true, force: true });
  await rm(outputVideo, { force: true });
  await rm(contactSheet, { force: true });
  await rm(manifestPath, { force: true });
  await mkdir(temporaryRoot, { recursive: true });
  await mkdir(reviewRoot, { recursive: true });

  const segments = [];
  const shotRecords = [];
  const reviewFrames = [];
  for (const [index, shot] of plan.shots.entries()) {
    const duration = shot.endSeconds - shot.startSeconds;
    const shotSpeechRate = guideVoiceRate(shot.narration, duration);
    const stem = `${String(index + 1).padStart(2, "0")}-${shot.id}`;
    const providerShot = providerNarration?.shots.find((candidate) => candidate.id === shot.id);
    const audioPath = providerShot ? resolve(repository, providerShot.relativePath) : resolve(temporaryRoot, `${stem}.aiff`);
    const basePath = resolve(temporaryRoot, `${stem}-base.mp4`);
    const overlayPath = resolve(temporaryRoot, `${stem}-overlay.png`);
    const overlaySource = resolve(temporaryRoot, `${stem}-overlay.svg`);
    const segmentPath = resolve(temporaryRoot, `${stem}.mp4`);
    await writeFile(overlaySource, overlaySvg(shot, index), "utf8");
    run("rsvg-convert", ["-w", String(width), "-h", String(height), overlaySource, "-o", overlayPath]);
    if (!providerShot) run("say", ["-v", voice, "-r", String(shotSpeechRate), "-o", audioPath, shot.narration]);

    const selectedBeats = shot.captureBeats.map((id) => beatsById.get(id)).filter(Boolean);
    const effectiveState = finalBuild ? "ready" : shot.state;
    const externalVideo = effectiveState === "ready" && !shot.preferCapture
      ? shot.requiredEvidence.map((item) => resolve(repository, item.path)).find((path) => /\.(?:mov|mp4)$/i.test(path) && existsSync(path))
      : undefined;
    if ((finalBuild || sampleEditorialBuild) && shot.id === "meta-reveal") {
      const metaSource = resolve(temporaryRoot, `${stem}-meta.svg`);
      const metaImage = resolve(temporaryRoot, `${stem}-meta.png`);
      await writeFile(metaSource, await metaRevealSvg(finalSubmissionManifestPath, sampleEditorialBuild ? { sample: true, transcript: authorizedSampleTranscript } : {}), "utf8");
      run("rsvg-convert", ["-w", String(width), "-h", String(height), metaSource, "-o", metaImage]);
      run("ffmpeg", ["-y", "-loop", "1", "-i", metaImage, "-t", String(duration), "-vf", `scale=${width}:${height},format=yuv420p`, "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "20", basePath]);
      shotRecords.push({ id: shot.id, state: effectiveState, durationSeconds: duration, narration: { model: providerShot.model, voice: providerShot.voice, requestId: providerShot.requestId, sha256: providerShot.sha256 }, sourceBeats: [], generatedMetaReveal: true });
    } else if (externalVideo) {
      const sourceDuration = Number(probe(externalVideo).format?.duration || 0);
      const playbackRate = sourceDuration > duration ? sourceDuration / duration : 1;
      const presentationDuration = Math.min(duration, sourceDuration / playbackRate);
      const holdDuration = Math.max(0, duration - presentationDuration);
      run("ffmpeg", ["-y", "-i", externalVideo, "-vf", `setpts=PTS/${playbackRate.toFixed(5)},scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=${filmIdentity.paper},trim=duration=${presentationDuration.toFixed(3)},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${holdDuration.toFixed(3)},trim=duration=${duration},format=yuv420p`, "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "22", basePath]);
      shotRecords.push({ id: shot.id, state: effectiveState, durationSeconds: duration, ...(providerShot ? { narration: { model: providerShot.model, voice: providerShot.voice, requestId: providerShot.requestId, sha256: providerShot.sha256 } } : { guideVoiceRate: shotSpeechRate }), sourceBeats: [], externalVideo: shot.requiredEvidence.find((item) => resolve(repository, item.path) === externalVideo)?.path, sourceDurationSeconds: sourceDuration });
    } else if (selectedBeats.length) {
      const sourceStart = Math.max(0, selectedBeats[0].startMs / 1000 - 0.2);
      const sourceEnd = Math.min(capture.video.durationSeconds, selectedBeats.at(-1).endMs / 1000 - (shot.captureEndHoldbackSeconds ?? 0.3));
      const sourceDuration = Math.max(0.5, sourceEnd - sourceStart);
      const holdDuration = Math.max(0, duration - sourceDuration);
      run("ffmpeg", ["-y", "-ss", sourceStart.toFixed(3), "-i", sourceVideo, "-vf", `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=${filmIdentity.paper},trim=duration=${sourceDuration.toFixed(3)},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop_duration=${holdDuration.toFixed(3)},trim=duration=${duration},format=yuv420p`, "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "22", basePath]);
      shotRecords.push({ id: shot.id, state: effectiveState, durationSeconds: duration, ...(providerShot ? { narration: { model: providerShot.model, voice: providerShot.voice, requestId: providerShot.requestId, sha256: providerShot.sha256 } } : { guideVoiceRate: shotSpeechRate }), sourceBeats: shot.captureBeats, sourceStartSeconds: Number(sourceStart.toFixed(3)), sourceEndSeconds: Number(sourceEnd.toFixed(3)) });
    } else {
      run("ffmpeg", ["-y", "-loop", "1", "-i", resolve(repository, "outputs/workshoplm-current-ui/03-grounded-map.png"), "-t", String(duration), "-vf", `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=${filmIdentity.paper},format=yuv420p`, "-an", "-c:v", "libx264", "-preset", "fast", "-crf", "22", basePath]);
      shotRecords.push({ id: shot.id, state: effectiveState, durationSeconds: duration, ...(providerShot ? { narration: { model: providerShot.model, voice: providerShot.voice, requestId: providerShot.requestId, sha256: providerShot.sha256 } } : { guideVoiceRate: shotSpeechRate }), sourceBeats: [], stillFallback: "outputs/workshoplm-current-ui/03-grounded-map.png" });
    }

    shotRecords.at(-1).motion = { type: "hyperframes-stable-media", transition: index ? "design-accent-wipe" : "opening-hold", jitterProneZoompan: false };
    if (cleanEditorialStyle && shot.id === "codex-doorway") shotRecords.at(-1).editorialCue = "codex-to-workshoplm";

    const audioDuration = Number(probe(audioPath).format?.duration || 0);
    const targetSpeechDuration = Math.max(1, duration - 0.55);
    const tempo = providerShot ? Math.max(1, Math.min(2, audioDuration / targetSpeechDuration)) : Math.max(0.6, Math.min(2, audioDuration / targetSpeechDuration));
    const audioFilter = `${Math.abs(tempo - 1) > 0.01 ? `atempo=${tempo.toFixed(5)},` : ""}aresample=48000,volume=0.96,apad=whole_dur=${duration}`;
    run("ffmpeg", ["-y", "-i", basePath, "-loop", "1", "-i", overlayPath, "-i", audioPath, "-filter_complex", `[0:v][1:v]overlay=0:0:shortest=1,format=yuv420p[v];[2:a]${audioFilter}[a]`, "-map", "[v]", "-map", "[a]", "-t", String(duration), "-r", "30", "-c:v", "libx264", "-preset", "fast", "-crf", "22", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", segmentPath]);
    segments.push(segmentPath);
  }

  const compositionRoot = resolve(temporaryRoot, "hyperframes");
  const mediaRoot = resolve(compositionRoot, "media");
  await mkdir(mediaRoot, { recursive: true });
  for (const [index, segment] of segments.entries()) await copyFile(segment, resolve(mediaRoot, `${String(index + 1).padStart(2, "0")}-${plan.shots[index].id}.mp4`));
  await copyFile(resolve(repository, "apps/worker/node_modules/gsap/dist/gsap.min.js"), resolve(compositionRoot, "gsap.min.js"));
  await copyFile(filmIdentity.designMarkdownPath, resolve(compositionRoot, "DESIGN.md"));
  await copyFile(filmIdentity.designTokensPath, resolve(compositionRoot, "design.tokens.json"));
  await copyFile(filmIdentity.frameMarkdownPath, resolve(compositionRoot, "FRAME.md"));
  await copyFile(filmIdentity.frameJsonPath, resolve(compositionRoot, "frame.json"));
  await writeFile(resolve(compositionRoot, "index.html"), hyperframesCompositionHtml(plan, filmIdentity), "utf8");
  run("npx", ["hyperframes", "lint", compositionRoot, "--json"]);
  run("npx", ["hyperframes", "check", compositionRoot, "--json", "--at-transitions"]);
  run("npx", ["hyperframes", "render", compositionRoot, "--output", outputVideo, "--workers", "1", "--quality", finalBuild ? "high" : "standard"]);
  for (const [index, shot] of plan.shots.entries()) {
    const reviewPath = resolve(reviewRoot, `${String(index + 1).padStart(2, "0")}.jpg`);
    run("ffmpeg", ["-y", "-ss", String((shot.startSeconds + shot.endSeconds) / 2), "-i", outputVideo, "-frames:v", "1", "-q:v", "2", reviewPath]);
    reviewFrames.push(reviewPath);
  }
  run("ffmpeg", ["-y", "-framerate", "1", "-start_number", "1", "-i", resolve(reviewRoot, "%02d.jpg"), "-vf", "scale=384:-2,tile=5x2", "-frames:v", "1", "-q:v", "2", contactSheet]);

  const videoBytes = await readFile(outputVideo);
  const sheetBytes = await readFile(contactSheet);
  const inspected = probe(outputVideo);
  let metaRevealEvidence;
  if (finalSubmissionManifestPath) {
    const submissionManifestBytes = await readFile(finalSubmissionManifestPath);
    const buildTracePath = resolve(dirname(finalSubmissionManifestPath), "BUILD-TRACE.json");
    const buildTraceBytes = await readFile(buildTracePath);
    const transcriptPath = finalBuild ? resolve(repository, "outputs/demo-film-inputs/founder-brainstorm.txt") : undefined;
    const transcriptBytes = transcriptPath ? await readFile(transcriptPath) : Buffer.from(authorizedSampleTranscript, "utf8");
    const transcriptLayout = wrappedLines(transcriptBytes.toString("utf8"), 48, finalBuild ? 10 : 12);
    metaRevealEvidence = {
      mode: finalBuild ? "founder" : "authorized-sample",
      transcript: { relativePath: transcriptPath ? relative(repository, transcriptPath) : null, sha256: sha256(transcriptBytes), byteCount: transcriptBytes.byteLength, display: { mode: transcriptLayout.truncated ? "verbatim-excerpt" : "complete", lineCount: transcriptLayout.lines.length, truncated: transcriptLayout.truncated } },
      submissionManifest: { relativePath: relative(repository, finalSubmissionManifestPath), sha256: sha256(submissionManifestBytes) },
      buildTrace: { relativePath: relative(repository, buildTracePath), sha256: sha256(buildTraceBytes) },
    };
  }
  const manifest = {
    schemaVersion: 1,
    status: finalBuild ? "final-public-demo" : sampleEditorialBuild ? "sample-editorial-cut" : "editorial-rough-cut",
    disclosure: finalBuild ? "Final WorkshopLM demo with OpenAI Cedar narration, hash-bound founder evidence, and a verified traced submission Output set." : sampleEditorialBuild ? "Clean editorial review cut with OpenAI Cedar narration, the authorized sample transcript, and the verified acceptance Output set. This is not founder footage or the public submission video." : providerNarration ? "Truthful fixture rough cut with OpenAI Cedar editorial narration. This is not final founder footage or the public submission video." : "Truthful fixture rough cut with a local macOS guide voice. This is not provider narration, final host footage, or the public submission video.",
    builtAt: new Date().toISOString(),
    plan: "submission/demo-film-plan.json",
    sourceCapture: plan.captureManifest,
    compositor: { engine: "hyperframes", mode: "local", version: "0.7.60", composition: "workshoplm-editorial-film", jitterProneZoompan: false, transition: "design-accent-wipe", design: { sha256: filmIdentity.designSha256, source: relative(repository, filmIdentity.designMarkdownPath) }, frame: { version: filmIdentity.frameVersion, sha256: filmIdentity.frameSha256, source: relative(repository, filmIdentity.frameMarkdownPath) } },
    voice: providerNarration ? { provider: "OpenAI", model: providerNarration.model, name: providerNarration.voice, disclosure: providerNarration.disclosure, requestCount: providerNarration.requestCount, finalProviderNarration: true } : { provider: "local macOS say", name: voice, ratePolicy: fixedSpeechRate ? `fixed ${fixedSpeechRate}` : "adaptive 120–180 words per minute", finalProviderNarration: false },
    video: { relativePath: finalBuild ? "workshoplm-demo.mp4" : sampleEditorialBuild ? "workshoplm-demo-sample.mp4" : "workshoplm-demo-rough-cut.mp4", sha256: sha256(videoBytes), durationSeconds: Number(inspected.format?.duration || 0), streams: inspected.streams || [] },
    contactSheet: { relativePath: "contact-sheet.jpg", sha256: sha256(sheetBytes) },
    reviewFrames: await Promise.all(reviewFrames.map(async (path) => ({ relativePath: `review/${path.split("/").at(-1)}`, sha256: sha256(await readFile(path)) }))),
    ...(metaRevealEvidence ? { metaRevealEvidence } : {}),
    shots: shotRecords,
    limitations: finalBuild ? [] : [
      sampleEditorialBuild ? `${plan.shots.filter((shot) => shot.state === "blocked").length} final-evidence shots use explicitly labeled sample or fixture material in this review cut.` : `${plan.shots.filter((shot) => shot.state === "blocked").length} shots remain visibly marked FINAL EVIDENCE PENDING.`,
      "The walkthrough uses the sanitized deterministic fixture and six hash-bound GPT Image 2 replay files; it makes no paid image call during replay.",
      providerNarration ? "OpenAI Cedar narration is present; founder footage and final public export remain pending." : "The guide voice is local macOS speech synthesis, not OpenAI narration.",
      providerNarration ? "Founder brainstorm, final Source-derived Output set, and public-export evidence remain gated elsewhere." : "Founder brainstorm, Realtime, GPT-5.6, GPT Image 2, provider narration, final Output set, and public-export evidence remain gated elsewhere."
    ]
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  if (sampleEditorialBuild) await writeFile(resolve(outputRoot, "README.md"), `# WorkshopLM sample editorial cut\n\nThis 2:20 review cut uses the authorized sample transcript, the verified acceptance Output set, and the existing OpenAI Cedar narration. It is intentionally not founder footage or the public submission video.\n\n- Watch: \`workshoplm-demo-sample.mp4\`\n- Scan all ten shots: \`contact-sheet.jpg\` and \`review/\`\n- Inspect hashes, disclosures, and remaining final-evidence gates: \`manifest.json\`\n- Rebuild: \`pnpm demo:film:sample\`\n- Verify: \`pnpm demo:film:verify-sample\`\n\nThe final command remains fail-closed until the founder recording and founder-derived ready submission package exist.\n`, "utf8");
  await rm(temporaryRoot, { recursive: true, force: true });
  if (finalBuild) {
    const finalPlan = { ...plan, status: "final", shots: plan.shots.map((shot) => ({ ...shot, state: "ready" })) };
    try {
      await writeFile(planPath, `${JSON.stringify(finalPlan, null, 2)}\n`, "utf8");
      execFileSync("pnpm", ["-s", "demo:film:verify-final"], { cwd: repository, stdio: "inherit" });
    } catch (error) {
      await writeFile(planPath, originalPlanBytes);
      await rm(outputVideo, { force: true });
      await rm(manifestPath, { force: true });
      throw error;
    }
  }
  process.stdout.write(`${JSON.stringify({ status: manifest.status, video: outputVideo, durationSeconds: manifest.video.durationSeconds, sha256: manifest.video.sha256, contactSheet }, null, 2)}\n`);
}

main().catch(async (error) => {
  if (finalBuild && finalAssemblyStarted) {
    await rm(outputVideo, { force: true });
    await rm(manifestPath, { force: true });
  }
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
