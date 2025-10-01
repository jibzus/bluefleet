import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  generatePricingSuggestion,
  calculateVesselUtilization,
} from "@/lib/validators/analytics";

// GET /api/analytics/pricing - Get pricing suggestions for vessels
export async function GET(request: NextRequest) {
  try {
    const user = await requireRole(["OWNER", "ADMIN"]);
    const { searchParams } = new URL(request.url);
    const vesselId = searchParams.get("vesselId");

    // Build where clause
    let where: any = {};
    if (user.role === "OWNER") {
      where.ownerId = user.id;
    }
    if (vesselId) {
      where.id = vesselId;
    }

    // Fetch vessels
    const vessels = await prisma.vessel.findMany({
      where,
      include: {
        bookings: {
          where: {
            status: "ACCEPTED",
          },
        },
      },
    });

    if (vessels.length === 0) {
      return NextResponse.json({ suggestions: [] });
    }

    // Calculate market averages by vessel type
    const allVessels = await prisma.vessel.findMany({
      select: {
        type: true,
        specs: true,
      },
    });

    const marketAverages: Record<string, number> = {};
    const typeCounts: Record<string, number> = {};

    for (const vessel of allVessels) {
      const specs = vessel.specs as any;
      const rate = specs.pricing?.dailyRate || 0;
      if (rate > 0) {
        marketAverages[vessel.type] =
          (marketAverages[vessel.type] || 0) + rate;
        typeCounts[vessel.type] = (typeCounts[vessel.type] || 0) + 1;
      }
    }

    // Calculate averages
    for (const type in marketAverages) {
      marketAverages[type] = marketAverages[type] / typeCounts[type];
    }

    // Determine current demand level (based on recent bookings)
    const recentBookings = await prisma.booking.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    });

    const demandLevel: "LOW" | "MEDIUM" | "HIGH" =
      recentBookings.length > 50
        ? "HIGH"
        : recentBookings.length > 20
        ? "MEDIUM"
        : "LOW";

    // Determine seasonality (simple month-based)
    const currentMonth = new Date().getMonth();
    const highSeasonMonths = [11, 0, 1, 2]; // Dec, Jan, Feb, Mar (dry season in Nigeria)
    const seasonality: "LOW" | "MEDIUM" | "HIGH" = highSeasonMonths.includes(
      currentMonth
    )
      ? "HIGH"
      : currentMonth >= 6 && currentMonth <= 9
      ? "LOW" // Rainy season
      : "MEDIUM";

    // Generate suggestions for each vessel
    const suggestions = await Promise.all(
      vessels.map(async (vessel) => {
        const specs = vessel.specs as any;

        // Calculate utilization for last 90 days
        const end = new Date();
        const start = new Date(end.getTime() - 90 * 24 * 60 * 60 * 1000);
        const utilization = await calculateVesselUtilization(
          vessel.id,
          start,
          end,
          vessel.bookings
        );

        // Get market average for this vessel type
        const avgRateForType = marketAverages[vessel.type] || 50000; // Default fallback

        // Generate pricing suggestion
        const suggestion = generatePricingSuggestion(vessel, {
          avgRateForType,
          demandLevel,
          seasonality,
          utilizationRate: utilization.utilizationRate,
        });

        return {
          vesselId: vessel.id,
          vesselName: specs.name || "Unknown",
          vesselType: vessel.type,
          currentRate: specs.pricing?.dailyRate || 0,
          ...suggestion,
          utilization: {
            rate: utilization.utilizationRate,
            bookedDays: utilization.bookedDays,
            totalDays: utilization.totalDays,
          },
        };
      })
    );

    return NextResponse.json({
      suggestions,
      marketContext: {
        demandLevel,
        seasonality,
        averageRatesByType: marketAverages,
      },
    });
  } catch (error: any) {
    console.error("Error generating pricing suggestions:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate pricing suggestions" },
      { status: 500 }
    );
  }
}

