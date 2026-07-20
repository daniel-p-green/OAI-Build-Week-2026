import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { inspectFounderCapture, stageFounderCapture, stageFounderFilmInputs, validateFounderTranscript } from "./founder-capture.js";

const roots: string[] = [];
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });

describe("founder capture evidence", () => {
  it("stages hash-bound recording and transcript evidence without claiming Realtime", async () => {
    const root = await mkdtemp(join(tmpdir(), "workshop-founder-")); roots.push(root);
    const recording = join(root, "brainstorm.mov");
    const transcript = join(root, "brainstorm.txt");
    await writeFile(recording, "recording-bytes");
    await writeFile(transcript, "This is the founder's real spoken brainstorm for the final WorkshopLM demonstration.");
    const inspected = await inspectFounderCapture(recording, transcript, async () => ({ format: { duration: "42.5" }, streams: [{ codec_type: "video", codec_name: "h264" }, { codec_type: "audio", codec_name: "aac" }] }));
    const output = join(root, "output");
    const manifest = await stageFounderCapture(inspected, output);
    expect(manifest).toMatchObject({ provenance: "founder-provided-recording-and-transcript", providerRealtimeEvidence: false, recordedAtEvidence: "file_modified_time", stagedAt: expect.any(String), recording: { durationSeconds: 42.5, videoCodec: "h264", audioCodec: "aac" }, transcript: { characterCount: expect.any(Number) } });
    expect(await readFile(join(output, manifest.transcript.relativePath), "utf8")).toContain("founder's real spoken brainstorm");
    expect(JSON.parse(await readFile(join(output, "evidence/founder-capture/manifest.json"), "utf8"))).toEqual(manifest);
    const film = await stageFounderFilmInputs(inspected, join(root, "film-inputs"));
    expect(await readFile(join(root, "film-inputs/founder-brainstorm.mov"), "utf8")).toBe("recording-bytes");
    expect(JSON.parse(await readFile(join(root, "film-inputs/founder-capture.json"), "utf8"))).toEqual(film);
  });

  it("fails closed for short text or media missing either stream", async () => {
    expect(() => validateFounderTranscript("too short")).toThrow(/at least 40/);
    const root = await mkdtemp(join(tmpdir(), "workshop-founder-invalid-")); roots.push(root);
    const recording = join(root, "brainstorm.mov");
    const transcript = join(root, "brainstorm.txt");
    await writeFile(recording, "recording-bytes");
    await writeFile(transcript, "This transcript is long enough to pass the content-length validation boundary.");
    await expect(inspectFounderCapture(recording, transcript, async () => ({ format: { duration: "10" }, streams: [{ codec_type: "video", codec_name: "h264" }] }))).rejects.toThrow(/video stream and an audio stream/);
  });

  it("prefers embedded media creation time and labels its timestamp evidence", async () => {
    const root = await mkdtemp(join(tmpdir(), "workshop-founder-time-")); roots.push(root);
    const recording = join(root, "brainstorm.mov");
    const transcript = join(root, "brainstorm.txt");
    await writeFile(recording, "recording-bytes");
    await writeFile(transcript, "This is the founder's timestamped spoken brainstorm for the final demonstration.");
    const inspected = await inspectFounderCapture(recording, transcript, async () => ({ format: { duration: "12", tags: { creation_time: "2026-07-16T08:15:30-05:00" } }, streams: [{ codec_type: "video", codec_name: "h264" }, { codec_type: "audio", codec_name: "aac" }] }));
    expect(inspected).toMatchObject({ recordedAt: "2026-07-16T13:15:30.000Z", recordedAtEvidence: "embedded_media_creation_time" });
  });

  it("labels a founder-authorized script narrated by AI without treating it as founder voice", async () => {
    const root = await mkdtemp(join(tmpdir(), "workshop-founder-tts-")); roots.push(root);
    const recording = join(root, "brainstorm.mov");
    const transcript = join(root, "brainstorm.txt");
    await writeFile(recording, "recording-bytes");
    await writeFile(transcript, "This founder-authorized project script is narrated with a disclosed AI-generated voice.");
    const inspected = await inspectFounderCapture(recording, transcript, async () => ({ format: { duration: "9" }, streams: [{ codec_type: "video", codec_name: "h264" }, { codec_type: "audio", codec_name: "aac" }] }));
    const manifest = await stageFounderCapture(inspected, join(root, "output"), "founder-authorized-script-and-ai-narration");
    expect(manifest).toMatchObject({ provenance: "founder-authorized-script-and-ai-narration", providerRealtimeEvidence: false });
  });
});
