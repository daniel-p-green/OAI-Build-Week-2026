import { createHash } from "node:crypto";
import { execFile as execFileCallback } from "node:child_process";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);

export type FounderCaptureManifest = {
  schemaVersion: 1;
  recordedAt: string;
  recording: { sourceName: string; relativePath: string; sha256: string; byteCount: number; durationSeconds: number; videoCodec?: string; audioCodec?: string };
  transcript: { sourceName: string; relativePath: string; sha256: string; byteCount: number; characterCount: number };
  provenance: "founder-provided-recording-and-transcript";
  providerRealtimeEvidence: false;
};

type ProbeResult = { format?: { duration?: string }; streams?: Array<{ codec_type?: string; codec_name?: string }> };
type Probe = (path: string) => Promise<ProbeResult>;

const defaultProbe: Probe = async (path) => {
  const { stdout } = await execFile("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-show_entries", "stream=codec_type,codec_name", "-of", "json", path], { maxBuffer: 2_000_000 });
  return JSON.parse(stdout) as ProbeResult;
};

function sha256(bytes: Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

export function validateFounderTranscript(raw: string): string {
  const text = raw.replaceAll("\r\n", "\n").trim();
  if (text.includes("\0")) throw new Error("Founder transcript contains invalid null bytes.");
  if (text.length < 40) throw new Error("Founder transcript must contain at least 40 characters of real spoken content.");
  if (text.length > 100_000) throw new Error("Founder transcript exceeds the 100,000 character demo limit.");
  return text;
}

export async function inspectFounderCapture(recordingPath: string, transcriptPath: string, probe: Probe = defaultProbe): Promise<{ recordingPath: string; transcriptPath: string; recordingBytes: Buffer; transcriptBytes: Buffer; transcript: string; durationSeconds: number; videoCodec?: string; audioCodec?: string }> {
  const recording = resolve(recordingPath);
  const transcriptFile = resolve(transcriptPath);
  if (recording === transcriptFile) throw new Error("Founder recording and transcript must be separate files.");
  const [recordingInfo, transcriptInfo] = await Promise.all([stat(recording), stat(transcriptFile)]);
  if (!recordingInfo.isFile() || !transcriptInfo.isFile()) throw new Error("Founder recording and transcript must both be regular files.");
  const [recordingBytes, transcriptBytes, media] = await Promise.all([readFile(recording), readFile(transcriptFile), probe(recording)]);
  const transcript = validateFounderTranscript(transcriptBytes.toString("utf8"));
  const durationSeconds = Number(media.format?.duration);
  const videoCodec = media.streams?.find((stream) => stream.codec_type === "video")?.codec_name;
  const audioCodec = media.streams?.find((stream) => stream.codec_type === "audio")?.codec_name;
  if (!Number.isFinite(durationSeconds) || durationSeconds < 3) throw new Error("Founder recording must contain at least three seconds of media.");
  if (!videoCodec || !audioCodec) throw new Error("Founder recording must contain both a video stream and an audio stream.");
  return { recordingPath: recording, transcriptPath: transcriptFile, recordingBytes, transcriptBytes: Buffer.from(`${transcript}\n`), transcript, durationSeconds, videoCodec, audioCodec };
}

export async function stageFounderCapture(input: Awaited<ReturnType<typeof inspectFounderCapture>>, root: string): Promise<FounderCaptureManifest> {
  const evidenceRoot = join(resolve(root), "evidence", "founder-capture");
  await mkdir(evidenceRoot, { recursive: true });
  const recordingExtension = extname(input.recordingPath).toLowerCase() || ".mov";
  const recordingRelativePath = join("evidence", "founder-capture", `founder-brainstorm${recordingExtension}`);
  const transcriptRelativePath = join("evidence", "founder-capture", "founder-brainstorm.txt");
  await copyFile(input.recordingPath, join(resolve(root), recordingRelativePath));
  await writeFile(join(resolve(root), transcriptRelativePath), input.transcriptBytes);
  const manifest: FounderCaptureManifest = {
    schemaVersion: 1,
    recordedAt: new Date().toISOString(),
    recording: { sourceName: basename(input.recordingPath), relativePath: recordingRelativePath, sha256: sha256(input.recordingBytes), byteCount: input.recordingBytes.byteLength, durationSeconds: input.durationSeconds, videoCodec: input.videoCodec, audioCodec: input.audioCodec },
    transcript: { sourceName: basename(input.transcriptPath), relativePath: transcriptRelativePath, sha256: sha256(input.transcriptBytes), byteCount: input.transcriptBytes.byteLength, characterCount: input.transcript.length },
    provenance: "founder-provided-recording-and-transcript",
    providerRealtimeEvidence: false,
  };
  await writeFile(join(evidenceRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

export async function stageFounderFilmInputs(input: Awaited<ReturnType<typeof inspectFounderCapture>>, outputDirectory: string): Promise<FounderCaptureManifest> {
  const output = resolve(outputDirectory);
  await mkdir(output, { recursive: true });
  const recordingRelativePath = "founder-brainstorm.mov";
  const transcriptRelativePath = "founder-brainstorm.txt";
  await writeFile(join(output, recordingRelativePath), input.recordingBytes);
  await writeFile(join(output, transcriptRelativePath), input.transcriptBytes);
  const manifest: FounderCaptureManifest = {
    schemaVersion: 1,
    recordedAt: new Date().toISOString(),
    recording: { sourceName: basename(input.recordingPath), relativePath: recordingRelativePath, sha256: sha256(input.recordingBytes), byteCount: input.recordingBytes.byteLength, durationSeconds: input.durationSeconds, videoCodec: input.videoCodec, audioCodec: input.audioCodec },
    transcript: { sourceName: basename(input.transcriptPath), relativePath: transcriptRelativePath, sha256: sha256(input.transcriptBytes), byteCount: input.transcriptBytes.byteLength, characterCount: input.transcript.length },
    provenance: "founder-provided-recording-and-transcript",
    providerRealtimeEvidence: false,
  };
  await writeFile(join(output, "founder-capture.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}
