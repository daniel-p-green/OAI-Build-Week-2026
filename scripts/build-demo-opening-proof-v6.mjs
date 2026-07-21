import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

const repository = resolve(import.meta.dirname, "..");
const outputRoot = resolve(repository, "outputs/demo-film-v6-opening-proof");
const buildRoot = resolve(outputRoot, ".build");
const videoPath = resolve(outputRoot, "workshoplm-v6-opening-proof.mp4");
const mixPath = resolve(buildRoot, "opening-mix.wav");
const contactSheetPath = resolve(outputRoot, "contact-sheet.jpg");
const manifestPath = resolve(outputRoot, "manifest.json");
const musicPath = "/Users/danielgreen/Library/Mobile Documents/com~apple~CloudDocs/The Codex Rap - July 2026/Masters/Different Window (DOLBY).wav";
const voicePath = resolve(repository, "outputs/demo-film-local-review-v5/narration/why-capture.wav");
const expectedMusicHash = "c4a78f30fc3d962e899d21ed6adda321e185182b28dee5f6f359031c5becd14f";
const durationSeconds = 30;
const fps = 30;
const width = 1920;
const height = 1080;

const shots = [
  { id: "cover", start: 0, end: 4.365, image: "outputs/demo-film-highres/workshoplm-cover-native-4k-v3.png", zoom: 1.025, x: 0.5, y: 0.5 },
  { id: "source", start: 4.365, end: 9.845, image: "outputs/demo-recording-film-highres/stills-4k/02-sources.png", zoom: 1.055, x: 0.64, y: 0.48 },
  { id: "trace", start: 9.845, end: 16.695, image: "outputs/demo-recording-film-highres/stills-4k/03-source-trace.png", zoom: 1.07, x: 0.72, y: 0.43 },
  { id: "map", start: 16.695, end: 22.175, image: "outputs/demo-recording-film-highres/stills-4k/01-map.png", zoom: 1.055, x: 0.5, y: 0.5 },
  { id: "outputs", start: 22.175, end: 27.655, image: "outputs/demo-recording-film-highres/stills-4k/07-create-outputs.png", zoom: 1.045, x: 0.5, y: 0.43 },
  { id: "result", start: 27.655, end: 30, image: "outputs/demo-recording-film-highres/stills-4k/12-original-reveal.png", zoom: 1.035, x: 0.63, y: 0.48 },
];

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const run = (command, args) => execFileSync(command, command === "ffmpeg" ? ["-hide_banner", "-loglevel", "error", ...args] : args, { cwd: repository, stdio: "inherit" });

await rm(buildRoot, { recursive: true, force: true });
await mkdir(buildRoot, { recursive: true });

const musicBytes = await readFile(musicPath);
if (sha256(musicBytes) !== expectedMusicHash) throw new Error("Different Window master does not match the authorized hash.");

const segmentPaths = [];
for (const [index, shot] of shots.entries()) {
  const duration = shot.end - shot.start;
  const frames = Math.round(duration * fps);
  const increment = (shot.zoom - 1) / Math.max(frames - 1, 1);
  const segmentPath = resolve(buildRoot, `${String(index + 1).padStart(2, "0")}-${shot.id}.mp4`);
  const x = `(iw-iw/zoom)*${shot.x}`;
  const y = `(ih-ih/zoom)*${shot.y}`;
  run("ffmpeg", [
    "-y", "-loop", "1", "-i", resolve(repository, shot.image),
    "-vf", `zoompan=z='min(zoom+${increment.toFixed(9)},${shot.zoom})':x='${x}':y='${y}':d=${frames}:s=${width}x${height}:fps=${fps},format=yuv420p`,
    "-frames:v", String(frames), "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "15", segmentPath,
  ]);
  segmentPaths.push(segmentPath);
}

const concatPath = resolve(buildRoot, "segments.txt");
await writeFile(concatPath, `${segmentPaths.map((path) => `file '${path.replaceAll("'", "'\\''")}'`).join("\n")}\n`, "utf8");
const picturePath = resolve(buildRoot, "opening-picture.mp4");
run("ffmpeg", ["-y", "-f", "concat", "-safe", "0", "-i", concatPath, "-c", "copy", picturePath]);

// The original stereo master is preserved. Only manual gain automation is applied.
const musicGain = "if(lt(t,4.365),0.20,if(lt(t,16.1),0.26,if(lt(t,18.2),0.26+(t-16.1)*0.219048,0.72)))";
const rawMixPath = resolve(buildRoot, "opening-raw.wav");
run("ffmpeg", [
  "-y", "-i", musicPath, "-i", voicePath,
  "-filter_complex", `[0:a]aresample=48000,atrim=duration=${durationSeconds},asetpts=PTS-STARTPTS,volume='${musicGain}':eval=frame[music];[1:a]aresample=48000,pan=stereo|c0=c0|c1=c0,adelay=450|450,volume=1.08,apad=whole_dur=${durationSeconds},atrim=duration=${durationSeconds}[voice];[music][voice]amix=inputs=2:normalize=0,alimiter=limit=.93:attack=5:release=60[raw]`,
  "-map", "[raw]", "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", rawMixPath,
]);

const pass = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", rawMixPath, "-af", "loudnorm=I=-14.5:LRA=8:TP=-1.5:print_format=json", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 4_000_000 });
const stats = JSON.parse(pass.stderr.match(/\{[\s\S]*?\}/g)?.at(-1) ?? "{}");
const normalize = `loudnorm=I=-14.5:LRA=8:TP=-1.5:measured_I=${stats.input_i}:measured_LRA=${stats.input_lra}:measured_TP=${stats.input_tp}:measured_thresh=${stats.input_thresh}:offset=${stats.target_offset}:linear=true:print_format=json`;
run("ffmpeg", ["-y", "-i", rawMixPath, "-af", normalize, "-ar", "48000", "-ac", "2", "-c:a", "pcm_s24le", mixPath]);
run("ffmpeg", ["-y", "-i", picturePath, "-i", mixPath, "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-t", String(durationSeconds), "-movflags", "+faststart", videoPath]);
run("ffmpeg", ["-v", "error", "-i", videoPath, "-f", "null", "-"]);

const reviewRoot = resolve(outputRoot, "review");
await mkdir(reviewRoot, { recursive: true });
for (const [index, shot] of shots.entries()) {
  run("ffmpeg", ["-y", "-ss", String((shot.start + shot.end) / 2), "-i", videoPath, "-frames:v", "1", "-q:v", "2", resolve(reviewRoot, `${String(index + 1).padStart(2, "0")}.jpg`)]);
}
run("ffmpeg", ["-y", "-framerate", "1", "-start_number", "1", "-i", resolve(reviewRoot, "%02d.jpg"), "-vf", "scale=480:-2,tile=3x2:padding=5:margin=5:color=white", "-frames:v", "1", "-q:v", "2", contactSheetPath]);

const loudnessPass = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", mixPath, "-af", "loudnorm=I=-14.5:LRA=8:TP=-1.5:print_format=json", "-f", "null", "-"], { encoding: "utf8", maxBuffer: 4_000_000 });
const loudness = JSON.parse(loudnessPass.stderr.match(/\{[\s\S]*?\}/g)?.at(-1) ?? "{}");
const probe = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_name,codec_type,width,height,sample_rate,channels", "-of", "json", videoPath], { encoding: "utf8" }));
const manifest = {
  schemaVersion: 1,
  status: "local-opening-proof-human-review-only",
  externalPublishingAuthorized: false,
  creativeDirection: "Why-first OpenAI-style full-screen product proof with restrained focus moves and beat-grid hard cuts.",
  video: { relativePath: basename(videoPath), sha256: sha256(await readFile(videoPath)), durationSeconds: Number(probe.format.duration), streams: probe.streams, decodePassed: true },
  picture: { sourceResolution: "3840x2160", reviewResolution: `${width}x${height}`, shots, transitions: "hard cuts on the detected Different Window beat grid" },
  narration: { voice: "cedar", source: "outputs/demo-film-local-review-v5/narration/why-capture.wav", startSeconds: .45, addedDelayReverbChorusOrDoubling: false },
  music: { title: "Different Window", sourceMasterSha256: expectedMusicHash, processing: "Untouched stereo master with manual gain automation only.", gainAutomationExpression: musicGain, stemSeparationUsed: false },
  audio: { targetIntegratedLufs: -14.5, targetTruePeakDbtp: -1.5, measured: loudness },
  review: { contactSheet: basename(contactSheetPath), humanApprovalRequired: true },
};
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
process.stdout.write(`${JSON.stringify({ video: videoPath, durationSeconds: manifest.video.durationSeconds, sha256: manifest.video.sha256, loudness, contactSheet: contactSheetPath }, null, 2)}\n`);
