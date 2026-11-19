import { NextRequest, NextResponse } from "next/server";
import { runFreePipeline } from "@/lib/ai/free-pipeline";

export const runtime = "nodejs";
// 4 scenes, images paced 1-per-45s (the free image API's rate limit) +
// script/voice/compose time -- realistically 3-4 minutes end to end.
export const maxDuration = 300;

export async function POST(req: NextRequest) {
  let body: { idea?: string; style?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const idea = (body.idea ?? "").trim();
  const style = (body.style ?? "cinematic").trim();
  if (idea.length < 4) {
    return NextResponse.json({ error: "idea is too short" }, { status: 400 });
  }

  try {
    const result = await runFreePipeline(idea, style);
    return new NextResponse(new Uint8Array(result.videoBuffer), {
      status: 200,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": 'attachment; filename="reel-clone-short.mp4"',
        "X-Scenes": encodeURIComponent(JSON.stringify(result.scenes)),
        "X-Warnings": encodeURIComponent(JSON.stringify(result.warnings)),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "generation failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
