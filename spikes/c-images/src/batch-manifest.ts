export const IMAGE_BATCH_SIZE = 6;

export type VisualDna = {
  readonly palette: readonly string[];
  readonly composition: string;
  readonly lighting: string;
  readonly imageTreatment: string;
  readonly referenceId: string;
};

export type ImageAsset = {
  readonly id: string;
  readonly version: number;
  readonly prompt: string;
  readonly artifactSha256: string;
  readonly provenance: {
    readonly model: "gpt-image-2";
    readonly quality: "medium" | "high" | "low";
    readonly size: "1024x1024" | "1536x1024" | "1024x1536";
    readonly referenceId: string;
  };
};

export type ImageBatchManifest = {
  readonly id: string;
  readonly visualDna: VisualDna;
  readonly assets: readonly ImageAsset[];
};

export type ReplacementAsset = Omit<ImageAsset, "id" | "version"> & {
  /** Ignored on replacement: the manifest owns monotonically increasing versions. */
  readonly version?: number;
};

/**
 * Replaces one panel without renumbering or rewriting its siblings. This is the
 * contract used by Studio's "Regenerate selected" control.
 */
export function replaceAsset(
  manifest: ImageBatchManifest,
  panelId: string,
  nextAsset: ReplacementAsset,
): ImageBatchManifest {
  let replaced = false;
  const assets = manifest.assets.map((asset) => {
    if (asset.id !== panelId) return asset;
    replaced = true;
    return { ...nextAsset, id: asset.id, version: asset.version + 1 };
  });

  if (!replaced) {
    throw new Error(`Unknown image panel: ${panelId}`);
  }

  return { ...manifest, assets };
}

export function assertBatchManifest(manifest: ImageBatchManifest): void {
  if (manifest.assets.length !== IMAGE_BATCH_SIZE) {
    throw new Error(`Expected ${IMAGE_BATCH_SIZE} image assets; received ${manifest.assets.length}`);
  }

  const ids = new Set(manifest.assets.map((asset) => asset.id));
  if (ids.size !== manifest.assets.length) throw new Error("Image asset IDs must be unique");

  for (const asset of manifest.assets) {
    if (asset.version < 1 || !Number.isInteger(asset.version)) {
      throw new Error(`Image asset ${asset.id} has an invalid version`);
    }
    if (asset.provenance.referenceId !== manifest.visualDna.referenceId) {
      throw new Error(`Image asset ${asset.id} does not use the locked reference`);
    }
  }
}
