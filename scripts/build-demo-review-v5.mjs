import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const outputRoot = resolve(repository, "outputs/demo-film-local-review-v5");
const buildRoot = resolve(outputRoot, ".build");
const compositionRoot = resolve(buildRoot, "hyperframes");
const assetsRoot = resolve(compositionRoot, "assets");
const reviewRoot = resolve(outputRoot, "review");
const planPath = resolve(repository, "submission/demo-film-v5-plan.json");
const narrationManifestPath = resolve(outputRoot, "narration/manifest.json");
const workflowPath = resolve(repository, "outputs/demo-recording-film/workshoplm-film-workflow.webm");
const musicPath = "/Users/danielgreen/Library/Mobile Documents/com~apple~CloudDocs/The Codex Rap - July 2026/Masters/Different Window (DOLBY).wav";
const providerVideoPath = resolve(repository, "outputs/demo-film-inputs/provider-narrated-video.mp4");
const basePicturePath = resolve(buildRoot, "product-base.mp4");
const picturePath = resolve(buildRoot, "picture.mp4");
const narrationPath = resolve(buildRoot, "dry-narration.wav");
const rawMixPath = resolve(buildRoot, "raw-mix.wav");
const mixPath = resolve(buildRoot, "final-mix.wav");
const videoPath = resolve(outputRoot, "workshoplm-demo-review-v5.mp4");
const manifestPath = resolve(outputRoot, "manifest.json");
const contactSheetPath = resolve(outputRoot, "contact-sheet.jpg");
const hyperframesCli = resolve(repository, "node_modules/hyperframes/dist/cli.js");
const gsapPath = resolve(repository, "apps/worker/node_modules/gsap/dist/gsap.min.js");
const durationSeconds = 158.592;
const reusePicture = process.argv.includes("--reuse-picture");

const showcaseAssets = [
  "outputs/workshoplm-current-ui/08-current-outputs.png",
  "outputs/workshoplm-current-ui/09-presentation.png",
  "outputs/final-submission-output-set/thumbnail-result.png",
  "outputs/final-submission-output-set/images/panel-2.png",
  "outputs/final-submission-output-set/images/panel-4.png",
  "outputs/final-submission-output-set/images/panel-5.png"
];

function run(command, args) {
  execFileSync(command, command === "ffmpeg" ? ["-hide_banner", "-loglevel", "error", ...args] : args, { cwd: repository, stdio: "inherit" });
}

function captured(command, args, label) {
  try {
    execFileSync(command, args, { cwd: repository, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", maxBuffer: 12_000_000 });
    process.stdout.write(`${label} passed.\n`);
  } catch (error) {
    process.stderr.write(`${String(error?.stderr ?? error?.stdout ?? error).slice(-12000)}\n`);
    throw error;
  }
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const esc = (value) => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function trim(input, start, end, target, label) {
  const ratio = target / (end - start);
  return `[${input}:v]trim=start=${start}:end=${end},setpts=(PTS-STARTPTS)*${ratio.toFixed(8)},scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:#f2f2ef,setsar=1,fps=30[${label}]`;
}

function compositionHtml(plan) {
  const sections = plan.sections.filter((section) => section.id !== "codex-gpt").map((section, index) => {
    const duration = Math.min(4.1, section.endSeconds - section.startSeconds - .3);
    return `<aside id="label-${section.id}" class="clip label" data-start="${(section.startSeconds + .35).toFixed(3)}" data-duration="${duration.toFixed(3)}" data-track-index="${5 + index}"><span>${String(index + 1).padStart(2, "0")}</span><b>${esc(section.label)}</b></aside>`;
  }).join("");
  const transitions = plan.sections.slice(1).map((section, index) => `<div id="transition-${index}" class="clip transition" data-start="${(section.startSeconds - .16).toFixed(3)}" data-duration=".32" data-track-index="${20 + index}"></div>`).join("");
  const outputMontage = `
    <section id="output-stage" class="clip output-stage" data-start="102.994" data-duration="17.819" data-track-index="40">
      <div class="output-copy"><span>CREATED WORK</span><h2>One direction.<br>Seven expressions.</h2></div>
      <div class="output-grid">
        <figure id="out-a"><img src="assets/09-presentation.png"><figcaption>Presentation</figcaption></figure>
        <figure id="out-b"><img src="assets/thumbnail-result.png"><figcaption>Infographic</figcaption></figure>
        <figure id="out-c"><img src="assets/panel-2.png"><figcaption>Image set</figcaption></figure>
        <figure id="out-d"><img src="assets/panel-4.png"><figcaption>Storyboard</figcaption></figure>
        <figure id="out-e"><img src="assets/panel-5.png"><figcaption>Video</figcaption></figure>
      </div>
    </section>`;
  const proof = `
    <section id="build-proof" class="clip proof" data-start="137.253" data-duration="10.960" data-track-index="41">
      <div class="proof-mark">W</div>
      <div class="proof-copy"><span>HOW IT WAS BUILT</span><h2>Codex built it.<br>GPT-5.6 runs the Map.</h2><p>A traced implementation record, a real model request, and a local acceptance path.</p></div>
      <div class="proof-cards">
        <article><span>CODEX + GPT-5.6</span><b>Built · tested · corrected</b><code>019f5eb9…a324</code></article>
        <article><span>GPT-5.6 TERRA</span><b>Source → grounded Map</b><code>req_535ae2…c220</code></article>
      </div>
    </section>`;
  const motion = plan.sections.map((section, index) => {
    const fromScale = Math.max(1, section.focus.scale - .035);
    const settle = Math.min(2.4, (section.endSeconds - section.startSeconds) * .18);
    return `tl.set("#screen-inner",{scale:${fromScale},x:${section.focus.x * .78},y:${section.focus.y * .78}},${section.startSeconds.toFixed(3)});tl.to("#screen-inner",{scale:${section.focus.scale},x:${section.focus.x},y:${section.focus.y},duration:${settle.toFixed(3)},ease:"power3.out"},${section.startSeconds.toFixed(3)});`;
  }).join("");
  const labels = plan.sections.filter((section) => section.id !== "codex-gpt").map((section) => `tl.fromTo("#label-${section.id}",{y:14,opacity:0,scale:.985},{y:0,opacity:1,scale:1,duration:.5,ease:"power3.out"},${(section.startSeconds + .42).toFixed(3)});`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><script src="gsap.min.js"></script><style>
  *{box-sizing:border-box}html,body,main{margin:0;width:1280px;height:720px;overflow:hidden;background:#e9e9e5;color:#0d0d0d;font-family:Inter,Arial,sans-serif}.clip{visibility:hidden}.stage{position:absolute;inset:0;background:radial-gradient(circle at 50% 10%,#fff 0,#eeeeea 62%,#e2e2de 100%)}.frame{position:absolute;inset:22px;border-radius:22px;overflow:hidden;background:white;box-shadow:0 30px 75px rgba(12,14,18,.22),0 2px 12px rgba(12,14,18,.12);border:1px solid rgba(13,13,13,.11)}#screen-inner{position:absolute;inset:0;transform-origin:50% 50%;will-change:transform}.base{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}.label{position:absolute;z-index:6;left:52px;top:50px;display:flex;align-items:center;gap:12px;padding:10px 15px 10px 10px;border:1px solid rgba(13,13,13,.1);border-radius:14px;background:rgba(255,255,255,.93);box-shadow:0 12px 36px rgba(13,13,13,.14);backdrop-filter:blur(14px)}.label span{display:grid;place-items:center;width:28px;height:28px;border-radius:9px;background:#0285ff;color:#fff;font-size:10px;font-weight:800}.label b{font-size:14px;letter-spacing:-.018em}.transition{position:absolute;z-index:30;inset:0;background:linear-gradient(90deg,transparent 0%,rgba(255,255,255,.12) 30%,rgba(255,255,255,.96) 47%,#0285ff 50%,rgba(255,255,255,.96) 53%,rgba(255,255,255,.12) 70%,transparent 100%);transform:translateX(-102%)}.output-stage{position:absolute;z-index:9;inset:22px;border-radius:22px;overflow:hidden;background:#f7f7f4;padding:44px 48px}.output-copy{position:absolute;left:48px;top:45px}.output-copy span,.proof-copy span{color:#0285ff;font-size:10px;font-weight:800;letter-spacing:.14em}.output-copy h2{margin:10px 0 0;font-size:39px;line-height:.98;letter-spacing:-.055em}.output-grid{position:absolute;left:373px;right:40px;top:42px;bottom:40px;display:grid;grid-template-columns:1.15fr .85fr 1fr;grid-template-rows:1fr 1fr;gap:14px;will-change:transform}.output-grid figure{margin:0;position:relative;overflow:hidden;border-radius:16px;background:white;border:1px solid #dfdfda;box-shadow:0 16px 34px rgba(13,13,13,.09)}.output-grid figure:first-child{grid-row:1/3}.output-grid img{width:100%;height:100%;object-fit:cover;will-change:transform}.output-grid figcaption{position:absolute;left:12px;bottom:10px;padding:6px 9px;border-radius:8px;background:rgba(13,13,13,.86);color:#fff;font-size:10px;font-weight:700}.proof{position:absolute;z-index:14;inset:0;background:#0d0d0d;color:white;padding:58px 64px}.proof-mark{position:absolute;right:54px;top:45px;width:54px;height:54px;display:grid;place-items:center;border-radius:16px;background:#0285ff;font-size:26px;font-weight:850}.proof-copy{max-width:650px}.proof-copy h2{margin:12px 0 16px;font-size:52px;line-height:.94;letter-spacing:-.06em}.proof-copy p{max-width:560px;color:#a9aaa5;font-size:15px;line-height:1.45}.proof-cards{position:absolute;left:64px;right:64px;bottom:52px;display:grid;grid-template-columns:1fr 1fr;gap:14px}.proof-cards article{padding:20px 22px;border:1px solid #2f312f;border-radius:15px;background:#171817}.proof-cards span{display:block;margin-bottom:12px;color:#68b5ff;font-size:9px;font-weight:800;letter-spacing:.13em}.proof-cards b{display:block;font-size:19px;letter-spacing:-.025em}.proof-cards code{display:block;margin-top:18px;color:#8e918c;font-size:11px}
  </style></head><body><main data-composition-id="workshoplm-v5" data-start="0" data-duration="${durationSeconds}" data-width="1280" data-height="720" data-fps="30"><div class="stage"></div><div class="frame"><div id="screen-inner"><video id="product-demo" class="clip base" src="assets/product-base.mp4" muted playsinline data-start="0" data-duration="${durationSeconds}" data-track-index="0"></video></div></div>${sections}${outputMontage}${proof}${transitions}</main><script>window.__timelines=window.__timelines||{};const tl=gsap.timeline({paused:true});${motion}${labels}tl.fromTo("#output-stage",{opacity:0,scale:.985},{opacity:1,scale:1,duration:.55,ease:"power3.out"},102.994);tl.fromTo("#output-copy",{x:-16,opacity:0},{x:0,opacity:1,duration:.6,ease:"power3.out"},103.12);tl.fromTo("#output-grid figure",{y:24,opacity:0},{y:0,opacity:1,duration:.58,stagger:.13,ease:"power3.out"},103.35);tl.to("#output-grid",{x:-12,y:-6,scale:1.025,duration:16.7,ease:"none"},103.55);tl.to("#out-a img",{scale:1.07,duration:4.1,ease:"none"},103.6);tl.to("#out-b img",{scale:1.08,duration:4.1,ease:"none"},107.7);tl.to("#out-c img",{scale:1.08,duration:4.1,ease:"none"},111.8);tl.to("#out-d img",{scale:1.08,duration:4.1,ease:"none"},115.9);tl.fromTo("#build-proof .proof-copy",{y:18,opacity:0},{y:0,opacity:1,duration:.6,ease:"power3.out"},137.42);tl.fromTo("#build-proof .proof-cards article",{y:20,opacity:0},{y:0,opacity:1,duration:.55,stagger:.14,ease:"power3.out"},138.05);${plan.sections.slice(1).map((section,index)=>`tl.fromTo("#transition-${index}",{xPercent:-102},{xPercent:102,duration:.32,ease:"power2.inOut"},${(section.startSeconds-.16).toFixed(3)});`).join("")}window.__timelines["workshoplm-v5"]=tl;</script></body></html>`;
}

if (!reusePicture) await rm(buildRoot, { recursive: true, force: true });
await mkdir(assetsRoot, { recursive: true });
await mkdir(reviewRoot, { recursive: true });
const [planBytes, narrationBytes, workflowBytes, musicBytes] = await Promise.all([readFile(planPath), readFile(narrationManifestPath), readFile(workflowPath), readFile(musicPath)]);
const plan = JSON.parse(planBytes.toString("utf8"));
const narration = JSON.parse(narrationBytes.toString("utf8"));
if (sha256(musicBytes) !== plan.music.sha256) throw new Error("The Different Window master does not match the locked authorized hash.");

if (!reusePicture) {
const filters = [
  trim(0, .995, 9.796, 16.695, "why"),
  trim(0, 9.796, 31.981, 27.4, "capture"),
  trim(0, .995, 9.796, 13.119, "mapa"),
  trim(0, 25.965, 31.981, 8.8, "mapb"),
  trim(0, 18.668, 25.942, 8.2, "sourcea"),
  trim(0, 56.566, 63.422, 8.24, "sourceb"),
  trim(0, 32.001, 40.043, 9.0, "approvala"),
  trim(0, 71.152, 77.556, 7.44, "approvalb"),
  trim(0, 46.9, 63.422, 21.919, "outputs"),
  trim(0, 63.467, 88.064, 16.44, "render"),
  trim(0, .995, 9.796, 10.96, "proofbase"),
  trim(0, 88.064, 100.083, 10.379, "close"),
  "[mapa][mapb]concat=n=2:v=1:a=0[map]",
  "[sourcea][sourceb]concat=n=2:v=1:a=0[source]",
  "[approvala][approvalb]concat=n=2:v=1:a=0[approvals]",
  `[why][capture][map][source][approvals][outputs][render][proofbase][close]concat=n=9:v=1:a=0,trim=duration=${durationSeconds},fps=30,format=yuv420p[picture]`
];
run("ffmpeg", ["-y", "-i", workflowPath, "-filter_complex", filters.join(";"), "-map", "[picture]", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-movflags", "+faststart", basePicturePath]);

await copyFile(basePicturePath, resolve(assetsRoot, basename(basePicturePath)));
await copyFile(gsapPath, resolve(compositionRoot, "gsap.min.js"));
for (const relativePath of showcaseAssets) await copyFile(resolve(repository, relativePath), resolve(assetsRoot, basename(relativePath)));
await copyFile(providerVideoPath, resolve(assetsRoot, basename(providerVideoPath)));
await writeFile(resolve(compositionRoot, "index.html"), compositionHtml(plan), "utf8");
captured(process.execPath, [hyperframesCli, "lint", compositionRoot, "--json"], "HyperFrames lint");
captured(process.execPath, [hyperframesCli, "check", compositionRoot, "--json", "--samples", "20", "--max-issues", "40", "--no-contrast"], "HyperFrames check");
captured(process.execPath, [hyperframesCli, "inspect", compositionRoot, "--json"], "HyperFrames inspect");
captured(process.execPath, [hyperframesCli, "render", compositionRoot, "--output", picturePath, "--workers", "1", "--quality", "high"], "HyperFrames render");
}

const voiceInputs = narration.acts.flatMap((act) => ["-i", resolve(repository, act.relativePath)]);
const voiceFilters = narration.acts.map((act, index) => `[${index}:a]aresample=48000,pan=stereo|c0=c0|c1=c0,adelay=${Math.round(act.startSeconds * 1000)}|${Math.round(act.startSeconds * 1000)},apad=whole_dur=${durationSeconds}[v${index}]`);
voiceFilters.push(`${narration.acts.map((_, index) => `[v${index}]`).join("")}amix=inputs=${narration.acts.length}:normalize=0,atrim=duration=${durationSeconds},afade=t=in:st=0:d=0.015,afade=t=out:st=158.42:d=0.16[voice]`);
run("ffmpeg", ["-y", ...voiceInputs, "-filter_complex", voiceFilters.join(";"), "-map", "[voice]", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", narrationPath]);

// Manual gain rides only. The original stereo master is never stemmed, filtered, pitch-shifted, or time-stretched.
const musicGain = "if(lt(t,4.4),0.24,if(lt(t,16.1),0.31,if(lt(t,17.5),0.31+(t-16.1)*0.314286,if(lt(t,43.7),0.75,if(lt(t,44.35),0.75-(t-43.7)*0.661538,if(lt(t,59.45),0.32,if(lt(t,60.75),0.32+(t-59.45)*0.330769,if(lt(t,82.1),0.75,if(lt(t,82.75),0.75-(t-82.1)*0.676923,if(lt(t,103.85),0.31,if(lt(t,105.25),0.31+(t-103.85)*0.335714,if(lt(t,120.45),0.78,if(lt(t,121.1),0.78-(t-120.45)*0.707692,if(lt(t,135.65),0.32,if(lt(t,136.85),0.32+(t-135.65)*0.275,if(lt(t,137.55),0.65-(t-136.85)*0.5,if(lt(t,153.9),0.30,if(lt(t,155.4),0.30+(t-153.9)*0.366667,0.85))))))))))))))))))";
run("ffmpeg", ["-y", "-i", musicPath, "-i", narrationPath, "-filter_complex", `[0:a]aresample=48000,atrim=duration=${durationSeconds},asetpts=PTS-STARTPTS,volume='${musicGain}':eval=frame[music];[1:a]aresample=48000,volume=1.0[voice];[music][voice]amix=inputs=2:weights='1 1':normalize=0,alimiter=limit=.93:attack=5:release=60[raw]`, "-map", "[raw]", "-t", String(durationSeconds), "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", rawMixPath]);

const pass = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", rawMixPath, "-af", "loudnorm=I=-14.5:LRA=8:TP=-1.5:print_format=json", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 4_000_000 });
const stats = JSON.parse(pass.stderr.match(/\{[\s\S]*?\}/g)?.at(-1) ?? "{}");
const normalize = `loudnorm=I=-14.5:LRA=8:TP=-1.5:measured_I=${stats.input_i}:measured_LRA=${stats.input_lra}:measured_TP=${stats.input_tp}:measured_thresh=${stats.input_thresh}:offset=${stats.target_offset}:linear=true:print_format=json`;
run("ffmpeg", ["-y", "-i", rawMixPath, "-af", normalize, "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", mixPath]);
run("ffmpeg", ["-y", "-i", picturePath, "-i", mixPath, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-t", String(durationSeconds), "-movflags", "+faststart", videoPath]);
run("ffmpeg", ["-v", "error", "-i", videoPath, "-f", "null", "-"]);

const reviewFrames = [];
for (const [index, section] of plan.sections.entries()) {
  const path = resolve(reviewRoot, `${String(index + 1).padStart(2, "0")}.jpg`);
  run("ffmpeg", ["-y", "-ss", String((section.startSeconds + section.endSeconds) / 2), "-i", videoPath, "-frames:v", "1", "-q:v", "2", path]);
  reviewFrames.push(path);
}
run("ffmpeg", ["-y", "-framerate", "1", "-start_number", "1", "-i", resolve(reviewRoot, "%02d.jpg"), "-vf", "scale=384:-2,tile=5x2:padding=4:margin=4:color=white", "-frames:v", "1", "-q:v", "2", contactSheetPath]);
const finalLoudnessPass = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", mixPath, "-af", "loudnorm=I=-14.5:LRA=8:TP=-1.5:print_format=json", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 4_000_000 });
const loudness = JSON.parse(finalLoudnessPass.stderr.match(/\{[\s\S]*?\}/g)?.at(-1) ?? "{}");
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_name,codec_type,width,height,sample_rate,channels", "-of", "json", videoPath], { encoding: "utf8" }));
const manifest = {
  schemaVersion: 1,
  status: "local-human-review-only",
  externalPublishingAuthorized: false,
  builtAt: new Date().toISOString(),
  creativeDirection: plan.creativeDirection,
  picture: { sourceCaptureSha256: sha256(workflowBytes), hyperframes: true, screenStudioStyleFocusMoves: true, realProductFirst: true, titleCardSeconds: 0 },
  narration: { model: narration.model, voice: narration.voice, disclosure: narration.disclosure, manifestSha256: sha256(narrationBytes), acts: narration.acts, addedDelayReverbChorusOrDoubling: false },
  music: { title: plan.music.title, sourceMasterSha256: sha256(musicBytes), processing: plan.music.processing, gainAutomationExpression: musicGain, stemSeparationUsed: false },
  audio: { targetIntegratedLufs: -14.5, targetTruePeakDbtp: -1.5, measured: loudness },
  video: { relativePath: basename(videoPath), sha256: sha256(await readFile(videoPath)), durationSeconds: Number(probe.format.duration), streams: probe.streams, decodePassed: true },
  review: { contactSheet: basename(contactSheetPath), humanApprovalRequired: true }
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ video: videoPath, sha256: manifest.video.sha256, durationSeconds: manifest.video.durationSeconds, loudness, contactSheet: contactSheetPath }, null, 2)}\n`);
