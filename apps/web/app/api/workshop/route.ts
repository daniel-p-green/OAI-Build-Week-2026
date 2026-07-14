import { NextRequest, NextResponse } from "next/server";
import { applyWorkshopAction, readWorkshopState } from "../../../../worker/src/workshop-service";
export const runtime = "nodejs";
export async function GET() { return NextResponse.json(readWorkshopState()); }
export async function POST(request: NextRequest) { try { const body = await request.json() as { action?: "approveBrief" | "approveStoryboard" | "renderVideo" }; if (!body.action) return NextResponse.json({ error: "action is required" }, { status: 400 }); return NextResponse.json(applyWorkshopAction(body.action)); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Workshop action failed" }, { status: 409 }); } }
