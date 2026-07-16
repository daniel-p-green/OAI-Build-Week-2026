import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { buildSubmissionOutputSet, submissionCoverSvg, submissionLimitations, verifySubmissionOutputSet } from "./submission-package.js";
import { buildWorkshopVideoProvenance } from "./executor.js";
import { applyWorkshopAction, createImageBatch, generateAssetPlan, generateAudioOverview, generateOutput, generateStoryboard, ingestSource, lockManualStyle, readWorkshopState, recordAudioOverviewAudio, recordRenderedVideo } from "./workshop-service.js";

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
  generateAudioOverview(root);
  generateAssetPlan(root);
  createImageBatch(root);
  generateStoryboard(root);
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
  it("turns the locked Workshop Style and current evidence counts into a real submission cover", async () => {
    const root = await buildableWorkshop(); const state = readWorkshopState(root); const svg = submissionCoverSvg(state);
    expect(svg).toContain("From rough");
    expect(svg).toContain("thought to");
    expect(svg).toContain("finished work");
    expect(svg).toContain(state.style!.ink);
    expect(svg).toContain(state.style!.paper);
    expect(svg).toContain(state.style!.accent);
    expect(svg).toContain(`${state.activeSourceIds.length} source`);
    expect(svg).toContain(`${state.claims.length} traced claim`);
    expect(svg).not.toContain("NotebookLM");
  });

  it("refuses to package work before the approval and render gates", async () => {
    const root = await mkdtemp(join(tmpdir(), "workshop-submission-gate-"));
    roots.push(root);
    await expect(buildSubmissionOutputSet(root, { renderThumbnail: fakeThumbnail })).rejects.toThrow(/approved current brief/);
  });

  it("refuses to copy private Source content into a public submission package", async () => {
    const root = await buildableWorkshop();
    await ingestSource({ title: "Confidential client transcript", origin: "Pasted notes", text: "This client material must remain private.", permission: "private" }, root);
    await expect(buildSubmissionOutputSet(root, { renderThumbnail: fakeThumbnail })).rejects.toThrow("every active Source to be sanitized or explicitly shareable");
  });

  it("builds and verifies one honest traced package from the current Workshop", async () => {
    const root = await buildableWorkshop();
    const built = await buildSubmissionOutputSet(root, { renderThumbnail: fakeThumbnail });
    expect(built.outputSet.status).toBe("partial");
    expect(built.outputSet.limitations).toEqual(expect.arrayContaining([expect.stringContaining("no live GPT-5.6"), expect.stringContaining("0 of 6"), expect.stringContaining("placeholder tones")]));
    expect(built.outputSet.assets.filter((asset) => asset.type === "thumbnail")).toHaveLength(3);
    expect(built.outputSet.assets.map((asset) => asset.type)).toEqual(expect.arrayContaining(["devpost_description", "readme_narrative", "deck", "infographic", "audio_overview", "image_manifest", "storyboard", "narration", "video", "evidence"]));
    expect(built.outputSet.assets).toEqual(expect.arrayContaining([
      expect.objectContaining({ type: "deck", relativePath: "slides.pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }),
      expect.objectContaining({ type: "infographic", relativePath: "infographic.pptx", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" }),
    ]));
    expect(built.outputSet.assets).toContainEqual(expect.objectContaining({ type: "evidence", relativePath: "VIDEO-PROVENANCE.json", mimeType: "application/json", provenance: "video_render" }));
    expect(built.outputSet.assets).toContainEqual(expect.objectContaining({ type: "evidence", relativePath: "BUILD-TRACE.html", mimeType: "text/html", provenance: "source_trace" }));
    expect(built.outputSet.assets).toContainEqual(expect.objectContaining({ type: "evidence", relativePath: "BUILD-TRACE.json", mimeType: "application/json", provenance: "source_trace" }));
    expect(built.outputSet.assets).toHaveLength(18);
    const devpost = await readFile(join(built.manifestPath, "..", "DEVPOST.md"), "utf8");
    expect(devpost).toContain("Every factual claim keeps its receipt.");
    expect(devpost).toContain("No provider Map run is claimed by this package");
    expect(devpost).toMatch(/across \d+ active Sources?/);
    expect(devpost).toContain("pnpm judge:start");
    expect(devpost).toContain("Package status: **partial**");
    await expect(readFile(join(built.manifestPath, "..", "README-NARRATIVE.md"), "utf8")).resolves.toContain("WorkshopLM owns the professional's Conversation, Sources, Map, Brief, Style, Outputs, Storyboard, and exact Source trace");
    await expect(readFile(join(built.manifestPath, "..", "README-NARRATIVE.md"), "utf8")).resolves.toContain("Codex is the development and launch host, not the professional's chat surface");
    await expect(readFile(join(built.manifestPath, "..", "README-NARRATIVE.md"), "utf8")).resolves.toContain("ChatGPT Work parity is not claimed");
    await expect(readFile(join(built.manifestPath, "..", "STORYBOARD.md"), "utf8")).resolves.toContain("Sanitized fixture · chunk 01");
    await expect(readFile(join(built.manifestPath, "..", "IMAGE-SET.md"), "utf8")).resolves.toContain("Sanitized fixture · chunk 01");
    await expect(readFile(join(built.manifestPath, "..", "AUDIO-OVERVIEW.md"), "utf8")).resolves.toContain("Sanitized fixture · chunk 01");
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

  it("copies a hash-verified Audio Overview speech file beside its grounded script", async () => {
    const root = await buildableWorkshop(); const overview = readWorkshopState(root).audioOverviews.at(-1)!;
    const bytes = Buffer.from("valid-audio-overview-fixture"); const relativePath = join("generated", `${overview.id}.wav`); const digest = createHash("sha256").update(bytes).digest("hex");
    await writeFile(join(root, relativePath), bytes);
    recordAudioOverviewAudio(overview.id, { relativePath, sha256: digest, byteCount: bytes.length, durationSeconds: 1.5, model: "gpt-4o-mini-tts", voice: "cedar", instructions: "Clear executive briefing", requestId: "speech-overview-1", generatedAt: new Date().toISOString() }, root);
    const built = await buildSubmissionOutputSet(root, { renderThumbnail: fakeThumbnail });
    expect(built.outputSet.assets).toContainEqual(expect.objectContaining({ type: "audio_overview", relativePath: "audio-overview.wav", mimeType: "audio/wav", sha256: digest, provenance: "narration" }));
    await expect(readFile(join(built.manifestPath, "..", "audio-overview.wav"))).resolves.toEqual(bytes);
    expect(built.outputSet.limitations).not.toContain("The Audio Overview includes a grounded reviewed script, but no provider-generated speech file is present.");
  });

  it("refuses a submission when the rendered Video provenance was changed after approval", async () => {
    const root = await buildableWorkshop(); const state = readWorkshopState(root); const video = state.videos[0]!;
    await writeFile(join(root, video.provenancePath), '{"schemaVersion":1,"tampered":true}\n');
    await expect(buildSubmissionOutputSet(root, { renderThumbnail: fakeThumbnail })).rejects.toThrow("Video provenance does not match");
  });

  it("reaches ready only when every provider evidence family is complete", async () => {
    const root = await buildableWorkshop(); const state = readWorkshopState(root); const generatedAt = new Date().toISOString();
    const readyState = {
      ...state,
      transcriptSegments: [...state.transcriptSegments, { id: "realtime-1", origin: "realtime_fallback" as const, transport: "webrtc" as const, text: "Verified voice", capturedAt: generatedAt, provider: { model: "gpt-realtime-2.1" as const, transcriptionModel: "gpt-realtime-whisper" as const, itemIds: ["item-1"], eventIds: ["event-1"] } }],
      aiRuns: [{ id: "ai-run-1", operation: "grounded_graph" as const, model: "gpt-5.6-sol" as const, inputClaimIds: state.claims.map((claim) => claim.id), outputSha256: "a".repeat(64), requestId: "response-1", createdAt: generatedAt }],
      imageBatch: { ...state.imageBatch!, panels: state.imageBatch!.panels.map((panel) => ({ ...panel, state: "generated" as const, relativePath: `generated/${panel.id}.png`, sha256: "b".repeat(64), provenance: { model: "gpt-image-2" as const, size: "1024x1024", quality: "medium" as const, referenceId: state.imageBatch!.referenceId, requestId: `image-${panel.id}`, generatedAt } })) },
      narration: { storyboardVersion: state.storyboard.version, disclosure: "AI-generated voice" as const, stale: false, failures: [], createdAt: generatedAt, panels: state.storyboard.panels.map((panel, index) => ({ panelId: panel.id, relativePath: `generated/panel-${index + 1}.wav`, sha256: "c".repeat(64), model: "gpt-4o-mini-tts" as const, voice: "cedar" as const, instructions: "Clear narration", requestId: `speech-${index + 1}`, generatedAt })) },
      audioOverviews: state.audioOverviews.map((overview) => ({ ...overview, status: "audio_ready" as const, audio: { relativePath: `generated/${overview.id}.wav`, sha256: "d".repeat(64), byteCount: 16_044, durationSeconds: 1, model: "gpt-4o-mini-tts" as const, voice: "cedar" as const, instructions: "Clear executive briefing", requestId: "speech-overview-1", generatedAt } })),
    };
    expect(submissionLimitations(readyState)).toEqual([]);
    expect(submissionLimitations({ ...readyState, aiRuns: [] })).toContain("The recorded fixture uses the deterministic grounded Map path; no live GPT-5.6 reasoning run is present.");
    expect(submissionLimitations({ ...readyState, narration: { ...readyState.narration, panels: readyState.narration.panels.slice(1) } })).toContain("The video uses deterministic placeholder tones; provider-generated narration is not present.");
    expect(submissionLimitations({ ...readyState, audioOverviews: readyState.audioOverviews.map((overview) => ({ ...overview, status: "script_ready" as const, audio: undefined })) })).toContain("The Audio Overview includes a grounded reviewed script, but no provider-generated speech file is present.");
  });
});
