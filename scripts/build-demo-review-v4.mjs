import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const outputRoot = resolve(repository, "outputs/demo-film-local-review-v4");
const buildRoot = resolve(outputRoot, ".build");
const compositionRoot = resolve(buildRoot, "hyperframes");
const assetsRoot = resolve(compositionRoot, "assets");
const workflowPath = resolve(repository, "outputs/demo-recording-film/workshoplm-film-workflow.webm");
const codexPath = resolve(repository, "outputs/demo-film-inputs/codex-doorway.mov");
const instrumentalPath = resolve(outputRoot, "stems/htdemucs_ft/Different Window (DOLBY)/no_vocals.wav");
const narrationManifestPath = resolve(outputRoot, "narration/manifest.json");
const planPath = resolve(repository, "submission/demo-film-beat-plan.json");
const basePicturePath = resolve(buildRoot, "product-first-base.mp4");
const picturePath = resolve(buildRoot, "picture.mp4");
const narrationPath = resolve(buildRoot, "dry-narration.wav");
const mixPath = resolve(buildRoot, "constant-bed-mix.wav");
const videoPath = resolve(outputRoot, "workshoplm-demo-review-v4.mp4");
const manifestPath = resolve(outputRoot, "manifest.json");
const reviewRoot = resolve(outputRoot, "review");
const contactSheetPath = resolve(outputRoot, "contact-sheet.jpg");
const hyperframesCli = resolve(repository, "node_modules/hyperframes/dist/cli.js");
const gsapPath = resolve(repository, "apps/worker/node_modules/gsap/dist/gsap.min.js");
const durationSeconds = 158.592;

function run(command, args) {
  execFileSync(command, command === "ffmpeg" ? ["-hide_banner", "-loglevel", "error", ...args] : args, { cwd: repository, stdio: "inherit" });
}

function captured(command, args, label) {
  try {
    execFileSync(command, args, { cwd: repository, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", maxBuffer: 8_000_000 });
    process.stdout.write(`${label} passed.\n`);
  } catch (error) {
    process.stderr.write(`${String(error?.stderr ?? error?.stdout ?? error).slice(-12000)}\n`);
    throw error;
  }
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const atempo = (ratio) => `atempo=${ratio.toFixed(6)}`;

function trim(input, start, end, target, label) {
  const ratio = target / (end - start);
  return `[${input}:v]trim=start=${start}:end=${end},setpts=(PTS-STARTPTS)*${ratio.toFixed(8)},scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30[${label}]`;
}

function compositionHtml(plan) {
  const overlays = plan.shots.map((shot, index) => {
    const duration = Math.min(4.4, shot.endSeconds - shot.startSeconds);
    const shortTitles = {
      why: "Why good work loses its source",
      "one-workshop": "One Workshop. One chain of evidence.",
      capture: "Capture the real starting material",
      map: "GPT-5.6 Terra builds an editable Map",
      "source-proof": "Open any claim to its exact Source",
      approvals: "Human approval before creation and render",
      "output-flex": "One direction becomes seven formats",
      render: "Storyboard to local HyperFrames render",
      "codex-gpt": "Built and tested with Codex + GPT-5.6",
      close: "Finished work. Sources still attached.",
    };
    return `<section id="o${index}" class="clip lower" data-start="${shot.startSeconds}" data-duration="${duration.toFixed(3)}" data-track-index="2" data-layout-allow-occlusion><div class="index">${String(index + 1).padStart(2, "0")}</div><div><span>${esc(shot.id.replaceAll("-", " "))}</span><h2>${esc(shortTitles[shot.id])}</h2></div></section>`;
  }).join("");
  const proof = `<section id="build-proof" class="clip proof" data-start="137.253" data-duration="10.960" data-track-index="5"><header><span>VERIFIED BUILD RECORD</span><h2>Codex built it. GPT-5.6 runs the Map.</h2></header><div class="proof-grid"><article><b>CODEX + GPT-5.6</b><h3>Built, tested, corrected</h3><p>The primary Codex task owns WorkshopLM's implementation, integration, and acceptance record.</p><code>019f5eb9…a324</code></article><article><b>GPT-5.6 TERRA</b><h3>Founder Source → grounded Map</h3><p>The live run shown here records the model, request, input claims, and output hash.</p><code>req_535ae2…c220</code></article></div><footer>Build record · 130 worker tests · local HyperFrames render · source hashes</footer></section>`;
  const motion = plan.shots.map((shot, index) => `tl.fromTo("#o${index}",{y:18,opacity:0},{y:0,opacity:1,duration:.45,ease:"power2.out"},${(shot.startSeconds + .12).toFixed(3)});tl.to("#o${index}",{opacity:0,duration:.35,ease:"power1.in"},${(shot.startSeconds + Math.min(3.75, shot.endSeconds - shot.startSeconds - .4)).toFixed(3)});`).join("") + `tl.fromTo("#build-proof header",{y:18,opacity:0},{y:0,opacity:1,duration:.55,ease:"power2.out"},137.45);tl.fromTo("#build-proof article",{y:24,opacity:0},{y:0,opacity:1,duration:.65,stagger:.12,ease:"power2.out"},138.05);`;
  return `<!doctype html><html><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>*{box-sizing:border-box}html,body,main{margin:0;width:1280px;height:720px;overflow:hidden;background:#0d0e0d;font-family:Arial,Helvetica,sans-serif}.clip{visibility:hidden}.base{position:absolute;inset:0;width:1280px;height:720px;object-fit:cover}.lower{position:absolute;left:34px;bottom:32px;display:flex;align-items:center;gap:15px;max-width:650px;padding:15px 19px 16px 15px;border:1px solid rgba(255,255,255,.7);border-radius:14px;background:rgba(253,253,251,.94);color:#111210;box-shadow:0 12px 35px rgba(0,0,0,.22)}.index{display:grid;place-items:center;width:43px;height:43px;border-radius:10px;background:#4f73ff;color:white;font-size:12px;font-weight:800}.lower span{display:block;margin-bottom:4px;color:#4f73ff;font-size:9px;font-weight:800;letter-spacing:.13em;text-transform:uppercase}.lower h2{margin:0;font-size:22px;line-height:1.05;letter-spacing:-.03em}.proof{position:absolute;z-index:10;inset:0;padding:56px 64px;background:#fdfdfb;color:#111210}.proof header span{color:#4f73ff;font-size:11px;font-weight:800;letter-spacing:.15em}.proof header h2{max-width:850px;margin:10px 0 31px;font-size:44px;line-height:1;letter-spacing:-.045em}.proof-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.proof article{min-height:310px;padding:29px;border:1px solid #dfe0da;border-radius:18px;background:white;box-shadow:0 16px 45px rgba(17,18,16,.07)}.proof article b{color:#4f73ff;font-size:11px;letter-spacing:.1em}.proof article h3{margin:23px 0 13px;font-size:28px;letter-spacing:-.035em}.proof article p{max-width:460px;margin:0 0 31px;color:#565852;font-size:16px;line-height:1.45}.proof code{display:inline-block;padding:10px 12px;border-radius:8px;background:#111210;color:#fdfdfb;font-size:13px}.proof footer{margin-top:20px;color:#686a64;font-size:12px}</style></head><body><main data-composition-id="workshoplm-v4" data-start="0" data-duration="${durationSeconds}" data-width="1280" data-height="720" data-fps="30"><video id="product-workflow" class="clip base" src="assets/product-first-base.mp4" muted playsinline data-start="0" data-duration="${durationSeconds}" data-track-index="0"></video>${overlays}${proof}</main><script>window.__timelines=window.__timelines||{};const tl=gsap.timeline({paused:true});${motion}window.__timelines["workshoplm-v4"]=tl;</script></body></html>`;
}

await rm(buildRoot, { recursive: true, force: true });
await mkdir(assetsRoot, { recursive: true });
await mkdir(reviewRoot, { recursive: true });
const [planBytes, narrationBytes] = await Promise.all([readFile(planPath), readFile(narrationManifestPath)]);
const plan = JSON.parse(planBytes.toString("utf8"));
const narration = JSON.parse(narrationBytes.toString("utf8"));

const mapA = trim(0, 0.995, 9.796, 8.801, "mapa");
const mapB = trim(0, 25.965, 31.981, 6.016, "mapb");
const sourceA = trim(0, 18.668, 25.942, 7.274, "sourcea");
const sourceB = trim(0, 56.566, 63.422, 6.856, "sourceb");
const approvalA = trim(0, 32.001, 40.043, 8.042, "approvala");
const approvalB = trim(0, 71.152, 77.556, 6.404, "approvalb");
const videoFilters = [
  trim(0, 0, 16.695, 16.695, "why"),
  trim(0, 18.668, 25.942, 10.96, "one"),
  trim(0, 9.796, 25.942, 16.44, "capture"),
  mapA, mapB, `[mapa][mapb]concat=n=2:v=1:a=0,setpts=(PTS-STARTPTS)*${(21.919 / 14.817).toFixed(8)}[map]`,
  sourceA, sourceB, `[sourcea][sourceb]concat=n=2:v=1:a=0,setpts=(PTS-STARTPTS)*${(16.44 / 14.13).toFixed(8)}[source]`,
  approvalA, approvalB, `[approvala][approvalb]concat=n=2:v=1:a=0,setpts=(PTS-STARTPTS)*${(16.44 / 14.446).toFixed(8)}[approvals]`,
  trim(0, 46.9, 63.422, 21.919, "outputs"),
  trim(0, 63.467, 79.907, 16.44, "render"),
  `[1:v]trim=start=0:end=10.96,setpts=PTS-STARTPTS,scale=1280:720:force_original_aspect_ratio=increase,crop=1280:720,setsar=1,fps=30[codex]`,
  trim(0, 88.064, 100.083, 10.379, "close"),
  `[why][one][capture][map][source][approvals][outputs][render][codex][close]concat=n=10:v=1:a=0,trim=duration=${durationSeconds},fps=30,format=yuv420p[picture]`,
];
run("ffmpeg", ["-y", "-i", workflowPath, "-i", codexPath, "-filter_complex", videoFilters.join(";"), "-map", "[picture]", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-movflags", "+faststart", basePicturePath]);

await copyFile(basePicturePath, resolve(assetsRoot, basename(basePicturePath)));
await copyFile(gsapPath, resolve(compositionRoot, "gsap.min.js"));
await writeFile(resolve(compositionRoot, "index.html"), compositionHtml(plan), "utf8");
captured(process.execPath, [hyperframesCli, "lint", compositionRoot, "--json"], "HyperFrames lint");
captured(process.execPath, [hyperframesCli, "check", compositionRoot, "--json", "--samples", "16", "--max-issues", "30", "--no-contrast"], "HyperFrames check");
captured(process.execPath, [hyperframesCli, "render", compositionRoot, "--output", picturePath, "--workers", "1", "--quality", "high"], "HyperFrames render");

const narrationInputs = [];
const narrationFilters = [];
const narrationLabels = [];
for (const [index, item] of narration.shots.entries()) {
  const shot = plan.shots.find((record) => record.id === item.id);
  const slot = shot.endSeconds - shot.startSeconds;
  const ratio = item.durationSeconds > slot - .12 ? item.durationSeconds / (slot - .12) : 1;
  narrationInputs.push("-i", resolve(repository, item.relativePath));
  narrationFilters.push(`[${index}:a]aresample=48000,${ratio > 1.002 ? `${atempo(ratio)},` : ""}afade=t=in:st=0:d=0.01,afade=t=out:st=${Math.max(0.02, item.durationSeconds / ratio - 0.02).toFixed(3)}:d=0.02,apad=whole_dur=${slot.toFixed(3)},atrim=duration=${slot.toFixed(3)},asetpts=PTS-STARTPTS[n${index}]`);
  narrationLabels.push(`[n${index}]`);
}
narrationFilters.push(`${narrationLabels.join("")}concat=n=10:v=0:a=1,atrim=duration=${durationSeconds}[voice]`);
run("ffmpeg", ["-y", ...narrationInputs, "-filter_complex", narrationFilters.join(";"), "-map", "[voice]", "-ar", "48000", "-ac", "1", "-c:a", "pcm_s24le", narrationPath]);
run("ffmpeg", ["-y", "-i", instrumentalPath, "-i", narrationPath, "-filter_complex", `[0:a]aresample=48000,atrim=duration=${durationSeconds},asetpts=PTS-STARTPTS,volume=.44[music];[1:a]aresample=48000,atrim=duration=${durationSeconds},asetpts=PTS-STARTPTS[voice];[music][voice]amix=inputs=2:weights='1 1':normalize=0,loudnorm=I=-15:LRA=8:TP=-1.5[mix]`, "-map", "[mix]", "-t", String(durationSeconds), "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", mixPath]);
run("ffmpeg", ["-y", "-i", picturePath, "-i", mixPath, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-t", String(durationSeconds), "-movflags", "+faststart", videoPath]);
run("ffmpeg", ["-v", "error", "-i", videoPath, "-f", "null", "-"]);

const reviewFrames = [];
for (const [index, shot] of plan.shots.entries()) {
  const reviewPath = resolve(reviewRoot, `${String(index + 1).padStart(2, "0")}.jpg`);
  run("ffmpeg", ["-y", "-ss", String((shot.startSeconds + shot.endSeconds) / 2), "-i", videoPath, "-frames:v", "1", "-q:v", "2", reviewPath]);
  reviewFrames.push(reviewPath);
}
run("ffmpeg", ["-y", "-framerate", "1", "-start_number", "1", "-i", resolve(reviewRoot, "%02d.jpg"), "-vf", "scale=384:-2,tile=5x2", "-frames:v", "1", "-q:v", "2", contactSheetPath]);
const loudnessResult = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", mixPath, "-af", "loudnorm=I=-15:LRA=8:TP=-1.5:print_format=json", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 4_000_000 });
const loudness = JSON.parse(loudnessResult.stderr.match(/\{[\s\S]*?\}/g)?.at(-1) ?? "{}");
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_name,codec_type,width,height,sample_rate,channels", "-of", "json", videoPath], { encoding: "utf8" }));
const manifest = {
  schemaVersion: 1,
  status: "local-human-review-only",
  externalPublishingAuthorized: false,
  failedPredecessors: ["outputs/demo-film-final/workshoplm-demo.mp4", "outputs/demo-film-local-review-v2/workshoplm-demo-audio-review-v2.mp4", "outputs/demo-film-local-review-v3/workshoplm-demo-audio-review-v3.mp4"],
  builtAt: new Date().toISOString(),
  picture: { grammar: "product-first continuous workflow with short lower thirds", sourceCaptureSha256: sha256(await readFile(workflowPath)), hyperframes: true, titleCardSeconds: 0 },
  narration: { engine: narration.engine, voice: narration.voice, manifestSha256: sha256(narrationBytes), dryMonoSource: true, addedDelayReverbChorusOrDoubling: false },
  music: { title: "Different Window", stemModel: "htdemucs_ft", instrumentalSha256: sha256(await readFile(instrumentalPath)), gain: .44, duckingOrSidechain: false },
  audio: { loudness },
  video: { relativePath: basename(videoPath), sha256: sha256(await readFile(videoPath)), durationSeconds: Number(probe.format.duration), streams: probe.streams, decodePassed: true },
  review: { contactSheet: basename(contactSheetPath), humanApprovalRequired: true },
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ video: videoPath, sha256: manifest.video.sha256, durationSeconds: manifest.video.durationSeconds, loudness, contactSheet: contactSheetPath }, null, 2)}\n`);
