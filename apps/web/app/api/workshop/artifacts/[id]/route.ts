import { readFile } from "node:fs/promises";
import { NextResponse } from "next/server";
import { resolveWorkshopArtifact } from "../../../../../../worker/src/workshop-service";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const artifact = resolveWorkshopArtifact(id);
  if (!artifact) return NextResponse.json({ error: "Artifact not found" }, { status: 404 });
  try {
    return new NextResponse(await readFile(artifact.path), { headers: { "content-type": artifact.contentType, "content-disposition": "inline" } });
  } catch { return NextResponse.json({ error: "Artifact file not found" }, { status: 404 }); }
}
