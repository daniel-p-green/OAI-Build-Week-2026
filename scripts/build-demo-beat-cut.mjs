import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const planPath = resolve(repository, "submission/demo-film-beat-plan.json");
const narrationManifestPath = resolve(repository, "outputs/demo-film-beat-narration/manifest.json");
const musicPath = "/Users/danielgreen/Library/Mobile Documents/com~apple~CloudDocs/The Codex Rap - July 2026/Masters/Different Window (DOLBY).wav";
const outputRoot = resolve(repository, "outputs/demo-film-beat-cut");
const buildRoot = resolve(outputRoot, ".build");
const compositionRoot = resolve(buildRoot, "hyperframes");
const assetsRoot = resolve(compositionRoot, "assets");
const picturePath = resolve(buildRoot, "picture.mp4");
const narrationPath = resolve(buildRoot, "narration.wav");
const mixPath = resolve(buildRoot, "mix.wav");
const videoPath = resolve(outputRoot, "workshoplm-demo-beat-cut.mp4");
const manifestPath = resolve(outputRoot, "manifest.json");
const reviewRoot = resolve(outputRoot, "review");
const contactSheetPath = resolve(outputRoot, "contact-sheet.jpg");
const hyperframesCli = resolve(repository, "node_modules/hyperframes/dist/cli.js");
const gsapPath = resolve(repository, "apps/worker/node_modules/gsap/dist/gsap.min.js");
const width = 1280;
const height = 720;
const fps = 30;
const audioOnly = process.argv.includes("--audio-only");

const assets = {
  capture: "outputs/workshoplm-current-ui/02-add-thinking.png",
  map: "outputs/workshoplm-current-ui/03-grounded-map.png",
  source: "outputs/workshoplm-current-ui/05-source-evidence.png",
  brief: "outputs/workshoplm-current-ui/06-approved-brief.png",
  style: "outputs/workshoplm-current-ui/07-company-style.png",
  outputs: "outputs/workshoplm-current-ui/08-current-outputs.png",
  presentation: "outputs/workshoplm-current-ui/09-presentation.png",
  sketch: "outputs/workshoplm-current-ui/10-sketch.png",
  image: "outputs/workshoplm-current-ui/11-replace-image.png",
  storyboard: "outputs/workshoplm-current-ui/12-storyboard.png",
  original: "outputs/workshoplm-current-ui/14-original-reveal.png",
  panel1: "outputs/final-submission-output-set/images/panel-1.png",
  panel2: "outputs/final-submission-output-set/images/panel-2.png",
  panel3: "outputs/final-submission-output-set/images/panel-3.png",
  codex: "outputs/demo-film-inputs/codex-doorway.mov",
  rendered: "outputs/demo-film-inputs/provider-narrated-video.mp4",
  walkthrough: "outputs/demo-recording-final/workshoplm-founder-walkthrough.webm",
};

function run(command, args, options = {}) {
  const effectiveArgs = command === "ffmpeg" ? ["-hide_banner", "-loglevel", "error", ...args] : args;
  execFileSync(command, effectiveArgs, { cwd: repository, stdio: "inherit", ...options });
}

function captured(command, args, label) {
  try {
    execFileSync(command, args, { cwd: repository, encoding: "utf8", maxBuffer: 4_000_000, stdio: ["ignore", "pipe", "pipe"] });
    process.stdout.write(`${label} passed.\n`);
  } catch (error) {
    const diagnostic = [error?.stdout, error?.stderr].filter(Boolean).map(String).join("\n").slice(-12000);
    if (diagnostic) process.stderr.write(`${diagnostic}\n`);
    throw error;
  }
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const escaped = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
const atempo = (ratio) => {
  const parts = [];
  let remaining = ratio;
  while (remaining > 2) { parts.push(2); remaining /= 2; }
  while (remaining < 0.5) { parts.push(0.5); remaining /= 0.5; }
  parts.push(remaining);
  return parts.map((value) => `atempo=${value.toFixed(6)}`).join(",");
};

function compositionHtml(plan) {
  const shot = Object.fromEntries(plan.shots.map((item) => [item.id, item]));
  const scene = (id, inner, track = 0) => `<section id="${id}" class="clip scene" data-start="${shot[id].startSeconds}" data-duration="${(shot[id].endSeconds - shot[id].startSeconds).toFixed(3)}" data-track-index="${track}">${inner}</section>`;
  const label = (kicker, title) => `<div class="scene-copy"><div class="kicker">${kicker}</div><h2>${title}</h2></div>`;
  const frame = (src, alt, className = "") => `<div class="device ${className}"><img src="assets/${src}" alt="${escaped(alt)}"></div>`;
  const outputStart = shot["output-flex"].startSeconds;
  const phrase = 2.739956;
  const outputCards = [
    ["OUTPUT 01", "Presentation", "09-presentation.png"],
    ["OUTPUT 02", "Infographic", "panel-1.png"],
    ["OUTPUT 03", "Image set", "11-replace-image.png"],
    ["OUTPUT 04", "Audio Overview", "panel-2.png"],
    ["OUTPUT 05", "Sketch", "10-sketch.png"],
    ["OUTPUT 06", "Storyboard", "12-storyboard.png"],
    ["OUTPUT 07", "Video", "panel-3.png"],
  ].map(([kicker, title, src], index) => {
    const start = outputStart + index * phrase;
    const media = src.endsWith(".mp4") ? `<video src="assets/${src}" muted playsinline loop data-start="${start.toFixed(3)}" data-duration="${phrase.toFixed(3)}" data-track-index="4"></video>` : `<img src="assets/${src}" alt="${title}">`;
    return `<section id="output-${index + 1}" class="clip output-world world-${index + 1}" data-start="${start.toFixed(3)}" data-duration="${phrase.toFixed(3)}" data-track-index="3"><div class="output-copy"><span>${kicker}</span><h3>${title}</h3></div><div class="output-media">${media}</div></section>`;
  }).join("");

  const scenes = [
    scene("why", `${label("WHY", "The work breaks apart after the meeting.")}<div class="fragments"><div class="fragment f1">Meeting</div><div class="fragment f2">Notes</div><div class="fragment f3">Slides</div><div class="fragment f4">Graphics</div><div class="fragment f5">Sources</div><svg class="broken-lines" viewBox="0 0 900 350"><path d="M110 180 C250 40 350 270 460 150"/><path d="M500 165 C610 60 720 275 825 130"/></svg></div><p class="why-line">The decisions are real. The trail back to them usually isn&apos;t.</p>`),
    scene("one-workshop", `${label("WORKSHOPLM", "Keep the thinking. Ship the work.")}<div class="spine"><div><b>01</b><span>Capture</span></div><i></i><div><b>02</b><span>Map</span></div><i></i><div><b>03</b><span>Brief</span></div><i></i><div><b>04</b><span>Create</span></div></div><div class="source-pill">Sources stay attached</div>`),
    scene("capture", `${label("CAPTURE", "Start with the real material.")}${frame("02-add-thinking.png", "WorkshopLM source capture", "wide")}<div class="side-proof"><span>VOICE</span><span>TEXT</span><span>URL</span><span>PDF</span></div>`),
    scene("map", `${label("MAP · GPT-5.6 TERRA", "Evidence becomes a direction you can edit.")}${frame("03-grounded-map.png", "Grounded Map", "wide")}<div class="map-logic"><span>Evidence</span><i>→</i><span>Synthesis</span><i>→</i><span>Direction</span></div><div class="mini-source"><img src="assets/05-source-evidence.png" alt="Exact source evidence"></div>`),
    scene("source-proof", `${label("SOURCE PROOF", "Open the claim. See the sentence behind it.")}${frame("05-source-evidence.png", "Exact source excerpt", "wide source-frame")}<div class="trace-card"><b>Claim → exact locator</b><span>Meeting · chunk 04</span><em>Needs update if evidence changes</em></div>`),
    scene("approvals", `${label("HUMAN CONTROL", "Two checkpoints. Both fail closed.")}<div class="approval-grid">${frame("06-approved-brief.png", "Approved Brief", "approval")} ${frame("12-storyboard.png", "Storyboard review", "approval")}</div><div class="approval-labels"><span>1 · Approve the Brief</span><span>2 · Approve the Storyboard</span></div>`),
    scene("output-flex", `${label("CREATE", "One approved direction. Seven expressions.")}<div class="output-rail"><span data-layout-allow-occlusion>Presentation</span><span data-layout-allow-occlusion>Infographic</span><span data-layout-allow-occlusion>Images</span><span data-layout-allow-occlusion>Audio</span><span data-layout-allow-occlusion>Sketch</span><span data-layout-allow-occlusion>Storyboard</span><span data-layout-allow-occlusion>Video</span></div>`, 0) + outputCards,
    scene("render", `${label("STORYBOARD → VIDEO", "Edit the scenes. Approve the plan. Render locally.")}<div class="render-grid">${frame("12-storyboard.png", "Editable storyboard", "render-left")}<div class="render-video"></div></div><div class="hash-row"><span>claim hash</span><span>image hash</span><span>voice hash</span><span>source hash</span></div>`),
    scene("codex-gpt", `${label("BUILT WITH OPENAI", "Codex built it. GPT-5.6 powers the thinking.")}<div class="codex-grid"><div class="codex-video-bed"></div><div class="build-proof"><div><b>Codex + GPT-5.6</b><span>implementation · tests · corrections</span></div><div><b>GPT-5.6 Terra</b><span>authorized Source → grounded Map</span></div><small>Verified in the build record and provider provenance.</small></div></div>`),
    scene("close", `${label("WORKSHOPLM", "Good thinking shouldn&apos;t disappear in the handoff.")}<div class="close-spine"><span>Conversation</span><i></i><span>Map</span><i></i><span>Brief</span><i></i><span>Finished work</span></div><p class="close-line">Ideas in. Things out. Sources attached.</p><div class="disclosure">AI voice: OpenAI Cedar · Music: Different Window · Built with Codex + GPT-5.6</div>`),
  ].join("");
  const timedMedia = `<video id="walkthrough-media" class="clip timed-video walkthrough-media" src="assets/workshoplm-founder-walkthrough.webm" muted playsinline data-start="${shot.map.startSeconds}" data-duration="${(shot.map.endSeconds-shot.map.startSeconds).toFixed(3)}" data-track-index="2"></video><video id="render-media" class="clip timed-video render-media" src="assets/provider-narrated-video.mp4" muted playsinline data-start="${shot.render.startSeconds}" data-duration="${(shot.render.endSeconds-shot.render.startSeconds).toFixed(3)}" data-track-index="4"></video><video id="codex-media" class="clip timed-video codex-media" src="assets/codex-doorway.mov" muted playsinline data-start="${shot["codex-gpt"].startSeconds}" data-duration="${(shot["codex-gpt"].endSeconds-shot["codex-gpt"].startSeconds).toFixed(3)}" data-track-index="4"></video>`;

  const motion = [
    `tl.fromTo("#why .scene-copy",{y:28,opacity:0},{y:0,opacity:1,duration:1.1,ease:"power3.out"},0.2);`,
    `tl.fromTo("#why .fragment",{x:(i)=>[-180,120,-90,170,-140][i],y:(i)=>[-70,-120,110,80,30][i],rotate:(i)=>[-9,7,-5,8,-6][i],opacity:0},{x:0,y:0,rotate:0,opacity:1,duration:2.2,stagger:.12,ease:"power3.out"},1.0);`,
    `tl.to("#why .fragment",{x:(i)=>[-60,80,-90,70,-45][i],y:(i)=>[-35,-45,42,50,18][i],rotate:(i)=>[-5,4,-3,5,-4][i],duration:9,ease:"sine.inOut"},3.4);`,
    `tl.fromTo("#one-workshop .spine",{scale:.94,opacity:0},{scale:1,opacity:1,duration:1.2,ease:"power3.out"},${(shot["one-workshop"].startSeconds + .4).toFixed(3)});`,
    ...["capture","map","source-proof","approvals","render","codex-gpt"].flatMap((id) => {
      const start = shot[id].startSeconds;
      return [`tl.fromTo("#${id} .scene-copy",{x:-22,opacity:0},{x:0,opacity:1,duration:.7,ease:"power3.out"},${(start+.18).toFixed(3)});`,`tl.fromTo("#${id} .device, #${id} .render-video, #${id} .codex-grid",{y:24,opacity:0},{y:0,opacity:1,duration:.9,ease:"power3.out"},${(start+.45).toFixed(3)});`];
    }),
    `tl.fromTo("#map .mini-source",{x:40,y:26,opacity:0},{x:0,y:0,opacity:1,duration:.8,ease:"power3.out"},${(shot.map.startSeconds+5.5).toFixed(3)});`,
    `tl.fromTo("#close .close-spine",{scale:.94,opacity:0},{scale:1,opacity:1,duration:1,ease:"power3.out"},${(shot.close.startSeconds+.5).toFixed(3)});`,
  ].join("");

  return `<!doctype html><html><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>
  :root{--ink:#111210;--muted:#666761;--paper:#fdfdfb;--blue:#4f73ff;--green:#2aa66a;--orange:#ff7a45;--line:#dedfd9}*{box-sizing:border-box}html,body,main{margin:0;width:${width}px;height:${height}px;overflow:hidden;background:var(--paper);font-family:Arial,Helvetica,sans-serif;color:var(--ink)}.clip{visibility:hidden}.scene,.output-world{position:absolute;inset:0;overflow:hidden;background:var(--paper)}.scene{padding:52px 62px}.scene-copy{position:relative;z-index:5;max-width:730px}.kicker{margin-bottom:11px;color:var(--blue);font-size:12px;font-weight:800;letter-spacing:.16em}.scene h2{margin:0;font-size:45px;line-height:1.02;letter-spacing:-.045em}.device{position:absolute;overflow:hidden;border:1px solid var(--line);border-radius:19px;background:#eee;box-shadow:0 22px 60px rgba(17,18,16,.14)}.device img{width:100%;height:100%;display:block;object-fit:cover;object-position:top left}.device.wide{right:62px;bottom:42px;width:760px;height:506px}.side-proof{position:absolute;left:62px;bottom:74px;display:grid;gap:11px}.side-proof span{width:116px;padding:11px 14px;border:1px solid var(--line);border-radius:999px;background:white;font-size:11px;font-weight:800;letter-spacing:.08em}.fragments{position:absolute;right:80px;bottom:95px;width:890px;height:350px}.fragment{position:absolute;z-index:2;width:168px;height:92px;display:grid;place-items:center;border:1px solid var(--line);border-radius:15px;background:white;box-shadow:0 18px 44px rgba(17,18,16,.11);font-size:19px;font-weight:700}.f1{left:15px;top:150px}.f2{left:190px;top:30px}.f3{left:370px;top:180px}.f4{left:560px;top:50px}.f5{left:720px;top:205px}.broken-lines{position:absolute;inset:0}.broken-lines path{fill:none;stroke:#c4c6c0;stroke-width:2;stroke-dasharray:12 14}.why-line{position:absolute;left:62px;bottom:52px;margin:0;color:var(--muted);font-size:19px}.spine,.close-spine{position:absolute;right:62px;bottom:190px;left:62px;display:flex;align-items:center;justify-content:center;gap:14px}.spine div{width:200px;height:150px;padding:25px;border:1px solid var(--line);border-radius:18px;background:white;box-shadow:0 16px 42px rgba(17,18,16,.08)}.spine b{display:block;margin-bottom:34px;color:var(--blue);font-size:12px}.spine span{font-size:28px;font-weight:700;letter-spacing:-.03em}.spine i,.close-spine i{width:54px;height:2px;background:var(--blue)}.source-pill{position:absolute;bottom:102px;left:50%;transform:translateX(-50%);padding:12px 18px;border-radius:999px;color:white;background:var(--ink);font-size:12px;font-weight:750}.map-logic{position:absolute;z-index:4;left:62px;bottom:78px;display:flex;align-items:center;gap:9px}.map-logic span{padding:9px 12px;border-radius:999px;background:var(--ink);color:white;font-size:11px;font-weight:700}.map-logic i{color:var(--blue);font-style:normal}.mini-source{position:absolute;z-index:5;right:83px;bottom:64px;width:340px;height:234px;overflow:hidden;border:1px solid white;border-radius:14px;background:white;box-shadow:0 18px 46px rgba(0,0,0,.22)}.mini-source img{width:100%;height:100%;object-fit:cover;object-position:72% 40%}.source-frame img{object-position:72% 42%}.trace-card{position:absolute;z-index:5;left:62px;bottom:68px;width:300px;padding:18px;border-radius:14px;background:var(--ink);color:white;box-shadow:0 15px 40px rgba(0,0,0,.18)}.trace-card b,.trace-card span,.trace-card em{display:block}.trace-card b{margin-bottom:12px;font-size:15px}.trace-card span{margin-bottom:16px;color:#bfc7ff;font-size:12px}.trace-card em{color:#9fe0b8;font-size:11px;font-style:normal}.approval-grid{position:absolute;right:62px;bottom:70px;left:330px;display:grid;grid-template-columns:1fr 1fr;gap:20px}.device.approval{position:relative;width:100%;height:415px}.approval-labels{position:absolute;left:62px;bottom:100px;display:grid;gap:16px}.approval-labels span{padding:13px 16px;border-left:4px solid var(--blue);background:#f2f3ef;font-size:13px;font-weight:750}.output-rail{position:absolute;right:62px;bottom:190px;left:62px;display:grid;grid-template-columns:repeat(7,1fr);gap:8px}.output-rail span{padding:18px 8px;border:1px solid var(--line);border-radius:12px;background:white;text-align:center;font-size:11px;font-weight:700}.output-world{display:grid;grid-template-columns:350px 1fr;align-items:center;gap:55px;padding:58px 64px}.output-copy span{font-size:12px;font-weight:800;letter-spacing:.16em}.output-copy h3{margin:14px 0 0;font-size:64px;line-height:.95;letter-spacing:-.055em}.output-media{height:575px;overflow:hidden;border-radius:22px;background:#101110;box-shadow:0 24px 65px rgba(0,0,0,.18)}.output-media img,.output-media video{width:100%;height:100%;display:block;object-fit:contain}.world-1{background:#f7f7f4}.world-2{background:#eef2ff}.world-3{background:#fff2ea}.world-4{background:#ecf9f1}.world-5{background:#f4efe8}.world-6{background:#edf1fb}.world-7{background:#101110;color:white}.render-grid{position:absolute;right:62px;bottom:67px;left:62px;display:grid;grid-template-columns:1.2fr .8fr;gap:20px}.device.render-left{position:relative;width:100%;height:430px}.render-video{position:relative;height:430px;overflow:hidden;border-radius:19px;background:#111;box-shadow:0 22px 60px rgba(17,18,16,.16)}.render-video video{width:100%;height:100%;object-fit:cover}.render-badge{position:absolute;right:14px;bottom:14px;padding:9px 11px;border-radius:999px;background:rgba(0,0,0,.72);color:white;font-size:10px;font-weight:800;letter-spacing:.1em}.hash-row{position:absolute;right:80px;bottom:28px;display:flex;gap:8px}.hash-row span{font-size:9px;color:var(--muted)}.codex-grid{position:absolute;right:62px;bottom:60px;left:62px;height:445px;display:grid;grid-template-columns:1.18fr .82fr;gap:22px}.codex-grid video{width:100%;height:100%;object-fit:cover;border-radius:20px;background:#111}.build-proof{display:grid;align-content:center;gap:16px;padding:36px;border:1px solid var(--line);border-radius:20px;background:white}.build-proof div{padding:17px;border-left:4px solid var(--blue);background:#f4f5f1}.build-proof b,.build-proof span{display:block}.build-proof b{margin-bottom:7px;font-size:18px}.build-proof span{color:var(--muted);font-size:12px}.build-proof small{color:var(--muted);font-size:11px}.close-spine{bottom:255px}.close-spine span{padding:16px 22px;border:1px solid var(--line);border-radius:14px;background:white;font-size:15px;font-weight:750}.close-line{position:absolute;right:0;bottom:135px;left:0;margin:0;text-align:center;font-size:28px;font-weight:700;letter-spacing:-.03em}.disclosure{position:absolute;right:0;bottom:26px;left:0;color:var(--muted);font-size:10px;text-align:center}
  .output-world{z-index:6}.timed-video{position:absolute;z-index:7;object-fit:cover;background:#111;box-shadow:0 22px 60px rgba(17,18,16,.16)}.walkthrough-media{z-index:4;right:62px;bottom:42px;width:760px;height:506px;border:1px solid var(--line);border-radius:19px}.render-media{right:62px;bottom:67px;width:456px;height:430px;border-radius:19px}.codex-media{left:62px;bottom:60px;width:663px;height:445px;border-radius:20px}
  </style></head><body><main data-composition-id="workshoplm-beat-cut" data-start="0" data-duration="${plan.targetDurationSeconds}" data-width="${width}" data-height="${height}" data-fps="${fps}">${scenes}${timedMedia}</main><script>window.__timelines=window.__timelines||{};const tl=gsap.timeline({paused:true});${motion}window.__timelines["workshoplm-beat-cut"]=tl;</script></body></html>`;
}

async function main() {
  const [planBytes, narrationBytes, musicBytes] = await Promise.all([readFile(planPath), readFile(narrationManifestPath), readFile(musicPath)]);
  const plan = JSON.parse(planBytes.toString("utf8"));
  const narration = JSON.parse(narrationBytes.toString("utf8"));
  if (plan.targetDurationSeconds !== 158.592 || plan.shots.length !== 10) throw new Error("The beat cut requires the locked full-song 158.592-second plan.");
  if (narration.fileCount !== 10 || narration.shots.length !== 10) throw new Error("The beat cut requires ten provider narration clips.");
  for (const item of narration.shots) {
    const current = plan.shots.find((shot) => shot.id === item.id);
    if (!current || item.narrationSha256 !== sha256(Buffer.from(current.narration))) throw new Error(`Stale narration: ${item.id}`);
  }

  if (!audioOnly) {
    await rm(outputRoot, { recursive: true, force: true });
    await mkdir(assetsRoot, { recursive: true });
    await mkdir(reviewRoot, { recursive: true });
    for (const relativePath of Object.values(assets)) await copyFile(resolve(repository, relativePath), resolve(assetsRoot, basename(relativePath)));
    await copyFile(gsapPath, resolve(compositionRoot, "gsap.min.js"));
    await writeFile(resolve(compositionRoot, "index.html"), compositionHtml(plan), "utf8");
    captured(process.execPath, [hyperframesCli, "lint", compositionRoot, "--json"], "HyperFrames lint");
    captured(process.execPath, [hyperframesCli, "check", compositionRoot, "--json", "--samples", "12", "--max-issues", "30", "--no-contrast"], "HyperFrames check");
    captured(process.execPath, [hyperframesCli, "render", compositionRoot, "--output", picturePath, "--workers", "1", "--quality", "high"], "HyperFrames render");
  } else {
    await readFile(picturePath);
    await mkdir(reviewRoot, { recursive: true });
  }

  const narrationInputs = [];
  const narrationFilters = [];
  const narrationLabels = [];
  for (const [index, item] of narration.shots.entries()) {
    const current = plan.shots.find((shot) => shot.id === item.id);
    const slot = current.endSeconds - current.startSeconds;
    const target = Math.max(1, slot - .35);
    const ratio = item.durationSeconds > target ? item.durationSeconds / target : 1;
    narrationInputs.push("-i", resolve(repository, item.relativePath));
    narrationFilters.push(`[${index}:a]${ratio > 1.002 ? `${atempo(ratio)},` : ""}aresample=48000,loudnorm=I=-16:LRA=6:TP=-1.5,adelay=180,apad=whole_dur=${slot.toFixed(3)},atrim=duration=${slot.toFixed(3)},asetpts=PTS-STARTPTS[v${index}]`);
    narrationLabels.push(`[v${index}]`);
  }
  narrationFilters.push(`${narrationLabels.join("")}concat=n=${narrationLabels.length}:v=0:a=1,atrim=duration=${plan.targetDurationSeconds}[voice]`);
  run("ffmpeg", ["-y", ...narrationInputs, "-filter_complex", narrationFilters.join(";"), "-map", "[voice]", "-ar", "48000", "-ac", "2", narrationPath]);

  run("ffmpeg", ["-y", "-i", musicPath, "-i", narrationPath, "-filter_complex", `[0:a]atrim=duration=${plan.targetDurationSeconds},asetpts=PTS-STARTPTS,highpass=f=55,lowpass=f=15000,equalizer=f=2500:t=q:w=1.2:g=-10,volume=0.12[music];[1:a]atrim=duration=${plan.targetDurationSeconds},asetpts=PTS-STARTPTS,volume=1.4,asplit=2[sidechain][voice];[music][sidechain]sidechaincompress=threshold=0.008:ratio=20:attack=5:release=500:makeup=1[ducked];[ducked][voice]amix=inputs=2:weights='1 1':normalize=0,loudnorm=I=-14:LRA=8:TP=-2.0[mix]`, "-map", "[mix]", "-t", String(plan.targetDurationSeconds), "-ar", "48000", "-ac", "2", mixPath]);
  run("ffmpeg", ["-y", "-i", picturePath, "-i", mixPath, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-t", String(plan.targetDurationSeconds), "-movflags", "+faststart", videoPath]);

  const reviewFrames = [];
  for (const [index, current] of plan.shots.entries()) {
    const path = resolve(reviewRoot, `${String(index + 1).padStart(2, "0")}.jpg`);
    run("ffmpeg", ["-y", "-ss", String((current.startSeconds + current.endSeconds) / 2), "-i", videoPath, "-frames:v", "1", "-q:v", "2", path]);
    reviewFrames.push(path);
  }
  run("ffmpeg", ["-y", "-framerate", "1", "-start_number", "1", "-i", resolve(reviewRoot, "%02d.jpg"), "-vf", "scale=384:-2,tile=5x2", "-frames:v", "1", "-q:v", "2", contactSheetPath]);

  run("ffmpeg", ["-v", "error", "-i", videoPath, "-f", "null", "-"]);
  const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_name,codec_type,width,height,sample_rate", "-of", "json", videoPath], { encoding: "utf8" }));
  const videoBytes = await readFile(videoPath);
  const manifest = {
    schemaVersion: 1,
    status: "creative-review-candidate",
    disclosure: "AI-generated OpenAI Cedar voiceover. Different Window is the Daniel-provided music master and supplies the full edit skeleton.",
    builtAt: new Date().toISOString(),
    plan: { relativePath: "submission/demo-film-beat-plan.json", sha256: sha256(planBytes), durationSeconds: plan.targetDurationSeconds, estimatedBpm: plan.music.estimatedBpm },
    music: { title: plan.music.title, authorization: plan.music.relativeAuthorization, sha256: sha256(musicBytes), fullMasterUsed: true },
    narration: { manifest: "outputs/demo-film-beat-narration/manifest.json", sha256: sha256(narrationBytes), provider: "OpenAI", model: narration.model, voice: narration.voice, disclosure: narration.disclosure },
    compositor: { engine: "hyperframes", version: "0.7.60", composition: "workshoplm-beat-cut", editGrammar: "song-phrase sections with hard-cut four-beat output flex" },
    siteBed: { site: "WorkshopLM Product Story Mockup", version: 6, commit: "63398efd970c34908e09274c2fb4643a7de22bc9", deployedUrl: "https://workshoplm-product-story.daniel-green.chatgpt.site" },
    sourceCapture: { relativePath: assets.walkthrough, sha256: sha256(await readFile(resolve(repository, assets.walkthrough))) },
    video: { relativePath: basename(videoPath), sha256: sha256(videoBytes), durationSeconds: Number(probe.format?.duration ?? 0), streams: probe.streams ?? [] },
    contactSheet: { relativePath: basename(contactSheetPath), sha256: sha256(await readFile(contactSheetPath)) },
    reviewFrames: await Promise.all(reviewFrames.map(async (path) => ({ relativePath: `review/${basename(path)}`, sha256: sha256(await readFile(path)) }))),
    shots: plan.shots.map((current) => ({ id: current.id, startSeconds: current.startSeconds, endSeconds: current.endSeconds, narrationSha256: sha256(Buffer.from(current.narration)) })),
    limitations: ["Creative review candidate only. It does not replace the rejected submission master until visual and audio review pass."],
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify({ video: videoPath, durationSeconds: manifest.video.durationSeconds, sha256: manifest.video.sha256, contactSheet: contactSheetPath }, null, 2)}\n`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : String(error));
  process.exitCode = 1;
});
