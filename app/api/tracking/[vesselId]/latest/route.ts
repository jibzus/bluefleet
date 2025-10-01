import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/tracking/[vesselId]/latest - Get latest position for a vessel
export async function GET(
  request: NextRequest,
  { params }: { params: { vesselId: string } }
) {
  try {
    const user = await requireAuth();
    const { vesselId } = params;

    // Get latest tracking event for vessel
    const latestEvent = await prisma.trackingEvent.findFirst({
      where: { vesselId },
      orderBy: { ts: "desc" },
    });

    if (!latestEvent) {
      return NextResponse.json(
        { error: "No tracking data found for this vessel" },
        { status: 404 }
      );
    }

    return NextResponse.json({ event: latestEvent });
  } catch (error: any) {
    console.error("Error fetching latest tracking event:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch latest tracking event" },
      { status: 500 }
    );
  }
}

