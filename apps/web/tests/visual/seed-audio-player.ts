import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { createHash } from "node:crypto";
import { generateAudioOverview, readWorkshopState, recordAudioOverviewAudio } from "../../../worker/src/workshop-service.ts";

function fixtureWav(seconds = 34, sampleRate = 24_000): Buffer {
  const samples = sampleRate * seconds;
  const dataSize = samples * 2;
  const bytes = Buffer.alloc(44 + dataSize);
  bytes.write("RIFF", 0); bytes.writeUInt32LE(36 + dataSize, 4); bytes.write("WAVE", 8);
  bytes.write("fmt ", 12); bytes.writeUInt32LE(16, 16); bytes.writeUInt16LE(1, 20); bytes.writeUInt16LE(1, 22);
  bytes.writeUInt32LE(sampleRate, 24); bytes.writeUInt32LE(sampleRate * 2, 28); bytes.writeUInt16LE(2, 32); bytes.writeUInt16LE(16, 34);
  bytes.write("data", 36); bytes.writeUInt32LE(dataSize, 40);
  return bytes;
}

async function main() {
  const root = resolve(process.argv[2] ?? "");
  const current = readWorkshopState(root).audioOverviews.find((overview) => !overview.stale) ?? generateAudioOverview(root).audioOverviews.at(-1)!;
  const relativePath = `generated/audio-overviews/${current.id}.wav`;
  const path = resolve(root, relativePath);
  const bytes = fixtureWav();
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, bytes);
  recordAudioOverviewAudio(current.id, { relativePath, sha256: createHash("sha256").update(bytes).digest("hex"), byteCount: bytes.length, durationSeconds: 34, model: "gpt-4o-mini-tts", voice: "cedar", instructions: "Visual fixture only", requestId: "visual-fixture", generatedAt: new Date().toISOString() }, root);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
