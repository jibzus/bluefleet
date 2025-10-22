import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  buildOperatorAnalyticsPayload,
  type OperatorAnalyticsBooking,
} from "@/lib/validators/analytics";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(["OPERATOR", "ADMIN"]);
    const { searchParams } = new URL(request.url);

    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const vesselId = searchParams.get("vesselId");
    const operatorId = searchParams.get("operatorId");

    const whereClause: Record<string, unknown> = {};

    if (user.role === "OPERATOR") {
      whereClause.operatorId = user.id;
    } else if (operatorId) {
      whereClause.operatorId = operatorId;
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
            slug: true,
            type: true,
            specs: true,
            homePort: true,
            ownerId: true,
          },
        },
        escrow: true,
        contract: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })) as OperatorAnalyticsBooking[];

    const analytics = buildOperatorAnalyticsPayload(bookings);

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Operator analytics API error", error);
    return NextResponse.json(
      { error: "Failed to fetch operator analytics" },
      { status: 500 },
    );
  }
}

