import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { resolveWorkshopArtifact } from "../../../../../../worker/src/workshop-service";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const format = new URL(request.url).searchParams.get("format") === "editable" ? "editable" : "preview";
  const artifact = resolveWorkshopArtifact(id, undefined, undefined, format);
  if (!artifact) return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  try {
    return new NextResponse(await readFile(artifact.path), { headers: { "content-type": artifact.contentType, "content-disposition": artifact.fileName ? `attachment; filename="${artifact.fileName}"` : "inline" } });
  } catch { return NextResponse.json({ error: "Artifact file not found" }, { status: 404 }); }
}
