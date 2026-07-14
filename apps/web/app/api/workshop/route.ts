import { NextRequest, NextResponse } from "next/server";
import { applyWorkshopAction, ingestSource, readWorkshopState, type SourceIngestion } from "../../../../worker/src/workshop-service";
export const runtime = "nodejs";
export async function GET() { return NextResponse.json(readWorkshopState()); }
export async function POST(request: NextRequest) { try { const body = await request.json() as { action?: "approveBrief" | "approveStoryboard" | "renderVideo" | "ingestSource"; source?: SourceIngestion }; if (!body.action) return NextResponse.json({ error: "action is required" }, { status: 400 }); if (body.action === "ingestSource") { if (!body.source) return NextResponse.json({ error: "source is required" }, { status: 400 }); return NextResponse.json(await ingestSource(body.source)); } return NextResponse.json(applyWorkshopAction(body.action)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Workshop action failed" }, { status: 409 }); } }
