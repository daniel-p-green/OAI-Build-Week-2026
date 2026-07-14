import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);
const root = resolve(process.cwd(), ".workshoplm");
const video = resolve(root, "generated", "workshoplm-demo.mp4");
const outputDirectory = resolve(root, "submission");
const thumbnail = resolve(outputDirectory, "workshoplm-demo-thumbnail.png");
try { await stat(video); } catch { throw new Error("No rendered storyboard video exists. Run pnpm demo:render first."); }
await mkdir(outputDirectory, { recursive: true });
await exec("ffmpeg", ["-y", "-ss", "1", "-i", video, "-frames:v", "1", "-vf", "scale=1280:-2", thumbnail]);
const bytes = await readFile(thumbnail);
const metadata = { sourceVideo: "generated/workshoplm-demo.mp4", thumbnail: "submission/workshoplm-demo-thumbnail.png", sha256: createHash("sha256").update(bytes).digest("hex"), byteCount: bytes.length, generatedAt: new Date().toISOString() };
await writeFile(resolve(outputDirectory, "thumbnail.json"), `${JSON.stringify(metadata, null, 2)}\n`);
console.log(JSON.stringify(metadata));
