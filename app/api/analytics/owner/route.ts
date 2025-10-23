import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  buildOwnerAnalyticsPayload,
  type OwnerAnalyticsBooking,
} from "@/lib/validators/analytics";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(["OWNER", "ADMIN"]);
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const vesselId = searchParams.get("vesselId");
    const ownerId = searchParams.get("ownerId");

    const whereClause: Record<string, unknown> = {};

    if (user.role === "OWNER") {
      whereClause.vessel = { ownerId: user.id };
    } else if (ownerId) {
      whereClause.vessel = { ownerId };
    }

    if (vesselId) {
      whereClause.vesselId = vesselId;
    }

    if (startDate || endDate) {
      const createdAt: Record<string, Date> = {};
      if (startDate) {
        createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        createdAt.lte = new Date(endDate);
      }
      whereClause.createdAt = createdAt;
    }

    const bookings = (await prisma.booking.findMany({
      where: whereClause,
      include: {
        vessel: {
          select: {
            id: true,
            type: true,
            specs: true,
            ownerId: true,
          },
        },
        operator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        escrow: true,
        contract: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })) as OwnerAnalyticsBooking[];

    const analytics = buildOwnerAnalyticsPayload(bookings);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Owner analytics API error", error);
    return NextResponse.json(
      { error: "Failed to fetch owner analytics" },
      { status: 500 },
    );
  }
}
