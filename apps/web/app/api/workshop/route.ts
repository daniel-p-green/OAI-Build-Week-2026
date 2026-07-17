import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { analyzeWebsiteStyle, applyMapOperation, applyStyleLibrary, applyWorkshopAction, approveSketch, approveVisualDna, beginWebsiteStyleAnalysis, cancelVideoRender, captureFallbackTranscript, createImageBatch, createSketch, createVisualDna, createWorkshop, dismissWorkshopOrientation, extractWorkshopCandidates, generateAssetPlan, generateAudioOverview, generateOutput, generateStoryboard, ingestPdfFile, ingestSource, ingestUrl, listStyleLibrary, listWorkshopSummaries, lockManualStyle, lockWebsiteStyle, organizeGroundedMap, readWorkshopState, recordOutputFailure, resetSeededFixture, runWebsiteStyleAnalysis, selectImagePanelForRegeneration, selectWorkshop, sendConversationMessage, setActiveSourceScope, syncMapCanvas, type CanvasNodePatch, type ManualStyleInput, type RealtimeCaptureEvidence, type SourceIngestion, type WorkshopOnboarding, type WorkshopOutcome, undoMapOperation, updateAudioOverview, updateStoryboardPanel, updateWorkshopOnboarding, workshopDataRoot } from "../../../../worker/src/workshop-service";
import { defaultOpenAiMediaConfig, generateOpenAiAudioOverview } from "../../../../worker/src/openai-media";
import { generateGroundedMapWithGpt56 } from "../../../../worker/src/openai-reasoning";
import { executeWorkshopTool, type ExecuteWorkshopToolInput } from "../../../../worker/src/workshop-tools";
import { handleWorkshopProviderToolEvent, type WorkshopProviderToolEvent } from "../../../../worker/src/provider-tool-events";

export const runtime = "nodejs";
type Action = "resetTestFixture" | "createWorkshop" | "selectWorkshop" | "updateOnboarding" | "buildMap" | "dismissOrientation" | "beginWebsiteStyleAnalysis" | "approveBrief" | "analyzeWebsiteStyle" | "lockManualStyle" | "lockWebsiteStyle" | "applyStyleLibrary" | "createSketch" | "approveSketch" | "createVisualDna" | "approveVisualDna" | "approveStoryboard" | "renderVideo" | "cancelVideoRender" | "ingestSource" | "captureFallbackTranscript" | "sendConversationMessage" | "executeTool" | "handleProviderToolEvent" | "ingestUrl" | "ingestPdfFile" | "extractCandidates" | "setActiveSourceScope" | "mapOperation" | "syncMapCanvas" | "undoMapOperation" | "generateAssetPlan" | "generateOutput" | "generateAudioOverview" | "updateAudioOverview" | "generateAudioOverviewAudio" | "generateStoryboard" | "createImageBatch" | "regenerateImagePanel" | "updateStoryboardPanel";
type RequestBody = { action?: Action; workshopId?: string; styleLibraryId?: string; title?: string; source?: SourceIngestion; text?: string; capture?: RealtimeCaptureEvidence; toolCall?: ExecuteWorkshopToolInput; providerEvent?: WorkshopProviderToolEvent; url?: string; filePath?: string; permission?: "private" | "sanitized" | "shareable"; sourceIds?: string[]; panelId?: string; revisionRequest?: string; audioOverviewId?: string; audioSections?: Array<{ id: string; text: string }>; operation?: unknown; canvasNodes?: CanvasNodePatch[]; outputType?: "deck" | "infographic"; manualStyle?: ManualStyleInput; intentProfile?: ManualStyleInput["intentProfile"]; onboardingStep?: WorkshopOnboarding["step"]; outcome?: WorkshopOutcome; orientation?: "map" | "outputs"; panel?: { id: string; title: string; narration: string; durationSeconds: number } };

export async function GET(request: NextRequest) { const view = request.nextUrl.searchParams.get("view"); return NextResponse.json(view === "collection" ? { workshops: listWorkshopSummaries() } : view === "styles" ? { styles: listStyleLibrary() } : readWorkshopState()); }

export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await request.formData();
      if (form.get("action") !== "ingestPdfUpload") return NextResponse.json({ error: "Unsupported upload action" }, { status: 400 });
      const upload = form.get("file");
      if (!upload || typeof upload === "string" || !upload.name.toLowerCase().endsWith(".pdf")) return NextResponse.json({ error: "A PDF file is required" }, { status: 400 });
      if (upload.size > 10_000_000) return NextResponse.json({ error: "PDF uploads are limited to 10 MB" }, { status: 413 });
      const bytes = Buffer.from(await upload.arrayBuffer());
      if (!bytes.subarray(0, 5).equals(Buffer.from("%PDF-"))) return NextResponse.json({ error: "That file is not a readable PDF" }, { status: 400 });
      const safeName = upload.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
      const digest = createHash("sha256").update(bytes).digest("hex").slice(0, 12);
      const directory = join(workshopDataRoot(), "sources", "originals", digest);
      await mkdir(directory, { recursive: true });
      const filePath = join(directory, safeName);
      const rawPermission = form.get("permission");
      if (rawPermission && rawPermission !== "private" && rawPermission !== "sanitized" && rawPermission !== "shareable") return NextResponse.json({ error: "Invalid source permission" }, { status: 400 });
      const permission = rawPermission === "private" || rawPermission === "sanitized" || rawPermission === "shareable" ? rawPermission : "sanitized";
      try { await writeFile(filePath, bytes); return NextResponse.json(await ingestPdfFile(filePath, undefined, permission ?? "sanitized")); }
      catch (error) { await rm(filePath, { force: true }); throw error; }
    }
    const body = await request.json() as RequestBody;
    if (!body.action) return NextResponse.json({ error: "action is required" }, { status: 400 });
    if (body.action === "resetTestFixture") return NextResponse.json(resetSeededFixture());
    if (body.action === "createWorkshop") { if (!body.title) return NextResponse.json({ error: "title is required" }, { status: 400 }); return NextResponse.json(createWorkshop(body.title)); }
    if (body.action === "selectWorkshop") { if (!body.workshopId) return NextResponse.json({ error: "workshopId is required" }, { status: 400 }); return NextResponse.json(selectWorkshop(body.workshopId)); }
    if (body.workshopId) selectWorkshop(body.workshopId);
    if (body.action === "updateOnboarding") return NextResponse.json(updateWorkshopOnboarding({ title: body.title, outcome: body.outcome, step: body.onboardingStep }));
    if (body.action === "buildMap") {
      const fallback = updateWorkshopOnboarding({ title: body.title, outcome: body.outcome, step: "complete" });
      const apiKey = process.env.OPENAI_API_KEY?.trim();
      if (fallback.claims.filter((claim) => fallback.activeSourceIds.includes(claim.sourceId)).length < 2) return NextResponse.json(fallback);
      if (process.env.WORKSHOPLM_LIVE_OPENAI !== "1" || !apiKey) return NextResponse.json(organizeGroundedMap());
      try { return NextResponse.json(await generateGroundedMapWithGpt56(workshopDataRoot(), { apiKey, model: "gpt-5.6-terra", reasoningEffort: "medium" })); }
      catch { return NextResponse.json(organizeGroundedMap()); }
    }
    if (body.action === "dismissOrientation") { if (!body.orientation) return NextResponse.json({ error: "orientation is required" }, { status: 400 }); return NextResponse.json(dismissWorkshopOrientation(body.orientation)); }
    if (body.action === "beginWebsiteStyleAnalysis") {
      if (!body.url) return NextResponse.json({ error: "url is required" }, { status: 400 });
      const state = beginWebsiteStyleAnalysis(body.url);
      void runWebsiteStyleAnalysis(body.url);
      return NextResponse.json(state);
    }
    if (body.action === "ingestSource") { if (!body.source) return NextResponse.json({ error: "source is required" }, { status: 400 }); return NextResponse.json(await ingestSource(body.source)); }
    if (body.action === "captureFallbackTranscript") { if (!body.text) return NextResponse.json({ error: "text is required" }, { status: 400 }); return NextResponse.json(await captureFallbackTranscript(body.text, undefined, body.capture)); }
    if (body.action === "sendConversationMessage") { if (!body.text) return NextResponse.json({ error: "text is required" }, { status: 400 }); return NextResponse.json(sendConversationMessage(body.text)); }
    if (body.action === "executeTool") { if (!body.toolCall) return NextResponse.json({ error: "toolCall is required" }, { status: 400 }); return NextResponse.json(await executeWorkshopTool(body.toolCall)); }
    if (body.action === "handleProviderToolEvent") { if (!body.providerEvent) return NextResponse.json({ error: "providerEvent is required" }, { status: 400 }); return NextResponse.json(await handleWorkshopProviderToolEvent(body.providerEvent)); }
    if (body.action === "ingestUrl") { if (!body.url) return NextResponse.json({ error: "url is required" }, { status: 400 }); return NextResponse.json(await ingestUrl(body.url)); }
    if (body.action === "ingestPdfFile") { if (!body.filePath) return NextResponse.json({ error: "filePath is required" }, { status: 400 }); return NextResponse.json(await ingestPdfFile(body.filePath, undefined, body.permission)); }
    if (body.action === "extractCandidates") return NextResponse.json(extractWorkshopCandidates());
    if (body.action === "setActiveSourceScope") { if (!Array.isArray(body.sourceIds)) return NextResponse.json({ error: "sourceIds are required" }, { status: 400 }); return NextResponse.json(setActiveSourceScope(body.sourceIds)); }
    if (body.action === "analyzeWebsiteStyle") { if (!body.url) return NextResponse.json({ error: "url is required" }, { status: 400 }); return NextResponse.json(await analyzeWebsiteStyle(body.url)); }
    if (body.action === "lockManualStyle") return NextResponse.json(lockManualStyle(body.manualStyle));
    if (body.action === "applyStyleLibrary") { if (!body.styleLibraryId) return NextResponse.json({ error: "styleLibraryId is required" }, { status: 400 }); return NextResponse.json(applyStyleLibrary(body.styleLibraryId, body.intentProfile)); }
    if (body.action === "createSketch") return NextResponse.json(createSketch());
    if (body.action === "approveSketch") return NextResponse.json(approveSketch());
    if (body.action === "createVisualDna") return NextResponse.json(createVisualDna());
    if (body.action === "approveVisualDna") return NextResponse.json(approveVisualDna());
    if (body.action === "generateAssetPlan") return NextResponse.json(generateAssetPlan());
    if (body.action === "generateStoryboard") return NextResponse.json(generateStoryboard());
    if (body.action === "cancelVideoRender") return NextResponse.json(cancelVideoRender());
    if (body.action === "lockWebsiteStyle") { if (!body.url) return NextResponse.json({ error: "url is required" }, { status: 400 }); return NextResponse.json(await lockWebsiteStyle(body.url, undefined, fetch, body.intentProfile, body.manualStyle)); }
    if (body.action === "mapOperation") { if (!body.operation) return NextResponse.json({ error: "operation is required" }, { status: 400 }); return NextResponse.json(applyMapOperation(body.operation)); }
    if (body.action === "syncMapCanvas") { if (!Array.isArray(body.canvasNodes)) return NextResponse.json({ error: "canvasNodes are required" }, { status: 400 }); return NextResponse.json(syncMapCanvas(body.canvasNodes)); }
    if (body.action === "undoMapOperation") return NextResponse.json(undoMapOperation());
    if (body.action === "generateOutput") { if (!body.outputType) return NextResponse.json({ error: "outputType is required" }, { status: 400 }); try { return NextResponse.json(await generateOutput(body.outputType)); } catch (error) { recordOutputFailure(body.outputType); throw error; } }
    if (body.action === "generateAudioOverview") return NextResponse.json(generateAudioOverview());
    if (body.action === "updateAudioOverview") { if (!body.audioOverviewId || !Array.isArray(body.audioSections)) return NextResponse.json({ error: "audioOverviewId and audioSections are required" }, { status: 400 }); return NextResponse.json(updateAudioOverview(body.audioOverviewId, body.audioSections)); }
    if (body.action === "generateAudioOverviewAudio") {
      if (process.env.WORKSHOPLM_LIVE_OPENAI !== "1") return NextResponse.json({ error: "Live OpenAI media is not enabled for this Workshop." }, { status: 409 });
      const apiKey = process.env.OPENAI_API_KEY?.trim(); if (!apiKey) return NextResponse.json({ error: "OpenAI media credentials are not configured." }, { status: 409 });
      await generateOpenAiAudioOverview(workshopDataRoot(), { ...defaultOpenAiMediaConfig, apiKey });
      return NextResponse.json(readWorkshopState());
    }
    if (body.action === "createImageBatch") return NextResponse.json(createImageBatch());
    if (body.action === "regenerateImagePanel") {
      if (!body.panelId) return NextResponse.json({ error: "panelId is required" }, { status: 400 });
      if (body.revisionRequest !== undefined && typeof body.revisionRequest !== "string") return NextResponse.json({ error: "revisionRequest must be text" }, { status: 400 });
      return NextResponse.json(selectImagePanelForRegeneration(body.panelId, undefined, body.revisionRequest));
    }
    if (body.action === "updateStoryboardPanel") { if (!body.panel) return NextResponse.json({ error: "panel is required" }, { status: 400 }); const { id, ...panel } = body.panel; return NextResponse.json(updateStoryboardPanel(id, panel)); }
    return NextResponse.json(applyWorkshopAction(body.action));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Workshop action failed" }, { status: 409 }); }
}
