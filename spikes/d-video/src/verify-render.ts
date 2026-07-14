import { execFile } from "node:child_process";
import { access, mkdir, readFile, stat } from "node:fs/promises";
import { promisify } from "node:util";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { writeComposition } from "./build-composition.js";

const exec = promisify(execFile);
const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const assets = resolve(root, "assets");
const workspaceRoot = resolve(root, "../..");
const output = resolve(workspaceRoot, "artifacts/spikes/spike-d.mp4");

async function command(command: string, args: string[], cwd = root): Promise<string> {
  const { stdout, stderr } = await exec(command, args, { cwd, maxBuffer: 5_000_000 });
  return `${stdout}\n${stderr}`;
}

async function ensureFixtureAudio(): Promise<void> {
  await mkdir(assets, { recursive: true });
  for (const [index, frequency] of [440, 554, 659].entries()) {
    const path = resolve(assets, `narration-panel-${index + 1}.wav`);
    try { await access(path); } catch {
      await command("ffmpeg", ["-y", "-f", "lavfi", "-i", `sine=frequency=${frequency}:sample_rate=48000:duration=2`, "-ac", "1", path]);
    }
  }
}

async function main(): Promise<void> {
  const composition = await writeComposition();
  await ensureFixtureAudio();
  const projectHealth = await command("npx", ["hyperframes", "doctor"]);
  await command("npx", ["hyperframes", "lint", "."]);
  await command("npx", ["hyperframes", "validate", "."]);
  await command("npx", ["hyperframes", "inspect", "."]);
  await mkdir(resolve(workspaceRoot, "artifacts/spikes"), { recursive: true });
  await command("npx", ["hyperframes", "render", ".", "--output", output, "--workers", "1", "--quality", "draft"]);
  const probe = JSON.parse(await command("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=codec_type", "-of", "json", output])) as { format: { duration: string }; streams: Array<{ codec_type: string }> };
  const duration = Number(probe.format.duration);
  if (!probe.streams.some((stream) => stream.codec_type === "video") || !probe.streams.some((stream) => stream.codec_type === "audio")) throw new Error("Rendered MP4 must contain audio and video streams");
  if (Math.abs(duration - composition.durationSeconds) > 0.2) throw new Error(`Expected ${composition.durationSeconds}s render, received ${duration}s`);
  console.log(JSON.stringify({ renderer: "hyperframes", durationSeconds: duration, bytes: (await stat(output)).size, health: projectHealth.includes("✓ Chrome") ? "Chrome available" : "check doctor output", output }, null, 2));
}

void main();
