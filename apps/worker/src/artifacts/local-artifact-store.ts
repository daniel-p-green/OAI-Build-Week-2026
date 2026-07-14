import { createHash } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";

export type StoredArtifact = { relativePath: string; sha256: string; byteCount: number; mimeType: string };
export async function storeArtifact(root: string, key: string, data: Uint8Array, mimeType: string): Promise<StoredArtifact> {
  const hash = createHash("sha256").update(data).digest("hex");
  const finalPath = resolve(root, "artifacts", hash.slice(0, 2), `${key}-${hash}`);
  const artifactRoot = resolve(root, "artifacts");
  if (!finalPath.startsWith(`${artifactRoot}/`)) throw new Error("artifact path escapes root");
  await mkdir(dirname(finalPath), { recursive: true });
  const temp = `${finalPath}.${process.pid}.tmp`;
  await writeFile(temp, data);
  await rename(temp, finalPath);
  return { relativePath: relative(root, finalPath), sha256: hash, byteCount: data.byteLength, mimeType };
}
