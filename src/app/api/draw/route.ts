import { NextRequest, NextResponse } from "next/server";
import { recordDraw } from "@/lib/stats-store";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type !== "red" && type !== "black") {
      return NextResponse.json(
        { error: 'Invalid type. Must be "red" or "black".' },
        { status: 400 }
      );
    }

    const stats = recordDraw(type as "red" | "black");

    return NextResponse.json(stats, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: "Failed to process draw request." },
      { status: 500 }
    );
  }
}
