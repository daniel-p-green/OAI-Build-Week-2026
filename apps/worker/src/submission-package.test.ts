import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildSubmissionOutputSet, verifySubmissionOutputSet } from "./submission-package.js";
import { buildWorkshopVideoProvenance } from "./executor.js";
import { applyWorkshopAction, createImageBatch, generateAssetPlan, generateOutput, generateStoryboard, ingestSource, lockManualStyle, readWorkshopState, recordRenderedVideo } from "./workshop-service.js";

const roots: string[] = [];
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });

async function buildableWorkshop() {
  const root = await mkdtemp(join(tmpdir(), "workshop-submission-"));
  roots.push(root);
  await ingestSource({ title: "Raw brainstorm", origin: "Sanitized fixture", text: "WorkshopLM turns raw thinking into a source-traceable presentation and approved video." }, root);
  applyWorkshopAction("approveBrief", root);
  lockManualStyle({}, root);
  await generateOutput("deck", root);
  await generateOutput("infographic", root);
  generateAssetPlan(root);
  generateStoryboard(root);
  createImageBatch(root);
  applyWorkshopAction("approveStoryboard", root);
  const videoBytes = Buffer.from("deterministic-video");
  const videoPath = join("generated", "workshoplm-demo-v1.mp4");
  const provenancePath = join("generated", "workshoplm-demo-v1.provenance.json");
  await writeFile(join(root, videoPath), videoBytes);
  const videoArtifact = { relativePath: "artifacts/test/workshoplm-demo", sha256: createHash("sha256").update(videoBytes).digest("hex"), byteCount: videoBytes.byteLength, mimeType: "video/mp4" };
  await writeFile(join(root, provenancePath), `${JSON.stringify(buildWorkshopVideoProvenance(readWorkshopState(root), videoArtifact), null, 2)}\n`);
  const state = readWorkshopState(root);
  const buildTracePath = join("generated", "workshoplm-demo-v1.build-trace.html");
  const buildTraceDataPath = join("generated", "workshoplm-demo-v1.build-trace.json");
  await writeFile(join(root, buildTracePath), "<h1>How this submission was built</h1>");
  await writeFile(join(root, buildTraceDataPath), '{"schemaVersion":1}\n');
  recordRenderedVideo({ storyboardVersion: state.storyboard.version, styleVersion: state.style!.version, visualDnaVersion: state.visualDna?.version, imageBatchId: state.imageBatch?.id, relativePath: videoPath, provenancePath, artifactPath: videoArtifact.relativePath, sha256: videoArtifact.sha256, byteCount: videoArtifact.byteCount, claimIds: [...new Set(state.storyboard.panels.flatMap((panel) => panel.claimIds))], buildTrace: { htmlPath: buildTracePath, dataPath: buildTraceDataPath, htmlSha256: createHash("sha256").update("<h1>How this submission was built</h1>").digest("hex"), dataSha256: createHash("sha256").update('{"schemaVersion":1}\n').digest("hex"), milestoneCount: 1, commitCount: 1, taskIds: [] } }, root);
  return root;
}

const fakeThumbnail = async (_videoPath: string, outputPath: string, second: number) => { await writeFile(outputPath, `png-at-${second.toFixed(2)}`); };

describe("submission Output set", () => {
  it("refuses to package work before the approval and render gates", async () => {
    const root = await mkdtemp(join(tmpdir(), "workshop-submission-gate-"));
    roots.push(root);
    await expect(buildSubmissionOutputSet(root, { renderThumbnail: fakeThumbnail })).rejects.toThrow(/approved current brief/);
  });

  it("builds and verifies one honest traced package from the current Workshop", async () => {
    const root = await buildableWorkshop();
    const built = await buildSubmissionOutputSet(root, { renderThumbnail: fakeThumbnail });
    expect(built.outputSet.status).toBe("partial");
    expect(built.outputSet.limitations).toEqual(expect.arrayContaining([expect.stringContaining("no live GPT-5.6"), expect.stringContaining("0 of 6"), expect.stringContaining("placeholder tones")]));
    expect(built.outputSet.assets.filter((asset) => asset.type === "thumbnail")).toHaveLength(3);
    expect(built.outputSet.assets.map((asset) => asset.type)).toEqual(expect.arrayContaining(["devpost_description", "readme_narrative", "deck", "infographic", "image_manifest", "storyboard", "narration", "video", "evidence"]));
    expect(built.outputSet.assets).toContainEqual(expect.objectContaining({ type: "evidence", relativePath: "VIDEO-PROVENANCE.json", mimeType: "application/json", provenance: "video_render" }));
    expect(built.outputSet.assets).toContainEqual(expect.objectContaining({ type: "evidence", relativePath: "BUILD-TRACE.html", mimeType: "text/html", provenance: "source_trace" }));
    expect(built.outputSet.assets).toContainEqual(expect.objectContaining({ type: "evidence", relativePath: "BUILD-TRACE.json", mimeType: "application/json", provenance: "source_trace" }));
    expect(built.outputSet.assets).toHaveLength(15);
    await expect(readFile(join(built.manifestPath, "..", "DEVPOST.md"), "utf8")).resolves.toContain("No live GPT-5.6 run is claimed");
    await expect(readFile(join(built.manifestPath, "..", "STORYBOARD.md"), "utf8")).resolves.toContain("Sanitized fixture · chunk 01");
    await expect(verifySubmissionOutputSet(root, built.manifestPath)).resolves.toEqual({ valid: true, stale: false, tampered: false, issues: [] });
  });

  it("detects changed files and later Workshop edits independently", async () => {
    const root = await buildableWorkshop();
    const built = await buildSubmissionOutputSet(root, { renderThumbnail: fakeThumbnail });
    const deck = built.outputSet.assets.find((asset) => asset.type === "deck")!;
    await writeFile(join(built.manifestPath, "..", deck.relativePath), "altered");
    await expect(verifySubmissionOutputSet(root, built.manifestPath)).resolves.toMatchObject({ valid: false, stale: false, tampered: true, issues: [expect.stringContaining("hash or size mismatch")] });

    const rebuilt = await buildSubmissionOutputSet(root, { renderThumbnail: fakeThumbnail });
    lockManualStyle({ accent: "#1155AA" }, root);
    await expect(verifySubmissionOutputSet(root, rebuilt.manifestPath)).resolves.toMatchObject({ valid: false, stale: true, tampered: false, issues: [expect.stringContaining("inputs changed")] });
  });
});
