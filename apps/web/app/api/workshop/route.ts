import { NextRequest, NextResponse } from "next/server";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { applyMapOperation, applyWorkshopAction, approveVisualDna, captureFallbackTranscript, createImageBatch, createVisualDna, extractWorkshopCandidates, generateOutput, ingestPdfFile, ingestSource, ingestUrl, lockManualStyle, lockWebsiteStyle, readWorkshopState, selectImagePanelForRegeneration, type ManualStyleInput, type SourceIngestion, undoMapOperation, updateStoryboardPanel } from "../../../../worker/src/workshop-service";

export const runtime = "nodejs";
type Action = "approveBrief" | "lockManualStyle" | "lockWebsiteStyle" | "createVisualDna" | "approveVisualDna" | "approveStoryboard" | "renderVideo" | "ingestSource" | "captureFallbackTranscript" | "ingestUrl" | "ingestPdfFile" | "extractCandidates" | "mapOperation" | "undoMapOperation" | "generateOutput" | "createImageBatch" | "regenerateImagePanel" | "updateStoryboardPanel";
type RequestBody = { action?: Action; source?: SourceIngestion; text?: string; url?: string; filePath?: string; permission?: "private" | "sanitized" | "shareable"; panelId?: string; operation?: unknown; outputType?: "deck" | "infographic"; manualStyle?: ManualStyleInput; panel?: { id: string; title: string; narration: string; durationSeconds: number } };

export async function GET() { return NextResponse.json(readWorkshopState()); }

export async function POST(request: NextRequest) {
  try {
    if (request.headers.get("content-type")?.includes("multipart/form-data")) {
      const form = await request.formData();
      if (form.get("action") !== "ingestPdfUpload") return NextResponse.json({ error: "Unsupported upload action" }, { status: 400 });
      const upload = form.get("file");
      if (!upload || typeof upload === "string" || !upload.name.toLowerCase().endsWith(".pdf")) return NextResponse.json({ error: "A PDF file is required" }, { status: 400 });
      if (upload.size > 10_000_000) return NextResponse.json({ error: "PDF uploads are limited to 10 MB" }, { status: 413 });
      const directory = await mkdtemp(join(tmpdir(), "workshoplm-pdf-"));
      const safeName = upload.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
      const filePath = join(directory, safeName);
      const rawPermission = form.get("permission");
      if (rawPermission && rawPermission !== "private" && rawPermission !== "sanitized" && rawPermission !== "shareable") return NextResponse.json({ error: "Invalid source permission" }, { status: 400 });
      const permission = rawPermission === "private" || rawPermission === "sanitized" || rawPermission === "shareable" ? rawPermission : "sanitized";
      try { await writeFile(filePath, Buffer.from(await upload.arrayBuffer())); return NextResponse.json(await ingestPdfFile(filePath, undefined, permission ?? "sanitized")); }
      finally { await rm(directory, { recursive: true, force: true }); }
    }
    const body = await request.json() as RequestBody;
    if (!body.action) return NextResponse.json({ error: "action is required" }, { status: 400 });
    if (body.action === "ingestSource") { if (!body.source) return NextResponse.json({ error: "source is required" }, { status: 400 }); return NextResponse.json(await ingestSource(body.source)); }
    if (body.action === "captureFallbackTranscript") { if (!body.text) return NextResponse.json({ error: "text is required" }, { status: 400 }); return NextResponse.json(await captureFallbackTranscript(body.text)); }
    if (body.action === "ingestUrl") { if (!body.url) return NextResponse.json({ error: "url is required" }, { status: 400 }); return NextResponse.json(await ingestUrl(body.url)); }
    if (body.action === "ingestPdfFile") { if (!body.filePath) return NextResponse.json({ error: "filePath is required" }, { status: 400 }); return NextResponse.json(await ingestPdfFile(body.filePath, undefined, body.permission)); }
    if (body.action === "extractCandidates") return NextResponse.json(extractWorkshopCandidates());
    if (body.action === "lockManualStyle") return NextResponse.json(lockManualStyle(body.manualStyle));
    if (body.action === "createVisualDna") return NextResponse.json(createVisualDna());
    if (body.action === "approveVisualDna") return NextResponse.json(approveVisualDna());
    if (body.action === "lockWebsiteStyle") { if (!body.url) return NextResponse.json({ error: "url is required" }, { status: 400 }); return NextResponse.json(await lockWebsiteStyle(body.url)); }
    if (body.action === "mapOperation") { if (!body.operation) return NextResponse.json({ error: "operation is required" }, { status: 400 }); return NextResponse.json(applyMapOperation(body.operation)); }
    if (body.action === "undoMapOperation") return NextResponse.json(undoMapOperation());
    if (body.action === "generateOutput") { if (!body.outputType) return NextResponse.json({ error: "outputType is required" }, { status: 400 }); return NextResponse.json(await generateOutput(body.outputType)); }
    if (body.action === "createImageBatch") return NextResponse.json(createImageBatch());
    if (body.action === "regenerateImagePanel") { if (!body.panelId) return NextResponse.json({ error: "panelId is required" }, { status: 400 }); return NextResponse.json(selectImagePanelForRegeneration(body.panelId)); }
    if (body.action === "updateStoryboardPanel") { if (!body.panel) return NextResponse.json({ error: "panel is required" }, { status: 400 }); const { id, ...panel } = body.panel; return NextResponse.json(updateStoryboardPanel(id, panel)); }
    return NextResponse.json(applyWorkshopAction(body.action));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Workshop action failed" }, { status: 409 }); }
}
