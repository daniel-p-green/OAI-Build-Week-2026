import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readWorkshopState, recordAudioOverviewAudio } from "../apps/worker/src/workshop-service.ts";

type JudgeAudioEvidence = {
  id: string;
  title: string;
  script: string;
  sections: Array<{ id: string; title: string; text: string; evidence: Array<{ claimId?: string; sourceId: string; chunkId?: string; locator: string }> }>;
  claimIds: string[];
  disclosure: "AI-generated voice";
  audio: {
    relativePath: string;
    sha256: string;
    byteCount: number;
    durationSeconds: number;
    model: "gpt-4o-mini-tts";
    voice: "cedar";
    instructions: string;
    requestId: string;
    generatedAt: string;
  };
  downloadedSha256: string;
};

const repository = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const evidencePath = resolve(repository, "artifacts", "live-review", "audio-overview.json");
const audioPath = resolve(repository, "artifacts", "live-review", "audio-overview.wav");

function sameValues(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export async function seedJudgeProviderAudio(root: string): Promise<void> {
  const evidence = JSON.parse(await readFile(evidencePath, "utf8")) as JudgeAudioEvidence;
  const overview = readWorkshopState(root).audioOverviews.at(-1);
  if (!overview || overview.stale || overview.id !== evidence.id || overview.title !== evidence.title || overview.script !== evidence.script || overview.disclosure !== evidence.disclosure) {
    throw new Error("Provider-backed judge Audio Overview does not match the current grounded script.");
  }
  const currentSections = overview.sections.map(({ id, title, text, evidence: references }) => ({ id, title, text, evidence: references }));
  const recordedSections = evidence.sections.map(({ id, title, text, evidence: references }) => ({ id, title, text, evidence: references }));
  if (!sameValues(overview.claimIds, evidence.claimIds) || !sameValues(currentSections, recordedSections)) {
    throw new Error("Provider-backed judge Audio Overview source edges do not match the current grounded script.");
  }
  if (evidence.audio.model !== "gpt-4o-mini-tts" || evidence.audio.voice !== "cedar" || evidence.audio.requestId.length === 0 || evidence.audio.durationSeconds <= 0 || evidence.downloadedSha256 !== evidence.audio.sha256) {
    throw new Error("Provider-backed judge Audio Overview provenance is incomplete.");
  }

  const bytes = await readFile(audioPath);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  if (sha256 !== evidence.audio.sha256 || bytes.length !== evidence.audio.byteCount || bytes.subarray(0, 4).toString("ascii") !== "RIFF" || bytes.subarray(8, 12).toString("ascii") !== "WAVE") {
    throw new Error("Provider-backed judge Audio Overview bytes failed integrity validation.");
  }

  const relativePath = `generated/audio-overviews/${evidence.id}.wav`;
  await mkdir(resolve(root, "generated", "audio-overviews"), { recursive: true });
  await copyFile(audioPath, resolve(root, relativePath));
  recordAudioOverviewAudio(evidence.id, { ...evidence.audio, relativePath }, root);
}
