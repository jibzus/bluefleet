import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  analyticsQuerySchema,
  calculateVesselUtilization,
} from "@/lib/validators/analytics";

// GET /api/analytics/utilization - Get vessel utilization metrics
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const vesselId = searchParams.get("vesselId");

    // Validate query
    const validation = analyticsQuerySchema.safeParse({
      startDate,
      endDate,
      vesselId,
    });

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: validation.error.errors },
        { status: 400 }
      );
    }

    // Default to last 90 days if no dates provided
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Build where clause based on user role
    let vesselWhere: any = {};
    if (user.role === "OWNER") {
      vesselWhere.ownerId = user.id;
    } else if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (vesselId) {
      vesselWhere.id = vesselId;
    }

    // Fetch vessels
    const vessels = await prisma.vessel.findMany({
      where: vesselWhere,
      include: {
        bookings: {
          where: {
            status: "ACCEPTED",
            OR: [
              {
                start: {
                  gte: start,
                  lte: end,
                },
              },
              {
                end: {
                  gte: start,
                  lte: end,
                },
              },
            ],
          },
        },
      },
    });

    // Calculate utilization for each vessel
    const utilizationData = await Promise.all(
      vessels.map(async (vessel) => {
        const specs = vessel.specs as any;
        const utilization = await calculateVesselUtilization(
          vessel.id,
          start,
          end,
          vessel.bookings
        );

        return {
          ...utilization,
          vesselName: specs.name || "Unknown",
          vesselType: vessel.type,
        };
      })
    );

    // Sort by utilization rate (descending)
    utilizationData.sort((a, b) => b.utilizationRate - a.utilizationRate);

    // Calculate overall statistics
    const totalVessels = utilizationData.length;
    const averageUtilization =
      totalVessels > 0
        ? utilizationData.reduce((sum, v) => sum + v.utilizationRate, 0) /
          totalVessels
        : 0;
    const totalRevenue = utilizationData.reduce((sum, v) => sum + v.revenue, 0);
    const totalBookings = utilizationData.reduce(
      (sum, v) => sum + v.bookingCount,
      0
    );

    return NextResponse.json({
      vessels: utilizationData,
      summary: {
        totalVessels,
        averageUtilization,
        totalRevenue,
        totalBookings,
        period: {
          start: start.toISOString(),
          end: end.toISOString(),
        },
      },
    });
  } catch (error: any) {
    console.error("Error fetching utilization analytics:", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch utilization analytics" },
      { status: 500 }
    );
  }
}

