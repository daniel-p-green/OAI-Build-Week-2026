import { describe, expect, it } from "vitest";
import fixture from "../fixtures/visual-dna.json" with { type: "json" };
import {
  assertBatchManifest,
  replaceAsset,
  type ImageBatchManifest,
  type VisualDna,
} from "./batch-manifest.js";

const visualDna = fixture as VisualDna;

function manifest(): ImageBatchManifest {
  return {
    id: "fixture-image-batch-v1",
    visualDna,
    assets: Array.from({ length: 6 }, (_, index) => ({
      id: `panel-${index + 1}`,
      version: 1,
      prompt: `Fixture image ${index + 1}`,
      artifactSha256: `${index + 1}`.repeat(64),
      provenance: {
        model: "gpt-image-2",
        quality: "medium",
        size: "1024x1024",
        referenceId: visualDna.referenceId,
      },
    })),
  };
}

describe("image batch manifest", () => {
  it("replaces only the selected panel while preserving sibling IDs, versions, hashes, and provenance", () => {
    const before = manifest();
    const after = replaceAsset(before, "panel-4", {
      prompt: "Replacement for panel four",
      artifactSha256: "r".repeat(64),
      provenance: {
        model: "gpt-image-2",
        quality: "high",
        size: "1024x1024",
        referenceId: visualDna.referenceId,
      },
    });

    expect(after).not.toBe(before);
    expect(after.assets[3]).toMatchObject({
      id: "panel-4",
      version: 2,
      prompt: "Replacement for panel four",
      artifactSha256: "r".repeat(64),
    });
    for (const index of [0, 1, 2, 4, 5]) expect(after.assets[index]).toBe(before.assets[index]);
  });

  it("rejects an unknown panel and unlocked reference metadata", () => {
    expect(() => replaceAsset(manifest(), "panel-7", manifest().assets[0]!)).toThrow("Unknown image panel");
    expect(() =>
      assertBatchManifest({
        ...manifest(),
        assets: [{ ...manifest().assets[0]!, provenance: { ...manifest().assets[0]!.provenance, referenceId: "other" } }],
      }),
    ).toThrow("Expected 6 image assets");
  });
});
