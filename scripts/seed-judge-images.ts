import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { readWorkshopState, recordGeneratedImagePanel } from "../apps/worker/src/workshop-service.ts";

type JudgeImageManifest = {
  model: "gpt-image-2";
  quality: "medium";
  size: "1024x1024";
  referenceId: string;
  panels: Array<{ id: string; file: string; sha256: string; requestId: string; generatedAt: string }>;
};

const repository = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = resolve(repository, "fixtures", "judge-provider-images");

export async function seedJudgeProviderImages(root: string): Promise<void> {
  const manifest = JSON.parse(await readFile(resolve(fixtureRoot, "manifest.json"), "utf8")) as JudgeImageManifest;
  const batch = readWorkshopState(root).imageBatch;
  if (!batch || manifest.panels.length !== 6 || manifest.referenceId !== batch.referenceId || new Set(manifest.panels.map((panel) => panel.id)).size !== 6) {
    throw new Error("Provider-backed judge image manifest does not match the planned coherent image set.");
  }
  await mkdir(resolve(root, "generated", "images"), { recursive: true });
  for (const panel of manifest.panels) {
    if (!batch.panels.some((candidate) => candidate.id === panel.id) || !/^image-panel-[1-6]-v1\.png$/.test(panel.file)) {
      throw new Error(`Unknown provider-backed judge image: ${panel.id}.`);
    }
    const fixturePath = resolve(fixtureRoot, panel.file);
    const bytes = await readFile(fixturePath);
    const actualSha256 = createHash("sha256").update(bytes).digest("hex");
    if (actualSha256 !== panel.sha256) throw new Error(`Provider-backed judge image hash changed: ${panel.id}.`);
    const relativePath = `generated/images/${panel.file}`;
    await copyFile(fixturePath, resolve(root, relativePath));
    recordGeneratedImagePanel(panel.id, {
      relativePath,
      sha256: panel.sha256,
      provenance: { model: manifest.model, quality: manifest.quality, size: manifest.size, referenceId: manifest.referenceId, requestId: panel.requestId, generatedAt: panel.generatedAt },
    }, root);
  }
}
