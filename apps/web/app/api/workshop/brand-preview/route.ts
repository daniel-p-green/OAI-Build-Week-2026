import { NextResponse } from "next/server";
import { fetchWebsiteBrandAsset } from "../../../../../worker/src/workshop-service";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url) return NextResponse.json({ error: "url is required" }, { status: 400 });
  try {
    const asset = await fetchWebsiteBrandAsset(url);
    return new NextResponse(new Uint8Array(asset.bytes), { headers: { "content-type": asset.contentType, "cache-control": "private, no-store", "x-content-type-options": "nosniff" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Brand asset preview failed" }, { status: 400 });
  }
}
